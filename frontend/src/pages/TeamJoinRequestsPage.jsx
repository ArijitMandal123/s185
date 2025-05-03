import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

function TeamJoinRequestsPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("incoming"); // "incoming" or "outgoing"

  useEffect(() => {
    fetchTeamAndRequests();
  }, [teamId]);

  async function fetchTeamAndRequests() {
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
        throw new Error("Only team leaders can manage join requests");
      }

      // Fetch incoming join requests
      const incomingRequestsQuery = query(
        collection(db, "joinRequests"),
        where("teamId", "==", teamId),
        where("status", "==", "pending"),
        where("isLeaderRequest", "==", false)
      );
      const incomingRequestsSnapshot = await getDocs(incomingRequestsQuery);

      const incomingRequestsData = await Promise.all(
        incomingRequestsSnapshot.docs.map(async (requestDoc) => {
          const requestData = requestDoc.data();
          const userDoc = await getDoc(doc(db, "users", requestData.userId));
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          return {
            id: requestDoc.id,
            ...requestData,
            user: {
              displayName: userData?.name || userData?.displayName || "Unknown User",
              points: userData?.points || 0,
              bio: userData?.bio || "",
              skills: userData?.skills || [],
            },
          };
        })
      );

      setRequests(incomingRequestsData);

      // Fetch outgoing join requests
      const outgoingRequestsQuery = query(
        collection(db, "joinRequests"),
        where("teamId", "==", teamId),
        where("status", "==", "pending"),
        where("isLeaderRequest", "==", true)
      );
      const outgoingRequestsSnapshot = await getDocs(outgoingRequestsQuery);

      const outgoingRequestsData = await Promise.all(
        outgoingRequestsSnapshot.docs.map(async (requestDoc) => {
          const requestData = requestDoc.data();
          const userDoc = await getDoc(doc(db, "users", requestData.userId));
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          return {
            id: requestDoc.id,
            ...requestData,
            user: {
              displayName: userData?.name || userData?.displayName || "Unknown User",
              points: userData?.points || 0,
              bio: userData?.bio || "",
              skills: userData?.skills || [],
            },
          };
        })
      );

      setOutgoingRequests(outgoingRequestsData);
    } catch (err) {
      console.error("Error fetching team and requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAcceptRequest = async (requestId, userId) => {
    if (!team) return;

    setProcessing(true);
    setError("");

    try {
      // Check if user meets minimum points requirement
      const userDoc = await getDoc(doc(db, "users", userId));
      if (!userDoc.exists()) {
        throw new Error("User profile not found");
      }

      const userData = userDoc.data();
      if (userData.points < team.minPoints) {
        throw new Error(`User needs at least ${team.minPoints} points to join this team. They currently have ${userData.points} points.`);
      }

      // Check if team has space
      const activeMembers = team.members.filter((member) => !member.isDeleted);
      if (activeMembers.length >= team.maxMembers) {
        throw new Error("Team is already at maximum capacity");
      }

      // Update team members
      await updateDoc(doc(db, "teams", teamId), {
        members: arrayUnion({
          userId,
          role: "member",
          joinedAt: new Date().toISOString(),
        }),
      });

      // Update request status
      await updateDoc(doc(db, "joinRequests", requestId), {
        status: "accepted",
        processedAt: new Date().toISOString(),
      });

      // Refresh data
      await fetchTeamAndRequests();
    } catch (err) {
      console.error("Error accepting request:", err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectRequest = async (requestId) => {
    setProcessing(true);
    setError("");

    try {
      await updateDoc(doc(db, "joinRequests", requestId), {
        status: "rejected",
        processedAt: new Date().toISOString(),
      });

      // Refresh data
      await fetchTeamAndRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    setProcessing(true);
    setError("");

    try {
      await updateDoc(doc(db, "joinRequests", requestId), {
        status: "cancelled",
        processedAt: new Date().toISOString(),
      });

      // Refresh data
      await fetchTeamAndRequests();
    } catch (err) {
      console.error("Error cancelling request:", err);
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

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
              Join Requests for {team?.name}
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

          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "incoming"
                    ? "text-[#261FB3] border-b-2 border-[#261FB3]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("incoming")}
              >
                Incoming Requests
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "outgoing"
                    ? "text-[#261FB3] border-b-2 border-[#261FB3]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("outgoing")}
              >
                Outgoing Invites
              </button>
            </div>
          </div>

          {activeTab === "incoming" ? (
            requests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No pending join requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 
                          onClick={() => navigate(`/profile/${request.userId}`)}
                          className="text-lg font-medium text-[#0C0950] hover:text-[#261FB3] cursor-pointer transition-colors"
                        >
                          {request.user.displayName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Points: {request.user.points}
                        </p>
                        {request.user.bio && (
                          <p className="text-sm text-gray-600 mt-1">
                            {request.user.bio}
                          </p>
                        )}
                        {request.user.skills && request.user.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {request.user.skills.map((skill, index) => (
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
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id, request.userId)}
                          disabled={processing}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          disabled={processing}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            outgoingRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No pending invites</p>
              </div>
            ) : (
              <div className="space-y-4">
                {outgoingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 
                          onClick={() => navigate(`/profile/${request.userId}`)}
                          className="text-lg font-medium text-[#0C0950] hover:text-[#261FB3] cursor-pointer transition-colors"
                        >
                          {request.user.displayName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Points: {request.user.points}
                        </p>
                        {request.user.bio && (
                          <p className="text-sm text-gray-600 mt-1">
                            {request.user.bio}
                          </p>
                        )}
                        {request.user.skills && request.user.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {request.user.skills.map((skill, index) => (
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
                        onClick={() => handleCancelRequest(request.id)}
                        disabled={processing}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        Cancel Invite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamJoinRequestsPage; 