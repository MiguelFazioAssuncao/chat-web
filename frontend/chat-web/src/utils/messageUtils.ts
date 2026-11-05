import type { ChatMessage } from "../types/chat";

// The server echoes the client's ID alongside its persisted ID. Matching by
// content would incorrectly reconcile two identical messages sent together.
export function mergeIncoming(
  history: ChatMessage[],
  incoming: ChatMessage,
): ChatMessage[] {
  const pendingIndex = history.findIndex(
    (message) => message.id === incoming.clientMessageId,
  );
  if (pendingIndex >= 0) {
    return history
      .filter((message) => message.id !== incoming.id)
      .map((message) =>
        message.id === incoming.clientMessageId ? incoming : message,
      );
  }
  if (history.some((message) => message.id === incoming.id)) return history;
  return [...history, incoming];
}

// History is authoritative for existing messages, but must preserve messages
// received while the request was in flight and sends awaiting confirmation.
export function mergeHistory(
  server: ChatMessage[],
  local: ChatMessage[],
  beforeRequest: Set<string>,
): ChatMessage[] {
  const ids = new Set(server.map((message) => message.id));
  const confirmed = new Set(
    server.map((message) => message.clientMessageId).filter(Boolean),
  );
  return [
    ...server,
    ...local.filter(
      (message) =>
        !ids.has(message.id) &&
        !confirmed.has(message.id) &&
        (message.pending || message.failed || !beforeRequest.has(message.id)),
    ),
  ].sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
}

export function applyEditedMessage(
  history: ChatMessage[],
  updated: ChatMessage,
): ChatMessage[] {
  return history.map((message) =>
    message.id === updated.id
      ? {
          ...message,
          content: updated.content,
          editedAt: updated.editedAt || new Date().toISOString(),
        }
      : message,
  );
}

export function applyDeletedMessage(
  history: ChatMessage[],
  messageId: string,
): ChatMessage[] {
  return history.filter((message) => message.id !== messageId);
}

export function applyReadReceipt(
  history: ChatMessage[],
  senderId: string,
  readAt: string,
): ChatMessage[] {
  return history.map((message) =>
    message.senderId === senderId && !message.readAt
      ? { ...message, readAt }
      : message,
  );
}
