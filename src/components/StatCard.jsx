import { useCountUp } from '../hooks/useCountUp';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

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

  // Determine if sparkline data has any non-zero values
  const hasSparklineData = sparklineData && sparklineData.some(v => v > 0);
  const sparkData = hasSparklineData
    ? sparklineData.map((val, idx) => ({ idx, val }))
    : null;

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
      {sparkData ? (
        <div className="sparkline-container">
          <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={sparkData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`spark-${accentColor?.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="val"
                stroke={accentColor}
                strokeWidth={1.5}
                fill={`url(#spark-${accentColor?.replace('#', '')})`}
                dot={false}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-placeholder">
          <p>No trend data yet</p>
        </div>
      )}
    </div>
  );
}
