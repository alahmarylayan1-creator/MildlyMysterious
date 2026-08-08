import { useState, useEffect, useRef } from 'react'
import { audio } from './sound/engine'
import { useLang, InlineControls } from './LangContext'
import NewGardenHub, { type GuideChoice } from './GardenHub'
import PortraitRoom from './PortraitRoom'
import CuriousRoom from './CuriousRoom'
import LavenderStudio from './LavenderStudio'
import Workshop from './Workshop'
import LearningGallery from './LearningGallery'
import FinalDoor from './FinalDoor'
import PortfolioPage from './PortfolioPage'

type Screen = 'opening' | 'guide' | 'hub' | 'portrait' | 'cabinet' | 'studio' | 'workshop' | 'gallery' | 'final-door' | 'portfolio'
type Guide = 'woman' | 'man'

// ─── Reusable decorative bits ────────────────────────────────────────────────

function Butterfly({ style, delay = 0, variant = 1 }: { style?: React.CSSProperties; delay?: number; variant?: number }) {
  const colors = variant === 1
    ? ['#c4aaff', '#a87fff']
    : variant === 2
    ? ['#f9a8d4', '#f472b6']
    : ['#fde68a', '#f59e0b']

  return (
    <div
      className={variant % 2 === 0 ? 'animate-flutter' : 'animate-flutter2'}
      style={{ position: 'absolute', animationDelay: `${delay}s`, pointerEvents: 'none', ...style }}
    >
      <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
        <ellipse cx="7" cy="9" rx="7" ry="5" fill={colors[0]} opacity="0.85" transform="rotate(-20 7 9)" />
        <ellipse cx="21" cy="9" rx="7" ry="5" fill={colors[0]} opacity="0.85" transform="rotate(20 21 9)" />
        <ellipse cx="8" cy="15" rx="5" ry="3.5" fill={colors[1]} opacity="0.7" transform="rotate(15 8 15)" />
        <ellipse cx="20" cy="15" rx="5" ry="3.5" fill={colors[1]} opacity="0.7" transform="rotate(-15 20 15)" />
        <line x1="14" y1="3" x2="11" y2="0" stroke={colors[1]} strokeWidth="1" opacity="0.6" />
        <line x1="14" y1="3" x2="17" y2="0" stroke={colors[1]} strokeWidth="1" opacity="0.6" />
        <ellipse cx="14" cy="11" rx="1.5" ry="6" fill="#3d1a6e" opacity="0.6" />
      </svg>
    </div>
  )
}

function GlowOrb({ size = 200, color = 'rgba(139, 92, 246, 0.3)', style }: { size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <div
      className="animate-glow-pulse"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        filter: `blur(${size / 4}px)`,
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

function Particle({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  const drift = (Math.random() - 0.5) * 40
  return (
    <div
      className="particle"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 4,
        height: 4,
        borderRadius: '50%',
        background: 'rgba(253, 230, 138, 0.8)',
        boxShadow: '0 0 6px 2px rgba(253, 230, 138, 0.5)',
        animationDelay: `${delay}s`,
        '--drift': `${drift}px`,
        pointerEvents: 'none',
      } as React.CSSProperties}
    />
  )
}

function MagicalBunny({ size = 80, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`animate-bounce-gentle ${className}`} style={{ position: 'relative', width: size, height: size * 1.2, ...style }}>
      <svg width={size} height={size * 1.3} viewBox="0 0 80 104" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Glow behind */}
        <ellipse cx="40" cy="90" rx="24" ry="8" fill="rgba(196,170,255,0.3)" />
        {/* Ears */}
        <ellipse cx="26" cy="28" rx="8" ry="22" fill="#e8d8ff" transform="rotate(-8 26 28)" />
        <ellipse cx="54" cy="28" rx="8" ry="22" fill="#e8d8ff" transform="rotate(8 54 28)" />
        <ellipse cx="26" cy="32" rx="4.5" ry="16" fill="#f9c4e8" transform="rotate(-8 26 32)" />
        <ellipse cx="54" cy="32" rx="4.5" ry="16" fill="#f9c4e8" transform="rotate(8 54 32)" />
        {/* Ear sparkle */}
        <circle cx="22" cy="16" r="2" fill="rgba(253,230,138,0.9)" />
        <circle cx="58" cy="16" r="2" fill="rgba(253,230,138,0.9)" />
        {/* Body */}
        <ellipse cx="40" cy="70" rx="22" ry="20" fill="#f0e6ff" />
        {/* Head */}
        <ellipse cx="40" cy="48" rx="20" ry="18" fill="#f0e6ff" />
        {/* Cheeks */}
        <ellipse cx="30" cy="52" rx="5" ry="3" fill="rgba(249,164,216,0.4)" />
        <ellipse cx="50" cy="52" rx="5" ry="3" fill="rgba(249,164,216,0.4)" />
        {/* Eyes */}
        <ellipse cx="34" cy="46" rx="3.5" ry="4" fill="#2d1154" />
        <ellipse cx="46" cy="46" rx="3.5" ry="4" fill="#2d1154" />
        <circle cx="35.5" cy="44.5" r="1.2" fill="white" />
        <circle cx="47.5" cy="44.5" r="1.2" fill="white" />
        {/* Nose */}
        <ellipse cx="40" cy="52" rx="2" ry="1.5" fill="#f472b6" />
        {/* Whiskers */}
        <line x1="25" y1="52" x2="37" y2="53" stroke="rgba(100,60,140,0.4)" strokeWidth="0.8" />
        <line x1="25" y1="54" x2="37" y2="54" stroke="rgba(100,60,140,0.4)" strokeWidth="0.8" />
        <line x1="55" y1="52" x2="43" y2="53" stroke="rgba(100,60,140,0.4)" strokeWidth="0.8" />
        <line x1="55" y1="54" x2="43" y2="54" stroke="rgba(100,60,140,0.4)" strokeWidth="0.8" />
        {/* Paws */}
        <ellipse cx="28" cy="84" rx="9" ry="7" fill="#e8d8ff" />
        <ellipse cx="52" cy="84" rx="9" ry="7" fill="#e8d8ff" />
        {/* Tail */}
        <ellipse cx="61" cy="72" rx="8" ry="7" fill="white" />
        {/* Crown / sparkle */}
        <polygon points="40,8 43,16 40,14 37,16" fill="#fde68a" opacity="0.9" />
        <circle cx="40" cy="8" r="2" fill="#f59e0b" opacity="0.9" />
        <circle cx="28" cy="6" r="1.5" fill="rgba(196,170,255,0.9)" className="animate-star-twinkle" />
        <circle cx="52" cy="6" r="1.5" fill="rgba(249,164,216,0.9)" className="animate-star-twinkle" style={{ animationDelay: '1s' }} />
        {/* Belly pattern */}
        <ellipse cx="40" cy="72" rx="10" ry="12" fill="rgba(255,255,255,0.4)" />
      </svg>
      {/* Magic dust */}
      <div style={{ position: 'absolute', top: -10, right: -10, pointerEvents: 'none' }}>
        {[0, 1, 2].map(i => (
          <Particle key={i} x={i * 6} y={i * 4} delay={i * 0.8} />
        ))}
      </div>
    </div>
  )
}

