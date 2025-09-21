import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {
  FiMusic,
  FiActivity,
  FiHeart,
  FiSend,
  FiClock,
  FiPlay,
  FiMic,
  FiMicOff,
  FiAlertCircle,
  FiRefreshCw,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";
import { useRef } from "react";
import {
  createChatSession,
  fetchChatMessages,
  sendMessage,
  getAIReply,
  getAIGreet,
  updateChatTitle,
  getAITitle,
} from "../api/chatApi";

// Error Toast Component
const ErrorToast = ({ message, onClose, onRetry }) => (
  <div className="fixed top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
    <div className="flex items-start">
      <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-800 text-sm font-medium">{message}</p>
        <div className="flex gap-2 mt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-red-600 hover:text-red-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Network Status Component
const NetworkStatus = ({ isOnline, isConnecting }) => (
  <div
    className={`fixed top-4 left-4 z-40 flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
      isOnline
        ? "bg-green-50 text-green-700 border border-green-200"
        : "bg-red-50 text-red-700 border border-red-200"
    }`}
  >
    {isConnecting ? (
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
    ) : isOnline ? (
      <FiWifi className="text-green-500" />
    ) : (
      <FiWifiOff className="text-red-500" />
    )}
    <span className="font-medium">
      {isConnecting ? "Connecting..." : isOnline ? "Online" : "Offline"}
    </span>
  </div>
);

// Enhanced Error Message Component
const ErrorMessage = ({ error, onRetry, onDismiss }) => {
  const getErrorMessage = (error) => {
    if (error?.response?.status === 404) {
      return "The requested resource was not found. Please try again.";
    }
    if (error?.response?.status === 500) {
      return "Server error occurred. Please try again in a moment.";
    }
    if (error?.response?.status === 429) {
      return "Too many requests. Please wait a moment before trying again.";
    }
    if (
      error?.code === "NETWORK_ERROR" ||
      error?.message?.includes("Network Error")
    ) {
      return "Network connection lost. Please check your internet connection.";
    }
    if (error?.code === "ECONNABORTED" || error?.message?.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    return error?.message || "An unexpected error occurred. Please try again.";
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-red-800 font-medium mb-1">Error</h3>
          <p className="text-red-700 text-sm mb-3">{getErrorMessage(error)}</p>
          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
              >
                <FiRefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-xs text-red-600 hover:text-red-800 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Loading Component
const LoadingSpinner = ({ message = "Loading...", size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin`}
      ></div>
      <span className="text-gray-600 text-sm">{message}</span>
    </div>
  );
};

// Skeleton Loading Components
const SkeletonMessage = ({ isAI = false }) => (
  <div className={`mb-4 flex ${isAI ? "justify-start" : "justify-end"}`}>
    <div
      className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg animate-pulse ${
        isAI ? "bg-gray-200" : "bg-gray-300"
      }`}
    >
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
    </div>
  </div>
);

// Quick Reply Buttons Component
const QuickReplies = ({ onQuickReply }) => {
  const quickReplies = [
    "Hello! How can you help me?",
    "I'm feeling stressed",
    "I need health advice",
    "Tell me about meditation",
    "What exercises can I do?",
    "I can't sleep well",
  ];

  return (
    <div className="mb-4 flex flex-wrap gap-2 justify-center">
      {quickReplies.map((reply, index) => (
        <button
          key={index}
          onClick={() => onQuickReply(reply)}
          className="px-4 py-2 bg-[#FFEEF5] text-[#083567] rounded-full text-sm hover:bg-[#FFE0F0] transition-colors border border-[#FFD6E7]"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

// Enhanced Message Status Component
const MessageStatus = ({ status, onRetry, messageId, error }) => {
  const getStatusIcon = () => {
    switch (status) {
      case "sending":
        return (
          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        );
      case "sent":
        return <span className="text-green-500 text-xs">✓</span>;
      case "error":
        return <span className="text-red-500 text-xs">✗</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-1">
      {getStatusIcon()}
      {status === "error" && (
        <button
          onClick={() => onRetry(messageId)}
          className="text-xs text-red-500 hover:text-red-700 underline ml-1 flex items-center gap-1"
          title={error || "Click to retry"}
        >
          <FiRefreshCw className="w-2 h-2" />
          Retry
        </button>
      )}
    </div>
  );
};

// Message Feedback Component
const MessageFeedback = ({ messageId, onFeedback, currentFeedback }) => {
  const handleFeedback = (type) => {
    onFeedback(messageId, type);
  };
  const feedback = currentFeedback; // Use the prop directly

  return (
    <div className="flex items-center gap-1 mt-2">
      <button
        onClick={() => handleFeedback("positive")}
        className={`p-1 rounded transition-colors ${
          feedback === "positive"
            ? "text-green-500"
            : "text-gray-400 hover:text-green-500"
        }`}
        title="This was helpful"
      >
        <i className="fa-regular fa-thumbs-up"></i>
      </button>
      <button
        onClick={() => handleFeedback("negative")}
        className={`p-1 rounded transition-colors ${
          feedback === "negative"
            ? "text-red-500"
            : "text-gray-400 hover:text-red-500"
        }`}
        title="This was not helpful"
      >
        <i className="fa-regular fa-thumbs-down"></i>
      </button>
    </div>
  );
};

// Escalation Links Component
const EscalationLinks = ({ escalationLinks, onLinkClick, onDismiss }) => {
  if (!escalationLinks) return null;
  return (
    <div className="mb-4 flex justify-start">
      <div className="max-w-xs md:max-w-md px-4 py-3 rounded-lg bg-red-50 border border-red-200 shadow-sm relative">
        <div className="flex items-center gap-2 mb-2">
          <FiAlertCircle className="text-red-500 flex-shrink-0" />
          <span className="text-red-800 font-medium text-sm">
            Emergency Detected
          </span>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ml-auto text-red-400 hover:text-red-600 transition-colors"
              title="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-red-700 text-sm mb-3">
          Based on your symptoms, you may need immediate medical attention.
          Please consider:
        </p>
        <div className="space-y-2">
          <button
            onClick={() => onLinkClick(escalationLinks.doctorServices)}
            className="w-full text-left p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
          >
            <span>👨‍⚕️</span>
            <span>Consult with Doctor</span>
          </button>
          <button
            onClick={() => onLinkClick(escalationLinks.emergencyServices)}
            className="w-full text-left p-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors text-sm font-medium flex items-center gap-2"
          >
            <span>🚨</span>
            <span>Emergency Contact</span>
          </button>
        </div>
        <p className="text-red-600 text-xs mt-2">
          These services can provide immediate medical assistance.
        </p>
      </div>
    </div>
  );
};

// Typing Indicator Component (like WhatsApp)
const TypingIndicator = () => (
  <div className="mb-4 flex justify-start">
    <div className="max-w-xs md:max-w-md px-4 py-2 rounded-lg bg-[#FFEEF5] shadow-sm">
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <span className="text-xs text-gray-500 ml-2">AI is typing...</span>
      </div>
    </div>
  </div>
);

const SkeletonContentCard = () => (
  <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-4"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="flex items-center mb-4">
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="h-8 bg-gray-200 rounded-full w-8"></div>
      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
    </div>
  </div>
);

// const SkeletonVideoCard = () => (
//   <div className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
//     <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
//     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//   </div>
// );

const ChatBot = ({ initialPanel = "chat" }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [isAITyping, setIsAITyping] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messageStatuses, setMessageStatuses] = useState({});
  const [feedbackData, setFeedbackData] = useState(() => {
    const saved = localStorage.getItem("chatFeedback");
    return saved ? JSON.parse(saved) : {};
  });

  // Voice Input States
  const [isListening, setIsListening] = useState(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Feature 6: Auto-scroll & Focus Management
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem("chatSessions");
    return saved ? JSON.parse(saved) : [];
  });

  const getInitialPanel = () => {
    const savedPanel = localStorage.getItem("activeRightPanel");
    return savedPanel ? savedPanel : "chat";
  };
  const getInitialChatId = (sessions) => {
    const savedChatId = localStorage.getItem("currentChatId");
    if (savedChatId && sessions.some((c) => c.id == savedChatId))
      return Number(savedChatId);
    return sessions[0]?.id;
  };

  const [activeRightPanel, setActiveRightPanel] = useState(() => {
    // First check if we have an initialPanel prop
    if (initialPanel) return initialPanel;

    // Then check localStorage
    const savedPanel = localStorage.getItem("activeRightPanel");
    return savedPanel || "chat";
  });
  const [currentChatId, setCurrentChatId] = useState(() =>
    getInitialChatId(chatSessions)
  );
  const [inputText, setInputText] = useState("");

  const [menuOpenId, setMenuOpenId] = useState(null); /*
  const [renamingId, setRenamingId] = useState(null);
  const [renameInput, setRenameInput] = useState("");
  */

  const [modalYogaIdx, setModalYogaIdx] = useState(null);
  const [modalMusicIdx, setModalMusicIdx] = useState(null);
  const [modalMeditationIdx, setModalMeditationIdx] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Enhanced Error Handling States
  const [errors, setErrors] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnecting, setIsConnecting] = useState(false);
  const [retryCounts, setRetryCounts] = useState({});
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);

  // File upload staging states
  const [stagedFile, setStagedFile] = useState(null);

  // Add a mapping from local chat id to backend sessionId
  const [sessionIdMap, setSessionIdMap] = useState({});

  // Escalation state
  const [escalationLinks, setEscalationLinks] = useState(() => {
    const saved = localStorage.getItem("escalationLinks");
    return saved ? JSON.parse(saved) : null;
  });

  // Save chats to localStorage
  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  // --- Add localStorage persistence for activeRightPanel and currentChatId ---
  useEffect(() => {
    localStorage.setItem("activeRightPanel", activeRightPanel);
  }, [activeRightPanel]);
  useEffect(() => {
    localStorage.setItem("currentChatId", currentChatId);
  }, [currentChatId]);

  // Escalation persistence
  useEffect(() => {
    if (escalationLinks) {
      localStorage.setItem("escalationLinks", JSON.stringify(escalationLinks));
    } else {
      localStorage.removeItem("escalationLinks");
    }
  }, [escalationLinks]);
  // On mount, restore from localStorage
  // useEffect(() => {
  //   const savedPanel = localStorage.getItem('activeRightPanel');
  //   const savedChatId = localStorage.getItem('currentChatId');
  //   if (savedPanel) setActiveRightPanel(savedPanel);
  //   if (savedChatId && chatSessions.some(c => c.id == savedChatId)) setCurrentChatId(Number(savedChatId));
  // }, []);

  // On mount, restore session from localStorage or create new chat
  useEffect(() => {
    const savedChatId = localStorage.getItem("currentChatId");
    const savedSessionIdMap = localStorage.getItem("sessionIdMap");
    if (savedChatId && savedSessionIdMap) {
      setCurrentChatId(Number(savedChatId));
      setSessionIdMap(JSON.parse(savedSessionIdMap));
      // After restoring, check if sessionId is valid
      const parsedMap = JSON.parse(savedSessionIdMap);
      if (!parsedMap[Number(savedChatId)]) {
        handleNewChat();
      }
    } else if (chatSessions.length === 0) {
      handleNewChat();
    }
    setLoading(false);
    // eslint-disable-next-line
  }, []);

  // Enhanced Error Handling Functions
  const addError = (error, context = "") => {
    const errorId = Date.now().toString();
    const newError = {
      id: errorId,
      error,
      context,
      timestamp: new Date().toISOString(),
    };
    setErrors((prev) => [...prev, newError]);

    // Auto-remove error after 10 seconds
    setTimeout(() => {
      setErrors((prev) => prev.filter((e) => e.id !== errorId));
    }, 10000);
  };

  const removeError = (errorId) => {
    setErrors((prev) => prev.filter((e) => e.id !== errorId));
  };

  const retryOperation = async (operation, context, maxRetries = 3) => {
    const retryKey = `${context}-${Date.now()}`;
    let currentRetries = retryCounts[retryKey] || 0;

    if (currentRetries >= maxRetries) {
      addError(new Error("Maximum retry attempts reached"), context);
      return false;
    }

    try {
      setIsConnecting(true);
      const result = await operation();
      setIsConnecting(false);
      setRetryCounts((prev) => ({ ...prev, [retryKey]: 0 }));
      return result;
    } catch (error) {
      currentRetries++;
      setRetryCounts((prev) => ({ ...prev, [retryKey]: currentRetries }));
      setIsConnecting(false);

      if (currentRetries < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, currentRetries) * 1000;
        setTimeout(() => {
          retryOperation(operation, context, maxRetries);
        }, delay);
      } else {
        addError(error, context);
      }
      return false;
    }
  };

  // Network Status Monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsConnecting(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsConnecting(false);
      addError(new Error("Network connection lost"), "network");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save session info to localStorage when changed
  useEffect(() => {
    localStorage.setItem("currentChatId", currentChatId);
    localStorage.setItem("sessionIdMap", JSON.stringify(sessionIdMap));
  }, [currentChatId, sessionIdMap]);

  // Feature 6: Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatSessions, currentChatId]);

  // Feature 6: Focus management - focus input on mount and after sending
  useEffect(() => {
    if (activeRightPanel === "chat") {
      inputRef.current?.focus();
    }
  }, [activeRightPanel]);

  // Feature 6: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to send message
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isSending && !isProcessingMessage && inputText.trim()) {
          handleSend();
        }
      }
      // Escape to clear input
      if (e.key === "Escape") {
        setInputText("");
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [inputText, isSending]);

  // On chat load, fetch messages from backend
  useEffect(() => {
    if (!currentChatId || !sessionIdMap[currentChatId]) return;
    fetchChatMessages(sessionIdMap[currentChatId])
      .then((res) => res.data)
      .then((messages) => {
        setChatSessions((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId ? { ...chat, messages } : chat
          )
        );
      });
  }, [currentChatId, sessionIdMap]);

  // Initialize voice recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsVoiceSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          alert("Please allow microphone access to use voice input.");
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Voice input functions
  const startListening = () => {
    if (!isVoiceSupported) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Create new chat
  const handleNewChat = async () => {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      alert("No userId found. Please login again.");
      console.error("No userId in localStorage");
      return;
    }
    try {
      const res = await createChatSession(userId, "Chat");
      const session = res.data;
      const newChatId = Date.now();
      const greetRes = await getAIGreet();
      const greetData = greetRes.data;
      await sendMessage(session.id, "ai", greetData.response);
      setSessionIdMap((prev) => ({ ...prev, [newChatId]: session.id }));
      setChatSessions((prev) => [
        {
          id: newChatId,
          title: `Chat ${prev.length + 1}`,
          messages: [
            {
              sender: "ai",
              text: greetData.response,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ],
        },
        ...prev,
      ]);
      setCurrentChatId(newChatId);
      setActiveRightPanel("chat");
      setShowQuickReplies(true);
      setEscalationLinks(null); // Clear escalation links for new chat
    } catch (err) {
      alert("Failed to start new chat. See console for details.");
      console.error(err);
    }
  };

  // Handle quick reply selection
  const handleQuickReply = (messageText) => {
    if (!isProcessingMessage) {
      setInputText(messageText);
      handleSend(messageText);
      // Feature 6: Focus input after quick reply
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Handle message retry
  const handleRetryMessage = (messageId) => {
    if (!isProcessingMessage) {
      const message = currentChat.find((msg) => msg.id === messageId);
      if (message && message.sender === "user") {
        setMessageStatuses((prev) => ({ ...prev, [messageId]: "sending" }));
        handleSend(message.text, messageId);
      }
    }
  };

  // Handle message feedback
  const handleFeedback = (messageId, feedbackType) => {
    const newFeedbackData = { ...feedbackData, [messageId]: feedbackType };
    setFeedbackData(newFeedbackData);
    // Save to localStorage
    localStorage.setItem("chatFeedback", JSON.stringify(newFeedbackData));
    console.log(`Feedback for message ${messageId}: ${feedbackType}`);
    // Here you could send feedback to backend for analytics
  };

  // Enhanced Send message with better error handling
  const handleSend = async (messageText = null, messageId = null) => {
    if (isProcessingMessage) {
      console.log("handleSend blocked - already processing message");
      return;
    }

    const textToSend = messageText || inputText;
    console.log("handleSend called with:", {
      messageText,
      inputText,
      textToSend,
    });

    if (!textToSend.trim()) {
      console.log("No text to send, returning early");
      return;
    }

    const sessionId = sessionIdMap[currentChatId];
    console.log("Session check:", { currentChatId, sessionId, sessionIdMap });

    if (!sessionId) {
      console.log("No sessionId found, showing error message");
      addError(
        new Error("Session not ready. Please try again or start a new chat."),
        "session"
      );
      return;
    }

    const newMessageId =
      messageId ||
      `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newMessage = {
      id: newMessageId,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    try {
      setIsProcessingMessage(true);
      setIsSending(true);

      // Set message status to sending
      setMessageStatuses((prev) => ({ ...prev, [newMessageId]: "sending" }));

      // Immediately update UI with user message
      setChatSessions((prev) =>
        prev.map((chat) => {
          if (chat.id === currentChatId) {
            let newTitle = chat.title;
            if (
              chat.title.startsWith("Chat ") &&
              chat.messages.filter((m) => m.sender === "user").length === 0
            ) {
              // Get AI title asynchronously without blocking
              getAITitle(textToSend)
                .then((res) => {
                  const data = res.data;
                  setChatSessions((prev2) =>
                    prev2.map((chat2) =>
                      chat2.id === currentChatId
                        ? { ...chat2, title: data.title }
                        : chat2
                    )
                  );
                })
                .catch((err) => {
                  console.error("Failed to get AI title:", err);
                  addError(err, "ai-title");
                  setChatSessions((prev2) =>
                    prev2.map((chat2) =>
                      chat2.id === currentChatId
                        ? { ...chat2, title: textToSend }
                        : chat2
                    )
                  );
                });
            }
            return { ...chat, messages: [...chat.messages, newMessage] };
          }
          return chat;
        })
      );

      setInputText("");

      // Feature 6: Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Show typing indicator immediately
      setIsAITyping(true);

      // Save user message with retry mechanism
      await retryOperation(
        () => sendMessage(sessionId, "user", textToSend),
        "save-user-message"
      );

      // Get AI reply with retry mechanism
      const aiRes = await retryOperation(
        () => getAIReply(sessionId, textToSend),
        "ai-reply"
      );

      if (!aiRes) {
        throw new Error("Failed to get AI response after retries");
      }

      const aiData = aiRes.data;

      // Handle escalation if triggered
      if (aiData.escalation) {
        setEscalationLinks(aiData.escalationLinks);
      } else {
        setEscalationLinks(null);
      }

      // Hide typing indicator
      setIsAITyping(false);

      const aiReply = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sender: "ai",
        text: aiData.response,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Update UI with AI reply immediately
      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, aiReply] }
            : chat
        )
      );

      // Save AI message with retry mechanism
      retryOperation(
        () => sendMessage(sessionId, "ai", aiData.response),
        "save-ai-message"
      );

      // Hide quick replies after first message
      setShowQuickReplies(false);
      setIsSending(false);
      setIsProcessingMessage(false);

      // Set message status to sent
      setMessageStatuses((prev) => ({ ...prev, [newMessageId]: "sent" }));
    } catch (err) {
      // Hide typing indicator on error
      setIsAITyping(false);
      setIsSending(false);
      setIsProcessingMessage(false);

      // Set message status to error with error details
      setMessageStatuses((prev) => ({
        ...prev,
        [newMessageId]: "error",
        [`${newMessageId}-error`]: err.message,
      }));

      console.error("Error sending message:", err);
      addError(err, "send-message");

      const errorMessage = {
        sender: "ai",
        text: "I'm having trouble responding right now. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: [...chat.messages, errorMessage] }
            : chat
        )
      );

      // Check if escalation was triggered even in error response
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        console.log("Error response data:", errorData); // Debug log
        if (errorData.escalation) {
          console.log(
            "Setting escalation links from error response:",
            errorData.escalationLinks
          );
          setEscalationLinks(errorData.escalationLinks);
        } else {
          setEscalationLinks(null);
        }
      }
    }
  };

  // Enhanced Handle file upload with better error handling
  // Handle file selection (staging) - no auto-upload
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      addError(
        new Error(
          "File size too large. Please select a file smaller than 10MB."
        ),
        "file-upload"
      );
      return;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      addError(
        new Error(
          "File type not supported. Please upload an image, text file, or PDF."
        ),
        "file-upload"
      );
      return;
    }

    // Stage the file for later upload
    setStagedFile(file);
  };

  // Handle file upload with message
  const handleFileUploadWithMessage = async (messageText = "") => {
    if (!stagedFile) return;

    const sessionId = sessionIdMap[currentChatId];
    if (!sessionId) {
      addError(
        new Error("Session not ready. Please try again or start a new chat."),
        "file-upload"
      );
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", stagedFile);
      formData.append("userId", localStorage.getItem("userId"));
      formData.append("sessionId", sessionId);
      formData.append("messageText", messageText.trim()); // Send message text with file

      const response = await retryOperation(async () => {
        const res = await fetch("http://localhost:5000/api/chat/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Upload failed with status ${res.status}`
          );
        }

        return res;
      }, "file-upload");

      if (!response) {
        throw new Error("Upload failed after retries");
      }

      const data = await response.json();

      // Create user message with file and optional text
      const userMessageText = messageText.trim()
        ? `${messageText}\n\n📎 Uploaded: ${stagedFile.name}`
        : `📎 Uploaded: ${stagedFile.name}`;

      const userMessage = {
        sender: "user",
        text: userMessageText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Add AI response about the file
      const aiMessage = {
        sender: "ai",
        text: data.aiResponse,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setChatSessions((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: [...chat.messages, userMessage, aiMessage],
              }
            : chat
        )
      );

      // Messages are already saved by the backend, no need for additional API calls
    } catch (error) {
      console.error("File upload error:", error);
      addError(error, "file-upload");
    } finally {
      setIsUploading(false);
      setStagedFile(null);
      setInputText(""); // Clear the main input
    }
  };

  // Escalation handlers
  const handleEscalationLinkClick = (link) => {
    window.open(link, "_blank"); // Opens in a new tab
  };

  const handleEscalationDismiss = () => {
    setEscalationLinks(null);
  };

  // Get only the most recent chat for display
  const mostRecentChat = chatSessions.length > 0 ? [chatSessions[0]] : [];
  const currentChat =
    chatSessions.find((chat) => chat.id === currentChatId)?.messages || [];
  // Content for different panels
  // Update the data arrays to include YouTube/audio URLs
  const playlists = [
    {
      title: "432 Hz Sound to elevate vibrations",
      youtubeId: "D2KRO0qRDhU",
    },
    {
      title: "528 Hz Sound for DNA Repair",
      youtubeId: "ZNpzjSLtwu8",
    },
    {
      title: "396 Hz - The Healing Frequency",
      youtubeId: "WYnk6IsoCyM",
      thumbnail: "https://img.youtube.com/vi/Dx5qFachd3A/hqdefault.jpg",
    },
    {
      title: "Solfeggio Frequency: The Crystal Singing Bowls",
      youtubeId: "B33xdsmJTdE",
      thumbnail: "https://img.youtube.com/vi/fRh_vgS2dFE/hqdefault.jpg",
    },
    {
      title: "Binaural Beats: The Frequency of Focus",
      youtubeId: "1_G60OdEzXs",
    },
    {
      title: "Full Body Repair & Healing",
      youtubeId: "0hTdGBmE8QI",
    },
    {
      title: "Flute Music",
      youtubeId: "UX9WBLHqfZM",
    },
    {
      title: "Alpha Beats",
      youtubeId: "WPni755-Krg",
      thumbnail: "https://img.youtube.com/vi/WPni755-Krg/hqdefault.jpg",
    },
    {
      title: "Relaxing Music for Stress Relief, Sleep & Meditation",
      youtubeId: "2OEL4P1Rz04",
      thumbnail: "https://img.youtube.com/vi/2OEL4P1Rz04/hqdefault.jpg",
    },
    {
      title: "Moonlight Sonata",
      youtubeId: "4591dCHe_sE",
    },
  ];

  const yogaSessions = [
    {
      title: "Yoga For Complete Beginners",
      youtubeId: "v7AYKMP6rOE",
    },
    {
      title: "Yoga For Back Pain",
      youtubeId: "2VuLBYrgG94",
    },
    {
      title: "Morning Yoga Stretch",
      youtubeId: "4pKly2JojMw",
    },
    {
      title: "Yoga For Flexibility",
      youtubeId: "dF7O6-QabIo",
    },
    {
      title: "Yoga For Stress Relief",
      youtubeId: "oBu-pQG6sTY",
    },
    {
      title: "Flexibility & Strength Flow",
      youtubeId: "brjAjq4zEIE",
    },
    {
      title: "Fat Burning Yoga",
      youtubeId: "hJbRpHZr_d0",
    },
    {
      title: "Beginner Home Yoga",
      youtubeId: "Eml2xnoLpYE",
    },
    {
      title: "Power Vinyasa Flow",
      youtubeId: "Vi78by7cCEQ",
    },
    {
      title: "Relax & De-Stress Yoga",
      youtubeId: "149Iac5fmoE",
    },
    {
      title: "Digestion Boost Yoga",
      youtubeId: "cxm0zdZDLeE",
    },
    {
      title: "Neck & Shoulder Relief",
      youtubeId: "LCyP3F7gRC4",
    },
    {
      title: "Gentle Morning Yoga",
      youtubeId: "6kJgTouHHeE",
    },
    {
      title: "Yoga for Hips & Lower Back",
      youtubeId: "4BOTvaRaDjI",
    },
    {
      title: "Quick Energy Yoga",
      youtubeId: "OQ6NfFIr2jw",
    },
  ];

  const meditationSessions = [
    {
      title: "5-Minute Calm",
      youtubeId: "inpok4MKVLM",
      thumbnail: "https://img.youtube.com/vi/inpok4MKVLM/hqdefault.jpg",
    },
    {
      title: "Sleep Meditation",
      youtubeId: "M0u9GST_j3s",
      thumbnail: "https://img.youtube.com/vi/M0u9GST_j3s/hqdefault.jpg",
    },
    {
      title: "Deep Relaxation Meditation",
      youtubeId: "ZToicYcHIOU",
      thumbnail: "https://img.youtube.com/vi/ZToicYcHIOU/hqdefault.jpg",
    },
    {
      title: "Guided Body Scan",
      youtubeId: "ihO02wUzgkc",
      thumbnail: "https://img.youtube.com/vi/ihO02wUzgkc/hqdefault.jpg",
    },
    {
      title: "10-Minute Mindfulness",
      youtubeId: "6p_yaNFSYao",
      thumbnail: "https://img.youtube.com/vi/6p_yaNFSYao/hqdefault.jpg",
    },
    {
      title: "Stress Relief Meditation",
      youtubeId: "MIr3RsUWrdo",
      thumbnail: "https://img.youtube.com/vi/MIr3RsUWrdo/hqdefault.jpg",
    },
  ];

  const sidebarButtons = [
    {
      name: "Music",
      icon: <FiMusic />,
      onClick: () => setActiveRightPanel("music"),
    },
    {
      name: "Yoga",
      icon: <FiActivity />,
      onClick: () => setActiveRightPanel("yoga"),
    },
    {
      name: "Meditation",
      icon: <FiHeart />,
      onClick: () => setActiveRightPanel("meditation"),
    },
  ];

  const renderContentCard = (item, onPlay) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-[#FFEEF5] flex flex-col items-center">
      <div
        className="w-full mb-4 relative"
        style={{
          aspectRatio: "16/9",
          background: "#f3f3f3",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {item.youtubeId ? (
          <img
            src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        {item.youtubeId && (
          <span
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 40,
              color: "#fff",
              pointerEvents: "none",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            ▶
          </span>
        )}
      </div>
      <h3 className="text-xl font-semibold text-[#083567] mb-2 text-center w-full">
        {item.title}
      </h3>
      <div className="flex items-center text-gray-500 mb-2 text-sm w-full justify-center">
        <FiClock className="mr-2" />
        <span>
          {item.duration}
          {item.difficulty ? ` • ${item.difficulty}` : ""}
          {item.type ? ` • ${item.type}` : ""}
          {item.category ? ` • ${item.category}` : ""}
        </span>
      </div>
      <button
        className="bg-[#083567] text-white p-3 rounded-full hover:bg-opacity-90 flex items-center gap-2 mt-2"
        onClick={onPlay}
      >
        <FiPlay />
        <span>Play</span>
      </button>
    </div>
  );

  // Handler to delete a chat
  /*
  const handleDeleteChat = (chatId) => {
    setChatSessions((prev) => prev.filter((chat) => chat.id !== chatId));
    // If the current chat is deleted, switch to another chat if available
    if (currentChatId === chatId && chatSessions.length > 1) {
      const nextChat = chatSessions.find((chat) => chat.id !== chatId);
      setCurrentChatId(nextChat.id);
    }
  };

  // Handler to start renaming
  const handleStartRename = (chatId, currentTitle) => {
    setRenamingId(chatId);
    setRenameInput(currentTitle);
    setMenuOpenId(null);
  };

  // Handler to save rename
  const handleSaveRename = (chatId) => {
    setChatSessions((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, title: renameInput } : chat
      )
    );
    setRenamingId(null);
    setRenameInput("");
  };*/

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuOpenId &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpenId]);

  return (
    <div className="pt-[100px] flex h-screen bg-transparent">
      {/* Network Status Indicator */}
      {!isOnline && (
        <NetworkStatus isOnline={isOnline} isConnecting={isConnecting} />
      )}

      {/* Error Toasts */}
      {errors.map((error) => (
        <ErrorToast
          key={error.id}
          message={error.error.message}
          onClose={() => removeError(error.id)}
          onRetry={() => {
            removeError(error.id);
            // Retry the specific operation based on context
            if (error.context === "send-message") {
              // Retry the last message
              const lastUserMessage = currentChat
                .filter((msg) => msg.sender === "user")
                .pop();
              if (lastUserMessage) {
                handleRetryMessage(lastUserMessage.id);
              }
            }
          }}
        />
      ))}

      <Sidebar
        activeRightPanel={activeRightPanel}
        setActiveRightPanel={setActiveRightPanel}
        chatSessions={chatSessions.length > 0 ? [chatSessions[0]] : []}
        currentChatId={currentChatId}
        setCurrentChatId={setCurrentChatId}
        handleNewChat={handleNewChat}
        /*
        renamingId={renamingId}
        renameInput={renameInput}
        setRenameInput={setRenameInput}*/
        /*
        handleSaveRename={handleSaveRename}
        menuOpenId={menuOpenId}
        setMenuOpenId={setMenuOpenId}
        handleStartRename={handleStartRename}
        handleDeleteChat={handleDeleteChat}*/
        menuRef={menuRef}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
      />
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: sidebarCollapsed ? "4rem" : "8rem",
          transition: "margin-left 300ms",
        }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <h1 className="text-2xl md:text-3xl font-bold text-[#083567] my-8 text-right">
              Loading ChatBot...
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonMessage />
              <SkeletonMessage isAI />
              <SkeletonMessage />
              <SkeletonMessage isAI />
            </div>
            <div className="p-4 border-t border-gray-200 bg-white rounded-2xl mt-6">
              <div className="flex items-center gap-2 w-2/3 mx-auto">
                <div className="h-10 bg-gray-200 rounded-full w-full"></div>
                <div className="h-10 bg-gray-200 rounded-full w-full"></div>
                <div className="h-10 bg-gray-200 rounded-full w-full"></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                WeCure offers support, not medical advice.
              </p>
            </div>
          </div>
        ) : activeRightPanel === "chat" ? (
          <>
            <div className="flex-1 py-4 overflow-y-auto w-2/3 mx-auto ">
              {contentLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SkeletonMessage />
                  <SkeletonMessage isAI />
                  <SkeletonMessage />
                  <SkeletonMessage isAI />
                </div>
              ) : (
                <>
                  {/* Escalation Links */}
                  <EscalationLinks
                    escalationLinks={escalationLinks}
                    onLinkClick={handleEscalationLinkClick}
                    onDismiss={handleEscalationDismiss}
                  />
                  {currentChat.map((msg, index) => (
                    <div
                      key={index}
                      className={`mb-4 flex ${
                        msg.sender === "ai" ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                          msg.sender === "ai"
                            ? "bg-[#FFEEF5] shadow-sm ml-8 "
                            : "bg-[#083567] text-white mr-8 "
                        }`}
                      >
                        {msg.sender === "ai" ? (
                          <>
                            <ul className="list-disc pl-5 space-y-3">
                              {(typeof msg.text === "string" ? msg.text : "")
                                .split(/(?:\*\s+|\•\s+)/)
                                .filter((point) => point.trim() !== "")
                                .map((point, idx) => {
                                  const cleanPoint = point
                                    .replace(/^[\*•]+|[\*•]+$/g, "")
                                    .trim();
                                  return (
                                    <li
                                      key={idx}
                                      className="text-sm leading-relaxed mb-2 block"
                                    >
                                      {cleanPoint}
                                    </li>
                                  );
                                })}
                            </ul>
                            <MessageFeedback
                              messageId={msg.id}
                              onFeedback={handleFeedback}
                              currentFeedback={feedbackData[msg.id]}
                            />
                          </>
                        ) : (
                          <p>{msg.text}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{msg.time}</p>
                          {/* Show message status for user messages */}
                          {msg.sender === "user" && (
                            <MessageStatus
                              status={messageStatuses[msg.id] || "sent"}
                              onRetry={handleRetryMessage}
                              messageId={msg.id}
                              error={messageStatuses[`${msg.id}-error`]}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Show quick reply buttons after AI message for new chats */}
                  {showQuickReplies &&
                    currentChat.length === 1 &&
                    currentChat[0]?.sender === "ai" && (
                      <QuickReplies onQuickReply={handleQuickReply} />
                    )}
                  {/* Show typing indicator when AI is processing */}
                  {isAITyping && <TypingIndicator />}
                  {/* Auto-scroll anchor */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white rounded-2xl ">
              <div className="w-2/3 mx-auto">
                {/* Staged File Display - Above Text Input */}
                {stagedFile && (
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <span>📎</span>
                    <span className="flex-1">{stagedFile.name}</span>
                    <button
                      onClick={() => {
                        setStagedFile(null);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Text Input Section */}
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isSending || isProcessingMessage}
                    className={`flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-[#083567] ${
                      isSending || isProcessingMessage
                        ? "bg-gray-100 cursor-not-allowed"
                        : ""
                    }`}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      !isSending &&
                      !isProcessingMessage &&
                      handleSend()
                    }
                  />
                  {/* Voice Input Button */}
                  {isVoiceSupported && (
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={isSending || isProcessingMessage}
                      className={`p-3 rounded-full flex items-center gap-1 transition-colors ${
                        isListening
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : isSending || isProcessingMessage
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                      title={
                        isListening ? "Stop listening" : "Start voice input"
                      }
                    >
                      {isListening ? <FiMicOff /> : <FiMic />}
                    </button>
                  )}
                  {/* File Upload Button */}
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    disabled={isUploading || isProcessingMessage}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className={`p-3 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${
                      isUploading || isProcessingMessage
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    title="Upload file"
                  >
                    <span>📎</span>
                  </label>
                  <button
                    onClick={() => {
                      console.log(
                        "Send button clicked, inputText:",
                        inputText,
                        "isSending:",
                        isSending,
                        "isProcessingMessage:",
                        isProcessingMessage
                      );
                      if (!isSending && !isProcessingMessage) {
                        if (stagedFile) {
                          handleFileUploadWithMessage(inputText);
                        } else {
                          handleSend();
                        }
                      } else {
                        console.log(
                          "Button is disabled due to isSending:",
                          isSending,
                          "or isProcessingMessage:",
                          isProcessingMessage
                        );
                      }
                    }}
                    disabled={isSending || isProcessingMessage}
                    className={`p-3 rounded-full flex items-center gap-1 ${
                      isSending || isProcessingMessage
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#083567] text-white hover:bg-opacity-90"
                    }`}
                  >
                    {isSending || isProcessingMessage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiSend />
                    )}
                    <span className="hidden md:inline">
                      {isSending || isProcessingMessage ? "Sending..." : "Send"}
                    </span>
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                WeCure offers support, not medical advice.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 p-4 overflow-y-auto bg-transparent">
            <div className="flex flex-col items-center justify-center w-full">
              <h1 className=" text-2xl md:text-3xl font-bold text-[#083567] my-8 text-right ">
                {activeRightPanel === "music" &&
                  "Soothing Sounds & Mood Busters"}
                {activeRightPanel === "yoga" && "Yoga & Wellness"}
                {activeRightPanel === "meditation" &&
                  "Meditation for Focus & Calmness"}
              </h1>
            </div>

            <div>
              {/* Music */}
              <div>
                {activeRightPanel === "music" && (
                  <div className="flex flex-wrap justify-center gap-6">
                    {contentLoading ? (
                      <SkeletonContentCard />
                    ) : (
                      playlists.map((item, idx) => (
                        <div
                          key={`music-${idx}`}
                          className="w-1/3 md:w-1/4 p-2 md:p-[15px] bg-[#ffffff] rounded-[12px] shadow-[0_4px_8px_rgba(0,0,0,0.1)] text-center  transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer"
                        >
                          <div
                            style={{ position: "relative", width: "100%" }}
                            onClick={() => setModalMusicIdx(idx)}
                          >
                            <img
                              src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                              alt={item.title}
                              className="w-full rounded-[10px] mb-4 cursor-pointer"
                            />
                            <span
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: 40,
                                color: "#fff",
                                pointerEvents: "none",
                                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                              }}
                            >
                              ▶
                            </span>
                          </div>
                          <h3 className="text-sm md:text-xl font-semibold text-[#083567] mb-2 text-center w-full">
                            {item.title}
                          </h3>
                        </div>
                      ))
                    )}

                    {/* Modal Popup for YouTube Player */}
                    {modalMusicIdx !== null && (
                      <div
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          width: "100vw",
                          height: "100vh",
                          background: "rgba(0,0,0,0.6)",
                          zIndex: 1000,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={() => setModalMusicIdx(null)}
                      >
                        <div
                          style={{
                            position: "relative",
                            background: "#fff",
                            borderRadius: 16,
                            padding: 0,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                            maxWidth: 600,
                            width: "95vw",
                            maxHeight: "60vh",
                            height: "auto",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            style={{
                              position: "absolute",
                              top: 12,
                              right: 20,
                              fontSize: 32,
                              color: "#333",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              zIndex: 10,
                            }}
                            onClick={() => setModalMusicIdx(null)}
                            aria-label="Close"
                          >
                            &times;
                          </button>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              marginLeft: "auto",
                              marginRight: "auto",
                            }}
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${playlists[modalMusicIdx].youtubeId}?autoplay=1`}
                              title={playlists[modalMusicIdx].title}
                              frameBorder="0"
                              allow="autoplay; encrypted-media"
                              allowFullScreen
                              style={{
                                width: 500,
                                height: 280,
                                borderRadius: 12,
                                marginTop: 64,
                                maxWidth: "90vw",
                                maxHeight: "50vh",
                                display: "block",
                                marginLeft: "auto",
                                marginRight: "auto",
                              }}
                            ></iframe>
                            <div
                              style={{
                                padding: 24,
                                width: "100%",
                                boxSizing: "border-box",
                              }}
                            >
                              <h3
                                className="font-semibold mt-6 mb-2"
                                style={{ fontSize: 22 }}
                              >
                                {playlists[modalMusicIdx].title}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Yoga */}
              <div>
                {activeRightPanel === "yoga" && (
                  <div className="flex flex-wrap justify-center gap-6">
                    {contentLoading ? (
                      <SkeletonContentCard />
                    ) : (
                      yogaSessions.map((item, idx) => (
                        <div
                          key={`yoga-${idx}`}
                          className="w-1/3 md:w-1/4 p-2 md:p-[15px] bg-[#ffffff] rounded-[12px] shadow-[0_4px_8px_rgba(0,0,0,0.1)] text-center transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer"
                        >
                          <div
                            style={{ position: "relative", width: "100%" }}
                            onClick={() => setModalYogaIdx(idx)}
                          >
                            <img
                              src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                              alt={item.title}
                              className="w-full rounded-[10px] mb-4 cursor-pointer"
                            />
                            <span
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: 40,
                                color: "#fff",
                                pointerEvents: "none",
                                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                              }}
                            >
                              ▶
                            </span>
                          </div>
                          <h3 className="text-sm md:text-xl font-semibold text-[#083567] mb-2 text-center w-full">
                            {item.title}
                          </h3>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Modal Popup for Yoga Player */}
                {modalYogaIdx !== null && (
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      background: "rgba(0,0,0,0.6)",
                      zIndex: 1000,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => setModalYogaIdx(null)}
                  >
                    <div
                      style={{
                        position: "relative",
                        background: "#fff",
                        borderRadius: 16,
                        padding: 0,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        maxWidth: 600,
                        width: "95vw",
                        maxHeight: "60vh",
                        height: "auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 20,
                          fontSize: 32,
                          color: "#333",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          zIndex: 10,
                        }}
                        onClick={() => setModalYogaIdx(null)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          marginLeft: "auto",
                          marginRight: "auto",
                        }}
                      >
                        <iframe
                          src={`https://www.youtube.com/embed/${yogaSessions[modalYogaIdx].youtubeId}?autoplay=1`}
                          title={yogaSessions[modalYogaIdx].title}
                          frameBorder="0"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          style={{
                            width: 500,
                            height: 280,
                            borderRadius: 12,
                            marginTop: 64,
                            maxWidth: "90vw",
                            maxHeight: "50vh",
                            display: "block",
                            marginLeft: "auto",
                            marginRight: "auto",
                          }}
                        ></iframe>
                        <div
                          style={{
                            padding: 24,
                            width: "100%",
                            boxSizing: "border-box",
                          }}
                        >
                          <h3
                            className="font-semibold mt-6 mb-2"
                            style={{ fontSize: 22 }}
                          >
                            {yogaSessions[modalYogaIdx].title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Meditation */}
              <div>
                {activeRightPanel === "meditation" && (
                  <div className="flex flex-wrap justify-center gap-6">
                    {contentLoading ? (
                      <SkeletonContentCard />
                    ) : (
                      meditationSessions.map((item, idx) => (
                        <div
                          key={`meditation-${idx}`}
                          className="w-1/3 md:w-1/4 p-2 md:p-[15px] bg-[#ffffff] rounded-[12px] shadow-[0_4px_8px_rgba(0,0,0,0.1)] text-center transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer"
                        >
                          <div
                            style={{ position: "relative", width: "100%" }}
                            onClick={() => setModalMeditationIdx(idx)}
                          >
                            <img
                              src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                              alt={item.title}
                              className="w-full rounded-[10px] mb-4 cursor-pointer"
                            />
                            <span
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: 40,
                                color: "#fff",
                                pointerEvents: "none",
                                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                              }}
                            >
                              ▶
                            </span>
                          </div>
                          <h3 className="text-sm md:text-xl font-semibold text-[#083567] mb-2 text-center w-full">
                            {item.title}
                          </h3>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Modal Popup for Meditation Player */}
                {modalMeditationIdx !== null && (
                  <div
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      width: "100vw",
                      height: "100vh",
                      background: "rgba(0,0,0,0.6)",
                      zIndex: 1000,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={() => setModalMeditationIdx(null)}
                  >
                    <div
                      style={{
                        position: "relative",
                        background: "#fff",
                        borderRadius: 16,
                        padding: 0,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                        maxWidth: 600,
                        width: "95vw",
                        maxHeight: "60vh",
                        height: "auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 20,
                          fontSize: 32,
                          color: "#333",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          zIndex: 10,
                        }}
                        onClick={() => setModalMeditationIdx(null)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          marginLeft: "auto",
                          marginRight: "auto",
                        }}
                      >
                        <iframe
                          src={`https://www.youtube.com/embed/${meditationSessions[modalMeditationIdx].youtubeId}?autoplay=1`}
                          title={meditationSessions[modalMeditationIdx].title}
                          frameBorder="0"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                          style={{
                            width: 500,
                            height: 280,
                            borderRadius: 12,
                            marginTop: 64,
                            maxWidth: "90vw",
                            maxHeight: "50vh",
                            display: "block",
                            marginLeft: "auto",
                            marginRight: "auto",
                          }}
                        ></iframe>
                        <div
                          style={{
                            padding: 24,
                            width: "100%",
                            boxSizing: "border-box",
                          }}
                        >
                          <h3
                            className="font-semibold mt-6 mb-2"
                            style={{ fontSize: 22 }}
                          >
                            {meditationSessions[modalMeditationIdx].title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
