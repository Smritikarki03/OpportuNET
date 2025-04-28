import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFilePdf, FaFileUpload, FaMagic } from 'react-icons/fa';

const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetterFile, setCoverLetterFile] = useState(null);

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
      data.append("coverLetterFile", coverLetterFile);
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

  const handleGenerateCV = () => {
    // Redirect to a CV builder page or open a modal (customize as needed)
    window.open('/CV', '_blank');
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
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto border border-gray-100"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              Cover Letter (Text)
              <FaFilePdf className="text-teal-500" />
            </label>
            <textarea
              name="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-400 transition"
              rows={5}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              Upload Cover Letter (PDF)
              <FaFileUpload className="text-teal-500" />
            </label>
            <input
              type="file"
              name="coverLetterFile"
              accept=".pdf"
              className="w-full p-2 border rounded-lg"
              onChange={(e) => setCoverLetterFile(e.target.files[0])}
            />
          </div>
          <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                Resume (PDF)
                <FaFilePdf className="text-teal-500" />
              </label>
              <input
                type="file"
                name="resume"
                accept=".pdf"
                className="w-full p-2 border rounded-lg"
                required
                onChange={(e) => setResume(e.target.files[0])}
              />
            </div>
            <button
              type="button"
              onClick={handleGenerateCV}
              className="mt-2 md:mt-6 flex items-center gap-2 bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow transition duration-200"
            >
              <FaMagic /> Generate CV
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-teal-700 text-white px-4 py-3 rounded-xl font-semibold text-lg hover:bg-teal-800 transition duration-300 shadow-md hover:shadow-lg"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApplyPage;