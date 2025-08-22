import { useEffect, useRef, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

type ProfilePanelProps = {
  visible: boolean;
  onClose: () => void;
};

const ProfilePanel = ({ visible, onClose }: ProfilePanelProps) => {
  const { token, logout } = useAuth();
  const panelRef = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [originalProfile, setOriginalProfile] = useState({ username: "", description: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!visible || !token) return;

    axios
      .get("http://localhost:8080/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUsername(res.data.username);
        setDescription(res.data.description ?? "");
        setAvatarUrl(res.data.avatarUrl ?? "");
        setOriginalProfile({
          username: res.data.username,
          description: res.data.description ?? "",
        });
        setIsEditing(false);
      })
      .catch(() => {
        setUsername("");
        setDescription("");
        setAvatarUrl("");
        setOriginalProfile({ username: "", description: "" });
      });
  }, [visible, token]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!visible) return null;

  const handleUpdateProfile = () => {
    axios
      .patch(
        "http://localhost:8080/api/user/profile",
        { username, description },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setOriginalProfile({ username, description });
        setIsEditing(false);
      });
  };

  const handleAvatarUpload = () => {
    if (!isEditing) return;
    if (uploading) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("avatar", file);

      setUploading(true);
      axios
        .post("http://localhost:8080/api/user/avatar", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => setAvatarUrl(res.data))
        .finally(() => setUploading(false));
    };

    input.click();
  };

  return (
    <div
      ref={panelRef}
      className="absolute bottom-16 left-4 w-64 bg-[#334155] text-white p-4 rounded-lg border border-gray-400 shadow-lg z-50"
    >
      <div className="flex flex-col items-center space-y-2 relative">
        <div
          className={`relative cursor-pointer ${!isEditing ? "pointer-events-none opacity-70" : ""}`}
          onClick={handleAvatarUpload}
          title={isEditing ? "Click to change avatar" : ""}
        >
          {avatarUrl ? (
            <img
              src={`http://localhost:8080/${avatarUrl}`}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/64?text=No+Image";
              }}
            />
          ) : (
            <div className="w-16 h-16 bg-[#1e293b] rounded-full border-2 border-blue-500 flex items-center justify-center">
              <FiEdit className="text-white" size={20} />
            </div>
          )}
          {isEditing && (
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-blue-500 p-1.5 rounded-full cursor-pointer"
              title="Change avatar"
              onClick={handleAvatarUpload}
            >
              <FiEdit className="text-white" size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <label className="block text-gray-300 text-sm">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={!isEditing}
          className="bg-transparent border-b border-gray-500 w-full text-white text-sm outline-none disabled:opacity-50"
        />

        <label className="block text-gray-300 text-sm mt-2">Description</label>
        <input
          type="text"
          value={description}
          placeholder="no description"
          onChange={(e) => setDescription(e.target.value)}
          disabled={!isEditing}
          className="bg-transparent border-b border-gray-500 w-full text-white text-sm outline-none disabled:opacity-50"
        />

        <button
          onClick={() => {
            if (isEditing) {
              setUsername(originalProfile.username);
              setDescription(originalProfile.description);
              setIsEditing(false);
            } else {
              setIsEditing(true);
            }
          }}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1.5 rounded-lg transition mt-4"
          type="button"
        >
          {isEditing ? "Cancel" : "Edit profile"}
        </button>

        {isEditing && (
          <button
            onClick={handleUpdateProfile}
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded-lg transition"
            type="button"
            disabled={uploading}
          >
            Save
          </button>
        )}
      </div>

      <button
        onClick={logout}
        className="w-full mt-4 bg-gray-400 text-white font-semibold py-1.5 rounded-lg hover:bg-gray-500 transition cursor-pointer"
        type="button"
      >
        Logout
      </button>
    </div>
  );
};

export default ProfilePanel;
