import React from 'react';
import { Route, Routes, NavLink } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import HomePage from './pages/Homepage';
import AboutPage from "./pages/Aboutpage";
import SignUpSelectionPage from './pages/auth/SignupSelectionPage';
import SignUpEmployer from './pages/auth/employerSignup';
import ForgotPassword from './pages/auth/Forgotpw';
import ProfilePage from './pages/JobSeeker/ProfilePage';
import EmployerProfile from './pages/Employer/EmployerProfile';
import EmployerProfilePage from './pages/Employer/ProfileEm';
import RatingsAndReviews from './pages/Ratings';
import EditProfile from './pages/JobSeeker/EditProfilePage';
// import EditEmployerProfile from './pages/Employer/CompanyProfile';
import EditEMProfile from './pages/Employer/EMEdit';
import ResetPassword from './pages/auth/ResetPW';
import EmployerDashboard from './pages/Employer/EmployerDB';
import AdminDashboard from './pages/Admin/AdminDB';
import BrowseJobs from './pages/Browse';
import HelpPage from './pages/help';
import ContactPage from './pages/Contact';
import CV from './pages/CV';
import AdminNotifications from './Components/AdminNotifications';
import JobPosting from './Components/JobPost';
import CompanyProfile from './Components/CompanyProfile'; 
// import EditCompanyProfile from './pages/Employer/EditCompanyProfile'; // Add this
import JobDescription from './pages/JobDescription';
import ApplyPage from './pages/Apply';
import ManageJobs from './pages/Admin/ManageJob';
import CompanySU from './Components/CompanySU';
import CVRamanProfile from './pages/CVRamanProfile';
import LeapFrogProfile from './pages/LepFrogProfile';
import DataWorksProfile from './pages/DataWorksProfile';
import CotivitiProfile from './pages/CotivitiProfile';
import ManageUsers from './pages/Admin/ManageUsers';
import CompanySetupForm from './Components/CompanySetuoForm';
import CompanyProf from './Components/CompanyProf';
import EditCompanyProfile from './Components/EditCompanyProfile'; // Add this
const App = () => {
  return (
      <div className="App">
        <Toaster />
        <Routes>
          <Route path="/" element={<HomePage />} /> {/* HomePage set to root */}
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/employerSignup" element={<SignUpEmployer/>} />
          <Route path="/About" element={<AboutPage />} />
          <Route path="/selectSignup" element={<SignUpSelectionPage />} />
          <Route path="/Forgotpw" element={<ForgotPassword/>} />
          <Route path="/EmployerProfile" element={<EmployerProfile/>} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/ProfileEM" element={<EmployerProfilePage/>} />
          <Route path="/Ratings" element={<RatingsAndReviews/>} />
          <Route path="/EditProfilePage" element={<EditProfile/>} />
          {/* <Route path="/EditEP" element={<EditEmployerProfile/>} /> */}
          <Route path="/EMEdit" element={<EditEMProfile/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />
          <Route path="/EmployerDB" element={<EmployerDashboard/>} />
          <Route path="/AdminDB" element={<AdminDashboard/>} />
          <Route path="/Browse" element={<BrowseJobs/>} />
          <Route path="/help" element={<HelpPage/>} />
          <Route path="/Contact" element={<ContactPage/>} />
          <Route path="/CV" element={<CV/>} />
          <Route path="/AdminNotifications" element={<AdminNotifications/>} />
          <Route path="/JobPost" element={<JobPosting/>} />
          <Route path="/CompanySU" element={<CompanySU/>} />
          <Route path="/description/:id" element={<JobDescription />} />
          <Route path="/apply/:id" element={<ApplyPage />} />
          <Route path="/ManageJob" element={<ManageJobs />} />
          <Route path="/CompanyProfile/:id" element={<CompanyProfile />} />
          <Route path="CVRamanProfile" element={<CVRamanProfile />} />
          <Route path="LeapFrogProfile" element={<LeapFrogProfile/>} />
          <Route path="DataWorksProfile" element={<DataWorksProfile/>} />
          <Route path="CotivitiProfile" element={<CotivitiProfile/>} />
          <Route path="/ManageUsers" element={<ManageUsers />} />
          <Route path="/company-prof/:id?" element={<CompanyProf />} />
          <Route path="/CompanySetupForm" element={<CompanySetupForm />} /> 
          <Route path="/EditCompanyProfile/:id" element={<EditCompanyProfile />} /> 
          
          </Routes>
      </div>
  );
};

export default App;