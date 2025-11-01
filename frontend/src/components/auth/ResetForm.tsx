"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/component";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm() {
  const supabase = createClient();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      await supabase.auth.signOut();
      alert("Password has been reset successfully!");
      router.push("/auth/login");
    } catch (err: any) {
      alert(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            value={password}
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            minLength={8}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
