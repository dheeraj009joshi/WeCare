import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PopupModal from "./PopupModal";

const DoctorEmergencyVideoChat = () => {
  const [availableChats, setAvailableChats] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingChat, setAcceptingChat] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isInCall, setIsInCall] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  const [showEndCallSuccess, setShowEndCallSuccess] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const peerConnection = useRef(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("doctorToken");

  useEffect(() => {
    if (!token) {
      navigate("/doctor/login");
      return;
    }
    initializeVideoCall();
    fetchEmergencyChats();
    const interval = setInterval(fetchEmergencyChats, 10000);
    return () => clearInterval(interval);
  }, [token, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera/microphone:", error);
    }
  };

  const fetchEmergencyChats = async () => {
    try {
      setLoading(true);

      // Fetch available emergency chats
      const availableResponse = await fetch(
        "http://localhost:5000/api/emergency-chat/available",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const availableData = await availableResponse.json();

      if (availableData.success) {
        setAvailableChats(availableData.data);
      }

      // Fetch active emergency chats
      const activeResponse = await fetch(
        "http://localhost:5000/api/emergency-chat/active",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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
      const response = await fetch(
        `http://localhost:5000/api/emergency-chat/session/${sessionId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        await loadChatMessages(sessionId);
        setIsInCall(true);
        alert("Emergency video call accepted successfully!");
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
      const response = await fetch(
        `http://localhost:5000/api/emergency-chat/session/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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
      const response = await fetch(
        `http://localhost:5000/api/emergency-chat/session/${selectedChat.id}/doctor-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newMessage.trim(),
            messageType: "text",
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        setMessages((prev) => [...prev, data.data]);
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        setLocalStream(screenStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
      } else {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(cameraStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error("Error toggling screen share:", error);
    }
  };

  const endCall = async () => {
    setShowEndCallConfirm(true);
  };

  const confirmEndCall = async () => {
    setShowEndCallConfirm(false);

    try {
      // Stop all tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      setIsInCall(false);
      setSelectedChat(null);
      setMessages([]);
      setShowEndCallSuccess(true);
      setTimeout(() => {
        setShowEndCallSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error ending call:", error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return "bg-red-600";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityText = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSenderName = (message) => {
    if (message.senderType === "system") return "System";
    if (message.senderType === "doctor") return "You";
    return "Patient";
  };

  const getMessageStyle = (message) => {
    switch (message.senderType) {
      case "doctor":
        return "bg-blue-500 text-white ml-auto";
      case "user":
        return "bg-green-500 text-white";
      case "system":
        return "bg-gray-500 text-white mx-auto";
      default:
        return "bg-gray-300 text-gray-800";
    }
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

  if (isInCall && selectedChat) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-[100px] min-h-screen bg-gray-900"
      >
        <div className="max-w-7xl mx-auto h-screen flex flex-col">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gray-800 border-b border-gray-700 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    Emergency Video Call
                  </h1>
                  <p className="text-sm text-gray-400">
                    {selectedChat.emergencyType} - {selectedChat.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-400 font-medium">
                  Connected
                </span>
              </div>
            </div>
          </motion.div>

          {/* Video Call Interface */}
          <div className="flex-1 flex">
            {/* Main Video Area */}
            <div className="flex-1 relative">
              {/* Remote Video (Main) */}
              <div className="w-full h-full bg-gray-800 relative">
                {remoteStream ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <svg
                        className="w-16 h-16 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-lg">Patient video will appear here</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Local Video (Picture-in-Picture) */}
              <div className="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-600">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Call Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full ${
                    isAudioEnabled
                      ? "bg-gray-600 hover:bg-gray-500"
                      : "bg-red-600 hover:bg-red-500"
                  } text-white transition-colors`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isAudioEnabled ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    )}
                  </svg>
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full ${
                    isVideoEnabled
                      ? "bg-gray-600 hover:bg-gray-500"
                      : "bg-red-600 hover:bg-red-500"
                  } text-white transition-colors`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isVideoEnabled ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                      />
                    )}
                  </svg>
                </button>

                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-full ${
                    isScreenSharing
                      ? "bg-blue-600 hover:bg-blue-500"
                      : "bg-gray-600 hover:bg-gray-500"
                  } text-white transition-colors`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                <button
                  onClick={endCall}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Sidebar */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col"
                >
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Chat</h3>
                      <button
                        onClick={() => setShowChat(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence>
                      {messages.map((message, index) => (
                        <motion.div
                          key={message.id || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex ${
                            message.senderType === "doctor"
                              ? "justify-end"
                              : message.senderType === "system"
                              ? "justify-center"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${getMessageStyle(
                              message
                            )}`}
                          >
                            <div className="text-xs opacity-75 mb-1">
                              {getSenderName(message)} •{" "}
                              {getMessageTime(message.createdAt)}
                            </div>
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-700">
                    <div className="flex space-x-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows="2"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            </AnimatePresence>

            {/* Chat Toggle Button */}
            {!showChat && (
              <button
                onClick={() => setShowChat(true)}
                className="absolute top-4 right-4 p-3 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="pt-[150px] min-h-screen p-6 bg-gray-50"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#083567] mb-2">
            Emergency Video Call Management
          </h1>
          <p className="text-gray-600">
            Manage emergency video calls and provide immediate assistance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available Emergency Video Calls */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Emergency Video Calls ({availableChats.length})
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
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(
                            chat.priority
                          )}`}
                        >
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
                            Joining...
                          </div>
                        ) : (
                          "Join Emergency Video Call"
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No available emergency video calls
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No patients are currently waiting for emergency video
                  assistance.
                </p>
              </div>
            )}
          </motion.div>

          {/* Active Emergency Video Calls */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Active Emergency Video Calls ({activeChats.length})
            </h2>

            {activeChats.length > 0 ? (
              <div className="space-y-4">
                {activeChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="border rounded-lg p-4 cursor-pointer transition-all border-green-200 bg-green-50"
                    onClick={() => {
                      loadChatMessages(chat.id);
                      setIsInCall(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-medium">
                          Active
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getPriorityColor(
                            chat.priority
                          )}`}
                        >
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
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No active emergency video calls
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You are not currently handling any emergency video calls.
                </p>
              </div>
            )}
          </motion.div>

          {/* Popup Modals */}
          <PopupModal
            isOpen={showEndCallConfirm}
            onClose={() => setShowEndCallConfirm(false)}
            title="End Emergency Call"
            message="Are you sure you want to end this emergency call? This action cannot be undone."
            type="warning"
            confirmText="End Call"
            cancelText="Cancel"
            onConfirm={confirmEndCall}
            showCancel={true}
          />

          <PopupModal
            isOpen={showEndCallSuccess}
            onClose={() => setShowEndCallSuccess(false)}
            title="Call Ended"
            message="Emergency call has been ended successfully."
            type="success"
            confirmText="OK"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorEmergencyVideoChat;
