package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;
import com.smartwellness.api.util.JsonUtil;
import org.json.JSONArray;

import java.sql.*;

/*
 * System analytics for the Smart Wellness Admin (story #14).
 *
 * record() saves one row in usage_log each time someone uses the platform.
 * usageByCompany() adds those rows up for each company.
 * Only totals are returned - never a name or an email.
 */
public class UsageService {

    private final Database db;

    public UsageService(Database db) {
        this.db = db;
    }

    // Save one action, for example record(12, "login")
    public void record(int userId, String action) throws SQLException {
        String sql = "INSERT INTO usage_log (user_id, action) VALUES (?, ?)";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setString(2, action);
            ps.executeUpdate();
        }
    }

    // One row per company, for example:
    // {"company_id": 1, "company_name": "Acme", "total_users": 40,
    //  "active_users_30_days": 25, "logins_7_days": 61,
    //  "survey_respondents": 18, "event_signups": 33}
    public JSONArray usageByCompany() throws SQLException {
        String sql =
            "SELECT c.id AS company_id, c.company_name, " +

            // everyone with an account at this company
            " (SELECT COUNT(*) FROM users u WHERE u.company_id = c.id) AS total_users, " +

            // people who used the platform in the last 30 days
            " (SELECT COUNT(DISTINCT l.user_id) FROM usage_log l JOIN users u ON u.id = l.user_id " +
            "   WHERE u.company_id = c.id AND l.created_at >= NOW() - INTERVAL 30 DAY) AS active_users_30_days, " +

            // sign-ins in the last 7 days
            " (SELECT COUNT(*) FROM usage_log l JOIN users u ON u.id = l.user_id " +
            "   WHERE u.company_id = c.id AND l.action = 'login' " +
            "   AND l.created_at >= NOW() - INTERVAL 7 DAY) AS logins_7_days, " +

            // people who answered at least one survey
            " (SELECT COUNT(DISTINCT sc.user_id) FROM survey_completions sc JOIN surveys s ON s.id = sc.survey_id " +
            "   WHERE s.company_id = c.id) AS survey_respondents, " +

            // event sign-ups
            " (SELECT COUNT(*) FROM engagement e JOIN wellness_events we ON we.id = e.event_id " +
            "   WHERE we.company_id = c.id) AS event_signups " +

            "FROM companies c ORDER BY c.company_name";

        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            return JsonUtil.toArray(ps.executeQuery());
        }
    }
}
