import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [metric, setMetric] = useState('coins');
  const [loading, setLoading] = useState(true);

  useEffect(() => {    fetchLeaderboard();
  }, [metric]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/gamification/leaderboard?metric=${metric}&limit=20`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-[#FFE600]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-zinc-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-[#CD7F32]" />;
    return <span className="text-zinc-500 font-bold">{rank}</span>;
  };

  return (
    <div className="min-h-screen p-6 lg:p-12 noise-bg bg-slate-50 dark:bg-white dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => navigate('/dashboard')} variant="ghost" className="mb-6">← Back</Button>
        
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardHeader>
            <CardTitle className="text-3xl" style={{ fontFamily: 'Outfit' }}>Leaderboard</CardTitle>
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant={metric === 'coins' ? 'default' : 'outline'} onClick={() => setMetric('coins')} className={metric === 'coins' ? 'bg-[#00F0FF] text-black' : ''}>Coins</Button>
              <Button size="sm" variant={metric === 'total_study_hours' ? 'default' : 'outline'} onClick={() => setMetric('total_study_hours')} className={metric === 'total_study_hours' ? 'bg-[#00F0FF] text-black' : ''}>Study Hours</Button>
              <Button size="sm" variant={metric === 'total_xp' ? 'default' : 'outline'} onClick={() => setMetric('total_xp')} className={metric === 'total_xp' ? 'bg-[#00F0FF] text-black' : ''}>XP</Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8"><div className="w-12 h-12 border-4 border-[#00F0FF] border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <motion.div key={entry.rank} whileHover={{ x: 4 }} className={`p-4 rounded-xl border transition-all ${
                    entry.rank <= 3 ? 'bg-zinc-900 border-[#00F0FF]/30' : 'bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 flex items-center justify-center">{getMedalIcon(entry.rank)}</div>
                        <div>
                          <p className="font-semibold">{entry.name}</p>
                          <p className="text-xs text-zinc-500">Rank #{entry.rank}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ fontFamily: 'JetBrains Mono', color: '#00F0FF' }}>
                          {entry.value.toFixed(metric === 'total_study_hours' ? 1 : 0)}
                        </p>
                        <p className="text-xs text-zinc-500">{metric.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
