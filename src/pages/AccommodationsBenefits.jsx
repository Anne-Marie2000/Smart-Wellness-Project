import { useState } from 'react';

export default function AccommodationsBenefits() {
  const [search, setSearch] = useState('');

  const benefits = {
    'Workplace Accommodations': [
      'Flexible work hours',
      'Remote work options',
      'Ergonomic workspaces',
      'Private wellness rooms'
    ],
    'Health & Wellness': [
      'Mental health support',
      'Wellness coaching',
      'Fitness programs',
      'Health education'
    ],
    'Leave & Support': [
      'Medical appointment leave',
      'Personal wellness days',
      'Employee assistance programs'
    ]
  };

  const filteredBenefits = Object.entries(benefits)
    .map(([category, items]) => ({
      category,
      items: items.filter(item =>
        item.toLowerCase().includes(search.toLowerCase()) ||
        category.toLowerCase().includes(search.toLowerCase())
      )
    }))
    .filter(group => group.items.length > 0);

  return (
    <main className="dashboard-page">
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

        <div className="benefits-page-grid">
          {filteredBenefits.map(group => (
            <div className="benefit-card" key={group.category}>
              <h2>{group.category}</h2>
              <ul>
                {group.items.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {filteredBenefits.length === 0 && (
          <p>No matching benefits found.</p>
        )}
      </div>
    </main>
  );
}
