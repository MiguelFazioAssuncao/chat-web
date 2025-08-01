import { useEffect, useState } from "react";
import ChatItem from "./ChatItem";
import { useAuth } from "../../context/AuthContext";

type Chat = {
  id: number;
  username: string;
  lastMessage: string;
  profileImgUrl?: string;
};

const ChatList = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, loadingAuth } = useAuth();

  useEffect(() => {
    if (loadingAuth) return;

    const fetchFriends = async () => {
      try {
        if (!token) {
          console.warn("Token is not available yet.");
          return;
        }

        console.log("Token:", token);

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

  return (
    <div className="flex flex-col space-y-2">
      {chats.length === 0 && <div>No friends found</div>}
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          name={chat.username}
          lastMessage={chat.lastMessage}
          profileImgUrl={chat.profileImgUrl}
        />
      ))}
    </div>
  );
};

export default ChatList;
