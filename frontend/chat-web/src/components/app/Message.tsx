import {
  FiCheck,
  FiClock,
  FiTrash2,
  FiEdit2,
  FiAlertCircle,
} from "react-icons/fi";
import { BiCheckDouble } from "react-icons/bi";
import type { ChatMessage } from "../../types/chat";
export default function Message({
  message,
  isSender,
  highlighted,
  onEdit,
  onDelete,
}: {
  message: ChatMessage;
  isSender: boolean;
  highlighted?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`message-row ${isSender ? "outgoing" : "incoming"} ${highlighted ? "highlighted" : ""}`}
    >
      {isSender && !message.pending && (
        <div className="message-actions">
          <button
            className="message-action icon-button"
            aria-label="Editar mensagem"
            onClick={onEdit}
          >
            <FiEdit2 />
          </button>
          <button
            className="message-delete icon-button"
            aria-label="Excluir mensagem"
            onClick={onDelete}
          >
            <FiTrash2 />
          </button>
        </div>
      )}
      <div className="message-bubble">
        <p>{message.content}</p>
        <span className="message-meta">
          {message.editedAt && (
            <span className="message-edited">editada</span>
          )}
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
            ) : message.readAt ? (
              <BiCheckDouble className="read-check" aria-label="Lida" />
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
