package com.smartwellness.api;

import com.smartwellness.api.database.Database;
import com.smartwellness.api.services.*;
import com.smartwellness.api.servlets.AuthServlet;
import org.eclipse.jetty.ee10.servlet.ServletContextHandler;
import org.eclipse.jetty.ee10.servlet.ServletHolder;
import org.eclipse.jetty.server.Server;

// connects to MySQL (Database also creates any missing tables)
//creates the services
//connects AuthServlet to its web address
//starts the web server on http://localhost:8080

public class Main {

    public static void main(String[] args) throws Exception {

        // ---- database ----
        Database db = new Database(
                env("DB_HOST", "localhost"),
                Integer.parseInt(env("DB_PORT", "3306")),
                env("DB_NAME", "wellness"),
                env("DB_USER", "wellness_user"),
                required("DB_PASSWORD"));

        // ---- services ----
        SmartIdService smartIdService = new SmartIdService(db);
        AuthService authService = new AuthService(db, smartIdService);

        // Not used yet - each one will get its own servlet later
        ResourceService resourceService = new ResourceService(db);
        EngagementService engagementService = new EngagementService(db);
        SurveyService surveyService = new SurveyService(db);

        // ---- servlets -> web addresses ----
        ServletContextHandler context = new ServletContextHandler();
        context.setContextPath("/");
       // When a request comes in for http://localhost:8080/api/auth/... , send it to AuthServlet
        context.addServlet(new ServletHolder(new AuthServlet(authService)), "/api/auth/*");

        // ---- start ----
        int port = Integer.parseInt(env("PORT", "8080"));
        Server server = new Server(port);
        server.setHandler(context);
        server.start();
        System.out.println("Smart Wellness is running at http://localhost:" + port);
        // keeps running until you press the red stop button
        server.join(); 
    }

    // Reads a setting, or uses the default if it isn't set
    private static String env(String name, String defaultValue) {
        String value = System.getenv(name);
        return (value == null || value.isBlank()) ? defaultValue : value;
    }

    // Reads a setting that MUST be set, otherwise stops with a clear message
    private static String required(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing setting " + name
                    + " - add it in Eclipse: Run Configurations -> Environment");
        }
        return value;
    }
}
