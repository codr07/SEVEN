-- ==============================================================================
-- 5EVEN INSTITUTION SUPABASE SCHEMA
-- Auto-generated Initialization Script
-- ==============================================================================
-- Instructions: Copy and paste this script into your Supabase SQL Editor and run it.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------
-- 1. COURSES TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    short_desc TEXT,
    duration TEXT,
    price TEXT,
    link TEXT,
    cover_image TEXT,
    details JSONB, -- Stored as a JSON array of curriculum points
    extra_details JSONB, -- Any additional configuration options
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2. ACADEMICS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS academics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 3. SERVICES TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    price TEXT,
    link TEXT,
    description JSONB, -- Stored as JSON array for bullet points
    cover_image TEXT,
    extra_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 4. FACULTY / STARS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS faculty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    topic TEXT,
    stars TEXT,
    price TEXT,
    link TEXT,
    description TEXT,
    cover_image TEXT,
    extra_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 5. NOTES TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    short_desc TEXT,
    date TEXT,
    link TEXT,
    cover_image TEXT,
    extra_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- These policies allow public READ access and restrict WRITE access to admins only.

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE academics ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- 6. FOUNDERS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS founders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    bio TEXT,
    cover_image TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    extra_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access on courses" ON courses;
CREATE POLICY "Allow public read access on courses" ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on academics" ON academics;
CREATE POLICY "Allow public read access on academics" ON academics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on services" ON services;
CREATE POLICY "Allow public read access on services" ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on faculty" ON faculty;
CREATE POLICY "Allow public read access on faculty" ON faculty FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on notes" ON notes;
CREATE POLICY "Allow public read access on notes" ON notes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on founders" ON founders;
CREATE POLICY "Allow public read access on founders" ON founders FOR SELECT USING (true);

-- To insert data manually, go to the Table Editor in the Supabase Dashboard,
-- or insert programmatic lists through the Supabase JS Client using inserts.

-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
-- PROFILES TABLE MUST BE CREATED FIRST (before is_admin() function)
-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
        username TEXT UNIQUE,
        full_name TEXT,
        avatar_url TEXT,
        cover_url TEXT,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
        education JSONB DEFAULT '[]'::jsonb,
        social_links JSONB DEFAULT '{"linkedin": "", "github": "", "linktree": ""}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Ensure role column exists and has correct constraint
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'student'));

-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
-- STUDENT SUBMISSIONS TABLE
-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
CREATE TABLE IF NOT EXISTS student_submissions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        submission_type TEXT NOT NULL CHECK (submission_type IN ('project', 'research_paper')),
        summary TEXT NOT NULL,
        content_url TEXT,
        cover_image TEXT,
        moderation_status TEXT NOT NULL DEFAULT 'on_hold' CHECK (moderation_status IN ('on_hold', 'pushed', 'unpushed')),
        is_pushed BOOLEAN NOT NULL DEFAULT false,
        admin_note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE student_submissions ENABLE ROW LEVEL SECURITY;

-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
-- AUTHORIZATION HELPERS (NOW SAFE TO CREATE - profiles.role ALREADY EXISTS)
-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role = 'admin'
    );
$$ LANGUAGE sql STABLE;

-- -------------------------------------------------------------
-- ADMIN-ONLY WRITE POLICIES FOR CORE SITE TABLES
-- -------------------------------------------------------------

-- Courses
DROP POLICY IF EXISTS "Allow authenticated insert on courses" ON courses;
DROP POLICY IF EXISTS "Allow authenticated update on courses" ON courses;
DROP POLICY IF EXISTS "Allow authenticated delete on courses" ON courses;
DROP POLICY IF EXISTS "Allow admin insert on courses" ON courses;
DROP POLICY IF EXISTS "Allow admin update on courses" ON courses;
DROP POLICY IF EXISTS "Allow admin delete on courses" ON courses;
CREATE POLICY "Allow admin insert on courses" ON courses FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin update on courses" ON courses FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin delete on courses" ON courses FOR DELETE USING (public.is_admin());

-- Academics
DROP POLICY IF EXISTS "Allow authenticated insert on academics" ON academics;
DROP POLICY IF EXISTS "Allow authenticated update on academics" ON academics;
DROP POLICY IF EXISTS "Allow authenticated delete on academics" ON academics;
DROP POLICY IF EXISTS "Allow admin insert on academics" ON academics;
DROP POLICY IF EXISTS "Allow admin update on academics" ON academics;
DROP POLICY IF EXISTS "Allow admin delete on academics" ON academics;
CREATE POLICY "Allow admin insert on academics" ON academics FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin update on academics" ON academics FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin delete on academics" ON academics FOR DELETE USING (public.is_admin());

