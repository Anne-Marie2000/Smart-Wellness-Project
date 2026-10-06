package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;
import java.sql.*;

/*
 * Manages wellness resources (articles/guides). A resource with a NULL
 * company_id is a general one visible to everyone; otherwise it's scoped
 * to a single company.
 */
public class ResourceService {

    private final Database db;

    public ResourceService(Database db) {
        this.db = db;
    }

    public ResultSet listForCompany(Integer companyId) throws SQLException {
        String sql = "SELECT id, title, category, body, company_id, created_at FROM resources "
                + "WHERE company_id IS NULL OR company_id = ? ORDER BY created_at DESC";
        PreparedStatement ps = db.getConnection().prepareStatement(sql);
        ps.setObject(1, companyId);
        return ps.executeQuery();
    }

    public int create(String title, String category, String body, Integer companyId, int createdBy) throws SQLException {
        String sql = "INSERT INTO resources (title, category, body, company_id, created_by) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, title);
            ps.setString(2, category);
            ps.setString(3, body);
            ps.setObject(4, companyId);
            ps.setInt(5, createdBy);
            ps.executeUpdate();

            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            return keys.getInt(1);
        }
    }

    // COALESCE just means "keep the old value if a new one wasn't passed in"
    public void update(int id, String title, String category, String body) throws SQLException {
        String sql = "UPDATE resources SET "
                + "title = COALESCE(?, title), category = COALESCE(?, category), body = COALESCE(?, body) "
                + "WHERE id = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, title);
            ps.setString(2, category);
            ps.setString(3, body);
            ps.setInt(4, id);
            ps.executeUpdate();
        }
    }

    public void delete(int id) throws SQLException {
        try (PreparedStatement ps = db.getConnection().prepareStatement("DELETE FROM resources WHERE id = ?")) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }
}
