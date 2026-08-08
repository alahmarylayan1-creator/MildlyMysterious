import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type { GuideChoice } from './GardenHub'
import { audio } from './sound/engine'
import { useLang, InlineControls } from './LangContext'
import GoldenKey from './GoldenKey'
import { CompanionIntro, CompanionFace } from './CompanionIntro'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Data ─────────────────────────────────────────────────────────────────────
type ToolId = 'canva' | 'powerpoint' | 'elevenlabs' | 'chatgpt' | 'github' | 'vscode'
type DrawerId = 'design' | 'course' | 'voice' | 'ideas' | 'version' | 'technical'

interface Tool { id: ToolId; name: string; emoji: string; drawer: DrawerId; accent: string; desc: string }
interface DrawerDef { id: DrawerId; label: string; accent: string }

const TOOLS: Tool[] = [
  { id:'canva',      name:'Canva',         emoji:'🎨', drawer:'design',    accent:'#f9a8d4',
    desc:'Created visual layouts and educational video elements.' },
  { id:'powerpoint', name:'PowerPoint',    emoji:'📊', drawer:'course',    accent:'#fde68a',
    desc:'Reviewed and transformed detailed course presentations into concise video content.' },
  { id:'elevenlabs', name:'ElevenLabs',    emoji:'🎙️', drawer:'voice',     accent:'#c4aaff',
    desc:'Produced clear AI-assisted voice-over for educational videos.' },
  { id:'chatgpt',    name:'ChatGPT',       emoji:'💬', drawer:'ideas',     accent:'#ffb3e6',
    desc:'Supported ideation, script development, content simplification, coding guidance, and troubleshooting.' },
  { id:'github',     name:'GitHub',        emoji:'🐙', drawer:'version',   accent:'#c8b1e4',
    desc:'Managed branches, commits, pull requests, and the merge workflow.' },
  { id:'vscode',     name:'Visual Studio', emoji:'💻', drawer:'technical', accent:'#9b72cf',
    desc:'Used during the development and testing of a backend service for the digital content platform.' },
]

const DRAWERS: DrawerDef[] = [
  { id:'design',    label:'Visual Design',                    accent:'#f9a8d4' },
  { id:'course',    label:'Course Materials',                 accent:'#fde68a' },
  { id:'voice',     label:'Voice-over Production',            accent:'#c4aaff' },
  { id:'ideas',     label:'Ideas, Scripts & Problem Solving', accent:'#ffb3e6' },
  { id:'version',   label:'Version Control',                  accent:'#c8b1e4' },
  { id:'technical', label:'Technical Development',            accent:'#9b72cf' },
]


