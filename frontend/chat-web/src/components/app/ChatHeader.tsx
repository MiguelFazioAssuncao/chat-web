import { FiUser, FiSearch } from "react-icons/fi";
import { FaThumbtack } from "react-icons/fa";

type Props = {
  onToggleProfile: () => void;
  isProfileOpen: boolean;
};

const ChatHeader = ({ onToggleProfile, isProfileOpen }: Props) => {
  return (
    <div className="flex items-center justify-between bg-[#1e293b] px-4 py-2 border-b border-gray-600 shadow z-10">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 rounded-full bg-[#0f172a]" />
        <span className="text-white text-sm">Pessoa 1</span>
      </div>

      <div className="flex items-center space-x-3">
        <FaThumbtack className="text-white cursor-pointer" />
        <div
          className={`p-1 rounded ${isProfileOpen ? "bg-blue-500" : ""} cursor-pointer`}
          onClick={onToggleProfile}
        >
          <FiUser className="text-white" />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar"
            className="bg-transparent border border-blue-500 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <FiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-sm pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
