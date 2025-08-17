import { useEffect, useReducer, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import ChatItem from "./ChatItem";
import { useAuth } from "../../context/AuthContext";

type Chat = {
  id: number;
  username: string;
  lastMessage: string;
  profileImgUrl?: string;
};

type MessageType = {
  id: string;
  text: string;
  senderId: number;
  senderUsername: string;
  timestamp: string;
};

type ChatListProps = {
  filter: string;
  onSelectChat: (chat: { username: string; profileImgUrl?: string }) => void;
  messages?: MessageType[];
  userId: number;
};

type Action = { type: "ADD_MESSAGE"; payload: MessageType };

const reducer = (state: MessageType[], action: Action) => {
  switch (action.type) {
    case "ADD_MESSAGE":
      return [...state, action.payload];
    default:
      return state;
  }
};

const ChatList = ({ filter, onSelectChat, messages = [], userId }: ChatListProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [realTimeMessages, dispatch] = useReducer(reducer, messages);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const { token, loadingAuth } = useAuth();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (loadingAuth) return;
    const fetchFriends = async () => {
      try {
        if (!token) return;
        const response = await fetch("/api/user-friends", {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error("Failed to fetch friends");
        const data: Chat[] = await response.json();
        setChats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [token, loadingAuth]);

  useEffect(() => {
    if (!token) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(`http://localhost:8080/ws?token=${token}`),
      onConnect: () => {
        client.subscribe("/user/queue/messages", (message) => {
          const newMsg: MessageType = JSON.parse(message.body);
          dispatch({ type: "ADD_MESSAGE", payload: newMsg });
        });
      },
    });
    client.activate();
    clientRef.current = client;
    return () => {
      if (client.active) client.deactivate();
    };
  }, [token]);

  const filteredChats = chats
    .map((chat) => {
      const lastMsg = realTimeMessages
        .filter((m) =>
          (m.senderUsername === chat.username && m.senderId === chat.id) ||
          (m.senderId === userId && m.senderUsername !== chat.username)
        )
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      return { ...chat, lastMessage: lastMsg?.text || chat.lastMessage };
    })
    .filter((chat) => chat.username.toLowerCase().includes(filter.toLowerCase()));

  useEffect(() => {
    let ran = false;
    if (!ran) {
      const lastChat = localStorage.getItem('lastSelectedChat');
      if (lastChat && filteredChats.length > 0) {
        const chat = filteredChats.find(c => c.username === lastChat);
        if (chat && selectedChat !== chat.username) {
          setSelectedChat(chat.username);
          onSelectChat(chat);
        }
      }
      ran = true;
    }
  }, []);

  if (loading || loadingAuth) return <div>Loading friends...</div>;

  return (
    <div className="flex flex-col space-y-2">
      {filteredChats.length === 0 && <div>No users found</div>}
      {filteredChats.map((chat) => (
        <ChatItem
          key={chat.id}
          name={chat.username}
          lastMessage={chat.lastMessage}
          profileImgUrl={chat.profileImgUrl}
          onClick={() => {
            setSelectedChat(chat.username);
            localStorage.setItem('lastSelectedChat', chat.username);
            onSelectChat(chat);
          }}
        />
      ))}
    </div>
  );
};

export default ChatList;
