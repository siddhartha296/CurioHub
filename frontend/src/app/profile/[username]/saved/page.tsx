import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ContentGrid from "@/components/content/ContentGrid";
import Link from "next/link";
import { Bookmark } from "lucide-react";

export default async function SavedPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = await createClient();
  const { username } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch bookmarks for this profile and join the related submission
  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(
      `
      submission:submission_id (
        *,
        profiles:user_id (username, display_name, avatar_url),
        submission_tags (
          tags (name, slug)
        )
      )
    `
    )
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const submissions = (bookmarks || [])
    .map((b: any) => b.submission)
    .filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">@{username}'s saved posts</h1>
          <p className="text-gray-600">Bookmarks curated by this user</p>
        </div>
        <Link
          href={`/profile/${username}`}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to profile
        </Link>
      </div>

      {submissions && submissions.length > 0 ? (
        <ContentGrid submissions={submissions} />
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No saved posts yet</p>
        </div>
      )}
    </div>
  );
}


