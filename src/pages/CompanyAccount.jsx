import { useState } from "react";
import Navbar from "../components/Navbar";

function CompanyAccount() {
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
          <p className="page-title">Create Company Account</p>

          <h1>Set up your workplace wellness account.</h1>
          <p className="setup-intro">
            Complete your organization details to get started.
          </p>

          {step === 1 && (
            <form className="setup-card" onSubmit={nextStep}>
              <div className="setup-card-title">
                <p>COMPANY INFORMATION</p>
              </div>

              <div className="setup-form">
                <label>
                  Company Name
                  <input type="text" required />
                </label>

                <label>
                  Industry
                  <input type="text" required />
                </label>

                <label>
                  Company Size
                  <select required defaultValue="">
                    <option value="" disabled>
                      Select company size
                    </option>
                    <option>1 - 50 employees</option>
                    <option>51 - 100 employees</option>
                    <option>101 - 250 employees</option>
                    <option>251 - 500 employees</option>
                    <option>500+ employees</option>
                  </select>
                </label>

                <label>
                  Number of Employees
                  <input type="number" min="1" required />
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
                <p>PRIMARY CONTACT</p>
              </div>

              <div className="setup-form">
                <label>
                  Full Name
                  <input type="text" required />
                </label>

                <label>
                  Job Title
                  <input type="text" required />
                </label>

                <label>
                  Work Email
                  <input type="email" required />
                </label>

                <label>
                  Phone Number
                  <input type="tel" required />
                </label>

                <button type="submit" className="next-button">
                  NEXT
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
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

          {step === 4 && (
            <div className="account-created-card">
              <div className="success-check">✓</div>

              <h2>Account Created</h2>

              <p>
                Your company account has been successfully created.
              </p>

              <a href="/company-dashboard" className="dashboard-button">
                GO TO DASHBOARD
              </a>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default CompanyAccount;