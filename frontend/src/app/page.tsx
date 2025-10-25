// import { createClient } from "@/lib/supabase/server";
import ContentGrid from "@/components/content/ContentGrid";
import SourceFilter from "@/components/filters/SourceFilter";
import TagFilter from "@/components/filters/TagFilter";
import { createClient } from "@/lib/supabase/component";

export default async function Home() {
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
    .eq("status", "approved")
    .order("upvotes", { ascending: false })
    .limit(20);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to CurioHub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover the internet's most inspiring, educational, and mentally
          enriching content. Curated by a community that values growth and
          curiosity.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 space-y-6">
          <SourceFilter />
          <TagFilter />
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              The Elevate Feed
            </h2>
            <div className="text-sm text-gray-600">
              {submissions?.length || 0} inspiring posts
            </div>
          </div>
          <ContentGrid submissions={submissions || []} />
        </div>
      </div>
    </div>
  );
}
