import { useState } from "react";
import { FiX, FiTrash2, FiMessageCircle } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import { errorMessage } from "../../utils/axiosConfig";
import Avatar from "../ui/Avatar";
import Modal from "../ui/Modal";
export default function UserProfilePanel({ onClose }: { onClose: () => void }) {
  const { selected, removeFriend } = useChat();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!selected) return null;
  const remove = async () => {
    setBusy(true);
    try {
      await removeFriend(selected.id);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <aside className="contact-panel" aria-label="Perfil do contato">
      <div className="contact-panel-top">
        <span>Sobre esta conexão</span>
        <button
          className="icon-button"
          aria-label="Fechar perfil"
          onClick={onClose}
        >
          <FiX />
        </button>
      </div>
      <div className="contact-cover">
        <span>✳</span>
      </div>
      <div className="contact-details">
        <Avatar
          name={selected.username}
          src={selected.profileImgUrl}
          size="avatar-large"
        />
        <h2>{selected.username}</h2>
        <span className="contact-tag">
          <FiMessageCircle /> Sua conexão no ChatWeb
        </span>
        <h3>SOBRE</h3>
        <p>
          {selected.description ||
            "Ainda não escreveu uma descrição. Uma conversa pode ser um bom começo."}
        </p>
        <button
          className="button button-secondary button-full"
          onClick={onClose}
        >
          Voltar à conversa
        </button>
        <button className="remove-friend" onClick={() => setConfirming(true)}>
          <FiTrash2 /> Remover amizade
        </button>
      </div>
      {confirming && (
        <Modal
          title="Remover esta amizade?"
          onClose={() => {
            if (!busy) setConfirming(false);
          }}
        >
          <p className="muted">
            {selected.username} deixará de aparecer na sua lista de conexões.
          </p>
          {error && (
            <p className="feedback feedback-error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => setConfirming(false)}
            >
              Cancelar
            </button>
            <button
              className="button button-danger"
              disabled={busy}
              onClick={() => void remove()}
            >
              {busy ? "Removendo…" : "Remover amizade"}
            </button>
          </div>
        </Modal>
      )}
    </aside>
  );
}
