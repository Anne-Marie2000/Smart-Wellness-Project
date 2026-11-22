import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { dashboardFor } from "../roles";
import { apiRequest, saveToken, getRole } from "../api";

// The backend checks the account and its role after sign in.
function SignIn() {
  const [email, setEmail] = useState("");
  const [smartId, setSmartId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Sends the email, Smart ID and password to the backend.
  // If all three are correct, the backend sends back a login token.
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await apiRequest("POST", "/api/auth/login", { email: email, smart_id: smartId, password: password });
      saveToken(data.token);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }

    // Send the person to the right dashboard using their account role.
    const accountRole = getRole();
    navigate(dashboardFor(accountRole));
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
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Smart ID
              <input
                type="text"
                value={smartId}
                onChange={(e) => setSmartId(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <div className="forgot-password">
              <Link to="/forgot-smart-id">Forgot Smart ID?</Link>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="sign-in-button" disabled={submitting}>
              {submitting ? "SIGNING IN..." : "SIGN IN"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

export default SignIn;
