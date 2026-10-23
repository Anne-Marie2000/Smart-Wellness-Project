
import { BrowserRouter, Routes, Route } from "react-router-dom";

//the pages and their addresses
import CreateAccount from "./pages/CreateAccount";
import CompanyAccount from "./pages/CompanyAccount";
import LeaderAccount from "./pages/LeaderAccount";
import EmployeeAccount from "./pages/EmployeeAccount";
import SignIn from "./pages/SignIn";
import CompanyDashboard from "./pages/CompanyDashboard";
import LeaderDashboard from "./pages/LeaderDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";

//new pages
import AccommodationsBenefits from "./pages/AccommodationsBenefits";
import EmployeeManagement from "./pages/EmployeeManagement";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import WellnessEvents from "./pages/WellnessEvents";
import EducationMaterials from "./pages/EducationMaterials";

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

        <Route path="/accommodations-benefits" element={<AccommodationsBenefits />} />
        <Route path="/employee-management" element={<EmployeeManagement />} />
        <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
        <Route path="/wellness-events" element={<WellnessEvents />} />
        <Route path="/education-materials" element={<EducationMaterials />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
