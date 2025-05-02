import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import TeamForm from "../components/team/TeamForm";
import TeamList from "../components/team/TeamList";

function HackathonDetailsPage() {
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [userTeams, setUserTeams] = useState([]);
  const [isUserInTeam, setIsUserInTeam] = useState(false);
  const { hackathonId } = useParams();
  const { currentUser } = useAuth();

  const fetchUserTeams = async () => {
    if (!currentUser) return;
    
    try {
      const teamsRef = collection(db, 'teams');
      const q = query(
        teamsRef,
        where('hackathonId', '==', hackathonId),
        where('members', 'array-contains', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const teams = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserTeams(teams);
    } catch (error) {
      console.error('Error fetching user teams:', error);
    }
  };

  useEffect(() => {
    async function fetchHackathonDetails() {
      setLoading(true);
      setError(null);
      try {
        const hackathonDoc = doc(db, "hackathons", hackathonId);
        const hackathonSnapshot = await getDoc(hackathonDoc);

        if (hackathonSnapshot.exists()) {
          const data = hackathonSnapshot.data();
          setHackathon({
            id: hackathonSnapshot.id,
            ...data,
            // Convert Firestore Timestamps to ISO strings for display
            startDate:
              data.startDate?.toDate?.()?.toISOString() || data.startDate,
            endDate: data.endDate?.toDate?.()?.toISOString() || data.endDate,
          });
        } else {
          setError("Hackathon not found");
        }
      } catch (err) {
        console.error("Error fetching hackathon details:", err);
        setError("Failed to fetch hackathon details: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHackathonDetails();
  }, [hackathonId]);

  useEffect(() => {
    async function checkUserTeamStatus() {
      if (!currentUser) return;

      try {
        // Check if user is already in a team for this hackathon
        const teamsQuery = query(
          collection(db, "teams"),
          where("hackathonId", "==", hackathonId)
        );

        const teamsSnapshot = await getDocs(teamsQuery);

        // Filter teams where the user is a member
        const teams = teamsSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (team) =>
              team.members &&
              team.members.some((member) => member.userId === currentUser.uid)
          );

        setUserTeams(teams);
        setIsUserInTeam(teams.length > 0);
      } catch (err) {
        console.error("Error checking user team status:", err);
      }
    }

    if (currentUser) {
      checkUserTeamStatus();
    }
  }, [currentUser, hackathonId]);

  const formatDate = (dateString) => {
    try {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const getStatusBadge = (startDate, endDate) => {
    try {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (now < start) {
        return (
          <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm flex items-center">
            <span className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
            Upcoming
          </span>
        );
      } else if (now >= start && now <= end) {
        return (
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-sm flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Ongoing
          </span>
        );
      } else {
        return (
          <span className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Past
          </span>
        );
      }
    } catch (error) {
      console.error("Error determining status:", error);
      return (
        <span className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-full text-sm font-medium shadow-sm">
          Unknown
        </span>
      );
    }
  };

  const isHackathonActive = () => {
    if (!hackathon) return false;
    const now = new Date();
    const start = new Date(hackathon.startDate);
    const end = new Date(hackathon.endDate);
    return now >= start && now <= end;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="text-center text-gray-700 mt-4 font-medium">Loading hackathon details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-700">Error</h3>
                <p clasName="mt-1">{error}</p>
                <div className="mt-4">s
                  <Link
                    to="/hackathons"
                    className="inline-flex items-center text-red-700 hover:text-red-600 font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Hackathons
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-700">Not Found</h3>
                <p className="mt-1">Sorry, we couldn't find the hackathon you're looking for.</p>
                <div className="mt-4">
                  <Link
                    to="/hackathons"
                    className="inline-flex items-center text-yellow-700 hover:text-yellow-600 font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Browse Hackathons
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Gradient Background */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-1/4 right-10 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-1/4 left-10 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <Link
            to="/hackathons"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full px-4 py-2 mb-6 transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Hackathons
          </Link>
          
          <div className="flex flex-col md:flex-row items-center md:items-end">
            <div className="w-full md:w-1/2">
              <div className="flex items-center space-x-3 mb-3">
                {getStatusBadge(hackathon.startDate, hackathon.endDate)}
                {hackathon.isVirtual && (
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    Virtual
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {hackathon.name}
              </h1>
              <p className="text-indigo-100 text-lg mb-6">
                {hackathon.description?.substring(0, 150)}
                {hackathon.description?.length > 150 ? "..." : ""}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {hackathon.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-white bg-opacity-20 text-indigo-600 hover:text-indigo-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="h-64 md:h-80 lg:h-96 overflow-hidden">
                {hackathon.imageUrl ? (
                  <img
                    src={hackathon.imageUrl}
                    alt={hackathon.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                    <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  About this Hackathon
                </h2>
                <div className="prose max-w-none text-gray-600">
                  {hackathon.description?.split('\n').map((paragraph, idx) => (
                    paragraph.trim() ? <p key={idx}>{paragraph}</p> : <br key={idx} />
                  ))}
                </div>
              </div>
            </div>

            {/* Teams Section */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Teams
                  </h2>
                  <Link
                    to={`/hackathon/${hackathonId}/teams`}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                  >
                    View All
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </Link>
                </div>

                {/* Team Form Toggle */}
                {currentUser && !isUserInTeam && isHackathonActive() && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowTeamForm(!showTeamForm)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                      </svg>
                      {showTeamForm ? "Cancel" : "Create a Team"}
                    </button>
                  </div>
                )}

                {/* Team Form */}
                {showTeamForm && (
                  <div className="mb-8 bg-indigo-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-indigo-900 mb-4">Create a New Team</h3>
                    <TeamForm
                      hackathonId={hackathonId}
                      onComplete={() => {
                        setShowTeamForm(false);
                        fetchUserTeams();
                      }}
                    />
                  </div>
                )}

                {/* Teams List */}
                <TeamList
                  hackathonId={hackathonId}
                  currentUser={currentUser}
                  limit={3}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="space-y-6">
            {/* Hackathon Details Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Hackathon Details</h3>
                
                <div className="space-y-4">
                  {/* Dates */}
                  <div className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Dates</p>
                      <p className="text-gray-800">
                        {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex">
                    <div className="flex-shrink-0 mt-1">
                      <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-gray-800">
                        {hackathon.isVirtual ? 'Virtual Event' : hackathon.location || 'Location not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Prize */}
                  {hackathon.prize && (
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Prize</p>
                        <p className="text-gray-800">{hackathon.prize}</p>
                      </div>
                    </div>
                  )}

                  {/* Team Size */}
                  {hackathon.maxTeamSize && (
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Team Size</p>
                        <p className="text-gray-800">Up to {hackathon.maxTeamSize} members</p>
                      </div>
                    </div>
                  )}

                  {/* Website */}
                  {hackathon.website && (
                    <div className="flex">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="h-5 w-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Website</p>
                        <a 
                          href={hackathon.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                        >
                          {hackathon.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Call To Action */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 text-white">
                <h3 className="text-xl font-bold mb-3">Ready to Participate?</h3>
                <p className="mb-4 text-indigo-100">
                  Join a team or create your own to participate in this exciting hackathon!
                </p>
                {currentUser ? (
                  <div className="space-y-3">
                    <Link
                      to={`/hackathon/${hackathonId}/teams`}
                      className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      Browse Teams
                    </Link>
                    {!isUserInTeam && isHackathonActive() && (
                      <button
                        onClick={() => setShowTeamForm(!showTeamForm)}
                        className="w-full bg-transparent border border-white text-white hover:bg-white hover:bg-opacity-10 font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                      >
                        Create a Team
                      </button>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                  >
                    Sign In to Participate
                  </Link>
                )}
              </div>
            </div>

            {/* User's Team Card (if applicable) */}
            {userTeams.length > 0 && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="bg-indigo-50 px-6 py-4">
                  <h3 className="font-semibold text-indigo-900">Your Team</h3>
                </div>
                <div className="p-6">
                  {userTeams.map(team => (
                    <div key={team.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{team.name}</h4>
                        <p className="text-sm text-gray-500">{team.members?.length || 0} members</p>
                      </div>
                      <Link
                        to={`/team/${team.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Team
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HackathonDetailsPage;
