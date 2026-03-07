# 🌍 Multilingual Emotion Analysis Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

A full-stack web application that analyzes emotional sentiment from text across multiple languages using AI-powered machine learning models.

## ✨ Features

### 🤖 AI-Powered Emotion Detection
- **Multilingual Support**: Analyze emotions in 100+ languages
- **Real-time Processing**: Instant emotion analysis with AI models
- **Multiple Emotion Categories**: Joy, Sadness, Anger, Fear, Love, Surprise
- **Confidence Scores**: Percentage-based emotion detection accuracy

### 💻 Modern Web Interface
- **Responsive Design**: Mobile-first, fully responsive UI
- **Dark/Light Mode**: Customizable theme preferences
- **Real-time Results**: Instant feedback on text analysis
- **Interactive Visualizations**: Charts and graphs for emotion data
- **Language Detection**: Automatic language identification

### 👤 User Management
- **Secure Authentication**: JWT-based login and registration
- **Personal Dashboard**: User-specific analysis history
- **Profile Management**: Customizable user profiles
- **Data Privacy**: Secure storage of personal analysis data

### 📊 Advanced Analytics
- **Historical Analysis**: Track emotion patterns over time
- **Export Options**: Download analysis as PDF/CSV
- **Comparative Analysis**: Compare multiple text inputs
- **Trend Identification**: Spot emotional trends and patterns

## 🏗️ Architecture

### Frontend (Client-Side)
- **Framework**: Next.js 15 with React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context/Redux
- **Charts**: Recharts/Chart.js

### Backend (Server-Side)
- **API Framework**: FastAPI (Python)
- **Authentication**: JWT with refresh tokens
- **API Documentation**: Auto-generated Swagger/OpenAPI
- **Validation**: Pydantic models

### AI/ML Layer
- **Core Library**: Hugging Face Transformers
- **Models**: Pre-trained multilingual emotion models
- **Language Processing**: spaCy/NLTK for text preprocessing
- **Model Serving**: ONNX Runtime for optimization

### Data Layer
- **Primary Database**: PostgreSQL
- **Caching**: Redis for session and data caching
- **Object Storage**: AWS S3/R2 for file storage
- **ORM**: SQLAlchemy with Alembic migrations

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (optional)
- **CI/CD**: GitHub Actions/GitLab CI
- **Monitoring**: Prometheus & Grafana
- **Logging**: ELK Stack

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+
- PostgreSQL 14+
- Redis 7+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/emotion-analysis-platform.git
   cd emotion-analysis-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Configure your .env file
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Configure your .env.local file
   ```

4. **Database Setup**
   ```bash
   # Start PostgreSQL and Redis
   # Run migrations
   cd backend
   alembic upgrade head
   ```

5. **Run the Application**
   ```bash
   # Start backend (in backend directory)
   uvicorn main:app --reload
   
   # Start frontend (in frontend directory)
   npm run dev
   ```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run individual services
docker-compose up db redis backend frontend
```

## 📁 Project Structure

```
emotion-analysis-platform/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Next.js pages
│   │   ├── lib/           # Utilities and hooks
│   │   ├── styles/        # Global styles
│   │   └── types/         # TypeScript definitions
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core configurations
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── ai/            # AI/ML integration
│   ├── alembic/           # Database migrations
│   ├── tests/             # Test files
│   └── requirements.txt
│
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── nginx.conf
│
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── docker-compose.yml
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/emotion_db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
HUGGINGFACE_TOKEN=your-hf-token
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# E2E tests
npm run cypress:open
```

## 📈 API Documentation

Once the backend is running, access:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key API Endpoints
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `POST /api/analyze/text` - Text emotion analysis
- `GET /api/analyses/history` - User analysis history
- `POST /api/analyses/batch` - Batch analysis

## 🐳 Docker Deployment

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Run production stack
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Compose Services
- `frontend`: Next.js application
- `backend`: FastAPI server
- `db`: PostgreSQL database
- `redis`: Redis caching
- `nginx`: Reverse proxy (production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for pretrained models
- [Next.js](https://nextjs.org/) team for the amazing framework
- [FastAPI](https://fastapi.tiangolo.com/) for the high-performance backend
- All open-source contributors

## 📞 Support

For support, email ug2102052@cse.pstu.ac.bd or open an issue in the GitHub repository.

---

**Made with ❤️ by the Mentora Team**
```

