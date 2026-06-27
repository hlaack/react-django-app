import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Map as MapIcon, Users, BookOpen, Menu, X, Home, LogIn, LogOut, UserRound, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLoginModal } from '../context/LoginModalContext';

export const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, isStaff, logout } = useAuth();
    const { openLogin } = useLoginModal();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Interactive Map', path: '/map', icon: MapIcon },
        { name: 'Family Trees', path: '/families', icon: Users },
        { name: 'Lore Archive', path: '/lore', icon: BookOpen },
        ...(isStaff ? [{ name: 'Manage', path: '/manage', icon: Shield }] : []),
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-amber-900/20 bg-[#f4f1ea] dark:bg-slate-900 dark:border-slate-700 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
            <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-amber-700 dark:text-amber-500" />
                <span className="font-serif font-bold text-xl text-slate-900 dark:text-slate-100 tracking-wide">
                    World Compendium
                </span>
                </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                    <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        isActive 
                        ? 'text-amber-700 dark:text-amber-500' 
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                    >
                    <Icon className="h-4 w-4" />
                    {link.name}
                    </Link>
                );
                })}
                
                <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
                </button>

                {isAuthenticated ? (
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <UserRound className="h-4 w-4 text-amber-700 dark:text-amber-500" />
                            {user?.username}
                        </span>
                        <button
                            onClick={() => logout()}
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={openLogin}
                        className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md bg-amber-700 hover:bg-amber-800 text-white transition-colors"
                    >
                        <LogIn className="h-4 w-4" />
                        Sign In
                    </button>
                )}
            </div>

            <div className="md:hidden flex items-center gap-4">
                <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-400">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-400">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>
            </div>
        </div>

        {isMobileMenuOpen && (
            <div className="md:hidden bg-[#f4f1ea] dark:bg-slate-900 border-b border-amber-900/20 dark:border-slate-700 absolute w-full">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                    <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-900/10 dark:hover:bg-slate-800"
                    >
                    <Icon className="h-5 w-5" />
                    {link.name}
                    </Link>
                );
                })}

                <div className="border-t border-amber-900/15 dark:border-slate-700 mt-2 pt-2">
                {isAuthenticated ? (
                    <>
                    <span className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 dark:text-slate-300">
                        <UserRound className="h-5 w-5 text-amber-700 dark:text-amber-500" />
                        {user?.username}
                    </span>
                    <button
                        onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-900/10 dark:hover:bg-slate-800"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                    </>
                ) : (
                    <button
                        onClick={() => { openLogin(); setIsMobileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-amber-800 dark:text-amber-400 hover:bg-amber-900/10 dark:hover:bg-slate-800"
                    >
                        <LogIn className="h-5 w-5" />
                        Sign In
                    </button>
                )}
                </div>
            </div>
            </div>
        )}
        </nav>
    );
};