import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { dashboardFor } from "../roles";
import { apiRequest, saveToken, getRole } from "../api";

// The backend checks the account and its role after sign in.
// Sprint 3: if two-factor sign-in is on, there is a second step where
// the person types the 6-digit code we sent them.
function SignIn() {
  const [email, setEmail] = useState("");
  const [smartId, setSmartId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // two-factor step
  const [challengeId, setChallengeId] = useState(null); // not null = show the code box
  const [code, setCode] = useState("");
  const [codeMessage, setCodeMessage] = useState("");

  const navigate = useNavigate();

  // Saves the login token and sends the person to the right dashboard
  function finishSignIn(token) {
    saveToken(token);
    navigate(dashboardFor(getRole()));
  }

  // Step 1: sends the email, Smart ID and password to the backend.
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await apiRequest("POST", "/api/auth/login", { email: email, smart_id: smartId, password: password });

      if (data.two_factor_required) {
        // Two-factor is on: show the code box instead of signing in
        setChallengeId(data.challenge_id);
        setCodeMessage(data.message);
        setSubmitting(false);
        return;
      }

      finishSignIn(data.token);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  // Step 2: sends the 6-digit code to the backend.
  const handleCode = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await apiRequest("POST", "/api/two-factor/verify", { challenge_id: challengeId, code: code });
      finishSignIn(data.token);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  // Go back to the first step (for example, if the code expired)
  function startOver() {
    setChallengeId(null);
    setCode("");
    setError("");
    setPassword("");
  }

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

          {/* Step 1: email, Smart ID and password */}
          {!challengeId && (
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
          )}

          {/* Step 2: the 6-digit code */}
          {challengeId && (
            <form className="sign-in-card" onSubmit={handleCode}>
              <p>{codeMessage}</p>

              <label>
                6-digit code
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength="6"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button type="submit" className="sign-in-button" disabled={submitting}>
                {submitting ? "CHECKING..." : "VERIFY CODE"}
              </button>

              <div className="forgot-password">
                <button type="button" className="text-button" onClick={startOver}>
                  Start over
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </>
  );
}

export default SignIn;
