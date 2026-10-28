import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ROLES, ROLE_INFO, dashboardFor } from "../roles";

//Role buttons come from src/roles.js
const signInRoles = Object.entries(ROLE_INFO).filter(([, info]) => info.showOnSignIn);

//Signs in to a specific role on goes to the roles dashboard,
// so a new role only has to be added there
function SignIn() {
  const [role, setRole] = useState(ROLES.COMPANY_ADMIN);
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate(dashboardFor(role));
  };

  return (
    <>
      <Navbar />

      <main className="sign-in-page">
        <div className="sign-in-container">
          <p className="page-title">Sign In</p>

          <h1>Welcome back.</h1>

          <p className="sign-in-intro">
            Sign in to access your Smart Wellness account.
          </p>

          <form className="sign-in-card" onSubmit={handleSignIn}>
            <p> className="role-label">Choose your account type</p>

          <div className="role-buttons">
            {signInRoles.map(([key, info]) => {
              <button
                key={key}
                type="button"
                className={role === key ? "role-button active" : "role-button"}
                onClick={() => setRole(key)}
                >
                {infro.label}
                </button>
              ))}
          </div>
            
            <label>
              Email
              <input type="email" required />
            </label>

            <label>
              Smart ID
              <input type="text" required />
            </label>

            <label>
              Password
              <input type="password" required />
            </label>

            <div className="forgot-password">
              <a href="#">Forgot Password?</a>
            </div>

            <button type="submit" className="sign-in-button">
              SIGN IN
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default SignIn;
