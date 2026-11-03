import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api';

// UpcomingEvents
// The next 3 wellness events for your company, from GET /api/events.
// Used on the Leader and Employee dashboards.
export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    apiRequest('GET', '/api/events')
      .then(data => setEvents(data.events));
  }, []);

  // keep only events that are still coming up, and show the first 3
  const upcoming = events
    .filter(event => event.status !== 'cancelled' && new Date(event.event_date) > new Date())
    .slice(0, 3);

  return (
    <>
      <div className="event-list">
        {upcoming.length === 0 && <p>No upcoming events right now.</p>}

        {upcoming.map(event => {
          const date = new Date(event.event_date);
          return (
            <div className="event-row" key={event.id}>
              <div className="event-date">
                <strong>{date.getDate()}</strong>
                <span>{date.toLocaleString('en-CA', { month: 'short' }).toUpperCase()}</span>
              </div>
              <div>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <Link to="/wellness-events" className="text-button">View All Events →</Link>
    </>
  );
}
