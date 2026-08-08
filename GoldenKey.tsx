// Shared golden key SVG component — consistent warm gold across all rooms
export default function GoldenKey({ size = 16 }: { size?: number }) {
  const h = Math.round(size * 1.55)
  return (
    <svg width={size} height={h} viewBox="0 0 16 25" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="8" cy="7" r="5.5" fill="none" stroke="url(#gkGrad)" strokeWidth="2.5" />
      <circle cx="8" cy="7" r="2.2" fill="rgba(4,0,14,.7)" stroke="url(#gkGrad)" strokeWidth="1" />
      <rect x="7.1" y="11.5" width="1.8" height="10" rx=".9" fill="url(#gkGrad)" />
      <rect x="8.9" y="16" width="3.2" height="1.8" rx=".7" fill="url(#gkGrad)" />
      <rect x="8.9" y="19.5" width="2.2" height="1.6" rx=".7" fill="url(#gkGrad)" />
      <defs>
        <linearGradient id="gkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#fef3c7" />
          <stop offset="35%" stopColor="#fde68a" />
          <stop offset="75%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
    </svg>
  )
}
