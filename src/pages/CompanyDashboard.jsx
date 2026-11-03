import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import EventChart from "../components/EventChart";
import { apiRequest } from "../api";

// Company Administrator dashboard.
// Everything comes from MySQL through the backend:
// Features that don't exist yet (wallet, surveys, feedback) say "Coming soon".

function CompanyDashboard() {
  const [profile, setProfile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [events, setEvents] = useState([]);
  const [roi, setRoi] = useState(null);

  // Load everything once when the page opens
  useEffect(() => {
    apiRequest("GET", "/api/auth/me").then(data => setProfile(data));
    apiRequest("GET", "/api/employees").then(data => setEmployees(data.employees));
    apiRequest("GET", "/api/events").then(data => setEvents(data.events));
    // the ROI numbers need at least 5 employees, so this can fail - that's OK
    apiRequest("GET", "/api/roi/retention").then(data => setRoi(data)).catch(() => setRoi(null));
  }, []);

  // Count things from the lists we got back
  const activeCount = employees.filter(employee => employee.is_active).length;

  let signUps = 0;
  events.forEach(event => {
    signUps = signUps + event.registrations;
  });

  const upcomingCount = events.filter(
    event => event.status !== "cancelled" && new Date(event.event_date) > new Date()
  ).length;

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container">
        <section className="dashboard-heading">
          <h1>Welcome, {profile ? profile.company_name : ""}.</h1>
          <p>Wellness program overview</p>
        </section>

        <section className="company-stats">
          <div className="stat-card">
            <p>EMPLOYEES</p>
            <h2>{employees.length}</h2>
          </div>

          <div className="stat-card">
            <p>ACTIVE</p>
            <h2>{activeCount}</h2>
          </div>

          <div className="stat-card">
            <p>PARTICIPATION</p>
            <h2>{roi ? roi.participation_rate_percent + "%" : "-"}</h2>
          </div>

          <div className="stat-card">
            <p>EST. SAVINGS</p>
            <h2>{roi ? "$" + Math.round(roi.projected_savings_cad).toLocaleString() : "-"}</h2>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-card adoption-card">
            <p className="card-label">ENGAGEMENT</p>
            <h2>People Who Joined Each Event</h2>
            <EventChart />
          </div>

          <div className="dashboard-card">
            <p className="card-label">EVENTS</p>
            <h2>Event Participation</h2>

            <div className="event-stat">
              <strong>{signUps}</strong>
              <span>sign-ups</span>
            </div>

            <div className="event-stat">
              <strong>{events.length}</strong>
              <span>events in total</span>
            </div>

            <div className="event-stat">
              <strong>{upcomingCount}</strong>
              <span>upcoming events</span>
            </div>
          </div>

          <div className="dashboard-card">
            <p className="card-label">SURVEYS</p>
            <h2>Survey Completion</h2>
            <p className="muted-text">Wellness surveys are planned for Sprint 3.</p>
            <Link to="/coming-soon" className="text-button">Learn more →</Link>
          </div>

          <div className="dashboard-card">
            <p className="card-label">WALLET</p>
            <h2>Wallet Funding</h2>
            <p className="muted-text">Employer wellness credits are coming soon.</p>
            <Link to="/coming-soon" className="text-button">Learn more →</Link>
          </div>

          <div className="dashboard-card">
            <p className="card-label">EMPLOYEE VOICE</p>
            <h2>Anonymous Feedback</h2>
            <p className="muted-text">Anonymous feedback is planned for Sprint 3.</p>
            <Link to="/coming-soon" className="text-button">Learn more →</Link>
          </div>

          <div className="dashboard-card">
            <p className="card-label">TEAM</p>
            <h2>Manage Employees</h2>
            <p className="muted-text">Add, edit or deactivate employee accounts.</p>
            <Link to="/employee-management" className="text-button">Go to Employees →</Link>
          </div>
        </section>

        <section className="dashboard-card" style={{ marginTop: "24px" }}>
          <p className="card-label">WELLNESS EVENTS</p>
          <h2>Wellness Events</h2>
          <p className="muted-text">See your organization's wellness events.</p>
          <Link to="/wellness-events" className="back-site">
            View Events →
          </Link>
        </section>
      </main>
    </div>
  );
}

export default CompanyDashboard;
