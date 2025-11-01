import ResetPasswordForm from "@/components/auth/ResetForm";
import Link from "next/link";
import React, { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">Enter a new password below to regain access to your account.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
