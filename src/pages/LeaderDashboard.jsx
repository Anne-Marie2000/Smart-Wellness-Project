import { Link } from "react-router-dom";

function LeaderDashboard() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <Link to="/" className="dashboard-logo">
            <img src="/smart-wellness-logo.png" alt="Smart Wellness Canada" />
          </Link>

          <div className="dashboard-tabs">
            <Link to="/company-dashboard">Company</Link>
            <Link to="/leader-dashboard" className="active">
              Leader
            </Link>
            <Link to="/employee-dashboard">Employee</Link>
          </div>

          <Link to="/" className="back-site">
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="dashboard-container">
        <section className="dashboard-heading">
          <h1>Welcome back, Ziya.</h1>
          <p>Q3 program overview · 250 eligible employees</p>
        </section>

        <section className="leader-top-grid">
          <div className="dashboard-card">
            <p className="card-label">NEXT STEPS</p>
            <h2>Keep Your Team Engaged</h2>

            <div className="task-list">
              <div className="task-item">
                <div>
                  <h3>Share the Q3 wellness check-in</h3>
                  <p>Encourage your team to complete the latest survey.</p>
                </div>
                <button>View</button>
              </div>

              <div className="task-item">
                <div>
                  <h3>Promote upcoming events</h3>
                  <p>Share this month's wellness sessions with your team.</p>
                </div>
                <button>View</button>
              </div>

              <div className="task-item">
                <div>
                  <h3>Review leader resources</h3>
                  <p>Use the latest guides for team conversations.</p>
                </div>
                <button>View</button>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <p className="card-label">SURVEYS</p>
            <h2>Required Surveys</h2>

            <div className="survey-list">
              <div className="survey-item">
                <div>
                  <h3>Q3 Wellness Check-In</h3>
                  <p>Due this week</p>
                </div>
                <span className="status-badge">Open</span>
              </div>

              <div className="survey-item">
                <div>
                  <h3>Leader Experience Survey</h3>
                  <p>5 minute survey</p>
                </div>
                <span className="status-badge">Open</span>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-grid leader-grid">
          <div className="dashboard-card">
            <p className="card-label">UPCOMING</p>
            <h2>Webinars &amp; Events</h2>

            <div className="event-list">
              <div className="event-row">
                <div className="event-date">
                  <strong>12</strong>
                  <span>OCT</span>
                </div>

                <div>
                  <h3>Supporting Employees Through Midlife</h3>
                  <p>12:00 PM · Virtual</p>
                </div>
              </div>

              <div className="event-row">
                <div className="event-date">
                  <strong>20</strong>
                  <span>OCT</span>
                </div>

                <div>
                  <h3>Building a Supportive Workplace</h3>
                  <p>1:00 PM · Virtual</p>
                </div>
              </div>
            </div>

            <button className="text-button">View All Events →</button>
          </div>

          <div className="dashboard-card">
            <p className="card-label">LEADER TOOLS</p>
            <h2>Guides &amp; Scripts</h2>

            <div className="resource-list">
              <div className="resource-item">
                <h3>Starting a Supportive Conversation</h3>
                <p>A simple guide for speaking with team members.</p>
                <button>Open Guide →</button>
              </div>

              <div className="resource-item">
                <h3>Workplace Accommodation Guide</h3>
                <p>Helpful steps for responding to accommodation needs.</p>
                <button>Open Guide →</button>
              </div>

              <div className="resource-item">
                <h3>Manager Conversation Scripts</h3>
                <p>Examples for common workplace wellness conversations.</p>
                <button>Open Guide →</button>
              </div>
            </div>
          </div>

          <div className="dashboard-card benefits-card">
            <p className="card-label">SUPPORT</p>
            <h2>Benefits &amp; Services</h2>

            <div className="benefits-grid">
              <div>
                <h3>Wellness Coaching</h3>
                <p>Connect employees with personalized wellness support.</p>
                <button>Learn More →</button>
              </div>

              <div>
                <h3>Employee Resources</h3>
                <p>Find educational resources you can share with your team.</p>
                <button>View Resources →</button>
              </div>

              <div>
                <h3>Workplace Support</h3>
                <p>Explore tools for creating a more supportive workplace.</p>
                <button>Explore →</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LeaderDashboard;