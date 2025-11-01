// src/app/post/[postId]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  User as UserIcon,
  Calendar,
  Tag,
} from "lucide-react";
import ShareButton from "@/components/content/ShareButton";

interface SubmissionData {
  id: string;
  title: string;
  url: string;
  description: string | null;
  thumbnail_url: string | null;
  source_type: string;
  created_at: string;
  status: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
  } | null;
  submission_tags: {
    tags: {
      name: string;
      slug: string;
    };
  }[];
}

const getSourceBadge = (type: string) => {
  const badges: Record<string, { color: string; icon: string; label: string }> = {
    youtube: {
      color: "bg-red-100 text-red-700",
      icon: "📺",
      label: "YouTube",
    },
    instagram: {
      color: "bg-pink-100 text-pink-700",
      icon: "📸",
      label: "Instagram",
    },
    reddit: {
      color: "bg-orange-100 text-orange-700",
      icon: "🔗",
      label: "Reddit",
    },
    twitter: {
      color: "bg-blue-100 text-blue-700",
      icon: "🦅",
      label: "X (Twitter)",
    },
    article: {
      color: "bg-green-100 text-green-700",
      icon: "📰",
      label: "Article",
    },
  };
  return badges[type] || {
    color: "bg-gray-100 text-gray-700",
    icon: "❓",
    label: type || "Unknown",
  };
};

interface PostPageParams {
  postId: string;
}

export default async function PostPage({
  params,
}: {
  params: Promise<PostPageParams>;
}) {
  // Fix: Properly await params in Next.js 15
  const { postId } = await params;
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!postId || !uuidRegex.test(postId)) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch the specific submission
  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select(
      `
      id,
      title,
      url,
      description,
      thumbnail_url,
      source_type,
      created_at,
      status,
      profiles!submissions_user_id_fkey ( username, display_name, avatar_url, created_at ),
      submission_tags (
        tags ( name, slug )
      )
    `
    )
    .eq("id", postId)
    .single<SubmissionData>();

  if (submissionError || !submission) {
    notFound();
  }

  const badge = getSourceBadge(submission.source_type);
  const profile = submission.profiles;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <article className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
        {submission.thumbnail_url && (
          <div className="w-full bg-gray-100 flex justify-center">
            <img
              src={submission.thumbnail_url}
              alt={`Thumbnail for ${submission.title}`}
              className="w-full h-auto max-h-[500px] object-contain"
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          <span
            className={`inline-flex items-center gap-1.5 ${badge.color} px-2.5 py-1 rounded text-sm font-medium mb-4`}
          >
            {badge.icon} {badge.label}
          </span>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight break-words">
            {submission.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-6 border-b pb-4">
            {profile ? (
              <Link
                href={`/profile/${profile.username}`}
                className="flex items-center gap-2 hover:text-gray-800 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                  {profile.display_name?.charAt(0) ||
                    profile.username?.charAt(0)?.toUpperCase() ||
                    "?"}
                </div>
                <div>
                  <span className="font-semibold text-gray-700 group-hover:text-blue-600">
                    {profile.display_name || profile.username}
                  </span>
                  <div className="text-xs">@{profile.username}</div>
                </div>
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 italic">
                <UserIcon className="w-4 h-4" />
                <span>User unavailable</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <time dateTime={submission.created_at}>
                Submitted on{" "}
                {new Date(submission.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>

          {submission.description && (
            <div className="prose prose-slate prose-sm sm:prose lg:prose-base max-w-none text-gray-800 mb-6 break-words">
              <p>{submission.description}</p>
            </div>
          )}

          {submission.submission_tags && submission.submission_tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm font-medium text-gray-600 mr-1">
                Tags:
              </span>
              {submission.submission_tags.map((st) => (
                <span
                  key={st.tags.slug}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs hover:bg-gray-200 transition-colors"
                >
                  <Tag className="w-3 h-3" />
                  {st.tags.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t">
            <a
              href={submission.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
            >
              Visit Source <ExternalLink className="w-4 h-4" />
            </a>
            <ShareButton title={submission.title} postId={submission.id} />
          </div>
        </div>
      </article>

      <div className="mt-12 pt-8 border-t">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Discussion
        </h2>
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
          <p className="italic">Comment section coming soon!</p>
        </div>
      </div>
    </div>
  );
}
