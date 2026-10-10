import { FiCheck, FiClock, FiTrash2, FiAlertCircle } from "react-icons/fi";
import type { ChatMessage } from "../../types/chat";
export default function Message({
  message,
  isSender,
  highlighted,
  onDelete,
}: {
  message: ChatMessage;
  isSender: boolean;
  highlighted?: boolean;
  onDelete: () => void;
}) {
  return (
    <div
      className={`message-row ${isSender ? "outgoing" : "incoming"} ${highlighted ? "highlighted" : ""}`}
    >
      {isSender && !message.pending && (
        <button
          className="message-delete icon-button"
          aria-label="Excluir mensagem"
          onClick={onDelete}
        >
          <FiTrash2 />
        </button>
      )}
      <div className="message-bubble">
        <p>{message.content}</p>
        <span className="message-meta">
          <time dateTime={message.sentAt}>
            {new Date(message.sentAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
          {isSender &&
            (message.pending ? (
              <FiClock aria-label="Enviando" />
            ) : message.failed ? (
              <FiAlertCircle aria-label="Envio não confirmado" />
            ) : (
              <FiCheck aria-label="Enviada" />
            ))}
        </span>
        {message.failed && (
          <small className="message-failed">
            Envio não confirmado. Reabra a conversa para conferir.
          </small>
        )}
      </div>
    </div>
  );
}
