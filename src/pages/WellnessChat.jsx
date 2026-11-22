import { useState } from 'react';
import Navbar from '../components/Navbar';
import { apiRequest } from '../api';

export default function WellnessChat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function sendMessage(e) {
    e.preventDefault();
    const question = message.trim();
    if (!question || loading) return;

    const history = messages.slice(-6).map(item => ({ role: item.role, content: item.content }));
    setMessages(previous => [...previous, { role: 'user', content: question }]);
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('POST', '/api/chat', { message: question, history });
      setMessages(previous => [...previous, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err.message);
      setMessage(question);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-heading">
          <p className="page-title">Workplace Wellness</p>
          <h1>Wellness Assistant</h1>
          <p>Ask questions about menopause, midlife health and general workplace wellness.</p>
        </div>

        <section className="chat-card" aria-label="Wellness assistant conversation">
          <div className="chat-messages" aria-live="polite">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <h2>How can I help today?</h2>
                <p>You can ask about symptoms, wellness habits or ways to find support at work.</p>
              </div>
            )}
            {messages.map((item, index) => (
              <div key={index} className={`chat-message ${item.role === 'user' ? 'chat-user' : 'chat-assistant'}`}>
                <strong>{item.role === 'user' ? 'You' : 'Wellness Assistant'}</strong>
                <p>{item.content}</p>
              </div>
            ))}
            {loading && <p className="chat-typing">Thinking...</p>}
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <form className="chat-form" onSubmit={sendMessage}>
            <label htmlFor="chat-message">Your message</label>
            <div className="chat-input-row">
              <textarea
                id="chat-message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your question here..."
                maxLength={1500}
                rows={2}
                required
              />
              <button type="submit" disabled={loading || !message.trim()}>
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </section>
        <p className="chat-note">This assistant provides general information, not medical advice. Please avoid sharing sensitive personal details. Messages are sent to an external AI provider to generate a response.</p>
      </div>
    </main>
  );
}
