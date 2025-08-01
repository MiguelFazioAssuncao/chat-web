import ChatList from "./ChatList";
import { FiUser, FiPlus, FiSearch } from "react-icons/fi";
import ProfilePanel from "./ProfilePanel";
import { useState } from "react";

const Sidebar = () => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <aside className="w-72 h-full bg-[#0B1B2B] flex flex-row border-r border-gray-700">
      {/* Barra de ícones */}
      <div className="w-12 bg-[#152536] flex flex-col items-center justify-between py-4">
        <div className="flex flex-col items-center space-y-4">
          <button className="w-8 h-8 flex items-center justify-center bg-[#1A2B44] rounded-full hover:bg-[#223A5F] transition">
            <FiPlus className="text-white" size={16} />
          </button>
          <div className="w-8 h-8 bg-[#1A2B44] rounded hover:bg-[#223A5F] cursor-pointer" />
          <div className="w-8 h-8 bg-[#1A2B44] rounded hover:bg-[#223A5F] cursor-pointer" />
          <div className="w-8 h-8 bg-[#1A2B44] rounded hover:bg-[#223A5F] cursor-pointer" />
        </div>

        {/* Ícone do perfil com painel */}
        <div className="relative">
          <div
            onClick={() => setShowProfile(prev => !prev)}
            className="w-8 h-8 bg-[#1A2B44] rounded-full flex items-center justify-center hover:bg-[#223A5F] cursor-pointer"
            title="Perfil"
          >
            <FiUser className="text-white" size={16} />
          </div>

          <ProfilePanel visible={showProfile} onClose={() => setShowProfile(false)} />
        </div>
      </div>

      {/* Conteúdo da Sidebar */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <h2 className="text-white text-lg font-semibold">Conversas</h2>
        <div className="relative">
          <FiSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#60a5fa47]"
            size={16}
          />
          <input
            type="text"
            placeholder="Pesquisar"
            className="w-full pl-9 pr-3 py-1.5 rounded-md bg-[#1A2B44] text-sm text-white placeholder-gray-400 focus:outline-none"
          />
        </div>

        <ChatList />
      </div>
    </aside>
  );
};

export default Sidebar;
