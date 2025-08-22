import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (password.length < 6 || password.length > 60) {
      setError("Password must be between 6 and 60 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!token) {
      setError("Invalid or missing token.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:8080/auth/reset-password",
        { token, newPassword: password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Your password has been reset successfully.");
      setPassword("");
      setConfirm("");
    } catch (err: any) {
      if (err.response?.data) {
        setError(err.response.data);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      <div className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-lg p-8 space-y-6 animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-2">Create new password</h2>
        <p className="text-gray-400 text-sm text-center">Enter your new password below.</p>

        {message && (
          <div className="bg-green-600/20 border border-green-600 text-green-400 rounded-md p-3 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-600/20 border border-red-600 text-red-400 rounded-md p-3 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 ${
              loading ? "bg-blue-700/60 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center pt-4">
          <a href="/auth/login" className="text-sm text-blue-400 hover:underline hover:text-blue-300 transition-all">
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
