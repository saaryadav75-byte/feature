import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { motion } from 'framer-motion';
import { BookOpen, Users, Search, Plus, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function Courses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  }, [searchQuery, courses]);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses');
      setCourses(response.data);
      setFilteredCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId, e) => {
    e.stopPropagation();
    try {
      await api.post(`/courses/${courseId}/enroll`);
      toast.success('Enrolled successfully!');
      navigate(`/courses/${courseId}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Enrollment failed');
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
          <p className="text-zinc-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-12 noise-bg bg-slate-50 dark:bg-white dark:bg-zinc-950" data-testid="courses-page">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>
                Course Catalog
              </h1>
              <p className="text-zinc-400 text-lg">Discover courses tailored to your learning goals</p>
            </div>
            {user?.role === 'instructor' && (
              <Button
                onClick={() => navigate('/create-course')}
                className="bg-[#00F0FF] hover:bg-[#00C2CC] text-black font-semibold"
                data-testid="create-course-button"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Course
              </Button>
            )}
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-[#00F0FF]"
                data-testid="course-search-input"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCourses.map((course) => (
            <motion.div key={course.id} variants={item}>
              <Card
                className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-[#00F0FF] transition-all cursor-pointer h-full overflow-hidden group"
                onClick={() => navigate(`/courses/${course.id}`)}
                data-testid={`course-card-${course.id}`}
              >
                <div className="aspect-video bg-gradient-to-br from-[#00F0FF]/20 to-[#39FF14]/20 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-16 h-16 text-[#00F0FF] opacity-50" />
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl" style={{ fontFamily: 'Outfit' }}>{course.title}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-zinc-400">
                      by {course.instructor_name}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {course.students_enrolled}
                    </Badge>
                  </div>
                  <Button
                    onClick={(e) => handleEnroll(course.id, e)}
                    className="w-full bg-[#00F0FF] hover:bg-[#00C2CC] text-black font-semibold"
                    data-testid={`enroll-button-${course.id}`}
                  >
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">No courses found</p>
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery('')}
                variant="outline"
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
