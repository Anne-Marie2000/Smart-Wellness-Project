package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;
import com.smartwellness.api.util.JsonUtil;
import org.json.JSONArray;

import java.sql.*;
import java.util.NoSuchElementException;
import java.util.Set;

/*
 * Wellness resources (articles/guides). A resource with a NULL company_id
 * is a general one visible to everyone; otherwise it belongs to one company.
 * Each resource also has an audience: "manager", "employee", or "all"
 * (tasks 17 and 18). Old resources from Sprint 1 default to "all".
 */
public class ResourceService {
    private static final Set<String> AUDIENCES = Set.of("manager", "employee", "all");
    private final Database db;

    public ResourceService(Database db) {
        this.db = db;
    }

    // audience = null means "don't filter". If it's "manager" we return
    // manager resources plus the ones meant for everybody ("all").
    public JSONArray listForCompany(Integer companyId, String audience) throws SQLException {
        String sql = "SELECT id, title, category, body, audience, company_id, created_at FROM resources " +
                     "WHERE (company_id IS NULL OR company_id = ?)";
        if (audience != null) {
            checkAudience(audience);
            sql += " AND audience IN (?, 'all')";
        }
        sql += " ORDER BY created_at DESC, id DESC";

        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setObject(1, companyId);
            if (audience != null) {
                ps.setString(2, audience);
            }
            try (ResultSet rs = ps.executeQuery()) {
                return JsonUtil.toArray(rs);
            }
        }
    }

    public int create(String title, String category, String body, String audience, Integer companyId, int createdBy)
            throws SQLException {
        if (title == null || title.isEmpty() || body == null || body.isEmpty()) {
            throw new IllegalArgumentException("title and body are required");
        }
        String aud = (audience == null || audience.isEmpty()) ? "all" : audience;
        checkAudience(aud);

        String sql = "INSERT INTO resources (title, category, body, audience, company_id, created_by) VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, title);
            ps.setString(2, category);
            ps.setString(3, body);
            ps.setString(4, aud);
            ps.setObject(5, companyId);
            ps.setInt(6, createdBy);
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            return keys.getInt(1);
        }
    }

    // COALESCE just means "keep the old value if a new one wasn't passed in"
    public void update(int id, String title, String category, String body, String audience) throws SQLException {
        if (audience != null) {
            checkAudience(audience);
        }
        String sql = "UPDATE resources SET title = COALESCE(?, title), category = COALESCE(?, category), " +
                     "body = COALESCE(?, body), audience = COALESCE(?, audience) WHERE id = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, title);
            ps.setString(2, category);
            ps.setString(3, body);
            ps.setString(4, audience);
            ps.setInt(5, id);
            if (ps.executeUpdate() == 0) {
                throw new NoSuchElementException("Resource not found");
            }
        }
    }

    public void delete(int id) throws SQLException {
        try (PreparedStatement ps = db.getConnection().prepareStatement("DELETE FROM resources WHERE id = ?")) {
            ps.setInt(1, id);
            if (ps.executeUpdate() == 0) {
                throw new NoSuchElementException("Resource not found");
            }
        }
    }

    private void checkAudience(String audience) {
        if (!AUDIENCES.contains(audience)) {
            throw new IllegalArgumentException("audience must be manager, employee or all");
        }
    }
}
