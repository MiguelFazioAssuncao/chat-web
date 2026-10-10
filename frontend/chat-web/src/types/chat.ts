export type ChatUser = {
  id: string;
  username: string;
  description?: string;
  profileImgUrl?: string;
  lastMessage?: string;
  unread?: number;
  lastMessageAt?: string;
};
export type Profile = {
  id: string;
  username: string;
  description: string;
  avatarUrl?: string;
};
export type ChatMessage = {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  receiverUsername: string;
  sentAt: string;
  clientMessageId?: string;
  pending?: boolean;
  failed?: boolean;
};
export type FriendRequest = {
  id: number;
  senderUsername: string;
  senderEmail: string;
  senderProfileImgUrl?: string;
  senderDescription?: string;
};
