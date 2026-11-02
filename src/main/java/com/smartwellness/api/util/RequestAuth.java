package com.smartwellness.api.util;

import com.smartwellness.api.AppContext;
import com.smartwellness.api.services.AuthService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/*
 * Works out who is making a request from the "Authorization: Bearer <token>"
 * header. After the token is checked we look the user up in the database
 * again, so a deactivated account (or a changed role) takes effect
 * immediately instead of waiting for the token to expire.
 */
public class RequestAuth {
    public final int userId;
    public final String role;
    public final int companyId; // 0 for platform admins (they have no company)

    private RequestAuth(int userId, String role, int companyId) {
        this.userId = userId;
        this.role = role;
        this.companyId = companyId;
    }

    public static RequestAuth from(HttpServletRequest req) throws AuthService.AuthException, SQLException {
        String header = req.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new AuthService.AuthException("Missing or malformed Authorization header");
        }

        int userId;
        try {
            Claims claims = AppContext.auth().verifyToken(header.substring(7));
            userId = claims.get("userId", Integer.class);
        } catch (Exception e) {
            throw new AuthService.AuthException("Invalid or expired token");
        }

        String sql = "SELECT role, company_id, is_active FROM users WHERE id = ?";
        try (PreparedStatement ps = AppContext.db().getConnection().prepareStatement(sql)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next() || !rs.getBoolean("is_active")) {
                throw new AuthService.AuthException("This account is deactivated or no longer exists");
            }
            return new RequestAuth(userId, rs.getString("role"), rs.getInt("company_id"));
        }
    }
}
