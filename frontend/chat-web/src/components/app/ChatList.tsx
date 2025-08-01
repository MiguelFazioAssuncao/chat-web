import ChatItem from "./ChatItem"

type Chat = {
  id: number
  name: string
  lastMessage: string
}

const ChatList = () => {
  const chats: Chat[] = [
    { id: 1, name: "Pessoa 1", lastMessage: "Texto 1" },
    { id: 2, name: "Pessoa 2", lastMessage: "Texto 2" },
  ]

  return (
    <div className="flex flex-col space-y-2">
      {chats.map(chat => (
        <ChatItem key={chat.id} name={chat.name} lastMessage={chat.lastMessage} />
      ))}
    </div>
  )
}

export default ChatList
 