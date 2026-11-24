
package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.regex.Pattern;

public class ContactService {

    private static final Pattern EMAIL_PATTERN =
        Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private final Database db;

    public ContactService(Database db) {
        this.db = db;
    }

    public int createMessage(String name, String email,
                             String subject, String message)
                             throws SQLException {

        name = required(name, "Full name", 120);
        email = required(email, "Email address", 255);
        subject = required(subject, "Subject", 150);
        message = required(message, "Message", 3000);

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException(
                "Please enter a valid email address"
            );
        }

        String sql = "INSERT INTO contact_messages " +
            "(name, email, subject, message) VALUES (?, ?, ?, ?)";

        try (PreparedStatement ps = db.getConnection()
                .prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, subject);
            ps.setString(4, message);

            ps.executeUpdate();

            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getInt(1);
                }
            }
        }

        throw new SQLException("The contact message could not be saved");
    }

    private String required(String value, String label, int maxLength) {

        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(label + " is required");
        }

        String trimmed = value.trim();

        if (trimmed.length() > maxLength) {
            throw new IllegalArgumentException(
                label + " must be no more than " + maxLength + " characters"
            );
        }

        return trimmed;
    }
}
