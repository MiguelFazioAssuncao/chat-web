import { FiUsers, FiSearch, FiRefreshCw } from "react-icons/fi";
import { useChat } from "../../context/ChatContext";
import ChatItem from "./ChatItem";
export default function ChatList({
  filter,
  unreadOnly,
  onFriends,
}: {
  filter: string;
  unreadOnly: boolean;
  onFriends: () => void;
}) {
  const { contacts, selected, select, loading, error, refresh } = useChat();
  const visible = contacts
    .filter(
      (c) =>
        c.username
          .toLocaleLowerCase("pt-BR")
          .includes(filter.trim().toLocaleLowerCase("pt-BR")) &&
        (!unreadOnly || c.unread),
    )
    .sort(
      (a, b) =>
        (b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0) -
        (a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0),
    );
  return (
    <div className="chat-list">
      {loading ? (
        <div
          className="list-skeleton"
          role="status"
          aria-label="Carregando conversas"
        >
          {[1, 2, 3].map((n) => (
            <div key={n}>
              <i />
              <span />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="list-empty">
          <FiRefreshCw />
          <h3>Vamos tentar de novo?</h3>
          <p>{error}</p>
          <button
            className="button button-secondary button-small"
            onClick={() => void refresh()}
          >
            Tentar novamente
          </button>
        </div>
      ) : visible.length ? (
        <>
          <span className="list-label">
            SUAS CONEXÕES <span>{visible.length}</span>
          </span>
          {visible.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              selected={selected?.id === chat.id}
              onClick={() => select(chat.id)}
            />
          ))}
        </>
      ) : (
        <div className="list-empty">
          {filter || unreadOnly ? <FiSearch /> : <FiUsers />}
          <h3>
            {filter
              ? "Nenhuma conversa encontrada"
              : unreadOnly
                ? "Tudo em dia!"
                : "Seu próximo olá está perto"}
          </h3>
          <p>
            {filter
              ? "Tente buscar por outro nome."
              : unreadOnly
                ? "Você já leu todas as suas mensagens."
                : "Adicione seus amigos para começar."}
          </p>
          {!filter && !unreadOnly && (
            <button
              className="button button-secondary button-small"
              onClick={onFriends}
            >
              Encontrar amigos
            </button>
          )}
        </div>
      )}
    </div>
  );
}
