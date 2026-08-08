import { useState, useRef, useCallback, useEffect } from 'react'
import { audio } from './sound/engine'
import { useLang, InlineControls } from './LangContext'
import { CompanionFace } from './CompanionIntro'
import GoldenKey from './GoldenKey'

// ─── Types ────────────────────────────────────────────────────────────────────
export type GuideChoice = 'woman' | 'man' | null
type RoomId = 'portrait' | 'cabinet' | 'studio' | 'workshop' | 'gallery' | 'final-door'

interface Room {
  id: RoomId; name: string; tagline: string
  left: number; top: number; scale: number
  accent: string; glow: string; key: string
}

// ROOMS is built at render time from translations — see useRooms() in GardenHub component
// Journey order on map: Portrait → Cabinet → Studio → Workshop → Gallery → Final Door
// Zigzag layout — 3 rows, alternating left/right
// Row 1: Portrait (left) ↔ Cabinet (right)
// Row 2: Studio  (left) ↔ Workshop (right)
// Row 3: Gallery (left) ↔ Final Door (right)
const ROOM_STATICS = [
  { id: 'portrait' as RoomId, left: 12, top: 16, scale: 0.86, accent: '#ffb3e6', glow: 'rgba(255,179,230,.55)', key: '#ff9edb' },
  { id: 'cabinet'  as RoomId, left: 74, top: 18, scale: 0.82, accent: '#e8c27d', glow: 'rgba(232,194,125,.5)',  key: '#e8c27d' },
  { id: 'gallery'  as RoomId, left: 18, top: 76, scale: 0.86, accent: '#c8b1e4', glow: 'rgba(200,177,228,.5)',  key: '#9b72cf' },
  { id: 'workshop' as RoomId, left: 76, top: 50, scale: 0.92, accent: '#9b72cf', glow: 'rgba(155,114,207,.55)', key: '#7b55c0' },
  { id: 'studio'   as RoomId, left: 14, top: 48, scale: 0.92, accent: '#c4aaff', glow: 'rgba(196,170,255,.65)', key: '#a87fff' },
]

// fallback static ROOMS for components that need it before translation is available
const ROOMS: Room[] = [
  { id: 'portrait',  name: 'The Portrait Room',    tagline: 'Stories · Identity · Origins',
    left: 12, top: 16, scale: 0.86, accent: '#ffb3e6', glow: 'rgba(255,179,230,.55)', key: '#ff9edb' },
  { id: 'cabinet',   name: 'The Curious Cabinet',  tagline: 'Wonders · Interests · Mystery',
    left: 74, top: 18, scale: 0.82, accent: '#e8c27d', glow: 'rgba(232,194,125,.5)',  key: '#e8c27d' },
  { id: 'gallery',   name: 'The Learning Gallery',   tagline: 'Education · Growth · Discovery',
    left: 18, top: 76, scale: 0.86, accent: '#c8b1e4', glow: 'rgba(200,177,228,.5)',  key: '#9b72cf' },
  { id: 'workshop',  name: 'The Insight Workshop',   tagline: 'Code · Systems · Technical Craft',
    left: 76, top: 50, scale: 0.92, accent: '#9b72cf', glow: 'rgba(155,114,207,.55)', key: '#7b55c0' },
  { id: 'studio',    name: 'The Lavender Studio',  tagline: 'Design · Creative Works · Vision',
    left: 14, top: 48, scale: 0.92, accent: '#c4aaff', glow: 'rgba(196,170,255,.65)', key: '#a87fff' },
]

// ─── Primitive atoms ──────────────────────────────────────────────────────────
function Orb({ s, color, style }: { s: number; color: string; style?: React.CSSProperties }) {
  return <div className="animate-glow-pulse" style={{ position:'absolute', width:s, height:s, borderRadius:'50%', background:color, filter:`blur(${s*.35}px)`, pointerEvents:'none', ...style }} />
}

function Pip({ x, y, delay, color='rgba(253,230,138,.85)' }: { x:number; y:number; delay:number; color?:string }) {
  return (
    <div className="particle" style={{ position:'absolute', left:x, top:y, width:3, height:3, borderRadius:'50%',
      background:color, boxShadow:`0 0 5px 2px ${color}`, animationDelay:`${delay}s`,
      '--drift':`${(Math.random()-.5)*28}px`, pointerEvents:'none' } as React.CSSProperties} />
  )
}

function Star8({ color, size=8, style }: { color:string; size?:number; style?:React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" style={style}>
      <polygon points="5,0 6.2,3.8 10,3.8 7,6.1 8.1,10 5,7.6 1.9,10 3,6.1 0,3.8 3.8,3.8" fill={color}/>
    </svg>
  )
}

// ─── Butterflies ──────────────────────────────────────────────────────────────
function Butterfly({ x, y, delay, variant, phase, onClick }:
  { x:string; y:string; delay:number; variant:1|2|3; phase:'visible'|'out'|'in'; onClick?:()=>void }) {
  const [w1,w2]: [string,string] = variant===1 ? ['#c4aaff','#9d6ef8'] : variant===2 ? ['#f9a8d4','#f472b6'] : ['#fde68a','#f59e0b']
  const phaseClass = phase==='out' ? 'animate-butterfly-collect' : phase==='in' ? 'animate-butterfly-spawn' : (variant%2===0?'animate-flutter':'animate-flutter2')
  return (
    <div onClick={phase==='visible'?onClick:undefined}
      onMouseEnter={phase==='visible'&&onClick ? e => { e.currentTarget.style.filter='drop-shadow(0 0 8px rgba(255,179,230,.75)) drop-shadow(0 0 16px rgba(196,170,255,.55))'; e.currentTarget.style.transform='scale(1.12)' } : undefined}
      onMouseLeave={phase==='visible'&&onClick ? e => { e.currentTarget.style.filter=''; e.currentTarget.style.transform='' } : undefined}
      className={phaseClass}
      style={{ position:'absolute', left:x, top:y,
        animationDelay: phase==='visible' ? `${delay}s` : '0s',
        zIndex:12, cursor:phase==='visible'&&onClick?'pointer':'default',
        pointerEvents:phase==='visible'&&onClick?'all':'none',
        transition:'filter .25s cubic-bezier(.22,1,.36,1), transform .25s cubic-bezier(.22,1,.36,1)' }}>
      <svg width="30" height="25" viewBox="0 0 30 25">
        <ellipse cx="7" cy="9" rx="7" ry="5.5" fill={w1} opacity=".88" transform="rotate(-22 7 9)"/>
        <ellipse cx="23" cy="9" rx="7" ry="5.5" fill={w1} opacity=".88" transform="rotate(22 23 9)"/>
        <ellipse cx="8" cy="17" rx="5" ry="3.5" fill={w2} opacity=".7" transform="rotate(18 8 17)"/>
        <ellipse cx="22" cy="17" rx="5" ry="3.5" fill={w2} opacity=".7" transform="rotate(-18 22 17)"/>
        <line x1="15" y1="3" x2="12" y2="0" stroke={w2} strokeWidth="1" opacity=".6"/>
        <line x1="15" y1="3" x2="18" y2="0" stroke={w2} strokeWidth="1" opacity=".6"/>
        <ellipse cx="15" cy="12" rx="1.5" ry="7" fill="#2d1154" opacity=".7"/>
      </svg>
    </div>
  )
}

// Module-level butterfly ID counter (persists across re-renders)
let _bfId = 0

// All safe spawn positions across the garden (avoiding button/label zones)
const BF_POOL: { x: string; y: string }[] = [
  { x: '6%',  y: '38%' }, { x: '27%', y: '18%' }, { x: '60%', y: '17%' },
  { x: '55%', y: '46%' }, { x: '78%', y: '38%' }, { x: '10%', y: '75%' },
  { x: '64%', y: '78%' }, { x: '33%', y: '30%' }, { x: '70%', y: '55%' },
  { x: '15%', y: '55%' }, { x: '45%', y: '12%' }, { x: '22%', y: '68%' },
  { x: '50%', y: '72%' }, { x: '38%', y: '48%' }, { x: '82%', y: '62%' },
]

interface BFState {
  id: number
  posIdx: number
  variant: 1|2|3
  delay: number
  phase: 'visible'|'out'|'in'
}

// ─── Buildings ────────────────────────────────────────────────────────────────

/** 1 · Portrait Room — classic gallery colonnade */
function PortraitRoom({ h }: { h: boolean }) {
  return (
    <svg width="175" height="178" viewBox="0 0 175 178" fill="none">
      <defs>
        <linearGradient id="prBody" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#f5ead8"/><stop offset="1" stopColor="#e8d8c4"/></linearGradient>
        <linearGradient id="prRoof" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b090e8"/><stop offset="1" stopColor="#8060c0"/></linearGradient>
        <linearGradient id="prCol"  x1="0" y1="0" x2="1" y2="0"><stop stopColor="#e0d4c0"/><stop offset="1" stopColor="#f5ead8"/></linearGradient>
        <radialGradient id="prArch" cx=".5" cy=".5" r=".5"><stop stopColor="rgba(255,190,100,.5)"/><stop offset="1" stopColor="rgba(255,160,60,.0)"/></radialGradient>
        <filter id="prGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* Ground shadow */}
      <ellipse cx="87" cy="171" rx="70" ry="7" fill="rgba(20,5,50,.5)"/>
      {/* Steps */}
      <rect x="24" y="152" width="127" height="9" rx="2" fill="#ddd0b8" opacity=".85"/>
      <rect x="30" y="143" width="115" height="11" rx="2" fill="#e5d8c4" opacity=".85"/>
      {/* Body */}
      <rect x="18" y="60" width="139" height="85" rx="3" fill="url(#prBody)"/>
      <rect x="18" y="60" width="16" height="85" fill="rgba(0,0,0,.12)" rx="2"/>
      <rect x="141" y="60" width="16" height="85" fill="rgba(0,0,0,.08)" rx="2"/>
      {/* Frieze band */}
      <rect x="18" y="57" width="139" height="10" rx="1" fill="#eedfc8" opacity=".9"/>
      {/* Roof pediment */}
      <path d="M10,60 L87,18 L164,60 Z" fill="url(#prRoof)"/>
      <path d="M18,60 L36,60 L87,25 L138,60 L157,60 L87,18 Z" fill="rgba(255,255,255,.06)"/>
      {/* Pediment ornament */}
      <polygon points="87,8 91,20 87,17 83,20" fill="#fde68a" opacity=".9"/>
      <circle cx="87" cy="7" r="5" fill="#fde68a" opacity=".85"/>
      {/* Columns (4) */}
      {[37, 64, 110, 137].map(x => (
        <g key={x}>
          <rect x={x-1} y="67" width="14" height="77" rx="2" fill="url(#prCol)"/>
          <rect x={x+1} y="67" width="4" height="77" fill="rgba(255,255,255,.18)" rx="1"/>
          <rect x={x-4} y="64" width="20" height="8" rx="2" fill="#f0e4d0" opacity=".9"/>
          <ellipse cx={x+6} cy="64" rx="11" ry="3" fill="#e8dcc8" opacity=".6"/>
          <rect x={x-4} y="141" width="20" height="5" rx="1" fill="#e0d4c0" opacity=".8"/>
        </g>
      ))}
      {/* Central arch */}
      <path d="M64,144 L64,90 Q64,70 87,70 Q110,70 110,90 L110,144 Z" fill="rgba(20,5,50,.75)"/>
      <path d="M64,90 Q64,70 87,70 Q110,70 110,90" fill="none" stroke="rgba(196,170,255,.6)" strokeWidth="2"/>
      {/* Arch glow */}
      <ellipse cx="87" cy="108" rx="20" ry="30" fill="url(#prArch)"/>
      {/* Portrait frame inside */}
      <rect x="73" y="85" width="28" height="38" rx="14" fill="none" stroke="rgba(253,230,138,.7)" strokeWidth="1.5"/>
      <ellipse cx="87" cy="104" rx="11" ry="14" fill="rgba(255,200,100,.1)"/>
      <ellipse cx="87" cy="96" rx="5" ry="5.5" fill="rgba(100,60,140,.4)"/>
      <path d="M79,118 Q83,107 87,105 Q91,107 95,118" fill="rgba(100,60,140,.3)"/>
      {/* Side windows */}
      {[22, 117].map((x,i) => (
        <g key={i}>
          <rect x={x} y="83" width="32" height="40" rx="3" fill="rgba(255,190,80,.12)" stroke="rgba(196,170,255,.45)" strokeWidth="1"/>
          <line x1={x+16} y1="83" x2={x+16} y2="123" stroke="rgba(196,170,255,.25)" strokeWidth="1"/>
          <line x1={x} y1="103" x2={x+32} y2="103" stroke="rgba(196,170,255,.25)" strokeWidth="1"/>
        </g>
      ))}
      {/* Rose vine */}
      <path d="M37,141 Q28,120 31,95 Q27,75 37,67" stroke="rgba(80,120,40,.55)" strokeWidth="1.5" fill="none"/>
      {[100,116,130].map((y,i) => (<circle key={i} cx={26+i*3} cy={y} r={4+i%2} fill="#f9a8d4" opacity=".75"/>))}
      {/* Lantern above arch */}
      <line x1="87" y1="57" x2="87" y2="68" stroke="rgba(253,230,138,.5)" strokeWidth="1"/>
      <rect x="81" y="68" width="12" height="15" rx="4" fill="rgba(253,190,60,.28)" stroke="rgba(253,230,138,.7)" strokeWidth="1"/>
      <circle cx="87" cy="76" r="2.5" fill="rgba(253,230,138,.85)" className="animate-star-twinkle"/>
      {/* Hover halo */}
      {h && <ellipse cx="87" cy="100" rx="76" ry="60" fill="none" stroke="rgba(249,168,212,.38)" strokeWidth="2.5" className="animate-glow-pulse"/>}
    </svg>
  )
}

