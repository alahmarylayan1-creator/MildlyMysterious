import { useState, useCallback, useRef, useEffect } from 'react'
import type { GuideChoice } from './GardenHub'
import { audio } from './sound/engine'
import { useLang, InlineControls } from './LangContext'
import GoldenKey from './GoldenKey'
import { CompanionIntro, CompanionFace } from './CompanionIntro'

// ─── Types ────────────────────────────────────────────────────────────────────
type ObjId = 'journal' | 'scroll' | 'camera'
type RevealId = 'curtain' | 'wardrobe' | 'shelf1' | 'shelf2' | 'drawer' | 'mirror'

const TARGET_IDS: ObjId[] = ['journal', 'scroll', 'camera']

const CLUES: Array<{ id: ObjId; icon: string; accent: string }> = [
  { id: 'journal', icon: '📖', accent: '#c4aaff' },
  { id: 'scroll',  icon: '📜', accent: '#f9a8d4' },
  { id: 'camera',  icon: '📷', accent: '#fde68a' },
]

// Which reveal spot hides which target (null = decoy)
const REVEAL_TARGETS: Record<RevealId, ObjId | null> = {
  curtain: 'journal', wardrobe: 'camera', shelf1: 'scroll',
  shelf2: null, drawer: null, mirror: null,
}

