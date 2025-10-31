// import { createClient } from "@/lib/supabase/server";
import ContentGrid from "@/components/content/ContentGrid";
import SourceFilter from "@/components/filters/SourceFilter";
import TagFilter from "@/components/filters/TagFilter";
import { createClient } from "@/lib/supabase/component";
import React, { Suspense } from "react";

type SearchParams = {
  source?: string | string[];
  tags?: string | string[];
};

const parseSource = (sourceParam: SearchParams["source"]) => {
  if (Array.isArray(sourceParam)) {
    return sourceParam[0] ?? "all";
  }

  return sourceParam ?? "all";
};

const parseTags = (tagsParam: SearchParams["tags"]) => {
  if (Array.isArray(tagsParam)) {
    return tagsParam
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean);
  }

  if (!tagsParam) {
    return [];
  }

  return tagsParam
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

export default async function Home({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
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

  const selectedSource = parseSource(searchParams.source);
  const selectedTags = parseTags(searchParams.tags);

  const filteredSubmissions = (submissions || []).filter((submission) => {
    if (selectedSource !== "all" && submission.source_type !== selectedSource) {
      return false;
    }

    if (selectedTags.length === 0) {
      return true;
    }

    const submissionTagSlugs =
      submission.submission_tags?.map((entry) => entry.tags.slug) ?? [];

    return selectedTags.every((tag) => submissionTagSlugs.includes(tag));
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to CurioHub
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover the internet&apos;s most inspiring, educational, and mentally
          enriching content. Curated by a community that values growth and
          curiosity.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 space-y-6">
          <Suspense fallback={<div>Loading filters...</div>}>
            {" "}
            {/* Wrap filters */}
            <SourceFilter />
            <TagFilter />
          </Suspense>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              The Elevate Feed
            </h2>
            <div className="text-sm text-gray-600">
              {filteredSubmissions.length} inspiring posts
            </div>
          </div>
          <ContentGrid submissions={filteredSubmissions} />
        </div>
      </div>
    </div>
  );
}
