import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useAuth } from "./AuthContext";
import { api, errorMessage, socketUrl } from "../utils/axiosConfig";
import { extractUserIdFromToken } from "../utils/jwt";
import {
  mergeIncoming,
  mergeHistory,
  applyEditedMessage,
  applyDeletedMessage,
  applyReadReceipt,
} from "../utils/messageUtils";
import {
  demoContacts,
  demoMessages,
  demoProfile,
  demoRequests,
} from "../data/demo";
import type {
  ChatMessage,
  ChatUser,
  Profile,
  FriendRequest,
} from "../types/chat";

type DemoState = {
  contacts: ChatUser[];
  messages: Record<string, ChatMessage[]>;
  profile: Profile;
  requests: FriendRequest[];
  sentRequests?: FriendRequest[];
};

function readDemo(): DemoState {
  try {
    const saved = JSON.parse(localStorage.getItem("chatweb:demo:v1") || "null");
    if (
      saved &&
      Array.isArray(saved.contacts) &&
      saved.messages &&
      saved.profile &&
      Array.isArray(saved.requests)
    )
      return saved;
  } catch {
    /* Use initial illustration if local data is unavailable. */
  }
  return {
    contacts: demoContacts,
    messages: demoMessages,
    profile: demoProfile,
    requests: demoRequests,
    sentRequests: [],
  };
}

