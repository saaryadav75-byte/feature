import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function CreateCourse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/courses', {
        title,
        description,
        thumbnail: null
      });
      toast.success('Course created successfully!');
      navigate(`/courses/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">Only instructors can create courses</p>
          <Button onClick={() => navigate('/courses')} className="mt-4">Back to Courses</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-12 noise-bg bg-slate-50 dark:bg-white dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={() => navigate('/courses')}
            variant="ghost"
            className="mb-6 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>

          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-[#00F0FF]/10 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#00F0FF]" />
                </div>
                <CardTitle className="text-3xl" style={{ fontFamily: 'Outfit' }}>Create New Course</CardTitle>
              </div>
              <p className="text-zinc-400">Share your knowledge with students around the world</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Introduction to Machine Learning"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-[#00F0FF]"
                    data-testid="course-title-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what students will learn in this course..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={6}
                    className="bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-[#00F0FF] resize-none"
                    data-testid="course-description-input"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-[#00F0FF] hover:bg-[#00C2CC] text-black font-semibold text-lg py-6"
                    disabled={loading}
                    data-testid="create-course-submit-button"
                  >
                    {loading ? 'Creating...' : 'Create Course'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/courses')}
                    className="px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
