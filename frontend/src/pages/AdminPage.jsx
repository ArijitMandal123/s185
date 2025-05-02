import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState(null); // "user", "team", or "hackathon"

  // Admin credentials (hardcoded for demo purposes)
  const ADMIN_USERNAME = "admin";
  const ADMIN_PASSWORD = "admin";

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setError("");
      localStorage.setItem("adminLoggedIn", "true");
    } else {
      setError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
  };

  useEffect(() => {
    // Check if admin is already logged in
    if (localStorage.getItem("adminLoggedIn") === "true") {
      setIsLoggedIn(true);
    }

    // Only fetch data if logged in
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);

      // Fetch teams
      const teamsSnapshot = await getDocs(collection(db, "teams"));
      const teamsData = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeams(teamsData);

      // Fetch hackathons
      const hackathonsSnapshot = await getDocs(collection(db, "hackathons"));
      const hackathonsData = hackathonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setHackathons(hackathonsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const deleteTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await deleteDoc(doc(db, "teams", teamId));
        setTeams(teams.filter(team => team.id !== teamId));
      } catch (error) {
        console.error("Error deleting team:", error);
      }
    }
  };

  const deleteHackathon = async (hackathonId) => {
    if (window.confirm("Are you sure you want to delete this hackathon?")) {
      try {
        await deleteDoc(doc(db, "hackathons", hackathonId));
        setHackathons(hackathons.filter(hackathon => hackathon.id !== hackathonId));
      } catch (error) {
        console.error("Error deleting hackathon:", error);
      }
    }
  };

  const viewUser = (user) => {
    setSelectedItem(user);
    setViewMode("user");
  };

  const viewTeam = (team) => {
    setSelectedItem(team);
    setViewMode("team");
  };

  const viewHackathon = (hackathon) => {
    setSelectedItem(hackathon);
    setViewMode("hackathon");
  };

  const closeViewMode = () => {
    setSelectedItem(null);
    setViewMode(null);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#261FB3] hover:bg-[#161179] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#261FB3] mx-auto mt-20"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("users")}
              className={`${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              className={`${
                activeTab === "teams"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Teams ({teams.length})
            </button>
            <button
              onClick={() => setActiveTab("hackathons")}
              className={`${
                activeTab === "hackathons"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
            >
              Hackathons ({hackathons.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "users" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {user.role || "participant"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => viewUser(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "teams" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Team Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Hackathon
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Members
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team) => {
                    const hackathon = hackathons.find(h => h.id === team.hackathonId);
                    return (
                      <tr key={team.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{team.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {hackathon ? hackathon.name : "Unknown Hackathon"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {team.members ? team.members.length : 0} members
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => viewTeam(team)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteTeam(team.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "hackathons" && (
            <div className="overflow-x-auto">
              <div className="mb-4 flex justify-end">
                <Link
                  to="/add-hackathon"
                  className="bg-[#261FB3] text-white px-4 py-2 rounded-md hover:bg-[#161179] transition-colors"
                >
                  + Add Hackathon
                </Link>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hackathons.map((hackathon) => {
                    const isActive = hackathon.startDate && new Date(hackathon.startDate) <= new Date() && 
                                     hackathon.endDate && new Date(hackathon.endDate) >= new Date();
                    return (
                      <tr key={hackathon.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{hackathon.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {hackathon.startDate && hackathon.endDate ? 
                              `${new Date(hackathon.startDate).toLocaleDateString()} - ${new Date(hackathon.endDate).toLocaleDateString()}` :
                              "Dates not specified"
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => viewHackathon(hackathon)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteHackathon(hackathon.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Detail View */}
      {viewMode === "user" && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-semibold">User Profile</h3>
              <button onClick={closeViewMode} className="text-black hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4">
              <div className="flex flex-col md:flex-row">
                {/* Left side - profile photo and basic info */}
                <div className="md:w-1/3 p-4">
                  <div className="w-32 h-32 mx-auto bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                    {selectedItem.photoURL ? (
                      <img src={selectedItem.photoURL} alt={selectedItem.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <h4 className="text-xl font-bold">{selectedItem.name}</h4>
                    <p className="text-gray-600 mt-1">{selectedItem.email}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {selectedItem.userId || selectedItem.uid || selectedItem.id}
                    </p>
                    
                    <div className="mt-4 flex justify-center flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {selectedItem.role || "Participant"}
                      </span>
                      {selectedItem.experience && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {selectedItem.experience} Experience
                        </span>
                      )}
                      {selectedItem.isAdmin && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Right side - details */}
                <div className="md:w-2/3 p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bio Section */}
                    <div className="lg:col-span-2">
                      <h5 className="font-medium text-gray-900 mb-2">About</h5>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedItem.bio || "No bio provided"}</p>
                    </div>
                    
                    {/* Links Section */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Links</h5>
                      <div className="flex flex-col space-y-2">
                        {selectedItem.githubUrl ? (
                          <a href={selectedItem.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-gray-900">
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub
                          </a>
                        ) : <p className="text-gray-500 text-sm">No GitHub URL</p>}
                        
                        {selectedItem.linkedinUrl ? (
                          <a href={selectedItem.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-gray-900">
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            LinkedIn
                          </a>
                        ) : <p className="text-gray-500 text-sm">No LinkedIn URL</p>}
                        
                        {selectedItem.portfolioUrl ? (
                          <a href={selectedItem.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-700 hover:text-gray-900">
                            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            Portfolio
                          </a>
                        ) : <p className="text-gray-500 text-sm">No Portfolio URL</p>}
                      </div>
                    </div>
                    
                    {/* Contact & Location */}
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Contact & Location</h5>
                      <div className="space-y-2">
                        {selectedItem.phone && (
                          <div className="flex items-center text-gray-600">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {selectedItem.phone}
                          </div>
                        )}
                        
                        {selectedItem.location && (
                          <div className="flex items-center text-gray-600">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {selectedItem.location}
                          </div>
                        )}
                        
                        {selectedItem.timezone && (
                          <div className="flex items-center text-gray-600">
                            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {selectedItem.timezone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              <div className="p-4 border-t">
                <h5 className="font-medium mb-2">Skills</h5>
                <div className="flex flex-wrap">
                  {selectedItem.skills && selectedItem.skills.length > 0 ? (
                    selectedItem.skills.map((skill, index) => (
                      <span key={index} className="mr-2 mb-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No skills listed</p>
                  )}
                </div>
              </div>

              {/* Additional User Information Section */}
              <div className="p-4 border-t">
                <h5 className="font-medium mb-4">All User Data</h5>
                
                <div className="bg-gray-50 p-4 rounded overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(selectedItem).map(([key, value]) => {
                        // Skip certain keys that are already displayed prominently
                        if (['photoURL', 'name', 'email', 'bio', 'skills', 'githubUrl', 'linkedinUrl', 'portfolioUrl'].includes(key)) {
                          return null;
                        }
                        
                        // Format the value for display
                        let displayValue;
                        if (value === null || value === undefined) {
                          displayValue = <span className="text-gray-400 italic">null</span>;
                        } else if (typeof value === 'boolean') {
                          displayValue = value ? 'true' : 'false';
                        } else if (Array.isArray(value)) {
                          displayValue = value.length ? value.join(', ') : <span className="text-gray-400 italic">[]</span>;
                        } else if (typeof value === 'object') {
                          // Handle timestamps and complex objects
                          if (value.seconds !== undefined) {
                            // Firestore timestamp
                            displayValue = new Date(value.seconds * 1000).toLocaleString();
                          } else {
                            // Other objects
                            displayValue = <span className="text-gray-600 font-mono text-xs">{JSON.stringify(value, null, 2)}</span>;
                          }
                        } else {
                          displayValue = String(value);
                        }
                        
                        return (
                          <tr key={key}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                            <td className="px-4 py-2 text-sm text-gray-500 break-all">{displayValue}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 flex justify-end border-t">
                <button
                  onClick={closeViewMode}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Detail View */}
      {viewMode === "team" && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-semibold">Team Details</h3>
              <button onClick={closeViewMode} className="text-black hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 p-4">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2">
                  <h4 className="text-lg font-bold">{selectedItem.name}</h4>
                  
                  {selectedItem.hackathonId && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">
                        Hackathon: {
                          hackathons.find(h => h.id === selectedItem.hackathonId)?.name || 
                          "Unknown Hackathon"
                        }
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <h5 className="font-medium">Description</h5>
                    <p className="text-gray-600">{selectedItem.description || "No description provided"}</p>
                  </div>
                  
                  <div className="mt-4">
                    <h5 className="font-medium">Looking For</h5>
                    <p className="text-gray-600">{selectedItem.lookingFor || "Not specified"}</p>
                  </div>
                </div>
                
                <div className="md:w-1/2 md:pl-6 mt-4 md:mt-0">
                  <h5 className="font-medium">Team Status</h5>
                  <div className="mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedItem.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {selectedItem.isOpen ? "Open to New Members" : "Closed"}
                    </span>
                    
                    {selectedItem.maxMembers && (
                      <span className="ml-2 text-sm text-gray-600">
                        {selectedItem.members?.length || 0} / {selectedItem.maxMembers} members
                      </span>
                    )}
                  </div>
                  
                  {selectedItem.chatEnabled && (
                    <div className="mt-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Team Chat Enabled
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <h5 className="font-medium mb-2">Team Members</h5>
                
                {selectedItem.members && selectedItem.members.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedItem.members.map((member, index) => {
                          const userProfile = users.find(u => u.id === member.userId);
                          return (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {userProfile?.name || `Member ${index + 1}`}
                                </div>
                                {userProfile && (
                                  <div className="text-sm text-gray-500">{userProfile.email}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {member.role || (index === 0 ? "Team Leader" : "Member")}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  member.isDeleted 
                                    ? "bg-red-100 text-red-800" 
                                    : "bg-green-100 text-green-800"
                                }`}>
                                  {member.isDeleted ? "Left Team" : "Active"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No team members</p>
                )}
              </div>

              <div className="p-4 flex justify-end border-t mt-4">
                <button
                  onClick={closeViewMode}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hackathon Detail View */}
      {viewMode === "hackathon" && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-semibold">Hackathon Details</h3>
              <button onClick={closeViewMode} className="text-black hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 p-4">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/3">
                  <h4 className="text-xl font-bold text-gray-900">{selectedItem.name}</h4>
                  
                  <div className="mt-4">
                    <div className="flex items-center text-gray-600 mb-2">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {selectedItem.startDate && selectedItem.endDate ? 
                        `${new Date(selectedItem.startDate.seconds * 1000).toLocaleDateString()} - ${new Date(selectedItem.endDate.seconds * 1000).toLocaleDateString()}` :
                        "Dates not specified"
                      }
                    </div>
                    
                    <div className="flex items-center text-gray-600 mb-2">
                      <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {selectedItem.location || "Location not specified"}
                      {selectedItem.isVirtual && " (Virtual Event)"}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                    <p className="text-gray-600">{selectedItem.description || "No description provided"}</p>
                  </div>
                  
                  {selectedItem.prize && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-2">Prize Information</h5>
                      <p className="text-gray-600">{selectedItem.prize}</p>
                    </div>
                  )}
                  
                  {selectedItem.eligibility && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-2">Eligibility</h5>
                      <p className="text-gray-600">{selectedItem.eligibility}</p>
                    </div>
                  )}
                  
                  {selectedItem.registration && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-2">Registration Information</h5>
                      <p className="text-gray-600">{selectedItem.registration}</p>
                    </div>
                  )}
                </div>
                
                <div className="md:w-1/3 md:pl-6 mt-6 md:mt-0">
                  {selectedItem.imageUrl && (
                    <div className="mb-6">
                      <img 
                        src={selectedItem.imageUrl} 
                        alt={selectedItem.name} 
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-3">Quick Info</h5>
                    
                    {selectedItem.tags && selectedItem.tags.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-sm text-gray-500 mb-2">Tags</h6>
                        <div className="flex flex-wrap">
                          {selectedItem.tags.map((tag, idx) => (
                            <span 
                              key={idx} 
                              className="mr-2 mb-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h6 className="text-sm text-gray-500 mb-2">Status</h6>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        (selectedItem.startDate && new Date(selectedItem.startDate.seconds * 1000) <= new Date() && 
                         selectedItem.endDate && new Date(selectedItem.endDate.seconds * 1000) >= new Date())
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {(selectedItem.startDate && new Date(selectedItem.startDate.seconds * 1000) <= new Date() && 
                          selectedItem.endDate && new Date(selectedItem.endDate.seconds * 1000) >= new Date())
                          ? "Active" 
                          : "Inactive"}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {selectedItem.websiteUrl && (
                        <a 
                          href={selectedItem.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                          Website
                        </a>
                      )}
                      
                      {selectedItem.registrationUrl && (
                        <a 
                          href={selectedItem.registrationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Registration Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Participating Teams Section */}
              <div className="mt-6 border-t pt-4">
                <h5 className="font-medium text-gray-900 mb-4">Participating Teams</h5>
                
                {teams.filter(team => team.hackathonId === selectedItem.id).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Team Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Members
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {teams
                          .filter(team => team.hackathonId === selectedItem.id)
                          .map(team => (
                            <tr key={team.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{team.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {team.members ? team.members.length : 0} members
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  team.isOpen ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {team.isOpen ? "Open to New Members" : "Closed"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => {
                                    closeViewMode();
                                    setTimeout(() => viewTeam(team), 100);
                                  }}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No teams are currently participating in this hackathon.</p>
                )}
              </div>

              <div className="p-4 flex justify-end border-t mt-6">
                <Link
                  to={`/hackathon/${selectedItem.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-3"
                >
                  View Full Page
                </Link>
                <button
                  onClick={closeViewMode}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage; 