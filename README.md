# Jobbly – AI Internship Recommender

Jobbly is an AI-powered platform that recommends internships to users based on their resumes and preferences.

## Project Structure

-   **backend/**: Python backend (Flask/FastAPI) for API, models, and core logic.
-   **frontend/**: Next.js/React frontend for user interface.
-   **ml/**: Machine learning models and experiments.
-   **data/**: Datasets for internships and resumes.
-   **infra/**: Infrastructure as code (Docker, Kubernetes, Terraform).
-   **voice/**: Voice processing modules (ASR, TTS, wakeword).

## Getting Started

### Prerequisites

-   Docker & Docker Compose
-   Node.js (for frontend development)
-   Python 3.10+ (for backend development)

### Environment Variables

Copy `.env.example` to `.env` and update values as needed:

```sh
cp .env.example .env
```

### Running with Docker Compose

```sh
cd infra
docker-compose up --build
```

-   Backend: http://localhost:5000
-   Frontend: http://localhost:3000

### Manual Setup

#### Backend

```sh
cd backend
pip install -r requirements.txt
python wsgi.py
```

#### Frontend

```sh
cd frontend
npm install
npm run dev
```

## License

MIT License
