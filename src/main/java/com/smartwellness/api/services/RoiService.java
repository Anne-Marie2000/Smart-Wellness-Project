package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;
import org.json.JSONObject;

import java.sql.*;
import java.time.LocalDate;
import java.util.Locale;

/*
 * Projected retention and productivity numbers for the ROI dashboard
 * (story #6) and the ROI report export.
 *
 * Everything here is AGGREGATED: we only count people, we never return
 * a name, email or id. If a company has fewer than MIN_GROUP_SIZE
 * employees we refuse to report, because with very small groups a
 * percentage can point at one person. (Lower MIN_GROUP_SIZE to 1 if you
 * want to demo with only a couple of test accounts.)
 *
 * IMPORTANT: the constants below are ASSUMPTIONS, not measured data.
 * They are placeholders until the client gives us real numbers, and the
 * report says so.
 */
public class RoiService {
    public static final int MIN_GROUP_SIZE = 5;

    public static final double BASELINE_TURNOVER = 0.15;        // share of employees who leave in a year
    public static final double TURNOVER_REDUCTION = 0.20;       // participants are 20% less likely to leave
    public static final double REPLACEMENT_COST = 20000.0;      // cost to replace one employee, CAD
    public static final double HOURS_GAINED_PER_PARTICIPANT = 10.0; // productive hours gained per year
    public static final double HOURLY_VALUE = 40.0;             // value of one working hour, CAD

    private final Database db;

    public RoiService(Database db) {
        this.db = db;
    }

    // Task 14
    public JSONObject retention(int companyId) throws SQLException {
        int[] c = counts(companyId);
        int employees = c[0], participants = c[1];

        // participants who would normally have left, reduced by the effect size
        double retained = participants * BASELINE_TURNOVER * TURNOVER_REDUCTION;

        return new JSONObject()
            .put("metric", "retention")
            .put("employees", employees)
            .put("participants", participants)
            .put("participation_rate_percent", ratePercent(participants, employees))
            .put("projected_employees_retained", round2(retained))
            .put("projected_savings_cad", round2(retained * REPLACEMENT_COST))
            .put("basis", "Projection from assumed rates, not measured results");
    }

    // Task 15
    public JSONObject productivity(int companyId) throws SQLException {
        int[] c = counts(companyId);
        int employees = c[0], participants = c[1];

        double hours = participants * HOURS_GAINED_PER_PARTICIPANT;

        return new JSONObject()
            .put("metric", "productivity")
            .put("employees", employees)
            .put("participants", participants)
            .put("participation_rate_percent", ratePercent(participants, employees))
            .put("projected_hours_gained", round2(hours))
            .put("projected_value_cad", round2(hours * HOURLY_VALUE))
            .put("basis", "Projection from assumed rates, not measured results");
    }

    // Task 16: the report as CSV text. Also saves a snapshot of the
    // numbers in roi_metrics so we have a record of what was exported.
    public String exportCsv(int companyId) throws SQLException {
        JSONObject r = retention(companyId);
        JSONObject p = productivity(companyId);
        saveSnapshot(companyId, r, "projected_employees_retained", "projected_savings_cad");
        saveSnapshot(companyId, p, "projected_hours_gained", "projected_value_cad");

        StringBuilder csv = new StringBuilder("metric,value\n");
        row(csv, "report_date", LocalDate.now().toString());
        row(csv, "employees_in_scope", String.valueOf(r.getInt("employees")));
        row(csv, "participants", String.valueOf(r.getInt("participants")));
        row(csv, "participation_rate_percent", String.valueOf(r.getDouble("participation_rate_percent")));
        row(csv, "projected_employees_retained", String.valueOf(r.getDouble("projected_employees_retained")));
        row(csv, "projected_retention_savings_cad", money(r.getDouble("projected_savings_cad")));
        row(csv, "projected_hours_gained", String.valueOf(p.getDouble("projected_hours_gained")));
        row(csv, "projected_productivity_value_cad", money(p.getDouble("projected_value_cad")));
        row(csv, "assumed_baseline_turnover_rate", String.valueOf(BASELINE_TURNOVER));
        row(csv, "assumed_turnover_reduction_for_participants", String.valueOf(TURNOVER_REDUCTION));
        row(csv, "assumed_replacement_cost_per_employee_cad", money(REPLACEMENT_COST));
        row(csv, "assumed_hours_gained_per_participant", String.valueOf(HOURS_GAINED_PER_PARTICIPANT));
        row(csv, "assumed_value_per_hour_cad", money(HOURLY_VALUE));
        row(csv, "note", "Projections use assumed rates, not measured results. Aggregated data only.");
        return csv.toString();
    }

    // ---------- helpers ----------

    // returns {employees, participants}
    private int[] counts(int companyId) throws SQLException {
        int employees;
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT COUNT(*) FROM users WHERE company_id = ? AND is_active = 1 AND role IN ('employee','leader')")) {
            ps.setInt(1, companyId);
            ResultSet rs = ps.executeQuery();
            rs.next();
            employees = rs.getInt(1);
        }
        if (employees < MIN_GROUP_SIZE) {
            throw new IllegalArgumentException(
                "Not enough employees to report anonymously (minimum " + MIN_GROUP_SIZE + ")");
        }

        // people who joined at least one event that is still on (cancelled ones don't count)
        int participants;
        String sql = "SELECT COUNT(DISTINCT e.user_id) FROM engagement e " +
                     "JOIN wellness_events we ON we.id = e.event_id " +
                     "JOIN users u ON u.id = e.user_id " +
                     "WHERE we.company_id = ? AND we.status = 'active' AND u.is_active = 1";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, companyId);
            ResultSet rs = ps.executeQuery();
            rs.next();
            participants = rs.getInt(1);
        }
        return new int[]{employees, participants};
    }

    private void saveSnapshot(int companyId, JSONObject result, String unitsKey, String dollarsKey) throws SQLException {
        String sql = "INSERT INTO roi_metrics (company_id, metric_type, employees, participants, participation_rate, " +
                     "projected_units, projected_dollars) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, companyId);
            ps.setString(2, result.getString("metric"));
            ps.setInt(3, result.getInt("employees"));
            ps.setInt(4, result.getInt("participants"));
            ps.setDouble(5, result.getDouble("participation_rate_percent"));
            ps.setDouble(6, result.getDouble(unitsKey));
            ps.setDouble(7, result.getDouble(dollarsKey));
            ps.executeUpdate();
        }
    }

    private double ratePercent(int participants, int employees) {
        return Math.round(participants * 1000.0 / employees) / 10.0;
    }

    private double round2(double x) {
        return Math.round(x * 100.0) / 100.0;
    }

    private String money(double x) {
        return String.format(Locale.US, "%.2f", x);
    }

    private void row(StringBuilder csv, String name, String value) {
        csv.append(name).append(',').append(value).append('\n');
    }
}