/** 2 · Curious Cabinet — wide magical armoire */
function CuriousCabinet({ h }: { h: boolean }) {
  return (
    <svg width="192" height="168" viewBox="0 0 192 168" fill="none">
      <defs>
        <linearGradient id="ccBody" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#4a1e08"/><stop offset=".55" stopColor="#2e1005"/><stop offset="1" stopColor="#1a0803"/>
        </linearGradient>
        <linearGradient id="ccDoor" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#3e1a08"/><stop offset="1" stopColor="#251007"/>
        </linearGradient>
        <radialGradient id="ccInner" cx=".5" cy=".4" r=".6">
          <stop stopColor="rgba(196,160,255,.34)"/><stop offset="1" stopColor="rgba(100,40,180,.0)"/>
        </radialGradient>
        <radialGradient id="ccKey" cx=".5" cy=".5" r=".5">
          <stop stopColor="rgba(253,200,80,.58)"/><stop offset="1" stopColor="rgba(180,60,255,.28)"/>
        </radialGradient>
        <filter id="ccBlur4"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="96" cy="163" rx="80" ry="6" fill="rgba(20,5,50,.5)"/>

      {/* Feet */}
      {[22,56,136,170].map(x => <ellipse key={x} cx={x} cy="156" rx="9" ry="5.5" fill="#1a0604"/>)}

      {/* Base plinth */}
      <rect x="14" y="143" width="164" height="14" rx="3" fill="#3d1508"/>
      <rect x="14" y="143" width="164" height="3" rx="2" fill="rgba(253,200,80,.1)"/>
      <rect x="14" y="143" width="164" height="14" rx="3" fill="none" stroke="rgba(184,112,48,.5)" strokeWidth="1.2"/>

      {/* Main body */}
      <rect x="20" y="30" width="152" height="116" rx="4" fill="url(#ccBody)"/>
      <rect x="20" y="30" width="152" height="116" rx="4" fill="none" stroke="#b07028" strokeWidth="2"/>

      {/* Side pilasters */}
      <rect x="20" y="34" width="11" height="112" rx="2" fill="rgba(0,0,0,.22)"/>
      <rect x="161" y="34" width="11" height="112" rx="2" fill="rgba(0,0,0,.15)"/>

      {/* Crown molding */}
      <rect x="10" y="16" width="172" height="18" rx="5" fill="#4a1a08"/>
      <rect x="10" y="16" width="172" height="18" rx="5" fill="none" stroke="#b07028" strokeWidth="1.5"/>
      <path d="M30,25 Q96,15 162,25" stroke="rgba(253,200,80,.42)" strokeWidth="1.2" fill="none"/>
      <ellipse cx="96" cy="21" rx="8" ry="5" fill="rgba(253,200,80,.1)" stroke="rgba(253,200,80,.44)" strokeWidth="1"/>
      <circle cx="96" cy="21" r="3.5" fill="rgba(253,200,80,.55)"/>

      {/* Crown finials */}
      {[16,176].map((x, i) => (
        <g key={i}>
          <rect x={x-3} y="3" width="6" height="15" rx="3" fill="#220a04"/>
          <circle cx={x} cy="3" r="5.5" fill="#b07028"/>
          <circle cx={x} cy="3" r="2.8" fill="rgba(253,200,80,.72)"/>
        </g>
      ))}

      {/* Central divider */}
      <rect x="91" y="30" width="10" height="116" fill="rgba(0,0,0,.28)"/>
      <rect x="93" y="30" width="6" height="116" fill="rgba(255,255,255,.05)" rx="1"/>
      <line x1="96" y1="30" x2="96" y2="146" stroke="rgba(184,112,48,.38)" strokeWidth="1"/>

      {/* ── LEFT DOOR ── */}
      <rect x="22" y="34" width="69" height="108" rx="3" fill="url(#ccDoor)"/>
      <rect x="22" y="34" width="69" height="108" rx="3" fill="none" stroke="rgba(184,112,48,.42)" strokeWidth="1"/>
      {/* Glass display panel top-left */}
      <rect x="28" y="40" width="58" height="36" rx="3" fill="rgba(22,6,4,.72)" stroke="rgba(184,112,48,.3)" strokeWidth="1"/>
      <rect x="28" y="40" width="58" height="36" rx="3" fill="url(#ccInner)" opacity=".65"/>
      <line x1="57" y1="40" x2="57" y2="76" stroke="rgba(184,112,48,.2)" strokeWidth="1"/>
      <line x1="28" y1="58" x2="86" y2="58" stroke="rgba(184,112,48,.16)" strokeWidth="1"/>
      {/* Lower carved panel */}
      <rect x="28" y="81" width="58" height="54" rx="3" fill="rgba(20,5,4,.55)" stroke="rgba(184,112,48,.24)" strokeWidth="1"/>
      {/* Crescent motif */}
      <path d="M49,101 Q58,92 60,104 Q51,114 45,107 Q47,98 49,101" fill="rgba(196,170,255,.18)" stroke="rgba(196,170,255,.4)" strokeWidth="0.8"/>
      {/* Left knob */}
      <circle cx="85" cy="89" r="6" fill="#c88040"/>
      <circle cx="85" cy="89" r="3.2" fill="rgba(253,230,138,.7)"/>
      <circle cx="83.5" cy="87.5" r="1.3" fill="rgba(255,255,255,.28)"/>

      {/* ── RIGHT DOOR ── */}
      <rect x="101" y="34" width="69" height="108" rx="3" fill="url(#ccDoor)"/>
      <rect x="101" y="34" width="69" height="108" rx="3" fill="none" stroke="rgba(184,112,48,.42)" strokeWidth="1"/>
      {/* Glass display panel top-right */}
      <rect x="106" y="40" width="58" height="36" rx="3" fill="rgba(22,6,4,.72)" stroke="rgba(184,112,48,.3)" strokeWidth="1"/>
      <rect x="106" y="40" width="58" height="36" rx="3" fill="url(#ccInner)" opacity=".65"/>
      <line x1="135" y1="40" x2="135" y2="76" stroke="rgba(184,112,48,.2)" strokeWidth="1"/>
      <line x1="106" y1="58" x2="164" y2="58" stroke="rgba(184,112,48,.16)" strokeWidth="1"/>
      {/* Lower carved panel */}
      <rect x="106" y="81" width="58" height="54" rx="3" fill="rgba(20,5,4,.55)" stroke="rgba(184,112,48,.24)" strokeWidth="1"/>
      {/* Star motif */}
      <polygon points="135,96 137,103 144,103 138.5,107 140.5,114 135,110 129.5,114 131.5,107 126,103 133,103" fill="rgba(253,200,80,.16)" stroke="rgba(253,200,80,.38)" strokeWidth="0.8"/>
      {/* Right knob */}
      <circle cx="107" cy="89" r="6" fill="#c88040"/>
      <circle cx="107" cy="89" r="3.2" fill="rgba(253,230,138,.7)"/>
      <circle cx="108.5" cy="87.5" r="1.3" fill="rgba(255,255,255,.28)"/>

      {/* Drawers below doors */}
      {[-34, 0, 34].map((dx) => (
        <g key={dx}>
          <rect x={96+dx-14} y="136" width="28" height="9" rx="2" fill="rgba(25,7,3,.65)" stroke="rgba(184,112,48,.28)" strokeWidth="1"/>
          <circle cx={96+dx} cy="140.5" r="3" fill="#c88040"/>
          <circle cx={96+dx} cy="140.5" r="1.5" fill="rgba(253,200,80,.62)"/>
        </g>
      ))}

      {/* Lavender glow through glass panels */}
      <ellipse cx="57" cy="58" rx="23" ry="14" fill="rgba(196,170,255,.06)"/>
      <ellipse cx="135" cy="58" rx="23" ry="14" fill="rgba(196,170,255,.06)"/>

      {/* Ambient base glow */}
      <ellipse cx="96" cy="148" rx="64" ry="9" fill="rgba(184,112,48,.07)" filter="url(#ccBlur4)"/>

      {/* Hover glow ring */}
      {h && <rect x="8" y="5" width="176" height="161" rx="8" fill="none" stroke="rgba(232,194,125,.38)" strokeWidth="2.5" className="animate-glow-pulse"/>}
    </svg>
  )
}

/** 3 · Lavender Studio — Moorish round pavilion */
function LavenderStudio({ h }: { h: boolean }) {
  return (
    <svg width="200" height="172" viewBox="0 0 200 172" fill="none">
      <defs>
        <linearGradient id="lsBase" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c4b8d4"/><stop offset="1" stopColor="#9080a8"/></linearGradient>
        <linearGradient id="lsCol"  x1="0" y1="0" x2="1" y2="0"><stop stopColor="#d8ccec"/><stop offset="1" stopColor="#ede4f8"/></linearGradient>
        <linearGradient id="lsDome" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7c54d0"/><stop offset=".55" stopColor="#9b7ae8"/><stop offset="1" stopColor="#b898f8"/></linearGradient>
        <linearGradient id="lsRing" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a890d8"/><stop offset="1" stopColor="#7860b0"/></linearGradient>
        <radialGradient id="lsFloor" cx=".5" cy=".5" r=".5"><stop stopColor="rgba(196,170,255,.18)"/><stop offset="1" stopColor="rgba(100,60,180,.0)"/></radialGradient>
      </defs>
      <ellipse cx="100" cy="166" rx="78" ry="6" fill="rgba(20,5,50,.5)"/>
      {/* Platform */}
      <ellipse cx="100" cy="152" rx="74" ry="12" fill="url(#lsBase)"/>
      {/* Column bases */}
      {[26,52,80,120,148,172].map(x => <rect key={x} x={x-8} y="136" width="16" height="14" rx="2" fill="#c4b8d0" opacity=".92"/>)}
      {/* Columns (6) */}
      {[26,52,80,120,148,172].map(x => (
        <g key={x}>
          <rect x={x-6} y="64" width="12" height="75" rx="2" fill="url(#lsCol)"/>
          <rect x={x-6} y="64" width="4" height="75" fill="rgba(255,255,255,.2)" rx="1"/>
          <rect x={x-9} y="61" width="18" height="8" rx="2" fill="#d4c8e0" opacity=".92"/>
        </g>
      ))}
      {/* Arched fill between front 3 columns */}
      {[[26,52],[52,80],[80,120]].map(([a,b],i) => (
        <path key={i} d={`M${a+6},150 L${a+6},95 Q${(a+b)/2},74 ${b-6},95 L${b-6},150 Z`} fill="rgba(15,4,40,.52)"/>
      ))}
      {/* Entablature */}
      <rect x="16" y="60" width="168" height="10" rx="2" fill="#c4b8d0" opacity=".92"/>
      {/* Dome ring */}
      <ellipse cx="100" cy="60" rx="84" ry="16" fill="url(#lsRing)"/>
      {/* Dome body */}
      <path d="M16,60 Q20,16 100,8 Q180,16 184,60 Z" fill="url(#lsDome)"/>
      {/* Stained glass wedges */}
      {[0,1,2,3,4,5,6].map(i => {
        const a1 = (i/7)*Math.PI, a2 = ((i+1)/7)*Math.PI
        const R=82, Ri=28
        const [xo1,yo1] = [100+Math.cos(Math.PI-a1)*R, 60+Math.sin(Math.PI-a1)*(-R*.62)]
        const [xo2,yo2] = [100+Math.cos(Math.PI-a2)*R, 60+Math.sin(Math.PI-a2)*(-R*.62)]
        const [xi1,yi1] = [100+Math.cos(Math.PI-a1)*Ri, 60+Math.sin(Math.PI-a1)*(-Ri*.62)]
        const [xi2,yi2] = [100+Math.cos(Math.PI-a2)*Ri, 60+Math.sin(Math.PI-a2)*(-Ri*.62)]
        const cs = ['#c4aaff','#f9a8d4','#fde68a','#c4aaff','#f9a8d4','#fde68a','#c4aaff']
        return <path key={i} d={`M${xi1},${yi1} L${xo1},${yo1} L${xo2},${yo2} L${xi2},${yi2} Z`}
          fill={cs[i]} opacity=".22" stroke="rgba(255,255,255,.12)" strokeWidth="1"/>
      })}
      {/* Lantern on dome */}
      <rect x="93" y="3" width="14" height="12" rx="4" fill="rgba(253,200,60,.35)" stroke="rgba(253,230,138,.8)" strokeWidth="1"/>
      <line x1="100" y1="-1" x2="100" y2="3" stroke="rgba(253,230,138,.6)" strokeWidth="1.5"/>
      <circle cx="100" cy="0" r="3.5" fill="#fde68a" opacity=".9" className="animate-star-twinkle"/>
      {/* Floor glow */}
      <ellipse cx="82" cy="142" rx="52" ry="16" fill="url(#lsFloor)"/>
      {/* Artist palette */}
      <ellipse cx="82" cy="147" rx="14" ry="9" fill="rgba(80,40,120,.45)" transform="rotate(-15 82 147)"/>
      {['#f9a8d4','#fde68a','#c4aaff','#9b72cf','#f472b6'].map((c,i) => (
        <circle key={i} cx={70+i*5} cy={143+i*2} r="3" fill={c} opacity=".62"/>
      ))}
      {/* Paint brushes */}
      <rect x="115" y="132" width="9" height="15" rx="2" fill="rgba(70,30,10,.55)" stroke="rgba(160,100,50,.4)" strokeWidth="1"/>
      {[0,1,2].map(i => <line key={i} x1={117+i*2} y1="132" x2={117+i*2} y2="117" stroke={['#f9a8d4','#c4aaff','#fde68a'][i]} strokeWidth="1.5"/>)}
      {/* Hanging lanterns */}
      {[[38,55],[82,48]].map(([cx,cy],i) => (
        <g key={i}>
          <line x1={cx} y1="60" x2={cx} y2={cy} stroke="rgba(253,230,138,.4)" strokeWidth="1"/>
          <ellipse cx={cx} cy={cy+8} rx="5" ry="7" fill="rgba(253,190,60,.22)" stroke="rgba(253,230,138,.6)" strokeWidth="1"/>
          <circle cx={cx} cy={cy+6} r="2.5" fill="rgba(253,230,138,.85)" className="animate-star-twinkle" style={{animationDelay:`${i*.5}s`}}/>
        </g>
      ))}
      {h && <ellipse cx="100" cy="92" rx="96" ry="68" fill="none" stroke="rgba(196,170,255,.35)" strokeWidth="2.5" className="animate-glow-pulse"/>}
    </svg>
  )
}

/** 4 · Workshop — clockwork steampunk cottage */
function Workshop({ h }: { h: boolean }) {
  return (
    <svg width="175" height="178" viewBox="0 0 175 178" fill="none">
      <defs>
        <linearGradient id="wkBody" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#c4820e"/><stop offset="1" stopColor="#8a5a10"/></linearGradient>
        <linearGradient id="wkRoof" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#1a3a3a"/><stop offset="1" stopColor="#0d2424"/></linearGradient>
        <linearGradient id="wkDoor" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#4a2808"/><stop offset="1" stopColor="#2a1604"/></linearGradient>
        <radialGradient id="wkWin" cx=".5" cy=".5" r=".5"><stop stopColor="rgba(255,160,40,.4)"/><stop offset="1" stopColor="rgba(200,100,10,.0)"/></radialGradient>
      </defs>
      <ellipse cx="87" cy="172" rx="68" ry="6" fill="rgba(20,5,50,.5)"/>
      {/* Chimney */}
      <rect x="114" y="24" width="20" height="58" rx="2" fill="#7a5018"/>
      <rect x="111" y="20" width="26" height="9" rx="2" fill="#9a6828"/>
      {/* Smoke puffs */}
      {[0,1,2].map(i => (
        <ellipse key={i} cx={124+i*4} cy={15-i*11} rx={6+i*3} ry={5+i*2}
          fill={i===0?'rgba(160,80,220,.65)':'rgba(100,50,180,.35)'}
          className="animate-smoke" style={{animationDelay:`${i*.9}s`}}/>
      ))}
      {/* Body */}
      <rect x="10" y="82" width="138" height="82" rx="4" fill="url(#wkBody)"/>
      <rect x="10" y="82" width="14" height="82" fill="rgba(0,0,0,.18)" rx="2"/>
      {/* Roof */}
      <path d="M4,84 L87,28 L170,84 Z" fill="url(#wkRoof)"/>
      <path d="M4,84 L20,84 L87,36 L154,84 L170,84 L87,28 Z" fill="rgba(255,200,80,.05)"/>
      {/* ── Clock face (AIW pocket watch vibe) ── */}
      <circle cx="87" cy="60" r="22" fill="#160a04" stroke="#c88040" strokeWidth="2.5"/>
      <circle cx="87" cy="60" r="19" fill="rgba(8,4,2,.9)" stroke="rgba(200,140,60,.4)" strokeWidth="1"/>
      {[...Array(12)].map((_,i) => {
        const a=(i/12)*Math.PI*2, r1=16, r2=i%3===0?12:14
        return <line key={i} x1={87+Math.cos(a)*r1} y1={60+Math.sin(a)*r1} x2={87+Math.cos(a)*r2} y2={60+Math.sin(a)*r2}
          stroke="rgba(200,140,60,.72)" strokeWidth={i%3===0?2:1}/>
      })}
      <line x1="87" y1="60" x2="87" y2="48" stroke="#fde68a" strokeWidth="2" strokeLinecap="round"/>
      <line x1="87" y1="60" x2="99" y2="64" stroke="rgba(200,160,60,.85)" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="87" cy="60" r="2.5" fill="#fde68a"/>
      {/* Gear (left wall) */}
      <g className="animate-gear-cw" style={{transformOrigin:'30px 100px'}}>
        <circle cx="30" cy="100" r="15" fill="none" stroke="rgba(180,110,40,.6)" strokeWidth="3"/>
        {[0,1,2,3,4,5,6,7].map(i => {
          const a=(i/8)*Math.PI*2
          return <rect key={i} x={30+Math.cos(a)*14-2} y={100+Math.sin(a)*14-2} width="4" height="4" rx="1"
            fill="rgba(180,110,40,.72)" transform={`rotate(${i*45} ${30+Math.cos(a)*14} ${100+Math.sin(a)*14})`}/>
        })}
        <circle cx="30" cy="100" r="5" fill="rgba(180,110,40,.8)"/>
      </g>
      <g className="animate-gear-ccw" style={{transformOrigin:'49px 93px'}}>
        <circle cx="49" cy="93" r="10" fill="none" stroke="rgba(160,90,30,.5)" strokeWidth="2.5"/>
        {[0,1,2,3,4,5].map(i => {
          const a=(i/6)*Math.PI*2
          return <rect key={i} x={49+Math.cos(a)*9-1.5} y={93+Math.sin(a)*9-1.5} width="3" height="3" rx=".5" fill="rgba(160,90,30,.65)"/>
        })}
        <circle cx="49" cy="93" r="3.5" fill="rgba(160,90,30,.72)"/>
      </g>
      {/* Door */}
      <path d="M63,164 L63,112 Q63,98 76,98 Q89,98 89,112 L89,164 Z" fill="url(#wkDoor)"/>
      <path d="M63,112 Q63,98 76,98 Q89,98 89,112" fill="none" stroke="#c88040" strokeWidth="1.5"/>
      <rect x="64" y="116" width="6" height="2" rx="1" fill="rgba(100,60,20,.8)"/>
      <rect x="64" y="138" width="6" height="2" rx="1" fill="rgba(100,60,20,.8)"/>
      <circle cx="86" cy="130" r="2.5" fill="#b87030"/>
      {/* Windows */}
      <rect x="96" y="102" width="38" height="30" rx="3" fill="url(#wkWin)" stroke="#c88040" strokeWidth="1.5"/>
      <line x1="115" y1="102" x2="115" y2="132" stroke="rgba(200,130,50,.4)" strokeWidth="1"/>
      <line x1="96" y1="117" x2="134" y2="117" stroke="rgba(200,130,50,.4)" strokeWidth="1"/>
      <rect x="14" y="102" width="34" height="28" rx="3" fill="rgba(255,140,30,.12)" stroke="#c88040" strokeWidth="1.5"/>
      <line x1="31" y1="102" x2="31" y2="130" stroke="rgba(200,130,50,.3)" strokeWidth="1"/>
      {/* Copper pipe */}
      <path d="M140,90 Q150,90 150,102 L150,116" stroke="rgba(180,110,40,.6)" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="150" cy="118" r="4.5" fill="rgba(180,110,40,.55)"/>
      {h && <path d="M4,84 L87,28 L170,84 L158,164 L12,164 Z" fill="none" stroke="rgba(155,114,207,.3)" strokeWidth="2.5" className="animate-glow-pulse"/>}
    </svg>
  )
}

