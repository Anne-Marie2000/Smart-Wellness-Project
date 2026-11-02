import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest, getRole } from '../api';

// Education Materials 
// Guides for employees and for managers, saved in MySQL.

export default function EducationMaterials() {
  const [tab, setTab] = useState('employee');
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState('');

  // Employees only see employee guides, so they don't get the Manager tab
  const showManagerTab = getRole() !== 'employee';

  // Get the guides for the chosen tab
  function loadMaterials(audience) {
    apiRequest('GET', `/api/resources?audience=${audience}`)
      .then(data => setMaterials(data.resources))
      .catch(err => setError(err.message));
  }

  // Load the Employee guides when the page opens
  useEffect(() => {
    loadMaterials('employee');
  }, []);

  function changeTab(newTab) {
    setTab(newTab);
    loadMaterials(newTab);
  }

  return (
    <main className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-heading">
          <h1>Education Materials</h1>
          <p>Plain-language guides on menopause, midlife health and workplace support.</p>
        </div>

        <div className="education-tabs">
          <button className={tab === 'employee' ? 'active' : ''} onClick={() => changeTab('employee')}>
            Employee
          </button>
          {showManagerTab && (
            <button className={tab === 'manager' ? 'active' : ''} onClick={() => changeTab('manager')}>
              Manager
            </button>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}
        {!error && materials.length === 0 && <p>No materials have been added yet.</p>}

        <div className="education-grid">
          {materials.map(material => (
            <div className="education-card" key={material.id}>
              <span>{material.category}</span>
              <h2>{material.title}</h2>
              <details>
                <summary>Read more</summary>
                <p>{material.body}</p>
              </details>
            </div>
          ))}
        </div>

        <p>This information is general and is not medical advice.</p>
      </div>
    </main>
  );
}
