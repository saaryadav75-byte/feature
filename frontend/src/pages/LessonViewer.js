import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Eye, Coffee, 
  Brain, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

export default function LessonViewer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionId, setSessionId] = useState(null);
  const [engagementState, setEngagementState] = useState('focused');
  const timerRef = useRef(null);

  useEffect(() => {
    fetchLesson();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${lessonId}`);
      setLesson(response.data);
    } catch (error) {
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  if (!lesson) return <div className="min-h-screen flex items-center justify-center"><p>Lesson not found</p></div>;

  return (
    <div className="min-h-screen p-6 lg:p-12" style={{ background: '#09090B' }}>
      <div className="max-w-7xl mx-auto">
        <Button onClick={() => navigate(-1)} className="mb-6">Back</Button>
        <Card className="border-zinc-800 bg-zinc-950 p-8">
          <h1 className="text-3xl font-bold mb-4">{lesson.title}</h1>
          <p className="text-zinc-300">{lesson.content}</p>
        </Card>
      </div>
    </div>
  );
}
