package com.smartwellness.api.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;

/*
 * Small helpers so the servlets don't repeat the same JSON code.
 */
public class JsonUtil {

    // Turns every row of a ResultSet into a JSON object inside one array.
    public static JSONArray toArray(ResultSet rs) throws SQLException {
        JSONArray rows = new JSONArray();
        ResultSetMetaData md = rs.getMetaData();
        while (rs.next()) {
            JSONObject row = new JSONObject();
            for (int i = 1; i <= md.getColumnCount(); i++) {
                Object value = rs.getObject(i);
                String name = md.getColumnLabel(i);
                if (value == null) {
                    row.put(name, JSONObject.NULL);
                } else if (value instanceof Number || value instanceof Boolean) {
                    row.put(name, value);
                } else {
                    row.put(name, value.toString()); // dates, text, etc.
                }
            }
            rows.put(row);
        }
        return rows;
    }

    // Reads the request body as JSON (empty body = empty object).
    public static JSONObject readBody(HttpServletRequest req) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
        }
        String text = sb.toString().trim();
        if (text.isEmpty()) {
            return new JSONObject();
        }
        try {
            return new JSONObject(text);
        } catch (JSONException e) {
            throw new IllegalArgumentException("Request body is not valid JSON");
        }
    }

    // Returns a trimmed string from the JSON body, or null if it's missing.
    public static String str(JSONObject body, String key) {
        if (!body.has(key) || body.isNull(key)) {
            return null;
        }
        return body.optString(key, "").trim();
    }

    public static void send(HttpServletResponse resp, int status, Object json) throws IOException {
        resp.setStatus(status);
        resp.setContentType("application/json");
        resp.setCharacterEncoding("UTF-8");
        resp.getWriter().write(json.toString());
    }

    public static void error(HttpServletResponse resp, int status, String message) throws IOException {
        send(resp, status, new JSONObject().put("error", message));
    }
}
