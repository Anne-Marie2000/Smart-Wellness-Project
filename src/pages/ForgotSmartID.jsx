import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest } from "../api";

// Forgot Smart ID page.
// The person types their email and password. If both are right, the backend
// looks up their Smart ID in MySQL and sends it back, and we show it.
//   POST /api/auth/forgot-smart-id

function ForgotSmartId() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [smartId, setSmartId] = useState(""); 
  const [error, setError] = useState("");

  // FIND MY SMART ID button
  const findSmartId = async (e) => {
    e.preventDefault();
    setError("");
    setSmartId("");

    try {
      const data = await apiRequest("POST", "/api/auth/forgot-smart-id", {
        email: email,
        password: password,
      });
      setSmartId(data.smart_id);
    } catch (err) {
      // e.g. "Invalid email or password"
      setError(err.message);
    }
  };

  return (
    <>
      <Navbar />

      <main className="sign-in-page">
        <div className="sign-in-container">
          <p className="page-title">Forgot Smart ID</p>

          <h1>Find your Smart ID.</h1>

          <p className="sign-in-intro">
            Enter your email and password and we'll show you your Smart ID.
          </p>

          <form className="sign-in-card" onSubmit={findSmartId}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>

            {error && <p className="form-error">{error}</p>}

            {smartId && (
              <p className="new-code">
                Your Smart ID is <strong>{smartId}</strong>
              </p>
            )}

            <button type="submit" className="sign-in-button">
              FIND MY SMART ID
            </button>

            <p className="forgot-password" style={{ marginTop: "18px", textAlign: "center" }}>
              <Link to="/sign-in">Back to Sign In</Link>
            </p>
          </form>
        </div>
      </main>
    </>
  );
}

export default ForgotSmartId;
