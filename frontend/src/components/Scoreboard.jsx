import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Scoreboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // First, get the top users by points
        const usersQuery = query(
          collection(db, 'users'),
          orderBy('points', 'desc'),
          limit(100)
        );
        
        const querySnapshot = await getDocs(usersQuery);
        const usersData = await Promise.all(
          querySnapshot.docs.map(async (userDoc) => {
            const userData = userDoc.data();
        
            return {
              id: userDoc.id,
              ...userData,
              avatarUrl: userData.github_username
                ? `https://github.com/${userData.github_username}.png`
                : userData.photoURL
                ? userData.photoURL
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'Anonymous')}`,
              experienceLevel: userData.experience || 'Not specified',
              githubUsername: userData.github_username || 'No GitHub'
            };
          })
        );
        
        
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#261FB3]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#261FB3]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                Points
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr 
                key={user.id} 
                className={`transition-colors duration-200 ${
                  index % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`text-lg font-bold ${
                      index === 0 ? 'text-yellow-500' : 
                      index === 1 ? 'text-gray-400' : 
                      index === 2 ? 'text-amber-600' : 
                      'text-gray-500'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={user.avatarUrl}
                        alt={user.name || 'Anonymous'}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Anonymous')}`;
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.githubUsername}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 capitalize">
                    {user.experienceLevel}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-[#261FB3]">
                      {user.points || 0}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      points
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Scoreboard; 