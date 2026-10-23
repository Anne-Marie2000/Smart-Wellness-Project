import Navbar from '../components/Navbar';

export default function ExecutiveDashboard() {
  const stats = [
    { title: 'Retention', value: '88%' },
    { title: 'Productivity', value: '81%' },
    { title: 'Participation', value: '76%' }
  ];

  const participation = [
    { month: 'July', value: 45 },
    { month: 'August', value: 60 },
    { month: 'September', value: 68 },
    { month: 'October', value: 76 }
  ];

  return (
    <main className="dashboard-page">
      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-heading">
          <h1>Executive Sponsor Dashboard</h1>
          <p>Overview of workplace wellness performance.</p>
        </div>

        <div className="company-stats">
          {stats.map(stat => (
            <div className="stat-card" key={stat.title}>
              <p>{stat.title}</p>
              <h2>{stat.value}</h2>
            </div>
          ))}
        </div>

        <div className="dashboard-card">
          <h2>Participation Trend</h2>

          <div
            className="chart-bars"
            role="img"
            aria-label="Participation: July 45%, August 60%, September 68%, October 76%"
          >
            {participation.map(item => (
              <div
                key={item.month}
                className="chart-bar"
                style={{ height: `${item.value}%` }}
                title={`${item.month}: ${item.value}%`}
              />
            ))}
          </div>

          <div className="chart-months">
            {participation.map(item => (
              <span key={item.month}>{item.month}</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
