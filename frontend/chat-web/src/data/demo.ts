import type {
  ChatUser,
  ChatMessage,
  Profile,
  FriendRequest,
} from "../types/chat";
export const demoProfile: Profile = {
  id: "demo-you",
  username: "Você",
  description: "Sempre aberto a uma boa conversa. ✨",
};
export const demoContacts: ChatUser[] = [
  {
    id: "ana",
    username: "Ana Martins",
    description: "Design, café e boas ideias. ☕",
    lastMessage: "Adorei! Vamos tirar essa ideia do papel? ✨",
    unread: 2,
  },
  {
    id: "lucas",
    username: "Lucas Oliveira",
    description: "Criando coisas para a web.",
    lastMessage: "Te mando o link depois!",
    unread: 1,
  },
  {
    id: "bia",
    username: "Beatriz Costa",
    description: "Um pouco de arte todos os dias.",
    lastMessage: "Obrigada pela indicação! 💜",
  },
  {
    id: "pedro",
    username: "Pedro Santos",
    description: "Música, viagens e tecnologia.",
    lastMessage: "Combinado, até amanhã.",
  },
];
const time = (hour: number, minute: number) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};
export const demoMessages: Record<string, ChatMessage[]> = {
  ana: [
    {
      id: "a1",
      senderId: "ana",
      senderUsername: "Ana Martins",
      receiverUsername: "Você",
      content: "Oi! Tudo bem? 👋",
      sentAt: time(10, 30),
    },
    {
      id: "a2",
      senderId: "ana",
      senderUsername: "Ana Martins",
      receiverUsername: "Você",
      content:
        "Estava pensando naquele projeto que a gente comentou. Já tive algumas ideias!",
      sentAt: time(10, 30),
    },
    {
      id: "a3",
      senderId: "demo-you",
      senderUsername: "Você",
      receiverUsername: "Ana Martins",
      content: "Tudo ótimo! Que coincidência, também estava pensando nisso 😊",
      sentAt: time(10, 32),
    },
    {
      id: "a4",
      senderId: "demo-you",
      senderUsername: "Você",
      receiverUsername: "Ana Martins",
      content:
        "Que tal conversarmos hoje à tarde? Podemos organizar tudo por aqui.",
      sentAt: time(10, 32),
    },
    {
      id: "a5",
      senderId: "ana",
      senderUsername: "Ana Martins",
      receiverUsername: "Você",
      content: "Adorei! Vamos tirar essa ideia do papel? ✨",
      sentAt: time(10, 34),
    },
  ],
  lucas: [
    {
      id: "l1",
      senderId: "lucas",
      senderUsername: "Lucas Oliveira",
      receiverUsername: "Você",
      content: "Te mando o link depois!",
      sentAt: time(9, 45),
    },
  ],
  bia: [
    {
      id: "b1",
      senderId: "bia",
      senderUsername: "Beatriz Costa",
      receiverUsername: "Você",
      content: "Obrigada pela indicação! 💜",
      sentAt: time(9, 20),
    },
  ],
  pedro: [
    {
      id: "p1",
      senderId: "pedro",
      senderUsername: "Pedro Santos",
      receiverUsername: "Você",
      content: "Combinado, até amanhã.",
      sentAt: time(8, 10),
    },
  ],
};
export const demoRequests: FriendRequest[] = [
  {
    id: 1,
    senderUsername: "Marina Alves",
    senderEmail: "marina@example.com",
    senderDescription: "Vamos conversar?",
  },
];
