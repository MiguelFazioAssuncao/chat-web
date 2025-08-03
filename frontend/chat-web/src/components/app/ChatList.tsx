import { useEffect, useState } from "react";
import ChatItem from "./ChatItem";
import { useAuth } from "../../context/AuthContext";

type Chat = {
  id: number;
  username: string;
  lastMessage: string;
  profileImgUrl?: string;
};

type ChatListProps = {
  filter: string;
  onSelectChat: (chat: { username: string; profileImgUrl?: string }) => void;
};

const ChatList = ({ filter, onSelectChat }: ChatListProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, loadingAuth } = useAuth();

  useEffect(() => {
    if (loadingAuth) return;

    const fetchFriends = async () => {
      try {
        if (!token) return;

        const response = await fetch("/api/user-friends", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch friends");

        const data: Chat[] = await response.json();
        setChats(data);
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [token, loadingAuth]);

  if (loading || loadingAuth) return <div>Loading friends...</div>;

  const filteredChats = chats.filter((chat) =>
    chat.username.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col space-y-2">
      {filteredChats.length === 0 && <div>No users found</div>}
      {filteredChats.map((chat) => (
        <div key={chat.id} onClick={() => onSelectChat(chat)}>
          <ChatItem
            name={chat.username}
            lastMessage={chat.lastMessage}
            profileImgUrl={chat.profileImgUrl}
          />
        </div>
      ))}
    </div>
  );
};

export default ChatList;
