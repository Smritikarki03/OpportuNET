import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar"; // Fixed the import path to lowercase "components"
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/api/jobs")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch jobs");
        return res.json();
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    // Add confirmation dialog
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    console.log("Deleting job with ID:", id); // Log the ID for debugging

    fetch(`http://localhost:5000/api/jobs/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete job");
        setJobs(jobs.filter((job) => job._id !== id));
        setError(null); // Clear any previous errors
      })
      .catch((err) => {
        console.error(err);
        setError(err.message); // Display error on UI
      });
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error && jobs.length === 0) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <div className="flex-1 p-8 ml-64">
        <h1 className="text-2xl font-semibold text-teal-800 mb-8">MANAGE JOBS</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-teal-800 mb-4">Pending Job Postings</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {jobs.length === 0 ? (
            <p className="text-gray-600">No pending jobs found.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-teal-50 text-teal-800">
                  <th className="p-3">Company</th>
                  <th className="p-3">Job Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id} className="border-b">
                    <td className="p-3">{job.company}</td>
                    <td className="p-3">{job.title}</td>
                    <td className="p-3">Active</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition flex items-center"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageJobs;