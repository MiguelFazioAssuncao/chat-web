import { useState } from "react";
import ChatHeader from "./ChatHeader";
import UserProfilePanel from "./UserProfilePanel";
import MessageInput from "./MessageInput";

type MessageType = {
  id: number;
  text: string;
  isSender: boolean;
  timestamp: string;
};

const Message = ({ text, isSender, timestamp }: Omit<MessageType, "id">) => {
  return (
    <div className={`flex mb-2 ${isSender ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs px-4 py-2 rounded-lg break-words ${
          isSender
            ? "bg-green-500 text-white rounded-br-none"
            : "bg-gray-700 text-gray-100 rounded-bl-none"
        }`}
      >
        <p className="text-sm">{text}</p>
        <span className="block text-xs text-gray-300 mt-1 text-right">
          {timestamp}
        </span>
      </div>
    </div>
  );
};

const ChatWindow = () => {
  const [showProfile, setShowProfile] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<MessageType[]>([
    { id: 1, text: "Oi, tudo bem?", isSender: false, timestamp: "15:30" },
    { id: 2, text: "Oi! Tudo ótimo, e você?", isSender: true, timestamp: "15:31" },
  ]);

  const handleSend = () => {
    if (message.trim() === "") return;

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMessage: MessageType = {
      id: messages.length + 1,
      text: message,
      isSender: true,
      timestamp,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  return (
    <div className="flex-1 relative bg-[#1C2C3C] flex flex-col">
      {/* Header fixado no topo */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <ChatHeader
          onToggleProfile={() => setShowProfile((prev) => !prev)}
          isProfileOpen={showProfile}
        />
      </div>

      {/* Área principal flexível com espaço para painel */}
      <div className="flex flex-1 pt-14 pb-16">
        {/* Conteúdo do chat com largura adaptável */}
        <div
          className={`flex-1 px-4 overflow-y-auto flex flex-col`}
          style={{ marginRight: showProfile ? 384 : 0 }} // 96 * 4 = 384px largura do painel
        >
          {messages.map(({ id, text, isSender, timestamp }) => (
            <Message key={id} text={text} isSender={isSender} timestamp={timestamp} />
          ))}
        </div>

        {/* UserProfilePanel sem position absolute, ocupa espaço */}
        {showProfile && <UserProfilePanel visible={true} onClose={() => setShowProfile(false)} />}
      </div>

      {/* Input fixado embaixo */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-[#1C2C3C] border-t border-gray-700">
        <MessageInput
          value={message}
          onChange={setMessage}
          onSend={handleSend}
          placeholder="Mensagem"
        />
      </div>
    </div>
  );
};

export default ChatWindow;
