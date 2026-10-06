import { Link } from "react-router-dom";

function EmployeeDashboard() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <Link to="/" className="dashboard-logo">
            <img src="/smart-wellness-logo.png" alt="Smart Wellness Canada" />
          </Link>

          <div className="dashboard-tabs">
            <Link to="/company-dashboard">Company</Link>
            <Link to="/leader-dashboard">Leader</Link>
            <Link to="/employee-dashboard" className="active">
              Employee
            </Link>
          </div>

          <Link to="/" className="back-site">
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="dashboard-container employee-dashboard">
        <section className="employee-heading">
          <p className="card-label">YOUR WELLNESS</p>

          <h1>
            Hi Maya — glad you're here.
          </h1>

          <p>
            Today's a good day for something small and kind.
          </p>

          <div className="heading-buttons">
            <button>Ask AI</button>
            <button>Book Coaching</button>
          </div>
        </section>

        <section className="employee-top-grid">
          <div className="dashboard-card wallet-card">
            <p className="card-label">DIGITAL WALLET</p>
            <h2>$185 available</h2>

            <div className="wallet-details">
              <div>
                <span>Employer Credits</span>
                <strong>$150</strong>
              </div>

              <div>
                <span>SWC Top-Up</span>
                <strong>$35</strong>
              </div>
            </div>

            <button className="text-button">View Transactions →</button>
          </div>

          <div className="dashboard-card recommended-card">
            <p className="card-label">FOR YOU</p>
            <h2>Recommended for You</h2>

            <div className="recommendation">
              <h3>Understanding Midlife Changes</h3>
              <p>
                A short guide to common symptoms and ways to support your
                wellbeing.
              </p>
              <button>Read Article →</button>
            </div>

            <div className="recommendation">
              <h3>Sleep &amp; Recovery</h3>
              <p>
                Simple ideas that may help you build a healthier sleep routine.
              </p>
              <button>Explore →</button>
            </div>
          </div>
        </section>

        <section className="dashboard-grid employee-grid">
          <div className="dashboard-card ai-card">
            <p className="card-label">PERSONAL SUPPORT</p>
            <h2>AI Wellness Assistant</h2>

            <p>
              Ask questions and find wellness resources based on what you need
              today.
            </p>

            <button className="dashboard-action-button">
              Ask the Wellness Assistant
            </button>
          </div>

          <div className="dashboard-card">
            <p className="card-label">UPCOMING</p>
            <h2>Upcoming Events</h2>

            <div className="event-list">
              <div className="event-row">
                <div className="event-date">
                  <strong>12</strong>
                  <span>OCT</span>
                </div>

                <div>
                  <h3>Midlife Wellness Workshop</h3>
                  <p>12:00 PM · Virtual</p>
                </div>
              </div>

              <div className="event-row">
                <div className="event-date">
                  <strong>20</strong>
                  <span>OCT</span>
                </div>

                <div>
                  <h3>Sleep &amp; Stress Session</h3>
                  <p>1:00 PM · Virtual</p>
                </div>
              </div>
            </div>

            <button className="text-button">View All Events →</button>
          </div>

          <div className="dashboard-card">
            <p className="card-label">SURVEYS</p>
            <h2>Required Surveys</h2>

            <div className="survey-list">
              <div className="survey-item">
                <div>
                  <h3>Q3 Wellness Check-In</h3>
                  <p>About 5 minutes</p>
                </div>

                <span className="status-badge">Open</span>
              </div>
            </div>

            <button className="text-button">Start Survey →</button>
          </div>

          <div className="dashboard-card">
            <p className="card-label">COMMUNITY</p>
            <h2>Community Board</h2>

            <p>
              Connect with wellness conversations and see what others in the
              community are sharing.
            </p>

            <button className="text-button">Visit Community →</button>
          </div>

          <div className="dashboard-card resources-card">
            <p className="card-label">LEARN &amp; EXPLORE</p>
            <h2>Resources Library</h2>

            <div className="resources-grid">
              <div>
                <h3>Menopause &amp; Midlife</h3>
                <p>Articles, guides, and educational resources.</p>
                <button>Explore →</button>
              </div>

              <div>
                <h3>Nutrition</h3>
                <p>Practical resources for everyday wellness.</p>
                <button>Explore →</button>
              </div>

              <div>
                <h3>Mental Wellness</h3>
                <p>Support for stress, wellbeing, and emotional health.</p>
                <button>Explore →</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default EmployeeDashboard;