/** 5 · Learning Gallery — greenhouse library tower */
function LearningGallery({ h }: { h: boolean }) {
  return (
    <svg width="132" height="210" viewBox="0 0 132 210" fill="none">
      <defs>
        <linearGradient id="lgGlass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="rgba(28,58,80,.45)"/><stop offset="1" stopColor="rgba(18,38,58,.62)"/></linearGradient>
        <linearGradient id="lgMid"  x1="0" y1="0" x2="0" y2="1"><stop stopColor="rgba(22,48,70,.7)"/><stop offset="1" stopColor="rgba(12,28,50,.88)"/></linearGradient>
        <linearGradient id="lgRoof" x1="0" y1="0" x2="0" y2="1"><stop stopColor="rgba(38,76,108,.88)"/><stop offset="1" stopColor="rgba(22,50,78,.95)"/></linearGradient>
        <radialGradient id="lgGlow" cx=".5" cy=".6" r=".5"><stop stopColor="rgba(255,180,60,.15)"/><stop offset="1" stopColor="rgba(200,100,10,.0)"/></radialGradient>
      </defs>
      <ellipse cx="66" cy="204" rx="50" ry="6" fill="rgba(20,5,50,.5)"/>
      {/* Base glass section */}
      <rect x="12" y="148" width="108" height="58" rx="3" fill="url(#lgGlass)" stroke="#b0b8c8" strokeWidth="1.5"/>
      {/* Mid section */}
      <rect x="12" y="120" width="108" height="32" rx="3" fill="url(#lgGlass)" stroke="#b0b8c8" strokeWidth="1.5"/>
      <rect x="12" y="88" width="108" height="36" rx="3" fill="url(#lgGlass)" stroke="#b0b8c8" strokeWidth="1.5"/>
      {/* Grid lines on glass */}
      {[158,168,178,192].map(y => <line key={y} x1="12" y1={y} x2="120" y2={y} stroke="#8090a0" strokeWidth=".7" opacity=".55"/>)}
      {[130,138].map(y => <line key={y} x1="12" y1={y} x2="120" y2={y} stroke="#8090a0" strokeWidth=".7" opacity=".55"/>)}
      {[66].map(x => <line key={x} x1={x} y1="88" x2={x} y2="206" stroke="#8090a0" strokeWidth="1" opacity=".55"/>)}
      {/* Glow inside */}
      <ellipse cx="66" cy="162" rx="48" ry="26" fill="url(#lgGlow)"/>
      {/* Books — bottom section */}
      {[
        {x:18,c:'#c4aaff'},{x:24,c:'#f9a8d4'},{x:30,c:'#fde68a'},{x:36,c:'#9b72cf'},
        {x:42,c:'#c4aaff'},{x:48,c:'#f472b6'},
        {x:72,c:'#c8b1e4'},{x:78,c:'#fde68a'},{x:84,c:'#c4aaff'},{x:90,c:'#f9a8d4'},
        {x:96,c:'#86efac'},{x:102,c:'#fde68a'},
      ].map((b,i) => <rect key={i} x={b.x} y={150} width="5" height={50-(i%4)*4} rx=".5" fill={b.c} opacity=".58"/>)}
      {/* Books — mid section */}
      {[
        {x:18,c:'#fde68a'},{x:24,c:'#c4aaff'},{x:30,c:'#f9a8d4'},{x:36,c:'#fde68a'},
        {x:42,c:'#c8b1e4'},{x:48,c:'#c4aaff'},
        {x:72,c:'#f9a8d4'},{x:78,c:'#c4aaff'},{x:84,c:'#fde68a'},{x:90,c:'#9b72cf'},
        {x:96,c:'#f9a8d4'},{x:102,c:'#c4aaff'},
      ].map((b,i) => <rect key={i} x={b.x} y={122} width="5" height={24-(i%3)*2} rx=".5" fill={b.c} opacity=".52"/>)}
      {/* Floating magic book */}
      <g style={{animation:'float 5s ease-in-out infinite', transformOrigin:'66px 100px'}}>
        <rect x="52" y="92" width="28" height="20" rx="2" fill="rgba(196,170,255,.38)" transform="rotate(-8 66 102)" stroke="rgba(196,170,255,.6)" strokeWidth="1"/>
      </g>
      {/* Shelf dividers */}
      <line x1="12" y1="148" x2="120" y2="148" stroke="#8090a0" strokeWidth="1.5" opacity=".8"/>
      <line x1="12" y1="120" x2="120" y2="120" stroke="#8090a0" strokeWidth="1.5" opacity=".8"/>
      {/* Mid tower */}
      <rect x="20" y="46" width="92" height="46" rx="3" fill="url(#lgMid)" stroke="#a8b0c0" strokeWidth="1.5"/>
      {/* Porthole — constellation map */}
      <circle cx="66" cy="66" r="20" fill="rgba(8,4,24,.85)" stroke="#9090a8" strokeWidth="1.5"/>
      <circle cx="66" cy="66" r="17" fill="rgba(4,2,16,.92)"/>
      {[[60,58],[68,56],[73,63],[68,70],[59,68],[55,63],[64,66]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="#c8b1e4" opacity=".8" className="animate-star-twinkle" style={{animationDelay:`${i*.3}s`}}/>
      ))}
      <polyline points="60,58 68,56 73,63 68,70 59,68 55,63 64,66 60,58" fill="none" stroke="rgba(200,177,228,.3)" strokeWidth=".8"/>
      {/* Peaked glass roof */}
      <path d="M14,48 L66,8 L118,48 Z" fill="url(#lgRoof)"/>
      <path d="M14,48 L28,48 L66,14 L104,48 L118,48 L66,8 Z" fill="rgba(200,177,228,.07)"/>
      {/* Telescope */}
      <line x1="66" y1="8" x2="66" y2="1" stroke="#9090a0" strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="66" cy="1" rx="4.5" ry="2" fill="#808092"/>
      {/* Vines */}
      <path d="M12,200 Q7,168 9,134 Q5,104 12,90" stroke="rgba(55,95,38,.5)" strokeWidth="2" fill="none"/>
      {[140,160,178].map((y,i) => <ellipse key={i} cx={4+i*2} cy={y} rx="6" ry="4" fill="rgba(75,130,48,.42)" transform={`rotate(${-18+i*10} ${4+i*2} ${y})`}/>)}
      <path d="M120,195 Q124,168 122,146 Q126,118 120,96" stroke="rgba(55,95,38,.42)" strokeWidth="1.5" fill="none"/>
      {[152,170].map((y,i) => <ellipse key={i} cx={128-i*3} cy={y} rx="5" ry="3.5" fill="rgba(75,130,48,.38)" transform={`rotate(${14-i*8} ${128-i*3} ${y})`}/>)}
      {h && <path d="M12,88 L12,206 L120,206 L120,88 Z M20,46 L20,88 L112,88 L112,46 Z M14,48 L66,8 L118,48 Z"
        fill="none" stroke="rgba(200,177,228,.33)" strokeWidth="2.5" className="animate-glow-pulse"/>}
    </svg>
  )
}

/** Final locked gate */
function FinalGate({ unlocked, count }: { unlocked: boolean; count: number }) {
  return (
    <svg width="128" height="198" viewBox="0 0 128 198" fill="none">
      <defs>
        <radialGradient id="fgKey" cx=".5" cy=".5" r=".5">
          <stop stopColor={unlocked?'rgba(253,210,80,.7)':'rgba(139,92,246,.45)'}/>
          <stop offset="1" stopColor="rgba(0,0,0,.0)"/>
        </radialGradient>
        <linearGradient id="fgWall" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#2a1545"/><stop offset="1" stopColor="#1e0d35"/></linearGradient>
      </defs>
      <ellipse cx="64" cy="192" rx="52" ry="6" fill="rgba(10,2,30,.7)"/>
      {/* Stone wall flanks */}
      <rect x="0" y="28" width="26" height="158" fill="url(#fgWall)"/>
      <rect x="102" y="28" width="26" height="158" fill="url(#fgWall)"/>
      {[52,74,96,118,140,160].map(y => (
        <g key={y}>
          <line x1="0" y1={y} x2="26" y2={y} stroke="rgba(30,10,60,.5)" strokeWidth="1"/>
          <line x1="102" y1={y} x2="128" y2={y} stroke="rgba(30,10,60,.5)" strokeWidth="1"/>
        </g>
      ))}
      {/* Gothic arch frame */}
      <path d="M18,188 L18,72 Q18,28 64,20 Q110,28 110,72 L110,188 Z" fill="rgba(20,5,40,.85)" stroke="rgba(120,80,200,.4)" strokeWidth="2"/>
      <path d="M18,72 Q18,28 64,20 Q110,28 110,72" fill="none" stroke="rgba(196,170,255,.48)" strokeWidth="2.5"/>
      {/* Double doors */}
      <rect x="22" y="74" width="40" height="108" rx="2" fill={unlocked?'rgba(38,18,6,.82)':'rgba(18,4,38,.92)'} stroke="rgba(120,80,200,.5)" strokeWidth="1.5"/>
      <rect x="66" y="74" width="40" height="108" rx="2" fill={unlocked?'rgba(38,18,6,.82)':'rgba(18,4,38,.92)'} stroke="rgba(120,80,200,.5)" strokeWidth="1.5"/>
      {/* Door panel carvings */}
      {[0,1].map(s => (
        <g key={s}>
          <rect x={22+s*44+4} y="80" width="32" height="44" rx="2" fill="rgba(80,40,140,.14)" stroke="rgba(120,80,200,.22)" strokeWidth="1"/>
          <rect x={22+s*44+4} y="128" width="32" height="48" rx="2" fill="rgba(80,40,140,.10)" stroke="rgba(120,80,200,.18)" strokeWidth="1"/>
        </g>
      ))}
      {/* Ring handles */}
      <circle cx="59" cy="136" r="5.5" fill="none" stroke="rgba(150,100,200,.7)" strokeWidth="2"/>
      <rect x="56" y="138" width="6" height="5" fill="rgba(80,40,140,.5)"/>
      <circle cx="69" cy="136" r="5.5" fill="none" stroke="rgba(150,100,200,.7)" strokeWidth="2"/>
      <rect x="66" y="138" width="6" height="5" fill="rgba(80,40,140,.5)"/>
      {/* ── AIW Keyhole — centrepiece ── */}
      <rect x="49" y="108" width="30" height="40" rx="4" fill="rgba(8,2,22,.96)" stroke={unlocked?'rgba(253,230,138,.85)':'rgba(139,92,246,.62)'} strokeWidth="1.5"/>
      <circle cx="64" cy="120" r="10" fill="rgba(4,1,14,.96)" stroke={unlocked?'#fde68a':'rgba(139,92,246,.72)'} strokeWidth="1.5"/>
      <rect x="60" y="120" width="8" height="20" rx="2" fill="rgba(4,1,14,.96)" stroke={unlocked?'#fde68a':'rgba(139,92,246,.72)'} strokeWidth="1.5"/>
      <circle cx="64" cy="120" r="6" fill="url(#fgKey)" className="animate-glow-pulse"/>
      <circle cx="64" cy="120" r="3" fill={unlocked?'rgba(253,220,80,.75)':'rgba(180,120,255,.45)'}/>
      {/* 5 key slots */}
      {[...Array(5)].map((_,i) => {
        const a=(i/5)*Math.PI*2-Math.PI/2, R=50
        const cx=64+Math.cos(a)*R, cy=102+Math.sin(a)*R
        const filled=i<count
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r="7.5" fill={filled?'rgba(253,200,80,.25)':'rgba(40,20,80,.62)'}
              stroke={filled?'rgba(253,230,138,.8)':'rgba(100,60,180,.4)'} strokeWidth="1.5"/>
            {filled && <>
              <g transform={`translate(${cx-4.5},${cy-7})`}>
                <circle cx="4.5" cy="4" r="3.5" fill="none" stroke="#fde68a" strokeWidth="1.6"/>
                <circle cx="4.5" cy="4" r="1.4" fill="rgba(4,0,14,.8)" stroke="#fde68a" strokeWidth=".7"/>
                <rect x="4" y="7" width="1.1" height="6" rx=".5" fill="#fde68a"/>
                <rect x="5.1" y="9.5" width="2" height="1.1" rx=".4" fill="#fde68a"/>
                <rect x="5.1" y="11.5" width="1.4" height="1" rx=".4" fill="#fde68a"/>
              </g>
              <circle cx={cx} cy={cy} r="7.5" fill="none" stroke="rgba(253,230,138,.45)" strokeWidth="1" className="animate-glow-pulse"/>
            </>}
          </g>
        )
      })}
      {/* Purple roses */}
      {[48,64,80,96,112,130,148].map((y,i) => (
        <g key={i}>
          <circle cx={i%2===0?8:120} cy={y} r={4+i%2} fill="#9b4fd8" opacity=".55"/>
          <circle cx={i%2===0?8:120} cy={y} r="2" fill="#c080f0" opacity=".4"/>
        </g>
      ))}
      {/* Ivy */}
      <path d="M30,44 Q46,34 64,28 Q82,34 98,44" stroke="rgba(40,80,30,.5)" strokeWidth="2" fill="none"/>
      {[0,.25,.5,.75,1].map(t => {
        const x=30+t*68, y=44-Math.sin(t*Math.PI)*12
        return <ellipse key={t} cx={x} cy={y-4} rx="5.5" ry="4" fill="rgba(60,110,40,.45)"/>
      })}
      {/* Locked overlay — dark veil + chain when not unlocked */}
      {!unlocked && (
        <>
          <rect x="18" y="20" width="92" height="172" rx="4" fill="rgba(4,1,14,.52)"/>
          {/* Chain across doors */}
          <path d="M20,148 Q64,138 108,148" stroke="rgba(120,80,200,.72)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          <path d="M20,148 Q64,138 108,148" stroke="rgba(180,140,255,.28)" strokeWidth="1.5" fill="none"/>
          {/* Chain links */}
          {[0,.2,.4,.6,.8,1].map(t => {
            const x=20+t*88, y=148-Math.sin(t*Math.PI)*10+Math.sin(t*Math.PI)*4
            return <ellipse key={t} cx={x} cy={y} rx="5" ry="3.5" fill="none" stroke="rgba(140,90,210,.8)" strokeWidth="2"/>
          })}
          {/* Padlock centrepiece */}
          <rect x="50" y="135" width="28" height="22" rx="5" fill="rgba(14,4,38,.96)" stroke="rgba(139,92,246,.72)" strokeWidth="2"/>
          <path d="M56,135 Q56,123 64,123 Q72,123 72,135" fill="none" stroke="rgba(139,92,246,.72)" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="64" cy="147" r="5.5" fill="rgba(100,50,180,.5)" stroke="rgba(180,130,255,.6)" strokeWidth="1.5"/>
          <rect x="62" y="147" width="4" height="6" rx="1.5" fill="rgba(180,130,255,.5)"/>
        </>
      )}
      {unlocked && <ellipse cx="64" cy="128" rx="35" ry="55" fill="rgba(253,200,80,.14)" className="animate-glow-pulse"/>}
    </svg>
  )
}

// ─── Garden environment ───────────────────────────────────────────────────────

function SkyStars() {
  return <>
    {[...Array(60)].map((_,i) => (
      <div key={i} className="animate-star-twinkle" style={{
        position:'absolute', borderRadius:'50%',
        width: i%6===0?3:i%3===0?2:1.5,
        height: i%6===0?3:i%3===0?2:1.5,
        background:'white',
        top:`${(i*29)%42}%`, left:`${(i*23+7)%100}%`,
        animationDelay:`${(i*.28)%3}s`,
        opacity: i%4===0?.95:i%3===0?.65:.4,
        pointerEvents:'none',
      }}/>
    ))}
  </>
}

// Journey waypoints in 1440×900 SVG space (matches left%*1440, top%*900):
// Portrait(10%,18%)→(144,162)  Cabinet(36%,16%)→(518,144)  Studio(62%,22%)→(893,198)
// Workshop(76%,43%)→(1094,387)  Gallery(45%,58%)→(648,522)  FinalDoor(82%,55%)→(1181,495)
// Waypoints follow zigzag: Portrait→Cabinet→Studio→Workshop→Gallery→FinalDoor
const JOURNEY_WAYPOINTS = [
  [173, 144], [1066, 162], [202, 432], [1094, 450], [259, 684], [1123, 720],
] as const

const JOURNEY_SEGMENTS = [
  { key: 'portrait', d: 'M 173,144 C 460,96  750,160 1066,162' },
  { key: 'cabinet',  d: 'M 1066,162 C 800,248 500,368  202,432' },
  { key: 'studio',   d: 'M 202,432  C 500,418 750,452 1094,450' },
  { key: 'workshop', d: 'M 1094,450 C 800,538 560,636  259,684' },
  { key: 'gallery',  d: 'M 259,684  C 560,682 820,710 1123,720' },
] as const

const FULL_PATH = 'M 173,144 C 460,96 750,160 1066,162 C 800,248 500,368 202,432 C 500,418 750,452 1094,450 C 800,538 560,636 259,684 C 560,682 820,710 1123,720'

