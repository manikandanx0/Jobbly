# Database Schema Update

This document outlines the database schema changes and API updates for the Jobbly platform.

## New Database Schema

### Updated Tables

#### `users` table
Added new fields for better role separation:

**Talent-specific fields:**
- `resume_url` - URL to user's resume
- `cover_letter_template` - Default cover letter template
- `job_preferences` - JSON object with job preferences
- `notification_preferences` - JSON object with notification settings
- `profile_completion_percentage` - Calculated profile completion score

**Recruiter-specific fields:**
- `company_name` - Company name
- `company_website` - Company website URL
- `company_size` - Company size (startup, small, medium, large, enterprise)
- `company_industry` - Industry sector
- `company_logo_url` - Company logo URL
- `company_description` - Company description
- `recruiter_position` - Recruiter's position in company
- `verified_recruiter` - Boolean for recruiter verification status

Additional cross-cutting fields:
- `professional_summary_translations` - JSON translations of the summary
- `preferred_language` - User's preferred UI/content language (default `en`)
- `professional_summary_source_language` - Detected language of summary
- `password_hash` - Optional fallback auth hash for dev environments
- `full_name_translations` - JSON translations of the full name
- `full_name_source_language` - Detected language of full name

### New Tables

#### `applications` table
Tracks job and internship applications:
- `id` - Primary key
- `talent_id` - Foreign key to users table
- `job_id` - Foreign key to freelance_jobs table (optional)
- `internship_id` - Foreign key to internships table (optional)
- `job_type` - Either 'internship' or 'freelance'
- `status` - Application status (pending, reviewing, shortlisted, rejected, accepted, withdrawn)
- `cover_letter` - Cover letter text
- `resume_url` - Resume URL
- `portfolio_url` - Portfolio URL
- `application_data` - Additional application data (JSON)
- `applied_at` - Application timestamp
- `updated_at` - Last update timestamp
- `recruiter_notes` - Internal recruiter notes
- `interview_scheduled_at` - Interview scheduling

#### `saved_jobs` table
Tracks saved/bookmarked jobs:
- `id` - Primary key
- `talent_id` - Foreign key to users table
- `job_id` - Foreign key to freelance_jobs table (optional)
- `internship_id` - Foreign key to internships table (optional)
- `job_type` - Either 'internship' or 'freelance'
- `saved_at` - Save timestamp
- `notes` - User notes about the saved job

#### `freelance_jobs` table
Recruiter-created freelance gigs with multilingual fields and rich constraints.

#### `internships` table
Recruiter-created internships with multilingual fields and typical filters.

#### `portfolios` table
Talent-owned portfolio data (now references `users.id` instead of a separate `talents` table).

#### `translation_logs` table
Audit trail of translations performed.

#### `company_profiles` table
Detailed company information for recruiters:
- `id` - Primary key
- `recruiter_id` - Foreign key to users table
- `company_name` - Company name
- `company_logo_url` - Company logo URL
- `company_website` - Company website
- `company_size` - Company size
- `industry` - Industry sector
- `founded_year` - Year company was founded
- `headquarters` - Company headquarters location
- `description` - Company description
- `mission_statement` - Company mission statement
- `company_culture` - Company culture description
- `benefits` - Array of company benefits
- `social_media_links` - Social media links (JSON)
- `verification_status` - Verification status (unverified, pending, verified, rejected)
- `verification_documents` - Array of verification documents
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## API Changes

### Applications API (`/api/applications`)

**POST** - Create new application
```json
{
  "user_id": "uuid",
  "internship_id": "uuid", // or job_id for freelance
  "job_type": "internship", // or "freelance"
  "cover_letter": "string",
  "resume_url": "string",
  "portfolio_url": "string"
}
```

**GET** - Get applications
- Query params: `userId`, `jobType`, `status`

**DELETE** - Remove application
- Query params: `userId`, `internshipId` or `jobId`

### Saved Jobs API (`/api/saved-jobs`)

**POST** - Save a job
```json
{
  "user_id": "uuid",
  "internship_id": "uuid", // or job_id for freelance
  "job_type": "internship", // or "freelance"
  "notes": "string"
}
```

**GET** - Get saved jobs
- Query params: `userId`, `jobType`

**DELETE** - Remove saved job
- Query params: `userId`, `internshipId` or `jobId`

**PUT** - Update saved job (e.g., notes)
- Path param: `saved_job_id`
- Body: `{"notes": "string"}`

## Database Functions

### Profile Completion Calculation

- `calculate_talent_profile_completion(user_id)` - Returns 0-100 score for talent profiles
- `calculate_recruiter_profile_completion(user_id)` - Returns 0-100 score for recruiter profiles

### Triggers

- `trigger_update_user_profile_completion` - Automatically updates profile completion percentage when user data changes

## Row Level Security (RLS)

All tables have RLS policies for role-based access control:
- Users can only access their own data
- Recruiters can view applications for their posted jobs
- Public access to portfolios (read-only)

Note: All new tables (`freelance_jobs`, `internships`, `portfolios`, `translation_logs`) should have RLS rules added as needed. The base schema enables RLS on `users`, `applications`, `saved_jobs`, `company_profiles`, and `portfolios`.

## Migration Instructions

1. **Run the SQL schema file** in your Supabase SQL editor
   - The schema uses `DO $$` blocks to prevent errors if policies already exist
   - All constraints and indexes are created with `IF NOT EXISTS` for safety
   - RLS policies are created conditionally to avoid conflicts

2. **Update your backend code** to use the new models
   - New user fields for talent/recruiter roles
   - Applications and saved jobs APIs
   - Enhanced translation support

3. **Update frontend** to use the new API endpoints
   - Applications tracking
   - Saved jobs/bookmarks
   - Enhanced user profiles

4. **Test the new functionality**
   - Translation system for Indian languages
   - Role-based access control
   - Profile completion tracking

## Key Improvements in This Version

- **Safe RLS Policy Creation**: Uses `DO $$` blocks to check if policies exist before creating
- **Fixed Data Types**: `benefits` column uses `text[]` instead of `ARRAY`
- **Better Error Handling**: All schema changes are idempotent and safe to run multiple times
- **Enhanced Translation**: Full support for Hindi, Telugu, Tamil, Malayalam, and Bengali

## Translation Support

The schema maintains support for multilingual content with:
- `*_source_language` fields for detected language
- `*_translations` fields for translated content (JSON)
- Automatic translation during user creation and updates
