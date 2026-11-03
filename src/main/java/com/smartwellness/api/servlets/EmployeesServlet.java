package com.smartwellness.api.services;

import com.smartwellness.api.auth.PasswordUtil;
import com.smartwellness.api.database.Database;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.json.JSONObject;

import java.security.Key;
import java.sql.*;
import java.util.Date;

// Handles signup and login. Signup requires a valid Smart ID code so we
// know which company and role the new user belongs to - the user never
// has to type that in themselves.
public class AuthService {

    private final Database db;
    private final SmartIdService smartIdService;

    // This regenerates a new signing key every time the app
    // restarts, which logs everyone out. For a real deployment this
    // should come from an environment variable instead.
    private static final Key JWT_KEY = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS256);
    private static final long EXPIRY_MS = 7L * 24 * 60 * 60 * 1000; // 7 days

    public AuthService(Database db, SmartIdService smartIdService) {
        this.db = db;
        this.smartIdService = smartIdService;
    }

    public String register(String email, String password, String fullName, String smartIdCode)
            throws SQLException, AuthException {
        Connection conn = db.getConnection();

        // make sure this email isn't already taken
        try (PreparedStatement check = conn.prepareStatement("SELECT id FROM users WHERE email = ?")) {
            check.setString(1, email);
            if (check.executeQuery().next()) {
                throw new AuthException("An account with this email already exists");
            }
        }

        // look up and validate the Smart ID code
        ResultSet rs = smartIdService.findByCode(smartIdCode);
        if (!rs.next()) {
            throw new AuthException("Invalid Smart ID code");
        }
        if (rs.getBoolean("is_redeemed")) {
            throw new AuthException("This Smart ID code has already been used");
        }

        Timestamp expiresAt = rs.getTimestamp("expires_at");
        if (expiresAt != null && expiresAt.before(new Timestamp(System.currentTimeMillis()))) {
            throw new AuthException("This Smart ID code has expired");
        }

        int smartIdId = rs.getInt("id");
        int companyId = rs.getInt("company_id");
        String role = rs.getString("intended_role");

        String passwordHash = PasswordUtil.hash(password);

        String insertSql = "INSERT INTO users (email, password_hash, full_name, role, company_id) VALUES (?, ?, ?, ?, ?)";
        int userId;
        try (PreparedStatement ps = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, email);
            ps.setString(2, passwordHash);
            ps.setString(3, fullName);
            ps.setString(4, role);
            ps.setInt(5, companyId);
            ps.executeUpdate();

            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            userId = keys.getInt(1);
        }

        // code is single-use, so lock it after we use it
        // (it also becomes this person's Smart ID for signing in)
        smartIdService.markRedeemed(smartIdId, userId);

        return issueToken(userId, role, companyId);
    }

    // Create Company Account page: makes the company, then its first
    // Company Administrator account, and signs them in.
    public JSONObject registerCompany(String companyName, String industry, String companySize, int employeeCount,
            String fullName, String jobTitle, String email, String phone, String password)
            throws SQLException, AuthException {
        Connection conn = db.getConnection();

        // make sure this email isn't already taken
        try (PreparedStatement check = conn.prepareStatement("SELECT id FROM users WHERE email = ?")) {
            check.setString(1, email);
            if (check.executeQuery().next()) {
                throw new AuthException("An account with this email already exists");
            }
        }

        // 1. save the company
        String companySql = "INSERT INTO companies (company_name, industry, company_size, employee_count, "
                + "contact_name, job_title, work_email, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        int companyId;
        try (PreparedStatement ps = conn.prepareStatement(companySql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, companyName);
            ps.setString(2, industry);
            ps.setString(3, companySize);
            ps.setInt(4, employeeCount);
            ps.setString(5, fullName);
            ps.setString(6, jobTitle);
            ps.setString(7, email);
            ps.setString(8, phone);
            ps.executeUpdate();

            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            companyId = keys.getInt(1);
        }

        // 2. save the person signing up as that company's administrator
        String userSql = "INSERT INTO users (email, password_hash, full_name, role, company_id) VALUES (?, ?, ?, 'company_admin', ?)";
        int userId;
        try (PreparedStatement ps = conn.prepareStatement(userSql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, email);
            ps.setString(2, PasswordUtil.hash(password));
            ps.setString(3, fullName);
            ps.setInt(4, companyId);
            ps.executeUpdate();

            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            userId = keys.getInt(1);
        }

        // 3. give the administrator their own Smart ID, which they need to sign in
        String smartId = SmartIdService.generateCode();
        String smartIdSql = "INSERT INTO smart_ids (code, company_id, intended_role, is_redeemed, redeemed_by_user_id) "
                + "VALUES (?, ?, 'company_admin', 1, ?)";
        try (PreparedStatement ps = conn.prepareStatement(smartIdSql)) {
            ps.setString(1, smartId);
            ps.setInt(2, companyId);
            ps.setInt(3, userId);
            ps.executeUpdate();
        }

        // send back the login token AND the new Smart ID (the page shows it to them)
        return new JSONObject()
                .put("token", issueToken(userId, "company_admin", companyId))
                .put("smart_id", smartId);
    }

    // The signed-in person's name and company, for the dashboard greetings
    public JSONObject getProfile(int userId) throws SQLException {
        String sql = "SELECT users.full_name, users.email, users.role, companies.company_name "
                + "FROM users LEFT JOIN companies ON companies.id = users.company_id WHERE users.id = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            rs.next();
            return new JSONObject()
                    .put("full_name", rs.getString("full_name"))
                    .put("email", rs.getString("email"))
                    .put("role", rs.getString("role"))
                    .put("company_name", rs.getString("company_name") == null ? "" : rs.getString("company_name"));
        }
    }

    // Sign In page: the email, Smart ID and password must all match.
    public String login(String email, String smartId, String password) throws SQLException, AuthException {
        String sql = "SELECT id, password_hash, role, company_id, is_active FROM users WHERE email = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();

            if (!rs.next()) {
                throw new AuthException("Invalid email, Smart ID or password");
            }

            String hash = rs.getString("password_hash");
            if (!PasswordUtil.verify(password, hash)) {
                throw new AuthException("Invalid email, Smart ID or password");
            }

            // checked after the password so a stranger can't use login to find out which accounts are deactivated
            if (!rs.getBoolean("is_active")) {
                throw new AuthException("This account has been deactivated");
            }

            int userId = rs.getInt("id");
            String role = rs.getString("role");
            int companyId = rs.getInt("company_id");

            // the Smart ID must be the one given to this person.
            // (Smart Wellness staff don't belong to a company, so they don't have one.)
            if (!role.equals("smart_wellness_admin") && !hasSmartId(userId, smartId)) {
                throw new AuthException("Invalid email, Smart ID or password");
            }

            return issueToken(userId, role, companyId);
        }
    }

    // Forgot Smart ID page: if the email and password are right,
    // send back that person's Smart ID.
    public String findSmartId(String email, String password) throws SQLException, AuthException {
        String sql = "SELECT id, password_hash, role, is_active FROM users WHERE email = ?";
        int userId;
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, email);
            ResultSet rs = ps.executeQuery();

            // same checks as signing in, so only the real person can see it
            if (!rs.next() || !PasswordUtil.verify(password, rs.getString("password_hash"))) {
                throw new AuthException("Invalid email or password");
            }
            if (!rs.getBoolean("is_active")) {
                throw new AuthException("This account has been deactivated");
            }
            if (rs.getString("role").equals("smart_wellness_admin")) {
                throw new AuthException("Smart Wellness staff don't need a Smart ID. Type anything in the Smart ID box.");
            }
            userId = rs.getInt("id");
        }

        // look up the Smart ID that belongs to this person
        String codeSql = "SELECT code FROM smart_ids WHERE redeemed_by_user_id = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(codeSql)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) {
                throw new AuthException("No Smart ID was found for this account. Please ask your company administrator.");
            }
            return rs.getString("code");
        }
    }

    // true if this Smart ID code belongs to this user
    private boolean hasSmartId(int userId, String smartId) throws SQLException {
        String sql = "SELECT id FROM smart_ids WHERE code = ? AND redeemed_by_user_id = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, smartId);
            ps.setInt(2, userId);
            ResultSet rs = ps.executeQuery();
            return rs.next(); // true if a row was found
        }
    }

    // Builds the login token that gets sent back to the frontend. The
    // frontend attaches this on every request after logging in so the
    // backend knows who's asking.
    private String issueToken(int userId, String role, int companyId) {
        return Jwts.builder()
                .claim("userId", userId)
                .claim("role", role)
                .claim("companyId", companyId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRY_MS))
                .signWith(JWT_KEY)
                .compact();
    }

    public io.jsonwebtoken.Claims verifyToken(String token) {
        return Jwts.parserBuilder().setSigningKey(JWT_KEY).build()
                .parseClaimsJws(token).getBody();
    }

    // Custom exception so the servlet can tell "bad input" errors apart
    // from actual server crashes and return the right status code.
    public static class AuthException extends Exception {

        public AuthException(String message) {
            super(message);
        }
    }
}
