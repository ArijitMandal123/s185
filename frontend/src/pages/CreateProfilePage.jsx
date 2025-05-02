import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProfileForm from "../components/ProfileForm";

function CreateProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 px-4 relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-1/4 right-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="container mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Create Your Developer Profile
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Let other developers and teams discover your skills and interests
            for upcoming hackathons.
          </p>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            className="w-full h-8 md:h-16"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              className="fill-gray-50"
            ></path>
          </svg>
        </div>
      </div>

      {/* Form Section */}
      <div className="container mx-auto px-4 py-8 -mt-6 md:-mt-10 relative z-20">
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100 max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 shadow-md">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Profile Information
            </h2>
          </div>

          <div className="text-gray-600 mb-8">
            <p>
              Complete your developer profile to connect with the perfect
              hackathon teammates. All fields marked with * are required.
            </p>
          </div>

          <ProfileForm />
        </div>
      </div>
    </div>
  );
}

export default CreateProfilePage;
