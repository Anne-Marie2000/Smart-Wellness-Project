package com.smartwellness.api.servlets;

import com.smartwellness.api.AppContext;
import com.smartwellness.api.util.JsonUtil;
import com.smartwellness.api.util.RequestAuth;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDate;

/*
 * ROI numbers for the leadership dashboard. All aggregated, no personal data.
 *   GET /roi/retention      projected retention (task 14)
 *   GET /roi/productivity   projected productivity (task 15)
 *   GET /roi/export         the report as a CSV download (task 16)
 *
 * There is no separate "executive" role in the users table yet, so
 * leaders and company admins can view these. Platform admins pass ?company_id=
 */
@WebServlet("/roi/*")
public class RoiServlet extends ApiServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp, "executive_sponsor", "company_admin", "leader", "smart_wellness_admin");
        if (auth == null) return;
        try {
            String[] p = segments(req);
            if (p.length != 1) {
                JsonUtil.error(resp, 404, "Not found");
                return;
            }
            int companyId = companyFor(auth, req);

            if (p[0].equals("retention")) {
                JsonUtil.send(resp, 200, AppContext.roi().retention(companyId));
            } else if (p[0].equals("productivity")) {
                JsonUtil.send(resp, 200, AppContext.roi().productivity(companyId));
            } else if (p[0].equals("export")) {
                String csv = AppContext.roi().exportCsv(companyId);
                resp.setStatus(200);
                resp.setContentType("text/csv");
                resp.setCharacterEncoding("UTF-8");
                resp.setHeader("Content-Disposition", "attachment; filename=\"roi-report-" + LocalDate.now() + ".csv\"");
                resp.getWriter().write(csv);
            } else {
                JsonUtil.error(resp, 404, "Not found");
            }
        } catch (Exception e) {
            fail(resp, e);
        }
    }
}
