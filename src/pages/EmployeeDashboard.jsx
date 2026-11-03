import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import UpcomingEvents from "../components/UpcomingEvents";
import { apiRequest } from "../api";

// Employee dashboard.
// Data comes from MySQL through the backend:
// Every button opens a real page, or "Coming soon" for features not built yet
// (AI assistant, coaching, wallet, surveys, community board).

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [guides, setGuides] = useState([]);

  // Load once when the page opens
  useEffect(() => {
    apiRequest("GET", "/api/auth/me").then(data => setProfile(data));
    apiRequest("GET", "/api/resources?audience=employee").then(data => setGuides(data.resources));
  }, []);

  // "Emma Employee" -> "Emma"
  const firstName = profile ? profile.full_name.split(" ")[0] : "";

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container employee-dashboard">
        <section className="employee-heading">
          <p className="card-label">YOUR WELLNESS</p>

          <h1>Hi {firstName} — glad you're here.</h1>

          <p>Today's a good day for something small and kind.</p>

          <div className="heading-buttons">
            <button onClick={() => navigate("/coming-soon")}>Ask AI</button>
            <button onClick={() => navigate("/coming-soon")}>Book Coaching</button>
          </div>
        </section>

        <section className="employee-top-grid">
          <div className="dashboard-card wallet-card">
            <p className="card-label">DIGITAL WALLET</p>
            <h2>Wellness Credits</h2>
            <p>Credits from your employer for wellness services are coming soon.</p>
            <button className="text-button" onClick={() => navigate("/coming-soon")}>Learn more →</button>
          </div>

          <div className="dashboard-card recommended-card">
            <p className="card-label">FOR YOU</p>
            <h2>Recommended for You</h2>

            {guides.length === 0 && <p>No guides yet.</p>}

            {/* show the first 2 guides */}
            {guides.slice(0, 2).map(guide => (
              <div className="recommendation" key={guide.id}>
                <h3>{guide.title}</h3>
                <p>{guide.category}</p>
                <button onClick={() => navigate("/education-materials")}>Read Article →</button>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-grid employee-grid">
          <div className="dashboard-card ai-card">
            <p className="card-label">PERSONAL SUPPORT</p>
            <h2>AI Wellness Assistant</h2>
            <p>Ask questions and find wellness resources based on what you need today.</p>
            <button className="dashboard-action-button" onClick={() => navigate("/coming-soon")}>
              Ask the Wellness Assistant
            </button>
          </div>

          <div className="dashboard-card">
            <p className="card-label">UPCOMING</p>
            <h2>Upcoming Events</h2>
            <UpcomingEvents />
          </div>

          <div className="dashboard-card">
            <p className="card-label">SURVEYS</p>
            <h2>Required Surveys</h2>
            <p>Wellness surveys are planned for Sprint 3.</p>
            <button className="text-button" onClick={() => navigate("/coming-soon")}>Start Survey →</button>
          </div>

          <div className="dashboard-card">
            <p className="card-label">COMMUNITY</p>
            <h2>Community Board</h2>
            <p>Connect with wellness conversations and see what others are sharing.</p>
            <button className="text-button" onClick={() => navigate("/coming-soon")}>Visit Community →</button>
          </div>

          <div className="dashboard-card resources-card">
            <p className="card-label">LEARN &amp; EXPLORE</p>
            <h2>Resources Library</h2>

            <div className="resources-grid">
              <div>
                <h3>Menopause &amp; Midlife</h3>
                <p>Articles, guides, and educational resources.</p>
                <button onClick={() => navigate("/education-materials")}>Explore →</button>
              </div>

              <div>
                <h3>Accommodations &amp; Benefits</h3>
                <p>Support and benefits at your workplace.</p>
                <button onClick={() => navigate("/accommodations-benefits")}>Explore →</button>
              </div>

              <div>
                <h3>Wellness Events</h3>
                <p>Workshops and sessions you can join.</p>
                <button onClick={() => navigate("/wellness-events")}>Explore →</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default EmployeeDashboard;
