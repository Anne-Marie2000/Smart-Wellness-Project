import { useState } from "react";
import Navbar from "../components/Navbar";

function EmployeeAccount() {
  const [step, setStep] = useState(1);

  const nextStep = (e) => {
    e.preventDefault();
    setStep(step + 1);
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
                <label>
                  Full Name
                  <input type="text" required />
                </label>

                <label>
                  Smart ID
                  <input type="text" required />
                </label>

                <label>
                  Company Name
                  <input type="text" required />
                </label>

                <label>
                  Work Email
                  <input type="email" required />
                </label>

                <button type="submit" className="next-button">
                  NEXT
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form className="setup-card" onSubmit={nextStep}>
              <div className="setup-card-title">
                <p>SECURITY SETUP</p>
              </div>

              <div className="setup-form">
                <label>
                  Password
                  <input type="password" required />
                </label>

                <label>
                  Confirm Password
                  <input type="password" required />
                </label>

                <label>
                  Alternate Email
                  <input type="email" />
                </label>

                <div className="security-consent">
                  <h3>Security &amp; Consent</h3>

                  <label className="checkbox-row">
                    <input type="checkbox" />
                    <span>Enable Two-Factor Authentication</span>
                  </label>

                  <label className="checkbox-row">
                    <input type="checkbox" required />
                    <span>
                      I agree to the Terms of Service and Privacy Policy.
                    </span>
                  </label>
                </div>

                <button type="submit" className="next-button">
                  NEXT
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="account-created-card">
              <div className="success-check">✓</div>

              <h2>Account Created</h2>

              <p>
                Your employee account has been successfully created.
              </p>

              <a href="/employee-dashboard" className="dashboard-button">
                GO TO DASHBOARD
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default EmployeeAccount;