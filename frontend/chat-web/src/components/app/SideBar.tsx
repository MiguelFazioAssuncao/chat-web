import { useState } from "react";
import {
  FiMessageCircle,
  FiUsers,
  FiSearch,
  FiPlus,
  FiSettings,
} from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import Avatar from "../ui/Avatar";
import ChatList from "./ChatList";
export default function SideBar({
  onFriends,
  onProfile,
}: {
  onFriends: () => void;
  onProfile: () => void;
}) {
  const [search, setSearch] = useState("");
  const [unread, setUnread] = useState(false);
  const { profile, demo } = useChat();
  return (
    <aside className="sidebar">
      <nav className="nav-rail" aria-label="Menu do chat">
        <div>
          <span className="rail-logo">
            <FiMessageCircle />
          </span>
          <button
            className="rail-button active"
            aria-label="Conversas"
            onClick={() => {
              setUnread(false);
              setSearch("");
            }}
          >
            <FiMessageCircle />
          </button>
          <button
            className="rail-button"
            aria-label="Amigos e convites"
            onClick={onFriends}
          >
            <FiUsers />
          </button>
        </div>
        <div>
          <button
            className="rail-button"
            aria-label="Editar meu perfil"
            onClick={onProfile}
          >
            <FiSettings />
          </button>
          <button
            className="rail-avatar"
            aria-label="Abrir meu perfil"
            onClick={onProfile}
          >
            <Avatar name={profile.username} src={profile.avatarUrl} />
          </button>
        </div>
      </nav>
      <div className="sidebar-main">
        <div className="sidebar-heading">
          <div>
            <span className="eyebrow">BOM PAPO COMEÇA AQUI</span>
            <h1>
              Conversas<span>.</span>
            </h1>
          </div>
          <button
            className="icon-button add-button"
            aria-label="Adicionar amigo"
            onClick={onFriends}
          >
            <FiPlus />
          </button>
        </div>
        <div className="search-field">
          <FiSearch />
          <input
            aria-label="Buscar conversas"
            placeholder="Buscar uma conversa"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd>⌕</kbd>
        </div>
        <div className="chat-tabs">
          <button
            className={!unread ? "active" : ""}
            onClick={() => setUnread(false)}
          >
            Todas
          </button>
          <button
            className={unread ? "active" : ""}
            onClick={() => setUnread(true)}
          >
            Não lidas
          </button>
        </div>
        <ChatList filter={search} unreadOnly={unread} onFriends={onFriends} />
        <footer className="sidebar-footer">
          <button onClick={onProfile}>
            <Avatar
              name={profile.username}
              src={profile.avatarUrl}
              size="avatar-small"
            />
            <span>
              <b>{profile.username}</b>
              <small>Meu perfil</small>
            </span>
            <FiSettings />
          </button>
          {demo && <p>Dados ilustrativos, salvos neste navegador.</p>}
        </footer>
      </div>
    </aside>
  );
}
