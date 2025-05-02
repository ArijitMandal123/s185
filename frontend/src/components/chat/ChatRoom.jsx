import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

const ChatRoom = ({ teamId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const websocket = new WebSocket(`ws://localhost:8000/ws/${teamId}/${auth.currentUser.uid}`);
    setWs(websocket);

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    const q = query(
      collection(db, 'teams', teamId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(newMessages);
    });

    return () => {
      websocket.close();
      unsubscribe();
    };
  }, [teamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      text: newMessage,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName,
      timestamp: serverTimestamp()
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }

    await addDoc(collection(db, 'teams', teamId, 'messages'), message);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 shadow-md border border-gray-200 dark:border-zinc-700 overflow-hidden">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => {
          const isMine = message.senderId === auth.currentUser?.uid;
          return (
            <div
              key={message.id || message.timestamp}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md p-4 rounded-2xl shadow-sm ${
                  isMine
                    ? 'bg-[#261FB3] text-white'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                <div className="text-sm font-semibold mb-1">{message.senderName}</div>
                <div className="text-sm">{message.text}</div>
                <div className="text-[10px] mt-1 text-gray-500 dark:text-gray-300">
                  {message.timestamp?.toDate?.().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-3 rounded-2xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#261FB3]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#261FB3] text-white rounded-2xl hover:bg-[#1e179e] transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#261FB3]"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
