import { useState } from "react";
import { ChatProvider, useChat } from "../../context/ChatContext";
import Header from "../../components/app/Header";
import SideBar from "../../components/app/SideBar";
import ChatWindow from "../../components/app/ChatWindow";
import FriendsPanel from "../../components/app/FriendsPanel";
import ProfilePanel from "../../components/app/ProfilePanel";
function Workspace() {
  const [friends, setFriends] = useState(false);
  const [profile, setProfile] = useState(false);
  const { selected } = useChat();
  return (
    <div className={`workspace ${selected ? "has-selected-chat" : ""}`}>
      <Header />
      <div className="workspace-body">
        <SideBar
          onFriends={() => setFriends(true)}
          onProfile={() => setProfile(true)}
        />
        <ChatWindow onFriends={() => setFriends(true)} />
      </div>
      {friends && <FriendsPanel onClose={() => setFriends(false)} />}
      {profile && <ProfilePanel onClose={() => setProfile(false)} />}
    </div>
  );
}
export default function AppLayout({ demo = false }: { demo?: boolean }) {
  return (
    <ChatProvider demo={demo}>
      <Workspace />
    </ChatProvider>
  );
}
