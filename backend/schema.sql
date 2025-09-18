-- This file contains the complete database schema for the Jobbly platform
-- Run this in your Supabase SQL editor to set up the database

-- Schema updates for better role separation and additional features

-- Ensure required extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Base users table (if it doesn't already exist)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_id uuid,
  role text NOT NULL DEFAULT 'talent',
  full_name text,
  email text NOT NULL UNIQUE,
  phone text,
  location text,
  professional_summary text,
  experience_level text,
  current_position text,
  years_of_experience integer DEFAULT 0,
  hourly_rate numeric,
  availability text DEFAULT 'full-time',
  skills text[] DEFAULT '{}',
  preferred_work_type text[] DEFAULT ARRAY['remote'],
  education jsonb DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  linkedin_url text,
  github_url text,
  portfolio_website text,
  preferred_language text DEFAULT 'en',
  password_hash text,
  profile_picture_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Add recruiter-specific fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_website text,
ADD COLUMN IF NOT EXISTS company_size text CHECK (company_size = ANY (ARRAY['startup'::text, 'small'::text, 'medium'::text, 'large'::text, 'enterprise'::text])),
ADD COLUMN IF NOT EXISTS company_industry text,
ADD COLUMN IF NOT EXISTS company_logo_url text,
ADD COLUMN IF NOT EXISTS company_description text,
ADD COLUMN IF NOT EXISTS recruiter_position text,
ADD COLUMN IF NOT EXISTS verified_recruiter boolean DEFAULT false;

-- Add talent-specific fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS resume_url text,
ADD COLUMN IF NOT EXISTS cover_letter_template text,
ADD COLUMN IF NOT EXISTS job_preferences jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{"email": true, "push": true}',
ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0;

-- Add multilingual and auth-fallback fields to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS professional_summary_translations jsonb,
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'en',
ADD COLUMN IF NOT EXISTS professional_summary_source_language text,
ADD COLUMN IF NOT EXISTS password_hash text;

-- Name multilingual fields used at signup
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS full_name_translations jsonb,
ADD COLUMN IF NOT EXISTS full_name_source_language text;

-- Create applications table to track job/internship applications
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  talent_id uuid NOT NULL,
  job_id uuid,
  internship_id uuid,
  job_type text NOT NULL CHECK (job_type = ANY (ARRAY['internship'::text, 'freelance'::text])),
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'shortlisted'::text, 'rejected'::text, 'accepted'::text, 'withdrawn'::text])),
  cover_letter text,
  resume_url text,
  portfolio_url text,
  application_data jsonb DEFAULT '{}',
  applied_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  recruiter_notes text,
  interview_scheduled_at timestamp with time zone,
  
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.freelance_jobs(id) ON DELETE CASCADE,
  CONSTRAINT applications_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.internships(id) ON DELETE CASCADE,
  
  -- Ensure application is for either job or internship, not both
  CONSTRAINT applications_job_or_internship_check CHECK (
    (job_id IS NOT NULL AND internship_id IS NULL) OR 
    (job_id IS NULL AND internship_id IS NOT NULL)
  ),
  
  -- Prevent duplicate applications
  CONSTRAINT unique_talent_job_application UNIQUE (talent_id, job_id),
  CONSTRAINT unique_talent_internship_application UNIQUE (talent_id, internship_id)
);

-- Create saved_jobs table for bookmarking functionality
CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  talent_id uuid NOT NULL,
  job_id uuid,
  internship_id uuid,
  job_type text NOT NULL CHECK (job_type = ANY (ARRAY['internship'::text, 'freelance'::text])),
  saved_at timestamp with time zone DEFAULT now(),
  notes text,
  
  CONSTRAINT saved_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT saved_jobs_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT saved_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.freelance_jobs(id) ON DELETE CASCADE,
  CONSTRAINT saved_jobs_internship_id_fkey FOREIGN KEY (internship_id) REFERENCES public.internships(id) ON DELETE CASCADE,
  
  -- Ensure saved item is for either job or internship, not both
  CONSTRAINT saved_jobs_job_or_internship_check CHECK (
    (job_id IS NOT NULL AND internship_id IS NULL) OR 
    (job_id IS NULL AND internship_id IS NOT NULL)
  ),
  
  -- Prevent duplicate saves
  CONSTRAINT unique_talent_saved_job UNIQUE (talent_id, job_id),
  CONSTRAINT unique_talent_saved_internship UNIQUE (talent_id, internship_id)
);

-- Create company_profiles table for detailed recruiter company info
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL UNIQUE,
  company_name text NOT NULL,
  company_logo_url text,
  company_website text,
  company_size text CHECK (company_size = ANY (ARRAY['startup'::text, 'small'::text, 'medium'::text, 'large'::text, 'enterprise'::text])),
  industry text,
  founded_year integer,
  headquarters text,
  description text,
  mission_statement text,
  company_culture text,
  benefits text[],
  social_media_links jsonb DEFAULT '{}',
  verification_status text DEFAULT 'unverified' CHECK (verification_status = ANY (ARRAY['unverified'::text, 'pending'::text, 'verified'::text, 'rejected'::text])),
  verification_documents text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT company_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT company_profiles_recruiter_id_fkey FOREIGN KEY (recruiter_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create freelance_jobs table (recruiter-owned gigs)
CREATE TABLE IF NOT EXISTS public.freelance_jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recruiter_id uuid,
  title text NOT NULL,
  client_company text,
  description text NOT NULL,
  project_scope text NOT NULL CHECK (project_scope = ANY (ARRAY['small'::text, 'medium'::text, 'large'::text])),
  deliverables text[],
  budget_type text NOT NULL CHECK (budget_type = ANY (ARRAY['fixed'::text, 'hourly'::text])),
  budget_min numeric,
  budget_max numeric,
  estimated_hours integer,
  deadline timestamp with time zone,
  project_duration text,
  skills_required text[] NOT NULL,
  experience_level text DEFAULT 'any'::text CHECK (experience_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'expert'::text, 'any'::text])),
  portfolio_required boolean DEFAULT false,
  location text,
  work_type text DEFAULT 'remote'::text CHECK (work_type = ANY (ARRAY['remote'::text, 'hybrid'::text, 'onsite'::text])),
  communication_preference text[],
  category text NOT NULL,
  subcategory text,
  application_deadline timestamp with time zone,
  application_process text,
  client_info jsonb,
  project_examples text[],
  special_requirements text,
  status text DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'in-progress'::text, 'completed'::text, 'cancelled'::text])),
  posted_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  title_translations jsonb,
  description_translations jsonb,
  title_source_language text,
  description_source_language text,
  CONSTRAINT freelance_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT freelance_jobs_recruiter_id_fkey FOREIGN KEY (recruiter_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create internships table (recruiter-owned internships)
CREATE TABLE IF NOT EXISTS public.internships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  recruiter_id uuid,
  title text NOT NULL,
  company text NOT NULL,
  company_logo_url text,
  description text NOT NULL,
  responsibilities text[],
  learning_outcomes text[],
  location text,
  work_type text DEFAULT 'onsite'::text CHECK (work_type = ANY (ARRAY['remote'::text, 'hybrid'::text, 'onsite'::text])),
  stipend_min integer,
  stipend_max integer,
  duration_months integer NOT NULL,
  hours_per_week integer DEFAULT 40,
  required_skills text[] NOT NULL,
  preferred_skills text[],
  education_level text CHECK (education_level = ANY (ARRAY['high-school'::text, 'diploma'::text, 'bachelors'::text, 'masters'::text, 'any'::text])),
  experience_required text CHECK (experience_required = ANY (ARRAY['none'::text, '0-1'::text, '1-2'::text, '2+'::text])),
  application_deadline timestamp with time zone,
  start_date timestamp with time zone,
  positions_available integer DEFAULT 1,
  application_process text,
  company_website text,
  company_size text CHECK (company_size = ANY (ARRAY['startup'::text, 'small'::text, 'medium'::text, 'large'::text, 'enterprise'::text])),
  industry text,
  status text DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'closed'::text, 'paused'::text])),
  posted_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  title_translations jsonb,
  description_translations jsonb,
  title_source_language text,
  description_source_language text,
  CONSTRAINT internships_pkey PRIMARY KEY (id),
  CONSTRAINT internships_recruiter_id_fkey FOREIGN KEY (recruiter_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create portfolios table (owned by talents in users table)
CREATE TABLE IF NOT EXISTS public.portfolios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  talent_id uuid,
  bio text,
  professional_headline text,
  projects jsonb,
  work_experience jsonb,
  resume_url text,
  cover_letter_url text,
  project_images jsonb,
  testimonials jsonb,
  achievements text[],
  languages text[],
  updated_at timestamp with time zone DEFAULT now(),
  bio_translations jsonb,
  professional_headline_translations jsonb,
  bio_source_language text,
  professional_headline_source_language text,
  CONSTRAINT portfolios_pkey PRIMARY KEY (id),
  CONSTRAINT portfolios_talent_id_fkey FOREIGN KEY (talent_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create translation_logs table
CREATE TABLE IF NOT EXISTS public.translation_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  content_id uuid NOT NULL,
  source_language text NOT NULL,
  target_language text NOT NULL,
  original_text text NOT NULL,
  translated_text text NOT NULL,
  translation_service text DEFAULT 'deepl'::text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT translation_logs_pkey PRIMARY KEY (id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_applications_talent_id ON public.applications(talent_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_type ON public.applications(job_type);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_talent_id ON public.saved_jobs(talent_id);
CREATE INDEX IF NOT EXISTS idx_freelance_jobs_recruiter_id ON public.freelance_jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_internships_recruiter_id ON public.internships(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_talent_id ON public.portfolios(talent_id);

-- Add RLS policies for role-based access control
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

-- RLS policies for users table (skip if already exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile" ON public.users
          FOR SELECT USING (auth.uid() = auth_id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.users
          FOR UPDATE USING (auth.uid() = auth_id);
    END IF;
END $$;

-- Allow authenticated users to insert their own profile row
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'users' AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON public.users
          FOR INSERT WITH CHECK (
            auth.uid() = auth_id OR auth.uid() = id
          );
    END IF;
END $$;

-- RLS policies for applications table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'applications' AND policyname = 'Talents can view own applications'
    ) THEN
        CREATE POLICY "Talents can view own applications" ON public.applications
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE users.id = applications.talent_id 
              AND users.auth_id = auth.uid()
            )
          );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'applications' AND policyname = 'Recruiters can view applications for their jobs'
    ) THEN
        CREATE POLICY "Recruiters can view applications for their jobs" ON public.applications
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE users.auth_id = auth.uid() 
              AND users.role = 'recruiter'
              AND (
                applications.job_id IN (
                  SELECT id FROM public.freelance_jobs WHERE recruiter_id = users.id
                )
                OR applications.internship_id IN (
                  SELECT id FROM public.internships WHERE recruiter_id = users.id
                )
              )
            )
          );
    END IF;
END $$;

-- RLS policies for saved_jobs table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'saved_jobs' AND policyname = 'Talents can manage own saved jobs'
    ) THEN
        CREATE POLICY "Talents can manage own saved jobs" ON public.saved_jobs
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE users.id = saved_jobs.talent_id 
              AND users.auth_id = auth.uid()
            )
          );
    END IF;
END $$;

-- RLS policies for company_profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'company_profiles' AND policyname = 'Recruiters can manage own company profile'
    ) THEN
        CREATE POLICY "Recruiters can manage own company profile" ON public.company_profiles
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE users.id = company_profiles.recruiter_id 
              AND users.auth_id = auth.uid()
            )
          );
    END IF;
END $$;

-- RLS policies for portfolios table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'portfolios' AND policyname = 'Talents can manage own portfolio'
    ) THEN
        CREATE POLICY "Talents can manage own portfolio" ON public.portfolios
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM public.users 
              WHERE users.id = portfolios.talent_id 
              AND users.auth_id = auth.uid()
            )
          );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'portfolios' AND policyname = 'Public can view portfolios'
    ) THEN
        CREATE POLICY "Public can view portfolios" ON public.portfolios
          FOR SELECT USING (true);
    END IF;
END $$;

-- Ensure old versions are removed to avoid parameter-name conflicts
DROP FUNCTION IF EXISTS public.calculate_talent_profile_completion(uuid);
DROP FUNCTION IF EXISTS public.calculate_recruiter_profile_completion(uuid);

-- Functions to calculate profile completion
CREATE OR REPLACE FUNCTION calculate_talent_profile_completion(user_id uuid)
RETURNS integer AS $$
DECLARE
    completion_score integer := 0;
    user_data record;
    portfolio_data record;
BEGIN
    -- Get user data
    SELECT * INTO user_data FROM public.users WHERE id = user_id;
    
    -- Get portfolio data
    SELECT * INTO portfolio_data FROM public.portfolios WHERE talent_id = user_id;
    
    -- Basic info (40 points)
    IF user_data.full_name IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF user_data.email IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF user_data.phone IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF user_data.location IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF user_data.profile_picture_url IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF user_data.professional_summary IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    
    -- Professional info (30 points)
    IF user_data.skills IS NOT NULL AND array_length(user_data.skills, 1) > 0 THEN completion_score := completion_score + 10; END IF;
    IF user_data.experience_level IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    IF user_data.education IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF user_data.resume_url IS NOT NULL THEN completion_score := completion_score + 5; END IF;
    
    -- Portfolio info (30 points)
    IF portfolio_data.bio IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF portfolio_data.projects IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF portfolio_data.work_experience IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    
    RETURN completion_score;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_recruiter_profile_completion(user_id uuid)
RETURNS integer AS $$
DECLARE
    completion_score integer := 0;
    user_data record;
    company_data record;
BEGIN
    -- Get user data
    SELECT * INTO user_data FROM public.users WHERE id = user_id;
    
    -- Get company data
    SELECT * INTO company_data FROM public.company_profiles WHERE recruiter_id = user_id;
    
    -- Basic info (40 points)
    IF user_data.full_name IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF user_data.email IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF user_data.phone IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF user_data.recruiter_position IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    
    -- Company info (60 points)
    IF company_data.company_name IS NOT NULL THEN completion_score := completion_score + 15; END IF;
    IF company_data.company_logo_url IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF company_data.company_website IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF company_data.industry IS NOT NULL THEN completion_score := completion_score + 10; END IF;
    IF company_data.description IS NOT NULL THEN completion_score := completion_score + 15; END IF;
    
    RETURN completion_score;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update profile completion automatically
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'talent' THEN
        NEW.profile_completion_percentage = calculate_talent_profile_completion(NEW.id);
    ELSIF NEW.role = 'recruiter' THEN
        NEW.profile_completion_percentage = calculate_recruiter_profile_completion(NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger idempotently
DROP TRIGGER IF EXISTS trigger_update_user_profile_completion ON public.users;
CREATE TRIGGER trigger_update_user_profile_completion
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();