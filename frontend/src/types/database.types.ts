export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          bio: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          bio?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          url: string;
          description: string | null;
          source_type: string;
          thumbnail_url: string | null;
          upvotes: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          url: string;
          description?: string | null;
          source_type: string;
          thumbnail_url?: string | null;
          upvotes?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          url?: string;
          description?: string | null;
          source_type?: string;
          thumbnail_url?: string | null;
          upvotes?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
