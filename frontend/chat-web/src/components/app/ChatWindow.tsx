import { useEffect, useRef, useState } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiArrowRight,
  FiMessageCircle,
  FiUsers,
} from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import { errorMessage } from "../../utils/axiosConfig";
import ChatHeader from "./ChatHeader";
import Message from "./Message";
import MessageInput from "./MessageInput";
import UserProfilePanel from "./UserProfilePanel";
import Modal from "../ui/Modal";
export default function ChatWindow({ onFriends }: { onFriends: () => void }) {
  const {
    selected,
    messages,
    profile,
    connection,
    demo,
    send,
    removeMessage,
    historyLoading,
    historyError,
  } = useChat();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const nearBottom = useRef(true);
  const results = search.trim()
    ? messages
        .filter((m) =>
          m.content
            .toLocaleLowerCase()
            .includes(search.trim().toLocaleLowerCase()),
        )
        .map((m) => m.id)
    : [];
  const activeIndex = results.length ? index % results.length : 0;
  useEffect(() => {
    setSearch("");
    setIndex(0);
    setSearching(false);
    setShowProfile(false);
    nearBottom.current = true;
  }, [selected?.id]);
  useEffect(() => {
    if (!search && nearBottom.current)
      end.current?.scrollIntoView({ behavior: "instant" });
  }, [messages, search]);
  const activeId = results[activeIndex];
  useEffect(() => {
    if (activeId)
      messageRefs.current[activeId]?.scrollIntoView({
        block: "center",
        behavior: "smooth",
      });
  }, [activeId]);
  const deleteMessage = async () => {
    if (!deleteId) return;
    setBusy(true);
    setError("");
    try {
      await removeMessage(deleteId);
      setDeleteId(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };
  if (!selected)
    return (
      <section className="chat-window chat-welcome">
        <div className="welcome-graphic">
          <FiMessageCircle />
          <span>✦</span>
          <i>olá!</i>
        </div>
        <span className="eyebrow">SEU ESPAÇO DE CONEXÃO</span>
        <h2>
          Uma boa conversa
          <br />
          pode começar agora.
        </h2>
        <p>
          Escolha uma conversa ao lado ou convide
          <br />
          um amigo para colocar o papo em dia.
        </p>
        <button className="button button-primary" onClick={onFriends}>
          <FiUsers /> Encontrar meus amigos <FiArrowRight />
        </button>
        <span className="welcome-note">Perto, mesmo de longe.</span>
      </section>
    );
  const draft = drafts[selected.id] || "";
  const submit = () => {
    if (send(draft)) {
      setDrafts((prev) => ({ ...prev, [selected.id]: "" }));
      nearBottom.current = true;
    }
  };
  return (
    <section className="chat-window">
      <ChatHeader
        onProfile={() => setShowProfile((v) => !v)}
        searching={searching}
        onToggleSearch={() => {
          setSearching((v) => !v);
          setSearch("");
          setIndex(0);
        }}
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setIndex(0);
        }}
      />
      {searching && search && (
        <div className="search-results" role="status">
          <span>
            {results.length
              ? `${activeIndex + 1} de ${results.length} mensagens`
              : "Nenhuma mensagem encontrada"}
          </span>
          <button
            className="icon-button"
            aria-label="Resultado anterior"
            disabled={!results.length}
            onClick={() =>
              setIndex((i) => (i - 1 + results.length) % results.length)
            }
          >
            <FiArrowUp />
          </button>
          <button
            className="icon-button"
            aria-label="Próximo resultado"
            disabled={!results.length}
            onClick={() => setIndex((i) => i + 1)}
          >
            <FiArrowDown />
          </button>
        </div>
      )}
      {connection !== "connected" && (
        <div className="connection-banner" role="status">
          Reconectando ao chat. Seu rascunho está preservado.
        </div>
      )}
      {historyError && (
        <p className="feedback feedback-error" role="alert">
          {historyError}
        </p>
      )}
      <div
        className="message-scroll"
        ref={scrollRef}
        onScroll={() => {
          const node = scrollRef.current;
          if (node)
            nearBottom.current =
              node.scrollHeight - node.scrollTop - node.clientHeight < 120;
        }}
      >
        <div className="conversation-intro">
          <span>O COMEÇO DE UMA BOA CONVERSA</span>
          <p>Você e {selected.username}. Um espaço para trocar ideias.</p>
        </div>
        {historyLoading ? (
          <div className="history-loading" role="status">
            <span className="spinner" /> Carregando conversa…
          </div>
        ) : (
          !messages.length && (
            <div className="conversation-empty">
              <FiMessageCircle />
              <p>
                A primeira mensagem pode ser sua.
                <br />
                Que tal um olá? 👋
              </p>
            </div>
          )
        )}
        {messages.map((message, i) => {
          const day = new Date(message.sentAt).toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
          });
          const previousDay = i
            ? new Date(messages[i - 1].sentAt).toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
              })
            : "";
          return (
            <div
              key={message.id}
              ref={(element) => {
                messageRefs.current[message.id] = element;
              }}
            >
              {day !== previousDay && (
                <div className="day-divider">
                  {new Date(message.sentAt).toDateString() ===
                  new Date().toDateString()
                    ? "Hoje"
                    : day}
                </div>
              )}
              <Message
                message={message}
                isSender={message.senderId === profile.id}
                highlighted={activeId === message.id}
                onDelete={() => {
                  setError("");
                  setDeleteId(message.id);
                }}
              />
            </div>
          );
        })}
        <div ref={end} />
      </div>
      {demo && (
        <div className="demo-chat-note">
          Esta é uma demonstração. As mensagens ficam apenas neste navegador.
        </div>
      )}
      <MessageInput
        value={draft}
        onChange={(value) =>
          setDrafts((prev) => ({ ...prev, [selected.id]: value }))
        }
        onSend={submit}
        disabled={connection !== "connected"}
      />
      {showProfile && (
        <UserProfilePanel onClose={() => setShowProfile(false)} />
      )}
      {deleteId && (
        <Modal
          title="Excluir esta mensagem?"
          onClose={() => {
            if (!busy) setDeleteId(null);
          }}
        >
          <p className="muted">A mensagem será excluída permanentemente.</p>
          {error && (
            <p className="feedback feedback-error" role="alert">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <button
              className="button button-secondary"
              disabled={busy}
              onClick={() => setDeleteId(null)}
            >
              Cancelar
            </button>
            <button
              className="button button-danger"
              disabled={busy}
              onClick={() => void deleteMessage()}
            >
              {busy ? "Excluindo…" : "Excluir mensagem"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
