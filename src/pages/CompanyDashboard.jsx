import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import EventChart from "../components/EventChart";
import { apiRequest } from "../api";

// Company Administrator dashboard.
// Every number on this page comes from the database (MySQL) through the backend:
// Features we haven't built yet (wallet, surveys, feedback) link to "Coming soon".

function CompanyDashboard() {
  const [firstName, setFirstName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [employees, setEmployees] = useState([]);
  const [events, setEvents] = useState([]);
  const [participation, setParticipation] = useState("-");
  const [savings, setSavings] = useState("-");

  // Load everything once, when the page opens
  useEffect(() => {
    // your name and company
    apiRequest("GET", "/api/auth/me").then(data => {
      setFirstName(data.full_name.split(" ")[0]); // "Alex Admin" -> "Alex"
      setCompanyName(data.company_name);
    });

    // the employees and the events
    apiRequest("GET", "/api/employees").then(data => setEmployees(data.employees));
    apiRequest("GET", "/api/events").then(data => setEvents(data.events));

    // The ROI numbers need at least 5 employees.
    // If there are fewer, the backend sends an error and we keep showing "-".
    apiRequest("GET", "/api/roi/retention")
      .then(data => {
        setParticipation(data.participation_rate_percent + "%");
        setSavings("$" + Math.round(data.projected_savings_cad));
      })
      .catch(() => {
        setParticipation("-");
        setSavings("-");
      });
  }, []);

  // Count the active employees
  let activeCount = 0;
  for (const employee of employees) {
    if (employee.is_active) {
      activeCount = activeCount + 1;
    }
  }

  // Add up the sign-ups, and count the events that are still coming up
  let signUps = 0;
  let upcomingCount = 0;
  const today = new Date();

  for (const event of events) {
    signUps = signUps + event.registrations;

    if (event.status !== "cancelled" && new Date(event.event_date) > today) {
      upcomingCount = upcomingCount + 1;
    }
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container">
        <section className="dashboard-heading">
          <h1>Welcome, {firstName}.</h1>
          <p>{companyName} · Wellness program overview</p>
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
            <h2>{participation}</h2>
          </div>

          <div className="stat-card">
            <p>EST. SAVINGS</p>
            <h2>{savings}</h2>
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
