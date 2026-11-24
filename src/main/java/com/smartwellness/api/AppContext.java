package com.smartwellness.api;

import com.smartwellness.api.database.Database;
import com.smartwellness.api.services.*;

/*
 * Holds the one Database and the service objects so every servlet can
 * share them. AppListener fills this in once when the app starts.
 */
public class AppContext {
    private static Database db;
    private static AuthService auth;
    private static BenefitService benefits;
    private static EmployeeService employees;
    private static EventService events;
    private static RoiService roi;
    private static ResourceService resources;
    // Sprint 3
    private static SurveyService surveys;
    private static EngagementService engagement;
    private static UsageService usage;
    private static TwoFactorService twoFactor;

    public static void init(Database database, AuthService authService) {
        db = database;
        auth = authService;
        benefits = new BenefitService(database);
        employees = new EmployeeService(database);
        events = new EventService(database);
        roi = new RoiService(database);
        resources = new ResourceService(database);
        surveys = new SurveyService(database);
        engagement = new EngagementService(database);
        usage = new UsageService(database);
        twoFactor = new TwoFactorService(database);
    }

    public static Database db() { return db; }
    public static AuthService auth() { return auth; }
    public static BenefitService benefits() { return benefits; }
    public static EmployeeService employees() { return employees; }
    public static EventService events() { return events; }
    public static RoiService roi() { return roi; }
    public static ResourceService resources() { return resources; }
    public static SurveyService surveys() { return surveys; }
    public static EngagementService engagement() { return engagement; }
    public static UsageService usage() { return usage; }
    public static TwoFactorService twoFactor() { return twoFactor; }
}
