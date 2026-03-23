import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { GraduationCap, BookOpen, UtensilsCrossed, LogOut, User } from 'lucide-react';

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
    <nav className="glass-card border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2" data-testid="nav-logo">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#39FF14] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-black" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Outfit' }}>SmartLearn</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/dashboard') ? 'text-[#00F0FF]' : 'text-zinc-400 hover:text-white'
              }`}
              data-testid="nav-dashboard"
            >
              <User className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/courses"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/courses') ? 'text-[#00F0FF]' : 'text-zinc-400 hover:text-white'
              }`}
              data-testid="nav-courses"
            >
              <BookOpen className="w-4 h-4" />
              Courses
            </Link>
            <Link
              to="/food"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/food') ? 'text-[#00F0FF]' : 'text-zinc-400 hover:text-white'
              }`}
              data-testid="nav-food"
            >
              <UtensilsCrossed className="w-4 h-4" />
              Food
            </Link>
            <Link
              to="/profile"
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                isActive('/profile') ? 'text-[#00F0FF]' : 'text-zinc-400 hover:text-white'
              }`}
              data-testid="nav-profile"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white"
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
