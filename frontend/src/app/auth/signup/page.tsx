"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Frontend Validation
    if (!username.trim()) {
      setErrors("Username cannot be empty");
      return;
    }
    if (!email.includes("@")) {
      setErrors("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setErrors("Password must be at least 6 characters long");
      return;
    }

    setErrors(null);
    setLoading(true);

    try {
      const res = await axios.post("/api/auth/signup", {
        username,
        email,
        password,
      });

      alert("Signup successful ✅ Please login!");
      window.location.href = "/auth/login"; // redirect
    } catch (error: any) {
      setErrors(error.response?.data?.message || "Signup failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Join CurioHub
          </h1>
          <p className="text-gray-600">Start discovering inspiring content</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* 🔹 Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />

            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />

            <input
              type="password"
              placeholder="Create Password (min. 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              required
            />

            {/* 🔹 Error Message Display */}
            {errors && (
              <p className="text-red-600 text-sm text-center">{errors}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? "Signing up..." : "Create Account"}
            </button>
          </form>

          {/* 🔹 Login Redirect */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