// Clickable wrapper around MagicalBunny — works on any screen where it appears
function InteractiveRabbit({ size = 90 }: { size?: number }) {
  const [hov, setHov] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [phraseIdx, setPhraseIdx] = useState<number | null>(null)
  const dismissRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { t } = useLang()

  const handleClick = () => {
    audio.playClick()
    const pool = t.rabbitPhrases
    const nextIdx = phraseIdx === null
      ? Math.floor(Math.random() * pool.length)
      : (phraseIdx + 1 + Math.floor(Math.random() * (pool.length - 1))) % pool.length
    setPhraseIdx(nextIdx)
    setMsg(pool[nextIdx])
    if (dismissRef.current) clearTimeout(dismissRef.current)
    dismissRef.current = setTimeout(() => setMsg(null), 6500)
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        display: 'inline-block',
        transition: 'transform 0.25s cubic-bezier(.34,1.2,.64,1), filter 0.25s ease',
        transform: hov ? 'translateY(-5px) scale(1.06)' : 'none',
        filter: hov
          ? 'brightness(1.14) drop-shadow(0 0 14px rgba(255,179,230,.75)) drop-shadow(0 0 7px rgba(155,114,207,.55))'
          : 'drop-shadow(0 0 0px transparent)',
      }}
    >
      <MagicalBunny size={size} />

      {msg && (
        <div style={{
          position: 'absolute',
          bottom: size * 1.35,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'max-content',
          maxWidth: 260,
          background: 'rgba(8,2,22,.95)',
          border: '1px solid rgba(196,170,255,.50)',
          borderRadius: 12,
          padding: '10px 16px',
          fontFamily: "'Lora',serif",
          fontStyle: 'italic',
          fontSize: 15,
          color: 'rgba(221,200,255,.94)',
          backdropFilter: 'blur(14px)',
          textAlign: 'center',
          lineHeight: 1.6,
          zIndex: 50,
          pointerEvents: 'none',
          animation: 'rabbit-in .3s cubic-bezier(.22,1,.36,1) both',
          whiteSpace: 'normal',
        }}>
          🐇 {msg}
          {/* Caret pointing down toward the rabbit */}
          <div style={{
            position: 'absolute', bottom: -7, left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: 12, height: 12,
            background: 'rgba(8,2,22,.95)',
            borderRight: '1px solid rgba(196,170,255,.50)',
            borderBottom: '1px solid rgba(196,170,255,.50)',
          }} />
        </div>
      )}
    </div>
  )
}

// ─── Screen 1: Cinematic Opening ─────────────────────────────────────────────

