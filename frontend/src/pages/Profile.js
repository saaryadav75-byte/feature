import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { motion } from 'framer-motion';
import { User, Trophy, Coins, Clock, TrendingUp, Award, Flame } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [statsRes, achievementsRes, streakRes] = await Promise.all([
        api.get('/gamification/stats'),
        api.get('/gamification/achievements'),
        api.get('/gamification/streak')
      ]);
      
      setStats(statsRes.data);
      setAchievements(achievementsRes.data);
      setStreak(streakRes.data);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const levelProgress = stats ? ((stats.total_xp % 100) / 100) * 100 : 0;

  return (
    <div className="min-h-screen p-6 lg:p-12 noise-bg" style={{ background: '#09090B' }} data-testid="profile-page">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-6 text-zinc-400 hover:text-white"
          >
            ← Back to Dashboard
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-zinc-800 bg-zinc-950">
                <CardContent className="p-8">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#39FF14] flex items-center justify-center">
                      <User className="w-12 h-12 text-black" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>{user?.name}</h1>
                      <p className="text-zinc-400">{user?.email}</p>
                      <Badge className="mt-2 bg-[#00F0FF] text-black">
                        Level {stats?.level || 1}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-400">XP Progress</span>
                        <span className="font-semibold" style={{ fontFamily: 'JetBrains Mono', color: '#00F0FF' }}>
                          {stats?.total_xp || 0} XP
                        </span>
                      </div>
                      <Progress value={levelProgress} className="h-3" />
                      <p className="text-xs text-zinc-500 mt-1">
                        {Math.ceil(100 - levelProgress)} XP to next level
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                    <Trophy className="w-6 h-6 text-[#FFE600]" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {achievements.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                      <Award className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Start learning to unlock achievements!</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {achievements.map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          whileHover={{ scale: 1.02 }}
                          className="p-4 rounded-xl bg-zinc-900 border border-zinc-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{achievement.details?.icon || '🏆'}</div>
                            <div className="flex-1">
                              <h4 className="font-semibold">{achievement.details?.name}</h4>
                              <p className="text-xs text-zinc-400">{achievement.details?.description}</p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                +{achievement.details?.coins_reward} coins
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-[#00F0FF]/30 bg-zinc-900">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit' }}>
                    <Flame className="w-5 h-5 text-[#FF3B30]" />
                    Study Streak
                  </h3>
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2" style={{ fontFamily: 'JetBrains Mono', color: '#FF3B30' }}>
                      {streak?.current_streak || 0}
                    </div>
                    <p className="text-sm text-zinc-400 mb-4">days in a row</p>
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                      <p className="text-xs text-zinc-500">Longest Streak</p>
                      <p className="text-lg font-bold" style={{ color: '#FFE600' }}>
                        {streak?.longest_streak || 0} days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Outfit' }}>Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-[#FFE600]" />
                        <span className="text-sm">Coins</span>
                      </div>
                      <span className="font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#FFE600' }}>
                        {stats?.coins || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#00F0FF]" />
                        <span className="text-sm">Study Hours</span>
                      </div>
                      <span className="font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#00F0FF' }}>
                        {stats?.total_study_hours?.toFixed(1) || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#39FF14]" />
                        <span className="text-sm">XP</span>
                      </div>
                      <span className="font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#39FF14' }}>
                        {stats?.total_xp || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#FF007F]" />
                        <span className="text-sm">Achievements</span>
                      </div>
                      <span className="font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#FF007F' }}>
                        {stats?.achievements_unlocked || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-950">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Outfit' }}>View More</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => navigate('/leaderboard')}
                      variant="outline"
                      className="w-full border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black"
                    >
                      Leaderboard
                    </Button>
                    <Button
                      onClick={() => navigate('/orders/history')}
                      variant="outline"
                      className="w-full"
                    >
                      Order History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
