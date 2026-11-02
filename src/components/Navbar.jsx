import { Link, useNavigate } from "react-router-dom";
import { getRole, signOut } from "../api";
import { dashboardFor } from "../roles";

function Navbar() {
  const navigate = useNavigate();
  const role = getRole(); // null if nobody is signed in

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
            <a href="#">Home</a>
            <a href="#">Workplace Services</a>
            <a href="#">Meal Plans & Coaching</a>
            <a href="#">About</a>
            <a href="#">Contact</a>
          </nav>
        )}

        <div className="nav-actions">
          {role ? (
            <button type="button" className="nav-btn" onClick={handleSignOut}>
              Sign Out
            </button>
          ) : (
            <>
              <Link to="/sign-in" className="nav-btn">
                Sign In
              </Link>

              <a href="#" className="nav-btn">
                Book a Demo
              </a>
            </>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
