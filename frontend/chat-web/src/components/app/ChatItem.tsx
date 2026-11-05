import Avatar from "../ui/Avatar";
import type { ChatUser } from "../../types/chat";
export default function ChatItem({
  chat,
  selected,
  typing = false,
  onClick,
}: {
  chat: ChatUser;
  selected: boolean;
  typing?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`chat-item ${selected ? "selected" : ""}`}
      onClick={onClick}
      aria-pressed={selected}
    >
      <Avatar
        name={chat.username}
        src={chat.profileImgUrl}
        online={chat.online}
      />
      <span className="chat-item-copy">
        <span>
          <b>{chat.username}</b>
          {chat.lastMessageAt && (
            <time>
              {new Date(chat.lastMessageAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          )}
        </span>
        <span>
          {typing ? (
            <p className="typing-text">Digitando…</p>
          ) : (
            <p>{chat.lastMessage || "Comece uma boa conversa"}</p>
          )}
          {Boolean(chat.unread) && (
            <i className="unread-count">{chat.unread}</i>
          )}
        </span>
      </span>
    </button>
  );
}
