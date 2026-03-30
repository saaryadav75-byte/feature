-- SmartLearn Complete Seed Data
-- Run these commands in your Supabase SQL Editor
-- NOTE: This matches the schema in supabase_schema.sql

-- ============================================
-- SEED DEMO USERS
-- ============================================
INSERT INTO users (id, email, password, name, role, coins, total_study_hours, total_xp) VALUES
('user_demo_student', 'student@test.com', '$2b$12$DoRJkqZVQDhynzsWUWNse.ooztbhP0DobZ.qmMfJOKxIJj/uRnzbW', 'Demo Student', 'student', 50, 3.5, 150),
('user_demo_instructor', 'instructor@test.com', '$2b$12$DoRJkqZVQDhynzsWUWNse.ooztbhP0DobZ.qmMfJOKxIJj/uRnzbW', 'Demo Instructor', 'instructor', 100, 20.0, 500),
('user_alice', 'alice@test.com', '$2b$12$DoRJkqZVQDhynzsWUWNse.ooztbhP0DobZ.qmMfJOKxIJj/uRnzbW', 'Alice Johnson', 'student', 120, 15.5, 450),
('user_bob', 'bob@test.com', '$2b$12$DoRJkqZVQDhynzsWUWNse.ooztbhP0DobZ.qmMfJOKxIJj/uRnzbW', 'Bob Smith', 'student', 85, 10.0, 320),
('user_charlie', 'charlie@test.com', '$2b$12$DoRJkqZVQDhynzsWUWNse.ooztbhP0DobZ.qmMfJOKxIJj/uRnzbW', 'Charlie Brown', 'student', 200, 25.0, 780),
('user_diana', 'diana@test.com', '$2b$12$DoRJkqZVQDhynzsWUWNse.ooztbhP0DobZ.qmMfJOKxIJj/uRnzbW', 'Diana Prince', 'instructor', 150, 30.0, 900)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DEMO COURSES
-- ============================================
INSERT INTO courses (id, title, description, instructor_id, instructor_name, price, category, difficulty, students_enrolled, rating) VALUES
('course_1', 'Introduction to Python', 'Learn the basics of Python programming', 'user_demo_instructor', 'Demo Instructor', 0.0, 'Programming', 'beginner', 25, 4.5),
('course_2', 'Web Development Fundamentals', 'Build modern web applications', 'user_demo_instructor', 'Demo Instructor', 0.0, 'Web Development', 'intermediate', 18, 4.2),
('course_3', 'Data Science with Python', 'Analyze data and build ML models', 'user_demo_instructor', 'Demo Instructor', 0.0, 'Data Science', 'advanced', 12, 4.7),
('course_4', 'JavaScript Mastery', 'Master JavaScript from basics to advanced', 'user_diana', 'Diana Prince', 29.99, 'Programming', 'intermediate', 45, 4.8),
('course_5', 'React for Beginners', 'Build your first React application', 'user_diana', 'Diana Prince', 0.0, 'Web Development', 'beginner', 67, 4.6),
('course_6', 'Machine Learning Basics', 'Introduction to ML algorithms', 'user_diana', 'Diana Prince', 49.99, 'Data Science', 'advanced', 23, 4.9),
('course_7', 'UI/UX Design Fundamentals', 'Learn design principles', 'user_diana', 'Diana Prince', 0.0, 'Design', 'beginner', 34, 4.4),
('course_8', 'Advanced CSS Techniques', 'Master modern CSS layouts', 'user_diana', 'Diana Prince', 19.99, 'Web Development', 'advanced', 28, 4.5),
('course_9', 'SQL Database Design', 'Design and optimize databases', 'user_diana', 'Diana Prince', 24.99, 'Data Science', 'intermediate', 19, 4.3),
('course_10', 'DevOps Essentials', 'CI/CD and cloud deployment', 'user_diana', 'Diana Prince', 39.99, 'Programming', 'advanced', 15, 4.7)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DEMO LESSONS
-- ============================================
INSERT INTO lessons (id, course_id, title, content, order_index, duration_minutes) VALUES
-- Python Course (course_1)
('lesson_1_1', 'course_1', 'Getting Started with Python', 'Introduction to Python and setting up your environment', 1, 30),
('lesson_1_2', 'course_1', 'Variables and Data Types', 'Understanding Python data types', 2, 45),
('lesson_1_3', 'course_1', 'Control Flow', 'If statements, loops, and conditionals', 3, 40),
('lesson_1_4', 'course_1', 'Functions', 'Creating and using functions', 4, 50),
('lesson_1_5', 'course_1', 'Lists and Dictionaries', 'Working with collections', 5, 55),
('lesson_1_6', 'course_1', 'File Handling', 'Reading and writing files', 6, 35),
-- Web Development Course (course_2)
('lesson_2_1', 'course_2', 'HTML Fundamentals', 'Learn HTML structure', 1, 40),
('lesson_2_2', 'course_2', 'CSS Styling', 'Style your web pages', 2, 50),
('lesson_2_3', 'course_2', 'JavaScript Basics', 'Add interactivity to pages', 3, 45),
('lesson_2_4', 'course_2', 'Responsive Design', 'Mobile-first design principles', 4, 55),
('lesson_2_5', 'course_2', 'Web Accessibility', 'Making sites accessible to all', 5, 40),
-- Data Science Course (course_3)
('lesson_3_1', 'course_3', 'Introduction to Data Science', 'What is data science?', 1, 35),
('lesson_3_2', 'course_3', 'Python for Data Analysis', 'Pandas and NumPy basics', 2, 60),
('lesson_3_3', 'course_3', 'Data Visualization', 'Creating charts with Matplotlib', 3, 50),
('lesson_3_4', 'course_3', 'Introduction to Machine Learning', 'ML concepts and algorithms', 4, 70),
-- JavaScript Mastery (course_4)
('lesson_4_1', 'course_4', 'JavaScript Basics Review', 'Core JS concepts', 1, 30),
('lesson_4_2', 'course_4', 'ES6 Features', 'Modern JavaScript syntax', 2, 45),
('lesson_4_3', 'course_4', 'Async JavaScript', 'Promises and async/await', 3, 55),
('lesson_4_4', 'course_4', 'DOM Manipulation', 'Advanced DOM techniques', 4, 50),
('lesson_4_5', 'course_4', 'JavaScript Design Patterns', 'Common patterns', 5, 60),
-- React Course (course_5)
('lesson_5_1', 'course_5', 'React Introduction', 'What is React?', 1, 25),
('lesson_5_2', 'course_5', 'Components and Props', 'Building React components', 2, 40),
('lesson_5_3', 'course_5', 'State and Hooks', 'Managing state with hooks', 3, 50),
('lesson_5_4', 'course_5', 'React Router', 'Navigation in React', 4, 35),
('lesson_5_5', 'course_5', 'Building a React App', 'Complete project', 5, 60),
-- Machine Learning (course_6)
('lesson_6_1', 'course_6', 'What is Machine Learning?', 'ML fundamentals', 1, 40),
('lesson_6_2', 'course_6', 'Supervised Learning', 'Classification and regression', 2, 55),
('lesson_6_3', 'course_6', 'Neural Networks', 'Deep learning basics', 3, 65),
-- UI/UX Design (course_7)
('lesson_7_1', 'course_7', 'Design Thinking', 'Introduction to design', 1, 35),
('lesson_7_2', 'course_7', 'User Research', 'Understanding users', 2, 40),
('lesson_7_3', 'course_7', 'Wireframing', 'Creating wireframes', 3, 45),
-- Advanced CSS (course_8)
('lesson_8_1', 'course_8', 'CSS Grid', 'Grid layouts', 1, 45),
('lesson_8_2', 'course_8', 'Flexbox Mastery', 'Flexbox techniques', 2, 40),
('lesson_8_3', 'course_8', 'CSS Animations', 'Smooth animations', 3, 50),
-- SQL Database (course_9)
('lesson_9_1', 'course_9', 'SQL Basics', 'Database queries', 1, 40),
('lesson_9_2', 'course_9', 'Joins and Subqueries', 'Advanced queries', 2, 45),
('lesson_9_3', 'course_9', 'Database Design', 'Schema design', 3, 50),
-- DevOps (course_10)
('lesson_10_1', 'course_10', 'Introduction to DevOps', 'DevOps overview', 1, 30),
('lesson_10_2', 'course_10', 'Git and Version Control', 'Git workflows', 2, 35),
('lesson_10_3', 'course_10', 'CI/CD Pipelines', 'Automation basics', 3, 45)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED ACHIEVEMENTS
-- ============================================
INSERT INTO achievements (id, name, description, icon, coins_reward, requirement_type, requirement_value) VALUES
('first_hour', 'First Hour', 'Completed 1 hour of study', 'trophy', 10, 'study_hours', 1.0),
('focus_master', 'Focus Master', 'Completed first focus session', 'brain', 15, 'focus_sessions', 1.0),
('streak_5', 'Streak Champion', 'Maintained a 5-day streak', 'fire', 25, 'streak_days', 5.0),
('level_5', 'Level Up!', 'Reached level 5', 'star', 50, 'level', 5.0),
('bookworm', 'Bookworm', 'Completed 5 lessons', 'book', 30, 'lessons_completed', 5.0),
('early_bird', 'Early Bird', 'Studied before 8am', 'sun', 15, 'time_of_day', 8.0),
('night_owl', 'Night Owl', 'Studied after 10pm', 'moon', 15, 'time_of_day', 22.0),
('course_complete', 'Course Graduate', 'Completed your first course', 'graduation', 100, 'courses_completed', 1.0),
('social_learner', 'Social Learner', 'Enrolled in 3 courses', 'users', 20, 'courses_enrolled', 3.0),
('coin_collector', 'Coin Collector', 'Earned 100 coins', 'coins', 25, 'total_coins', 100.0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED ENROLLMENTS (using uuid_generate_v4())
-- ============================================
INSERT INTO enrollments (user_id, course_id, enrolled_at, progress_percentage) VALUES
('user_demo_student', 'course_1', NOW() - INTERVAL '10 days', 66.67),
('user_demo_student', 'course_2', NOW() - INTERVAL '5 days', 40.00),
('user_demo_student', 'course_5', NOW() - INTERVAL '3 days', 20.00),
('user_alice', 'course_1', NOW() - INTERVAL '15 days', 100.00),
('user_alice', 'course_4', NOW() - INTERVAL '7 days', 60.00),
('user_bob', 'course_3', NOW() - INTERVAL '20 days', 75.00),
('user_charlie', 'course_5', NOW() - INTERVAL '2 days', 40.00);

-- ============================================
-- SEED PROGRESS (using uuid_generate_v4())
-- ============================================
INSERT INTO progress (user_id, course_id, lesson_id, completion_percentage, time_spent_minutes) VALUES
-- Demo Student Progress
('user_demo_student', 'course_1', 'lesson_1_1', 100.0, 35),
('user_demo_student', 'course_1', 'lesson_1_2', 100.0, 50),
('user_demo_student', 'course_1', 'lesson_1_3', 50.0, 20),
('user_demo_student', 'course_2', 'lesson_2_1', 100.0, 45),
('user_demo_student', 'course_2', 'lesson_2_2', 100.0, 55),
-- Alice Progress
('user_alice', 'course_1', 'lesson_1_1', 100.0, 30),
('user_alice', 'course_1', 'lesson_1_2', 100.0, 45),
('user_alice', 'course_1', 'lesson_1_3', 100.0, 40),
('user_alice', 'course_4', 'lesson_4_1', 100.0, 35),
('user_alice', 'course_4', 'lesson_4_2', 80.0, 35),
-- Bob Progress
('user_bob', 'course_3', 'lesson_3_1', 100.0, 40),
('user_bob', 'course_3', 'lesson_3_2', 100.0, 65),
('user_bob', 'course_3', 'lesson_3_3', 75.0, 35),
-- Charlie Progress
('user_charlie', 'course_5', 'lesson_5_1', 100.0, 30),
('user_charlie', 'course_5', 'lesson_5_2', 100.0, 45);

-- ============================================
-- SEED FOCUS SESSIONS
-- ============================================
INSERT INTO focus_sessions (id, user_id, lesson_id, start_time, end_time, duration_minutes, engagement_logs, coins_earned) VALUES
('session_1', 'user_demo_student', 'lesson_1_1', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days 22 hours', 25, '[{"state":"focused"},{"state":"focused"},{"state":"distracted"},{"state":"focused"}]', 15),
('session_2', 'user_demo_student', 'lesson_1_2', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 45, '[{"state":"focused"},{"state":"focused"},{"state":"focused"},{"state":"focused"}]', 20),
('session_3', 'user_demo_student', 'lesson_2_1', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '11 hours', 30, '[{"state":"focused"},{"state":"focused"},{"state":"distracted"}]', 12),
('session_4', 'user_alice', 'lesson_1_1', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days 1 hour', 30, '[{"state":"focused"},{"state":"focused"},{"state":"focused"}]', 18),
('session_5', 'user_bob', 'lesson_3_1', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days 1 hour', 40, '[{"state":"focused"},{"state":"focused"},{"state":"focused"}]', 22),
('session_6', 'user_charlie', 'lesson_5_1', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days 45 minutes', 45, '[{"state":"focused"},{"state":"focused"},{"state":"focused"},{"state":"focused"}]', 25)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED COIN TRANSACTIONS
-- ============================================
INSERT INTO coin_transactions (id, user_id, amount, transaction_type, description) VALUES
('coin_1', 'user_demo_student', 50, 'bonus', 'Welcome bonus'),
('coin_2', 'user_demo_student', 15, 'session', 'Focus session reward'),
('coin_3', 'user_demo_student', 20, 'session', 'Focus session reward'),
('coin_4', 'user_demo_student', 12, 'session', 'Focus session reward'),
('coin_5', 'user_alice', 50, 'bonus', 'Welcome bonus'),
('coin_6', 'user_alice', 18, 'session', 'Focus session reward'),
('coin_7', 'user_bob', 50, 'bonus', 'Welcome bonus'),
('coin_8', 'user_bob', 22, 'session', 'Focus session reward'),
('coin_9', 'user_charlie', 50, 'bonus', 'Welcome bonus'),
('coin_10', 'user_charlie', 25, 'session', 'Focus session reward'),
('coin_11', 'user_diana', 100, 'bonus', 'Instructor bonus')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED STREAKS
-- ============================================
INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date) VALUES
('user_demo_student', 3, 7, CURRENT_DATE),
('user_alice', 5, 12, CURRENT_DATE - INTERVAL '1 day'),
('user_bob', 2, 5, CURRENT_DATE - INTERVAL '2 days'),
('user_charlie', 8, 15, CURRENT_DATE),
('user_diana', 0, 20, NULL)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- SEED USER ACHIEVEMENTS (using uuid_generate_v4())
-- ============================================
INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES
('user_demo_student', 'first_hour', NOW() - INTERVAL '25 days'),
('user_demo_student', 'focus_master', NOW() - INTERVAL '2 days'),
('user_demo_student', 'streak_5', NOW() - INTERVAL '20 days'),
('user_alice', 'first_hour', NOW() - INTERVAL '25 days'),
('user_alice', 'focus_master', NOW() - INTERVAL '5 days'),
('user_alice', 'streak_5', NOW() - INTERVAL '15 days'),
('user_bob', 'first_hour', NOW() - INTERVAL '20 days'),
('user_charlie', 'first_hour', NOW() - INTERVAL '15 days'),
('user_charlie', 'focus_master', NOW() - INTERVAL '10 days'),
('user_charlie', 'streak_5', NOW() - INTERVAL '8 days'),
('user_charlie', 'bookworm', NOW() - INTERVAL '5 days'),
('user_diana', 'level_5', NOW() - INTERVAL '30 days'),
('user_diana', 'course_complete', NOW() - INTERVAL '25 days');
