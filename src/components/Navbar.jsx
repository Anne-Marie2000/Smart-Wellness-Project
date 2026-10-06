import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-container">

        <Link to="/" className="logo">
          <img src="/smart-wellness-logo.png" alt="Smart Wellness Canada" />
        </Link>

        <nav className="nav-links">
          <a href="#">Home</a>
          <a href="#">Workplace Services</a>
          <a href="#">Meal Plans & Coaching</a>
          <a href="#">About</a>
          <a href="#">Contact</a>
        </nav>

        <div className="nav-actions">
          <Link to="/sign-in" className="nav-btn">
            Sign In
          </Link>

          <a href="#" className="nav-btn">
            Book a Demo
          </a>
        </div>

      </div>
    </header>
  );
}

export default Navbar;