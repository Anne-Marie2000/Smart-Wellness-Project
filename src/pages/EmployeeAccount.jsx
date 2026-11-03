import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest, saveToken } from "../api";

// Create Employee Account - saves the account in MySQL.
// The Smart ID code (given by the company) tells the backend which company
// the new person belongs to. A wrong or already-used code is refused.
//   POST /api/auth/register

function EmployeeAccount() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [smartId, setSmartId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Step 1 -> Step 2
  const nextStep = (e) => {
    e.preventDefault();
    setError("");
    setStep(2);
  };

  // Step 2: check the passwords, then save the account
  const createAccount = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords don't match.");
      return;
    }

    try {
      const data = await apiRequest("POST", "/api/auth/register", {
        full_name: fullName,
        smart_id_code: smartId,
        email: email,
        password: password,
      });
      // signed in straight away
      saveToken(data.token); 
      setStep(3);
    } catch (err) {
      // e.g. "Invalid Smart ID code" - go back to step 1 so they can fix it
      setError(err.message);
      setStep(1);
    }
  };

  return (
    <>
      <Navbar />

      <main className="account-setup-page">
        <div className="account-setup-container">
          <p className="page-title">Create Employee Account</p>

          <h1>Set up your employee account.</h1>

          <p className="setup-intro">
            Enter your information to access your wellness benefits.
          </p>

          {step === 1 && (
            <form className="setup-card" onSubmit={nextStep}>
              <div className="setup-card-title">
                <p>EMPLOYEE INFORMATION</p>
              </div>

              <div className="setup-form">
                {error && <p className="form-error">{error}</p>}

                <label>
                  Full Name
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </label>

                <label>
                  Smart ID
                  <input type="text" value={smartId} onChange={(e) => setSmartId(e.target.value)} required />
                </label>

                <label>
                  Company Name
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </label>

                <label>
                  Work Email
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>

                <button type="submit" className="next-button">
                  NEXT
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="setup-card" onSubmit={createAccount}>
              <div className="setup-card-title">
                <p>SECURITY SETUP</p>
              </div>

              <div className="setup-form">
                {error && <p className="form-error">{error}</p>}

                <label>
                  Password (at least 8 characters)
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>

                <label>
                  Confirm Password
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </label>

                <div className="security-consent">
                  <h3>Security &amp; Consent</h3>

                  <label className="checkbox-row">
                    <input type="checkbox" required />
                    <span>
                      I agree to the Terms of Service and Privacy Policy.
                    </span>
                  </label>
                </div>

                <button type="submit" className="next-button">
                  CREATE ACCOUNT
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="account-created-card">
              <div className="success-check">✓</div>

              <h2>Account Created</h2>


              <p>
                Your Smart ID is <strong>{smartId}</strong>.
                Keep it. You need it with your email and password to sign in.
              </p>

              <Link to="/employee-dashboard" className="dashboard-button">
                GO TO DASHBOARD
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default EmployeeAccount;
