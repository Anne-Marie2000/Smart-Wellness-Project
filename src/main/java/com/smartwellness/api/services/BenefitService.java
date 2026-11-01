package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;
import com.smartwellness.api.util.JsonUtil;
import org.json.JSONArray;

import java.sql.*;

/*
 * Benefits and accommodations that employees can look up (story #8).
 * Every query is filtered by company_id so an employee only ever sees
 * the benefits that belong to their own organization.
 */
public class BenefitService {
    private final Database db;

    public BenefitService(Database db) {
        this.db = db;
    }

    // Task 2: benefits for one company only
    public JSONArray listForCompany(int companyId) throws SQLException {
        String sql = "SELECT id, title, category, description, how_to_access FROM benefits " +
                     "WHERE company_id = ? ORDER BY category, title";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, companyId);
            try (ResultSet rs = ps.executeQuery()) {
                return JsonUtil.toArray(rs);
            }
        }
    }

    public int create(int companyId, String title, String category, String description, String howToAccess)
            throws SQLException {
        if (title == null || title.isEmpty() || category == null || category.isEmpty()
                || description == null || description.isEmpty()) {
            throw new IllegalArgumentException("title, category and description are required");
        }
        String sql = "INSERT INTO benefits (company_id, title, category, description, how_to_access) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, companyId);
            ps.setString(2, title);
            ps.setString(3, category);
            ps.setString(4, description);
            ps.setString(5, howToAccess);
            ps.executeUpdate();
            ResultSet keys = ps.getGeneratedKeys();
            keys.next();
            return keys.getInt(1);
        }
    }

    // Task 3: sample data for the demo. Only runs if the company has no
    // benefits yet, so running it twice doesn't create duplicates.
    // These are made-up examples, not a real company's plan.
    public int seedSamples(int companyId) throws SQLException {
        if (listForCompany(companyId).length() > 0) {
            return 0;
        }
        String[][] samples = {
            {"Flexible start and end times", "Work arrangements",
             "Employees can shift their hours to manage symptoms such as poor sleep or fatigue.",
             "Talk to your manager or HR. No medical note is needed."},
            {"Remote work days", "Work arrangements",
             "Up to two remote days per week for roles that can be done from home.",
             "Agree the days with your manager."},
            {"Employee and family assistance program", "Mental health",
             "Free, confidential counselling sessions for employees and their families.",
             "Call the EAP number in your benefits booklet."},
            {"Prescription drug coverage", "Health coverage",
             "Extended health plan covers prescriptions. Check your plan booklet for which treatments are included.",
             "Submit claims through the insurer's app."},
            {"Paramedical coverage", "Health coverage",
             "Yearly allowance for physiotherapy, massage therapy and similar services.",
             "Submit receipts through the insurer's app."},
            {"Paid personal health days", "Time off",
             "Paid days off for health appointments or recovery without using vacation days.",
             "Request through HR."},
            {"Workstation comfort adjustments", "Accommodations",
             "Desk fan, a seat away from heat sources, or a cooler work area on request.",
             "Ask your manager or facilities."},
            {"Quiet rest room", "Accommodations",
             "A private room employees can use for short breaks.",
             "Book the room at reception."},
            {"Midlife health education sessions", "Education",
             "Lunch-and-learn sessions on menopause and midlife health open to all staff.",
             "Sign up on the events page."},
            {"Manager awareness training", "Education",
             "Short training that helps managers support employees going through menopause.",
             "HR schedules this for new and existing managers."},
        };
        for (String[] s : samples) {
            create(companyId, s[0], s[1], s[2], s[3]);
        }
        return samples.length;
    }
}
