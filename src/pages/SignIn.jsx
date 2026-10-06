import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";


//Signs in to a specific role on goes to the roles dashboard
function SignIn() {
  const [role, setRole] = useState("company");
  const navigate = useNavigate();

  const handleSignIn = (e) => {
    e.preventDefault();

    if (role === "company") {
      navigate("/company-dashboard");
    } else if (role === "leader") {
      navigate("/leader-dashboard");
    } else {
      navigate("/employee-dashboard");
    }
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
            <p className="role-label">Choose your account type</p>

            <div className="role-buttons">
              <button
                type="button"
                className={role === "company" ? "role-button active" : "role-button"}
                onClick={() => setRole("company")}
              >
                Company
              </button>

              <button
                type="button"
                className={role === "leader" ? "role-button active" : "role-button"}
                onClick={() => setRole("leader")}
              >
                Leader
              </button>

              <button
                type="button"
                className={role === "employee" ? "role-button active" : "role-button"}
                onClick={() => setRole("employee")}
              >
                Employee
              </button>
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
