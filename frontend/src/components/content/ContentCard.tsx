// src/components/content/ContentCard.tsx
"use client";

import { useState, useEffect } from "react"; // Added useEffect for potential future use (like checking vote/bookmark status)
import Link from "next/link";
import { ArrowUp, Bookmark, ExternalLink, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/component";

interface ContentCardProps {
  submission: {
    id: string; // Ensure id is expected
    title: string;
    description?: string | null;
    url: string;
    thumbnail_url?: string | null;
    source_type: string;
    upvotes?: number | null;
    created_at: string; // Or Date
    profiles?: {
      // Use optional chaining below
      username: string | null;
      display_name?: string | null; // Optional
    } | null;
    submission_tags?: {
      // Use optional chaining below
      tags: {
        name: string;
        slug: string;
      };
    }[];
  };
  showVoting?: boolean;
}

export default function ContentCard({
  submission,
  showVoting = false,
}: ContentCardProps) {
  const [upvotes, setUpvotes] = useState<number>(submission.upvotes || 0);
  const [hasVoted, setHasVoted] = useState(false); // Consider fetching initial state later
  const [isBookmarked, setIsBookmarked] = useState(false); // Consider fetching initial state later
  const supabase = createClient();

  // Load initial bookmark (and optionally vote) status for the current user
  useEffect(() => {
    const checkStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      // Check bookmark
      const { data: bookmarkData } = await supabase
        .from("bookmarks")
        .select("user_id")
        .eq("user_id", user.id)
        .eq("submission_id", submission.id)
        .maybeSingle();
      setIsBookmarked(!!bookmarkData);
    };
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submission.id]);
  // ---

  const handleVote = async () => {
    // ... (keep existing vote logic)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // Maybe prompt login

    if (hasVoted) {
      // Optional: Implement un-voting
      // const { error } = await supabase.from('votes').delete().match({ user_id: user.id, submission_id: submission.id });
      // if (!error) { setUpvotes(prev => prev - 1); setHasVoted(false); /* Update submission? */ }
      return;
    }

    // Vote
    const { error } = await supabase
      .from("votes")
      .insert({ user_id: user.id, submission_id: submission.id });

    if (!error) {
      const newUpvotes = upvotes + 1;
      setUpvotes(newUpvotes);
      setHasVoted(true);

      // Update the submission's upvote count in the database
      const { error: updateError } = await supabase
        .from("submissions")
        .update({ upvotes: newUpvotes }) // Use calculated new count
        .eq("id", submission.id);

      if (updateError) {
        console.error("Failed to update submission upvotes:", updateError);
        // Optional: Roll back local state change if DB update fails
        // setUpvotes(prev => prev - 1);
        // setHasVoted(false);
      }
    } else {
      console.error("Error casting vote:", error);
    }
  };

  const handleBookmark = async () => {
    // ... (keep existing bookmark logic)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return; // Maybe prompt login

    if (isBookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("submission_id", submission.id);
      if (!error) setIsBookmarked(false);
      else console.error("Error removing bookmark:", error);
    } else {
      const { error } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, submission_id: submission.id });
      if (!error) setIsBookmarked(true);
      else console.error("Error adding bookmark:", error);
    }
  };

  const getSourceBadge = (type: string) => {
    // ... (keep existing badge logic)
    const badges: Record<string, { color: string; icon: string }> = {
      youtube: { color: "bg-red-100 text-red-700", icon: "📺" },
      instagram: { color: "bg-pink-100 text-pink-700", icon: "📸" },
      reddit: { color: "bg-orange-100 text-orange-700", icon: "🔗" },
      twitter: { color: "bg-blue-100 text-blue-700", icon: "🐦" },
      article: { color: "bg-green-100 text-green-700", icon: "📰" },
    };
    return badges[type] || badges.article;
  };

  const badge = getSourceBadge(submission.source_type);
  const postUrl = `/post/${submission.id}`; // --- Define the link URL ---

  return (
    // --- Use flex-col to allow footer pushing ---
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
      {" "}
      {/* Added h-full */}
      {submission.thumbnail_url && (
        // --- Wrap thumbnail in Link ---
        <Link
          href={postUrl}
          className="block aspect-video overflow-hidden group"
        >
          <img
            src={submission.thumbnail_url}
            alt={submission.title}
            // --- Adjust image styling, add hover effect ---
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}
      {/* --- Use flex-grow to push footer down --- */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start gap-3 mb-3 flex-grow">
          {" "}
          {/* Add flex-grow */}
          {showVoting && (
            <button
              onClick={handleVote}
              disabled={hasVoted} // Disable after voting
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                hasVoted
                  ? "bg-blue-100 text-blue-600 cursor-default" // Style when voted
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              aria-live="polite" // Announce changes for accessibility
            >
              <ArrowUp className="w-5 h-5" />
              <span className="text-xs font-medium">{upvotes}</span>
            </button>
          )}
          {/* --- Inner div takes remaining space --- */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`${badge.color} px-2 py-1 rounded text-xs font-medium`}
              >
                {badge.icon} {submission.source_type}
              </span>
            </div>

            {/* --- Wrap title in Link --- */}
            <Link href={postUrl} className="block mb-2 group">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {submission.title}
              </h3>
            </Link>

            {submission.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {submission.description}
              </p>
            )}

            {/* --- Footer content pushed down --- */}
            <div className="mt-auto pt-3">
              {submission.submission_tags &&
                submission.submission_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {submission.submission_tags.map(
                      (
                        st // Use destructured tag object
                      ) => (
                        <span
                          key={st.tags.slug} // Use unique slug
                          className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          <Tag className="w-3 h-3" />
                          {st.tags.name}
                        </span>
                      )
                    )}
                  </div>
                )}

              {/* --- Add border-t --- */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <Link
                  // Use optional chaining for safety
                  href={`/profile/${
                    submission.profiles?.username || "unknown"
                  }`}
                  className="text-sm text-gray-500 hover:text-gray-700 truncate" // Added truncate
                  title={submission.profiles?.username || "Unknown user"}
                >
                  @{submission.profiles?.username || "unknown"}
                </Link>

                <div className="flex items-center gap-1.5">
                  {" "}
                  {/* Reduced gap */}
                  <button
                    onClick={handleBookmark}
                    className={`p-1.5 rounded-md transition-colors ${
                      // Adjusted padding
                      isBookmarked
                        ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    }`}
                    aria-label={
                      isBookmarked ? "Remove bookmark" : "Add bookmark"
                    }
                    title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${
                        isBookmarked ? "fill-current" : ""
                      }`}
                    />
                  </button>
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium p-1.5 rounded-md hover:bg-gray-100" // Adjusted padding
                    aria-label="View source"
                    title="View source"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