type ChatState = {
  demo: boolean;
  contacts: ChatUser[];
  profile: Profile;
  selected: ChatUser | null;
  select: (id: string | null) => void;
  messages: ChatMessage[];
  loading: boolean;
  historyLoading: boolean;
  error: string;
  historyError: string;
  connection: "connecting" | "connected" | "offline";
  typingUsers: Record<string, boolean>;
  refresh: () => Promise<void>;
  send: (content: string) => boolean;
  sendTyping: (typing: boolean) => void;
  editMessage: (id: string, content: string) => Promise<void>;
  removeMessage: (id: string) => Promise<void>;
  updateProfile: (username: string, description: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  requests: FriendRequest[];
  sentRequests: FriendRequest[];
  loadRequests: () => Promise<void>;
  invite: (email: string) => Promise<void>;
  respond: (id: number, accept: boolean) => Promise<void>;
  cancelRequest: (id: number) => Promise<void>;
  removeFriend: (id: string) => Promise<void>;
};

const ChatContext = createContext<ChatState | null>(null);

export function ChatProvider({
  demo = false,
  children,
}: {
  demo?: boolean;
  children: React.ReactNode;
}) {
  const { token, login } = useAuth();
  const [initial] = useState(readDemo);
  const userId = demo ? "demo-you" : extractUserIdFromToken(token || "") || "";
  const [contacts, setContacts] = useState<ChatUser[]>(
    demo
      ? initial.contacts.map((contact, index) =>
          index === 0 ? { ...contact, unread: 0 } : contact,
        )
      : [],
  );
  const [profile, setProfile] = useState<Profile>(
    demo
      ? initial.profile
      : { id: userId, username: "Meu perfil", description: "" },
  );
  const [requests, setRequests] = useState<FriendRequest[]>(
    demo ? initial.requests : [],
  );
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>(
    demo ? initial.sentRequests || [] : [],
  );
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(
    demo ? initial.contacts[0]?.id || null : null,
  );
  const [allMessages, setAllMessages] = useState<Record<string, ChatMessage[]>>(
    demo ? initial.messages : {},
  );
  const [loading, setLoading] = useState(!demo);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [connection, setConnection] = useState<ChatState["connection"]>(
    demo ? "connected" : "connecting",
  );
  const clientRef = useRef<Client | null>(null);
  const contactsRef = useRef(contacts);
  const selectedRef = useRef(selectedId);
  const messagesRef = useRef(allMessages);
  const typingTimeoutsRef = useRef<Record<string, number>>({});
  const selected = contacts.find((c) => c.id === selectedId) || null;
  const selectedUsername = selected?.username;

  useEffect(() => {
    contactsRef.current = contacts;
    selectedRef.current = selectedId;
  }, [contacts, selectedId]);

  useEffect(() => {
    messagesRef.current = allMessages;
  }, [allMessages]);

  const loadRequests = useCallback(async () => {
    if (demo || !token || !userId) return;
    const [pendingRes, sentRes] = await Promise.allSettled([
      api.get<FriendRequest[]>("/api/friends/requests/pending", {
        params: { userId },
      }),
      api.get<FriendRequest[]>("/api/friends/requests/sent", {
        params: { userId },
      }),
    ]);
    if (pendingRes.status === "fulfilled") {
      setRequests(pendingRes.value.data);
    }
    if (sentRes.status === "fulfilled") {
      setSentRequests(sentRes.value.data);
    }
  }, [demo, token, userId]);

  const refresh = useCallback(async () => {
    if (demo || !token) return;
    setLoading(true);
    setError("");
    try {
      const [friends, me] = await Promise.all([
        api.get<ChatUser[]>("/api/user-friends"),
        api.get<Profile>("/api/user/profile"),
      ]);
      setContacts((current) =>
        friends.data.map((friend) => ({
          ...friend,
          unread:
            selectedRef.current === friend.id
              ? 0
              : (friend.unread ??
                current.find((c) => c.id === friend.id)?.unread ??
                0),
        })),
      );
      setProfile(me.data);
      const savedId = localStorage.getItem(`chatweb:last-chat:${userId}`);
      setSelectedId((current) =>
        friends.data.some((c) => c.id === current)
          ? current
          : friends.data.find((c) => c.id === savedId)?.id || null,
      );
      void loadRequests();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [demo, token, userId, loadRequests]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!demo) return;
    try {
      localStorage.setItem(
        "chatweb:demo:v1",
        JSON.stringify({
          contacts,
          messages: allMessages,
          profile,
          requests,
          sentRequests,
        }),
      );
    } catch {
      /* The demonstration also works without storage. */
    }
  }, [demo, contacts, allMessages, profile, requests, sentRequests]);

  useEffect(() => {
    if (demo || !token) return;
    const timeouts = typingTimeoutsRef.current;
    const client = new Client({
      webSocketFactory: () => new SockJS(socketUrl(token)),
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        setConnection("connected");
        client.subscribe("/user/queue/messages", (frame) => {
          let message: ChatMessage;
          try {
            message = JSON.parse(frame.body);
            if (!message.id || typeof message.content !== "string") return;
          } catch {
            return;
          }
          const outgoing = message.senderId === userId;
          const contact = contactsRef.current.find((c) =>
            outgoing
              ? c.username === message.receiverUsername
              : c.id === message.senderId,
          );
          if (!contact) return;

          if (!outgoing) {
            setTypingUsers((prev) =>
              prev[contact.id] ? { ...prev, [contact.id]: false } : prev,
            );
            if (selectedRef.current === contact.id) {
              void api
                .post("/api/messages/read", null, {
                  params: { friendId: contact.id },
                })
                .catch(() => {});
            }
          }

          setAllMessages((prev) => ({
            ...prev,
            [contact.id]: mergeIncoming(prev[contact.id] || [], message),
          }));
          setContacts((prev) =>
            prev.map((c) =>
              c.id === contact.id
                ? {
                    ...c,
                    lastMessage: message.content,
                    lastMessageAt: message.sentAt,
                    unread:
                      !outgoing && selectedRef.current !== c.id
                        ? (c.unread || 0) + 1
                        : c.unread,
                  }
                : c,
            ),
          );
        });

        client.subscribe("/user/queue/events", (frame) => {
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(frame.body);
          } catch {
            return;
          }
          const type = event.type;
          if (type === "edited" && event.message) {
            const updated = event.message as ChatMessage;
            const outgoing = updated.senderId === userId;
            const contact = contactsRef.current.find((c) =>
              outgoing
                ? c.username === updated.receiverUsername
                : c.id === updated.senderId,
            );
            if (!contact) return;
            setAllMessages((prev) => {
              const next = applyEditedMessage(
                prev[contact.id] || [],
                updated,
              );
              setContacts((list) =>
                list.map((c) =>
                  c.id === contact.id && next.at(-1)?.id === updated.id
                    ? { ...c, lastMessage: updated.content }
                    : c,
                ),
              );
              return { ...prev, [contact.id]: next };
            });
          } else if (type === "deleted" && typeof event.messageId === "string") {
            const messageId = event.messageId;
            setAllMessages((prev) => {
              const nextEntries = Object.entries(prev).map(([cid, list]) => {
                if (!list.some((m) => m.id === messageId)) return [cid, list];
                const filtered = applyDeletedMessage(list, messageId);
                setContacts((contactsList) =>
                  contactsList.map((c) =>
                    c.id === cid
                      ? { ...c, lastMessage: filtered.at(-1)?.content || "" }
                      : c,
                  ),
                );
                return [cid, filtered];
              });
              return Object.fromEntries(nextEntries);
            });
          } else if (
            type === "read" &&
            typeof event.readerId === "string" &&
            typeof event.readAt === "string"
          ) {
            const readerId = event.readerId;
            const readAt = event.readAt;
            setAllMessages((prev) =>
              prev[readerId]
                ? {
                    ...prev,
                    [readerId]: applyReadReceipt(
                      prev[readerId],
                      userId,
                      readAt,
                    ),
                  }
                : prev,
            );
          } else if (
            type === "typing" &&
            typeof event.senderId === "string"
          ) {
            const senderId = event.senderId;
            const active = Boolean(event.typing);
            window.clearTimeout(timeouts[senderId]);
            setTypingUsers((prev) => ({ ...prev, [senderId]: active }));
            if (active) {
              timeouts[senderId] = window.setTimeout(() => {
                setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
              }, 4000);
            }
          } else if (
            type === "presence" &&
            typeof event.userId === "string"
          ) {
            const targetId = event.userId;
            const online = Boolean(event.online);
            setContacts((prev) =>
              prev.map((c) => (c.id === targetId ? { ...c, online } : c)),
            );
          } else if (type === "friend-request" && event.request) {
            const incomingReq = event.request as FriendRequest;
            setRequests((prev) =>
              prev.some((r) => r.id === incomingReq.id)
                ? prev
                : [incomingReq, ...prev],
            );
          } else if (
            type === "friend-request-cancelled" &&
            typeof event.requestId === "number"
          ) {
            const reqId = event.requestId;
            setRequests((prev) => prev.filter((r) => r.id !== reqId));
          } else if (type === "friend-accepted") {
            if (typeof event.requestId === "number") {
              const reqId = event.requestId;
              setSentRequests((prev) => prev.filter((r) => r.id !== reqId));
            }
            void refresh();
          }
        });
      },
      onWebSocketClose: () => setConnection("offline"),
      onStompError: () => setConnection("offline"),
    });
    client.activate();
    clientRef.current = client;
    return () => {
      Object.values(timeouts).forEach((t) => window.clearTimeout(t));
      clientRef.current = null;
      void client.deactivate();
    };
  }, [demo, token, userId, refresh]);

  useEffect(() => {
    if (demo) return;
    const timer = window.setInterval(() => {
      setAllMessages((prev) => {
        if (
          !Object.values(prev).some((values) =>
            values.some(
              (message) =>
                message.pending &&
                Date.now() - new Date(message.sentAt).getTime() > 15000,
            ),
          )
        )
          return prev;
        return Object.fromEntries(
          Object.entries(prev).map(([id, values]) => [
            id,
            values.map((message) =>
              message.pending &&
              Date.now() - new Date(message.sentAt).getTime() > 15000
                ? { ...message, pending: false, failed: true }
                : message,
            ),
          ]),
        );
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [demo]);

  useEffect(() => {
    if (demo || !selectedId || !selectedUsername || !token) return;
    const controller = new AbortController();
    const id = selectedId;
    const previousIds = new Set(
      (messagesRef.current[id] || []).map((message) => message.id),
    );
    setHistoryLoading(true);
    setHistoryError("");
    api
      .get<ChatMessage[]>("/api/messages/history", {
        params: { userId, friendUsername: selectedUsername },
        signal: controller.signal,
      })
      .then((response) => {
        setAllMessages((prev) => ({
          ...prev,
          [id]: mergeHistory(response.data, prev[id] || [], previousIds),
        }));
        void api
          .post("/api/messages/read", null, { params: { friendId: id } })
          .catch(() => {});
      })
      .catch((err) => {
        if (!controller.signal.aborted) setHistoryError(errorMessage(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });
    return () => controller.abort();
  }, [demo, selectedId, selectedUsername, token, userId, connection]);

  const select = (id: string | null) => {
    selectedRef.current = id;
    setSelectedId(id);
    setHistoryError("");
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
    if (id && !demo) {
      localStorage.setItem(`chatweb:last-chat:${userId}`, id);
      void api
        .post("/api/messages/read", null, { params: { friendId: id } })
        .catch(() => {});
    }
  };

  const send = (content: string) => {
    if (
      !selected ||
      !content.trim() ||
      (!demo && !clientRef.current?.connected)
    )
      return false;
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: userId,
      senderUsername: profile.username,
      receiverUsername: selected.username,
      content: content.trim().slice(0, 1000),
      sentAt: new Date().toISOString(),
      pending: !demo,
    };
    if (!demo) {
      try {
        clientRef.current!.publish({
          destination: "/app/chat/send",
          body: JSON.stringify({
            receiverUsername: selected.username,
            content: message.content,
            clientMessageId: message.id,
          }),
        });
      } catch {
        setConnection("offline");
        return false;
      }
    }
    setAllMessages((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), message],
    }));
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? {
              ...c,
              lastMessage: message.content,
              lastMessageAt: message.sentAt,
              unread: 0,
            }
          : c,
      ),
    );
    return true;
  };

  const sendTyping = (typing: boolean) => {
    if (demo || !selected || !clientRef.current?.connected) return;
    try {
      clientRef.current.publish({
        destination: "/app/chat/typing",
        body: JSON.stringify({
          receiverUsername: selected.username,
          typing,
        }),
      });
    } catch {
      /* Ignore transient typing publish errors. */
    }
  };

  const editMessage = async (id: string, content: string) => {
    if (!selected) return;
    const trimmed = content.trim();
    if (!trimmed) return;
    if (demo) {
      const updatedMsg: ChatMessage = {
        ...(allMessages[selected.id]?.find((m) => m.id === id) || {
          id,
          senderId: userId,
          senderUsername: profile.username,
          receiverUsername: selected.username,
          sentAt: new Date().toISOString(),
        }),
        content: trimmed,
        editedAt: new Date().toISOString(),
      };
      const next = applyEditedMessage(
        allMessages[selected.id] || [],
        updatedMsg,
      );
      setAllMessages((prev) => ({ ...prev, [selected.id]: next }));
      if (next.at(-1)?.id === id) {
        setContacts((prev) =>
          prev.map((c) =>
            c.id === selected.id ? { ...c, lastMessage: trimmed } : c,
          ),
        );
      }
      return;
    }
    const response = await api.patch<ChatMessage>(`/api/messages/${id}`, {
      content: trimmed,
    });
    const next = applyEditedMessage(
      allMessages[selected.id] || [],
      response.data,
    );
    setAllMessages((prev) => ({ ...prev, [selected.id]: next }));
    if (next.at(-1)?.id === id) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selected.id ? { ...c, lastMessage: response.data.content } : c,
        ),
      );
    }
  };

  const removeMessage = async (id: string) => {
    if (!selected) return;
    const current = allMessages[selected.id]?.find((m) => m.id === id);
    if (!demo && !current?.failed) await api.delete(`/api/messages/${id}`);
    const next = (allMessages[selected.id] || []).filter((m) => m.id !== id);
    setAllMessages((prev) => ({ ...prev, [selected.id]: next }));
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selected.id
          ? { ...c, lastMessage: next.at(-1)?.content || "" }
          : c,
      ),
    );
  };

  const updateProfile = async (username: string, description: string) => {
    if (demo) {
      setProfile((prev) => ({ ...prev, username, description }));
      return;
    }
    const result = await api.patch<{ user: Profile; token: string }>(
      "/api/user/profile",
      { username, description },
    );
    setProfile(result.data.user);
    login(result.data.token, Boolean(localStorage.getItem("token")));
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
  ) => {
    if (demo) return;
    await api.post("/api/user/password", { currentPassword, newPassword });
  };

  const uploadAvatar = async (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      throw new Error("Escolha uma imagem PNG, JPG ou WebP.");
    if (file.size > 5 * 1024 * 1024)
      throw new Error("A imagem deve ter até 5 MB.");
    if (demo) {
      const reader = new FileReader();
      const value = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setProfile((prev) => ({ ...prev, avatarUrl: value }));
      return;
    }
    const form = new FormData();
    form.append("avatar", file);
    const response = await api.post<string>("/api/user/avatar", form);
    setProfile((prev) => ({
      ...prev,
      avatarUrl: `${response.data}?v=${Date.now()}`,
    }));
  };

  const invite = async (email: string) => {
    const cleanEmail = email.trim();
    if (demo) {
      setSentRequests((prev) => [
        {
          id: Date.now(),
          senderUsername: profile.username,
          senderEmail: "voce@exemplo.com",
          receiverUsername: cleanEmail.split("@")[0] || "Amigo",
          receiverEmail: cleanEmail,
        },
        ...prev,
      ]);
      return;
    }
    await api.post("/api/friends/request", {
      fromUserId: userId,
      toEmail: cleanEmail,
    });
    await loadRequests();
  };

  const respond = async (id: number, accept: boolean) => {
    if (!demo) {
      await api.post(
        `/api/friends/request/${id}/${accept ? "accept" : "reject"}`,
        null,
        { params: { userId } },
      );
      await refresh();
    } else if (accept) {
      const request = requests.find((r) => r.id === id);
      if (request)
        setContacts((prev) => [
          ...prev,
          {
            id: `request-${id}`,
            username: request.senderUsername,
            description: request.senderDescription,
            online: true,
          },
        ]);
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const cancelRequest = async (id: number) => {
    if (!demo) {
      await api.delete(`/api/friends/request/${id}`, { params: { userId } });
    }
    setSentRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const removeFriend = async (id: string) => {
    if (!demo) await api.delete(`/api/user-friends/${id}`);
    setContacts((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) select(null);
  };

  return (
    <ChatContext.Provider
      value={{
        demo,
        contacts,
        profile,
        selected,
        select,
        messages: selectedId ? allMessages[selectedId] || [] : [],
        loading,
        historyLoading,
        error,
        historyError,
        connection,
        typingUsers,
        refresh,
        send,
        sendTyping,
        editMessage,
        removeMessage,
        updateProfile,
        changePassword,
        uploadAvatar,
        requests,
        sentRequests,
        loadRequests,
        invite,
        respond,
        cancelRequest,
        removeFriend,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error("ChatProvider ausente");
  return context;
}
