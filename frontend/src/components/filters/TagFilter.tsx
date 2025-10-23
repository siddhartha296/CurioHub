"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TAGS } from "@/lib/constants";
import { Tag } from "lucide-react";

export default function TagFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.get("tags")?.split(",").filter(Boolean) || []
  );

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);

    const params = new URLSearchParams(searchParams.toString());

    if (newTags.length === 0) {
      params.delete("tags");
    } else {
      params.set("tags", newTags.join(","));
    }

    router.push(`?${params.toString()}`);
  };

  const clearTags = () => {
    setSelectedTags([]);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tags");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filter by Tags</h3>
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={clearTags}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagToggle(tag)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              selectedTags.includes(tag)
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {selectedTags.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""}{" "}
            selected
          </p>
        </div>
      )}
    </div>
  );
}
