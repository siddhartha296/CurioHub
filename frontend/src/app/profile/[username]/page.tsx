import { createClient } from "@/lib/supabase/component";
// import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ContentGrid from "@/components/content/ContentGrid";
import { User, Calendar, Bookmark } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const supabase = createClient();
  const { username } = await params;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (!profile) {
    notFound();
  }

  const { data: submissions } = await supabase
    .from("submissions")
    .select(
      `
      *,
      submission_tags (
        tags (name, slug)
      )
    `
    )
    .eq("user_id", profile.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {profile.display_name?.[0] || profile.username[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-gray-600 mb-4">@{profile.username}</p>
            {profile.bio && <p className="text-gray-700 mb-4">{profile.bio}</p>}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Joined{" "}
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {submissions?.length || 0} submissions
              </div>
              <Link
                href={`/profile/${username}/saved`}
                className="text-blue-600 hover:text-blue-700"
              >
                View saved →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* User's Submissions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Submissions</h2>
        {submissions && submissions.length > 0 ? (
          <ContentGrid submissions={submissions} />
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
