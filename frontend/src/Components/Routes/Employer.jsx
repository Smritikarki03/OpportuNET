import { Navigate, Outlet } from "react-router-dom";

const EmployerRoute = () => {
  const auth = JSON.parse(localStorage.getItem("auth"));

  if (!auth || auth.user.role !== "employer") {
    return <Navigate to="/" />; // Redirect to homepage if not a employer
  }

  return <Outlet />; // Render the employer dashboard if the user is a employer
};

export default EmployerRoute;