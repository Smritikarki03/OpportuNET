import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Components/Header';
import Footer from '../Components/Footer';

const JobDescription = () => {
  const { id } = useParams(); // Get the job ID from the URL
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        setJob(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job:', error);
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = () => {
    // Redirect to the apply page with the job ID
    navigate(`/Apply/${id}`);
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
      <div className="container mx-auto p-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{job.title}</h1>
              <div className="flex space-x-4 mt-2">
                <span className="text-gray-600">{job.noOfPositions} Positions</span>
                <span className="text-gray-600">{job.jobType}</span>
                <span className="text-gray-600">{job.salary} LPA</span>
              </div>
            </div>
            <button
              onClick={handleApply}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              Apply Now
            </button>
          </div>

          <div className="border-t pt-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Role:</strong> {job.title}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Description:</strong> {job.description}</p>
              <p><strong>Experience:</strong> {job.experienceLevel}</p>
              <p><strong>Salary:</strong> {job.salary} LPA</p>
              <p><strong>Total Applicants:</strong> {job.totalApplicants}</p>
              <p><strong>Posted Date:</strong> {new Date(job.createdAt).toISOString().split('T')[0]}</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default JobDescription;