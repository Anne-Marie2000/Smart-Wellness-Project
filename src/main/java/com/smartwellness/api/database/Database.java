package com.smartwellness.api.database;

import java.sql.Connection;
import java.sql.DriverManager;
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

    // host e.g. "localhost"
    // port e.g. 3306
    // dbName the database name - must already exist (CREATE DATABASE wellness;)
    // user MySQL username
    // password MySQL password
    public Database(String host, int port, String dbName, String user, String password) throws SQLException {

        // Load the MySQL driver so DriverManager knows how to connect.
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC driver not found on classpath.", e);
        }

        String url = "jdbc:mysql://" + host + ":" + port + "/" + dbName
                + "?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";

        connection = DriverManager.getConnection(url, user, password);

        createTablesIfNeeded();
    }

    public Connection getConnection() {
        return connection;
    }

    // Creates every table the backend needs. Split into one statement per
    // table just to keep it readable - this all runs once on startup.
    private void createTablesIfNeeded() throws SQLException {
        Statement statement = connection.createStatement();

        // companies = the organizations using Smart Wellness (our clients)
        statement.execute(
                "CREATE TABLE IF NOT EXISTS companies ("
                + " id INT PRIMARY KEY AUTO_INCREMENT,"
                + " company_name VARCHAR(255) NOT NULL,"
                + " industry VARCHAR(255) NOT NULL,"
                + " company_size VARCHAR(255) NOT NULL,"
                + " employee_count INT NOT NULL,"
                + " contact_name VARCHAR(255) NOT NULL,"
                + " job_title VARCHAR(255) NOT NULL,"
                + " work_email VARCHAR(255) NOT NULL,"
                + " phone_number VARCHAR(255) NOT NULL,"
                + " alternate_email VARCHAR(255),"
                + " two_factor_enabled TINYINT(1) NOT NULL DEFAULT 0,"
                + " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP"
                + ")"
        );

        // smart_ids = one-time codes that link a new user to the right
        // company and role when they sign up, so we don't have to trust
        // the user to type their company name correctly
        statement.execute(
                "CREATE TABLE IF NOT EXISTS smart_ids ("
                + " id INT PRIMARY KEY AUTO_INCREMENT,"
                + " code VARCHAR(32) UNIQUE NOT NULL,"
                + " company_id INT NOT NULL,"
                + " intended_role VARCHAR(50) NOT NULL,"
                + " is_redeemed TINYINT(1) NOT NULL DEFAULT 0,"
                + " redeemed_by_user_id INT,"
                + " expires_at TIMESTAMP NULL,"
                + " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                + " FOREIGN KEY (company_id) REFERENCES companies(id)"
                + ")"
        );

        // users = every login on the platform (employees, leaders, company
        // admins, and our own platform admins)
        statement.execute(
                "CREATE TABLE IF NOT EXISTS users ("
                + " id INT PRIMARY KEY AUTO_INCREMENT,"
                + " email VARCHAR(255) UNIQUE NOT NULL,"
                + " password_hash VARCHAR(255) NOT NULL,"
                + " full_name VARCHAR(255) NOT NULL,"
                + " role VARCHAR(50) NOT NULL,"
                + // employee, leader, company_admin, smart_wellness_admin
                " company_id INT,"
                + " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                + " FOREIGN KEY (company_id) REFERENCES companies(id)"
                + ")"
        );

        // resources = wellness articles/guides. company_id NULL means it's
        // a general resource visible to everyone, not just one company
        statement.execute(
                "CREATE TABLE IF NOT EXISTS resources ("
                + " id INT PRIMARY KEY AUTO_INCREMENT,"
                + " title VARCHAR(255) NOT NULL,"
                + " category VARCHAR(100),"
                + " body TEXT NOT NULL,"
                + " company_id INT,"
                + " created_by INT NOT NULL,"
                + " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                + " FOREIGN KEY (created_by) REFERENCES users(id),"
                + " FOREIGN KEY (company_id) REFERENCES companies(id)"
                + ")"
        );

        // wellness_events = the actual workshops/sessions a company can host
        statement.execute(
                "CREATE TABLE IF NOT EXISTS wellness_events ("
                + " id INT PRIMARY KEY AUTO_INCREMENT,"
                + " title VARCHAR(255) NOT NULL,"
                + " description TEXT,"
                + " company_id INT NOT NULL,"
                + " event_date DATETIME NOT NULL,"
                + " created_by INT NOT NULL,"
                + " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                + " FOREIGN KEY (company_id) REFERENCES companies(id),"
                + " FOREIGN KEY (created_by) REFERENCES users(id)"
                + ")"
        );

        // engagement = tracks who joined which event. This is how we build
        // the leader's "team engagement" view and the company-wide report
        statement.execute(
                "CREATE TABLE IF NOT EXISTS engagement ("
                + " id INT PRIMARY KEY AUTO_INCREMENT,"
                + " user_id INT NOT NULL,"
                + " event_id INT NOT NULL,"
                + " joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                + " UNIQUE (user_id, event_id),"
                + // stops someone joining the same event twice
                " FOREIGN KEY (user_id) REFERENCES users(id),"
                + " FOREIGN KEY (event_id) REFERENCES wellness_events(id)"
                + ")"
        );

        // surveys + questions + responses, kept as 3 tables so one survey
        // can have multiple questions and get multiple answers over time
        statement.execute(
                "CREATE TABLE IF NOT EXISTS surveys ("
                + " id INT PRIMARY KEY AUTO_INCREMENT,"
                + " title VARCHAR(255) NOT NULL,"
                + " company_id INT NOT NULL,"
                + " created_by INT NOT NULL,"
                + " is_anonymous TINYINT(1) NOT NULL DEFAULT 1,"
                + " created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                + " FOREIGN KEY (company_id) REFERENCES companies(id),"
                + " FOREIGN KEY (created_by) REFERENCES users(id)"
                + ")"
        );

        statement.execute(
                "CREATE TABLE IF NOT EXISTS survey_questions ("
                + " id INT PRIMARY KEY AUTO_INCREMENT,"
                + " survey_id INT NOT NULL,"
                + " question_text TEXT NOT NULL,"
                + " question_type VARCHAR(50) NOT NULL,"
                + // rating, text, multiple_choice
                " options TEXT,"
                + // only used for multiple_choice questions
                " FOREIGN KEY (survey_id) REFERENCES surveys(id)"
                + ")"
        );

        // Note: we DO store user_id here so someone can't submit the same
        // question twice, but our results query never selects user_id back
        // out - that's what keeps the reporting side anonymous.
        statement.execute(
                "CREATE TABLE IF NOT EXISTS survey_responses ("
                + " id INT PRIMARY KEY AUTO_INCREMENT,"
                + " survey_id INT NOT NULL,"
                + " question_id INT NOT NULL,"
                + " user_id INT NOT NULL,"
                + " answer TEXT NOT NULL,"
                + " submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,"
                + " UNIQUE (question_id, user_id),"
                + " FOREIGN KEY (survey_id) REFERENCES surveys(id),"
                + " FOREIGN KEY (question_id) REFERENCES survey_questions(id),"
                + " FOREIGN KEY (user_id) REFERENCES users(id)"
                + ")"
        );

        statement.close();
    }
}
