import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

// Coming Soon
// Buttons for features that haven't been built yet (wallet, AI assistant,
// surveys...) open this page, so no button on the site does nothing.
export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <main className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-heading">
          <p className="page-title">Coming soon</p>
          <h1>This feature is coming soon.</h1>
          <p>It hasn't been built yet. It is planned for a future sprint.</p>
        </div>
        {/* navigate(-1) goes back to the page you came from */}
        <button type="button" className="roi-download" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    </main>
  );
}
