import React from 'react';
import { useParams } from 'react-router-dom';
import ChatRoom from './ChatRoom';

const TeamChat = () => {
  const { teamId } = useParams();

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-white shadow-md p-4">
        <h1 className="text-2xl font-bold text-gray-800">Team Chat</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatRoom teamId={teamId} />
      </div>
    </div>
  );
};

export default TeamChat; 