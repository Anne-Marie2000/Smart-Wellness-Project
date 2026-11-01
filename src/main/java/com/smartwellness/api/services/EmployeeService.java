package com.smartwellness.api.services;

import com.smartwellness.api.auth.PasswordUtil;
import com.smartwellness.api.database.Database;
import com.smartwellness.api.util.JsonUtil;
import org.json.JSONArray;

import java.sql.*;
import java.util.NoSuchElementException;
import java.util.Set;

/*
 * Lets a Company Administrator manage the employee accounts in their own
 * organization (story #13). Every query includes company_id so an admin
 * can never see or change another company's people. Admins can only
 * manage "employee" and "leader" accounts, never other admins.
 *
 * Every change is also written to employee_audit_log (task 10).
 */
public class EmployeeService {
    private static final Set<String> MANAGED_ROLES = Set.of("employee", "leader");
    private final Database db;

    public EmployeeService(Database db) {
        this.db = db;
    }

    // Task 6
    public JSONArray list(int companyId) throws SQLException {
        String sql = "SELECT id, email, full_name, role, is_active, created_at FROM users " +
                     "WHERE company_id = ? AND role IN ('employee','leader') ORDER BY full_name";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, companyId);
            try (ResultSet rs = ps.executeQuery()) {
                return JsonUtil.toArray(rs);
            }
        }
    }

    // Task 7
    public int create(int companyId, int actorId, String email, String fullName, String role, String tempPassword)
            throws SQLException {
        checkEmail(email);
        if (fullName == null || fullName.isEmpty()) {
            throw new IllegalArgumentException("full_name is required");
        }
        checkRole(role);
        if (tempPassword == null || tempPassword.length() < 8) {
            throw new IllegalArgumentException("The temporary password must be at least 8 characters");
        }
        Connection conn = db.getConnection();
        if (emailTaken(conn, email, 0)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        // insert + audit log go in together or not at all
        conn.setAutoCommit(false);
        try {
            int newId;
            String sql = "INSERT INTO users (email, password_hash, full_name, role, company_id) VALUES (?, ?, ?, ?, ?)";
            try (PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, email);
                ps.setString(2, PasswordUtil.hash(tempPassword)); // never store the real password
                ps.setString(3, fullName);
                ps.setString(4, role);
                ps.setInt(5, companyId);
                ps.executeUpdate();
                ResultSet keys = ps.getGeneratedKeys();
                keys.next();
                newId = keys.getInt(1);
            }
            audit(conn, companyId, actorId, newId, "CREATE", "Created " + role + " account for " + email);
            conn.commit();
            return newId;
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(true);
        }
    }

    // Task 8. Any of the three fields can be null = leave it as it was.
    public void update(int companyId, int actorId, int targetId, String fullName, String email, String role)
            throws SQLException {
        Connection conn = db.getConnection();
        String oldName, oldEmail, oldRole;
        String find = "SELECT full_name, email, role FROM users WHERE id = ? AND company_id = ? AND role IN ('employee','leader')";
        try (PreparedStatement ps = conn.prepareStatement(find)) {
            ps.setInt(1, targetId);
            ps.setInt(2, companyId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) {
                throw new NoSuchElementException("Employee not found");
            }
            oldName = rs.getString("full_name");
            oldEmail = rs.getString("email");
            oldRole = rs.getString("role");
        }

        String newName = (fullName == null || fullName.isEmpty()) ? oldName : fullName;
        String newEmail = (email == null || email.isEmpty()) ? oldEmail : email;
        String newRole = (role == null || role.isEmpty()) ? oldRole : role;
        checkEmail(newEmail);
        checkRole(newRole);
        if (!newEmail.equalsIgnoreCase(oldEmail) && emailTaken(conn, newEmail, targetId)) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        // build a short description of what actually changed for the audit log
        StringBuilder changes = new StringBuilder();
        if (!newName.equals(oldName)) changes.append("name: ").append(oldName).append(" -> ").append(newName).append("; ");
        if (!newEmail.equals(oldEmail)) changes.append("email: ").append(oldEmail).append(" -> ").append(newEmail).append("; ");
        if (!newRole.equals(oldRole)) changes.append("role: ").append(oldRole).append(" -> ").append(newRole).append("; ");
        if (changes.length() == 0) {
            return; // nothing changed, nothing to log
        }

        conn.setAutoCommit(false);
        try {
            try (PreparedStatement ps = conn.prepareStatement(
                    "UPDATE users SET full_name = ?, email = ?, role = ? WHERE id = ?")) {
                ps.setString(1, newName);
                ps.setString(2, newEmail);
                ps.setString(3, newRole);
                ps.setInt(4, targetId);
                ps.executeUpdate();
            }
            audit(conn, companyId, actorId, targetId, "UPDATE", changes.toString().trim());
            conn.commit();
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(true);
        }
    }

    // Task 9. We deactivate instead of deleting so history (event sign-ups,
    // survey answers, the audit log) stays intact. RequestAuth checks
    // is_active on every request, so a deactivated person is locked out
    // straight away even if their login token hasn't expired yet.
    public void deactivate(int companyId, int actorId, int targetId) throws SQLException {
        Connection conn = db.getConnection();
        String find = "SELECT email, is_active FROM users WHERE id = ? AND company_id = ? AND role IN ('employee','leader')";
        String email;
        try (PreparedStatement ps = conn.prepareStatement(find)) {
            ps.setInt(1, targetId);
            ps.setInt(2, companyId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) {
                throw new NoSuchElementException("Employee not found");
            }
            if (!rs.getBoolean("is_active")) {
                return; // already deactivated
            }
            email = rs.getString("email");
        }

        conn.setAutoCommit(false);
        try {
            try (PreparedStatement ps = conn.prepareStatement("UPDATE users SET is_active = 0 WHERE id = ?")) {
                ps.setInt(1, targetId);
                ps.executeUpdate();
            }
            audit(conn, companyId, actorId, targetId, "DEACTIVATE", "Deactivated account " + email);
            conn.commit();
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(true);
        }
    }

    // Task 10: the admin can read the log for their own company
    public JSONArray auditLog(int companyId) throws SQLException {
        String sql = "SELECT a.id, a.action, a.details, a.created_at, " +
                     "actor.full_name AS changed_by, target.full_name AS employee " +
                     "FROM employee_audit_log a " +
                     "JOIN users actor ON actor.id = a.actor_user_id " +
                     "JOIN users target ON target.id = a.target_user_id " +
                     "WHERE a.company_id = ? ORDER BY a.id DESC LIMIT 200";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, companyId);
            try (ResultSet rs = ps.executeQuery()) {
                return JsonUtil.toArray(rs);
            }
        }
    }

    // ---------- small helpers ----------

    private void audit(Connection conn, int companyId, int actorId, int targetId, String action, String details)
            throws SQLException {
        String sql = "INSERT INTO employee_audit_log (company_id, actor_user_id, target_user_id, action, details) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, companyId);
            ps.setInt(2, actorId);
            ps.setInt(3, targetId);
            ps.setString(4, action);
            ps.setString(5, details);
            ps.executeUpdate();
        }
    }

    private boolean emailTaken(Connection conn, String email, int exceptUserId) throws SQLException {
        try (PreparedStatement ps = conn.prepareStatement("SELECT id FROM users WHERE email = ? AND id <> ?")) {
            ps.setString(1, email);
            ps.setInt(2, exceptUserId);
            return ps.executeQuery().next();
        }
    }

    private void checkEmail(String email) {
        if (email == null || !email.contains("@") || email.length() > 255) {
            throw new IllegalArgumentException("A valid email is required");
        }
    }

    private void checkRole(String role) {
        if (!MANAGED_ROLES.contains(role)) {
            throw new IllegalArgumentException("role must be employee or leader");
        }
    }
}
