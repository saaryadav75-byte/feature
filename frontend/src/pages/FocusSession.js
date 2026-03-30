import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import {
  Play, Pause, Square, Brain, Eye, Coffee,
  TrendingUp, Award, Clock, Target
} from 'lucide-react';
import { toast } from 'sonner';

export default function FocusSession() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [targetTime, setTargetTime] = useState(25); // 25 minutes Pomodoro
  const [engagementState, setEngagementState] = useState('focused');
  const [focusScore, setFocusScore] = useState(100);
  const [engagementLogs, setEngagementLogs] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (sessionActive && !sessionPaused) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
        // Simulate engagement tracking
        simulateEngagement();
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [sessionActive, sessionPaused]);

  const simulateEngagement = () => {
    // Simulate different engagement states
    const states = ['focused', 'tired', 'distracted'];
    const randomState = states[Math.floor(Math.random() * states.length)];
    setEngagementState(randomState);

    const newLog = {
      timestamp: new Date().toISOString(),
      state: randomState,
      score: randomState === 'focused' ? 100 : randomState === 'tired' ? 70 : 40
    };

    setEngagementLogs(prev => [...prev, newLog]);
    setFocusScore(prev => Math.max(0, prev - (randomState === 'distracted' ? 5 : 1)));
  };

  const startSession = async () => {
    try {
      const response = await api.post('/focus-sessions/start', { lesson_id: 'focus-session' });
      setSessionId(response.data.id);
      setSessionActive(true);
      setSessionTime(0);
      setEngagementLogs([]);
      setFocusScore(100);
      toast.success('Focus session started! Stay focused to earn rewards.');
    } catch (error) {
      toast.error('Failed to start session');
    }
  };

  const pauseSession = () => {
    setSessionPaused(!sessionPaused);
  };

  const endSession = async () => {
    try {
      await api.post('/focus-sessions/end', {
        session_id: sessionId,
        duration_minutes: Math.floor(sessionTime / 60),
        engagement_logs: engagementLogs
      });

      // Update streak
      await api.post('/gamification/streak/update');

      // Award coins
      const focusedCount = engagementLogs.filter(log => log.state === 'focused').length;
      const coinsEarned = Math.min(focusedCount * 2, 50);
      if (coinsEarned > 0) {
        await api.post('/gamification/coins/update', {
          amount: coinsEarned,
          transaction_type: 'earned',
          description: `Focus session reward: ${Math.floor(sessionTime / 60)} minutes`
        });
      }

      toast.success(`Session completed! Earned ${coinsEarned} coins. Focus score: ${focusScore}%`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEngagementIcon = (state) => {
    switch (state) {
      case 'focused': return <Eye className="w-5 h-5 text-green-600" />;
      case 'tired': return <Coffee className="w-5 h-5 text-yellow-600" />;
      case 'distracted': return <Target className="w-5 h-5 text-red-600" />;
      default: return <Brain className="w-5 h-5 text-gray-600 dark:text-zinc-400" />;
    }
  };

  const getEngagementColor = (state) => {
    switch (state) {
      case 'focused': return 'text-green-600';
      case 'tired': return 'text-yellow-600';
      case 'distracted': return 'text-red-600';
      default: return 'text-gray-600 dark:text-zinc-400';
    }
  };

  return (
    <div className="min-h-screen p-6 lg:p-12 bg-slate-50 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold mb-2 text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
            AI Focus Session
          </h1>
          <p className="text-gray-600 dark:text-zinc-400 text-lg">Track your engagement and earn rewards</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  <Brain className="w-6 h-6 text-cyan-600" />
                  Session Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-mono font-bold text-gray-900 dark:text-white mb-4">
                    {formatTime(sessionTime)}
                  </div>
                  <Progress
                    value={(sessionTime / (targetTime * 60)) * 100}
                    className="h-3 mb-4"
                  />
                  <p className="text-sm text-gray-600 dark:text-zinc-400 mb-6">
                    Target: {targetTime} minutes
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  {!sessionActive ? (
                    <Button
                      onClick={startSession}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Session
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={pauseSession}
                        variant="outline"
                        className="border-gray-300 hover:bg-gray-50"
                      >
                        {sessionPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
                        {sessionPaused ? 'Resume' : 'Pause'}
                      </Button>
                      <Button
                        onClick={endSession}
                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        End Session
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Real-time Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{focusScore}%</div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400">Focus Score</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${getEngagementColor(engagementState)}`}>
                      {getEngagementIcon(engagementState)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-zinc-400 capitalize">{engagementState}</p>
                  </div>
                </div>
                <Progress value={focusScore} className="h-2" />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  <Award className="w-5 h-5 text-yellow-600" />
                  Session Rewards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-zinc-400">Potential Coins</span>
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
                    {Math.min(engagementLogs.filter(log => log.state === 'focused').length * 2, 50)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-zinc-400">Streak Bonus</span>
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                    +1 Day
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-zinc-400">XP Earned</span>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
                    {Math.floor(sessionTime / 60) * 10}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-white" style={{ fontFamily: 'Outfit' }}>
                  <Clock className="w-5 h-5 text-purple-600" />
                  Session Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-zinc-400">
                  <li>• Keep your camera on for AI tracking</li>
                  <li>• Minimize distractions</li>
                  <li>• Take breaks when tired</li>
                  <li>• Stay hydrated and comfortable</li>
                  <li>• Focus on one task at a time</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}