// ─── Room scene SVG ───────────────────────────────────────────────────────────
function RoomScene() {
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:0}}
      viewBox="0 0 1440 768" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="crWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d0225"/><stop offset="55%" stopColor="#180840"/><stop offset="100%" stopColor="#0f0428"/>
        </linearGradient>
        <linearGradient id="crFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#100335"/><stop offset="100%" stopColor="#07011a"/>
        </linearGradient>
        <linearGradient id="crWood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a1e08"/><stop offset="100%" stopColor="#2a0e04"/>
        </linearGradient>
        <linearGradient id="crShelf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3a1608"/><stop offset="100%" stopColor="#2a0e05"/>
        </linearGradient>
        <radialGradient id="crLanternGlow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="rgba(253,210,80,.75)"/><stop offset="100%" stopColor="rgba(220,100,10,0)"/>
        </radialGradient>
        <linearGradient id="crGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(40,110,65,.18)"/><stop offset="100%" stopColor="rgba(20,80,50,.06)"/>
        </linearGradient>
        <radialGradient id="crFloorGlow" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="rgba(196,170,255,.18)"/><stop offset="100%" stopColor="rgba(196,170,255,0)"/>
        </radialGradient>
        <filter id="crBlur6"><feGaussianBlur stdDeviation="6"/></filter>
        <filter id="crBlur12"><feGaussianBlur stdDeviation="12"/></filter>
        <filter id="crGlow8"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>

      {/* Background */}
      <rect width="1440" height="768" fill="url(#crWall)"/>

      {/* Floor */}
      <rect x="0" y="595" width="1440" height="173" fill="url(#crFloor)"/>
      {[...Array(9)].map((_,i) => (
        <line key={i} x1={i*180} y1="595" x2={i*180+90} y2="768" stroke="rgba(60,20,100,.22)" strokeWidth="1"/>
      ))}
      <rect x="300" y="585" width="840" height="40" fill="url(#crFloorGlow)" filter="url(#crBlur12)"/>

      {/* ── GREENHOUSE GLASS PANELS ── */}
      <rect x="0" y="0" width="250" height="610" fill="url(#crGlass)"/>
      {[62,124,186].map(x => <line key={x} x1={x} y1="0" x2={x} y2="610" stroke="rgba(80,190,120,.18)" strokeWidth="1.5"/>)}
      {[100,200,305,410,510].map(y => <line key={y} x1="0" y1={y} x2="250" y2={y} stroke="rgba(80,190,120,.18)" strokeWidth="1.5"/>)}
      <rect x="0" y="0" width="250" height="610" fill="none" stroke="rgba(60,140,90,.28)" strokeWidth="2.5"/>

      <rect x="1190" y="0" width="250" height="610" fill="url(#crGlass)"/>
      {[1252,1314,1376].map(x => <line key={x} x1={x} y1="0" x2={x} y2="610" stroke="rgba(80,190,120,.18)" strokeWidth="1.5"/>)}
      {[100,200,305,410,510].map(y => <line key={y} x1="1190" y1={y} x2="1440" y2={y} stroke="rgba(80,190,120,.18)" strokeWidth="1.5"/>)}
      <rect x="1190" y="0" width="250" height="610" fill="none" stroke="rgba(60,140,90,.28)" strokeWidth="2.5"/>

      {/* Ceiling arch */}
      <path d="M250,0 Q720,-30 1190,0" fill="none" stroke="rgba(196,170,255,.2)" strokeWidth="2"/>
      <path d="M0,0 Q720,55 1440,0" fill="rgba(8,2,24,.5)"/>

      {/* ── LEFT SHELVING UNIT ── */}
      <rect x="22" y="72" width="260" height="500" rx="4" fill="rgba(18,6,38,.55)" stroke="rgba(100,60,20,.3)" strokeWidth="1.5"/>
      <line x1="152" y1="72" x2="152" y2="572" stroke="rgba(100,60,20,.25)" strokeWidth="1"/>
      {[175,295,415,515].map(y => (
        <g key={y}>
          <rect x="22" y={y} width="260" height="12" rx="3" fill="url(#crShelf)"/>
          <rect x="22" y={y} width="260" height="12" rx="3" fill="none" stroke="rgba(253,230,138,.2)" strokeWidth="1"/>
        </g>
      ))}
      {/* Potion bottles on shelves */}
      {[[60,163],[90,163],[115,163],[140,163],[165,163],[200,163],[225,163],[250,163],
        [45,283],[75,283],[105,283],[130,283],[170,283],[205,283],[235,283],[260,283],
        [55,403],[85,403],[115,403],[150,403],[190,403],[220,403],[250,403]].map(([x,y],i) => {
        const cols=['#c4aaff','#f9a8d4','#ffb3e6','#fde68a','#c8b1e4','#ff9edb']
        const c=cols[i%6], h=22+i%8*3
        return (
          <g key={i}>
            <rect x={x-6} y={y-h} width="12" height={h} rx="3" fill={c} opacity=".28"/>
            <rect x={x-4} y={y-h-10} width="8" height="11" rx="2" fill={c} opacity=".42"/>
            <ellipse cx={x} cy={y-h-8} rx="5" ry="4.5" fill={c} opacity=".55"/>
            <rect x={x-6} y={y-h} width="12" height={h} rx="3" fill="none" stroke={c} strokeWidth="1" opacity=".55"/>
            <ellipse cx={x} cy={y-h/2} rx="3" ry="5" fill={c} opacity=".12" filter="url(#crBlur6)"/>
          </g>
        )
      })}
      {/* Lavender plants */}
      {[[40,510],[170,510],[55,390],[185,390]].map(([x,y],i) => (
        <g key={i}>
          <rect x={x} y={y-30} width="22" height="26" rx="4" fill="#1e100a" stroke="rgba(100,60,20,.4)" strokeWidth="1"/>
          <rect x={x+2} y={y-30} width="18" height="9" rx="2" fill="rgba(80,40,10,.6)"/>
          {[0,1,2].map(j => (
            <g key={j}>
              <line x1={x+8+j*3} y1={y-30} x2={x+5+j*4} y2={y-62} stroke="#5a3515" strokeWidth="1.5"/>
              <ellipse cx={x+4+j*5} cy={y-60} rx="3" ry="5" fill="#c4aaff" opacity=".65"/>
              <ellipse cx={x+7+j*3} cy={y-54} rx="2.5" ry="4" fill="#a87fff" opacity=".52"/>
            </g>
          ))}
        </g>
      ))}

      {/* ── RIGHT SHELVING UNIT ── */}
      <rect x="1158" y="72" width="260" height="500" rx="4" fill="rgba(18,6,38,.55)" stroke="rgba(100,60,20,.3)" strokeWidth="1.5"/>
      <line x1="1288" y1="72" x2="1288" y2="572" stroke="rgba(100,60,20,.25)" strokeWidth="1"/>
      {[175,295,415,515].map(y => (
        <g key={y}>
          <rect x="1158" y={y} width="260" height="12" rx="3" fill="url(#crShelf)"/>
          <rect x="1158" y={y} width="260" height="12" rx="3" fill="none" stroke="rgba(253,230,138,.2)" strokeWidth="1"/>
        </g>
      ))}
      {/* Magical glass containers on right shelves */}
      {[[1175,163],[1200,163],[1230,163],[1260,163],[1295,163],[1325,163],[1360,163],[1390,163],
        [1170,283],[1200,283],[1235,283],[1270,283],[1305,283],[1335,283],[1370,283],[1400,283]].map(([x,y],i) => {
        const cols=['#fde68a','#c8b1e4','#c4aaff','#f9a8d4','#ffb3e6','#ff9edb']
        const c=cols[i%6], h=20+i%6*4
        return i%3===0 ? (
          <rect key={i} x={x-8} y={y-h} width="16" height={h} rx="2" fill={c} opacity=".25" stroke={c} strokeWidth="1" />
        ) : (
          <g key={i}>
            <ellipse cx={x} cy={y-h/2} rx="8" ry={h/2+2} fill={c} opacity=".28"/>
            <ellipse cx={x} cy={y-h} rx="5" ry="5" fill={c} opacity=".4"/>
            <ellipse cx={x-2} cy={y-h-2} rx="2" ry="3" fill="rgba(255,255,255,.18)"/>
            <ellipse cx={x} cy={y-h/2} rx="8" ry={h/2+2} fill="none" stroke={c} strokeWidth="1" opacity=".5"/>
          </g>
        )
      })}
      {/* Books and tools on lower right shelves */}
      {[[1175,403],[1200,403],[1228,403],[1258,403],[1285,403],[1315,403],[1348,403],[1380,403],[1405,403]].map(([x,y],i) => {
        const c=['#c4aaff','#fde68a','#f9a8d4','#ffb3e6','#c8b1e4','#ff9edb'][i%6]
        const h=28+i%5*6
        return (
          <rect key={i} x={x} y={y-h} width="15" height={h} rx="2" fill={c} opacity=".22" stroke={c} strokeWidth="1" />
        )
      })}

      {/* ── CENTRAL ORNATE CABINET ── */}
      {/* Cabinet body */}
      <rect x="560" y="195" width="320" height="400" rx="7" fill="url(#crWood)"/>
      <rect x="560" y="195" width="320" height="400" rx="7" fill="none" stroke="rgba(253,200,80,.22)" strokeWidth="2"/>
      {/* Crown molding */}
      <path d="M545,195 Q720,162 895,195 L895,212 L545,212 Z" fill="#3a1608"/>
      <path d="M545,195 Q720,162 895,195" fill="none" stroke="rgba(253,200,80,.32)" strokeWidth="1.5"/>
      {/* Side pilasters */}
      <rect x="560" y="212" width="18" height="383" rx="4" fill="#3a1608" stroke="rgba(253,200,80,.18)" strokeWidth="1"/>
      <rect x="862" y="212" width="18" height="383" rx="4" fill="#3a1608" stroke="rgba(253,200,80,.18)" strokeWidth="1"/>
      {/* Vertical divider */}
      <line x1="720" y1="212" x2="720" y2="595" stroke="rgba(253,200,80,.16)" strokeWidth="1.5"/>
      {/* Horizontal dividers — 3 rows */}
      {[338,462].map(y => <line key={y} x1="578" y1={y} x2="862" y2={y} stroke="rgba(253,200,80,.16)" strokeWidth="1.5"/>)}
      {/* Central decorative rosette */}
      <circle cx="720" cy="252" r="30" fill="rgba(55,22,6,.85)" stroke="rgba(253,200,80,.28)" strokeWidth="1.5"/>
      <circle cx="720" cy="252" r="20" fill="rgba(38,14,4,.9)" stroke="rgba(253,200,80,.22)" strokeWidth="1"/>
      <circle cx="720" cy="252" r="8" fill="rgba(253,200,80,.18)"/>
      {[0,45,90,135,180,225,270,315].map(a => {
        const r=25, rad=a*Math.PI/180
        return <ellipse key={a} cx={720+Math.cos(rad)*r} cy={252+Math.sin(rad)*r} rx="4" ry="2.5"
          fill="rgba(253,200,80,.2)" transform={`rotate(${a} ${720+Math.cos(rad)*r} ${252+Math.sin(rad)*r})`}/>
      })}
      {/* Drawer knobs — 6 drawers */}
      {[[648,307],[793,307],[648,400],[793,400],[648,493],[793,493]].map(([x,y],i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="8" fill="#2a1508" stroke="rgba(253,200,80,.5)" strokeWidth="1.2"/>
          <circle cx={x} cy={y} r="3.5" fill="rgba(253,200,80,.38)"/>
          <circle cx={x-2} cy={y-2} r="1.5" fill="rgba(255,255,255,.18)"/>
        </g>
      ))}
      {/* Base molding */}
      <rect x="545" y="590" width="350" height="15" rx="3" fill="#3a1608" stroke="rgba(253,200,80,.2)" strokeWidth="1"/>
      {/* Cabinet feet */}
      {[572,640,800,860].map((x,i) => <rect key={i} x={x} y="603" width="14" height="20" rx="3" fill="#2a0e04"/>)}
      {/* Ambient glow from cabinet */}
      <ellipse cx="720" cy="608" rx="220" ry="35" fill="rgba(253,200,80,.07)" filter="url(#crBlur12)"/>

      {/* ── HANGING LANTERNS ── */}
      {[[310,0,'#f9a8d4'],[720,0,'#c4aaff'],[1130,0,'#fde68a']].map(([x,,c],i) => (
        <g key={i}>
          {[...Array(6)].map((_,j) => (
            <ellipse key={j} cx={x as number} cy={j*16+6} rx="4" ry="7" fill="none" stroke="rgba(100,60,20,.55)" strokeWidth="1.5"/>
          ))}
          <rect x={(x as number)-18} y="105" width="36" height="56" rx="9" fill="rgba(32,16,5,.92)" stroke={`${c}66`} strokeWidth="1.5"/>
          {[-9,9].map(d => <rect key={d} x={(x as number)+d} y="110" width="8" height="46" rx="4" fill={`${c}18`}/>)}
          <ellipse cx={x as number} cy="133" rx="10" ry="13" fill="url(#crLanternGlow)" filter="url(#crGlow8)"/>
          <ellipse cx={x as number} cy="135" rx="6" ry="7" fill="rgba(253,220,80,.65)"/>
          <path d={`M${(x as number)-20},105 Q${x},92 ${(x as number)+20},105`} fill="#3a1a06"/>
          <path d={`M${(x as number)-20},105 Q${x},92 ${(x as number)+20},105`} fill="none" stroke={`${c}55`} strokeWidth="1"/>
          <path d={`M${(x as number)-18},161 Q${x},174 ${(x as number)+18},161`} fill="#3a1a06"/>
          <path d={`M${(x as number)-10},163 L${(x as number)-55},270 L${(x as number)+55},270 L${(x as number)+10},163`} fill="rgba(253,210,80,.04)" filter="url(#crBlur12)"/>
        </g>
      ))}

      {/* ── IVY CORNER VINES ── */}
      <path d="M0,0 Q28,80 18,180 Q8,280 38,390 Q58,460 28,565" fill="none" stroke="rgba(28,95,48,.35)" strokeWidth="2.5"/>
      {[18,60,125,195,262,340,430].map((y,i) => (
        <ellipse key={i} cx={i%2===0?12:32} cy={y} rx="14" ry="10" fill="rgba(22,80,38,.28)"
          transform={`rotate(${i%2===0?-22:22} ${i%2===0?12:32} ${y})`}/>
      ))}
      <path d="M1440,0 Q1412,80 1422,180 Q1432,280 1402,390 Q1382,460 1412,565" fill="none" stroke="rgba(28,95,48,.35)" strokeWidth="2.5"/>
      {[18,60,125,195,262,340,430].map((y,i) => (
        <ellipse key={i} cx={i%2===0?1428:1408} cy={y} rx="14" ry="10" fill="rgba(22,80,38,.28)"
          transform={`rotate(${i%2===0?22:-22} ${i%2===0?1428:1408} ${y})`}/>
      ))}

      {/* Ambience orbs */}
      <ellipse cx="175" cy="400" rx="130" ry="85" fill="rgba(196,170,255,.06)" filter="url(#crBlur12)"/>
      <ellipse cx="1265" cy="360" rx="110" ry="75" fill="rgba(249,168,212,.055)" filter="url(#crBlur12)"/>
      <ellipse cx="720" cy="140" rx="180" ry="65" fill="rgba(253,230,138,.04)" filter="url(#crBlur12)"/>

      {/* Animated sparkles */}
      {[...Array(28)].map((_,i) => (
        <circle key={i} cx={(i*193+55)%1440} cy={(i*111+45)%560} r={i%4===0?2:1.2}
          fill={i%4===0?'#fde68a':i%4===1?'#c4aaff':i%4===2?'#f9a8d4':'#ffb3e6'}
          opacity={.35+i%3*.2}
          className="animate-star-twinkle" style={{animationDelay:`${(i*.19)%3}s`}}/>
      ))}

      {/* Ambient butterflies */}
      {[[110,'28%','#c4aaff','#9d6ef8',0],[1320,'35%','#f9a8d4','#f472b6',2.2],[720,'22%','#fde68a','#f59e0b',1.1]].map(([x,y,c1,c2,d],i) => (
        <g key={i}>
          <ellipse cx={(x as number)-7} cy={0} rx="7" ry="5" fill={c1 as string} opacity=".75"
            transform={`translate(${x},${parseInt(y as string)*768/100}) rotate(-22 -7 0)`}/>
          <ellipse cx={(x as number)+7} cy={0} rx="7" ry="5" fill={c1 as string} opacity=".75"
            transform={`translate(${x},${parseInt(y as string)*768/100}) rotate(22 7 0)`}/>
        </g>
      ))}
    </svg>
  )
}