function OpeningScreen({ onBegin, onPortfolio }: { onBegin: () => void; onPortfolio: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const { t, isAr } = useLang()

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  // Start ambient only after first interaction
  const [ambStarted, setAmbStarted] = useState(false)
  function ensureAmb() {
    if (!ambStarted) { audio.startAmbient('opening'); setAmbStarted(true) }
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* Global controls at top-right */}
      <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 20, display: 'flex', gap: 8 }}>
        <InlineControls />
      </div>

      {/* Sky gradient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, #1a0535 0%, #3b1166 18%, #6b35a8 38%, #c470c7 55%, #f0a070 72%, #fdd090 85%, #ffe8c0 100%)',
        }}
      />

      {/* Stars */}
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className="animate-star-twinkle"
          style={{
            position: 'absolute',
            width: i % 5 === 0 ? 3 : 2,
            height: i % 5 === 0 ? 3 : 2,
            borderRadius: '50%',
            background: 'white',
            top: `${2 + (i * 37) % 45}%`,
            left: `${(i * 23 + 7) % 100}%`,
            animationDelay: `${(i * 0.3) % 3}s`,
            opacity: i % 3 === 0 ? 0.9 : 0.5,
          }}
        />
      ))}

      {/* Distant mountains / silhouette hills */}
      <svg
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '55%' }}
        viewBox="0 0 1440 560"
        preserveAspectRatio="none"
      >
        {/* Far hills */}
        <path d="M0,200 Q180,80 360,160 Q540,240 720,120 Q900,0 1080,100 Q1260,200 1440,140 L1440,560 L0,560 Z"
          fill="rgba(60,15,100,0.5)" />
        {/* Mid hills */}
        <path d="M0,280 Q120,200 280,240 Q440,280 600,200 Q760,120 920,220 Q1080,320 1200,250 Q1320,180 1440,230 L1440,560 L0,560 Z"
          fill="rgba(80,25,130,0.6)" />
        {/* Ground hills */}
        <path d="M0,360 Q200,300 400,340 Q600,380 800,320 Q1000,260 1200,340 Q1350,390 1440,360 L1440,560 L0,560 Z"
          fill="rgba(45,10,80,0.75)" />
      </svg>

      {/* Garden ground */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '32%',
          background: 'linear-gradient(180deg, rgba(40,10,70,0) 0%, #1a053a 40%, #12022a 100%)',
        }}
      />

      {/* Lavender flowers field */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '30%', pointerEvents: 'none' }} viewBox="0 0 1440 300" preserveAspectRatio="none">
        {/* Ground */}
        <rect x="0" y="200" width="1440" height="100" fill="#12022a" />
        {/* Grass blades */}
        {[...Array(60)].map((_, i) => {
          const x = (i * 1440) / 60 + (i % 3) * 8
          const h = 20 + (i % 5) * 8
          return (
            <path
              key={i}
              d={`M${x},200 Q${x - 5},${200 - h / 2} ${x},${200 - h}`}
              stroke={i % 3 === 0 ? '#4a1a7a' : '#3d1560'}
              strokeWidth="2"
              fill="none"
            />
          )
        })}
        {/* Lavender stalks */}
        {[...Array(30)].map((_, i) => {
          const x = 20 + (i * 1400) / 30 + (i % 4) * 6
          const y = 195
          const h = 50 + (i % 4) * 20
          const color = i % 3 === 0 ? '#c4aaff' : i % 3 === 1 ? '#a87fff' : '#d4c0ff'
          return (
            <g key={i}>
              <line x1={x} y1={y} x2={x} y2={y - h} stroke="#6d28d9" strokeWidth="1.5" />
              {[0, 1, 2].map(j => (
                <ellipse
                  key={j}
                  cx={x + (j % 2 === 0 ? -3 : 3)}
                  cy={y - h + j * 10 + 5}
                  rx="4"
                  ry="6"
                  fill={color}
                  opacity="0.8"
                />
              ))}
            </g>
          )
        })}
        {/* White flowers */}
        {[...Array(15)].map((_, i) => {
          const x = 60 + (i * 1320) / 15
          const y = 185
          return (
            <g key={i}>
              {[0, 60, 120, 180, 240, 300].map(angle => (
                <ellipse
                  key={angle}
                  cx={x + Math.cos((angle * Math.PI) / 180) * 5}
                  cy={y + Math.sin((angle * Math.PI) / 180) * 5}
                  rx="3"
                  ry="5"
                  fill="rgba(255,255,255,0.7)"
                  transform={`rotate(${angle} ${x + Math.cos((angle * Math.PI) / 180) * 5} ${y + Math.sin((angle * Math.PI) / 180) * 5})`}
                />
              ))}
              <circle cx={x} cy={y} r="3" fill="#fde68a" />
            </g>
          )
        })}
      </svg>

      {/* Trees / silhouette shapes */}
      <svg style={{ position: 'absolute', bottom: '22%', left: '3%', pointerEvents: 'none' }} width="60" height="120" viewBox="0 0 60 120">
        <rect x="26" y="70" width="8" height="50" fill="rgba(30,5,60,0.9)" />
        <ellipse cx="30" cy="55" rx="28" ry="50" fill="rgba(50,15,90,0.8)" />
        <ellipse cx="30" cy="40" rx="20" ry="36" fill="rgba(70,20,120,0.7)" />
      </svg>
      <svg style={{ position: 'absolute', bottom: '20%', right: '4%', pointerEvents: 'none' }} width="80" height="140" viewBox="0 0 80 140">
        <rect x="34" y="90" width="10" height="50" fill="rgba(30,5,60,0.9)" />
        <ellipse cx="40" cy="70" rx="35" ry="60" fill="rgba(50,15,90,0.8)" />
        <ellipse cx="40" cy="50" rx="24" ry="42" fill="rgba(70,20,120,0.7)" />
      </svg>

      {/* Glowing mist layers */}
      <div
        className="animate-mist-drift"
        style={{
          position: 'absolute',
          bottom: '18%',
          left: '-10%',
          width: '120%',
          height: 120,
          background: 'linear-gradient(180deg, transparent, rgba(139,92,246,0.15) 40%, rgba(196,170,255,0.2) 60%, transparent)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />
      <div
        className="animate-mist-drift"
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '-5%',
          width: '110%',
          height: 80,
          background: 'linear-gradient(180deg, transparent, rgba(200,150,255,0.25) 50%, transparent)',
          filter: 'blur(20px)',
          animationDelay: '3s',
          pointerEvents: 'none',
        }}
      />

      {/* Glow orbs */}
      <GlowOrb size={300} color="rgba(245,158,11,0.2)" style={{ bottom: '20%', left: '30%', transform: 'translateX(-50%)' }} />
      <GlowOrb size={200} color="rgba(249,168,212,0.25)" style={{ bottom: '30%', right: '20%' }} />
      <GlowOrb size={150} color="rgba(139,92,246,0.3)" style={{ top: '30%', left: '10%' }} />

      {/* Firefly particles */}
      {[...Array(18)].map((_, i) => (
        <Particle
          key={i}
          x={Math.floor((i * 1440) / 18 + (i % 4) * 20)}
          y={Math.floor(300 + (i % 5) * 60)}
          delay={i * 0.4}
        />
      ))}

      {/* Butterflies */}
      <Butterfly style={{ bottom: '35%', left: '15%' }} delay={0} variant={1} />
      <Butterfly style={{ bottom: '45%', left: '60%' }} delay={2} variant={2} />
      <Butterfly style={{ bottom: '50%', right: '20%' }} delay={4} variant={3} />
      <Butterfly style={{ bottom: '40%', left: '40%' }} delay={6} variant={1} />
      <Butterfly style={{ bottom: '55%', right: '35%' }} delay={1} variant={2} />

      {/* Magical bunny — interactive on landing page */}
      <div style={{ position: 'absolute', bottom: '23%', right: '12%', zIndex: 10 }}>
        <InteractiveRabbit size={90} />
      </div>

      {/* Golden lantern lights */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="animate-glow-pulse"
          style={{
            position: 'absolute',
            bottom: `${24 + (i % 3) * 5}%`,
            left: `${10 + i * 15}%`,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#fde68a',
            boxShadow: '0 0 20px 8px rgba(253,230,138,0.5)',
            animationDelay: `${i * 0.5}s`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Central content */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -55%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 10,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      >
        {/* Decorative top emblem */}
        <div style={{ marginBottom: 16, position: 'relative' }}>
          <svg width="80" height="50" viewBox="0 0 80 50">
            <line x1="0" y1="25" x2="28" y2="25" stroke="rgba(253,230,138,0.6)" strokeWidth="1" />
            <line x1="52" y1="25" x2="80" y2="25" stroke="rgba(253,230,138,0.6)" strokeWidth="1" />
            <polygon points="40,5 44,20 40,16 36,20" fill="#fde68a" opacity="0.9" />
            <circle cx="40" cy="28" r="5" fill="none" stroke="rgba(253,230,138,0.7)" strokeWidth="1" />
            <circle cx="40" cy="28" r="2" fill="#fde68a" opacity="0.8" />
          </svg>
        </div>

        {/* Subtitle above */}
        <p style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 13,
          letterSpacing: '0.35em',
          color: 'rgba(253,230,138,0.8)',
          marginBottom: 12,
          textTransform: 'uppercase',
        }}>
          Layan Mohammed Alahmari &nbsp;·&nbsp; Portfolio
        </p>

        {/* Main title */}
        <h1 style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: 62,
          fontWeight: 700,
          lineHeight: 1.05,
          marginBottom: 6,
        }}>
          <span className="shimmer-text">Mildly Mysterious</span>
        </h1>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,170,255,0.7))' }} />
          <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 9.8,5.8 15,6.2 11,10 12.4,15 8,12.2 3.6,15 5,10 1,6.2 6.2,5.8" fill="rgba(253,230,138,0.8)" /></svg>
          <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, rgba(196,170,255,0.7), transparent)' }} />
        </div>

        <p style={{
          fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif",
          fontSize: 19,
          letterSpacing: isAr ? 0 : '0.2em',
          color: 'rgba(221,200,255,0.9)',
          marginBottom: 28,
          fontStyle: isAr ? 'normal' : 'italic',
        }}>
          {t.openingTagline}
        </p>

        {/* Description */}
        <p style={{
          fontFamily: "'Lora', serif",
          fontSize: 18,
          lineHeight: 1.7,
          color: 'rgba(245,230,255,0.75)',
          maxWidth: 420,
          marginBottom: 42,
          textAlign: 'center',
        }}>
          {t.openingDesc.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <button
            onClick={() => { ensureAmb(); audio.playRoomOpen(); onBegin() }}
            className="btn-primary"
            style={{
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif",
              fontSize: 17,
              letterSpacing: isAr ? 0 : '0.15em',
              color: '#fde68a',
              padding: '14px 48px',
              borderRadius: 4,
              cursor: 'pointer',
              textTransform: isAr ? 'none' : 'uppercase',
              width: isAr ? 300 : 280,
            }}
          >
            {t.openingBegin}
          </button>
          <button
            onClick={() => { ensureAmb(); audio.playClick(); onPortfolio() }}
            className="btn-secondary"
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 16,
              letterSpacing: isAr ? 0 : '0.08em',
              color: 'rgba(221,200,255,0.85)',
              padding: '11px 36px',
              borderRadius: 4,
              cursor: 'pointer',
              width: isAr ? 300 : 280,
            }}
          >
            {t.openingPortfolio}
          </button>
        </div>

        {/* Bottom emblem */}
        <div style={{ marginTop: 32 }}>
          <svg width="120" height="16" viewBox="0 0 120 16">
            <line x1="0" y1="8" x2="50" y2="8" stroke="rgba(196,170,255,0.3)" strokeWidth="1" />
            <circle cx="60" cy="8" r="3" fill="none" stroke="rgba(196,170,255,0.5)" strokeWidth="1" />
            <circle cx="60" cy="8" r="1" fill="rgba(196,170,255,0.6)" />
            <line x1="70" y1="8" x2="120" y2="8" stroke="rgba(196,170,255,0.3)" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 2: Choose Your Guide ─────────────────────────────────────────────

function TraitBadge({ label, isWoman }: { label: string; isWoman: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '4px 11px',
        borderRadius: 20,
        background: hov
          ? isWoman
            ? 'linear-gradient(135deg, rgba(255,179,230,.22), rgba(196,170,255,.16))'
            : 'linear-gradient(135deg, rgba(155,114,207,.28), rgba(255,179,230,.12))'
          : isWoman ? 'rgba(255,179,230,0.12)' : 'rgba(139,92,246,0.20)',
        border: `1px solid ${hov
          ? isWoman ? 'rgba(255,179,230,.60)' : 'rgba(196,170,255,.60)'
          : isWoman ? 'rgba(255,179,230,0.30)' : 'rgba(196,170,255,0.30)'}`,
        boxShadow: hov
          ? isWoman
            ? '0 4px 16px rgba(255,179,230,.24), 0 0 10px rgba(196,170,255,.14), inset 0 0 10px rgba(255,179,230,.08)'
            : '0 4px 16px rgba(155,114,207,.28), 0 0 10px rgba(255,179,230,.12), inset 0 0 10px rgba(155,114,207,.09)'
          : 'none',
        fontFamily: "'Nunito', sans-serif",
        fontSize: 13,
        color: hov
          ? isWoman ? 'rgba(255,230,245,.98)' : 'rgba(220,210,255,.98)'
          : isWoman ? 'rgba(255,210,240,0.88)' : 'rgba(196,170,255,0.88)',
        cursor: 'default',
        display: 'inline-block',
        transition: 'all 0.38s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-1.5px) scale(1.02)' : 'none',
      }}
    >
      {label}
    </span>
  )
}

