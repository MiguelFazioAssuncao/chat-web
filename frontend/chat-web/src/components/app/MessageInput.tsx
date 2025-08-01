import React, { useState } from "react";
import { FiPaperclip } from "react-icons/fi";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
};

const MessageInput = ({ value, onChange, onSend, placeholder = "Mensagem" }: Props) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center bg-[#1e293b] rounded-md border border-gray-700 px-3 py-2 space-x-2">
      <button type="button" className="text-gray-400 hover:text-gray-200">
        <FiPaperclip size={20} />
      </button>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder={placeholder}
        className="flex-1 resize-none bg-transparent text-white placeholder-gray-400 focus:outline-none scrollbar-hide"
      />
    </div>
  );
};

export default MessageInput;
