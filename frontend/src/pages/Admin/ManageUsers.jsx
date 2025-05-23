import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { FaSearch, FaTrash, FaEye, FaFilter, FaUser, FaBuilding, FaCheck, FaTimes, FaEnvelope, FaPhone, FaCalendar, FaMapMarkerAlt, FaBriefcase, FaUniversity, FaFile, FaInfo, FaDownload, FaUserCheck, FaUsers, FaGlobe, FaStar } from "react-icons/fa";
import Sidebar from "../../Components/Sidebar";
import CompanyReviews from '../../Components/CompanyReviews';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [resumeError, setResumeError] = useState(null);
  const [auth] = useAuth();
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.token || auth?.user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [auth, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/adminroute/users", {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized access. Please login as admin.');
        }
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      if (!auth?.token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/adminroute/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== id));
      setError(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(error.message || "Failed to delete user");
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUser(null);
  };

  const handleViewResume = async (resumePath) => {
    if (!resumePath) {
      setResumeError("No resume available");
      return;
    }

    try {
      if (!auth?.token) {
        navigate('/login');
        return;
      }

      // Ensure the path always starts with 'Uploads/' (capital U)
      let cleanPath = resumePath.replace(/^\/+/, '');
      if (!cleanPath.toLowerCase().startsWith('uploads/')) {
        cleanPath = 'Uploads/' + cleanPath.replace(/^uploads[\\/]+/i, '');
      } else {
        // Ensure the U is uppercase
        cleanPath = 'Uploads/' + cleanPath.slice(8);
      }
      const resumeUrl = `http://localhost:5000/${cleanPath}`;

      console.log('Fetching resume from:', resumeUrl); // Debug log

      const response = await fetch(resumeUrl, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resume: ${response.statusText}`);
      }

      // Create object URL from blob
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      setResumeUrl(objectUrl);
      setIsResumeModalOpen(true);
      setResumeError(null);
    } catch (error) {
      console.error('Error fetching resume:', error);
      setResumeError(error.message || "Failed to load resume");
    }
  };

  const closeResumeModal = () => {
    if (resumeUrl) {
      URL.revokeObjectURL(resumeUrl); // Clean up the object URL
    }
    setIsResumeModalOpen(false);
    setResumeUrl(null);
    setResumeError(null);
  };

  const handleApproveEmployer = async (id) => {
    if (!window.confirm("Are you sure you want to approve this employer?")) return;

    try {
      if (!auth?.token) {
        navigate('/login');
        return;
      }

      console.log('Sending approval request for user:', id);
      
      const response = await fetch('http://localhost:5000/api/adminroute/approve-reject', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employerId: id, action: 'approve' })
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(users.map(user => 
          user._id === id 
            ? { ...user, isApproved: true }
            : user
        ));
        if (data.emailWarning) {
          alert('Employer approved, but email could not be sent.');
        } else {
          alert('Employer approved successfully.');
        }
        fetchUsers();
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to approve employer');
      }
    } catch (err) {
      console.error("Error approving employer:", err);
      setError(err.message || "Failed to approve employer");
      alert(err.message || "Failed to approve employer");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectEmployer = async (id) => {
    if (!window.confirm("Are you sure you want to reject (delete) this employer?")) return;
    try {
      if (!auth?.token) {
        navigate('/login');
        return;
      }
      const response = await fetch(`http://localhost:5000/api/adminroute/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        let errorMessage = 'Failed to reject employer';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
      }
      setUsers(users.filter(user => user._id !== id));
      alert('Admin rejected the employer.');
      fetchUsers();
    } catch (error) {
      console.error("Error rejecting employer:", error);
      setError(error.message || "Failed to reject employer");
      alert(error.message || "Failed to reject employer");
    }
  };

  const handleViewCompany = async (user) => {
    setCompanyProfile(null);
    setCompanyError(null);
    setCompanyLoading(true);
    setIsCompanyModalOpen(true);
    try {
      // First check if we have the companyId
      if (!user.companyId) {
        throw new Error('No company ID found for this user');
      }

      // Fetch company using companyId
      const response = await fetch(`http://localhost:5000/api/company/${user.companyId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company profile');
      }

      const data = await response.json();
      console.log('Company data:', data); // Debug log
      setCompanyProfile(data);
    } catch (error) {
      console.error('Error fetching company:', error);
      setCompanyError(error.message || 'Failed to load company profile');
    } finally {
      setCompanyLoading(false);
    }
  };

  const closeCompanyModal = () => {
    setIsCompanyModalOpen(false);
    setCompanyProfile(null);
    setCompanyError(null);
  };

  const filteredUsers = users.filter(user => {
    // Exclude admins from the table
    if (user.role && user.role.toLowerCase() === 'admin') return false;
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || user.role.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Updated profile completion check
  const checkProfileCompletion = (user) => {
    if (user.role.toLowerCase() === 'jobseeker') {
      // Check if user has skills
      const hasSkills = user.skills && Array.isArray(user.skills) && user.skills.length > 0;
      
      return {
        isComplete: hasSkills,
        message: hasSkills ? 'Complete' : 'Incomplete'
      };
    }
    return { isComplete: true, message: 'Complete' }; // For employers
  };

  // Update the visibility check to use companyId
  const hasCompanyProfile = (user) => {
    return user && user.companyId;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
              <div>
                  <h1 className="text-3xl font-bold text-teal-800">Manage Users</h1>
                  <p className="text-gray-600">View and manage all registered users</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
              <input
                type="text"
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
                  <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            </div>
                <div className="relative">
            <select
                    className="appearance-none pl-10 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="jobseeker">Job Seekers</option>
              <option value="employer">Employers</option>
            </select>
                  <FaFilter className="absolute left-3 top-3.5 text-gray-400" />
                </div>
          </div>
        </div>

            {/* Error Message */}
        {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaTimes className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
          </div>
        )}

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mt-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex justify-center">
                            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="text-gray-500 text-lg">No users found</div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const { isComplete, message } = checkProfileCompletion(user);
                        return (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.phone || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role.toLowerCase() === 'employer' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>{user.role}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {user.role.toLowerCase() === 'jobseeker' ? (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{message}</span>
                              ) : (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{user.isApproved ? 'Approved' : 'Pending'}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewProfile(user)}
                                  className="p-2 text-gray-400 hover:text-teal-600 transition-colors duration-200"
                                  title="View Profile"
                                >
                                  <FaEye className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                                  title="Delete User"
                                >
                                  <FaTrash className="w-5 h-5" />
                                </button>
                                {user.role.toLowerCase() === 'employer' && !user.isApproved && (
                                  <>
                                    <button
                                      onClick={() => handleApproveEmployer(user._id)}
                                      className="p-2 text-green-500 hover:text-green-700 transition-colors duration-200"
                                      title="Approve Employer"
                                    >
                                      <FaCheck className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => handleRejectEmployer(user._id)}
                                      className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                                      title="Reject Employer"
                                    >
                                      <FaTimes className="w-5 h-5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Resume Modal */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl w-full max-w-5xl mx-4 h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Resume Viewer</h3>
              <div className="flex space-x-2">
                <a
                  href={resumeUrl}
                  download
                  className="p-2 text-gray-600 hover:text-teal-600 transition-colors"
                  title="Download Resume"
                >
                  <FaDownload className="w-5 h-5" />
                </a>
                <button
                  onClick={closeResumeModal}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 bg-gray-100 overflow-hidden">
              {resumeError ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <FaTimes className="w-12 h-12 text-red-500 mb-4" />
                  <p className="text-lg text-gray-700">{resumeError}</p>
                </div>
              ) : (
                <div className="w-full h-full bg-white rounded-lg shadow-lg">
                  <embed
                    src={resumeUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-full ${
                    selectedUser.role.toLowerCase() === 'employer' ? 'bg-purple-100' : 'bg-blue-100'
                  }`}>
                    {selectedUser.role.toLowerCase() === 'employer' ? (
                      <FaBuilding className="w-8 h-8 text-purple-600" />
                    ) : (
                      <FaUser className="w-8 h-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h2>
                    <p className="text-gray-500">{selectedUser.role}</p>
                  </div>
                </div>
                <button
                  onClick={closeProfileModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <FaEnvelope className="text-gray-400" />
                      <span className="text-gray-600">{selectedUser.email}</span>
                    </div>
                    {selectedUser.phone && (
                      <div className="flex items-center space-x-3">
                        <FaPhone className="text-gray-400" />
                        <span className="text-gray-600">{selectedUser.phone}</span>
                      </div>
                    )}
                    {selectedUser.location && (
                      <div className="flex items-center space-x-3">
                        <FaMapMarkerAlt className="text-gray-400" />
                        <span className="text-gray-600">{selectedUser.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                  <div className="space-y-4">
                    {selectedUser.role.toLowerCase() === 'jobseeker' ? (
                      <>
                        {selectedUser.education && (
                          <div className="flex items-start space-x-3">
                            <FaUniversity className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Education</p>
                              <p className="text-sm text-gray-600">{selectedUser.education}</p>
                            </div>
                          </div>
                        )}
                        {selectedUser.bio && (
                          <div className="flex items-start space-x-3">
                            <FaUser className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Bio</p>
                              <p className="text-sm text-gray-600">{selectedUser.bio}</p>
                            </div>
                          </div>
                        )}
                        {selectedUser.experience && (
                          <div className="flex items-start space-x-3">
                            <FaBriefcase className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Experience</p>
                              <p className="text-sm text-gray-600">{selectedUser.experience}</p>
                            </div>
                          </div>
                        )}
                        {selectedUser.skills && selectedUser.skills.length > 0 && (
                          <div className="flex items-start space-x-3">
                            <FaCheck className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Skills</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedUser.skills.map((skill, index) => (
                                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedUser.resume && (
                          <div className="flex items-start space-x-3">
                            <FaFile className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Resume</p>
                        <button
                                onClick={() => handleViewResume(selectedUser.resume)}
                                className="text-sm text-teal-600 hover:text-teal-800 hover:underline flex items-center space-x-1 mt-1"
                        >
                                <FaEye className="w-4 h-4" />
                                <span>View Resume</span>
                        </button>
                              {resumeError && (
                                <p className="text-sm text-red-600 mt-1">{resumeError}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {selectedUser.companyName && (
                          <div className="flex items-start space-x-3">
                            <FaBuilding className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Company Name</p>
                              <p className="text-sm text-gray-600">{selectedUser.companyName}</p>
                            </div>
                          </div>
                        )}
                        {selectedUser.companyLocation && (
                          <div className="flex items-start space-x-3">
                            <FaMapMarkerAlt className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Company Location</p>
                              <p className="text-sm text-gray-600">{selectedUser.companyLocation}</p>
                            </div>
                          </div>
                        )}
                        {selectedUser.companyDescription && (
                          <div className="flex items-start space-x-3">
                            <FaInfo className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Company Description</p>
                              <p className="text-sm text-gray-600">{selectedUser.companyDescription}</p>
                            </div>
                          </div>
                        )}
                        {selectedUser.skills && selectedUser.skills.length > 0 && (
                          <div className="flex items-start space-x-3">
                            <FaCheck className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Required Skills</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {selectedUser.skills.map((skill, index) => (
                                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedUser.companyDocuments && (
                          <div className="flex items-start space-x-3">
                            <FaFile className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Company Documents</p>
                              <div className="space-y-1 mt-1">
                                {selectedUser.companyDocuments.map((doc, index) => (
                                  <a 
                                    key={index}
                                    href={doc.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block text-sm text-teal-600 hover:text-teal-800 hover:underline"
                                  >
                                    {doc.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Status Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                  <div className="space-y-4">
                    {selectedUser.role.toLowerCase() === 'jobseeker' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Profile Status</span>
                          {(() => {
                            const { isComplete, message } = checkProfileCompletion(selectedUser);
                            return (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {message}
                              </span>
                            );
                          })()}
                        </div>
                        {!checkProfileCompletion(selectedUser).isComplete && (
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div className="flex">
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  Please add your skills to complete your profile.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Account Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            selectedUser.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedUser.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Company Profile</span>
                          {hasCompanyProfile(selectedUser) ? (
                            <button
                              onClick={() => handleViewCompany(selectedUser)}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                            >
                              View Company Profile
                            </button>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              No Company Profile
                          </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Resume section with error handling */}
              {selectedUser.role.toLowerCase() === 'jobseeker' && (
                <div className="bg-gray-50 rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Resume</h3>
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <FaFile className="text-gray-400 mt-1" />
                      <div>
                        <button
                          onClick={() => handleViewResume(selectedUser.resume)}
                          className="text-sm text-teal-600 hover:text-teal-800 hover:underline flex items-center space-x-1"
                        >
                          <FaEye className="w-4 h-4" />
                          <span>View Resume</span>
                        </button>
                        {resumeError && (
                          <p className="text-sm text-red-600 mt-1">
                            {resumeError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCompanyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {companyLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : companyError ? (
              <div className="text-red-600 text-center p-4">{companyError}</div>
            ) : companyProfile ? (
              <div className="bg-white rounded-lg overflow-hidden">
                {/* Teal Header Background */}
                <div className="bg-teal-600 h-48 relative">
                  {/* Close Button */}
                  <button
                    onClick={closeCompanyModal}
                    className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                  >
                    <FaTimes className="w-6 h-6" />
                  </button>
                  
                  {/* Company Logo */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden bg-white border-4 border-white">
                      {(() => {
                        let logoSrc = 'https://via.placeholder.com/150';
                        if (companyProfile.logo) {
                          if (companyProfile.logo.startsWith('http')) {
                            logoSrc = companyProfile.logo;
                          } else if (companyProfile.logo.startsWith('/Uploads')) {
                            logoSrc = `http://localhost:5000${companyProfile.logo}`;
                          } else {
                            logoSrc = `http://localhost:5000/Uploads/${companyProfile.logo}`;
                          }
                        }
                        return (
                          <img 
                            src={logoSrc} 
                            alt={companyProfile.name} 
                            className="w-full h-full object-cover"
                          />
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="px-8 pb-8 pt-16">
                  <div className="text-center pt-4 pb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{companyProfile.name}</h2>
                    <p className="text-gray-600">{companyProfile.industry}</p>
                  </div>
                  {/* Company Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 justify-items-center">
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-gray-500">Industry</h3>
                      <p className="mt-1">{companyProfile.industry}</p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p className="mt-1">{companyProfile.location}</p>
                    </div>
                    <div className="text-center">
                      <h3 className="text-sm font-medium text-gray-500">Established</h3>
                      <p className="mt-1">{new Date(companyProfile.establishedDate).toLocaleDateString()}</p>
                    </div>
                    {companyProfile.employeeCount && (
                      <div className="text-center">
                        <h3 className="text-sm font-medium text-gray-500">Employees</h3>
                        <p className="mt-1">{companyProfile.employeeCount}</p>
                      </div>
                    )}
                    {companyProfile.website && (
                      <div className="md:col-span-2 text-center">
                        <h3 className="text-sm font-medium text-gray-500">Website</h3>
                        <a
                          href={companyProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 text-teal-600 hover:text-teal-800"
                        >
                          {companyProfile.website}
                        </a>
                      </div>
                    )}
                  </div>
                  {/* Description Section */}
                  <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="text-gray-700">{companyProfile.description}</p>
                  </div>
                  {/* Reviews Section */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <CompanyReviews companyId={companyProfile._id} readOnly={true} hideHeading={true} />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