function GuideCard({
  guide,
  selected,
  dimmed,
  onSelect,
}: {
  guide: 'woman' | 'man'
  selected: boolean
  dimmed: boolean
  onSelect: () => void
}) {
  const isWoman = guide === 'woman'
  const [hovered, setHovered] = useState(false)
  const { t, isAr } = useLang()

  // Glow colour per guide: sky rose for Dawn, soft lavender for Dusk
  const hoverGlow = isWoman
    ? 'linear-gradient(135deg, rgba(255,179,230,.28), rgba(196,170,255,.32), rgba(255,179,230,.24))'
    : 'linear-gradient(135deg, rgba(155,114,207,.30), rgba(200,177,228,.36), rgba(155,114,207,.26))'
  const selectedGlow = isWoman
    ? 'linear-gradient(135deg, rgba(255,179,230,.55), rgba(196,170,255,.50), rgba(232,194,125,.32))'
    : 'linear-gradient(135deg, rgba(155,114,207,.58), rgba(255,179,230,.42), rgba(196,170,255,.52))'
  const selectedHoveredGlow = isWoman
    ? 'linear-gradient(135deg, rgba(255,179,230,.72), rgba(196,170,255,.64), rgba(232,194,125,.40))'
    : 'linear-gradient(135deg, rgba(155,114,207,.75), rgba(255,179,230,.56), rgba(196,170,255,.68))'

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 320,
        cursor: 'pointer',
        transition: 'transform 0.28s cubic-bezier(.34,1.2,.64,1), filter 0.25s ease, opacity 0.3s ease',
        transform: selected
          ? `translateY(-10px) scale(${hovered ? 1.015 : 1.03})`
          : hovered
          ? 'translateY(-7px) scale(1.025)'
          : 'none',
        filter: dimmed && !hovered ? 'brightness(0.62) saturate(0.5)' : 'none',
        opacity: dimmed && !hovered ? 0.68 : 1,
      }}
    >
      {/* Glow overlay — shows on hover (character-tinted) or selection */}
      {(selected || hovered) && (
        <div
          style={{
            position: 'absolute',
            inset: selected ? -6 : -3,
            borderRadius: 20,
            background: selected && hovered ? selectedHoveredGlow : selected ? selectedGlow : hoverGlow,
            filter: `blur(${selected ? 14 : 10}px)`,
            zIndex: 0,
            opacity: selected ? 1 : 0.85,
            transition: 'opacity 0.3s ease, inset 0.3s ease, filter 0.3s ease',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Card body */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          borderRadius: 14,
          overflow: 'hidden',
          border: selected && hovered
            ? `2px solid ${isWoman ? 'rgba(255,179,230,.90)' : 'rgba(196,170,255,.90)'}`
            : selected
            ? `2px solid ${isWoman ? 'rgba(255,179,230,.72)' : 'rgba(196,170,255,.72)'}`
            : hovered
            ? `1.5px solid ${isWoman ? 'rgba(196,170,255,.68)' : 'rgba(139,92,246,.68)'}`
            : '1px solid rgba(196,170,255,0.3)',
          background: selected
            ? 'linear-gradient(160deg, rgba(40,8,75,0.92) 0%, rgba(60,14,105,0.96) 100%)'
            : 'linear-gradient(160deg, rgba(30,5,60,0.85) 0%, rgba(50,10,90,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: selected && hovered
            ? isWoman
              ? '0 24px 70px rgba(255,179,230,.44), 0 0 40px rgba(196,170,255,.30), inset 0 0 28px rgba(255,179,230,.10)'
              : '0 24px 70px rgba(155,114,207,.50), 0 0 40px rgba(255,179,230,.28), inset 0 0 28px rgba(155,114,207,.12)'
            : selected
            ? isWoman
              ? '0 20px 56px rgba(255,179,230,.34), 0 0 28px rgba(196,170,255,.22), inset 0 0 20px rgba(255,179,230,.07)'
              : '0 20px 56px rgba(155,114,207,.40), 0 0 28px rgba(255,179,230,.20), inset 0 0 20px rgba(155,114,207,.09)'
            : hovered
            ? isWoman
              ? '0 16px 48px rgba(255,179,230,.38), 0 0 24px rgba(196,170,255,.20)'
              : '0 16px 48px rgba(155,114,207,.44), 0 0 24px rgba(200,177,228,.20)'
            : '0 8px 32px rgba(0,0,0,0.4)',
          transition: 'box-shadow 0.30s ease, border-color 0.30s ease, background 0.30s ease',
        }}
      >
        {/* Character illustration area */}
        <div
          style={{
            height: 340,
            position: 'relative',
            background: isWoman
              ? 'linear-gradient(160deg, #2a0a5e 0%, #4a1080 40%, #7b2fb0 70%, #c060c0 100%)'
              : 'linear-gradient(160deg, #0d0a3a 0%, #1a1568 40%, #2d2a9e 70%, #5545c0 100%)',
            overflow: 'hidden',
            transition: 'filter 0.25s ease',
            filter: hovered ? 'brightness(1.1)' : 'brightness(1)',
          }}
        >
          {/* Background magical elements */}
          <GlowOrb
            size={180}
            color={isWoman ? 'rgba(249,168,212,0.25)' : 'rgba(139,92,246,0.25)'}
            style={{ bottom: -20, left: '50%', transform: 'translateX(-50%)' }}
          />
          <GlowOrb
            size={100}
            color={isWoman ? 'rgba(253,230,138,0.2)' : 'rgba(200,177,228,0.20)'}
            style={{ top: 20, right: 20 }}
          />

          {/* Stars */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="animate-star-twinkle"
              style={{
                position: 'absolute',
                width: 2,
                height: 2,
                borderRadius: '50%',
                background: 'white',
                top: `${10 + (i * 13) % 60}%`,
                left: `${(i * 17 + 5) % 90}%`,
                animationDelay: `${(i * 0.4) % 3}s`,
              }}
            />
          ))}

          {/* Character illustration */}
          {isWoman ? <WomanCharacter /> : <ManCharacter />}

          {/* Floating particles */}
          {[...Array(5)].map((_, i) => (
            <Particle key={i} x={30 + i * 55} y={280 + (i % 3) * 20} delay={i * 0.7} />
          ))}

          {/* Selected badge */}
          {selected && (
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #fde68a, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245,158,11,0.5)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Card info — fixed height so both cards are a perfect matched pair */}
        <div style={{
          position: 'relative',
          height: 260,
          padding: '20px 28px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          {/* Divider */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 28,
            right: 28,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(196,170,255,0.5), transparent)',
          }} />

          {/* Name */}
          <div style={{ textAlign: 'center', marginBottom: 2, flexShrink: 0 }}>
            <span style={{
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel Decorative', serif",
              fontSize: isAr ? 22 : 24,
              fontWeight: 700,
              letterSpacing: isAr ? 0 : '0.04em',
              color: 'rgba(253,230,138,0.94)',
              textTransform: 'none',
              display: 'block',
              textShadow: isWoman ? '0 0 22px rgba(255,179,230,.38)' : '0 0 22px rgba(196,170,255,.38)',
            }}>
              {isWoman ? t.guideDawnName : t.guideDuskName}
            </span>
          </div>

          {/* Subtitle */}
          <div style={{ textAlign: 'center', marginBottom: 12, flexShrink: 0 }}>
            <span style={{
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif",
              fontStyle: isAr ? 'normal' : 'italic',
              fontSize: 15,
              color: isWoman ? 'rgba(255,179,230,0.74)' : 'rgba(196,170,255,0.74)',
              letterSpacing: isAr ? 0 : '0.02em',
            }}>
              {isWoman ? t.guideDawnSubtitle : t.guideDuskSubtitle}
            </span>
          </div>

          {/* Quote — flex-grows to absorb any remaining vertical space */}
          <p style={{
            fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif",
            fontStyle: isAr ? 'normal' : 'italic',
            fontSize: 15,
            lineHeight: 1.6,
            color: 'rgba(221,200,255,0.8)',
            margin: 0,
            flex: 1,
            overflow: 'hidden',
          }}>
            {isWoman ? t.guideDawnQuote : t.guideDuskQuote}
          </p>

          {/* Badges — fixed row, centered, no wrap so height stays constant */}
          <div style={{
            display: 'flex',
            gap: 6,
            justifyContent: 'center',
            flexWrap: 'nowrap',
            marginTop: 12,
            marginBottom: 12,
            flexShrink: 0,
          }}>
            {(isWoman ? t.guideDawnTags : t.guideDuskTags).map(tag => (
              <TraitBadge key={tag} label={tag} isWoman={isWoman} />
            ))}
          </div>

          {/* Selection is shown through card glow/border only — no button needed */}
        </div>
      </div>
    </div>
  )
}