// ─── Room scene SVG ───────────────────────────────────────────────────────────
function RoomScene() {
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}
      viewBox="0 0 1440 768" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="prWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#130430"/><stop offset="60%" stopColor="#1e0845"/><stop offset="100%" stopColor="#160638"/>
        </linearGradient>
        <linearGradient id="prFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c0226"/><stop offset="100%" stopColor="#060114"/>
        </linearGradient>
        <linearGradient id="prShelf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a1008"/><stop offset="100%" stopColor="#1e0805"/>
        </linearGradient>
        <linearGradient id="prDesk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5c2810"/><stop offset="100%" stopColor="#3a1806"/>
        </linearGradient>
        <radialGradient id="prWinGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="rgba(196,170,255,.62)"/>
          <stop offset="45%" stopColor="rgba(120,60,220,.3)"/>
          <stop offset="100%" stopColor="rgba(60,10,140,.0)"/>
        </radialGradient>
        <radialGradient id="prMoonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(230,220,255,.9)"/>
          <stop offset="100%" stopColor="rgba(180,160,240,.6)"/>
        </radialGradient>
        <radialGradient id="prRug" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="rgba(120,50,180,.42)"/>
          <stop offset="65%" stopColor="rgba(70,20,130,.28)"/>
          <stop offset="100%" stopColor="rgba(30,5,80,.0)"/>
        </radialGradient>
        <radialGradient id="prCandle" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(253,200,80,.55)"/>
          <stop offset="100%" stopColor="rgba(220,100,20,.0)"/>
        </radialGradient>
        <filter id="prG8"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="prG16"><feGaussianBlur stdDeviation="16" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="prBlur4"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>

      {/* ── BACK WALL ── */}
      <rect x="0" y="0" width="1440" height="320" fill="url(#prWall)"/>
      {/* Subtle wall panels */}
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={i*210+8} y="228" width="196" height="90" rx="3"
          fill="rgba(255,255,255,.016)" stroke="rgba(100,55,180,.14)" strokeWidth="1"/>
      ))}
      {/* Chair rail */}
      <rect x="0" y="225" width="1440" height="5" fill="rgba(80,40,140,.38)"/>

      {/* ── CEILING ── */}
      <rect x="0" y="0" width="1440" height="24" fill="rgba(12,4,30,.95)"/>
      <rect x="0" y="20" width="1440" height="6" fill="rgba(60,25,120,.4)"/>
      {/* Cross beams */}
      {[160,400,640,880,1120,1360].map(x => (
        <rect key={x} x={x} y="0" width="22" height="24" fill="rgba(18,7,42,.8)"/>
      ))}
      {/* ─ Fairy lights ─ */}
      {[...Array(20)].map((_,i) => {
        const x = i*72+18, swing = Math.sin(i*1.3)*12
        return (
          <g key={i}>
            <path d={`M${x},22 Q${x+swing},32 ${x+16},30`} stroke="rgba(180,140,60,.22)" strokeWidth="0.8" fill="none"/>
            <circle cx={x+8+swing*.5} cy="30" r="4"
              fill="rgba(253,230,138,.78)" className="animate-star-twinkle" style={{animationDelay:`${i*.14}s`}}/>
            <circle cx={x+8+swing*.5} cy="30" r="9" fill="rgba(253,230,138,.16)" filter="url(#prBlur4)"/>
          </g>
        )
      })}

      {/* ── BOOKSHELF LEFT ── */}
      <rect x="40" y="18" width="312" height="308" fill="url(#prShelf)"/>
      <rect x="38" y="16" width="316" height="312" fill="none" stroke="rgba(100,50,160,.35)" strokeWidth="2"/>
      <rect x="38" y="16" width="10" height="312" fill="rgba(20,8,48,.9)"/>
      <rect x="344" y="16" width="10" height="312" fill="rgba(20,8,48,.8)"/>
      {/* Shelves */}
      {[72,134,196,258].map(y => (
        <rect key={y} x="38" y={y} width="316" height="9" fill="rgba(50,22,90,.85)" stroke="rgba(70,35,120,.4)" strokeWidth="1"/>
      ))}
      {/* Books on each shelf */}
      {[
        // shelf 1 (y=18–72)
        {x:50,y:20,h:50,w:17,c:'#c4aaff'},{x:69,y:26,h:44,w:13,c:'#f9a8d4'},{x:84,y:22,h:48,w:19,c:'#fde68a'},
        {x:105,y:24,h:46,w:15,c:'#ffb3e6'},{x:122,y:20,h:50,w:21,c:'#c4aaff'},{x:145,y:26,h:44,w:13,c:'#ff9edb'},
        {x:160,y:22,h:48,w:18,c:'#c8b1e4'},{x:180,y:24,h:46,w:15,c:'#fde68a'},{x:197,y:20,h:50,w:19,c:'#c4aaff'},
        {x:218,y:26,h:44,w:13,c:'#f9a8d4'},{x:233,y:22,h:48,w:21,c:'#ffb3e6'},{x:256,y:20,h:50,w:17,c:'#fde68a'},
        {x:275,y:24,h:46,w:15,c:'#c4aaff'},{x:292,y:20,h:50,w:19,c:'#ff9edb'},{x:313,y:26,h:44,w:21,c:'#c8b1e4'},
        // shelf 2
        {x:50,y:82,h:50,w:19,c:'#fde68a'},{x:71,y:88,h:44,w:13,c:'#c4aaff'},{x:86,y:82,h:50,w:17,c:'#f9a8d4'},
        {x:105,y:86,h:46,w:15,c:'#ffb3e6'},{x:122,y:82,h:50,w:21,c:'#fde68a'},{x:145,y:88,h:44,w:13,c:'#c4aaff'},
        {x:160,y:82,h:50,w:18,c:'#ff9edb'},{x:180,y:86,h:46,w:19,c:'#c8b1e4'},{x:201,y:82,h:50,w:15,c:'#fde68a'},
        {x:218,y:88,h:44,w:13,c:'#c4aaff'},{x:233,y:82,h:50,w:21,c:'#f9a8d4'},{x:256,y:86,h:46,w:15,c:'#ffb3e6'},
        {x:273,y:82,h:50,w:17,c:'#fde68a'},{x:292,y:88,h:44,w:21,c:'#c4aaff'},{x:315,y:82,h:50,w:17,c:'#ff9edb'},
        // shelf 3
        {x:50,y:144,h:50,w:15,c:'#c8b1e4'},{x:67,y:148,h:46,w:19,c:'#f9a8d4'},{x:88,y:144,h:50,w:13,c:'#fde68a'},
        {x:103,y:148,h:46,w:21,c:'#c4aaff'},{x:126,y:144,h:50,w:17,c:'#ffb3e6'},{x:145,y:148,h:46,w:13,c:'#ff9edb'},
        {x:160,y:144,h:50,w:19,c:'#fde68a'},{x:181,y:148,h:46,w:15,c:'#c4aaff'},{x:198,y:144,h:50,w:21,c:'#f9a8d4'},
        {x:221,y:148,h:46,w:13,c:'#c8b1e4'},{x:236,y:144,h:50,w:17,c:'#fde68a'},{x:255,y:148,h:46,w:19,c:'#c4aaff'},
        {x:276,y:144,h:50,w:15,c:'#ff9edb'},{x:293,y:144,h:50,w:21,c:'#ffb3e6'},{x:316,y:148,h:46,w:15,c:'#fde68a'},
        // shelf 4
        {x:50,y:206,h:50,w:17,c:'#c4aaff'},{x:69,y:212,h:44,w:13,c:'#fde68a'},{x:84,y:206,h:50,w:19,c:'#f9a8d4'},
        {x:105,y:210,h:46,w:15,c:'#ffb3e6'},{x:122,y:206,h:50,w:21,c:'#c4aaff'},{x:145,y:212,h:44,w:13,c:'#fde68a'},
        {x:160,y:206,h:50,w:17,c:'#ff9edb'},{x:179,y:210,h:46,w:19,c:'#c8b1e4'},{x:200,y:206,h:50,w:15,c:'#fde68a'},
        {x:217,y:212,h:44,w:13,c:'#c4aaff'},{x:232,y:206,h:50,w:21,c:'#f9a8d4'},{x:255,y:210,h:46,w:15,c:'#ffb3e6'},
        {x:272,y:206,h:50,w:17,c:'#fde68a'},{x:291,y:210,h:44,w:21,c:'#c4aaff'},{x:314,y:206,h:50,w:17,c:'#ff9edb'},
      ].map((b,i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="1" fill={b.c} opacity=".52"/>
          <rect x={b.x} y={b.y} width={3} height={b.h} fill="rgba(255,255,255,.14)" rx="1"/>
          <rect x={b.x} y={b.y} width={b.w} height="3" fill="rgba(255,255,255,.15)" rx=".5"/>
        </g>
      ))}
      {/* Shelf plant */}
      <rect x="172" y="269" width="36" height="44" rx="5" fill="#7a3812" opacity=".8"/>
      <rect x="166" y="269" width="48" height="8" rx="3" fill="#6a3010" opacity=".75"/>
      {[[184,260,10,40],[192,248,7,30],[178,252,8,28]].map(([x,y,rx,h],i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={h/4+2}
          fill="rgba(48,100,32,.65)" transform={`rotate(${-15+i*14} ${x} ${y})`}/>
      ))}
      <path d="M190,268 Q178,248 174,238" stroke="rgba(38,80,24,.6)" strokeWidth="2" fill="none"/>
      <path d="M190,268 Q200,245 204,236" stroke="rgba(38,80,24,.5)" strokeWidth="1.5" fill="none"/>

      {/* ── VELVET CURTAINS flanking window ── */}
      {/* Left curtain panel — drapes from ceiling at window's left edge */}
      <path d="M546,0 Q538,44 544,110 Q536,185 542,260 Q534,305 540,320"
        fill="rgba(90,38,160,.48)" stroke="rgba(120,60,200,.32)" strokeWidth="1"/>
      <path d="M560,0 Q552,52 558,118 Q550,194 556,270 Q548,314 554,768"
        fill="rgba(70,28,140,.44)" stroke="none"/>
      {/* Curtain folds — left */}
      {[35,85,140,200,265,340,450,580,680].map((y,i) => (
        <path key={i} d={`M554,${y} Q548,${y+12} 554,${y+24}`}
          fill="rgba(50,18,110,.38)" stroke="none"/>
      ))}
      {/* Left curtain tieback */}
      <path d="M548,300 Q534,312 542,326 Q552,314 560,326 Q568,312 554,300 Z"
        fill="rgba(253,230,138,.45)" stroke="rgba(220,180,60,.4)" strokeWidth="1"/>
      {/* Left curtain pooling on floor */}
      <ellipse cx="550" cy="762" rx="32" ry="8" fill="rgba(70,26,140,.55)"/>
      <path d="M524,320 Q518,500 522,768" fill="rgba(70,28,140,.52)" stroke="none"/>
      <path d="M536,320 Q530,520 534,768" fill="rgba(80,32,155,.4)" stroke="none"/>

      {/* Right curtain panel */}
      <path d="M894,0 Q902,48 896,115 Q904,188 898,262 Q906,308 900,320"
        fill="rgba(90,38,160,.46)" stroke="rgba(120,60,200,.28)" strokeWidth="1"/>
      <path d="M880,0 Q888,55 882,122 Q890,198 884,274 Q892,316 886,768"
        fill="rgba(72,30,142,.42)" stroke="none"/>
      {/* Curtain folds — right */}
      {[40,92,148,208,275,355,460,590,700].map((y,i) => (
        <path key={i} d={`M886,${y} Q892,${y+12} 886,${y+24}`}
          fill="rgba(50,18,110,.35)" stroke="none"/>
      ))}
      {/* Right curtain tieback */}
      <path d="M892,300 Q906,312 898,326 Q888,314 880,326 Q872,312 886,300 Z"
        fill="rgba(253,230,138,.42)" stroke="rgba(220,180,60,.35)" strokeWidth="1"/>
      {/* Right curtain pooling on floor */}
      <ellipse cx="890" cy="762" rx="32" ry="8" fill="rgba(68,24,138,.52)"/>
      <path d="M916,320 Q922,510 918,768" fill="rgba(68,26,138,.5)" stroke="none"/>
      <path d="M904,320 Q910,530 906,768" fill="rgba(78,30,152,.38)" stroke="none"/>

      {/* ── FLOOR WICKER BASKET near cat / writing desk ── */}
      {/* Large basket body */}
      <path d="M86,558 Q80,540 88,522 Q96,508 126,508 Q160,508 166,522 Q172,540 166,558 Q156,580 126,582 Q98,580 86,558 Z"
        fill="rgba(120,70,18,.82)" stroke="rgba(180,110,30,.5)" strokeWidth="1.5"/>
      {/* Weave lines */}
      {[522,534,546,558,570].map((y,i) => (
        <path key={i} d={`M90,${y} Q128,${y-4} 165,${y}`}
          stroke="rgba(160,100,26,.45)" strokeWidth="1.5" fill="none"/>
      ))}
      {[96,110,126,142,156].map((x,i) => (
        <line key={i} x1={x} y1="510" x2={x-6} y2="578"
          stroke="rgba(100,56,14,.35)" strokeWidth="1" />
      ))}
      {/* Basket rim */}
      <ellipse cx="126" cy="510" rx="40" ry="12" fill="rgba(150,92,24,.88)" stroke="rgba(200,140,40,.5)" strokeWidth="1.5"/>
      {/* Lavender bundles inside basket */}
      {[[108,502],[124,498],[140,502]].map(([x,y],i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x-4+i*4} y2={y-22} stroke="rgba(38,80,24,.6)" strokeWidth="1.5"/>
          {[0,1,2].map(j => (
            <ellipse key={j} cx={x-3+j*3+i*2} cy={y-22-j*5} rx="3" ry="5"
              fill="#c4aaff" opacity=".72" transform={`rotate(${-10+j*10} ${x-3+j*3+i*2} ${y-22-j*5})`}/>
          ))}
        </g>
      ))}

      {/* ── FLOOR POUFFE near vanity ── */}
      <ellipse cx="1290" cy="518" rx="52" ry="28" fill="rgba(100,48,180,.55)" stroke="rgba(160,100,255,.38)" strokeWidth="1.5"/>
      <ellipse cx="1290" cy="510" rx="46" ry="22" fill="rgba(120,60,200,.38)"/>
      {/* Tassels */}
      {[0,60,120,180,240,300].map(a => (
        <line key={a}
          x1={1290+Math.cos(a*Math.PI/180)*46} y1={510+Math.sin(a*Math.PI/180)*22}
          x2={1290+Math.cos(a*Math.PI/180)*52} y2={510+Math.sin(a*Math.PI/180)*26}
          stroke="rgba(253,230,138,.55)" strokeWidth="2"/>
      ))}
      {/* Embroidered center motif */}
      <circle cx="1290" cy="510" r="12" fill="none" stroke="rgba(253,230,138,.3)" strokeWidth="1.5"/>
      <circle cx="1290" cy="510" r="5" fill="rgba(253,230,138,.25)"/>

      {/* ── LAVENDER BASKET near crystal area ── */}
      <path d="M944,462 Q938,446 946,432 Q952,420 972,420 Q994,420 1000,432 Q1006,446 1000,462 Q992,476 972,478 Q950,476 944,462 Z"
        fill="rgba(100,55,14,.78)" stroke="rgba(160,100,26,.45)" strokeWidth="1.5"/>
      {/* Weave */}
      {[434,445,455,465].map((y,i) => (
        <path key={i} d={`M947,${y} Q972,${y-3} 997,${y}`}
          stroke="rgba(140,90,22,.4)" strokeWidth="1.2" fill="none"/>
      ))}
      {/* Rim */}
      <ellipse cx="972" cy="424" rx="28" ry="8" fill="rgba(130,78,20,.85)" stroke="rgba(190,130,38,.48)" strokeWidth="1.5"/>
      {/* Lavender sprigs */}
      {[[960,415],[972,410],[984,415]].map(([x,y],i) => (
        <g key={i}>
          <line x1={x} y1={y} x2={x+2-i*2} y2={y-18} stroke="rgba(38,80,24,.55)" strokeWidth="1.5"/>
          {[0,1,2].map(j => (
            <ellipse key={j} cx={x+1-i*2} cy={y-18-j*4} rx="2.5" ry="4"
              fill="#c4aaff" opacity=".75" transform={`rotate(${-8+j*8} ${x+1} ${y-18-j*4})`}/>
          ))}
        </g>
      ))}

      {/* ── CIRCULAR WINDOW ── */}
      {/* Outer ambient glow */}
      <circle cx="720" cy="172" r="200" fill="url(#prWinGlow)" filter="url(#prG16)"/>
      {/* Stone frame */}
      <circle cx="720" cy="172" r="152" fill="rgba(8,2,24,.9)" stroke="rgba(130,85,210,.48)" strokeWidth="5"/>
      {/* Inner carved rings */}
      <circle cx="720" cy="172" r="152" fill="none" stroke="rgba(80,45,150,.32)" strokeWidth="3" strokeDasharray="7,5"/>
      <circle cx="720" cy="172" r="142" fill="none" stroke="rgba(100,55,170,.25)" strokeWidth="2"/>
      {/* Frame jewel ornaments at NSEW */}
      {[0,90,180,270].map(deg => {
        const a=deg*Math.PI/180
        return (
          <g key={deg}>
            <circle cx={720+Math.cos(a)*152} cy={172+Math.sin(a)*152} r="10"
              fill="rgba(90,45,160,.7)" stroke="rgba(196,170,255,.55)" strokeWidth="1.5"/>
            <circle cx={720+Math.cos(a)*152} cy={172+Math.sin(a)*152} r="4.5" fill="rgba(196,170,255,.8)"/>
          </g>
        )
      })}
      {/* Night sky inside */}
      <circle cx="720" cy="172" r="135" fill="rgba(8,2,26,.97)"/>
      <circle cx="720" cy="172" r="135" fill="url(#prWinGlow)" opacity=".35"/>
      {/* Stars */}
      {[[692,88],[718,76],[742,92],[698,118],[744,106],[716,130],[734,80],[706,100]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={i%3===0?2.5:1.5} fill="white" opacity={.55+i*.05}
          className="animate-star-twinkle" style={{animationDelay:`${i*.22}s`}}/>
      ))}
      {/* Moon */}
      <circle cx="714" cy="116" r="30" fill="url(#prMoonGlow)"/>
      <circle cx="724" cy="111" r="26" fill="rgba(8,2,26,.8)"/>
      <circle cx="714" cy="116" r="42" fill="rgba(196,170,255,.1)" filter="url(#prG8)"/>
      {/* Silhouette garden through window */}
      <path d="M585,307 Q598,272 618,284 Q630,252 650,272 Q668,238 690,260 Q708,228 720,252 Q732,226 744,250 Q762,234 782,266 Q802,250 826,278 Q848,260 855,307 Z"
        fill="rgba(5,1,18,.96)"/>
      <path d="M585,307 Q594,290 604,295 Q612,278 622,286 Q632,264 642,274 Q648,256 658,266 Q668,244 678,254 Q690,234 700,246 Q710,228 720,240 Q730,230 740,242 Q752,226 762,240 Q774,246 784,236 Q794,246 808,252 Q820,260 836,278 Q848,268 855,307 Z"
        fill="rgba(7,2,20,.94)"/>
      {/* Window seat */}
      <rect x="548" y="308" width="344" height="44" rx="6" fill="rgba(70,30,130,.6)" stroke="rgba(100,55,180,.42)" strokeWidth="2"/>
      <rect x="553" y="311" width="334" height="36" rx="5" fill="rgba(90,40,150,.38)"/>
      {[572,624,676,728,780,832].map(x => (
        <circle key={x} cx={x} cy="329" r="14" fill="none" stroke="rgba(196,170,255,.18)" strokeWidth="1"/>
      ))}

      {/* ── VANITY MIRROR RIGHT ── */}
      {/* Table */}
      <rect x="1072" y="196" width="342" height="136" rx="5" fill="url(#prDesk)" stroke="rgba(100,55,25,.55)" strokeWidth="2"/>
      <rect x="1074" y="198" width="338" height="18" rx="3" fill="rgba(80,40,18,.5)"/>
      {/* Table legs */}
      <rect x="1082" y="332" width="16" height="138" rx="3" fill="rgba(50,22,7,.9)"/>
      <rect x="1382" y="332" width="16" height="138" rx="3" fill="rgba(50,22,7,.9)"/>
      <rect x="1148" y="332" width="14" height="110" rx="3" fill="rgba(50,22,7,.75)"/>
      <rect x="1318" y="332" width="14" height="110" rx="3" fill="rgba(50,22,7,.75)"/>
      {/* Oval mirror */}
      <ellipse cx="1243" cy="126" rx="122" ry="152" fill="rgba(5,1,18,.92)" stroke="rgba(200,155,55,.6)" strokeWidth="4"/>
      <ellipse cx="1243" cy="126" rx="115" ry="145" fill="rgba(8,2,24,.88)" stroke="rgba(160,120,40,.3)" strokeWidth="2"/>
      {/* Mirror sheen */}
      <ellipse cx="1212" cy="82" rx="22" ry="46" fill="rgba(255,255,255,.035)" transform="rotate(-12 1212 82)"/>
      {/* Mirror subtle reflection */}
      <ellipse cx="1243" cy="126" rx="115" ry="145" fill="url(#prWinGlow)" opacity=".07"/>
      {/* Frame top ornament */}
      <ellipse cx="1243" cy="-26" rx="122" ry="152" fill="none" stroke="rgba(200,155,55,.25)" strokeWidth="1" strokeDasharray="5,4"/>
      {/* Perfume bottles */}
      {([
        [1092,196,16,30,'rgba(196,170,255,.52)'],[1112,190,12,36,'rgba(249,168,212,.48)'],
        [1128,196,18,28,'rgba(253,230,138,.42)'],[1344,194,14,34,'rgba(255,179,230,.44)'],
        [1362,196,16,30,'rgba(249,168,212,.48)'],
      ] as [number,number,number,number,string][]).map(([x,y,w,h,c],i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} rx="4" fill={c} stroke="rgba(255,255,255,.18)" strokeWidth="1"/>
          <rect x={x+2} y={y-7} width={w-4} height="9" rx="2" fill="rgba(160,120,200,.48)"/>
        </g>
      ))}
      {/* Vanity flowers */}
      <ellipse cx="1288" cy="196" rx="30" ry="22" fill="rgba(120,60,200,.22)"/>
      {[0,60,120,180,240,300].map(a => (
        <ellipse key={a} cx={1288+Math.cos(a*Math.PI/180)*15} cy={193+Math.sin(a*Math.PI/180)*10}
          rx="8" ry="11" fill="#f9a8d4" opacity=".62"
          transform={`rotate(${a} ${1288+Math.cos(a*Math.PI/180)*15} ${193+Math.sin(a*Math.PI/180)*10})`}/>
      ))}
      <circle cx="1288" cy="193" r="5.5" fill="#fde68a" opacity=".9"/>

      {/* ── FLOOR ── */}
      <rect x="0" y="320" width="1440" height="448" fill="url(#prFloor)"/>
      {/* Wood grain planks */}
      {[...Array(14)].map((_,i) => (
        <line key={i} x1="0" y1={320+i*32} x2="1440" y2={320+i*32} stroke="rgba(50,15,90,.22)" strokeWidth="1"/>
      ))}
      {[80,260,440,620,800,980,1160,1340].map(x => (
        <line key={x} x1={x} y1="320" x2={x-60} y2="768" stroke="rgba(40,12,70,.18)" strokeWidth="1"/>
      ))}
      {/* Central oval rug */}
      <ellipse cx="720" cy="580" rx="390" ry="148" fill="url(#prRug)"/>
      <ellipse cx="720" cy="580" rx="390" ry="148" fill="none" stroke="rgba(160,120,255,.2)" strokeWidth="2.5"/>
      <ellipse cx="720" cy="580" rx="350" ry="124" fill="none" stroke="rgba(253,230,138,.12)" strokeWidth="1.5"/>
      <ellipse cx="720" cy="580" rx="290" ry="98" fill="none" stroke="rgba(160,120,255,.14)" strokeWidth="1"/>
      <ellipse cx="720" cy="580" rx="200" ry="64" fill="none" stroke="rgba(253,230,138,.1)" strokeWidth="1"/>
      {[0,60,120,180,240,300].map(a => (
        <ellipse key={a} cx={720+Math.cos(a*Math.PI/180)*46} cy={580+Math.sin(a*Math.PI/180)*18}
          rx="20" ry="13" fill="rgba(196,170,255,.16)"
          transform={`rotate(${a} ${720+Math.cos(a*Math.PI/180)*46} ${580+Math.sin(a*Math.PI/180)*18})`}/>
      ))}
      <circle cx="720" cy="580" r="20" fill="rgba(196,170,255,.2)"/>

      {/* ── WRITING DESK LEFT ── */}
      <rect x="76" y="418" width="384" height="26" rx="4" fill="url(#prDesk)" stroke="rgba(100,50,20,.5)" strokeWidth="2"/>
      <rect x="78" y="420" width="380" height="9" rx="2" fill="rgba(110,60,25,.35)"/>
      <rect x="88" y="444" width="15" height="162" rx="3" fill="rgba(48,20,6,.9)"/>
      <rect x="437" y="444" width="15" height="162" rx="3" fill="rgba(48,20,6,.9)"/>
      <rect x="148" y="444" width="12" height="130" rx="3" fill="rgba(48,20,6,.78)"/>
      <rect x="378" y="444" width="12" height="130" rx="3" fill="rgba(48,20,6,.78)"/>
      {/* Desk surface objects */}
      <rect x="86" y="398" width="22" height="22" rx="5" fill="rgba(6,2,18,.9)" stroke="rgba(70,40,130,.4)" strokeWidth="1"/>
      <ellipse cx="97" cy="398" rx="10" ry="4" fill="rgba(90,50,150,.55)"/>
      <path d="M114,418 Q124,398 130,386 Q134,376 140,366" stroke="rgba(215,205,175,.68)" strokeWidth="1.5" fill="none"/>
      <path d="M140,366 Q135,376 128,390" stroke="rgba(195,178,155,.45)" strokeWidth="3" fill="none"/>
      {/* Book stack on desk right */}
      <rect x="344" y="403" width="82" height="17" rx="2" fill="rgba(196,170,255,.58)"/>
      <rect x="348" y="389" width="74" height="16" rx="2" fill="rgba(249,168,212,.52)"/>
      <rect x="352" y="376" width="66" height="15" rx="2" fill="rgba(253,230,138,.48)"/>
      {/* Small desk candelabra */}
      <rect x="192" y="388" width="5" height="32" rx="2" fill="rgba(148,96,28,.7)"/>
      <rect x="182" y="388" width="24" height="5" rx="2" fill="rgba(130,84,22,.65)"/>
      {[182,202].map((x,i) => (
        <g key={i}>
          <rect x={x} y="365" width="5" height="22" rx="2" fill="rgba(236,226,208,.9)"/>
          <ellipse cx={x+2.5} cy="364" rx="4.5" ry="7"
            fill="rgba(253,230,138,.78)" className="animate-star-twinkle" style={{animationDelay:`${i*.5}s`}}/>
          <ellipse cx={x+2.5} cy="362" rx="11" ry="13" fill="rgba(253,200,80,.18)" filter="url(#prBlur4)"/>
        </g>
      ))}

      {/* ── FLOOR CANDELABRA pair ── */}
      {[[50,340],[1390,340]].map(([cx,base],i) => (
        <g key={i}>
          <rect x={cx-4} y={base+50} width="8" height="100" rx="3" fill="rgba(148,96,28,.72)"/>
          <rect x={cx-18} y={base+148} width="36" height="9" rx="4" fill="rgba(130,84,22,.65)"/>
          {/* Arms */}
          <line x1={cx} y1={base+70} x2={cx-30} y2={base+58} stroke="rgba(148,96,28,.6)" strokeWidth="3.5"/>
          <line x1={cx} y1={base+70} x2={cx+30} y2={base+58} stroke="rgba(148,96,28,.6)" strokeWidth="3.5"/>
          {/* Candles */}
          {[cx-30,cx,cx+30].map((x,j) => {
            const cy2 = j===1?base+48:base+56
            return (
              <g key={j}>
                <rect x={x-3} y={cy2-24} width="6" height="24" rx="2" fill="rgba(238,228,210,.9)"/>
                <ellipse cx={x} cy={cy2-26} rx="4.5" ry="7"
                  fill="rgba(253,230,138,.8)" className="animate-star-twinkle" style={{animationDelay:`${(i*3+j)*.38}s`}}/>
                <ellipse cx={x} cy={cy2-24} rx="12" ry="14" fill="rgba(253,200,80,.2)" filter="url(#prBlur4)"/>
              </g>
            )
          })}
          {/* Stand disk */}
          <ellipse cx={cx} cy={base+158} rx="18" ry="7" fill="rgba(100,60,16,.6)"/>
        </g>
      ))}

      {/* ── IVY VINES ── */}
      <path d="M0,22 Q16,82 6,168 Q-6,244 10,320" stroke="rgba(38,86,28,.52)" strokeWidth="2.5" fill="none"/>
      {[65,108,155,202,262,308].map((y,i) => (
        <ellipse key={i} cx={10+i*3} cy={y} rx={11+i%3*3} ry={8+i%2*4}
          fill="rgba(52,106,36,.56)" transform={`rotate(${-22+i*9} ${10+i*3} ${y})`}/>
      ))}
      <path d="M1440,22 Q1424,94 1434,182 Q1448,264 1430,320" stroke="rgba(38,86,28,.45)" strokeWidth="2" fill="none"/>
      {[72,124,176,228,278].map((y,i) => (
        <ellipse key={i} cx={1434-i*2} cy={y} rx={9+i%3*2} ry={7+i%2*3}
          fill="rgba(52,106,36,.5)" transform={`rotate(${20-i*8} ${1434-i*2} ${y})`}/>
      ))}

      {/* ── WALL ART frames ── */}
      {[{x:22,y:102,w:90,h:72},{x:18,y:186,w:52,h:62}].map((f,i) => (
        <g key={i}>
          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="3" fill="rgba(8,2,22,.9)" stroke="rgba(160,116,52,.52)" strokeWidth="2"/>
          <rect x={f.x+4} y={f.y+4} width={f.w-8} height={f.h-8} rx="2" fill="rgba(16,5,40,.82)"/>
          <ellipse cx={f.x+f.w*.5} cy={f.y+f.h*.36} rx={f.w*.16} ry={f.h*.2} fill="rgba(80,38,120,.58)"/>
          <ellipse cx={f.x+f.w*.5} cy={f.y+f.h*.68} rx={f.w*.26} ry={f.h*.2} fill="rgba(80,38,120,.48)"/>
        </g>
      ))}
      {[{x:1330,y:100,w:94,h:74},{x:1374,y:188,w:54,h:60}].map((f,i) => (
        <g key={i}>
          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="3" fill="rgba(8,2,22,.9)" stroke="rgba(160,116,52,.52)" strokeWidth="2"/>
          <rect x={f.x+4} y={f.y+4} width={f.w-8} height={f.h-8} rx="2" fill="rgba(16,5,40,.78)"/>
          <path d={`M${f.x+8},${f.y+f.h-8} Q${f.x+f.w*.5},${f.y+10} ${f.x+f.w-8},${f.y+f.h-8}`}
            fill="rgba(56,92,152,.2)" stroke="rgba(96,136,196,.28)" strokeWidth="1"/>
        </g>
      ))}

      {/* ── FLOOR EDGE SHADOW ── */}
      <rect x="0" y="730" width="1440" height="38" fill="url(#prFloor)" opacity=".8"/>
    </svg>
  )
}

