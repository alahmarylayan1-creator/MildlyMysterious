import React, { useState, useCallback, useEffect, useRef } from 'react'
import type { GuideChoice } from './GardenHub'
import { audio } from './sound/engine'
import { useLang, InlineControls } from './LangContext'
import GoldenKey from './GoldenKey'
import { CompanionIntro, CompanionFace } from './CompanionIntro'

import certDataProtection from './imports/Data_Protection_Certificate.jpeg'
import certUniversity from './imports/University_Readiness_Recognition.pdf'
import certSelfAwareness from './imports/Self_Awareness_Certificate.pdf'
import certMentalHealth from './imports/Mental_Health_Certificate.pdf'
import certAiEthics from './imports/AI_Ethics_Certificate.pdf'
import certClaudeApp from './imports/Claude_App_Certificate.pdf'

const CERTIFICATES: { titleEn: string; titleAr: string; src: string; accent: string; border: string }[] = [
  { titleEn: 'Data Protection',         titleAr: 'حماية البيانات',        src: certDataProtection, accent: 'rgba(253,230,138,.22)', border: 'rgba(253,230,138,.55)' },
  { titleEn: 'University Readiness',    titleAr: 'الجاهزية الجامعية',     src: certUniversity,     accent: 'rgba(196,170,255,.18)', border: 'rgba(196,170,255,.5)'  },
  { titleEn: 'Self-Awareness',          titleAr: 'الوعي الذاتي',          src: certSelfAwareness,  accent: 'rgba(249,168,212,.15)', border: 'rgba(249,168,212,.48)' },
  { titleEn: 'Mental Health',           titleAr: 'الصحة النفسية',         src: certMentalHealth,   accent: 'rgba(155,114,207,.18)', border: 'rgba(155,114,207,.5)'  },
  { titleEn: 'AI Ethics',               titleAr: 'أخلاقيات الذكاء الاصطناعي', src: certAiEthics,  accent: 'rgba(200,177,228,.16)', border: 'rgba(200,177,228,.48)' },
  { titleEn: 'Claude App Certificate',  titleAr: 'شهادة تطبيق كلود',     src: certClaudeApp,      accent: 'rgba(249,168,212,.14)', border: 'rgba(249,168,212,.44)' },
]

// ─── Pairs data ────────────────────────────────────────────────────────────────
// Text comes from t.lg_pairs[pairIndex] at render time (bilingual)
type AccentKey = 'lavender' | 'rose' | 'gold' | 'mint' | 'cream'

const PAIR_DEFS: { pairId: string; accent: AccentKey; pairIndex: number }[] = [
  { pairId: 'proto',  accent: 'lavender', pairIndex: 0 },
  { pairId: 'ai',     accent: 'rose',     pairIndex: 1 },
  { pairId: 'data',   accent: 'gold',     pairIndex: 2 },
  { pairId: 'mental', accent: 'mint',     pairIndex: 3 },
  { pairId: 'self',   accent: 'cream',    pairIndex: 4 },
]

const AC: Record<AccentKey, { bg: string; border: string; glow: string; text: string; solid: string; shadow: string }> = {
  lavender: { bg: 'rgba(196,170,255,.12)', border: 'rgba(196,170,255,.65)', glow: 'rgba(196,170,255,.5)',  text: '#c4aaff', solid: 'rgba(196,170,255,.22)', shadow: 'rgba(196,170,255,.35)' },
  rose:     { bg: 'rgba(249,168,212,.1)',  border: 'rgba(249,168,212,.6)',  glow: 'rgba(249,168,212,.44)', text: '#f9a8d4', solid: 'rgba(249,168,212,.18)', shadow: 'rgba(249,168,212,.3)'  },
  gold:     { bg: 'rgba(253,230,138,.11)', border: 'rgba(253,230,138,.62)', glow: 'rgba(253,230,138,.48)', text: '#fde68a', solid: 'rgba(253,230,138,.22)', shadow: 'rgba(253,230,138,.32)' },
  mint:     { bg: 'rgba(155,114,207,.1)',  border: 'rgba(155,114,207,.58)', glow: 'rgba(155,114,207,.44)', text: '#9b72cf', solid: 'rgba(155,114,207,.18)', shadow: 'rgba(155,114,207,.3)'  },
  cream:    { bg: 'rgba(220,195,255,.09)', border: 'rgba(220,195,255,.5)',  glow: 'rgba(220,195,255,.38)', text: '#dcc3ff', solid: 'rgba(220,195,255,.16)', shadow: 'rgba(220,195,255,.28)' },
}

interface CardDef {
  id: string        // e.g. 'proto-cert', 'proto-topic'
  pairId: string
  type: 'cert' | 'topic'
  accent: AccentKey
  pairIndex: number
}

function buildCards(): CardDef[] {
  const arr: CardDef[] = []
  PAIR_DEFS.forEach(p => {
    arr.push({ id: `${p.pairId}-cert`,  pairId: p.pairId, type: 'cert',  accent: p.accent, pairIndex: p.pairIndex })
    arr.push({ id: `${p.pairId}-topic`, pairId: p.pairId, type: 'topic', accent: p.accent, pairIndex: p.pairIndex })
  })
  return shuffle(arr)
}

function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

