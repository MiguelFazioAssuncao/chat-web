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

const Message = ({ text, isSender, timestamp, highlighted }: { text: string; isSender: boolean; timestamp: string; highlighted?: boolean }) => (
  <div className={`flex mb-2 ${isSender ? "justify-end" : "justify-start"}` + (highlighted ? " bg-yellow-100/10" : "") }>
    <div className={`max-w-xs px-4 py-2 rounded-lg break-words ${isSender ? "bg-green-500 text-white rounded-br-none" : "bg-gray-700 text-gray-100 rounded-bl-none"}` + (highlighted ? " border-2 border-yellow-400" : "") }>
      <p className="text-sm">{text}</p>
      <span className="block text-xs text-gray-300 mt-1 text-right">{timestamp}</span>
    </div>
  </div>
);

const ChatWindow = ({ showFriendsPanel, onCloseFriendsPanel, userId, token, selectedChat }: ChatWindowProps) => {
  const [showProfile, setShowProfile] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]); 
  const [searchIndex, setSearchIndex] = useState(0);
  const messageRefs = useRef<{ [id: string]: HTMLDivElement | null }>({});
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

  useEffect(() => {
    if (!searchValue) {
      setSearchResults([]);
      setSearchIndex(0);
      return;
    }
    const filtered = messages
      .filter(m => m.text.toLowerCase().includes(searchValue.toLowerCase()))
      .map(m => m.id);
    setSearchResults(filtered);
    setSearchIndex(filtered.length > 0 ? 0 : -1);
  }, [searchValue, messages]);

  useEffect(() => {
    if (searchResults.length > 0 && messageRefs.current[searchResults[searchIndex]]) {
      messageRefs.current[searchResults[searchIndex]]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchIndex, searchResults]);

  const handleSend = () => {
    if (!message.trim() || !selectedChat || !clientRef.current?.connected) return;
    const tempMessage: MessageType = { id: crypto.randomUUID(), text: message, senderId: userId, senderUsername: "Você", timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempMessage]);
    clientRef.current.publish({ destination: "/app/chat/send", body: JSON.stringify({ receiverUsername: selectedChat.username, content: message }) });
    setMessage("");
    scrollToBottom();
  };

  // Navigation between results
  const goToNextResult = () => setSearchIndex(i => (searchResults.length ? (i + 1) % searchResults.length : 0));
  const goToPrevResult = () => setSearchIndex(i => (searchResults.length ? (i - 1 + searchResults.length) % searchResults.length : 0));

  return (
    <div className="flex-1 relative bg-[#1C2C3C] flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-10">
        <ChatHeader
          onToggleProfile={() => setShowProfile(prev => !prev)}
          isProfileOpen={showProfile}
          selectedUser={selectedChat}
          onSearch={setSearchValue}
          searchValue={searchValue}
        />
        {searchValue && (
          <div className="absolute right-8 top-16 flex items-center gap-2 z-20">
            <span className="text-xs text-white">{searchResults.length > 0 ? `${searchIndex + 1} of ${searchResults.length}` : "No message found"}</span>
            <button className="px-2 py-1 bg-blue-700 text-white rounded" onClick={goToPrevResult} disabled={searchResults.length === 0}>↑</button>
            <button className="px-2 py-1 bg-blue-700 text-white rounded" onClick={goToNextResult} disabled={searchResults.length === 0}>↓</button>
          </div>
        )}
      </div>
      {showFriendsPanel && <div className="absolute inset-0 z-20 bg-[#1C2C3C] px-4 pt-14 pb-16"><FriendsPanel userId={userId} onClose={onCloseFriendsPanel} /></div>}
      <div className="flex flex-1 pt-14 pb-16 overflow-hidden">
        <div className="flex-1 px-4 overflow-y-auto flex flex-col scrollbar-hide" style={{ marginRight: showProfile ? "384px" : 0 }}>
          {messages.map(({ id, text, senderId, timestamp }) => (
            <div ref={el => { messageRefs.current[id] = el; }} key={id}>
              <Message
                text={text}
                isSender={senderId === userId}
                timestamp={new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                highlighted={!!searchValue && searchResults[searchIndex] === id}
              />
            </div>
          ))}
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
