import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import Header from './Header';
import Footer from './Footer';

const JobPosting = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();

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
  });

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

    try {
      // Log the auth token being used
      console.log('Using auth token:', auth.token);
      
      const response = await axios.post(
        'http://localhost:5000/api/jobs',
        job,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          }
        }
      );

      console.log('Job posting response:', response.data);
      alert('Job posted successfully!');
      navigate('/profile', { state: { refresh: true } });
    } catch (error) {
      console.error('Error details:', error.response || error);
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        navigate('/login');
      } else {
        alert('Failed to post job: ' + (error.response?.data?.message || error.message));
      }
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
              type="number"
              name="salary"
              value={job.salary}
              onChange={handleChange}
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
            <input
              type="text"
              name="jobType"
              value={job.jobType}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Experience Level</label>
            <input
              type="text"
              name="experienceLevel"
              value={job.experienceLevel}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>No of Position</label>
            <input
              type="number"
              name="noOfPositions"
              value={job.noOfPositions}
              onChange={handleChange}
              required
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
            style={styles.input}
          />
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