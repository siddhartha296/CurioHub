export const SOURCE_TYPES = [
  { value: "youtube", label: "YouTube", icon: "📺" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "reddit", label: "Reddit", icon: "🔗" },
  { value: "twitter", label: "X (Twitter)", icon: "🐦" },
  { value: "article", label: "Article", icon: "📰" },
] as const;

export const TAGS = [
  "science",
  "discipline",
  "running",
  "philosophy",
  "art",
  "tech",
  "mental-health",
  "productivity",
  "psychology",
  "fitness",
  "creativity",
  "learning",
] as const;

export const SUBMISSION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
