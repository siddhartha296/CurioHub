"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SOURCE_TYPES } from "@/lib/constants";
import { Filter } from "lucide-react";

export default function SourceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSource, setSelectedSource] = useState(
    searchParams.get("source") || "all"
  );

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    const params = new URLSearchParams(searchParams.toString());

    if (source === "all") {
      params.delete("source");
    } else {
      params.set("source", source);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filter by Source</h3>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => handleSourceChange("all")}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            selectedSource === "all"
              ? "bg-blue-50 text-blue-700 font-medium"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          🌐 All Sources
        </button>

        {SOURCE_TYPES.map((source) => (
          <button
            key={source.value}
            onClick={() => handleSourceChange(source.value)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedSource === source.value
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            {source.icon} {source.label}
          </button>
        ))}
      </div>
    </div>
  );
}
