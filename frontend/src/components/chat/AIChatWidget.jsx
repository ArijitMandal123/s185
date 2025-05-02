import React, { useState, useRef, useEffect } from "react";

// Helper function to format code blocks with syntax highlighting
const formatMessageWithCodeBlocks = (content) => {
  if (!content) return "";

  // Split by code block markers ```
  const parts = content.split(/```([a-zA-Z]*)\n([\s\S]*?)```/g);
  
  if (parts.length === 1) {
    // No code blocks, just return the content
    return <span className="whitespace-pre-wrap">{content}</span>;
  }

  const elements = [];
  
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      // This is regular text
      if (parts[i]) {
        elements.push(
          <span key={`text-${i}`} className="whitespace-pre-wrap">
            {parts[i]}
          </span>
        );
      }
    } else if (i % 3 === 1) {
      // This is the language indicator (if present)
      // We don't render this directly, but use it for the code block
    } else if (i % 3 === 2) {
      // This is the code block
      const language = parts[i-1] || "";
      const code = parts[i];
      elements.push(
        <pre key={`code-${i}`} className="mt-2 mb-2 p-3 bg-gray-800 text-gray-100 rounded-md overflow-x-auto text-sm">
          <code className={`language-${language}`}>
            {code}
          </code>
        </pre>
      );
    }
  }
  
  return <>{elements}</>;
};

