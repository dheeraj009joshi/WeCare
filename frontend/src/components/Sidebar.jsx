import {
  FiMessageSquare,
  FiMusic,
  FiActivity,
  FiHeart,
  // FiChevronLeft,
  // FiChevronRight,
  FiClock,
  FiMenu,
  FiX,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

const Sidebar = ({
  activeRightPanel,
  setActiveRightPanel,
  chatSessions,
  currentChatId,
  setCurrentChatId,
  handleNewChat,
  renamingId,
  renameInput,
  setRenameInput,
  handleSaveRename,
  menuOpenId,
  setMenuOpenId,
  handleStartRename,
  handleDeleteChat,
  menuRef,
  sidebarCollapsed,
  setSidebarCollapsed,
  isMobile,
}) => {
  // Combine all sidebar options into one array for unified button group
  const sidebarOptions = [
    {
      name: "New Chat",
      icon: <FiMessageSquare />,
      onClick: handleNewChat,
      isActive:
        activeRightPanel === "chat" &&
        !chatSessions.some((chat) => chat.id === currentChatId),
    },
    {
      name: "Music",
      icon: <FiMusic />,
      onClick: () => setActiveRightPanel("music"),
      isActive: activeRightPanel === "music",
    },
    {
      name: "Yoga",
      icon: <FiActivity />,
      onClick: () => setActiveRightPanel("yoga"),
      isActive: activeRightPanel === "yoga",
    },
    {
      name: "Meditation",
      icon: <FiHeart />,
      onClick: () => setActiveRightPanel("meditation"),
      isActive: activeRightPanel === "meditation",
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${sidebarCollapsed ? "w-16" : "w-64"} 
        bg-white border-r border-gray-200 flex flex-col transition-all duration-300 h-full
        fixed md:relative z-20
        ${
          isMobile && !sidebarCollapsed
            ? "translate-x-0"
            : isMobile
            ? "-translate-x-full md:translate-x-0"
            : ""
        }
      `}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white p-3 border-b border-gray-200 flex items-center justify-between min-h-[64px]">
          {!sidebarCollapsed && (
            <h1 className="text-lg font-bold text-[#083567] whitespace-nowrap">
              We Cure
            </h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-[#FFEEF5] text-[#083567] "
          >
            {sidebarCollapsed ? <FiMenu size={24} /> : <FiX size={24} />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {!sidebarCollapsed ? (
            <>
              {/* Unified Sidebar Button Group */}
              <div className="mb-6 space-y-2">
                {sidebarOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={option.onClick}
                    className={`
                      w-full flex items-center p-3 rounded-lg font-medium whitespace-nowrap
                      ${
                        option.isActive
                          ? "bg-[#FFD6E7] text-[#083567]"
                          : "bg-white text-[#083567] hover:bg-[#FFEEF5]"
                      }
                    `}
                  >
                    <span className="text-lg mr-3">{option.icon}</span>
                    <span>{option.name}</span>
                  </button>
                ))}
              </div>
              {/* End Unified Sidebar Button Group */}

              <div className="overflow-y-auto">
                <div className="text-xs text-gray-500 mb-2">Recent Chats</div>
                {chatSessions.map((chat) => (
                  <div
                    key={chat.id}
                    className={`
                      p-2 mb-1 rounded-lg cursor-pointer flex items-center justify-between
                      ${
                        activeRightPanel === "chat" && currentChatId === chat.id
                          ? "bg-[#FFEEF5]"
                          : "hover:bg-gray-100"
                      } group
                    `}
                  >
                    <div
                      className="flex items-center flex-1 min-w-0"
                      onClick={() => {
                        setCurrentChatId(chat.id);
                        setActiveRightPanel("chat");
                      }}
                    >
                      <FiClock className="mr-2 text-gray-500 flex-shrink-0" />
                      {renamingId === chat.id ? (
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          onBlur={() => handleSaveRename(chat.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(chat.id);
                          }}
                          className="border rounded px-2 py-1 text-sm flex-1 min-w-0"
                          autoFocus
                        />
                      ) : (
                        <span className="truncate">{chat.title}</span>
                      )}
                    </div>
                    <div className="relative flex-shrink-0">
                      {/*<button
                        className="p-1 ml-2 text-gray-500 hover:text-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
                        }}
                      >
                        <FiMoreVertical />
                      </button>
                      {menuOpenId === chat.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10"
                        >
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartRename(chat.id, chat.title);
                            }}
                          >
                            <FiEdit2 className="mr-2" /> Rename
                          </button>
                          <button
                            className="flex items-center w-full px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id);
                              setMenuOpenId(null);
                            }}
                          >
                            <FiTrash2 className="mr-2" /> Delete
                          </button>
                        </div>
                      )}
                        */}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center mt-2 space-y-4">
              <button
                onClick={handleNewChat}
                className={`
                  p-3 rounded-lg
                  ${
                    activeRightPanel === "chat"
                      ? "bg-[#FFD6E7]"
                      : "hover:bg-[#FFEEF5]"
                  }
                `}
              >
                <FiMessageSquare size={20} />
              </button>
              {/* Remove old nav for sidebarButtons here */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
