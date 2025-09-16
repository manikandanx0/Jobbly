@echo off
SET BASE_DIR=%cd%

echo Creating Jobbly project structure in %BASE_DIR% ...

:: Backend folders
mkdir %BASE_DIR%\backend\app\api
mkdir %BASE_DIR%\backend\app\core
mkdir %BASE_DIR%\backend\app\models
mkdir %BASE_DIR%\backend\tests

:: ML folders
mkdir %BASE_DIR%\ml\embeddings\model
mkdir %BASE_DIR%\ml\resume\model
mkdir %BASE_DIR%\ml\recommend\experiments
mkdir %BASE_DIR%\ml\notebooks

:: Voice folders
mkdir %BASE_DIR%\voice\wakeword
mkdir %BASE_DIR%\voice\asr
mkdir %BASE_DIR%\voice\tts

:: Frontend folders
mkdir %BASE_DIR%\frontend\components
mkdir %BASE_DIR%\frontend\pages
mkdir %BASE_DIR%\frontend\public
mkdir %BASE_DIR%\frontend\styles
mkdir %BASE_DIR%\frontend\utils
mkdir %BASE_DIR%\frontend\i18n

:: Infra folders
mkdir %BASE_DIR%\infra\docker
mkdir %BASE_DIR%\infra\k8s
mkdir %BASE_DIR%\infra\terraform

:: Data folders
mkdir %BASE_DIR%\data\resumes
mkdir %BASE_DIR%\data\internships
mkdir %BASE_DIR%\data\processed

:: Misc folders
mkdir %BASE_DIR%\scripts
mkdir %BASE_DIR%\docs

:: Create placeholder files
echo # Jobbly – AI Internship Recommender > %BASE_DIR%\README.md
echo MIT License > %BASE_DIR%\LICENSE
echo DATABASE_URL=postgres://user:pass@localhost:5432/jobbly > %BASE_DIR%\.env.example

echo flask> %BASE_DIR%\backend\requirements.txt
echo fastapi>> %BASE_DIR%\backend\requirements.txt
echo sqlalchemy>> %BASE_DIR%\backend\requirements.txt
echo psycopg2>> %BASE_DIR%\backend\requirements.txt
echo sentence-transformers>> %BASE_DIR%\backend\requirements.txt
echo spacy>> %BASE_DIR%\backend\requirements.txt
echo faiss-cpu>> %BASE_DIR%\backend\requirements.txt

echo from app import app > %BASE_DIR%\backend\wsgi.py
echo. >> %BASE_DIR%\backend\wsgi.py
echo if __name__ == '__main__': >> %BASE_DIR%\backend\wsgi.py
echo ^    app.run() >> %BASE_DIR%\backend\wsgi.py

echo { > %BASE_DIR%\frontend\package.json
echo   "name": "jobbly-frontend", >> %BASE_DIR%\frontend\package.json
echo   "version": "1.0.0" >> %BASE_DIR%\frontend\package.json
echo } >> %BASE_DIR%\frontend\package.json

echo FROM python:3.10-slim > %BASE_DIR%\infra\docker\backend.Dockerfile
echo WORKDIR /app >> %BASE_DIR%\infra\docker\backend.Dockerfile
echo COPY backend/requirements.txt . >> %BASE_DIR%\infra\docker\backend.Dockerfile
echo RUN pip install -r requirements.txt >> %BASE_DIR%\infra\docker\backend.Dockerfile
echo COPY backend /app >> %BASE_DIR%\infra\docker\backend.Dockerfile
echo CMD ["python","wsgi.py"] >> %BASE_DIR%\infra\docker\backend.Dockerfile

echo FROM node:18-alpine > %BASE_DIR%\infra\docker\frontend.Dockerfile
echo WORKDIR /app >> %BASE_DIR%\infra\docker\frontend.Dockerfile
echo COPY frontend/package.json . >> %BASE_DIR%\infra\docker\frontend.Dockerfile
echo RUN npm install >> %BASE_DIR%\infra\docker\frontend.Dockerfile
echo COPY frontend /app >> %BASE_DIR%\infra\docker\frontend.Dockerfile
echo CMD ["npm","run","dev"] >> %BASE_DIR%\infra\docker\frontend.Dockerfile

echo version: '3' > %BASE_DIR%\infra\docker-compose.yml
echo services: >> %BASE_DIR%\infra\docker-compose.yml
echo   backend: >> %BASE_DIR%\infra\docker-compose.yml
echo     build: ./docker/backend.Dockerfile >> %BASE_DIR%\infra\docker-compose.yml
echo   frontend: >> %BASE_DIR%\infra\docker-compose.yml
echo     build: ./docker/frontend.Dockerfile >> %BASE_DIR%\infra\docker-compose.yml

echo Jobbly structure created successfully!
pause
