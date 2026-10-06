package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;
import java.sql.*;

/*
 * Covers wellness events and who joined them. Also builds the two
 * engagement views our stories asked for: the leader's per-event
 * participation counts, and the company-wide anonymous engagement %.
 */
public class EngagementService {

    private final Database db;

    public EngagementService(Database db) {
        this.db = db;
    }

    public int createEvent(String title, String description, Timestamp eventDate, int companyId, int createdBy) throws SQLException {
        String sql = "INSERT INTO wellness_events (title, description, event_date, company_id, created_by) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, title);
            ps.setString(2, description);
            ps.setTimestamp(3, eventDate);
            ps.setInt(4, companyId);
            ps.setInt(5, createdBy);
            ps.executeUpdate();

            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            return keys.getInt(1);
        }
    }

    public ResultSet listEventsForCompany(int companyId) throws SQLException {
        String sql = "SELECT id, title, description, event_date, created_at FROM wellness_events "
                + "WHERE company_id = ? ORDER BY event_date ASC";
        PreparedStatement ps = db.getConnection().prepareStatement(sql);
        ps.setInt(1, companyId);
        return ps.executeQuery();
    }

    // Returns false instead of throwing if they already joined, since
    // that's an expected case, not really an error.
    public boolean joinEvent(int userId, int eventId) throws SQLException {
        String sql = "INSERT INTO engagement (user_id, event_id) VALUES (?, ?)";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, eventId);
            ps.executeUpdate();
            return true;
        } catch (SQLIntegrityConstraintViolationException e) {
            return false;
        }
    }

    // For the Leader role - just counts, no personal info, per event
    public ResultSet getTeamEngagement(int companyId) throws SQLException {
        String sql = "SELECT we.id AS event_id, we.title, we.event_date, COUNT(e.id) AS participant_count "
                + "FROM wellness_events we LEFT JOIN engagement e ON e.event_id = we.id "
                + "WHERE we.company_id = ? GROUP BY we.id ORDER BY we.event_date DESC";
        PreparedStatement ps = db.getConnection().prepareStatement(sql);
        ps.setInt(1, companyId);
        return ps.executeQuery();
    }

    // For the Company Admin role - one overall participation rate for
    // the whole org, so no individual employee shows up in the numbers.
    // Returns [totalEmployees, totalParticipants, participationRatePercent]
    public double[] getEngagementReport(int companyId) throws SQLException {
        int totalEmployees;
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT COUNT(*) AS count FROM users WHERE company_id = ? AND role IN ('employee','leader')")) {
            ps.setInt(1, companyId);
            ResultSet rs = ps.executeQuery();
            rs.next();
            totalEmployees = rs.getInt("count");
        }

        int totalParticipants;
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT COUNT(DISTINCT e.user_id) AS count FROM engagement e "
                + "JOIN wellness_events we ON we.id = e.event_id WHERE we.company_id = ?")) {
            ps.setInt(1, companyId);
            ResultSet rs = ps.executeQuery();
            rs.next();
            totalParticipants = rs.getInt("count");
        }

        double rate = totalEmployees > 0
                ? Math.round((totalParticipants * 1000.0 / totalEmployees)) / 10.0
                : 0;

        return new double[]{totalEmployees, totalParticipants, rate};
    }
}
