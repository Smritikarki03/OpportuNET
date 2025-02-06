import React from "react";
import { Link } from "react-router-dom";

const JobSeekerProfile = () => {
  const user = {
    name: "Smriti Karki",
    email: "smritikarki@gmail.com",
    phone: "+977 9800000000",
    location: "Bouddha",
    experience: "Experienced with 2 years in FullStack Development",
    skills: ["React", "Node.js", "MongoDB", "GraphQL"],
    cv: "smritikarkicv.pdf",
  };

  const appliedJobs = [
    { id: 1, date: "2024-06-14", role: "Backend Developer", company: "LeapFrog", status: "Pending" },
    { id: 2, date: "2024-06-13", role: "FullStack Developer", company: "Google", status: "Rejected" },
    { id: 3, date: "2024-06-13", role: "Frontend Developer", company: "Cotiviti", status: "Pending" },
  ];

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

      {/* Profile Section */}
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              className="w-40 h-40 rounded-full border"
              src="https://i0.wp.com/www.torontophotographerz.com/wp-content/uploads/2017/06/Linkedin-portraits-2.jpg?fit=800%2C1200&ssl=1"
              alt="User Profile"
            />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.experience}</p>
              <p className="text-sm text-gray-500">📧 {user.email}</p>
              <p className="text-sm text-gray-500">📞 {user.phone}</p>
              <p className="text-sm text-gray-500">📍 {user.location}</p>
            </div>
          </div>
          {/* Edit Profile Button */}
          <Link to="/edit-profile">
            <button className="bg-teal-500 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-600">
              Edit Profile
            </button>
          </Link>
        </div>

        {/* Skills Section */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Skills</h3>
          <div className="flex flex-wrap mt-2">
            {user.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 mr-2 mb-2 bg-teal-200 text-sm rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Resume Section */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">CV</h3>
          <a href={user.resume} target="_blank" rel="noopener noreferrer" className="text-teal-500 underline">
            smritikarkicv.pdf
          </a>
        </div>

        {/* Applied Jobs Section */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Applied Jobs</h3>
          <table className="w-full mt-2 border-collapse border border-gray-300">
            <thead>
              <tr className="bg-teal-100">
                <th className="border p-2">Date</th>
                <th className="border p-2">Job Role</th>
                <th className="border p-2">Company</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {appliedJobs.map((job) => (
                <tr key={job.id} className="text-center border">
                  <td className="border p-2">{job.date}</td>
                  <td className="border p-2">{job.role}</td>
                  <td className="border p-2">{job.company}</td>
                  <td
                    className={`border p-2 font-semibold ${job.status === "Rejected" ? "text-red-500" : job.status === "Pending" ? "text-yellow-500" : "text-green-500"}`}
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

export default JobSeekerProfile;
