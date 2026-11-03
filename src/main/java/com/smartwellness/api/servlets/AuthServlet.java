package com.smartwellness.api.servlets;

import com.smartwellness.api.AppContext;
import com.smartwellness.api.services.AuthService;
import com.smartwellness.api.util.RequestAuth;
import org.json.JSONObject;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;


 // Handles /auth/register, /auth/register-company, /auth/login and /auth/me. This is the
 // example of how a service class gets wired up to an actual HTTP
 // endpoint - the other servlets follow the same pattern.

@WebServlet("/auth/*")
public class AuthServlet extends HttpServlet {
    private AuthService authService;

    // Tomcat creates this servlet itself, so it can't pass the service in
    // through a constructor. We get the shared AuthService here instead.
    @Override
    public void init() {
        authService = AppContext.auth();
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        resp.setContentType("application/json");
        String path = req.getPathInfo(); 

        JSONObject body = readJsonBody(req);

        try {
            String token;
            if ("/register".equals(path)) {
                token = authService.register(
                    body.getString("email"),
                    body.getString("password"),
                    body.getString("full_name"),
                    body.getString("smart_id_code")
                );
            } else if ("/register-company".equals(path)) {
                // Create Company Account page
                token = authService.registerCompany(
                    body.getString("company_name"),
                    body.getString("industry"),
                    body.getString("company_size"),
                    body.getInt("employee_count"),
                    body.getString("full_name"),
                    body.getString("job_title"),
                    body.getString("email"),
                    body.getString("phone_number"),
                    body.getString("password")
                );
            } else if ("/login".equals(path)) {
                token = authService.login(body.getString("email"), body.getString("password"));
            } else {
                resp.setStatus(404);
                return;
            }

            resp.setStatus(201);
            resp.getWriter().write(new JSONObject().put("token", token).toString());

        } catch (AuthService.AuthException e) {
            // these are "expected" errors, like a wrong password, so we send back a 400 with a message instead of crashing
            resp.setStatus(400);
            resp.getWriter().write(new JSONObject().put("error", e.getMessage()).toString());
        } catch (Exception e) {
            resp.setStatus(500);
            resp.getWriter().write(new JSONObject().put("error", "Something went wrong").toString());
        }
    }

    // GET /api/auth/me - the signed-in person's name and company (for the dashboards)
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("application/json");
        if (!"/me".equals(req.getPathInfo())) {
            resp.setStatus(404);
            return;
        }
        try {
            RequestAuth auth = RequestAuth.from(req); // checks the login token
            resp.getWriter().write(authService.getProfile(auth.userId).toString());
        } catch (AuthService.AuthException e) {
            resp.setStatus(401);
            resp.getWriter().write(new JSONObject().put("error", e.getMessage()).toString());
        } catch (Exception e) {
            resp.setStatus(500);
            resp.getWriter().write(new JSONObject().put("error", "Something went wrong").toString());
        }
    }

    private JSONObject readJsonBody(HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        return new JSONObject(sb.toString());
    }
}
