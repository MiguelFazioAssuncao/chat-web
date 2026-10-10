import { useEffect, useState } from "react";
import { FiMail, FiUserPlus, FiCheck, FiX, FiUsers } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import { errorMessage } from "../../utils/axiosConfig";
import Modal from "../ui/Modal";
import Avatar from "../ui/Avatar";
export default function FriendsPanel({ onClose }: { onClose: () => void }) {
  const { requests, loadRequests, invite, respond, demo } = useChat();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    let active = true;
    loadRequests()
      .catch((err) => {
        if (active) setError(errorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadRequests]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await invite(email);
      setSuccess(
        demo
          ? `Convite de demonstração para ${email}. Nenhum e-mail foi enviado.`
          : `Convite enviado para ${email}.`,
      );
      setEmail("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  const answer = async (id: number, accept: boolean) => {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await respond(id, accept);
      setSuccess(
        accept
          ? "Nova conexão! Seu amigo já aparece nas conversas."
          : "Convite recusado.",
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Mais gente. Mais boas conversas." onClose={onClose} wide>
      <p className="muted">
        Convide alguém pelo e-mail e deixe a conversa acontecer.
      </p>
      <form onSubmit={submit} className="invite-form">
        <label htmlFor="friend-email">E-mail do seu amigo</label>
        <div className="invite-row">
          <div className="input-wrap">
            <FiMail />
            <input
              id="friend-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="amigo@exemplo.com"
              maxLength={100}
              required
            />
          </div>
          <button className="button button-primary" disabled={busy}>
            <FiUserPlus /> Convidar
          </button>
        </div>
      </form>
      {error && (
        <p className="feedback feedback-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="feedback feedback-success" role="status">
          {success}
        </p>
      )}
      <div className="request-heading">
        <h3>Convites recebidos</h3>
        <span>{requests.length}</span>
      </div>
      {loading ? (
        <p role="status" className="muted">
          Carregando convites…
        </p>
      ) : requests.length ? (
        requests.map((request) => (
          <article className="friend-request" key={request.id}>
            <Avatar
              name={request.senderUsername}
              src={request.senderProfileImgUrl}
            />
            <div>
              <b>{request.senderUsername}</b>
              <small>{request.senderEmail}</small>
            </div>
            <button
              className="icon-button accept-button"
              disabled={busy}
              aria-label={`Aceitar convite de ${request.senderUsername}`}
              onClick={() => void answer(request.id, true)}
            >
              <FiCheck />
            </button>
            <button
              className="icon-button"
              disabled={busy}
              aria-label={`Recusar convite de ${request.senderUsername}`}
              onClick={() => void answer(request.id, false)}
            >
              <FiX />
            </button>
          </article>
        ))
      ) : (
        <div className="requests-empty">
          <FiUsers />
          <b>Tudo tranquilo por aqui</b>
          <p>Seus novos convites vão aparecer neste espaço.</p>
        </div>
      )}
    </Modal>
  );
}
