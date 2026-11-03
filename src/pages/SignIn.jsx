import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ROLES, ROLE_INFO, dashboardFor } from "../roles";
import { apiRequest, saveToken, getRole, signOut } from "../api";

//Role buttons come from src/roles.js
const signInRoles = Object.entries(ROLE_INFO).filter(([, info]) => info.showOnSignIn);

//Signs in to a specific role on goes to the roles dashboard,
// so a new role only has to be added there
function SignIn() {
  const [role, setRole] = useState(ROLES.COMPANY_ADMIN);
  const [email, setEmail] = useState("");
  const [smartId, setSmartId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Sends the email, Smart ID and password to the backend.
  // If all three are correct, the backend sends back a login token.
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await apiRequest("POST", "/api/auth/login", { email: email, smart_id: smartId, password: password });
      saveToken(data.token);
    } catch (err) {
      setError(err.message);
      return;
    }

    // The token says what kind of account this really is
    const accountRole = getRole();

    // Check they clicked the right account type button
    if (ROLE_INFO[accountRole].showOnSignIn && accountRole !== role) {
      signOut();
      setError("This is a " + ROLE_INFO[accountRole].label + " account. Please choose that button above.");
      return;
    }

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
            <p className="role-label">Choose your account type</p>

          <div className="role-buttons">
            {signInRoles.map(([key, info]) => (
              <button
                key={key}
                type="button"
                className={role === key ? "role-button active" : "role-button"}
                onClick={() => setRole(key)}
                >
                {info.label}
                </button>
              ))}
          </div>

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
              <a href="#">Forgot Password?</a>
            </div>

            {error && <p className="form-error">{error}</p>}

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