function WomanCharacter() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 340" fill="none" style={{ position: 'absolute', inset: 0 }}>
      {/* Flowing robe - bottom */}
      <path d="M120,320 Q100,300 90,260 Q80,220 85,190 Q90,160 100,150 L160,145 L220,150 Q230,160 235,190 Q240,220 230,260 Q220,300 200,320 Z"
        fill="url(#robeGradW)" opacity="0.95" />
      {/* Robe overlay shimmer */}
      <path d="M130,310 Q115,290 110,260 Q105,230 110,200 L160,195 L210,200 Q215,230 210,260 Q205,290 190,310 Z"
        fill="rgba(245,220,255,0.15)" />
      {/* Belt / sash */}
      <ellipse cx="160" cy="195" rx="42" ry="10" fill="rgba(253,230,138,0.4)" />
      <ellipse cx="160" cy="195" rx="42" ry="10" fill="none" stroke="rgba(253,230,138,0.6)" strokeWidth="1" />
      {/* Bodice */}
      <path d="M110,155 Q130,140 160,138 Q190,140 210,155 L215,200 Q190,195 160,195 Q130,195 105,200 Z"
        fill="url(#bodiceW)" />
      {/* Neckline detail */}
      <path d="M140,145 Q160,158 180,145" stroke="rgba(253,230,138,0.5)" strokeWidth="1.5" fill="none" />
      {/* Head / face */}
      <ellipse cx="160" cy="100" rx="36" ry="40" fill="#c8956a" />
      {/* Hijab / head covering - Saudi-inspired */}
      <ellipse cx="160" cy="82" rx="42" ry="30" fill="#d4aaff" opacity="0.95" />
      <path d="M118,82 Q118,60 160,56 Q202,60 202,82 Q210,100 210,120 L200,130 Q180,138 160,138 Q140,138 120,130 L110,120 Q110,100 118,82 Z"
        fill="url(#hijabGradW)" />
      {/* Hijab drape */}
      <path d="M115,90 Q100,120 105,150 Q110,165 120,170 L115,145 Q108,125 112,100 Z"
        fill="rgba(180,120,255,0.6)" />
      <path d="M205,90 Q220,120 215,150 Q210,165 200,170 L205,145 Q212,125 208,100 Z"
        fill="rgba(180,120,255,0.6)" />
      {/* Hijab border embroidery */}
      <path d="M118,82 Q160,72 202,82" stroke="rgba(253,230,138,0.7)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
      {/* Face features */}
      <ellipse cx="148" cy="102" rx="5" ry="6" fill="#2d1154" />
      <ellipse cx="172" cy="102" rx="5" ry="6" fill="#2d1154" />
      <circle cx="150" cy="100" r="1.5" fill="white" />
      <circle cx="174" cy="100" r="1.5" fill="white" />
      <path d="M152,115 Q160,121 168,115" stroke="#c8846a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="160" cy="111" rx="2" ry="1.5" fill="#c8846a" />
      {/* Eyebrows */}
      <path d="M142,94 Q148,90 155,93" stroke="#3d1a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M165,93 Q172,90 178,94" stroke="#3d1a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="140" cy="112" rx="7" ry="4" fill="rgba(249,164,216,0.35)" />
      <ellipse cx="180" cy="112" rx="7" ry="4" fill="rgba(249,164,216,0.35)" />
      {/* Arms */}
      <path d="M105,160 Q85,175 75,210 Q70,235 78,250 Q85,255 90,245 Q88,225 95,205 Q105,180 115,168 Z"
        fill="url(#sleeveW)" />
      <path d="M215,160 Q235,175 245,210 Q250,235 242,250 Q235,255 230,245 Q232,225 225,205 Q215,180 205,168 Z"
        fill="url(#sleeveW)" />
      {/* Hands */}
      <ellipse cx="81" cy="252" rx="10" ry="7" fill="#c8956a" transform="rotate(-15 81 252)" />
      <ellipse cx="239" cy="252" rx="10" ry="7" fill="#c8956a" transform="rotate(15 239 252)" />
      {/* Jewellery - necklace */}
      <path d="M135,148 Q160,165 185,148" stroke="rgba(253,230,138,0.7)" strokeWidth="1.5" fill="none" />
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const x = 135 + t * 50
        const y = 148 + Math.sin(t * Math.PI) * 17
        return <circle key={t} cx={x} cy={y} r="2" fill="rgba(253,230,138,0.8)" />
      })}
      {/* Robe embroidery patterns */}
      <path d="M130,220 Q140,215 150,220 Q160,225 170,220 Q180,215 190,220"
        stroke="rgba(196,170,255,0.4)" strokeWidth="1" fill="none" />
      <path d="M128,240 Q142,234 158,240 Q174,246 190,240"
        stroke="rgba(196,170,255,0.3)" strokeWidth="1" fill="none" />
      {/* Magical orb in hand */}
      <circle cx="78" cy="255" r="12" fill="rgba(196,170,255,0.2)" stroke="rgba(196,170,255,0.5)" strokeWidth="1" />
      <circle cx="78" cy="255" r="6" fill="rgba(253,230,138,0.4)" />
      <circle cx="75" cy="252" r="2" fill="white" opacity="0.6" />
      <defs>
        <linearGradient id="robeGradW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7b35b0" />
          <stop offset="50%" stopColor="#9b45d0" />
          <stop offset="100%" stopColor="#c060c0" />
        </linearGradient>
        <linearGradient id="bodiceW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6b25a0" />
          <stop offset="100%" stopColor="#8b35b8" />
        </linearGradient>
        <linearGradient id="hijabGradW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c090f0" />
          <stop offset="100%" stopColor="#9060d0" />
        </linearGradient>
        <linearGradient id="sleeveW" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7b35b0" />
          <stop offset="100%" stopColor="#9b45d0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function ManCharacter() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 340" fill="none" style={{ position: 'absolute', inset: 0 }}>
      {/* Thobe / robe bottom */}
      <path d="M105,320 Q90,295 88,255 Q85,215 90,185 Q95,165 108,158 L160,153 L212,158 Q225,165 230,185 Q235,215 232,255 Q230,295 215,320 Z"
        fill="url(#robeGradM)" opacity="0.95" />
      {/* Thobe shimmer */}
      <path d="M118,310 Q108,285 108,255 Q108,225 112,200 L160,196 L208,200 Q212,225 212,255 Q212,285 202,310 Z"
        fill="rgba(220,220,255,0.1)" />
      {/* Bisht / cloak overlay */}
      <path d="M88,175 Q70,200 65,240 Q60,280 75,315 L90,320 Q80,285 82,250 Q84,215 98,185 Z"
        fill="url(#bishthM)" opacity="0.8" />
      <path d="M232,175 Q250,200 255,240 Q260,280 245,315 L230,320 Q240,285 238,250 Q236,215 222,185 Z"
        fill="url(#bishthM)" opacity="0.8" />
      {/* Bisht gold trim */}
      <path d="M88,175 Q70,200 65,240 Q60,280 75,315"
        stroke="rgba(253,230,138,0.6)" strokeWidth="2" fill="none" />
      <path d="M232,175 Q250,200 255,240 Q260,280 245,315"
        stroke="rgba(253,230,138,0.6)" strokeWidth="2" fill="none" />
      {/* Shoulders */}
      <path d="M90,158 Q115,148 160,145 Q205,148 230,158 L232,175 Q200,168 160,165 Q120,168 88,175 Z"
        fill="url(#shoulderM)" />
      {/* Head */}
      <ellipse cx="160" cy="96" rx="34" ry="38" fill="#b07848" />
      {/* Ghutra / keffiyeh - white cloth */}
      <ellipse cx="160" cy="78" rx="40" ry="26" fill="#f0f0ff" opacity="0.97" />
      <path d="M120,80 Q120,58 160,54 Q200,58 200,80 Q205,100 202,125 L198,135 Q178,140 160,140 Q142,140 122,135 L118,125 Q115,100 120,80 Z"
        fill="url(#ghuthraM)" />
      {/* Agal - black cord */}
      <ellipse cx="160" cy="70" rx="32" ry="8" fill="none" stroke="#1a0535" strokeWidth="5" opacity="0.8" />
      <ellipse cx="160" cy="70" rx="32" ry="8" fill="none" stroke="#2d0a5a" strokeWidth="3" opacity="0.5" />
      {/* Ghutra drape - one side */}
      <path d="M120,90 Q108,115 110,145 Q112,160 120,165 L118,145 Q112,125 116,100 Z"
        fill="rgba(230,230,255,0.5)" />
      {/* Beard */}
      <path d="M136,120 Q145,135 160,138 Q175,135 184,120 Q180,130 160,136 Q140,130 136,120 Z"
        fill="#3d2010" opacity="0.85" />
      {/* Face features */}
      <ellipse cx="148" cy="97" rx="5" ry="5.5" fill="#2d1154" />
      <ellipse cx="172" cy="97" rx="5" ry="5.5" fill="#2d1154" />
      <circle cx="150" cy="95" r="1.5" fill="white" />
      <circle cx="174" cy="95" r="1.5" fill="white" />
      <path d="M152,112 Q160,117 168,112" stroke="#8b5030" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="160" cy="107" rx="2" ry="1.5" fill="#9b5a38" />
      {/* Eyebrows - thicker, more distinguished */}
      <path d="M140,89 Q147,85 155,88" stroke="#2a1008" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M165,88 Q173,85 180,89" stroke="#2a1008" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="138" cy="108" rx="6" ry="3.5" fill="rgba(200,140,100,0.2)" />
      <ellipse cx="182" cy="108" rx="6" ry="3.5" fill="rgba(200,140,100,0.2)" />
      {/* Arms */}
      <path d="M88,172 Q72,188 68,222 Q64,250 72,262 Q78,266 83,256 Q80,238 86,218 Q94,195 102,178 Z"
        fill="url(#sleeveM)" />
      <path d="M232,172 Q248,188 252,222 Q256,250 248,262 Q242,266 237,256 Q240,238 234,218 Q226,195 218,178 Z"
        fill="url(#sleeveM)" />
      {/* Hands */}
      <ellipse cx="74" cy="259" rx="10" ry="7" fill="#b07848" transform="rotate(-10 74 259)" />
      <ellipse cx="246" cy="259" rx="10" ry="7" fill="#b07848" transform="rotate(10 246 259)" />
      {/* Staff in right hand */}
      <line x1="246" y1="260" x2="260" y2="320" stroke="#5a3010" strokeWidth="4" strokeLinecap="round" />
      <circle cx="260" cy="318" r="5" fill="#b07820" opacity="0.8" />
      {/* Magical book in left hand */}
      <rect x="58" y="250" width="24" height="30" rx="2" fill="#3d1a6e" opacity="0.9" />
      <rect x="58" y="250" width="24" height="30" rx="2" fill="none" stroke="rgba(253,230,138,0.5)" strokeWidth="1" />
      <line x1="65" y1="258" x2="76" y2="258" stroke="rgba(253,230,138,0.4)" strokeWidth="0.8" />
      <line x1="65" y1="263" x2="76" y2="263" stroke="rgba(253,230,138,0.4)" strokeWidth="0.8" />
      <line x1="65" y1="268" x2="74" y2="268" stroke="rgba(253,230,138,0.4)" strokeWidth="0.8" />
      {/* Robe pattern */}
      <path d="M130,220 Q145,215 160,218 Q175,215 190,220"
        stroke="rgba(180,160,255,0.3)" strokeWidth="1" fill="none" />
      <defs>
        <linearGradient id="robeGradM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1568" />
          <stop offset="50%" stopColor="#2d2a9e" />
          <stop offset="100%" stopColor="#4535c0" />
        </linearGradient>
        <linearGradient id="bishthM" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(20,10,60,0.9)" />
          <stop offset="100%" stopColor="rgba(40,20,100,0.7)" />
        </linearGradient>
        <linearGradient id="ghuthraM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8ff" />
          <stop offset="100%" stopColor="#c8c8ee" />
        </linearGradient>
        <linearGradient id="shoulderM" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2525a0" />
          <stop offset="100%" stopColor="#1a1568" />
        </linearGradient>
        <linearGradient id="sleeveM" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1a1568" />
          <stop offset="100%" stopColor="#2d2a9e" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function JourneyButton({ onContinue, label }: { onContinue: () => void; label: string }) {
  const { isAr } = useLang()
  const [hov, setHov] = useState(false)
  const [pressed, setPressed] = useState(false)
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onClick={onContinue}
      className="btn-primary"
      style={{
        fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif",
        fontSize: 16,
        letterSpacing: isAr ? 0 : '0.15em',
        textTransform: isAr ? 'none' : 'uppercase',
        padding: '13px 52px',
        borderRadius: 4,
        cursor: 'pointer',
        color: hov ? 'rgba(255,240,200,.98)' : '#fde68a',
        transition: 'all 0.40s cubic-bezier(.22,1,.36,1)',
        transform: pressed ? 'translateY(1px) scale(0.97)' : hov ? 'translateY(-2px) scale(1.02)' : 'none',
        boxShadow: hov
          ? '0 8px 32px rgba(255,179,230,.32), 0 0 24px rgba(196,170,255,.20), 0 0 0 1px rgba(255,179,230,.20), inset 0 0 20px rgba(255,179,230,.10)'
          : '0 4px 18px rgba(155,114,207,.28)',
        borderColor: hov ? 'rgba(255,179,230,.62)' : undefined,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {hov && (
        <span style={{
          position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)',
          animation: 'shimmer-pass .7s ease forwards',
          pointerEvents: 'none',
        }} />
      )}
      {label}
    </button>
  )
}

