import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SubmitForm from "@/components/content/SubmitForm";

export default async function SubmitPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/submit");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Submit Content
        </h1>
        <p className="text-gray-600">
          Share inspiring content with the community. Submissions will enter the
          Discovery queue where the community can vote to elevate them to the
          main feed.
        </p>
      </div>

      <SubmitForm />
    </div>
  );
}
