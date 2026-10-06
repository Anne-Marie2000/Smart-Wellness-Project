import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateAccount from "./pages/CreateAccount";
import CompanyAccount from "./pages/CompanyAccount";
import LeaderAccount from "./pages/LeaderAccount";
import EmployeeAccount from "./pages/EmployeeAccount";
import SignIn from "./pages/SignIn";
import CompanyDashboard from "./pages/CompanyDashboard";
import LeaderDashboard from "./pages/LeaderDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateAccount />} />
        <Route path="/create-account" element={<CreateAccount />} />

        <Route path="/create-company" element={<CompanyAccount />} />
        <Route path="/create-leader" element={<LeaderAccount />} />
        <Route path="/create-employee" element={<EmployeeAccount />} />

        <Route path="/sign-in" element={<SignIn />} />

        <Route path="/company-dashboard" element={<CompanyDashboard />} />
        <Route path="/leader-dashboard" element={<LeaderDashboard />} />
        <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;