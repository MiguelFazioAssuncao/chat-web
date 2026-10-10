import { FiArrowLeft, FiSearch, FiUser, FiX } from "react-icons/fi";
import Avatar from "../ui/Avatar";
import { useChat } from "../../context/ChatContext";
export default function ChatHeader({
  onProfile,
  searching,
  onToggleSearch,
  search,
  onSearch,
}: {
  onProfile: () => void;
  searching: boolean;
  onToggleSearch: () => void;
  search: string;
  onSearch: (value: string) => void;
}) {
  const { selected, select, demo } = useChat();
  if (!selected) return null;
  return (
    <>
      <header className="chat-header">
        <button
          className="icon-button chat-back"
          aria-label="Voltar às conversas"
          onClick={() => select(null)}
        >
          <FiArrowLeft />
        </button>
        <button className="chat-person" onClick={onProfile}>
          <Avatar name={selected.username} src={selected.profileImgUrl} />
          <span>
            <b>{selected.username}</b>
            <small>
              {demo ? "Conversa de demonstração" : "Conversa direta"}
            </small>
          </span>
        </button>
        <div className="chat-header-actions">
          <button
            className={`icon-button ${searching ? "active" : ""}`}
            aria-label="Buscar mensagens"
            aria-expanded={searching}
            onClick={onToggleSearch}
          >
            <FiSearch />
          </button>
          <span />
          <button
            className="icon-button"
            aria-label="Ver perfil do contato"
            onClick={onProfile}
          >
            <FiUser />
          </button>
        </div>
      </header>
      {searching && (
        <div className="message-search">
          <FiSearch />
          <input
            autoFocus
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Buscar nesta conversa"
            placeholder="Buscar nesta conversa…"
          />
          <button
            className="icon-button"
            aria-label="Fechar busca"
            onClick={onToggleSearch}
          >
            <FiX />
          </button>
        </div>
      )}
    </>
  );
}
