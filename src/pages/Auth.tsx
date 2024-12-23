import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { MessageCircle } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { signIn, signUp, user, error } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true); // Toggle between Sign-In and Sign-Up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // For Sign-Up only
  const [signupMessage, setSignupMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        const response = await signUp(email, password, username);
        if (response && response.user) {
          setSignupMessage(
            "Account created successfully! You can now sign in."
          );
          setIsLogin(true); // Switch to login page
        } else {
          throw new Error(
            "Failed to create account. Please check your inputs."
          );
        }
      }
      if (user) {
        console.log("Navigating to homepage...");
        navigate("/"); // Adjust the route if your homepage path is different
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Sign-up failed due to an unknown error.";
      console.error(isLogin ? "Login failed:" : "Sign-up failed:", err);
      setSignupMessage(errorMessage);
      if (!isLogin) {
        setIsLogin(false); // Stay on Sign-Up page for corrections
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <MessageCircle className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
          {!isLogin && (
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          )}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {signupMessage && (
            <div
              className={`text-sm ${
                isLogin ? "text-red-600" : "text-green-600"
              }`}
            >
              {signupMessage}
            </div>
          )}
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLogin ? "Sign in" : "Sign up"}
          </button>
        </form>
        <div className="text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setSignupMessage("");
            }}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
