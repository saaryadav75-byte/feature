# SmartLearn - AI-Powered Adaptive Learning Platform

A modern, engaging learning platform that adapts to individual users through AI-driven personalization, gamification, and comprehensive progress tracking.

## Database Migration: MongoDB → Supabase

This project has been migrated from MongoDB to **Supabase** (PostgreSQL) for better scalability, real-time features, and easier management.

### 🚀 Supabase Setup

1. **Create a Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run the Database Schema:**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `supabase_schema.sql`
   - Run the SQL commands to create all tables and seed data

3. **Update Environment Variables:**
   ```bash
   # In backend/.env
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Install Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### 📊 Database Schema

The Supabase database includes these tables:

- **`users`** - User accounts and profiles
- **`courses`** - Course information and metadata
- **`lessons`** - Individual lessons within courses
- **`enrollments`** - User course enrollments
- **`progress`** - Learning progress tracking
- **`focus_sessions`** - Pomodoro focus session data
- **`coin_transactions`** - Gamification coin transactions
- **`streaks`** - User learning streaks
- **`achievements`** - Achievement definitions
- **`user_achievements`** - Unlocked user achievements

### 🔄 Migration Changes

**From MongoDB to PostgreSQL:**
- Document-based → Relational structure
- Dynamic schemas → Fixed schemas with relationships
- `find_one()` → `SELECT` queries
- `insert_one()` → `INSERT` statements
- `update_one()` → `UPDATE` statements
- Async operations maintained with `asyncpg`

**Key Migration Benefits:**
- ✅ **Real-time subscriptions** for live updates
- ✅ **Built-in authentication** and authorization
- ✅ **Row Level Security (RLS)** for data protection
- ✅ **Better performance** for complex queries
- ✅ **ACID compliance** for transactions
- ✅ **Built-in backup** and scaling

### 🧪 Demo Data

The schema includes pre-seeded demo data:
- **Users:** `student@test.com` / `password123`
- **Courses:** Python, Web Dev, Data Science
- **Achievements:** Study milestones and rewards

### 🔧 Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
npm start
```

### 📚 API Documentation

- **Backend API:** `http://localhost:8000/docs`
- **Supabase Dashboard:** Manage data, auth, and real-time features

## Features

### 🎯 Core Functionality
- **Personalized Dashboard**: Clean, modern interface with key metrics and personalized greetings
- **Adaptive Learning Engine**: AI analyzes user behavior to recommend courses and adjust difficulty
- **Progress Tracking**: Real-time progress bars and completion percentages
- **Course Management**: Create, enroll, and manage courses with detailed lesson structures

### 🎮 Gamification System
- **Daily Streaks**: 🔥 Track consecutive learning days
- **XP & Levels**: Progress through levels from Beginner to Advanced
- **Reward Coins**: Earn coins through lessons and focus sessions
- **Achievements**: Unlock badges and milestones
- **Leaderboards**: Competitive motivation through rankings

### 🧠 AI Engagement Tracking
- **Focus Sessions**: Dedicated Pomodoro-style sessions with AI monitoring
- **Real-time Analytics**: Track focus levels, distractions, and productivity
- **Behavioral Insights**: AI provides feedback and suggestions
- **Study Heatmaps**: GitHub-style activity visualization

### 🎨 Modern UI/UX
- **Light Theme**: Clean, minimal design inspired by Notion, Duolingo, and Stripe
- **Responsive Design**: Works seamlessly on all devices
- **Smooth Animations**: Framer Motion powered transitions
- **Accessibility**: WCAG compliant design patterns

### 📊 Analytics & Insights
- **Performance Dashboard**: Comprehensive learning analytics
- **Study Patterns**: Identify optimal learning times and methods
- **Recommendations**: AI-suggested courses and study plans
- **Progress Reports**: Detailed insights into learning journey

## Tech Stack

### Backend
- **FastAPI**: High-performance async web framework
- **MongoDB**: NoSQL database for flexible data storage
- **JWT Authentication**: Secure user sessions
- **Pydantic**: Data validation and serialization

### Frontend
- **React 19**: Modern React with hooks and concurrent features
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Shadcn/ui**: Beautiful, accessible UI components

### AI/ML
- **TensorFlow.js**: Client-side machine learning for engagement tracking
- **Face Landmark Detection**: Real-time facial analysis for focus monitoring

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Set up environment variables in .env
uvicorn server:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables
Create `.env` file in backend directory:
```
MONGODB_URL=mongodb://localhost:27017/smartlearn
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000
```

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create new course
- `GET /api/courses/{id}` - Get course details
- `PUT /api/courses/{id}` - Update course

### Gamification
- `GET /api/gamification/stats` - Get user gamification stats
- `POST /api/gamification/coins/update` - Update user coins
- `GET /api/gamification/streak` - Get current streak
- `POST /api/gamification/streak/update` - Update streak

### Focus Sessions
- `POST /api/focus-sessions/start` - Start focus session
- `POST /api/focus-sessions/end` - End focus session

## Project Structure

```
smartlearn/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models/              # Database models
│   ├── routers/             # API endpoints
│   ├── schemas/             # Pydantic schemas
│   ├── utils/               # Utilities
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context
│   │   ├── hooks/           # Custom hooks
│   │   └── utils/           # Utilities
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- **AI Chatbot Tutor**: Integrated AI assistant for doubt solving
- **Smart Reminders**: Personalized study reminders
- **Performance Analytics**: Advanced analytics dashboard
- **Mobile App**: Native mobile applications
- **Multi-language Support**: Internationalization
- **Offline Mode**: Download courses for offline learning
