
package com.smartwellness.api.servlets;

import com.smartwellness.api.AppContext;
import com.smartwellness.api.util.JsonUtil;
import com.smartwellness.api.util.RequestAuth;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;

import java.io.IOException;

// Employee management is for Company Admins.
// Smart Wellness Admins can also manage Smart IDs for any company.

@WebServlet("/employees/*")
public class EmployeesServlet extends ApiServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        String[] p = segments(req);

        try {
            if (p.length == 1 && p[0].equals("smart-ids")) {

                RequestAuth auth = login(req, resp,
                    "company_admin", "smart_wellness_admin");

                if (auth == null) return;

                int companyId = companyFor(auth, req);

                JsonUtil.send(resp, 200, new JSONObject().put(
                    "smart_ids",
                    AppContext.employees().unusedSignUpCodes(companyId)
                ));

            } else {

                RequestAuth auth = login(req, resp, "company_admin");

                if (auth == null) return;

                if (p.length == 0) {
                    JsonUtil.send(resp, 200, new JSONObject().put(
                        "employees",
                        AppContext.employees().list(auth.companyId)
                    ));

                } else if (p.length == 1 && p[0].equals("audit")) {
                    JsonUtil.send(resp, 200, new JSONObject().put(
                        "audit_log",
                        AppContext.employees().auditLog(auth.companyId)
                    ));

                } else {
                    JsonUtil.error(resp, 404, "Not found");
                }
            }

        } catch (Exception e) {
            fail(resp, e);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        String[] p = segments(req);

        try {
            if (p.length == 1 && p[0].equals("smart-ids")) {

                RequestAuth auth = login(req, resp,
                    "company_admin", "smart_wellness_admin");

                if (auth == null) return;

                int companyId = companyFor(auth, req);

                JSONObject body = JsonUtil.readBody(req);

                String code = AppContext.employees().createSignUpCode(
                    companyId,
                    JsonUtil.str(body, "role")
                );

                JsonUtil.send(resp, 201, new JSONObject().put("code", code));

            } else {

                RequestAuth auth = login(req, resp, "company_admin");

                if (auth == null) return;

                if (p.length == 0) {
                    JSONObject body = JsonUtil.readBody(req);

                    int id = AppContext.employees().create(
                        auth.companyId,
                        auth.userId,
                        JsonUtil.str(body, "email"),
                        JsonUtil.str(body, "full_name"),
                        JsonUtil.str(body, "role"),
                        JsonUtil.str(body, "temporary_password")
                    );

                    JsonUtil.send(resp, 201, new JSONObject().put("id", id));

                } else if (p.length == 2 && p[1].equals("deactivate")) {

                    AppContext.employees().deactivate(
                        auth.companyId,
                        auth.userId,
                        parseId(p[0])
                    );

                    JsonUtil.send(resp, 200,
                        new JSONObject().put("message", "Employee deactivated"));

                } else {
                    JsonUtil.error(resp, 404, "Not found");
                }
            }

        } catch (Exception e) {
            fail(resp, e);
        }
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        RequestAuth auth = login(req, resp, "company_admin");

        if (auth == null) return;

        try {
            String[] p = segments(req);

            if (p.length != 1) {
                JsonUtil.error(resp, 404, "Not found");
                return;
            }

            JSONObject body = JsonUtil.readBody(req);

            AppContext.employees().update(
                auth.companyId,
                auth.userId,
                parseId(p[0]),
                JsonUtil.str(body, "full_name"),
                JsonUtil.str(body, "email"),
                JsonUtil.str(body, "role")
            );

            JsonUtil.send(resp, 200,
                new JSONObject().put("message", "Employee updated"));

        } catch (Exception e) {
            fail(resp, e);
        }
    }

    // Revoke an unused Smart ID.
    // Company Admins can only revoke their own company's codes.
    // Smart Wellness Admins can revoke codes for any company.

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {

        RequestAuth auth = login(req, resp,
            "company_admin", "smart_wellness_admin");

        if (auth == null) return;

        try {
            String[] p = segments(req);

            if (p.length != 2 || !p[0].equals("smart-ids")) {
                JsonUtil.error(resp, 404, "Not found");
                return;
            }

            int companyId = companyFor(auth, req);

            boolean deleted = AppContext.employees().revokeSignUpCode(
                companyId, p[1]
            );

            if (!deleted) {
                JsonUtil.error(resp, 404,
                    "Smart ID not found or has already been used");
                return;
            }

            JsonUtil.send(resp, 200,
                new JSONObject().put("message", "Smart ID revoked"));

        } catch (Exception e) {
            fail(resp, e);
        }
    }
}
