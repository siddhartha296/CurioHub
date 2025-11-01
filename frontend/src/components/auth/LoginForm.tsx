"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/component";
// import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };


  const handleForgotPassword = async () => {
    if (!formData.email) {
      alert("Please enter your email first.");
      return;
    }

    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      alert("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      alert(error.message || "Failed to send reset email.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          required
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
        />
        <div className="text-right mt-2">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetting}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50"
          >
            {resetting ? "Sending..." : "Forgot password?"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign In"
        )}
      </button>
    </form>
  );
}
