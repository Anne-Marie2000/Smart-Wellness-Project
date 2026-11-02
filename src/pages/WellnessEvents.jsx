import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest, getRole } from '../api';

// Wellness Events (User Story 17)
// - Smart Wellness Admins can create, edit and cancel events 
// - Employees and leaders can join events 

const emptyForm = { title: '', date: '', description: '' };

function showDate(date) {
  return new Date(date).toLocaleString('en-CA', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });
}

export default function WellnessEvents() {
  const role = getRole();
  const isAdmin = role === 'smart_wellness_admin';         
  const canJoin = role === 'employee' || role === 'leader';

  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Smart Wellness Admins work with many companies, so they choose which one
  const [companyId, setCompanyId] = useState('1');

  // Get the events from the backend.
  // Admins have to say which company; everyone else gets their own company's events.
  function loadEvents(company) {
    const url = getRole() === 'smart_wellness_admin' ? `/api/events?company_id=${company}` : '/api/events';

    apiRequest('GET', url)
      .then(data => {
        setEvents(data.events);
        setError('');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }

  // Load the events once when the page opens
  useEffect(() => {
    loadEvents('1');
  }, []);

  // Create a new event, or save changes to an existing one
  async function saveEvent(e) {
    e.preventDefault();
    setError('');

    const details = {
      title: form.title.trim(),
      event_date: form.date,
      description: form.description.trim()
    };

    try {
      if (editingId !== null) {
        await apiRequest('PUT', `/api/events/${editingId}`, details);
      } else {
        details.company_id = Number(companyId);
        await apiRequest('POST', '/api/events', details);
      }
      resetForm();
      loadEvents(companyId);
    } catch (err) {
      setError(err.message);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  // Fill the form with this event's details so they can be changed
  function editEvent(event) {
    setEditingId(event.id);
    setForm({
      title: event.title,
      date: event.event_date.slice(0, 16), 
      description: event.description || ''
    });
  }

  async function cancelEvent(event) {
    if (!window.confirm(`Are you sure you want to cancel "${event.title}"?`)) {
      return;
    }
    try {
      await apiRequest('POST', `/api/events/${event.id}/cancel`);
      loadEvents(companyId);
    } catch (err) {
      setError(err.message);
    }
  }

  async function joinEvent(event) {
    try {
      await apiRequest('POST', `/api/events/${event.id}/join`);
      loadEvents(companyId);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="dashboard-page">
      <Navbar />
      <div className="dashboard-container wellness-page">
        <div className="dashboard-heading">
          <p className="page-title">Workplace Wellness</p>
          <h1>Wellness Events</h1>
          <p>Explore and manage upcoming wellness activities.</p>
        </div>

        {isAdmin && (
          <div className="employee-tools">
            <label htmlFor="company-id">Company ID</label>
            <input
              id="company-id"
              type="number"
              min="1"
              value={companyId}
              onChange={e => setCompanyId(e.target.value)}
            />
            <button type="button" className="roi-download" onClick={() => loadEvents(companyId)}>Show Events</button>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}
        {loading && <p>Loading events...</p>}
        {!loading && events.length === 0 && <p>There are no wellness events yet.</p>}

        <div className="events-list">
          {events.map(event => {
            const isCancelled = event.status === 'cancelled';
            const isPast = new Date(event.event_date) < new Date();

            return (
              <div className="wellness-event-card" key={event.id}>
                <div className="wellness-event-info">
                  <span className="wellness-event-date">{showDate(event.event_date)}</span>
                  <h2>{event.title}</h2>
                  <p>{event.description}</p>
                  <span className="wellness-event-status">
                    {isCancelled ? 'Cancelled' : isPast ? 'Past event' : 'Scheduled'}
                    {' · '}{event.registrations} joined
                  </span>
                </div>

                {!isCancelled && !isPast && (
                  <div className="wellness-event-buttons">
                    {canJoin && (
                      event.joined
                        ? <span>You joined this event</span>
                        : <button onClick={() => joinEvent(event)}>Join Event</button>
                    )}
                    {isAdmin && (
                      <>
                        <button onClick={() => editEvent(event)}>Edit</button>
                        <button onClick={() => cancelEvent(event)}>Cancel Event</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isAdmin && (
          <form className="wellness-form" onSubmit={saveEvent}>
            <h2>{editingId !== null ? 'Edit Event' : 'Create Wellness Event'}</h2>
            <div className="wellness-form-grid">
              <div className="wellness-field">
                <label htmlFor="event-title">Event Name</label>
                <input id="event-title" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="wellness-field">
                <label htmlFor="event-date">Date and Time</label>
                <input id="event-date" type="datetime-local" value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })} required />
              </div>

              <div className="wellness-field wellness-full">
                <label htmlFor="event-description">Description (where, and what to expect)</label>
                <input id="event-description" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            <div className="wellness-form-buttons">
              <button type="submit">
                {editingId !== null ? 'Save Changes' : 'Create Event'}
              </button>
              {editingId !== null && (
                <button type="button" onClick={resetForm}>Cancel Editing</button>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
