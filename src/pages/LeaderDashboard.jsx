import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import EventChart from "../components/EventChart";
import UpcomingEvents from "../components/UpcomingEvents";
import { apiRequest } from "../api";

// Leader dashboard.
// Data comes from MySQL through the backend:
// Every button opens a real page, or "Coming soon" for features not built yet.

function LeaderDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [guides, setGuides] = useState([]);

  // Load once when the page opens
  useEffect(() => {
    apiRequest("GET", "/api/auth/me").then(data => setProfile(data));
    apiRequest("GET", "/api/resources?audience=manager").then(data => setGuides(data.resources));
  }, []);

  // "Lee Leader" -> "Lee"
  const firstName = profile ? profile.full_name.split(" ")[0] : "";

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container">
        <section className="dashboard-heading">
          <h1>Welcome back, {firstName}.</h1>
          <p>{profile ? profile.company_name : ""} · Leader dashboard</p>
        </section>

        <section className="leader-top-grid">
          <div className="dashboard-card">
            <p className="card-label">NEXT STEPS</p>
            <h2>Keep Your Team Engaged</h2>

            <div className="task-list">
              <div className="task-item">
                <div>
                  <h3>Share the wellness check-in</h3>
                  <p>Encourage your team to complete the latest survey.</p>
                </div>
                <button onClick={() => navigate("/coming-soon")}>View</button>
              </div>

              <div className="task-item">
                <div>
                  <h3>Promote upcoming events</h3>
                  <p>Share this month's wellness sessions with your team.</p>
                </div>
                <button onClick={() => navigate("/wellness-events")}>View</button>
              </div>

              <div className="task-item">
                <div>
                  <h3>Review leader resources</h3>
                  <p>Use the latest guides for team conversations.</p>
                </div>
                <button onClick={() => navigate("/education-materials")}>View</button>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <p className="card-label">SURVEYS</p>
            <h2>Required Surveys</h2>
            <p className="muted-text">Wellness surveys are planned for Sprint 3.</p>
            <Link to="/coming-soon" className="text-button">Learn more →</Link>
          </div>
        </section>

        <section className="dashboard-grid leader-grid">
          <div className="dashboard-card">
            <p className="card-label">UPCOMING</p>
            <h2>Webinars &amp; Events</h2>
            <UpcomingEvents />
          </div>

          <div className="dashboard-card">
            <p className="card-label">LEADER TOOLS</p>
            <h2>Guides &amp; Scripts</h2>

            <div className="resource-list">
              {guides.length === 0 && <p>No guides yet.</p>}

              {guides.slice(0, 3).map(guide => (
                <div className="resource-item" key={guide.id}>
                  <h3>{guide.title}</h3>
                  <p>{guide.category}</p>
                  <button onClick={() => navigate("/education-materials")}>Open Guide →</button>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card benefits-card">
            <p className="card-label">SUPPORT</p>
            <h2>Benefits &amp; Services</h2>

            <div className="benefits-grid">
              <div>
                <h3>Wellness Coaching</h3>
                <p>Connect employees with personalized wellness support.</p>
                <button onClick={() => navigate("/coming-soon")}>Learn More →</button>
              </div>

              <div>
                <h3>Employee Resources</h3>
                <p>Find educational resources you can share with your team.</p>
                <button onClick={() => navigate("/education-materials")}>View Resources →</button>
              </div>

              <div>
                <h3>Workplace Support</h3>
                <p>See the accommodations and benefits your team can use.</p>
                <button onClick={() => navigate("/accommodations-benefits")}>Explore →</button>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-card" style={{ marginTop: "24px" }}>
          <p className="card-label">ENGAGEMENT</p>
          <h2>People Who Joined Each Event</h2>
          <EventChart />
        </section>
      </main>
    </div>
  );
}

export default LeaderDashboard;
