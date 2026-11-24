package com.smartwellness.api.servlets;

import com.smartwellness.api.AppContext;
import com.smartwellness.api.services.RoiService;
import com.smartwellness.api.util.JsonUtil;
import com.smartwellness.api.util.RequestAuth;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;

import java.io.IOException;

/*
 * Anonymous engagement report for Company Administrators (story #20).
 *   GET /reports/engagement
 *
 * Puts the event numbers (EngagementService) and the survey numbers
 * (SurveyService) together in one report. Only totals and percentages -
 * no names. The ROI money numbers come from /api/roi, which already exists.
 * Smart Wellness Admins pass ?company_id=
 */
@WebServlet("/reports/*")
public class ReportsServlet extends ApiServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp, "company_admin", "executive_sponsor", "smart_wellness_admin");
        if (auth == null) return;
        try {
            String[] p = segments(req);
            if (p.length != 1 || !p[0].equals("engagement")) {
                JsonUtil.error(resp, 404, "Not found");
                return;
            }
            int companyId = companyFor(auth, req);

            // [totalEmployees, eventParticipants, participationRatePercent]
            double[] events = AppContext.engagement().getEngagementReport(companyId);
            int employees = (int) events[0];

            // Same rule as the ROI report: with very small groups a
            // percentage could point at one person, so we don't show it
            if (employees < RoiService.MIN_GROUP_SIZE) {
                throw new IllegalArgumentException("Not enough employees to report anonymously (minimum "
                        + RoiService.MIN_GROUP_SIZE + ")");
            }

            int surveys = AppContext.surveys().countSurveysForCompany(companyId);
            int surveyPeople = AppContext.surveys().countPeopleWhoAnsweredForCompany(companyId);
            double surveyRate = Math.round(surveyPeople * 1000.0 / employees) / 10.0;

            JSONObject report = new JSONObject()
                .put("employees", employees)
                .put("event_participants", (int) events[1])
                .put("event_participation_percent", events[2])
                .put("surveys", surveys)
                .put("survey_respondents", surveyPeople)
                .put("survey_participation_percent", surveyRate)
                .put("note", "Totals only. No individual employee can be identified.");

            JsonUtil.send(resp, 200, report);
        } catch (Exception e) {
            fail(resp, e);
        }
    }
}
