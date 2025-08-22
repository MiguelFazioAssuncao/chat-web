type MessageProps = {
  text: string;
  isSender: boolean; // true = mensagem enviada pelo usuário atual
  timestamp?: string; // opcional, horário da mensagem
};

const Message = ({ text, isSender, timestamp }: MessageProps) => {
  return (
    <div
      className={`flex mb-2 ${
        isSender ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-xs px-4 py-2 rounded-lg break-words ${
          isSender
            ? "bg-green-500 text-white rounded-br-none"
            : "bg-gray-700 text-gray-100 rounded-bl-none"
        }`}
      >
        <p className="text-sm">{text}</p>
        {timestamp && (
          <span className="block text-xs text-gray-300 mt-1 text-right">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

export default Message;
