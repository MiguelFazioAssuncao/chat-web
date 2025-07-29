import { useState } from "react";
import axios from "axios";
import Logo from "../../assets/chatWebLogo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post(
        "http://localhost:8080/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Token:", response.data);
      setSuccess(true);

      if (rememberMe) {
        localStorage.setItem("token", response.data);
      } else {
        sessionStorage.setItem("token", response.data);
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data || "Login error");
      } else {
        setError("Could not connect to the server");
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
          Sign In
        </h1>

        {error && <p className="text-red-400 text-center mb-4">{error}</p>}
        {success && (
          <p className="text-green-400 text-center mb-4">Login successful!</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-semibold">
              Email Address:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-base md:text-lg"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-semibold">
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-base md:text-lg"
            />
          </div>

          <div className="flex items-center justify-between text-sm md:text-base">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="text-blue-500"
              />
              <span>Remember me</span>
            </label>
            <a href="/auth/forgot-password" className="text-blue-400 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer w-full bg-blue-500 hover:bg-blue-600 transition-colors py-2 rounded-full text-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <a href="/auth/register" className="text-blue-400 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