function GardenPath({ keys = new Set<string>() }: { keys?: Set<string> }) {
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:1}}
      viewBox="0 0 1440 900" preserveAspectRatio="none">
      <defs>
        <linearGradient id="pathDim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(120,90,180,.22)"/>
          <stop offset="100%" stopColor="rgba(120,90,180,.18)"/>
        </linearGradient>
        <linearGradient id="pathLit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(253,230,138,.88)"/>
          <stop offset="50%" stopColor="rgba(196,170,255,.72)"/>
          <stop offset="100%" stopColor="rgba(253,230,138,.78)"/>
        </linearGradient>
        <filter id="pGlowDim"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="pGlowLit"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Dim base road (always visible, low opacity) */}
      <path d={FULL_PATH} stroke="rgba(100,70,160,.28)" strokeWidth="26" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#pGlowDim)"/>
      <path d={FULL_PATH} stroke="url(#pathDim)" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d={FULL_PATH} stroke="rgba(150,120,200,.1)" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray="28,18"/>

      {/* Progressive lit segments — illuminate when that room key is collected */}
      {JOURNEY_SEGMENTS.map(seg => {
        if (!keys.has(seg.key)) return null
        return (
          <g key={seg.key}>
            <path d={seg.d} stroke="rgba(253,230,138,.28)" strokeWidth="36" fill="none" strokeLinecap="round" filter="url(#pGlowLit)"/>
            <path d={seg.d} stroke="url(#pathLit)" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <path d={seg.d} stroke="rgba(255,248,220,.5)" strokeWidth="5" fill="none" strokeLinecap="round"/>
          </g>
        )
      })}

      {/* Waypoint lantern dots — gold when reached, dim lavender when not */}
      {JOURNEY_WAYPOINTS.map(([x,y],i) => {
        const roomKeys = ['portrait','cabinet','studio','workshop','gallery']
        const lit = i === 0 || keys.has(roomKeys[i-1] ?? '')
        return (
          <g key={i}>
            {lit && <circle cx={x} cy={y} r={14} fill="rgba(253,230,138,.18)" filter="url(#pGlowLit)"/>}
            <circle cx={x} cy={y} r={lit?7:5}
              fill={lit ? 'rgba(253,230,138,.82)' : 'rgba(140,110,200,.35)'}
              style={{transition:'all .6s'}}/>
            {lit && <circle cx={x} cy={y} r={3} fill="rgba(255,255,255,.6)"/>}
          </g>
        )
      })}
    </svg>
  )
}

function HillsSilhouette() {
  return (
    <svg style={{position:'absolute',bottom:0,left:0,width:'100%',height:'65%',pointerEvents:'none'}}
      viewBox="0 0 1440 640" preserveAspectRatio="none">
      {/* Far hills */}
      <path d="M0,180 Q180,72 368,148 Q556,224 732,98 Q908,-8 1098,108 Q1270,200 1440,128 L1440,640 L0,640 Z" fill="rgba(38,8,78,.45)"/>
      {/* Tree silhouettes — far */}
      {[80,200,1200,1340].map((x,i) => (
        <g key={i}>
          <rect x={x+12} y={i<2?270:250} width="8" height={i<2?56:70} fill="rgba(18,5,46,.85)"/>
          <ellipse cx={x+16} cy={i<2?262:238} rx={24} ry={i<2?44:56} fill="rgba(28,8,62,.8)"/>
          <ellipse cx={x+16} cy={i<2?244:218} rx={18} ry={i<2?32:40} fill="rgba(44,12,82,.7)"/>
        </g>
      ))}
      {/* Mid hills */}
      <path d="M0,290 Q158,214 342,258 Q526,302 706,218 Q886,134 1068,238 Q1222,324 1440,272 L1440,640 L0,640 Z" fill="rgba(22,5,56,.62)"/>
      {/* Mid trees */}
      {[150,400,700,1000,1280].map((x,i) => (
        <g key={i}>
          <rect x={x+10} y="290" width="7" height="42" fill="rgba(18,5,46,.8)"/>
          <ellipse cx={x+13} cy="280" rx="20" ry="35" fill="rgba(30,8,60,.72)"/>
          <ellipse cx={x+13} cy="262" rx="14" ry="26" fill="rgba(42,12,78,.62)"/>
        </g>
      ))}
      {/* Near ground */}
      <path d="M0,412 Q218,350 440,398 Q662,446 882,358 Q1058,292 1238,396 Q1358,456 1440,412 L1440,640 L0,640 Z" fill="rgba(10,2,34,.82)"/>
    </svg>
  )
}

function GardenFlora() {
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:2}}
      viewBox="0 0 1440 900" preserveAspectRatio="none">
      {/* Lavender clusters */}
      {[
        [72,730],[185,690],[390,765],[595,808],[745,770],
        [898,785],[1048,728],[1195,768],[1345,708],[1418,748],
        [46,648],[128,708],[472,658],[698,688],[1098,655],
      ].map(([x,y],i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x} y2={y-44-(i%3)*14} stroke="#5a2580" strokeWidth="1.5"/>
          {[0,1,2].map(j => (
            <ellipse key={j} cx={x+(j%2===0?-4:4)} cy={y-44-(i%3)*14+j*11}
              rx="5.5" ry="7.5" fill={i%3===0?'#c4aaff':i%3===1?'#a87fff':'#ddc8ff'} opacity=".76"/>
          ))}
        </g>
      ))}
      {/* White star flowers */}
      {[148,318,498,798,998,1248,1378].map((x,i) => (
        <g key={i}>
          {[0,60,120,180,240,300].map(a => (
            <ellipse key={a} cx={x+Math.cos(a*Math.PI/180)*6.5} cy={740+i*4+Math.sin(a*Math.PI/180)*6.5}
              rx="3.5" ry="6.5" fill="rgba(255,255,255,.66)"
              transform={`rotate(${a} ${x+Math.cos(a*Math.PI/180)*6.5} ${740+i*4+Math.sin(a*Math.PI/180)*6.5})`}/>
          ))}
          <circle cx={x} cy={740+i*4} r="3.5" fill="#fde68a" opacity=".92"/>
        </g>
      ))}
      {/* Pink roses */}
      {[[238,738],[678,778],[1098,748],[1328,768],[58,718]].map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="8.5" fill="#f9a8d4" opacity=".72"/>
          <circle cx={x} cy={y} r="5.5" fill="#f472b6" opacity=".62"/>
          <circle cx={x} cy={y} r="2.5" fill="#ec4899" opacity=".5"/>
        </g>
      ))}
      {/* Tall grass tufts */}
      {[65,145,268,418,558,618,820,978,1148,1298,1408].map((x,i) => (
        <g key={i}>
          <path d={`M${x},800 Q${x-7},758 ${x-4},718`} stroke="rgba(58,115,38,.5)" strokeWidth="2" fill="none"/>
          <path d={`M${x+9},800 Q${x+16},752 ${x+11},714`} stroke="rgba(48,95,35,.42)" strokeWidth="1.5" fill="none"/>
        </g>
      ))}
      {/* Mushroom clusters */}
      {[[448,748],[898,728],[1198,758]].map(([x,y],i) => (
        <g key={i}>
          <rect x={x-2} y={y-9} width="4" height="9" fill="#d0c0a0" opacity=".62"/>
          <ellipse cx={x} cy={y-9} rx="9" ry="5.5" fill={i%2===0?'#f9a8d4':'#c4aaff'} opacity=".66"/>
          {[0,1,2].map(j => <circle key={j} cx={x-5+j*5} cy={y-10} r="1.2" fill="white" opacity=".52"/>)}
        </g>
      ))}
    </svg>
  )
}

function GardenLanterns() {
  const spots = [
    {x:'9.5%',y:'53%'},{x:'27%',y:'64%'},{x:'41%',y:'75%'},
    {x:'61%',y:'70%'},{x:'75%',y:'61%'},{x:'87%',y:'62%'},
    {x:'19%',y:'47%'},{x:'49%',y:'43%'},
  ]
  return <>
    {spots.map((p,i) => (
      <div key={i} style={{position:'absolute',left:p.x,top:p.y,zIndex:3,pointerEvents:'none'}}>
        <div className="animate-lantern" style={{display:'flex',flexDirection:'column',alignItems:'center',animationDelay:`${i*.6}s`}}>
          <div style={{width:1,height:32,background:'rgba(253,230,138,.42)'}}/>
          <svg width="18" height="24" viewBox="0 0 18 24">
            <rect x="3" y="4" width="12" height="16" rx="4" fill="rgba(253,195,72,.28)" stroke="rgba(253,230,138,.72)" strokeWidth="1"/>
            <ellipse cx="9" cy="4" rx="7" ry="2.5" fill="rgba(253,230,138,.52)"/>
            <ellipse cx="9" cy="20" rx="7" ry="2.5" fill="rgba(253,230,138,.42)"/>
            <circle cx="9" cy="12" r="3.5" fill="rgba(253,230,138,.85)" className="animate-star-twinkle" style={{animationDelay:`${i*.4}s`}}/>
          </svg>
        </div>
        <div style={{position:'absolute',top:56,left:'50%',transform:'translateX(-50%)',width:44,height:10,borderRadius:'50%',background:'rgba(253,230,138,.22)',filter:'blur(5px)'}}/>
      </div>
    ))}
  </>
}

// ── AIW: Winding-path signpost ────────────────────────────────────────────────
function Signpost() {
  const { t } = useLang()
  const signs = [
    {y:22, text: t.signpostPortrait,  dir:'L', color:'#f9a8d4'},
    {y:48, text: t.signpostStudio,    dir:'R', color:'#c4aaff'},
    {y:74, text: t.signpostWorkshop,  dir:'L', color:'#9b72cf'},
    {y:100,text: t.signpostGallery,   dir:'R', color:'#c8b1e4'},
  ]
  return (
    <div style={{position:'absolute',left:'44%',top:'64%',zIndex:6,pointerEvents:'none'}}>
      <svg width="136" height="148" viewBox="0 0 136 148" fill="none">
        <ellipse cx="68" cy="144" rx="16" ry="4" fill="rgba(38,14,4,.52)"/>
        <rect x="63" y="18" width="10" height="128" rx="3" fill="#4a2808"/>
        <rect x="65" y="18" width="3" height="128" fill="rgba(255,255,255,.09)" rx="1"/>
        {signs.map((s,i) => {
          const L=s.dir==='L'
          return (
            <g key={i}>
              <rect x={L?6:61} y={s.y} width="58" height="20" rx="3" fill="rgba(28,8,4,.88)" stroke={s.color} strokeWidth="1"/>
              <text x={L?35:90} y={s.y+13} textAnchor="middle" fill={s.color} fontSize="9" fontFamily="Cinzel,serif">{s.text}</text>
              <polygon points={L?`${6},${s.y+10} ${13},${s.y+5} ${13},${s.y+15}`:`${122},${s.y+10} ${115},${s.y+5} ${115},${s.y+15}`} fill={s.color} opacity=".85"/>
            </g>
          )
        })}
        <path d="M52,16 L68,8 L84,16" fill="none" stroke="rgba(253,230,138,.5)" strokeWidth="1.5"/>
        <circle cx="68" cy="7" r="3.5" fill="rgba(253,230,138,.72)"/>
      </svg>
    </div>
  )
}

// ── Magical bunny ─────────────────────────────────────────────────────────────
function Bunny() {
  const [msg,  setMsg]  = useState<string|null>(null)
  const [phraseIdx, setPhraseIdx] = useState<number|null>(null)
  const [hov,  setHov]  = useState(false)
  const dismissRef = useRef<ReturnType<typeof setTimeout>|null>(null)
  const { t } = useLang()

  const poke = () => {
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
      style={{position:'absolute',left:'48%',top:'33%',zIndex:8,userSelect:'none'}}
      onClick={poke}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        className="animate-bounce-gentle"
        style={{
          position:'relative',
          cursor:'pointer',
          transition:'transform 0.28s cubic-bezier(.34,1.2,.64,1), filter 0.28s ease',
          transform: hov ? 'translateY(-6px) scale(1.08)' : 'none',
          filter: hov
            ? 'brightness(1.16) drop-shadow(0 0 14px rgba(196,170,255,.75)) drop-shadow(0 0 28px rgba(255,179,230,.45))'
            : 'drop-shadow(0 2px 6px rgba(0,0,0,.4))',
        }}
      >
        <svg width="68" height="86" viewBox="0 0 68 86" fill="none">
          <ellipse cx="34" cy="80" rx="22" ry="6" fill="rgba(100,40,160,.32)"/>
          <ellipse cx="21" cy="20" rx="7.5" ry="19" fill="#ede0ff" transform="rotate(-10 21 20)"/>
          <ellipse cx="47" cy="20" rx="7.5" ry="19" fill="#ede0ff" transform="rotate(10 47 20)"/>
          <ellipse cx="21" cy="24" rx="4.5" ry="14" fill="#f9c4e8" transform="rotate(-10 21 24)"/>
          <ellipse cx="47" cy="24" rx="4.5" ry="14" fill="#f9c4e8" transform="rotate(10 47 24)"/>
          <circle cx="17" cy="10" r="1.5" fill="rgba(253,230,138,.92)" className="animate-star-twinkle"/>
          <circle cx="51" cy="10" r="1.5" fill="rgba(196,170,255,.92)" className="animate-star-twinkle" style={{animationDelay:'.8s'}}/>
          <ellipse cx="34" cy="60" rx="21" ry="19" fill="#ede0ff"/>
          <ellipse cx="34" cy="42" rx="19" ry="17" fill="#ede0ff"/>
          <ellipse cx="24" cy="46" rx="5.5" ry="3.5" fill="rgba(249,164,216,.42)"/>
          <ellipse cx="44" cy="46" rx="5.5" ry="3.5" fill="rgba(249,164,216,.42)"/>
          <ellipse cx="27" cy="40" rx="3.5" ry="4.2" fill="#2d1154"/>
          <ellipse cx="41" cy="40" rx="3.5" ry="4.2" fill="#2d1154"/>
          <circle cx="28.5" cy="38.5" r="1.2" fill="white"/>
          <circle cx="42.5" cy="38.5" r="1.2" fill="white"/>
          <ellipse cx="34" cy="47" rx="2" ry="1.6" fill="#f472b6"/>
          <line x1="17" y1="46" x2="31" y2="47" stroke="rgba(100,60,140,.35)" strokeWidth=".8"/>
          <line x1="17" y1="48.5" x2="31" y2="48.5" stroke="rgba(100,60,140,.35)" strokeWidth=".8"/>
          <line x1="51" y1="46" x2="37" y2="47" stroke="rgba(100,60,140,.35)" strokeWidth=".8"/>
          <line x1="51" y1="48.5" x2="37" y2="48.5" stroke="rgba(100,60,140,.35)" strokeWidth=".8"/>
          <ellipse cx="21" cy="70" rx="9.5" ry="6.5" fill="#ede0ff"/>
          <ellipse cx="47" cy="70" rx="9.5" ry="6.5" fill="#ede0ff"/>
          <ellipse cx="53" cy="60" rx="7.5" ry="6.5" fill="white"/>
          <rect x="38" y="58" width="11" height="9" rx="2" fill="#6d28d9" opacity=".62"/>
          <line x1="38" y1="58" x2="49" y2="58" stroke="rgba(253,230,138,.5)" strokeWidth="1"/>
          <circle cx="43.5" cy="62.5" r="1.5" fill="rgba(253,230,138,.72)"/>
          <ellipse cx="34" cy="62" rx="10" ry="12" fill="rgba(255,255,255,.35)"/>
        </svg>
        {[0,1,2].map(i => <Pip key={i} x={i*10+6} y={i*6-4} delay={i*.8}/>)}
      </div>

      {msg && (
        <div key={msg} style={{
          position:'absolute', bottom:98, left:'50%',
          transform:'translateX(-50%)',
          width:'max-content', maxWidth:240,
          background:'rgba(8,2,22,.95)',
          border:'1px solid rgba(196,170,255,.50)',
          borderRadius:12, padding:'10px 16px',
          fontFamily:"'Lora',serif", fontStyle:'italic',
          fontSize:14, color:'rgba(221,200,255,.94)',
          backdropFilter:'blur(14px)', zIndex:22,
          animation:'rabbit-in .3s cubic-bezier(.22,1,.36,1) both',
          pointerEvents:'none', textAlign:'center', lineHeight:1.6,
          whiteSpace:'normal',
        }}>
          🐇 {msg}
          <div style={{
            position:'absolute', bottom:-7, left:'50%',
            transform:'translateX(-50%) rotate(45deg)',
            width:12, height:12, background:'rgba(8,2,22,.95)',
            borderRight:'1px solid rgba(196,170,255,.50)',
            borderBottom:'1px solid rgba(196,170,255,.50)',
          }}/>
        </div>
      )}
    </div>
  )
}

// ─── Sparkle ring around building on hover ────────────────────────────────────
function SparkleHalo({ active, color }: { active:boolean; color:string }) {
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:10}}>
      {[0,1,2,3,4,5,6,7].map(i => {
        const a=(i/8)*Math.PI*2
        return (
          <div key={i} className="animate-star-twinkle"
            style={{position:'absolute',left:`${50+Math.cos(a)*52}%`,top:`${50+Math.sin(a)*52}%`,
              transform:'translate(-50%,-50%)',opacity:active?1:.2,transition:'opacity .35s',
              animationDelay:`${i*.15}s`}}>
            <Star8 color={color} size={active?10:7}/>
          </div>
        )
      })}
    </div>
  )
}

