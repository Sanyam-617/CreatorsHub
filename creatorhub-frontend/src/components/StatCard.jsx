import { useCountUp } from '../hooks/useCountUp';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatCard({
    label,
    value,
    delta,
    deltaLabel,
    accentColor,
    icon: Icon,
    sparklineData
}) {
    const animatedValue = useCountUp(value);

    const getDeltaIcon = () => {
        if (delta > 0) return <TrendingUp size={12} />;
        if (delta < 0) return <TrendingDown size={12} />;
        return <Minus size={12} />;
    };

    const getDeltaColor = () => {
        if (delta > 0) return { color: '#22c55e', background: 'rgba(34,197,94,0.1)' };
        if (delta < 0) return { color: '#ef4444', background: 'rgba(239,68,68,0.1)' };
        return { color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)' };
    };

    const deltaStyle = getDeltaColor();

    return (
        <div className="stat-card" style={{ '--accent-color': accentColor }}>
            {/* Header */}
            <div className="stat-header">
                <span className="stat-label">{label}</span>
                <div className="stat-icon">
                    <Icon size={16} color={accentColor} />
                </div>
            </div>

            {/* Value */}
            <div className="stat-value">
                {animatedValue.toLocaleString()}
            </div>

            {/* Delta Badge */}
            {delta !== undefined && (
                <div className="stat-delta" style={deltaStyle}>
                    {getDeltaIcon()}
                    <span>{Math.abs(delta)}{deltaLabel}</span>
                </div>
            )}

            {/* Sparkline */}
            {(!sparklineData || sparklineData.length <= 1) && (
                <div className="chart-placeholder">
                    <p>No trend data yet</p>
                </div>
            )}
        </div>
    );
}