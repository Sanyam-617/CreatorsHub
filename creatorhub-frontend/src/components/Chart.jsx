import {
    AreaChart, Area,
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { BarChart2 } from 'lucide-react';

// BUG FIX: accept an optional `extraColors` array so callers (e.g. Dashboard's
// multi-platform chart) can register additional gradient defs.
export function Chart({
    data,
    platformColor,
    extraColors = [],
    height = 300,
    margin = { top: 10, right: 20, left: 0, bottom: 0 },
    children
}) {
    const allColors = [...new Set([platformColor, ...extraColors])];

    if (!data || data.length < 2) {
        return (
            <div className="chart-empty" style={{ height }}>
                <BarChart2 size={32} color="rgba(255,255,255,0.15)" />
                <p className="chart-empty-text">Add more data to see your trend</p>
            </div>
        );
    }

    // Detect if children contain a Bar component (bar chart mode)
    const hasBar = Array.isArray(children)
        ? children.some(c => c?.type === Bar)
        : children?.type === Bar;

    const ChartComponent = hasBar ? BarChart : AreaChart;

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;
        return (
            <div style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px',
                padding: '10px 14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                minWidth: '120px',
            }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: '6px' }}>
                    {label}
                </div>
                {payload.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
                            {entry.name}
                        </div>
                        <div style={{
                            color: entry.color || platformColor,
                            fontSize: 18,
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                            letterSpacing: '-0.02em',
                        }}>
                            {entry.value?.toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <ChartComponent data={data} margin={margin}>
                <defs>
                    {allColors.map((color) => (
                        <linearGradient
                            key={color}
                            id={`gradient-${color.replace('#', '')}`}
                            x1="0" y1="0" x2="0" y2="1"
                        >
                            <stop offset="0%"   stopColor={color} stopOpacity={0.28} />
                            <stop offset="60%"  stopColor={color} stopOpacity={0.07} />
                            <stop offset="100%" stopColor={color} stopOpacity={0}    />
                        </linearGradient>
                    ))}
                </defs>

                <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                />

                <XAxis
                    dataKey="date"
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={40}
                />
                <YAxis
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                    width={48}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }} />

                {children}
            </ChartComponent>
        </ResponsiveContainer>
    );
}