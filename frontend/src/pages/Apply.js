import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  const userRole = localStorage.getItem("userRole");

  // ✅ Define fetchJob with useCallback to prevent ESLint errors
  const fetchJob = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      setJob(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching job:", error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (userRole !== "jobseeker") {
      alert("Only job seekers can apply for jobs.");
      navigate("/Login");
      return;
    }

    fetchJob();
  }, [id, navigate, userRole, fetchJob]); // ✅ Include fetchJob in dependencies

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("auth");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        alert("Please log in to apply for this job.");
        navigate("/Login");
        return;
      }

      const data = new FormData();
      data.append("jobId", id);
      data.append("userId", userId);
      data.append("coverLetter", coverLetter);
      data.append("resume", resume);

      await axios.post("http://localhost:5000/api/applications", data, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });

      alert("Application submitted successfully!");

      // 🔄 ✅ Fetch updated job details to update total applicants count
      fetchJob(); // ✅ Now fetchJob is properly defined
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="text-center text-teal-700">Loading...</div>;
  }

  if (!job) {
    return <div className="text-center text-red-600">Job not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold text-teal-700 text-center mb-8">
          Apply for {job.title}
        </h1>
        {/* <p className="text-center text-gray-700"><strong>Total Applicants:</strong> {job.totalApplicants}</p> */}
        <form
          className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Cover Letter
            </label>
            <textarea
              name="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Resume (PDF)
            </label>
            <input
              type="file"
              name="resume"
              accept=".pdf"
              className="w-full p-2 border rounded"
              required
              onChange={(e) => setResume(e.target.files[0])}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition duration-300"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;