import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

type FriendRequest = {
  id: number;
  senderUsername: string;
  senderEmail: string;
  senderProfileImgUrl?: string;
  senderDescription?: string;
  status: string;
  createdAt: string;
};

type FriendsPanelProps = {
  userId: string;
  onClose: () => void;
};

const FriendsPanel = ({ userId, onClose }: FriendsPanelProps) => {
  const { token } = useAuth();
  const [friendEmail, setFriendEmail] = useState("");
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });

  const fetchPendingRequests = async () => {
    if (!token || !userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/requests/pending?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pending requests.");
      const data: FriendRequest[] = await res.json();
      setPendingRequests(data);
    } catch {
      setFeedback({ message: "Error while loading pending requests.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    setFeedback({ message: "", type: null });
    if (!friendEmail) {
      setFeedback({ message: "Please enter a valid email.", type: "error" });
      return;
    }
    if (!token) {
      setFeedback({ message: "Session expired. Please login again.", type: "error" });
      return;
    }

    try {
      const res = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fromUserId: userId, toEmail: friendEmail }),
      });

      const text = await res.text();

      if (!res.ok) {
        const message =
          text.includes("User not found") ? "User not found." :
          text.includes("cannot send to yourself") ? "You cannot send a request to yourself." :
          text.includes("already") ? "Request already sent or user is already your friend." :
          "Failed to send friend request.";
        setFeedback({ message, type: "error" });
        return;
      }

      setFeedback({ message: `Friend request sent to ${friendEmail}.`, type: "success" });
      setFriendEmail("");
      fetchPendingRequests();
    } catch {
      setFeedback({ message: "Unexpected error while sending friend request.", type: "error" });
    }
  };

  const handleAccept = async (requestId: number) => {
    if (!token) {
      setFeedback({ message: "Invalid session. Please login again.", type: "error" });
      return;
    }

    try {
      const res = await fetch(`/api/friends/request/${requestId}/accept?userId=${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await res.text();
      if (!res.ok) {
        const message =
          text.includes("User not found") ? "User not found." :
          text.includes("Request not found") ? "Friend request not found." :
          "Failed to accept friend request.";
        setFeedback({ message, type: "error" });
        return;
      }
      setFeedback({ message: "Friend request accepted successfully.", type: "success" });
      fetchPendingRequests();
    } catch {
      setFeedback({ message: "Error while accepting friend request.", type: "error" });
    }
  };

  const handleDecline = async (requestId: number) => {
    if (!token) {
      setFeedback({ message: "Invalid session. Please login again.", type: "error" });
      return;
    }

    try {
      const res = await fetch(`/api/friends/request/${requestId}/reject?userId=${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await res.text();
      if (!res.ok) {
        const message =
          text.includes("User not found") ? "User not found." :
          text.includes("Request not found") ? "Friend request not found." :
          "Failed to decline friend request.";
        setFeedback({ message, type: "error" });
        return;
      }
      setFeedback({ message: "Friend request declined successfully.", type: "success" });
      fetchPendingRequests();
    } catch {
      setFeedback({ message: "Error while declining friend request.", type: "error" });
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, [token, userId]);

  return (
    <div className="flex flex-col h-full bg-[#0A1931] text-white p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Add Friend</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
      </div>

      <div className="space-y-1">
        <p className="text-gray-300">Add friends by their email address.</p>
        <div className="flex items-center bg-[#1F2937] rounded-md overflow-hidden">
          <input
            type="email"
            placeholder="Enter your friend's email"
            value={friendEmail}
            onChange={(e) => setFriendEmail(e.target.value)}
            className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-gray-500"
          />
          <button
            onClick={handleAddFriend}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 m-1 rounded-md transition"
          >
            Send
          </button>
        </div>
        {feedback.message && (
          <div
            className={`mt-2 border-l-4 px-4 py-3 rounded-md text-sm ${
              feedback.type === "success"
                ? "border-green-400 bg-green-900 text-green-100"
                : "border-red-400 bg-red-900 text-red-200"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
        {loading ? (
          <p>Loading...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-gray-400">No pending friend requests.</p>
        ) : (
          pendingRequests.map((req) => (
            <div key={req.id} className="bg-[#1F2937] rounded-md p-3 mb-3">
              <p className="font-medium">{req.senderUsername}</p>
              <p className="text-gray-400 text-sm">{req.senderEmail}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleAccept(req.id)}
                  className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(req.id)}
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendsPanel;
