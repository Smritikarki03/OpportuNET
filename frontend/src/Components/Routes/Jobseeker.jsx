import { Navigate, Outlet } from "react-router-dom";

const PatientRoute = () => {
  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth || auth.user.role !== "jobseeker") {
    return <Navigate to="/" />; // Redirect to homepage if not a jobseeker
  }

  return <Outlet />; // Render the patient dashboard if the user is a jobseeker
};

export default JobseekerRoute;