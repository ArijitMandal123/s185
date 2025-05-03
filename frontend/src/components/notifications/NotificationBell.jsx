import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function NotificationBell() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [joiningTeam, setJoiningTeam] = useState(null);
  const [userTeams, setUserTeams] = useState(new Set());

  useEffect(() => {
    if (!currentUser) return;

    // Query for all notifications, ordered by creation date
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(newNotifications);
      // Count unread notifications
      const unread = newNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch user's teams
  useEffect(() => {
    if (!currentUser) return;

    const fetchUserTeams = async () => {
      try {
        const teamsQuery = query(
          collection(db, 'teams'),
          where('members', 'array-contains', { userId: currentUser.uid, isDeleted: false })
        );
        const teamsSnapshot = await getDocs(teamsQuery);
        const teamIds = teamsSnapshot.docs.map(doc => doc.id);
        setUserTeams(new Set(teamIds));
      } catch (error) {
        console.error('Error fetching user teams:', error);
      }
    };

    fetchUserTeams();
  }, [currentUser]);

  const handleViewTeam = (teamId) => {
    setShowDropdown(false);
    navigate(`/team/${teamId}`);
  };

  const handleJoinTeam = async (teamId, notificationId) => {
    if (!currentUser) return;
    
    setJoiningTeam(teamId);
    setShowDropdown(false);
    
    try {
      // Get team details
      const teamDoc = await getDoc(doc(db, 'teams', teamId));
      if (!teamDoc.exists()) {
        throw new Error('Team not found');
      }
      
      const team = teamDoc.data();
      
      // Check if team has space
      const activeMembers = team.members.filter(member => !member.isDeleted);
      if (activeMembers.length >= team.maxMembers) {
        throw new Error('Team is already at maximum capacity');
      }
      
      // Add user to team
      await updateDoc(doc(db, 'teams', teamId), {
        members: arrayUnion({
          userId: currentUser.uid,
          role: 'member',
          joinedAt: new Date().toISOString()
        })
      });
      
      // Update notification as read
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });

      // Update local userTeams state
      setUserTeams(prev => new Set([...prev, teamId]));
      
      // Navigate to team page
      navigate(`/team/${teamId}`);
    } catch (error) {
      console.error('Error joining team:', error);
      // You might want to show an error message to the user here
    } finally {
      setJoiningTeam(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-[#261FB3] focus:outline-none"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#0C0950]">Notifications</h3>
            </div>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-md hover:bg-gray-100 ${
                      notification.read ? 'bg-white' : 'bg-blue-50'
                    }`}
                  >
                    <p className="text-sm text-gray-700">{notification.message}</p>
                    <span className="text-xs text-gray-500 block mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                    {notification.type === 'team_invite' && notification.teamId && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleViewTeam(notification.teamId)}
                          className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          View Team
                        </button>
                        {!userTeams.has(notification.teamId) && (
                          <button
                            onClick={() => handleJoinTeam(notification.teamId, notification.id)}
                            disabled={joiningTeam === notification.teamId}
                            className={`text-xs bg-[#261FB3] text-white px-3 py-1 rounded hover:bg-[#161179] transition-colors ${
                              joiningTeam === notification.teamId ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {joiningTeam === notification.teamId ? 'Joining...' : 'Join Team'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell; 