
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { LayoutDashboard, Users, LogOut, Briefcase } from 'lucide-react'
import { NotificationBell } from './NotificationBell'

export const Navbar: React.FC = () => {
    const { user } = useAuth()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        navigate('/login')
    }

    return (
        <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-8 h-8 text-primary-500" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400 tracking-tight">
                            JobTracker
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-medium">
                            <LayoutDashboard className="w-5 h-5" />
                            <span className="hidden sm:inline tracking-tight">Dashboard</span>
                        </Link>
                        <Link to="/friends" className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors font-medium">
                            <Users className="w-5 h-5" />
                            <span className="hidden sm:inline tracking-tight">Friends</span>
                        </Link>

                        <div className="h-6 w-px bg-slate-800 mx-2" />

                        <NotificationBell />

                        <button
                            onClick={handleSignOut}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
