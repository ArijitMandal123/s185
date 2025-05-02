import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase"; // Import db from firebase.js
import { doc, setDoc } from "firebase/firestore"; // Correct imports from firebase/firestore

function ProfileForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [techStack, setTechStack] = useState("");
  const [preferences, setPreferences] = useState("");
  const [mode, setMode] = useState("");
  const [location, setLocation] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [linkedinLink, setLinkedinLink] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth(); // Get userId from AuthContext

  // New state variables for additional fields
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [projectInterests, setProjectInterests] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [timezone, setTimezone] = useState("");
  const [languages, setLanguages] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [projectDuration, setProjectDuration] = useState("");
  const [activeStep, setActiveStep] = useState(1);
  const [bio, setBio] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    if (!userId) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", userId);
      await setDoc(userDocRef, {
        name,
        email,
        bio,
        techStack: techStack.split(",").map((item) => item.trim()),
        preferences,
        mode,
        location,
        github: githubLink,
        linkedin: linkedinLink,
        role,
        experience,
        availability,
        projectInterests: projectInterests
          .split(",")
          .map((item) => item.trim()),
        communicationStyle,
        timezone,
        languages: languages.split(",").map((item) => item.trim()),
        portfolio,
        teamSize,
        projectDuration,
        createdAt: new Date().toISOString(),
      });

      setSuccessMessage("Profile created successfully!");
      // Reset form fields
      setName("");
      setEmail("");
      setBio("");
      setTechStack("");
      setPreferences("");
      setMode("");
      setLocation("");
      setGithubLink("");
      setLinkedinLink("");
      setRole("");
      setExperience("");
      setAvailability("");
      setProjectInterests("");
      setCommunicationStyle("");
      setTimezone("");
      setLanguages("");
      setPortfolio("");
      setTeamSize("");
      setProjectDuration("");
    } catch (firebaseError) {
      setError("Failed to create profile: " + firebaseError.message);
    } finally {
      setLoading(false);
    }
  }

  const nextStep = () => {
    setActiveStep(activeStep + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
    window.scrollTo(0, 0);
  };

  const inputStyle =
    "shadow-sm border border-gray-300 rounded-md py-2.5 px-4 bg-white text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200";
  const labelStyle = "block text-gray-700 text-sm font-medium mb-2";
  const selectStyle =
    "shadow-sm border border-gray-300 rounded-md py-2.5 px-4 bg-white text-gray-700 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200";

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Step {activeStep} of 3
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round((activeStep / 3) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full"
            style={{ width: `${(activeStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div className="pb-3 mb-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Basic Information
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Let's start with your basic details.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className={labelStyle}>
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className={labelStyle}>
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="bio" className={labelStyle}>
              Short Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={`${inputStyle} h-24`}
              placeholder="Tell us a bit about yourself..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="role" className={labelStyle}>
                Preferred Role *
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={selectStyle}
                required
              >
                <option value="">Select Role</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">
                  Full Stack Developer
                </option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Mobile Developer">Mobile Developer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Project Manager">Project Manager</option>
              </select>
            </div>
            <div>
              <label htmlFor="experience" className={labelStyle}>
                Experience Level *
              </label>
              <select
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className={selectStyle}
                required
              >
                <option value="">Select Experience</option>
                <option value="Beginner">Beginner (0-1 years)</option>
                <option value="Intermediate">Intermediate (1-3 years)</option>
                <option value="Advanced">Advanced (3-5 years)</option>
                <option value="Expert">Expert (5+ years)</option>
              </select>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="ml-3 inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Skills & Interests */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="pb-3 mb-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Skills & Interests
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tell us about your technical skills and project interests.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="languages" className={labelStyle}>
                Programming Languages *
              </label>
              <input
                type="text"
                id="languages"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className={inputStyle}
                placeholder="e.g., JavaScript, Python, Java"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Comma-separated list</p>
            </div>
            <div>
              <label htmlFor="techStack" className={labelStyle}>
                Tech Stack *
              </label>
              <input
                type="text"
                id="techStack"
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                className={inputStyle}
                placeholder="e.g., React, Node.js, MongoDB"
                required
              />
              <p className="mt-1 text-xs text-gray-500">Comma-separated list</p>
            </div>
          </div>

          <div>
            <label htmlFor="projectInterests" className={labelStyle}>
              Project Interests *
            </label>
            <input
              type="text"
              id="projectInterests"
              value={projectInterests}
              onChange={(e) => setProjectInterests(e.target.value)}
              className={inputStyle}
              placeholder="e.g., Web Development, Machine Learning, Mobile Apps"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Comma-separated list</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="portfolio" className={labelStyle}>
                Portfolio URL
              </label>
              <input
                type="url"
                id="portfolio"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className={inputStyle}
                placeholder="https://your-portfolio.com"
              />
            </div>
            <div>
              <label htmlFor="availability" className={labelStyle}>
                Availability *
              </label>
              <select
                id="availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className={selectStyle}
                required
              >
                <option value="">Select Availability</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Weekends">Weekends</option>
                <option value="Evenings">Evenings</option>
              </select>
            </div>
          </div>

          <div className="pt-5">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex justify-center py-2.5 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="ml-3 inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preferences & Links */}
      {activeStep === 3 && (
        <div className="space-y-6">
          <div className="pb-3 mb-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Preferences & Social Links
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tell us how you like to work and connect with others.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="mode" className={labelStyle}>
                Work Mode *
              </label>
              <select
                id="mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={selectStyle}
                required
              >
                <option value="">Select Mode</option>
                <option value="In-person">In-person</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label htmlFor="location" className={labelStyle}>
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputStyle}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="timezone" className={labelStyle}>
                Timezone *
              </label>
              <input
                type="text"
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className={inputStyle}
                placeholder="e.g., UTC-5, IST"
                required
              />
            </div>
            <div>
              <label htmlFor="communicationStyle" className={labelStyle}>
                Communication Style
              </label>
              <select
                id="communicationStyle"
                value={communicationStyle}
                onChange={(e) => setCommunicationStyle(e.target.value)}
                className={selectStyle}
              >
                <option value="">Select Style</option>
                <option value="Direct">Direct</option>
                <option value="Collaborative">Collaborative</option>
                <option value="Detailed">Detailed</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="teamSize" className={labelStyle}>
                Preferred Team Size
              </label>
              <select
                id="teamSize"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className={selectStyle}
              >
                <option value="">Select Size</option>
                <option value="2-3">2-3 members</option>
                <option value="4-6">4-6 members</option>
                <option value="7-10">7-10 members</option>
                <option value="10+">10+ members</option>
              </select>
            </div>
            <div>
              <label htmlFor="projectDuration" className={labelStyle}>
                Preferred Project Duration
              </label>
              <select
                id="projectDuration"
                value={projectDuration}
                onChange={(e) => setProjectDuration(e.target.value)}
                className={selectStyle}
              >
                <option value="">Select Duration</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="2-4 weeks">2-4 weeks</option>
                <option value="1-2 months">1-2 months</option>
                <option value="2+ months">2+ months</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="githubLink" className={labelStyle}>
                GitHub Link
              </label>
              <input
                type="url"
                id="githubLink"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className={inputStyle}
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label htmlFor="linkedinLink" className={labelStyle}>
                LinkedIn Link
              </label>
              <input
                type="url"
                id="linkedinLink"
                value={linkedinLink}
                onChange={(e) => setLinkedinLink(e.target.value)}
                className={inputStyle}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="preferences" className={labelStyle}>
              Additional Preferences
            </label>
            <textarea
              id="preferences"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              className={`${inputStyle} h-24`}
              placeholder="Any additional preferences or requirements for your ideal hackathon experience..."
            ></textarea>
          </div>

          <div className="pt-5">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex justify-center py-2.5 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Previous
              </button>
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                {loading ? "Creating Profile..." : "Complete Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default ProfileForm;