function GuideScreen({ onContinue, onBack }: { onContinue: (guide: GuideChoice) => void; onBack: () => void }) {
  const [selectedGuide, setSelectedGuide] = useState<'woman' | 'man' | null>(null)
  const [backHov, setBackHov] = useState(false)
  const [backPressed, setBackPressed] = useState(false)
  const [orHov, setOrHov] = useState(false)
  const { t, isAr } = useLang()

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Nunito', sans-serif",
        background: 'linear-gradient(160deg, #0d0022 0%, #1e0535 30%, #2d0a5a 60%, #1a0535 100%)',
      }}
    >
      {/* Global controls at top-right */}
      <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 20, display: 'flex', gap: 8 }}>
        <InlineControls />
      </div>

      {/* ── SCROLLABLE CONTENT ──────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        overflowY: 'auto', overflowX: 'hidden',
        zIndex: 5,
      }}>
      {/* Background atmospheric elements */}
      <GlowOrb size={600} color="rgba(139,92,246,0.12)" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
      <GlowOrb size={300} color="rgba(249,168,212,0.1)" style={{ top: '20%', right: '10%' }} />
      <GlowOrb size={250} color="rgba(139,92,246,0.15)" style={{ bottom: '15%', left: '10%' }} />

      {/* Stars */}
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="animate-star-twinkle"
          style={{
            position: 'absolute',
            width: i % 7 === 0 ? 3 : 1.5,
            height: i % 7 === 0 ? 3 : 1.5,
            borderRadius: '50%',
            background: 'white',
            top: `${(i * 31) % 100}%`,
            left: `${(i * 23 + 11) % 100}%`,
            animationDelay: `${(i * 0.35) % 3}s`,
          }}
        />
      ))}

      {/* Decorative top arch */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 800,
        height: 3,
        background: 'linear-gradient(90deg, transparent, rgba(253,230,138,0.4), rgba(196,170,255,0.6), rgba(253,230,138,0.4), transparent)',
      }} />

      {/* Butterflies */}
      <Butterfly style={{ top: '20%', left: '8%' }} delay={0} variant={1} />
      <Butterfly style={{ top: '30%', right: '6%' }} delay={3} variant={2} />
      <Butterfly style={{ bottom: '25%', left: '5%' }} delay={6} variant={3} />

      {/* Top-right AR back button — EN back button is handled below at top-left */}
      {isAr && (
        <div style={{ position: 'fixed', top: 24, right: 120, zIndex: 20 }}>
          <button
            onMouseEnter={() => setBackHov(true)}
            onMouseLeave={() => { setBackHov(false); setBackPressed(false) }}
            onMouseDown={() => setBackPressed(true)}
            onMouseUp={() => setBackPressed(false)}
            onClick={onBack}
            style={{
              background: backHov ? 'rgba(50,10,90,0.82)' : 'rgba(30,5,60,0.6)',
              border: `1px solid ${backHov ? 'rgba(255,179,230,0.52)' : 'rgba(196,170,255,0.3)'}`,
              borderRadius: 6,
              padding: '8px 16px',
              color: backHov ? 'rgba(255,230,245,.96)' : 'rgba(196,170,255,0.8)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.38s cubic-bezier(.22,1,.36,1)',
              transform: backPressed ? 'translateY(1px) scale(0.97)' : backHov ? 'translateY(-1.5px) scale(1.01)' : 'none',
              boxShadow: backHov ? '0 4px 18px rgba(255,179,230,.22), 0 0 12px rgba(155,114,207,.14)' : 'none',
            }}
          >
            {t.back}
          </button>
        </div>
      )}

      {/* Back button — EN mode only (top-left) */}
      {!isAr && (
        <button
          onMouseEnter={() => setBackHov(true)}
          onMouseLeave={() => { setBackHov(false); setBackPressed(false) }}
          onMouseDown={() => setBackPressed(true)}
          onMouseUp={() => setBackPressed(false)}
          onClick={onBack}
          style={{
            position: 'fixed',
            top: 24,
            left: 24,
            zIndex: 20,
            background: backHov ? 'rgba(50,10,90,0.82)' : 'rgba(30,5,60,0.6)',
            border: `1px solid ${backHov ? 'rgba(255,179,230,0.52)' : 'rgba(196,170,255,0.3)'}`,
            borderRadius: 6,
            padding: '8px 16px',
            color: backHov ? 'rgba(255,230,245,.96)' : 'rgba(196,170,255,0.8)',
            fontFamily: "'Nunito', sans-serif",
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.38s cubic-bezier(.22,1,.36,1)',
            transform: backPressed ? 'translateY(1px) scale(0.97)' : backHov ? 'translateY(-1.5px) scale(1.01)' : 'none',
            boxShadow: backHov ? '0 4px 18px rgba(255,179,230,.22), 0 0 12px rgba(155,114,207,.14)' : 'none',
          }}
        >
          {t.back}
        </button>
      )}

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        gap: 0,
        padding: '80px 40px 48px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{
            fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif",
            fontSize: 12,
            letterSpacing: isAr ? 0 : '0.4em',
            color: 'rgba(253,230,138,0.6)',
            marginBottom: 10,
            textTransform: isAr ? 'none' : 'uppercase',
          }}>
            {t.guideStep}
          </p>
          <h2 style={{
            fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel Decorative', serif",
            fontSize: isAr ? 34 : 38,
            fontWeight: 700,
            color: 'white',
            marginBottom: 8,
            textShadow: '0 0 40px rgba(196,170,255,0.5)',
          }}>
            {t.guideTitle}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,170,255,0.5))' }} />
            <svg width="12" height="12" viewBox="0 0 16 16"><polygon points="8,1 9.8,5.8 15,6.2 11,10 12.4,15 8,12.2 3.6,15 5,10 1,6.2 6.2,5.8" fill="rgba(253,230,138,0.7)" /></svg>
            <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg, rgba(196,170,255,0.5), transparent)' }} />
          </div>
          <p style={{
            fontFamily: "'Lora', serif",
            fontStyle: isAr ? 'normal' : 'italic',
            fontSize: 14.5,
            color: 'rgba(221,200,255,0.7)',
          }}>
            {t.guideSubtitle}
          </p>
        </div>

        {/* Guide cards */}
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <GuideCard
            guide="woman"
            selected={selectedGuide === 'woman'}
            dimmed={selectedGuide === 'man'}
            onSelect={() => {
              if (selectedGuide === 'woman') { audio.playRoomOpen(); onContinue('woman') } else { audio.playSelect(); setSelectedGuide('woman') }
            }}
          />
          {/* Center ornament */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 1, height: 60, background: 'linear-gradient(180deg, transparent, rgba(196,170,255,0.4), transparent)' }} />
            <div
              onMouseEnter={() => setOrHov(true)}
              onMouseLeave={() => setOrHov(false)}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: `1px solid ${orHov ? 'rgba(255,179,230,0.58)' : 'rgba(196,170,255,0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: orHov ? 'rgba(60,10,100,0.75)' : 'rgba(30,5,60,0.6)',
                boxShadow: orHov ? '0 0 18px rgba(255,179,230,.22), 0 0 32px rgba(155,114,207,.16), inset 0 0 14px rgba(255,179,230,.10)' : 'none',
                transform: orHov ? 'scale(1.08)' : 'scale(1)',
                transition: 'all 0.38s cubic-bezier(.22,1,.36,1)',
                cursor: 'default',
              }}
            >
              <span style={{
                color: orHov ? 'rgba(255,210,245,0.92)' : 'rgba(196,170,255,0.7)',
                fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel', serif",
                fontSize: 14.5,
                transition: 'color 0.3s',
              }}>{t.guideOr}</span>
            </div>
            <div style={{ width: 1, height: 60, background: 'linear-gradient(180deg, transparent, rgba(196,170,255,0.4), transparent)' }} />
          </div>
          <GuideCard
            guide="man"
            selected={selectedGuide === 'man'}
            dimmed={selectedGuide === 'woman'}
            onSelect={() => {
              if (selectedGuide === 'man') { audio.playRoomOpen(); onContinue('man') } else { audio.playSelect(); setSelectedGuide('man') }
            }}
          />
        </div>

        {/* Continue button — visible only after selection */}
        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minHeight: 56 }}>
          {selectedGuide ? (
            <JourneyButton onContinue={() => { audio.playRoomOpen(); onContinue(selectedGuide) }} label={t.guideContinueBtn} />
          ) : (
            <p style={{
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif",
              fontStyle: isAr ? 'normal' : 'italic',
              fontSize: 14.5,
              color: 'rgba(196,170,255,0.4)',
            }}>
              {t.guideSelectHint}
            </p>
          )}
        </div>
      </div>
      </div>{/* end scroll wrapper */}
    </div>
  )
}


// ─── Main App ─────────────────────────────────────────────────────────────────

// ─── Reset confirmation overlay ───────────────────────────────────────────────
function ResetConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const { t } = useLang()
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      overflowY: 'auto', overflowX: 'hidden',
      background: 'rgba(2,0,10,.82)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 400, borderRadius: 18, overflow: 'hidden',
        background: 'linear-gradient(145deg,rgba(6,1,22,.99),rgba(18,5,44,.99))',
        border: '1.5px solid rgba(249,168,212,.4)',
        boxShadow: '0 24px 80px rgba(0,0,0,.8)',
      }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg,transparent,#f9a8d4,rgba(253,230,138,.8),#f9a8d4,transparent)' }}/>
        <div style={{ padding: '28px 30px 26px', textAlign: 'center' }}>
          <div style={{ fontSize: 38, marginBottom: 14 }}>⚠️</div>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10.5, color: 'rgba(253,230,138,.7)', letterSpacing: '.25em', marginBottom: 10 }}>
            {t.resetAdventure}
          </p>
          <h2 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 18, color: 'rgba(249,168,212,.95)', marginBottom: 14, lineHeight: 1.3 }}>
            {t.resetHeading}
          </h2>
          <p style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: 16, color: 'rgba(196,170,255,.75)', lineHeight: 1.7, marginBottom: 24 }}>
            {t.resetDesc}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onCancel} style={{
              flex: 1, padding: '12px 0', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(196,170,255,.1)',
              border: '1.5px solid rgba(196,170,255,.35)',
              fontFamily: "'Cinzel',serif", fontSize: 13, color: 'rgba(196,170,255,.85)', letterSpacing: '.1em',
            }}>
              {t.resetKeepPlaying}
            </button>
            <button onClick={onConfirm} style={{
              flex: 1, padding: '12px 0', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(249,168,212,.15)',
              border: '1.5px solid rgba(249,168,212,.55)',
              fontFamily: "'Cinzel',serif", fontSize: 13, color: 'rgba(249,168,212,.9)', letterSpacing: '.1em',
            }}>
              {t.resetConfirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('opening')
  const [guide, setGuide] = useState<GuideChoice | null>(null)
  const [collectedKeys, setCollectedKeys] = useState<Set<string>>(new Set())
  const [butterflies, setButterflies] = useState(0)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [portfolioSection, setPortfolioSection] = useState<string | undefined>(undefined)

  function collectKey(id: string) {
    setCollectedKeys(prev => new Set([...prev, id]))
    audio.playKeyCollect()
  }

  function goToMainMenu() {
    audio.playReturnGarden()
    setScreen('opening')
  }

  function requestReset() {
    setShowResetConfirm(true)
  }

  function confirmReset() {
    setCollectedKeys(new Set())
    setButterflies(0)
    setGuide(null)
    setShowResetConfirm(false)
    setScreen('opening')
  }

  const navProps = {
    onMainMenu: goToMainMenu,
    onReset: requestReset,
  }

  return (
    <div style={{ width: '100vw', height: screen === 'portfolio' ? 'auto' : '100vh', minHeight: '100vh', overflowX: 'hidden', overflowY: screen === 'portfolio' ? 'auto' : 'hidden' }}>
      {screen === 'opening' && (
        <OpeningScreen
          onBegin={() => setScreen('guide')}
          onPortfolio={() => setScreen('portfolio')}
        />
      )}
      {screen === 'guide' && (
        <GuideScreen onContinue={(g) => { setGuide(g); setScreen('hub') }} onBack={() => setScreen('opening')} />
      )}
      {screen === 'hub' && (
        <NewGardenHub
          guide={guide}
          onBack={() => setScreen('opening')}
          collectedKeys={collectedKeys}
          butterflies={butterflies}
          onKeyCollect={collectKey}
          onAddButterfly={() => setButterflies(p => Math.min(p + 1, 10))}
          onEnterRoom={(id) => setScreen(id as Screen)}
          {...navProps}
        />
      )}
      {screen === 'portrait' && (
        <PortraitRoom
          guide={guide}
          onBack={() => setScreen('hub')}
          hasKey={collectedKeys.has('portrait')}
          butterflies={butterflies}
          totalKeys={collectedKeys.size}
          onKeyCollected={() => collectKey('portrait')}
          {...navProps}
        />
      )}
      {screen === 'cabinet' && (
        <CuriousRoom
          guide={guide}
          onBack={() => setScreen('hub')}
          hasKey={collectedKeys.has('cabinet')}
          butterflies={butterflies}
          totalKeys={collectedKeys.size}
          onKeyCollected={() => collectKey('cabinet')}
          {...navProps}
        />
      )}
      {screen === 'studio' && (
        <LavenderStudio
          guide={guide}
          onBack={() => setScreen('hub')}
          hasKey={collectedKeys.has('studio')}
          butterflies={butterflies}
          totalKeys={collectedKeys.size}
          onKeyCollected={() => collectKey('studio')}
          {...navProps}
        />
      )}
      {screen === 'gallery' && (
        <LearningGallery
          guide={guide}
          onBack={() => setScreen('hub')}
          hasKey={collectedKeys.has('gallery')}
          butterflies={butterflies}
          totalKeys={collectedKeys.size}
          onKeyCollected={() => collectKey('gallery')}
          {...navProps}
        />
      )}
      {screen === 'workshop' && (
        <Workshop
          guide={guide}
          onBack={() => setScreen('hub')}
          hasKey={collectedKeys.has('workshop')}
          butterflies={butterflies}
          totalKeys={collectedKeys.size}
          onKeyCollected={() => collectKey('workshop')}
          {...navProps}
        />
      )}
      {screen === 'final-door' && (
        <FinalDoor
          guide={guide}
          onBack={() => setScreen('hub')}
          butterflies={butterflies}
          onPortfolio={() => { setPortfolioSection(undefined); setScreen('portfolio') }}
          onContact={() => { setPortfolioSection('Contact'); setScreen('portfolio') }}
          {...navProps}
        />
      )}
      {screen === 'portfolio' && (
        <PortfolioPage
          onMainMenu={() => setScreen('opening')}
          onEnterGame={() => setScreen(guide !== null ? 'hub' : 'guide')}
          hasGuide={guide !== null}
          initialSection={portfolioSection}
        />
      )}
      {showResetConfirm && (
        <ResetConfirmDialog
          onConfirm={confirmReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  )
}