// ─── Tool card (draggable) ────────────────────────────────────────────────────
function ToolCard({ tool, matched, hinted, onDragStart }: {
  tool: Tool; matched: boolean; hinted: boolean; onDragStart: (id: ToolId) => void
}) {
  const [hov, setHov] = useState(false)
  const { isAr } = useLang()
  return (
    <div
      draggable={!matched}
      onDragStart={(e) => { e.dataTransfer.setData('toolId', tool.id); onDragStart(tool.id) }}
      onMouseEnter={() => { setHov(true); if (!matched) audio.playHover() }}
      onMouseLeave={() => setHov(false)}
      style={{
        padding:'10px 12px', borderRadius:10, cursor: matched ? 'default' : 'grab',
        background: matched ? 'rgba(255,179,230,.08)' : hinted ? `${tool.accent}18` : hov ? 'rgba(139,92,246,.16)' : 'rgba(6,1,20,.8)',
        border: `1.5px solid ${matched ? 'rgba(255,179,230,.5)' : hinted ? tool.accent : hov ? tool.accent+'88' : 'rgba(196,170,255,.22)'}`,
        backdropFilter:'blur(16px)', transition:'all .25s',
        boxShadow: hinted ? `0 0 18px ${tool.accent}44` : hov && !matched ? `0 4px 20px rgba(139,92,246,.28), 0 2px 8px rgba(0,0,0,.4)` : 'none',
        transform: hov && !matched ? 'translateY(-2px) scale(1.02)' : 'none',
        filter: hov && !matched ? 'brightness(1.1)' : 'none',
        display:'flex', alignItems:'center', gap:10, userSelect:'none',
        opacity: matched ? 0.55 : 1,
      }}>
      <div style={{fontSize:22, flexShrink:0, opacity: matched ? .5 : 1}}>{tool.emoji}</div>
      <div style={{flex:1, minWidth:0}}>
        <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:13, color: matched ? 'rgba(255,179,230,.75)' : hinted ? tool.accent : 'rgba(221,205,255,.9)',
          letterSpacing: isAr ? 0 : '.04em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
          {matched ? '✓ ' : ''}{tool.name}
        </p>
        {!matched && hov && (
          <p style={{fontFamily:"'Nunito',sans-serif", fontStyle:'italic', fontSize:11, color:'rgba(196,170,255,.5)', marginTop:2}}>
            {isAr ? 'اسحب إلى درج' : 'Drag to a drawer'}
          </p>
        )}
      </div>
      {!matched && (
        <div style={{width:8, height:8, borderRadius:'50%', background:tool.accent, flexShrink:0,
          boxShadow:`0 0 6px ${tool.accent}`, opacity:.8}}/>
      )}
    </div>
  )
}

// ─── Drawer slot (drop target) ────────────────────────────────────────────────
function DrawerSlot({ drawer, matchedTool, dragOver, wrong, hinted, onDragOver, onDragLeave, onDrop }: {
  drawer: DrawerDef; matchedTool: Tool | null; dragOver: boolean; wrong: boolean; hinted: boolean
  onDragOver: () => void; onDragLeave: () => void; onDrop: (toolId: ToolId) => void
}) {
  const { t, isAr } = useLang()
  const drawerLabel = t.cc_drawers[drawer.id as keyof typeof t.cc_drawers] ?? drawer.label
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver() }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('toolId') as ToolId; onDrop(id) }}
      style={{
        padding:'10px 14px', borderRadius:10, minHeight:58, transition:'all .22s',
        background: matchedTool ? `${matchedTool.accent}12` : dragOver ? `${drawer.accent}14` : wrong ? 'rgba(249,115,22,.1)' : 'rgba(6,1,20,.75)',
        border: `1.5px ${matchedTool ? 'solid' : 'dashed'} ${
          wrong ? '#ff9edb' : matchedTool ? `${matchedTool.accent}cc` : hinted ? drawer.accent : dragOver ? `${drawer.accent}88` : 'rgba(196,170,255,.22)'
        }`,
        backdropFilter:'blur(16px)',
        boxShadow: dragOver ? `0 0 16px ${drawer.accent}33` : hinted ? `0 0 18px ${drawer.accent}44` : wrong ? '0 0 12px rgba(255,158,219,.3)' : matchedTool ? `0 0 14px ${matchedTool.accent}22` : 'none',
        display:'flex', flexDirection:'column', gap:4,
      }}>
      <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:13, letterSpacing: isAr ? 0 : '.08em',
        color: matchedTool ? `${matchedTool.accent}` : wrong ? '#ff9edb' : dragOver ? drawer.accent : hinted ? `${drawer.accent}` : 'rgba(221,205,255,.72)'}}>
        {isAr ? drawerLabel : drawerLabel.toUpperCase()}
      </p>
      {matchedTool ? (
        <div style={{display:'flex', alignItems:'center', gap:8}}>
          <span style={{fontSize:16}}>{matchedTool.emoji}</span>
          <p style={{fontFamily:"'Nunito',sans-serif", fontSize:12, color:'rgba(235,225,255,.92)'}}>{matchedTool.name}</p>
          <div style={{marginLeft:'auto', width:14, height:14, borderRadius:'50%', background:`linear-gradient(135deg,${matchedTool.accent},${matchedTool.accent}99)`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#0a0120', fontWeight:700}}>✓</div>
        </div>
      ) : (
        <p style={{fontFamily:"'Nunito',sans-serif", fontStyle:'italic', fontSize:10, color:'rgba(196,170,255,.42)'}}>
          {dragOver ? t.cc_dropPrompt : t.cc_emptyDrawer}
        </p>
      )}
    </div>
  )
}

