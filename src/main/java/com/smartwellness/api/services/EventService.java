package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;
import com.smartwellness.api.util.JsonUtil;
import org.json.JSONArray;

import java.sql.*;
import java.util.NoSuchElementException;

/*
 * Wellness events (story #17): create, update, cancel, list and join.
 * The "engagement" table is our event registrations table - one row
 * for each user who joined an event.
 * Events are cancelled (status = 'cancelled') instead of deleted so
 * the people who had signed up are still on record.
 */
public class EventService {
    private final Database db;

    public EventService(Database db) {
        this.db = db;
    }

    // Task 11
    public int create(int companyId, int actorId, String title, String description, Timestamp eventDate)
            throws SQLException {
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("title is required");
        }
        if (eventDate == null) {
            throw new IllegalArgumentException("event_date is required");
        }
        String sql = "INSERT INTO wellness_events (title, description, event_date, company_id, created_by) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, title);
            ps.setString(2, description);
            ps.setTimestamp(3, eventDate);
            ps.setInt(4, companyId);
            ps.setInt(5, actorId);
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            return keys.getInt(1);
        }
    }

    // Null fields are left as they were.
    public void update(int eventId, String title, String description, Timestamp eventDate) throws SQLException {
        String status = statusOf(eventId);
        if (!status.equals("active")) {
            throw new IllegalArgumentException("A cancelled event cannot be edited");
        }
        String sql = "UPDATE wellness_events SET title = COALESCE(?, title), " +
                     "description = COALESCE(?, description), event_date = COALESCE(?, event_date) WHERE id = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setString(1, (title == null || title.isEmpty()) ? null : title);
            ps.setString(2, description);
            ps.setTimestamp(3, eventDate);
            ps.setInt(4, eventId);
            ps.executeUpdate();
        }
    }

    public void cancel(int eventId) throws SQLException {
        statusOf(eventId); // throws "not found" if there is no such event
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "UPDATE wellness_events SET status = 'cancelled' WHERE id = ?")) {
            ps.setInt(1, eventId);
            ps.executeUpdate();
        }
    }

    // Task 12: events for one company, with how many people joined and
    // whether the person asking has already joined.
    public JSONArray list(int companyId, int userId) throws SQLException {
        String sql = "SELECT we.id, we.title, we.description, we.event_date, we.status, " +
                     "(SELECT COUNT(*) FROM engagement e WHERE e.event_id = we.id) AS registrations, " +
                     "EXISTS(SELECT 1 FROM engagement e WHERE e.event_id = we.id AND e.user_id = ?) AS joined " +
                     "FROM wellness_events we WHERE we.company_id = ? ORDER BY we.event_date ASC";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setInt(2, companyId);
            try (ResultSet rs = ps.executeQuery()) {
                return JsonUtil.toArray(rs);
            }
        }
    }

    // Task 13. Returns false if the user had already joined.
    public boolean join(int companyId, int userId, int eventId) throws SQLException {
        Connection conn = db.getConnection();
        String status;
        Timestamp date;
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT company_id, status, event_date FROM wellness_events WHERE id = ?")) {
            ps.setInt(1, eventId);
            ResultSet rs = ps.executeQuery();
            // an event from another company is reported as "not found" so we don't leak that it exists
            if (!rs.next() || rs.getInt("company_id") != companyId) {
                throw new NoSuchElementException("Event not found");
            }
            status = rs.getString("status");
            date = rs.getTimestamp("event_date");
        }
        if (!status.equals("active")) {
            throw new IllegalArgumentException("This event has been cancelled");
        }
        if (date.before(new Timestamp(System.currentTimeMillis()))) {
            throw new IllegalArgumentException("This event has already taken place");
        }

        try (PreparedStatement ps = conn.prepareStatement("SELECT id FROM engagement WHERE user_id = ? AND event_id = ?")) {
            ps.setInt(1, userId);
            ps.setInt(2, eventId);
            if (ps.executeQuery().next()) {
                return false;
            }
        }
        try (PreparedStatement ps = conn.prepareStatement("INSERT INTO engagement (user_id, event_id) VALUES (?, ?)")) {
            ps.setInt(1, userId);
            ps.setInt(2, eventId);
            ps.executeUpdate();
            return true;
        } catch (SQLIntegrityConstraintViolationException e) {
            return false; // two clicks at the same time
        }
    }

    private String statusOf(int eventId) throws SQLException {
        try (PreparedStatement ps = db.getConnection().prepareStatement("SELECT status FROM wellness_events WHERE id = ?")) {
            ps.setInt(1, eventId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) {
                throw new NoSuchElementException("Event not found");
            }
            return rs.getString("status");
        }
    }
}
