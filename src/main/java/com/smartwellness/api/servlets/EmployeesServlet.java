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
 * Employee management for Company Administrators only. The company always
 * comes from the logged-in admin, never from the request, so an admin
 * can't reach another company's employees.
 *
 *   GET  /employees                      list employees (task 6)
 *   GET  /employees/audit                audit log of account changes (task 10)
 *   POST /employees                      create (task 7)
 *   PUT  /employees/{id}                 update (task 8)
 *   POST /employees/{id}/deactivate      deactivate (task 9)
 */
@WebServlet("/employees/*")
public class EmployeesServlet extends ApiServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp, "company_admin");
        if (auth == null) return;
        try {
            String[] p = segments(req);
            if (p.length == 0) {
                JsonUtil.send(resp, 200, new JSONObject().put("employees", AppContext.employees().list(auth.companyId)));
            } else if (p.length == 1 && p[0].equals("audit")) {
                JsonUtil.send(resp, 200, new JSONObject().put("audit_log", AppContext.employees().auditLog(auth.companyId)));
            } else {
                JsonUtil.error(resp, 404, "Not found");
            }
        } catch (Exception e) {
            fail(resp, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp, "company_admin");
        if (auth == null) return;
        try {
            String[] p = segments(req);
            if (p.length == 0) {
                JSONObject body = JsonUtil.readBody(req);
                int id = AppContext.employees().create(auth.companyId, auth.userId,
                    JsonUtil.str(body, "email"), JsonUtil.str(body, "full_name"),
                    JsonUtil.str(body, "role"), JsonUtil.str(body, "temporary_password"));
                JsonUtil.send(resp, 201, new JSONObject().put("id", id));
            } else if (p.length == 2 && p[1].equals("deactivate")) {
                AppContext.employees().deactivate(auth.companyId, auth.userId, parseId(p[0]));
                JsonUtil.send(resp, 200, new JSONObject().put("message", "Employee deactivated"));
            } else {
                JsonUtil.error(resp, 404, "Not found");
            }
        } catch (Exception e) {
            fail(resp, e);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp, "company_admin");
        if (auth == null) return;
        try {
            String[] p = segments(req);
            if (p.length != 1) {
                JsonUtil.error(resp, 404, "Not found");
                return;
            }
            JSONObject body = JsonUtil.readBody(req);
            AppContext.employees().update(auth.companyId, auth.userId, parseId(p[0]),
                JsonUtil.str(body, "full_name"), JsonUtil.str(body, "email"), JsonUtil.str(body, "role"));
            JsonUtil.send(resp, 200, new JSONObject().put("message", "Employee updated"));
        } catch (Exception e) {
            fail(resp, e);
        }
    }
}
