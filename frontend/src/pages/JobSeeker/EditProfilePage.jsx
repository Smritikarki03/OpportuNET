import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth";

const EditProfilePage = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || JSON.parse(localStorage.getItem("user")) || {};

  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    skills: user.skills?.join(", ") || "",
    bio: user.bio || "", // Add bio field
  });
  const [imageFile, setImageFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    console.log(`Updating ${e.target.name}:`, e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "image") {
      console.log("Image file selected:", files[0]);
      setImageFile(files[0]);
    } else if (name === "cv") {
      console.log("CV file selected:", files[0]);
      setCvFile(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = auth.token;
      if (!token) {
        setError("No authentication token found. Please log in.");
        setIsLoading(false);
        return;
      }
      console.log("FormData state before submission:", formData); // Add this log

      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.name);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("skills", formData.skills);
      formDataToSend.append("bio", formData.bio); // Add bio to FormData
      if (imageFile) formDataToSend.append("image", imageFile);
      if (cvFile) formDataToSend.append("cv", cvFile);

      // Log FormData contents
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch("http://localhost:5000/api/auth/editProfile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();
      console.log("Response from server:", result);

      if (response.ok) {
        // Update localStorage with the new user data
        const updatedUser = {
          ...user,
          name: formData.name,
          phone: formData.phone,
          skills: formData.skills ? formData.skills.split(",").map((skill) => skill.trim()) : [],
          resume: result.user.resume || user.resume,
          image: result.user.image || user.image,
          bio: result.user.bio || formData.bio, // Include bio in updatedUser
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        navigate("/profile", { state: { updateMessage: "Profile updated successfully" } });
      } else {
        setError(result.message || "Failed to update profile.");
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-teal-700 mb-6">Edit Profile</h1>

        {error && <div className="text-center text-red-500 mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Enter your full name"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="e.g., JavaScript, React, Node.js"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Tell us about yourself..."
              rows="4"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Profile Image (JPEG/PNG)</label>
            <input
              type="file"
              name="image"
              accept="image/jpeg,image/png"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-lg"
            />
            {user.image && (
              <p className="mt-2 text-teal-600">
                Current image: <a href={`http://localhost:5000${user.image}`} target="_blank" rel="noopener noreferrer">View</a>
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Resume (PDF)</label>
            <input
              type="file"
              name="cv"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full p-2 border rounded-lg"
            />
            {user.resume && (
              <p className="mt-2 text-teal-600">
                Current resume: <a href={`http://localhost:5000${user.resume}`} target="_blank" rel="noopener noreferrer">View</a>
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;