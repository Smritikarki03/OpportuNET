import React, { useState } from 'react';

const PostJob = () => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [salary, setSalary] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const job = { title, company, location, type, salary };
    const response = await fetch('http://localhost:5000/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    if (response.ok) {
      alert('Job posted successfully');
      setTitle('');
      setCompany('');
      setLocation('');
      setType('');
      setSalary('');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-teal-700 mb-4">Post a Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Job Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
        <input
          type="text"
          placeholder="Salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
          required
        />
        <button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded-lg hover:bg-teal-800 transition duration-300">
          Post Job
        </button>
      </form>
    </div>
  );
};

export default PostJob;