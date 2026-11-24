package com.smartwellness.api.services;

import com.smartwellness.api.database.Database;
import com.smartwellness.api.util.JsonUtil;
import org.json.JSONArray;
import org.json.JSONObject;

import java.sql.*;
import java.util.*;

/*
 * Handles surveys: creating them with questions, saving answers, and
 * pulling back results.
 *
 * Surveys are always anonymous: answers are saved in survey_answers with
 * no user id, and who finished a survey is saved separately in
 * survey_completions. Nothing links a person to their answers, and results
 * only show once at least 5 people have answered.
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

    // Saves one person's answers to a survey, fully anonymously.
    // answers is a list of [questionId, answer] pairs.
    //
    // 1. survey_completions remembers THAT this person finished the survey
    //    (so they can't answer twice).
    // 2. survey_answers stores WHAT was answered, with no user id.
    // Both are saved together, or not at all.
    public void submitSurvey(int surveyId, int userId, List<String[]> answers) throws SQLException {
        Connection conn = db.getConnection();

        // Has this person already finished this survey?
        try (PreparedStatement ps = conn.prepareStatement(
                "SELECT COUNT(*) FROM survey_completions WHERE survey_id = ? AND user_id = ?")) {
            ps.setInt(1, surveyId);
            ps.setInt(2, userId);
            ResultSet rs = ps.executeQuery();
            rs.next();
            if (rs.getInt(1) > 0) {
                throw new IllegalArgumentException("You have already completed this survey");
            }
        }

        conn.setAutoCommit(false); // save both parts together or not at all
        try {
            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO survey_completions (survey_id, user_id) VALUES (?, ?)")) {
                ps.setInt(1, surveyId);
                ps.setInt(2, userId);
                ps.executeUpdate();
            }

            try (PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO survey_answers (survey_id, question_id, answer) VALUES (?, ?, ?)")) {
                for (String[] a : answers) {
                    ps.setInt(1, surveyId);
                    ps.setInt(2, Integer.parseInt(a[0]));
                    ps.setString(3, a[1]);
                    ps.addBatch();
                }
                ps.executeBatch();
            }

            conn.commit();
        } catch (SQLException e) {
            conn.rollback();
            throw e;
        } finally {
            conn.setAutoCommit(true);
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
                "SELECT answer, COUNT(*) AS count FROM survey_answers WHERE question_id = ? GROUP BY answer")) {
            ps.setInt(1, questionId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                tally.put(rs.getString("answer"), rs.getInt("count"));
            }
        }
        return tally;
    }

    // ---------------------------------------------------------------
    // Sprint 3 additions
    // ---------------------------------------------------------------

    // Results are only shown once at least this many people have answered,
    // so nobody can work out how one person answered.
    public static final int MIN_RESPONSES = 5;

    // All surveys for one company, newest first
    public JSONArray listSurveysForCompany(int companyId) throws SQLException {
        String sql = "SELECT id, title, company_id, created_at FROM surveys "
                + "WHERE company_id = ? ORDER BY created_at DESC";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, companyId);
            return JsonUtil.toArray(ps.executeQuery());
        }
    }

    // The id of every company. Used when a survey is sent to all companies.
    public List<Integer> listCompanyIds() throws SQLException {
        List<Integer> ids = new ArrayList<>();
        try (PreparedStatement ps = db.getConnection().prepareStatement("SELECT id FROM companies ORDER BY id")) {
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                ids.add(rs.getInt("id"));
            }
        }
        return ids;
    }

    // Every survey on the platform (for the Smart Wellness Admin, who has no company)
    public JSONArray listAllSurveys() throws SQLException {
        String sql = "SELECT id, title, company_id, created_at FROM surveys ORDER BY created_at DESC";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            return JsonUtil.toArray(ps.executeQuery());
        }
    }

    // Which company a survey belongs to. Throws "not found" if the survey doesn't exist.
    public int getCompanyOfSurvey(int surveyId) throws SQLException {
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT company_id FROM surveys WHERE id = ?")) {
            ps.setInt(1, surveyId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) {
                throw new NoSuchElementException("Survey not found");
            }
            return rs.getInt("company_id");
        }
    }

    // One survey with its questions:
    // {"id": 1, "title": "...", "questions": [{"id": 3, "question_text": "...", "question_type": "rating"}]}
    public JSONObject getSurvey(int surveyId) throws SQLException {
        JSONObject survey = new JSONObject();
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT id, title FROM surveys WHERE id = ?")) {
            ps.setInt(1, surveyId);
            ResultSet rs = ps.executeQuery();
            if (!rs.next()) {
                throw new NoSuchElementException("Survey not found");
            }
            survey.put("id", rs.getInt("id"));
            survey.put("title", rs.getString("title"));
        }
        survey.put("questions", JsonUtil.toArray(getQuestions(surveyId)));
        return survey;
    }

    // How many different people answered this survey
    public int countPeopleWhoAnswered(int surveyId) throws SQLException {
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT COUNT(*) FROM survey_completions WHERE survey_id = ?")) {
            ps.setInt(1, surveyId);
            ResultSet rs = ps.executeQuery();
            rs.next();
            return rs.getInt(1);
        }
    }

    // Grouped results for one survey. Never includes who answered.
    // Rating questions get counts:   "counts": {"4": 12, "5": 8}
    // Text questions get comments:   "comments": ["More flexible hours", "..."]
    public JSONObject getResults(int surveyId) throws SQLException {
        int people = countPeopleWhoAnswered(surveyId);
        if (people < MIN_RESPONSES) {
            throw new IllegalArgumentException("Results will show once at least " + MIN_RESPONSES
                    + " people have answered (so far: " + people + ")");
        }

        JSONObject results = getSurvey(surveyId);
        results.put("response_count", people);

        JSONArray questions = results.getJSONArray("questions");
        for (int i = 0; i < questions.length(); i++) {
            JSONObject question = questions.getJSONObject(i);
            int questionId = question.getInt("id");

            if (question.getString("question_type").equals("text")) {
                question.put("comments", getCommentsForQuestion(questionId));
            } else {
                question.put("counts", new JSONObject(getTallyForQuestion(questionId)));
            }
        }
        return results;
    }

    // All written answers for one question, in random order so they can't be matched to the order people submitted them
    public JSONArray getCommentsForQuestion(int questionId) throws SQLException {
        JSONArray comments = new JSONArray();
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT answer FROM survey_answers WHERE question_id = ? ORDER BY RAND()")) {
            ps.setInt(1, questionId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                comments.put(rs.getString("answer"));
            }
        }
        return comments;
    }

    // For the engagement report: how many surveys a company has
    public int countSurveysForCompany(int companyId) throws SQLException {
        try (PreparedStatement ps = db.getConnection().prepareStatement(
                "SELECT COUNT(*) FROM surveys WHERE company_id = ?")) {
            ps.setInt(1, companyId);
            ResultSet rs = ps.executeQuery();
            rs.next();
            return rs.getInt(1);
        }
    }

    // For the engagement report: how many different people in a company answered any survey
    public int countPeopleWhoAnsweredForCompany(int companyId) throws SQLException {
        String sql = "SELECT COUNT(DISTINCT c.user_id) FROM survey_completions c "
                + "JOIN surveys s ON s.id = c.survey_id WHERE s.company_id = ?";
        try (PreparedStatement ps = db.getConnection().prepareStatement(sql)) {
            ps.setInt(1, companyId);
            ResultSet rs = ps.executeQuery();
            rs.next();
            return rs.getInt(1);
        }
    }
}
