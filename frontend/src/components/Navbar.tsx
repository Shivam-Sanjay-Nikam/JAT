
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { LayoutDashboard, Users, LogOut, Briefcase, Menu, X, BookOpen } from 'lucide-react'
import { NotificationBell } from './NotificationBell'
import { useFriendRequests } from '../hooks/useFriendRequests'

export const Navbar: React.FC = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { pendingCount } = useFriendRequests()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b-primary-500/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center gap-2">
                        {/* Logo and Title */}
                        <img src="/FODENGE.png" alt="Fodenge Logo" className="w-8 h-8 object-contain" />
                        <span className="text-lg font-bold tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-emerald-400 font-[Orbitron]">
                            Fodenge
                        </span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className="link-tech flex items-center gap-2 text-xs">
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/friends" className="link-tech flex items-center gap-2 relative text-xs">
                            <Users className="w-3.5 h-3.5" />
                            <span>Network_Nodes</span>
                            {pendingCount > 0 && (
                                <span className="absolute -top-2 -right-3 w-4 h-4 bg-primary-500 text-slate-900 text-[10px] font-bold flex items-center justify-center rounded-sm animate-pulse">
                                    {pendingCount}
                                </span>
                            )}
                        </Link>

                        <div className="h-5 w-px bg-slate-800 mx-2 rotate-12" />

                        <NotificationBell />

                        <button
                            onClick={handleSignOut}
                            className="text-slate-500 hover:text-red-400 transition-colors uppercase text-[10px] tracking-widest flex items-center gap-2"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden lg:inline">Disconnect</span>
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <NotificationBell />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-slate-400 hover:text-white"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800 absolute w-full left-0 animate-fade-in">
                    <div className="px-4 py-4 space-y-4">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-slate-300 hover:text-primary-400 font-mono text-sm uppercase tracking-wider p-2 rounded hover:bg-slate-800/50">
                            <LayoutDashboard className="w-5 h-5" />
                            Dashboard
                        </Link>
                        <Link to="/friends" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-slate-300 hover:text-primary-400 font-mono text-sm uppercase tracking-wider p-2 rounded hover:bg-slate-800/50">
                            <Users className="w-5 h-5" />
                            Network Nodes
                            {pendingCount > 0 && (
                                <span className="bg-primary-500 text-slate-900 text-xs px-1.5 rounded-sm font-bold">
                                    {pendingCount}
                                </span>
                            )}
                        </Link>
                        <button onClick={handleSignOut} className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 font-mono text-sm uppercase tracking-wider p-2 rounded hover:bg-slate-800/50">
                            <LogOut className="w-5 h-5" />
                            Disconnect
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}
