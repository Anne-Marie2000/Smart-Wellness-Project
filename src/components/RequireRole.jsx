import { Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getRole } from '../api';

// The backend checks the role again on every request, its stops people from seeing a page they can not use.
export default function RequireRole({ roles, children }) {
  const role = getRole();

  if (!role) {
    return <Navigate to="/sign-in" />;
  }
  
  if (roles && !roles.includes(role)) {
    return (
      <main className="dashboard-page">
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-heading">
            <h1>No access</h1>
            <p> Your account type can not open this page.</p>
          </div>
        </div>
      </main>
    );
  }
  return children;
}