// ─── Room destination ─────────────────────────────────────────────────────────
const FinalDoorPlaceholder: React.FC<{h:boolean}> = () => null
const BUILDING_MAP: Record<RoomId, React.FC<{h:boolean}>> = {
  portrait: PortraitRoom, cabinet: CuriousCabinet, studio: LavenderStudio,
  workshop: Workshop, gallery: LearningGallery, 'final-door': FinalDoorPlaceholder,
}

function RoomNode({ room, collected, hovered, onHover, onClick }: {
  room: Room; collected: boolean; hovered: boolean
  onHover:(id:RoomId|null)=>void; onClick:(id:RoomId)=>void
}) {
  const { t } = useLang()
  const Building = BUILDING_MAP[room.id]
  return (
    <div
      onMouseEnter={() => { onHover(room.id); audio.playHover() }}
      onMouseLeave={() => onHover(null)}
      onClick={() => onClick(room.id)}
      className="room-card-hover"
      style={{position:'absolute',left:`${room.left}%`,top:`${room.top}%`,
        transform:`translate(-50%,-50%) scale(${room.scale})`,zIndex:5,cursor:'pointer'}}
    >
      {/* Ground glow — dimmer when completed */}
      <div style={{position:'absolute',bottom:-10,left:'50%',transform:'translateX(-50%)',
        width:110,height:22,borderRadius:'50%',background:room.glow,
        filter:'blur(14px)',opacity:collected ? (hovered ? .45 : .22) : (hovered ? 1 : .5),
        transition:'opacity .3s',pointerEvents:'none'}}/>
      {/* Hover aura */}
      {hovered && <div style={{position:'absolute',inset:-18,borderRadius:20,
        background:room.glow.replace(/[\d.]+\)$/,'.18)'),filter:'blur(18px)',
        pointerEvents:'none',zIndex:-1}}/>}
      {/* Building + sparkles — faded + desaturated when completed */}
      <div style={{
        position:'relative',
        filter: collected ? 'saturate(0.42) brightness(0.62) opacity(0.72)' : 'none',
        transition:'filter .4s ease',
      }}>
        <SparkleHalo active={hovered && !collected} color={room.accent}/>
        <Building h={hovered && !collected}/>
      </div>
      {/* Centered golden key over the building when completed */}
      {collected && (
        <div className="animate-key-glow" style={{
          position:'absolute',
          top:'38%', left:'50%',
          transform:'translate(-50%,-50%)',
          zIndex:10, pointerEvents:'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          filter:'drop-shadow(0 0 12px rgba(253,230,138,.9)) drop-shadow(0 0 24px rgba(253,230,138,.55))',
        }}>
          <GoldenKey size={38}/>
        </div>
      )}
      {/* Label */}
      <div style={{
        marginTop:10,position:'relative',left:'50%',transform:'translateX(-50%)',
        width:'max-content',minWidth:130,maxWidth:180,
        background: collected && !hovered
          ? 'linear-gradient(135deg,rgba(6,1,18,.72),rgba(14,4,36,.76))'
          : hovered
            ? `linear-gradient(135deg,rgba(8,2,26,.98),rgba(20,6,50,.99))`
            : 'linear-gradient(135deg,rgba(6,1,18,.92),rgba(14,4,36,.95))',
        border:`1.5px solid ${hovered ? room.accent : collected ? 'rgba(253,230,138,.28)' : 'rgba(196,170,255,.35)'}`,
        borderRadius:8,padding:hovered?'9px 16px':'7px 15px',backdropFilter:'blur(16px)',
        textAlign:'center',transition:'all .3s',
        opacity: collected && !hovered ? 0.72 : 1,
        boxShadow:hovered?`0 4px 24px ${room.glow},0 0 0 1px ${room.accent}22`:`0 2px 12px rgba(0,0,0,.6)`,
      }}>
        {/* Accent top bar */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:2,borderRadius:'8px 8px 0 0',
          background: hovered
            ? `linear-gradient(90deg,transparent,${room.accent},transparent)`
            : collected
              ? 'linear-gradient(90deg,transparent,rgba(253,230,138,.35),transparent)'
              : `linear-gradient(90deg,transparent,rgba(196,170,255,.35),transparent)`,
          transition:'background .3s'}}/>
        <p style={{fontFamily:"'Cinzel',serif",fontSize:17,fontWeight:700,
          color: hovered ? room.accent : collected ? 'rgba(221,205,255,.75)' : 'rgba(235,220,255,.96)',
          letterSpacing:'.055em',lineHeight:1.35,transition:'color .3s',
          textShadow:hovered?`0 0 16px ${room.accent}aa, 0 1px 5px rgba(0,0,0,.9)`:'0 1px 6px rgba(0,0,0,.9), 0 0 8px rgba(0,0,0,.6)'}}>
          {room.name}
        </p>
        {hovered
          ? <>
              <div style={{width:'70%',height:1,background:`linear-gradient(90deg,transparent,${room.accent}60,transparent)`,margin:'5px auto 4px'}}/>
              <p style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:12.5,
                color:'rgba(196,170,255,.72)',lineHeight:1.35}}>{room.tagline}</p>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:11,
                color:'rgba(253,230,138,.78)',marginTop:6,letterSpacing:'.1em'}}>{t.clickToEnter}</p>
            </>
          : collected
            ? <p style={{fontFamily:"'Cinzel',serif",fontSize:11,
                color:'rgba(253,230,138,.55)',marginTop:3,letterSpacing:'.12em'}}>{t.keyCollected}</p>
            : <p style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:11.5,
                color:'rgba(196,170,255,.52)',marginTop:3,lineHeight:1.3}}>{room.tagline}</p>
        }
      </div>
    </div>
  )
}

// ─── Reusable hover-glow HUD button ──────────────────────────────────────────
function HudBtn({ onClick, children, active, gold, style: extraStyle }: {
  onClick: () => void
  children: React.ReactNode
  active?: boolean
  gold?: boolean
  style?: React.CSSProperties
}) {
  const [hov, setHov] = useState(false)
  const [pressed, setPressed] = useState(false)
  const base = gold
    ? { bg: 'rgba(253,230,138,.14)', border: 'rgba(253,230,138,.45)', color: 'rgba(253,230,138,.9)' }
    : active
    ? { bg: 'rgba(253,230,138,.16)', border: 'rgba(253,230,138,.42)', color: '#fde68a' }
    : { bg: 'rgba(139,92,246,.15)', border: 'rgba(196,170,255,.3)', color: 'rgba(196,170,255,.82)' }
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        background: hov
          ? gold
            ? 'rgba(253,230,138,.26)'
            : active
            ? 'rgba(253,230,138,.26)'
            : 'rgba(155,114,207,.28)'
          : base.bg,
        border: `1px solid ${hov
          ? gold
            ? 'rgba(253,230,138,.72)'
            : 'rgba(255,179,230,.56)'
          : base.border}`,
        borderRadius: 8, cursor: 'pointer',
        color: hov ? (gold ? 'rgba(255,242,210,.98)' : 'rgba(255,230,245,.96)') : base.color,
        boxShadow: hov
          ? gold
            ? '0 4px 18px rgba(253,230,138,.22), 0 0 12px rgba(253,230,138,.12)'
            : '0 4px 18px rgba(255,179,230,.20), 0 0 12px rgba(155,114,207,.14)'
          : 'none',
        transition: 'all 0.38s cubic-bezier(.22,1,.36,1)',
        transform: pressed ? 'translateY(1px) scale(0.97)' : hov ? 'translateY(-1.5px) scale(1.01)' : 'none',
        ...extraStyle,
      }}
    >
      {children}
    </button>
  )
}

