"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUp, Bookmark, ExternalLink, Tag } from "lucide-react";
// import { supabase } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/component";

interface ContentCardProps {
  submission: any;
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
    if (!user) return;

    if (hasVoted) return;

    const { error } = await supabase
      .from("votes")
      .insert({ user_id: user.id, submission_id: submission.id });

    if (!error) {
      setUpvotes((prev) => prev + 1);
      setHasVoted(true);

      await supabase
        .from("submissions")
        .update({ upvotes: upvotes + 1 })
        .eq("id", submission.id);
    }
  };

  const handleBookmark = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (isBookmarked) {
      await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", user.id)
        .eq("submission_id", submission.id);
      setIsBookmarked(false);
    } else {
      await supabase
        .from("bookmarks")
        .insert({ user_id: user.id, submission_id: submission.id });
      setIsBookmarked(true);
    }
  };

  const getSourceBadge = (type: string) => {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      {submission.thumbnail_url && (
        <img
          src={submission.thumbnail_url}
          alt={submission.title}
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {showVoting && (
            <button
              onClick={handleVote}
              disabled={hasVoted}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${hasVoted
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100 text-gray-600"
                }`}
            >
              <ArrowUp className="w-5 h-5" />
              <span className="text-xs font-medium">{upvotes}</span>
            </button>
          )}

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`${badge.color} px-2 py-1 rounded text-xs font-medium`}
              >
                {badge.icon} {submission.source_type}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {submission.title}
            </h3>

            {submission.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {submission.description}
              </p>
            )}

            {submission.submission_tags &&
              submission.submission_tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {submission.submission_tags.map((st: any) => (
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

            <div className="flex items-center justify-between">
              <Link
                href={`/profile/${submission.profiles?.username}`}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                @{submission.profiles?.username}
              </Link>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${isBookmarked
                    ? "bg-yellow-100 text-yellow-600"
                    : "hover:bg-gray-100 text-gray-600"
                    }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                </button>

                <a
                  href={submission.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
