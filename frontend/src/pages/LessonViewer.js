import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Switch } from '../components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Eye, Coffee, 
  Brain, CheckCircle, AlertCircle, Sparkles, Video, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

export default function LessonViewer() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Pomodoro Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  
  // AI Engagement State
  const [engagementState, setEngagementState] = useState('focused');
  const [engagementLogs, setEngagementLogs] = useState([]);
  const [aiDetectionActive, setAiDetectionActive] = useState(false);
  
  const timerRef = useRef(null);
  const engagementRef = useRef(null);

  useEffect(() => {
    fetchLesson();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (engagementRef.current) clearInterval(engagementRef.current);
    };
  }, [lessonId]);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  useEffect(() => {
    if (aiDetectionActive && timerActive) {
      engagementRef.current = setInterval(() => {
        simulateEngagementDetection();
      }, 10000);
    } else {
      if (engagementRef.current) clearInterval(engagementRef.current);
    }
    return () => {
      if (engagementRef.current) clearInterval(engagementRef.current);
    };
  }, [aiDetectionActive, timerActive]);

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

  const startFocusSession = async () => {
    try {
      const response = await api.post('/focus-sessions/start', { lesson_id: lessonId });
      setSessionId(response.data.id);
      setTimerActive(true);
      setTimeLeft(25 * 60);
      setIsBreak(false);
      
      // Update streak
      await api.post('/gamification/streak/update');
      
      toast.success('Focus session started! Stay focused to earn rewards.', { 
        icon: '🎯',
        duration: 3000 
      });
    } catch (error) {
      toast.error('Failed to start session');
    }
  };

  const handleTimerComplete = async () => {
    setTimerActive(false);
    
    if (!isBreak && sessionId) {
      try {
        const durationMinutes = 25;
        const response = await api.post('/focus-sessions/end', {
          session_id: sessionId,
          duration_minutes: durationMinutes,
          engagement_logs: engagementLogs
        });
        
        // Award coins and XP
        const coinsEarned = response.data.coins_earned;
        await api.post('/gamification/coins/update', {
          amount: 5,
          transaction_type: 'earned',
          description: 'Completed Pomodoro session'
        });
        
        // Confetti effect for completion
        toast.success(`🎉 Session complete! Earned ${coinsEarned + 5} coins!`, {
          duration: 5000,
          position: 'top-center'
        });
        
        // Update lesson progress
        await api.post('/progress', {
          lesson_id: lessonId,
          course_id: lesson.course_id,
          completion_percentage: 100,
          time_spent_minutes: durationMinutes
        });
        
        // Award XP
        await api.post('/gamification/coins/update', {
          amount: 0,
          transaction_type: 'xp_earned',
          description: 'Completed focus session'
        });
        
        setPomodoroCount(prev => prev + 1);
        setIsBreak(true);
        setTimeLeft(5 * 60);
        
        toast('☕ Time for a 5-minute break! You deserve it.', { 
          icon: '🎊',
          duration: 4000 
        });
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
    } else if (isBreak) {
      toast.success('Break complete! Ready for another session?', { icon: '💪' });
      setIsBreak(false);
      setTimeLeft(25 * 60);
      setSessionId(null);
    }
    
    setEngagementLogs([]);
  };

  const toggleTimer = () => {
    if (!timerActive && !sessionId && !isBreak) {
      startFocusSession();
    } else {
      setTimerActive(!timerActive);
    }
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(25 * 60);
    setIsBreak(false);
    setSessionId(null);
    setEngagementLogs([]);
  };

  const toggleAIDetection = () => {
    if (!aiDetectionActive) {
      toast('👁️ AI engagement tracking enabled', { 
        description: 'Your focus levels will be monitored (simulated)',
        duration: 3000 
      });
    } else {
      toast('AI engagement tracking disabled', { icon: '🔕' });
    }
    setAiDetectionActive(!aiDetectionActive);
  };

  const simulateEngagementDetection = () => {
    const states = ['focused', 'tired', 'distracted'];
    const weights = [0.7, 0.2, 0.1];
    
    const random = Math.random();
    let cumulativeWeight = 0;
    let selectedState = 'focused';
    
    for (let i = 0; i < states.length; i++) {
      cumulativeWeight += weights[i];
      if (random < cumulativeWeight) {
        selectedState = states[i];
        break;
      }
    }
    
    setEngagementState(selectedState);
    
    const log = {
      state: selectedState,
      timestamp: new Date().toISOString()
    };
    
    setEngagementLogs(prev => [...prev, log]);
    
    if (sessionId) {
      api.post(`/focus-sessions/${sessionId}/log`, log).catch(console.error);
    }
    
    // Adaptive notifications
    if (selectedState === 'tired') {
      toast('😴 You seem tired. Consider taking a short break!', { 
        icon: '💤',
        duration: 4000 
      });
    } else if (selectedState === 'distracted') {
      toast('🎯 Stay focused! You can do this!', { 
        icon: '⚡',
        duration: 3000 
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEngagementIcon = () => {
    switch (engagementState) {
      case 'focused': return <Eye className="w-5 h-5 text-[#39FF14]" />;
      case 'tired': return <Coffee className="w-5 h-5 text-[#FFE600]" />;
      case 'distracted': return <AlertCircle className="w-5 h-5 text-[#FF3B30]" />;
      default: return <Eye className="w-5 h-5" />;
    }
  };

  const getEngagementColor = () => {
    switch (engagementState) {
      case 'focused': return '#39FF14';
      case 'tired': return '#FFE600';
      case 'distracted': return '#FF3B30';
      default: return '#00F0FF';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">Lesson not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const timerProgress = isBreak 
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

  return (
    <div className="min-h-screen p-6 lg:p-12 noise-bg" style={{ background: '#09090B' }} data-testid="lesson-viewer-page">
      <div className="max-w-7xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6 text-zinc-400 hover:text-white"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-zinc-800 bg-zinc-950" data-testid="lesson-content-card">
                <CardContent className="p-8">
                  <h1 className="text-3xl lg:text-4xl font-bold mb-4" style={{ fontFamily: 'Outfit' }}>
                    {lesson.title}
                  </h1>
                  
                  {lesson.video_url && (
                    <div className="aspect-video bg-zinc-900 rounded-xl mb-6 flex items-center justify-center border border-zinc-800 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/10 to-[#39FF14]/10"></div>
                      <div className="relative text-center z-10">
                        <Video className="w-16 h-16 text-[#00F0FF] mx-auto mb-4 group-hover:scale-110 transition-transform" />
                        <p className="text-zinc-400">Video Player</p>
                        <p className="text-xs text-zinc-600 mt-2">{lesson.video_url}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="prose prose-invert max-w-none">
                    <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {lesson.content}
                    </div>
                  </div>

                  <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-[#00F0FF]/5 to-[#39FF14]/5 border border-zinc-800">
                    <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                      <BookOpen className="w-5 h-5 text-[#00F0FF]" />
                      Lesson Notes
                    </h3>
                    <p className="text-sm text-zinc-400">
                      This lesson covers the fundamentals. Take your time to understand each concept and practice regularly for best results.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            {/* Pomodoro Timer Card */}
            <Card 
              className="border-2 bg-zinc-900 transition-all duration-300"
              style={{
                borderColor: timerActive ? getEngagementColor() : 'rgba(0, 240, 255, 0.3)',
                boxShadow: timerActive ? `0 0 30px ${getEngagementColor()}20` : '0 0 30px rgba(0,240,255,0.1)'
              }}
              data-testid="pomodoro-timer-card"
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Brain className="w-6 h-6 text-[#00F0FF]" />
                    <h3 className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>
                      {isBreak ? '☕ Break Time' : '🎯 Focus Session'}
                    </h3>
                  </div>
                  
                  {/* Circular Timer */}
                  <div className="relative mb-6">
                    <svg className="w-48 h-48 mx-auto -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-zinc-800"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke={isBreak ? '#FFE600' : '#00F0FF'}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - timerProgress / 100)}`}
                        className="transition-all duration-1000"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div 
                          className="text-5xl font-bold"
                          style={{ fontFamily: 'JetBrains Mono', color: isBreak ? '#FFE600' : '#00F0FF' }}
                        >
                          {formatTime(timeLeft)}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          {isBreak ? 'Break' : 'Focus'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-6">
                    <Button
                      onClick={toggleTimer}
                      className="flex-1 bg-[#00F0FF] hover:bg-[#00C2CC] text-black font-semibold"
                      data-testid="timer-toggle-button"
                    >
                      {timerActive ? (
                        <><Pause className="w-4 h-4 mr-2" /> Pause</>
                      ) : (
                        <><Play className="w-4 h-4 mr-2" /> Start</>
                      )}
                    </Button>
                    <Button
                      onClick={resetTimer}
                      variant="outline"
                      className="border-zinc-700"
                      data-testid="timer-reset-button"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Pomodoro Counter */}
                  {pomodoroCount > 0 && (
                    <div className="mb-4 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <p className="text-sm text-zinc-400">Sessions Completed Today</p>
                      <p className="text-3xl font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#39FF14' }}>
                        {pomodoroCount}
                      </p>
                    </div>
                  )}

                  {/* AI Detection Toggle */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">AI Engagement</span>
                      <Switch
                        checked={aiDetectionActive}
                        onCheckedChange={toggleAIDetection}
                        data-testid="ai-detection-toggle"
                      />
                    </div>
                    
                    <AnimatePresence>
                      {aiDetectionActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3"
                        >
                          <div 
                            className="p-3 rounded-lg border relative overflow-hidden"
                            style={{ 
                              backgroundColor: `${getEngagementColor()}10`,
                              borderColor: `${getEngagementColor()}30`
                            }}
                          >
                            {timerActive && (
                              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 animate-pulse"
                                   style={{ color: getEngagementColor() }}
                              />
                            )}
                            <div className="flex items-center gap-2 justify-center">
                              {getEngagementIcon()}
                              <span className="font-semibold capitalize" style={{ color: getEngagementColor() }}>
                                {engagementState}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Session Stats */}
                  {engagementLogs.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 rounded-lg bg-zinc-950 border border-zinc-800"
                    >
                      <p className="text-xs text-zinc-500 mb-2">Session Stats</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-bold text-[#39FF14]" style={{ fontFamily: 'JetBrains Mono' }}>
                            {engagementLogs.filter(l => l.state === 'focused').length}
                          </div>
                          <div className="text-xs text-zinc-500">Focused</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-[#FFE600]" style={{ fontFamily: 'JetBrains Mono' }}>
                            {engagementLogs.filter(l => l.state === 'tired').length}
                          </div>
                          <div className="text-xs text-zinc-500">Tired</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-[#FF3B30]" style={{ fontFamily: 'JetBrains Mono' }}>
                            {engagementLogs.filter(l => l.state === 'distracted').length}
                          </div>
                          <div className="text-xs text-zinc-500">Distracted</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card className="border-zinc-800 bg-zinc-950">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#FFE600]" />
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'Outfit' }}>Study Tips</h3>
                </div>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#39FF14] mt-0.5 flex-shrink-0" />
                    <span>Use Pomodoro (25min) for maximum focus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#39FF14] mt-0.5 flex-shrink-0" />
                    <span>Take breaks to prevent burnout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#39FF14] mt-0.5 flex-shrink-0" />
                    <span>Enable AI tracking for adaptive learning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-[#39FF14] mt-0.5 flex-shrink-0" />
                    <span>Earn coins & XP by staying focused!</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Break Suggestion */}
            <Card className="border-zinc-800 bg-gradient-to-br from-[#FF007F]/10 to-[#FFE600]/10">
              <CardContent className="p-6 text-center">
                <Coffee className="w-8 h-8 text-[#FF007F] mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Need a Break?</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Grab a healthy snack to boost your energy!
                </p>
                <Button
                  onClick={() => navigate('/food')}
                  variant="outline"
                  className="w-full border-[#FF007F] text-[#FF007F] hover:bg-[#FF007F] hover:text-white"
                  data-testid="food-menu-button"
                >
                  View Food Menu
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