// ─── Skill reveal popup ───────────────────────────────────────────────────────
function SkillReveal({ tool, matchedCount, onClose }: { tool: Tool; matchedCount: number; onClose: ()=>void }) {
  const { t, isAr } = useLang()
  const toolDesc = t.cc_tools[tool.id as keyof typeof t.cc_tools] ?? tool.desc
  return (
    <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',
      background:'rgba(4,1,14,.72)',backdropFilter:'blur(12px)'}}>
      <div className="animate-panel-in" style={{
        width:480, background:'linear-gradient(135deg,rgba(8,2,26,.98),rgba(20,6,52,.99))',
        border:`1.5px solid ${tool.accent}55`, borderRadius:18, overflow:'hidden',
        boxShadow:`0 24px 80px rgba(0,0,0,.7),0 0 60px ${tool.accent}22`}}>
        <div style={{height:3, background:`linear-gradient(90deg,transparent,${tool.accent},transparent)`}}/>
        <div style={{padding:'26px 30px 18px', textAlign:'center', borderBottom:'1px solid rgba(196,170,255,.12)'}}>
          <div style={{fontSize:48, marginBottom:10}}>{tool.emoji}</div>
          <p style={{fontFamily:"'Cinzel',serif", fontSize:9, color:`${tool.accent}bb`, letterSpacing:'.22em', marginBottom:6}}>
            {isAr ? `أداة موضوعة · ${matchedCount}/6` : `TOOL PLACED · ${matchedCount}/6`}
          </p>
          <h2 style={{fontFamily:"'Cinzel Decorative',serif", fontSize:24, color:tool.accent, lineHeight:1.3, marginBottom:4}}>
            {tool.name}
          </h2>
          <div style={{width:48, height:2, background:`linear-gradient(90deg,transparent,${tool.accent},transparent)`, margin:'10px auto'}}/>
          <p style={{fontFamily:"'Nunito',sans-serif", fontStyle: isAr ? 'normal' : 'italic', fontSize:16, color:'rgba(221,205,255,.82)', lineHeight:1.6}}>
            {toolDesc}
          </p>
        </div>
        <div style={{padding:'16px 30px 22px', display:'flex', justifyContent:'flex-end'}}>
          <button onClick={onClose} style={{
            background:`linear-gradient(135deg,${tool.accent}22,${tool.accent}11)`,
            border:`1px solid ${tool.accent}55`, borderRadius:9, padding:'8px 22px', cursor:'pointer',
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:13, color:tool.accent, letterSpacing: isAr ? 0 : '.08em'}}>
            {t.continue} ✕
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Wrong toast ──────────────────────────────────────────────────────────────
function WrongToast({ msg }: { msg: string }) {
  return (
    <div className="animate-toast" style={{position:'fixed',top:80,left:'50%',transform:'translateX(-50%)',
      background:'rgba(6,1,20,.96)',backdropFilter:'blur(16px)',
      border:'1px solid rgba(155,114,207,.45)',borderRadius:12,
      padding:'10px 22px',zIndex:52,pointerEvents:'none',
      display:'flex',alignItems:'center',gap:10,
      boxShadow:'0 6px 28px rgba(0,0,0,.6)'}}>
      <span style={{fontSize:16}}>🔮</span>
      <p style={{fontFamily:"'Lora',serif",fontStyle:'italic',fontSize:15,color:'rgba(251,200,150,.85)'}}>{msg}</p>
    </div>
  )
}

// ─── Cabinet interactive SVG overlay (animates the actual room cabinet) ────────
// Cabinet in RoomScene viewBox 1440×768:
//   body: rect x=560 y=195 w=320 h=400  |  divider at x=720  |  doors y=212 h=383
//   left door hinged at x=578, right door hinged at x=862
function CabinetInteractiveSVG({ phase, onOpen }: { phase: 'drag'|'ready'|'opening'|'complete'; onOpen: ()=>void }) {
  const { t, isAr } = useLang()
  if (phase === 'drag') return null
  const isReady = phase === 'ready'
  const opened = phase === 'opening' || phase === 'complete'

  return (
    <>
      {/* SVG overlay — exact same viewBox as RoomScene so coords align perfectly */}
      <svg
        style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:6,overflow:'visible',
          pointerEvents: isReady ? 'auto' : 'none',
          cursor: isReady ? 'pointer' : 'default'}}
        viewBox="0 0 1440 768" preserveAspectRatio="xMidYMid slice"
        onClick={isReady ? onOpen : undefined}>
        <defs>
          <linearGradient id="ci_dL" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4e2008"/><stop offset="100%" stopColor="#2a0e04"/>
          </linearGradient>
          <linearGradient id="ci_dR" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="#4e2008"/><stop offset="100%" stopColor="#2a0e04"/>
          </linearGradient>
          <linearGradient id="ci_int" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a0810"/><stop offset="100%" stopColor="#08020a"/>
          </linearGradient>
          <radialGradient id="ci_iglow" cx="50%" cy="38%" r="65%">
            <stop offset="0%" stopColor="rgba(253,230,138,.14)"/>
            <stop offset="100%" stopColor="rgba(253,230,138,0)"/>
          </radialGradient>
        </defs>

        {/* Ready: pulsing gold glow ring on the real cabinet */}
        {isReady && (
          <>
            <rect x="545" y="175" width="350" height="440" rx="10"
              fill="rgba(253,230,138,.03)"
              stroke="rgba(253,230,138,.72)" strokeWidth="2.5"
              className="animate-key-glow"/>
            <rect x="534" y="164" width="372" height="462" rx="14"
              fill="none"
              stroke="rgba(253,230,138,.22)" strokeWidth="1.2"
              className="animate-key-glow" style={{animationDelay:'.45s'}}/>
            <text x="720" y="642" textAnchor="middle"
              fontFamily="'Cinzel',serif" fontSize="12"
              fill="rgba(253,230,138,.72)" letterSpacing="3"
              className="animate-key-glow" style={{animationDelay:'.22s',pointerEvents:'none'}}>
              {isAr ? '✦ انقر للفتح' : '✦ CLICK TO OPEN'}
            </text>
          </>
        )}

        {/* Dark cabinet interior — fades in as doors prepare to open */}
        <rect x="578" y="212" width="284" height="383" rx="2" fill="url(#ci_int)"
          opacity={opened ? 1 : 0}
          style={{transition:'opacity .5s .3s'}}/>
        {opened && <rect x="578" y="212" width="284" height="383" fill="url(#ci_iglow)"/>}

        {/* Interior shelf lines revealed after opening */}
        {opened && [295,372,450,523].map((y,i) => (
          <rect key={y} x="592" y={y} width="256" height="5" rx="2"
            fill="rgba(50,18,5,.98)" stroke="rgba(253,230,138,.18)" strokeWidth="1"
            style={{animation:`panel-in .4s ease ${i*.13}s both`}}/>
        ))}

        {/* Sparkle accents inside open cabinet */}
        {phase === 'complete' && [672,720,768].map((x,i) => (
          <circle key={x} cx={x} cy={328+i*22} r="2.2"
            fill="#fde68a" opacity=".6"
            className="animate-star-twinkle" style={{animationDelay:`${i*.38}s`}}/>
        ))}

        {/* Left door — hinged at left edge x=578 */}
        <g style={{
          transformBox:'fill-box',
          transformOrigin:'left center',
          transform: opened ? 'perspective(660px) rotateY(-120deg)' : 'none',
          transition:'transform 1.15s .05s cubic-bezier(.35,0,.12,1)',
        }}>
          <rect x="578" y="212" width="142" height="383" fill="url(#ci_dL)"
            stroke="rgba(253,230,138,.28)" strokeWidth="1.5"/>
          <rect x="586" y="221" width="126" height="168" rx="4"
            fill="none" stroke="rgba(253,200,80,.16)" strokeWidth="1"/>
          <rect x="586" y="399" width="126" height="187" rx="4"
            fill="none" stroke="rgba(253,200,80,.16)" strokeWidth="1"/>
          <circle cx="713" cy="404" r="8" fill="#2a1508" stroke="rgba(253,200,80,.52)" strokeWidth="1.2"/>
          <circle cx="713" cy="404" r="3.5" fill="rgba(253,200,80,.4)"/>
          <circle cx="711" cy="402" r="1.4" fill="rgba(255,255,255,.2)"/>
        </g>

        {/* Right door — hinged at right edge x=862 */}
        <g style={{
          transformBox:'fill-box',
          transformOrigin:'right center',
          transform: opened ? 'perspective(660px) rotateY(120deg)' : 'none',
          transition:'transform 1.15s .05s cubic-bezier(.35,0,.12,1)',
        }}>
          <rect x="720" y="212" width="142" height="383" fill="url(#ci_dR)"
            stroke="rgba(253,230,138,.28)" strokeWidth="1.5"/>
          <rect x="728" y="221" width="126" height="168" rx="4"
            fill="none" stroke="rgba(253,200,80,.16)" strokeWidth="1"/>
          <rect x="728" y="399" width="126" height="187" rx="4"
            fill="none" stroke="rgba(253,200,80,.16)" strokeWidth="1"/>
          <circle cx="727" cy="404" r="8" fill="#2a1508" stroke="rgba(253,200,80,.52)" strokeWidth="1.2"/>
          <circle cx="727" cy="404" r="3.5" fill="rgba(253,200,80,.4)"/>
          <circle cx="729" cy="402" r="1.4" fill="rgba(255,255,255,.2)"/>
        </g>
      </svg>

      {/* Golden key — moved to unified completion overlay below */}

      {/* Ready message card — appears just below cabinet */}
      {isReady && (
        <div className="animate-panel-in" style={{
          position:'absolute', bottom:152, left:'50%', transform:'translateX(-50%)',
          zIndex:8, whiteSpace:'nowrap', textAlign:'center',
          background:'rgba(4,0,14,.92)', backdropFilter:'blur(16px)',
          border:'1px solid rgba(253,230,138,.45)', borderRadius:12,
          padding:'11px 26px', boxShadow:'0 0 28px rgba(253,230,138,.22)',
          pointerEvents:'none',
        }}>
          <p style={{fontFamily: isAr?"'Nunito',sans-serif":"'Cinzel',serif",
            fontSize:9,letterSpacing: isAr?0:'.2em',
            color:'rgba(253,230,138,.72)',marginBottom:5}}>
            {isAr ? 'الخزانة جاهزة' : 'CABINET READY'}
          </p>
          <p style={{fontFamily: isAr?"'Nunito',sans-serif":"'Cinzel Decorative',serif",
            fontSize:14,color:'rgba(221,205,255,.92)'}}>
            {isAr ? 'الخزانة تنتظر. انقر للكشف.' : 'The cabinet is ready. Click to reveal.'}
          </p>
        </div>
      )}

      {/* Completion card — part of unified overlay below */}
    </>
  )
}


