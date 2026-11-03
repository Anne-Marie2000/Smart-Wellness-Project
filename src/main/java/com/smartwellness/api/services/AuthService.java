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

    // NOTE: this regenerates a new signing key every time the app
    // restarts, which logs everyone out. For a real deployment this should come from an environment variable instead.
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

        String insertSql = "INSERT INTO users (email,
