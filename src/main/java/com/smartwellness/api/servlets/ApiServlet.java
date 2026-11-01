package com.smartwellness.api.servlets;

import com.smartwellness.api.services.AuthService;
import com.smartwellness.api.util.JsonUtil;
import com.smartwellness.api.util.RequestAuth;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.NoSuchElementException;

/*
 * Base class for our servlets so the login check and the error handling
 * are written once instead of in every servlet.
 */
public abstract class ApiServlet extends HttpServlet {

    // Checks the token and role. If something is wrong it writes the 401/403
    // response itself and returns null, so the caller just does "if (a == null) return;"
    protected RequestAuth login(HttpServletRequest req, HttpServletResponse resp, String... allowedRoles)
            throws IOException {
        try {
            RequestAuth auth = RequestAuth.from(req);
            if (allowedRoles.length > 0 && !Arrays.asList(allowedRoles).contains(auth.role)) {
                JsonUtil.error(resp, 403, "You do not have permission to do this");
                return null;
            }
            return auth;
        } catch (AuthService.AuthException e) {
            JsonUtil.error(resp, 401, e.getMessage());
            return null;
        } catch (SQLException e) {
            log("Database error while checking login", e);
            JsonUtil.error(resp, 500, "Something went wrong on the server");
            return null;
        }
    }

    // Services throw IllegalArgumentException for bad input and
    // NoSuchElementException for "not found"; everything else is a 500.
    protected void fail(HttpServletResponse resp, Exception e) throws IOException {
        if (e instanceof IllegalArgumentException) {
            JsonUtil.error(resp, 400, e.getMessage());
        } else if (e instanceof NoSuchElementException) {
            JsonUtil.error(resp, 404, e.getMessage());
        } else {
            log("Unexpected error", e);
            JsonUtil.error(resp, 500, "Something went wrong on the server");
        }
    }

    // "/12/cancel" -> ["12", "cancel"]; "" or "/" -> []
    protected String[] segments(HttpServletRequest req) {
        String path = req.getPathInfo();
        if (path == null || path.equals("/")) {
            return new String[0];
        }
        return path.substring(1).split("/");
    }

    protected int parseId(String text) {
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid id: " + text);
        }
    }

    // Which company a request is about. Normal users and company admins
    // always get their own company. Platform admins have no company, so
    // they must say which one with ?company_id=
    protected int companyFor(RequestAuth auth, HttpServletRequest req) {
        if (!auth.role.equals("smart_wellness_admin")) {
            return auth.companyId;
        }
        String param = req.getParameter("company_id");
        if (param == null) {
            throw new IllegalArgumentException("company_id is required");
        }
        return parseId(param);
    }
}
