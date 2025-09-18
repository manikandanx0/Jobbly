## Backend Server Routes (Flask)

- GET /
- GET /health

- POST /api/users/signup
- POST /api/users/login
- GET /api/users/me
- GET /api/users/<user_id>
- PUT /api/users/<user_id>
- GET /api/users/talents
- GET /api/users/search

- GET /api/multilingual/languages
- POST /api/multilingual/detect
- POST /api/multilingual/translate
- POST /api/multilingual/batch-translate
- GET /api/multilingual/applications
- POST /api/multilingual/applications
- DELETE /api/multilingual/applications

- GET /api/saved-jobs/
- POST /api/saved-jobs/
- DELETE /api/saved-jobs/
- PUT /api/saved-jobs/<saved_job_id>

Notes:
- Endpoints requiring authentication use Bearer JWT in Authorization header.

