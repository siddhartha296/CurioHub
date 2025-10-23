import ContentCard from "./ContentCard";

interface ContentGridProps {
  submissions: any[];
  showVoting?: boolean;
}

export default function ContentGrid({
  submissions,
  showVoting = false,
}: ContentGridProps) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-lg">No content found</p>
        <p className="text-gray-500 mt-2">
          Be the first to submit something inspiring!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {submissions.map((submission) => (
        <ContentCard
          key={submission.id}
          submission={submission}
          showVoting={showVoting}
        />
      ))}
    </div>
  );
}
