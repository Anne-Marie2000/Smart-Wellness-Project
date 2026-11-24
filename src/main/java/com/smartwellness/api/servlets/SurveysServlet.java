package com.smartwellness.api.servlets;

import com.smartwellness.api.AppContext;
import com.smartwellness.api.util.JsonUtil;
import com.smartwellness.api.util.RequestAuth;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

/*
 *   GET  /surveys                  list surveys (your company's, or all for a Smart Wellness Admin)
 *   GET  /surveys/{id}             one survey and its questions
 *   GET  /surveys/{id}/results     grouped, anonymous results (needs at least 5 people)
 *   POST /surveys                  create a survey - Smart Wellness Admin
 *   POST /surveys/{id}/responses   submit answers - employee or leader
 *
 * Question types: "rating" (1 to 5) or "text" (a written comment, used for
 * the anonymous workplace feedback).
 */
@WebServlet("/surveys/*")
public class SurveysServlet extends ApiServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp); // any signed-in user
        if (auth == null) return;
        try {
            String[] p = segments(req);

            if (p.length == 0) {
                // GET /surveys
                JSONArray surveys;
                if (auth.role.equals("smart_wellness_admin")) {
                    surveys = AppContext.surveys().listAllSurveys();
                } else {
                    surveys = AppContext.surveys().listSurveysForCompany(auth.companyId);
                }
                JsonUtil.send(resp, 200, new JSONObject().put("surveys", surveys));

            } else if (p.length == 1) {
                // GET /surveys/{id}
                int surveyId = parseId(p[0]);
                checkSameCompany(auth, surveyId);
                JsonUtil.send(resp, 200, new JSONObject().put("survey", AppContext.surveys().getSurvey(surveyId)));

            } else if (p.length == 2 && p[1].equals("results")) {
                // GET /surveys/{id}/results - employees can't see results
                if (auth.role.equals("employee")) {
                    JsonUtil.error(resp, 403, "You do not have permission to do this");
                    return;
                }
                int surveyId = parseId(p[0]);
                checkSameCompany(auth, surveyId);
                JsonUtil.send(resp, 200, AppContext.surveys().getResults(surveyId));

            } else {
                JsonUtil.error(resp, 404, "Not found");
            }
        } catch (Exception e) {
            fail(resp, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String[] p = segments(req);

            if (p.length == 0) {
                // POST /surveys - create a survey
                RequestAuth auth = login(req, resp, "smart_wellness_admin");
                if (auth == null) return;
                createSurvey(req, resp, auth);

            } else if (p.length == 2 && p[1].equals("responses")) {
                // POST /surveys/{id}/responses - submit answers
                RequestAuth auth = login(req, resp, "employee", "leader");
                if (auth == null) return;
                submitAnswers(req, resp, auth, parseId(p[0]));

            } else {
                JsonUtil.error(resp, 404, "Not found");
            }
        } catch (Exception e) {
            fail(resp, e);
        }
    }

    // Body: {"title": "...", "company_id": 1, "is_anonymous": true,
    //        "questions": [{"question_text": "...", "question_type": "rating"}]}
    private void createSurvey(HttpServletRequest req, HttpServletResponse resp, RequestAuth auth) throws Exception {
        JSONObject body = JsonUtil.readBody(req);

        String title = JsonUtil.str(body, "title");
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("title is required");
        }
        if (!body.has("company_id")) {
            throw new IllegalArgumentException("company_id is required");
        }
        if (!body.has("questions") || body.getJSONArray("questions").length() == 0) {
            throw new IllegalArgumentException("Add at least one question");
        }

        // Turn the JSON questions into [text, type] pairs for SurveyService
        List<String[]> questions = new ArrayList<>();
        JSONArray list = body.getJSONArray("questions");
        for (int i = 0; i < list.length(); i++) {
            JSONObject q = list.getJSONObject(i);
            String text = q.optString("question_text", "").trim();
            String type = q.optString("question_type", "rating");
            if (text.isEmpty()) {
                throw new IllegalArgumentException("Question " + (i + 1) + " is empty");
            }
            if (!type.equals("rating") && !type.equals("text")) {
                throw new IllegalArgumentException("question_type must be rating or text");
            }
            questions.add(new String[]{text, type});
        }

        int surveyId = AppContext.surveys().createSurvey(title, body.getInt("company_id"), auth.userId,
                body.optBoolean("is_anonymous", true), questions);
        JsonUtil.send(resp, 201, new JSONObject().put("id", surveyId));
    }

    // Body: {"responses": [{"question_id": 3, "answer": "4"}, ...]}
    private void submitAnswers(HttpServletRequest req, HttpServletResponse resp, RequestAuth auth, int surveyId)
            throws Exception {
        checkSameCompany(auth, surveyId);

        JSONObject body = JsonUtil.readBody(req);
        if (!body.has("responses")) {
            throw new IllegalArgumentException("responses is required");
        }

        // Check every answer first, then save them all at once
        List<String[]> answers = new ArrayList<>();
        JSONArray responses = body.getJSONArray("responses");
        for (int i = 0; i < responses.length(); i++) {
            JSONObject r = responses.getJSONObject(i);
            String answer = r.optString("answer", "").trim();
            if (answer.isEmpty()) {
                throw new IllegalArgumentException("Please answer every question");
            }
            answers.add(new String[]{String.valueOf(r.getInt("question_id")), answer});
        }

        // Saved anonymously: the answers are never linked to this user
        AppContext.surveys().submitSurvey(surveyId, auth.userId, answers);
        JsonUtil.send(resp, 201, new JSONObject().put("message", "Thank you! Your answers were saved anonymously."));
    }

    // Stops people from opening another company's survey.
    // Smart Wellness Admins look after every company, so they are allowed.
    private void checkSameCompany(RequestAuth auth, int surveyId) throws Exception {
        int surveyCompany = AppContext.surveys().getCompanyOfSurvey(surveyId);
        if (!auth.role.equals("smart_wellness_admin") && surveyCompany != auth.companyId) {
            // say "not found" so people can't guess which survey ids exist
            throw new NoSuchElementException("Survey not found");
        }
    }
}
