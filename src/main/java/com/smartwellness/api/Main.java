package com.smartwellness.api;

import com.smartwellness.api.database.Database;
import com.smartwellness.api.services.*;
import com.smartwellness.api.servlets.*;
import org.eclipse.jetty.ee10.servlet.ServletContextHandler;
import org.eclipse.jetty.ee10.servlet.ServletHolder;
import org.eclipse.jetty.server.Server;

// connects to MySQL (Database also creates any missing tables)
//creates the services
//connects each servlet to its web address
//starts the web server on http://localhost:8080

public class Main {

    public static void main(String[] args) throws Exception {

        // ---- database ----
        Database db = new Database(
                //Small helper method, checks Eclipse settings
                //(Check setting, gives back)
                env("DB_HOST", "localhost"),
                Integer.parseInt(env("DB_PORT", "3306")),
                env("DB_NAME", "wellness"),
                env("DB_USER", "wellness_user"),
                //gets the database password from Eclipse's settings so that the backend can log in to MySQL
                required("DB_PASSWORD"));

         // ---- create the services ----
        SmartIdService smartIdService = new SmartIdService(db);
        AuthService authService = new AuthService(db, smartIdService);

        // AppContext keeps one copy of every service so all the servlets can share them
        AppContext.init(db, authService);

        // Every address starts with /api so the React site (through vite.config.js)
        // knows to send it to this Java server.
        ServletContextHandler context = new ServletContextHandler();
        context.setContextPath("/");
        context.addServlet(new ServletHolder(new AuthServlet()), "/api/auth/*");
        context.addServlet(new ServletHolder(new EmployeesServlet()), "/api/employees/*");
        context.addServlet(new ServletHolder(new EventsServlet()), "/api/events/*");
        context.addServlet(new ServletHolder(new BenefitsServlet()), "/api/benefits/*");
        context.addServlet(new ServletHolder(new ResourcesServlet()), "/api/resources/*");
        context.addServlet(new ServletHolder(new RoiServlet()), "/api/roi/*");
        // Sprint 3
        context.addServlet(new ServletHolder(new SurveysServlet()), "/api/surveys/*");
        context.addServlet(new ServletHolder(new ReportsServlet()), "/api/reports/*");
        context.addServlet(new ServletHolder(new AnalyticsServlet()), "/api/analytics/*");
        context.addServlet(new ServletHolder(new TwoFactorServlet()), "/api/two-factor/*");

        // ---- start ----
        int port = Integer.parseInt(env("PORT", "8080"));
        Server server = new Server(port);
        server.setHandler(context);
        server.start();
        System.out.println("Smart Wellness is running at http://localhost:" + port);
        // keeps running until you press the red stop button in Eclipse Console
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
