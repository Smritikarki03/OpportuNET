import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverLetterText, setCoverLetterText] = useState("");
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [cv, setcv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userRole = localStorage.getItem("userRole");

  const fetchJob = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      setJob(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching job:", error);
      setError("Job not found. Redirecting to jobs page...");
      setTimeout(() => navigate('/jobs'), 2000);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (userRole !== "jobseeker") {
      alert("Only job seekers can apply for jobs.");
      navigate("/Login");
      return;
    }

    fetchJob();
  }, [id, navigate, userRole, fetchJob]);

  const handleGeneratecv = () => {
    navigate("/CV");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    try {
      const token = localStorage.getItem("auth");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        alert("Please log in to apply for this job.");
        navigate("/Login");
        return;
      }

      if (!coverLetterText && !coverLetterFile) {
        setError("Please provide a cover letter (either as text or a file).");
        return;
      }

      if (!cv) {
        setError("CV is required.");
        return;
      }

      const data = new FormData();
      data.append("jobId", id);
      data.append("userId", userId);
      if (coverLetterFile) {
        data.append("coverLetterFile", coverLetterFile);
      } else {
        data.append("coverLetter", coverLetterText);
      }
      data.append("cv", cv); // ✅ Renamed here

      // Submit the application
      const response = await axios.post("http://localhost:5000/api/applications", data, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      console.log('Application submission response:', response.data);

      // If the submission is successful, show success message
      alert("Application submitted successfully!");

      // Navigate to the job description page
      navigate(`/job/${id}`);
    } catch (error) {
      console.error("Error submitting application:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError("Failed to submit application: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="text-center text-teal-700">Loading...</div>;
  }

  if (error && !job) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-4xl font-bold text-teal-700 text-center mb-8">
          Apply for {job.title}
        </h1>
        {error && (
          <div className="text-center text-red-600 mb-4">{error}</div>
        )}
        <form
          className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Cover Letter (Enter text or upload a file)
            </label>
            <textarea
              name="coverLetterText"
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              placeholder="Write your cover letter here..."
            />
            <input
              type="file"
              name="coverLetterFile"
              accept=".pdf,.doc,.docx"
              className="w-full p-2 border rounded"
              onChange={(e) => setCoverLetterFile(e.target.files[0])}
            />
            <p className="text-sm text-gray-500 mt-1">
              You can either write your cover letter above or upload a file. If a file is uploaded, it will take priority.
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              CV (PDF, Required)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                name="resume" // ✅ Updated to match the backend
                accept=".pdf"
                className="w-full p-2 border rounded"
                onChange={(e) => setcv(e.target.files[0])}
                required
              />
              <button
                type="button"
                onClick={handleGeneratecv}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition duration-300"
              >
                Generate CV
              </button>
            </div>
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
