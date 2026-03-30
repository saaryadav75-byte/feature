import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(email, password, name, role);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.detail || error.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 noise-bg bg-slate-50 dark:bg-white dark:bg-zinc-950">
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
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Outfit' }}>Join Us</h1>
          <p className="text-zinc-400">Start your adaptive learning journey today</p>
        </div>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl" data-testid="register-card">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ fontFamily: 'Outfit' }}>Create Account</CardTitle>
            <CardDescription>Fill in your details to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  data-testid="register-name-input"
                  className="bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-[#00F0FF] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="register-email-input"
                  className="bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-[#00F0FF] transition-colors"
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
                  minLength={6}
                  data-testid="register-password-input"
                  className="bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-[#00F0FF] transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">I am a</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger data-testid="register-role-select" className="bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:border-[#00F0FF]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                    <SelectItem value="student" data-testid="role-option-student">Student</SelectItem>
                    <SelectItem value="instructor" data-testid="role-option-instructor">Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#00F0FF] hover:bg-[#00C2CC] text-black font-semibold text-base transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                disabled={loading}
                data-testid="register-submit-button"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-zinc-400">
                Already have an account?{' '}
                <Link to="/login" className="text-[#00F0FF] hover:text-[#00C2CC] font-medium transition-colors" data-testid="login-link">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
