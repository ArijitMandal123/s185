import React, { useState, useEffect } from "react";
import ProfileCard from "../components/ProfileCard";
import { db } from "../firebase.js"; // Import db from firebase.js
import { collection, getDocs, query, where } from "firebase/firestore"; // Correct imports from firebase/firestore
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AIChatWidget from "../components/chat/AIChatWidget";

function HomePage() {
  const [profiles, setProfiles] = useState([]);
  const [userTeams, setUserTeams] = useState([]);
  const [userHackathons, setUserHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      setError(null);
      try {
        const profilesCollection = collection(db, "users"); // Get reference to 'users' collection
        const profilesSnapshot = await getDocs(profilesCollection); // Fetch all documents in the collection
        const profilesList = profilesSnapshot.docs.map((doc) => ({
          userId: doc.id,
          ...doc.data(),
        }));
        setProfiles(profilesList);
      } catch (firebaseError) {
        setError("Failed to fetch profiles: " + firebaseError.message);
      } finally {
        setLoading(false);
      }
    }

    async function fetchUserTeams() {
      if (!currentUser) return;
      
      try {
        // Query teams where the current user is a member
        const teamsQuery = query(
          collection(db, "teams")
        );
        const teamsSnapshot = await getDocs(teamsQuery);
        
        // Filter teams where the user is a member and not deleted
        const userTeamsList = teamsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(team => 
            team.members && 
            team.members.some(member => 
              member.userId === currentUser.uid && !member.isDeleted
            )
          );
        
        setUserTeams(userTeamsList);
        
        // Get unique hackathon IDs from user's teams
        const hackathonIds = [...new Set(userTeamsList.map(team => team.hackathonId))];
        
        // Fetch hackathon details
        const hackathonsData = [];
        for (const hackathonId of hackathonIds) {
          if (!hackathonId) continue;
          
          const hackathonsQuery = query(
            collection(db, "hackathons"),
            where("__name__", "==", hackathonId)
          );
          const hackathonsSnapshot = await getDocs(hackathonsQuery);
          
          if (!hackathonsSnapshot.empty) {
            hackathonsSnapshot.docs.forEach(doc => {
              hackathonsData.push({ id: doc.id, ...doc.data() });
            });
          }
        }
        
        setUserHackathons(hackathonsData);
      } catch (error) {
        console.error("Error fetching user teams:", error);
      }
    }

    fetchProfiles();
    fetchUserTeams();
  }, [currentUser]); // Re-fetch when currentUser changes

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* User's teams and hackathons section */}
        {currentUser && userTeams.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="h-8 w-1 bg-gradient-to-b from-pink-500 to-indigo-600 rounded-full mr-3"></div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700">Your Hackathon Teams</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userTeams.map((team) => {
                // Find hackathon for this team
                const hackathon = userHackathons.find(h => h.id === team.hackathonId);
                
                return (
                  <div key={team.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-indigo-50">
                    <div className="w-full h-40 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-30">
                        {[...Array(3)].map((_, i) => (
                          <div 
                            key={i}
                            className="absolute rounded-full mix-blend-multiply filter blur-xl"
                            style={{
                              top: `${Math.random() * 100}%`,
                              left: `${Math.random() * 100}%`,
                              width: `${Math.random() * 20 + 20}rem`,
                              height: `${Math.random() * 20 + 20}rem`,
                              background: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 255)}, 0.${Math.floor(Math.random() * 5 + 3)})`,
                            }}
                          ></div>
                        ))}
                      </div>
                      <span className="text-white text-xl font-bold relative z-10">{team.name}</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{team.name}</h3>
                      {hackathon && (
                        <p className="text-indigo-600 mb-3 text-sm font-medium">
                          Hackathon: {hackathon.name}
                        </p>
                      )}
                      <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                        {team.description || "No description available"}
                      </p>
                      <div className="flex space-x-2 mb-3">
                        <Link 
                          to={`/team/${team.id}`}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex-1 text-center"
                        >
                          View Team
                        </Link>
                        {team.chatEnabled && (
                          <Link 
                            to={`/team/${team.id}/chat`}
                            className="bg-transparent border border-indigo-600 text-indigo-600 px-4 py-2 rounded-md text-sm hover:bg-indigo-50 transition-colors duration-300 flex-1 text-center"
                          >
                            Chat
                          </Link>
                        )}
                      </div>
                      <div className="mt-2">
                        <Link 
                          to={`/team/${team.id}/chat`}
                          className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white w-full py-2 rounded-md text-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Open Team Chat
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AI Chat Widget */}
        <AIChatWidget />
      </div>
      
      {/* Add animations to match landing page */}
      <style jsx>{`
        @keyframes textShimmer {
          0% { background-position: 100%; }
          100% { background-position: 0%; }
        }
      `}</style>
    </div>
  );
}

export default HomePage;