// ─── Top HUD ─────────────────────────────────────────────────────────────────
function RoomHUD({ guide, totalKeys, butterflies, matchedCount, onBack, onHint, onMainMenu, onReset }:
  { guide: GuideChoice; totalKeys: number; butterflies: number; matchedCount: number; onBack: ()=>void; onHint: ()=>void; onMainMenu: ()=>void; onReset: ()=>void }) {
  const isMan = guide === 'man'
  const { t, isAr } = useLang()
  return (
    <div style={{position:'absolute',top:0,left:0,right:0,height:64,zIndex:30,
      background:'linear-gradient(180deg,rgba(24,6,58,1) 0%,rgba(32,9,72,1) 50%,rgba(20,5,50,1) 100%)',
      boxShadow:'0 1px 0 rgba(155,114,207,.2), 0 2px 28px rgba(18,5,48,.75)',
      backdropFilter:'blur(22px)',borderBottom:'1px solid rgba(196,170,255,.22)',
      display:'flex',alignItems:'center',padding:'0 12px 0 16px',gap:10}}>

      <button onClick={() => { audio.playReturnGarden(); onBack() }} className="hov-btn" style={{display:'flex',alignItems:'center',gap:6,
        background:'rgba(139,92,246,.16)',border:'1px solid rgba(196,170,255,.32)',
        borderRadius:8,padding:'7px 15px',cursor:'pointer',
        fontFamily:"'Cinzel',serif",fontSize:13,color:'rgba(196,170,255,.82)',letterSpacing:'.06em',
        transition:'all .2s',flexShrink:0}}>
        {isAr ? 'الحديقة →' : '← Garden'}
      </button>

      <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:3}}>
        <div style={{width:60,height:60,borderRadius:'50%',
          border:'1.5px solid rgba(253,230,138,.48)',overflow:'hidden',
          display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 16px rgba(139,92,246,.5)'}}>
          <CompanionFace guide={guide} size={60} idPrefix="cr_hud"/>
        </div>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:7.5,color:'rgba(196,170,255,.6)',letterSpacing:'.05em',whiteSpace:'nowrap'}}>
          {isAr ? (isMan ? 'الغسق' : 'الفجر') : (isMan ? 'Dusk' : 'Dawn')}
        </span>
      </div>

      <div style={{width:1,height:40,background:'rgba(196,170,255,.2)',flexShrink:0}}/>

      <div>
        <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:11,color:'rgba(253,230,138,.72)',letterSpacing: isAr ? 0 : '.18em',marginBottom:2}}>{isAr ? 'تستكشف الآن' : 'NOW EXPLORING'}</p>
        <h2 style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif",fontSize:15,color:'rgba(221,205,255,.92)',letterSpacing: isAr ? 0 : '.05em'}}>{t.cc_title}</h2>
      </div>

      <div style={{flex:1}}/>

      <div style={{display:'flex',flexDirection:'column',gap:5,alignItems:'center',flexShrink:0}}>
        <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:8.5,color:'rgba(253,230,138,.72)',letterSpacing: isAr ? 0 : '.12em'}}>{isAr ? 'الأدوات الموضوعة' : 'TOOLS PLACED'}</p>
        <div style={{display:'flex',gap:6}}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{width:22,height:22,borderRadius:6,
              background:i<matchedCount?'linear-gradient(135deg,rgba(253,230,138,.3),rgba(253,230,138,.15))':'rgba(196,170,255,.08)',
              border:`1.5px solid ${i<matchedCount?'rgba(253,230,138,.7)':'rgba(196,170,255,.22)'}`,
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,
              transition:'all .4s',boxShadow:i<matchedCount?'0 0 10px rgba(253,230,138,.38)':'none'}}>
              {i<matchedCount?'✓':''}
            </div>
          ))}
        </div>
      </div>

      <div style={{width:1,height:40,background:'rgba(196,170,255,.2)',flexShrink:0}}/>

      <div style={{display:'flex',gap:14,alignItems:'center',flexShrink:0}}>
        <div style={{textAlign:'center'}}>
          <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:10,color:'rgba(253,230,138,.6)',letterSpacing: isAr ? 0 : '.08em',marginBottom:2}}>{isAr ? 'المفاتيح' : 'KEYS'}</p>
          <p style={{fontFamily:"'Nunito',sans-serif",fontSize:19,color:'#fde68a',fontWeight:700}}>{totalKeys}/5</p>
        </div>
        <div style={{textAlign:'center'}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:8,color:'rgba(196,170,255,.6)',letterSpacing:'.08em',marginBottom:2}}>🦋</p>
          <p style={{fontFamily:"'Nunito',sans-serif",fontSize:19,color:'#c4aaff',fontWeight:700}}>{butterflies}</p>
        </div>
      </div>

      <div style={{width:1,height:40,background:'rgba(196,170,255,.2)',flexShrink:0}}/>

      <button onClick={onHint}
        onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 18px rgba(196,170,255,.55)'; e.currentTarget.style.borderColor='rgba(196,170,255,.65)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(196,170,255,.3)' }}
        style={{display:'flex',alignItems:'center',gap:6,
        background:'rgba(139,92,246,.15)',border:'1px solid rgba(196,170,255,.3)',
        borderRadius:8,padding:'7px 15px',cursor:'pointer',
        fontFamily:"'Cinzel',serif",fontSize:11,color:'rgba(196,170,255,.82)',letterSpacing:'.04em',flexShrink:0,transition:'all .2s'}}>
        {isAr ? '✦ تلميح' : '✦ Hint'}
      </button>

      <div style={{width:1,height:40,background:'rgba(196,170,255,.15)',flexShrink:0}}/>

      <div style={{display:'flex',flexDirection:'row',gap:6,flexShrink:0,alignItems:'center'}}>
        <button onClick={() => { audio.playReturnGarden(); onMainMenu() }} className="hov-btn"
          onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 16px rgba(253,230,138,.4)'; e.currentTarget.style.borderColor='rgba(253,230,138,.7)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(253,230,138,.45)' }}
          style={{
          background:'rgba(253,230,138,.14)',border:'1px solid rgba(253,230,138,.45)',
          borderRadius:7,padding:'6px 11px',cursor:'pointer',transition:'all .2s',
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:10,color:'rgba(253,230,138,.9)',letterSpacing: isAr ? 0 : '.04em',whiteSpace:'nowrap'}}>
          {isAr ? '⌂ قائمة' : '⌂ Menu'}
        </button>
        <button onClick={onReset}
          onMouseEnter={e => { e.currentTarget.style.boxShadow='0 0 13px rgba(249,168,212,.35)'; e.currentTarget.style.borderColor='rgba(249,168,212,.55)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(249,168,212,.3)' }}
          style={{
          background:'rgba(249,168,212,.08)',border:'1px solid rgba(249,168,212,.3)',
          borderRadius:7,padding:'6px 11px',cursor:'pointer',transition:'all .2s',
          fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:10,color:'rgba(249,168,212,.65)',letterSpacing: isAr ? 0 : '.04em',whiteSpace:'nowrap'}}>
          {isAr ? '↺ إعادة' : '↺ Reset'}
        </button>
      </div>
      <InlineControls />
    </div>
  )
}

