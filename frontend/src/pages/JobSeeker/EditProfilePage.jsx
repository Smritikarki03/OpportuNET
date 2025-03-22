// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/auth";

// const ProfilePage = () => {
//   const [user, setUser] = useState(null);
//   const [profile, setProfile] = useState(null); // For EditProfilePage data
//   const [auth] = useAuth();
//   const [showPopup, setShowPopup] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Fetch user data
//   useEffect(() => {
//     fetchUserData();
//     // Refetch data if returning from edit with update message
//     if (location.state?.updateMessage) {
//       fetchUserData();
//     }
//   }, [location.state]);

//   const fetchUserData = async () => {
//     try {
//       setIsLoading(true);
//       const token = auth.token;
//       if (!token) {
//         setError("No authentication token found. Please log in.");
//         setIsLoading(false);
//         return;
//       }

//       const response = await fetch("http://localhost:5000/api/auth/userInfo", {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${auth.token}`,
//         },
//       });

//       const result = await response.json();
//       console.log("API Response:", result);

//       if (response.ok) {
//         setUser(result);
//         localStorage.setItem("user", JSON.stringify(result));
//         // Load EditProfilePage data from localStorage
//         const storedProfile = JSON.parse(localStorage.getItem("profile")) || {};
//         setProfile(storedProfile);
//         // Show popup if first login
//         if (result.role === "jobseeker" && !result.isProfileViewed) {
//           setShowPopup(true);
//           updateProfileViewed();
//         }
//       } else {
//         setError(result.message || "Failed to load user data.");
//       }
//     } catch (error) {
//       console.error("Network Error:", error);
//       setError("Network error. Please check your connection and try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Update profile viewed status
//   const updateProfileViewed = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const response = await fetch("http://localhost:5000/api/auth/updateProfileViewed", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ isProfileViewed: true }),
//       });
//       const result = await response.json();
//       if (response.ok) {
//         setUser((prev) => ({ ...prev, isProfileViewed: true }));
//         localStorage.setItem("user", JSON.stringify({ ...user, isProfileViewed: true }));
//       }
//     } catch (error) {
//       console.error("Error updating profile viewed status:", error);
//     }
//   };

//   const closePopup = () => {
//     setShowPopup(false);
//   };

//   if (isLoading) return <div className="text-center text-gray-500">Loading...</div>;
//   if (error) return <div className="text-center text-red-500">{error}</div>;
//   if (!user) return <div className="text-center text-gray-500">Please log in to view your profile.</div>;

//   // Map EditProfilePage fields to ProfilePage display
//   const displayName = profile?.fullName || user.name || "User Name";
//   const displayBio = profile?.bio || user.role || "Job Seeker";
//   const displayPhone = profile?.phone || user.phone || "9000000000";
//   const displaySkills = profile?.skills ? profile.skills.split(",").map((skill) => skill.trim()) : [];
//   const displayCV = profile?.cv || user.resume || "";
//   const displayImage = profile?.image || null;

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       {/* Profile Card */}
//       <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             {/* Profile Picture */}
//             {displayImage ? (
//               <img
//                 src={displayImage}
//                 alt="Profile"
//                 className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
//               />
//             ) : (
//               <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
//                 <span className="text-gray-500">Profile</span>
//               </div>
//             )}
//             <div>
//               <h1 className="text-xl font-bold text-gray-800">{displayName}</h1>
//               <p className="text-gray-600">{displayBio}</p>
//               <div className="text-gray-600 flex items-center space-x-2 mt-1">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-4 w-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M16 12h2a4 4 0 00-4-4v4zm0 0H8m8 0v4a4 4 0 01-4 4v-4m0 0H8m-4 0a4 4 0 014-4v4m0 0H4m4 0a4 4 0 004 4v-4"
//                   />
//                 </svg>
//                 <span>{user.email || "Not provided"}</span>
//               </div>
//               <div className="text-gray-600 flex items-center space-x-2 mt-1">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-4 w-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
//                   />
//                 </svg>
//                 <span>{displayPhone}</span>
//               </div>
//             </div>
//           </div>
//           <button
//             onClick={() => navigate("/edit-profile")}
//             className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition text-sm font-medium"
//           >
//             Edit Profile
//           </button>
//         </div>

//         {/* Skills Section */}
//         <div className="mt-6">
//           <h2 className="text-lg font-semibold text-gray-800">Skills</h2>
//           <div className="mt-2 flex flex-wrap gap-2">
//             {displaySkills.length > 0 ? (
//               displaySkills.map((skill, index) => (
//                 <span
//                   key={index}
//                   className="bg-gray-800 text-white text-sm font-medium px-3 py-1 rounded-full"
//                 >
//                   {skill}
//                 </span>
//               ))
//             ) : (
//               <p className="text-gray-500">No skills added yet.</p>
//             )}
//           </div>
//         </div>

//         {/* Resume Section */}
//         <div className="mt-6">
//           <h2 className="text-lg font-semibold text-gray-800">Resume</h2>
//           <p className="mt-2 text-blue-600">
//             <a href={displayCV || "#"} target="_blank" rel="noopener noreferrer">
//               {displayCV ? "View Resume" : "No resume uploaded"}
//             </a>
//           </p>
//         </div>
//       </div>

//       {/* Applied Jobs Section */}
//       <div className="max-w-4xl mx-auto mt-8 bg-white shadow-lg rounded-lg p-6">
//         <h2 className="text-lg font-semibold text-gray-800 mb-4">Applied Jobs</h2>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead>
//               <tr className="text-gray-600 border-b">
//                 <th className="py-2 px-4">Date</th>
//                 <th className="py-2 px-4">Job Role</th>
//                 <th className="py-2 px-4">Company</th>
//                 <th className="py-2 px-4">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {user.appliedJobs?.length > 0 ? (
//                 user.appliedJobs.map((job, index) => (
//                   <tr key={index} className="border-b hover:bg-gray-50">
//                     <td className="py-2 px-4">{job.date || "N/A"}</td>
//                     <td className="py-2 px-4">{job.role || "N/A"}</td>
//                     <td className="py-2 px-4">{job.company || "N/A"}</td>
//                     <td className="py-2 px-4">
//                       <span
//                         className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
//                           job.status === "PENDING"
//                             ? "bg-gray-200 text-gray-800"
//                             : "bg-green-200 text-green-800"
//                         }`}
//                       >
//                         {job.status || "N/A"}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4" className="py-2 px-4 text-gray-500">
//                     No jobs applied yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Popup */}
//       {showPopup && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
//             <h2 className="text-2xl font-bold text-teal-700 mb-4">Welcome, {displayName}!</h2>
//             <p className="mb-4">This is your first time viewing your profile. Please complete your profile to unlock more features!</p>
//             <button
//               onClick={() => navigate("/edit-profile")}
//               className="bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition"
//             >
//               Complete Profile
//             </button>
//             <button
//               onClick={closePopup}
//               className="ml-4 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfilePage;