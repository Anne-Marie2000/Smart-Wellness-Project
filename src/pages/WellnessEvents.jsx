import { useState } from 'react';

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
        event.id === editingId
          ? { ...event, title, date: form.date, location }
          : event
      ));
    } else {
      setEvents([...events, {
        id: Date.now(),
        title,
        date: form.date,
        location,
        joined: false,
        cancelled: false
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
    setForm({
      title: event.title,
      date: event.date,
      location: event.location
    });
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
      <div className="dashboard-container">
        <div className="dashboard-heading">
          <h1>Wellness Events</h1>
          <p>Explore and manage upcoming wellness activities.</p>
        </div>

        <div className="events-list">
          {events.map(event => (
            <div className="wellness-event-card" key={event.id}>
              <h2>{event.title}</h2>
              <p>Date: {event.date}</p>
              <p>Location: {event.location}</p>
              <p>Status: {event.cancelled ? 'Cancelled' : 'Scheduled'}</p>

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

        <form className="employee-form" onSubmit={saveEvent}>
          <h2>{editingId !== null ? 'Edit Event' : 'Create Event'}</h2>

          <label htmlFor="event-title">Event Name</label>
          <input
            id="event-title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />

          <label htmlFor="event-date">Date</label>
          <input
            id="event-date"
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
          />

          <label htmlFor="event-location">Location</label>
          <input
            id="event-location"
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
            required
          />

          <div className="employee-form-buttons">
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
