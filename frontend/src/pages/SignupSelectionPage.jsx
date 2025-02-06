import React from "react";
import { Link } from "react-router-dom";

const SignUpSelectionPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-600 to-teal-700">
      <div className="w-full max-w-3xl p-12 bg-white rounded-lg shadow-xl space-y-8">
        <h2 className="text-4xl font-bold text-center text-teal-700">Choose Your Sign-Up Option</h2>
        <p className="text-center text-lg text-gray-600">
          Select your role to get started and create an account.
        </p>
        
        <div className="flex justify-center gap-8">
          {/* Job Seeker Option */}
          <Link to="/signup">
            <div className="w-72 h-56 bg-white rounded-lg shadow-xl overflow-hidden cursor-pointer transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 text-center">
              <h3 className="text-2xl font-semibold text-teal-700">Job Seeker</h3>
              <p className="mt-2 text-sm text-gray-500">Find your dream job with ease.</p>
              <button className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-lg w-full transform transition duration-300 hover:bg-teal-800">
                Sign Up Now
              </button>
            </div>
          </Link>
          
          {/* Employer Option */}
          <Link to="/employerSignup">
            <div className="w-72 h-56 bg-white rounded-lg shadow-xl overflow-hidden cursor-pointer transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 text-center">
              <h3 className="text-2xl font-semibold text-teal-700">Employer</h3>
              <p className="mt-2 text-sm text-gray-500">Post jobs and find top talent.</p>
              <button className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-lg w-full transform transition duration-300 hover:bg-teal-800">
                Sign Up Now
              </button>
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-teal-700 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpSelectionPage;
