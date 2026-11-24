package com.smartwellness.api.services;

import com.smartwellness.api.auth.PasswordUtil;
import com.smartwellness.api.database.Database;

import java.security.SecureRandom;
import java.sql.*;
import java.util.UUID;

/*
 * Two-factor sign-in (story #1).
 *
 * How it works:
 * 1. The person signs in with their email, Smart ID and password as usual.
 * 2. If two-factor is on, we make a 6-digit code, save it (hashed) and send it to them.
 * 3. They type the code. If it is right, not used and not expired, they are signed in.
 *
 * Who needs it:
 * - Everyone in a company where the Company Admin turned two-factor on.
 * - Smart Wellness Admins always, because they can see every company.
 *
 * Sending the code: for now the code is printed in the Eclipse console
 * (sendCode below). To send real emails later, change only sendCode().
 */
public class TwoFactorService {

    public static final int CODE_MINUTES = 10;   // how long a code works
    public static final int MAX_ATTEMPTS = 5;    // wrong tries allowed

    // Master switch: false = nobody is asked for a 6-digit code.
    // Change to true to turn two-factor sign-in back on.
    public static final boolean TWO_FACTOR_ON = false;

    private final Database db;
    private final SecureRandom random = new SecureRandom();

    public TwoFactorService(Database db) {
        this.db = db;
    }

    // Does this person need a code to sign in?
    public boolean isRequired(int userId) throws SQLException {
        if (!TWO_FACTOR_ON) {
            return false; // two-factor is switched off for everyone
        }
        String sql = "SELECT users.role, companies.two_factor_enabled FROM users "
                + "LEFT JOIN companies ON companies.id = users.company_id WHERE users.id = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) {
                return false;
            }
            if (rs.getString("role").equals("smart_wellness_admin")) {
                return true;
            }
            return rs.getBoolean("two_factor_enabled");
        }
    }

    // Makes a new code, saves it, sends it, and returns the challenge id
    // that the browser sends back together with the code.
    public String startChallenge(int userId) throws SQLException {
        String code = String.format("%06d", random.nextInt(1000000)); // e.g. "048213"
        String challengeId = UUID.randomUUID().toString();
        Timestamp expires = new Timestamp(System.currentTimeMillis() + CODE_MINUTES * 60 * 1000L);

        String sql = "INSERT INTO two_factor_codes (challenge_id, user_id, code_hash, expires_at) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, challengeId);
            ps.setInt(2, userId);
            ps.setString(3, PasswordUtil.hash(code)); // never store the real code
            ps.setTimestamp(4, expires);
            ps.executeUpdate();
        }

        sendCode(userId, code);
        return challengeId;
    }

    // Checks the code the person typed. Returns their user id if it is right.
    // Throws an error with a friendly message if it is wrong.
    public int checkCode(String challengeId, String code) throws SQLException {
        String sql = "SELECT id, user_id, code_hash, expires_at, attempts, is_used FROM two_factor_codes WHERE challenge_id = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, challengeId);
            ResultSet rs = ps.executeQuery();

            if (!rs.next() || rs.getBoolean("is_used")) {
                throw new IllegalArgumentException("This code is no longer valid. Please sign in again.");
            }
            if (rs.getTimestamp("expires_at").before(new Timestamp(System.currentTimeMillis()))) {
                throw new IllegalArgumentException("This code has expired. Please sign in again.");
            }
            if (rs.getInt("attempts") >= MAX_ATTEMPTS) {
                throw new IllegalArgumentException("Too many wrong codes. Please sign in again.");
            }

            int rowId = rs.getInt("id");
            if (code == null || !PasswordUtil.verify(code.trim(), rs.getString("code_hash"))) {
                addWrongAttempt(rowId);
                throw new IllegalArgumentException("That code is not right. Please try again.");
            }

            markUsed(rowId); // a code only works once
            return rs.getInt("user_id");
        }
    }

    // Is two-factor turned on for this company?
    public boolean isEnabledForCompany(int companyId) throws SQLException {
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT two_factor_enabled FROM companies WHERE id = ?")) {
            ps.setInt(1, companyId);
            ResultSet rs = ps.executeQuery();
            return rs.next() && rs.getBoolean("two_factor_enabled");
        }
    }

    // The Company Admin turns two-factor on or off for everyone in their company
    public void setEnabledForCompany(int companyId, boolean enabled) throws SQLException {
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "UPDATE companies SET two_factor_enabled = ? WHERE id = ?")) {
            ps.setBoolean(1, enabled);
            ps.setInt(2, companyId);
            ps.executeUpdate();
        }
    }

    // For now the code is printed in the Eclipse console so we can test and demo it.
    // To email it instead, look up the user's email here and send it with an email library.
    private void sendCode(int userId, String code) throws SQLException {
        String email = "";
        try (PreparedStatement ps = db.getConnection().prepareStatement("SELECT email FROM users WHERE id = ?")) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                email = rs.getString("email");
            }
        }
        System.out.println("Two-factor code for " + email + ": " + code
                + " (works for " + CODE_MINUTES + " minutes)");
    }

    private void addWrongAttempt(int rowId) throws SQLException {
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "UPDATE two_factor_codes SET attempts = attempts + 1 WHERE id = ?")) {
            ps.setInt(1, rowId);
            ps.executeUpdate();
        }
    }

    private void markUsed(int rowId) throws SQLException {
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "UPDATE two_factor_codes SET is_used = 1 WHERE id = ?")) {
            ps.setInt(1, rowId);
            ps.executeUpdate();
        }
    }
}
