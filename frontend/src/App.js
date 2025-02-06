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
import JobSeekerProfile from './pages/PJobSeeker';
import EmployerProfile from './pages/EmployerProfile';
import EmployerProfilePage from './pages/ProfileEm';
import RatingsAndReviews from './pages/Ratings';
import EditJobSeekerProfile from './pages/EditJP';
import EditEmployerProfile from './pages/EditEP';
import EditEMProfile from './pages/EMEdit';
import ResetPassword from './pages/auth/ResetPW';

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
          <Route path="/PJobSeeker" element={<JobSeekerProfile/>} />
          <Route path="/ProfileEM" element={<EmployerProfilePage/>} />
          <Route path="/Ratings" element={<RatingsAndReviews/>} />
          <Route path="/EditJP" element={<EditJobSeekerProfile/>} />
          <Route path="/EditEP" element={<EditEmployerProfile/>} />
          <Route path="/EMEdit" element={<EditEMProfile/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />










        </Routes>
      </div>
  );
};

export default App;