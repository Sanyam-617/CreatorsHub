import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2 } from 'lucide-react';

// BUG FIX: accept an optional `extraColors` array so callers (e.g. Dashboard's
// multi-platform chart) can register additional gradient defs.
// Previously only one gradient was created (for platformColor), so any Area
// that referenced a different gradient ID got no fill at all.
export function Chart({
    data,
    platformColor,
    extraColors = [],
    height = 300,
    margin = { top: 10, right: 20, left: 0, bottom: 0 },
    children
}) {
    // Deduplicate: always include platformColor, plus any extras
    const allColors = [...new Set([platformColor, ...extraColors])];

    if (!data || data.length < 2) {
        return (
            <div className="chart-empty" style={{ height }}>
                <BarChart2 size={32} color="rgba(255,255,255,0.15)" />
                <p className="chart-empty-text">Add more data to see your trend</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={margin}>
                <defs>
                    {/* BUG FIX: generate a gradient for every color, not just platformColor */}
                    {allColors.map((color) => (
                        <linearGradient
                            key={color}
                            id={`gradient-${color.replace('#', '')}`}
                            x1="0" y1="0" x2="0" y2="1"
                        >
                            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
                            <stop offset="75%" stopColor={color} stopOpacity={0.04} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid
                    strokeDasharray="0"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                />
                <XAxis
                    dataKey="date"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1e1e1e',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}
                    formatter={(value, name) => (
                        <div>
                            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: '4px' }}>
                                {name}
                            </div>
                            <div style={{ color: platformColor, fontSize: 17, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                {value?.toLocaleString()}
                            </div>
                        </div>
                    )}
                />
                {children}
            </AreaChart>
        </ResponsiveContainer>
    );
}