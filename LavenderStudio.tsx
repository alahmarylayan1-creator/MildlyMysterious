import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type { GuideChoice } from './GardenHub'
import { audio } from './sound/engine'
import GoldenKey from './GoldenKey'
import studioImg from '@/imports/Screenshot_2026-08-05_164714.png'
import { useLang, InlineControls } from './LangContext'
import { CompanionIntro, CompanionFace } from './CompanionIntro'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Phase = 'intro' | 'puzzle' | 'complete'

// ─── Room scene SVG ───────────────────────────────────────────────────────────
function StudioScene({ shake }: { shake: boolean }) {
  return (
    <svg
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
        transform: shake ? 'translateX(0)' : undefined,
        animation: shake ? 'studio-shake .45s ease' : undefined,
      }}
      viewBox="0 0 1440 768" preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        {/* Backgrounds */}
        <linearGradient id="sBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#050112"/>
          <stop offset="40%"  stopColor="#0e0330"/>
          <stop offset="75%"  stopColor="#180848"/>
          <stop offset="100%" stopColor="#0c0228"/>
        </linearGradient>
        <linearGradient id="sFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#1c0908"/>
          <stop offset="100%" stopColor="#0a0404"/>
        </linearGradient>
        {/* Curtains */}
        <linearGradient id="sCurtL" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#4a0d70"/>
          <stop offset="55%"  stopColor="#7b2bab"/>
          <stop offset="100%" stopColor="rgba(90,22,130,0)"/>
        </linearGradient>
        <linearGradient id="sCurtR" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%"   stopColor="#4a0d70"/>
          <stop offset="55%"  stopColor="#7b2bab"/>
          <stop offset="100%" stopColor="rgba(90,22,130,0)"/>
        </linearGradient>
        <linearGradient id="sCurtLInner" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#6320a0"/>
          <stop offset="100%" stopColor="rgba(80,20,120,0)"/>
        </linearGradient>
        <linearGradient id="sCurtRInner" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%"   stopColor="#6320a0"/>
          <stop offset="100%" stopColor="rgba(80,20,120,0)"/>
        </linearGradient>
        {/* Spotlights */}
        <radialGradient id="sSpot1" cx="25%" cy="0%" r="70%">
          <stop offset="0%"   stopColor="rgba(253,230,138,.2)"/>
          <stop offset="100%" stopColor="rgba(253,230,138,0)"/>
        </radialGradient>
        <radialGradient id="sSpot2" cx="75%" cy="0%" r="70%">
          <stop offset="0%"   stopColor="rgba(196,170,255,.17)"/>
          <stop offset="100%" stopColor="rgba(196,170,255,0)"/>
        </radialGradient>
        <radialGradient id="sSpot3" cx="50%" cy="0%" r="55%">
          <stop offset="0%"   stopColor="rgba(249,168,212,.12)"/>
          <stop offset="100%" stopColor="rgba(249,168,212,0)"/>
        </radialGradient>
        {/* Proscenium arch */}
        <linearGradient id="sArch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2a1508"/>
          <stop offset="100%" stopColor="#1a0a04"/>
        </linearGradient>
        {/* Film strip */}
        <linearGradient id="sFilm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0a0420"/>
          <stop offset="100%" stopColor="#06021a"/>
        </linearGradient>
        <filter id="sGlow5"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="sGlow10"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="sBlur6"><feGaussianBlur stdDeviation="6"/></filter>
        <filter id="sBlur12"><feGaussianBlur stdDeviation="12"/></filter>
        <filter id="sBlur20"><feGaussianBlur stdDeviation="20"/></filter>
      </defs>

      {/* ── SKY / BACKGROUND ── */}
      <rect width="1440" height="768" fill="url(#sBg)"/>
      <rect width="1440" height="768" fill="url(#sSpot1)"/>
      <rect width="1440" height="768" fill="url(#sSpot2)"/>
      <rect width="1440" height="768" fill="url(#sSpot3)"/>

      {/* Open-air stars */}
      {[...Array(55)].map((_,i) => (
        <circle key={i}
          cx={(i * 269 + 41) % 1440} cy={(i * 113 + 15) % 240}
          r={i % 5 === 0 ? 1.8 : i % 3 === 0 ? 1.3 : .9}
          fill={i%4===0?'#fde68a':i%4===1?'#c4aaff':i%4===2?'#f9a8d4':'white'}
          opacity={.25 + (i%4)*.18}
          className="animate-star-twinkle"
          style={{animationDelay:`${(i*.19)%3.2}s`}}/>
      ))}

      {/* Moon glow */}
      <circle cx="1320" cy="65" r="40" fill="rgba(240,228,255,.08)" filter="url(#sBlur12)"/>
      <circle cx="1320" cy="65" r="20" fill="rgba(240,228,255,.12)" filter="url(#sBlur6)"/>
      <circle cx="1320" cy="65" r="8"  fill="rgba(240,228,255,.22)"/>

      {/* ── STAGE FLOOR ── */}
      <rect x="0" y="612" width="1440" height="156" fill="url(#sFloor)"/>
      {/* Wood plank lines */}
      {[...Array(9)].map((_,i) => (
        <line key={i} x1="0" y1={616+i*17} x2="1440" y2={616+i*17}
          stroke="rgba(60,20,8,.45)" strokeWidth="1"/>
      ))}
      {/* Plank vertical grain */}
      {[...Array(16)].map((_,i) => (
        <line key={i} x1={i*100} y1="612" x2={i*100+45} y2="768"
          stroke="rgba(40,12,4,.3)" strokeWidth="1.5"/>
      ))}
      {/* Stage front edge highlight */}
      <rect x="0" y="610" width="1440" height="5" fill="rgba(253,200,80,.12)"/>
      <rect x="0" y="610" width="1440" height="5" fill="rgba(253,200,80,.08)" filter="url(#sBlur6)"/>

      {/* ── PROSCENIUM ARCH ── */}
      {/* Arch columns — left */}
      <rect x="270" y="60" width="50" height="558" fill="url(#sArch)" rx="3"/>
      <rect x="270" y="60" width="50" height="558" fill="none" stroke="rgba(253,200,80,.28)" strokeWidth="1.5"/>
      {/* Left column gold inlay lines */}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x="280" y={80+i*90} width="30" height="3" rx="1.5" fill="rgba(253,200,80,.25)"/>
      ))}

      {/* Arch columns — right */}
      <rect x="1120" y="60" width="50" height="558" fill="url(#sArch)" rx="3"/>
      <rect x="1120" y="60" width="50" height="558" fill="none" stroke="rgba(253,200,80,.28)" strokeWidth="1.5"/>
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x="1130" y={80+i*90} width="30" height="3" rx="1.5" fill="rgba(253,200,80,.25)"/>
      ))}

      {/* Arch top beam */}
      <rect x="265" y="55" width="910" height="40" fill="url(#sArch)" rx="3"/>
      <rect x="265" y="55" width="910" height="40" fill="none" stroke="rgba(253,200,80,.3)" strokeWidth="1.5"/>
      {/* Gold arch top ornaments */}
      {[0,1,2,3,4,5,6,7,8].map(i => (
        <g key={i}>
          <circle cx={310+i*96} cy="75" r="6" fill="none" stroke="rgba(253,200,80,.38)" strokeWidth="1.5"/>
          <circle cx={310+i*96} cy="75" r="2.5" fill="rgba(253,200,80,.35)"/>
        </g>
      ))}
      {/* Arch top center cartouche */}
      <ellipse cx="720" cy="58" rx="55" ry="15" fill="rgba(20,8,4,.9)" stroke="rgba(253,200,80,.5)" strokeWidth="1.5"/>
      <text x="720" y="62" textAnchor="middle" fill="rgba(253,200,80,.72)" fontSize="9"
        fontFamily="'Cinzel',serif" letterSpacing="2">CINEMA</text>

      {/* ── LAVENDER CURTAINS ── */}
      {/* Left curtain — main body */}
      <path d="M0,0 Q220,140 185,340 Q155,520 200,768 L0,768 Z" fill="url(#sCurtL)" opacity=".92"/>
      <path d="M25,0 Q230,120 198,310 Q168,490 210,768 L25,768 Z" fill="url(#sCurtLInner)" opacity=".5"/>
      {/* Left curtain folds */}
      {[55,100,145,188].map((x,i) => (
        <path key={i} d={`M${x},0 Q${x+55},${150+i*35} ${x+22},${380+i*25} Q${x+10},580 ${x+32},768`}
          fill="none" stroke="rgba(160,90,240,.15)" strokeWidth="1.8"/>
      ))}
      {/* Left tie-back */}
      <path d="M0,370 Q85,392 30,418" fill="none" stroke="rgba(253,230,138,.55)" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="32" cy="418" r="7" fill="rgba(253,230,138,.65)"/>
      {/* Left tassel */}
      {[-5,0,5,10,15].map((dx,i) => (
        <line key={i} x1={30+dx} y1="425" x2={29+dx} y2={472+i*4}
          stroke="rgba(253,200,80,.42)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      {/* Left curtain velvet edge */}
      <path d="M0,0 L0,768" stroke="rgba(253,200,80,.22)" strokeWidth="3"/>

      {/* Right curtain — main body */}
      <path d="M1440,0 Q1220,140 1255,340 Q1285,520 1240,768 L1440,768 Z" fill="url(#sCurtR)" opacity=".92"/>
      <path d="M1415,0 Q1210,120 1242,310 Q1272,490 1230,768 L1415,768 Z" fill="url(#sCurtRInner)" opacity=".5"/>
      {[1385,1340,1295,1252].map((x,i) => (
        <path key={i} d={`M${x},0 Q${x-55},${150+i*35} ${x-22},${380+i*25} Q${x-10},580 ${x-32},768`}
          fill="none" stroke="rgba(160,90,240,.15)" strokeWidth="1.8"/>
      ))}
      <path d="M1440,370 Q1355,392 1410,418" fill="none" stroke="rgba(253,230,138,.55)" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="1408" cy="418" r="7" fill="rgba(253,230,138,.65)"/>
      {[-15,-10,-5,0,5].map((dx,i) => (
        <line key={i} x1={1410+dx} y1="425" x2={1411+dx} y2={472+i*4}
          stroke="rgba(253,200,80,.42)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      <path d="M1440,0 L1440,768" stroke="rgba(253,200,80,.22)" strokeWidth="3"/>

      {/* ── STRING LIGHTS — multiple strands ── */}
      {/* Primary strand */}
      <path d="M0,65 Q360,42 720,48 Q1080,42 1440,65"
        fill="none" stroke="rgba(80,45,15,.55)" strokeWidth="1.5"/>
      {[...Array(32)].map((_,i) => {
        const t = i/31, x = t*1440
        const y = 65 + Math.sin(t*Math.PI)*(-18)
        const c = i%5===0?'#fde68a':i%5===1?'#f9a8d4':i%5===2?'#c4aaff':i%5===3?'#6ee7b7':'#fb923c'
        return (
          <g key={i} className="animate-glow-pulse" style={{animationDelay:`${i*.11}s`}}>
            <circle cx={x} cy={y+5} r="5.5" fill={c} opacity=".78"/>
            <circle cx={x} cy={y+5} r="9" fill={c} opacity=".18" filter="url(#sBlur6)"/>
          </g>
        )
      })}
      {/* Secondary strand */}
      <path d="M0,92 Q360,72 720,76 Q1080,72 1440,92"
        fill="none" stroke="rgba(80,45,15,.35)" strokeWidth="1"/>
      {[...Array(20)].map((_,i) => {
        const t=i/19, x=t*1440, y=92+Math.sin(t*Math.PI)*(-14)
        const c=i%3===0?'#c4aaff':i%3===1?'#fde68a':'#f9a8d4'
        return (
          <g key={i} className="animate-glow-pulse" style={{animationDelay:`${i*.17+.6}s`}}>
            <circle cx={x} cy={y+4} r="4" fill={c} opacity=".52"/>
          </g>
        )
      })}

      {/* ── SPOTLIGHT RIGS ── */}
      {[[320,0,'#fde68a'],[720,0,'#c4aaff'],[1120,0,'#f9a8d4']].map(([x,_,c],ri) => (
        <g key={ri}>
          {/* Truss bar */}
          <rect x={(x as number)-50} y="0" width="100" height="10" rx="4"
            fill="rgba(30,15,5,.95)" stroke="rgba(80,50,15,.5)" strokeWidth="1"/>
          {/* Rig hanging cables */}
          <line x1={(x as number)-20} y1="10" x2={(x as number)-16} y2="28" stroke="rgba(60,35,10,.6)" strokeWidth="1.5"/>
          <line x1={(x as number)+20} y1="10" x2={(x as number)+16} y2="28" stroke="rgba(60,35,10,.6)" strokeWidth="1.5"/>
          {/* Spot body */}
          <rect x={(x as number)-14} y="10" width="28" height="34" rx="6"
            fill="#110504" stroke="rgba(80,50,15,.6)" strokeWidth="1.5"/>
          <ellipse cx={x as number} cy="44" rx="16" ry="6"
            fill={`${c}66`} filter="url(#sBlur6)"/>
          {/* Light cone */}
          <path d={`M${(x as number)-12},44 L${(x as number)-110},620 L${(x as number)+110},620 L${(x as number)+12},44`}
            fill={`${c}07`} filter="url(#sBlur20)"/>
          {/* Lens glint */}
          <circle cx={(x as number)-4} cy="30" r="2" fill="rgba(255,255,255,.35)"/>
        </g>
      ))}

      {/* ── FLOATING FILM STRIPS ── */}
      {/* Left strip — angled */}
      <g transform="translate(82,105) rotate(-14)">
        <rect width="72" height="340" rx="5" fill="url(#sFilm)" stroke="rgba(100,60,180,.28)" strokeWidth="1.5"/>
        {[...Array(11)].map((_,i) => (
          <g key={i}>
            <rect x="4" y={8+i*30} width="10" height="20" rx="4" fill="rgba(50,20,100,.6)"/>
            <rect x="20" y={8+i*30} width="36" height="20" rx="2"
              fill={i%4===0?'rgba(196,170,255,.18)':i%4===1?'rgba(249,168,212,.14)':i%4===2?'rgba(253,230,138,.12)':'rgba(110,231,183,.1)'}/>
            <rect x="58" y={8+i*30} width="10" height="20" rx="4" fill="rgba(50,20,100,.6)"/>
          </g>
        ))}
      </g>
      {/* Right strip — angled opposite */}
      <g transform="translate(1290,78) rotate(16)">
        <rect width="72" height="360" rx="5" fill="url(#sFilm)" stroke="rgba(100,60,180,.28)" strokeWidth="1.5"/>
        {[...Array(12)].map((_,i) => (
          <g key={i}>
            <rect x="4" y={8+i*29} width="10" height="19" rx="4" fill="rgba(50,20,100,.6)"/>
            <rect x="20" y={8+i*29} width="36" height="19" rx="2"
              fill={i%4===0?'rgba(253,230,138,.14)':i%4===1?'rgba(196,170,255,.16)':i%4===2?'rgba(249,168,212,.12)':'rgba(147,197,253,.1)'}/>
            <rect x="58" y={8+i*29} width="10" height="19" rx="4" fill="rgba(50,20,100,.6)"/>
          </g>
        ))}
      </g>
      {/* Small floating strip — top center area */}
      <g transform="translate(860,108) rotate(-6)">
        <rect width="48" height="200" rx="4" fill="url(#sFilm)" stroke="rgba(100,60,180,.2)" strokeWidth="1"/>
        {[...Array(7)].map((_,i) => (
          <g key={i}>
            <rect x="3" y={6+i*28} width="6" height="16" rx="3" fill="rgba(50,20,100,.5)"/>
            <rect x="12" y={6+i*28} width="24" height="16" rx="2" fill="rgba(196,170,255,.12)"/>
            <rect x="38" y={6+i*28} width="6" height="16" rx="3" fill="rgba(50,20,100,.5)"/>
          </g>
        ))}
      </g>

      {/* ── FILM REELS (decorative) ── */}
      {[[155,598,'#c4aaff'],[230,620,'#fde68a'],[1210,598,'#f9a8d4'],[1285,620,'#6ee7b7']].map(([x,y,c],i) => (
        <g key={i}>
          <circle cx={x as number} cy={y as number} r="32" fill="rgba(10,4,28,.9)" stroke={`${c}44`} strokeWidth="2"/>
          <circle cx={x as number} cy={y as number} r="22" fill="rgba(6,2,18,.95)" stroke={`${c}2a`} strokeWidth="1.5"/>
          <circle cx={x as number} cy={y as number} r="7" fill={`${c}28`} stroke={`${c}55`} strokeWidth="1"/>
          {[0,60,120,180,240,300].map(a => {
            const r=(a*Math.PI)/180, r1=9, r2=20
            return <line key={a}
              x1={(x as number)+Math.cos(r)*r1} y1={(y as number)+Math.sin(r)*r1}
              x2={(x as number)+Math.cos(r)*r2} y2={(y as number)+Math.sin(r)*r2}
              stroke={`${c}50`} strokeWidth="2.5"/>
          })}
        </g>
      ))}

      {/* ── STORYBOARD PANELS ── */}
      {/* Left wall storyboard cluster */}
      {[[80,290,'#f9a8d4'],[148,265,'#fde68a'],[80,365,'#c4aaff']].map(([x,y,c],i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width="62" height="46" rx="3"
            fill="rgba(5,1,18,.88)" stroke={`${c}2a`} strokeWidth="1"/>
          {/* Sketch lines */}
          {[8,16,24,32].map(dy => (
            <line key={dy} x1={(x as number)+6} y1={(y as number)+dy}
              x2={(x as number)+52} y2={(y as number)+dy}
              stroke={`${c}20`} strokeWidth="1"/>
          ))}
          {/* Thumbnail sketch */}
          <rect x={(x as number)+6} y={(y as number)+6} width="20" height="16" rx="2" fill={`${c}18`}/>
          <text x={(x as number)+56} y={(y as number)+44} textAnchor="end"
            fill={`${c}45`} fontSize="7" fontFamily="monospace">{i+1}</text>
          {/* Pushpin */}
          <circle cx={(x as number)+31} cy={(y as number)-3} r="4"
            fill={c} opacity=".55" filter="url(#sGlow5)"/>
        </g>
      ))}
      {/* Right wall storyboard */}
      {[[1298,285,'#6ee7b7'],[1230,268,'#fb923c'],[1298,362,'#fde68a']].map(([x,y,c],i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width="62" height="46" rx="3"
            fill="rgba(5,1,18,.88)" stroke={`${c}2a`} strokeWidth="1"/>
          {[8,16,24,32].map(dy => (
            <line key={dy} x1={(x as number)+6} y1={(y as number)+dy}
              x2={(x as number)+52} y2={(y as number)+dy} stroke={`${c}20`} strokeWidth="1"/>
          ))}
          <rect x={(x as number)+6} y={(y as number)+6} width="20" height="16" rx="2" fill={`${c}18`}/>
          <circle cx={(x as number)+31} cy={(y as number)-3} r="4"
            fill={c} opacity=".55" filter="url(#sGlow5)"/>
        </g>
      ))}

      {/* ── MICROPHONE STANDS ── */}
      {/* Left mic */}
      <g>
        <ellipse cx="230" cy="614" rx="28" ry="6" fill="rgba(30,12,6,.8)"/>
        <line x1="230" y1="614" x2="230" y2="455" stroke="#1c0a04" strokeWidth="4.5" strokeLinecap="round"/>
        <line x1="230" y1="528" x2="255" y2="502" stroke="#1c0a04" strokeWidth="3" strokeLinecap="round"/>
        <ellipse cx="257" cy="490" rx="14" ry="20" fill="#120804" stroke="rgba(253,230,138,.35)" strokeWidth="1.5"/>
        <ellipse cx="257" cy="490" rx="9"  ry="15" fill="rgba(70,30,8,.5)" stroke="rgba(253,230,138,.2)" strokeWidth="1"/>
        {[-8,-4,0,4,8].map(dy => (
          <line key={dy} x1="250" y1={490+dy} x2="264" y2={490+dy}
            stroke="rgba(253,230,138,.18)" strokeWidth=".9"/>
        ))}
        <ellipse cx="257" cy="490" rx="14" ry="20" fill="none"
          stroke="rgba(253,230,138,.18)" strokeWidth="7" filter="url(#sGlow10)"/>
      </g>
      {/* Right mic */}
      <g>
        <ellipse cx="1210" cy="614" rx="28" ry="6" fill="rgba(30,12,6,.8)"/>
        <line x1="1210" y1="614" x2="1210" y2="455" stroke="#1c0a04" strokeWidth="4.5" strokeLinecap="round"/>
        <line x1="1210" y1="528" x2="1185" y2="502" stroke="#1c0a04" strokeWidth="3" strokeLinecap="round"/>
        <ellipse cx="1183" cy="490" rx="14" ry="20" fill="#120804" stroke="rgba(196,170,255,.35)" strokeWidth="1.5"/>
        <ellipse cx="1183" cy="490" rx="9"  ry="15" fill="rgba(40,20,80,.5)" stroke="rgba(196,170,255,.2)" strokeWidth="1"/>
        {[-8,-4,0,4,8].map(dy => (
          <line key={dy} x1="1176" y1={490+dy} x2="1190" y2={490+dy}
            stroke="rgba(196,170,255,.18)" strokeWidth=".9"/>
        ))}
        <ellipse cx="1183" cy="490" rx="14" ry="20" fill="none"
          stroke="rgba(196,170,255,.18)" strokeWidth="7" filter="url(#sGlow10)"/>
      </g>

      {/* ── DIRECTOR'S CHAIR & EDITING DESK ── */}
      {/* Chair */}
      <g transform="translate(840,545)">
        <line x1="0" y1="65" x2="10" y2="20" stroke="#2a1208" strokeWidth="3.5"/>
        <line x1="50" y1="65" x2="40" y2="20" stroke="#2a1208" strokeWidth="3.5"/>
        <line x1="8" y1="65" x2="-2" y2="100" stroke="#2a1208" strokeWidth="3"/>
        <line x1="42" y1="65" x2="52" y2="100" stroke="#2a1208" strokeWidth="3"/>
        <line x1="-2" y1="100" x2="52" y2="100" stroke="#2a1208" strokeWidth="3"/>
        <path d="M5,20 L45,20 L45,55 L5,55 Z" fill="#7b2fb0" opacity=".7" rx="2"/>
        <path d="M10,20 L40,20 L40,10 L10,10 Z" fill="#5a1a88" opacity=".7"/>
        {/* "DIRECTOR" text on back */}
        <text x="25" y="42" textAnchor="middle" fill="rgba(253,230,138,.45)"
          fontSize="5" fontFamily="monospace" letterSpacing="1">DIRECTOR</text>
      </g>
      {/* Editing desk */}
      <g>
        <rect x="940" y="582" width="210" height="32" rx="4"
          fill="#140802" stroke="rgba(80,45,15,.45)" strokeWidth="1.5"/>
        {/* Monitor */}
        <rect x="958" y="543" width="80" height="42" rx="4"
          fill="#050315" stroke="rgba(196,170,255,.3)" strokeWidth="1"/>
        <rect x="961" y="546" width="74" height="34" rx="2" fill="rgba(80,50,180,.1)"/>
        {[0,1,2,3].map(i => (
          <line key={i} x1="966" y1={551+i*7} x2="1028" y2={551+i*7}
            stroke={`rgba(196,170,255,${.14-i*.02})`} strokeWidth="1"/>
        ))}
        {/* Monitor stand */}
        <rect x="990" y="585" width="16" height="6" rx="2" fill="rgba(70,35,12,.8)"/>
        {/* Keyboard */}
        <rect x="1055" y="565" width="80" height="18" rx="3"
          fill="#080414" stroke="rgba(196,170,255,.18)" strokeWidth="1"/>
        {[...Array(12)].map((_,i) => (
          <rect key={i} x={1060+i*5} y="568" width="3" height="11" rx="1"
            fill="rgba(196,170,255,.1)"/>
        ))}
        {/* Color grade wheels */}
        {['#f9a8d4','#6ee7b7','#93c5fd'].map((c,i) => (
          <circle key={i} cx={952+i*38} cy={598} r="8"
            fill="none" stroke={c} strokeWidth="2" opacity=".35"/>
        ))}
      </g>

      {/* ── BUTTERFLIES ── */}
      {[[190,480,.8],[1260,430,.9],[950,180,.7],[380,250,.85],[1090,280,.75]].map(([x,y,op],i) => (
        <g key={i} className={i%2===0?'animate-flutter':'animate-flutter2'}
          style={{animationDelay:`${i*.9}s`}}>
          <g transform={`translate(${x},${y})`}>
            {['#c4aaff','#f9a8d4','#fde68a','#6ee7b7','#c4aaff'][i] === '#c4aaff' ? null : null}
            <ellipse cx="-9" cy="-6" rx="10" ry="7"
              fill={['#c4aaff','#f9a8d4','#fde68a','#6ee7b7','#c4aaff'][i]}
              opacity={(op as number)*.88} transform="rotate(-20,-9,-6)"/>
            <ellipse cx="9" cy="-6" rx="10" ry="7"
              fill={['#c4aaff','#f9a8d4','#fde68a','#6ee7b7','#c4aaff'][i]}
              opacity={(op as number)*.88} transform="rotate(20,9,-6)"/>
            <ellipse cx="-7" cy="4" rx="7" ry="5"
              fill={['#a87fff','#f472b6','#f59e0b','#34d399','#a87fff'][i]}
              opacity={(op as number)*.72} transform="rotate(15,-7,4)"/>
            <ellipse cx="7" cy="4" rx="7" ry="5"
              fill={['#a87fff','#f472b6','#f59e0b','#34d399','#a87fff'][i]}
              opacity={(op as number)*.72} transform="rotate(-15,7,4)"/>
            <ellipse cx="0" cy="0" rx="1.5" ry="7" fill="rgba(40,10,80,.55)"/>
          </g>
        </g>
      ))}

      {/* ── AMBIENT GLOW ORBS ── */}
      <ellipse cx="195" cy="460" rx="130" ry="90" fill="rgba(196,170,255,.055)" filter="url(#sBlur20)"/>
      <ellipse cx="1245" cy="440" rx="120" ry="85" fill="rgba(249,168,212,.05)" filter="url(#sBlur20)"/>
      <ellipse cx="720" cy="620" rx="350" ry="40" fill="rgba(196,170,255,.07)" filter="url(#sBlur20)"/>

      {/* ── DUST MOTES (inline, subtle) ── */}
      {[...Array(10)].map((_,i) => (
        <circle key={i}
          cx={(i*183+55)%1440} cy={(i*97+100)%500}
          r="1.5" fill="rgba(253,230,138,.4)" opacity=".45"
          className="animate-star-twinkle"
          style={{animationDelay:`${i*.35}s`}}/>
      ))}

      {/* ── IVY / VINE corner accents ── */}
      <path d="M0,0 Q30,80 18,200 Q10,300 35,420"
        fill="none" stroke="rgba(30,80,30,.3)" strokeWidth="2"/>
      <path d="M1440,0 Q1410,80 1422,200 Q1430,300 1405,420"
        fill="none" stroke="rgba(30,80,30,.3)" strokeWidth="2"/>
    </svg>
  )
}


// ─── Jigsaw path generator ────────────────────────────────────────────────────
// 3×3 grid. Each interior edge: one side = tab (knob out), other = blank (dent in).
// Double-cubic S-curve knobs for clean rounded bumps that interlock exactly.
//
// Edge assignment (ensures every interior edge is tab↔blank):
//   top:    row0=flat, row1=blank, row2=tab
//   bottom: row2=flat, row0=tab,   row1=blank
//   left:   col0=flat, col1=blank, col2=tab
//   right:  col2=flat, col0=tab,   col1=blank
const S   = 160  // piece size in path units
const MID = 80   // midpoint of each edge
const NW  = 14   // knob neck half-width (base of knob on edge)
const HW  = 23   // knob head half-width (widest point)
const ND  = 4    // neck control-point depth (sharpness of neck flare)
const HD  = 27   // knob extension from edge

type EdgeKind = 'flat' | 'tab' | 'blank'

function pieceEdges(row: number, col: number): { top: EdgeKind; right: EdgeKind; bottom: EdgeKind; left: EdgeKind } {
  return {
    top:    row === 0 ? 'flat' : row === 1 ? 'blank' : 'tab',
    bottom: row === 2 ? 'flat' : row === 0 ? 'tab'   : 'blank',
    left:   col === 0 ? 'flat' : col === 1 ? 'blank'  : 'tab',
    right:  col === 2 ? 'flat' : col === 0 ? 'tab'    : 'blank',
  }
}

function jigsawPath(row: number, col: number): string {
  const { top, right, bottom, left } = pieceEdges(row, col)
  // Each knob uses two cubics: left arc (base→head) + right arc (head→base)
  // Tab  = knob extends OUT (positive bump direction)
  // Blank = dent goes IN  (negative bump direction)
  const m = MID, n = NW, h = HW, d = HD, nd = ND

  // TOP edge — draw left→right; tab goes up (y<0), blank goes down (y>0)
  const topTab   = `L ${m-n} 0 C ${m-n} ${-nd},${m-h} ${-d},${m} ${-d} C ${m+h} ${-d},${m+n} ${-nd},${m+n} 0 L ${S} 0 `
  const topBlank = `L ${m-n} 0 C ${m-n} ${nd},${m-h} ${d},${m} ${d} C ${m+h} ${d},${m+n} ${nd},${m+n} 0 L ${S} 0 `
  const topFlat  = `L ${S} 0 `

  // RIGHT edge — draw top→bottom; tab goes right (x>S), blank goes left (x<S)
  const rightTab   = `L ${S} ${m-n} C ${S+nd} ${m-n},${S+d} ${m-h},${S+d} ${m} C ${S+d} ${m+h},${S+nd} ${m+n},${S} ${m+n} L ${S} ${S} `
  const rightBlank = `L ${S} ${m-n} C ${S-nd} ${m-n},${S-d} ${m-h},${S-d} ${m} C ${S-d} ${m+h},${S-nd} ${m+n},${S} ${m+n} L ${S} ${S} `
  const rightFlat  = `L ${S} ${S} `

  // BOTTOM edge — draw right→left; tab goes down (y>S), blank goes up (y<S)
  const bottomTab   = `L ${m+n} ${S} C ${m+n} ${S+nd},${m+h} ${S+d},${m} ${S+d} C ${m-h} ${S+d},${m-n} ${S+nd},${m-n} ${S} L 0 ${S} `
  const bottomBlank = `L ${m+n} ${S} C ${m+n} ${S-nd},${m+h} ${S-d},${m} ${S-d} C ${m-h} ${S-d},${m-n} ${S-nd},${m-n} ${S} L 0 ${S} `
  const bottomFlat  = `L 0 ${S} `

  // LEFT edge — draw bottom→top; tab goes left (x<0), blank goes right (x>0)
  const leftTab   = `L 0 ${m+n} C ${-nd} ${m+n},${-d} ${m+h},${-d} ${m} C ${-d} ${m-h},${-nd} ${m-n},0 ${m-n} L 0 0 `
  const leftBlank = `L 0 ${m+n} C ${nd} ${m+n},${d} ${m+h},${d} ${m} C ${d} ${m-h},${nd} ${m-n},0 ${m-n} L 0 0 `
  const leftFlat  = `L 0 0 `

  return 'M 0 0 '
    + (top    === 'flat' ? topFlat    : top    === 'tab' ? topTab    : topBlank)
    + (right  === 'flat' ? rightFlat  : right  === 'tab' ? rightTab  : rightBlank)
    + (bottom === 'flat' ? bottomFlat : bottom === 'tab' ? bottomTab : bottomBlank)
    + (left   === 'flat' ? leftFlat   : left   === 'tab' ? leftTab   : leftBlank)
    + 'Z'
}

// ─── Jigsaw SVG renderer ──────────────────────────────────────────────────────
// Renders the piece image clipped to the jigsaw shape.
// size: rendered px size (viewBox always 0 0 160 160, scaled via width/height)
// boardMode=true → overflow visible so adjacent knobs interlock on the board
// boardMode=false (tray) → hard-clipped to the square, no phantom protrusions
function JigsawSVG({ id, size, glowing, boardMode }: { id: number; size: number; glowing?: boolean; boardMode?: boolean }) {
  const col = id % 3
  const row = Math.floor(id / 3)
  const pathStr = jigsawPath(row, col)
  const clipId   = `jig-clip-${id}`
  const boundsId = `jig-bounds-${id}`

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${S} ${S}`}
      style={{ overflow: boardMode ? 'visible' : 'hidden', display: 'block', flexShrink: 0 }}
    >
      <defs>
        {/* Clips image to the puzzle-piece outline */}
        <clipPath id={clipId}>
          <path d={pathStr}/>
        </clipPath>
        {/* Clips the whole piece to its square bounds (tray mode) */}
        {!boardMode && (
          <clipPath id={boundsId}>
            <rect x="0" y="0" width={S} height={S}/>
          </clipPath>
        )}
        {glowing && (
          <filter id={`jig-glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        )}
      </defs>

      {/* In tray mode wrap everything in a square clip so no tabs bleed outside */}
      <g clipPath={!boardMode ? `url(#${boundsId})` : undefined}>
        <image
          href={studioImg}
          x={-col * S}
          y={-row * S}
          width={3 * S}
          height={3 * S}
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="none"
          filter={glowing ? `url(#jig-glow-${id})` : undefined}
        />
        <path
          d={pathStr}
          fill="none"
          stroke="rgba(196,170,255,.55)"
          strokeWidth="1.5"
          style={{ pointerEvents: 'none' }}
        />
      </g>
    </svg>
  )
}

// ─── Wrong toast ──────────────────────────────────────────────────────────────
function WrongToast({ msg }: { msg: string }) {
  return (
    <div className="animate-toast" style={{
      position: 'fixed', top: 76, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(5,1,18,.97)', backdropFilter: 'blur(18px)',
      border: '1px solid rgba(249,115,22,.5)', borderRadius: 12,
      padding: '10px 22px', zIndex: 52, pointerEvents: 'none',
      display: 'flex', alignItems: 'center', gap: 10,
      boxShadow: '0 8px 30px rgba(0,0,0,.7)',
    }}>
      <span style={{ fontSize: 16 }}>🎬</span>
      <p style={{ fontFamily: "\'Lora\',serif", fontStyle: 'italic', fontSize: 13, color: 'rgba(249,168,212,.9)' }}>
        {msg}
      </p>
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

// ─── Top HUD ──────────────────────────────────────────────────────────────────
function HUD({ guide, totalKeys, butterflies, placedCount, onBack, onMainMenu, onReset, onHint }: {
  guide: GuideChoice; totalKeys: number; butterflies: number
  placedCount: number; onBack: () => void; onMainMenu: () => void; onReset: () => void; onHint: () => void
}) {
  const isMan = guide === "man"
  const { isAr, t } = useLang()
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 64, zIndex: 30,
      background: "linear-gradient(180deg,rgba(24,6,58,1) 0%,rgba(32,9,72,1) 50%,rgba(20,5,50,1) 100%)",
      boxShadow: "0 1px 0 rgba(155,114,207,.2), 0 2px 28px rgba(18,5,48,.75)",
      backdropFilter: "blur(22px)",
      borderBottom: "1px solid rgba(196,170,255,.22)",
      display: "flex", alignItems: "center", padding: "0 16px 0 16px", gap: 10,
    }}>
      <button
        onClick={() => { audio.playReturnGarden(); onBack() }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 18px rgba(196,170,255,.45)'; e.currentTarget.style.borderColor = 'rgba(196,170,255,.65)'; e.currentTarget.style.color = 'rgba(221,205,255,.98)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(196,170,255,.3)'; e.currentTarget.style.color = 'rgba(196,170,255,.82)' }}
        style={{
          display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
          background: "rgba(139,92,246,.14)", border: "1px solid rgba(196,170,255,.3)",
          borderRadius: 8, padding: "6px 14px", cursor: "pointer",
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10.5, color: "rgba(196,170,255,.82)", letterSpacing: isAr ? 0 : ".06em",
          transition: "all .2s",
        }}>{t.back}</button>

      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <div style={{
          width: 60, height: 60, borderRadius: "50%",
          background: isMan ? "linear-gradient(135deg,#1a1568,#4535c0)" : "linear-gradient(135deg,#7b2fb0,#c060c0)",
          border: "1.5px solid rgba(253,230,138,.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", boxShadow: "0 0 16px rgba(139,92,246,.5)",
        }}>
          <CompanionFace guide={guide} size={60} idPrefix="ls_hud" />
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: "rgba(196,170,255,.18)", flexShrink: 0 }}/>

      <div style={{ flexShrink: 0 }}>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 8, color: "rgba(196,170,255,.65)", letterSpacing: isAr ? 0 : ".2em", marginBottom: 1 }}>{isAr ? 'الغرفة الحالية' : 'NOW IN'}</p>
        <h2 style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: 14, color: "rgba(221,205,255,.9)", letterSpacing: isAr ? 0 : ".04em" }}>{isAr ? t.ls_title : 'The Lavender Studio'}</h2>
      </div>

      <div style={{ flex: 1 }}/>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 7.5, color: "rgba(249,168,212,.7)", letterSpacing: isAr ? 0 : ".14em" }}>{isAr ? 'القطع الموضوعة' : 'PIECES PLACED'}</p>
        <div style={{ display: "flex", gap: 4 }}>
          {[...Array(9)].map((_,i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: 4, transition: "all .3s",
              background: i < placedCount ? "rgba(249,168,212,.22)" : "rgba(196,170,255,.07)",
              border: `1px solid ${i < placedCount ? "rgba(249,168,212,.72)" : "rgba(196,170,255,.2)"}`,
              boxShadow: i < placedCount ? "0 0 8px rgba(249,168,212,.4)" : "none",
            }}/>
          ))}
          <span style={{ fontFamily: "\'Cinzel\',serif", fontSize: 11, color: "rgba(253,230,138,.7)", marginLeft: 2 }}>{placedCount}/9</span>
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: "rgba(196,170,255,.18)", flexShrink: 0 }}/>

      <div style={{ display: "flex", gap: 12, flexShrink: 0, alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "\'Cinzel\',serif", fontSize: 7.5, color: "rgba(253,230,138,.58)", letterSpacing: ".09em", marginBottom: 2 }}>🗝 KEYS</p>
          <p style={{ fontFamily: "\'Nunito\',sans-serif", fontSize: 15, color: "#fde68a", fontWeight: 700 }}>{totalKeys}/5</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "\'Cinzel\',serif", fontSize: 7.5, color: "rgba(196,170,255,.58)", letterSpacing: ".09em", marginBottom: 2 }}>🦋</p>
          <p style={{ fontFamily: "\'Nunito\',sans-serif", fontSize: 15, color: "#c4aaff", fontWeight: 700 }}>{butterflies}</p>
        </div>
      </div>

      <div style={{ width: 1, height: 36, background: "rgba(196,170,255,.15)", flexShrink: 0 }}/>

      <div style={{ display: "flex", flexDirection: "row", gap: 6, flexShrink: 0, alignItems: "center" }}>
        <button
          onClick={() => { audio.playReturnGarden(); onMainMenu() }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(253,230,138,.4)'; e.currentTarget.style.borderColor = 'rgba(253,230,138,.75)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(253,230,138,.45)' }}
          style={{
            background: "rgba(253,230,138,.14)", border: "1px solid rgba(253,230,138,.45)",
            borderRadius: 7, padding: "6px 10px", cursor: "pointer",
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10, color: "rgba(253,230,138,.9)", letterSpacing: isAr ? 0 : ".04em", whiteSpace: "nowrap",
            transition: "all .2s",
          }}>{isAr ? '⌂ قائمة' : '⌂ Menu'}</button>
        <button
          onClick={onReset}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 14px rgba(249,168,212,.35)'; e.currentTarget.style.borderColor = 'rgba(249,168,212,.55)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(249,168,212,.3)' }}
          style={{
            background: "rgba(249,168,212,.08)", border: "1px solid rgba(249,168,212,.3)",
            borderRadius: 7, padding: "6px 10px", cursor: "pointer",
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10, color: "rgba(249,168,212,.65)", letterSpacing: isAr ? 0 : ".04em", whiteSpace: "nowrap",
            transition: "all .2s",
          }}>{isAr ? '↺ إعادة' : '↺ Reset'}</button>
        <button onClick={onHint}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 22px rgba(253,230,138,.45)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
          style={{
            background: 'rgba(253,230,138,.1)',
            border: '1px solid rgba(253,230,138,.35)',
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
            fontSize: 10, color: 'rgba(253,230,138,.82)', letterSpacing: isAr ? 0 : '.04em',
            transition: 'all .25s', whiteSpace: 'nowrap',
          }}>
          {isAr ? '✦ تلميح' : '✦ Hint'}
        </button>
      </div>
      <InlineControls />
    </div>
  )
}

