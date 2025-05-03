import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import Header from './Header';
import Footer from './Footer';

const JobPosting = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const [employerData, setEmployerData] = useState(null);

  // Add debug logging
  useEffect(() => {
    console.log('Current auth state:', auth);
    if (!auth?.token) {
      navigate('/login');
    }
  }, [auth, navigate]);

  const [job, setJob] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    noOfPositions: 0,
    company: '',
    deadline: '',
    status: 'Active'
  });

  // Fetch employer data when component mounts
  useEffect(() => {
    const fetchEmployerData = async () => {
      try {
        if (!auth?.token) {
          navigate('/login');
          return;
        }

        const userResponse = await axios.get('http://localhost:5000/api/auth/userInfo', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

        const companyResponse = await axios.get(`http://localhost:5000/api/company`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

        console.log('Fetched company data:', companyResponse.data);
        setEmployerData(companyResponse.data);
        
        setJob(prev => ({
          ...prev,
          company: companyResponse.data.name || ''
        }));
      } catch (error) {
        console.error('Error fetching employer data:', error);
        if (error.response?.status === 404) {
          alert('Please set up your company profile before posting a job.');
          navigate('/CompanySetupForm');
        } else {
          alert('Error loading your profile data. Please try again.');
        }
      }
    };

    fetchEmployerData();
  }, [auth, navigate]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!auth?.token) {
      alert('Please log in to post a job');
      navigate('/login');
      return;
    }

    if (job.company !== employerData?.name) {
      alert('Please use your registered company name');
      return;
    }

    if (!job.deadline) {
      alert('Please select an application deadline');
      return;
    }

    try {
      const formattedJob = {
        ...job,
        deadline: new Date(job.deadline + 'T23:59:59').toISOString(),
        noOfPositions: parseInt(job.noOfPositions),
        status: 'Active',
        isActive: true
      };

      console.log('Submitting job with data:', formattedJob);
      const response = await axios.post(
        'http://localhost:5000/api/jobs',
        formattedJob,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          }
        }
      );

      console.log('Job posting response:', response.data);
      alert('Job posted successfully!');
      
      navigate('/', { 
        state: { 
          refresh: true,
          timestamp: new Date().getTime() 
        } 
      });
    } catch (error) {
      console.error('Error details:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.message;
      alert('Failed to post job: ' + errorMessage);
    }
  };

  return (
    <>
      <Header />
      <br />
      <br />
      <br/>
      <br />
      <br />
      
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Post a New Job</h2>
              <p className="mt-2 text-sm text-gray-600">Fill in the details below to create a new job posting</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Job Title and Type */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    name="title"
                    value={job.title}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <select
                    name="jobType"
                    value={job.jobType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Job Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              {/* Description and Requirements */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Description</label>
                  <textarea
                    name="description"
                    value={job.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Describe the role and responsibilities"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                  <textarea
                    name="requirements"
                    value={job.requirements}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="List the required skills and qualifications"
                  />
                </div>
              </div>

              {/* Salary and Location */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
                  <input
                    type="text"
                    name="salary"
                    value={job.salary}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g. $50,000 - $70,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={job.location}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g. New York, NY"
                  />
                </div>
              </div>

              {/* Experience and Positions */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    name="experienceLevel"
                    value={job.experienceLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Experience Level</option>
                    <option value="Entry Level">Entry Level</option>
                    <option value="Mid Level">Mid Level</option>
                    <option value="Senior Level">Senior Level</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Positions</label>
                  <input
                    type="number"
                    name="noOfPositions"
                    value={job.noOfPositions}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Company and Deadline */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    name="company"
                    value={job.company}
                    onChange={handleChange}
                    required
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-50 cursor-not-allowed"
                  />
                  <p className="mt-1 text-sm text-gray-500">Auto-filled with your company name</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={job.deadline}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">Last date for applications</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                >
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default JobPosting;