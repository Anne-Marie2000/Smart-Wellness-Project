package com.smartwellness.api.servlets;

import com.smartwellness.api.AppContext;
import com.smartwellness.api.util.JsonUtil;
import com.smartwellness.api.util.RequestAuth;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;

import java.io.IOException;

/*
 * System analytics for the Smart Wellness Admin (story #14).
 *   GET /analytics platform usage for every company (totals only)
 */
@WebServlet("/analytics/*")
public class AnalyticsServlet extends ApiServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp, "smart_wellness_admin");
        if (auth == null) return;
        try {
            JsonUtil.send(resp, 200, new JSONObject().put("companies", AppContext.usage().usageByCompany()));
        } catch (Exception e) {
            fail(resp, e);
        }
    }
}
