import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

const EmergencyChat = () => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [doctorConnected, setDoctorConnected] = useState(false);
  const [waitingForDoctor, setWaitingForDoctor] = useState(true);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSessionData();
    const interval = setInterval(fetchSessionData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [token, sessionId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/emergency-chat/session/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSession(data.data.session);
        setMessages(data.data.messages);
        setDoctorConnected(data.data.session.doctorId !== null);
        setWaitingForDoctor(data.data.session.status === 'waiting');
        setError(null);
      } else {
        setError(data.message || "Failed to fetch session data");
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await fetch(`http://localhost:5000/api/emergency-chat/session/${sessionId}/message`, {
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
        // Add message to local state immediately
        setMessages(prev => [...prev, data.data]);
      } else {
        setError(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endChat = async () => {
    if (!window.confirm("Are you sure you want to end this emergency chat?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/emergency-chat/session/${sessionId}/end`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resolution: "User ended the chat"
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate("/emergency/dashboard");
      } else {
        setError(data.message || "Failed to end chat");
      }
    } catch (error) {
      console.error("Error ending chat:", error);
      setError("Network error. Please try again.");
    }
  };

  const getMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSenderName = (message) => {
    if (message.senderType === 'system') return 'System';
    if (message.senderType === 'doctor') return 'Doctor';
    return 'You';
  };

  const getMessageStyle = (message) => {
    switch (message.senderType) {
      case 'user':
        return 'bg-blue-500 text-white ml-auto';
      case 'doctor':
        return 'bg-green-500 text-white';
      case 'system':
        return 'bg-gray-500 text-white mx-auto';
      default:
        return 'bg-gray-300 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="pt-[100px] min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-96 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-[100px] min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate("/emergency/dashboard")}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Go Back to Dashboard
            </button>
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
      className="pt-[100px] min-h-screen bg-gray-50"
    >
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Emergency Chat</h1>
                <p className="text-sm text-gray-600">
                  {session?.emergencyType} - {session?.location}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {waitingForDoctor && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  <span className="text-sm text-red-600 font-medium">Waiting for doctor...</span>
                </div>
              )}
              
              {doctorConnected && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Doctor connected</span>
                </div>
              )}
              
              <button
                onClick={endChat}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                End Chat
              </button>
            </div>
          </div>
        </motion.div>

        {/* Chat Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.senderType === 'user' ? 'justify-end' : message.senderType === 'system' ? 'justify-center' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageStyle(message)}`}>
                  <div className="text-xs opacity-75 mb-1">
                    {getSenderName(message)} • {getMessageTime(message.createdAt)}
                  </div>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </motion.div>

        {/* Message Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border-t border-gray-200 p-4"
        >
          <div className="flex space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={waitingForDoctor ? "Waiting for doctor to join..." : "Type your message..."}
              disabled={waitingForDoctor || sending}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="2"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending || waitingForDoctor}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Send"
              )}
            </button>
          </div>
          
          {waitingForDoctor && (
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">
                A doctor will join shortly. Please wait...
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EmergencyChat; 