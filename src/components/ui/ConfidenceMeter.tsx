'use client'

interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function ConfidenceMeter({ score, size = 'md' }: Props) {
  const r = size === 'sm' ? 26 : size === 'lg' ? 48 : 38
  const stroke = size === 'sm' ? 3 : 5
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const svgSize = (r + stroke) * 2 + 4

  const color = score >= 80 ? '#00C4B0' : score >= 60 ? '#C8A96E' : '#FF4757'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle cx={svgSize / 2} cy={svgSize / 2} r={r} stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} fill="none" />
          <circle
            cx={svgSize / 2} cy={svgSize / 2} r={r}
            stroke={color} strokeWidth={stroke} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 4px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-black tabular-nums"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: size === 'sm' ? 11 : size === 'lg' ? 20 : 15,
              color,
            }}
          >
            {score}
          </span>
        </div>
      </div>
      {size !== 'sm' && (
        <span
          className="text-[9px] tracking-widest uppercase"
          style={{ fontFamily: 'var(--font-mono)', color: '#6B6355' }}
        >
          Confidence
        </span>
      )}
    </div>
  )
}
