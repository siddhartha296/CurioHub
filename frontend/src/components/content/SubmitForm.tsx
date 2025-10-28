"use client";

import {
  useState,
  useEffect, // Import useEffect
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/component";
import { SOURCE_TYPES, TAGS } from "@/lib/constants";
import { Loader2 } from "lucide-react";

// Function to extract YouTube Video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp =
    /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function SubmitForm() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    description: "",
    source_type: "youtube", // Default to youtube
    thumbnail_url: "",
    tags: [] as string[],
  });

  // --- START: Added useEffect for thumbnail fetching ---
  useEffect(() => {
    // Only attempt to fetch if the source type is YouTube
    if (formData.source_type === "youtube") {
      const videoId = getYouTubeVideoId(formData.url);
      if (videoId) {
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        // Only update if the thumbnail URL is different to avoid infinite loops
        if (thumbnailUrl !== formData.thumbnail_url) {
          setFormData((prev) => ({ ...prev, thumbnail_url: thumbnailUrl }));
        }
      } else {
        // If URL is not a valid YouTube URL (or empty), clear the thumbnail
        // Only clear if it's not already empty
        if (formData.thumbnail_url !== "") {
          setFormData((prev) => ({ ...prev, thumbnail_url: "" }));
        }
      }
    } else {
      // If source type changes away from YouTube, clear the thumbnail
      if (formData.thumbnail_url !== "") {
        setFormData((prev) => ({ ...prev, thumbnail_url: "" }));
      }
    }
    // Depend on URL and source_type changes
  }, [formData.url, formData.source_type, formData.thumbnail_url]);
  // --- END: Added useEffect for thumbnail fetching ---

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
          thumbnail_url: formData.thumbnail_url, // Use the potentially auto-filled URL
        })
        .select()
        .single();

      if (submissionError) throw submissionError;

      // ... (rest of the handleSubmit function remains the same)
      if (formData.tags.length > 0 && submission) {
        const tagInserts = formData.tags.map(async (tagName) => {
          // Find tag ID based on slug/name
          const { data: tag } = await supabase
            .from("tags")
            .select("id")
            .eq("slug", tagName) // Assuming tags constant matches slugs
            .single();

          if (tag) {
            await supabase.from("submission_tags").insert({
              submission_id: submission.id,
              tag_id: tag.id,
            });
          } else {
            console.warn(`Tag with slug "${tagName}" not found.`);
            // Optionally, create the tag if it doesn't exist
          }
        });
        await Promise.all(tagInserts);
      }
      router.push("/discover");
      router.refresh(); // Refresh to ensure data updates if redirected immediately
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Title *
        </label>
        <input
          id="title"
          name="title" // Add name attribute
          type="text"
          required
          value={formData.title}
          onChange={handleInputChange} // Use generic handler
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Give your content a compelling title"
        />
      </div>

      <div>
        <label
          htmlFor="url"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          URL *
        </label>
        <input
          id="url"
          name="url" // Add name attribute
          type="url"
          required
          value={formData.url}
          onChange={handleInputChange} // Use generic handler
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description" // Add name attribute
          value={formData.description}
          onChange={handleInputChange} // Use generic handler
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="What makes this content special?"
        />
      </div>

      <div>
        <label
          htmlFor="source_type"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Source Type *
        </label>
        <select
          id="source_type"
          name="source_type" // Add name attribute
          value={formData.source_type}
          onChange={handleInputChange} // Use generic handler
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
        <label
          htmlFor="thumbnail_url"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Thumbnail URL (optional - auto-filled for YouTube)
        </label>
        <input
          id="thumbnail_url"
          name="thumbnail_url" // Add name attribute
          type="url"
          value={formData.thumbnail_url}
          onChange={handleInputChange} // Use generic handler
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          placeholder="https://..."
          // Optionally disable if auto-filled and source is YouTube
          disabled={
            formData.source_type === "youtube" &&
            getYouTubeVideoId(formData.url) !== null
          }
        />
        {/* Display the thumbnail preview */}
        {formData.thumbnail_url && (
          <img
            src={formData.thumbnail_url}
            alt="Thumbnail Preview"
            className="mt-2 rounded max-h-40 object-contain"
          />
        )}
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
