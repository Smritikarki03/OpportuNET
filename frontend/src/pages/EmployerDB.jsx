import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CompanySetupModal from "../Components/CompanySetupModal";

const EmployerDashboard = ({ employerId }) => {
  const [isCompanySetup, setIsCompanySetup] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCompanySetup = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/employer/${employerId}`);
        setIsCompanySetup(response.data.isCompanySetup);
      } catch (error) {
        console.error("Error checking company setup status:", error);
      }
    };
    checkCompanySetup();
  }, [employerId]);

  const handlePostJobClick = () => {
    if (!isCompanySetup) {
      setShowModal(true);  // Show popup if company is not set up
    } else {
      navigate("/post-job");  // Redirect to job posting page if company is set up
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Employer Dashboard</h1>
      
      <button 
        onClick={handlePostJobClick} 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Post a Job
      </button>

      {showModal && <CompanySetupModal employerId={employerId} onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default EmployerDashboard;
