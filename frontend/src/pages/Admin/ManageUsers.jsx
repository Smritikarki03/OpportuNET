import { useEffect, useState } from "react";
import Sidebar from "../../Components/Sidebar"; // Fixed the import path to lowercase "components"
import { FaTrash } from "react-icons/fa";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    // Add confirmation dialog
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    console.log("Deleting user with ID:", id); // Log the ID for debugging

    fetch(`http://localhost:5000/api/users/${id}`, { method: "DELETE" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to delete user");
        setUsers(users.filter((user) => user._id !== id));
        setError(null); // Clear any previous errors
      })
      .catch((err) => {
        console.error(err);
        setError(err.message); // Display error on UI
      });
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error && users.length === 0) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar />
      <div className="flex-1 p-8 ml-64">
        <h1 className="text-2xl font-semibold text-teal-800 mb-8">MANAGE USERS</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-teal-800 mb-4">User List</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {users.length === 0 ? (
            <p className="text-gray-600">No users found.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-teal-50 text-teal-800">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="p-3">{user.firstName} {user.lastName}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition flex items-center"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
