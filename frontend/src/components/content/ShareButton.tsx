// src/components/content/ShareButton.tsx
"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  postId: string;
}

export default function ShareButton({ title, postId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Construct the full URL - Ensure this matches your deployment URL in production
    const shareUrl = `${window.location.origin}/post/${postId}`;
    const shareText = `Check out this post on CurioHub: ${title}`;

    try {
      if (navigator.share) {
        // Use Web Share API if available (better for mobile)
        await navigator.share({
          title: "CurioHub Post",
          text: shareText,
          url: shareUrl,
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to share or copy the link";
      // Fallback for older browsers or if clipboard fails
      alert(`${message}. Share this link manually: ${shareUrl}`);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        copied
          ? "bg-green-100 text-green-700 border-green-300"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
      aria-label="Share this post"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" /> Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" /> Share
        </>
      )}
    </button>
  );
}
