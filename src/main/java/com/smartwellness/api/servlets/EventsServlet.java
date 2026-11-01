package com.smartwellness.api.servlets;

import com.smartwellness.api.AppContext;
import com.smartwellness.api.util.JsonUtil;
import com.smartwellness.api.util.RequestAuth;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;

import java.io.IOException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

/*
 * Wellness events.
 *   GET  /events                 list events for your company (task 12)
 *   POST /events                 create - Smart Wellness Admin (task 11)
 *   PUT  /events/{id}            update - Smart Wellness Admin (task 11)
 *   POST /events/{id}/cancel     cancel - Smart Wellness Admin (task 11)
 *   POST /events/{id}/join       employee or leader joins (task 13)
 *
 * Dates are sent like "2026-11-05T14:00" (or "2026-11-05 14:00:00").
 */
@WebServlet("/events/*")
public class EventsServlet extends ApiServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp); // any logged-in user
        if (auth == null) return;
        try {
            int companyId = companyFor(auth, req);
            JsonUtil.send(resp, 200, new JSONObject().put("events", AppContext.events().list(companyId, auth.userId)));
        } catch (Exception e) {
            fail(resp, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try {
            String[] p = segments(req);

            if (p.length == 0) { // create
                RequestAuth auth = login(req, resp, "smart_wellness_admin");
                if (auth == null) return;
                JSONObject body = JsonUtil.readBody(req);
                if (!body.has("company_id")) {
                    throw new IllegalArgumentException("company_id is required");
                }
                int id = AppContext.events().create(body.getInt("company_id"), auth.userId,
                    JsonUtil.str(body, "title"), JsonUtil.str(body, "description"),
                    parseDate(JsonUtil.str(body, "event_date")));
                JsonUtil.send(resp, 201, new JSONObject().put("id", id));

            } else if (p.length == 2 && p[1].equals("cancel")) {
                RequestAuth auth = login(req, resp, "smart_wellness_admin");
                if (auth == null) return;
                AppContext.events().cancel(parseId(p[0]));
                JsonUtil.send(resp, 200, new JSONObject().put("message", "Event cancelled"));

            } else if (p.length == 2 && p[1].equals("join")) {
                RequestAuth auth = login(req, resp, "employee", "leader");
                if (auth == null) return;
                if (AppContext.events().join(auth.companyId, auth.userId, parseId(p[0]))) {
                    JsonUtil.send(resp, 201, new JSONObject().put("message", "Joined event"));
                } else {
                    JsonUtil.error(resp, 409, "You have already joined this event");
                }

            } else {
                JsonUtil.error(resp, 404, "Not found");
            }
        } catch (Exception e) {
            fail(resp, e);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp, "smart_wellness_admin");
        if (auth == null) return;
        try {
            String[] p = segments(req);
            if (p.length != 1) {
                JsonUtil.error(resp, 404, "Not found");
                return;
            }
            JSONObject body = JsonUtil.readBody(req);
            AppContext.events().update(parseId(p[0]), JsonUtil.str(body, "title"),
                JsonUtil.str(body, "description"), parseDate(JsonUtil.str(body, "event_date")));
            JsonUtil.send(resp, 200, new JSONObject().put("message", "Event updated"));
        } catch (Exception e) {
            fail(resp, e);
        }
    }

    // null stays null (= not provided)
    private Timestamp parseDate(String text) {
        if (text == null || text.isEmpty()) {
            return null;
        }
        try {
            return Timestamp.valueOf(LocalDateTime.parse(text.replace(' ', 'T')));
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("event_date must look like 2026-11-05T14:00");
        }
    }
}
