import React, { useState, useCallback, useEffect, useRef } from 'react'
import type { GuideChoice } from './GardenHub'
import { audio } from './sound/engine'
import { useLang, InlineControls } from './LangContext'
import GoldenKey from './GoldenKey'
import { CompanionIntro, CompanionFace } from './CompanionIntro'

// ─── Group data ────────────────────────────────────────────────────────────────
interface GroupDef {
  id: string; en: string; ar: string; accent: string
  tiles: { en: string; ar: string; keepEn?: boolean }[]
}

const GROUPS: GroupDef[] = [
  { id: 'ai', en: 'AI Tools', ar: 'أدوات الذكاء الاصطناعي', accent: 'gold',
    tiles: [
      { en: 'ChatGPT',    ar: 'ChatGPT',    keepEn: true },
      { en: 'Gemini',     ar: 'Gemini',     keepEn: true },
      { en: 'Copilot',    ar: 'Copilot',    keepEn: true },
      { en: 'ElevenLabs', ar: 'ElevenLabs', keepEn: true },
    ] },
  { id: 'video', en: 'Video Production', ar: 'إنتاج الفيديو', accent: 'rose',
    tiles: [
      { en: 'Script',     ar: 'كتابة النص' },
      { en: 'Voice-over', ar: 'التعليق الصوتي' },
      { en: 'Editing',    ar: 'المونتاج' },
      { en: 'Visuals',    ar: 'المحتوى البصري' },
    ] },
  { id: 'business', en: 'Business Concepts', ar: 'مفاهيم الأعمال', accent: 'lavender',
    tiles: [
      { en: 'Marketing',          ar: 'التسويق' },
      { en: 'Accounting',         ar: 'المحاسبة' },
      { en: 'Strategy',           ar: 'الاستراتيجية' },
      { en: 'Project Management', ar: 'إدارة المشاريع' },
    ] },
  { id: 'skills', en: 'Skills', ar: 'المهارات', accent: 'mint',
    tiles: [
      { en: 'Research',        ar: 'البحث' },
      { en: 'Creativity',      ar: 'الإبداع' },
      { en: 'Analysis',        ar: 'التحليل' },
      { en: 'Problem Solving', ar: 'حل المشكلات' },
    ] },
]

const AC: Record<string, { bg: string; border: string; glow: string; text: string; solid: string }> = {
  gold:     { bg: 'rgba(253,230,138,.11)', border: 'rgba(253,230,138,.62)', glow: 'rgba(253,230,138,.48)', text: '#fde68a', solid: 'rgba(253,230,138,.22)' },
  rose:     { bg: 'rgba(249,168,212,.1)',  border: 'rgba(249,168,212,.6)',  glow: 'rgba(249,168,212,.44)', text: '#f9a8d4', solid: 'rgba(249,168,212,.18)' },
  lavender: { bg: 'rgba(196,170,255,.12)', border: 'rgba(196,170,255,.65)', glow: 'rgba(196,170,255,.5)',  text: '#c4aaff', solid: 'rgba(196,170,255,.22)' },
  mint:     { bg: 'rgba(155,114,207,.1)',  border: 'rgba(155,114,207,.58)', glow: 'rgba(155,114,207,.44)', text: '#9b72cf', solid: 'rgba(155,114,207,.18)' },
}

interface TileDef { id: string; groupId: string; accent: string; en: string; ar: string; keepEn?: boolean }

function buildTiles(): TileDef[] {
  const arr: TileDef[] = []
  GROUPS.forEach(g => g.tiles.forEach((td, i) =>
    arr.push({ id: `${g.id}-${i}`, groupId: g.id, accent: g.accent, en: td.en, ar: td.ar, keepEn: td.keepEn })
  ))
  return shuf(arr)
}

function shuf<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]]
  }
  return r
}

