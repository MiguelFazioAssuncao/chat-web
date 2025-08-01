type Props = {
  visible: boolean;
  onClose: () => void;
};

const UserProfilePanel = ({ visible }: Props) => {
  if (!visible) return null;

  return (
    <div
      className="w-96 bg-[#0F172A] border-l border-gray-800 shadow-lg absolute right-0"
      style={{ top: "46.5px", bottom: "64px" }}
    >
      <div className="h-48 bg-red-700" />
      <div className="p-4">
        <div className="w-16 h-16 bg-[#17203B] rounded-lg mb-2" />
        <h2 className="text-white text-xl font-semibold">Pessoa 1</h2>
        <p className="text-gray-300">Descrição</p>
      </div>
    </div>
  );
};

export default UserProfilePanel;
