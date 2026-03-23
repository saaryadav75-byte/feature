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
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, coursesRes, heatmapRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/courses'),
        api.get(`/analytics/heatmap/${user.id}`)
      ]);
      
      setStats(statsRes.data);
      setCourses(coursesRes.data);
      setHeatmapData(heatmapRes.data);
      
      const enrollmentsPromises = coursesRes.data.map(course =>
        api.get(`/progress/course/${course.id}`).catch(() => null)
      );
      const enrollments = await Promise.all(enrollmentsPromises);
      
      const enrolled = coursesRes.data.filter((_, idx) => 
        enrollments[idx] && enrollments[idx].data && enrollments[idx].data.length > 0
      );
      
      setEnrolledCourses(enrolled);
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
    <div className="min-h-screen p-6 lg:p-12 noise-bg" style={{ background: '#09090B' }} data-testid="student-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>
            Welcome back, {user?.name}
          </h1>
          <p className="text-zinc-400 text-lg">Continue where you left off and keep learning</p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <Card className="border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-colors" data-testid="coins-stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Reward Coins</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#FFE600' }}>
                      {stats?.coins || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#FFE600]/10 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-[#FFE600]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Study Hours</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#00F0FF' }}>
                      {stats?.total_study_hours?.toFixed(1) || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#00F0FF]/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-[#00F0FF]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Enrolled Courses</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
                      {stats?.enrolled_courses || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#39FF14]/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-[#39FF14]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Focus Sessions</p>
                    <p className="text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
                      {stats?.total_sessions || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#FF007F]/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-[#FF007F]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-zinc-800 bg-zinc-950" data-testid="enrolled-courses-section">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                  <Play className="w-6 h-6 text-[#00F0FF]" />
                  Continue Learning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-4">You haven't enrolled in any courses yet</p>
                    <Button
                      onClick={() => navigate('/courses')}
                      className="bg-[#00F0FF] hover:bg-[#00C2CC] text-black font-semibold"
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
                      className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      data-testid={`course-card-${course.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                          <p className="text-sm text-zinc-400 mb-3">{course.instructor_name}</p>
                          <Progress value={65} className="h-2" />
                          <p className="text-xs text-zinc-500 mt-2">65% complete</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600" />
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Study Heatmap */}
            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                  <TrendingUp className="w-6 h-6 text-[#39FF14]" />
                  Study Activity Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-zinc-400">Your study activity over the past year</p>
                </div>
                {heatmapData.length > 0 ? (
                  <div className="overflow-x-auto pb-2">
                    <div className="inline-flex gap-1 flex-wrap max-w-full">
                      {heatmapData.slice(-365).map((day, idx) => {
                        const level = day.level;
                        const colors = ['#27272A', '#39FF1433', '#39FF1466', '#39FF1499', '#39FF14'];
                        const bgColor = colors[level] || colors[0];
                        return (
                          <div
                            key={idx}
                            className="w-3 h-3 rounded-sm transition-transform hover:scale-125 cursor-pointer"
                            style={{ backgroundColor: bgColor }}
                            title={`${day.date}: ${day.value.toFixed(0)} mins`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-4 text-xs text-zinc-500">
                      <span>Less</span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: ['#27272A', '#39FF1433', '#39FF1466', '#39FF1499', '#39FF14'][level] }}
                          />
                        ))}
                      </div>
                      <span>More</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Start learning to see your activity heatmap!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                  <Sparkles className="w-6 h-6 text-[#FFE600]" />
                  Recommended For You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {courses.slice(0, 4).map((course) => (
                    <motion.div
                      key={course.id}
                      whileHover={{ y: -4 }}
                      className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#00F0FF] transition-all cursor-pointer"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      data-testid={`recommended-course-${course.id}`}
                    >
                      <div className="aspect-video rounded-lg bg-gradient-to-br from-[#00F0FF]/20 to-[#39FF14]/20 mb-3 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-[#00F0FF]" />
                      </div>
                      <h4 className="font-semibold mb-1">{course.title}</h4>
                      <p className="text-xs text-zinc-400 mb-2">{course.instructor_name}</p>
                      <Badge variant="secondary" className="text-xs">{course.students_enrolled} students</Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-[#00F0FF]/30 bg-zinc-900 shadow-[0_0_30px_rgba(0,240,255,0.1)]" data-testid="ai-engagement-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#39FF14] flex items-center justify-center">
                    <Brain className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>AI Engagement Tracking</h3>
                  <p className="text-sm text-zinc-400 mb-4">
                    Start a focus session to track your engagement and earn rewards
                  </p>
                  <Button
                    onClick={() => navigate('/courses')}
                    className="w-full bg-[#00F0FF] hover:bg-[#00C2CC] text-black font-semibold"
                    data-testid="start-session-button"
                  >
                    Start Learning
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                  <Award className="w-5 h-5 text-[#FFE600]" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats?.total_study_hours > 0 ? (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                      <div className="w-10 h-10 rounded-lg bg-[#FFE600]/10 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-[#FFE600]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">First Hour</p>
                        <p className="text-xs text-zinc-500">Completed 1 hour of study</p>
                      </div>
                    </div>
                    {stats?.total_sessions > 0 && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                        <div className="w-10 h-10 rounded-lg bg-[#39FF14]/10 flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-[#39FF14]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Focus Master</p>
                          <p className="text-xs text-zinc-500">Completed first focus session</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-zinc-500">Start learning to earn achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-gradient-to-br from-[#FF007F]/10 to-[#FFE600]/10">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Feeling Hungry?</h3>
                <p className="text-sm text-zinc-400 mb-4">
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
