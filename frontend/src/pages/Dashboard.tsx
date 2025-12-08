
import React from 'react'
import { Navbar } from '../components/Navbar'
import { JobList } from '../components/JobList'

export const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <JobList />
            </main>
        </div>
    )
}
