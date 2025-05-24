import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaFilePdf, FaFileUpload, FaMagic } from 'react-icons/fa';
import Header from "../Components/Header";

const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [resumePreviewUrl, setResumePreviewUrl] = useState(null);
  const [coverLetterPreviewUrl, setCoverLetterPreviewUrl] = useState(null);

  const userRole = localStorage.getItem("userRole");

  useEffect(() => {
    // Get user info from localStorage
    const storedName = localStorage.getItem("userName");
    if (!storedName) {
      alert("User information not found. Please log in again.");
      navigate("/Login");
      return;
    }
    setUserName(storedName);
  }, [navigate]);

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
  }, [id, navigate, userRole, fetchJob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const authData = localStorage.getItem("auth");
      if (!authData) {
        alert("Please log in to apply for this job.");
        navigate("/Login");
        return;
      }

      const { token } = JSON.parse(authData);
      const userId = localStorage.getItem("userId");

      if (!token || !userId || !userName) {
        alert("Please log in to apply for this job.");
        navigate("/Login");
        return;
      }

      if (!resume) {
        alert("Please upload your resume.");
        return;
      }

      // FIX: Require at least one cover letter (text or file)
      if (!coverLetter && !coverLetterFile) {
        alert("Please provide a cover letter (text or PDF file).");
        return;
      }

      const formData = new FormData();
      formData.append("jobId", id);
      formData.append("userId", userId);
      formData.append("applicantName", userName);
      formData.append("coverLetter", coverLetter);
      if (coverLetterFile) {
        formData.append("coverLetterFile", coverLetterFile);
      }
      formData.append("resume", resume);

      // Debug: Log all form data entries
      console.log('Form data entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      console.log('Submitting application with data:', {
        jobId: id,
        userId,
        applicantName: userName,
        hasResume: !!resume,
        hasCoverLetter: !!coverLetter,
        hasCoverLetterFile: !!coverLetterFile
      });

      const response = await axios.post("http://localhost:5000/api/applications", formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      console.log('Application submission response:', response.data);

      if (response.status === 201) {
        alert("Application submitted successfully!");
        navigate('/profile');
      } else {
        alert("Failed to submit application. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      console.error("Error details:", error.response?.data);
      alert("Failed to submit application: " + (error.response?.data?.message || error.message));
    }
  };

  const handleGenerateCV = () => {
    // Redirect to a CV builder page or open a modal (customize as needed)
    window.open('/CV', '_blank');
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    setResume(file);
    if (file) {
      setResumePreviewUrl(URL.createObjectURL(file));
    } else {
      setResumePreviewUrl(null);
    }
  };

  const handleCoverLetterFileChange = (e) => {
    const file = e.target.files[0];
    setCoverLetterFile(file);
    if (file) {
      setCoverLetterPreviewUrl(URL.createObjectURL(file));
    } else {
      setCoverLetterPreviewUrl(null);
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
      <Header />
      <div style={{ height: '2.5rem' }} />
      <br></br>
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
              onChange={handleCoverLetterFileChange}
            />
            {coverLetterFile && (
              <div>
                <span>{coverLetterFile.name}</span>
                <button
                  type="button"
                  className="ml-2 text-teal-600 underline"
                  onClick={() => window.open(coverLetterPreviewUrl, '_blank')}
                >
                  View
                </button>
              </div>
            )}
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
                onChange={handleResumeChange}
              />
              {resume && (
                <div>
                  <span>{resume.name}</span>
                  <button
                    type="button"
                    className="ml-2 text-teal-600 underline"
                    onClick={() => window.open(resumePreviewUrl, '_blank')}
                  >
                    View
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleGenerateCV}
              className="mt-2 md:mt-6 flex items-center gap-2 bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded-lg shadow transition duration-200"
            >
              <FaMagic /> Generate CV
            </button>
          </div>
          {/* Warning message before submit */}
          <p className="text-red-600 font-semibold mb-4">
            Note: Once you submit your application, it cannot be edited. Please review all details carefully before submitting.
          </p>
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