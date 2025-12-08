import React from 'react'
import { Navbar } from '../components/Navbar'
import { LayoutDashboard, Users, Bell, Command, Terminal, Shield } from 'lucide-react'

export const Help: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

                {/* Header */}
                <div className="border-b border-primary-500/20 pb-8 text-center">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-white font-[Orbitron] uppercase tracking-[0.2em] mb-4 text-shadow-glow">
                        System_Manual
                    </h1>
                    <p className="text-primary-400 font-mono text-xs tracking-widest uppercase">
                        &gt; ACCESSING_DOCUMENTATION_DATABASE...
                    </p>
                </div>

                {/* Section: Mission Control */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-500/10 p-3 rounded-lg border border-primary-500/30">
                            <LayoutDashboard className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white font-[Orbitron] uppercase tracking-wider">Mission_Control</h2>
                            <p className="text-slate-500 font-mono text-sm">JOB_TRACKING_PROTOCOL</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-primary-500">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Command className="w-4 h-4 text-primary-500" />
                                Managing Applications
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Tracks all open job applications. Use the <strong className="text-white">INIT_NEW_PROTOCOL</strong> button to add a new job.
                                Each entry ("Data Block") allows you to update status (Applied, Interviewing, Offer, etc.), log notes, and store secure credentials.
                            </p>
                        </div>
                        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-emerald-500">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-emerald-500" />
                                Search & Filters
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Use the terminal input to search by company or role. Filter the data stream by clicking the status markers (e.g., [ INTERVIEWING ]) to focus on specific stages of your pipeline.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

                {/* Section: Network Nodes */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-500/10 p-3 rounded-lg border border-primary-500/30">
                            <Users className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white font-[Orbitron] uppercase tracking-wider">Network_Nodes</h2>
                            <p className="text-slate-500 font-mono text-sm">FRIEND_CONNECTION_SYSTEM</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Establishing Connections</h3>
                                <p className="text-slate-400 text-sm">
                                    Expand your network by inputting a user's email ID into the "Ping_Node" terminal. Once accepted, they will appear in your Active Nodes grid.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Incoming Signals</h3>
                                <p className="text-slate-400 text-sm">
                                    Friend requests appear as "Incoming Signals". You can Accept to establish a secure link or Reject to block the connection.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

                {/* Section: System Features */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-500/10 p-3 rounded-lg border border-primary-500/30">
                            <Shield className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white font-[Orbitron] uppercase tracking-wider">System_Features</h2>
                            <p className="text-slate-500 font-mono text-sm">CORE_CAPABILITIES</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-slate-800/20 p-4 rounded-lg border border-slate-700/50 hover:border-primary-500/50 transition-colors">
                            <Bell className="w-6 h-6 text-yellow-400 mb-3" />
                            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-1">Alert_System</h4>
                            <p className="text-xs text-slate-500">Real-time notifications for status updates from your network.</p>
                        </div>
                        <div className="bg-slate-800/20 p-4 rounded-lg border border-slate-700/50 hover:border-primary-500/50 transition-colors">
                            <Shield className="w-6 h-6 text-green-400 mb-3" />
                            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-1">Encrypted_Vault</h4>
                            <p className="text-xs text-slate-500">Passwords and sensitive data are encrypted at rest using industry standards.</p>
                        </div>
                        <div className="bg-slate-800/20 p-4 rounded-lg border border-slate-700/50 hover:border-primary-500/50 transition-colors">
                            <Terminal className="w-6 h-6 text-primary-400 mb-3" />
                            <h4 className="font-bold text-white text-sm uppercase tracking-wide mb-1">Cyber_UI</h4>
                            <p className="text-xs text-slate-500">Immersive interface designed for optimal efficiency and focus.</p>
                        </div>
                    </div>
                </section>

                <div className="mt-12 text-center pt-8 border-t border-slate-800">
                    <p className="text-slate-600 text-[10px] font-mono tracking-[0.2em] uppercase">
                        END_OF_FILE // SYSTEM_VERSION_3.0
                    </p>
                </div>
            </main>
        </div>
    )
}
