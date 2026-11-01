package com.smartwellness.api.database;

import com.smartwellness.api.services.BenefitService;

/*
 * Run this once to put 10 sample benefits into a company (task 3).
 * Usage: SeedBenefits <companyId>
 * It reads the same DB_* environment variables as the app.
 */
public class SeedBenefits {
    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            System.out.println("Usage: SeedBenefits <companyId>");
            return;
        }
        Database db = new Database(
            env("DB_HOST", "localhost"),
            Integer.parseInt(env("DB_PORT", "3306")),
            env("DB_NAME", "wellness"),
            env("DB_USER", "root"),
            env("DB_PASSWORD", ""));

        int companyId = Integer.parseInt(args[0]);
        int added = new BenefitService(db).seedSamples(companyId);
        System.out.println(added == 0
            ? "Company " + companyId + " already has benefits, nothing added."
            : "Added " + added + " sample benefits to company " + companyId + ".");
    }

    private static String env(String name, String fallback) {
        String value = System.getenv(name);
        return value == null ? fallback : value;
    }
}