// ─── Gallery scene (art gallery aesthetic) ────────────────────────────────────
function GalleryScene() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      viewBox="0 0 1440 768" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="lgBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0d0820"/>
          <stop offset="45%"  stopColor="#160c2e"/>
          <stop offset="80%"  stopColor="#0e061a"/>
          <stop offset="100%" stopColor="#080410"/>
        </linearGradient>
        <linearGradient id="lgWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#18103a"/>
          <stop offset="100%" stopColor="#0e0820"/>
        </linearGradient>
        <radialGradient id="lgAmb1" cx="25%" cy="30%" r="55%">
          <stop offset="0%"   stopColor="rgba(200,177,228,.14)"/>
          <stop offset="100%" stopColor="rgba(200,177,228,0)"/>
        </radialGradient>
        <radialGradient id="lgAmb2" cx="75%" cy="25%" r="55%">
          <stop offset="0%"   stopColor="rgba(249,168,212,.09)"/>
          <stop offset="100%" stopColor="rgba(249,168,212,0)"/>
        </radialGradient>
        <radialGradient id="lgAmb3" cx="50%" cy="65%" r="50%">
          <stop offset="0%"   stopColor="rgba(155,114,207,.08)"/>
          <stop offset="100%" stopColor="rgba(155,114,207,0)"/>
        </radialGradient>
        <filter id="lgBlur4"><feGaussianBlur stdDeviation="4"/></filter>
        <filter id="lgBlur10"><feGaussianBlur stdDeviation="10"/></filter>
        <filter id="lgBlur20"><feGaussianBlur stdDeviation="20"/></filter>
        <filter id="lgGlow4"><feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="lgGlow8"><feGaussianBlur stdDeviation="8" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Background */}
      <rect width="1440" height="768" fill="url(#lgBg)"/>
      <rect width="1440" height="768" fill="url(#lgAmb1)"/>
      <rect width="1440" height="768" fill="url(#lgAmb2)"/>
      <rect width="1440" height="768" fill="url(#lgAmb3)"/>

      {/* Gallery wall — upper portion */}
      <rect x="160" y="52" width="1120" height="340" fill="url(#lgWall)" opacity=".8"/>
      <rect x="160" y="52" width="1120" height="3" fill="rgba(200,177,228,.22)"/>
      {/* Wall wainscoting */}
      <rect x="160" y="355" width="1120" height="8" fill="rgba(200,177,228,.15)"/>
      <rect x="160" y="355" width="1120" height="8" fill="rgba(200,177,228,.1)" filter="url(#lgBlur4)"/>

      {/* Left wall column */}
      <rect x="0" y="0" width="170" height="768" fill="rgba(8,4,20,.92)"/>
      <rect x="155" y="52" width="8" height="480" fill="rgba(200,177,228,.18)"/>
      {/* Right wall column */}
      <rect x="1270" y="0" width="170" height="768" fill="rgba(8,4,20,.92)"/>
      <rect x="1277" y="52" width="8" height="480" fill="rgba(200,177,228,.18)"/>

      {/* Ceiling */}
      <rect x="0" y="0" width="1440" height="54" fill="rgba(5,2,16,.98)"/>
      <rect x="0" y="50" width="1440" height="4" fill="rgba(200,177,228,.2)" filter="url(#lgBlur4)"/>

      {/* Ceiling spotlights */}
      {[230, 480, 720, 960, 1210].map((x, i) => (
        <g key={i}>
          {/* Spotlight housing */}
          <rect x={x-14} y="12" width="28" height="18" rx="4" fill="rgba(6,3,18,.95)" stroke="rgba(200,177,228,.3)" strokeWidth="1"/>
          {/* Light cone */}
          <path d={`M ${x-10},30 L ${x-60},200 L ${x+60},200 L ${x+10},30 Z`}
            fill={`rgba(${i%2===0?'200,177,228':'249,168,212'},.055)`}/>
          {/* Spotlight glow */}
          <ellipse cx={x} cy="30" rx="10" ry="6" fill={`rgba(${i%2===0?'200,177,228':'255,220,240'},.5)`} filter="url(#lgGlow4)"/>
        </g>
      ))}

      {/* Painting frames on walls */}
      {/* Left large frame */}
      <g>
        <rect x="220" y="80" width="180" height="230" rx="3"
          fill="rgba(4,2,14,.88)" stroke="rgba(200,177,228,.35)" strokeWidth="2.5"/>
        <rect x="225" y="85" width="170" height="220" rx="2"
          fill="rgba(20,12,42,.9)" stroke="rgba(200,177,228,.15)" strokeWidth="1"/>
        {/* Abstract painting content */}
        <ellipse cx="310" cy="180" rx="50" ry="60" fill="rgba(196,170,255,.14)" filter="url(#lgBlur10)"/>
        <ellipse cx="290" cy="160" rx="30" ry="35" fill="rgba(249,168,212,.12)" filter="url(#lgBlur10)"/>
        <ellipse cx="330" cy="200" rx="25" ry="28" fill="rgba(253,230,138,.1)" filter="url(#lgBlur10)"/>
        {/* Frame nameplate */}
        <rect x="275" y="298" width="70" height="10" rx="2" fill="rgba(200,177,228,.12)" stroke="rgba(200,177,228,.25)" strokeWidth=".5"/>
      </g>

      {/* Center-left frame */}
      <g>
        <rect x="440" y="72" width="220" height="260" rx="3"
          fill="rgba(4,2,14,.88)" stroke="rgba(253,230,138,.3)" strokeWidth="2.5"/>
        <rect x="445" y="77" width="210" height="250" rx="2"
          fill="rgba(22,14,40,.9)" stroke="rgba(253,230,138,.12)" strokeWidth="1"/>
        <ellipse cx="550" cy="190" rx="65" ry="72" fill="rgba(253,230,138,.1)" filter="url(#lgBlur20)"/>
        <ellipse cx="530" cy="170" rx="35" ry="40" fill="rgba(200,177,228,.12)" filter="url(#lgBlur10)"/>
        {/* Frame corner ornaments */}
        {[[445,77],[655,77],[445,327],[655,327]].map(([px,py],idx) => (
          <circle key={idx} cx={px} cy={py} r="4" fill="rgba(253,230,138,.22)" stroke="rgba(253,230,138,.4)" strokeWidth="1"/>
        ))}
        <rect x="495" y="315" width="110" height="10" rx="2" fill="rgba(253,230,138,.1)" stroke="rgba(253,230,138,.22)" strokeWidth=".5"/>
      </g>

      {/* Center frame */}
      <g>
        <rect x="700" y="68" width="200" height="255" rx="3"
          fill="rgba(4,2,14,.88)" stroke="rgba(249,168,212,.32)" strokeWidth="2.5"/>
        <rect x="705" y="73" width="190" height="245" rx="2"
          fill="rgba(20,10,36,.92)" stroke="rgba(249,168,212,.12)" strokeWidth="1"/>
        <ellipse cx="800" cy="190" rx="60" ry="68" fill="rgba(249,168,212,.1)" filter="url(#lgBlur20)"/>
        <ellipse cx="820" cy="170" rx="32" ry="38" fill="rgba(196,170,255,.12)" filter="url(#lgBlur10)"/>
        {[[705,73],[895,73],[705,318],[895,318]].map(([px,py],idx) => (
          <circle key={idx} cx={px} cy={py} r="4" fill="rgba(249,168,212,.22)" stroke="rgba(249,168,212,.4)" strokeWidth="1"/>
        ))}
      </g>

      {/* Center-right frame */}
      <g>
        <rect x="940" y="76" width="180" height="240" rx="3"
          fill="rgba(4,2,14,.88)" stroke="rgba(155,114,207,.3)" strokeWidth="2.5"/>
        <rect x="945" y="81" width="170" height="230" rx="2"
          fill="rgba(18,10,38,.92)" stroke="rgba(155,114,207,.12)" strokeWidth="1"/>
        <ellipse cx="1030" cy="195" rx="55" ry="62" fill="rgba(155,114,207,.12)" filter="url(#lgBlur20)"/>
        <ellipse cx="1010" cy="178" rx="28" ry="34" fill="rgba(253,230,138,.09)" filter="url(#lgBlur10)"/>
        {[[945,81],[1115,81],[945,311],[1115,311]].map(([px,py],idx) => (
          <circle key={idx} cx={px} cy={py} r="4" fill="rgba(155,114,207,.22)" stroke="rgba(155,114,207,.4)" strokeWidth="1"/>
        ))}
      </g>

      {/* Right frame */}
      <g>
        <rect x="1160" y="82" width="160" height="220" rx="3"
          fill="rgba(4,2,14,.88)" stroke="rgba(200,177,228,.32)" strokeWidth="2.5"/>
        <rect x="1165" y="87" width="150" height="210" rx="2"
          fill="rgba(20,12,42,.9)" stroke="rgba(200,177,228,.12)" strokeWidth="1"/>
        <ellipse cx="1240" cy="190" rx="50" ry="58" fill="rgba(200,177,228,.12)" filter="url(#lgBlur20)"/>
        <ellipse cx="1255" cy="175" rx="25" ry="30" fill="rgba(249,168,212,.1)" filter="url(#lgBlur10)"/>
      </g>

      {/* Gallery rail (picture hanging rail) */}
      <rect x="160" y="68" width="1120" height="6" rx="3" fill="rgba(200,177,228,.22)" stroke="rgba(200,177,228,.3)" strokeWidth="1"/>
      {/* Hanging wires */}
      {[310,550,800,1030,1240].map((x,i) => (
        <line key={i} x1={x} y1="74" x2={x} y2={[82,74,70,78,84][i]} stroke="rgba(200,177,228,.25)" strokeWidth="1.5"/>
      ))}

      {/* Floor */}
      <rect x="0" y="580" width="1440" height="188" fill="rgba(4,2,12,.96)"/>
      <rect x="0" y="578" width="1440" height="5" fill="rgba(200,177,228,.15)" filter="url(#lgBlur4)"/>
      {/* Parquet floor lines */}
      {[...Array(8)].map((_,i) => (
        <line key={`fh${i}`} x1="0" y1={590+i*18} x2="1440" y2={590+i*18}
          stroke="rgba(200,177,228,.06)" strokeWidth="1"/>
      ))}
      {[...Array(20)].map((_,i) => (
        <line key={`fv${i}`} x1={i*76} y1="580" x2={i*76} y2="768"
          stroke="rgba(200,177,228,.05)" strokeWidth="1"/>
      ))}

      {/* Ambient floor glow */}
      <ellipse cx="720" cy="595" rx="500" ry="40" fill="rgba(200,177,228,.06)" filter="url(#lgBlur20)"/>

      {/* Sparkles */}
      {[...Array(24)].map((_,i) => (
        <circle key={i}
          cx={(i*197+42)%1440} cy={(i*113+60)%540}
          r={i%5===0?2:i%3===0?1.5:1}
          fill={i%4===0?'#c8b1e4':i%4===1?'#f9a8d4':i%4===2?'#fde68a':'#9b72cf'}
          opacity={.18+i%3*.14}
          className="animate-star-twinkle"
          style={{animationDelay:`${(i*.24)%3.8}s`}}/>
      ))}
    </svg>
  )
}

