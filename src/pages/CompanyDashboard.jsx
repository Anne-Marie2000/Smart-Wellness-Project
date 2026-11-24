import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import EventChart from "../components/EventChart";
import { apiRequest, getToken } from "../api";

// "$12,345" style money
function money(amount) {
  return "$" + Math.round(amount).toLocaleString("en-CA");
}

// Makes text safe to put inside the PDF page (so a name like "<b>" shows as text)
function escapeHtml(text) {
  return String(text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Company Administrator dashboard.
// Every number on this page comes from the database (MySQL) through the backend:
// Shows information about this company's wellness program.

function CompanyDashboard() {
  const [firstName, setFirstName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [employees, setEmployees] = useState([]);
  const [events, setEvents] = useState([]);
  const [participation, setParticipation] = useState("-");
  const [savings, setSavings] = useState("-");
  const [error, setError] = useState("");
  // Sprint 3: anonymous engagement report (story #20)
  const [report, setReport] = useState(null);
  const [reportMessage, setReportMessage] = useState("");
  const [retention, setRetention] = useState(null);
  const [productivity, setProductivity] = useState(null);
  // Sprint 3: two-factor sign-in setting for the whole company
  const [twoFactorOn, setTwoFactorOn] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState("");

  // Load everything once, when the page opens
  useEffect(() => {
    // your name and company
    apiRequest("GET", "/api/auth/me").then(data => {
      setFirstName(data.full_name.split(" ")[0]); // "Alex Admin" -> "Alex"
      setCompanyName(data.company_name);
    }).catch(err => setError(err.message));

    // the employees and the events
    apiRequest("GET", "/api/employees").then(data => setEmployees(data.employees)).catch(err => setError(err.message));
    apiRequest("GET", "/api/events").then(data => setEvents(data.events)).catch(err => setError(err.message));

    // The ROI numbers need at least 5 employees.
    // If there are fewer, the backend sends an error and we keep showing "-".
    apiRequest("GET", "/api/roi/retention")
      .then(data => {
        setRetention(data);
        setParticipation(data.participation_rate_percent + "%");
        setSavings("$" + Math.round(data.projected_savings_cad));
      })
      .catch(() => {
        setParticipation("-");
        setSavings("-");
      });

    // the productivity numbers, for the PDF report
    apiRequest("GET", "/api/roi/productivity")
      .then(data => setProductivity(data))
      .catch(() => setProductivity(null));

    // is two-factor sign-in on for this company?
    apiRequest("GET", "/api/two-factor/settings")
      .then(data => setTwoFactorOn(data.enabled))
      .catch(err => setTwoFactorMessage(err.message));

    // the engagement report (needs at least 5 employees, like the ROI numbers)
    apiRequest("GET", "/api/reports/engagement")
      .then(data => setReport(data))
      .catch(err => setReportMessage(err.message));
  }, []);

  // Download the ROI report as a CSV file (opens in Excel or Google Sheets).
  // We use fetch (not a normal link) so we can send the login token with it.
  async function downloadCsv() {
    const response = await fetch("/api/roi/export", {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    if (!response.ok) {
      setReportMessage("Could not download the report.");
      return;
    }
    const file = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "ROI-Report.csv";
    link.click();
  }

  // Download the report as a PDF.
  // We open a simple printable page in a new tab and open the print window.
  // The user picks "Save as PDF" as the printer.
  function downloadPdf() {
    if (!report) {
      setReportMessage("The report is not ready yet.");
      return;
    }

    // one table row: a label and its value
    function row(label, value) {
      return "<tr><td>" + label + "</td><td><strong>" + value + "</strong></td></tr>";
    }

    let rows = "";
    rows = rows + row("Employees", report.employees);
    rows = rows + row("Joined at least one wellness event", report.event_participation_percent + "% (" + report.event_participants + " people)");
    rows = rows + row("Answered a survey", report.survey_participation_percent + "% (" + report.survey_respondents + " people)");
    rows = rows + row("Surveys sent", report.surveys);
    if (retention) {
      rows = rows + row("Projected employees retained", retention.projected_employees_retained);
      rows = rows + row("Estimated savings from retention", money(retention.projected_savings_cad));
    }
    if (productivity) {
      rows = rows + row("Projected productive hours gained", productivity.projected_hours_gained);
      rows = rows + row("Estimated value of those hours", money(productivity.projected_value_cad));
    }

    const page =
      "<html><head><title>ROI and Engagement Report</title>" +
      "<style>body{font-family:Arial,sans-serif;padding:40px;color:#222}" +
      "table{border-collapse:collapse;width:100%;margin-top:20px}" +
      "td{border-bottom:1px solid #ddd;padding:10px}p{color:#555}</style></head><body>" +
      "<h1>ROI and Engagement Report</h1>" +
      "<p>" + escapeHtml(companyName) + " · " + new Date().toLocaleDateString("en-CA") + "</p>" +
      "<table>" + rows + "</table>" +
      "<p>Totals only. No individual employee can be identified. " +
      "Savings are estimates based on assumed rates, not measured results.</p>" +
      "</body></html>";

    const tab = window.open("", "_blank");
    if (!tab) {
      setReportMessage("Please allow pop-ups for this site to download the PDF.");
      return;
    }
    tab.document.write(page);
    tab.document.close();
    tab.print();
  }

  // Turn two-factor sign-in on or off for everyone in the company
  async function toggleTwoFactor() {
    setTwoFactorMessage("");
    try {
      const data = await apiRequest("PUT", "/api/two-factor/settings", { enabled: !twoFactorOn });
      setTwoFactorOn(data.enabled);
      setTwoFactorMessage(data.enabled
        ? "Two-factor sign-in is now on. Everyone will need a 6-digit code to sign in."
        : "Two-factor sign-in is now off.");
    } catch (err) {
      setTwoFactorMessage(err.message);
    }
  }

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
        {error && <p className="form-error">{error}</p>}
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
            <p className="muted-text">Review anonymous feedback from your company's wellness surveys.</p>
            <Link to="/surveys" className="text-button">View Surveys →</Link>
          </div>

          <div className="dashboard-card">
            <p className="card-label">TEAM</p>
            <h2>Manage Employees</h2>
            <p className="muted-text">Add, edit or deactivate employee accounts.</p>
            <Link to="/employee-management" className="text-button">Go to Employees →</Link>
          </div>
        </section>

        {/* Sprint 3: anonymous ROI and engagement report (story #20) */}
        <section className="dashboard-card" style={{ marginTop: "24px" }}>
          <p className="card-label">REPORT</p>
          <h2>ROI and Engagement Report</h2>
          <p className="muted-text">Totals only. No individual employee can be identified.</p>

          {reportMessage && <p className="muted-text">{reportMessage}</p>}

          {report && (
            <>
              <div className="event-stat">
                <strong>{report.event_participation_percent}%</strong>
                <span>joined at least one wellness event ({report.event_participants} of {report.employees})</span>
              </div>
              <div className="event-stat">
                <strong>{report.survey_participation_percent}%</strong>
                <span>answered a survey ({report.survey_respondents} of {report.employees})</span>
              </div>
              <div className="event-stat">
                <strong>{report.surveys}</strong>
                <span>surveys sent</span>
              </div>
              <div className="event-stat">
                <strong>{savings}</strong>
                <span>estimated yearly savings from better retention</span>
              </div>
            </>
          )}

          <div className="report-buttons">
            <button type="button" className="roi-download" onClick={downloadPdf}>
              Download PDF
            </button>
            <button type="button" className="roi-download" onClick={downloadCsv}>
              Download CSV (opens in Excel)
            </button>
          </div>
        </section>

        {/* Sprint 3: two-factor sign-in setting (story #1) */}
        <section className="dashboard-card" style={{ marginTop: "24px" }}>
          <p className="card-label">SECURITY</p>
          <h2>Two-Factor Sign-In</h2>
          <p className="muted-text">
            When this is on, everyone in your company needs a 6-digit code as well as their password to sign in.
          </p>
          <p><strong>Status: {twoFactorOn ? "On" : "Off"}</strong></p>
          {twoFactorMessage && <p className="muted-text">{twoFactorMessage}</p>}
          <button type="button" className="roi-download" onClick={toggleTwoFactor}>
            {twoFactorOn ? "Turn Off" : "Turn On"}
          </button>
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
