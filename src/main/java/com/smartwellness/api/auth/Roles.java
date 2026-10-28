if (!Roles.isValid(intendedRole)) {
  throw new IllegalArgumentException("Unknown role: " + intendedRole + ". Allowed roles: " + Roles.ALL);
}
