import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import TeamResources from "../components/team/TeamResources";

function TeamDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [hackathon, setHackathon] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUserInTeam, setIsUserInTeam] = useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Add helper function for logging team capacity
  const logTeamCapacity = (team, stage = "checking") => {
    if (!team || !team.members) return;

    const activeMembers = team.members.filter((m) => !m.isDeleted);
    const maxMembers = team.maxMembers || 4;
    const hasVacancies = activeMembers.length < maxMembers;

    console.log(
      `[${stage}] Team ${team.id} capacity: ${activeMembers.length}/${maxMembers} members`,
      {
        teamId: team.id,
        activeMembers: activeMembers.length,
        maxMembers: maxMembers,
        hasVacancies: hasVacancies,
        deletedMembers: team.members.filter((m) => m.isDeleted).length,
        totalMembers: team.members.length,
      }
    );

    return { activeMembers, maxMembers, hasVacancies };
  };

  // Add function to handle joining a team directly from the team details page
  const handleJoinTeam = async () => {
    if (!currentUser) {
      navigate(`/login?returnTo=/team/${teamId}`);
      return;
    }

    setIsJoiningTeam(true);
    setError("");

    try {
      // Check if user is already in a team for this hackathon
      const teamsQuery = query(
        collection(db, "teams"),
        where("hackathonId", "==", team.hackathonId)
      );
      const teamsSnapshot = await getDocs(teamsQuery);

      const userInTeam = teamsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .some(
          (team) =>
            team.members &&
            team.members.some(
              (member) => member.userId === currentUser.uid && !member.isDeleted
            )
        );

      if (userInTeam) {
        throw new Error(
          "You are already a member of a team in this hackathon. You can only join one team per hackathon."
        );
      }

      // Check if team has space
      const activeMembers = team.members.filter(member => !member.isDeleted);
      if (activeMembers.length >= team.maxMembers) {
        throw new Error("Team is already at maximum capacity");
      }

      // Check if there's already a pending join request from this user
      const existingRequestQuery = query(
        collection(db, "joinRequests"),
        where("teamId", "==", teamId),
        where("userId", "==", currentUser.uid),
        where("status", "==", "pending")
      );
      const existingRequestSnapshot = await getDocs(existingRequestQuery);
      
      if (!existingRequestSnapshot.empty) {
        throw new Error("You already have a pending join request for this team");
      }

      // Create a new join request
      await addDoc(collection(db, "joinRequests"), {
        teamId,
        userId: currentUser.uid,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      // Show success message
      setJoinSuccess(true);
      setTimeout(() => {
        setJoinSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error joining team:", err);
      setError(err.message || "Failed to join team");
    } finally {
      setIsJoiningTeam(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [teamId, currentUser]);

  async function fetchTeamData() {
    try {
      setLoading(true);
      // Fetch team data
      const teamDoc = await getDoc(doc(db, "teams", teamId));

      if (!teamDoc.exists()) {
        setError("Team not found");
        setLoading(false);
        return;
      }

      const teamData = { id: teamDoc.id, ...teamDoc.data() };
      setTeam(teamData);

      // Check if current user is an active member of this team
      if (currentUser && teamData.members) {
        const userIsMember = teamData.members.some(
          (member) => member.userId === currentUser.uid && !member.isDeleted
        );
        setIsUserInTeam(userIsMember);
      } else {
        setIsUserInTeam(false);
      }

      // Fetch associated hackathon
      if (teamData.hackathonId) {
        const hackathonDoc = await getDoc(
          doc(db, "hackathons", teamData.hackathonId)
        );
        if (hackathonDoc.exists()) {
          setHackathon({ id: hackathonDoc.id, ...hackathonDoc.data() });
        }
      }

      // Fetch member profiles
      const memberProfiles = [];
      if (teamData.members && teamData.members.length > 0) {
        const memberPromises = teamData.members.map(async (member) => {
          try {
            // Check if user document exists (user hasn't been deleted)
            const userDoc = await getDoc(doc(db, "users", member.userId));
            if (userDoc.exists()) {
              return {
                ...member,
                profile: { id: userDoc.id, ...userDoc.data() },
                exists: true,
              };
            }
            return {
              ...member,
              profile: {
                name: "Open Position",
                bio: "This position is available for a new team member.",
                skills: [],
              },
              exists: false,
              isVacancy: true,
            };
          } catch (err) {
            console.error("Error fetching member profile:", err);
            return {
              ...member,
              profile: {
                name: "Unknown Member",
                bio: "Could not retrieve profile data.",
                skills: [],
              },
              exists: false,
            };
          }
        });

        const resolvedMembers = await Promise.all(memberPromises);
        setMembers(resolvedMembers);
      }

      // After all processing is done
      setLoading(false);
    } catch (err) {
      console.error("Error fetching team data:", err);
      setError("Failed to load team data: " + err.message);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#261FB3]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <div className="mt-4">
            <Link
              to="/hackathons"
              className="text-[#261FB3] hover:text-[#161179] font-medium"
            >
              Back to Hackathons
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!team) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {team.name}
                  </h1>
                  {hackathon && (
                    <p className="text-indigo-100 text-lg">
                      Participating in {hackathon.name}
                    </p>
                  )}
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  {hackathon && (
                    <Link
                      to={`/hackathon/${hackathon.id}`}
                      className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Hackathon
                    </Link>
                  )}
                  {isUserInTeam && (
                    <Link
                      to={`/team/${teamId}/chat`}
                      className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors duration-300 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Team Chat
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Team Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Team Description */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Team</h2>
                <p className="text-gray-600 leading-relaxed">{team.description}</p>
              </div>

              {/* Project Idea */}
              {team.projectIdea && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Idea</h2>
                  <p className="text-gray-600 leading-relaxed">{team.projectIdea}</p>
                </div>
              )}

              {/* Team Requirements */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Requirements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-xl">
                    <div className="text-sm font-medium text-indigo-600">Minimum Points</div>
                    <div className="text-2xl font-bold text-indigo-900 mt-1">{team.minPoints}</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl">
                    <div className="text-sm font-medium text-indigo-600">Experience Level</div>
                    <div className="text-2xl font-bold text-indigo-900 mt-1 capitalize">{team.experienceLevel}</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl">
                    <div className="text-sm font-medium text-indigo-600">Location</div>
                    <div className="text-2xl font-bold text-indigo-900 mt-1 capitalize">{team.locationPreference}</div>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-xl">
                    <div className="text-sm font-medium text-indigo-600">Mode</div>
                    <div className="text-2xl font-bold text-indigo-900 mt-1 capitalize">{team.modeOfOperation}</div>
                  </div>
                </div>
              </div>

              {/* Skills and Roles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Required Roles */}
                {team.requiredRoles && team.requiredRoles.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Roles</h2>
                    <div className="flex flex-wrap gap-2">
                      {team.requiredRoles.map((role, index) => (
                        <span
                          key={index}
                          className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Skills */}
                {team.skills && team.skills.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {team.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Team Members */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
                <div className="space-y-4">
                  {members.map((member, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl transition-all duration-300 ${
                        member.exists
                          ? "bg-gray-50 hover:bg-gray-100"
                          : "bg-green-50 hover:bg-green-100"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            member.exists ? "bg-indigo-100" : "bg-green-100"
                          }`}>
                            <span className={`text-lg font-semibold ${
                              member.exists ? "text-indigo-600" : "text-green-600"
                            }`}>
                              {member.exists ? member.profile?.name?.[0] : "?"}
                            </span>
                          </div>
                          <div>
                            <h3 className={`font-medium ${
                              member.exists ? "text-gray-900" : "text-green-800"
                            }`}>
                              {member.exists ? member.profile?.name : "Open Position"}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {member.exists ? member.role : "Available"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          {member.exists ? (
                            <Link
                              to={`/profile/${member.userId}`}
                              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              View Profile
                            </Link>
                          ) : (
                            <button
                              onClick={handleJoinTeam}
                              disabled={isJoiningTeam}
                              className="text-sm bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isJoiningTeam ? "Sending Request..." : "Apply to Join"}
                            </button>
                          )}
                          <span className="text-xs text-gray-400 mt-1">
                            {member.exists && member.joinedAt
                              ? `Joined ${new Date(member.joinedAt).toLocaleDateString()}`
                              : "Position Available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project Links */}
              {team.projectLinks && Object.keys(team.projectLinks).length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Links</h2>
                  <div className="space-y-3">
                    {Object.entries(team.projectLinks).map(
                      ([key, value]) =>
                        value && (
                          <a
                            key={key}
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <span className="text-gray-600 font-medium mr-2">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span className="text-indigo-600 truncate">{value}</span>
                          </a>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Team Resources Section */}
          <TeamResources teamId={teamId} />
        </div>
      </div>
    </div>
  );
}

export default TeamDetailPage;
