import React from 'react'

interface ConsistencyTrendProps {
    data: { stat_date: string, total_due: number, completed_on_time: number }[]
}

export const ConsistencyTrend: React.FC<ConsistencyTrendProps> = ({ data }) => {
    // Filter last 30 days
    const today = new Date()
    const cutoff = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0]

    // Process data into percentages
    // Sort by date ascending just in case
    const sortedData = [...data]
        .filter(d => d.stat_date >= cutoff)
        .sort((a, b) => new Date(a.stat_date).getTime() - new Date(b.stat_date).getTime())
        .map(d => ({
            date: d.stat_date,
            percent: d.total_due > 0 ? (d.completed_on_time / d.total_due) * 100 : 0
        }))

    if (sortedData.length < 2) return null

    // SVG Dimensions
    const height = 40
    const width = 100 // percentages

    // Calculate points
    const points = sortedData.map((d, i) => {
        const x = (i / (sortedData.length - 1)) * width
        const y = height - ((d.percent / 100) * height)
        return `${x},${y}`
    }).join(' ')

    const average = Math.round(sortedData.reduce((acc, curr) => acc + curr.percent, 0) / sortedData.length)

    return (
        <div className="mt-6 p-4 bg-slate-900/50 border border-purple-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">30-Day Trend</span>
                <span className="text-xs font-bold text-white">{average}% Avg</span>
            </div>

            <div className="relative h-10 w-full">
                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                >
                    {/* Grid lines */}
                    <line x1="0" y1={height} x2={width} y2={height} stroke="#334155" strokeWidth="0.5" />
                    <line x1="0" y1="0" x2={width} y2="0" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 2" />

                    {/* Path */}
                    <polyline
                        fill="none"
                        stroke="#a855f7" // purple-500
                        strokeWidth="1.5"
                        points={points}
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Area below */}
                    <polygon
                        fill="rgba(168, 85, 247, 0.1)"
                        points={`0,${height} ${points} ${width},${height}`}
                    />

                    {/* Dots */}
                    {sortedData.map((d, i) => {
                        const x = (i / (sortedData.length - 1)) * width
                        const y = height - ((d.percent / 100) * height)
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="1.5"
                                className="fill-purple-500 hover:r-2 transition-all"
                                vectorEffect="non-scaling-stroke"
                            >
                                <title>{new Date(d.date).toLocaleDateString()}: {Math.round(d.percent)}%</title>
                            </circle>
                        )
                    })}
                </svg>
            </div>
        </div>
    )
}
