-- Bookmarks RLS policies (idempotent-ish)
DO $$
BEGIN
  -- Enable RLS if not already
  BEGIN
    EXECUTE 'ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN others THEN NULL;
  END;

  -- Allow anyone to view bookmarks (needed to render public saved pages)
  BEGIN
    EXECUTE $$CREATE POLICY "Bookmarks are viewable by everyone" ON bookmarks
      FOR SELECT USING (true)$$;
  EXCEPTION WHEN others THEN NULL;
  END;

  -- Only signed-in user can insert their own bookmark
  BEGIN
    EXECUTE $$CREATE POLICY "Users can create own bookmarks" ON bookmarks
      FOR INSERT WITH CHECK (user_id = auth.uid())$$;
  EXCEPTION WHEN others THEN NULL;
  END;

  -- Only owner can delete their bookmark
  BEGIN
    EXECUTE $$CREATE POLICY "Users can delete own bookmarks" ON bookmarks
      FOR DELETE USING (user_id = auth.uid())$$;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_submission_id ON bookmarks(submission_id);


