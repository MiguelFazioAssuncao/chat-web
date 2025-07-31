import { useState } from "react";
import axios from "axios";
import Logo from "../../assets/chatWebLogo.png";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ [key: string]: string } | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:8080/auth/register",
        {
          username,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess(true);
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 400 && typeof err.response.data === "object") {
          setError(err.response.data);
        } else {
          setError({ general: err.response.data || "Registration error" });
        }
      } else {
        setError({ general: "Could not connect to the server" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full 2xl:w-1/2 bg-gray-900 flex items-center justify-center py-10">
      <div className="w-4/5 max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl text-white">
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Logo" className="w-16 h-16" />
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">
          Sign Up
        </h1>

        {error?.general && (
          <p className="text-red-400 text-center mb-4">{error.general}</p>
        )}

        {success && (
          <p className="text-green-400 text-center mb-4">
            Registration successful!
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-semibold">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-base md:text-lg"
              required
            />
            {error?.username && (
              <p className="text-red-400 text-sm mt-1">{error.username}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">Email Address:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-base md:text-lg"
              required
            />
            {error?.email && (
              <p className="text-red-400 text-sm mt-1">{error.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-base md:text-lg"
              required
            />
            {error?.password && (
              <p className="text-red-400 text-sm mt-1">{error.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-blue-500 hover:bg-blue-600 transition-colors py-2 rounded-full text-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-400 hover:underline">
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
