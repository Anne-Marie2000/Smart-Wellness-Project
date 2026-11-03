import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, getRole, signOut } from "../api";
import { dashboardFor } from "../roles";

function Navbar() {
  const navigate = useNavigate();
  const role = getRole(); // null if nobody is signed in
  const [userName, setUserName] = useState("");

  // If someone is signed in, ask the backend for their real name
  // (GET /api/auth/me reads it from the users table in MySQL)
  useEffect(() => {
    if (getRole()) {
      apiRequest("GET", "/api/auth/me")
        .then(data => setUserName(data.full_name))
        .catch(() => setUserName(""));
    }
  }, []);

  function handleSignOut() {
    signOut();
    navigate("/sign-in");
  }

  return (
    <header className="navbar">
      <div className="nav-container">

        <Link to="/" className="logo">
          <img src="/smart-wellness-logo.png" alt="Smart Wellness Canada" />
        </Link>

        {role ? (
          <nav className="nav-links">
            <Link to={dashboardFor(role)}>Dashboard</Link>
            {role === "company_admin" && <Link to="/employee-management">Employees</Link>}
            <Link to="/wellness-events">Events</Link>
            {role !== "smart_wellness_admin" && <Link to="/accommodations-benefits">Benefits</Link>}
            <Link to="/education-materials">Education</Link>
          </nav>
        ) : (
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/coming-soon">Workplace Services</Link>
            <Link to="/coming-soon">Meal Plans & Coaching</Link>
            <Link to="/coming-soon">About</Link>
            <Link to="/coming-soon">Contact</Link>
          </nav>
        )}

        <div className="nav-actions">
          {role ? (
            <>
              {/* the signed-in person's real name */}
              <span className="nav-user">Hi, {userName}</span>

              <button type="button" className="nav-btn" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="nav-btn">
                Sign In
              </Link>

              <Link to="/coming-soon" className="nav-btn">
                Book a Demo
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
