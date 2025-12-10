import React from 'react'
import { Navbar } from '../components/Navbar'
import { LayoutDashboard, Users, Bell, Command, Terminal, Shield, CheckSquare, BookOpen, FileText, Link as LinkIcon, StickyNote } from 'lucide-react'

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

                    {/* Form Fields Explanation */}
                    <div className="glass-panel p-6 rounded-xl border-l-4 border-l-blue-500 mt-6">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-blue-400" />
                            INIT_NEW_PROTOCOL Form Fields
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="border-l-2 border-slate-700 pl-3">
                                <p className="text-primary-400 font-bold text-xs mb-1">Target_Company</p>
                                <p className="text-slate-400 text-xs">The name of the company you're applying to.</p>
                            </div>
                            <div className="border-l-2 border-slate-700 pl-3">
                                <p className="text-primary-400 font-bold text-xs mb-1">Role_Designation</p>
                                <p className="text-slate-400 text-xs">The job title or position you're applying for.</p>
                            </div>
                            <div className="border-l-2 border-slate-700 pl-3">
                                <p className="text-primary-400 font-bold text-xs mb-1">Status_Check</p>
                                <p className="text-slate-400 text-xs">Current stage: APPLIED, INTERVIEWING, OFFER, ACCEPTED, REJECTED, or WITHDRAWN.</p>
                            </div>
                            <div className="border-l-2 border-slate-700 pl-3">
                                <p className="text-primary-400 font-bold text-xs mb-1">Secure_Uplink</p>
                                <p className="text-slate-400 text-xs">URL to the job posting (optional).</p>
                            </div>
                            <div className="border-l-2 border-slate-700 pl-3">
                                <p className="text-primary-400 font-bold text-xs mb-1">User_Identity</p>
                                <p className="text-slate-400 text-xs">Email address used for this application (optional).</p>
                            </div>
                            <div className="border-l-2 border-slate-700 pl-3">
                                <p className="text-primary-400 font-bold text-xs mb-1">Access_Key_Encrypted</p>
                                <p className="text-slate-400 text-xs">Password for the application portal. Stored encrypted (optional).</p>
                            </div>
                            <div className="border-l-2 border-slate-700 pl-3">
                                <p className="text-primary-400 font-bold text-xs mb-1">Geo_Coordinates</p>
                                <p className="text-slate-400 text-xs">Job location (city, state, or "Remote") (optional).</p>
                            </div>
                            <div className="border-l-2 border-slate-700 pl-3">
                                <p className="text-primary-400 font-bold text-xs mb-1">Referral_Source</p>
                                <p className="text-slate-400 text-xs">Name of person who referred you (optional).</p>
                            </div>
                            <div className="border-l-2 border-slate-700 pl-3">
                                <p className="text-primary-400 font-bold text-xs mb-1">Data_Packet</p>
                                <p className="text-slate-400 text-xs">Upload your resume PDF for this application (optional).</p>
                            </div>
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

                {/* Section: Task Protocol */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-500/10 p-3 rounded-lg border border-primary-500/30">
                            <CheckSquare className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white font-[Orbitron] uppercase tracking-wider">Task_Protocol</h2>
                            <p className="text-slate-500 font-mono text-sm">DAILY_PRODUCTIVITY_SYSTEM</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-primary-500">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Command className="w-4 h-4 text-primary-500" />
                                Daily Task Management
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Track your daily tasks with a clean interface. Add tasks using the <strong className="text-white">ADD_NEW_TASK</strong> input.
                                Check off completed items to track your progress. The system automatically calculates your completion percentage.
                            </p>
                        </div>
                        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-yellow-500">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-yellow-500" />
                                Date Navigation
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Use the <strong className="text-white">◀ ▶</strong> arrows to navigate between days. View past tasks or plan future ones.
                                Click <strong className="text-white">"← Back to Today"</strong> to return to the current day instantly.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Streak Calendar 🔥</h3>
                                <p className="text-slate-400 text-sm">
                                    The monthly calendar visualizes your productivity streak. Days where you complete <strong className="text-white">100% of tasks</strong> earn a
                                    <span className="text-primary-400"> 🔥 fire emoji</span>. Navigate months using the arrow buttons to review your history.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Streak Stats</h3>
                                <p className="text-slate-400 text-sm">
                                    Track your <strong className="text-white">Current Streak</strong> (consecutive days with 100% completion) and
                                    <strong className="text-white"> Best Streak</strong> (your all-time record). Maintain consistency to build momentum!
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Friend Notifications</h3>
                                <p className="text-slate-400 text-sm">
                                    When you complete all daily tasks, your friends receive a notification celebrating your achievement.
                                    Stay motivated by sharing your progress with your network!
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Automatic Midnight Refresh</h3>
                                <p className="text-slate-400 text-sm">
                                    The system automatically refreshes at midnight, giving you a fresh start each day.
                                    Your previous tasks are safely archived and accessible via date navigation.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

                {/* Section: Resource Vault */}
                <section className="space-y-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-primary-500/10 p-3 rounded-lg border border-primary-500/30">
                            <BookOpen className="w-8 h-8 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white font-[Orbitron] uppercase tracking-wider">Resource_Vault</h2>
                            <p className="text-slate-500 font-mono text-sm">KNOWLEDGE_STORAGE_SYSTEM</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-red-500">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-red-400" />
                                PDF Documents
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Upload and store PDF files for study materials, documentation, or reference guides.
                                Files are securely stored and can be downloaded anytime. Max size: 10MB per file.
                            </p>
                        </div>
                        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-blue-500">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-blue-400" />
                                Web Links
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Save important URLs to articles, tutorials, documentation, or any web resources.
                                Click the external link icon to open in a new tab instantly.
                            </p>
                        </div>
                        <div className="glass-panel p-6 rounded-xl border-l-4 border-l-yellow-500">
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <StickyNote className="w-4 h-4 text-yellow-400" />
                                Text Notes
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Create quick notes, code snippets, or markdown documentation.
                                View notes in a clean, readable modal with full content display.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>

                        <div className="space-y-6 relative z-10">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Organization & Search</h3>
                                <p className="text-slate-400 text-sm">
                                    Tag your resources with keywords (e.g., "javascript", "interview-prep", "algorithms") for easy categorization.
                                    Use the search bar to quickly find resources by title, description, or tags.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Filter by Type</h3>
                                <p className="text-slate-400 text-sm">
                                    Click the filter tabs (<strong className="text-white">All</strong>, <strong className="text-red-400">PDFs</strong>,
                                    <strong className="text-blue-400"> Links</strong>, <strong className="text-yellow-400">Notes</strong>)
                                    to view specific resource types. Stats cards show your total count for each category.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Managing Resources</h3>
                                <p className="text-slate-400 text-sm">
                                    Each resource card displays action buttons: <strong className="text-white">View/Download</strong> (eye/download icon),
                                    <strong className="text-white"> Edit</strong> (pencil icon), and <strong className="text-white">Delete</strong> (trash icon).
                                    Editing pre-fills all existing values for easy updates.
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
