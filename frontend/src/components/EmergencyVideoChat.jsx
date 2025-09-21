import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import WebRTCService from "../services/webrtcService";
import PopupModal from "./PopupModal";

const EmergencyVideoChat = () => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [doctorConnected, setDoctorConnected] = useState(false);
  const [waitingForDoctor, setWaitingForDoctor] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [videoCallId, setVideoCallId] = useState(null);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [connectionState, setConnectionState] = useState('new');
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  const [showEndCallSuccess, setShowEndCallSuccess] = useState(false);
  
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const webrtcService = useRef(null);
  const signalingInterval = useRef(null);
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchSessionData();
    const interval = setInterval(fetchSessionData, 5000);
    return () => {
      clearInterval(interval);
      if (signalingInterval.current) {
        clearInterval(signalingInterval.current);
      }
      if (webrtcService.current) {
        webrtcService.current.cleanup();
      }
    };
  }, [token, sessionId, navigate]);

  useEffect(() => {
    if (doctorConnected && videoCallId && !isVideoCallActive) {
      initializeVideoCall();
      startSignaling();
      setIsVideoCallActive(true);
    }
  }, [doctorConnected, videoCallId, isVideoCallActive]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeVideoCall = async () => {
    try {
      // Initialize WebRTC service
      webrtcService.current = new WebRTCService();
      
      const stream = await webrtcService.current.initialize(
        videoCallId,
        'user',
        (remoteStream) => {
          setRemoteStream(remoteStream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        },
        (state) => {
          setConnectionState(state);
          console.log('Connection state:', state);
        },
        (candidate) => {
          webrtcService.current.sendICECandidate(candidate);
        }
      );
      
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera/microphone:", error);
      setError("Unable to access camera/microphone. Please check permissions.");
    }
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
        
        // Create video call session if doctor is connected
        if (data.data.session.doctorId !== null && !videoCallId) {
          await createVideoCallSession();
        }
        
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

  const createVideoCallSession = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/video-call/session/${sessionId}/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setVideoCallId(data.data.videoCallId);
      } else {
        console.error("Failed to create video call session:", data.message);
      }
    } catch (error) {
      console.error("Error creating video call session:", error);
    }
  };

  const startSignaling = () => {
    if (signalingInterval.current) {
      clearInterval(signalingInterval.current);
    }

    signalingInterval.current = setInterval(async () => {
      if (!webrtcService.current || !videoCallId) return;

      try {
        const signalingData = await webrtcService.current.pollSignalingData();
        
        if (signalingData) {
          // Handle offer
          if (signalingData.offer && !webrtcService.current.getPeerConnection().remoteDescription) {
            await webrtcService.current.handleOffer(signalingData.offer);
          }
          
          // Handle answer
          if (signalingData.answer && webrtcService.current.getPeerConnection().remoteDescription) {
            await webrtcService.current.handleAnswer(signalingData.answer);
          }
          
          // Handle ICE candidates
          if (signalingData.candidates && signalingData.candidates.length > 0) {
            for (const candidate of signalingData.candidates) {
              await webrtcService.current.handleICECandidate(candidate);
            }
          }
        }
      } catch (error) {
        console.error("Error in signaling:", error);
      }
    }, 2000);
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
          video: true
        });
        setLocalStream(screenStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
      } else {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
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
      // Cleanup WebRTC
      if (webrtcService.current) {
        await webrtcService.current.leaveVideoCall();
        webrtcService.current.cleanup();
      }

      // Stop signaling
      if (signalingInterval.current) {
        clearInterval(signalingInterval.current);
      }

      // Stop all tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      const response = await fetch(`http://localhost:5000/api/emergency-chat/session/${sessionId}/end`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resolution: "User ended the call"
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowEndCallSuccess(true);
        setTimeout(() => {
          navigate("/emergency/dashboard");
        }, 2000);
      } else {
        setError(data.message || "Failed to end call");
      }
    } catch (error) {
      console.error("Error ending call:", error);
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
        <div className="max-w-6xl mx-auto">
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
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Emergency Video Call</h1>
                <p className="text-sm text-gray-400">
                  {session?.emergencyType} - {session?.location}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {waitingForDoctor && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                  <span className="text-sm text-red-400 font-medium">Waiting for doctor...</span>
                </div>
              )}
              
              {doctorConnected && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-400 font-medium">Doctor connected</span>
                </div>
              )}
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
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg">Waiting for doctor to join...</p>
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
                className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'} text-white transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isAudioEnabled ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'} text-white transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isVideoEnabled ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                  )}
                </svg>
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'} text-white transition-colors`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>

              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
                        className={`flex ${message.senderType === 'user' ? 'justify-end' : message.senderType === 'system' ? 'justify-center' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs px-4 py-2 rounded-lg ${getMessageStyle(message)}`}>
                          <div className="text-xs opacity-75 mb-1">
                            {getSenderName(message)} • {getMessageTime(message.createdAt)}
                          </div>
                          <div className="whitespace-pre-wrap">{message.content}</div>
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
                      placeholder={waitingForDoctor ? "Waiting for doctor to join..." : "Type your message..."}
                      disabled={waitingForDoctor || sending}
                      className="flex-1 border border-gray-600 rounded-lg px-3 py-2 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="2"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending || waitingForDoctor}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                      <p className="text-sm text-gray-400">
                        A doctor will join shortly. Please wait...
                      </p>
                    </div>
                  )}
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          )}

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
            message="Emergency call has been ended successfully. Redirecting to dashboard..."
            type="success"
            confirmText="OK"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default EmergencyVideoChat; 