// ─── Memory card ───────────────────────────────────────────────────────────────
function MemoryCard({
  card, isFlipped, isMatched, isShaking, onClick, isAr, certText, topicText,
}: {
  card: CardDef; isFlipped: boolean; isMatched: boolean; isShaking: boolean
  onClick: () => void; isAr: boolean; certText: string; topicText: string
}) {
  const [hov, setHov] = useState(false)
  const c = AC[card.accent]
  const label = card.type === 'cert' ? certText : topicText
  const typeLabel = card.type === 'cert'
    ? (isAr ? 'شهادة' : 'Certificate')
    : (isAr ? 'موضوع' : 'Topic')

  const faceUp = isFlipped || isMatched

  return (
    <div
      onClick={() => !isMatched && !isFlipped && onClick()}
      onMouseEnter={() => { if (!isMatched && !isFlipped) { setHov(true); audio.playHover() } }}
      onMouseLeave={() => setHov(false)}
      className={isShaking ? 'animate-tile-shake' : ''}
      style={{
        borderRadius: 12, cursor: isMatched || isFlipped ? 'default' : 'pointer',
        userSelect: 'none', minHeight: 110,
        transition: 'all .3s cubic-bezier(.34,1.2,.64,1)',
        transform: isMatched ? 'scale(.98)' : hov ? 'scale(1.03) translateY(-2px)' : 'scale(1)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Card face */}
      {faceUp ? (
        <div style={{
          width: '100%', height: '100%', minHeight: 110,
          borderRadius: 12, padding: '12px 10px',
          background: isMatched ? c.solid : c.bg,
          borderLeft: `1.5px solid ${c.border}`,
          borderTop: `1.5px solid ${c.border}`,
          borderRight: `1.5px solid ${c.border}`,
          borderBottom: `1.5px solid ${c.border}`,
          boxShadow: isMatched ? `0 0 24px ${c.shadow}, 0 4px 18px rgba(0,0,0,.4)` : `0 0 16px ${c.shadow}66`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          animation: 'completion-in .35s cubic-bezier(.22,1,.36,1) both',
        }}>
          <span style={{
            fontFamily: "'Cinzel',serif", fontSize: 10,
            color: `${c.text}99`, letterSpacing: '.15em', textTransform: 'uppercase',
          }}>
            {typeLabel}
          </span>
          <p style={{
            fontFamily: isAr ? "'Nunito',sans-serif" : (card.type === 'cert' ? "'Lora',serif" : "'Cinzel',serif"),
            fontStyle: isAr ? 'normal' : (card.type === 'cert' ? 'italic' : 'normal'),
            fontSize: isAr ? 13 : (label.length > 30 ? 11 : label.length > 18 ? 13 : 14.5),
            color: isMatched ? c.text : `${c.text}cc`,
            lineHeight: 1.45, textAlign: 'center',
            letterSpacing: isAr ? 0 : '.02em',
          }}>
            {label}
          </p>
          {isMatched && (
            <span style={{ fontSize: 11, color: c.text, filter: `drop-shadow(0 0 5px ${c.glow})` }}>✓</span>
          )}
        </div>
      ) : (
        <div style={{
          width: '100%', height: '100%', minHeight: 110,
          borderRadius: 12, padding: '12px 10px',
          background: hov ? 'rgba(200,177,228,.09)' : 'rgba(8,4,22,.9)',
          borderLeft: `1.5px solid ${hov ? 'rgba(200,177,228,.45)' : 'rgba(200,177,228,.2)'}`,
          borderTop: `1.5px solid ${hov ? 'rgba(200,177,228,.45)' : 'rgba(200,177,228,.2)'}`,
          borderRight: `1.5px solid ${hov ? 'rgba(200,177,228,.45)' : 'rgba(200,177,228,.2)'}`,
          borderBottom: `1.5px solid ${hov ? 'rgba(200,177,228,.45)' : 'rgba(200,177,228,.2)'}`,
          boxShadow: hov ? '0 0 24px rgba(255,179,230,.4), 0 0 40px rgba(196,170,255,.22), 0 6px 20px rgba(0,0,0,.45)' : 'none',
          transform: hov ? 'translateY(-2px)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .2s',
        }}>
          {/* Card back — natural crescent moon */}
          <svg width="44" height="44" viewBox="0 0 44 44" opacity={hov ? .82 : .55}>
            {/* Moon body: outer arc loops left, inner arc traces the shadow edge */}
            <path
              d="M 28 8
                 C 16 5 6 12 6 22
                 C 6 32 16 39 28 36
                 C 22 32 19 27 19 22
                 C 19 17 22 12 28 8 Z"
              fill="rgba(210,185,255,.78)"
            />
            {/* Subtle inner glow on the moon edge */}
            <path
              d="M 28 8
                 C 16 5 6 12 6 22
                 C 6 32 16 39 28 36
                 C 22 32 19 27 19 22
                 C 19 17 22 12 28 8 Z"
              fill="none"
              stroke="rgba(235,220,255,.35)"
              strokeWidth="1"
            />
            {/* Stars beside the moon */}
            <circle cx="35" cy="10" r="1.8" fill="rgba(230,215,255,.6)"/>
            <circle cx="38" cy="21" r="1.2" fill="rgba(230,215,255,.45)"/>
            <circle cx="35" cy="33" r="1.5" fill="rgba(230,215,255,.5)"/>
            <circle cx="33" cy="15" r=".8" fill="rgba(230,215,255,.4)"/>
          </svg>
        </div>
      )}
    </div>
  )
}

// ─── Hint overlay ─────────────────────────────────────────────────────────────
function HintOverlay({ onClose, isAr, hintEn, hintAr }: { onClose: () => void; isAr: boolean; hintEn: string; hintAr: string }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 55, overflowY: 'auto', overflowX: 'hidden',
      background: 'rgba(2,0,10,.7)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div onClick={e => e.stopPropagation()} style={{
        maxWidth: 420, width: '88vw', padding: '28px 32px', borderRadius: 18,
        background: 'linear-gradient(145deg,rgba(6,1,22,.99),rgba(14,4,40,.99))',
        border: '1px solid rgba(196,170,255,.4)',
        boxShadow: '0 0 48px rgba(196,170,255,.2)',
        textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: 'rgba(253,230,138,.65)', letterSpacing: '.28em' }}>✦ {isAr ? 'تلميح' : 'HINT'} ✦</p>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic',
          fontSize: 15, color: 'rgba(210,195,255,.88)', lineHeight: 1.7,
          direction: isAr ? 'rtl' : 'ltr' }}>
          {isAr ? hintAr : hintEn}
        </p>
        <button onClick={onClose} style={{
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 11, letterSpacing: isAr ? 0 : '.12em',
          color: 'rgba(196,170,255,.8)', background: 'rgba(196,170,255,.1)',
          border: '1px solid rgba(196,170,255,.35)', borderRadius: 9, padding: '9px 24px', cursor: 'pointer',
        }}>
          {isAr ? 'حسنًا' : 'Got it'}
        </button>
      </div>
    </div>
    </div>
  )
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function HUD({ guide, totalKeys, butterflies, matchedCount, onBack, onInventory, onMainMenu, onReset, onHint }: {
  guide: GuideChoice; totalKeys: number; butterflies: number
  matchedCount: number
  onBack: () => void; onInventory: () => void
  onMainMenu: () => void; onReset: () => void; onHint: () => void
}) {
  const isMan = guide === 'man'
  const { t, isAr } = useLang()
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 64, zIndex: 30,
      background: 'linear-gradient(180deg,rgba(24,6,58,.97) 0%,rgba(32,9,72,.94) 50%,rgba(16,4,44,.78) 82%,transparent)',
      backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(196,170,255,.22)',
      boxShadow: '0 1px 0 rgba(155,114,207,.2), 0 2px 28px rgba(18,5,48,.75)',
      display: 'flex', alignItems: 'center', padding: '0 16px 0 16px', gap: 10 }}>

      <button className="hov-btn" onClick={() => { audio.playReturnGarden(); onBack() }} style={{
        display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
        background: 'rgba(139,92,246,.14)',
        borderLeft: '1px solid rgba(196,170,255,.3)', borderTop: '1px solid rgba(196,170,255,.3)',
        borderRight: '1px solid rgba(196,170,255,.3)', borderBottom: '1px solid rgba(196,170,255,.3)',
        borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
        fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
        fontSize: 10.5, color: 'rgba(196,170,255,.82)', letterSpacing: isAr ? 0 : '.06em' }}>
        {t.back}
      </button>

      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%',
          background: isMan ? 'linear-gradient(135deg,#1a1568,#4535c0)' : 'linear-gradient(135deg,#7b2fb0,#c060c0)',
          border: '1.5px solid rgba(253,230,138,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          boxShadow: '0 0 16px rgba(139,92,246,.5)' }}>
          <CompanionFace guide={guide} size={60} idPrefix="lg_hud" />
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: 'rgba(196,170,255,.18)', flexShrink: 0 }}/>

      <div style={{ flexShrink: 0 }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 10, color: 'rgba(196,170,255,.55)', letterSpacing: '.18em', marginBottom: 1 }}>{isAr ? 'الغرفة الحالية' : 'NOW IN'}</p>
        <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: 15, color: 'rgba(221,205,255,.9)' }}>
          {t.lg_title}
        </h2>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Match progress */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, color: 'rgba(200,177,228,.7)', letterSpacing: '.12em' }}>
          {isAr ? 'الأزواج' : 'PAIRS'}
        </p>
        <div style={{ display: 'flex', gap: 5 }}>
          {PAIR_DEFS.map((p, i) => {
            const matched = i < matchedCount
            const c = AC[p.accent]
            return (
              <div key={p.pairId} style={{
                width: 22, height: 22, borderRadius: 6, transition: 'all .35s',
                background: matched ? c.bg : 'rgba(196,170,255,.07)',
                borderLeft: `1.5px solid ${matched ? c.border : 'rgba(196,170,255,.2)'}`,
                borderTop: `1.5px solid ${matched ? c.border : 'rgba(196,170,255,.2)'}`,
                borderRight: `1.5px solid ${matched ? c.border : 'rgba(196,170,255,.2)'}`,
                borderBottom: `1.5px solid ${matched ? c.border : 'rgba(196,170,255,.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9,
                boxShadow: matched ? `0 0 10px ${c.glow}66` : 'none',
              }}>
                {matched && <span style={{ color: c.text }}>✓</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: 'rgba(196,170,255,.18)', flexShrink: 0 }}/>

      <div style={{ display: 'flex', gap: 12, flexShrink: 0, alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 9.5, color: 'rgba(253,230,138,.58)', letterSpacing: isAr ? 0 : '.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
            <GoldenKey size={12}/> {isAr ? 'مفاتيح' : 'KEYS'}
          </p>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, color: '#fde68a', fontWeight: 700 }}>{totalKeys}/5</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 9.5, color: 'rgba(196,170,255,.58)', letterSpacing: isAr ? 0 : '.08em', marginBottom: 2 }}>🦋 {isAr ? 'مُكتشفة' : 'FOUND'}</p>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, color: '#c4aaff', fontWeight: 700 }}>{butterflies}</p>
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: 'rgba(196,170,255,.18)', flexShrink: 0 }}/>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={() => { audio.playInventoryOpen(); onInventory() }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 16px rgba(253,230,138,.4)'; e.currentTarget.style.borderColor='rgba(253,230,138,.65)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(253,230,138,.3)' }}
          style={{
          background: 'rgba(253,230,138,.1)',
          border: '1px solid rgba(253,230,138,.3)',
          borderRadius: 8, padding: '6px 13px', cursor: 'pointer', transition: 'all .2s',
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10.5, color: 'rgba(253,230,138,.82)', letterSpacing: isAr ? 0 : '.05em' }}>
          {isAr ? '⊞ العناصر' : '⊞ Items'}
        </button>
        <button className="hov-btn" onClick={() => { audio.playReturnGarden(); onMainMenu() }} style={{
          background: 'rgba(253,230,138,.12)',
          borderLeft: '1px solid rgba(253,230,138,.4)', borderTop: '1px solid rgba(253,230,138,.4)',
          borderRight: '1px solid rgba(253,230,138,.4)', borderBottom: '1px solid rgba(253,230,138,.4)',
          borderRadius: 7, padding: '6px 11px', cursor: 'pointer',
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
          fontSize: 9.5, color: 'rgba(253,230,138,.9)', letterSpacing: isAr ? 0 : '.05em', whiteSpace: 'nowrap' }}>
          {t.mainMenu}
        </button>
        <button className="hov-btn" onClick={onReset} style={{
          background: 'rgba(249,168,212,.08)',
          borderLeft: '1px solid rgba(249,168,212,.28)', borderTop: '1px solid rgba(249,168,212,.28)',
          borderRight: '1px solid rgba(249,168,212,.28)', borderBottom: '1px solid rgba(249,168,212,.28)',
          borderRadius: 7, padding: '6px 11px', cursor: 'pointer',
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
          fontSize: 8.5, color: 'rgba(249,168,212,.65)', letterSpacing: isAr ? 0 : '.04em', whiteSpace: 'nowrap' }}>
          {t.resetBtn}
        </button>
        <button onClick={onHint}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 22px rgba(253,230,138,.45)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
          style={{
            background: 'rgba(253,230,138,.1)',
            border: '1px solid rgba(253,230,138,.35)',
            borderRadius: 8, padding: '6px 13px', cursor: 'pointer',
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
            fontSize: 10.5, color: 'rgba(253,230,138,.82)', letterSpacing: isAr ? 0 : '.06em',
            transition: 'all .25s',
          }}>
          {isAr ? '✦ تلميح' : '✦ Hint'}
        </button>
      </div>
      <InlineControls />
    </div>
  )
}

// ─── Inventory panel ───────────────────────────────────────────────────────────
function InventoryPanel({ totalKeys, butterflies, onClose }: {
  totalKeys: number; butterflies: number; onClose: () => void
}) {
  const { t, isAr } = useLang()
  const rooms  = ['portrait','cabinet','studio','workshop','gallery']
  const names  = [t.roomPortrait, t.roomCabinet, t.roomStudio, t.roomWorkshop, t.roomGallery]
  const accents = ['#f9a8d4','#fde68a','#c4aaff','#9b72cf','#c8b1e4']
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
      background: 'rgba(3,0,12,.5)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="animate-panel-in" onClick={e => e.stopPropagation()}
        style={{ width: 320, height: '100%', overflow: 'auto',
          background: 'linear-gradient(160deg,rgba(6,1,20,.99),rgba(14,4,40,.99))',
          borderLeft: '1px solid rgba(196,170,255,.28)',
          boxShadow: '-20px 0 60px rgba(0,0,0,.65)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '28px 24px 18px', borderBottom: '1px solid rgba(196,170,255,.12)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 8.5, color: 'rgba(253,230,138,.65)', letterSpacing: isAr ? 0 : '.22em', marginBottom: 5 }}>
              {isAr ? 'حقيبة' : "ADVENTURER'S"}
            </p>
            <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: 18, color: '#fde68a' }}>{isAr ? 'المستكشف' : 'Inventory'}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(196,170,255,.55)', cursor: 'pointer', fontSize: 24 }}>×</button>
        </div>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(196,170,255,.1)', display: 'flex', gap: 16 }}>
          {[[totalKeys, isAr ? 'المفاتيح' : 'Keys','rgba(253,230,138,.06)','rgba(253,230,138,.22)','#fde68a'],
            [butterflies, isAr ? 'الفراشات' : 'Butterflies','rgba(196,170,255,.06)','rgba(196,170,255,.22)','#c4aaff']].map(([val,lbl,bg,bd,col]) => (
            <div key={lbl as string} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRadius: 10,
              background: bg as string,
              borderLeft: `1px solid ${bd}`, borderTop: `1px solid ${bd}`,
              borderRight: `1px solid ${bd}`, borderBottom: `1px solid ${bd}` }}>
              <p style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: 22, color: col as string }}>{val as number}</p>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, color: `${col}99`, letterSpacing: '.15em' }}>{lbl as string}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: '18px 24px', flex: 1 }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10.5, color: 'rgba(196,170,255,.55)', letterSpacing: isAr ? 0 : '.18em', marginBottom: 14 }}>{isAr ? 'مفاتيح الغرف' : 'ROOM KEYS'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rooms.map((r, i) => {
              const unlocked = i < totalKeys
              const c = accents[i]
              return (
                <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                  background: unlocked ? `${c}0e` : 'rgba(20,8,40,.5)',
                  borderLeft: `1px solid ${unlocked?`${c}44`:'rgba(196,170,255,.14)'}`,
                  borderTop: `1px solid ${unlocked?`${c}44`:'rgba(196,170,255,.14)'}`,
                  borderRight: `1px solid ${unlocked?`${c}44`:'rgba(196,170,255,.14)'}`,
                  borderBottom: `1px solid ${unlocked?`${c}44`:'rgba(196,170,255,.14)'}`}}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: unlocked ? `${c}22` : 'rgba(20,8,40,.8)',
                    borderLeft: `1px solid ${unlocked?`${c}55`:'rgba(196,170,255,.18)'}`,
                    borderTop: `1px solid ${unlocked?`${c}55`:'rgba(196,170,255,.18)'}`,
                    borderRight: `1px solid ${unlocked?`${c}55`:'rgba(196,170,255,.18)'}`,
                    borderBottom: `1px solid ${unlocked?`${c}55`:'rgba(196,170,255,.18)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unlocked ? <GoldenKey size={16}/> : <span style={{ fontSize: 16 }}>🔒</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 12, color: unlocked ? c : 'rgba(196,170,255,.35)', marginBottom: 2 }}>
                      {names[i]}
                    </p>
                    <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 11, color: unlocked ? `${c}88` : 'rgba(196,170,255,.25)' }}>
                      {unlocked ? t.lg_keyCollected : t.lg_notDiscovered}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(196,170,255,.1)', textAlign: 'center' }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 11, color: 'rgba(196,170,255,.3)' }}>
            {isAr ? 'خمس غرف. خمسة مفاتيح. حديقة واحدة.' : 'Five rooms. Five keys. One garden.'}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Certificate card ──────────────────────────────────────────────────────────
function CertCard({ cert, isAr, onClick, index }: { cert: typeof CERTIFICATES[0]; isAr: boolean; onClick: () => void; index: number }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: 'pointer', borderRadius: 10, padding: '14px 10px', textAlign: 'center',
        background: hov ? cert.accent : 'rgba(8,4,22,.85)',
        border: `1px solid ${hov ? cert.border : cert.border + '66'}`,
        boxShadow: hov ? `0 0 28px ${cert.accent}` : 'none',
        transform: hov ? 'translateY(-3px) scale(1.03)' : 'none',
        transition: 'all .25s cubic-bezier(.22,1,.36,1)',
        animation: `completion-in .4s ${index * .06}s cubic-bezier(.22,1,.36,1) both`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}
    >
      <span style={{ fontSize: 22 }}>🎓</span>
      <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: isAr ? 13 : 11,
        color: 'rgba(220,200,255,.88)', letterSpacing: isAr ? 0 : '.04em', lineHeight: 1.4 }}>
        {isAr ? cert.titleAr : cert.titleEn}
      </p>
      <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, color: 'rgba(200,177,228,.5)', letterSpacing: '.1em' }}>
        {isAr ? 'اضغط للعرض' : 'VIEW'}
      </span>
    </button>
  )
}

