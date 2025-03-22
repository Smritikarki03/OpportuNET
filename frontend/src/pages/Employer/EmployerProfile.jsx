import React from "react";
import { Link } from "react-router-dom";

const EmployerProfile = () => {
  const employer = {
    companyName: "Tech Innovation",
    companyDescription:
      "Tech Innovationy is a leading company in the tech industry, specializing in software solutions, AI development, and cloud computing.",
    companyLocation: "Kathmandu, Nepal",
    companyImage:
      "https://www.example.com/path/to/company-image.jpg", // Replace with actual image URL
    jobsPosted: [
      { id: 1, jobTitle: "Backend Developer", location: "Naxal", status: "Open" },
      { id: 2, jobTitle: "Frontend Developer", location: "Baluwatar", status: "Closed" },
      { id: 3, jobTitle: "FullStack Developer", location: "Bouddha", status: "Open" },
    ],
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
        <div className="flex items-center space-x-4">
          <img
            className="w-48 h-48 rounded-lg border"
            src={"https://www.logomoose.com/wp-content/uploads/2013/04/ti_large.jpg"}
            alt="Company Logo"
          />
          <div className="flex flex-col justify-between">
            <div className="flex items-center">
              <h2 className="text-2xl font-semibold text-gray-800">{employer.companyName}</h2>
              {/* Edit Profile Button */}
              <Link
                to="/edit-profile"
                className="ml-80 bg-teal-500 text-white py-1 px-4 rounded-lg hover:bg-teal-600"
              >
                Edit Profile
              </Link>
            </div>
            <p className="text-gray-600 mt-2">{employer.companyDescription}</p>
            {/* Location Section */}
            <p className="text-sm text-gray-500 mt-2">📍 {employer.companyLocation}</p>
          </div>
        </div>

        {/* Jobs Posted Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Jobs Posted</h3>
          <table className="w-full mt-2 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-teal-100">
                <th className="border p-2">Job Title</th>
                <th className="border p-2">Location</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {employer.jobsPosted.map((job) => (
                <tr key={job.id} className="text-center border">
                  <td className="border p-2">{job.jobTitle}</td>
                  <td className="border p-2">{job.location}</td>
                  <td
                    className={`border p-2 font-semibold ${
                      job.status === "Closed" ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {job.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
