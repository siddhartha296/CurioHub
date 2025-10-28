// src/app/post/[postId]/page.tsx
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ExternalLink,
  User as UserIcon,
  Calendar,
  Tag,
  Share2, // Ensure Share2 is imported if used directly, although it's in ShareButton
} from "lucide-react";
import ShareButton from "@/components/content/ShareButton"; // Ensure this path is correct

// Define a more specific type for the submission data fetched
// Adjust based on your actual database.types.ts if available and accurate
interface SubmissionData {
  id: string;
  title: string;
  url: string;
  description: string | null;
  thumbnail_url: string | null;
  source_type: string;
  created_at: string; // Or Date
  status: string; // Include status if needed later
  profiles: {
    // Use Profiles type from database.types.ts if defined
    username: string; // Assuming username is NOT NULL
    display_name: string | null;
    avatar_url: string | null;
    created_at: string; // Or Date
  } | null; // Profile might not exist if user deleted, though FK should prevent usually
  submission_tags: {
    tags: {
      name: string;
      slug: string;
    };
  }[]; // Should be an array
}

// Helper function for source badges
const getSourceBadge = (type: string) => {
  const badges: Record<string, { color: string; icon: string; label: string }> =
    {
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
        icon: "🐦",
        label: "X (Twitter)",
      },
      article: {
        color: "bg-green-100 text-green-700",
        icon: "📰",
        label: "Article",
      },
      // Add other source types if necessary
    };
  // Provide a fallback for unknown types
  return (
    badges[type] || {
      color: "bg-gray-100 text-gray-700",
      icon: "❓",
      label: type || "Unknown",
    }
  );
};

// Define the expected shape of the params prop
interface PostPageParams {
  postId: string;
}

// Update the component's props type definition
export default async function PostPage({
  params,
}: {
  params: Promise<PostPageParams>;
}) {
  // Directly access postId from params, as Next.js resolves it for Server Components
  // No need to await params itself here. The async nature is for fetching data.
  const resolvedParams = React.use(params);
  const postId = resolvedParams.postId;
  const supabase = await createClient();

  // Add validation: Check if postId looks like a UUID before querying
  const uuidRegex =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  if (!postId || !uuidRegex.test(postId)) {
    console.error("Invalid Post ID format:", postId);
    notFound(); // Show 404 for invalid ID format
  }

  // Fetch the specific submission using the validated postId
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
      profiles ( username, display_name, avatar_url, created_at ),
      submission_tags (
        tags ( name, slug )
      )
    `
    )
    .eq("id", postId)
    // You might want stricter status checks depending on who should see what
    // e.g., only 'approved' for public view? Or allow owners to see 'pending'?
    .in("status", ["approved", "pending"]) // Keep this or adjust as needed
    .single<SubmissionData>(); // Use .single<Type>() for better type inference

  // Handle errors or missing submission
  if (submissionError || !submission) {
    console.error(`Error fetching post ${postId}:`, submissionError);
    notFound(); // Show a 404 page
  }

  // --- Data is successfully fetched beyond this point ---

  const badge = getSourceBadge(submission.source_type);
  const profile = submission.profiles; // Can be null if join failed/profile missing

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <article className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden">
        {submission.thumbnail_url && (
          <div className="w-full bg-gray-100 flex justify-center">
            {" "}
            {/* Centering container */}
            <img
              src={submission.thumbnail_url}
              alt={`Thumbnail for ${submission.title}`} // More descriptive alt text
              className="w-full h-auto max-h-[500px] object-contain" // Use contain to see the whole image
            />
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Source Badge */}
          <span
            className={`inline-flex items-center gap-1.5 ${badge.color} px-2.5 py-1 rounded text-sm font-medium mb-4`}
          >
            {badge.icon} {badge.label}
          </span>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight break-words">
            {" "}
            {/* Added break-words */}
            {submission.title}
          </h1>

          {/* Author and Date Info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-6 border-b pb-4">
            {profile ? ( // Only render Link if profile exists
              <Link
                href={`/profile/${profile.username}`}
                className="flex items-center gap-2 hover:text-gray-800 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 group-hover:scale-105 transition-transform">
                  {/* Safely get first initial */}
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
                {" "}
                {/* Add dateTime for semantics */}
                Submitted on{" "}
                {new Date(submission.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>

          {/* Description */}
          {submission.description && (
            // Consider using a dedicated markdown renderer if descriptions support markdown
            <div className="prose prose-slate prose-sm sm:prose lg:prose-base max-w-none text-gray-800 mb-6 break-words">
              {" "}
              {/* Adjusted prose styles, added break-words */}
              <p>{submission.description}</p>
            </div>
          )}

          {/* Tags */}
          {submission.submission_tags &&
            submission.submission_tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {" "}
                {/* Added items-center */}
                <span className="text-sm font-medium text-gray-600 mr-1">
                  Tags:
                </span>
                {submission.submission_tags.map((st) => (
                  // Consider making tags links if you have tag pages
                  <span
                    key={st.tags.slug}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs hover:bg-gray-200 transition-colors" // Use rounded-full, adjust padding
                  >
                    <Tag className="w-3 h-3" />
                    {st.tags.name}
                  </span>
                ))}
              </div>
            )}

          {/* Action Buttons: Source and Share */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t">
            <a
              href={submission.url}
              target="_blank"
              rel="noopener noreferrer" // Important for security
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 transition-colors"
            >
              Visit Source <ExternalLink className="w-4 h-4" />
            </a>
            {/* Share Button Component - ensure postId is passed */}
            <ShareButton title={submission.title} postId={submission.id} />
          </div>
        </div>
      </article>

      {/* Placeholder for Future Comment Section */}
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
