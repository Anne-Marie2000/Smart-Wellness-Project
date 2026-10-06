package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;
import java.sql.*;
import java.util.*;

/*
 * Handles surveys: creating them with questions, saving answers, and
 * pulling back results. getTallyForQuestion() never selects user_id, so
 * results only ever come back as counts - that's what keeps this
 * "anonymous" like our user story asked for.
 */
public class SurveyService {

    private final Database db;

    public SurveyService(Database db) {
        this.db = db;
    }

    // questions is a list of [questionText, questionType] pairs
    public int createSurvey(String title, int companyId, int createdBy, boolean isAnonymous,
            List<String[]> questions) throws SQLException {
        Connection conn = db.getConnection();
        conn.setAutoCommit(false); // do both inserts together or not at all

        try {
            int surveyId;
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO surveys (title, company_id, created_by, is_anonymous) VALUES (?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS)) {
                ps.setString(1, title);
                ps.setInt(2, companyId);
                ps.setInt(3, createdBy);
                ps.setBoolean(4, isAnonymous);
                ps.executeUpdate();

                ResultSet keys = ps.getGeneratedKeys();
                keys.next();
                surveyId = keys.getInt(1);
            }

            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO survey_questions (survey_id, question_text, question_type) VALUES (?, ?, ?)")) {
                for (String[] q : questions) {
                    ps.setInt(1, surveyId);
                    ps.setString(2, q[0]);
                    ps.setString(3, q[1]);
                    ps.addBatch();
                }
                ps.executeBatch();
            }

            conn.commit();
            return surveyId;

        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(true);
        }
    }

    // ON DUPLICATE KEY UPDATE lets someone change their answer if they
    // submit the same question again, instead of erroring out
    public void submitResponse(int surveyId, int questionId, int userId, String answer) throws SQLException {
        String sql = "INSERT INTO survey_responses (survey_id, question_id, user_id, answer) VALUES (?, ?, ?, ?) "
                + "ON DUPLICATE KEY UPDATE answer = VALUES(answer), submitted_at = CURRENT_TIMESTAMP";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, surveyId);
            ps.setInt(2, questionId);
            ps.setInt(3, userId);
            ps.setString(4, answer);
            ps.executeUpdate();
        }
    }

    public ResultSet getQuestions(int surveyId) throws SQLException {
        PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT id, question_text, question_type FROM survey_questions WHERE survey_id = ?");
        ps.setInt(1, surveyId);
        return ps.executeQuery();
    }

    // Groups up all the answers for one question into counts, e.g.
    // {"4": 12, "5": 8} - no names attached, just totals
    public Map<String, Integer> getTallyForQuestion(int questionId) throws SQLException {
        Map<String, Integer> tally = new LinkedHashMap<>();
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT answer, COUNT(*) AS count FROM survey_responses WHERE question_id = ? GROUP BY answer")) {
            ps.setInt(1, questionId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                tally.put(rs.getString("answer"), rs.getInt("count"));
            }
        }
        return tally;
    }
}
