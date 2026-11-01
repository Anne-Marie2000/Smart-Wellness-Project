package com.smartwellness.api.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/*
 * Opens one connection to our MySQL database and makes sure all the
 * tables we need exist. If a table is already there, CREATE TABLE IF
 * NOT EXISTS just skips it, so it's safe to run this every time the
 * app starts.
 */
public class Database {
    private Connection connection;

    // host e.g. "localhost", port e.g. 3306
    // dbName must already exist (CREATE DATABASE wellness;)
    public Database(String host, int port, String dbName, String user, String password) throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC driver not found on classpath.", e);
        }

        String url = "jdbc:mysql://" + host + ":" + port + "/" + dbName
            + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

        connection = DriverManager.getConnection(url, user, password);

        createTablesIfNeeded();
        createSprint2Tables();
    }

    public Connection getConnection() {
        return connection;
    }

    // ---------------------------------------------------------------
    // Sprint 1 tables (unchanged)
    // ---------------------------------------------------------------
    private void createTablesIfNeeded() throws SQLException {
        Statement statement = connection.createStatement();

        statement.execute(
            "CREATE TABLE IF NOT EXISTS companies (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " company_name VARCHAR(255) NOT NULL," +
            " industry VARCHAR(255) NOT NULL," +
            " company_size VARCHAR(255) NOT NULL," +
            " employee_count INT NOT NULL," +
            " contact_name VARCHAR(255) NOT NULL," +
            " job_title VARCHAR(255) NOT NULL," +
            " work_email VARCHAR(255) NOT NULL," +
            " phone_number VARCHAR(255) NOT NULL," +
            " alternate_email VARCHAR(255)," +
            " two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0," +
            " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP" +
            ")"
        );

        statement.execute(
            "CREATE TABLE IF NOT EXISTS smart_ids (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " code VARCHAR(32) UNIQUE NOT NULL," +
            " company_id INT NOT NULL," +
            " intended_role VARCHAR(50) NOT NULL," +
            " is_redeemed TINYINT(1) NOT NULL DEFAULT 0," +
            " redeemed_by_user_id INT," +
            " expires_at TIMESTAMP NULL," +
            " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
            " FOREIGN KEY (company_id) REFERENCES companies(id)" +
            ")"
        );

        statement.execute(
            "CREATE TABLE IF NOT EXISTS users (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " email VARCHAR(255) UNIQUE NOT NULL," +
            " password_hash VARCHAR(255) NOT NULL," +
            " full_name VARCHAR(255) NOT NULL," +
            " role VARCHAR(50) NOT NULL," +
            " company_id INT," +
            " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
            " FOREIGN KEY (company_id) REFERENCES companies(id)" +
            ")"
        );

        statement.execute(
            "CREATE TABLE IF NOT EXISTS resources (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " title VARCHAR(255) NOT NULL," +
            " category VARCHAR(100)," +
            " body TEXT NOT NULL," +
            " company_id INT," +
            " created_by INT NOT NULL," +
            " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
            " FOREIGN KEY (created_by) REFERENCES users(id)," +
            " FOREIGN KEY (company_id) REFERENCES companies(id)" +
            ")"
        );

        statement.execute(
            "CREATE TABLE IF NOT EXISTS wellness_events (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " title VARCHAR(255) NOT NULL," +
            " description TEXT," +
            " company_id INT NOT NULL," +
            " event_date DATETIME NOT NULL," +
            " created_by INT NOT NULL," +
            " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
            " FOREIGN KEY (company_id) REFERENCES companies(id)," +
            " FOREIGN KEY (created_by) REFERENCES users(id)" +
            ")"
        );

        // engagement = event registrations (one row per user per event)
        statement.execute(
            "CREATE TABLE IF NOT EXISTS engagement (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " user_id INT NOT NULL," +
            " event_id INT NOT NULL," +
            " joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
            " UNIQUE (user_id, event_id)," +
            " FOREIGN KEY (user_id) REFERENCES users(id)," +
            " FOREIGN KEY (event_id) REFERENCES wellness_events(id)" +
            ")"
        );

        statement.execute(
            "CREATE TABLE IF NOT EXISTS surveys (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " title VARCHAR(255) NOT NULL," +
            " company_id INT NOT NULL," +
            " created_by INT NOT NULL," +
            " is_anonymous TINYINT(1) NOT NULL DEFAULT 1," +
            " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
            " FOREIGN KEY (company_id) REFERENCES companies(id)," +
            " FOREIGN KEY (created_by) REFERENCES users(id)" +
            ")"
        );

        statement.execute(
            "CREATE TABLE IF NOT EXISTS survey_questions (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " survey_id INT NOT NULL," +
            " question_text TEXT NOT NULL," +
            " question_type VARCHAR(50) NOT NULL," +
            " options TEXT," +
            " FOREIGN KEY (survey_id) REFERENCES surveys(id)" +
            ")"
        );

        statement.execute(
            "CREATE TABLE IF NOT EXISTS survey_responses (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " survey_id INT NOT NULL," +
            " question_id INT NOT NULL," +
            " user_id INT NOT NULL," +
            " answer TEXT NOT NULL," +
            " submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
            " UNIQUE (question_id, user_id)," +
            " FOREIGN KEY (survey_id) REFERENCES surveys(id)," +
            " FOREIGN KEY (question_id) REFERENCES survey_questions(id)," +
            " FOREIGN KEY (user_id) REFERENCES users(id)" +
            ")"
        );

        statement.close();
    }

    // ---------------------------------------------------------------
    // Sprint 2 additions: new tables + a few new columns on old tables
    // ---------------------------------------------------------------
    private void createSprint2Tables() throws SQLException {
        Statement statement = connection.createStatement();

        // benefits/accommodations an employee can look up (task 1)
        statement.execute(
            "CREATE TABLE IF NOT EXISTS benefits (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " company_id INT NOT NULL," +
            " title VARCHAR(255) NOT NULL," +
            " category VARCHAR(100) NOT NULL," +
            " description TEXT NOT NULL," +
            " how_to_access TEXT," +
            " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
            " FOREIGN KEY (company_id) REFERENCES companies(id)" +
            ")"
        );

        // ROI snapshots (task 5). Only totals are stored here, never
        // anything about a single employee.
        statement.execute(
            "CREATE TABLE IF NOT EXISTS roi_metrics (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " company_id INT NOT NULL," +
            " metric_type VARCHAR(30) NOT NULL," + // retention or productivity
            " employees INT NOT NULL," +
            " participants INT NOT NULL," +
            " participation_rate DECIMAL(5,1) NOT NULL," +
            " projected_units DECIMAL(12,2) NOT NULL," + // employees retained, or hours gained
            " projected_dollars DECIMAL(12,2) NOT NULL," +
            " calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
            " FOREIGN KEY (company_id) REFERENCES companies(id)" +
            ")"
        );

        // who changed which employee account, and what they did (task 10)
        statement.execute(
            "CREATE TABLE IF NOT EXISTS employee_audit_log (" +
            " id INT PRIMARY KEY AUTO_INCREMENT," +
            " company_id INT NOT NULL," +
            " actor_user_id INT NOT NULL," +
            " target_user_id INT NOT NULL," +
            " action VARCHAR(30) NOT NULL," + // CREATE, UPDATE, DEACTIVATE
            " details TEXT," +
            " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
            " FOREIGN KEY (company_id) REFERENCES companies(id)," +
            " FOREIGN KEY (actor_user_id) REFERENCES users(id)," +
            " FOREIGN KEY (target_user_id) REFERENCES users(id)" +
            ")"
        );

        statement.close();

        // New columns on tables that already exist from Sprint 1.
        // CREATE TABLE IF NOT EXISTS won't add columns to an old table,
        // so we check first and only ALTER if the column is missing.
        addColumnIfMissing("users", "is_active", "TINYINT(1) NOT NULL DEFAULT 1");
        addColumnIfMissing("wellness_events", "status", "VARCHAR(20) NOT NULL DEFAULT 'active'");
        addColumnIfMissing("resources", "audience", "VARCHAR(20) NOT NULL DEFAULT 'all'");
    }

    private void addColumnIfMissing(String table, String column, String definition) throws SQLException {
        String check = "SELECT COUNT(*) FROM information_schema.COLUMNS " +
                       "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?";
        try (PreparedStatement ps = connection.prepareStatement(check)) {
            ps.setString(1, table);
            ps.setString(2, column);
            ResultSet rs = ps.executeQuery();
            rs.next();
            if (rs.getInt(1) == 0) {
                try (Statement st = connection.createStatement()) {
                    st.execute("ALTER TABLE " + table + " ADD COLUMN " + column + " " + definition);
                }
            }
        }
    }
}
