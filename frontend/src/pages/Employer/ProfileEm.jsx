import React, { useState } from "react";
import { Link } from "react-router-dom";

const EmployerProfilePage = () => {
  // Employer data
  const [employer, setEmployer] = useState({
    name: "Purnika Sharma",
    company: "Leapfrog Private Limited",
    jobRole: "Hiring Manager",
    email: "purnika@techinnovators.com",
    phone: "+977 9876543210",
    location: "Kathmandu, Nepal",
    experienceLevel: "Senior",
    skills: ["Leadership", "Team Management", "Recruitment", "Communication"],
    education: "MBA in Human Resources",
    cv: "purnikacv.pdf",
  });

  // Applicants for job posting
  const [applicants, setApplicants] = useState([
    {
      id: 1,
      name: "John Smith",
      role: "FullStack Developer",
      status: "Pending",
      cv: "https://via.placeholder.com/150", // Placeholder for CV link
    },
    {
      id: 2,
      name: "Alice Johnson",
      role: "Frontend Developer",
      status: "Pending",
      cv: "https://via.placeholder.com/150", // Placeholder for CV link
    },
    {
      id: 3,
      name: "Bob Brown",
      role: "Backend Developer",
      status: "Pending",
      cv: "https://via.placeholder.com/150", // Placeholder for CV link
    },
  ]);

  // Function to handle applicant status change (Accept/Reject)
  const handleApplicantStatus = (id, action) => {
    setApplicants((prevApplicants) =>
      prevApplicants.map((applicant) =>
        applicant.id === id
          ? { ...applicant, status: action }
          : applicant
      )
    );
  };

  // Edit Profile Handler (Placeholder)
  const handleEditProfile = () => {
    console.log("Edit Profile Clicked");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-teal-700 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">OpportuNET</div>
          <ul className="flex space-x-6">
            <li><Link to="/" className="hover:underline">Home</Link></li>
            <li><Link to="/about" className="hover:underline">About Us</Link></li>
            <li><Link to="/services" className="hover:underline">Browse</Link></li>
            <li><Link to="/services" className="hover:underline">Help</Link></li>
            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
            <li><Link to="/connect" className="hover:underline">Connect</Link></li>
          </ul>
        </div>
      </nav>

      {/* Employer Profile Section */}
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img
              className="w-40 h-40 rounded-full border"
              src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimg.freepik.com%2Fpremium-photo%2Fcorporate-business-young-women-employee-photos_983969-411.jpg&f=1&nofb=1&ipt=6facccaa698366fa1999a945e2a5470c6bfc1f4bfa042228dea6a95d6e748a6e&ipo=images"
              alt="Employer Profile"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{employer.name}</h2>
              <p className="text-gray-600">{employer.jobRole} at {employer.company}</p>
              <p className="text-sm text-gray-500">📧 {employer.email}</p>
              <p className="text-sm text-gray-500">📞 {employer.phone}</p>
              <p className="text-sm text-gray-500">📍 Location: {employer.location}</p>
              <p className="text-sm text-gray-500">💼 Experience Level: {employer.experienceLevel}</p>
              <p className="text-sm text-gray-500">🛠 Skills: {employer.skills.join(", ")}</p>
              <p className="text-sm text-gray-500">🎓 Education: {employer.education}</p>
              <p className="text-sm text-gray-500">📄 CV: {employer.cv}</p>

            </div>
          </div>

          <button
            onClick={handleEditProfile}
            className="bg-teal-700 text-white px-2 py-1 rounded-lg hover:bg-teal-800"
          >
            Edit Profile
          </button>
        </div>

        {/* Applicants Table */}
        <h3 className="text-xl font-semibold mt-6">Job Applicants</h3>
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr className="bg-teal-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Role</th>
              <th className="border p-2">CV</th> {/* CV moved here */}
              <th className="border p-2">Status</th> {/* Status moved here */}
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => (
              <tr key={applicant.id} className="text-center border">
                <td className="border p-2">{applicant.name}</td>
                <td className="border p-2">{applicant.role}</td>
                <td className="border p-2">
                  <a
                    href={applicant.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View CV
                  </a>
                </td>
                <td
                  className={`border p-2 font-semibold ${
                    applicant.status === "Rejected"
                      ? "text-red-500"
                      : applicant.status === "Pending"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {applicant.status}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => handleApplicantStatus(applicant.id, "Accepted")}
                    className="bg-green-500 text-white px-4 py-1 rounded-lg hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleApplicantStatus(applicant.id, "Rejected")}
                    className="ml-2 bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployerProfilePage;