// ─── Clickable object SVGs ────────────────────────────────────────────────────
function ScrollSVG() {
  return (
    <svg width="72" height="64" viewBox="0 0 72 64" fill="none">
      {/* Glowing aura */}
      <ellipse cx="36" cy="38" rx="32" ry="22" fill="rgba(249,168,212,.12)" filter="url(#prBlur4)"/>
      {/* Scroll ends */}
      <ellipse cx="8" cy="34" rx="8" ry="24" fill="#c4a070"/>
      <ellipse cx="64" cy="34" rx="8" ry="24" fill="#c4a070"/>
      <ellipse cx="8" cy="34" rx="5" ry="21" fill="#d8b888"/>
      <ellipse cx="64" cy="34" rx="5" ry="21" fill="#d8b888"/>
      {/* Parchment body */}
      <rect x="8" y="10" width="56" height="48" rx="2" fill="#f0e4c8"/>
      <rect x="8" y="10" width="56" height="4" fill="rgba(180,140,80,.35)"/>
      <rect x="8" y="54" width="56" height="4" fill="rgba(180,140,80,.35)"/>
      {/* Text lines */}
      <line x1="18" y1="24" x2="54" y2="24" stroke="rgba(100,60,20,.32)" strokeWidth="1.2"/>
      <line x1="18" y1="30" x2="54" y2="30" stroke="rgba(100,60,20,.28)" strokeWidth="1"/>
      <line x1="18" y1="36" x2="54" y2="36" stroke="rgba(100,60,20,.28)" strokeWidth="1"/>
      <line x1="18" y1="42" x2="46" y2="42" stroke="rgba(100,60,20,.22)" strokeWidth="1"/>
      {/* Wax seal */}
      <circle cx="36" cy="34" r="9" fill="#c0302a" opacity=".88"/>
      <circle cx="36" cy="34" r="6.5" fill="#d44038" opacity=".7"/>
      <text x="36" y="37.5" textAnchor="middle" fontSize="7" fill="rgba(255,220,200,.85)" fontFamily="serif">✦</text>
      {/* Ribbon */}
      <path d="M28,18 Q36,14 44,18" stroke="rgba(180,80,100,.55)" strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

function CameraSVG() {
  return (
    <svg width="76" height="60" viewBox="0 0 76 60" fill="none">
      <ellipse cx="38" cy="38" rx="33" ry="20" fill="rgba(253,230,138,.1)" filter="url(#prBlur4)"/>
      {/* Body */}
      <rect x="8" y="22" width="52" height="30" rx="5" fill="rgba(22,14,6,.9)"/>
      <rect x="8" y="22" width="52" height="7" rx="2" fill="rgba(40,26,10,.8)"/>
      {/* Top mount */}
      <rect x="18" y="14" width="26" height="10" rx="3" fill="rgba(30,20,8,.85)"/>
      <rect x="22" y="11" width="12" height="5" rx="2" fill="rgba(180,140,50,.45)"/>
      {/* Lens */}
      <circle cx="35" cy="37" r="12" fill="rgba(10,6,2,.95)" stroke="rgba(180,140,50,.65)" strokeWidth="2"/>
      <circle cx="35" cy="37" r="9" fill="rgba(6,3,1,.92)" stroke="rgba(140,105,38,.4)" strokeWidth="1.2"/>
      <circle cx="35" cy="37" r="5.5" fill="rgba(20,12,4,.88)"/>
      <circle cx="35" cy="37" r="2.5" fill="rgba(180,140,50,.55)"/>
      <circle cx="32" cy="34" r="1.5" fill="rgba(255,255,255,.18)"/>
      {/* Film reel side */}
      <rect x="62" y="26" width="10" height="22" rx="3" fill="rgba(30,20,8,.8)" stroke="rgba(180,140,50,.35)" strokeWidth="1"/>
      <circle cx="67" cy="37" r="7" fill="none" stroke="rgba(180,140,50,.5)" strokeWidth="1.2"/>
      <circle cx="67" cy="37" r="3" fill="rgba(180,140,50,.45)"/>
      {/* Shutter button */}
      <circle cx="52" cy="22" r="3.5" fill="rgba(180,60,60,.65)"/>
      {/* Lens sparkle */}
      <circle cx="31" cy="33" r="1" fill="rgba(255,255,255,.4)"/>
    </svg>
  )
}

function JournalSVG() {
  return (
    <svg width="74" height="62" viewBox="0 0 74 62" fill="none">
      {/* Glow beneath */}
      <ellipse cx="37" cy="46" rx="30" ry="14" fill="rgba(196,170,255,.2)" filter="url(#prBlur4)"/>
      {/* Open book shadow */}
      <ellipse cx="37" cy="55" rx="28" ry="6" fill="rgba(0,0,0,.35)"/>
      {/* Left page */}
      <path d="M8,52 L8,10 Q8,6 36,6 Q37,6 37,6 L37,52 Q22,50 8,52 Z" fill="#f0e8d4"/>
      {/* Right page */}
      <path d="M66,52 L66,10 Q66,6 38,6 Q37,6 37,6 L37,52 Q52,50 66,52 Z" fill="#ede0cc"/>
      {/* Spine */}
      <rect x="35" y="6" width="4" height="46" rx="1" fill="rgba(100,60,160,.45)"/>
      {/* Glowing lines on left page */}
      {[18,24,30,36,42].map((y,i) => (
        <line key={i} x1="14" y1={y} x2={28+i%3*2} y2={y} stroke={i===0?'rgba(196,170,255,.65)':'rgba(120,80,180,.32)'} strokeWidth={i===0?1.5:1}/>
      ))}
      {/* Glowing lines on right page */}
      {[18,24,30,36].map((y,i) => (
        <line key={i} x1="40" y1={y} x2={60-i*2} y2={y} stroke="rgba(120,80,180,.28)" strokeWidth="1"/>
      ))}
      {/* Glowing flourish left page */}
      <path d="M14,12 Q18,8 22,12" stroke="rgba(196,170,255,.5)" strokeWidth="1" fill="none"/>
      {/* Quill resting on right page */}
      <path d="M55,48 Q60,30 62,18 Q64,10 66,6" stroke="rgba(200,190,160,.72)" strokeWidth="1.5" fill="none"/>
      <path d="M66,6 Q62,12 56,26" stroke="rgba(220,210,180,.5)" strokeWidth="3" fill="none"/>
      {/* Glow emanating from book center */}
      <ellipse cx="37" cy="30" rx="8" ry="18" fill="rgba(196,170,255,.1)" filter="url(#prBlur4)"/>
    </svg>
  )
}

function CatSVG() {
  return (
    <svg width="70" height="56" viewBox="0 0 70 56" fill="none">
      <ellipse cx="35" cy="50" rx="28" ry="6" fill="rgba(0,0,0,.3)"/>
      {/* Body (curled) */}
      <ellipse cx="35" cy="38" rx="26" ry="14" fill="#9a7828" opacity=".85"/>
      <ellipse cx="35" cy="36" rx="24" ry="12" fill="#b08832" opacity=".72"/>
      {/* Stripes */}
      {[-8,-2,4].map((dx,i) => (
        <line key={i} x1={35+dx} y1="28" x2={35+dx+2} y2="48" stroke="rgba(60,40,10,.3)" strokeWidth="2"/>
      ))}
      {/* Head */}
      <circle cx="50" cy="30" r="13" fill="#a07c2e" opacity=".88"/>
      <ellipse cx="50" cy="30" r="11" fill="#b89038" opacity=".72"/>
      {/* Ears */}
      <polygon points="42,22 38,14 46,18" fill="#8a6820" opacity=".85"/>
      <polygon points="56,20 60,12 54,18" fill="#8a6820" opacity=".85"/>
      <polygon points="43,22 40,16 46,19" fill="#f9a8d4" opacity=".45"/>
      <polygon points="56,20 59,14 54,19" fill="#f9a8d4" opacity=".45"/>
      {/* Eyes (closed/sleeping) */}
      <path d="M44,29 Q46,27 48,29" stroke="rgba(30,18,4,.7)" strokeWidth="1.5" fill="none"/>
      <path d="M52,29 Q54,27 56,29" stroke="rgba(30,18,4,.7)" strokeWidth="1.5" fill="none"/>
      {/* Nose + whiskers */}
      <polygon points="50,33 48,35 52,35" fill="rgba(200,100,100,.55)"/>
      <line x1="32" y1="33" x2="46" y2="34" stroke="rgba(180,160,100,.35)" strokeWidth=".8"/>
      <line x1="32" y1="35" x2="46" y2="35" stroke="rgba(180,160,100,.3)" strokeWidth=".8"/>
      <line x1="54" y1="34" x2="68" y2="33" stroke="rgba(180,160,100,.35)" strokeWidth=".8"/>
      <line x1="54" y1="35" x2="68" y2="35" stroke="rgba(180,160,100,.3)" strokeWidth=".8"/>
      {/* Tail */}
      <path d="M10,36 Q4,28 8,20 Q14,14 18,22" stroke="#9a7828" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".8"/>
    </svg>
  )
}

// ─── Shared reveal utilities ─────────────────────────────────────────────────
interface RevealProps {
  isOpen: boolean
  isFound: boolean
  onOpen: () => void
  onCollect: () => void
}

function HintTag({ text, accent = 'rgba(196,170,255,.45)' }: { text: string; accent?: string }) {
  return (
    <div style={{
      position:'absolute', bottom:-28, left:'50%', transform:'translateX(-50%)',
      background:'rgba(6,1,20,.95)', border:`1px solid ${accent}`,
      borderRadius:6, padding:'4px 12px', whiteSpace:'nowrap', pointerEvents:'none',
      fontFamily:"'Cinzel',serif", fontSize:9, color:'rgba(221,205,255,.92)',
      letterSpacing:'.05em', boxShadow:'0 0 16px rgba(139,92,246,.28)',
      zIndex:20,
    }}>{text}</div>
  )
}

function ItemGlowWrap({ children, hov, accent, onHov, onLeave, onClick }: {
  children: React.ReactNode; hov: boolean; accent: string
  onHov: () => void; onLeave: () => void; onClick: () => void
}) {
  return (
    <div
      onMouseEnter={onHov} onMouseLeave={onLeave} onClick={onClick}
      style={{
        cursor:'pointer', position:'relative',
        transform: hov ? 'scale(1.1)' : 'scale(1)',
        transition:'transform .25s cubic-bezier(.34,1.56,.64,1)',
        filter: hov
          ? `drop-shadow(0 0 14px ${accent}) drop-shadow(0 0 6px ${accent}88)`
          : `drop-shadow(0 0 5px ${accent}44)`,
      }}
    >{children}</div>
  )
}

function FoundBadge({ accent }: { accent: string }) {
  return (
    <div style={{
      width:36, height:36, borderRadius:'50%',
      background:`linear-gradient(135deg,${accent},${accent}aa)`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:18, fontWeight:700, color:'rgba(4,1,14,.9)',
      boxShadow:`0 0 24px ${accent}88, 0 0 48px ${accent}44`,
    }}>✓</div>
  )
}

// ─── Decoy SVGs ───────────────────────────────────────────────────────────────
function PressedRoseSVG() {
  return (
    <svg width="58" height="60" viewBox="0 0 58 60" fill="none">
      <line x1="29" y1="60" x2="29" y2="32" stroke="rgba(38,80,24,.65)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M29,46 Q18,40 14,44 Q18,52 29,46" fill="rgba(52,100,36,.55)"/>
      <path d="M29,46 Q40,40 44,44 Q40,52 29,46" fill="rgba(52,100,36,.5)"/>
      {[0,45,90,135,180,225,270,315].map((a,i) => (
        <ellipse key={i} cx={29+Math.cos(a*Math.PI/180)*11} cy={24+Math.sin(a*Math.PI/180)*9}
          rx="7" ry="10" fill={i%2===0?'#f9a8d4':'#ffb3e0'} opacity=".82"
          transform={`rotate(${a} ${29+Math.cos(a*Math.PI/180)*11} ${24+Math.sin(a*Math.PI/180)*9})`}/>
      ))}
      <circle cx="29" cy="24" r="6" fill="#e07090" opacity=".9"/>
      <circle cx="29" cy="24" r="3" fill="#c85080" opacity=".8"/>
      <circle cx="29" cy="24" r="18" fill="rgba(249,168,212,.06)"/>
    </svg>
  )
}

function CompactSVG() {
  return (
    <svg width="56" height="48" viewBox="0 0 56 48" fill="none">
      <rect x="4" y="14" width="48" height="32" rx="8" fill="rgba(200,80,140,.72)" stroke="rgba(255,160,200,.45)" strokeWidth="1.5"/>
      <rect x="4" y="4" width="48" height="12" rx="8" fill="rgba(180,60,120,.68)" stroke="rgba(220,100,160,.45)" strokeWidth="1.5"/>
      <rect x="8" y="5" width="40" height="9" rx="5" fill="rgba(220,210,240,.32)" stroke="rgba(255,255,255,.18)" strokeWidth="1"/>
      <rect x="10" y="6" width="12" height="6" rx="3" fill="rgba(255,255,255,.14)"/>
      <rect x="24" y="12" width="8" height="4" rx="2" fill="rgba(253,230,138,.65)"/>
      <ellipse cx="28" cy="32" rx="18" ry="11" fill="rgba(255,200,230,.42)"/>
      <ellipse cx="28" cy="32" rx="12" ry="7" fill="rgba(255,180,220,.35)"/>
      <circle cx="20" cy="22" r="1.5" fill="rgba(253,230,138,.7)"/>
      <circle cx="36" cy="20" r="1" fill="rgba(255,255,255,.6)"/>
    </svg>
  )
}

function PearlPinSVG() {
  return (
    <svg width="52" height="66" viewBox="0 0 52 66" fill="none">
      <line x1="22" y1="20" x2="38" y2="62" stroke="rgba(200,190,210,.82)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="18" cy="14" r="12" fill="rgba(230,220,255,.52)" stroke="rgba(196,170,255,.58)" strokeWidth="1.5"/>
      <circle cx="18" cy="14" r="7" fill="rgba(215,205,255,.72)"/>
      <circle cx="18" cy="14" r="4.5" fill="rgba(252,250,255,.92)" stroke="rgba(200,190,230,.4)" strokeWidth="1"/>
      <ellipse cx="16" cy="12" rx="2" ry="1.5" fill="rgba(255,255,255,.72)"/>
      {[0,72,144,216,288].map(a => (
        <ellipse key={a} cx={18+Math.cos(a*Math.PI/180)*9} cy={14+Math.sin(a*Math.PI/180)*9}
          rx="3.5" ry="5.5" fill="rgba(196,170,255,.52)"
          transform={`rotate(${a} ${18+Math.cos(a*Math.PI/180)*9} ${14+Math.sin(a*Math.PI/180)*9})`}/>
      ))}
      <circle cx="18" cy="14" r="16" fill="rgba(196,170,255,.05)"/>
    </svg>
  )
}

// ─── Curtain reveal spot — Journal (correct) ──────────────────────────────────
function CurtainSpot({ isOpen, isFound, onOpen, onCollect }: RevealProps) {
  const [hovC, setHovC] = useState(false)
  const [hovI, setHovI] = useState(false)
  const { isAr } = useLang()
  return (
    <div style={{ position:'absolute', left:'37%', top:'56%', transform:'translate(-50%,-50%)', zIndex:8, userSelect:'none' }}>
      {/* Journal appears behind curtain */}
      {isOpen && !isFound && (
        <div style={{ position:'absolute', top:20, left:8, zIndex:1 }}>
          <ItemGlowWrap hov={hovI} accent="#c4aaff"
            onHov={() => setHovI(true)} onLeave={() => setHovI(false)} onClick={onCollect}>
            <JournalSVG/>
            {hovI && <HintTag text={isAr ? '✦ مذكرة' : '✦ Journal'} accent="rgba(196,170,255,.55)"/>}
          </ItemGlowWrap>
        </div>
      )}
      {isFound && (
        <div style={{ position:'absolute', top:30, left:18, zIndex:3 }}>
          <FoundBadge accent="#c4aaff"/>
        </div>
      )}
      {/* Curtain panel — slides left */}
      <div
        onClick={() => !isOpen && !isFound && onOpen()}
        onMouseEnter={() => setHovC(true)}
        onMouseLeave={() => setHovC(false)}
        style={{
          cursor: isOpen || isFound ? 'default' : 'pointer',
          transform: isOpen ? 'translateX(-155%)' : 'translateX(0)',
          transition:'transform .72s cubic-bezier(.22,1,.36,1)',
          pointerEvents: isOpen ? 'none' : 'auto',
          position:'relative', zIndex:2,
        }}
      >
        <svg width="100" height="185" viewBox="0 0 100 185" fill="none">
          <path d="M0,0 Q10,42 4,92 Q-4,144 8,185 L52,185 Q62,144 54,92 Q46,40 54,0 Z"
            fill={hovC ? 'rgba(108,46,196,.84)' : 'rgba(84,32,162,.74)'} style={{transition:'fill .2s'}}/>
          <path d="M50,0 Q58,40 52,92 Q44,146 56,185 L100,185 Q110,146 98,92 Q88,40 96,0 Z"
            fill={hovC ? 'rgba(94,38,178,.8)' : 'rgba(74,28,148,.68)'} style={{transition:'fill .2s'}}/>
          {[22,52,84,120,158].map((y,i) => (
            <path key={i} d={`M${8+i%2*44},${y} Q${22+i%2*44},${y+10} ${8+i%2*44},${y+20}`}
              fill="rgba(40,14,110,.32)" stroke="none"/>
          ))}
          <path d="M0,180 Q50,177 100,180" stroke="rgba(253,230,138,.58)" strokeWidth="2.5" fill="none" strokeDasharray="6,4"/>
          {hovC && !isOpen && <rect x="0" y="0" width="100" height="185" fill="rgba(196,170,255,.07)" rx="2"/>}
        </svg>
        {hovC && !isOpen && <HintTag text={isAr ? 'اسحب الستارة →' : '← pull curtain'}/>}
      </div>
    </div>
  )
}

// ─── Wardrobe reveal spot — Camera (correct) ─────────────────────────────────
function WardrobeSpot({ isOpen, isFound, onOpen, onCollect }: RevealProps) {
  const [hovD, setHovD] = useState(false)
  const [hovI, setHovI] = useState(false)
  const { isAr } = useLang()
  return (
    <div style={{ position:'absolute', left:'31%', top:'21%', transform:'translate(-50%,-50%)', zIndex:8, userSelect:'none' }}>
      <div style={{ position:'relative', width:162, height:310 }}>
        {/* Cabinet shell */}
        <svg width="162" height="310" viewBox="0 0 162 310" fill="none" style={{position:'absolute',inset:0,zIndex:0,pointerEvents:'none'}}>
          <rect x="1" y="8" width="160" height="300" rx="4" fill="rgba(28,10,4,.98)" stroke="rgba(120,68,18,.55)" strokeWidth="2"/>
          <rect x="-3" y="0" width="168" height="12" rx="4" fill="rgba(50,20,6,.98)" stroke="rgba(150,90,24,.55)" strokeWidth="1.5"/>
          {isOpen && (
            <>
              <rect x="5" y="20" width="152" height="284" rx="2" fill="rgba(12,3,24,.97)"/>
              <rect x="12" y="24" width="138" height="4" rx="2" fill="rgba(140,82,22,.6)"/>
              <path d="M46,36 Q44,80 38,188 Q60,196 82,196 Q72,80 68,36 Z" fill="#f9a8d4" opacity=".3"/>
              <path d="M88,44 Q96,90 102,190 Q82,196 68,192 Q78,90 84,44 Z" fill="#c4aaff" opacity=".25"/>
              <rect x="16" y="22" width="18" height="28" rx="5" fill="rgba(196,170,255,.42)"/>
              <rect x="128" y="22" width="16" height="26" rx="5" fill="rgba(249,168,212,.38)"/>
            </>
          )}
          <rect x="8" y="298" width="22" height="12" rx="3" fill="rgba(40,14,4,.9)"/>
          <rect x="132" y="298" width="22" height="12" rx="3" fill="rgba(40,14,4,.9)"/>
        </svg>

        {/* Camera inside wardrobe */}
        {isOpen && !isFound && (
          <div style={{ position:'absolute', top:'48%', left:'50%', transform:'translate(-50%,-50%)', zIndex:3 }}>
            <ItemGlowWrap hov={hovI} accent="#fde68a"
              onHov={() => setHovI(true)} onLeave={() => setHovI(false)} onClick={onCollect}>
              <CameraSVG/>
              {hovI && <HintTag text={isAr ? '✦ كاميرا' : '✦ Camera'} accent="rgba(253,230,138,.55)"/>}
            </ItemGlowWrap>
          </div>
        )}
        {isFound && (
          <div style={{ position:'absolute', top:'46%', left:'50%', transform:'translate(-50%,-50%)', zIndex:3 }}>
            <FoundBadge accent="#fde68a"/>
          </div>
        )}

        {/* Left door — static */}
        <svg width="80" height="296" viewBox="0 0 80 296" fill="none"
          style={{ position:'absolute', left:1, top:10, zIndex:1, pointerEvents:'none' }}>
          <rect x="1" y="0" width="79" height="296" rx="2" fill="rgba(40,16,5,.92)" stroke="rgba(100,55,15,.48)" strokeWidth="1.5"/>
          <rect x="5" y="8" width="70" height="108" rx="3" fill="rgba(22,8,2,.82)" stroke="rgba(80,44,10,.32)" strokeWidth="1"/>
          <rect x="5" y="126" width="70" height="162" rx="3" fill="rgba(22,8,2,.85)" stroke="rgba(80,44,10,.32)" strokeWidth="1"/>
          <rect x="67" y="152" width="10" height="24" rx="4" fill="rgba(200,155,50,.7)" stroke="rgba(240,195,80,.4)" strokeWidth="1"/>
          <rect x="50" y="12" width="18" height="26" rx="5" fill="rgba(249,168,212,.42)"/>
          <rect x="53" y="8" width="12" height="8" rx="2" fill="rgba(200,120,160,.55)"/>
        </svg>

        {/* Right door — swings open on click */}
        <div
          onClick={() => !isOpen && !isFound && onOpen()}
          onMouseEnter={() => setHovD(true)}
          onMouseLeave={() => setHovD(false)}
          style={{
            position:'absolute', right:1, top:10, width:80, height:296,
            transformOrigin:'right center',
            transform: isOpen ? 'perspective(700px) rotateY(78deg)' : 'perspective(700px) rotateY(0deg)',
            transition:'transform .78s cubic-bezier(.22,1,.36,1)',
            cursor: isOpen || isFound ? 'default' : 'pointer',
            pointerEvents: isOpen ? 'none' : 'auto',
            zIndex:2,
          }}
        >
          <svg width="80" height="296" viewBox="0 0 80 296" fill="none">
            <rect x="0" y="0" width="80" height="296" rx="2"
              fill={hovD ? 'rgba(48,19,5,.96)' : 'rgba(40,16,5,.92)'}
              stroke="rgba(100,55,15,.5)" strokeWidth="1.5" style={{transition:'fill .2s'}}/>
            <rect x="4" y="8" width="72" height="108" rx="3" fill="rgba(22,8,2,.82)" stroke="rgba(80,44,10,.32)" strokeWidth="1"/>
            <rect x="4" y="126" width="72" height="162" rx="3" fill="rgba(22,8,2,.85)" stroke="rgba(80,44,10,.32)" strokeWidth="1"/>
            <rect x="4" y="152" width="10" height="24" rx="4" fill="rgba(200,155,50,.72)" stroke="rgba(240,195,80,.45)" strokeWidth="1"/>
            <rect x="10" y="12" width="18" height="26" rx="5" fill="rgba(196,170,255,.48)"/>
            <rect x="13" y="8" width="12" height="8" rx="2" fill="rgba(139,92,246,.6)"/>
            {hovD && !isOpen && <rect x="0" y="0" width="80" height="296" fill="rgba(196,170,255,.07)" rx="2"/>}
          </svg>
          {hovD && !isOpen && (
            <div style={{ position:'absolute', bottom:-28, left:'50%', transform:'translateX(-50%)' }}>
              <HintTag text={isAr ? 'افتح الخزانة' : 'open wardrobe'}/>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Bookshelf reveal spot — shelf1=Scroll(correct) shelf2=Rose(decoy) ────────
function ShelfSpot({ which, isOpen, isFound, onOpen, onCollect }: RevealProps & { which: 1 | 2 }) {
  const [hovB, setHovB] = useState(false)
  const [hovI, setHovI] = useState(false)
  const { isAr } = useLang()
  const isCorrect = which === 1
  const accent = isCorrect ? '#f9a8d4' : '#c4aaff'
  const top = which === 1 ? '16%' : '31%'
  const bookPalette = which === 1
    ? ['#c4aaff','#f9a8d4','#fde68a','#ff9edb','#c8b1e4']
    : ['#fde68a','#c4aaff','#ffb3e6','#f9a8d4','#c8b1e4']

  return (
    <div style={{ position:'absolute', left:'14%', top, transform:'translate(-50%,-50%)', zIndex:8, userSelect:'none' }}>
      <div style={{ position:'relative', width:90, height:92 }}>
        {/* Hidden item */}
        {isOpen && !isFound && (
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-55%)', zIndex:1 }}>
            <ItemGlowWrap hov={hovI} accent={accent}
              onHov={() => setHovI(true)} onLeave={() => setHovI(false)} onClick={onCollect}>
              {isCorrect ? <ScrollSVG/> : <PressedRoseSVG/>}
              {hovI && <HintTag text={isCorrect ? (isAr ? '✦ لفافة جامعية' : '✦ University Scroll') : (isAr ? 'وردة مضغوطة' : 'Pressed Rose')} accent={`${accent}88`}/>}
            </ItemGlowWrap>
          </div>
        )}
        {isFound && (
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-58%)', zIndex:3 }}>
            <FoundBadge accent={accent}/>
          </div>
        )}

        {/* Book cluster — tilts to reveal */}
        <div
          onClick={() => !isOpen && !isFound && onOpen()}
          onMouseEnter={() => setHovB(true)}
          onMouseLeave={() => setHovB(false)}
          style={{
            position:'absolute', inset:0,
            cursor: isOpen ? 'default' : 'pointer',
            pointerEvents: isOpen ? 'none' : 'auto',
            zIndex:2,
          }}
        >
          <svg width="90" height="92" viewBox="0 0 90 92" fill="none">
            <g style={{
              transform: isOpen ? 'rotate(38deg) translate(26px,-24px)' : 'rotate(0)',
              transformOrigin: '2px 92px',
              transition:'transform .62s cubic-bezier(.22,1,.36,1)',
            }}>
              {bookPalette.map((c,i) => {
                const bx = i * 17 + 2
                const bh = 56 + (i%3)*10
                return (
                  <g key={i}>
                    <rect x={bx} y={92-bh} width="14" height={bh} rx="1.5"
                      fill={c} opacity={.8+i*.02}
                      style={{filter: hovB ? 'brightness(1.18)' : 'none', transition:'filter .2s'}}/>
                    <rect x={bx} y={92-bh} width="3" height={bh} fill="rgba(255,255,255,.18)" rx=".5"/>
                    <rect x={bx} y={92-bh} width="14" height="3" fill="rgba(255,255,255,.2)" rx=".5"/>
                    {/* Spine text line */}
                    <rect x={bx+4} y={92-bh+8} width="6" height="1.5" rx="1" fill="rgba(255,255,255,.25)"/>
                  </g>
                )
              })}
              {hovB && !isOpen && (
                <rect x="0" y="0" width="90" height="92" fill="rgba(196,170,255,.06)" rx="2"/>
              )}
            </g>
          </svg>
          {hovB && !isOpen && <HintTag text={isAr ? 'حرك الكتب' : 'shift books'}/>}
        </div>
      </div>
    </div>
  )
}

// ─── Drawer reveal spot — Compact (decoy) ────────────────────────────────────
function DrawerSpot({ isOpen, isFound, onOpen, onCollect }: RevealProps) {
  const [hovD, setHovD] = useState(false)
  const [hovI, setHovI] = useState(false)
  const { isAr } = useLang()
  return (
    <div style={{ position:'absolute', left:'57%', top:'60%', transform:'translate(-50%,-50%)', zIndex:8, userSelect:'none' }}>
      <div style={{ position:'relative', width:150, height:68 }}>
        {/* Cabinet body */}
        <svg width="150" height="68" viewBox="0 0 150 68" fill="none" style={{position:'absolute',inset:0,pointerEvents:'none'}}>
          <rect x="0" y="0" width="150" height="68" rx="5" fill="rgba(44,20,5,.93)" stroke="rgba(130,75,22,.5)" strokeWidth="1.5"/>
          <rect x="0" y="0" width="150" height="9" rx="5" fill="rgba(60,26,8,.9)"/>
          <rect x="8" y="58" width="18" height="14" rx="2" fill="rgba(35,14,3,.95)"/>
          <rect x="124" y="58" width="18" height="14" rx="2" fill="rgba(35,14,3,.95)"/>
        </svg>

        {/* Drawer face — slides out */}
        <div
          onClick={() => !isOpen && onOpen()}
          onMouseEnter={() => setHovD(true)}
          onMouseLeave={() => setHovD(false)}
          style={{
            position:'absolute', top:9, left:4, width:142, height:48,
            transform: isOpen ? 'translateY(60px)' : 'translateY(0)',
            transition:'transform .58s cubic-bezier(.22,1,.36,1)',
            cursor: isOpen ? 'default' : 'pointer',
            pointerEvents: isOpen ? 'none' : 'auto',
            zIndex:2,
          }}
        >
          <svg width="142" height="48" viewBox="0 0 142 48" fill="none">
            <rect x="0" y="0" width="142" height="48" rx="4"
              fill={hovD ? 'rgba(82,42,10,.93)' : 'rgba(58,28,6,.88)'}
              stroke={`rgba(130,75,22,${hovD?'.75':'.5'})`}
              strokeWidth="1.5" style={{transition:'fill .2s'}}/>
            {[18,36,54,72,90,108,126].map((x,i) => (
              <line key={i} x1={x} y1="0" x2={x} y2="48" stroke="rgba(0,0,0,.07)" strokeWidth="1"/>
            ))}
            {[[6,5],[6,33],[126,5],[126,33]].map(([x,y],i) => (
              <rect key={i} x={x} y={y} width="10" height="10" rx="2"
                fill="rgba(160,100,28,.5)" stroke="rgba(210,155,55,.35)" strokeWidth="1"/>
            ))}
            <rect x="51" y="17" width="40" height="14" rx="7"
              fill={hovD ? 'rgba(112,70,18,.9)' : 'rgba(75,45,10,.75)'}
              stroke={`rgba(180,130,45,${hovD?'.7':'.55'})`}
              strokeWidth="1.5" style={{transition:'all .2s'}}/>
            <rect x="61" y="22" width="20" height="4" rx="2" fill="rgba(220,170,60,.45)"/>
            {hovD && <rect x="0" y="0" width="142" height="48" fill="rgba(196,170,255,.05)" rx="4"/>}
          </svg>
          {hovD && !isOpen && <HintTag text={isAr ? 'افتح الدرج' : 'open drawer'}/>}
        </div>

        {/* Compact revealed inside */}
        {isOpen && !isFound && (
          <div style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', zIndex:1 }}>
            <ItemGlowWrap hov={hovI} accent="rgba(249,168,212,.85)"
              onHov={() => setHovI(true)} onLeave={() => setHovI(false)} onClick={onCollect}>
              <CompactSVG/>
              {hovI && <HintTag text={isAr ? 'مرآة مكياج' : 'Makeup Compact'} accent="rgba(249,168,212,.5)"/>}
            </ItemGlowWrap>
          </div>
        )}
        {isFound && (
          <div style={{ position:'absolute', top:14, left:'50%', transform:'translateX(-50%)', zIndex:1 }}>
            <FoundBadge accent="rgba(249,168,212,.85)"/>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Mirror reveal spot — Pearl pin (decoy) ───────────────────────────────────
function MirrorSpot({ isOpen, isFound, onOpen, onCollect }: RevealProps) {
  const [hovM, setHovM] = useState(false)
  const [hovI, setHovI] = useState(false)
  const { isAr } = useLang()
  return (
    <div style={{ position:'absolute', left:'86%', top:'17%', transform:'translate(-50%,-50%)', zIndex:8, userSelect:'none' }}>
      <div style={{ position:'relative', width:148, height:190 }}>
        {/* Pearl pin — appears beside mirror when tilted */}
        {isOpen && !isFound && (
          <div style={{ position:'absolute', top:'28%', left:'-26%', zIndex:1 }}>
            <ItemGlowWrap hov={hovI} accent="rgba(253,230,138,.85)"
              onHov={() => setHovI(true)} onLeave={() => setHovI(false)} onClick={onCollect}>
              <PearlPinSVG/>
              {hovI && <HintTag text={isAr ? 'دبوس اللؤلؤ' : 'Pearl Hair Pin'} accent="rgba(253,230,138,.5)"/>}
            </ItemGlowWrap>
          </div>
        )}
        {isFound && (
          <div style={{ position:'absolute', top:'28%', left:'-18%', zIndex:1 }}>
            <FoundBadge accent="rgba(253,230,138,.85)"/>
          </div>
        )}

        {/* Mirror interactive overlay — tilts aside */}
        <div
          onClick={() => !isOpen && !isFound && onOpen()}
          onMouseEnter={() => setHovM(true)}
          onMouseLeave={() => setHovM(false)}
          style={{
            cursor: isOpen || isFound ? 'default' : 'pointer',
            transform: isOpen ? 'rotate(-24deg) translateX(44px) translateY(-12px)' : 'rotate(0)',
            transformOrigin:'50% 5%',
            transition:'transform .78s cubic-bezier(.22,1,.36,1)',
            pointerEvents: isOpen ? 'none' : 'auto',
          }}
        >
          <svg width="148" height="190" viewBox="0 0 148 190" fill="none">
            <ellipse cx="74" cy="96" rx="70" ry="90"
              fill={hovM ? 'rgba(196,170,255,.16)' : 'rgba(196,170,255,.08)'}
              stroke={`rgba(200,155,55,${hovM?'.72':'.52'})`}
              strokeWidth="3.5" style={{transition:'all .2s'}}/>
            <ellipse cx="74" cy="96" rx="68" ry="88"
              fill="none" stroke="rgba(160,120,40,.2)" strokeWidth="1.5" strokeDasharray="5,5"/>
            <ellipse cx="46" cy="58" rx="16" ry="32" fill="rgba(255,255,255,.055)" transform="rotate(-14 46 58)"/>
            <ellipse cx="92" cy="40" rx="8" ry="16" fill="rgba(255,255,255,.04)" transform="rotate(-14 92 40)"/>
            {[0,90,180,270].map(deg => {
              const a = deg*Math.PI/180
              return <circle key={deg} cx={74+Math.cos(a)*70} cy={96+Math.sin(a)*90}
                r="6" fill="rgba(90,45,160,.72)" stroke="rgba(196,170,255,.55)" strokeWidth="1.2"/>
            })}
            {hovM && !isOpen && (
              <ellipse cx="74" cy="96" rx="73" ry="93"
                fill="none" stroke="rgba(196,170,255,.45)" strokeWidth="2.5"/>
            )}
          </svg>
          {hovM && !isOpen && <HintTag text={isAr ? 'حرك المرآة' : 'tilt mirror'}/>}
        </div>
      </div>
    </div>
  )
}

// ─── Decorative cat (non-interactive) ─────────────────────────────────────────
function CatDecor() {
  return (
    <div style={{
      position:'absolute', left:'9%', top:'80%',
      transform:'translate(-50%,-50%)', zIndex:5,
      pointerEvents:'none', opacity:.72,
    }}>
      <CatSVG/>
    </div>
  )
}

// ─── Completion cards overlay ─────────────────────────────────────────────────
function CompletionCards({ onContinue }: { onContinue: () => void }) {
  const { t, isAr } = useLang()
  const [hovContinue, setHovContinue] = useState(false)
  const cardTitleFont = isAr ? "'Nunito', sans-serif" : "'Cinzel Decorative', serif"
  const cardBodyFont = isAr ? "'Nunito', sans-serif" : "'Lora', serif"
  const cards = [
    {
      title: t.pr_aboutTitle,
      accent: '#c4aaff',
      icon: '✦',
      lines: t.pr_aboutContent,
    },
    {
      title: t.pr_educationTitle,
      accent: '#f9a8d4',
      icon: '📜',
      lines: t.pr_educationItems,
    },
    {
      title: t.pr_languagesTitle,
      accent: '#fde68a',
      icon: '🌐',
      lines: t.pr_languagesItems,
    },
  ]

  return (
    <div style={{position:'fixed',inset:0,zIndex:50,overflowY:'auto',overflowX:'hidden',
      background:'rgba(4,1,14,.88)',backdropFilter:'blur(18px)'}}>
    <div style={{minHeight:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      padding:'24px 28px',gap:0}}>

      {/* Header */}
      <div style={{textAlign:'center',marginBottom:28}}>
        <p style={{fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif",fontSize:9.5,letterSpacing: isAr ? 0 : '.28em',color:'rgba(253,230,138,.65)',marginBottom:8,fontStyle:'normal',textTransform:'none'}}>
          {t.pr_allObjectsFound}
        </p>
        <h2 style={{fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel Decorative', serif",fontSize:'clamp(20px,2.5vw,28px)',
          background:'linear-gradient(135deg,#c4aaff,#f9a8d4,#fde68a)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',
          lineHeight:1.25,marginBottom:6,letterSpacing: isAr ? 0 : undefined,fontStyle:'normal',textTransform:'none'}}>
          {t.pr_revealTitle}
        </h2>
        <p style={{fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif",fontStyle: isAr ? 'normal' : 'italic',fontSize:13,color:'rgba(196,170,255,.62)',letterSpacing: isAr ? 0 : undefined}}>
          {t.pr_revealSubtext}
        </p>
      </div>

      {/* Cards row */}
      <div style={{display:'flex',gap:18,width:'100%',maxWidth:920,alignItems:'stretch',marginBottom:28}}>
        {cards.map((card, i) => (
          <div key={i} className="animate-panel-in" style={{
            flex:1, minWidth:0,
            background:'linear-gradient(145deg,rgba(8,2,26,.97),rgba(18,5,46,.98))',
            border:`1.5px solid ${card.accent}44`,borderRadius:16,overflow:'hidden',
            display:'flex',flexDirection:'column',
            boxShadow:`0 8px 40px rgba(0,0,0,.55),0 0 30px ${card.accent}18`,
            animationDelay:`${i*.12}s`,
          }}>
            {/* Top accent */}
            <div style={{height:3,background:`linear-gradient(90deg,transparent,${card.accent},transparent)`,flexShrink:0}}/>
            {/* Card header */}
            <div style={{padding:'18px 20px 12px',borderBottom:`1px solid rgba(196,170,255,.12)`,textAlign:'center',flexShrink:0}}>
              <div style={{
                fontSize:26, marginBottom:8,
                ...(i === 0 ? {
                  background:'linear-gradient(135deg,#e4d9ff 10%,#c4aaff 40%,#f0e8ff 60%,#d4bdff 80%,#b89eff 100%)',
                  WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                  filter:'drop-shadow(0 0 8px rgba(196,170,255,.9)) drop-shadow(0 0 18px rgba(196,170,255,.5))',
                } : {}),
              }}>{card.icon}</div>
              <h3 style={{fontFamily:cardTitleFont,fontSize:16,color:card.accent,lineHeight:1.3,letterSpacing: isAr ? 0 : undefined,fontStyle:'normal',textTransform:'none'}}>{card.title}</h3>
            </div>
            {/* Card content */}
            <div style={{padding:'16px 18px 20px',flex:1,display:'flex',flexDirection:'column',gap:10}}>
              {card.lines.map((line, j) => (
                <div key={j} style={{display:'flex',gap:9,alignItems:'flex-start'}}>
                  <div style={{width:5,height:5,borderRadius:'50%',background:card.accent,
                    boxShadow:`0 0 6px ${card.accent}`,flexShrink:0,marginTop:5}}/>
                  <p style={{fontFamily:cardBodyFont,fontSize:12.5,color:'rgba(221,205,255,.85)',lineHeight:1.65,fontStyle:'normal',letterSpacing: isAr ? 0 : undefined}}>{line}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Continue button */}
      <button
        onMouseEnter={() => setHovContinue(true)}
        onMouseLeave={() => setHovContinue(false)}
        onClick={onContinue}
        style={{
          padding:'13px 56px',borderRadius:10,cursor:'pointer',
          background: hovContinue
            ? 'linear-gradient(135deg,rgba(196,170,255,.38),rgba(139,92,246,.3))'
            : 'linear-gradient(135deg,rgba(196,170,255,.22),rgba(139,92,246,.18))',
          border:`1.5px solid rgba(196,170,255,${hovContinue?'.75':'.5'})`,
          fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif",fontSize:13,letterSpacing: isAr ? 0 : '.15em',
          color: hovContinue ? 'rgba(240,232,255,.99)' : 'rgba(221,205,255,.95)',
          fontStyle:'normal',textTransform:'none' as const,
          boxShadow: hovContinue
            ? '0 0 28px rgba(139,92,246,.55),0 0 56px rgba(196,170,255,.22),0 4px 24px rgba(139,92,246,.3)'
            : '0 4px 24px rgba(139,92,246,.3)',
          transform: hovContinue ? 'translateY(-2px)' : 'none',
          transition:'all .25s cubic-bezier(.22,1,.36,1)',
        }}>
        {t.continue} ✦
      </button>
    </div>
    </div>
  )
}

// ─── Wrong-object toast ───────────────────────────────────────────────────────
function WrongToast({ msg }: { msg: string }) {
  return (
    <div className="animate-toast" style={{position:'fixed',top:80,left:'50%',
      background:'rgba(6,1,20,.96)',backdropFilter:'blur(16px)',
      border:'1px solid rgba(120,80,180,.45)',borderRadius:12,
      padding:'10px 22px',zIndex:52,pointerEvents:'none',
      display:'flex',alignItems:'center',gap:10,
      boxShadow:'0 6px 28px rgba(0,0,0,.6)'}}>
      <span style={{fontSize:16}}>🔮</span>
      <p style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:12.5,color:'rgba(196,170,255,.82)'}}>{msg}</p>
    </div>
  )
}

// ─── Key reveal overlay ───────────────────────────────────────────────────────
function KeyReveal({ onCollect, onBack }: { onCollect: () => void; onBack: () => void }) {
  const { isAr, t } = useLang()
  const [collected, setCollected] = useState(false)
  const [hovKey, setHovKey] = useState(false)
  const [hovBack, setHovBack] = useState(false)
  const [dissolving, setDissolving] = useState(false)

  const handleCollect = () => {
    if (collected || dissolving) return
    audio.playShimmer()
    setDissolving(true)
    setTimeout(() => {
      setCollected(true)
      setDissolving(false)
      onCollect()
    }, 520)
  }

  return (
    <div style={{position:'fixed',inset:0,zIndex:55,overflowY:'auto',overflowX:'hidden',
      background:'rgba(4,1,14,.86)',backdropFilter:'blur(18px)'}}>
    <div style={{minHeight:'100%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>

      {/* Ambient star ring */}
      {[...Array(14)].map((_,i) => {
        const a=(i/14)*Math.PI*2, r=130
        return (
          <div key={i} className="animate-star-twinkle" style={{
            position:'absolute',
            left:`calc(50% + ${Math.cos(a)*r}px)`,
            top:`calc(50% + ${Math.sin(a)*r}px)`,
            animationDelay:`${i*.09}s`, pointerEvents:'none'}}>
            <svg width="8" height="8" viewBox="0 0 10 10">
              <polygon points="5,0 6.2,3.8 10,3.8 7,6.1 8.1,10 5,7.6 1.9,10 3,6.1 0,3.8 3.8,3.8"
                fill={i%3===0?'#fde68a':i%3===1?'#c4aaff':'#f9a8d4'} opacity=".75"/>
            </svg>
          </div>
        )
      })}

      <div className="animate-panel-in" style={{
        textAlign:'center', maxWidth:500,
        display:'flex', flexDirection:'column', alignItems:'center', gap:0,
      }}>
        {/* Header */}
        <p style={{fontFamily: isAr?"'Nunito',sans-serif":"'Cinzel',serif",
          fontSize:10, color:'rgba(196,170,255,.65)', letterSpacing: isAr?0:'.24em',
          marginBottom:10}}>
          {t.pr_allThreeRevealed}
        </p>
        <h2 style={{fontFamily: isAr?"'Nunito',sans-serif":"'Cinzel Decorative',serif",
          fontSize:26, lineHeight:1.3, marginBottom:8,
          background:'linear-gradient(135deg,#f9a8d4,#c4aaff,#fde68a)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
          {t.pr_title}
        </h2>
        <p style={{fontFamily: isAr?"'Nunito',sans-serif":"'Lora',serif",
          fontStyle: isAr?'normal':'italic', fontSize:14,
          color:'rgba(196,170,255,.62)', marginBottom:40, lineHeight:1.6}}>
          {t.pr_mindVoiceKnown}
        </p>

        {/* Divider */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:36,width:'100%',maxWidth:360}}>
          <div style={{flex:1,height:1,background:'linear-gradient(90deg,transparent,rgba(253,230,138,.35))'}}/>
          <svg width="12" height="12" viewBox="0 0 16 16">
            <polygon points="8,0 9.8,5.8 15,6.2 11,10 12.4,15 8,12.2 3.6,15 5,10 1,6.2 6.2,5.8"
              fill="rgba(253,230,138,.7)"/>
          </svg>
          <div style={{flex:1,height:1,background:'linear-gradient(90deg,rgba(253,230,138,.35),transparent)'}}/>
        </div>

        {/* KEY STAGE — key visible until collected */}
        {!collected && (
          <div style={{
            display:'flex',flexDirection:'column',alignItems:'center',gap:18,
            opacity: dissolving ? 0 : 1,
            transform: dissolving ? 'scale(1.18) translateY(-10px)' : 'scale(1)',
            transition: dissolving ? 'opacity .45s ease, transform .45s ease' : 'none',
          }}>
            {/* Floating glow orb behind key */}
            <div
              onMouseEnter={() => setHovKey(true)}
              onMouseLeave={() => setHovKey(false)}
              onClick={handleCollect}
              style={{
                cursor: dissolving ? 'default' : 'pointer',
                display:'flex',flexDirection:'column',alignItems:'center',gap:16,
              }}
            >
              <div style={{
                width:104, height:104, borderRadius:'50%',
                background: hovKey
                  ? 'linear-gradient(135deg,rgba(253,230,138,.38),rgba(249,168,212,.28))'
                  : 'linear-gradient(135deg,rgba(253,230,138,.22),rgba(249,168,212,.15))',
                border: `2px solid rgba(253,230,138,${hovKey?'.85':'.52'})`,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow: hovKey
                  ? '0 0 56px rgba(253,230,138,.65),0 0 100px rgba(196,170,255,.3),0 0 18px rgba(253,230,138,.5)'
                  : '0 0 36px rgba(253,230,138,.4),0 0 72px rgba(196,170,255,.18)',
                animation:'float 3.2s ease-in-out infinite',
                transition:'box-shadow .3s,border-color .3s,background .3s',
                transform: hovKey ? 'scale(1.06)' : 'scale(1)',
              }}>
                <GoldenKey size={52}/>
              </div>

              {/* Collect label */}
              <div style={{
                background: hovKey
                  ? 'linear-gradient(135deg,rgba(253,230,138,.26),rgba(253,230,138,.12))'
                  : 'linear-gradient(135deg,rgba(253,230,138,.14),rgba(253,230,138,.06))',
                border:`1.5px solid rgba(253,230,138,${hovKey?'.72':'.38'})`,
                borderRadius:12, padding:'10px 32px',
                boxShadow: hovKey ? '0 4px 22px rgba(253,230,138,.28)' : 'none',
                transition:'all .25s',
              }}>
                <p style={{fontFamily: isAr?"'Nunito',sans-serif":"'Cinzel',serif",
                  fontSize:12, color: hovKey?'#fde68a':'rgba(253,230,138,.82)',
                  letterSpacing: isAr?0:'.12em', transition:'color .25s'}}>
                  ✦ {t.pr_collectKey}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* COLLECTED STAGE — key gone, back button appears */}
        {collected && (
          <div className="animate-panel-in" style={{
            display:'flex',flexDirection:'column',alignItems:'center',gap:20,
          }}>
            {/* Collected confirmation badge */}
            <div style={{
              width:72,height:72,borderRadius:'50%',
              background:'linear-gradient(135deg,rgba(253,230,138,.3),rgba(196,170,255,.2))',
              border:'2px solid rgba(253,230,138,.7)',
              display:'flex',alignItems:'center',justifyContent:'center',
              boxShadow:'0 0 40px rgba(253,230,138,.5),0 0 80px rgba(196,170,255,.2)',
              fontSize:32,
            }}>✦</div>

            <div style={{textAlign:'center'}}>
              <p style={{fontFamily: isAr?"'Nunito',sans-serif":"'Cinzel',serif",
                fontSize:11, color:'rgba(253,230,138,.85)', letterSpacing: isAr?0:'.15em',
                marginBottom:6}}>
                {t.pr_keyCollectedLine}
              </p>
              <p style={{fontFamily: isAr?"'Nunito',sans-serif":"'Lora',serif",
                fontStyle: isAr?'normal':'italic', fontSize:13,
                color:'rgba(196,170,255,.6)', lineHeight:1.6}}>
                {t.pr_quoteComplete}
              </p>
            </div>

            {/* Back to Garden button */}
            <button
              onMouseEnter={() => setHovBack(true)}
              onMouseLeave={() => setHovBack(false)}
              onClick={onBack}
              style={{
                marginTop:4, padding:'13px 48px', borderRadius:12, cursor:'pointer',
                background: hovBack
                  ? 'linear-gradient(135deg,rgba(196,170,255,.3),rgba(139,92,246,.24))'
                  : 'linear-gradient(135deg,rgba(196,170,255,.18),rgba(139,92,246,.14))',
                border:`1.5px solid rgba(196,170,255,${hovBack?'.7':'.42'})`,
                fontFamily: isAr?"'Nunito',sans-serif":"'Cinzel',serif",
                fontSize:13, letterSpacing: isAr?0:'.14em',
                color: hovBack ? 'rgba(221,205,255,.98)' : 'rgba(196,170,255,.85)',
                boxShadow: hovBack ? '0 4px 28px rgba(139,92,246,.35)' : '0 2px 14px rgba(0,0,0,.3)',
                transform: hovBack ? 'translateY(-2px)' : 'none',
                transition:'all .25s cubic-bezier(.22,1,.36,1)',
              }}>
              {isAr ? 'العودة إلى الحديقة →' : '← Back to Garden'}
            </button>
          </div>
        )}
      </div>
    </div>
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

// ─── Top HUD ─────────────────────────────────────────────────────────────────
function RoomHUD({ guide, totalKeys, butterflies, foundCount, onBack, onMainMenu, onReset, onHint }:
  { guide:GuideChoice; totalKeys:number; butterflies:number; foundCount:number; onBack:()=>void; onMainMenu:()=>void; onReset:()=>void; onHint:()=>void }) {
  const isMan = guide === 'man'
  const { isAr, t } = useLang()
  const [hovBack, setHovBack] = useState(false)
  const [hovMenu, setHovMenu] = useState(false)
  const [hovReset, setHovReset] = useState(false)
  return (
    <div style={{position:'absolute',top:0,left:0,right:0,height:64,zIndex:30,
      background:'linear-gradient(180deg,rgba(24,6,58,1) 0%,rgba(32,9,72,1) 50%,rgba(20,5,50,1) 100%)',
      backdropFilter:'blur(22px)',borderBottom:'1px solid rgba(196,170,255,.22)',
      boxShadow:'0 1px 0 rgba(155,114,207,.2), 0 2px 28px rgba(18,5,48,.75)',
      display:'flex',alignItems:'center',padding:'0 16px 0 18px',gap:12}}>

      {/* Back */}
      <button
        onMouseEnter={() => setHovBack(true)}
        onMouseLeave={() => setHovBack(false)}
        onClick={() => { audio.playReturnGarden(); onBack() }}
        style={{display:'flex',alignItems:'center',gap:6,
          background: hovBack ? 'rgba(139,92,246,.28)' : 'rgba(139,92,246,.16)',
          border:`1px solid rgba(196,170,255,${hovBack?'.6':'.32'})`,
          borderRadius:8,padding:'7px 15px',cursor:'pointer',
          fontFamily:"'Cinzel',serif",fontSize:11,
          color: hovBack ? 'rgba(221,205,255,.98)' : 'rgba(196,170,255,.82)',
          letterSpacing:'.06em',flexShrink:0,
          boxShadow: hovBack ? '0 0 18px rgba(139,92,246,.45),0 0 36px rgba(196,170,255,.18)' : 'none',
          transform: hovBack ? 'translateY(-1px)' : 'none',
          transition:'all .22s cubic-bezier(.22,1,.36,1)'}}>
        {t.back}
      </button>

      {/* Guide portrait */}
      <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
        <div style={{width:60,height:60,borderRadius:'50%',
          background:isMan?'linear-gradient(135deg,#1a1568,#4535c0)':'linear-gradient(135deg,#7b2fb0,#c060c0)',
          border:'1.5px solid rgba(253,230,138,.48)',overflow:'hidden',
          display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:'0 0 16px rgba(139,92,246,.5)'}}>
          <CompanionFace guide={guide} size={60} idPrefix="pr_hud"/>
        </div>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:7.5,color:'rgba(196,170,255,.6)',
          letterSpacing:'.05em',whiteSpace:'nowrap'}}>
          {isMan ? t.pr_dusk : t.pr_dawn}
        </span>
      </div>

      <div style={{width:1,height:40,background:'rgba(196,170,255,.2)',flexShrink:0}}/>

      {/* Room title */}
      <div>
        <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:9,color:'rgba(249,168,212,.72)',letterSpacing: isAr ? 0 : '.18em',marginBottom:2}}>{isAr ? 'تستكشف الآن' : 'NOW EXPLORING'}</p>
        <h2 style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif",fontSize:15,color:'rgba(221,205,255,.92)',letterSpacing: isAr ? 0 : '.05em'}}>{isAr ? 'غرفة الصورة الشخصية' : 'The Portrait Room'}</h2>
      </div>

      <div style={{flex:1}}/>

      {/* Objects progress */}
      <div style={{display:'flex',flexDirection:'column',gap:5,alignItems:'center',flexShrink:0}}>
        <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:8.5,color:'rgba(249,168,212,.72)',letterSpacing: isAr ? 0 : '.12em'}}>{isAr ? 'الأشياء المكتشفة' : 'OBJECTS FOUND'}</p>
        <div style={{display:'flex',gap:8}}>
          {[0,1,2].map(i => (
            <div key={i} style={{width:28,height:28,borderRadius:7,
              background:i<foundCount?'linear-gradient(135deg,rgba(249,168,212,.3),rgba(249,168,212,.15))':'rgba(196,170,255,.08)',
              border:`1.5px solid ${i<foundCount?'rgba(249,168,212,.72)':'rgba(196,170,255,.22)'}`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,
              transition:'all .4s',boxShadow:i<foundCount?'0 0 12px rgba(249,168,212,.4)':'none'}}>
              {i<foundCount?'✓':''}
            </div>
          ))}
        </div>
      </div>

      <div style={{width:1,height:40,background:'rgba(196,170,255,.2)',flexShrink:0}}/>

      {/* Keys / butterflies */}
      <div style={{display:'flex',gap:14,alignItems:'center',flexShrink:0}}>
        <div style={{textAlign:'center'}}>
          <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:8,color:'rgba(253,230,138,.6)',letterSpacing: isAr ? 0 : '.08em',marginBottom:2}}>{isAr ? 'مفاتيح' : 'KEYS'}</p>
          <p style={{fontFamily:"'Nunito',sans-serif",fontSize:16,color:'#fde68a',fontWeight:700}}>{totalKeys}/5</p>
        </div>
        <div style={{textAlign:'center'}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:'rgba(196,170,255,.6)',letterSpacing:'.08em',marginBottom:2}}>🦋</p>
          <p style={{fontFamily:"'Nunito',sans-serif",fontSize:16,color:'#c4aaff',fontWeight:700}}>{butterflies}</p>
        </div>
      </div>

      <div style={{width:1,height:40,background:'rgba(196,170,255,.15)',flexShrink:0}}/>

      {/* Main menu / reset / hint */}
      <div style={{display:'flex',flexDirection:'row',gap:6,flexShrink:0,alignItems:'center'}}>
        <button
          onMouseEnter={() => setHovMenu(true)}
          onMouseLeave={() => setHovMenu(false)}
          onClick={() => { audio.playReturnGarden(); onMainMenu() }}
          style={{
            background: hovMenu ? 'rgba(253,230,138,.24)' : 'rgba(253,230,138,.14)',
            border:`1px solid rgba(253,230,138,${hovMenu?'.7':'.45'})`,
            borderRadius:7,padding:'6px 10px',cursor:'pointer',
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:10,
            color: hovMenu ? '#fde68a' : 'rgba(253,230,138,.9)',
            letterSpacing: isAr ? 0 : '.04em',whiteSpace:'nowrap',
            boxShadow: hovMenu ? '0 0 16px rgba(253,230,138,.4),0 0 32px rgba(253,230,138,.15)' : 'none',
            transform: hovMenu ? 'translateY(-1px)' : 'none',
            transition:'all .22s cubic-bezier(.22,1,.36,1)'}}>
          {isAr ? '⌂ قائمة' : '⌂ Menu'}
        </button>
        <button
          onMouseEnter={() => setHovReset(true)}
          onMouseLeave={() => setHovReset(false)}
          onClick={onReset}
          style={{
            background: hovReset ? 'rgba(249,168,212,.16)' : 'rgba(249,168,212,.08)',
            border:`1px solid rgba(249,168,212,${hovReset?'.55':'.3'})`,
            borderRadius:7,padding:'6px 10px',cursor:'pointer',
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:10,
            color: hovReset ? 'rgba(255,190,230,.9)' : 'rgba(249,168,212,.65)',
            letterSpacing: isAr ? 0 : '.04em',whiteSpace:'nowrap',
            boxShadow: hovReset ? '0 0 14px rgba(249,168,212,.35),0 0 28px rgba(249,168,212,.12)' : 'none',
            transform: hovReset ? 'translateY(-1px)' : 'none',
            transition:'all .22s cubic-bezier(.22,1,.36,1)'}}>
          {isAr ? '↺ إعادة' : '↺ Reset'}
        </button>
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

// ─── Bottom clue bar — shows all 3 clues with found state ─────────────────────
function ClueBar({ found, phase }: { found: Set<ObjId>; phase: 'find'|'cards'|'key' }) {
  const { t, isAr } = useLang()
  const complete = phase !== 'find'
  const clueFont = isAr ? "'Nunito', sans-serif" : "'Cinzel', serif"
  const clueBodyFont = isAr ? "'Nunito', sans-serif" : "'Lora', serif"
  return (
    <div style={{position:'absolute',bottom:0,left:0,right:0,zIndex:30,
      background:'linear-gradient(0deg,rgba(18,4,50,1) 0%,rgba(26,7,62,1) 60%,rgba(20,5,55,1) 100%)',
      backdropFilter:'blur(22px)',borderTop:'1px solid rgba(196,170,255,.2)',
      boxShadow:'0 -1px 0 rgba(155,114,207,.18), 0 -2px 24px rgba(18,5,48,.7)',
      display:'flex',alignItems:'center',padding:'0 24px',gap:14,height:78}}>

      {/* Label */}
      <div style={{flexShrink:0}}>
        <p style={{fontFamily:clueFont,fontSize:8.5,
          color: complete ? 'rgba(255,179,230,.75)' : 'rgba(253,230,138,.65)',
          letterSpacing: isAr ? 0 : '.18em',marginBottom:3,
          fontStyle:'normal',textTransform:'none'}}>
          {complete ? t.pr_roomComplete.toUpperCase() : t.pr_findObjects}
        </p>
        <p style={{fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel Decorative', serif",fontSize:18,
          color: complete ? 'rgba(255,179,230,.9)' : 'rgba(221,205,255,.9)'}}>
          {isAr ? `وُجد: ${found.size} / 3` : `Found: ${found.size} / 3`}
        </p>
      </div>

      <div style={{width:1,height:50,background:'rgba(196,170,255,.2)',flexShrink:0}}/>

      {/* 3 clue chips */}
      <div style={{flex:1,display:'flex',gap:12}}>
        {CLUES.map(c => {
          const isFnd = found.has(c.id)
          return (
            <div key={c.id} style={{
              flex:1, display:'flex', alignItems:'center', gap:10,
              padding:'8px 14px', borderRadius:10,
              background: isFnd ? `${c.accent}14` : 'rgba(139,92,246,.07)',
              border:`1px solid ${isFnd ? `${c.accent}55` : 'rgba(196,170,255,.18)'}`,
              transition:'all .4s',
              boxShadow: isFnd ? `0 0 16px ${c.accent}22` : 'none',
            }}>
              <div style={{
                width:28, height:28, borderRadius:8, flexShrink:0,
                background: isFnd ? `${c.accent}22` : 'rgba(196,170,255,.08)',
                border:`1.5px solid ${isFnd ? c.accent : 'rgba(196,170,255,.2)'}`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:13, transition:'all .4s',
                boxShadow: isFnd ? `0 0 12px ${c.accent}77` : 'none',
              }}>
                {isFnd ? '✓' : c.icon}
              </div>
              <div style={{minWidth:0}}>
                <p style={{fontFamily:clueFont,fontSize:9.5,
                  color: isFnd ? c.accent : 'rgba(196,170,255,.6)',
                  letterSpacing: isAr ? 0 : '.06em',marginBottom:2,transition:'color .4s',
                  whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
                  fontStyle:'normal',textTransform:'none'}}>
                  {t.pr_objects[c.id]?.label ?? c.id}
                </p>
                <p style={{fontFamily:clueBodyFont,fontStyle: isAr ? 'normal' : 'italic',fontSize:10.5,
                  color: isFnd ? 'rgba(255,179,230,.7)' : 'rgba(196,170,255,.42)',
                  transition:'color .4s', whiteSpace:'nowrap',
                  letterSpacing: isAr ? 0 : undefined}}>
                  {isFnd ? t.pr_foundItem : (t.pr_objects[c.id]?.meaning ?? '')}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{width:1,height:50,background:'rgba(196,170,255,.2)',flexShrink:0}}/>

      {/* Right side hint */}
      <div style={{flexShrink:0,textAlign:'right'}}>
        <p style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:11,
          color:'rgba(196,170,255,.42)',lineHeight:1.5,maxWidth:200}}>
          {complete ? t.pr_completionSubtext : t.pr_quoteLooking}
        </p>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PortraitRoom({ guide, onBack, hasKey, butterflies, totalKeys, onKeyCollected, onMainMenu, onReset }:
  { guide:GuideChoice; onBack:()=>void; hasKey:boolean; butterflies:number; totalKeys:number; onKeyCollected:()=>void; onMainMenu:()=>void; onReset:()=>void }) {

  const { t, isAr } = useLang()
  const [showIntro, setShowIntro] = useState(!hasKey)
  const [phase, setPhase] = useState<'find'|'cards'|'key'>(hasKey ? 'key' : 'find')
  const [found, setFound] = useState<Set<ObjId>>(hasKey ? new Set(TARGET_IDS) : new Set())
  const [opened, setOpened] = useState<Set<RevealId>>(hasKey ? new Set(['curtain','wardrobe','shelf1'] as RevealId[]) : new Set())
  const [wrongMsg, setWrongMsg] = useState<string|null>(null)
  const [showHint, setShowHint] = useState(false)
  const wrongRef = useRef<number>(undefined)

  useEffect(() => {
    audio.startAmbient('portrait')
    return () => audio.stopAmbient()
  }, [])

  const handleOpen = useCallback((id: RevealId) => {
    audio.playSelect()
    setOpened(prev => { const s = new Set(prev); s.add(id); return s })
  }, [])

  const handleCollect = useCallback((id: RevealId) => {
    if (phase !== 'find') return
    const targetId = REVEAL_TARGETS[id]
    if (!targetId) {
      audio.playIncorrect()
      setWrongMsg(t.pr_wrongMsg)
      clearTimeout(wrongRef.current)
      wrongRef.current = window.setTimeout(() => setWrongMsg(null), 2500)
      return
    }
    if (found.has(targetId)) return
    audio.playPageTurn()
    setTimeout(() => audio.playShimmer(), 120)
    const next = new Set([...found, targetId])
    setFound(next)
    if (next.size >= TARGET_IDS.length) {
      setTimeout(() => { audio.playPuzzleComplete(); setPhase('cards') }, 400)
    }
  }, [phase, found, t])

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',position:'relative',
      background:'#0a0120',fontFamily:"'Nunito',sans-serif"}}>

      {showIntro && <CompanionIntro guide={guide} room="portrait" onStart={() => setShowIntro(false)} />}

      <RoomScene/>

      {/* Dust motes */}
      {[...Array(14)].map((_,i) => (
        <div key={i} className="particle" style={{
          position:'absolute',
          left:`${(i*73+19)%100}%`,top:`${(i*47+30)%65}%`,
          width:2.5,height:2.5,borderRadius:'50%',
          background:i%3===0?'rgba(253,230,138,.55)':i%3===1?'rgba(196,170,255,.48)':'rgba(249,168,212,.5)',
          '--drift':`${(i%5-2)*18}px`,
          boxShadow:'0 0 5px 1px currentColor',
          animationDelay:`${i*.42}s`,pointerEvents:'none',zIndex:2,
        } as React.CSSProperties}/>
      ))}

      {/* Ambient butterflies */}
      {[
        {x:'8%', y:'32%',d:0,  c1:'#c4aaff',c2:'#9d6ef8'},
        {x:'82%',y:'28%',d:2.2,c1:'#f9a8d4',c2:'#ff9edb'},
        {x:'58%',y:'36%',d:1.2,c1:'#fde68a',c2:'#f59e0b'},
      ].map((b,i) => (
        <div key={i} style={{position:'absolute',left:b.x,top:b.y,zIndex:3,pointerEvents:'none',
          animation:`${i%2===0?'flutter':'flutter2'} ${10+i*3}s ease-in-out infinite`,
          animationDelay:`${b.d}s`}}>
          <svg width="28" height="22" viewBox="0 0 28 22">
            <ellipse cx="6.5" cy="8" rx="6.5" ry="5" fill={b.c1} opacity=".82" transform="rotate(-20 6.5 8)"/>
            <ellipse cx="21.5" cy="8" rx="6.5" ry="5" fill={b.c1} opacity=".82" transform="rotate(20 21.5 8)"/>
            <ellipse cx="7" cy="15" rx="4.5" ry="3.2" fill={b.c2} opacity=".65" transform="rotate(16 7 15)"/>
            <ellipse cx="21" cy="15" rx="4.5" ry="3.2" fill={b.c2} opacity=".65" transform="rotate(-16 21 15)"/>
            <ellipse cx="14" cy="11" rx="1.4" ry="6.5" fill="#1e0530" opacity=".65"/>
          </svg>
        </div>
      ))}

      {/* Reveal spots — six interactive locations */}
      <CurtainSpot
        isOpen={opened.has('curtain')} isFound={found.has('journal')}
        onOpen={() => handleOpen('curtain')} onCollect={() => handleCollect('curtain')}
      />
      <WardrobeSpot
        isOpen={opened.has('wardrobe')} isFound={found.has('camera')}
        onOpen={() => handleOpen('wardrobe')} onCollect={() => handleCollect('wardrobe')}
      />
      <ShelfSpot which={1}
        isOpen={opened.has('shelf1')} isFound={found.has('scroll')}
        onOpen={() => handleOpen('shelf1')} onCollect={() => handleCollect('shelf1')}
      />
      <ShelfSpot which={2}
        isOpen={opened.has('shelf2')} isFound={false}
        onOpen={() => handleOpen('shelf2')} onCollect={() => handleCollect('shelf2')}
      />
      <DrawerSpot
        isOpen={opened.has('drawer')} isFound={false}
        onOpen={() => handleOpen('drawer')} onCollect={() => handleCollect('drawer')}
      />
      <MirrorSpot
        isOpen={opened.has('mirror')} isFound={false}
        onOpen={() => handleOpen('mirror')} onCollect={() => handleCollect('mirror')}
      />

      {/* Decorative cat */}
      <CatDecor/>

      <RoomHUD guide={guide} totalKeys={totalKeys} butterflies={butterflies}
        foundCount={found.size} onBack={() => { audio.playReturnGarden(); onBack() }}
        onMainMenu={onMainMenu} onReset={onReset} onHint={() => setShowHint(true)}/>

      {showHint && <HintOverlay onClose={() => setShowHint(false)} isAr={isAr}
        hintEn="Click on decorative objects in the room to reveal hidden items. The scroll is the key item."
        hintAr="انقر على الأشياء الزخرفية في الغرفة للكشف عن العناصر المخفية. اللفافة هي العنصر الرئيسي." />}

      <ClueBar found={found} phase={phase}/>

      {wrongMsg && <WrongToast msg={wrongMsg}/>}

      {phase === 'cards' && (
        <CompletionCards onContinue={() => { audio.playSelect(); setPhase('key') }}/>
      )}

      {phase === 'key' && (
        <KeyReveal
          onCollect={() => onKeyCollected()}
          onBack={() => { audio.playReturnGarden(); onBack() }}
        />
      )}
    </div>
  )
}
