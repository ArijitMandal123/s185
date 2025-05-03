import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

function TeamInvitePage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [team, setTeam] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sendingRequestTo, setSendingRequestTo] = useState(null);

  useEffect(() => {
    fetchTeamAndUsers();
  }, [teamId]);

  async function fetchTeamAndUsers() {
    try {
      // Fetch team details
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      if (!teamDoc.exists()) {
        throw new Error("Team not found");
      }

      const teamData = teamDoc.data();
      setTeam(teamData);

      // Verify user is the team leader
      const isLeader = teamData.members.some(
        (member) => member.userId === currentUser.uid && member.role === "leader"
      );
      if (!isLeader) {
        throw new Error("Only team leaders can invite members");
      }

      // Fetch all teams in the same hackathon
      const teamsQuery = query(
        collection(db, "teams"),
        where("hackathonId", "==", teamData.hackathonId)
      );
      const teamsSnapshot = await getDocs(teamsQuery);
      
      // Get all user IDs who are already in teams for this hackathon
      const usersInHackathonTeams = new Set();
      teamsSnapshot.docs.forEach(teamDoc => {
        const team = teamDoc.data();
        if (team.members) {
          team.members.forEach(member => {
            if (!member.isDeleted) {
              usersInHackathonTeams.add(member.userId);
            }
          });
        }
      });

      // Fetch all users
      const usersQuery = query(collection(db, "users"));
      const usersSnapshot = await getDocs(usersQuery);

      const usersData = await Promise.all(
        usersSnapshot.docs.map(async (userDoc) => {
          const userData = userDoc.data();
          return {
            id: userDoc.id,
            ...userData,
          };
        })
      );

      // Filter out users who are already in teams for this hackathon
      const filteredUsers = usersData.filter(user => !usersInHackathonTeams.has(user.id));
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Error fetching team and users:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSendJoinRequest = async (userId) => {
    if (!currentUser) return;
    
    setSendingRequestTo(userId);
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
              (member) => member.userId === userId && !member.isDeleted
            )
        );
      
      if (userInTeam) {
        throw new Error("This user is already in a team for this hackathon");
      }
      
      // Check if there's already a pending join request to this user
      const existingRequestQuery = query(
        collection(db, "joinRequests"),
        where("teamId", "==", teamId),
        where("userId", "==", userId),
        where("status", "==", "pending")
      );
      const existingRequestSnapshot = await getDocs(existingRequestQuery);
      
      if (!existingRequestSnapshot.empty) {
        throw new Error("You already have a pending join request to this user");
      }
      
      // Create a new join request
      await addDoc(collection(db, "joinRequests"), {
        teamId,
        userId,
        status: "pending",
        createdAt: new Date().toISOString(),
        isLeaderRequest: true, // Flag to indicate this is a request from a team leader
      });

      // Create a notification for the user
      await addDoc(collection(db, "notifications"), {
        userId,
        type: "team_invite",
        message: `You have received a team invite from ${team.name}`,
        teamId,
        read: false,
        createdAt: new Date().toISOString(),
      });
      
      setSuccess("Join request sent successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error sending join request:", err);
      setError(err.message);
    } finally {
      setSendingRequestTo(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.skills?.some((skill) => skill.toLowerCase().includes(searchLower))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#261FB3]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 text-[#261FB3] hover:text-[#161179]"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-[#0C0950]">
              Invite Members to {team?.name}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-[#261FB3] hover:text-[#161179]"
            >
              ← Back to Team
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name, email, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#261FB3] focus:border-transparent"
            />
          </div>

          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-[#0C0950]">
                      {user.name || "Anonymous User"}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    {user.points && (
                      <p className="text-sm text-gray-600">
                        Points: {user.points}
                      </p>
                    )}
                    {user.skills && user.skills.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleSendJoinRequest(user.id)}
                    disabled={sendingRequestTo === user.id}
                    className="bg-[#261FB3] text-white px-4 py-2 rounded hover:bg-[#161179] transition-colors disabled:opacity-50"
                  >
                    {sendingRequestTo === user.id ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeamInvitePage; 