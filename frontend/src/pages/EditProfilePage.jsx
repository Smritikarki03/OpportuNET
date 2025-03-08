// Pages/EditProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const EditProfilePage = () => {
  console.log("EditProfilePage: Component rendering started");
  const [profile, setProfile] = useState({
    image: null,
    fullName: "",
    bio: "",
    phone: "",
    location: "",
    skills: "",
    cv: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    console.log("EditProfilePage: useEffect running");
    const storedProfile = localStorage.getItem("profile");
    if (storedProfile) {
      try {
        console.log("EditProfilePage: Attempting to parse storedProfile", storedProfile);
        const parsedProfile = JSON.parse(storedProfile);
        console.log("EditProfilePage: Profile loaded from localStorage", parsedProfile);
        setProfile((prev) => ({
          ...prev,
          ...parsedProfile,
          image: parsedProfile.image || null,
        }));
      } catch (error) {
        console.error("EditProfilePage: Error parsing profile from localStorage", error);
      }
    } else {
      console.log("EditProfilePage: No profile found in localStorage");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    console.log("EditProfilePage: Input changed", { name, value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, image: reader.result }));
        console.log("EditProfilePage: Image changed", reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfile((prev) => ({ ...prev, image: null }));
    }
  };

  const handleCVChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((prev) => ({ ...prev, cv: file.name }));
      console.log("EditProfilePage: CV changed", file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("EditProfilePage: Submitting updated profile", profile);
    localStorage.setItem("profile", JSON.stringify(profile));
    navigate("/profile", { state: { updateMessage: "Profile updated successfully!" } });
  };

  return (
    <div className="min-h-screen bg-teal-50 flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-10">
        <div className="container mx-auto px-6 py-10">
          <div className="bg-white shadow-xl rounded-lg p-8 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-teal-800 mb-6 text-center">Edit Your Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-teal-700 mb-2">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700"
                />
                {profile.image && typeof profile.image === "string" ? (
                  <div className="mt-4">
                    <p className="text-gray-500 mb-2">Image selected</p>
                    <img
                      src={profile.image}
                      alt="Profile Preview"
                      className="h-32 w-32 object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-gray-500">No file chosen</p>
                )}
              </div>
              <div>
                <label className="block text-lg font-medium text-teal-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleInputChange}
                  className="mt-1 p-3 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-lg"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-teal-700 mb-2">Bio</label>
                <input
                  type="text"
                  name="bio"
                  value={profile.bio}
                  onChange={handleInputChange}
                  className="mt-1 p-3 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-lg"
                  placeholder="e.g., Experienced with 3 years in..."
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-teal-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  className="mt-1 p-3 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-lg"
                  placeholder="e.g., +977 9876543210"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-teal-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleInputChange}
                  className="mt-1 p-3 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-lg"
                  placeholder="e.g., Dhumbari"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-teal-700 mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={profile.skills}
                  onChange={handleInputChange}
                  className="mt-1 p-3 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500 text-lg"
                  placeholder="e.g., Figma, React, MongoDB"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-teal-700 mb-2">CV (PDF)</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleCVChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-700"
                  />
                  <span className="text-gray-500">{profile.cv ? profile.cv : "No file chosen"}</span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition text-lg font-semibold"
              >
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfilePage;