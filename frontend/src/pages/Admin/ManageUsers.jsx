import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar";
import { FaTrash, FaSearch, FaUser, FaUserTie, FaUserShield } from "react-icons/fa";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    // Fetch all users from different endpoints and combine them
    Promise.all([
      fetch("http://localhost:5000/api/employer"),
      fetch("http://localhost:5000/api/company")
    ])
      .then(([employerRes, companyRes]) => {
        if (!employerRes.ok) throw new Error("Failed to fetch employers");
        if (!companyRes.ok) throw new Error("Failed to fetch companies");
        return Promise.all([employerRes.json(), companyRes.json()]);
      })
      .then(([employers, companies]) => {
        // Transform the data to match the expected format
        const transformedUsers = [
          ...employers.map(emp => ({
            _id: emp._id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            role: 'employer'
          })),
          ...companies.map(comp => ({
            _id: comp._id,
            firstName: comp.companyName,
            lastName: '',
            email: comp.email,
            role: 'company'
          }))
        ];
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    // Determine which endpoint to use based on user role
    const user = users.find(u => u._id === id);
    const endpoint = user.role === 'employer' 
      ? `http://localhost:5000/api/employer/${id}`
      : `http://localhost:5000/api/company/${id}`;

    fetch(endpoint, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete user");
        setUsers(users.filter((user) => user._id !== id));
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  };

  const getRoleIcon = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <FaUserShield className="text-red-500" />;
      case 'employer':
        return <FaUserTie className="text-blue-500" />;
      case 'company':
        return <FaUserTie className="text-blue-500" />;
      default:
        return <FaUser className="text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 ml-64 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 ml-64 flex justify-center items-center">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <div className="flex-1 p-8 ml-64">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-teal-800">MANAGE USERS</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-teal-800">User List</h2>
            <span className="text-sm text-gray-500">
              Total Users: {filteredUsers.length}
            </span>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-teal-50 text-teal-800">
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                            {getRoleIcon(user.role)}
                          </div>
                          <div>
                            <p className="font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-sm text-gray-500">ID: {user._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${user.role.toLowerCase() === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role.toLowerCase() === 'employer' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition flex items-center"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
