import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { motion } from 'framer-motion';
import { 
  BookOpen, Clock, Trophy, Coins, TrendingUp, 
  Play, ChevronRight, Sparkles, Brain, Award
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [heatmapData, setHeatmapData] = useState([]);
  const [gamificationStats, setGamificationStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, coursesRes, enrolledCoursesRes, heatmapRes, gamificationRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/courses'),
        api.get('/progress/enrolled'),
        api.get(`/analytics/heatmap/${user.id}`),
        api.get('/gamification/stats')
      ]);
      
      setStats(statsRes.data);
      setCourses(coursesRes.data);
      setEnrolledCourses(enrolledCoursesRes.data);
      setHeatmapData(heatmapRes.data);
      setGamificationStats(gamificationRes.data);
      
      const progressMap = {};
      enrolledCoursesRes.data.forEach(course => {
        progressMap[course.id] = course.progress_percentage || 0;
      });
      setCourseProgress(progressMap);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-12 bg-slate-50 dark:bg-zinc-950" data-testid="student-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-2 text-gray-900 dark:text-white dark:text-white" style={{ fontFamily: 'Outfit' }}>
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 dark:text-zinc-400 text-lg">Continue where you left off and keep learning</p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <Card className="bg-white dark:bg-zinc-900 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow" data-testid="streak-stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 dark:text-zinc-400 mb-1">Daily Streak</p>
                    <p className="text-3xl font-bold text-orange-500" style={{ fontFamily: 'JetBrains Mono' }}>
                      🔥 {gamificationStats?.current_streak || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-white dark:bg-zinc-900 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow" data-testid="xp-stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">XP & Level</p>
                    <p className="text-3xl font-bold text-indigo-600" style={{ fontFamily: 'JetBrains Mono' }}>
                      {gamificationStats?.total_xp || 0} XP
                    </p>
                    <p className="text-sm text-gray-500 dark:text-zinc-500 dark:text-zinc-500">Level {gamificationStats?.level || 1}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Award className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow" data-testid="coins-stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Reward Coins</p>
                    <p className="text-3xl font-bold text-yellow-600" style={{ fontFamily: 'JetBrains Mono' }}>
                      {stats?.coins || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Study Hours</p>
                    <p className="text-3xl font-bold text-cyan-600" style={{ fontFamily: 'JetBrains Mono' }}>
                      {stats?.total_study_hours?.toFixed(1) || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Enrolled Courses</p>
                    <p className="text-3xl font-bold text-green-600" style={{ fontFamily: 'JetBrains Mono' }}>
                      {stats?.enrolled_courses || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 mb-1">Focus Sessions</p>
                    <p className="text-3xl font-bold text-purple-600" style={{ fontFamily: 'JetBrains Mono' }}>
                      {stats?.total_sessions || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm" data-testid="enrolled-courses-section">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  <Play className="w-6 h-6 text-cyan-600" />
                  Continue Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 dark:text-zinc-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-zinc-400 mb-4">You haven't enrolled in any courses yet</p>
                    <Button
                      onClick={() => navigate('/courses')}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-sm"
                      data-testid="browse-courses-button"
                    >
                      Browse Courses
                    </Button>
                  </div>
                ) : (
                  enrolledCourses.slice(0, 3).map((course) => (
                    <motion.div
                      key={course.id}
                      whileHover={{ x: 4 }}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 hover:border-cyan-300 transition-colors cursor-pointer"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      data-testid={`course-card-${course.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">{course.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3">{course.instructor_name}</p>
                          <Progress value={courseProgress[course.id] || 0} className="h-2" />
                          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2">{Math.round(courseProgress[course.id] || 0)}% complete</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Study Heatmap */}
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Study Activity Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-zinc-400">Your study activity over the past year</p>
                </div>
                {heatmapData.length > 0 ? (
                  <div className="overflow-x-auto pb-2">
                    <div className="inline-flex gap-1 flex-wrap max-w-full">
                      {heatmapData.slice(-365).map((day, idx) => {
                        const level = day.level;
                        const colors = ['#f3f4f6', '#dcfce7', '#bbf7d0', '#86efac', '#22c55e'];
                        const bgColor = colors[level] || colors[0];
                        return (
                          <div
                            key={idx}
                            className="w-3 h-3 rounded-sm transition-transform hover:scale-125 cursor-pointer border border-gray-200 dark:border-zinc-800"
                            style={{ backgroundColor: bgColor }}
                            title={`${day.date}: ${day.value.toFixed(0)} mins`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 dark:text-zinc-500">
                      <span>Less</span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className="w-3 h-3 rounded-sm border border-gray-200 dark:border-zinc-800"
                            style={{ backgroundColor: ['#f3f4f6', '#dcfce7', '#bbf7d0', '#86efac', '#22c55e'][level] }}
                          />
                        ))}
                      </div>
                      <span>More</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-zinc-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Start learning to see your activity heatmap!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  <Sparkles className="w-6 h-6 text-yellow-600" />
                  Recommended For You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((course) => (
                    <motion.div
                      key={course.id}
                      whileHover={{ y: -4 }}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800 hover:border-cyan-300 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      data-testid={`recommended-course-${course.id}`}
                    >
                      <div className="aspect-video rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 mb-3 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-cyan-600" />
                      </div>
                      <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">{course.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-zinc-400 mb-2">{course.instructor_name}</p>
                      <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-gray-200">
                        {course.students_enrolled} students
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm" data-testid="ai-engagement-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>AI Engagement Tracking</h3>
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mb-4">
                    Start a focus session to track your engagement and earn rewards
                  </p>
                  <Button
                    onClick={() => navigate('/focus-session')}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-sm"
                    data-testid="start-session-button"
                  >
                    Start Focus Session
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  <Award className="w-5 h-5 text-yellow-600" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {gamificationStats?.achievements_unlocked > 0 ? (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800">
                      <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">First Steps</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-500">Started your learning journey</p>
                      </div>
                    </div>
                    {gamificationStats?.current_streak > 1 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Streak Master</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-500">{gamificationStats.current_streak} day streak!</p>
                        </div>
                      </div>
                    )}
                    {gamificationStats?.level > 1 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-800">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                          <Award className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Level Up!</p>
                          <p className="text-xs text-gray-500 dark:text-zinc-500">Reached level {gamificationStats.level}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500 dark:text-zinc-500">Start learning to earn achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-800 dark:border-zinc-700 bg-gradient-to-br from-[#FF007F]/10 to-[#FFE600]/10 dark:from-[#FF007F]/20 dark:to-[#FFE600]/20">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-2 dark:text-white" style={{ fontFamily: 'Outfit' }}>Feeling Hungry?</h3>
                <p className="text-sm text-zinc-400 dark:text-zinc-400 mb-4">
                  Take a break and grab a snack with your earned discounts
                </p>
                <Button
                  onClick={() => navigate('/food')}
                  variant="outline"
                  className="border-[#FF007F] text-[#FF007F] hover:bg-[#FF007F] hover:text-white"
                  data-testid="food-catalog-button"
                >
                  Browse Food Menu
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
