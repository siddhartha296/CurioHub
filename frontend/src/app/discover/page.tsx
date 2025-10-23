import { createClient } from "@/lib/supabase/server";
import ContentGrid from "@/components/content/ContentGrid";
import { AlertCircle } from "lucide-react";

export default async function DiscoverPage() {
  const supabase = createClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select(
      `
      *,
      profiles:user_id (username, display_name, avatar_url),
      submission_tags (
        tags (name, slug)
      )
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discovery Queue
        </h1>
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-900 font-medium">Help curate CurioHub!</p>
            <p className="text-blue-800 text-sm">
              Vote on submissions to help surface the best content. Posts need
              community approval to reach the Elevate feed.
            </p>
          </div>
        </div>
      </div>

      {submissions && submissions.length > 0 ? (
        <ContentGrid submissions={submissions} showVoting={true} />
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">
            No submissions pending review right now.
          </p>
          <p className="text-gray-500 mt-2">Check back soon!</p>
        </div>
      )}
    </div>
  );
}
