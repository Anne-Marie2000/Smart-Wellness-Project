import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function WellnessEvents() {
  const [events, setEvents] = useState([
    { id: 1, title: 'Morning Yoga', date: '2026-11-05', location: 'Wellness Room', joined: false, cancelled: false },
    { id: 2, title: 'Stress Management Workshop', date: '2026-11-12', location: 'Conference Room', joined: false, cancelled: false }
  ]);

  const [form, setForm] = useState({ title: '', date: '', location: '' });
  const [editingId, setEditingId] = useState(null);

  function saveEvent(e) {
    e.preventDefault();
    const title = form.title.trim();
    const location = form.location.trim();

    if (!title || !form.date || !location) {
      alert('Please fill in all fields.');
      return;
    }

    if (editingId !== null) {
      setEvents(events.map(event =>
        event.id === editingId ? { ...event, title, date: form.date, location } : event
      ));
    } else {
      setEvents([...events, {
        id: Date.now(), title, date: form.date, location, joined: false, cancelled: false
      }]);
    }
    resetForm();
  }

  function resetForm() {
    setForm({ title: '', date: '', location: '' });
    setEditingId(null);
  }

  function editEvent(event) {
    setEditingId(event.id);
    setForm({ title: event.title, date: event.date, location: event.location });
  }

  function cancelEvent(id) {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      setEvents(events.map(event =>
        event.id === id ? { ...event, cancelled: true } : event
      ));
      if (editingId === id) resetForm();
    }
  }

  function joinEvent(id) {
    setEvents(events.map(event =>
      event.id === id ? { ...event, joined: !event.joined } : event
    ));
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

        <div className="events-list">
          {events.map(event => (
            <div className="wellness-event-card" key={event.id}>
              <div className="wellness-event-info">
                <span className="wellness-event-date">{event.date}</span>
                <h2>{event.title}</h2>
                <p>{event.location}</p>
                <span className="wellness-event-status">
                  {event.cancelled ? 'Cancelled' : 'Scheduled'}
                </span>
              </div>

              {!event.cancelled && (
                <div className="wellness-event-buttons">
                  <button onClick={() => joinEvent(event.id)}>
                    {event.joined ? 'Leave Event' : 'Join Event'}
                  </button>
                  <button onClick={() => editEvent(event)}>Edit</button>
                  <button onClick={() => cancelEvent(event.id)}>Cancel Event</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <form className="wellness-form" onSubmit={saveEvent}>
          <h2>{editingId !== null ? 'Edit Event' : 'Create Wellness Event'}</h2>
          <div className="wellness-form-grid">
            <div className="wellness-field">
              <label htmlFor="event-title">Event Name</label>
              <input id="event-title" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div className="wellness-field">
              <label htmlFor="event-date">Date</label>
              <input id="event-date" type="date" value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })} required />
            </div>

            <div className="wellness-field wellness-full">
              <label htmlFor="event-location">Location</label>
              <input id="event-location" value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })} required />
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
      </div>
    </main>
  );
}
