import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import type { GuideChoice } from './GardenHub'
import { audio } from './sound/engine'
import { useLang, InlineControls } from './LangContext'
import { CompanionFace } from './CompanionIntro'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Data ─────────────────────────────────────────────────────────────────────
interface KeyDef { id: string; room: string; symbol: string; color: string; border: string; glow: string; bg: string }

const KEY_DEFS: KeyDef[] = [
  { id:'portrait', room:'The Portrait Room',    symbol:'🪞', color:'#f9a8d4', border:'rgba(249,168,212,.65)', glow:'rgba(249,168,212,.5)', bg:'rgba(249,168,212,.12)' },
  { id:'cabinet',  room:'The Curious Cabinet',  symbol:'🔮', color:'#fde68a', border:'rgba(253,230,138,.65)', glow:'rgba(253,230,138,.5)', bg:'rgba(253,230,138,.12)' },
  { id:'studio',   room:'Lavender Studio',      symbol:'🎬', color:'#c4aaff', border:'rgba(196,170,255,.65)', glow:'rgba(196,170,255,.5)', bg:'rgba(196,170,255,.12)' },
  { id:'workshop', room:'The Insight Workshop', symbol:'⚙️', color:'#9b72cf', border:'rgba(155,114,207,.65)', glow:'rgba(155,114,207,.5)', bg:'rgba(155,114,207,.12)' },
  { id:'gallery',  room:'The Learning Gallery', symbol:'🎓', color:'#c8b1e4', border:'rgba(200,177,228,.65)', glow:'rgba(200,177,228,.5)', bg:'rgba(200,177,228,.12)' },
]

// Slot positions inside the door face (percent of door width/height)
const SLOTS: { id: string; label: string; lx: string; ly: string }[] = [
  { id:'portrait', label:'The Portrait Room',    lx:'50%', ly:'22%' },
  { id:'cabinet',  label:'The Curious Cabinet',  lx:'26%', ly:'44%' },
  { id:'studio',   label:'Lavender Studio',      lx:'74%', ly:'44%' },
  { id:'workshop', label:'The Insight Workshop', lx:'26%', ly:'70%' },
  { id:'gallery',  label:'The Learning Gallery', lx:'74%', ly:'70%' },
]

const JOURNEY_CARDS = [
  { id:'info-systems',  title:'Information Systems',                 icon:'🎓', color:'#f9a8d4', border:'rgba(249,168,212,.35)',
    content:'Bachelor of Information Systems at King Abdulaziz University (2021–2026). Bridging technology and meaningful digital experiences through structured analytical thinking.',
    tags:['King Abdulaziz University','2021–2026','Systems Analysis'] },
  { id:'business',      title:'Business & Management',              icon:'📊', color:'#fde68a', border:'rgba(253,230,138,.35)',
    content:'Combines knowledge from marketing, accounting, and project management to support an understanding of how technology connects with business needs and organizational decision-making.',
    tags:['Marketing','Accounting','Project Management'] },
  { id:'video-content', title:'Video & Educational Content Production', icon:'🎬', color:'#c8b1e4', border:'rgba(200,177,228,.35)',
    content:'Experience in analyzing and simplifying content, developing educational scripts, creating visual content, producing AI-assisted voice-over, editing, and delivering final video productions.',
    tags:['Video Production','Scriptwriting','Content Simplification','Video Editing'] },
  { id:'web-tech',      title:'Web Technologies',                   icon:'💻', color:'#9b72cf', border:'rgba(155,114,207,.35)',
    content:'Knowledge of web development fundamentals and interface building using web technologies, with an interest in creating clear and interactive digital experiences.',
    tags:['HTML','CSS','JavaScript'] },
  { id:'ai-creation',   title:'AI-Assisted Creation',               icon:'🤖', color:'#c4aaff', border:'rgba(196,170,255,.35)',
    content:'Integrated AI-powered workflows into creative and technical processes, leveraging tools like ChatGPT, ElevenLabs, and Adobe Express to enhance output quality and efficiency.',
    tags:['ChatGPT','Gemini','Copilot','ElevenLabs','Adobe Express'] },
]

interface SkillSection {
  id: string
  titleEn: string; titleAr: string
  subtitleEn: string; subtitleAr: string
  descEn: string; descAr: string
  skills: { en: string; ar: string }[]
  color: string; border: string; glow: string
}
const SKILL_SECTIONS: SkillSection[] = [
  {
    id: 'analytical',
    titleEn: 'Analytical Skills', titleAr: 'المهارات التحليلية',
    subtitleEn: 'SKILLS', subtitleAr: 'مهارات',
    descEn: 'Skills that support understanding problems, analyzing information, and developing clear and considered solutions.',
    descAr: 'مهارات تدعم فهم المشكلات وتحليل المعلومات والبحث عن حلول واضحة ومدروسة.',
    skills: [
      { en: 'Research',            ar: 'البحث' },
      { en: 'Analysis',            ar: 'التحليل' },
      { en: 'Analytical Thinking', ar: 'التفكير التحليلي' },
      { en: 'Critical Thinking',   ar: 'التفكير النقدي' },
      { en: 'Problem Solving',     ar: 'حل المشكلات' },
    ],
    color: '#c4aaff', border: 'rgba(196,170,255,.45)', glow: 'rgba(196,170,255,.3)',
  },
  {
    id: 'professional',
    titleEn: 'Professional & Creative Skills', titleAr: 'المهارات المهنية والإبداعية',
    subtitleEn: 'SKILLS', subtitleAr: 'مهارات',
    descEn: 'Skills combining creativity, precision, and organization to support consistent and high-quality work.',
    descAr: 'مهارات تجمع بين الإبداع والدقة وتنظيم العمل، وتدعم تنفيذ المهام بجودة واتساق.',
    skills: [
      { en: 'Creativity and Innovation', ar: 'الإبداع والابتكار' },
      { en: 'Attention to Detail',       ar: 'الاهتمام بالتفاصيل' },
      { en: 'Time Management',           ar: 'إدارة الوقت' },
    ],
    color: '#f9a8d4', border: 'rgba(249,168,212,.45)', glow: 'rgba(249,168,212,.3)',
  },
]

type Phase = 'puzzle' | 'opening' | 'summary'

