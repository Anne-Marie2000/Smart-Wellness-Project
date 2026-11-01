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
 * Wellness resources.
 *   GET    /resources?audience=manager|employee   list, optional audience filter (task 18)
 *   POST   /resources                             create (Smart Wellness Admin)
 *   PUT    /resources/{id}                        update (Smart Wellness Admin)
 *   DELETE /resources/{id}                        delete (Smart Wellness Admin)
 *
 * Employees only ever get resources meant for employees (or everyone),
 * even if they ask for audience=manager.
 */
@WebServlet("/resources/*")
public class ResourcesServlet extends ApiServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp);
        if (auth == null) return;
        try {
            String audience = req.getParameter("audience");
            if (audience != null && audience.isEmpty()) {
                audience = null;
            }
            if (auth.role.equals("employee")) {
                if (audience != null && !audience.equals("employee")) {
                    JsonUtil.error(resp, 403, "Employees can only view employee resources");
                    return;
                }
                audience = "employee";
            }

            // platform admins have no company; they see general resources unless they pass ?company_id=
            Integer companyId = auth.role.equals("smart_wellness_admin")
                ? (req.getParameter("company_id") == null ? null : parseId(req.getParameter("company_id")))
                : Integer.valueOf(auth.companyId);

            JsonUtil.send(resp, 200, new JSONObject().put("resources",
                AppContext.resources().listForCompany(companyId, audience)));
        } catch (Exception e) {
            fail(resp, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp, "smart_wellness_admin");
        if (auth == null) return;
        try {
            JSONObject body = JsonUtil.readBody(req);
            Integer companyId = body.has("company_id") && !body.isNull("company_id") ? body.getInt("company_id") : null;
            int id = AppContext.resources().create(JsonUtil.str(body, "title"), JsonUtil.str(body, "category"),
                JsonUtil.str(body, "body"), JsonUtil.str(body, "audience"), companyId, auth.userId);
            JsonUtil.send(resp, 201, new JSONObject().put("id", id));
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
            AppContext.resources().update(parseId(p[0]), JsonUtil.str(body, "title"), JsonUtil.str(body, "category"),
                JsonUtil.str(body, "body"), JsonUtil.str(body, "audience"));
            JsonUtil.send(resp, 200, new JSONObject().put("message", "Resource updated"));
        } catch (Exception e) {
            fail(resp, e);
        }
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp, "smart_wellness_admin");
        if (auth == null) return;
        try {
            String[] p = segments(req);
            if (p.length != 1) {
                JsonUtil.error(resp, 404, "Not found");
                return;
            }
            AppContext.resources().delete(parseId(p[0]));
            JsonUtil.send(resp, 200, new JSONObject().put("message", "Resource deleted"));
        } catch (Exception e) {
            fail(resp, e);
        }
    }
}
