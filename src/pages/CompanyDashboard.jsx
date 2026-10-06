import { Link } from "react-router-dom";

function CompanyDashboard() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-nav">
        <div className="dashboard-nav-inner">
          <Link to="/" className="dashboard-logo">
            <img src="/smart-wellness-logo.png" alt="Smart Wellness Canada" />
          </Link>

          <div className="dashboard-tabs">
            <Link to="/company-dashboard" className="active">
              Company
            </Link>
            <Link to="/leader-dashboard">Leader</Link>
            <Link to="/employee-dashboard">Employee</Link>
          </div>

          <Link to="/" className="back-site">
            ← Back to site
          </Link>
        </div>
      </header>

      <main className="dashboard-container">
        <section className="dashboard-heading">
          <h1>Good morning, Acme HR.</h1>
          <p>Q3 program overview · 250 eligible employees</p>
        </section>

        <section className="company-stats">
          <div className="stat-card">
            <p>INVITED</p>
            <h2>250</h2>
          </div>

          <div className="stat-card">
            <p>REGISTERED</p>
            <h2>212</h2>
          </div>

          <div className="stat-card">
            <p>ACTIVE</p>
            <h2>171</h2>
          </div>

          <div className="stat-card">
            <p>EST. ROI YTD</p>
            <h2>$1.42M</h2>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-card adoption-card">
            <div className="card-heading">
              <div>
                <p className="card-label">ENGAGEMENT</p>
                <h2>Adoption Trend</h2>
              </div>

              <span>Last 6 months</span>
            </div>

            <div className="chart-placeholder">
              <div className="chart-bars">
                <div className="chart-bar bar-one"></div>
                <div className="chart-bar bar-two"></div>
                <div className="chart-bar bar-three"></div>
                <div className="chart-bar bar-four"></div>
                <div className="chart-bar bar-five"></div>
                <div className="chart-bar bar-six"></div>
              </div>

              <div className="chart-months">
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <p className="card-label">SURVEYS</p>
            <h2>Survey Completion</h2>

            <div className="survey-row">
              <div>
                <span>Baseline</span>
                <strong>78%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill baseline"></div>
              </div>
            </div>

            <div className="survey-row">
              <div>
                <span>Q3 Check-In</span>
                <strong>64%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill q3"></div>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <p className="card-label">WALLET</p>
            <h2>Wallet Funding</h2>

            <div className="wallet-total">$42,300</div>
            <p className="muted-text">Total credits funded this quarter</p>

            <div className="small-stats">
              <div>
                <span>Used</span>
                <strong>$31,860</strong>
              </div>

              <div>
                <span>Remaining</span>
                <strong>$10,440</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-card">
            <p className="card-label">EVENTS</p>
            <h2>Event Participation</h2>

            <div className="event-stat">
              <strong>186</strong>
              <span>registrations</span>
            </div>

            <div className="event-stat">
              <strong>142</strong>
              <span>attendees</span>
            </div>

            <div className="event-stat">
              <strong>76%</strong>
              <span>attendance rate</span>
            </div>
          </div>

          <div className="dashboard-card feedback-card">
            <p className="card-label">EMPLOYEE VOICE</p>
            <h2>Anonymous Feedback</h2>

            <blockquote>
              “The resources have made it easier to understand what support is
              available and where to find it.”
            </blockquote>

            <p className="muted-text">
              Feedback is anonymous and shown without identifying information.
            </p>
          </div>

          <div className="dashboard-card baseline-card">
            <p className="card-label">WORKFORCE INSIGHTS</p>
            <h2>Workforce Baseline</h2>

            <div className="baseline-grid">
              <div>
                <strong>68%</strong>
                <span>report symptoms</span>
              </div>

              <div>
                <strong>51%</strong>
                <span>report work impact</span>
              </div>

              <div>
                <strong>22%</strong>
                <span>feel supported</span>
              </div>

              <div>
                <strong>94%</strong>
                <span>would recommend support</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CompanyDashboard;