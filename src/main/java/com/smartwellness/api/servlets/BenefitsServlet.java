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
 * GET /benefits  - the benefits and accommodations for the logged-in
 * user's own company (task 2).
 */
@WebServlet("/benefits/*")
public class BenefitsServlet extends ApiServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RequestAuth auth = login(req, resp); // any logged-in user
        if (auth == null) return;
        try {
            int companyId = companyFor(auth, req);
            JsonUtil.send(resp, 200, new JSONObject().put("benefits", AppContext.benefits().listForCompany(companyId)));
        } catch (Exception e) {
            fail(resp, e);
        }
    }
}