// ─── Bottom quest bar ─────────────────────────────────────────────────────────
function QuestBar({ placedCount }: { placedCount: number }) {
  const done = placedCount >= 9
  const { isAr } = useLang()
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 62, zIndex: 30,
      background: "linear-gradient(0deg,rgba(18,4,50,1) 0%,rgba(26,7,62,1) 60%,rgba(20,5,55,1) 100%)",
      boxShadow: "0 -1px 0 rgba(155,114,207,.18), 0 -2px 24px rgba(18,5,48,.7)",
      backdropFilter: "blur(18px)", borderTop: "1px solid rgba(196,170,255,.11)",
      display: "flex", alignItems: "center", padding: "0 28px", gap: 18,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
        background: done ? "#6ee7b7" : "#c4aaff",
        boxShadow: `0 0 10px ${done ? "#6ee7b7" : "#c4aaff"}cc`,
        animation: "glow-pulse 2s infinite",
      }}/>
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 8.5, color: done ? "rgba(110,231,183,.72)" : "rgba(196,170,255,.55)", letterSpacing: isAr ? 0 : ".18em", marginBottom: 3 }}>
          {done ? (isAr ? 'اكتمل المجسم' : 'PUZZLE COMPLETE') : (isAr ? 'مجسم الصورة' : 'IMAGE PUZZLE')}
        </p>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? "normal" : "italic", fontSize: 13, color: "rgba(221,200,255,.85)", lineHeight: 1.5 }}>
          {done
            ? (isAr ? '"الاستوديو مكتمل — القصة جاهزة للرواية."' : '"The studio is whole — the story can be told."')
            : (isAr ? 'اسحب القطع من الصينية وضعها في مواضعها الصحيحة.' : 'Drag the pieces from the tray into their correct positions on the board.')}
        </p>
      </div>
      <div style={{ flexShrink: 0, textAlign: isAr ? "left" : "right" }}>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: 16, color: done ? "rgba(110,231,183,.9)" : "rgba(221,205,255,.8)" }}>
          {isAr ? `القطع: ${placedCount} / 9` : `Pieces Placed: ${placedCount} / 9`}
        </p>
      </div>
    </div>
  )
}