// ─── Scene SVG ────────────────────────────────────────────────────────────────
function DoorScene({ phase }: { phase: Phase }) {
  const bright = phase !== 'puzzle'
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }}
      viewBox="0 0 1440 768" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="fdBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={bright?"#0e0435":"#040114"}/>
          <stop offset="40%"  stopColor={bright?"#1c0858":"#080128"}/>
          <stop offset="75%"  stopColor={bright?"#2a0d6e":"#0e0238"}/>
          <stop offset="100%" stopColor={bright?"#160840":"#06011c"}/>
        </linearGradient>
        <linearGradient id="fdMoon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#fef9e7"/>
          <stop offset="100%" stopColor="#fde68a"/>
        </linearGradient>
        <radialGradient id="fdMoonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(253,230,138,.55)"/>
          <stop offset="40%"  stopColor="rgba(253,230,138,.2)"/>
          <stop offset="100%" stopColor="rgba(253,230,138,0)"/>
        </radialGradient>
        <radialGradient id="fdAmbL" cx="20%" cy="40%" r="55%">
          <stop offset="0%"   stopColor="rgba(196,170,255,.2)"/>
          <stop offset="100%" stopColor="rgba(196,170,255,0)"/>
        </radialGradient>
        <radialGradient id="fdAmbR" cx="80%" cy="40%" r="55%">
          <stop offset="0%"   stopColor="rgba(249,168,212,.13)"/>
          <stop offset="100%" stopColor="rgba(249,168,212,0)"/>
        </radialGradient>
        <radialGradient id="fdPortal" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(253,230,138,.65)"/>
          <stop offset="30%"  stopColor="rgba(196,170,255,.4)"/>
          <stop offset="70%"  stopColor="rgba(196,170,255,.1)"/>
          <stop offset="100%" stopColor="rgba(196,170,255,0)"/>
        </radialGradient>
        <linearGradient id="fdHill1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2a0c5a"/>
          <stop offset="100%" stopColor="#0e0330"/>
        </linearGradient>
        <linearGradient id="fdHill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1a0840"/>
          <stop offset="100%" stopColor="#08021c"/>
        </linearGradient>
        <linearGradient id="fdFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#12083a"/>
          <stop offset="100%" stopColor="#06011c"/>
        </linearGradient>
        <linearGradient id="fdVine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(139,92,246,.0)"/>
          <stop offset="50%"  stopColor="rgba(139,92,246,.45)"/>
          <stop offset="100%" stopColor="rgba(139,92,246,.0)"/>
        </linearGradient>
        <filter id="fdGlow5"><feGaussianBlur stdDeviation="5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="fdGlow14"><feGaussianBlur stdDeviation="14" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="fdBlur8"><feGaussianBlur stdDeviation="8"/></filter>
        <filter id="fdBlur22"><feGaussianBlur stdDeviation="22"/></filter>
        <filter id="fdBlur40"><feGaussianBlur stdDeviation="40"/></filter>
      </defs>

      {/* Sky */}
      <rect width="1440" height="768" fill="url(#fdBg)"/>
      <rect width="1440" height="768" fill="url(#fdAmbL)"/>
      <rect width="1440" height="768" fill="url(#fdAmbR)"/>

      {/* Stars */}
      {[...Array(55)].map((_,i) => (
        <circle key={i}
          cx={(i*233+71)%1440} cy={(i*97+19)%480}
          r={i%6===0?2.5:i%3===0?1.8:1.2}
          fill="white" opacity={.15+i%4*.18}
          className="animate-star-twinkle"
          style={{animationDelay:`${(i*.22)%4}s`}}/>
      ))}

      {/* Moon */}
      <circle cx="720" cy="72" r="52" fill="url(#fdMoonGlow)" filter="url(#fdBlur22)" opacity=".9"/>
      <circle cx="720" cy="72" r="34" fill="url(#fdMoon)" filter="url(#fdGlow14)"/>
      <circle cx="720" cy="72" r="28" fill="url(#fdMoon)"/>
      {/* Moon craters */}
      <circle cx="710" cy="62" r="5" fill="rgba(253,220,100,.25)"/>
      <circle cx="728" cy="78" r="3" fill="rgba(253,220,100,.2)"/>
      <circle cx="716" cy="82" r="4" fill="rgba(253,220,100,.18)"/>
      {/* Moonbeams */}
      {[-60,-40,-20,0,20,40,60].map((dx,i) => (
        <rect key={i} x={720+dx-1} y="106" width={3-Math.abs(dx)/40} height={400-Math.abs(dx)*2}
          fill="rgba(253,230,138,.04)" filter="url(#fdBlur8)"/>
      ))}
      {/* Central moonbeam straight down to door */}
      <path d="M 685,106 L 650,620 L 790,620 L 755,106 Z"
        fill="rgba(253,230,138,.06)" filter="url(#fdBlur22)"/>

      {/* Distant lavender hills */}
      <path d="M 0,490 Q 200,360 400,420 Q 600,480 720,380 Q 840,280 1040,400 Q 1200,480 1440,420 L 1440,768 L 0,768 Z"
        fill="url(#fdHill1)" opacity=".9"/>
      <path d="M 0,530 Q 160,440 320,480 Q 520,530 720,450 Q 880,380 1080,460 Q 1260,530 1440,480 L 1440,768 L 0,768 Z"
        fill="url(#fdHill2)" opacity=".95"/>
      {/* Distant forest silhouettes */}
      {[80,180,240,320,1100,1160,1240,1340].map((x,i) => {
        const h = 60+i%3*20, w = 28+i%2*12
        return (
          <g key={i}>
            <ellipse cx={x} cy={490-h/2} rx={w/2} ry={h/2}
              fill={i<4?"rgba(18,5,50,.9)":"rgba(18,5,50,.9)"}/>
            <rect x={x-3} y={490-h} width="6" height={h/2}
              fill="rgba(12,3,35,.9)"/>
          </g>
        )
      })}

      {/* Stone floor / clearing */}
      <rect x="0" y="620" width="1440" height="148" fill="url(#fdFloor)"/>
      <rect x="0" y="618" width="1440" height="5" fill="rgba(196,170,255,.12)"/>
      <rect x="0" y="618" width="1440" height="5" fill="rgba(196,170,255,.18)" filter="url(#fdBlur8)"/>
      {/* Stone tile lines */}
      {[...Array(14)].map((_,i) => (
        <line key={i} x1={i*110} y1="620" x2={i*110} y2="768" stroke="rgba(196,170,255,.07)" strokeWidth="1"/>
      ))}
      {[640,668,700,730].map((y,i) => (
        <line key={i} x1="250" y1={y} x2="1190" y2={y} stroke="rgba(196,170,255,.06)" strokeWidth="1"/>
      ))}
      {/* Floor center glow */}
      <ellipse cx="720" cy="628" rx="320" ry="28"
        fill={bright?"rgba(253,230,138,.12)":"rgba(196,170,255,.07)"} filter="url(#fdBlur22)"/>

      {/* ── STONE COLUMNS ── */}
      {[340,1100].map((cx,si) => {
        const isLeft = si === 0
        return (
          <g key={si}>
            {/* Column shaft */}
            <rect x={cx-18} y="120" width="36" height="502" rx="4"
              fill={isLeft?"rgba(22,8,55,.95)":"rgba(22,8,55,.95)"}
              stroke="rgba(196,170,255,.22)" strokeWidth="1.5"/>
            {/* Column fluting */}
            {[-8,-3,2,7].map((dx,fi) => (
              <rect key={fi} x={cx+dx} y="125" width="2" height="494" rx="1"
                fill="rgba(196,170,255,.07)"/>
            ))}
            {/* Capital */}
            <rect x={cx-24} y="112" width="48" height="20" rx="3"
              fill="rgba(30,10,70,.95)" stroke="rgba(196,170,255,.28)" strokeWidth="1.5"/>
            {/* Base */}
            <rect x={cx-26} y="610" width="52" height="18" rx="3"
              fill="rgba(30,10,70,.95)" stroke="rgba(196,170,255,.22)" strokeWidth="1.5"/>
            {/* Column ambient glow */}
            <rect x={cx-20} y="120" width="40" height="500" rx="4"
              fill="rgba(196,170,255,.04)" filter="url(#fdBlur8)"/>
            {/* Capital gem */}
            <circle cx={cx} cy="112" r="5"
              fill="rgba(196,170,255,.6)" filter="url(#fdGlow5)"/>

            {/* ── LAVENDER VINES ── */}
            {/* Main vine stem */}
            <path d={isLeft
              ? `M ${cx} 620 Q ${cx-10} 520 ${cx+8} 440 Q ${cx-12} 360 ${cx+5} 280 Q ${cx-8} 200 ${cx} 120`
              : `M ${cx} 620 Q ${cx+10} 520 ${cx-8} 440 Q ${cx+12} 360 ${cx-5} 280 Q ${cx+8} 200 ${cx} 120`}
              fill="none" stroke="rgba(100,60,200,.5)" strokeWidth="2" strokeLinecap="round"/>
            {/* Vine branches */}
            {[200,280,360,440,520].map((y,vi) => {
              const dir = isLeft ? (vi%2===0?-1:1) : (vi%2===0?1:-1)
              const bx = cx + dir*30 + Math.sin(vi)*8
              return (
                <g key={vi}>
                  <path d={`M ${cx} ${y} Q ${cx+dir*15} ${y-10} ${bx} ${y-20}`}
                    fill="none" stroke="rgba(100,60,200,.35)" strokeWidth="1.2"/>
                  {/* Lavender flower clusters */}
                  {[-6,0,6].map(ddx => (
                    <ellipse key={ddx} cx={bx+ddx} cy={y-26+Math.abs(ddx)/2}
                      rx="4" ry="6" fill="rgba(168,127,255,.6)" opacity=".75"/>
                  ))}
                  {/* Leaves */}
                  <ellipse cx={cx+dir*12} cy={y+5} rx="8" ry="4"
                    fill="rgba(60,120,60,.45)" transform={`rotate(${dir*20} ${cx+dir*12} ${y+5})`}/>
                </g>
              )
            })}
          </g>
        )
      })}

      {/* ── SIDE SPOTLIGHTS ── */}
      {[[340,120,'rgba(196,170,255,.12)'],[1100,120,'rgba(249,168,212,.1)']].map(([x,y,c],i) => (
        <ellipse key={i} cx={x as number} cy={(y as number)+280} rx="120" ry="240"
          fill={c as string} filter="url(#fdBlur40)" opacity=".6"/>
      ))}

      {/* Magical realm visible through door (shown during/after opening) */}
      {bright && (
        <g>
          <ellipse cx="720" cy="350" rx="220" ry="280"
            fill="url(#fdPortal)" filter="url(#fdBlur40)" opacity=".8"/>
          <ellipse cx="720" cy="350" rx="120" ry="200"
            fill="rgba(253,230,138,.25)" filter="url(#fdBlur22)"/>
          {/* Golden path behind door */}
          <path d="M 640,620 Q 680,500 720,420 Q 760,500 800,620"
            fill="rgba(253,230,138,.15)" filter="url(#fdBlur22)"/>
          {/* Floating light particles in portal */}
          {[...Array(18)].map((_,i) => (
            <circle key={i}
              cx={680+(i%6)*14} cy={240+Math.floor(i/6)*60}
              r={2+i%3}
              fill={i%3===0?'#fde68a':i%3===1?'#c4aaff':'#f9a8d4'}
              opacity=".7" className="animate-star-twinkle"
              style={{animationDelay:`${i*.15}s`}}/>
          ))}
        </g>
      )}

      {/* ── BUTTERFLIES ── */}
      {[[260,380,'#c4aaff','#a87fff',0],[1180,360,'#f9a8d4','#f472b6',1],
        [380,500,'#fde68a','#f59e0b',2],[1060,480,'#c4aaff','#a87fff',0],
        [160,300,'#f9a8d4','#f472b6',1]].map(([x,y,c1,c2,v],i) => (
        <g key={i} className={v===0?'animate-flutter':'animate-flutter2'} style={{animationDelay:`${i*1.3}s`}}>
          <g transform={`translate(${x},${y})`}>
            <ellipse cx="-9" cy="-6" rx="10" ry="7" fill={c1 as string} opacity=".78" transform="rotate(-20,-9,-6)"/>
            <ellipse cx="9"  cy="-6" rx="10" ry="7" fill={c1 as string} opacity=".78" transform="rotate(20,9,-6)"/>
            <ellipse cx="-7" cy="4"  rx="7"  ry="5" fill={c2 as string} opacity=".65" transform="rotate(15,-7,4)"/>
            <ellipse cx="7"  cy="4"  rx="7"  ry="5" fill={c2 as string} opacity=".65" transform="rotate(-15,7,4)"/>
            <ellipse cx="0" cy="0" rx="1.5" ry="7" fill="rgba(40,10,80,.5)"/>
          </g>
        </g>
      ))}

      {/* Sparkles */}
      {[...Array(26)].map((_,i) => (
        <circle key={i}
          cx={(i*211+63)%1440} cy={(i*107+35)%580}
          r={i%5===0?2:i%3===0?1.5:1}
          fill={i%4===0?'#fde68a':i%4===1?'#c4aaff':i%4===2?'#f9a8d4':'#9b72cf'}
          opacity={.18+i%3*.18}
          className="animate-star-twinkle"
          style={{animationDelay:`${(i*.21)%3.8}s`}}/>
      ))}
    </svg>
  )
}

// ─── Door arch frame (static HTML overlay) ────────────────────────────────────
function ArchFrame() {
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <svg width="400" height="560" viewBox="0 0 400 560" fill="none" style={{ position:'absolute' }}>
        <defs>
          <linearGradient id="archGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="rgba(196,170,255,.55)"/>
            <stop offset="100%" stopColor="rgba(100,60,200,.2)"/>
          </linearGradient>
          <linearGradient id="stoneGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#16063e"/>
            <stop offset="50%"  stopColor="#22094e"/>
            <stop offset="100%" stopColor="#16063e"/>
          </linearGradient>
          <radialGradient id="keystoneGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(253,230,138,.9)"/>
            <stop offset="100%" stopColor="rgba(253,230,138,0)"/>
          </radialGradient>
          <filter id="archGlow"><feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        {/* Outer arch glow */}
        <path d="M 20,540 L 20,200 Q 20,40 200,20 Q 380,40 380,200 L 380,540 Z"
          fill="none" stroke="rgba(196,170,255,.25)" strokeWidth="12" filter="url(#archGlow)"/>
        {/* Stone arch border */}
        <path d="M 20,540 L 20,200 Q 20,40 200,20 Q 380,40 380,200 L 380,540"
          fill="none" stroke="url(#archGrad)" strokeWidth="3"/>
        <path d="M 36,540 L 36,204 Q 36,58 200,38 Q 364,58 364,204 L 364,540"
          fill="none" stroke="rgba(196,170,255,.15)" strokeWidth="1.5"/>
        {/* Left pillar */}
        <rect x="4" y="195" width="32" height="350" rx="2" fill="url(#stoneGrad)" stroke="rgba(196,170,255,.22)" strokeWidth="1"/>
        <rect x="0" y="530" width="42" height="28" rx="3" fill="url(#stoneGrad)" stroke="rgba(196,170,255,.28)" strokeWidth="1.5"/>
        {/* Right pillar */}
        <rect x="364" y="195" width="32" height="350" rx="2" fill="url(#stoneGrad)" stroke="rgba(196,170,255,.22)" strokeWidth="1"/>
        <rect x="358" y="530" width="42" height="28" rx="3" fill="url(#stoneGrad)" stroke="rgba(196,170,255,.28)" strokeWidth="1.5"/>
        {/* Keystone */}
        <polygon points="200,10 218,32 200,26 182,32" fill="#fde68a" opacity=".85"/>
        <circle cx="200" cy="22" r="10" fill="url(#keystoneGlow)"/>
        <circle cx="200" cy="22" r="6" fill="#fde68a" filter="url(#archGlow)"/>
        {/* Arch ornament rings */}
        {[60,90,120,150,180].map((r,i) => (
          <circle key={i} cx="200" cy="200" r={r}
            fill="none" stroke="rgba(196,170,255,.06)" strokeWidth="1"/>
        ))}
      </svg>
    </div>
  )
}

// ─── Door panels (animate open) ────────────────────────────────────────────────
function DoorPanels({ open }: { open: boolean }) {
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
      <div style={{ width:294, height:454, position:'relative', top:18, perspective:900 }}>
        {/* Magical backdrop (always there, revealed when open) */}
        <div style={{ position:'absolute', inset:0, borderRadius:'50% 50% 0 0 / 16% 16% 0 0',
          background:'radial-gradient(ellipse at 50% 40%,rgba(253,230,138,.55) 0%,rgba(196,170,255,.4) 30%,rgba(100,50,200,.2) 60%,rgba(4,1,20,.95) 100%)',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:56, opacity:.6, animation:'key-float 3s ease-in-out infinite' }}>✦</div>
        </div>
        {/* Left door panel */}
        <div style={{
          position:'absolute', left:0, top:0, width:'50%', height:'100%',
          transformOrigin:'left center',
          transform: open ? 'perspective(900px) rotateY(-88deg)' : 'perspective(900px) rotateY(0deg)',
          transition: open ? 'transform 1.8s cubic-bezier(.4,0,.2,1)' : 'none',
          background:'linear-gradient(135deg,#12053a,#1e0852)',
          borderLeft:'2px solid rgba(196,170,255,.32)',
          borderTop:'2px solid rgba(196,170,255,.32)',
          borderBottom:'2px solid rgba(196,170,255,.32)',
          borderRight:'1px solid rgba(100,60,200,.2)',
          boxShadow: open ? 'none' : '-6px 0 30px rgba(0,0,0,.6)',
        }}>
          {/* Panel carvings */}
          <div style={{ margin:'14px 10px 10px', height:'42%', borderRadius:6,
            border:'1px solid rgba(196,170,255,.18)', background:'rgba(196,170,255,.04)' }}/>
          <div style={{ margin:'0 10px', height:'40%', borderRadius:6,
            border:'1px solid rgba(196,170,255,.14)', background:'rgba(196,170,255,.03)' }}/>
          {/* Ring handle */}
          <div style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)',
            width:14, height:14, borderRadius:'50%',
            border:'2.5px solid rgba(196,170,255,.55)', background:'rgba(20,8,60,.9)',
            boxShadow:'0 0 8px rgba(196,170,255,.35)' }}/>
          {/* Gold trim strips */}
          <div style={{ position:'absolute', top:0, right:0, width:2, height:'100%',
            background:'linear-gradient(180deg,transparent,rgba(253,230,138,.35),transparent)' }}/>
        </div>
        {/* Right door panel */}
        <div style={{
          position:'absolute', right:0, top:0, width:'50%', height:'100%',
          transformOrigin:'right center',
          transform: open ? 'perspective(900px) rotateY(88deg)' : 'perspective(900px) rotateY(0deg)',
          transition: open ? 'transform 1.8s cubic-bezier(.4,0,.2,1)' : 'none',
          background:'linear-gradient(225deg,#12053a,#1e0852)',
          borderRight:'2px solid rgba(196,170,255,.32)',
          borderTop:'2px solid rgba(196,170,255,.32)',
          borderBottom:'2px solid rgba(196,170,255,.32)',
          borderLeft:'1px solid rgba(100,60,200,.2)',
          boxShadow: open ? 'none' : '6px 0 30px rgba(0,0,0,.6)',
        }}>
          <div style={{ margin:'14px 10px 10px', height:'42%', borderRadius:6,
            border:'1px solid rgba(196,170,255,.18)', background:'rgba(196,170,255,.04)' }}/>
          <div style={{ margin:'0 10px', height:'40%', borderRadius:6,
            border:'1px solid rgba(196,170,255,.14)', background:'rgba(196,170,255,.03)' }}/>
          <div style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)',
            width:14, height:14, borderRadius:'50%',
            border:'2.5px solid rgba(196,170,255,.55)', background:'rgba(20,8,60,.9)',
            boxShadow:'0 0 8px rgba(196,170,255,.35)' }}/>
          <div style={{ position:'absolute', top:0, left:0, width:2, height:'100%',
            background:'linear-gradient(180deg,transparent,rgba(253,230,138,.35),transparent)' }}/>
        </div>
      </div>
    </div>
  )
}

// ─── Key slot on door ─────────────────────────────────────────────────────────
function KeySlot({ slot, placed, selected, wrong, onPlace }: {
  slot: typeof SLOTS[0]
  placed: KeyDef | null
  selected: string | null
  wrong: boolean
  onPlace: (slotId: string) => void
}) {
  const { t, isAr } = useLang()
  const k = placed
  const hasSelected = !!selected
  const [hov, setHov] = useState(false)
  return (
    <div onClick={() => hasSelected && !placed && onPlace(slot.id)}
      onMouseEnter={() => { if (hasSelected && !placed) { setHov(true); audio.playHover() } }}
      onMouseLeave={() => setHov(false)}
      style={{
      position:'absolute',
      left: slot.lx, top: slot.ly,
      transform:'translate(-50%,-50%)',
      display:'flex', flexDirection:'column', alignItems:'center', gap:4,
      cursor: hasSelected && !placed ? 'pointer' : 'default',
    }}>
      {/* Slot circle */}
      <div style={{
        width: 52, height: 52, borderRadius:'50%',
        background: placed ? `${k!.bg}` : wrong ? 'rgba(255,158,219,.2)' : hasSelected ? 'rgba(196,170,255,.15)' : 'rgba(10,4,30,.85)',
        borderLeft: `2.5px solid ${placed ? k!.border : wrong ? 'rgba(255,158,219,.7)' : hasSelected ? 'rgba(196,170,255,.55)' : 'rgba(100,60,200,.45)'}`,
        borderTop:  `2.5px solid ${placed ? k!.border : wrong ? 'rgba(255,158,219,.7)' : hasSelected ? 'rgba(196,170,255,.55)' : 'rgba(100,60,200,.45)'}`,
        borderRight:`2.5px solid ${placed ? k!.border : wrong ? 'rgba(255,158,219,.7)' : hasSelected ? 'rgba(196,170,255,.55)' : 'rgba(100,60,200,.45)'}`,
        borderBottom:`2.5px solid ${placed ? k!.border : wrong ? 'rgba(255,158,219,.7)' : hasSelected ? 'rgba(196,170,255,.55)' : 'rgba(100,60,200,.45)'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow: placed
          ? `0 0 24px ${k!.glow}, 0 0 48px ${k!.glow}88, 0 0 8px rgba(249,168,212,.2) inset`
          : wrong ? '0 0 16px rgba(255,158,219,.5)' : hov ? '0 0 32px rgba(196,170,255,.6), 0 0 12px rgba(249,168,212,.2)' : hasSelected ? '0 0 18px rgba(196,170,255,.38)' : 'none',
        transform: hov && !placed ? 'scale(1.08)' : 'none',
        transition:'all .3s',
        animation: wrong ? 'card-shake .35s ease' : placed ? 'glow-pulse 2s infinite' : 'none',
      }}>
        {placed
          ? <span style={{ fontSize:22 }}>{k!.symbol}</span>
          : <span style={{ fontSize:17, color: hasSelected ? 'rgba(196,170,255,.7)' : 'rgba(100,60,200,.5)' }}>⬡</span>
        }
      </div>
      {/* Slot label */}
      <div style={{ textAlign:'center', whiteSpace:'nowrap',
        background:'rgba(4,1,16,.88)', backdropFilter:'blur(8px)',
        borderLeft:'1px solid rgba(196,170,255,.18)', borderTop:'1px solid rgba(196,170,255,.18)',
        borderRight:'1px solid rgba(196,170,255,.18)', borderBottom:'1px solid rgba(196,170,255,.18)',
        borderRadius:8, padding:'2px 8px' }}>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:12, letterSpacing: isAr ? 0 : '.1em',
          color: placed ? k!.color : 'rgba(196,170,255,.5)' }}>
          {t.fd_slotLabels[slot.id] ?? slot.label}
        </p>
      </div>
    </div>
  )
}

// ─── Inventory key card ────────────────────────────────────────────────────────
function InventoryKey({ keyDef, selected, placed, onSelect }: {
  keyDef: KeyDef; selected: boolean; placed: boolean; onSelect: () => void
}) {
  const { t, isAr } = useLang()
  const [hov, setHov] = useState(false)
  return (
    <div onClick={() => !placed && onSelect()}
      onMouseEnter={() => { if (!placed) { setHov(true); audio.playHover() } }}
      onMouseLeave={() => setHov(false)}
      style={{
      flex:1, padding:'10px 8px', borderRadius:12, cursor: placed ? 'default' : 'pointer',
      background: placed
        ? 'rgba(155,114,207,.08)'
        : selected
        ? `${keyDef.bg}`
        : 'rgba(8,3,24,.85)',
      borderLeft:`2px solid ${placed ? 'rgba(155,114,207,.45)' : selected ? keyDef.border : 'rgba(100,60,200,.28)'}`,
      borderTop:`2px solid ${placed ? 'rgba(155,114,207,.45)' : selected ? keyDef.border : 'rgba(100,60,200,.28)'}`,
      borderRight:`2px solid ${placed ? 'rgba(155,114,207,.45)' : selected ? keyDef.border : 'rgba(100,60,200,.28)'}`,
      borderBottom:`2px solid ${placed ? 'rgba(155,114,207,.45)' : selected ? keyDef.border : 'rgba(100,60,200,.28)'}`,
      display:'flex', flexDirection:'column', alignItems:'center', gap:6,
      backdropFilter:'blur(12px)',
      boxShadow: selected ? `0 0 32px ${keyDef.glow}, 0 0 12px rgba(249,168,212,.2)` : placed ? '0 0 12px rgba(155,114,207,.2)' : hov ? `0 0 28px rgba(196,170,255,.5), 0 0 10px rgba(249,168,212,.18)` : 'none',
      transition:'all .3s cubic-bezier(.22,1,.36,1)',
      opacity: placed ? .5 : 1,
      transform: hov && !placed && !selected ? 'scale(1.05) translateY(-3px)' : 'none',
    }}>
      {/* Key emoji with glow */}
      <div style={{ fontSize:34,
        filter: placed ? 'grayscale(.8)' : selected ? `drop-shadow(0 0 8px ${keyDef.glow})` : 'none',
        transition:'filter .25s' }}>
        {placed ? '✓' : keyDef.symbol}
      </div>
      <div style={{ textAlign:'center' }}>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:9, letterSpacing: isAr ? 0 : '.1em',
          color: placed ? 'rgba(155,114,207,.65)' : selected ? keyDef.color : 'rgba(196,170,255,.55)',
          marginBottom:1 }}>
          {placed ? t.fd_placed : t.fd_keyLabel}
        </p>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic', fontSize:12,
          color: placed ? 'rgba(155,114,207,.5)' : selected ? 'rgba(230,220,255,.95)' : 'rgba(196,170,255,.75)',
          lineHeight:1.4, textAlign:'center' }}>
          {t.fd_slotLabels[keyDef.id] ?? keyDef.room}
        </p>
      </div>
    </div>
  )
}

// ─── Opening flash ─────────────────────────────────────────────────────────────
function OpeningFlash() {
  return (
    <div style={{ position:'absolute', inset:0, zIndex:35, pointerEvents:'none',
      background:'rgba(253,230,138,.18)', animation:'completion-in .8s ease both' }}/>
  )
}

// ─── Journey card ─────────────────────────────────────────────────────────────
function JourneyCard({ card }: { card: typeof JOURNEY_CARDS[0] }) {
  const { isAr } = useLang()
  const [open, setOpen] = useState(false)
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={() => setOpen(o => !o)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, cursor: 'pointer',
        background: 'linear-gradient(135deg,rgba(8,3,26,.97),rgba(16,5,42,.98))',
        border: `1.5px solid ${open || hov ? card.border.replace('.35','.7') : card.border}`,
        boxShadow: open
          ? `0 0 40px ${card.border.replace('.35','.4')}, 0 0 18px rgba(249,168,212,.18), 0 8px 32px rgba(0,0,0,.6)`
          : hov ? `0 0 28px rgba(249,168,212,.22), 0 0 16px rgba(196,170,255,.18), 0 4px 20px rgba(0,0,0,.4)` : 'none',
        transform: hov && !open ? 'translateY(-2px)' : 'none',
        transition: 'border-color .3s, box-shadow .3s, transform .3s',
        overflow: 'hidden',
      }}
    >
      {/* Header row — always visible */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: card.border.replace('.35','.12'),
          border: `1.5px solid ${card.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          boxShadow: `0 0 12px ${card.border.replace('.35','.3')}` }}>
          {card.icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10, color: `${card.color}99`, letterSpacing: isAr ? 0 : '.18em', marginBottom: 2 }}>
            {card.tags[0]}
          </p>
          <h3 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: 15, color: card.color, lineHeight: 1.2 }}>
            {card.title}
          </h3>
        </div>
        <div style={{ color: open ? card.color : 'rgba(196,170,255,.4)', transition: 'transform .3s, color .3s', transform: open ? 'rotate(180deg)' : 'none', fontSize: 14 }}>▾</div>
      </div>

      {/* Hint — only when collapsed */}
      {!open && (
        <p style={{ textAlign: 'center', fontSize: 9, color: 'rgba(196,170,255,.3)', letterSpacing: '.2em', padding: '0 18px 10px', fontFamily: "'Cinzel',serif" }}>
          CLICK TO EXPAND  /  اضغط للتوسيع
        </p>
      )}

      {/* Expandable body */}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows .35s cubic-bezier(.22,1,.36,1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 18px 16px' }}>
            <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${card.border},transparent)`, marginBottom: 14 }} />
            <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 15, color: 'rgba(210,195,255,.8)', lineHeight: 1.65, marginBottom: 12 }}>
              {card.content}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {card.tags.map(tag => (
                <span key={tag}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(249,168,212,.38), 0 0 5px rgba(196,170,255,.22)'
                    e.currentTarget.style.borderColor = `${card.color}bb`
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = card.border
                    e.currentTarget.style.transform = 'none'
                  }}
                  style={{
                    fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 11,
                    color: `${card.color}cc`, background: card.border.replace('.35','.1'),
                    border: `1px solid ${card.border}`, padding: '2px 9px', borderRadius: 10, letterSpacing: isAr ? 0 : '.06em',
                    transition: 'all .22s', cursor: 'default',
                  }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Contact panel ────────────────────────────────────────────────────────────
function ContactPanel({ onClose }: { onClose: () => void }) {
  const { t, isAr } = useLang()
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60,
      background:'rgba(3,0,12,.7)', backdropFilter:'blur(14px)',
      display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <div className="animate-panel-in" onClick={e=>e.stopPropagation()} style={{
        width:400, background:'linear-gradient(145deg,rgba(6,1,22,.99),rgba(16,5,44,.99))',
        borderLeft:'1px solid rgba(196,170,255,.32)', borderTop:'1px solid rgba(196,170,255,.32)',
        borderRight:'1px solid rgba(196,170,255,.32)', borderBottom:'1px solid rgba(196,170,255,.32)',
        borderRadius:18, overflow:'hidden',
        boxShadow:'0 20px 60px rgba(0,0,0,.8)',
      }}>
        <div style={{ height:2, background:'linear-gradient(90deg,transparent,#c4aaff,#fde68a,#c4aaff,transparent)' }}/>
        <div style={{ padding:'22px 26px 14px', borderBottom:'1px solid rgba(196,170,255,.12)',
          display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10, color:'rgba(253,230,138,.62)', letterSpacing: isAr ? 0 : '.22em', marginBottom:4 }}>{t.fd_reachOut}</p>
            <h3 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize:22, color:'rgba(221,205,255,.95)' }}>
              {t.fd_contactTitle}
            </h3>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(196,170,255,.55)', cursor:'pointer', fontSize:26 }}>×</button>
        </div>
        <div style={{ padding:'20px 26px 26px', display:'flex', flexDirection:'column', gap:16 }}>
          {/* Avatar */}
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:52, height:52, borderRadius:'50%',
              background:'linear-gradient(135deg,#7b2fb0,#c060c0)',
              borderLeft:'2px solid rgba(253,230,138,.55)', borderTop:'2px solid rgba(253,230,138,.55)',
              borderRight:'2px solid rgba(253,230,138,.55)', borderBottom:'2px solid rgba(253,230,138,.55)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:24,
              boxShadow:'0 0 18px rgba(196,170,255,.4)' }}>
              🌸
            </div>
            <div>
              <p style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:18, color:'rgba(221,205,255,.95)', marginBottom:3 }}>
                Layan Mohammed Alahmari
              </p>
              <p style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontSize:12, color:'rgba(196,170,255,.55)' }}>
                Information Systems · King Abdulaziz University
              </p>
            </div>
          </div>
          {/* Email */}
          <div style={{ padding:'14px 16px', borderRadius:12,
            background:'rgba(196,170,255,.07)',
            borderLeft:'1px solid rgba(196,170,255,.25)', borderTop:'1px solid rgba(196,170,255,.25)',
            borderRight:'1px solid rgba(196,170,255,.25)', borderBottom:'1px solid rgba(196,170,255,.25)',
            display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:20 }}>✉</span>
            <div>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:12, color:'rgba(196,170,255,.55)', letterSpacing: isAr ? 0 : '.18em', marginBottom:4 }}>{t.fd_emailLabel}</p>
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13.5, color:'rgba(221,205,255,.9)', letterSpacing:'.02em' }}>
                alahmarylayan1@gmail.com
              </p>
            </div>
          </div>
          <a href="mailto:alahmarylayan1@gmail.com" style={{ textDecoration:'none' }}>
            <button style={{ width:'100%', padding:'13px 0', borderRadius:10, cursor:'pointer',
              background:'linear-gradient(135deg,rgba(196,170,255,.2),rgba(196,170,255,.08))',
              borderLeft:'1.5px solid rgba(196,170,255,.6)', borderTop:'1.5px solid rgba(196,170,255,.6)',
              borderRight:'1.5px solid rgba(196,170,255,.6)', borderBottom:'1.5px solid rgba(196,170,255,.6)',
              fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:12, letterSpacing: isAr ? 0 : '.16em', color:'#c4aaff',
              boxShadow:'0 0 20px rgba(196,170,255,.25)' }}>
              {t.fd_sendEmail}
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Portfolio modal ───────────────────────────────────────────────────────────
function PortfolioModal({ guide, onClose }: { guide: GuideChoice; onClose: () => void }) {
  const { t, isAr } = useLang()
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60,
      background:'rgba(2,0,10,.85)', backdropFilter:'blur(18px)',
      overflowY:'auto', padding:'24px 20px' }}
      onClick={onClose}>
      <div style={{ maxWidth:820, margin:'0 auto' }} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:9, color:'rgba(253,230,138,.65)', letterSpacing: isAr ? 0 : '.3em', marginBottom:10 }}>
            {t.fd_portfolioOverview}
          </p>
          <h1 style={{ fontFamily:"'Cinzel Decorative',serif", fontSize:38,
            background:'linear-gradient(135deg,#fde68a,#c4aaff,#9b72cf)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            marginBottom:8 }}>
            Mildly Mysterious
          </h1>
          <p style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontSize:17, color:'rgba(196,170,255,.65)' }}>
            Layan Mohammed Alahmari · Information Systems
          </p>
        </div>

        {/* Cards grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:22 }}>
          {JOURNEY_CARDS.map((c, i) => <JourneyCard key={c.id} card={{ ...c, ...t.fd_cards[i] }}/>)}
        </div>

        {/* Room completions */}
        <div style={{ padding:'16px 20px', borderRadius:14, marginBottom:20,
          background:'rgba(5,1,18,.9)',
          borderLeft:'1px solid rgba(196,170,255,.22)', borderTop:'1px solid rgba(196,170,255,.22)',
          borderRight:'1px solid rgba(196,170,255,.22)', borderBottom:'1px solid rgba(196,170,255,.22)' }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10.5, color:'rgba(196,170,255,.6)', letterSpacing: isAr ? 0 : '.2em', marginBottom:12 }}>
            {t.fd_allRoomsCompleted}
          </p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {KEY_DEFS.map(k => (
              <div key={k.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 14px', borderRadius:10,
                background:k.bg, borderLeft:`1px solid ${k.border}`, borderTop:`1px solid ${k.border}`,
                borderRight:`1px solid ${k.border}`, borderBottom:`1px solid ${k.border}` }}>
                <span style={{ fontSize:16 }}>{k.symbol}</span>
                <div>
                  <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10, color:k.color, letterSpacing: isAr ? 0 : '.08em' }}>{t.fd_slotLabels[k.id] ?? k.room}</p>
                  <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic', fontSize:9, color:`${k.color}99` }}>{isAr ? 'مكتملة ✓' : 'Completed ✓'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} style={{ display:'block', margin:'0 auto',
          background:'rgba(196,170,255,.12)',
          borderLeft:'1px solid rgba(196,170,255,.35)', borderTop:'1px solid rgba(196,170,255,.35)',
          borderRight:'1px solid rgba(196,170,255,.35)', borderBottom:'1px solid rgba(196,170,255,.35)',
          borderRadius:10, padding:'11px 32px', cursor:'pointer',
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:13, color:'rgba(196,170,255,.82)', letterSpacing: isAr ? 0 : '.12em' }}>
          {isAr ? 'إغلاق ←' : '← Close Portfolio'}
        </button>
      </div>
    </div>
  )
}

// ─── Glow helpers ────────────────────────────────────────────────────────────
function glowOn(e: React.MouseEvent<HTMLElement>, shadow = '0 0 32px rgba(196,170,255,.5), 0 0 12px rgba(249,168,212,.2)') {
  const el = e.currentTarget as HTMLElement
  el.style.boxShadow = shadow
  el.style.transform = 'translateY(-2px) scale(1.02)'
  el.style.filter = 'brightness(1.08)'
}
function glowOff(e: React.MouseEvent<HTMLElement>, defaultShadow = '') {
  const el = e.currentTarget as HTMLElement
  el.style.boxShadow = defaultShadow
  el.style.transform = 'none'
  el.style.filter = 'none'
}

// ─── Skill section card ────────────────────────────────────────────────────────
function SkillCard({ section, isAr }: { section: SkillSection; isAr: boolean }) {
  const [open, setOpen] = useState(false)
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={() => setOpen(o => !o)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, cursor: 'pointer',
        background: 'linear-gradient(135deg,rgba(8,3,26,.97),rgba(16,5,42,.98))',
        border: `1.5px solid ${open || hov ? section.border.replace('.45','.75') : section.border}`,
        boxShadow: open
          ? `0 0 40px ${section.glow}, 0 0 18px rgba(249,168,212,.18), 0 8px 32px rgba(0,0,0,.6)`
          : hov ? `0 0 28px rgba(249,168,212,.22), 0 0 16px rgba(196,170,255,.18), 0 4px 20px rgba(0,0,0,.4)` : 'none',
        transform: hov && !open ? 'translateY(-2px)' : 'none',
        transition: 'border-color .3s, box-shadow .3s, transform .3s',
        overflow: 'hidden',
      }}
    >
      {/* Header — always visible */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px' }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `${section.border.replace('.45','.12')}`,
          border: `1.5px solid ${section.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          boxShadow: `0 0 12px ${section.glow}` }}>
          ✦
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10, color: `${section.color}99`,
            letterSpacing: isAr ? 0 : '.18em', marginBottom: 3 }}>
            {isAr ? section.subtitleAr : section.subtitleEn}
          </p>
          <h3 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif",
            fontSize: isAr ? 15 : 14, color: section.color, lineHeight: 1.2 }}>
            {isAr ? section.titleAr : section.titleEn}
          </h3>
        </div>
        <div style={{ color: open ? section.color : 'rgba(196,170,255,.4)', transition: 'transform .3s, color .3s', transform: open ? 'rotate(180deg)' : 'none', fontSize: 14 }}>▾</div>
      </div>

      {/* Description — always visible */}
      <div style={{ padding: '0 18px' }}>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif",
          fontStyle: isAr ? 'normal' : 'italic', fontSize: 14, color: 'rgba(210,195,255,.72)',
          lineHeight: 1.65, direction: isAr ? 'rtl' : 'ltr', marginBottom: open ? 0 : 10 }}>
          {isAr ? section.descAr : section.descEn}
        </p>
      </div>

      {/* Hint — only when collapsed */}
      {!open && (
        <p style={{ textAlign: 'center', fontSize: 9, color: 'rgba(196,170,255,.3)', letterSpacing: '.2em', padding: '4px 18px 10px', fontFamily: "'Cinzel',serif" }}>
          CLICK TO EXPAND  /  اضغط للتوسيع
        </p>
      )}

      {/* Expandable skills list */}
      <div style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows .35s cubic-bezier(.22,1,.36,1)',
      }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '10px 18px 16px' }}>
            <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${section.border},transparent)`, marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', direction: isAr ? 'rtl' : 'ltr' }}>
              {section.skills.map(s => (
                <span key={s.en}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(249,168,212,.38), 0 0 5px rgba(196,170,255,.22)'
                    e.currentTarget.style.borderColor = `${section.color}bb`
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = section.border
                    e.currentTarget.style.transform = 'none'
                  }}
                  style={{
                    fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                    fontSize: isAr ? 12 : 11, color: `${section.color}cc`,
                    background: `${section.border.replace('.45','.1')}`,
                    border: `1px solid ${section.border}`,
                    padding: '4px 12px', borderRadius: 20, letterSpacing: isAr ? 0 : '.06em',
                    transition: 'all .22s', cursor: 'default',
                  }}>
                  {isAr ? s.ar : s.en}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Inline contact section ───────────────────────────────────────────────────
function ContactSection({ isAr }: { isAr: boolean }) {
  const [hovEmail, setHovEmail] = useState(false)
  const [hovPhone, setHovPhone] = useState(false)
  const [hov, setHov] = useState(false)
  return (
    <div style={{ width:'100%' }}>
      {/* Section divider */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(249,168,212,.3))' }}/>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
          fontSize:10, color:'rgba(249,168,212,.6)', letterSpacing: isAr ? 0 : '.28em', flexShrink:0 }}>
          {isAr ? 'التواصل' : 'CONTACT'}
        </p>
        <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(249,168,212,.3),transparent)' }}/>
      </div>

      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ padding:'28px 32px', borderRadius:18,
        background:'linear-gradient(145deg,rgba(6,1,22,.99),rgba(16,5,44,.99))',
        border:`1px solid ${hov ? 'rgba(249,168,212,.55)' : 'rgba(249,168,212,.3)'}`,
        boxShadow: hov ? '0 0 36px rgba(249,168,212,.22), 0 0 18px rgba(196,170,255,.15), 0 4px 24px rgba(0,0,0,.5)' : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'border-color .3s, box-shadow .3s, transform .3s',
        display:'flex', flexDirection:'column', gap:18 }}>

        {/* Header */}
        <div style={{ textAlign:'center' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', margin:'0 auto 14px',
            background:'linear-gradient(135deg,#7b2fb0,#c060c0)',
            border:'2px solid rgba(253,230,138,.5)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:26,
            boxShadow:'0 0 22px rgba(196,170,255,.4)' }}>
            🌸
          </div>
          <h3 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif",
            fontSize:22, color:'rgba(221,205,255,.95)', marginBottom:4 }}>
            {isAr ? 'التواصل' : 'Contact'}
          </h3>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif",
            fontStyle: isAr ? 'normal' : 'italic', fontSize:12, color:'rgba(196,170,255,.5)' }}>
            {isAr ? 'نظم المعلومات · جامعة الملك عبدالعزيز' : 'Information Systems · King Abdulaziz University'}
          </p>
        </div>

        {/* Contact rows */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Email */}
          <div
            onMouseEnter={() => setHovEmail(true)}
            onMouseLeave={() => setHovEmail(false)}
            style={{ padding:'14px 18px', borderRadius:12, cursor:'default',
              background: hovEmail ? 'rgba(196,170,255,.14)' : 'rgba(196,170,255,.07)',
              border:`1px solid ${hovEmail ? 'rgba(196,170,255,.45)' : 'rgba(196,170,255,.22)'}`,
              boxShadow: hovEmail ? '0 0 18px rgba(196,170,255,.15)' : 'none',
              display:'flex', alignItems:'center', gap:14,
              transition:'background .25s, border-color .25s, box-shadow .25s',
              direction: isAr ? 'rtl' : 'ltr' }}>
            <span style={{ fontSize:22, flexShrink:0 }}>✉</span>
            <div>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                fontSize:8.5, color:'rgba(196,170,255,.55)', letterSpacing: isAr ? 0 : '.2em', marginBottom:4 }}>
                {isAr ? 'البريد الإلكتروني' : 'EMAIL'}
              </p>
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:'rgba(221,205,255,.9)' }}>
                alahmarylayan1@gmail.com
              </p>
            </div>
          </div>
          {/* Phone */}
          <div
            onMouseEnter={() => setHovPhone(true)}
            onMouseLeave={() => setHovPhone(false)}
            style={{ padding:'14px 18px', borderRadius:12, cursor:'default',
              background: hovPhone ? 'rgba(253,230,138,.12)' : 'rgba(253,230,138,.06)',
              border:`1px solid ${hovPhone ? 'rgba(253,230,138,.42)' : 'rgba(253,230,138,.2)'}`,
              boxShadow: hovPhone ? '0 0 18px rgba(253,230,138,.12)' : 'none',
              display:'flex', alignItems:'center', gap:14,
              transition:'background .25s, border-color .25s, box-shadow .25s',
              direction: isAr ? 'rtl' : 'ltr' }}>
            <span style={{ fontSize:22, flexShrink:0 }}>📱</span>
            <div>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                fontSize:8.5, color:'rgba(253,230,138,.55)', letterSpacing: isAr ? 0 : '.2em', marginBottom:4 }}>
                {isAr ? 'رقم الجوال' : 'PHONE'}
              </p>
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:'rgba(253,230,138,.9)' }}>
                +966 53 926 8880
              </p>
            </div>
          </div>
          {/* LinkedIn */}
          <a href="https://www.linkedin.com/in/layan-alahmari" target="_blank" rel="noopener noreferrer"
            style={{ textDecoration:'none' }}>
            <div
              onMouseEnter={e => glowOn(e as unknown as React.MouseEvent<HTMLElement>, '0 0 28px rgba(249,168,212,.4)')}
              onMouseLeave={e => glowOff(e as unknown as React.MouseEvent<HTMLElement>)}
              style={{ padding:'14px 18px', borderRadius:12, cursor:'pointer',
                background:'rgba(249,168,212,.07)',
                border:'1px solid rgba(249,168,212,.28)',
                display:'flex', alignItems:'center', gap:14, justifyContent:'space-between',
                transition:'all .25s cubic-bezier(.22,1,.36,1)',
                direction: isAr ? 'rtl' : 'ltr' }}>
              <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                <span style={{ fontSize:22, flexShrink:0 }}>🔗</span>
                <div>
                  <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                    fontSize:8.5, color:'rgba(249,168,212,.55)', letterSpacing: isAr ? 0 : '.2em', marginBottom:4 }}>
                    {isAr ? 'لينكد إن' : 'LINKEDIN'}
                  </p>
                  <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:13, color:'rgba(249,168,212,.9)' }}>
                    {isAr ? 'عرض ملفي على لينكد إن' : 'View LinkedIn Profile'}
                  </p>
                </div>
              </div>
              <span style={{ fontSize:16, color:'rgba(249,168,212,.6)' }}>↗</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Room chip ────────────────────────────────────────────────────────────────
function RoomChip({ k, label, isAr }: { k: KeyDef; label: string; isAr: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 16px', borderRadius:20,
        background: hov ? `${k.bg.replace('.12','.22')}` : k.bg,
        border:`1px solid ${hov ? k.border.replace('.65','.9') : k.border}`,
        boxShadow: hov ? `0 0 28px rgba(249,168,212,.22), 0 0 16px rgba(196,170,255,.18), 0 0 10px rgba(249,168,212,.15)` : 'none',
        transform: hov ? 'translateY(-2px) scale(1.04)' : 'none',
        transition:'all .25s cubic-bezier(.22,1,.36,1)' }}>
      <span style={{ fontSize:16 }}>{k.symbol}</span>
      <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:9, color:k.color, letterSpacing: isAr ? 0 : '.08em' }}>{label}</p>
      <span style={{ fontSize:13, color:k.color }}>✓</span>
    </div>
  )
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function HUD({ guide, butterflies, keysPlaced, phase, onBack, onMainMenu, onReset }: {
  guide: GuideChoice; butterflies: number; keysPlaced: number; phase: Phase; onBack: () => void
  onMainMenu: () => void; onReset: () => void
}) {
  const { t, isAr } = useLang()
  const isMan = guide === 'man'
  return (
    <div style={{ position:'absolute', top:0, left:0, right:0, height:64, zIndex:30,
      background:'linear-gradient(180deg,rgba(24,6,58,1) 0%,rgba(32,9,72,1) 50%,rgba(20,5,50,1) 100%)',
      backdropFilter:'blur(22px)', borderBottom:'1px solid rgba(196,170,255,.22)',
      boxShadow:'0 1px 0 rgba(155,114,207,.2), 0 2px 28px rgba(18,5,48,.75)',
      display:'flex', alignItems:'center', padding:'0 16px 0 16px', gap:10 }}>

      {phase === 'puzzle' && (
        <button onClick={() => { audio.playReturnGarden(); onBack() }}
          onMouseEnter={e=>glowOn(e)}
          onMouseLeave={e=>glowOff(e)}
          style={{
          background:'rgba(139,92,246,.14)',
          border:'1px solid rgba(196,170,255,.3)',
          borderRadius:8, padding:'6px 14px', cursor:'pointer', flexShrink:0,
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10.5, color:'rgba(196,170,255,.82)', letterSpacing: isAr ? 0 : '.06em',
          transition:'all .25s cubic-bezier(.22,1,.36,1)' }}>
          {t.back}
        </button>
      )}

      {/* Guide portrait */}
      <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
        <div style={{ width:60, height:60, borderRadius:'50%',
          background: isMan?'linear-gradient(135deg,#1a1568,#4535c0)':'linear-gradient(135deg,#7b2fb0,#c060c0)',
          border:'1.5px solid rgba(253,230,138,.45)',
          display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden',
          boxShadow:'0 0 16px rgba(139,92,246,.5)' }}>
          <CompanionFace guide={guide} size={60} idPrefix="fd_hud" />
        </div>
      </div>

      <div style={{ width:1, height:36, background:'rgba(196,170,255,.18)', flexShrink:0 }}/>

      {phase === 'summary' ? (
        <div style={{ flexShrink:0 }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10, color:'rgba(253,230,138,.65)', letterSpacing: isAr ? 0 : '.2em', marginBottom:1 }}>{t.fd_journeyComplete.toUpperCase()}</p>
          <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize:17, color:'rgba(221,205,255,.9)' }}>
            {t.fd_storyUnlocked}
          </h2>
        </div>
      ) : (
        <div style={{ flexShrink:0 }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10, color:'rgba(196,170,255,.65)', letterSpacing: isAr ? 0 : '.2em', marginBottom:1 }}>{t.fd_puzzleLabel}</p>
          <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize:17, color:'rgba(221,205,255,.9)' }}>{t.fd_puzzleTitle}</h2>
        </div>
      )}

      <div style={{ flex:1 }}/>

      {/* Key slots progress */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0 }}>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:12, color:'rgba(253,230,138,.7)', letterSpacing: isAr ? 0 : '.14em' }}>
          {phase === 'summary' ? t.fd_allKeysPlaced : t.fd_keysPlaced}
        </p>
        <div style={{ display:'flex', gap:5, alignItems:'center' }}>
          {KEY_DEFS.map((k,i) => (
            <div key={k.id} style={{ width:24, height:24, borderRadius:7, transition:'all .35s',
              background: i < keysPlaced ? k.bg : 'rgba(196,170,255,.07)',
              borderLeft:`1.5px solid ${i < keysPlaced ? k.border : 'rgba(196,170,255,.2)'}`,
              borderTop:`1.5px solid ${i < keysPlaced ? k.border : 'rgba(196,170,255,.2)'}`,
              borderRight:`1.5px solid ${i < keysPlaced ? k.border : 'rgba(196,170,255,.2)'}`,
              borderBottom:`1.5px solid ${i < keysPlaced ? k.border : 'rgba(196,170,255,.2)'}`,
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:10,
              boxShadow: i < keysPlaced ? `0 0 10px ${k.glow}` : 'none' }}>
              {i < keysPlaced ? '✓' : ''}
            </div>
          ))}
          <span style={{ fontFamily:"'Cinzel',serif", fontSize:13, color:'rgba(253,230,138,.7)', marginLeft:2 }}>
            {Math.min(keysPlaced,5)}/5
          </span>
        </div>
      </div>

      <div style={{ width:1, height:36, background:'rgba(196,170,255,.18)', flexShrink:0 }}/>

      <div style={{ display:'flex', gap:10, flexShrink:0, alignItems:'center' }}>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:12, color:'rgba(253,230,138,.58)', letterSpacing: isAr ? 0 : '.09em', marginBottom:2 }}>🗝 {t.fd_keyLabel.replace('🗝 ','').replace('🗝','')}</p>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, color:'#fde68a', fontWeight:700 }}>5/5</p>
        </div>
        <div style={{ textAlign:'center' }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:12, color:'rgba(196,170,255,.58)', letterSpacing: isAr ? 0 : '.09em', marginBottom:2 }}>🦋</p>
          <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:18, color:'#c4aaff', fontWeight:700 }}>{butterflies}</p>
        </div>
      </div>

      {phase !== 'summary' && <>
        <div style={{ width:1, height:36, background:'rgba(196,170,255,.15)', flexShrink:0 }}/>
        <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
          <button onClick={() => { audio.playReturnGarden(); onMainMenu() }}
            onMouseEnter={e=>glowOn(e,'0 0 28px rgba(253,230,138,.45)')}
            onMouseLeave={e=>glowOff(e)}
            style={{
            background:'rgba(253,230,138,.14)', border:'1px solid rgba(253,230,138,.45)',
            borderRadius:7, padding:'5px 11px', cursor:'pointer',
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:12, color:'rgba(253,230,138,.9)', letterSpacing: isAr ? 0 : '.06em', whiteSpace:'nowrap',
            transition:'all .25s cubic-bezier(.22,1,.36,1)' }}>
            {t.mainMenu}
          </button>
          <button onClick={onReset}
            onMouseEnter={e=>glowOn(e,'0 0 22px rgba(249,168,212,.38)')}
            onMouseLeave={e=>glowOff(e)}
            style={{
            background:'rgba(249,168,212,.08)', border:'1px solid rgba(249,168,212,.3)',
            borderRadius:7, padding:'5px 11px', cursor:'pointer',
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10.5, color:'rgba(249,168,212,.65)', letterSpacing: isAr ? 0 : '.04em', whiteSpace:'nowrap',
            transition:'all .25s cubic-bezier(.22,1,.36,1)' }}>
            {t.resetBtn}
          </button>
        </div>
      </>}

      <div style={{ width:1, height:36, background:'rgba(196,170,255,.15)', flexShrink:0 }}/>
      <InlineControls />
    </div>
  )
}

// ─── Quest / status bar ───────────────────────────────────────────────────────
function StatusBar({ phase, keysPlaced }: { phase: Phase; keysPlaced: number }) {
  const { t, isAr } = useLang()
  return (
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:68, zIndex:30,
      background:'linear-gradient(0deg,rgba(18,4,50,1) 0%,rgba(26,7,62,1) 60%,rgba(20,5,55,1) 100%)',
      backdropFilter:'blur(18px)', borderTop:'1px solid rgba(196,170,255,.2)',
      boxShadow:'0 -1px 0 rgba(155,114,207,.18), 0 -2px 24px rgba(18,5,48,.7)',
      display:'flex', alignItems:'center', padding:'0 22px', gap:16 }}>
      <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0,
        background: phase === 'summary' ? '#9b72cf' : '#fde68a',
        boxShadow:`0 0 10px ${phase === 'summary' ? '#9b72cf' : '#fde68a'}cc`,
        animation:'glow-pulse 2s infinite' }}/>
      <div style={{ flex:1 }}>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10.5, letterSpacing: isAr ? 0 : '.16em', marginBottom:4,
          color: phase === 'summary' ? 'rgba(255,179,230,.8)' : 'rgba(253,230,138,.75)' }}>
          {phase === 'summary'
            ? t.fd_storyUnlocked
            : phase === 'opening'
            ? t.fd_doorOpening
            : `${t.fd_puzzleLabel} · ${keysPlaced}/5`}
        </p>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic', fontSize:16, color:'rgba(221,200,255,.88)', lineHeight:1.5 }}>
          {phase === 'summary'
            ? t.fd_quoteComplete
            : phase === 'opening'
            ? t.fd_quoteBeyond
            : t.fd_quoteEach}
        </p>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FinalDoor({ guide, onBack, butterflies, onMainMenu, onReset, onPortfolio, onContact }: {
  guide: GuideChoice; onBack: () => void; butterflies: number
  onMainMenu: () => void; onReset: () => void; onPortfolio?: () => void; onContact?: () => void
}) {
  const { t, isAr } = useLang()
  // Shuffle inventory order and slot visual positions independently
  const inventoryKeys = useMemo(() => shuffle([...KEY_DEFS]), [])
  const displaySlots = useMemo(() => {
    const positions = SLOTS.map(s => ({ lx: s.lx, ly: s.ly }))
    const keyIds = KEY_DEFS.map(k => k.id)
    // Shuffle slot positions; ensure no slot position maps to the same index as the key in inventory
    let shuffledPos = shuffle([...positions])
    let tries = 0
    while (tries < 20) {
      const anyAligned = shuffledPos.some((pos, i) => {
        // Check if this slot position now corresponds to the same-index key in inventoryKeys
        // We just need shuffled positions not all identity-mapped
        const slotWithPos = SLOTS.find(s => s.lx === pos.lx && s.ly === pos.ly)
        const keyAtPos = slotWithPos ? keyIds.indexOf(slotWithPos.id) : -1
        return keyAtPos === i
      })
      if (!anyAligned) break
      shuffledPos = shuffle([...positions])
      tries++
    }
    // Reassign positions to slots (slot identity = id, only visual position changes)
    return SLOTS.map((slot, i) => ({ ...slot, lx: shuffledPos[i].lx, ly: shuffledPos[i].ly }))
  }, [])

  const [phase, setPhase]         = useState<Phase>('puzzle')
  const [placed, setPlaced]       = useState<Record<string, string>>({}) // slot_id → key_id
  const [selected, setSelected]   = useState<string | null>(null)       // key_id
  const [wrongSlot, setWrongSlot] = useState<string | null>(null)
  const [showContact, setShowContact]     = useState(false)
  const [showPortfolio, setShowPortfolio] = useState(false)
  const [unlockMsg, setUnlockMsg] = useState(false)

  const translatedCards = useMemo(() =>
    JOURNEY_CARDS.map((c, i) => ({ ...c, ...t.fd_cards[i] })),
  [t])

  const wrongRef = useRef<number>(undefined)
  const openRef  = useRef<number>(undefined)

  const keysPlaced = Object.keys(placed).length

  // Ambient
  useEffect(() => {
    audio.startAmbient('final-door')
    return () => audio.stopAmbient()
  }, [])

  // All 5 placed → trigger opening
  useEffect(() => {
    if (keysPlaced === 5 && phase === 'puzzle') {
      openRef.current = window.setTimeout(() => {
        audio.playShimmer()
        audio.playDoorSwing()
        setPhase('opening')
        window.setTimeout(() => {
          audio.playFinalDoorUnlock()
          setUnlockMsg(true)
          window.setTimeout(() => setPhase('summary'), 2200)
        }, 1600)
      }, 600)
    }
    return () => clearTimeout(openRef.current)
  }, [keysPlaced, phase])

  const handleSelectKey = useCallback((keyId: string) => {
    audio.playSelect()
    setSelected(prev => prev === keyId ? null : keyId)
  }, [])

  const handlePlaceKey = useCallback((slotId: string) => {
    if (!selected) return
    if (placed[slotId]) return

    if (selected === slotId) {
      // Correct!
      audio.playKeyInsert()
      setPlaced(prev => ({ ...prev, [slotId]: selected }))
      setSelected(null)
    } else {
      // Wrong
      audio.playIncorrect()
      setWrongSlot(slotId)
      clearTimeout(wrongRef.current)
      wrongRef.current = window.setTimeout(() => setWrongSlot(null), 600)
    }
  }, [selected, placed])

  const isKeyPlaced = (keyId: string) => Object.values(placed).includes(keyId)

  return (
    <div style={{ width:'100vw', height:'100vh', overflow:'hidden', position:'relative',
      background: phase === 'summary' ? '#010009' : '#040114' }}>

      {/* ── PUZZLE PHASE ─────────────────────────────────────────────── */}
      {phase !== 'summary' && (
        <>
          {/* HUD + StatusBar stay fixed at top/bottom */}
          <HUD guide={guide} butterflies={butterflies} keysPlaced={keysPlaced} phase={phase} onBack={onBack} onMainMenu={onMainMenu} onReset={onReset}/>
          <StatusBar phase={phase} keysPlaced={keysPlaced}/>

          {/* Scrollable content area between HUD and StatusBar */}
          <div style={{ position:'absolute', top:64, bottom:68, left:0, right:0, overflowY:'auto', overflowX:'hidden', zIndex:1 }}>
            {/* Inner content — min-height ensures the full door is reachable */}
            <div style={{ position:'relative', minHeight:'max(100%, 680px)', width:'100%' }}>

              {/* Background scene */}
              <DoorScene phase={phase}/>

              {/* Floating dust */}
              {[...Array(10)].map((_,i) => (
                <div key={i} className="particle" style={{
                  position:'absolute', left:`${(i*157+31)%100}%`, top:`${(i*79+22)%70}%`,
                  width:3, height:3, borderRadius:'50%', zIndex:2, pointerEvents:'none',
                  background: i%3===0?'rgba(253,230,138,.5)':i%3===1?'rgba(196,170,255,.45)':'rgba(255,179,230,.4)',
                  '--drift':`${(i%5-2)*20}px`, animationDelay:`${i*.45}s`,
                } as React.CSSProperties}/>
              ))}

              {/* Opening flash */}
              {phase === 'opening' && unlockMsg && (
                <div style={{ position:'absolute', inset:0, zIndex:35, pointerEvents:'none',
                  background:'radial-gradient(ellipse at center,rgba(253,230,138,.35) 0%,rgba(196,170,255,.1) 50%,transparent 100%)',
                  animation:'completion-in .6s ease both' }}/>
              )}

              {/* "The Story Is Now Unlocked" banner */}
              {unlockMsg && phase === 'opening' && (
                <div style={{ position:'absolute', top:'50%', left:'50%',
                  transform:'translate(-50%,-50%)', zIndex:38,
                  textAlign:'center', animation:'completion-in .5s ease both',
                  background:'rgba(4,1,16,.92)', backdropFilter:'blur(20px)',
                  borderLeft:'1px solid rgba(253,230,138,.4)', borderTop:'1px solid rgba(253,230,138,.4)',
                  borderRight:'1px solid rgba(253,230,138,.4)', borderBottom:'1px solid rgba(253,230,138,.4)',
                  borderRadius:18, padding:'24px 44px',
                  boxShadow:'0 0 60px rgba(253,230,138,.3)' }}>
                  <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:9, color:'rgba(253,230,138,.65)', letterSpacing: isAr ? 0 : '.3em', marginBottom:10 }}>
                    ✦ {t.fd_allKeysPlaced} ✦
                  </p>
                  <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize:34,
                    background:'linear-gradient(135deg,#fde68a,#c4aaff)',
                    WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                    {t.fd_storyUnlocked}
                  </h2>
                </div>
              )}

              {/* Arch frame */}
              <ArchFrame/>

              {/* Door panels */}
              <DoorPanels open={phase === 'opening'}/>

              {/* Key slots on door (hidden while opening) */}
              {phase === 'puzzle' && (
                <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:15, pointerEvents:'none' }}>
                  <div style={{ width:294, height:454, position:'relative', top:18, pointerEvents:'auto' }}>
                    {displaySlots.map(slot => (
                      <KeySlot
                        key={slot.id}
                        slot={slot}
                        placed={placed[slot.id] ? KEY_DEFS.find(k=>k.id===placed[slot.id])! : null}
                        selected={selected}
                        wrong={wrongSlot === slot.id}
                        onPlace={handlePlaceKey}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Key inventory strip — anchored to bottom of scroll content */}
              {phase === 'puzzle' && (
                <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)',
                  bottom:12, zIndex:20, width:'min(680px,92vw)' }}>
                  <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10, color:'rgba(196,170,255,.5)',
                    letterSpacing: isAr ? 0 : '.2em', textAlign:'center', marginBottom:8 }}>
                    {t.fd_selectKey}
                  </p>
                  <div style={{ display:'flex', gap:8 }}>
                    {inventoryKeys.map(k => (
                      <InventoryKey
                        key={k.id}
                        keyDef={k}
                        selected={selected === k.id}
                        placed={isKeyPlaced(k.id)}
                        onSelect={() => handleSelectKey(k.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* ── SUMMARY PHASE ────────────────────────────────────────────── */}
      {phase === 'summary' && (
        <div style={{ width:'100%', height:'100%', overflowY:'auto',
          background:'linear-gradient(160deg,#030012 0%,#0a0228 40%,#0e0338 70%,#06011c 100%)' }}>

          {/* Ambient */}
          <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
            {[...Array(50)].map((_,i) => (
              <div key={i} className="animate-star-twinkle" style={{
                position:'absolute',
                width: i%7===0?3:i%3===0?2:1.5, height: i%7===0?3:i%3===0?2:1.5,
                borderRadius:'50%', background:'white',
                top:`${(i*31)%100}%`, left:`${(i*23+9)%100}%`,
                animationDelay:`${(i*.28)%4}s`, opacity:.25+i%3*.2,
              }}/>
            ))}
            {/* Purple ambient blobs */}
            <div style={{ position:'absolute', top:'20%', left:'15%', width:400, height:400, borderRadius:'50%',
              background:'rgba(100,40,200,.08)', filter:'blur(80px)' }}/>
            <div style={{ position:'absolute', top:'40%', right:'10%', width:350, height:350, borderRadius:'50%',
              background:'rgba(249,168,212,.06)', filter:'blur(80px)' }}/>
          </div>

          <div style={{ position:'relative', zIndex:1, maxWidth:860, margin:'0 auto', padding:'80px 20px 120px' }}>

            {/* HUD */}
            <HUD guide={guide} butterflies={butterflies} keysPlaced={5} phase="summary" onBack={onBack} onMainMenu={onMainMenu} onReset={onReset}/>

            {/* ── Title section ── */}
            <div style={{ textAlign:'center', marginBottom:40 }}>
              {/* Star row */}
              <div style={{ display:'flex', justifyContent:'center', gap:12, marginBottom:18 }}>
                {['#fde68a','#c4aaff','#9b72cf','#f9a8d4','#fde68a'].map((c,i) => (
                  <div key={i} className="animate-star-twinkle" style={{ animationDelay:`${i*.22}s` }}>
                    <svg width="14" height="14" viewBox="0 0 14 14">
                      <polygon points="7,0 8.6,5 14,5 9.8,8 11.4,14 7,10.5 2.6,14 4.2,8 0,5 5.4,5" fill={c}/>
                    </svg>
                  </div>
                ))}
              </div>

              <p style={{ fontFamily:"'Cinzel',serif", fontSize:12, color:'rgba(253,230,138,.65)', letterSpacing:'.35em', marginBottom:12 }}>
                LAYAN MOHAMMED ALAHMARI
              </p>
              <h1 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize:56, fontWeight:700, lineHeight:1.05, marginBottom:8,
                background:'linear-gradient(135deg,#fde68a 0%,#c4aaff 50%,#9b72cf 100%)',
                WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                {t.fd_journeyComplete}
              </h1>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, marginBottom:14 }}>
                <div style={{ width:80, height:1, background:'linear-gradient(90deg,transparent,rgba(196,170,255,.5))' }}/>
                <svg width="12" height="12" viewBox="0 0 12 12">
                  <polygon points="6,0 7.4,4.2 12,4.2 8.5,6.8 9.7,11 6,8.5 2.3,11 3.5,6.8 0,4.2 4.6,4.2" fill="rgba(253,230,138,.8)"/>
                </svg>
                <div style={{ width:80, height:1, background:'linear-gradient(90deg,rgba(196,170,255,.5),transparent)' }}/>
              </div>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:18, letterSpacing: isAr ? 0 : '.18em', color:'rgba(196,170,255,.7)', fontStyle: isAr ? 'normal' : 'italic', marginBottom:22 }}>
                {isAr ? 'مغامرة بنكهة اللافندر' : 'A Lavender-Tinted Adventure'}
              </p>
              <div style={{ maxWidth:560, margin:'0 auto', padding:'20px 26px',
                background:'rgba(5,1,20,.8)', backdropFilter:'blur(16px)',
                borderLeft:'1px solid rgba(196,170,255,.22)', borderTop:'1px solid rgba(196,170,255,.22)',
                borderRight:'1px solid rgba(196,170,255,.22)', borderBottom:'1px solid rgba(196,170,255,.22)',
                borderRadius:14 }}>
                <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'normal', fontSize:18, color:'rgba(221,205,255,.9)', lineHeight:1.8 }}>
                  {isAr ? 'وراء كل غرفة مكتملة حكاية من التعلّم والإبداع والتطوّر' : 'Behind every completed room is a story of learning, creativity, and growth'}
                </p>
                <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic', fontSize:16, color:'rgba(196,170,255,.6)', lineHeight:1.75, marginTop:8 }}>
                  {isAr ? 'شكرًا لاستكشاف حديقة اللافندر وما تحمله من اكتشافات' : 'Thank you for exploring the lavender garden of discoveries'}
                </p>
              </div>
            </div>

            {/* ── Rooms completed ── */}
            <div style={{ display:'flex', justifyContent:'center', gap:10, flexWrap:'wrap', marginBottom:36 }}>
              {KEY_DEFS.map(k => (
                <RoomChip key={k.id} k={k} label={t.fd_slotLabels[k.id] ?? k.room} isAr={isAr}/>
              ))}
            </div>

            {/* ── Journey cards ── */}
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:18 }}>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(196,170,255,.25))' }}/>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10, color:'rgba(196,170,255,.5)',
                letterSpacing: isAr ? 0 : '.22em', flexShrink:0 }}>
                {isAr ? 'فصول الرحلة' : t.fd_journeyChapter}
              </p>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(196,170,255,.25),transparent)' }}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:36 }}>
              {translatedCards.map(c => <JourneyCard key={c.id} card={c}/>)}
            </div>

            {/* ── Skill sections ── */}
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:18 }}>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,rgba(196,170,255,.25))' }}/>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:10, color:'rgba(196,170,255,.5)',
                letterSpacing: isAr ? 0 : '.22em', flexShrink:0 }}>
                {isAr ? 'المهارات' : 'SKILLS'}
              </p>
              <div style={{ flex:1, height:1, background:'linear-gradient(90deg,rgba(196,170,255,.25),transparent)' }}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:48 }}>
              {SKILL_SECTIONS.map(s => <SkillCard key={s.id} section={s} isAr={isAr}/>)}
            </div>

            {/* ── Inline contact ── */}
            <ContactSection isAr={isAr}/>

            {/* ── Action buttons ── */}
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginTop:36 }}>
              <button onClick={() => { audio.playReturnGarden(); onBack() }} style={{
                padding:'15px 32px', borderRadius:12, cursor:'pointer',
                background:'linear-gradient(135deg,rgba(139,92,246,.22),rgba(139,92,246,.08))',
                border:'2px solid rgba(196,170,255,.55)',
                fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:12, color:'rgba(196,170,255,.9)', letterSpacing: isAr ? 0 : '.14em',
                boxShadow:'0 0 22px rgba(196,170,255,.2)', transition:'all .3s cubic-bezier(.22,1,.36,1)',
              }}
                onMouseEnter={e=>glowOn(e,'0 0 40px rgba(196,170,255,.55), 0 0 14px rgba(249,168,212,.2)')}
                onMouseLeave={e=>{ glowOff(e); e.currentTarget.style.background='linear-gradient(135deg,rgba(139,92,246,.22),rgba(139,92,246,.08))' }}
              >
                {t.fd_returnGarden}
              </button>
              <button onClick={() => { audio.playClick(); if (onPortfolio) { onPortfolio() } else { setShowPortfolio(true) } }} style={{
                padding:'15px 32px', borderRadius:12, cursor:'pointer',
                background:'linear-gradient(135deg,rgba(253,230,138,.2),rgba(253,230,138,.08))',
                border:'2px solid rgba(253,230,138,.6)',
                fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:12, color:'rgba(253,230,138,.9)', letterSpacing: isAr ? 0 : '.14em',
                boxShadow:'0 0 22px rgba(253,230,138,.2)', transition:'all .3s cubic-bezier(.22,1,.36,1)',
              }}
                onMouseEnter={e=>glowOn(e,'0 0 40px rgba(253,230,138,.5)')}
                onMouseLeave={e=>{ glowOff(e,'0 0 22px rgba(253,230,138,.2)'); e.currentTarget.style.background='linear-gradient(135deg,rgba(253,230,138,.2),rgba(253,230,138,.08))' }}
              >
                {t.fd_viewPortfolio}
              </button>
            </div>

            {/* Footer */}
            <div style={{ textAlign:'center', marginTop:40, paddingTop:24,
              borderTop:'1px solid rgba(196,170,255,.08)' }}>
              <p style={{ fontFamily:"'Lora',serif", fontStyle:'italic', fontSize:12, color:'rgba(196,170,255,.22)' }}>
                {isAr ? 'خمس غرف. خمسة مفاتيح. قصة واحدة.' : 'Five rooms. Five keys. One story.'} &nbsp;—&nbsp; Mildly Mysterious, 2025–2026
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showContact   && <ContactPanel onClose={() => setShowContact(false)}/>}
      {showPortfolio && <PortfolioModal guide={guide} onClose={() => setShowPortfolio(false)}/>}
    </div>
  )
}
