import axios from "axios";
import { FiTrash } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedUser: {
    id: string;
    username: string;
    description?: string;
    profileImgUrl?: string;
  };
};

const UserProfilePanel = ({ visible, onClose, selectedUser }: Props) => {
  const { token } = useAuth();
  const [confirming, setConfirming] = useState(false);

  if (!visible || !selectedUser) return null;

  const handleRemoveUser = () => {
    axios
      .delete(`/api/user-friends/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setConfirming(false);
        onClose();
      })
      .catch((err) => console.error("Error removing friend:", err));
  };

  return (
    <>
      <div
        className="w-96 bg-[#0F172A] border-l border-gray-800 shadow-lg absolute right-0"
        style={{ top: "46.5px", bottom: "64px" }}
      >
        <div className="h-48 bg-blue-900 relative">
          {selectedUser.profileImgUrl && (
            <img
              src={`http://localhost:8080/${selectedUser.profileImgUrl}`}
              alt="Avatar"
              className="absolute bottom-[-32px] left-4 w-16 h-16 rounded-lg object-cover border-2 border-white"
            />
          )}
        </div>
        <div className="p-4 mt-8">
          <h2 className="text-white text-xl font-semibold">
            {selectedUser.username}
          </h2>
          <p className="text-gray-300 text-sm">
            {selectedUser.description || "No description"}
          </p>
          <button
            onClick={() => setConfirming(true)}
            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center space-x-2 transition"
          >
            <FiTrash />
            <span>Remove Friend</span>
          </button>
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#1e293b] p-6 rounded-lg shadow-xl w-80 text-center">
            <h3 className="text-white text-lg font-semibold mb-4">
              Are you sure you want to remove this user?
            </h3>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setConfirming(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg w-full mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg w-full ml-2"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfilePanel;
