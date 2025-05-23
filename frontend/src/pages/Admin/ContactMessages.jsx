import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/auth";
import Sidebar from "../../Components/Sidebar";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

const ContactMessages = () => {
  const [auth] = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/adminroute/contact-messages", {
          headers: { Authorization: `Bearer ${auth.token}` },
        });
        setMessages(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch contact messages.");
        setLoading(false);
      }
    };
    fetchMessages();
  }, [auth]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/adminroute/contact-messages/${id}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
      setSuccess("Message deleted successfully.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError("Failed to delete message.");
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-teal-800">Contact Messages</h2>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {messages.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-400">No messages found.</td>
                  </tr>
                )}
                {messages.map((msg, idx) => (
                  <tr
                    key={msg._id}
                    className={idx % 2 === 0 ? "bg-gray-50 hover:bg-gray-100" : "bg-white hover:bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-teal-800">{msg.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-teal-600 underline">{msg.email}</td>
                    <td className="px-6 py-4 whitespace-pre-line text-gray-700">{msg.message}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(msg._id)}
                        className="text-teal-500 hover:text-teal-700 transition-transform duration-150 transform hover:scale-125 focus:outline-none"
                        title="Delete"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactMessages; 