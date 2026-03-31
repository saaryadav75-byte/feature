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
('course_1', 'Introduction to Python', 'Master Python from scratch! This comprehensive course covers variables, data types, control flow, functions, and file handling. Perfect for beginners with no prior programming experience. Build real-world projects and gain solid fundamentals for advanced Python development.', 'user_demo_instructor', 'Demo Instructor', 0.0, 'Programming', 'beginner', 25, 4.5),
('course_2', 'Web Development Fundamentals', 'Learn to build modern, responsive websites from scratch. This course covers HTML5 semantic markup, CSS3 styling and layouts, JavaScript interactivity, responsive design principles, and web accessibility standards. Create portfolio-worthy projects including a personal website and interactive web application.', 'user_demo_instructor', 'Demo Instructor', 0.0, 'Web Development', 'intermediate', 18, 4.2),
('course_3', 'Data Science with Python', 'Dive into the world of data science! Learn Python libraries like Pandas and NumPy for data manipulation, Matplotlib and Seaborn for visualization, and Scikit-learn for machine learning. Work with real datasets, perform exploratory data analysis, and build predictive models. Perfect for aspiring data scientists.', 'user_demo_instructor', 'Demo Instructor', 0.0, 'Data Science', 'advanced', 12, 4.7),
('course_4', 'JavaScript Mastery', 'Become a JavaScript expert! This course takes you from JS fundamentals to advanced concepts including ES6+ features, asynchronous programming with Promises and async/await, DOM manipulation, and common design patterns. Build complex interactive applications and understand JavaScript internals deeply.', 'user_diana', 'Diana Prince', 29.99, 'Programming', 'intermediate', 45, 4.8),
('course_5', 'React for Beginners', 'Start your React journey today! Learn component-based architecture, JSX syntax, props and state management, React Hooks, and React Router for navigation. Build a complete React application from scratch and deploy it to production. Ideal for those familiar with HTML, CSS, and JavaScript.', 'user_diana', 'Diana Prince', 0.0, 'Web Development', 'beginner', 67, 4.6),
('course_6', 'Machine Learning Basics', 'Explore the foundations of machine learning! Understand supervised and unsupervised learning, regression and classification algorithms, neural networks, and deep learning concepts. Use TensorFlow and Scikit-learn to build models. Perfect for those with basic Python knowledge wanting to enter ML.', 'user_diana', 'Diana Prince', 49.99, 'Data Science', 'advanced', 23, 4.9),
('course_7', 'UI/UX Design Fundamentals', 'Learn to design beautiful, user-friendly interfaces! This course covers design thinking methodology, user research techniques, wireframing and prototyping, color theory, typography, and usability principles. Create a complete design project using Figma and build a professional design portfolio.', 'user_diana', 'Diana Prince', 0.0, 'Design', 'beginner', 34, 4.4),
('course_8', 'Advanced CSS Techniques', 'Master modern CSS like a pro! Learn CSS Grid for complex layouts, Flexbox for alignment, CSS animations and transitions, custom properties (variables), preprocessor basics, and performance optimization. Build stunning, responsive websites with cutting-edge CSS techniques.', 'user_diana', 'Diana Prince', 19.99, 'Web Development', 'advanced', 28, 4.5),
('course_9', 'SQL Database Design', 'Become a database expert! Learn SQL fundamentals, complex queries with joins and subqueries, database normalization, schema design, indexing strategies, and performance optimization. Work with PostgreSQL and design databases for real-world applications from e-commerce to social media.', 'user_diana', 'Diana Prince', 24.99, 'Data Science', 'intermediate', 19, 4.3),
('course_10', 'DevOps Essentials', 'Bridge development and operations! Learn Git version control workflows, CI/CD pipeline creation with GitHub Actions, containerization with Docker, Kubernetes basics, cloud deployment on AWS, and infrastructure as code. Deploy applications with confidence and automate your development process.', 'user_diana', 'Diana Prince', 39.99, 'Programming', 'advanced', 15, 4.7)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SEED DEMO LESSONS
-- ============================================
INSERT INTO lessons (id, course_id, title, content, order_index, duration_minutes) VALUES
-- Python Course (course_1)
('lesson_1_1', 'course_1', 'Getting Started with Python', 'Welcome to Python! In this lesson, we will set up your development environment, install Python, and write your first program. Learn about Python interpreters, IDEs like VS Code, and the Python shell. Understand why Python is one of the most popular programming languages and its applications in web development, data science, AI, and automation. By the end, you will have Python installed and running on your machine.', 1, 30),
('lesson_1_2', 'course_1', 'Variables and Data Types', 'Master Python variables and data types! Learn about integers, floats, strings, booleans, and None. Understand variable naming conventions, type conversion, and string formatting. Explore type hints for better code documentation. Practice with hands-on exercises to solidify your understanding of how Python handles different types of data.', 2, 45),
('lesson_1_3', 'course_1', 'Control Flow', 'Control the execution of your programs! Learn about conditional statements (if, elif, else), comparison and logical operators, and nested conditions. Master loops with for and while statements, including break, continue, and else clauses. Build practical programs that make decisions and repeat actions based on conditions.', 3, 40),
('lesson_1_4', 'course_1', 'Functions', 'Write reusable code with functions! Learn function definition, parameters, return values, and scope. Explore default arguments, *args, and **kwargs. Understand lambda functions, decorators, and function documentation. Build a collection of utility functions and learn best practices for writing clean, reusable code.', 4, 50),
('lesson_1_5', 'course_1', 'Lists and Dictionaries', 'Work with collections like a pro! Master Python lists, tuples, sets, and dictionaries. Learn list comprehensions, dictionary comprehensions, and generator expressions. Understand mutability, indexing, slicing, and built-in methods for each collection type. Handle real-world data structures efficiently.', 5, 55),
('lesson_1_6', 'course_1', 'File Handling', 'Read and write files in Python! Learn to work with text and binary files, use context managers (with statements), and handle file paths. Explore JSON and CSV file formats. Build programs that process log files, generate reports, and persist data. Understand exception handling for robust file operations.', 6, 35),
-- Web Development Course (course_2)
('lesson_2_1', 'course_2', 'HTML Fundamentals', 'Build the foundation of every website with HTML! Learn semantic HTML5 elements, document structure, headings, paragraphs, links, images, lists, tables, and forms. Understand the DOM (Document Object Model) and how browsers render HTML. Create your first webpage with proper structure and accessibility.', 1, 40),
('lesson_2_2', 'course_2', 'CSS Styling', 'Make websites beautiful with CSS! Learn selectors, specificity, the box model, colors, typography, and spacing. Understand the cascade and inheritance. Master CSS properties for layout and design. Create visually appealing pages while learning best practices for organizing CSS code.', 2, 50),
('lesson_2_3', 'course_2', 'JavaScript Basics', 'Add interactivity to your websites! Learn JavaScript fundamentals including variables, data types, operators, and control flow. Understand functions, objects, and arrays. Manipulate the DOM to create dynamic content. Handle events and respond to user interactions. Build interactive elements from scratch.', 3, 45),
('lesson_2_4', 'course_2', 'Responsive Design', 'Create websites that work on every device! Learn media queries, fluid layouts, flexible images, and the mobile-first approach. Understand breakpoints, viewport units, and responsive typography. Master CSS Flexbox and Grid for responsive layouts. Build a fully responsive website that looks great on all screen sizes.', 4, 55),
('lesson_2_5', 'course_2', 'Web Accessibility', 'Make the web accessible to everyone! Learn WCAG guidelines, semantic HTML, ARIA attributes, keyboard navigation, and screen reader compatibility. Understand color contrast, focus management, and accessible forms. Build inclusive websites that work for users with disabilities.', 5, 40),
-- Data Science Course (course_3)
('lesson_3_1', 'course_3', 'Introduction to Data Science', 'Welcome to data science! Learn what data science is, the data science workflow, and the tools used by data scientists. Explore the differences between data analysis, data science, and machine learning. Understand the Python data science ecosystem including NumPy, Pandas, and Matplotlib. Set up your data science environment.', 1, 35),
('lesson_3_2', 'course_3', 'Python for Data Analysis', 'Master data manipulation with Pandas and NumPy! Learn to load, clean, transform, and analyze data. Explore DataFrames, Series, and index operations. Handle missing data, duplicates, and data type conversions. Perform aggregations, groupby operations, and merge datasets. Work with real-world datasets.', 2, 60),
('lesson_3_3', 'course_3', 'Data Visualization', 'Tell stories with data visualizations! Learn Matplotlib and Seaborn for creating charts, plots, and graphs. Understand when to use different chart types. Customize visualizations with colors, labels, and themes. Create interactive visualizations. Build a portfolio of professional-quality data visualizations.', 3, 50),
('lesson_3_4', 'course_3', 'Introduction to Machine Learning', 'Enter the world of ML! Learn the fundamentals of machine learning, supervised vs unsupervised learning, and common algorithms. Understand linear regression, classification, decision trees, and clustering. Build your first ML models using Scikit-learn. Evaluate model performance and make predictions.', 4, 70),
-- JavaScript Mastery (course_4)
('lesson_4_1', 'course_4', 'JavaScript Basics Review', 'Refresh your JavaScript fundamentals! Review variables, data types, operators, and control flow. Strengthen your understanding of functions and scope. Practice ES6+ syntax and modern JavaScript patterns. Identify areas for improvement as we build toward advanced concepts.', 1, 30),
('lesson_4_2', 'course_4', 'ES6 Features', 'Master modern JavaScript with ES6+! Learn arrow functions, template literals, destructuring, spread/rest operators, and modules. Understand let, const, and block scoping. Explore classes, generators, and iterators. Write clean, modern JavaScript that takes advantage of language improvements.', 2, 45),
('lesson_4_3', 'course_4', 'Async JavaScript', 'Handle asynchronous operations like a pro! Learn callbacks, promises, and async/await. Understand the event loop and JavaScript concurrency model. Handle errors in async code. Make HTTP requests with fetch API. Build applications that handle API calls, file operations, and timers effectively.', 3, 55),
('lesson_4_4', 'course_4', 'DOM Manipulation', 'Master the Document Object Model! Learn to select, create, update, and delete DOM elements. Understand event handling, event delegation, and custom events. Build dynamic interfaces with animations and transitions. Optimize DOM performance and avoid common pitfalls. Create interactive web applications.', 4, 50),
('lesson_4_5', 'course_4', 'JavaScript Design Patterns', 'Learn proven solutions to common problems! Explore module, singleton, factory, observer, and decorator patterns. Understand this binding, closures, and prototypal inheritance. Write maintainable, scalable JavaScript. Apply design patterns to real-world scenarios.', 5, 60),
-- React Course (course_5)
('lesson_5_1', 'course_5', 'React Introduction', 'Start your React journey! Learn what React is, why it was created, and its core philosophy. Understand components, JSX, and the virtual DOM. Set up a React development environment with Create React App or Vite. Create your first React component and understand the component-based architecture.', 1, 25),
('lesson_5_2', 'course_5', 'Components and Props', 'Build reusable UI components! Learn functional components, component composition, and component children. Master props for passing data between components. Understand prop types for type checking. Create a component library with reusable, well-documented components.', 2, 40),
('lesson_5_3', 'course_5', 'State and Hooks', 'Manage application state with React Hooks! Learn useState, useEffect, useContext, and custom hooks. Understand the rules of hooks and lifecycle in functional components. Build stateful applications with predictable behavior. Handle side effects and data fetching properly.', 3, 50),
('lesson_5_4', 'course_5', 'React Router', 'Navigate between pages in React! Learn client-side routing with React Router. Understand routes, parameters, and query strings. Implement protected routes and redirects. Create a multi-page application with navigation, bookmarks, and deep linking.', 4, 35),
('lesson_5_5', 'course_5', 'Building a React App', 'Put it all together! Build a complete React application from scratch. Implement routing, state management, and API integration. Style your application with CSS modules or styled-components. Deploy your app to production. Create a portfolio-worthy project.', 5, 60),
-- Machine Learning (course_6)
('lesson_6_1', 'course_6', 'What is Machine Learning?', 'Introduction to ML fundamentals! Learn the history of machine learning, types of ML (supervised, unsupervised, reinforcement), and common applications. Understand the ML workflow from data collection to model deployment. Explore popular ML frameworks and tools. Set up your ML environment.', 1, 40),
('lesson_6_2', 'course_6', 'Supervised Learning', 'Master supervised learning algorithms! Learn linear regression, logistic regression, decision trees, random forests, and support vector machines. Understand overfitting, underfitting, and bias-variance tradeoff. Build and evaluate classification and regression models. Work with Scikit-learn.', 2, 55),
('lesson_6_3', 'course_6', 'Neural Networks', 'Dive into deep learning! Learn the fundamentals of neural networks, backpropagation, and gradient descent. Understand layers, activation functions, and loss functions. Build neural networks with TensorFlow and Keras. Train models for image classification and other tasks.', 3, 65),
-- UI/UX Design (course_7)
('lesson_7_1', 'course_7', 'Design Thinking', 'Learn the design thinking methodology! Understand the five stages: empathize, define, ideate, prototype, and test. Apply design thinking to solve user problems. Conduct user interviews and observations. Create user personas and journey maps. Develop a user-centered design mindset.', 1, 35),
('lesson_7_2', 'course_7', 'User Research', 'Understand your users through research! Learn various user research methods including interviews, surveys, usability testing, and analytics. Create research plans and conduct effective user interviews. Analyze research findings and translate them into design insights. Build user personas and empathy maps.', 2, 40),
('lesson_7_3', 'course_7', 'Wireframing', 'Turn ideas into visual designs! Learn wireframing principles, low-fidelity vs high-fidelity wireframes, and common wireframe patterns. Use Figma to create wireframes and prototypes. Create interactive prototypes to test with users. Present wireframes to stakeholders effectively.', 3, 45),
-- Advanced CSS (course_8)
('lesson_8_1', 'course_8', 'CSS Grid', 'Master CSS Grid for complex layouts! Learn grid container and item properties, grid templates, and responsive grid patterns. Create magazine layouts, dashboards, and image galleries. Understand grid auto-placement and named grid lines. Build responsive layouts that work across all devices.', 1, 45),
('lesson_8_2', 'course_8', 'Flexbox Mastery', 'Perfect your Flexbox skills! Learn flex container and item properties, alignment, and direction. Understand flex grow, shrink, and basis. Create navigation bars, card layouts, and complex UI components. Combine Flexbox with Grid for powerful layouts. Debug common Flexbox issues.', 2, 40),
('lesson_8_3', 'course_8', 'CSS Animations', 'Bring your designs to life! Learn CSS transitions, keyframe animations, and transforms. Create complex animation sequences and micro-interactions. Understand animation timing functions and performance optimization. Build engaging animations for buttons, loading states, and page transitions.', 3, 50),
-- SQL Database (course_9)
('lesson_9_1', 'course_9', 'SQL Basics', 'Learn SQL fundamentals! Understand databases, tables, and the SQL language. Write SELECT queries, filter with WHERE, and sort with ORDER BY. Use aggregate functions (COUNT, SUM, AVG, MIN, MAX) and GROUP BY. Practice with hands-on exercises using a real database.', 1, 40),
('lesson_9_2', 'course_9', 'Joins and Subqueries', 'Master complex queries! Learn INNER, LEFT, RIGHT, and FULL joins. Understand self-joins and multiple joins. Write subqueries and correlated subqueries. Use EXISTS and IN with subqueries. Optimize query performance and avoid common mistakes.', 2, 45),
('lesson_9_3', 'course_9', 'Database Design', 'Design databases like a professional! Learn database normalization (1NF, 2NF, 3NF), primary and foreign keys, and constraints. Create ER diagrams and translate them to schema. Understand indexing and query optimization. Design databases for real-world applications.', 3, 50),
-- DevOps (course_10)
('lesson_10_1', 'course_10', 'Introduction to DevOps', 'Welcome to DevOps! Learn the history and principles of DevOps, the software development lifecycle, and the benefits of DevOps practices. Understand the culture of collaboration between development and operations. Explore DevOps tools and methodologies including Agile and Lean.', 1, 30),
('lesson_10_2', 'course_10', 'Git and Version Control', 'Master version control with Git! Learn Git basics, branching strategies, and merge workflows. Understand GitHub Flow, GitFlow, and trunk-based development. Resolve merge conflicts and use Git effectively in teams. Implement code review practices with pull requests.', 2, 35),
('lesson_10_3', 'course_10', 'CI/CD Pipelines', 'Automate your deployments! Learn continuous integration, continuous delivery, and continuous deployment. Create CI/CD pipelines with GitHub Actions. Set up automated testing, code quality checks, and deployment workflows. Deploy applications to cloud platforms reliably.', 3, 45)
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
