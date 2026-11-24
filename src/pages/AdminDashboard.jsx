import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiRequest } from '../api';

// Smart Wellness Admin Dashboard (story #14)
// Shows how much each company is using the platform.
// The numbers come from GET /api/analytics and are totals only (no names).

export default function AdminDashboard() {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');

  // Load the numbers once, when the page opens
  useEffect(() => {
    apiRequest('GET', '/api/analytics')
      .then(data => setCompanies(data.companies))
      .catch(err => setError(err.message));
  }, []);

  // Add up the numbers for all companies, for the cards at the top
  let totalUsers = 0;
  let activeUsers = 0;
  let logins = 0;
  for (const company of companies) {
    totalUsers = totalUsers + company.total_users;
    activeUsers = activeUsers + company.active_users_30_days;
    logins = logins + company.logins_7_days;
  }

  return (
    <main className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-heading">
          <h1>System Analytics</h1>
          <p>How each organization is using Smart Wellness.</p>
        </div>

        {error && <p className="form-error">{error}</p>}

        <section className="company-stats">
          <div className="stat-card">
            <p>COMPANIES</p>
            <h2>{companies.length}</h2>
          </div>
          <div className="stat-card">
            <p>USERS</p>
            <h2>{totalUsers}</h2>
          </div>
          <div className="stat-card">
            <p>ACTIVE (30 DAYS)</p>
            <h2>{activeUsers}</h2>
          </div>
          <div className="stat-card">
            <p>SIGN-INS (7 DAYS)</p>
            <h2>{logins}</h2>
          </div>
        </section>

        <section className="dashboard-card" style={{ marginTop: '24px' }}>
          <p className="card-label">USAGE BY ORGANIZATION</p>
          <h2>Platform Usage</h2>

          {companies.length === 0 && !error && <p className="muted-text">No companies yet.</p>}

          {companies.length > 0 && (
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Users</th>
                  <th>Active (30 days)</th>
                  <th>Sign-ins (7 days)</th>
                  <th>Answered a survey</th>
                  <th>Event sign-ups</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.company_id}>
                    <td>{company.company_name}</td>
                    <td>{company.total_users}</td>
                    <td>{company.active_users_30_days}</td>
                    <td>{company.logins_7_days}</td>
                    <td>{company.survey_respondents}</td>
                    <td>{company.event_signups}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Links to the things a Smart Wellness Admin manages */}
        <section className="dashboard-grid" style={{ marginTop: '24px' }}>
          <div className="dashboard-card">
            <p className="card-label">EVENTS</p>
            <h2>Wellness Events</h2>
            <Link to="/wellness-events" className="text-button">Manage Events →</Link>
          </div>
          <div className="dashboard-card">
            <p className="card-label">SURVEYS</p>
            <h2>Wellness Surveys</h2>
            <Link to="/surveys" className="text-button">Manage Surveys →</Link>
          </div>
          <div className="dashboard-card">
            <p className="card-label">EDUCATION</p>
            <h2>Education Materials</h2>
            <Link to="/education-materials" className="text-button">Manage Materials →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
