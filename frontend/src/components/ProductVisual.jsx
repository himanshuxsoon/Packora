/**
 * Branded placeholder artwork for products without photos.
 * Deterministic gradient per product id so each card looks intentional.
 */
const PALETTES = [
  ['#3a443c', '#78836a'],
  ['#4a3f33', '#b58b61'],
  ['#2e3530', '#4c5a4e'],
  ['#54402e', '#a97f52'],
]

export default function ProductVisual({ seed = 0, className = '' }) {
  const [from, to] = PALETTES[seed % PALETTES.length]
  const gid = `pv-${seed}`
  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
        <linearGradient id={`${gid}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${gid})`} />
      {/* soft light sweep */}
      <rect width="400" height="300" fill={`url(#${gid}-sheen)`} />
      {/* box illustration */}
      <g transform="translate(200 150)">
        <path
          d="M-90 -40 L0 -75 L90 -40 L90 45 L0 80 L-90 45 Z"
          fill="#f4efe5"
          opacity="0.96"
        />
        <path d="M-90 -40 L0 -5 L90 -40 L90 45 L0 80 L-90 45 Z" fill="#e6ddca" />
        <path d="M0 -75 L0 -5 L90 -40" fill="none" stroke="#b58b61" strokeWidth="3" />
        <path d="M-90 -40 L0 -5 L0 80" fill="none" stroke="#d9cdb4" strokeWidth="2" />
        {/* tape strip */}
        <rect x="-8" y="-75" width="16" height="155" fill="#b58b61" opacity="0.85" transform="rotate(0)" />
        <rect x="-8" y="-70" width="16" height="150" fill="#b58b61" opacity="0.85" />
      </g>
      {/* subtle grid texture */}
      <g stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 55} y1="0" x2={i * 55} y2="300" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 55} x2="400" y2={i * 55} />
        ))}
      </g>
    </svg>
  )
}