// ─── Scene ─────────────────────────────────────────────────────────────────────
function WorkshopInsightScene() {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
      viewBox="0 0 1440 768" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wiBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#030614"/>
          <stop offset="40%"  stopColor="#07102a"/>
          <stop offset="75%"  stopColor="#0f041e"/>
          <stop offset="100%" stopColor="#080212"/>
        </linearGradient>
        <radialGradient id="wiAmb1" cx="20%" cy="50%" r="55%">
          <stop offset="0%"   stopColor="rgba(196,170,255,.12)"/>
          <stop offset="100%" stopColor="rgba(196,170,255,0)"/>
        </radialGradient>
        <radialGradient id="wiAmb2" cx="80%" cy="45%" r="55%">
          <stop offset="0%"   stopColor="rgba(249,168,212,.09)"/>
          <stop offset="100%" stopColor="rgba(249,168,212,0)"/>
        </radialGradient>
        <radialGradient id="wiAmb3" cx="50%" cy="20%" r="50%">
          <stop offset="0%"   stopColor="rgba(253,230,138,.07)"/>
          <stop offset="100%" stopColor="rgba(253,230,138,0)"/>
        </radialGradient>
        <filter id="wiBlur6"><feGaussianBlur stdDeviation="6"/></filter>
        <filter id="wiBlur18"><feGaussianBlur stdDeviation="18"/></filter>
        <filter id="wiGlow5"><feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="1440" height="768" fill="url(#wiBg)"/>
      <rect width="1440" height="768" fill="url(#wiAmb1)"/>
      <rect width="1440" height="768" fill="url(#wiAmb2)"/>
      <rect width="1440" height="768" fill="url(#wiAmb3)"/>

      {/* Ceiling */}
      <rect x="0" y="0" width="1440" height="52" fill="rgba(4,1,18,.95)"/>
      <rect x="0" y="48" width="1440" height="4" fill="rgba(196,170,255,.18)" filter="url(#wiBlur6)"/>
      {[...Array(9)].map((_,i) => (
        <rect key={i} x={i*160+10} y="4" width="140" height="38" rx="3"
          fill="rgba(196,170,255,.04)" stroke="rgba(196,170,255,.1)" strokeWidth="1"/>
      ))}
      {[180,420,720,1020,1260].map((x,i) => (
        <ellipse key={i} cx={x} cy="60" rx={60+i%2*20} ry="80" fill="rgba(155,114,207,.07)" filter="url(#wiBlur18)" opacity=".65"/>
      ))}

      {/* Left pillar */}
      <rect x="0" y="52" width="180" height="716" fill="rgba(3,0,12,.88)" stroke="rgba(196,170,255,.16)" strokeWidth="1"/>
      {/* Connection nodes on pillars */}
      {[160,280,400,520,640].map((y,i) => (
        <g key={i}>
          <circle cx={90} cy={y} r="8" fill={['rgba(253,230,138,.35)','rgba(196,170,255,.35)','rgba(249,168,212,.35)','rgba(155,114,207,.35)','rgba(253,230,138,.28)'][i]} filter="url(#wiGlow5)"/>
          <circle cx={1350} cy={y} r="8" fill={['rgba(249,168,212,.35)','rgba(253,230,138,.35)','rgba(196,170,255,.35)','rgba(253,230,138,.28)','rgba(155,114,207,.35)'][i]} filter="url(#wiGlow5)"/>
          {i < 4 && <>
            <line x1="90" y1={y} x2="90" y2={y+120} stroke="rgba(196,170,255,.14)" strokeWidth="1" strokeDasharray="4,4"/>
            <line x1="1350" y1={y} x2="1350" y2={y+120} stroke="rgba(196,170,255,.14)" strokeWidth="1" strokeDasharray="4,4"/>
          </>}
        </g>
      ))}
      {/* Right pillar */}
      <rect x="1260" y="52" width="180" height="716" fill="rgba(3,0,12,.88)" stroke="rgba(196,170,255,.16)" strokeWidth="1"/>

      {/* Floor */}
      <rect x="0" y="692" width="1440" height="76" fill="rgba(4,0,14,.92)"/>
      <rect x="0" y="690" width="1440" height="3" fill="rgba(196,170,255,.14)" filter="url(#wiBlur6)"/>
      {[...Array(13)].map((_,i) => (
        <line key={i} x1={i*120} y1="692" x2={i*120} y2="768" stroke="rgba(196,170,255,.06)" strokeWidth="1"/>
      ))}

      {/* Sparkles */}
      {[...Array(28)].map((_,i) => (
        <circle key={i}
          cx={(i*211+67)%1440} cy={(i*137+55)%640}
          r={i%5===0?2:i%3===0?1.5:1}
          fill={i%4===0?'#fde68a':i%4===1?'#c4aaff':i%4===2?'#f9a8d4':'#9b72cf'}
          opacity={.18+i%3*.14}
          className="animate-star-twinkle"
          style={{animationDelay:`${(i*.21)%3.5}s`}}/>
      ))}
    </svg>
  )
}

// ─── Solved group banner ───────────────────────────────────────────────────────
function SolvedBanner({ group, isAr }: { group: GroupDef; isAr: boolean }) {
  const c = AC[group.accent]
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px',
      borderRadius: 12, animation: 'completion-in .45s cubic-bezier(.22,1,.36,1) both',
      background: c.solid,
      borderLeft: `1.5px solid ${c.border}`, borderTop: `1.5px solid ${c.border}`,
      borderRight: `1.5px solid ${c.border}`, borderBottom: `1.5px solid ${c.border}`,
      boxShadow: `0 0 24px ${c.glow}44, 0 4px 16px rgba(0,0,0,.4)`,
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
        fontSize: 9, letterSpacing: isAr ? 0 : '.15em',
        color: c.text, fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap',
      }}>
        {isAr ? group.ar : group.en}
      </span>
      <div style={{ flex: 1, height: 1, background: `${c.border}55` }}/>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {group.tiles.map((t, i) => (
          <span key={i} style={{
            fontFamily: isAr && !t.keepEn ? "'Nunito',sans-serif" : "'Cinzel',serif",
            fontSize: isAr && !t.keepEn ? 12 : 10.5,
            color: c.text, opacity: .88,
            letterSpacing: isAr && !t.keepEn ? 0 : '.04em',
          }}>
            {isAr && !t.keepEn ? t.ar : t.en}
          </span>
        ))}
      </div>
      <span style={{ fontSize: 14, color: c.text, flexShrink: 0, filter: `drop-shadow(0 0 6px ${c.glow})` }}>✓</span>
    </div>
  )
}

// ─── Tile card ─────────────────────────────────────────────────────────────────
function TileCard({
  tile, selected, shaking, onClick, isAr,
}: {
  tile: TileDef; selected: boolean; shaking: boolean; onClick: () => void; isAr: boolean
}) {
  const [hov, setHov] = useState(false)
  const c = AC[tile.accent]
  const label = isAr && !tile.keepEn ? tile.ar : tile.en
  const isArabicLabel = isAr && !tile.keepEn

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => { setHov(true); audio.playHover() }}
      onMouseLeave={() => setHov(false)}
      className={shaking ? 'animate-tile-shake' : ''}
      style={{
        padding: '14px 12px', borderRadius: 12,
        cursor: 'pointer', userSelect: 'none',
        textAlign: 'center',
        background: selected ? c.bg : hov ? 'rgba(196,170,255,.09)' : 'rgba(8,3,22,.88)',
        borderLeft: `1.5px solid ${selected ? c.border : hov ? 'rgba(196,170,255,.38)' : 'rgba(196,170,255,.2)'}`,
        borderTop: `1.5px solid ${selected ? c.border : hov ? 'rgba(196,170,255,.38)' : 'rgba(196,170,255,.2)'}`,
        borderRight: `1.5px solid ${selected ? c.border : hov ? 'rgba(196,170,255,.38)' : 'rgba(196,170,255,.2)'}`,
        borderBottom: `1.5px solid ${selected ? c.border : hov ? 'rgba(196,170,255,.38)' : 'rgba(196,170,255,.2)'}`,
        boxShadow: selected ? `0 0 20px ${c.glow}66, 0 4px 16px rgba(0,0,0,.4)` : hov ? '0 0 24px rgba(255,179,230,.35), 0 0 40px rgba(196,170,255,.18), 0 4px 16px rgba(0,0,0,.4)' : 'none',
        transform: selected ? 'scale(1.03)' : hov ? 'scale(1.01) translateY(-1px)' : 'none',
        transition: 'all .22s cubic-bezier(.34,1.2,.64,1)',
        minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <span style={{
        fontFamily: isArabicLabel ? "'Nunito',sans-serif" : "'Cinzel',serif",
        fontSize: isArabicLabel ? 14 : (label.length > 14 ? 10.5 : 12.5),
        color: selected ? c.text : 'rgba(221,205,255,.88)',
        letterSpacing: isArabicLabel ? 0 : '.04em',
        lineHeight: 1.35, fontWeight: isArabicLabel ? 600 : undefined,
      }}>
        {label}
      </span>
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
function HUD({ guide, totalKeys, butterflies, solvedCount, mistakes, onBack, onInventory, onMainMenu, onReset, onHint }: {
  guide: GuideChoice; totalKeys: number; butterflies: number
  solvedCount: number; mistakes: number
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

      <button onClick={() => { audio.playReturnGarden(); onBack() }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 18px rgba(196,170,255,.45)'; e.currentTarget.style.borderColor='rgba(196,170,255,.65)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(196,170,255,.3)' }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
          background: 'rgba(139,92,246,.14)', border: '1px solid rgba(196,170,255,.3)',
          borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
          fontSize: 10.5, color: 'rgba(196,170,255,.82)', letterSpacing: isAr ? 0 : '.06em',
          transition: 'all .2s' }}>
        {t.back}
      </button>

      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%',
          background: isMan ? 'linear-gradient(135deg,#1a1568,#4535c0)' : 'linear-gradient(135deg,#7b2fb0,#c060c0)',
          border: '1.5px solid rgba(253,230,138,.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          boxShadow: '0 0 16px rgba(139,92,246,.5)' }}>
          <CompanionFace guide={guide} size={60} idPrefix="wk_hud" />
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: 'rgba(196,170,255,.18)', flexShrink: 0 }}/>

      <div style={{ flexShrink: 0 }}>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 8, color: 'rgba(196,170,255,.55)', letterSpacing: isAr ? 0 : '.18em', marginBottom: 1 }}>{isAr ? 'الغرفة الحالية' : 'NOW IN'}</p>
        <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: 13, color: 'rgba(221,205,255,.9)' }}>
          {isAr ? 'ورشة الروابط' : 'The Insight Workshop'}
        </h2>
      </div>

      <div style={{ flex: 1 }}/>

      {/* Groups progress */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, color: 'rgba(196,170,255,.7)', letterSpacing: '.12em' }}>
          {isAr ? 'المجموعات' : 'GROUPS'}
        </p>
        <div style={{ display: 'flex', gap: 5 }}>
          {GROUPS.map((g, i) => {
            const solved = i < solvedCount
            const c = AC[g.accent]
            return (
              <div key={g.id} style={{
                width: 22, height: 22, borderRadius: 6, transition: 'all .35s',
                background: solved ? c.bg : 'rgba(196,170,255,.07)',
                borderLeft: `1.5px solid ${solved ? c.border : 'rgba(196,170,255,.2)'}`,
                borderTop: `1.5px solid ${solved ? c.border : 'rgba(196,170,255,.2)'}`,
                borderRight: `1.5px solid ${solved ? c.border : 'rgba(196,170,255,.2)'}`,
                borderBottom: `1.5px solid ${solved ? c.border : 'rgba(196,170,255,.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9,
                boxShadow: solved ? `0 0 10px ${c.glow}66` : 'none',
              }}>
                {solved && <span style={{ color: c.text }}>✓</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: 'rgba(196,170,255,.18)', flexShrink: 0 }}/>

      {/* Mistakes */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <p style={{ fontFamily: "'Cinzel',serif", fontSize: 7.5, color: 'rgba(249,168,212,.7)', letterSpacing: '.1em' }}>
          {isAr ? 'المحاولات' : 'MISTAKES'}
        </p>
        <div style={{ display: 'flex', gap: 5 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%', transition: 'all .35s',
              background: i < mistakes ? 'rgba(249,168,212,.75)' : 'rgba(196,170,255,.12)',
              borderLeft: `1px solid ${i < mistakes ? 'rgba(249,168,212,.6)' : 'rgba(196,170,255,.2)'}`,
              borderTop: `1px solid ${i < mistakes ? 'rgba(249,168,212,.6)' : 'rgba(196,170,255,.2)'}`,
              borderRight: `1px solid ${i < mistakes ? 'rgba(249,168,212,.6)' : 'rgba(196,170,255,.2)'}`,
              borderBottom: `1px solid ${i < mistakes ? 'rgba(249,168,212,.6)' : 'rgba(196,170,255,.2)'}`,
              boxShadow: i < mistakes ? '0 0 6px rgba(249,168,212,.5)' : 'none',
            }}/>
          ))}
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: 'rgba(196,170,255,.18)', flexShrink: 0 }}/>

      <div style={{ display: 'flex', gap: 12, flexShrink: 0, alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 7.5, color: 'rgba(253,230,138,.58)', letterSpacing: isAr ? 0 : '.08em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
            <GoldenKey size={11}/> {isAr ? 'المفاتيح' : 'KEYS'}
          </p>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, color: '#fde68a', fontWeight: 700 }}>{totalKeys}/5</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 7.5, color: 'rgba(196,170,255,.58)', letterSpacing: isAr ? 0 : '.08em', marginBottom: 2 }}>🦋 {isAr ? 'الفراشات' : 'FOUND'}</p>
          <p style={{ fontFamily: "'Nunito',sans-serif", fontSize: 14, color: '#c4aaff', fontWeight: 700 }}>{butterflies}</p>
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: 'rgba(196,170,255,.18)', flexShrink: 0 }}/>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={() => { audio.playInventoryOpen(); onInventory() }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 16px rgba(253,230,138,.4)'; e.currentTarget.style.borderColor='rgba(253,230,138,.65)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(253,230,138,.3)' }}
          style={{
            background: 'rgba(253,230,138,.1)', border: '1px solid rgba(253,230,138,.3)',
            borderRadius: 8, padding: '6px 13px', cursor: 'pointer', transition: 'all .2s',
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10.5, color: 'rgba(253,230,138,.82)', letterSpacing: isAr ? 0 : '.05em' }}>
          ⊞ {isAr ? 'العناصر' : 'Items'}
        </button>
        <button onClick={() => { audio.playReturnGarden(); onMainMenu() }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 14px rgba(253,230,138,.38)'; e.currentTarget.style.borderColor='rgba(253,230,138,.7)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(253,230,138,.4)' }}
          style={{
            background: 'rgba(253,230,138,.12)', border: '1px solid rgba(253,230,138,.4)',
            borderRadius: 7, padding: '6px 11px', cursor: 'pointer', transition: 'all .2s',
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
            fontSize: 9.5, color: 'rgba(253,230,138,.9)', letterSpacing: isAr ? 0 : '.05em', whiteSpace: 'nowrap' }}>
          {t.mainMenu}
        </button>
        <button onClick={onReset}
          onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 13px rgba(249,168,212,.35)'; e.currentTarget.style.borderColor='rgba(249,168,212,.55)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(249,168,212,.28)' }}
          style={{
            background: 'rgba(249,168,212,.08)', border: '1px solid rgba(249,168,212,.28)',
            borderRadius: 7, padding: '6px 11px', cursor: 'pointer', transition: 'all .2s',
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
            <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: 18, color: '#fde68a', fontWeight: isAr ? 700 : undefined }}>
              {isAr ? 'المستكشف' : 'Inventory'}
            </h2>
          </div>
          <button onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.color='rgba(249,168,212,.9)'; e.currentTarget.style.textShadow='0 0 12px rgba(249,168,212,.55)' }}
            onMouseLeave={e => { e.currentTarget.style.color='rgba(196,170,255,.55)'; e.currentTarget.style.textShadow='none' }}
            style={{ background: 'none', border: 'none', color: 'rgba(196,170,255,.55)', cursor: 'pointer', fontSize: 24, transition: 'all .2s' }}>×</button>
        </div>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(196,170,255,.1)', display: 'flex', gap: 16 }}>
          {([[totalKeys, isAr?'المفاتيح':'Keys','rgba(253,230,138,.06)','rgba(253,230,138,.22)','#fde68a'],
            [butterflies, isAr?'الفراشات':'Butterflies','rgba(196,170,255,.06)','rgba(196,170,255,.22)','#c4aaff']] as [number,string,string,string,string][]).map(([val,lbl,bg,bd,col]) => (
            <div key={lbl} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRadius: 10,
              background: bg, border: `1px solid ${bd}` }}>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: 22, color: col, fontWeight: isAr ? 700 : undefined }}>{val}</p>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 7.5, color: `${col}99`, letterSpacing: isAr ? 0 : '.15em' }}>{lbl}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: '18px 24px', flex: 1 }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 8.5, color: 'rgba(196,170,255,.55)', letterSpacing: isAr ? 0 : '.18em', marginBottom: 14 }}>{isAr ? 'مفاتيح الغرف' : 'ROOM KEYS'}</p>
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
                    <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10, color: unlocked ? c : 'rgba(196,170,255,.35)', marginBottom: 2 }}>
                      {names[i]}
                    </p>
                    <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 9.5, color: unlocked ? `${c}88` : 'rgba(196,170,255,.25)' }}>
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

// ─── Completion overlay ────────────────────────────────────────────────────────
function CompletionOverlay({ onCollect, collected, isAr, onBack }: {
  onCollect: () => void; collected: boolean; isAr: boolean; onBack: () => void
}) {
  const [hov, setHov] = useState(false)
  const [hovBack, setHovBack] = useState(false)
  const badgeColors = ['#fde68a', '#f9a8d4', '#c4aaff', '#9b72cf']

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40,
      background: 'rgba(2,0,10,.9)', backdropFilter: 'blur(20px)',
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
            return (
              <div key={i} className="animate-star-twinkle" style={{ animationDelay: `${i*.2}s`,
                position: 'absolute', left: 45 + 40*Math.cos(a)-5, top: 45 + 40*Math.sin(a)-5 }}>
                <svg width="10" height="10" viewBox="0 0 12 12">
                  <polygon points="6,0 7.4,4.2 12,4.2 8.5,6.8 9.7,11 6,8.5 2.3,11 3.5,6.8 0,4.2 4.6,4.2"
                    fill={badgeColors[i%4]}/>
                </svg>
              </div>
            )
          })}
          <div style={{ width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg,rgba(253,230,138,.28),rgba(196,170,255,.12))',
            borderLeft: '2px solid rgba(253,230,138,.7)', borderTop: '2px solid rgba(253,230,138,.7)',
            borderRight: '2px solid rgba(253,230,138,.7)', borderBottom: '2px solid rgba(253,230,138,.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(253,230,138,.45)' }}>
            <GoldenKey size={28}/>
          </div>
        </div>

        <div>
          <p style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: 'rgba(253,230,138,.6)', letterSpacing: '.28em', marginBottom: 6 }}>
            {isAr ? 'ورشة الروابط' : 'THE INSIGHT WORKSHOP'}
          </p>
          <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif",
            fontSize: isAr ? 26 : 28, lineHeight: 1.2,
            background: 'linear-gradient(135deg,#fde68a,#c4aaff,#9b72cf)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            {isAr ? 'انكشفت الملامح الأساسية' : 'Core Strengths Revealed'}
          </h2>
        </div>

        {/* Summary text */}
        <div style={{ padding: '16px 24px', borderRadius: 14, maxWidth: 500,
          background: 'rgba(5,1,18,.85)', backdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(196,170,255,.22)', borderTop: '1px solid rgba(196,170,255,.22)',
          borderRight: '1px solid rgba(196,170,255,.22)', borderBottom: '1px solid rgba(196,170,255,.22)' }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic',
            fontSize: 13, color: 'rgba(221,205,255,.82)', lineHeight: 1.75, direction: isAr ? 'rtl' : 'ltr',
            textAlign: isAr ? 'right' : 'center' }}>
            {isAr
              ? 'تجمع هذه الورشة بين الأدوات ومسار إنتاج المحتوى والفهم المرتبط بالأعمال والمهارات الأساسية التي تشكّل أسلوبي في العمل. كما تبرز جوانب القوة في البحث والإبداع والتحليل وحل المشكلات.'
              : 'This workshop brings together the tools, production workflow, business understanding, and core skills that shape my work. It highlights strengths in research, creativity, analysis, and problem solving.'}
          </p>
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
                  fontSize: isAr ? 15 : 12.5, letterSpacing: isAr ? 0 : '.14em',
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
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: isAr ? 14 : 9, color: 'rgba(255,179,230,.7)', letterSpacing: isAr ? 0 : '.26em' }}>
                {isAr ? 'تم جمع المفتاح' : 'Key collected'}
              </p>
              <p style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: 12, color: 'rgba(196,170,255,.55)' }}>
                {isAr ? 'الروابط مكتشفة. ورشة الروابط مكتملة.' : 'The connections are revealed. The Insight Workshop is complete.'}
              </p>
            </div>
          )}
        </div>

        {/* Back to Garden */}
        <button
          onMouseEnter={() => setHovBack(true)}
          onMouseLeave={() => setHovBack(false)}
          onClick={onBack}
          style={{
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
            fontSize: isAr ? 15 : 12, letterSpacing: isAr ? 0 : '.1em',
            color: hovBack ? 'rgba(221,205,255,.98)' : 'rgba(196,170,255,.85)',
            cursor: 'pointer',
            background: hovBack ? 'rgba(139,92,246,.28)' : 'rgba(139,92,246,.14)',
            border: `1.5px solid rgba(196,170,255,${hovBack ? '.65' : '.38'})`,
            borderRadius: 12, padding: '12px 40px',
            boxShadow: hovBack ? '0 0 32px rgba(196,170,255,.42), 0 0 64px rgba(196,170,255,.16)' : '0 0 14px rgba(196,170,255,.18)',
            transform: hovBack ? 'translateY(-2px)' : 'none',
            transition: 'all .25s cubic-bezier(.22,1,.36,1)',
          }}
        >
          {isAr ? 'العودة إلى الحديقة →' : '← Back to Garden'}
        </button>
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
type Phase = 'intro' | 'play' | 'complete' | 'done'

export default function Workshop({
  guide, onBack, hasKey, butterflies, totalKeys, onKeyCollected, onMainMenu, onReset,
}: {
  guide: GuideChoice; onBack: () => void; hasKey: boolean
  butterflies: number; totalKeys: number; onKeyCollected: () => void
  onMainMenu: () => void; onReset: () => void
}) {
  const { isAr } = useLang()

  const allSolvedInitial = hasKey ? GROUPS.map(g => g.id) : []
  const [phase,        setPhase]       = useState<Phase>(hasKey ? 'done' : 'intro')
  const [tiles,        setTiles]       = useState<TileDef[]>(() => hasKey ? [] : buildTiles())
  const [selected,     setSelected]    = useState<Set<string>>(new Set())
  const [solvedIds,    setSolvedIds]   = useState<string[]>(allSolvedInitial)
  const [mistakes,     setMistakes]    = useState(4)
  const [shaking,      setShaking]     = useState(false)
  const [keyCollected, setKeyCollected] = useState(hasKey)
  const [showInv,      setShowInv]     = useState(false)
  const [showHint,     setShowHint]    = useState(false)
  const [toast,        setToast]       = useState<{ msg: string; ok: boolean } | null>(null)
  const toastRef = useRef<number>(undefined)

  useEffect(() => {
    audio.startAmbient('workshop')
    return () => audio.stopAmbient()
  }, [])

  const solvedGroups = GROUPS.filter(g => solvedIds.includes(g.id))
  const activeTiles  = tiles.filter(tile => !solvedIds.includes(tile.groupId))

  const showToastMsg = useCallback((msg: string, ok: boolean) => {
    clearTimeout(toastRef.current)
    setToast({ msg, ok })
    toastRef.current = window.setTimeout(() => setToast(null), 2200)
  }, [])

  const handleTileClick = useCallback((id: string) => {
    if (phase !== 'play') return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); return next }
      if (next.size >= 4) return prev
      next.add(id)
      return next
    })
  }, [phase])

  const handleShuffle = useCallback(() => {
    if (phase !== 'play') return
    audio.playHover()
    setTiles(prev => [...solvedIds.flatMap(sid => {
      const g = GROUPS.find(gg => gg.id === sid)!
      return g.tiles.map((td, i) => ({ id: `${g.id}-${i}`, groupId: g.id, accent: g.accent, en: td.en, ar: td.ar, keepEn: td.keepEn }))
    }), ...shuf(prev.filter(tile => !solvedIds.includes(tile.groupId)))])
    setSelected(new Set())
  }, [phase, solvedIds])

  const handleClear = useCallback(() => {
    setSelected(new Set())
  }, [])

  const handleSubmit = useCallback(() => {
    if (phase !== 'play' || selected.size !== 4) return
    const ids = [...selected]
    const groupId = tiles.find(tile => tile.id === ids[0])?.groupId
    const allSame = groupId && ids.every(id => tiles.find(tile => tile.id === id)?.groupId === groupId)

    if (allSame && groupId) {
      audio.playCorrect()
      setTimeout(() => audio.playShimmer(), 280)
      setSolvedIds(prev => {
        const next = [...prev, groupId]
        if (next.length === 4) {
          setTimeout(() => { audio.playPuzzleComplete(); setPhase('complete') }, 600)
        }
        return next
      })
      setSelected(new Set())
      const g = GROUPS.find(gg => gg.id === groupId)!
      showToastMsg(isAr ? `✓ ${g.ar}` : `✓ ${g.en}`, true)
    } else {
      audio.playIncorrect()
      setShaking(true)
      setTimeout(() => setShaking(false), 600)
      setMistakes(prev => Math.max(0, prev - 1))
      setSelected(new Set())
      showToastMsg(isAr ? 'حاول مرة أخرى' : 'Try Again', false)
    }
  }, [phase, selected, tiles, isAr, showToastMsg])

  const handleCollectKey = useCallback(() => {
    setKeyCollected(true)
    onKeyCollected()
    setTimeout(() => setPhase('done'), 1600)
  }, [onKeyCollected])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative', background: '#030614' }}>
      <WorkshopInsightScene/>

      {[...Array(10)].map((_,i) => (
        <div key={i} className="particle" style={{
          position: 'absolute', left: `${(i*167+28)%100}%`, top: `${(i*91+18)%72}%`,
          width: 3, height: 3, borderRadius: '50%', zIndex: 2, pointerEvents: 'none',
          background: i%3===0?'rgba(253,230,138,.5)':i%3===1?'rgba(196,170,255,.45)':'rgba(255,179,230,.4)',
          '--drift': `${(i%5-2)*20}px`, animationDelay: `${i*.4}s`,
        } as React.CSSProperties}/>
      ))}

      {/* ── Main scroll area ── */}
      <div style={{
        position: 'absolute', left: '50%', transform: 'translateX(-50%)',
        top: 70, bottom: 14, zIndex: 10, width: 'min(920px,90vw)',
        display: 'flex', flexDirection: 'column', gap: 10,
        overflowY: 'auto', padding: '8px 4px 12px',
      }}>

        {/* Room title strip */}
        <div style={{ textAlign: 'center', paddingBottom: 4 }}>
          <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif",
            fontSize: isAr ? 20 : 18, color: 'rgba(221,205,255,.88)', marginBottom: 4 }}>
            {isAr ? 'ورشة الروابط' : 'The Insight Workshop'}
          </h2>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic',
            fontSize: 11, color: 'rgba(196,170,255,.5)' }}>
            {isAr ? 'أدوات وأفكار ومهارات ترتبط بمعنى واضح' : 'Tools, ideas, and skills — connected with intention'}
          </p>
        </div>

        {/* Solved group banners */}
        {solvedGroups.map(g => (
          <SolvedBanner key={g.id} group={g} isAr={isAr}/>
        ))}

        {/* Active tile grid */}
        {phase !== 'done' && activeTiles.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(196,170,255,.18))' }}/>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                fontSize: 8, color: 'rgba(196,170,255,.5)', letterSpacing: isAr ? 0 : '.2em', flexShrink: 0 }}>
                {isAr ? 'كوّن أربع مجموعات من أربع بطاقات' : 'CREATE FOUR GROUPS OF FOUR'}
              </p>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(196,170,255,.18),transparent)' }}/>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {activeTiles.map(tile => (
                <TileCard
                  key={tile.id}
                  tile={tile}
                  selected={selected.has(tile.id)}
                  shaking={shaking && selected.has(tile.id)}
                  onClick={() => handleTileClick(tile.id)}
                  isAr={isAr}
                />
              ))}
            </div>

            {/* Action bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '10px 0', flexWrap: 'wrap',
            }}>
              <button onClick={handleShuffle} style={{
                fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                fontSize: isAr ? 13 : 10.5, letterSpacing: isAr ? 0 : '.1em',
                color: 'rgba(196,170,255,.8)', cursor: 'pointer', padding: '8px 20px', borderRadius: 9,
                background: 'rgba(196,170,255,.08)',
                borderLeft: '1px solid rgba(196,170,255,.28)', borderTop: '1px solid rgba(196,170,255,.28)',
                borderRight: '1px solid rgba(196,170,255,.28)', borderBottom: '1px solid rgba(196,170,255,.28)',
                transition: 'all .2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(196,170,255,.16)'; e.currentTarget.style.color='rgba(196,170,255,.95)' }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(196,170,255,.08)'; e.currentTarget.style.color='rgba(196,170,255,.8)' }}
              >
                {isAr ? 'إعادة الترتيب' : 'Shuffle'}
              </button>

              <button onClick={handleClear} disabled={selected.size === 0}
                onMouseEnter={e => { if (selected.size > 0) { e.currentTarget.style.boxShadow='0 0 18px rgba(255,179,230,.4), 0 0 32px rgba(196,170,255,.2)'; e.currentTarget.style.transform='translateY(-1px)' } }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none' }}
                style={{
                fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                fontSize: isAr ? 13 : 10.5, letterSpacing: isAr ? 0 : '.1em',
                color: selected.size===0 ? 'rgba(196,170,255,.3)' : 'rgba(196,170,255,.8)',
                cursor: selected.size===0 ? 'default' : 'pointer', padding: '8px 20px', borderRadius: 9,
                background: 'rgba(196,170,255,.08)',
                borderLeft: `1px solid ${selected.size===0?'rgba(196,170,255,.12)':'rgba(196,170,255,.28)'}`,
                borderTop: `1px solid ${selected.size===0?'rgba(196,170,255,.12)':'rgba(196,170,255,.28)'}`,
                borderRight: `1px solid ${selected.size===0?'rgba(196,170,255,.12)':'rgba(196,170,255,.28)'}`,
                borderBottom: `1px solid ${selected.size===0?'rgba(196,170,255,.12)':'rgba(196,170,255,.28)'}`,
                transition: 'all .25s cubic-bezier(.22,1,.36,1)',
              }}>
                {isAr ? 'إلغاء التحديد' : 'Clear Selection'}
              </button>

              <button onClick={handleSubmit} disabled={selected.size !== 4} style={{
                fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                fontSize: isAr ? 14 : 11, letterSpacing: isAr ? 0 : '.12em',
                color: selected.size===4 ? '#fde68a' : 'rgba(253,230,138,.3)',
                cursor: selected.size===4 ? 'pointer' : 'default', padding: '8px 28px', borderRadius: 9,
                background: selected.size===4 ? 'rgba(253,230,138,.14)' : 'rgba(253,230,138,.05)',
                borderLeft: `1.5px solid ${selected.size===4?'rgba(253,230,138,.6)':'rgba(253,230,138,.15)'}`,
                borderTop: `1.5px solid ${selected.size===4?'rgba(253,230,138,.6)':'rgba(253,230,138,.15)'}`,
                borderRight: `1.5px solid ${selected.size===4?'rgba(253,230,138,.6)':'rgba(253,230,138,.15)'}`,
                borderBottom: `1.5px solid ${selected.size===4?'rgba(253,230,138,.6)':'rgba(253,230,138,.15)'}`,
                boxShadow: selected.size===4 ? '0 0 18px rgba(253,230,138,.28)' : 'none',
                transition: 'all .2s',
              }}
                onMouseEnter={e => { if (selected.size===4) { e.currentTarget.style.background='rgba(253,230,138,.22)'; e.currentTarget.style.boxShadow='0 0 28px rgba(253,230,138,.45)' } }}
                onMouseLeave={e => { e.currentTarget.style.background=selected.size===4?'rgba(253,230,138,.14)':'rgba(253,230,138,.05)'; e.currentTarget.style.boxShadow=selected.size===4?'0 0 18px rgba(253,230,138,.28)':'none' }}
              >
                {isAr ? 'تأكيد' : 'Submit'}
              </button>

              {selected.size > 0 && (
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: 9, color: 'rgba(196,170,255,.5)', letterSpacing: '.1em' }}>
                  {selected.size}/4
                </span>
              )}
            </div>
          </>
        )}

        {/* Done revisit state */}
        {phase === 'done' && (
          <div style={{ padding: '18px 28px', borderRadius: 14,
            background: 'rgba(5,1,18,.85)', backdropFilter: 'blur(16px)',
            borderLeft: '1px solid rgba(253,230,138,.22)', borderTop: '1px solid rgba(253,230,138,.22)',
            borderRight: '1px solid rgba(253,230,138,.22)', borderBottom: '1px solid rgba(253,230,138,.22)',
            textAlign: 'center', marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <span style={{ filter: 'drop-shadow(0 0 10px rgba(253,230,138,.6))' }}><GoldenKey size={32}/></span>
            </div>
            <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: isAr ? 14 : 9, color: 'rgba(255,179,230,.75)', letterSpacing: isAr ? 0 : '.22em', marginBottom: 6 }}>
              {isAr ? 'تم جمع المفتاح' : 'KEY COLLECTED'}
            </p>
            <p style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: 12.5, color: 'rgba(196,170,255,.55)', lineHeight: 1.6 }}>
              {isAr ? 'لقد كشفت الروابط. ورشة الروابط مكتملة.' : 'The connections are revealed. The Insight Workshop is complete.'}
            </p>
          </div>
        )}
      </div>

      {/* Intro overlay */}
      {phase === 'intro' && <CompanionIntro guide={guide} room="workshop" onStart={() => setPhase('play')}/>}

      {/* HUD */}
      <HUD guide={guide} totalKeys={totalKeys} butterflies={butterflies}
        solvedCount={solvedIds.length} mistakes={mistakes}
        onBack={() => { audio.playReturnGarden(); onBack() }}
        onInventory={() => setShowInv(true)}
        onMainMenu={onMainMenu} onReset={onReset} onHint={() => setShowHint(true)}/>

      {showHint && <HintOverlay onClose={() => setShowHint(false)} isAr={isAr}
        hintEn="Find the connection between the items. Match each card in the left column to its pair in the right column."
        hintAr="ابحث عن الرابط بين العناصر. طابق كل بطاقة في العمود الأيسر مع زوجها في العمود الأيمن." />}

      {/* Toast */}
      {toast && (
        <div className="animate-toast" style={{
          position: 'fixed', top: 76, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(5,1,18,.97)', backdropFilter: 'blur(18px)',
          borderLeft: `1px solid ${toast.ok?'rgba(255,179,230,.55)':'rgba(249,168,212,.45)'}`,
          borderTop: `1px solid ${toast.ok?'rgba(255,179,230,.55)':'rgba(249,168,212,.45)'}`,
          borderRight: `1px solid ${toast.ok?'rgba(255,179,230,.55)':'rgba(249,168,212,.45)'}`,
          borderBottom: `1px solid ${toast.ok?'rgba(255,179,230,.55)':'rgba(249,168,212,.45)'}`,
          borderRadius: 12, padding: '10px 22px', zIndex: 52, pointerEvents: 'none',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 8px 30px rgba(0,0,0,.7)',
        }}>
          <span style={{ fontSize: 14 }}>{toast.ok ? '✓' : '⚠'}</span>
          <p style={{ fontFamily: "'Lora',serif", fontStyle: 'italic', fontSize: 13,
            color: toast.ok ? 'rgba(255,179,230,.9)' : 'rgba(249,168,212,.8)' }}>
            {toast.msg}
          </p>
        </div>
      )}

      {/* Inventory */}
      {showInv && <InventoryPanel totalKeys={totalKeys} butterflies={butterflies} onClose={() => { audio.playInventoryClose(); setShowInv(false) }}/>}

      {/* Completion overlay */}
      {phase === 'complete' && (
        <CompletionOverlay onCollect={handleCollectKey} collected={keyCollected} isAr={isAr} onBack={() => { audio.playReturnGarden(); onBack() }}/>
      )}
    </div>
  )
}
