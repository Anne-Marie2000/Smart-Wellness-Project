import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest, getToken } from '../api';

// Executive Sponsor Dashboard 
// Shows the prediction percentage of customers and productivity for the whole company.
// The numbers come from the backend.

function money(amount) {
  return '$' + Math.round(amount).toLocaleString('en-CA');
}

export default function ExecutiveDashboard() {
  const [retention, setRetention] = useState(null);
  const [productivity, setProductivity] = useState(null);
  const [error, setError] = useState('');

  // Get both sets of numbers once when the page opens
  useEffect(() => {
    apiRequest('GET', '/api/roi/retention')
      .then(data => setRetention(data))
      .catch(err => setError(err.message));

    apiRequest('GET', '/api/roi/productivity')
      .then(data => setProductivity(data))
      .catch(err => setError(err.message));
  }, []);

  // download the ROI report.
  // We use fetch (not a normal link) so we can send the login token with it.
  async function downloadReport() {
    const response = await fetch('/api/roi/export', {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    if (!response.ok) {
      setError('Could not download the report.');
      return;
    }
    // Turn the answer into a file and "click" a hidden link to save it
    const file = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = 'ROI-Report.csv';
    link.click();
  }

  return (
    <main className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-heading">
          <h1>Executive Sponsor Dashboard</h1>
          <p>Overview of workplace wellness performance.</p>
        </div>

        {error && <p className="form-error">{error}</p>}

        {retention && productivity && (
          <>
            <div className="company-stats">
              <div className="stat-card">
                <p>Participation</p>
                <h2>{retention.participation_rate_percent}%</h2>
              </div>

              <div className="stat-card">
                <p>Employees Kept (projected)</p>
                <h2>{retention.projected_employees_retained}</h2>
              </div>

              <div className="stat-card">
                <p>Retention Savings (projected)</p>
                <h2>{money(retention.projected_savings_cad)}</h2>
              </div>

              <div className="stat-card">
                <p>Productive Hours Gained (projected)</p>
                <h2>{productivity.projected_hours_gained}</h2>
              </div>
            </div>

            <div className="dashboard-card">
              <h2>ROI Report</h2>
              <p>
                {retention.participants} of {retention.employees} employees and leaders have joined
                a wellness event. Productivity value (projected): {money(productivity.projected_value_cad)}.
              </p>
              <p>{retention.basis}.</p>
              <button type="button" className="roi-download" onClick={downloadReport}>
                Download ROI Report
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