// ─── Intro screen ─────────────────────────────────────────────────────────────
function IntroScreen({ guide, onStart }: { guide: GuideChoice; onStart: () => void }) {
  const isMan = guide === "man"
  const { t, isAr } = useLang()
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 40,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(4,0,14,.72)", backdropFilter: "blur(14px)",
    }}>
      <div className="animate-panel-in" style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        background: "linear-gradient(145deg,rgba(8,2,26,.97),rgba(18,5,46,.98))",
        border: "1.5px solid rgba(196,170,255,.3)", borderRadius: 22, overflow: "hidden",
        maxWidth: 500, width: "90%",
        boxShadow: "0 24px 80px rgba(0,0,0,.7)",
      }}>
        <div style={{ height: 3, width: "100%", background: "linear-gradient(90deg,transparent,#c4aaff,#f9a8d4,#fde68a,transparent)" }}/>

        {/* Guide avatar */}
        <div style={{ padding: "32px 32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: isMan ? "linear-gradient(135deg,#1a1568,#4535c0)" : "linear-gradient(135deg,#7b2fb0,#c060c0)",
            border: "2px solid rgba(253,230,138,.55)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            overflow: "hidden", boxShadow: "0 0 28px rgba(139,92,246,.5)",
          }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              {isMan
                ? <><ellipse cx="40" cy="52" rx="26" ry="22" fill="#2d2a9e"/><ellipse cx="40" cy="32" rx="18" ry="18" fill="#b07848"/><ellipse cx="40" cy="20" rx="24" ry="16" fill="#e0e0f0"/></>
                : <><ellipse cx="40" cy="52" rx="26" ry="22" fill="#9b45d0"/><ellipse cx="40" cy="32" rx="18" ry="18" fill="#c8956a"/><ellipse cx="40" cy="20" rx="24" ry="17" fill="#c090f0"/></>}
            </svg>
          </div>
          <span style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10, color: "rgba(196,170,255,.7)", letterSpacing: isAr ? 0 : ".1em" }}>
            {isMan ? (isAr ? t.guideDuskName : "DUSK") : (isAr ? t.guideDawnName : "DAWN")}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 36px 32px", textAlign: "center" }}>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 9.5, color: "rgba(253,230,138,.65)", letterSpacing: isAr ? 0 : ".22em", marginBottom: 10 }}>
            {t.ls_title}
          </p>
          <h2 style={{
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: 20,
            background: "linear-gradient(135deg,#c4aaff,#f9a8d4,#fde68a)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 16, lineHeight: 1.3,
          }}>{t.ls_storyTitle}</h2>

          <div style={{
            background: "rgba(196,170,255,.07)", border: "1px solid rgba(196,170,255,.2)",
            borderRadius: 14, padding: "18px 20px", marginBottom: 24,
          }}>
            <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? "normal" : "italic", fontSize: 14, color: "rgba(221,205,255,.85)", lineHeight: 1.75 }}>
              {isAr
                ? '"كل قصة تبدأ كقطع متناثرة. أعد تركيب صورة الاستوديو، وستكشف الأعمال المبدعة عن نفسها."'
                : '"Every story begins as scattered pieces. Restore the studio image, and the work created here will reveal itself."'}
            </p>
          </div>

          <button onClick={onStart} style={{
            padding: "13px 52px", borderRadius: 11, cursor: "pointer",
            background: "linear-gradient(135deg,rgba(196,170,255,.24),rgba(139,92,246,.2))",
            border: "1.5px solid rgba(196,170,255,.55)",
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 13, letterSpacing: isAr ? 0 : ".15em",
            color: "rgba(221,205,255,.95)",
            boxShadow: "0 4px 28px rgba(139,92,246,.35)",
            transition: "all .25s",
          }}>
            {isAr ? '✦ ابدأ ✦' : 'Begin ✦'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Puzzle piece (in tray) ────────────────────────────────────────────────────
function TrayPiece({ id, onDragStart }: { id: number; onDragStart: (id: number) => void }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      draggable
      onDragStart={(e) => { e.dataTransfer.setData("pieceId", String(id)); onDragStart(id) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        cursor: "grab",
        userSelect: "none",
        transition: "transform .2s cubic-bezier(.34,1.2,.64,1), filter .2s ease",
        transform: hov ? "scale(1.09) translateY(-3px)" : "scale(1)",
        filter: hov
          ? "drop-shadow(0 0 10px rgba(196,170,255,.75)) drop-shadow(0 0 20px rgba(255,179,230,.45))"
          : "drop-shadow(0 2px 5px rgba(0,0,0,.55))",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 6,
      }}
    >
      <JigsawSVG id={id} size={88} boardMode={false}/>
    </div>
  )
}

