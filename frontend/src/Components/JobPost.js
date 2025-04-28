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

        // First get the user's company ID
        const userResponse = await axios.get('http://localhost:5000/api/auth/userInfo', {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

        // Then fetch the company details
        const companyResponse = await axios.get(`http://localhost:5000/api/company`, {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        });

        console.log('Fetched company data:', companyResponse.data);
        setEmployerData(companyResponse.data);
        
        // Pre-fill the company name from the company profile
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

    // Validate company name matches employer's company
    if (job.company !== employerData?.name) {
      alert('Please use your registered company name');
      return;
    }

    // Validate deadline
    if (!job.deadline) {
      alert('Please select an application deadline');
      return;
    }

    try {
      // Format the data before sending
      const formattedJob = {
        ...job,
        deadline: new Date(job.deadline + 'T23:59:59').toISOString(), // Set deadline to end of day
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
      
      // Redirect to home page instead of employer profile
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
    <div style={styles.container}>
      <h2 style={styles.header}>Post a Job on opportuNET</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              name="title"
              value={job.title}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={job.description}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Requirements</label>
            <textarea
              name="requirements"
              value={job.requirements}
              onChange={handleChange}
              required
              style={styles.textarea}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Salary</label>
            <input
              type="text"
              name="salary"
              value={job.salary}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Location</label>
            <input
              type="text"
              name="location"
              value={job.location}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Job Type</label>
            <select
              name="jobType"
              value={job.jobType}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Select Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Experience Level</label>
            <select
              name="experienceLevel"
              value={job.experienceLevel}
              onChange={handleChange}
              required
              style={styles.input}
            >
              <option value="">Select Experience Level</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior Level">Senior Level</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>No of Position</label>
            <input
              type="number"
              name="noOfPositions"
              value={job.noOfPositions}
              onChange={handleChange}
              required
              min="1"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Company Name</label>
          <input
            type="text"
            name="company"
            value={job.company}
            onChange={handleChange}
            required
            disabled
            style={{...styles.input, backgroundColor: '#f0f0f0'}}
          />
          <small style={{color: '#666'}}>This is automatically filled with your registered company name</small>
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Application Deadline</label>
            <input
              type="date"
              name="deadline"
              value={job.deadline}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              style={styles.input}
            />
            <small style={{color: '#666'}}>Select the last date for applications</small>
          </div>
        </div>

        <button type="submit" style={styles.button}>Post New Job</button>
      </form>
    </div>
  );
};

// Inline styles (same as before)
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  row: {
    display: 'flex',
    gap: '15px',
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    minHeight: '80px',
  },
  button: {
    padding: '10px',
    backgroundColor: 'teal',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default JobPosting;