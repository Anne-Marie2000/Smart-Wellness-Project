import { useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest } from '../api';

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function sendMessage(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    setSent(false);
    try {
      await apiRequest('POST', '/api/contact', form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="dashboard-page">
      <Navbar />
      <div className="dashboard-container contact-layout">
        <section className="dashboard-heading">
          <p className="page-title">Get In Touch</p>
          <h1>Contact Smart Wellness</h1>
          <p>Have a question about your workplace wellness program? Send us a message.</p>
        </section>
        <form className="wellness-form contact-form" onSubmit={sendMessage}>
          <div className="wellness-form-grid">
            <div className="wellness-field">
              <label htmlFor="contact-name">Full Name</label>
              <input id="contact-name" required maxLength={120} value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="wellness-field">
              <label htmlFor="contact-email">Email Address</label>
              <input id="contact-email" type="email" required maxLength={255} value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="wellness-field wellness-full">
              <label htmlFor="contact-subject">Subject</label>
              <input id="contact-subject" required maxLength={150} value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="wellness-field wellness-full">
              <label htmlFor="contact-message">Message</label>
              <textarea id="contact-message" rows="6" required maxLength={3000} value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })} />
            </div>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          {sent && <p className="form-success" role="status">Your message has been sent. Thank you!</p>}
          <div className="wellness-form-buttons">
            <button type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
