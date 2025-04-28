import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import axios from 'axios';
import Header from '../../Components/Header';

// Base URL for API calls
const API_BASE_URL = 'http://localhost:5000/api';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auth] = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    noOfPositions: '',
    company: '',
    deadline: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        if (!id) {
          setError('No job ID provided');
          setLoading(false);
          return;
        }

        console.log('Fetching job with ID:', id);
        console.log('Auth token:', auth.token);

        if (!auth.token) {
          setError('No authentication token found. Please log in again.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (!response.data) {
          setError('No job data received');
          setLoading(false);
          return;
        }

        console.log('Job data received:', response.data);
        
        // Format the deadline date for the input field
        const deadline = response.data.deadline 
          ? new Date(response.data.deadline).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        const jobData = {
          title: response.data.title || '',
          description: response.data.description || '',
          requirements: response.data.requirements || '',
          salary: response.data.salary || '',
          location: response.data.location || '',
          jobType: response.data.jobType || '',
          experienceLevel: response.data.experienceLevel || '',
          noOfPositions: response.data.noOfPositions || '',
          company: response.data.company || '',
          deadline: deadline,
          userId: response.data.userId
        };
        
        setJobData(jobData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching job:', error.response || error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch job details';
        console.error('Error message:', errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, auth.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors
    
    try {
      if (!id) {
        setError('No job ID provided');
        return;
      }

      if (!auth.token) {
        setError('No authentication token found. Please log in again.');
        return;
      }

      console.log('Updating job with ID:', id);
      console.log('Auth token:', auth.token);
      console.log('Job data to send:', jobData);
      
      // Make sure all required fields are present
      const requiredFields = ['title', 'description', 'requirements', 'salary', 'location', 'jobType', 'experienceLevel', 'noOfPositions', 'company', 'deadline'];
      const missingFields = requiredFields.filter(field => !jobData[field]);
      
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate deadline is not in the past
      const deadlineDate = new Date(jobData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate < today) {
        setError('Deadline cannot be in the past');
        return;
      }

      // Create a clean object with only the fields we want to update
      const updateData = {
        title: jobData.title.trim(),
        description: jobData.description.trim(),
        requirements: jobData.requirements.trim(),
        salary: jobData.salary.trim(),
        location: jobData.location.trim(),
        jobType: jobData.jobType,
        experienceLevel: jobData.experienceLevel,
        noOfPositions: parseInt(jobData.noOfPositions),
        company: jobData.company.trim(),
        deadline: jobData.deadline
      };

      const response = await axios.put(`${API_BASE_URL}/jobs/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data) {
        throw new Error('No response received from server');
      }

      console.log('Update response:', response.data);
      
      // Show success message
      alert('Job updated successfully!');
      
      // Navigate to profile page
      navigate('/profile', { 
        state: { 
          updateMessage: 'Job updated successfully',
          refresh: true 
        } 
      });
    } catch (error) {
      console.error('Error updating job:', error.response || error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update job';
      console.error('Error message:', errorMessage);
      setError(errorMessage);
    }
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return (
    <div className="min-h-screen bg-gray-50 py-8 pt-20">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-500 py-4">
          {error}
          <div className="mt-4">
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 pt-20">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-teal-700 mb-6">Edit Job Posting</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={jobData.description}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Requirements</label>
              <textarea
                name="requirements"
                value={jobData.requirements}
                onChange={handleChange}
                rows="4"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary</label>
                <input
                  type="text"
                  name="salary"
                  value={jobData.salary}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  value={jobData.location}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Type</label>
                <select
                  name="jobType"
                  value={jobData.jobType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                <select
                  name="experienceLevel"
                  value={jobData.experienceLevel}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                >
                  <option value="">Select Experience Level</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Mid Level">Mid Level</option>
                  <option value="Senior Level">Senior Level</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Number of Positions</label>
                <input
                  type="number"
                  name="noOfPositions"
                  value={jobData.noOfPositions}
                  onChange={handleChange}
                  min="1"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  name="company"
                  value={jobData.company}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                value={jobData.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Update Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditJob; 