// ─── Bottom quest bar ─────────────────────────────────────────────────────────
function QuestBar({ matchedCount, phase }: { matchedCount: number; phase: 'drag'|'ready'|'opening'|'complete' }) {
  const { isAr } = useLang()
  let text = isAr ? '"أعد كل أداة إلى الدرج الذي تخلق فيه أكبر قيمة."' : '"Return each tool to the drawer where it creates the most value."'
  let label = isAr ? `المهمة الحالية · ${matchedCount}/6 موضوعة` : `CURRENT QUEST · ${matchedCount}/6 PLACED`
  let accent = '#c4aaff'
  if (phase === 'ready') {
    label = isAr ? 'الخزانة مفتوحة · افتحها' : 'CABINET UNLOCKED · OPEN IT'
    text = isAr ? '"الخزانة تنتظر. انقر للكشف عما بداخلها."' : '"The cabinet awaits. Click to reveal what lies within."'
    accent = '#fde68a'
  } else if (phase === 'opening' || phase === 'complete') {
    label = isAr ? 'اكتمل اللغز' : 'PUZZLE COMPLETE'
    text = isAr ? '"لكل أداة مكانها — والآن صارت معروفة."' : '"Every tool has its place — and now they are known."'
    accent = '#ffb3e6'
  }
  return (
    <div style={{position:'absolute',bottom:0,left:0,right:0,height:68,zIndex:30,
      background:'linear-gradient(0deg,rgba(18,4,50,1) 0%,rgba(26,7,62,1) 60%,rgba(20,5,55,1) 100%)',
      boxShadow:'0 -1px 0 rgba(155,114,207,.18), 0 -2px 24px rgba(18,5,48,.7)',
      backdropFilter:'blur(18px)',borderTop:'1px solid rgba(196,170,255,.12)',
      display:'flex',alignItems:'center',padding:'0 24px',gap:18}}>
      <div style={{width:8,height:8,borderRadius:'50%',background:accent,
        boxShadow:`0 0 10px ${accent}cc`,animation:'glow-pulse 2s infinite',flexShrink:0}}/>
      <div style={{flex:1}}>
        <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:10.5,color:`${accent}cc`,letterSpacing: isAr ? 0 : '.15em',marginBottom:4}}>
          {label}
        </p>
        <p key={text} style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif",fontStyle: isAr ? 'normal' : 'italic',fontSize:16,color:'rgba(221,200,255,.88)',lineHeight:1.5,animation:'panel-in .3s ease'}}>
          {text}
        </p>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:5,alignItems:'flex-end',flexShrink:0}}>
        <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:8,color:'rgba(196,170,255,.5)',letterSpacing: isAr ? 0 : '.1em'}}>{isAr ? 'التقدم' : 'PROGRESS'}</p>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{width:9,height:9,borderRadius:'50%',transition:'all .4s',
              background:i<matchedCount?TOOLS[i].accent:'transparent',
              border:`1.5px solid ${i<matchedCount?TOOLS[i].accent:'rgba(196,170,255,.3)'}`,
              boxShadow:i<matchedCount?`0 0 7px ${TOOLS[i].accent}88`:'none'}}/>
          ))}
          <span style={{fontFamily:"'Cinzel',serif",fontSize:11,color:'rgba(253,230,138,.72)',marginLeft:4}}>
            {matchedCount}/6
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Hint overlay ─────────────────────────────────────────────────────────────
function HintPanel({ matched, phase, onClose }: { matched: Set<ToolId>; phase: 'drag'|'ready'|'opening'|'complete'; onClose: ()=>void }) {
  const { isAr, t } = useLang()
  const firstUnmatched = TOOLS.find(tool => !matched.has(tool.id))
  return (
    <div style={{position:'fixed',inset:0,zIndex:48,overflowY:'auto',overflowX:'hidden',
      background:'rgba(4,1,14,.65)',backdropFilter:'blur(10px)'}} onClick={onClose}>
    <div style={{minHeight:'100%',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px 16px'}}>
      <div className="animate-panel-in" onClick={e=>e.stopPropagation()} style={{width:420,
        background:'linear-gradient(135deg,rgba(6,1,20,.98),rgba(16,4,40,.99))',
        border:'1px solid rgba(196,170,255,.3)',borderRadius:16,overflow:'hidden'}}>
        <div style={{padding:'16px 22px 12px',borderBottom:'1px solid rgba(196,170,255,.14)',
          display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:9,color:'rgba(253,230,138,.62)',letterSpacing: isAr ? 0 : '.2em',marginBottom:3}}>{isAr ? 'إرشاد' : 'GUIDANCE'}</p>
            <h3 style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif",fontSize:14,color:'#fde68a'}}>✦ {isAr ? 'تلميحات اللغز' : 'Puzzle Hints'}</h3>
          </div>
          <button onClick={onClose} style={{background:'none',border:'none',color:'rgba(196,170,255,.62)',cursor:'pointer',fontSize:22}}>×</button>
        </div>
        <div style={{padding:'16px 20px 20px',display:'flex',flexDirection:'column',gap:10}}>
          {phase === 'drag' && firstUnmatched ? (
            <div style={{display:'flex',gap:14,padding:'12px 14px',borderRadius:10,
              background:`${firstUnmatched.accent}10`,border:`1px solid ${firstUnmatched.accent}44`}}>
              <div style={{fontSize:26, flexShrink:0}}>{firstUnmatched.emoji}</div>
              <div>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:11,color:firstUnmatched.accent,marginBottom:5}}>{firstUnmatched.name}</p>
                <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif",fontStyle: isAr ? 'normal' : 'italic',fontSize:12,color:'rgba(196,170,255,.68)',lineHeight:1.5}}>
                  {isAr
                    ? `تنتمي إلى درج "${t.cc_drawers[firstUnmatched.drawer as keyof typeof t.cc_drawers] ?? DRAWERS.find(d => d.id === firstUnmatched.drawer)?.label}".`
                    : `Belongs in the "${DRAWERS.find(d=>d.id===firstUnmatched.drawer)?.label}" drawer.`}
                </p>
              </div>
            </div>
          ) : (
            <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif",fontStyle: isAr ? 'normal' : 'italic',fontSize:13,color:'rgba(196,170,255,.6)',textAlign:'center',padding:'10px 0'}}>
              {isAr ? 'تم وضع جميع الأدوات بشكل صحيح. ✓' : 'All tools have been placed correctly. ✓'}
            </p>
          )}
          <div style={{marginTop:4}}>
            {TOOLS.map(t => (
              <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 10px',borderRadius:8,
                background: matched.has(t.id) ? 'rgba(255,179,230,.06)' : 'transparent',
                marginBottom:3}}>
                <span style={{fontSize:14}}>{t.emoji}</span>
                <p style={{fontFamily:"'Cinzel',serif",fontSize:10,
                  color:matched.has(t.id)?'rgba(255,179,230,.7)':'rgba(196,170,255,.55)',flex:1}}>
                  {t.name}
                </p>
                <span style={{fontSize:10,color:matched.has(t.id)?'rgba(255,179,230,.7)':'rgba(196,170,255,.3)'}}>
                  {matched.has(t.id)?'✓':'○'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

// ─── Cabinet progress lights overlay ─────────────────────────────────────────
// SVG knob coords (from RoomScene viewBox 1440×768): [[648,307],[793,307],[648,400],[793,400],[648,493],[793,493]]
const KNOB_POSITIONS = [[648,307],[793,307],[648,400],[793,400],[648,493],[793,493]]

function CabinetProgressLights({ matchedCount }: { matchedCount: number }) {
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:5}}
      viewBox="0 0 1440 768" preserveAspectRatio="xMidYMid slice">
      {KNOB_POSITIONS.map(([x,y],i) => {
        const lit = i < matchedCount
        return (
          <g key={i}>
            {lit && (
              <>
                <circle cx={x} cy={y} r="20" fill="rgba(253,230,138,.18)" filter="url(#crBlur6)"/>
                <circle cx={x} cy={y} r="11" fill="rgba(253,230,138,.28)" filter="url(#crBlur6)"/>
              </>
            )}
            <circle cx={x} cy={y} r="6" fill={lit ? '#fde68a' : 'transparent'}
              stroke={lit ? 'rgba(253,230,138,.8)' : 'rgba(253,200,80,.18)'} strokeWidth={lit ? 1.5 : 1}
              style={{transition:'all .5s'}}/>
            {lit && <circle cx={x} cy={y} r="3" fill="rgba(255,255,255,.72)"/>}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CuriousRoom({ guide, onBack, hasKey, butterflies, totalKeys, onKeyCollected, onMainMenu, onReset }:
  { guide: GuideChoice; onBack: ()=>void; hasKey: boolean; butterflies: number; totalKeys: number; onKeyCollected: ()=>void; onMainMenu: ()=>void; onReset: ()=>void }) {

  const { t, isAr } = useLang()
  // Shuffle tool display order and drawer display order independently each mount
  const displayTools = useMemo(() => shuffle([...TOOLS]), [])
  const displayDrawers = useMemo(() => {
    // Shuffle drawers such that no drawer is in the same position as its matching tool
    const toolDrawerIds = displayTools.map(t => t.drawer)
    let attempt = shuffle([...DRAWERS])
    let tries = 0
    while (tries < 20 && attempt.some((d, i) => d.id === toolDrawerIds[i])) {
      attempt = shuffle([...DRAWERS])
      tries++
    }
    return attempt
  }, [displayTools])

  const initMatched = hasKey ? new Set<ToolId>(TOOLS.map(t=>t.id)) : new Set<ToolId>()
  const initContents: Partial<Record<DrawerId,ToolId>> = hasKey
    ? Object.fromEntries(TOOLS.map(t=>[t.drawer,t.id])) as Record<DrawerId,ToolId>
    : {}

  const [showIntro,     setShowIntro]     = useState(!hasKey)
  const [matched,       setMatched]       = useState<Set<ToolId>>(initMatched)
  const [contents,      setContents]      = useState<Partial<Record<DrawerId,ToolId>>>(initContents)
  const [dragging,      setDragging]      = useState<ToolId|null>(null)
  const [dragOver,      setDragOver]      = useState<DrawerId|null>(null)
  const [wrongDrawer,   setWrongDrawer]   = useState<DrawerId|null>(null)
  const [wrongMsg,      setWrongMsg]      = useState<string|null>(null)
  const [revealTool,    setRevealTool]    = useState<Tool|null>(null)
  const [phase,         setPhase]         = useState<'drag'|'ready'|'opening'|'complete'>(hasKey?'complete':'drag')
  const [showHint,      setShowHint]      = useState(false)
  const [hintTarget,    setHintTarget]    = useState<{toolId:ToolId;drawerId:DrawerId}|null>(null)
  const [keyCollected,  setKeyCollected]  = useState(hasKey)
  const wrongRef = useRef<number>(undefined)
  const hintRef  = useRef<number>(undefined)

  // Ambient
  useEffect(() => {
    audio.startAmbient('cabinet')
    return () => audio.stopAmbient()
  }, [])

  // Transition to ready phase when all matched AND reveal popup is closed
  useEffect(() => {
    if (matched.size >= TOOLS.length && !revealTool && phase === 'drag') {
      const t = setTimeout(() => { audio.playPuzzleComplete(); setPhase('ready') }, 450)
      return () => clearTimeout(t)
    }
  }, [matched.size, revealTool, phase])

  const handleDrop = useCallback((drawerId: DrawerId, toolId: ToolId) => {
    setDragOver(null)
    setDragging(null)
    if (matched.has(toolId)) return // already placed
    const tool = TOOLS.find(t=>t.id===toolId)!
    if (tool.drawer === drawerId) {
      audio.playDrop()
      setTimeout(() => audio.playShimmer(), 100)
      setMatched(prev => new Set([...prev, toolId]))
      setContents(prev => ({...prev, [drawerId]: toolId}))
      setRevealTool(tool)
    } else {
      audio.playIncorrect()
      setWrongDrawer(drawerId)
      setWrongMsg(isAr ? 'هذه الأداة تنتمي إلى درج مختلف.' : 'This tool belongs in a different drawer.')
      clearTimeout(wrongRef.current)
      wrongRef.current = window.setTimeout(() => {
        setWrongDrawer(null)
        setWrongMsg(null)
      }, 2200)
    }
  }, [matched, isAr])

  const handleHint = useCallback(() => {
    const unmatched = TOOLS.find(t => !matched.has(t.id))
    if (!unmatched) return
    audio.playHint()
    setHintTarget({ toolId: unmatched.id, drawerId: unmatched.drawer })
    clearTimeout(hintRef.current)
    hintRef.current = window.setTimeout(() => setHintTarget(null), 3200)
  }, [matched])

  const handleCabinetOpen = useCallback(() => {
    audio.playSelect()
    setPhase('opening')
    setTimeout(() => setPhase('complete'), 1400)
  }, [])

  const handleSkip = () => {
    setMatched(new Set(TOOLS.map(t=>t.id)))
    setContents(Object.fromEntries(TOOLS.map(t=>[t.drawer,t.id])) as Record<DrawerId,ToolId>)
    setRevealTool(null)
    setPhase('ready')
  }

  const panelTop = 76
  const panelH = `calc(100vh - ${panelTop + 74}px)`

  return (
    <div style={{width:'100vw',height:'100vh',overflow:'hidden',position:'relative',
      background:'#0a0120',fontFamily:"'Nunito',sans-serif"}}>

      {showIntro && <CompanionIntro guide={guide} room="cabinet" onStart={() => setShowIntro(false)} />}

      {/* ── SCENE ── */}
      <RoomScene/>
      <CabinetProgressLights matchedCount={matched.size}/>

      {/* ── DUST MOTES ── */}
      {[...Array(16)].map((_,i) => (
        <div key={i} className="particle" style={{
          position:'absolute',
          left:`${(i*79+11)%100}%`, top:`${(i*53+20)%68}%`,
          width:2.5, height:2.5, borderRadius:'50%',
          background:i%3===0?'rgba(253,230,138,.55)':i%3===1?'rgba(196,170,255,.48)':'rgba(249,168,212,.5)',
          '--drift':`${(i%5-2)*18}px`,
          boxShadow:'0 0 5px 1px currentColor',
          animationDelay:`${i*.38}s`, pointerEvents:'none', zIndex:2,
        } as React.CSSProperties}/>
      ))}

      {/* ── TOOL CARDS PANEL (LEFT) ── */}
      <div style={{position:'absolute', left:16, top:panelTop, width:232, height:panelH,
        zIndex:10, display:'flex', flexDirection:'column', gap:0}}>
        {/* Panel header */}
        <div style={{background:'rgba(6,1,20,.92)', backdropFilter:'blur(18px)',
          borderLeft:'1px solid rgba(253,230,138,.2)', borderRight:'1px solid rgba(253,230,138,.2)', borderTop:'1px solid rgba(253,230,138,.2)', borderBottom:'1px solid rgba(196,170,255,.12)', borderRadius:'12px 12px 0 0',
          padding:'10px 16px'}}>
          <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:15.5, fontWeight:600, color:'rgba(253,230,138,.88)', letterSpacing: isAr ? 0 : '.12em', marginBottom:4}}>
            {isAr ? 'أدوات التدريب' : 'INTERNSHIP TOOLKIT'}
          </p>
          <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic', fontSize:13, color:'rgba(196,170,255,.62)'}}>
            {isAr ? 'اسحب كل أداة إلى درجها الصحيح' : 'Drag each tool to its drawer'}
          </p>
        </div>
        {/* Cards */}
        <div style={{background:'rgba(4,0,14,.85)', backdropFilter:'blur(18px)',
          borderLeft:'1px solid rgba(196,170,255,.16)', borderRight:'1px solid rgba(196,170,255,.16)', borderBottom:'1px solid rgba(196,170,255,.16)', borderTop:'none', borderRadius:'0 0 12px 12px',
          padding:'10px', display:'flex', flexDirection:'column', gap:7, flex:1, overflowY:'auto'}}>
          {displayTools.map(tool => (
            <ToolCard key={tool.id} tool={tool}
              matched={matched.has(tool.id)}
              hinted={hintTarget?.toolId === tool.id}
              onDragStart={(id) => { setDragging(id); audio.playDrag() }}/>
          ))}
        </div>
      </div>

      {/* ── DRAWER PANEL (RIGHT) ── */}
      <div style={{position:'absolute', right:16, top:panelTop, width:258, height:panelH,
        zIndex:10, display:'flex', flexDirection:'column', gap:0}}>
        {/* Panel header */}
        <div style={{background:'rgba(6,1,20,.92)', backdropFilter:'blur(18px)',
          borderLeft:'1px solid rgba(196,170,255,.2)', borderRight:'1px solid rgba(196,170,255,.2)', borderTop:'1px solid rgba(196,170,255,.2)', borderBottom:'1px solid rgba(196,170,255,.12)', borderRadius:'12px 12px 0 0',
          padding:'10px 16px'}}>
          <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif", fontSize:15.5, fontWeight:600, color:'rgba(196,170,255,.88)', letterSpacing: isAr ? 0 : '.12em', marginBottom:4}}>
            {isAr ? 'الأدراج المسحورة' : 'ENCHANTED DRAWERS'}
          </p>
          <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif", fontStyle: isAr ? 'normal' : 'italic', fontSize:13, color:'rgba(196,170,255,.58)'}}>
            {isAr ? `الأدوات الموضوعة بشكل صحيح ${matched.size}/6` : `${matched.size}/6 tools placed correctly`}
          </p>
        </div>
        {/* Drawers */}
        <div style={{background:'rgba(4,0,14,.85)', backdropFilter:'blur(18px)',
          borderLeft:'1px solid rgba(196,170,255,.16)', borderRight:'1px solid rgba(196,170,255,.16)', borderBottom:'1px solid rgba(196,170,255,.16)', borderTop:'none', borderRadius:'0 0 12px 12px',
          padding:'10px', display:'flex', flexDirection:'column', gap:7, flex:1}}>
          {displayDrawers.map(drawer => {
            const matchedToolId = contents[drawer.id]
            const matchedTool = matchedToolId ? TOOLS.find(t=>t.id===matchedToolId) ?? null : null
            return (
              <DrawerSlot key={drawer.id}
                drawer={drawer}
                matchedTool={matchedTool}
                dragOver={dragOver === drawer.id}
                wrong={wrongDrawer === drawer.id}
                hinted={hintTarget?.drawerId === drawer.id}
                onDragOver={() => setDragOver(drawer.id)}
                onDragLeave={() => setDragOver(d => d===drawer.id ? null : d)}
                onDrop={(toolId) => handleDrop(drawer.id, toolId)}/>
            )
          })}
        </div>
      </div>

      {/* ── HUD ── */}
      <RoomHUD guide={guide} totalKeys={totalKeys} butterflies={butterflies}
        matchedCount={matched.size} onBack={() => { audio.playReturnGarden(); onBack() }}
        onHint={() => { handleHint(); setShowHint(true) }} onMainMenu={onMainMenu} onReset={onReset}/>

      {/* ── QUEST BAR ── */}
      <QuestBar matchedCount={matched.size} phase={phase}/>

      {/* ── WRONG TOAST ── */}
      {wrongMsg && <WrongToast msg={wrongMsg}/>}

      {/* ── SKILL REVEAL ── */}
      {revealTool && (
        <SkillReveal tool={revealTool} matchedCount={matched.size} onClose={() => setRevealTool(null)}/>
      )}

      {/* ── CABINET INTERACTIVE SVG (animates the actual room cabinet) ── */}
      <CabinetInteractiveSVG phase={phase} onOpen={handleCabinetOpen}/>

      {/* ── UNIFIED COMPLETION STACK: Key → Card → Button ── */}
      {phase === 'complete' && (
        <div className="animate-panel-in" style={{
          position:'absolute', inset:0,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          zIndex:20, pointerEvents:'none',
          paddingBottom:40,
        }}>
          {/* Golden key */}
          <div style={{
            animation:'float 2.8s ease-in-out infinite',
            filter:'drop-shadow(0 0 22px rgba(253,230,138,.95)) drop-shadow(0 0 44px rgba(253,230,138,.5))',
            marginBottom:24, pointerEvents:'none',
          }}>
            <GoldenKey size={58}/>
          </div>

          {/* Completion card */}
          <div style={{
            textAlign:'center', background:'rgba(4,0,14,.92)', backdropFilter:'blur(16px)',
            border:'1px solid rgba(155,114,207,.45)', borderRadius:12,
            padding:'14px 48px', boxShadow:'0 0 28px rgba(155,114,207,.24)',
            marginBottom:20, minWidth:260,
          }}>
            <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
              fontSize:9, letterSpacing: isAr ? 0 : '.2em',
              color:'rgba(255,179,230,.75)', marginBottom:5}}>
              {t.cc_subtitle}
            </p>
            <h2 style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel Decorative',serif",
              fontSize:18,
              background:'linear-gradient(135deg,#fde68a,#c4aaff)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text'}}>
              {t.cc_roomComplete}
            </h2>
          </div>

          {/* Action button */}
          <div style={{pointerEvents:'auto'}}>
            {!keyCollected && (
              <button onClick={() => { setKeyCollected(true); onKeyCollected() }} className="hov-btn" style={{
                padding:'13px 52px', borderRadius:12, cursor:'pointer',
                background:'linear-gradient(135deg,rgba(253,230,138,.24),rgba(253,230,138,.11))',
                border:'2px solid rgba(253,230,138,.65)',
                fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                fontSize:13, letterSpacing: isAr ? 0 : '.14em',
                color:'#fde68a', minWidth:260,
                boxShadow:'0 0 22px rgba(253,230,138,.38), 0 0 44px rgba(253,230,138,.15), 0 4px 18px rgba(0,0,0,.35)',
                transition:'all .3s cubic-bezier(.22,1,.36,1)',
              }}>
                {isAr ? '✦ اجمع المفتاح الذهبي' : '✦ Collect Golden Key'}
              </button>
            )}
            {keyCollected && (
              <button onClick={() => { audio.playReturnGarden(); onBack() }} className="hov-btn" style={{
                padding:'13px 52px', borderRadius:12, cursor:'pointer',
                background:'linear-gradient(135deg,rgba(196,170,255,.28),rgba(139,92,246,.14))',
                border:'2px solid rgba(196,170,255,.72)',
                fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                fontSize:13, letterSpacing: isAr ? 0 : '.1em',
                color:'rgba(230,220,255,.96)', minWidth:260,
                boxShadow:'0 0 24px rgba(155,114,207,.45), 0 0 48px rgba(255,179,230,.18), 0 4px 18px rgba(0,0,0,.35)',
                transition:'all .3s cubic-bezier(.22,1,.36,1)',
              }}>
                {isAr ? 'العودة إلى الحديقة →' : '← Back to Garden'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── HINT PANEL ── */}
      {showHint && <HintPanel matched={matched} phase={phase} onClose={() => setShowHint(false)}/>}

      {/* ── ALREADY COMPLETED BANNER ── */}
      {hasKey && phase === 'complete' && (
        <div style={{position:'absolute',top:70,left:'50%',transform:'translateX(-50%)',zIndex:20,
          background:'rgba(6,1,20,.9)',border:'1px solid rgba(155,114,207,.4)',borderRadius:10,
          padding:'8px 22px',backdropFilter:'blur(14px)',
          display:'flex',alignItems:'center',gap:10}}>
          <span style={{filter:'drop-shadow(0 0 4px rgba(253,230,138,.7))'}}><GoldenKey size={13}/></span>
          <p style={{fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",fontSize:10,color:'rgba(110,231,183,.85)',letterSpacing: isAr ? 0 : '.1em'}}>
            {t.cc_roomComplete}
          </p>
        </div>
      )}

      {/* ── SKIP PUZZLE (subtle) ── */}
      {phase === 'drag' && matched.size < TOOLS.length && (
        <button onClick={handleSkip} style={{
          position:'absolute', bottom:80, left:'50%', transform:'translateX(-50%)',
          background:'transparent', border:'none', cursor:'pointer',
          fontFamily:"'Cinzel',serif", fontSize:9.5, letterSpacing:'.1em',
          color:'rgba(196,170,255,.28)', zIndex:20,
          transition:'color .2s'}}
          onMouseEnter={e => (e.currentTarget.style.color='rgba(196,170,255,.55)')}
          onMouseLeave={e => (e.currentTarget.style.color='rgba(196,170,255,.28)')}>
          {isAr ? 'تخطي اللعبة' : 'skip puzzle'}
        </button>
      )}
    </div>
  )
}
