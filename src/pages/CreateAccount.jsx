import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

//choosing an account type
function CreateAccount() {
  return (
    <>
      <Navbar />

      <main className="create-account-page">
        <div className="create-account-container">
          <p className="page-title">Create Your Account</p>

          <h1 className="create-heading">
            Join <span>Smart Wellness Canada</span> and access your
            personalized wellness experience.
          </h1>

          <p className="account-type-text">Choose your account type:</p>

          <div className="account-cards">
            <div className="account-card">
              <h2>Company Account</h2>

              <p>
                For HR &amp; organizations
                <br />
                Manage workplace wellness programs.
              </p>

              <Link to="/create-company">
                Create Account <span>→</span>
              </Link>
            </div>

            <div className="account-card">
              <h2>Leader Account</h2>

              <p>
                For managers &amp; HR leaders
                <br />
                Access tools, events, and guides.
              </p>

              <Link to="/create-leader">
                Create Account <span>→</span>
              </Link>
            </div>

            <div className="account-card">
              <h2>Employee Account</h2>

              <p>
                For invited employees
                <br />
                Access resources, benefits, and support.
              </p>

              <Link to="/create-employee">
                Activate Account <span>→</span>
              </Link>
            </div>
          </div>

          <div className="already-account">
            <p>Already have an account?</p>
            <Link to="/sign-in">Sign In</Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default CreateAccount;
