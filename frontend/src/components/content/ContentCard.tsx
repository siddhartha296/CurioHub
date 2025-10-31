// src/components/content/ContentCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, Bookmark, ExternalLink, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/component";

interface ContentCardProps {
  submission: {
    id: string;
    title: string;
    description?: string | null;
    url: string;
    thumbnail_url?: string | null;
    source_type: string;
    upvotes?: number | null;
    created_at: string;
    profiles?: {
      username: string | null;
      display_name?: string | null;
    } | null;
    submission_tags?: {
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
  const [hasVoted, setHasVoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const supabase = createClient();

  const handleVote = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Please sign in to vote");
      return;
    }

    if (hasVoted) {
      return;
    }

    const { error } = await supabase
      .from("votes")
      .insert({ user_id: user.id, submission_id: submission.id });

    if (!error) {
      const newUpvotes = upvotes + 1;
      setUpvotes(newUpvotes);
      setHasVoted(true);

      await supabase
        .from("submissions")
        .update({ upvotes: newUpvotes })
        .eq("id", submission.id);
    } else {
      if (error.code === "23505") {
        alert("You've already voted on this post");
      } else {
        alert("Failed to record your vote. Please try again.");
      }
    }
  };

  const handleBookmark = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Please sign in to bookmark");
      return;
    }

    if (isBookmarked) {
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("submission_id", submission.id);
      
      if (!error) {
        setIsBookmarked(false);
      } else {
        alert("Failed to remove bookmark. Please try again.");
      }
    } else {
      const { error } = await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, submission_id: submission.id });
      
      if (!error) {
        setIsBookmarked(true);
      } else {
        if (error.code === "42501") {
          alert("Permission denied. Please make sure you're signed in.");
        } else if (error.code === "23505") {
          setIsBookmarked(true); // Already bookmarked
        } else {
          alert("Failed to add bookmark. Please try again.");
        }
      }
    }
  };

  const getSourceBadge = (type: string) => {
    const badges: Record<string, { color: string; icon: string }> = {
      youtube: { color: "bg-red-100 text-red-700", icon: "📺" },
      instagram: { color: "bg-pink-100 text-pink-700", icon: "📸" },
      reddit: { color: "bg-orange-100 text-orange-700", icon: "🔗" },
      twitter: { color: "bg-blue-100 text-blue-700", icon: "🦅" },
      article: { color: "bg-green-100 text-green-700", icon: "📰" },
    };
    return badges[type] || badges.article;
  };

  const badge = getSourceBadge(submission.source_type);
  const postUrl = `/post/${submission.id}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
      {submission.thumbnail_url && (
        <Link
          href={postUrl}
          className="block aspect-video overflow-hidden group"
        >
          <img
            src={submission.thumbnail_url}
            alt={submission.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      )}
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start gap-3 mb-3 flex-grow">
          {showVoting && (
            <button
              onClick={handleVote}
              disabled={hasVoted}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                hasVoted
                  ? "bg-blue-100 text-blue-600 cursor-default"
                  : "hover:bg-gray-100 text-gray-600"
              }`}
              aria-live="polite"
            >
              <ArrowUp className="w-5 h-5" />
              <span className="text-xs font-medium">{upvotes}</span>
            </button>
          )}
          
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`${badge.color} px-2 py-1 rounded text-xs font-medium`}
              >
                {badge.icon} {submission.source_type}
              </span>
            </div>

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

            <div className="mt-auto pt-3">
              {submission.submission_tags &&
                submission.submission_tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {submission.submission_tags.map((st) => (
                      <span
                        key={st.tags.slug}
                        className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        <Tag className="w-3 h-3" />
                        {st.tags.name}
                      </span>
                    ))}
                  </div>
                )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <Link
                  href={`/profile/${submission.profiles?.username || "unknown"}`}
                  className="text-sm text-gray-500 hover:text-gray-700 truncate"
                  title={submission.profiles?.username || "Unknown user"}
                >
                  @{submission.profiles?.username || "unknown"}
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleBookmark}
                    className={`p-1.5 rounded-md transition-colors ${
                      isBookmarked
                        ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                        : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    }`}
                    aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                    title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                    />
                  </button>
                  <a
                    href={submission.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium p-1.5 rounded-md hover:bg-gray-100"
                    aria-label="View source"
                    title="View source"
                    onClick={(e) => e.stopPropagation()}
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
