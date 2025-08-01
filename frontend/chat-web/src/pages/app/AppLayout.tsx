import { useState } from "react";
import Header from "../../components/app/Header";
import Sidebar from "../../components/app/SideBar";
import ChatWindow from "../../components/app/ChatWindow";
import { extractUserIdFromToken } from "../../utils/jwt";

const AppLayout = () => {
  const [friendsPanelVisible, setFriendsPanelVisible] = useState(false);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token") || "";
  const userId = token ? extractUserIdFromToken(token) ?? "" : "";

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      <Header />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar
          onToggleFriendsPanel={() => setFriendsPanelVisible((prev) => !prev)}
        />
        <ChatWindow
          showFriendsPanel={friendsPanelVisible}
          onCloseFriendsPanel={() => setFriendsPanelVisible(false)}
          userId={userId}
          token={token}
        />
      </main>
    </div>
  );
};

export default AppLayout;
