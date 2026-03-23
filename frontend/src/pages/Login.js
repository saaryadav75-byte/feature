import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 noise-bg" style={{ background: '#09090B' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-[#39FF14] flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-black" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Welcome Back</h1>
          <p className="text-zinc-400">Sign in to continue your learning journey</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-950 shadow-2xl" data-testid="login-card">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ fontFamily: 'Outfit' }}>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="login-email-input"
                  className="bg-zinc-900 border-zinc-800 focus:border-[#00F0FF] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="login-password-input"
                  className="bg-zinc-900 border-zinc-800 focus:border-[#00F0FF] transition-colors"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#00F0FF] hover:bg-[#00C2CC] text-black font-semibold text-base transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                disabled={loading}
                data-testid="login-submit-button"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#00F0FF] hover:text-[#00C2CC] font-medium transition-colors" data-testid="register-link">
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2">Demo Accounts:</p>
          <div className="text-xs text-zinc-400 space-y-1">
            <div>Student: student@test.com / password123</div>
            <div>Instructor: instructor@test.com / password123</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