// ─── HUD atoms ────────────────────────────────────────────────────────────────
function GuidePortrait({ guide }: { guide: GuideChoice }) {
  const isMan = guide === 'man'
  const { t, isAr } = useLang()
  const [hov, setHov] = useState(false)
  const isDawn = !isMan
  const glowColor   = isDawn ? 'rgba(255,179,230,.52)' : 'rgba(155,114,207,.48)'
  const borderColor = isDawn ? 'rgba(255,179,230,.58)' : 'rgba(196,170,255,.58)'
  const nameColor   = isDawn ? 'rgba(255,210,240,.88)' : 'rgba(196,170,255,.88)'
  const name = isMan ? t.guideDuskName : t.guideDawnName

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        transform: hov ? 'translateY(-3px)' : 'none',
        transition: 'transform .35s cubic-bezier(.22,1,.36,1)',
        cursor: 'default',
      }}
    >
      <div style={{
        width: 62, height: 72, borderRadius: 14,
        border: `1.5px solid ${borderColor}`,
        overflow: 'hidden',
        background: isDawn ? 'linear-gradient(135deg,#7b2fb0,#c060c0)' : 'linear-gradient(135deg,#1a1568,#4535c0)',
        boxShadow: hov
          ? `0 0 28px ${glowColor}, 0 0 56px ${isDawn ? 'rgba(255,179,230,.22)' : 'rgba(155,114,207,.22)'}, 0 0 80px ${isDawn ? 'rgba(255,179,230,.08)' : 'rgba(155,114,207,.08)'}`
          : `0 0 18px ${isDawn ? 'rgba(255,179,230,.42)' : 'rgba(155,114,207,.42)'}, 0 0 36px ${isDawn ? 'rgba(255,179,230,.12)' : 'rgba(155,114,207,.12)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'box-shadow .35s cubic-bezier(.22,1,.36,1)',
      }}>
        <CompanionFace guide={guide} size={62} idPrefix="hud" />
      </div>
      <span style={{
        fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
        fontSize: isAr ? 13 : 11,
        fontWeight: isAr ? 700 : 500,
        color: nameColor,
        letterSpacing: isAr ? 0 : '.09em',
        textAlign: 'center',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        textShadow: `0 0 12px ${glowColor}`,
        transition: 'text-shadow .35s cubic-bezier(.22,1,.36,1)',
      }}>
        {name}
      </span>
    </div>
  )
}

function KeySlots({ collected }: { collected: Set<RoomId> }) {
  const { t } = useLang()
  const roomNames: Record<RoomId, string> = {
    portrait: t.roomPortrait, cabinet: t.roomCabinet, studio: t.roomStudio,
    workshop: t.roomWorkshop, gallery: t.roomGallery, 'final-door': t.roomFinalGate,
  }
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:1}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:'rgba(253,230,138,.72)',letterSpacing:'.1em'}}>{t.lavenderKeys}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:14,color:'#fde68a',fontWeight:600}}>{collected.size}/5</span>
      </div>
      <div style={{display:'flex',gap:5}}>
        {ROOMS.map(r => {
          const on=collected.has(r.id)
          return (
            <div key={r.id} title={roomNames[r.id]} style={{width:30,height:30,borderRadius:6,
              background:on?`linear-gradient(135deg,${r.key}38,${r.key}22)`:'rgba(196,170,255,.08)',
              border:`1px solid ${on?r.key:'rgba(196,170,255,.2)'}`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,
              transition:'all .4s',boxShadow:on?`0 0 12px ${r.key}62`:'none'}}>
              {on?<span style={{filter:`drop-shadow(0 0 5px rgba(253,230,138,.8))`}}><GoldenKey size={14}/></span>
                :<svg width="13" height="13" viewBox="0 0 13 13"><circle cx="5" cy="4.5" r="3.5" fill="none" stroke="rgba(196,170,255,.3)" strokeWidth="1.2"/><rect x="3.5" y="5" width="3" height="5.5" rx=".6" fill="rgba(196,170,255,.2)" stroke="rgba(196,170,255,.3)" strokeWidth=".8"/></svg>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Bar({ val, max, color, label }: { val:number; max:number; color:string; label:string }) {
  const pct=Math.min((val/max)*100,100)
  return (
    <div style={{minWidth:130}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:'rgba(196,170,255,.65)',letterSpacing:'.08em'}}>{label}</span>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color}}>{val}/{max}</span>
      </div>
      <div style={{height:7,borderRadius:4,background:'rgba(196,170,255,.1)',border:'1px solid rgba(196,170,255,.15)',overflow:'hidden'}}>
        <div style={{width:`${pct}%`,height:'100%',borderRadius:4,
          background:`linear-gradient(90deg,${color}80,${color})`,
          boxShadow:`0 0 9px ${color}80`,transition:'width .6s ease',position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,transparent 30%,rgba(255,255,255,.25) 50%,transparent 70%)',backgroundSize:'200% 100%',animation:'shimmer 2s linear infinite'}}/>
        </div>
      </div>
    </div>
  )
}

function QuestBox({ n }: { n: number }) {
  const { t } = useLang()
  const q = n===5
    ? {title: t.questRevealationTitle, body: t.questRevealationBody}
    : n>=3
    ? {title: t.questGatheringTitle,   body: t.questGatheringBody(5-n)}
    : n>=1
    ? {title: t.questFirstStepsTitle,  body: t.questFirstStepsBody(5-n)}
    : {title: t.questAwaitTitle,        body: t.questAwaitBody}
  return (
    <div style={{background:'linear-gradient(135deg,rgba(8,2,26,.93),rgba(18,5,44,.96))',
      border:'1px solid rgba(196,170,255,.26)',borderRadius:11,padding:'10px 17px',
      minWidth:248,maxWidth:330,backdropFilter:'blur(16px)'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:'#a855f7',
          boxShadow:'0 0 8px rgba(168,85,247,.85)',animation:'glow-pulse 2s ease-in-out infinite'}}/>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:10,color:'rgba(168,85,247,.92)',letterSpacing:'.13em'}}>{t.currentQuest}</span>
      </div>
      <p style={{fontFamily:"'Cinzel',serif",fontSize:14,color:'#fde68a',marginBottom:4}}>{q.title}</p>
      <p style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:13.5,color:'rgba(221,200,255,.82)',lineHeight:1.52}}>{q.body}</p>
    </div>
  )
}

// ─── Overlay panels ───────────────────────────────────────────────────────────
function InventoryPanel({ keys, bf, onClose }: { keys:Set<RoomId>; bf:number; onClose:()=>void }) {
  const { t } = useLang()
  const roomNames: Record<RoomId, string> = {
    portrait: t.roomPortrait, cabinet: t.roomCabinet, studio: t.roomStudio,
    workshop: t.roomWorkshop, gallery: t.roomGallery, 'final-door': t.roomFinalGate,
  }
  return (
    <div className="animate-panel-in" style={{position:'relative',width:296,zIndex:40,
      background:'linear-gradient(135deg,rgba(8,2,26,.97),rgba(18,5,46,.99))',
      border:'1px solid rgba(196,170,255,.3)',borderRadius:14,overflow:'hidden'}}>
      <div style={{padding:'15px 20px 11px',borderBottom:'1px solid rgba(196,170,255,.14)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:11,color:'rgba(253,230,138,.62)',letterSpacing:'.2em',marginBottom:3}}>{t.gameInventory}</p>
          <h3 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:17,color:'#fde68a'}}>{t.collectedItems}</h3>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(196,170,255,.62)',cursor:'pointer',fontSize:22,lineHeight:1}}>×</button>
      </div>
      <div style={{padding:16}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
          {/* Keys card */}
          <div style={{padding:'12px 14px',borderRadius:10,textAlign:'center',
            background:'rgba(253,230,138,.08)', border:'1px solid rgba(253,230,138,.18)'}}>
            <div style={{display:'flex',justifyContent:'center',marginBottom:4,filter:'drop-shadow(0 0 6px rgba(253,230,138,.6))'}}>
              <GoldenKey size={26}/>
            </div>
            <p style={{fontFamily:"'Nunito',sans-serif",fontSize:10,color:'rgba(196,170,255,.65)',letterSpacing:'.08em',marginBottom:3}}>{t.lavenderKeysLabel}</p>
            <p style={{fontFamily:"'Nunito',sans-serif",fontSize:26,color:'#fde68a',fontWeight:700}}>{keys.size}</p>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color:'rgba(196,170,255,.4)'}}>/ 5</p>
          </div>
          {/* Butterflies card */}
          <div style={{padding:'12px 14px',borderRadius:10,textAlign:'center',
            background: bf>=10?'rgba(196,170,255,.14)':'rgba(196,170,255,.08)',
            border:`1px solid ${bf>=10?'rgba(196,170,255,.45)':'rgba(196,170,255,.18)'}`,
            boxShadow: bf>=10?'0 0 18px rgba(196,170,255,.25)':'none',
            transition:'all .4s'}}>
            <div style={{fontSize:26,marginBottom:2}}>🦋{bf>=10?' 🌸':''}</div>
            <p style={{fontFamily:"'Nunito',sans-serif",fontSize:10,color:'rgba(196,170,255,.65)',letterSpacing:'.08em',marginBottom:3}}>{t.butterfliesLabel}</p>
            <p style={{fontFamily:"'Nunito',sans-serif",fontSize:26,color: bf>=10?'#c4aaff':'#c4aaff',fontWeight:700}}>{bf}</p>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:10,color: bf>=10?'rgba(196,170,255,.65)':'rgba(196,170,255,.4)'}}>/ 10 {bf>=10?'✓':''}</p>
          </div>
        </div>
        <p style={{fontFamily:"'Cinzel',serif",fontSize:11,color:'rgba(196,170,255,.5)',letterSpacing:'.12em',marginBottom:9}}>{t.discoveredRooms}</p>
        {keys.size===0
          ? <p style={{fontFamily:"'Nunito',sans-serif",fontStyle:'italic',fontSize:12,color:'rgba(196,170,255,.35)',textAlign:'center',padding:'10px 0'}}>{t.noRoomsExplored}</p>
          : ROOMS.filter(r=>keys.has(r.id)).map(r=>(
            <div key={r.id} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 12px',borderRadius:8,marginBottom:6,
              background:'rgba(139,92,246,.08)',border:'1px solid rgba(196,170,255,.12)'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:r.accent,boxShadow:`0 0 6px ${r.glow}`}}/>
              <span style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:r.accent,flex:1}}>{roomNames[r.id]}</span>
              <span style={{filter:'drop-shadow(0 0 4px rgba(253,230,138,.7))'}}><GoldenKey size={13}/></span>
            </div>
          ))}
      </div>
    </div>
  )
}

function MapPanel({ keys, onClose }: { keys:Set<RoomId>; onClose:()=>void }) {
  const { t, isAr } = useLang()
  const roomNames: Record<RoomId, string> = {
    portrait: t.roomPortrait, cabinet: t.roomCabinet, studio: t.roomStudio,
    workshop: t.roomWorkshop, gallery: t.roomGallery, 'final-door': t.roomFinalGate,
  }
  return (
    <div className="animate-panel-in" style={{position:'relative',
      width:560,zIndex:40,background:'linear-gradient(135deg,rgba(6,1,20,.97),rgba(16,4,40,.99))',
      border:'1px solid rgba(196,170,255,.3)',borderRadius:16,overflow:'hidden'}}>
      <div style={{padding:'17px 24px 13px',borderBottom:'1px solid rgba(196,170,255,.14)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:11,color:'rgba(253,230,138,.62)',letterSpacing:'.2em',marginBottom:3}}>{t.navigationLabel}</p>
          <h3 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:'#fde68a'}}>{t.lavenderGarden}</h3>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(196,170,255,.62)',cursor:'pointer',fontSize:22}}>×</button>
      </div>
      <div style={{padding:'20px 24px 22px'}}>
        <div style={{position:'relative',width:'100%',aspectRatio:'16/9',
          background:'linear-gradient(135deg,rgba(28,8,58,.52),rgba(18,4,42,.72))',
          borderRadius:12,border:'1px solid rgba(196,170,255,.2)',overflow:'hidden'}}>
          {/* Mini-map path: Portrait(10,15)→Cabinet(36,14)→Studio(62,18)→Workshop(76,30)→Gallery(45,39)→Final(82,37) */}
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%'}} viewBox="0 0 100 56" preserveAspectRatio="none">
            <defs>
              <filter id="mmGlow"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            </defs>
            {/* Dim base path */}
            <path d="M 10,15 C 20,13.5 28,13 36,14 C 47,15 56,17 62,18 C 67,21 73,25 76,30 C 77,35 64,38.5 45,39 C 57,38.5 70,37.5 82,37"
              stroke="rgba(120,90,200,.3)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#mmGlow)"/>
            {/* Progressive lit segments */}
            {keys.has('portrait') && <path d="M 10,15 C 20,13.5 28,13 36,14" stroke="rgba(253,230,138,.85)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
            {keys.has('cabinet')  && <path d="M 36,14 C 47,15 56,17 62,18" stroke="rgba(196,170,255,.8)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
            {keys.has('studio')   && <path d="M 62,18 C 67,21 73,25 76,30" stroke="rgba(196,170,255,.8)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
            {keys.has('workshop') && <path d="M 76,30 C 77,35 64,38.5 45,39" stroke="rgba(200,177,228,.8)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
            {keys.has('gallery')  && <path d="M 45,39 C 57,38.5 70,37.5 82,37" stroke="rgba(253,230,138,.85)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>}
          </svg>
          {ROOMS.map(r => {
            const disc=keys.has(r.id)
            const label = disc ? roomNames[r.id].replace(/^(The |ال)/, '') : '???'
            return (
              <div key={r.id} style={{position:'absolute',left:`${r.left}%`,top:`${r.top*.52+8}%`,transform:'translate(-50%,-50%)',textAlign:'center'}}>
                <div style={{width:36,height:36,borderRadius:10,margin:'0 auto 4px',
                  background:disc?`${r.accent}26`:'rgba(38,14,78,.82)',
                  border:`1.5px solid ${disc?r.accent:'rgba(196,170,255,.26)'}`,
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,
                  boxShadow:disc?`0 0 13px ${r.glow}`:'none',transition:'all .3s'}}>
                  {disc?<GoldenKey size={14}/>:<span style={{fontSize:14,opacity:.42}}>?</span>}
                </div>
                <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:10,lineHeight:1.25,
                  color:disc?r.accent:'rgba(196,170,255,.35)',maxWidth:65,textAlign:'center'}}>
                  {label}
                </p>
              </div>
            )
          })}
          {/* Final Door — position matches main map: left:82%, top:55% → mini: left:82%, top:55*.52+8=36.6% */}
          <div style={{position:'absolute',left:'82%',top:'37%',transform:'translate(-50%,-50%)',textAlign:'center'}}>
            <div style={{width:36,height:36,borderRadius:10,margin:'0 auto 4px',
              background:keys.size===5?'rgba(253,230,138,.26)':'rgba(18,4,38,.92)',
              border:`1.5px solid ${keys.size===5?'rgba(253,230,138,.72)':'rgba(139,92,246,.32)'}`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,
              boxShadow:keys.size===5?'0 0 14px rgba(253,230,138,.42)':'none'}}>
              {keys.size===5?'🌟':'🔒'}
            </div>
            <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:10,color:keys.size===5?'#fde68a':'rgba(139,92,246,.52)'}}>{t.finalGateLabel}</p>
          </div>
        </div>
        <p style={{fontFamily:"'Nunito',sans-serif",fontStyle:'italic',fontSize:14,color:'rgba(196,170,255,.45)',textAlign:'center',marginTop:13}}>
          {t.mapClickHint}
        </p>
      </div>
    </div>
  )
}

function HelpPanel({ onClose }: { onClose:()=>void }) {
  const { t } = useLang()
  return (
    <div className="animate-panel-in" style={{position:'relative',
      width:420,zIndex:40,background:'linear-gradient(135deg,rgba(6,1,20,.97),rgba(16,4,40,.99))',
      border:'1px solid rgba(196,170,255,.3)',borderRadius:16,overflow:'hidden'}}>
      <div style={{padding:'17px 24px 13px',borderBottom:'1px solid rgba(196,170,255,.14)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:11,color:'rgba(253,230,138,.62)',letterSpacing:'.2em',marginBottom:3}}>{t.guidanceLabel}</p>
          <h3 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:'#fde68a'}}>{t.howToPlay}</h3>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(196,170,255,.62)',cursor:'pointer',fontSize:22}}>×</button>
      </div>
      <div style={{padding:'15px 22px 20px',display:'flex',flexDirection:'column',gap:11}}>
        {t.helpItems.map(h => (
          <div key={h.t} style={{display:'flex',alignItems:'flex-start',gap:14,padding:'10px 14px',borderRadius:10,
            background:'rgba(139,92,246,.08)',border:'1px solid rgba(196,170,255,.12)'}}>
            {h.icon === '🗝'
              ? <span style={{flexShrink:0,marginTop:2,filter:'drop-shadow(0 0 6px rgba(253,230,138,.7))'}}><GoldenKey size={22}/></span>
              : <span style={{fontSize:22,flexShrink:0}}>{h.icon}</span>}
            <div>
              <p style={{fontFamily:"'Nunito',sans-serif",fontSize:13,color:'#c4aaff',marginBottom:3}}>{h.t}</p>
              <p style={{fontFamily:"'Nunito',sans-serif",fontStyle:'italic',fontSize:14,color:'rgba(196,170,255,.72)',lineHeight:1.5}}>{h.b}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Toast({ room, roomName }: { room: Room; roomName: string }) {
  const { t } = useLang()
  return (
    <div className="animate-toast" style={{position:'fixed',top:78,left:'50%',
      background:'rgba(6,1,20,.96)',backdropFilter:'blur(16px)',
      border:`1px solid ${room.accent}65`,borderRadius:13,
      padding:'12px 24px',zIndex:52,pointerEvents:'none',
      display:'flex',alignItems:'center',gap:12,
      boxShadow:`0 8px 34px ${room.glow}`}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:room.accent,boxShadow:`0 0 10px ${room.glow}`}}/>
      <div>
        <p style={{fontFamily:"'Nunito',sans-serif",fontSize:12.5,color:room.accent}}>{roomName}</p>
        <p style={{fontFamily:"'Nunito',sans-serif",fontStyle:'italic',fontSize:11,color:'rgba(221,200,255,.72)',marginTop:2}}>
          {t.toastMsg}
        </p>
      </div>
      <span style={{marginLeft:6,filter:'drop-shadow(0 0 5px rgba(253,230,138,.7))'}}><GoldenKey size={15}/></span>
    </div>
  )
}

// ─── Locked door modal ────────────────────────────────────────────────────────
const ROOM_LIST = [
  { id:'portrait', name:'The Portrait Room',    symbol:'🪞', color:'#f9a8d4' },
  { id:'cabinet',  name:'The Curious Cabinet',  symbol:'🔮', color:'#fde68a' },
  { id:'studio',   name:'The Lavender Studio',  symbol:'🎬', color:'#c4aaff' },
  { id:'workshop', name:'The Workshop',          symbol:'⚙️', color:'#9b72cf' },
  { id:'gallery',  name:'The Learning Gallery', symbol:'🎓', color:'#c8b1e4' },
]

function LockedDoorModal({ count, collectedKeys, onClose }: { count: number; collectedKeys: Set<string>; onClose: () => void }) {
  const { t } = useLang()
  const ROOM_LIST_T = [
    { id:'portrait', name: t.roomPortrait,  symbol:'🪞', color:'#f9a8d4' },
    { id:'cabinet',  name: t.roomCabinet,   symbol:'🔮', color:'#fde68a' },
    { id:'studio',   name: t.roomStudio,    symbol:'🎬', color:'#c4aaff' },
    { id:'workshop', name: t.roomWorkshop,  symbol:'⚙️', color:'#9b72cf' },
    { id:'gallery',  name: t.roomGallery,   symbol:'🎓', color:'#c8b1e4' },
  ]
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60,
      overflowY:'auto', overflowX:'hidden',
      background:'rgba(2,0,10,.75)', backdropFilter:'blur(16px)',
      display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <div className="animate-panel-in" onClick={e=>e.stopPropagation()} style={{
        width:420, borderRadius:20, overflow:'hidden',
        background:'linear-gradient(145deg,rgba(6,1,22,.99),rgba(16,5,44,.99))',
        border:'1px solid rgba(139,92,246,.4)',
        boxShadow:'0 24px 80px rgba(0,0,0,.85), 0 0 40px rgba(139,92,246,.2)',
      }}>
        {/* Rainbow top bar */}
        <div style={{ height:3, background:'linear-gradient(90deg,transparent,#c4aaff,#fde68a,#f9a8d4,#c4aaff,transparent)' }}/>

        {/* Header */}
        <div style={{ padding:'24px 28px 18px', textAlign:'center', borderBottom:'1px solid rgba(196,170,255,.12)' }}>
          <div style={{ fontSize:38, marginBottom:12, filter:'drop-shadow(0 0 14px rgba(139,92,246,.7))' }}>🔒</div>
          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, color:'rgba(196,170,255,.55)', letterSpacing:'.28em', marginBottom:8 }}>
            {t.finalRevelationLabel}
          </p>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontSize:20, color:'rgba(221,205,255,.95)', lineHeight:1.3, marginBottom:10 }}>
            {t.finalDoorRequires}
          </h2>
          {/* Key progress */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'9px 20px',
            background:'rgba(139,92,246,.12)', borderRadius:24,
            border:'1px solid rgba(196,170,255,.25)' }}>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:12.5, color:'rgba(253,230,138,.9)', letterSpacing:'.06em' }}>
              {t.keysCollected}
            </span>
            <span style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:16,
              background:`linear-gradient(90deg,${count===5?'#9b72cf':'#fde68a'},${count===5?'#c4aaff':'#c4aaff'})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              {count} / 5
            </span>
          </div>
        </div>

        {/* Room list */}
        <div style={{ padding:'18px 28px 22px', display:'flex', flexDirection:'column', gap:8 }}>
          <p style={{ fontFamily:"'Cinzel',serif", fontSize:8, color:'rgba(196,170,255,.45)', letterSpacing:'.2em', marginBottom:6 }}>
            {t.roomCompletionStatus}
          </p>
          {ROOM_LIST_T.map(room => {
            const done = collectedKeys.has(room.id)
            return (
              <div key={room.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', borderRadius:10,
                background: done ? `rgba(${room.color === '#ffb3e6' ? '255,179,230' : room.color === '#e8c27d' ? '232,194,125' : room.color === '#c4aaff' ? '196,170,255' : room.color === '#9b72cf' ? '155,114,207' : '200,177,228'},.08)` : 'rgba(30,10,60,.5)',
                border:`1px solid ${done ? room.color + '50' : 'rgba(100,60,180,.25)'}`,
                transition:'all .3s' }}>
                <span style={{ fontSize:18 }}>{room.symbol}</span>
                <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:11, color: done ? room.color : 'rgba(140,100,200,.55)', flex:1 }}>
                  {room.name}
                </span>
                <span style={{ fontSize:14 }}>{done ? '✓' : '🔒'}</span>
              </div>
            )
          })}
        </div>

        {/* Return button */}
        <div style={{ padding:'0 28px 26px' }}>
          <button onClick={onClose} style={{ width:'100%', padding:'13px 0', borderRadius:12, cursor:'pointer',
            background:'linear-gradient(135deg,rgba(139,92,246,.22),rgba(139,92,246,.08))',
            border:'2px solid rgba(196,170,255,.55)',
            fontFamily:"'Cinzel',serif", fontSize:12, color:'rgba(196,170,255,.9)', letterSpacing:'.14em',
            boxShadow:'0 0 22px rgba(196,170,255,.2)', transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(196,170,255,.22)'; e.currentTarget.style.boxShadow='0 0 36px rgba(196,170,255,.38)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='linear-gradient(135deg,rgba(139,92,246,.22),rgba(139,92,246,.08))'; e.currentTarget.style.boxShadow='0 0 22px rgba(196,170,255,.2)'}}>
            {t.returnToMap}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
interface GardenHubProps {
  guide: GuideChoice
  onBack: () => void
  collectedKeys: Set<string>
  butterflies: number
  onKeyCollect: (id: string) => void
  onAddButterfly: () => void
  onEnterRoom: (id: RoomId) => void
  onMainMenu: () => void
  onReset: () => void
}