function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your Hackathon Teammate Finder assistant. I can help you with finding teams, understanding hackathons, or answering questions about the platform. What can I assist you with today?"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useLocalMode, setUseLocalMode] = useState(false);
  const chatEndRef = useRef(null);
  
  // Get API key from environment variable
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  // Local responses for fallback
  const localResponses = {
    "hello": "Hello! How can I help you with the Hackathon Teammate Finder today?",
    "hi": "Hi there! Looking for hackathon teammates or information?",
    "help": "I can help you find teams, join hackathons, or learn about the platform's features. What would you like to know?",
    "teams": "You can find teams by browsing hackathons and viewing team listings. You can also create your own team!",
    "hackathons": "We list various hackathons you can join. Check the Hackathons page to view upcoming events.",
    "profile": "You can customize your profile with your skills, experience, and portfolio links to attract potential teammates.",
    "join": "To join a team, visit a team's page and click the 'Request to Join' button. Team leaders will review your request.",
    "create": "You can create a new team for a hackathon by visiting the hackathon page and clicking 'Create Team'.",
    "chat": "Each team has a dedicated chat feature for team communication once you've joined.",
    "skills": "List your programming languages, frameworks, and other technical skills on your profile to match with compatible teams.",
    "code": "Here's an example of how you might fetch team data from Firebase:\n\n```javascript\nimport { collection, query, where, getDocs } from 'firebase/firestore';\nimport { db } from '../firebase';\n\nasync function fetchUserTeams(userId) {\n  try {\n    const teamsQuery = query(\n      collection(db, \"teams\")\n    );\n    const teamsSnapshot = await getDocs(teamsQuery);\n    \n    // Filter teams where the user is a member\n    const userTeams = teamsSnapshot.docs\n      .map(doc => ({ id: doc.id, ...doc.data() }))\n      .filter(team => \n        team.members && \n        team.members.some(member => \n          member.userId === userId && !member.isDeleted\n        )\n      );\n    \n    return userTeams;\n  } catch (error) {\n    console.error('Error fetching teams:', error);\n    return [];\n  }\n}\n```",
    "react": "Here's an example React component for a team card:\n\n```jsx\nimport React from 'react';\nimport { Link } from 'react-router-dom';\n\nfunction TeamCard({ team, hackathon }) {\n  return (\n    <div className=\"bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow\">\n      <h3 className=\"text-xl font-semibold\">{team.name}</h3>\n      {hackathon && (\n        <p className=\"text-gray-700 mt-1\">Hackathon: {hackathon.name}</p>\n      )}\n      <p className=\"text-gray-600 mt-2\">\n        {team.description || \"No description available\"}\n      </p>\n      <div className=\"mt-4\">\n        <Link \n          to={`/team/${team.id}`}\n          className=\"bg-blue-600 text-white px-4 py-2 rounded\"\n        >\n          View Team\n        </Link>\n      </div>\n    </div>\n  );\n}\n\nexport default TeamCard;\n```",
    "css": "Here's an example of CSS styling for a hackathon card using Tailwind CSS:\n\n```html\n<div class=\"bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300\">\n  <div class=\"w-full h-40 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center\">\n    <span class=\"text-white text-xl font-bold\">Hackathon Name</span>\n  </div>\n  <div class=\"p-4\">\n    <h3 class=\"text-lg font-bold text-gray-800 mb-2\">Hackathon Title</h3>\n    <p class=\"text-gray-600 mb-3 text-sm\">\n      Jan 1, 2023 - Jan 15, 2023\n    </p>\n    <a href=\"#\" class=\"text-blue-600 hover:text-blue-800 font-medium\">\n      View Details\n    </a>\n  </div>\n</div>\n```",
    "default": "I'm not sure about that. Could you ask about teams, hackathons, profiles, or other platform features?"
  };

  // Function to get a local response
  const getLocalResponse = (message) => {
    const lowercased = message.toLowerCase();
    
    // Check for exact matches
    for (const [key, response] of Object.entries(localResponses)) {
      if (lowercased.includes(key)) {
        return response;
      }
    }
    
    // Default fallback response
    return localResponses.default;
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputMessage.trim()) {
        sendMessage(e);
      }
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat has been reset. How can I help you today?"
      }
    ]);
  };

  const toggleMode = () => {
    setUseLocalMode(!useLocalMode);
    setMessages(prev => [
      ...prev,
      {
        role: "assistant",
        content: !useLocalMode 
          ? "Switched to offline mode. I'll use basic responses now." 
          : "Switched to online mode. I'll try to connect to the AI service."
      }
    ]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: "user",
      content: inputMessage,
    };

    // Add user message to chat
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    // If we're in local mode, use the local response system
    if (useLocalMode) {
      setTimeout(() => {
        const response = getLocalResponse(userMessage.content);
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: response
          }
        ]);
        setIsLoading(false);
      }, 500); // Simulate a short delay
      return;
    }

    try {
      // Create a messages array with a system message to enforce English responses
      const messagesWithSystem = [
        {
          role: "system",
          content: "You are a helpful assistant for the Hackathon Teammate Finder application. Always respond in English only, regardless of the input language. When sharing code snippets, format them using markdown code blocks with syntax highlighting by wrapping the code in triple backticks with the language name, like ```javascript for JavaScript code. Always specify the language when possible."
        },
        ...updatedMessages // Use the updated messages that include the current user message
      ];

      console.log("Sending to backend API:", messagesWithSystem);
      
      // Use the backend API instead of calling OpenRouter directly
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: messagesWithSystem,
          model: "mistralai/mistral-7b-instruct:free",
          temperature: 0.7,
          max_tokens: 800
        })
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        
        // If the backend returns an error, fall back to local mode
        console.warn("Backend API error. Falling back to local mode for this message.");
        const fallbackResponse = getLocalResponse(userMessage.content);
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "I encountered an issue connecting to my knowledge base. " + fallbackResponse
          }
        ]);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("API response:", data);
      
      if (data.choices && data.choices.length > 0) {
        const assistantMessage = data.choices[0].message;
        console.log("Assistant message:", assistantMessage);
        
        // Only add the assistant's response if it's not empty and not the same as the last message
        if (assistantMessage.content && assistantMessage.content.trim()) {
          setMessages(prevMessages => {
            // Check if the last message is identical to avoid duplication
            const lastMessage = prevMessages[prevMessages.length - 1];
            if (lastMessage && 
                lastMessage.role === assistantMessage.role && 
                lastMessage.content === assistantMessage.content) {
              console.log("Duplicate message detected, not adding");
              return prevMessages;
            }
            return [...prevMessages, assistantMessage];
          });
        }
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I'm having trouble connecting to my knowledge base. Let me use my basic knowledge instead. " + getLocalResponse(userMessage.content)
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="bg-white rounded-xl shadow-xl w-80 sm:w-96 h-96 flex flex-col overflow-hidden border border-indigo-100 backdrop-blur-lg">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 mr-2 animate-pulse" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Assistant
            </h3>
            <div className="flex items-center space-x-2">
              <button 
                onClick={resetChat} 
                className="text-white hover:text-gray-200 transition-colors duration-200"
                title="Reset Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
              <button onClick={toggleChat} className="text-white hover:text-gray-200 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1 p-3 overflow-y-auto bg-gradient-to-br from-indigo-50 to-purple-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  message.role === "user" ? "text-right" : "text-left"
                }`}
              >
                <div
                  className={`inline-block rounded-lg py-2 px-3 max-w-[80%] ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "bg-white text-gray-800 border border-indigo-100 shadow-sm"
                  }`}
                >
                  {formatMessageWithCodeBlocks(message.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left mb-3">
                <div className="inline-block bg-white text-gray-800 rounded-lg py-2 px-3 border border-indigo-100 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "100ms" }}></div>
                    <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "200ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={sendMessage} className="border-t border-indigo-100 p-3 flex">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="flex-1 border border-indigo-200 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              className={`bg-gradient-to-r from-pink-500 to-indigo-600 text-white px-4 rounded-r-lg hover:shadow-md transition-all duration-300 transform hover:-translate-y-px ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}
      <button
        onClick={toggleChat}
        className={`${
          isOpen ? "hidden" : "flex"
        } items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg text-white rounded-full w-14 h-14 shadow-md transition-all duration-300 transform hover:scale-105`}
      >
        <div className="absolute inset-0 rounded-full overflow-hidden opacity-20">
          <div 
            className="absolute rounded-full mix-blend-multiply filter blur-md"
            style={{
              top: "10%",
              left: "10%",
              width: "140%",
              height: "140%",
              background: "rgba(255, 100, 255, 0.4)",
              animationDuration: "5s",
              animationName: "pulse",
              animationIterationCount: "infinite"
            }}
          ></div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default AIChatWidget; 