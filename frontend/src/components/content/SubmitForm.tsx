"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { SOURCE_TYPES, TAGS } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export default function SubmitForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    source_type: "youtube",
    thumbnail_url: "",
    tags: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: submission, error: submissionError } = await supabase
        .from("submissions")
        .insert({
          user_id: user.id,
          title: formData.title,
          url: formData.url,
          description: formData.description,
          source_type: formData.source_type,
          thumbnail_url: formData.thumbnail_url,
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      if (formData.tags.length > 0 && submission) {
        const tagInserts = formData.tags.map(async (tagName) => {
          const { data: tag } = await supabase
            .from("tags")
            .select("id")
            .eq("slug", tagName)
            .single();

          if (tag) {
            await supabase.from("submission_tags").insert({
              submission_id: submission.id,
              tag_id: tag.id,
            });
          }
        });

        await Promise.all(tagInserts);
      }

      router.push("/discover");
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Give your content a compelling title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL *
        </label>
        <input
          type="url"
          required
          value={formData.url}
          onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="What makes this content special?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source Type *
        </label>
        <select
          value={formData.source_type}
          onChange={(e) =>
            setFormData({ ...formData, source_type: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {SOURCE_TYPES.map((source) => (
            <option key={source.value} value={source.value}>
              {source.icon} {source.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thumbnail URL (optional)
        </label>
        <input
          type="url"
          value={formData.thumbnail_url}
          onChange={(e) =>
            setFormData({ ...formData, thumbnail_url: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.tags.includes(tag)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Content"
        )}
      </button>
    </form>
  );
}
