import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function EducationMaterials() {
  const [tab, setTab] = useState('Employee');

  const materials = [
    {
      title: 'Managing Workplace Stress',
      category: 'Mental Health',
      description: 'Tips for handling stress and maintaining a healthy work-life balance.',
      roles: ['Employee', 'Manager']
    },
    {
      title: 'Healthy Workplace Habits',
      category: 'Wellness',
      description: 'Simple ways to stay healthy throughout the workday.',
      roles: ['Employee', 'Manager']
    },
    {
      title: 'Supporting Your Team',
      category: 'Leadership',
      description: 'Guidance for managers supporting employee wellness.',
      roles: ['Manager']
    },
    {
      title: 'Workplace Accommodations Guide',
      category: 'Workplace Support',
      description: 'Information about workplace accommodations and available support.',
      roles: ['Employee', 'Manager']
    }
  ];

  const filteredMaterials = materials.filter(material => material.roles.includes(tab));

  return (
    <main className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-heading">
          <h1>Education Materials</h1>
          <p>Explore resources to support workplace wellness.</p>
        </div>

        <div className="education-tabs">
          <button className={tab === 'Employee' ? 'active' : ''}
            onClick={() => setTab('Employee')} aria-pressed={tab === 'Employee'}>
            Employee
          </button>
          <button className={tab === 'Manager' ? 'active' : ''}
            onClick={() => setTab('Manager')} aria-pressed={tab === 'Manager'}>
            Manager
          </button>
        </div>

        <div className="education-grid">
          {filteredMaterials.map(material => (
            <div className="education-card" key={material.title}>
              <span>{material.category}</span>
              <h2>{material.title}</h2>
              <p>{material.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
