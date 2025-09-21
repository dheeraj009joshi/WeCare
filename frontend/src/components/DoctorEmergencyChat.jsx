import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DoctorEmergencyChat = () => {
  const [availableChats, setAvailableChats] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingChat, setAcceptingChat] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("doctorToken");

  useEffect(() => {
    if (!token) {
      navigate("/doctor/login");
      return;
    }
    fetchEmergencyChats();
    const interval = setInterval(fetchEmergencyChats, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [token, navigate]);

  const fetchEmergencyChats = async () => {
    try {
      setLoading(true);
      
      // Fetch available emergency chats
      const availableResponse = await fetch("http://localhost:5000/api/emergency-chat/available", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const availableData = await availableResponse.json();
      
      if (availableData.success) {
        setAvailableChats(availableData.data);
      }

      // Fetch active emergency chats
      const activeResponse = await fetch("http://localhost:5000/api/emergency-chat/active", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const activeData = await activeResponse.json();
      
      if (activeData.success) {
        setActiveChats(activeData.data);
      }

    } catch (error) {
      console.error("Error fetching emergency chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const acceptChat = async (sessionId) => {
    try {
      setAcceptingChat(sessionId);
      const response = await fetch(`http://localhost:5000/api/emergency-chat/session/${sessionId}/accept`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchEmergencyChats(); // Refresh data
        alert("Emergency chat accepted successfully!");
      } else {
        alert(data.message || "Failed to accept emergency chat");
      }
    } catch (error) {
      console.error("Error accepting chat:", error);
      alert("Network error. Please try again.");
    } finally {
      setAcceptingChat(null);
    }
  };

  const loadChatMessages = async (sessionId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/emergency-chat/session/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSelectedChat(data.data.session);
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error("Error loading chat messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !selectedChat) return;

    try {
      setSending(true);
      const response = await fetch(`http://localhost:5000/api/emergency-chat/session/${selectedChat.id}/doctor-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          messageType: "text"
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        setMessages(prev => [...prev, data.data]);
      } else {
        alert(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-600';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  if (loading) {
    return (
      <div className="pt-[100px] min-h-screen p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-96 bg-gray-300 rounded"></div>
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-[100px] min-h-screen p-6 bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#083567] mb-2">
            Emergency Chat Management
          </h1>
          <p className="text-gray-600">
            Manage emergency chat sessions and provide immediate assistance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Emergency Chats */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Emergency Chats ({availableChats.length})
            </h2>
            
            {availableChats.length > 0 ? (
              <div className="space-y-4">
                {availableChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(chat.priority)}`}>
                          {getPriorityText(chat.priority)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(chat.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">
                        {chat.emergencyType} Emergency
                      </p>
                      <p className="text-sm text-gray-600">
                        Location: {chat.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        Description: {chat.description}
                      </p>
                      {chat.User && (
                        <p className="text-sm text-gray-600">
                          Patient: {chat.User.name} ({chat.User.phone})
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <button
                        onClick={() => acceptChat(chat.id)}
                        disabled={acceptingChat === chat.id}
                        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {acceptingChat === chat.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Accepting...
                          </div>
                        ) : (
                          "Accept Emergency Chat"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No available emergency chats</h3>
                <p className="mt-1 text-sm text-gray-500">No patients are currently waiting for emergency assistance.</p>
              </div>
            )}
          </motion.div>

          {/* Active Emergency Chats */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Active Emergency Chats ({activeChats.length})
            </h2>
            
            {activeChats.length > 0 ? (
              <div className="space-y-4">
                {activeChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedChat?.id === chat.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:shadow-md'
                    }`}
                    onClick={() => loadChatMessages(chat.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-medium">Active</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(chat.priority)}`}>
                          {getPriorityText(chat.priority)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(chat.connectedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">
                        {chat.emergencyType} Emergency
                      </p>
                      <p className="text-sm text-gray-600">
                        Location: {chat.location}
                      </p>
                      {chat.User && (
                        <p className="text-sm text-gray-600">
                          Patient: {chat.User.name} ({chat.User.phone})
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No active emergency chats</h3>
                <p className="mt-1 text-sm text-gray-500">You are not currently handling any emergency chats.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Chat Interface */}
        {selectedChat && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-white rounded-xl shadow-lg"
          >
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Emergency Chat - {selectedChat.emergencyType}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Patient: {selectedChat.User?.name} • Location: {selectedChat.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedChat(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`flex ${message.senderType === 'doctor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderType === 'doctor' 
                      ? 'bg-blue-500 text-white' 
                      : message.senderType === 'system'
                      ? 'bg-gray-500 text-white mx-auto'
                      : 'bg-gray-300 text-gray-800'
                  }`}>
                    <div className="text-xs opacity-75 mb-1">
                      {message.senderType === 'doctor' ? 'You' : message.senderType === 'system' ? 'System' : 'Patient'} • {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows="2"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DoctorEmergencyChat; 