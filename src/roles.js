// A list of every role for the front end
// must match the roles that the back end stores

export const ROLES = {
  COMPANY_ADMIN: 'company_admin',
  LEADER: 'leader',
  EMPLOYEE: 'employee',
  EXECUTIVE_SPONSOR: 'executive_sponsor',
  SMART_WELLNESS_ADMIN: 'smart_wellness_admin',
};

export const ROLE_INFO = {
  [ROLES.COMPANY_ADMIN]: {
    label: 'Company',
    dashboard: '/company-dashboard',
    showOnSignIn: true,
  },

  [ROLES.LEADER]: {
    label: 'Leader',
    dashboard: '/leader-dashboard',
    showOnSignIn: true,
  },

  [ROLES.EMPLOYEE]: {
    label: 'Employee',
    dashboard: '/employee-dashboard',
    showOnSignIn: true,
  },

  [ROLES.EXECUTIVE_SPONSOR]: {
    label: 'Executive',
    dashboard: '/executive-dashboard',
    showOnSignIn: true,
  },

  // Sprint 3: Smart Wellness Admins now have their own analytics dashboard
  [ROLES.SMART_WELLNESS_ADMIN]: {
    label: 'Smart Wellness Admin',
    dashboard: '/admin-dashboard',
    showOnSignIn: false,
  },
};

// Where to send someone after they sign in. 
// Leads to Employee Dashboard if the role is unknown.
export function dashboardFor(role) {
  return ROLE_INFO[role]?.dashboard ?? '/employee-dashboard';
}
