
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

  return (
    <div className="dashboard-page">
      <h1>Accommodations & Benefits</h1>
      <p>Explore available workplace accommodations and wellness benefits.</p>

      <input
        type="search"
        placeholder="Search benefits..."
        aria-label="Search benefits"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="benefits-grid">
        {Object.entries(benefits).map(([category, items]) => {
          const filtered = items.filter(item =>
            item.toLowerCase().includes(search.toLowerCase()) ||
            category.toLowerCase().includes(search.toLowerCase())
          );

          if (filtered.length === 0) return null;

          return (
            <div className="benefit-card" key={category}>
              <h2>{category}</h2>
              <ul>
                {filtered.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
