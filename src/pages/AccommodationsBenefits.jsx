import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest } from '../api';

// Accommodations & Benefits 
// The benefits are saved in MySQL. 

export default function AccommodationsBenefits() {
  const [benefits, setBenefits] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState('');       

  // Get the benefits from the backend
  function loadBenefits() {
    apiRequest('GET', '/api/benefits')
      .then(data => setBenefits(data.benefits))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  // Load them once when the page opens
  useEffect(() => {
    loadBenefits();
  }, []);

  // Only keep the benefits that match the search box
  const matchingBenefits = benefits.filter(benefit =>
    `${benefit.title} ${benefit.category} ${benefit.description}`
      .toLowerCase().includes(search.toLowerCase())
  );

  // Make a list of the categories, so each category gets its own card
  const categories = [];
  matchingBenefits.forEach(benefit => {
    if (!categories.includes(benefit.category)) {
      categories.push(benefit.category);
    }
  });

  return (
    <main className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-heading">
          <p className="page-title">Workplace Services</p>
          <h1>Accommodations & Benefits</h1>
          <p>Explore workplace accommodations and wellness benefits available to employees.</p>
        </div>

        <div className="benefits-search">
          <label htmlFor="benefit-search">Search Benefits</label>
          <input
            id="benefit-search"
            type="search"
            placeholder="Search for a benefit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading && <p>Loading benefits...</p>}

        {error && (
          <div className="form-error">
            <p>{error}</p>
            <button type="button" onClick={() => { setError(''); loadBenefits(); }}>Try again</button>
          </div>
        )}

        {!loading && !error && benefits.length === 0 && (
          <p>No benefits have been added for your workplace yet.</p>
        )}

        {!loading && !error && benefits.length > 0 && matchingBenefits.length === 0 && (
          <p>No matching benefits found.</p>
        )}

        <div className="benefits-page-grid">
          {categories.map(category => (
            <div className="benefit-card" key={category}>
              <h2>{category}</h2>
              <ul>
                {matchingBenefits
                  .filter(benefit => benefit.category === category)
                  .map(benefit => (
                    <li key={benefit.id}>
                      <strong>{benefit.title}</strong>
                      <span>{benefit.description}</span>
                      {benefit.how_to_access && <span>How to get it: {benefit.how_to_access}</span>}
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
