import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { apiRequest, saveToken } from "../api";

// Create Company Account - saves the company AND its administrator in MySQL.
//   POST /api/auth/register-company
// The person signing up becomes the Company Administrator and is signed in.

function CompanyAccount() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  // Everything typed into the 3 steps, kept in one object
  const [form, setForm] = useState({
    companyName: "", industry: "", companySize: "", employeeCount: "",
    fullName: "", jobTitle: "", email: "", phone: "",
    password: "", confirmPassword: ""
  });

  const nextStep = (e) => {
    e.preventDefault();
    setError("");
    setStep(step + 1);
  };

  // Step 3: check the passwords, then save everything
  const createAccount = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("The passwords don't match.");
      return;
    }

    try {
      const data = await apiRequest("POST", "/api/auth/register-company", {
        company_name: form.companyName,
        industry: form.industry,
        company_size: form.companySize,
        employee_count: Number(form.employeeCount),
        full_name: form.fullName,
        job_title: form.jobTitle,
        email: form.email,
        phone_number: form.phone,
        password: form.password,
      });
      // signed in straight away
      saveToken(data.token); 
      setStep(4);
    } catch (err) {
      setError(err.message); // e.g. "An account with this email already exists"
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
                  <input type="text" value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })} required />
                </label>

                <label>
                  Industry
                  <input type="text" value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })} required />
                </label>

                <label>
                  Company Size
                  <select value={form.companySize}
                    onChange={(e) => setForm({ ...form, companySize: e.target.value })} required>
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
                  <input type="number" min="1" value={form.employeeCount}
                    onChange={(e) => setForm({ ...form, employeeCount: e.target.value })} required />
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
                  <input type="text" value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                </label>

                <label>
                  Job Title
                  <input type="text" value={form.jobTitle}
                    onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} required />
                </label>

                <label>
                  Work Email
                  <input type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </label>

                <label>
                  Phone Number
                  <input type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
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
                {error && <p className="form-error">{error}</p>}

                <label>
                  Password (at least 8 characters)
                  <input type="password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </label>

                <label>
                  Confirm Password
                  <input type="password" value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
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
