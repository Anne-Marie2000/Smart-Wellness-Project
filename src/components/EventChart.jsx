import { useEffect, useState } from 'react';
import { apiRequest } from '../api';

// EventChart
// A bar chart of how many people joined each wellness event, from GET /api/events.
// Used on the Company and Leader dashboards.
export default function EventChart() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    apiRequest('GET', '/api/events')
      .then(data => setEvents(data.events));
  }, []);

  if (events.length === 0) {
    return <p className="muted-text">No events yet.</p>;
  }

  // the tallest bar is the event with the most people
  let most = 1;
  events.forEach(event => {
    if (event.registrations > most) {
      most = event.registrations;
    }
  });

  return (
    <div className="chart-placeholder">
      <div className="chart-bars">
        {events.map(event => (
          <div
            key={event.id}
            className="chart-bar"
            style={{ height: (event.registrations / most) * 100 + '%' }}
            title={event.title + ': ' + event.registrations + ' joined'}
          />
        ))}
      </div>
      <div className="chart-months">
        {events.map(event => (
          <span key={event.id}>
            {new Date(event.event_date).toLocaleString('en-CA', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
    </div>
  );
}