-- Services
DROP POLICY IF EXISTS "Allow authenticated insert on services" ON services;
DROP POLICY IF EXISTS "Allow authenticated update on services" ON services;
DROP POLICY IF EXISTS "Allow authenticated delete on services" ON services;
DROP POLICY IF EXISTS "Allow admin insert on services" ON services;
DROP POLICY IF EXISTS "Allow admin update on services" ON services;
DROP POLICY IF EXISTS "Allow admin delete on services" ON services;
CREATE POLICY "Allow admin insert on services" ON services FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin update on services" ON services FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin delete on services" ON services FOR DELETE USING (public.is_admin());

-- Faculty
DROP POLICY IF EXISTS "Allow authenticated insert on faculty" ON faculty;
DROP POLICY IF EXISTS "Allow authenticated update on faculty" ON faculty;
DROP POLICY IF EXISTS "Allow authenticated delete on faculty" ON faculty;
DROP POLICY IF EXISTS "Allow admin insert on faculty" ON faculty;
DROP POLICY IF EXISTS "Allow admin update on faculty" ON faculty;
DROP POLICY IF EXISTS "Allow admin delete on faculty" ON faculty;
CREATE POLICY "Allow admin insert on faculty" ON faculty FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin update on faculty" ON faculty FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin delete on faculty" ON faculty FOR DELETE USING (public.is_admin());

-- Notes
DROP POLICY IF EXISTS "Allow authenticated insert on notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated update on notes" ON notes;
DROP POLICY IF EXISTS "Allow authenticated delete on notes" ON notes;
DROP POLICY IF EXISTS "Allow admin insert on notes" ON notes;
DROP POLICY IF EXISTS "Allow admin update on notes" ON notes;
DROP POLICY IF EXISTS "Allow admin delete on notes" ON notes;
CREATE POLICY "Allow admin insert on notes" ON notes FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin update on notes" ON notes FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin delete on notes" ON notes FOR DELETE USING (public.is_admin());

-- Founders
DROP POLICY IF EXISTS "Allow authenticated insert on founders" ON founders;
DROP POLICY IF EXISTS "Allow authenticated update on founders" ON founders;
DROP POLICY IF EXISTS "Allow authenticated delete on founders" ON founders;
DROP POLICY IF EXISTS "Allow admin insert on founders" ON founders;
DROP POLICY IF EXISTS "Allow admin update on founders" ON founders;
DROP POLICY IF EXISTS "Allow admin delete on founders" ON founders;
CREATE POLICY "Allow admin insert on founders" ON founders FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin update on founders" ON founders FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Allow admin delete on founders" ON founders FOR DELETE USING (public.is_admin());

-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
-- PROFILES RLS POLICIES
-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users and admins can insert profiles" ON profiles;
CREATE POLICY "Users and admins can insert profiles"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users and admins can update profiles" ON profiles;
CREATE POLICY "Users and admins can update profiles"
ON profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles" ON profiles FOR DELETE USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.prevent_non_admin_role_change()
RETURNS trigger AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can change user roles';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_non_admin_role_change ON public.profiles;
CREATE TRIGGER trg_prevent_non_admin_role_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_non_admin_role_change();

-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
-- STUDENT SUBMISSIONS RLS POLICIES
-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
DROP POLICY IF EXISTS "Public can read pushed submissions" ON student_submissions;
CREATE POLICY "Public can read pushed submissions"
ON student_submissions FOR SELECT
USING (is_pushed = true OR auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Students can create own submissions" ON student_submissions;
CREATE POLICY "Students can create own submissions"
ON student_submissions FOR INSERT
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Students and admins can update submissions" ON student_submissions;
CREATE POLICY "Students and admins can update submissions"
ON student_submissions FOR UPDATE
USING (auth.uid() = author_id OR public.is_admin())
WITH CHECK (auth.uid() = author_id OR public.is_admin());

DROP POLICY IF EXISTS "Students and admins can delete submissions" ON student_submissions;
CREATE POLICY "Students and admins can delete submissions"
ON student_submissions FOR DELETE
USING (auth.uid() = author_id OR public.is_admin());

-- -------------------------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url, phone, social_links, role)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'phone',
        COALESCE((new.raw_user_meta_data->'social_links')::jsonb, '{"linkedin": "", "github": "", "linktree": ""}'::jsonb),
        'student'
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        phone = EXCLUDED.phone,
        social_links = EXCLUDED.social_links,
        updated_at = NOW();

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- To enable automatic profile creation:
-- CREATE TRIGGER ON_AUTH_USER_CREATED AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();