// ─── Board slot ────────────────────────────────────────────────────────────────
function BoardSlot({ slotId, placedPieceId, shaking, glowing, onDragOver, onDragLeave, onDrop }: {
  slotId: number; placedPieceId: number | null; shaking: boolean; glowing: boolean
  onDragOver: () => void; onDragLeave: () => void; onDrop: (slotId: number, pieceId: number) => void
}) {
  const [over, setOver] = useState(false)
  const isPlaced = placedPieceId !== null

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!isPlaced) { setOver(true); onDragOver() } }}
      onDragLeave={() => { setOver(false); onDragLeave() }}
      onDrop={(e) => {
        e.preventDefault()
        setOver(false)
        const pieceId = parseInt(e.dataTransfer.getData("pieceId"))
        if (!isNaN(pieceId)) onDrop(slotId, pieceId)
      }}
      style={{
        width: S, height: S, position: "relative",
        border: "none",
        background: "transparent",
        transition: "background .2s",
        animation: shaking ? "card-shake 0.42s ease" : undefined,
        overflow: "visible",
        boxSizing: "border-box",
      }}
    >
      {isPlaced ? (
        <div style={{
          position: "absolute", inset: 0,
          filter: glowing ? "drop-shadow(0 0 8px rgba(110,231,183,.8)) drop-shadow(0 0 18px rgba(110,231,183,.45))" : "none",
          transition: "filter .4s",
        }}>
          <JigsawSVG id={placedPieceId} size={S} glowing={glowing} boardMode={true}/>
        </div>
      ) : (
        // Jigsaw-shaped slot guide — clipped to slot square, no phantom tab outlines
        <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`}
          style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <path
            d={jigsawPath(Math.floor(slotId / 3), slotId % 3)}
            fill={over ? "rgba(196,170,255,.1)" : "rgba(196,170,255,.03)"}
            stroke={over ? "rgba(196,170,255,.7)" : "rgba(196,170,255,.22)"}
            strokeWidth="2" strokeDasharray="7,5"
            style={{ transition: "fill .2s, stroke .2s" }}
          />
          {over && (
            <text x={S / 2} y={S / 2 + 5} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(196,170,255,.5)" fontSize="14" fontFamily="'Cinzel',serif">✦</text>
          )}
        </svg>
      )}
    </div>
  )
}

// ─── Tool badge with hover glow ──────────────────────────────────────────────
function ToolBadge({ label }: { label: string }) {
  const [hov, setHov] = useState(false)
  const { isAr } = useLang()
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "3px 10px", borderRadius: 20, cursor: "default",
        background: hov ? "rgba(196,170,255,.2)" : "rgba(196,170,255,.1)",
        border: `1px solid rgba(196,170,255,${hov ? '.55' : '.25'})`,
        fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
        fontSize: 8.5, color: hov ? "rgba(221,205,255,.95)" : "rgba(196,170,255,.72)",
        letterSpacing: isAr ? 0 : ".06em",
        boxShadow: hov ? "0 0 12px rgba(196,170,255,.35), 0 0 24px rgba(196,170,255,.12)" : "none",
        transition: "all .2s ease",
        display: "inline-block",
      }}
    >{label}</span>
  )
}

// ─── Video card ────────────────────────────────────────────────────────────────
interface VideoProject {
  title: string; badge: string; desc: string
  tools: string[]; embedUrl: string; accent: string
  coverAccent: string; coverEmoji: string
}

function VideoCard({ project, selected, onPlay }: {
  project: VideoProject; selected: boolean; onPlay: () => void
}) {
  const { isAr } = useLang()
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flex: 1, minWidth: 0, width: "100%", display: "flex", flexDirection: "column",
        background: "linear-gradient(145deg,rgba(8,2,26,.97),rgba(18,5,46,.98))",
        border: `1.5px solid ${selected ? project.accent : hov ? "rgba(196,170,255,.5)" : "rgba(196,170,255,.22)"}`,
        borderRadius: 18, overflow: "hidden",
        boxShadow: selected
          ? `0 0 40px ${project.accent}44, 0 0 80px ${project.accent}22, 0 8px 40px rgba(0,0,0,.55)`
          : hov
            ? `0 0 28px rgba(196,170,255,.28), 0 0 56px rgba(196,170,255,.12), 0 8px 32px rgba(0,0,0,.5)`
            : "0 8px 32px rgba(0,0,0,.5)",
        transition: "all .35s cubic-bezier(.22,1,.36,1)",
        transform: hov ? "translateY(-3px)" : "none",
      }}>
      {/* Cover */}
      <div style={{
        height: 160, position: "relative",
        background: `linear-gradient(135deg,${project.coverAccent}44,rgba(4,0,14,.8))`,
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 40% 40%,${project.coverAccent}33,transparent 70%)`,
        }}/>
        <div style={{ fontSize: 64, filter: `drop-shadow(0 0 20px ${project.coverAccent}99)`, zIndex: 1 }}>
          {project.coverEmoji}
        </div>
        {/* Badge */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(4,0,14,.85)", backdropFilter: "blur(10px)",
          border: `1px solid ${project.accent}66`, borderRadius: 20,
          padding: "4px 12px",
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 8.5, letterSpacing: isAr ? 0 : ".14em",
          color: project.accent,
        }}>{project.badge}</div>
        {/* Lavender overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(80,40,130,.28)" }}/>
      </div>

      {/* Content */}
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <h3 style={{
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: isAr ? 15 : 14, lineHeight: 1.4,
          color: "rgba(221,205,255,.95)", marginBottom: 10, fontWeight: isAr ? 700 : undefined,
        }}>{project.title}</h3>

        <p style={{
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? "normal" : "italic", fontSize: 12.5,
          color: "rgba(196,170,255,.65)", lineHeight: 1.7, marginBottom: 14,
        }}>{project.desc}</p>

        {/* Tool badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16, flex: 1, alignContent: "flex-start" }}>
          {project.tools.map(tool => (
            <ToolBadge key={tool} label={tool}/>
          ))}
        </div>

        <button onClick={onPlay}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
            e.currentTarget.style.boxShadow = `0 0 22px ${project.accent}55, 0 0 44px ${project.accent}22`
            e.currentTarget.style.filter = 'brightness(1.12)'
            audio.playHover()
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = selected ? `0 0 20px ${project.accent}33` : 'none'
            e.currentTarget.style.filter = 'none'
          }}
          style={{
            width: "100%", padding: "10px 0", borderRadius: 10, cursor: "pointer",
            background: selected
              ? `linear-gradient(135deg,${project.accent}33,${project.accent}18)`
              : "rgba(139,92,246,.16)",
            border: `1.5px solid ${selected ? project.accent : "rgba(196,170,255,.3)"}`,
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 11, letterSpacing: isAr ? 0 : ".1em",
            color: selected ? project.accent : "rgba(196,170,255,.82)",
            transition: "all .3s",
            boxShadow: selected ? `0 0 20px ${project.accent}33` : "none",
          }}>
          ▶ {isAr ? 'تشغيل الفيديو' : 'Play Video'}
        </button>
      </div>
    </div>
  )
}

// ─── Completion section ────────────────────────────────────────────────────────
function getProjects(isAr: boolean): VideoProject[] {
  return [
    {
      title: isAr ? "فيديو ترويجي لفعالية الأمن السيبراني" : "Cybersecurity Event Promotional Video",
      badge: isAr ? "فيديو ترويجي" : "Promotional Video",
      desc: isAr
        ? "تطوير الفكرة الإبداعية، الإخراج البصري، تنظيم المحتوى، المونتاج، اختيار الصوت، وإنتاج الفيديو النهائي."
        : "Creative concept development, visual direction, content structuring, editing, sound selection, and final video production.",
      tools: ["Canva", "Adobe Express", "Gemini", "ChatGPT"],
      embedUrl: "https://www.youtube.com/embed/gZVfhWyDXL8",
      accent: "#6ee7b7",
      coverAccent: "#6ee7b7",
      coverEmoji: "🛡️",
    },
    {
      title: isAr ? "الوصاية والولاية" : "Guardianship and Custodianship",
      badge: isAr ? "فيديو تعليمي" : "Educational Video",
      desc: isAr
        ? "تحليل المحتوى وتبسيطه، كتابة النص التعليمي، التصميم المرئي، التعليق الصوتي بمساعدة الذكاء الاصطناعي، المونتاج، وإنتاج الفيديو النهائي."
        : "Content analysis and simplification, educational scriptwriting, visual design, AI-assisted voice-over, editing, and final video production.",
      tools: ["Canva", "PowerPoint", "ElevenLabs", "ChatGPT", "Gemini", "Copilot"],
      embedUrl: "https://www.youtube.com/embed/L3bjSK_mgkk",
      accent: "#c4aaff",
      coverAccent: "#c4aaff",
      coverEmoji: "📚",
    },
  ]
}

function CompletionSection({ onBack, onCollect, keyCollected }: { onBack: () => void; onCollect: () => void; keyCollected: boolean }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [playUrl, setPlayUrl] = useState<string | null>(null)
  const [keyHov, setKeyHov] = useState(false)
  const [backHov, setBackHov] = useState(false)
  const { t, isAr } = useLang()
  const PROJECTS = getProjects(isAr)

  const handlePlay = (idx: number) => {
    audio.playFilmClick()
    audio.duckMusic()
    setSelectedIdx(idx)
    setPlayUrl(PROJECTS[idx].embedUrl + "?autoplay=1&rel=0&enablejsapi=1&origin=" + encodeURIComponent(window.location.origin))
  }

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 38, overflowY: "auto",
      background: "rgba(4,0,14,.82)", backdropFilter: "blur(18px)",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "80px 40px 24px",
    }}>
      {/* Completion header */}
      <div className="animate-panel-in" style={{ textAlign: "center", marginBottom: 28 }}>
        {/* Sparkles */}
        <div style={{ position: "relative", marginBottom: 8 }}>
          {[...Array(12)].map((_,i) => {
            const a = (i/12)*Math.PI*2, r = 80
            const c = i%3===0?"#fde68a":i%3===1?"#c4aaff":"#f9a8d4"
            return (
              <div key={i} className="animate-star-twinkle" style={{
                position: "absolute", left: `calc(50% + ${Math.cos(a)*r}px)`, top: `calc(50% + ${Math.sin(a)*r - 20}px)`,
                animationDelay: `${i*.1}s`,
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <polygon points="5,0 6.2,3.8 10,3.8 7,6.1 8.1,10 5,7.6 1.9,10 3,6.1 0,3.8 3.8,3.8" fill={c}/>
                </svg>
              </div>
            )
          })}
          <div style={{ height: 20 }}/>
        </div>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 9.5, letterSpacing: isAr ? 0 : ".28em", color: "rgba(110,231,183,.72)", marginBottom: 8 }}>
          {t.ls_subtitle}
        </p>
        <h2 style={{
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif", fontSize: 28,
          background: "linear-gradient(135deg,#fde68a,#c4aaff,#f9a8d4)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          lineHeight: 1.25, marginBottom: 6,
        }}>{t.ls_roomComplete}</h2>
        <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? "normal" : "italic", fontSize: 13, color: "rgba(196,170,255,.6)" }}>
          {t.ls_guideLabel}
        </p>
      </div>

      {/* Two video cards + key in middle */}
      <div className="animate-panel-in" style={{
        display: "flex", gap: 0, alignItems: "stretch", width: "100%", maxWidth: 900,
        marginBottom: 28,
        animationDelay: ".1s",
      }}>
        {/* Card 1 */}
        <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
          <VideoCard project={PROJECTS[0]} selected={selectedIdx === 0} onPlay={() => handlePlay(0)}/>
        </div>

        {/* Key between cards — manual collect */}
        <div style={{
          flexShrink: 0, width: 110, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
          padding: "0 8px",
        }}>
          {!keyCollected ? (
            <button
              onClick={onCollect}
              onMouseEnter={() => setKeyHov(true)}
              onMouseLeave={() => setKeyHov(false)}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 0,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                transition: "transform .25s cubic-bezier(.34,1.2,.64,1)",
                transform: keyHov ? "translateY(-5px) scale(1.08)" : "none",
              }}
            >
              <div style={{
                animation: "float 3s ease-in-out infinite",
                filter: keyHov
                  ? "drop-shadow(0 0 18px rgba(253,230,138,.95)) drop-shadow(0 0 40px rgba(253,230,138,.6))"
                  : "drop-shadow(0 0 12px rgba(253,230,138,.7))",
                transition: "filter .25s ease",
              }}>
                <GoldenKey size={44}/>
              </div>
              <div style={{
                background: keyHov ? "rgba(253,230,138,.2)" : "rgba(253,230,138,.1)",
                border: "1px solid rgba(253,230,138,.5)", borderRadius: 8,
                padding: "5px 10px", transition: "all .25s",
                boxShadow: keyHov ? "0 0 18px rgba(253,230,138,.4)" : "none",
              }}>
                <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 8, color: "#fde68a", letterSpacing: isAr ? 0 : ".08em", textAlign: "center", whiteSpace: "nowrap" }}>
                  {isAr ? 'اجمع المفتاح الذهبي' : 'Collect Golden Key'}
                </p>
              </div>
            </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, animation: "completion-in .4s ease both" }}>
              <span style={{ filter: "drop-shadow(0 0 10px rgba(253,230,138,.7))" }}><GoldenKey size={36}/></span>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 8, color: "rgba(253,230,138,.65)", letterSpacing: isAr ? 0 : ".08em", textAlign: "center" }}>
                {isAr ? 'تم جمع المفتاح' : 'Key Collected'}
              </p>
            </div>
          )}
        </div>

        {/* Card 2 */}
        <div style={{ flex: 1, minWidth: 0, display: "flex" }}>
          <VideoCard project={PROJECTS[1]} selected={selectedIdx === 1} onPlay={() => handlePlay(1)}/>
        </div>
      </div>

      {/* Shared video player */}
      {playUrl && (
        <div className="animate-panel-in" style={{
          width: "100%", maxWidth: 900, marginBottom: 24,
        }}>
          <div style={{
            background: "rgba(4,0,14,.9)", border: "1px solid rgba(196,170,255,.25)",
            borderRadius: 16, overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,.7)",
          }}>
            {/* Player header */}
            <div style={{
              padding: "12px 18px", borderBottom: "1px solid rgba(196,170,255,.12)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 9.5, color: "rgba(196,170,255,.7)", letterSpacing: isAr ? 0 : ".14em" }}>
                {isAr ? 'يُعرض الآن' : 'NOW PLAYING'}
              </p>
              <p style={{ fontFamily: "\'Lora\',serif", fontStyle: "italic", fontSize: 12, color: "rgba(221,205,255,.8)" }}>
                {selectedIdx !== null ? PROJECTS[selectedIdx].title : ""}
              </p>
              <button onClick={() => { audio.restoreMusic(); setPlayUrl(null); setSelectedIdx(null) }} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "rgba(196,170,255,.5)", fontSize: 18, lineHeight: 1,
              }}>×</button>
            </div>
            {/* iframe — fixed aspect-ratio container */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative' }}>
              <iframe
                key={playUrl}
                src={playUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', display: 'block' }}
                title={selectedIdx !== null ? PROJECTS[selectedIdx].title : 'Video'}
              />
            </div>
            {/* YouTube fallback link */}
            {selectedIdx !== null && (
              <div style={{ padding: '10px 18px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(196,170,255,.1)' }}>
                <a
                  href={PROJECTS[selectedIdx].embedUrl.replace('/embed/', '/watch?v=')}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10,
                    color: 'rgba(196,170,255,.55)', letterSpacing: isAr ? 0 : '.06em', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(196,170,255,.9)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(196,170,255,.55)')}
                >
                  {isAr ? 'مشاهدة على YouTube ↗' : 'Watch on YouTube ↗'}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Back to map */}
      <button
        onClick={() => { audio.playReturnGarden(); onBack() }}
        onMouseEnter={() => setBackHov(true)}
        onMouseLeave={() => setBackHov(false)}
        style={{
          padding: "12px 40px", borderRadius: 10, cursor: "pointer",
          background: backHov ? "rgba(139,92,246,.26)" : "rgba(139,92,246,.16)",
          border: `1px solid rgba(196,170,255,${backHov ? '.65' : '.35'})`,
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 12, letterSpacing: isAr ? 0 : ".1em",
          color: backHov ? "rgba(221,205,255,.98)" : "rgba(196,170,255,.85)", marginBottom: 24,
          boxShadow: backHov ? "0 0 28px rgba(196,170,255,.38), 0 0 56px rgba(196,170,255,.15)" : "none",
          transform: backHov ? "translateY(-2px)" : "none",
          transition: "all .25s cubic-bezier(.22,1,.36,1)",
        }}>{isAr ? 'العودة إلى الحديقة →' : '← Back to Garden'}</button>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LavenderStudio({ guide, onBack, hasKey, butterflies, totalKeys, onKeyCollected, onMainMenu, onReset }: {
  guide: GuideChoice; onBack: () => void; hasKey: boolean
  butterflies: number; totalKeys: number; onKeyCollected: () => void
  onMainMenu: () => void; onReset: () => void
}) {
  const { t, isAr } = useLang()
  const [phase, setPhase] = useState<Phase>(hasKey ? "complete" : "intro")
  const [placed, setPlaced] = useState<(number | null)[]>(
    hasKey ? [0,1,2,3,4,5,6,7,8] : Array(9).fill(null)
  )
  const [shakingSlot, setShakingSlot] = useState<number | null>(null)
  const [glowingSlot, setGlowingSlot] = useState<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const [wrongMsg, setWrongMsg] = useState<string | null>(null)
  const [keyCollected, setKeyCollected] = useState(hasKey)
  const [showHint, setShowHint] = useState(false)

  const shakeRef = useRef<number>(undefined)
  const glowRef  = useRef<number>(undefined)
  const wrongRef = useRef<number>(undefined)

  // Shuffle tray order once
  const trayOrder = useMemo(() => shuffle([0,1,2,3,4,5,6,7,8]), [])

  useEffect(() => {
    audio.startAmbient("studio")
    return () => audio.stopAmbient()
  }, [])

  const placedCount = placed.filter(p => p !== null).length

  // Pieces not yet placed
  const trayPieces = trayOrder.filter(id => !placed.includes(id))

  // Completion trigger — only transitions phase; key must be clicked manually
  useEffect(() => {
    if (placedCount >= 9 && phase === "puzzle") {
      const t = window.setTimeout(() => {
        audio.playPuzzleComplete()
        setPhase("complete")
      }, 600)
      return () => clearTimeout(t)
    }
  }, [placedCount, phase])

  const handleDrop = useCallback((slotId: number, pieceId: number) => {
    if (placed[slotId] !== null) return
    if (placed.includes(pieceId)) return
    if (pieceId === slotId) {
      // Correct
      audio.playPageTurn()
      setPlaced(prev => { const n = [...prev]; n[slotId] = pieceId; return n })
      setGlowingSlot(slotId)
      clearTimeout(glowRef.current)
      glowRef.current = window.setTimeout(() => setGlowingSlot(null), 1200)
    } else {
      // Wrong
      audio.playIncorrect()
      setShakingSlot(slotId)
      clearTimeout(shakeRef.current)
      shakeRef.current = window.setTimeout(() => setShakingSlot(null), 500)
      setWrongMsg(t.ls_wrongMsg)
      clearTimeout(wrongRef.current)
      wrongRef.current = window.setTimeout(() => setWrongMsg(null), 2400)
    }
    setDragging(null)
  }, [placed])

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative", background: "#06011a" }}>
      <StudioScene shake={false}/>

      {/* Dust motes */}
      {[...Array(16)].map((_,i) => (
        <div key={i} className="particle" style={{
          position: "absolute",
          left: `${(i*131+17)%100}%`,
          top: `${(i*77+12)%72}%`,
          width: 3, height: 3, borderRadius: "50%", zIndex: 2, pointerEvents: "none",
          background: i%3===0 ? "rgba(253,230,138,.55)" : i%3===1 ? "rgba(196,170,255,.5)" : "rgba(249,168,212,.5)",
          "--drift": `${(i%5-2)*20}px`,
          animationDelay: `${i*.38}s`,
        } as React.CSSProperties}/>
      ))}

      {/* Intro overlay */}
      {phase === "intro" && (
        <CompanionIntro guide={guide} room="studio" onStart={() => setPhase("puzzle")} />
      )}

      {/* Puzzle phase */}
      {phase === "puzzle" && (
        <div style={{
          position: "absolute", left: 0, right: 0,
          top: 62, bottom: 62,
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: 32, padding: "12px 20px",
          zIndex: 10,
        }}>
          {/* Puzzle board — always LTR so Arabic mode doesn't mirror piece order */}
          <div dir="ltr" style={{
            display: "grid", gridTemplateColumns: `repeat(3, ${S}px)`, gridTemplateRows: `repeat(3, ${S}px)`,
            gap: 0,
            background: "rgba(4,0,14,.7)", borderRadius: 12, padding: 12,
            border: "1px solid rgba(196,170,255,.18)",
            boxShadow: "0 8px 50px rgba(0,0,0,.7)",
            overflow: "visible",
          }}>
            {[0,1,2,3,4,5,6,7,8].map(slotId => (
              <BoardSlot
                key={slotId}
                slotId={slotId}
                placedPieceId={placed[slotId]}
                shaking={shakingSlot === slotId}
                glowing={glowingSlot === slotId}
                onDragOver={() => {}}
                onDragLeave={() => {}}
                onDrop={handleDrop}
              />
            ))}
          </div>

          {/* Tray — always LTR */}
          <div dir="ltr" style={{
            width: 224,
            background: "rgba(4,0,14,.88)", borderRadius: 14, padding: "14px 12px",
            border: "1px solid rgba(196,170,255,.2)",
            boxShadow: "0 8px 40px rgba(0,0,0,.6)",
            display: "flex", flexDirection: "column", gap: 10, alignSelf: "center",
          }}>
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 8.5, color: "rgba(253,230,138,.65)", letterSpacing: isAr ? 0 : ".18em", marginBottom: 2 }}>
                {isAr ? 'صينية القطع' : 'PIECE TRAY'}
              </p>
              <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? "normal" : "italic", fontSize: 11, color: "rgba(196,170,255,.42)" }}>
                {trayPieces.length === 0 ? (isAr ? 'وُضعت جميع القطع!' : 'All pieces placed!') : (isAr ? 'اسحب إلى اللوحة' : 'Drag to the board')}
              </p>
            </div>

            {trayPieces.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✦</div>
                <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 10, color: "rgba(110,231,183,.7)" }}>{isAr ? 'مكتمل!' : 'Complete!'}</p>
              </div>
            ) : (
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: 4, justifyItems: "center",
                maxHeight: 420, overflowY: "auto",
              }}>
                {trayPieces.map(id => (
                  <TrayPiece key={id} id={id} onDragStart={setDragging}/>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complete phase */}
      {phase === "complete" && (
        <CompletionSection
          onBack={() => { audio.playReturnGarden(); onBack() }}
          keyCollected={keyCollected}
          onCollect={() => { if (!keyCollected) { setKeyCollected(true); onKeyCollected() } }}
        />
      )}

      {/* HUD */}
      <HUD
        guide={guide} totalKeys={totalKeys} butterflies={butterflies}
        placedCount={placedCount}
        onBack={() => { audio.playReturnGarden(); onBack() }}
        onMainMenu={onMainMenu} onReset={onReset} onHint={() => setShowHint(true)}
      />

      {showHint && <HintOverlay onClose={() => setShowHint(false)} isAr={isAr}
        hintEn="Click Play Video on each card to watch the video. Click the key in the middle to collect it."
        hintAr="انقر على زر تشغيل الفيديو في كل بطاقة. انقر على المفتاح في المنتصف لجمعه." />}

      {/* Quest bar */}
      {phase === "puzzle" && <QuestBar placedCount={placedCount}/>}

      {/* Wrong toast */}
      {wrongMsg && <WrongToast msg={wrongMsg}/>}

      {/* Already completed */}
      {hasKey && phase === "puzzle" && (
        <div style={{
          position: "absolute", top: 70, left: "50%", transform: "translateX(-50%)", zIndex: 20,
          background: "rgba(5,1,18,.92)", border: "1px solid rgba(110,231,183,.4)",
          borderRadius: 10, padding: "7px 20px", backdropFilter: "blur(16px)",
          display: "flex", alignItems: "center", gap: 9,
        }}>
          <span style={{filter:'drop-shadow(0 0 4px rgba(253,230,138,.7))'}}><GoldenKey size={13}/></span>
          <p style={{ fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize: 9.5, color: "rgba(110,231,183,.85)", letterSpacing: isAr ? 0 : ".1em" }}>
            {t.ls_roomComplete}
          </p>
        </div>
      )}
    </div>
  )
}
