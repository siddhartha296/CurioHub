import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/database.types";

export const supabase = createClientComponentClient<Database>();
