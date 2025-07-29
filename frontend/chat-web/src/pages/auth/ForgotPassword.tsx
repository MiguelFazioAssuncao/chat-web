import { useState } from "react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:8080/auth/forgot-password",
        { email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setMessage(response.data); 
    } catch (err: any) {
      if (err.response && err.response.data) {
        if (typeof err.response.data === "string") {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("An error occurred");
        }
      } else {
        setError("Could not connect to the server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      <div className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-lg p-8 space-y-6 animate-fade-in">
        <h2 className="text-3xl font-bold text-center mb-2">
          Forgot your password?
        </h2>
        <p className="text-gray-400 text-sm text-center">
          Enter your email below and we’ll send you a link to reset your password.
        </p>

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
            <label className="text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full py-2 rounded-lg font-semibold transition-all duration-300 ${
              loading
                ? "bg-blue-700/60 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Sending..." : "Send Recovery Link"}
          </button>
        </form>

        <div className="text-center pt-4">
          <a
            href="/auth/login"
            className="text-sm text-blue-400 hover:underline hover:text-blue-300 transition-all"
          >
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
