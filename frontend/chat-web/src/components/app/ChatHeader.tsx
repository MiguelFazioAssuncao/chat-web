import { FiUser, FiSearch } from "react-icons/fi";
import { FaThumbtack } from "react-icons/fa";

type Props = {
  onToggleProfile: () => void;
  isProfileOpen: boolean;
  selectedUser: {
    username: string;
    profileImgUrl?: string; 
  } | null;
};

const BASE_URL = "http://localhost:8080/";

const ChatHeader = ({ onToggleProfile, isProfileOpen, selectedUser }: Props) => {
  const getFullImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return BASE_URL + url;
  };

  return (
    <div className="flex items-center justify-between bg-[#1e293b] px-4 py-2 border-b border-gray-600 shadow z-10">
      <div className="flex items-center space-x-3">
        {selectedUser?.profileImgUrl ? (
          <img
            src={getFullImageUrl(selectedUser.profileImgUrl) || undefined}
            alt={selectedUser.username}
            className="w-6 h-6 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/24?text=No+Img";
            }}
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-[#0f172a]" />
        )}
        <span className="text-white text-sm">
          {selectedUser?.username || "No user selected"}
        </span>
      </div>

      <div className="flex items-center space-x-3">
        <div
          className={`p-1 rounded ${isProfileOpen ? "bg-blue-500" : ""} cursor-pointer`}
          onClick={onToggleProfile}
        >
          <FiUser className="text-white" />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent border border-blue-500 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <FiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
