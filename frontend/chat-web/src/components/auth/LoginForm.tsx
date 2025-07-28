import Logo from "../../assets/chatWebLogo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";

const LoginForm = () => {
  return (
    <div className="w-full 2xl:w-1/2 bg-gray-900 flex items-center justify-center py-10">
      <div className="w-4/5 max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl text-white">
        <div className="flex justify-center mb-6">
          <img src={Logo} alt="Logo" className="w-16 h-16" />
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">
          Sign in
        </h1>

        <form className="space-y-5">
          <div>
            <label className="block mb-1 text-sm font-semibold">
              Email Address:
            </label>
            <input
              type="email"
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
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none text-base md:text-lg"
            />
          </div>

          <div className="flex items-center justify-between text-sm md:text-base">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="text-blue-500" />
              <span>Remember me</span>
            </label>
            <a href="#" className="text-blue-400 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="cursor-pointer w-full bg-blue-500 hover:bg-blue-600 transition-colors py-2 rounded-full text-lg font-semibold"
          >
            Log in
          </button>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-400 mb-4">
            or connect with
          </p>
          <div className="flex justify-center space-x-4">
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-colors">
              <FontAwesomeIcon
                icon={faGithub}
                className="cursor-pointer text-white text-xl"
              />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 border border-gray-600 hover:bg-gray-700 transition-colors">
              <FontAwesomeIcon
                icon={faGoogle}
                className="cursor-pointer text-white text-xl"
              />
            </button>
          </div>
        </div>

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
