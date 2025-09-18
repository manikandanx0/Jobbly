# Jobbly Routes and APIs

## Backend (Flask) APIs

- `GET /health` — API health
- `GET /` — API root info

- `POST /api/users/signup` — Signup (body: name, email, password, role)
- `POST /api/users/login` — Login (body: email, password)
- `GET /api/users/me` — Current user (JWT required)
- `GET /api/users/<user_id>` — Get user by id
- `PUT /api/users/<user_id>` — Update user (JWT/role dependent)
- `GET /api/users/talents` — List talents with filters
- `GET /api/users/search` — Search users

- `GET /api/multilingual/languages` — Supported languages
- `POST /api/multilingual/detect` — Detect language
- `POST /api/multilingual/translate` — Translate
- `POST /api/multilingual/batch-translate` — Batch translate
- `GET|POST|DELETE /api/multilingual/applications` — Applications (JWT required for POST/DELETE/GET)

- `GET /api/saved-jobs/` — List saved jobs (require_user_id)
- `POST /api/saved-jobs/` — Save job (require_user_id)
- `DELETE /api/saved-jobs/` — Unsave job (require_user_id)
- `PUT /api/saved-jobs/<saved_job_id>` — Update saved job (login_required)

## Frontend (Next.js) API routes (proxies & utilities)

- `POST /api/users/signup` — Proxies to Flask signup
- `POST /api/users/login` — Proxies to Flask login and sets auth cookie
- `POST /api/auth/login` — Local demo auth (legacy)
- `POST /api/auth/logout` — Clear cookie (legacy)
- `GET /api/health` — Proxy health
- `GET /api/applications` — Proxy applications
- `POST /api/applications` — Proxy applications create
- `GET /api/internships` — Proxy internships
- `GET /api/jobs/freelance` — Proxy freelance jobs
- `GET /api/portfolio` — Proxy portfolio
- `GET /api/progress` — Proxy progress
- `GET /api/recruiter` — Proxy recruiter
- `POST /api/resume-analyze` — Resume analyzer
- `GET /api/suggestions` — Suggestions
- `GET /api/time` — Server time
- `POST /api/track` — Tracking
- `POST /api/voice-notes` — Voice notes
- `POST /api/bookmarks` — Bookmarks

## Frontend Pages (Next.js) routes

Public:
- `/` — Home
- `/404` — Not Found
- `/internships` — Internships list
- `/internships/[id]` — Internship details
- `/freelance` — Freelance jobs
- `/u/[username]` — Public profile

Auth:
- `/auth/signup` — Unified signup form (redirects on success)
- `/auth/login` — Unified login form (redirects on success)
- `/auth/talent` — Talent auth page (signup/login)
- `/auth/recruit` — Recruiter auth page (signup/login)
- `/auth/roles` — Role selection

Protected:
- `/talent/dashboard` — Talent dashboard
- `/recruiter/dashboard` — Recruiter dashboard
- `/recruiter/profile` — Recruiter profile
- `/applications` — Applications
- `/portfolio` — Portfolio

Notes:
- Middleware protects protected routes via `auth_token` cookie and redirects unauthenticated users to `/auth/talent`.
- After successful login/signup the client redirects to `/` and middleware keeps user on protected pages.
