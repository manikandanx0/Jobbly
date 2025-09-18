-- Jobbly Database Schema
-- This file contains the complete database schema for the Jobbly platform
-- Run this in your Supabase SQL editor to set up the database

-- Schema updates for better role separation and additional features

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

CREATE TRIGGER trigger_update_user_profile_completion
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();