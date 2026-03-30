import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import ThemeToggle from './ThemeToggle';
import { GraduationCap, BookOpen, UtensilsCrossed, LogOut, User, Brain, Trophy } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2" data-testid="nav-logo">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#FF007F] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: 'Outfit' }}>SmartLearn</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-[#00F0FF]' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="nav-dashboard"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/courses"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/courses') ? 'text-[#00F0FF]' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="nav-courses"
            >
              <BookOpen className="w-4 h-4" />
              Courses
            </Link>
            <Link
              to="/focus-session"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/focus-session') ? 'text-[#00F0FF]' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="nav-focus"
            >
              <Brain className="w-4 h-4" />
              Focus
            </Link>
            <Link
              to="/food"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/food') ? 'text-[#00F0FF]' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="nav-food"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Food
            </Link>
            <Link
              to="/leaderboard"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/leaderboard') ? 'text-[#00F0FF]' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="nav-leaderboard"
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              to="/profile"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/profile') ? 'text-[#00F0FF]' : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid="nav-profile"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            
            <ThemeToggle />
            
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              data-testid="nav-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
