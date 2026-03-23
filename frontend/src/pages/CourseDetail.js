import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { motion } from 'framer-motion';
import { BookOpen, Play, Clock, ChevronRight, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CourseDetail() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, lessonsRes, progressRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/lessons`),
        api.get(`/progress/course/${courseId}`).catch(() => ({ data: [] }))
      ]);
      
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
      setProgress(progressRes.data);
      setEnrolled(progressRes.data.length > 0);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      toast.success('Enrolled successfully!');
      setEnrolled(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Enrollment failed');
    }
  };

  const getLessonProgress = (lessonId) => {
    const lessonProgress = progress.find(p => p.lesson_id === lessonId);
    return lessonProgress?.completion_percentage || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">Course not found</p>
          <Button onClick={() => navigate('/courses')} className="mt-4">Back to Courses</Button>
        </div>
      </div>
    );
  }

  const completedLessons = lessons.filter(lesson => getLessonProgress(lesson.id) === 100).length;
  const overallProgress = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  return (
    <div className="min-h-screen p-6 lg:p-12 noise-bg" style={{ background: '#09090B' }} data-testid="course-detail-page">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={() => navigate('/courses')}
            variant="ghost"
            className="mb-6 text-zinc-400 hover:text-white"
            data-testid="back-to-courses-button"
          >
            ← Back to Courses
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-zinc-800 bg-zinc-950">
                <div className="aspect-video bg-gradient-to-br from-[#00F0FF]/20 to-[#39FF14]/20 flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-[#00F0FF] opacity-50" />
                </div>
                <CardHeader>
                  <CardTitle className="text-3xl" style={{ fontFamily: 'Outfit' }}>{course.title}</CardTitle>
                  <p className="text-zinc-400">Instructor: {course.instructor_name}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-300 leading-relaxed">{course.description}</p>
                  <div className="flex items-center gap-4 mt-6">
                    <Badge variant="secondary">{course.students_enrolled} students enrolled</Badge>
                    <Badge variant="outline">{lessons.length} lessons</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                    <Play className="w-6 h-6 text-[#00F0FF]" />
                    Course Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lessons.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                      No lessons available yet
                    </div>
                  ) : (
                    lessons.map((lesson, index) => {
                      const lessonProgress = getLessonProgress(lesson.id);
                      const isCompleted = lessonProgress === 100;
                      const canAccess = enrolled;

                      return (
                        <motion.div
                          key={lesson.id}
                          whileHover={canAccess ? { x: 4 } : {}}
                          className={`p-4 rounded-xl border transition-all ${
                            canAccess
                              ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 cursor-pointer'
                              : 'bg-zinc-900/50 border-zinc-800/50 opacity-60'
                          }`}
                          onClick={() => canAccess && navigate(`/lessons/${lesson.id}`)}
                          data-testid={`lesson-item-${lesson.id}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isCompleted ? 'bg-[#39FF14]/10' : canAccess ? 'bg-[#00F0FF]/10' : 'bg-zinc-800'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-[#39FF14]" />
                              ) : canAccess ? (
                                <Play className="w-5 h-5 text-[#00F0FF]" />
                              ) : (
                                <Lock className="w-5 h-5 text-zinc-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">Lesson {index + 1}: {lesson.title}</h4>
                              <div className="flex items-center gap-3 text-sm text-zinc-400">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {lesson.duration_minutes} min
                                </span>
                                {canAccess && lessonProgress > 0 && (
                                  <span className="text-[#00F0FF]">{lessonProgress.toFixed(0)}% complete</span>
                                )}
                              </div>
                            </div>
                            {canAccess ? (
                              <ChevronRight className="w-5 h-5 text-zinc-600" />
                            ) : (
                              <Lock className="w-5 h-5 text-zinc-600" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {enrolled ? (
                <Card className="border-[#00F0FF]/30 bg-zinc-900 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Outfit' }}>Your Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-zinc-400">Overall completion</span>
                          <span className="font-semibold" style={{ fontFamily: 'JetBrains Mono', color: '#00F0FF' }}>
                            {overallProgress.toFixed(0)}%
                          </span>
                        </div>
                        <Progress value={overallProgress} className="h-3" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800">
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Completed</p>
                          <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#39FF14' }}>
                            {completedLessons}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Remaining</p>
                          <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono' }}>
                            {lessons.length - completedLessons}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-[#00F0FF]/30 bg-zinc-900 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Ready to Start?</h3>
                    <p className="text-sm text-zinc-400 mb-6">
                      Enroll in this course to access all lessons and track your progress
                    </p>
                    <Button
                      onClick={handleEnroll}
                      className="w-full bg-[#00F0FF] hover:bg-[#00C2CC] text-black font-semibold text-lg py-6"
                      data-testid="enroll-course-button"
                    >
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="border-zinc-800 bg-zinc-950">
                <CardHeader>
                  <CardTitle className="text-lg" style={{ fontFamily: 'Outfit' }}>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-zinc-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#39FF14] mt-0.5 flex-shrink-0" />
                      <span>Master key concepts through interactive lessons</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#39FF14] mt-0.5 flex-shrink-0" />
                      <span>Track engagement with AI-powered focus detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#39FF14] mt-0.5 flex-shrink-0" />
                      <span>Earn rewards for consistent study habits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#39FF14] mt-0.5 flex-shrink-0" />
                      <span>Apply knowledge through practical exercises</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
