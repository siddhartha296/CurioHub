
````markdown
# Contributing to CurioHub

Thanks for your interest in contributing! CurioHub is an open-source, community-curated discovery platform. This guide will help you set up the project locally and get started with development.

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/curiohub.git
cd curiohub/frontend
````

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a file named `.env.local` in the `frontend` directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

* Replace `your_supabase_project_url` and `your_supabase_anon_key` with the values from your Supabase project.
* These keys allow the frontend to interact with your Supabase backend.

---

## 4. Set Up Supabase Database

1. Create a new project in [Supabase](https://supabase.com/).
2. Go to **SQL Editor** and run the following schema to set up the database:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content submissions
CREATE TABLE submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL, -- 'youtube', 'instagram', 'reddit', 'twitter', 'article'
  thumbnail_url TEXT,
  upvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submission tags (many-to-many)
CREATE TABLE submission_tags (
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (submission_id, tag_id)
);

-- User votes
CREATE TABLE votes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, submission_id)
);

-- User bookmarks
CREATE TABLE bookmarks (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, submission_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies (basic - expand as needed)
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Approved submissions are viewable by everyone" 
  ON submissions FOR SELECT USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" 
  ON submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 5. Run the Project

```bash
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000) to see the app.

---

## 6. Contribute

1. Create a new branch for your feature:

```bash
git checkout -b feature/my-awesome-feature
```

2. Make your changes.
3. Commit and push your branch.
4. Open a Pull Request (PR) against the `main` branch.

---

## 7. Guidelines

* Follow **code style** consistent with the existing code.
* Keep **commits small and focused**.
* Make sure your **PR description is clear** about what changes were made.
* Respect the [Code of Conduct](CODE_OF_CONDUCT.md).

---

Thank you for helping build CurioHub! 🚀

```


Do you want me to do that?
```
