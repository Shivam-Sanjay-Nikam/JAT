import React from 'react'

interface ConsistencyTrendProps {
    data: { stat_date: string, total_due: number, completed_on_time: number }[]
}

export const ConsistencyTrend: React.FC<ConsistencyTrendProps> = ({ data }) => {
    // Filter last 30 days
    const today = new Date()
    const cutoff = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0]

    // Process data into percentages
    const sortedData = [...data]
        .filter(d => d.stat_date >= cutoff)
        .sort((a, b) => new Date(a.stat_date).getTime() - new Date(b.stat_date).getTime())
        .map(d => ({
            date: d.stat_date,
            percent: d.total_due > 0 ? (d.completed_on_time / d.total_due) * 100 : 0
        }))

    if (sortedData.length < 2) return null

    // SVG Dimensions
    const height = 60
    const width = 100 // percentages

    // Generate Smooth Bezier Path (Catmull-Rom or similar simple smoothing)
    // For simplicity and dependency-free, we will use a basic cubic bezier algorithm
    const points = sortedData.map((d, i) => {
        const x = (i / (sortedData.length - 1)) * width
        const y = height - ((d.percent / 100) * height)
        return [x, y]
    })

    const lineCommand = points.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point[0]},${point[1]}`

        const current = point
        const previous = a[i - 1]

        // Control points (simple smoothing)
        const cpsX = (current[0] - previous[0]) / 3
        const cp1 = [previous[0] + cpsX, previous[1]]
        const cp2 = [current[0] - cpsX, current[1]]

        return `${acc} C ${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${current[0]},${current[1]}`
    }, '')

    const average = Math.round(sortedData.reduce((acc, curr) => acc + curr.percent, 0) / sortedData.length)

    return (
        <div className="w-full h-full bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 backdrop-blur-sm relative overflow-hidden group flex flex-col justify-between">
            {/* Background Gradient Mesh */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10 transition-opacity duration-700 group-hover:opacity-70" />

            <div className="flex items-end justify-between mb-2">
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-[Orbitron] mb-0.5">Trend</h4>
                    <p className="text-[9px] text-slate-500 font-mono">30 Days</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-white tabular-nums tracking-tight">{average}%</span>
                    <span className="text-[9px] text-purple-400 font-medium">Avg</span>
                </div>
            </div>

            <div className="relative h-12 w-full flex-1 min-h-[50px]">
                <svg
                    viewBox={`0 -5 ${width} ${height + 10}`}
                    preserveAspectRatio="none"
                    className="w-full h-full overflow-visible"
                >
                    <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Simple Grid (less lines) */}
                    <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />

                    {/* Filled Area */}
                    <path
                        d={`${lineCommand} L ${width},${height} L 0,${height} Z`}
                        fill="url(#trendGradient)"
                    />

                    {/* Line Path */}
                    <path
                        d={lineCommand}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>
        </div>
    )
}
