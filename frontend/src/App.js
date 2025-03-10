import React from 'react';
import { Route, Routes, NavLink } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import HomePage from './pages/Homepage';
import AboutPage from "./pages/Aboutpage";
import SignUpSelectionPage from './pages/SignupSelectionPage';
import SignUpEmployer from './pages/auth/employerSignup';
import ForgotPassword from './pages/auth/Forgotpw';
import ProfilePage from './pages/ProfilePage';
import EmployerProfile from './pages/EmployerProfile';
import EmployerProfilePage from './pages/ProfileEm';
import RatingsAndReviews from './pages/Ratings';
import EditProfilePage from './pages/EditProfilePage';
import EditEmployerProfile from './pages/EditEP';
import EditEMProfile from './pages/EMEdit';
import ResetPassword from './pages/auth/ResetPW';
import Dashboard from './pages/EmployerDB';
import AdminDashboard from './pages/AdminDB';
import AdminDbpage from './pages/AdminDbpage';
import BrowseJobs from './pages/Browse';
import HelpPage from './pages/help';
import ContactPage from './pages/Contact';
import CV from './pages/CV';
import AdminNotifications from './Components/AdminNotifications';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import BrowseJobsPage from './pages/BrowseJobsPage';
// import PostJobPage from './pages/PostJobPage';


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
          <Route path="/Forgot-password" element={<ForgotPassword/>} />
          <Route path="/EmployerProfile" element={<EmployerProfile/>} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/ProfileEM" element={<EmployerProfilePage/>} />
          <Route path="/Ratings" element={<RatingsAndReviews/>} />
          <Route path="/edit-profile" element={<EditProfilePage/>} />
          <Route path="/EditEP" element={<EditEmployerProfile/>} />
          <Route path="/EMEdit" element={<EditEMProfile/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />
          <Route path="/EmployerDB" element={<Dashboard/>} />
          <Route path="/AdminDB" element={<AdminDashboard/>} />
          <Route path="/AdminDbpage" element={<AdminDbpage/>} />
          <Route path="/Browse" element={<BrowseJobs/>} />
          <Route path="/help" element={<HelpPage/>} />
          <Route path="/Contact" element={<ContactPage/>} />
          <Route path="/CV" element={<CV/>} />
          <Route path="/AdminNotifications" element={<AdminNotifications/>} />

          




          {/* <Route path="/" element={<BrowseJobsPage />} />
          <Route path="/post-job" element={<PostJobPage />} /> */}















        </Routes>
      </div>
  );
};

export default App;