export default function GardenHub({ guide, onBack, collectedKeys, butterflies, onKeyCollect, onAddButterfly, onEnterRoom, onMainMenu, onReset }: GardenHubProps) {
  const { t, isAr } = useLang()

  // Build translated rooms from static layout data + current language
  const rooms: Room[] = [
    { ...ROOM_STATICS[0], name: t.roomPortrait,  tagline: t.tagPortrait  },
    { ...ROOM_STATICS[1], name: t.roomCabinet,   tagline: t.tagCabinet   },
    { ...ROOM_STATICS[2], name: t.roomGallery,   tagline: t.tagGallery   },
    { ...ROOM_STATICS[3], name: t.roomWorkshop,  tagline: t.tagWorkshop  },
    { ...ROOM_STATICS[4], name: t.roomStudio,    tagline: t.tagStudio    },
  ]

  const [hov,         setHov]       = useState<RoomId|null>(null)
  const [showInv,     setInv]       = useState(false)
  const [showMap,     setMap]       = useState(false)
  const [showHelp,    setHelp]      = useState(false)
  const [toastId,     setToastId]   = useState<RoomId|null>(null)
  const [lockedModal, setLockedModal] = useState(false)
  const [gateHov, setGateHov] = useState(false)
  const [bloomOpen, setBloomOpen] = useState(false)
  const [bloomHov, setBloomHov] = useState(false)
  const [bloomMsg, setBloomMsg] = useState(false)
  const toastRef = useRef<number>(undefined)
  const bloomMsgRef = useRef<number>(undefined)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [zoom, setZoom] = useState(1)
  const ZOOM_MIN = 0.80, ZOOM_MAX = 1.35, ZOOM_STEP = 0.10
  const zoomIn  = () => setZoom(z => Math.min(+(z + ZOOM_STEP).toFixed(2), ZOOM_MAX))
  const zoomOut = () => setZoom(z => Math.max(+(z - ZOOM_STEP).toFixed(2), ZOOM_MIN))
  const zoomReset = () => setZoom(1)
  const gardenScrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = gardenScrollRef.current
    if (!el) return
    const onScroll = () => setShowScrollTop(el.scrollTop > 120)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Show bloom message once when 10 butterflies reached
  useEffect(() => {
    if (butterflies >= 10) {
      clearTimeout(bloomMsgRef.current)
      setBloomMsg(true)
      bloomMsgRef.current = window.setTimeout(() => setBloomMsg(false), 4000)
    }
  }, [butterflies >= 10]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Butterfly state ──
  const [activeBFs, setActiveBFs] = useState<BFState[]>(() =>
    [0, 2, 5, 8].map((posIdx, i) => ({
      id: ++_bfId, posIdx, variant: ([1,2,3][i%3]) as 1|2|3, delay: i * 1.4, phase: 'visible' as const,
    }))
  )
  const bfCountRef = useRef(butterflies)
  useEffect(() => { bfCountRef.current = butterflies }, [butterflies])

  const handleCollectBF = useCallback((bfId: number) => {
    if (bfCountRef.current >= 10) return
    setActiveBFs(prev => prev.map(b => b.id === bfId ? { ...b, phase: 'out' as const } : b))
    onAddButterfly()
    window.setTimeout(() => {
      setActiveBFs(prev => {
        const remaining = prev.filter(b => b.id !== bfId)
        if (bfCountRef.current >= 10) return remaining
        const used = new Set(remaining.map(b => b.posIdx))
        const available = BF_POOL.map((_, i) => i).filter(i => !used.has(i))
        if (available.length === 0) return remaining
        const posIdx = available[Math.floor(Math.random() * available.length)]
        const newBF: BFState = {
          id: ++_bfId, posIdx, variant: ([1,2,3][Math.floor(Math.random()*3)]) as 1|2|3, delay: 0, phase: 'in',
        }
        return [...remaining, newBF]
      })
    }, 950)
    window.setTimeout(() => {
      setActiveBFs(prev => prev.map(b => b.phase === 'in' ? { ...b, phase: 'visible' } : b))
    }, 1650)
  }, [onAddButterfly])

  // Garden ambient
  useEffect(() => {
    audio.startAmbient('garden')
    return () => audio.stopAmbient()
  }, [])

  const pickRoom = useCallback((id:RoomId) => {
    if (id === 'portrait' || id === 'cabinet' || id === 'studio' || id === 'workshop' || id === 'gallery' || id === 'final-door') {
      audio.playRoomOpen()
      onEnterRoom(id)
      return
    }
    if (!collectedKeys.has(id)) {
      onKeyCollect(id)
      setToastId(id)
      clearTimeout(toastRef.current)
      toastRef.current = window.setTimeout(()=>setToastId(null),3000)
    }
    setInv(false); setMap(false); setHelp(false)
  }, [collectedKeys, onKeyCollect, onEnterRoom])

  const unlocked = collectedKeys.size===5
  const overlayOpen = showInv||showMap||showHelp
  const toastRoom = toastId ? rooms.find(x=>x.id===toastId) ?? null : null

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',position:'relative',fontFamily:"'Nunito',sans-serif",background:'linear-gradient(180deg,#08011e 0%,#180448 8%,#2e0872 18%,#5c1a90 32%,#8b3ab4 46%,#b05abe 56%,#c872b8 64%,#d8845c 74%,#e8a870 82%,#f0c090 90%,#d09878 95%,#6a2490 100%)'}}>

      {/* ── SCROLLABLE GARDEN ─────────────────── */}
      <div ref={gardenScrollRef} dir="ltr" style={{position:'absolute',top:64,bottom:80,left:0,right:0,
        overflowY:'auto',overflowX:'hidden',
        background:'linear-gradient(180deg,#08011e 0%,#180448 8%,#2e0872 18%,#5c1a90 32%,#8b3ab4 46%,#b05abe 56%,#c872b8 64%,#d8845c 74%,#e8a870 82%,#f0c090 90%,#d09878 95%,#6a2490 100%)'}}>
        <div style={{position:'relative',width:`calc(100% / ${zoom})`,height:'180vh',minHeight:1200,
          margin:'0 auto', zoom:zoom} as React.CSSProperties}>

      {/* ── SKY ──────────────────────────────── */}
      <div style={{position:'absolute',inset:0,
        background:'linear-gradient(180deg,#08011e 0%,#180448 8%,#2e0872 18%,#5c1a90 32%,#8b3ab4 46%,#b05abe 56%,#c872b8 64%,#d8845c 74%,#e8a870 82%,#f0c090 90%,#d09878 95%,#6a2490 100%)'}}/>

      <SkyStars/>

      {/* ── HILLS ────────────────────────────── */}
      <HillsSilhouette/>

      {/* ── GROUND ───────────────────────────── */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:'28%',
        background:'linear-gradient(180deg,rgba(8,1,30,0) 0%,rgba(12,2,40,.7) 40%,#080120 72%,#04000e 100%)',pointerEvents:'none'}}/>

      {/* ── PATH ─────────────────────────────── */}
      <GardenPath keys={collectedKeys}/>

      {/* ── FLORA ────────────────────────────── */}
      <GardenFlora/>

      {/* ── MIST ─────────────────────────────── */}
      <div className="animate-mist-drift" style={{position:'absolute',bottom:'15%',left:'-8%',width:'116%',height:112,
        background:'linear-gradient(180deg,transparent,rgba(139,92,246,.14) 50%,transparent)',
        filter:'blur(28px)',pointerEvents:'none',zIndex:1}}/>
      <div className="animate-mist-drift" style={{position:'absolute',bottom:'8%',left:'-5%',width:'110%',height:72,
        background:'linear-gradient(180deg,transparent,rgba(200,150,255,.18) 50%,transparent)',
        filter:'blur(18px)',pointerEvents:'none',zIndex:1,animationDelay:'3.5s'}}/>

      {/* ── AMBIENT ORBS ─────────────────────── */}
      {/* Orbs bloom near building clusters */}
      <Orb s={360} color="rgba(139,92,246,.09)"  style={{top:'20%',left:'36%'}}/>
      <Orb s={280} color="rgba(249,168,212,.09)" style={{top:'18%',left:'6%'}}/>
      <Orb s={240} color="rgba(200,177,228,.08)" style={{top:'18%',right:'20%'}}/>
      <Orb s={220} color="rgba(155,114,207,.07)" style={{bottom:'22%',left:'10%'}}/>
      <Orb s={260} color="rgba(196,170,255,.10)" style={{bottom:'24%',left:'38%'}}/>

      {/* ── LANTERNS ─────────────────────────── */}
      <GardenLanterns/>

      {/* ── FIREFLIES ────────────────────────── */}
      {[...Array(22)].map((_,i) => (
        <Pip key={i} x={Math.floor(80+(i*1280)/22+(i%5)*22)} y={Math.floor(420+(i%5)*72)} delay={i*.36}
          color={i%3===0?'rgba(253,230,138,.82)':i%3===1?'rgba(196,170,255,.72)':'rgba(249,168,212,.66)'}/>
      ))}

      {/* ── AIW: SIGNPOST ────────────────────── */}
      <Signpost/>

      {/* ── BUTTERFLIES (collectible) ─────────── */}
      {activeBFs.map(b => {
        const pos = BF_POOL[b.posIdx]
        return (
          <Butterfly
            key={b.id}
            x={pos.x} y={pos.y}
            delay={b.delay}
            variant={b.variant}
            phase={b.phase}
            onClick={() => handleCollectBF(b.id)}
          />
        )
      })}

      {/* ── SECRET LAVENDER BLOOM ────────────── */}
      {(() => {
        const bloomed = butterflies >= 10
        return (
          <div
            style={{
              position: 'absolute', left: '62%', top: '80%',
              transform: `translate(-50%,-50%) ${bloomHov && bloomed ? 'translateY(-4px) scale(1.08)' : ''}`,
              zIndex: 5, cursor: bloomed ? 'pointer' : 'default',
              filter: bloomed
                ? bloomHov
                  ? 'drop-shadow(0 0 18px rgba(196,170,255,.9)) drop-shadow(0 0 36px rgba(196,170,255,.5))'
                  : 'drop-shadow(0 0 10px rgba(196,170,255,.6)) drop-shadow(0 0 22px rgba(196,170,255,.3))'
                : 'saturate(0.3) brightness(0.5)',
              transition: 'transform .4s cubic-bezier(.22,1,.36,1), filter .4s ease',
              pointerEvents: bloomed ? 'all' : 'none',
            }}
            onMouseEnter={() => setBloomHov(true)}
            onMouseLeave={() => setBloomHov(false)}
            onClick={() => bloomed && setBloomOpen(true)}
          >
            <svg width="52" height="62" viewBox="0 0 52 62" fill="none">
              {/* Stem */}
              <path d="M26,60 Q24,44 26,32" stroke="#4a7a3a" strokeWidth="2" strokeLinecap="round"/>
              <path d="M26,48 Q18,42 14,36" stroke="#4a7a3a" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M26,44 Q34,38 38,32" stroke="#4a7a3a" strokeWidth="1.5" strokeLinecap="round"/>
              {/* Petals — closed when not bloomed, open when bloomed */}
              {bloomed ? <>
                <ellipse cx="26" cy="18" rx="7" ry="14" fill="rgba(196,170,255,.82)" transform="rotate(0 26 18)"/>
                <ellipse cx="26" cy="18" rx="7" ry="14" fill="rgba(180,140,255,.75)" transform="rotate(51 26 18)"/>
                <ellipse cx="26" cy="18" rx="7" ry="14" fill="rgba(196,170,255,.72)" transform="rotate(102 26 18)"/>
                <ellipse cx="26" cy="18" rx="7" ry="14" fill="rgba(170,130,255,.78)" transform="rotate(153 26 18)"/>
                <ellipse cx="26" cy="18" rx="7" ry="14" fill="rgba(196,170,255,.75)" transform="rotate(204 26 18)"/>
                <ellipse cx="26" cy="18" rx="7" ry="14" fill="rgba(180,140,255,.72)" transform="rotate(255 26 18)"/>
                <circle cx="26" cy="18" r="5" fill="rgba(253,230,138,.9)" filter="url(#bloomGlow)"/>
              </> : <>
                <ellipse cx="26" cy="24" rx="4" ry="10" fill="rgba(120,90,180,.7)" transform="rotate(-15 26 24)"/>
                <ellipse cx="26" cy="24" rx="4" ry="10" fill="rgba(100,70,160,.7)" transform="rotate(15 26 24)"/>
                <ellipse cx="26" cy="24" rx="4" ry="10" fill="rgba(110,80,170,.65)"/>
              </>}
              <defs>
                <filter id="bloomGlow"><feGaussianBlur stdDeviation="3" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              </defs>
            </svg>
            {bloomed && (
              <p style={{
                fontFamily: "'Cinzel',serif", fontSize: 7, color: 'rgba(196,170,255,.7)',
                letterSpacing: '.12em', textAlign: 'center', marginTop: 2,
                whiteSpace: 'nowrap', textShadow: '0 0 8px rgba(196,170,255,.5)',
              }}>
                ✦ {isAr ? 'زهرة اللافندر السرية' : 'Secret Bloom'}
              </p>
            )}
          </div>
        )
      })()}

      {/* ── ROOMS ────────────────────────────── */}
      {rooms.map(r => (
        <RoomNode key={r.id} room={r} collected={collectedKeys.has(r.id)}
          hovered={hov===r.id} onHover={setHov} onClick={pickRoom}/>
      ))}

      {/* ── FINAL GATE ───────────────────────── */}
      <div style={{position:'absolute',left:'78%',top:'80%',
        transform:`translate(-50%,-50%) ${gateHov ? 'translateY(-4px) scale(1.02)' : ''}`,
        zIndex:5,cursor:'pointer',
        opacity:unlocked?1:.82,
        filter: gateHov
          ? unlocked
            ? 'drop-shadow(0 0 16px rgba(253,230,138,.55)) drop-shadow(0 0 30px rgba(196,170,255,.30))'
            : 'saturate(0.6) brightness(0.88) drop-shadow(0 0 12px rgba(196,170,255,.28))'
          : unlocked?'none':'saturate(0.5) brightness(0.78)',
        transition:'transform 0.38s cubic-bezier(.22,1,.36,1), opacity .5s, filter 0.38s ease'}}
        className={unlocked?'animate-door-glow':''}
        onMouseEnter={() => setGateHov(true)}
        onMouseLeave={() => setGateHov(false)}
        onClick={() => { unlocked ? pickRoom('final-door' as RoomId) : setLockedModal(true) }}>
        <div style={{position:'relative'}}>
          {/* Unlock particle ring */}
          {unlocked && (
            <div style={{position:'absolute',inset:0,zIndex:2,pointerEvents:'none'}}>
              {[...Array(12)].map((_,i) => {
                const a=(i/12)*Math.PI*2, r=70
                return (
                  <div key={i} className="particle"
                    style={{ position:'absolute', left:`calc(50% + ${Math.cos(a)*r}px)`, top:`calc(50% + ${Math.sin(a)*r}px)`,
                      width:4, height:4, borderRadius:'50%',
                      background: i%3===0?'rgba(253,230,138,.9)':i%3===1?'rgba(196,170,255,.85)':'rgba(255,179,230,.8)',
                      boxShadow:`0 0 6px ${i%3===0?'rgba(253,230,138,.7)':i%3===1?'rgba(196,170,255,.6)':'rgba(255,179,230,.6)'}`,
                      '--drift':`${(i%5-2)*18}px`, animationDelay:`${i*.28}s`,
                    } as React.CSSProperties}/>
                )
              })}
            </div>
          )}
          <FinalGate unlocked={unlocked} count={collectedKeys.size}/>
          {/* LOCKED badge */}
          {!unlocked && (
            <div style={{position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',
              background:'rgba(60,10,100,.94)',border:'1px solid rgba(139,92,246,.55)',
              borderRadius:20,padding:'3px 14px',backdropFilter:'blur(12px)',
              display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>
              <span style={{fontSize:11}}>🔒</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:9,color:'rgba(180,140,255,.88)',letterSpacing:'.12em'}}>{t.locked}</span>
            </div>
          )}
          {/* READY TO UNLOCK badge */}
          {unlocked && (
            <div className="animate-glow-pulse" style={{position:'absolute',top:-18,left:'50%',transform:'translateX(-50%)',
              background:'linear-gradient(90deg,rgba(40,20,5,.96),rgba(60,30,6,.96))',
              border:'1.5px solid rgba(253,230,138,.72)',
              borderRadius:20,padding:'4px 16px',backdropFilter:'blur(12px)',
              display:'flex',alignItems:'center',gap:7,whiteSpace:'nowrap',
              boxShadow:'0 0 18px rgba(253,230,138,.4)'}}>
              <span style={{fontSize:12}}>✦</span>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:9.5,color:'#fde68a',letterSpacing:'.12em'}}>{t.readyToUnlock}</span>
            </div>
          )}
          <div style={{marginTop:9,textAlign:'center',
            background:unlocked?'rgba(20,10,5,.88)':'rgba(4,1,16,.92)',
            border:`1.5px solid ${unlocked?'rgba(253,230,138,.55)':'rgba(100,60,180,.4)'}`,
            borderRadius:8,padding:'7px 16px',backdropFilter:'blur(14px)',
            boxShadow:unlocked?'0 0 20px rgba(253,230,138,.18)':'none'}}>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:10,
              color:unlocked?'#fde68a':'rgba(140,100,200,.65)',letterSpacing:'.07em'}}>
              {unlocked ? t.enterFinalRevelation : t.finalRevelationKeys(collectedKeys.size)}
            </p>
            {!unlocked && (
              <p style={{fontFamily:"'Nunito',sans-serif",fontStyle:'italic',fontSize:9,
                color:'rgba(120,80,180,.5)',marginTop:3}}>{t.clickSeeRemains}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── BUNNY ────────────────────────────── */}
      <Bunny/>

        </div>{/* end garden canvas */}
      </div>{/* end scrollable garden */}

      {/* ════════════════════════════════════════
          TOP HUD
      ════════════════════════════════════════ */}
      <div style={{position:'absolute',top:0,left:0,right:0,height:64,zIndex:30,
        background:'linear-gradient(180deg,rgba(24,6,58,1) 0%,rgba(32,9,72,1) 50%,rgba(20,5,50,1) 100%)',
        backdropFilter:'blur(22px)',borderBottom:'1px solid rgba(196,170,255,.22)',
        boxShadow:'0 1px 0 rgba(155,114,207,.18), 0 2px 32px rgba(18,5,48,.8)',
        display:'flex',alignItems:'center',padding:'0 16px 0 18px',gap:12}}>

        {/* Back */}
        <HudBtn onClick={() => { audio.playReturnGarden(); onBack() }} style={{
          padding:'7px 15px', fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
          fontSize:13, letterSpacing: isAr ? 0 : '.06em', flexShrink:0,
        }}>
          {t.back}
        </HudBtn>

        {/* Guide */}
        <div style={{flexShrink:0,paddingLeft:4}}><GuidePortrait guide={guide}/></div>

        <div style={{width:1,height:42,background:'rgba(196,170,255,.2)',flexShrink:0}}/>

        {/* Restart */}
        <HudBtn onClick={onReset} style={{
          padding:'7px 15px', fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
          fontSize:13, letterSpacing: isAr ? 0 : '.04em', whiteSpace:'nowrap', flexShrink:0,
          background:'rgba(249,168,212,.08)', color:'rgba(249,168,212,.72)',
          border:'1px solid rgba(249,168,212,.3)',
        }}>
          {t.resetBtn}
        </HudBtn>

        <div style={{width:1,height:42,background:'rgba(196,170,255,.2)',flexShrink:0}}/>

        {/* Keys */}
        <div style={{flexShrink:0}}><KeySlots collected={collectedKeys as Set<RoomId>}/></div>

        {/* Title — absolutely centered so it doesn't shift with asymmetric side content */}
        <div style={{position:'absolute',left:'50%',transform:'translateX(-50%)',textAlign:'center',flexShrink:0,pointerEvents:'none'}}>
          <p style={{fontFamily:"'Cinzel Decorative',serif",fontSize:18,color:'rgba(221,200,255,.9)',letterSpacing:'.08em'}}>{t.hubTitle}</p>
          <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:11,color:'rgba(196,170,255,.45)',letterSpacing: isAr ? 0 : '.14em'}}>{t.hubSubtitle}</p>
        </div>

        <div style={{flex:1}}/>

        {/* Controls — each button anchors its own dropdown panel */}
        <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>

          {/* Hint */}
          <div style={{position:'relative'}}>
            <HudBtn onClick={()=>{setHelp(v=>!v);setMap(false);setInv(false)}} active={showHelp} style={{
              padding:'7px 15px', fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:'.04em',
            }}>
              {t.hintBtn}
            </HudBtn>
            {showHelp && (
              <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,zIndex:50}}>
                <HelpPanel onClose={()=>setHelp(false)}/>
              </div>
            )}
          </div>

          {/* Map */}
          <div style={{position:'relative'}}>
            <HudBtn onClick={()=>{setMap(v=>!v);setHelp(false);setInv(false)}} active={showMap} style={{
              padding:'7px 15px', fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:'.04em',
            }}>
              {t.mapBtn}
            </HudBtn>
            {showMap && (
              <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,zIndex:50}}>
                <MapPanel keys={collectedKeys as Set<RoomId>} onClose={()=>setMap(false)}/>
              </div>
            )}
          </div>

          {/* Bag */}
          <div style={{position:'relative'}}>
            <HudBtn onClick={()=>{setInv(v=>!v);setMap(false);setHelp(false)}} active={showInv} style={{
              padding:'7px 15px', fontFamily:"'Cinzel',serif", fontSize:13, letterSpacing:'.04em',
            }}>
              {t.bagBtn}
            </HudBtn>
            {showInv && (
              <div style={{position:'absolute',top:'calc(100% + 6px)',right:0,zIndex:50}}>
                <InventoryPanel keys={collectedKeys as Set<RoomId>} bf={butterflies} onClose={()=>setInv(false)}/>
              </div>
            )}
          </div>

          <InlineControls />

        </div>
      </div>

      {/* ════════════════════════════════════════
          BOTTOM HUD
      ════════════════════════════════════════ */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:80,zIndex:30,
        background:'linear-gradient(0deg,rgba(18,4,50,1) 0%,rgba(24,6,60,1) 60%,rgba(20,5,55,1) 100%)',
        backdropFilter:'blur(22px)',borderTop:'1px solid rgba(196,170,255,.2)',
        boxShadow:'0 -1px 0 rgba(155,114,207,.15), 0 -2px 28px rgba(18,5,48,.7)',
        display:'flex',alignItems:'center',padding:'0 22px',gap:0}}>

        {/* Quest */}
        <QuestBox n={collectedKeys.size}/>

        <div style={{width:1,height:50,background:'rgba(196,170,255,.2)',margin:'0 18px',flexShrink:0}}/>

        {/* Butterflies */}
        <div style={{flexShrink:0}}><Bar val={butterflies} max={10} color="#c4aaff" label={t.butterflies}/></div>

        <div style={{width:1,height:50,background:'rgba(196,170,255,.2)',margin:'0 18px',flexShrink:0}}/>

        {/* Progress */}
        <div style={{flex:1}}><Bar val={collectedKeys.size} max={5} color="#a855f7" label={t.adventureProgress}/></div>

        <div style={{width:1,height:50,background:'rgba(196,170,255,.2)',margin:'0 18px',flexShrink:0}}/>

        {/* Hovered room info / idle prompt */}
        <div style={{minWidth:205,flexShrink:0}}>
          {hov ? (() => {
            const r=rooms.find(x=>x.id===hov)!
            return (
              <div style={{animation:'panel-in .2s ease'}}>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:r.accent,letterSpacing:'.1em',marginBottom:4}}>{t.selectedDestination}</p>
                <p style={{fontFamily:"'Nunito',sans-serif",fontSize:12,color:'rgba(221,200,255,.92)',marginBottom:3}}>{r.name}</p>
                <p style={{fontFamily:"'Nunito',sans-serif",fontStyle:'italic',fontSize:11,color:'rgba(196,170,255,.62)'}}>{r.tagline}</p>
              </div>
            )
          })() : (
            <div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:9,color:'rgba(196,170,255,.4)',letterSpacing:'.1em',marginBottom:4}}>{t.awaitingExplorer}</p>
              <p style={{fontFamily:"'Nunito',sans-serif",fontStyle:'italic',fontSize:12,color:'rgba(196,170,255,.5)'}}>{t.hoverPrompt}</p>
            </div>
          )}
        </div>

        <div style={{width:1,height:50,background:'rgba(196,170,255,.2)',margin:'0 18px',flexShrink:0}}/>

        {/* Quick slots */}
        <div style={{display:'flex',gap:6,flexShrink:0}}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{width:44,height:44,borderRadius:8,
              background:'rgba(139,92,246,.1)',border:'1px solid rgba(196,170,255,.2)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:19,
              boxShadow:i===0&&collectedKeys.size>0?'0 0 9px rgba(253,230,138,.32)':'none'}}>
              {i===0&&collectedKeys.size>0
                ? <span style={{filter:'drop-shadow(0 0 5px rgba(253,230,138,.8))'}}><GoldenKey size={18}/></span>
                : i===1&&butterflies>0?'🦋':''}
            </div>
          ))}
        </div>
      </div>

      {/* ── OVERLAY BACKDROP (click-outside to close panels) ── */}
      {overlayOpen && <div style={{position:'fixed',inset:0,zIndex:38}} onClick={()=>{setInv(false);setMap(false);setHelp(false)}}/>}

      {/* ── BACK TO TOP ─────────────────────── */}
      {showScrollTop && (
        <button
          onClick={() => gardenScrollRef.current?.scrollTo({top:0,behavior:'smooth'})}
          className="animate-panel-in"
          style={{
            position:'fixed', bottom:96, right:18, zIndex:35,
            width:42, height:42, borderRadius:'50%', cursor:'pointer',
            background:'linear-gradient(135deg,rgba(32,9,72,.95),rgba(60,18,120,.92))',
            border:'1.5px solid rgba(196,170,255,.55)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18, color:'rgba(221,205,255,.92)',
            boxShadow:'0 0 18px rgba(155,114,207,.45), 0 4px 14px rgba(0,0,0,.5)',
            transition:'all .32s cubic-bezier(.22,1,.36,1)',
          }}
          onMouseEnter={e=>{
            e.currentTarget.style.transform='translateY(-3px) scale(1.08)'
            e.currentTarget.style.boxShadow='0 0 28px rgba(255,179,230,.55), 0 0 50px rgba(155,114,207,.25), 0 6px 18px rgba(0,0,0,.5)'
            e.currentTarget.style.borderColor='rgba(255,179,230,.75)'
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.transform='none'
            e.currentTarget.style.boxShadow='0 0 18px rgba(155,114,207,.45), 0 4px 14px rgba(0,0,0,.5)'
            e.currentTarget.style.borderColor='rgba(196,170,255,.55)'
          }}
        >
          ↑
        </button>
      )}

      {/* ── ZOOM CONTROLS ───────────────────── */}
      {(() => {
        const btnStyle = (disabled: boolean): React.CSSProperties => ({
          width: 38, height: 38, borderRadius: '50%', cursor: disabled ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg,rgba(30,8,68,.96),rgba(58,16,118,.93))',
          border: `1.5px solid ${disabled ? 'rgba(196,170,255,.22)' : 'rgba(196,170,255,.52)'}`,
          color: disabled ? 'rgba(196,170,255,.3)' : 'rgba(221,205,255,.92)',
          fontSize: 18, fontWeight: 400, lineHeight: 1,
          boxShadow: disabled ? 'none' : '0 0 12px rgba(155,114,207,.35), 0 3px 12px rgba(0,0,0,.45)',
          transition: 'all .28s cubic-bezier(.22,1,.36,1)',
          flexShrink: 0,
        })
        return (
          <div style={{
            position: 'fixed', bottom: 96, left: 18, zIndex: 35,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            {/* Zoom In */}
            <button
              disabled={zoom >= ZOOM_MAX}
              onClick={zoomIn}
              style={btnStyle(zoom >= ZOOM_MAX)}
              onMouseEnter={e => { if (zoom < ZOOM_MAX) { e.currentTarget.style.transform='translateY(-2px) scale(1.08)'; e.currentTarget.style.boxShadow='0 0 22px rgba(255,179,230,.52), 0 0 40px rgba(155,114,207,.22), 0 4px 16px rgba(0,0,0,.5)'; e.currentTarget.style.borderColor='rgba(255,179,230,.72)' }}}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 0 12px rgba(155,114,207,.35), 0 3px 12px rgba(0,0,0,.45)'; e.currentTarget.style.borderColor='rgba(196,170,255,.52)' }}
            >+</button>

            {/* Zoom label */}
            <div style={{
              fontFamily: "'Cinzel',serif", fontSize: 8.5, letterSpacing: '.08em',
              color: 'rgba(196,170,255,.65)', userSelect: 'none', textAlign: 'center',
            }}>{Math.round(zoom * 100)}%</div>

            {/* Zoom Out */}
            <button
              disabled={zoom <= ZOOM_MIN}
              onClick={zoomOut}
              style={btnStyle(zoom <= ZOOM_MIN)}
              onMouseEnter={e => { if (zoom > ZOOM_MIN) { e.currentTarget.style.transform='translateY(-2px) scale(1.08)'; e.currentTarget.style.boxShadow='0 0 22px rgba(255,179,230,.52), 0 0 40px rgba(155,114,207,.22), 0 4px 16px rgba(0,0,0,.5)'; e.currentTarget.style.borderColor='rgba(255,179,230,.72)' }}}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 0 12px rgba(155,114,207,.35), 0 3px 12px rgba(0,0,0,.45)'; e.currentTarget.style.borderColor='rgba(196,170,255,.52)' }}
            >−</button>

            {/* Reset */}
            {zoom !== 1 && (
              <button
                onClick={zoomReset}
                className="animate-panel-in"
                style={{...btnStyle(false), width:34, height:34, fontSize:10, letterSpacing:'.04em',
                  fontFamily:"'Cinzel',serif", borderRadius:8, marginTop:2}}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px) scale(1.06)'; e.currentTarget.style.boxShadow='0 0 22px rgba(255,179,230,.52), 0 4px 16px rgba(0,0,0,.5)'; e.currentTarget.style.borderColor='rgba(255,179,230,.72)' }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 0 12px rgba(155,114,207,.35), 0 3px 12px rgba(0,0,0,.45)'; e.currentTarget.style.borderColor='rgba(196,170,255,.52)' }}
              >↺</button>
            )}
          </div>
        )
      })()}

      {/* ── TOAST ───────────────────────────── */}
      {toastRoom && <Toast room={toastRoom} roomName={toastRoom.name}/>}

      {/* ── BLOOM AWAKENED MESSAGE ──────────── */}
      {bloomMsg && (
        <div className="animate-toast" style={{position:'fixed',top:78,left:'50%',transform:'translateX(-50%)',
          background:'rgba(6,1,20,.97)',backdropFilter:'blur(16px)',
          border:'1px solid rgba(196,170,255,.55)',borderRadius:14,
          padding:'12px 26px',zIndex:53,pointerEvents:'none',
          display:'flex',alignItems:'center',gap:12,
          boxShadow:'0 8px 40px rgba(196,170,255,.25), 0 0 60px rgba(196,170,255,.12)'}}>
          <span style={{fontSize:22}}>🌸</span>
          <p style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:13,
            color:'rgba(196,170,255,.92)',lineHeight:1.5}}>
            {isAr ? 'تفتحت زهرة كانت تنتظر أن تُكتشف' : 'A hidden bloom has awakened.'}
          </p>
        </div>
      )}

      {/* ── BLOOM CARD ──────────────────────── */}
      {bloomOpen && (
        <div style={{position:'fixed',inset:0,zIndex:55,
          overflowY:'auto',overflowX:'hidden',
          display:'flex',alignItems:'center',justifyContent:'center',
          background:'rgba(3,0,12,.6)',backdropFilter:'blur(12px)'}}
          onClick={() => setBloomOpen(false)}>
          <div className="animate-panel-in" onClick={e=>e.stopPropagation()}
            style={{maxWidth:460,width:'90%',borderRadius:22,overflow:'hidden',
              background:'linear-gradient(145deg,rgba(8,2,26,.98),rgba(18,5,46,.99))',
              border:'1.5px solid rgba(196,170,255,.45)',
              boxShadow:'0 24px 80px rgba(0,0,0,.7), 0 0 60px rgba(196,170,255,.2)'}}>
            <div style={{height:3,background:'linear-gradient(90deg,transparent,rgba(196,170,255,.85),rgba(255,179,230,.6),transparent)'}}/>
            <div style={{padding:'28px 34px 32px',textAlign:isAr?'right':'center',direction:isAr?'rtl':'ltr'}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
                <svg width="52" height="56" viewBox="0 0 52 56" fill="none">
                  <path d="M26,54 Q24,42 26,30" stroke="#4a7a3a" strokeWidth="2" strokeLinecap="round"/>
                  <ellipse cx="26" cy="16" rx="7" ry="13" fill="rgba(196,170,255,.85)" transform="rotate(0 26 16)"/>
                  <ellipse cx="26" cy="16" rx="7" ry="13" fill="rgba(180,140,255,.78)" transform="rotate(51 26 16)"/>
                  <ellipse cx="26" cy="16" rx="7" ry="13" fill="rgba(196,170,255,.75)" transform="rotate(102 26 16)"/>
                  <ellipse cx="26" cy="16" rx="7" ry="13" fill="rgba(170,130,255,.8)" transform="rotate(153 26 16)"/>
                  <ellipse cx="26" cy="16" rx="7" ry="13" fill="rgba(196,170,255,.78)" transform="rotate(204 26 16)"/>
                  <ellipse cx="26" cy="16" rx="7" ry="13" fill="rgba(180,140,255,.75)" transform="rotate(255 26 16)"/>
                  <circle cx="26" cy="16" r="5" fill="rgba(253,230,138,.9)"/>
                  <circle cx="26" cy="16" r="9" fill="none" stroke="rgba(253,230,138,.4)" strokeWidth="1" className="animate-glow-pulse"/>
                </svg>
              </div>
              <p style={{fontFamily:"'Cinzel',serif",fontSize:8.5,color:'rgba(196,170,255,.55)',letterSpacing:'.22em',marginBottom:8,textAlign:'center'}}>
                {isAr ? 'زهرة اللافندر السرية' : 'SECRET LAVENDER BLOOM'}
              </p>
              <h3 style={{fontFamily:isAr?"'Nunito',sans-serif":"'Cinzel Decorative',serif",
                fontSize:isAr?20:17,lineHeight:1.25,marginBottom:16,
                background:'linear-gradient(135deg,#c4aaff,#f9a8d4,#fde68a)',
                WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                {isAr ? 'جانب إضافي عني' : 'A Little More About Me'}
              </h3>
              <div style={{padding:'16px 20px',borderRadius:14,marginBottom:20,
                background:'rgba(196,170,255,.06)',border:'1px solid rgba(196,170,255,.18)'}}>
                <p style={{fontFamily:isAr?"'Nunito',sans-serif":"'Lora',serif",fontStyle:isAr?'normal':'italic',
                  fontSize:14,color:'rgba(221,205,255,.88)',lineHeight:1.78}}>
                  {isAr
                    ? 'إلى جانب الأدوات والمشاريع يشكل الفضول والإبداع والاهتمام بالتفاصيل جزءًا من أسلوبي في التعلم والعمل الرقمي'
                    : 'Beyond tools and projects, curiosity, creativity, and attention to detail shape the way I approach learning and digital work.'}
                </p>
              </div>
              <button onClick={() => setBloomOpen(false)} style={{
                fontFamily:isAr?"'Nunito',sans-serif":"'Cinzel',serif",
                fontSize:isAr?14:11,letterSpacing:isAr?0:'.1em',
                color:'rgba(196,170,255,.8)',cursor:'pointer',padding:'9px 28px',borderRadius:9,
                background:'rgba(196,170,255,.1)',border:'1px solid rgba(196,170,255,.35)',
                transition:'all .2s',
              }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(196,170,255,.2)';e.currentTarget.style.color='rgba(196,170,255,.95)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(196,170,255,.1)';e.currentTarget.style.color='rgba(196,170,255,.8)'}}>
                {isAr ? 'أغلق ✕' : 'Close ✕'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LOCKED DOOR MODAL ───────────────── */}
      {lockedModal && (
        <LockedDoorModal
          count={collectedKeys.size}
          collectedKeys={collectedKeys as Set<string>}
          onClose={() => setLockedModal(false)}
        />
      )}
    </div>
  )
}
