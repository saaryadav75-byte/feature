-- SmartLearn Database Schema for Supabase
-- Run these commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    coins INTEGER DEFAULT 0,
    total_study_hours DECIMAL(10,2) DEFAULT 0.0,
    total_xp INTEGER DEFAULT 0
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id VARCHAR(50) REFERENCES users(id),
    instructor_name VARCHAR(255),
    price DECIMAL(10,2) DEFAULT 0.0,
    category VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    students_enrolled INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage DECIMAL(5,2) DEFAULT 0.0,
    UNIQUE(user_id, course_id)
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR(50) REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE CASCADE,
    completion_percentage DECIMAL(5,2) DEFAULT 0.0,
    time_spent_minutes DECIMAL(10,2) DEFAULT 0.0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Focus sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    lesson_id VARCHAR(50),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes DECIMAL(10,2) DEFAULT 0.0,
    engagement_logs JSONB DEFAULT '[]'::jsonb,
    coins_earned INTEGER DEFAULT 0
);

-- Coin transactions table
CREATE TABLE IF NOT EXISTS coin_transactions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Streaks table
CREATE TABLE IF NOT EXISTS streaks (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_study_date DATE
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    coins_reward INTEGER DEFAULT 0,
    requirement_type VARCHAR(50),
    requirement_value DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Food items table
CREATE TABLE IF NOT EXISTS food_items (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50),
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(500),
    nutrition_score INTEGER DEFAULT 5,
    description TEXT
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50),
    items JSONB NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- ============================================
-- DISABLE RLS (for development/demo)
-- ============================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE coin_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE streaks DISABLE ROW LEVEL SECURITY;
ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- ============================================
-- GRANT PERMISSIONS TO ANON/PUBLIC
-- ============================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert demo users
INSERT INTO users (id, email, password, name, role, coins, total_study_hours, total_xp) VALUES
('user_demo_student', 'student@test.com', '$2b$12$DoRJkqZVQDhynzsWUWNse.ooztbhP0DobZ.qmMfJOKxIJj/uRnzbW', 'Demo Student', 'student', 50, 3.5, 150),
('user_demo_instructor', 'instructor@test.com', '$2b$12$DoRJkqZVQDhynzsWUWNse.ooztbhP0DobZ.qmMfJOKxIJj/uRnzbW', 'Demo Instructor', 'instructor', 100, 20.0, 500)
ON CONFLICT (id) DO NOTHING;

-- Insert demo courses
INSERT INTO courses (id, title, description, instructor_id, instructor_name, price, category, difficulty, students_enrolled, rating) VALUES
('course_1', 'Introduction to Python', 'Learn the basics of Python programming', 'user_demo_instructor', 'Demo Instructor', 0.0, 'Programming', 'beginner', 25, 4.5),
('course_2', 'Web Development Fundamentals', 'Build modern web applications', 'user_demo_instructor', 'Demo Instructor', 0.0, 'Web Development', 'intermediate', 18, 4.2),
('course_3', 'Data Science with Python', 'Analyze data and build ML models', 'user_demo_instructor', 'Demo Instructor', 0.0, 'Data Science', 'advanced', 12, 4.7)
ON CONFLICT (id) DO NOTHING;

-- Insert demo lessons
INSERT INTO lessons (id, course_id, title, content, order_index, duration_minutes) VALUES
('lesson_1', 'course_1', 'Getting Started with Python', 'Python basics and setup', 1, 30),
('lesson_2', 'course_1', 'Variables and Data Types', 'Understanding Python data types', 2, 45),
('lesson_3', 'course_2', 'HTML Fundamentals', 'Learn HTML structure', 1, 40),
('lesson_4', 'course_2', 'CSS Styling', 'Style your web pages', 2, 50)
ON CONFLICT (id) DO NOTHING;

-- Insert demo achievements
INSERT INTO achievements (id, name, description, icon, coins_reward, requirement_type, requirement_value) VALUES
('first_hour', 'First Hour', 'Completed 1 hour of study', 'trophy', 10, 'study_hours', 1.0),
('focus_master', 'Focus Master', 'Completed first focus session', 'brain', 15, 'focus_sessions', 1.0),
('streak_5', 'Streak Champion', 'Maintained a 5-day streak', 'fire', 25, 'streak_days', 5.0),
('level_5', 'Level Up!', 'Reached level 5', 'star', 50, 'level', 5.0)
ON CONFLICT (id) DO NOTHING;
