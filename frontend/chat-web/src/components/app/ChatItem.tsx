type ChatItemProps = {
  name: string;
  lastMessage: string;
  profileImgUrl?: string;
};

const ChatItem = ({ name, lastMessage, profileImgUrl }: ChatItemProps) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#122A42] cursor-pointer transition">
      {profileImgUrl ? (
        <img
          src={`http://localhost:8080/${profileImgUrl}`}
          alt={`${name}'s avatar`}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/40?text=No+Image";
          }}
        />
      ) : (
        <div className="w-10 h-10 bg-[#1A2B44] rounded-full" />
      )}
      <div className="flex flex-col text-sm">
        <span className="font-medium text-white">{name}</span>
        <span className="text-gray-400 text-xs truncate">{lastMessage}</span>
      </div>
    </div>
  );
};

export default ChatItem;
