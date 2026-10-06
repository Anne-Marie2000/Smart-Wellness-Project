package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;
import java.security.SecureRandom;
import java.sql.*;
import java.time.LocalDateTime;

/*
 * Handles creating and looking up Smart ID codes. A company admin
 * generates a code for a specific role (employee/leader/admin), and
 * whoever signs up with that code gets linked to the right company
 * automatically - see AuthService.register().
 */
public class SmartIdService {

    private final Database db;
    private static final SecureRandom RANDOM = new SecureRandom();

    public SmartIdService(Database db) {
        this.db = db;
    }

    // Builds a short random code like "SW-9F3K7B2A"
    private String generateCode() {
        byte[] bytes = new byte[4];
        RANDOM.nextBytes(bytes);
        StringBuilder hex = new StringBuilder("SW-");
        for (byte b : bytes) {
            hex.append(String.format("%02X", b));
        }
        return hex.toString();
    }

    public String generateSmartId(int companyId, String intendedRole, Integer expiresInDays) throws SQLException {
        String code = generateCode();
        Timestamp expiresAt = expiresInDays != null
                ? Timestamp.valueOf(LocalDateTime.now().plusDays(expiresInDays))
                : null;

        String sql = "INSERT INTO smart_ids (code, company_id, intended_role, expires_at) VALUES (?, ?, ?, ?)";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, code);
            ps.setInt(2, companyId);
            ps.setString(3, intendedRole);
            if (expiresAt != null) {
                ps.setTimestamp(4, expiresAt);
            } else {
                ps.setNull(4, Types.TIMESTAMP);
            }
            ps.executeUpdate();
        }
        return code;
    }

    // Returns the open ResultSet so AuthService can read the row it needs.
    // Caller is responsible for closing it.
    public ResultSet findByCode(String code) throws SQLException {
        String sql = "SELECT * FROM smart_ids WHERE code = ?";
        PreparedStatement ps = db.getConnection().prepareStatement(sql);
        ps.setString(1, code);
        return ps.executeQuery();
    }

    public void markRedeemed(int smartIdId, int userId) throws SQLException {
        String sql = "UPDATE smart_ids SET is_redeemed = 1, redeemed_by_user_id = ? WHERE id = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, smartIdId);
            ps.executeUpdate();
        }
    }

    // Only lets you delete a code that hasn't been used yet, on purpose -
    // once it's redeemed it's tied to a real account so we leave it alone.
    public void revoke(String code, int companyId) throws SQLException {
        String sql = "DELETE FROM smart_ids WHERE code = ? AND company_id = ? AND is_redeemed = 0";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, code);
            ps.setInt(2, companyId);
            ps.executeUpdate();
        }
    }
}
