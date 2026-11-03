import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest, saveToken } from "../api";

// Create Company Account - saves the company AND its administrator in MySQL.
//   POST /api/auth/register-company
// The person signing up becomes the Company Administrator and is signed in.
//
// The page has 4 steps:
//   1 = company information, 2 = primary contact,
//   3 = password,            4 = "Account Created"

function CompanyAccount() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Step 1 boxes
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");

  // Step 2 boxes
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Step 3 boxes
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // The Smart ID the backend makes for you (shown on step 4)
  const [newSmartId, setNewSmartId] = useState("");

  // NEXT button: go to the next step
  const nextStep = (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    setError("");
    setStep(step + 1);
  };

  // CREATE ACCOUNT button: check the passwords, then save everything
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
      // send everything to the backend, which saves it in MySQL
      const data = await apiRequest("POST", "/api/auth/register-company", {
        company_name: companyName,
        industry: industry,
        company_size: companySize,
        employee_count: Number(employeeCount), // "40" -> 40
        full_name: fullName,
        job_title: jobTitle,
        email: email,
        phone_number: phone,
        password: password,
      });

      saveToken(data.token); // signed in straight away
      setNewSmartId(data.smart_id); // your Smart ID, for signing in next time
      setStep(4);
    } catch (err) {
      // e.g. "An account with this email already exists"
      setError(err.message);
    }
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
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </label>

                <label>
                  Industry
                  <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} required />
                </label>

                <label>
                  Company Size
                  <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} required>
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
                  <input type="number" min="1" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} required />
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
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </label>

                <label>
                  Job Title
                  <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
                </label>

                <label>
                  Work Email
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>

                <label>
                  Phone Number
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </label>

                <button type="submit" className="next-button">
                  NEXT
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form className="setup-card" onSubmit={createAccount}>
              <div className="setup-card-title">
                <p>SECURITY SETUP</p>
              </div>

              <div className="setup-form">
                {/* the error message, only shown if there is one */}
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

          {step === 4 && (
            <div className="account-created-card">
              <div className="success-check">✓</div>

              <h2>Account Created</h2>

              <p>
                Your company account has been successfully created.
              </p>

              <p>
                Your Smart ID is <strong>{newSmartId}</strong>.
                Write it down. You need it with your email and password to sign in.
              </p>

              <Link to="/company-dashboard" className="dashboard-button">
                GO TO DASHBOARD
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default CompanyAccount;