// ─── Certificate modal ─────────────────────────────────────────────────────────
function CertModal({ cert, isAr, onClose }: { cert: typeof CERTIFICATES[0]; isAr: boolean; onClose: () => void }) {
  const isPdf = cert.src.endsWith('.pdf')
  const [embedFailed, setEmbedFailed] = React.useState(false)
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 80,
        overflowY: 'auto', overflowX: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2,0,10,.92)', backdropFilter: 'blur(22px)',
      }}
    >
      {/* Decorative corner glows */}
      <div style={{ position: 'absolute', top: '8%', left: '8%', width: 320, height: 320, borderRadius: '50%', background: `radial-gradient(circle,${cert.accent} 0%,transparent 70%)`, pointerEvents: 'none', opacity: .35 }}/>
      <div style={{ position: 'absolute', bottom: '8%', right: '8%', width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle,${cert.accent} 0%,transparent 70%)`, pointerEvents: 'none', opacity: .25 }}/>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(860px, 94vw)', height: 'min(88vh, 700px)',
          display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(155deg, rgba(6,1,22,.98) 0%, rgba(16,5,44,.98) 100%)',
          borderRadius: 20, overflow: 'hidden',
          border: `1px solid ${cert.border}`,
          boxShadow: `0 0 0 1px rgba(255,255,255,.04), 0 0 80px ${cert.accent}, 0 32px 100px rgba(0,0,0,.85)`,
          animation: 'completion-in .32s cubic-bezier(.22,1,.36,1) both',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 22px', flexShrink: 0,
          borderBottom: `1px solid ${cert.border}44`,
          background: `linear-gradient(90deg, ${cert.accent}22, transparent)`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🎓</span>
            <div>
              <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9.5, color: 'rgba(200,177,228,.5)', letterSpacing: '.22em', marginBottom: 2 }}>
                {isAr ? 'الشهادة' : 'CERTIFICATE'}
              </p>
              <h3 style={{
                fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                fontSize: isAr ? 16 : 15,
                color: 'rgba(225,210,255,.95)',
                letterSpacing: isAr ? 0 : '.05em',
              }}>
                {isAr ? cert.titleAr : cert.titleEn}
              </h3>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Open in new tab link */}
            <a
              href={cert.src} target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: "'Cinzel',serif", fontSize: 10.5,
                color: 'rgba(196,170,255,.65)', textDecoration: 'none',
                letterSpacing: '.08em', cursor: 'pointer',
                padding: '5px 12px',
                border: '1px solid rgba(196,170,255,.25)',
                borderRadius: 7,
                transition: 'all .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(196,170,255,.9)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,170,255,.5)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(196,170,255,.65)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,170,255,.25)' }}
            >
              ↗ {isAr ? 'فتح' : 'Open'}
            </a>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(196,170,255,.08)', border: '1px solid rgba(196,170,255,.22)',
                color: 'rgba(196,170,255,.7)', cursor: 'pointer',
                width: 34, height: 34, borderRadius: 8,
                fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,170,255,.18)'; (e.currentTarget as HTMLElement).style.color = 'rgba(220,200,255,.95)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,170,255,.08)'; (e.currentTarget as HTMLElement).style.color = 'rgba(196,170,255,.7)' }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Certificate content */}
        <div style={{
          flex: 1, overflow: 'hidden', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(3,1,12,.6)',
        }}>
          {/* Subtle corner ornaments */}
          <div style={{ position: 'absolute', top: 12, left: 12, width: 40, height: 40, borderTop: `1.5px solid ${cert.border}55`, borderLeft: `1.5px solid ${cert.border}55`, borderRadius: '4px 0 0 0', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderTop: `1.5px solid ${cert.border}55`, borderRight: `1.5px solid ${cert.border}55`, borderRadius: '0 4px 0 0', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', bottom: 12, left: 12, width: 40, height: 40, borderBottom: `1.5px solid ${cert.border}55`, borderLeft: `1.5px solid ${cert.border}55`, borderRadius: '0 0 0 4px', pointerEvents: 'none' }}/>
          <div style={{ position: 'absolute', bottom: 12, right: 12, width: 40, height: 40, borderBottom: `1.5px solid ${cert.border}55`, borderRight: `1.5px solid ${cert.border}55`, borderRadius: '0 0 4px 0', pointerEvents: 'none' }}/>

          {isPdf && !embedFailed ? (
            <embed
              src={`${cert.src}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              type="application/pdf"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              onError={() => setEmbedFailed(true)}
            />
          ) : isPdf && embedFailed ? (
            /* Fallback: elegant card for when embed fails */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 72, filter: `drop-shadow(0 0 24px ${cert.accent})` }}>🎓</div>
              <div>
                <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: 'rgba(200,177,228,.5)', letterSpacing: '.22em', marginBottom: 8 }}>
                  {isAr ? 'شهادة' : 'CERTIFICATE OF COMPLETION'}
                </p>
                <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: isAr ? 22 : 20, color: 'rgba(220,200,255,.9)', lineHeight: 1.3 }}>
                  {isAr ? cert.titleAr : cert.titleEn}
                </h2>
              </div>
              <a href={cert.src} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button
                  style={{
                    fontFamily: "'Cinzel',serif", fontSize: 13, letterSpacing: '.1em',
                    color: '#c4aaff', cursor: 'pointer',
                    background: 'rgba(196,170,255,.14)',
                    border: '1.5px solid rgba(196,170,255,.55)',
                    borderRadius: 10, padding: '13px 36px',
                    boxShadow: '0 0 28px rgba(196,170,255,.3)',
                    transition: 'all .25s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,170,255,.24)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 44px rgba(196,170,255,.5)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(196,170,255,.14)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 28px rgba(196,170,255,.3)' }}
                >
                  {isAr ? '✦ فتح الشهادة' : '✦ View Certificate ↗'}
                </button>
              </a>
            </div>
          ) : (
            /* Image certificate */
            <img
              src={cert.src}
              alt={cert.titleEn}
              style={{
                maxWidth: 'calc(100% - 32px)', maxHeight: 'calc(100% - 32px)',
                objectFit: 'contain', display: 'block',
                borderRadius: 8,
                boxShadow: `0 8px 40px rgba(0,0,0,.6), 0 0 0 1px ${cert.border}44`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Completion overlay ────────────────────────────────────────────────────────
function CompletionOverlay({ onCollect, collected, isAr, pairDefs, pairs, onBack }: {
  onCollect: () => void; collected: boolean; isAr: boolean
  pairDefs: typeof PAIR_DEFS
  pairs: { cert: string; topic: string }[]
  onBack: () => void
}) {
  const [hov, setHov] = useState(false)
  const [hovBack, setHovBack] = useState(false)
  const [activeCert, setActiveCert] = useState<typeof CERTIFICATES[0] | null>(null)

  return (
    <>
    <div style={{ position: 'absolute', inset: 0, zIndex: 40,
      background: 'rgba(2,0,10,.88)', backdropFilter: 'blur(22px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
      <div style={{
        animation: 'completion-in .55s cubic-bezier(.22,1,.36,1) both',
        textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 18, maxWidth: 580, width: '90%', padding: '32px 0',
      }}>
        {/* Sparkle ring */}
        <div style={{ position: 'relative', width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {[...Array(8)].map((_,i) => {
            const a = (i/8)*Math.PI*2
            const colors = ['#c4aaff','#f9a8d4','#fde68a','#9b72cf']
            return (
              <div key={i} className="animate-star-twinkle" style={{ animationDelay: `${i*.22}s`,
                position: 'absolute', left: 45 + 40*Math.cos(a)-5, top: 45 + 40*Math.sin(a)-5 }}>
                <svg width="10" height="10" viewBox="0 0 12 12">
                  <polygon points="6,0 7.4,4.2 12,4.2 8.5,6.8 9.7,11 6,8.5 2.3,11 3.5,6.8 0,4.2 4.6,4.2"
                    fill={colors[i%4]}/>
                </svg>
              </div>
            )
          })}
          <div style={{ width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg,rgba(200,177,228,.28),rgba(155,114,207,.12))',
            borderLeft: '2px solid rgba(200,177,228,.7)', borderTop: '2px solid rgba(200,177,228,.7)',
            borderRight: '2px solid rgba(200,177,228,.7)', borderBottom: '2px solid rgba(200,177,228,.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(200,177,228,.45)' }}>
            <GoldenKey size={28}/>
          </div>
        </div>

        <div>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 11, color: 'rgba(200,177,228,.65)', letterSpacing: '.28em', marginBottom: 6 }}>
            {isAr ? 'معرض التعلّم' : 'THE LEARNING GALLERY'}
          </p>
          <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif",
            fontSize: isAr ? 29 : 31, lineHeight: 1.2,
            background: 'linear-gradient(135deg,#c8b1e4,#f9a8d4,#fde68a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {isAr ? 'كُشفت جميع الأزواج' : 'All Pairs Revealed'}
          </h2>
        </div>

        {/* Matched pairs summary */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pairDefs.map((p, i) => {
            const c = AC[p.accent]
            return (
              <div key={p.pairId} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
                borderRadius: 10, animation: `completion-in .4s ${i*.08}s cubic-bezier(.22,1,.36,1) both`,
                background: c.solid,
                borderLeft: `1px solid ${c.border}`, borderTop: `1px solid ${c.border}`,
                borderRight: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`,
              }}>
                <span style={{ fontSize: 11, color: c.text, filter: `drop-shadow(0 0 4px ${c.glow})`, flexShrink: 0 }}>✓</span>
                <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic',
                  fontSize: isAr ? 13.5 : 12.5, color: c.text, flex: 1, textAlign: isAr ? 'right' : 'left',
                  direction: isAr ? 'rtl' : 'ltr' }}>
                  {isAr ? pairs[i].cert : pairs[i].cert}
                </p>
                <div style={{ width: 1, height: 20, background: `${c.border}66`, flexShrink: 0 }}/>
                <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                  fontSize: isAr ? 13.5 : 11.5, color: `${c.text}cc`, flexShrink: 0,
                  letterSpacing: isAr ? 0 : '.04em' }}>
                  {isAr ? pairs[i].topic : pairs[i].topic}
                </p>
              </div>
            )
          })}
        </div>

        {/* Certificate cards */}
        <div style={{ width: '100%' }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 11,
            color: 'rgba(200,177,228,.5)', letterSpacing: isAr ? 0 : '.2em', textAlign: 'center', marginBottom: 12 }}>
            {isAr ? 'الشهادات المكتسبة' : 'CERTIFICATES EARNED'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {CERTIFICATES.map((c, i) => (
              <CertCard key={i} cert={c} isAr={isAr} onClick={() => setActiveCert(c)} index={i}/>
            ))}
          </div>
        </div>

        {/* Golden key — manual click to collect */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {!collected ? (
            <>
              <div style={{
                animation: 'key-float 2.8s ease-in-out infinite',
                filter: 'drop-shadow(0 0 18px #fde68a) drop-shadow(0 0 40px rgba(253,230,138,.6))',
              }}>
                <GoldenKey size={72}/>
              </div>
              <button
                onClick={onCollect}
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{
                  fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                  fontSize: isAr ? 16 : 14, letterSpacing: isAr ? 0 : '.14em',
                  color: '#fde68a', cursor: 'pointer',
                  background: hov ? 'rgba(253,230,138,.26)' : 'linear-gradient(135deg,rgba(253,230,138,.2),rgba(253,230,138,.08))',
                  borderLeft: '2px solid rgba(253,230,138,.65)', borderTop: '2px solid rgba(253,230,138,.65)',
                  borderRight: '2px solid rgba(253,230,138,.65)', borderBottom: '2px solid rgba(253,230,138,.65)',
                  borderRadius: 12, padding: '13px 36px',
                  boxShadow: hov ? '0 0 48px rgba(253,230,138,.55)' : '0 0 28px rgba(253,230,138,.3)',
                  transform: hov ? 'translateY(-2px) scale(1.03)' : 'none',
                  transition: 'all .25s cubic-bezier(.22,1,.36,1)',
                }}
              >
                {isAr ? '✦ اجمع المفتاح الذهبي' : '✦  Collect Golden Key  ✦'}
              </button>
            </>
          ) : (
            <div style={{ animation: 'completion-in .4s ease both', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ filter: 'drop-shadow(0 0 12px rgba(253,230,138,.8))' }}>
                <GoldenKey size={40}/>
              </span>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: isAr ? 14 : 11, color: 'rgba(255,179,230,.7)', letterSpacing: isAr ? 0 : '.26em' }}>
                {isAr ? 'تم جمع المفتاح' : 'Key collected'}
              </p>
              <p style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: 14, color: 'rgba(196,170,255,.55)' }}>
                {isAr ? 'المعرض يكشف أسراره. عد إلى الحديقة.' : 'The gallery reveals its secrets. Return to the garden.'}
              </p>
              <button
                onMouseEnter={() => setHovBack(true)}
                onMouseLeave={() => setHovBack(false)}
                onClick={() => { audio.playReturnGarden(); onBack() }}
                style={{
                  marginTop: 4,
                  fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                  fontSize: isAr ? 15 : 12.5, letterSpacing: isAr ? 0 : '.1em',
                  color: '#c4aaff', cursor: 'pointer',
                  background: hovBack ? 'rgba(196,170,255,.22)' : 'rgba(196,170,255,.1)',
                  border: `1.5px solid ${hovBack ? 'rgba(196,170,255,.7)' : 'rgba(196,170,255,.38)'}`,
                  borderRadius: 10, padding: '11px 32px',
                  boxShadow: hovBack ? '0 0 40px rgba(196,170,255,.5)' : '0 0 20px rgba(196,170,255,.2)',
                  transform: hovBack ? 'translateY(-2px) scale(1.03)' : 'none',
                  transition: 'all .25s cubic-bezier(.22,1,.36,1)',
                }}
              >
                {isAr ? 'العودة إلى الحديقة →' : '← Back to Garden'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    {activeCert && <CertModal cert={activeCert} isAr={isAr} onClose={() => setActiveCert(null)}/>}
    </>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'play' | 'complete' | 'done'

export default function LearningGallery({
  guide, onBack, hasKey, butterflies, totalKeys, onKeyCollected, onMainMenu, onReset,
}: {
  guide: GuideChoice; onBack: () => void; hasKey: boolean
  butterflies: number; totalKeys: number; onKeyCollected: () => void
  onMainMenu: () => void; onReset: () => void
}) {
  const { t, isAr } = useLang()

  const [phase,        setPhase]       = useState<Phase>(hasKey ? 'done' : 'intro')
  const [cards,        setCards]       = useState<CardDef[]>(() => hasKey ? [] : buildCards())
  const [flipped,      setFlipped]     = useState<string[]>([])   // up to 2 face-up ids
  const [matched,      setMatched]     = useState<string[]>(hasKey ? PAIR_DEFS.map(p => p.pairId) : [])
  const [isChecking,   setIsChecking]  = useState(false)
  const [shakingIds,   setShakingIds]  = useState<string[]>([])
  const [keyCollected, setKeyCollected] = useState(hasKey)
  const [showInv,      setShowInv]     = useState(false)
  const [showHint,     setShowHint]    = useState(false)
  const [toast,        setToast]       = useState<{ msg: string; ok: boolean } | null>(null)
  const toastRef = useRef<number>(undefined)

  useEffect(() => {
    audio.startAmbient('gallery')
    return () => audio.stopAmbient()
  }, [])

  const showToastMsg = useCallback((msg: string, ok: boolean) => {
    clearTimeout(toastRef.current)
    setToast({ msg, ok })
    toastRef.current = window.setTimeout(() => setToast(null), 2000)
  }, [])

  const handleCardClick = useCallback((card: CardDef) => {
    if (phase !== 'play' || isChecking) return
    if (matched.includes(card.pairId)) return
    if (flipped.includes(card.id)) return
    if (flipped.length >= 2) return

    const newFlipped = [...flipped, card.id]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setIsChecking(true)
      const [id1, id2] = newFlipped
      const c1 = cards.find(c => c.id === id1)!
      const c2 = cards.find(c => c.id === id2)!

      if (c1.pairId === c2.pairId) {
        // Match!
        audio.playCorrect()
        setTimeout(() => audio.playShimmer(), 280)
        setTimeout(() => {
          setMatched(prev => {
            const next = [...prev, c1.pairId]
            if (next.length === PAIR_DEFS.length) {
              setTimeout(() => { audio.playPuzzleComplete(); setPhase('complete') }, 400)
            }
            return next
          })
          setFlipped([])
          setIsChecking(false)
          showToastMsg(isAr ? `✓ ${t.lg_matchFound}` : t.lg_matchFound, true)
        }, 700)
      } else {
        // No match
        audio.playIncorrect()
        setShakingIds([id1, id2])
        setTimeout(() => {
          setFlipped([])
          setShakingIds([])
          setIsChecking(false)
          showToastMsg(t.lg_notMatch, false)
        }, 1000)
      }
    }
  }, [phase, isChecking, flipped, matched, cards, isAr, t, showToastMsg])

  const handleCollectKey = useCallback(() => {
    setKeyCollected(true)
    onKeyCollected()
    setTimeout(() => setPhase('done'), 1600)
  }, [onKeyCollected])

  const matchedCount = matched.length

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#0d0820' }}>
      <GalleryScene/>

      {[...Array(8)].map((_,i) => (
        <div key={i} className="particle" style={{
          position: 'absolute', left: `${(i*163+32)%100}%`, top: `${(i*89+22)%68}%`,
          width: 3, height: 3, borderRadius: '50%', zIndex: 2, pointerEvents: 'none',
          background: i%3===0?'rgba(200,177,228,.55)':i%3===1?'rgba(249,168,212,.45)':'rgba(253,230,138,.4)',
          '--drift': `${(i%5-2)*18}px`, animationDelay: `${i*.45}s`,
        } as React.CSSProperties}/>
      ))}

      {/* ── Main content ── */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        top: 70, bottom: 14, zIndex: 10, width: 'min(900px,88vw)',
        display: 'flex', flexDirection: 'column', gap: 10,
        overflowY: 'auto', padding: '8px 4px 12px',
      }}>

        {/* Room title */}
        <div style={{ textAlign: 'center', paddingBottom: 2 }}>
          <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif",
            fontSize: isAr ? 23 : 21, color: 'rgba(220,200,255,.88)', marginBottom: 4 }}>
            {isAr ? 'معرض التعلّم' : 'The Learning Gallery'}
          </h2>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic',
            fontSize: 13, color: 'rgba(200,177,228,.5)' }}>
            {t.lg_subtitle}
          </p>
        </div>

        {/* Instruction strip */}
        {phase === 'play' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(200,177,228,.2))' }}/>
            <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
              fontSize: 10.5, color: 'rgba(200,177,228,.5)', letterSpacing: isAr ? 0 : '.18em', flexShrink: 0 }}>
              {isAr ? 'اقلب البطاقات وابحث عن الأزواج المتطابقة' : 'FLIP CARDS · MATCH EACH CERTIFICATE TO ITS TOPIC'}
            </p>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(200,177,228,.2),transparent)' }}/>
          </div>
        )}

        {/* Card grid — 5×2 */}
        {phase !== 'done' && cards.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
            {cards.map(card => {
              const pairText = t.lg_pairs[card.pairIndex]
              return (
                <MemoryCard
                  key={card.id}
                  card={card}
                  isFlipped={flipped.includes(card.id)}
                  isMatched={matched.includes(card.pairId)}
                  isShaking={shakingIds.includes(card.id)}
                  onClick={() => handleCardClick(card)}
                  isAr={isAr}
                  certText={pairText?.cert ?? ''}
                  topicText={pairText?.topic ?? ''}
                />
              )
            })}
          </div>
        )}

        {/* Done revisit state */}
        {phase === 'done' && (
          <div style={{ padding: '18px 28px', borderRadius: 14,
            background: 'rgba(5,1,18,.85)', backdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(200,177,228,.22)', borderTop: '1px solid rgba(200,177,228,.22)',
            borderRight: '1px solid rgba(200,177,228,.22)', borderBottom: '1px solid rgba(200,177,228,.22)',
            textAlign: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <span style={{ filter: 'drop-shadow(0 0 10px rgba(253,230,138,.6))' }}><GoldenKey size={32}/></span>
            </div>
            <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: isAr ? 14 : 11, color: 'rgba(200,177,228,.75)', letterSpacing: isAr ? 0 : '.22em', marginBottom: 6 }}>
              {t.lg_keyCollected}
            </p>
            <p style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: 14, color: 'rgba(196,170,255,.55)', lineHeight: 1.6 }}>
              {isAr ? 'الأزواج مكتشفة. معرض التعلّم مكتمل.' : 'All pairs revealed. The Learning Gallery is complete.'}
            </p>
          </div>
        )}
      </div>

      {/* Intro overlay */}
      {phase === 'intro' && <CompanionIntro guide={guide} room="gallery" onStart={() => setPhase('play')}/>}

      {/* HUD */}
      <HUD guide={guide} totalKeys={totalKeys} butterflies={butterflies}
        matchedCount={matchedCount}
        onBack={() => { audio.playReturnGarden(); onBack() }}
        onInventory={() => setShowInv(true)}
        onMainMenu={onMainMenu} onReset={onReset} onHint={() => setShowHint(true)}/>

      {showHint && <HintOverlay onClose={() => setShowHint(false)} isAr={isAr}
        hintEn="Flip two cards at a time. Match each certificate name to its topic area."
        hintAr="اقلب بطاقتين في كل مرة. طابق كل اسم شهادة مع مجال موضوعها." />}

      {/* Toast */}
      {toast && (
        <div className="animate-toast" style={{
          position: 'fixed', top: 76, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(5,1,18,.97)', backdropFilter: 'blur(18px)',
          borderLeft: `1px solid ${toast.ok?'rgba(200,177,228,.55)':'rgba(249,168,212,.45)'}`,
          borderTop: `1px solid ${toast.ok?'rgba(200,177,228,.55)':'rgba(249,168,212,.45)'}`,
          borderRight: `1px solid ${toast.ok?'rgba(200,177,228,.55)':'rgba(249,168,212,.45)'}`,
          borderBottom: `1px solid ${toast.ok?'rgba(200,177,228,.55)':'rgba(249,168,212,.45)'}`,
          borderRadius: 12, padding: '10px 22px', zIndex: 52, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 30px rgba(0,0,0,.7)',
        }}>
          <span style={{ fontSize: 14 }}>{toast.ok ? '✓' : '⚠'}</span>
          <p style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: 13,
            color: toast.ok ? 'rgba(200,177,228,.9)' : 'rgba(249,168,212,.8)' }}>
            {toast.msg}
          </p>
        </div>
      )}

      {/* Inventory */}
      {showInv && <InventoryPanel totalKeys={totalKeys} butterflies={butterflies} onClose={() => { audio.playInventoryClose(); setShowInv(false) }}/>}

      {/* Completion overlay */}
      {phase === 'complete' && (
        <CompletionOverlay
          onCollect={handleCollectKey}
          collected={keyCollected}
          isAr={isAr}
          pairDefs={PAIR_DEFS}
          pairs={t.lg_pairs}
          onBack={() => { audio.playReturnGarden(); onBack() }}
        />
      )}
    </div>
  )
}
