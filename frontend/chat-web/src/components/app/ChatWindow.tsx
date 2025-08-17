import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import ChatHeader from "./ChatHeader";
import UserProfilePanel from "./UserProfilePanel";
import MessageInput from "./MessageInput";
import FriendsPanel from "./FriendsPanel";

type MessageType = {
  id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  timestamp: string;
};

type ChatUser = {
  id: string;
  username: string;
  description?: string;
  profileImgUrl?: string;
};

type ChatWindowProps = {
  showFriendsPanel: boolean;
  onCloseFriendsPanel: () => void;
  userId: string;
  token: string;
  selectedChat: ChatUser | null;
};

const Message = ({ text, isSender, timestamp }: { text: string; isSender: boolean; timestamp: string }) => (
  <div className={`flex mb-2 ${isSender ? "justify-end" : "justify-start"}`}>
    <div className={`max-w-xs px-4 py-2 rounded-lg break-words ${isSender ? "bg-green-500 text-white rounded-br-none" : "bg-gray-700 text-gray-100 rounded-bl-none"}`}>
      <p className="text-sm">{text}</p>
      <span className="block text-xs text-gray-300 mt-1 text-right">{timestamp}</span>
    </div>
  </div>
);

const ChatWindow = ({ showFriendsPanel, onCloseFriendsPanel, userId, token, selectedChat }: ChatWindowProps) => {
  const [showProfile, setShowProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const clientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    if (!token) return;
    const client = new Client({
      webSocketFactory: () => new SockJS(`http://localhost:8080/ws?token=${token}`),
      onConnect: () => {
        client.subscribe("/user/queue/messages", (msg) => {
          const body = JSON.parse(msg.body);
          const newMsg: MessageType = { id: body.id, text: body.content, senderId: body.senderId, senderUsername: body.senderUsername, timestamp: body.sentAt };
          setMessages(prev => [...prev, newMsg]);
        });
      },
    });
    client.activate();
    clientRef.current = client;
    return () => { if (client.active) client.deactivate(); };
  }, [token]);

  useEffect(() => {
    if (!selectedChat) return;
    const fetchHistory = async () => {
      const res = await axios.get("/api/messages/history", { params: { userId, friendUsername: selectedChat.username }, headers: { Authorization: `Bearer ${token}` } });
      const history: MessageType[] = res.data.map((msg: any) => ({ id: msg.id, text: msg.content, senderId: msg.senderId, senderUsername: msg.senderUsername, timestamp: msg.sentAt }));
      setMessages(history.sort((a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
    };
    fetchHistory();
  }, [selectedChat, userId, token]);

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!message.trim() || !selectedChat || !clientRef.current?.connected) return;
    const tempMessage: MessageType = { id: crypto.randomUUID(), text: message, senderId: userId, senderUsername: "Você", timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempMessage]);
    clientRef.current.publish({ destination: "/app/chat/send", body: JSON.stringify({ receiverUsername: selectedChat.username, content: message }) });
    setMessage("");
    scrollToBottom();
  };

  return (
    <div className="flex-1 relative bg-[#1C2C3C] flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10">
        <ChatHeader onToggleProfile={() => setShowProfile(prev => !prev)} isProfileOpen={showProfile} selectedUser={selectedChat} />
      </div>
      {showFriendsPanel && <div className="absolute inset-0 z-20 bg-[#1C2C3C] px-4 pt-14 pb-16"><FriendsPanel userId={userId} onClose={onCloseFriendsPanel} /></div>}
      <div className="flex flex-1 pt-14 pb-16 overflow-hidden">
        <div className="flex-1 px-4 overflow-y-auto flex flex-col scrollbar-hide" style={{ marginRight: showProfile ? "384px" : 0 }}>
          {messages.map(({ id, text, senderId, timestamp }) => <Message key={id} text={text} isSender={senderId === userId} timestamp={new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} />)}
          <div ref={messagesEndRef} />
        </div>
        {showProfile && selectedChat && <UserProfilePanel visible={true} onClose={() => setShowProfile(false)} selectedUser={selectedChat} />}
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-[#1C2C3C] border-t border-gray-700">
        <MessageInput value={message} onChange={setMessage} onSend={handleSend} placeholder="Mensagem" />
      </div>
    </div>
  );
};

export default ChatWindow;
