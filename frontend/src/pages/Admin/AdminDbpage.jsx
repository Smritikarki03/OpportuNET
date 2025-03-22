import React from 'react';

const AdminDbpage = () => {
  // Sample data
  const employees = [
    { name: 'Cameron Williamson', title: 'Front-end Developer' },
    { name: 'Lewis N. Clark', title: 'Project Manager' },
    { name: 'Eleanor Pina', title: 'Senior US Designer' },
    { name: 'Christine Minjir', title: 'US Designer' },
  ];

  const teamLeads = [
    'Dinnstein Mobami',
    'Hugo First',
    'Mika Bostopp',
  ];

  const projects = [
    { status: 'Signed', count: 12 },
    { status: 'Manager Review', count: 21 },
    { status: 'Client Review', count: 30 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-teal-700">OpportuNET Dashboard</h1>
        <p className="text-gray-600">Welcome to your job portal management system</p>
      </header>

      {/* Grid Layout for Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Job Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-teal-700 mb-4">Job Statistics</h2>
          <div className="space-y-3">
            <p><span className="font-semibold">Payroll:</span> 8 Employees</p>
            <p><span className="font-semibold">Jobs:</span> 8 Candidates</p>
            <p><span className="font-semibold">Job Applied:</span> 212</p>
            <p><span className="font-semibold">Cross Salary:</span> $782</p>
          </div>
        </div>

        {/* Project Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-teal-700 mb-4">Project Overview</h2>
          <p className="mb-4"><span className="font-semibold">Total Projects:</span> 48</p>
          <div className="space-y-2">
            {projects.map((project, index) => (
              <div key={index} className="flex justify-between">
                <p>{project.status}</p>
                <p className="font-semibold">{project.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Status */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-teal-700 mb-4">Employee Status</h2>
          <div className="space-y-3">
            {employees.map((employee, index) => (
              <div key={index}>
                <p className="font-semibold">{employee.name}</p>
                <p className="text-gray-600">{employee.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Leads */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-teal-700 mb-4">Team Leads</h2>
          <div className="space-y-2">
            {teamLeads.map((lead, index) => (
              <p key={index}>{lead}</p>
            ))}
          </div>
        </div>

        {/* Working Format */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-teal-700 mb-4">Working Format</h2>
          <p><span className="font-semibold">Total Employees:</span> 300</p>
          <p><span className="font-semibold">Online:</span> Remote, Hybrid</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDbpage;