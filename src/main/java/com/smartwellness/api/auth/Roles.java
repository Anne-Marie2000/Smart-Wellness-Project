package com.smartwellness.api.auth;

import java.util.Set;

//Roles.java is the list of every account type on the platform
//Use Roles.EMPLOYEE, Roles.EXECUTIVE_SPONSOR, etc. 
//instead of typeing the words so that a spelling mistake can not create a role that nothing recognises
public final class Roles {
  
  public static final String EMPLOYEE = "employee";
  public static final String LEADER = "leader";
  public static final String COMPANY_ADMIN = "company_admin";
  public static final String SMART_WELLNESS_ADMIN = "smart_wellness_admin";
  public static final String EXECUTIVE_SPONSOR = "executive_sponsor";

  public static final Set<String> ALL = Set.of(
    EMPLOYEE, LEADER, COMPANY_ADMIN, SMART_WELLNESS_ADMIN, EXECUTIVE_SPONSOR);
  private Roles() {
    // only holds the roles names, never created
  }

  //isValid() checks if a role is one of the 5 above
  public static boolean isValid(String role) {
    return role != null && ALL.contains(role);
  }
}

  
