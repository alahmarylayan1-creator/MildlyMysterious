import { useState } from 'react'
import type { GuideChoice } from './GardenHub'
import { useLang } from './LangContext'

// Face + upper-body portrait — same artwork as the selection screen, cropped tight.
// idPrefix avoids SVG gradient ID conflicts when multiple instances render simultaneously.
export function CompanionFace({
  guide,
  size = 100,
  idPrefix = 'cf',
}: {
  guide: GuideChoice
  size?: number
  idPrefix?: string
}) {
  const isDawn = guide !== 'man'
  // Crop viewBox covers face + hijab/ghutra + shoulders: 156 wide × 170 tall
  const h = Math.round(size * (170 / 156))

  if (isDawn) {
    const bW = `${idPrefix}_bodiceW`
    const hG = `${idPrefix}_hijabG`
    const sW = `${idPrefix}_sleeveW`
    return (
      <svg width={size} height={h} viewBox="82 42 156 170" fill="none">
        {/* Bodice */}
        <path d="M110,155 Q130,140 160,138 Q190,140 210,155 L215,200 Q190,195 160,195 Q130,195 105,200 Z"
          fill={`url(#${bW})`} />
        {/* Neckline detail */}
        <path d="M140,145 Q160,158 180,145" stroke="rgba(253,230,138,0.5)" strokeWidth="1.5" fill="none" />
        {/* Head / face */}
        <ellipse cx="160" cy="100" rx="36" ry="40" fill="#c8956a" />
        {/* Hijab */}
        <ellipse cx="160" cy="82" rx="42" ry="30" fill="#d4aaff" opacity="0.95" />
        <path d="M118,82 Q118,60 160,56 Q202,60 202,82 Q210,100 210,120 L200,130 Q180,138 160,138 Q140,138 120,130 L110,120 Q110,100 118,82 Z"
          fill={`url(#${hG})`} />
        {/* Hijab drapes */}
        <path d="M115,90 Q100,120 105,150 Q110,165 120,170 L115,145 Q108,125 112,100 Z"
          fill="rgba(180,120,255,0.6)" />
        <path d="M205,90 Q220,120 215,150 Q210,165 200,170 L205,145 Q212,125 208,100 Z"
          fill="rgba(180,120,255,0.6)" />
        {/* Hijab embroidery */}
        <path d="M118,82 Q160,72 202,82" stroke="rgba(253,230,138,0.7)" strokeWidth="1.5" fill="none" strokeDasharray="3,3" />
        {/* Eyes */}
        <ellipse cx="148" cy="102" rx="5" ry="6" fill="#2d1154" />
        <ellipse cx="172" cy="102" rx="5" ry="6" fill="#2d1154" />
        <circle cx="150" cy="100" r="1.5" fill="white" />
        <circle cx="174" cy="100" r="1.5" fill="white" />
        {/* Mouth / nose */}
        <path d="M152,115 Q160,121 168,115" stroke="#c8846a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <ellipse cx="160" cy="111" rx="2" ry="1.5" fill="#c8846a" />
        {/* Eyebrows */}
        <path d="M142,94 Q148,90 155,93" stroke="#3d1a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M165,93 Q172,90 178,94" stroke="#3d1a2a" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Cheeks */}
        <ellipse cx="140" cy="112" rx="7" ry="4" fill="rgba(249,164,216,0.35)" />
        <ellipse cx="180" cy="112" rx="7" ry="4" fill="rgba(249,164,216,0.35)" />
        {/* Necklace hint */}
        <path d="M135,148 Q160,162 185,148" stroke="rgba(253,230,138,0.55)" strokeWidth="1.2" fill="none" />
        {/* Shoulder sleeves */}
        <path d="M106,162 Q86,175 78,208" stroke={`url(#${sW})`} strokeWidth="12" strokeLinecap="round" fill="none" />
        <path d="M214,162 Q234,175 242,208" stroke={`url(#${sW})`} strokeWidth="12" strokeLinecap="round" fill="none" />
        <defs>
          <linearGradient id={bW} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6b25a0" />
            <stop offset="100%" stopColor="#8b35b8" />
          </linearGradient>
          <linearGradient id={hG} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c090f0" />
            <stop offset="100%" stopColor="#9060d0" />
          </linearGradient>
          <linearGradient id={sW} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7b35b0" />
            <stop offset="100%" stopColor="#9b45d0" />
          </linearGradient>
        </defs>
      </svg>
    )
  }

  // Dusk (man) — ghutra + agal + face + shoulders
  const gM = `${idPrefix}_ghuthraM`
  const shM = `${idPrefix}_shoulderM`
  return (
    <svg width={size} height={h} viewBox="82 40 156 160" fill="none">
      {/* Shoulders / thobe top */}
      <path d="M90,158 Q115,148 160,145 Q205,148 230,158 L232,175 Q200,168 160,165 Q120,168 88,175 Z"
        fill={`url(#${shM})`} />
      {/* Head */}
      <ellipse cx="160" cy="96" rx="34" ry="38" fill="#b07848" />
      {/* Ghutra white cloth */}
      <ellipse cx="160" cy="78" rx="40" ry="26" fill="#f0f0ff" opacity="0.97" />
      <path d="M120,80 Q120,58 160,54 Q200,58 200,80 Q205,100 202,125 L198,135 Q178,140 160,140 Q142,140 122,135 L118,125 Q115,100 120,80 Z"
        fill={`url(#${gM})`} />
      {/* Agal */}
      <ellipse cx="160" cy="70" rx="32" ry="8" fill="none" stroke="#1a0535" strokeWidth="5" opacity="0.8" />
      <ellipse cx="160" cy="70" rx="32" ry="8" fill="none" stroke="#2d0a5a" strokeWidth="3" opacity="0.5" />
      {/* Ghutra drape */}
      <path d="M120,90 Q108,115 110,145 Q112,160 120,165 L118,145 Q112,125 116,100 Z"
        fill="rgba(230,230,255,0.5)" />
      {/* Beard */}
      <path d="M136,120 Q145,135 160,138 Q175,135 184,120 Q180,130 160,136 Q140,130 136,120 Z"
        fill="#3d2010" opacity="0.85" />
      {/* Eyes */}
      <ellipse cx="148" cy="97" rx="5" ry="5.5" fill="#2d1154" />
      <ellipse cx="172" cy="97" rx="5" ry="5.5" fill="#2d1154" />
      <circle cx="150" cy="95" r="1.5" fill="white" />
      <circle cx="174" cy="95" r="1.5" fill="white" />
      {/* Mouth / nose */}
      <path d="M152,112 Q160,117 168,112" stroke="#8b5030" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="160" cy="107" rx="2" ry="1.5" fill="#9b5a38" />
      {/* Eyebrows */}
      <path d="M140,89 Q147,85 155,88" stroke="#2a1008" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M165,88 Q173,85 180,89" stroke="#2a1008" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Cheeks */}
      <ellipse cx="138" cy="108" rx="6" ry="3.5" fill="rgba(200,140,100,0.2)" />
      <ellipse cx="182" cy="108" rx="6" ry="3.5" fill="rgba(200,140,100,0.2)" />
      <defs>
        <linearGradient id={gM} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e8ff" />
          <stop offset="100%" stopColor="#c8c8ee" />
        </linearGradient>
        <linearGradient id={shM} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2525a0" />
          <stop offset="100%" stopColor="#1a1568" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ─── Dialogue texts per room ──────────────────────────────────────────────────
export type IntroRoom = 'portrait' | 'cabinet' | 'studio' | 'workshop' | 'gallery'

const DIALOGUE: Record<IntroRoom, { enDawn: string; enDusk: string; arDawn: string; arDusk: string }> = {
  portrait: {
    enDawn: "Start here by looking closely around the room. Find the three meaningful objects, and each one will reveal part of the story.",
    enDusk: "Observe the room carefully. Three hidden objects hold the first clues. Find them all, and the full meaning will appear.",
    arDawn: "ابدأ هنا بالتأمل في تفاصيل الغرفة. هناك ثلاثة عناصر مخفية، وكل عنصر يكشف جزءًا من الحكاية.",
    arDusk: "تأمل تفاصيل الغرفة جيدًا. ثلاثة عناصر مخفية تحمل أولى الإشارات. عند العثور عليها جميعًا، تتضح الصورة كاملة.",
  },
  cabinet: {
    enDawn: "Match each item to its correct place. Once everything is arranged properly, the cabinet will open and reveal what's inside.",
    enDusk: "Each item belongs somewhere specific. Place them correctly, and the cabinet will unlock its secret.",
    arDawn: "طابق كل عنصر مع مكانه الصحيح. وعندما يكتمل الترتيب، ستفتح الخزانة وتكشف ما بداخلها.",
    arDusk: "لكل عنصر مكانه المناسب. رتّبها بدقة، وعندها ستكشف الخزانة سرّها.",
  },
  studio: {
    enDawn: "Piece the image together to reveal the creative scene. When the full picture is complete, the work behind it will appear.",
    enDusk: "Gather the scattered pieces and restore the image. Once the scene is complete, its meaning will be revealed.",
    arDawn: "ركّب قطع الصورة ليظهر لك المشهد الإبداعي كاملًا. وعند اكتماله، ستنكشف الأعمال المرتبطة به.",
    arDusk: "اجمع القطع المبعثرة وأعد الصورة إلى شكلها الكامل. عندها سيظهر ما تخفيه من معنى وعمل.",
  },
  workshop: {
    enDawn: "Here, the challenge is to choose carefully. Review each group and pick the four tiles that truly belong together.",
    enDusk: "This room tests judgment. Look beyond individual words and find the four hidden connections that tie them together.",
    arDawn: "في هذه الغرفة، التحدي هو الاختيار بعناية. راجع البطاقات واختر الأربعة التي تنتمي لنفس المجموعة.",
    arDusk: "هذه الغرفة تختبر دقة الحكم. لا تنظر إلى الكلمات منفردة — ابحث عما يجمع بينها، واكتشف المجموعات الأربع المخفية.",
  },
  gallery: {
    enDawn: "Look for the matching pairs and connect what belongs together. Each successful match brings you closer to the final key.",
    enDusk: "Memory and attention will guide you here. Match the correct pairs to complete the gallery and earn the key.",
    arDawn: "ابحث عن الأزواج المتطابقة ووصل ما ينتمي معًا. كل تطابق صحيح يقرّبك من المفتاح الأخير.",
    arDusk: "الذاكرة ودقة الملاحظة هما مفتاح هذه الغرفة. طابق الأزواج الصحيحة لتكتمل اللوحة وتحصل على المفتاح.",
  },
}

const ROOM_TITLES: Record<IntroRoom, { en: string; ar: string }> = {
  portrait: { en: 'Portrait Room',    ar: 'غرفة الصورة الشخصية' },
  cabinet:  { en: 'Curious Cabinet',  ar: 'خزانة الفضول' },
  studio:   { en: 'Lavender Studio',  ar: 'استوديو اللافندر' },
  workshop: { en: 'The Insight Workshop', ar: 'ورشة الروابط' },
  gallery:  { en: 'Learning Gallery',    ar: 'معرض التعلّم' },
}

// ─── Companion intro overlay ──────────────────────────────────────────────────
export function CompanionIntro({
  guide,
  room,
  onStart,
}: {
  guide: GuideChoice
  room: IntroRoom
  onStart: () => void
}) {
  const { isAr } = useLang()
  const isDawn = guide !== 'man'
  const [btnHov, setBtnHov] = useState(false)

  const dl = DIALOGUE[room]
  const titleText  = isAr ? ROOM_TITLES[room].ar : ROOM_TITLES[room].en
  const text = isAr
    ? (isDawn ? dl.arDawn : dl.arDusk)
    : (isDawn ? dl.enDawn : dl.enDusk)
  const name = isDawn ? (isAr ? 'داون' : 'Dawn') : (isAr ? 'دَسك' : 'Dusk')
  const btnLabel = isAr ? 'ابدأ التحدي' : 'Start Challenge'

  const glowColor   = isDawn ? 'rgba(255,179,230,.5)'  : 'rgba(155,114,207,.5)'
  const borderColor = isDawn ? 'rgba(255,179,230,.32)' : 'rgba(196,170,255,.32)'
  const nameColor   = isDawn ? 'rgba(255,210,240,.9)'  : 'rgba(196,170,255,.9)'
  const btnBorder   = isDawn ? 'rgba(255,179,230,.62)' : 'rgba(196,170,255,.62)'
  const btnColor    = isDawn ? 'rgba(255,220,245,.95)' : 'rgba(196,170,255,.95)'
  const btnGlow     = isDawn ? 'rgba(255,179,230,.38)' : 'rgba(155,114,207,.38)'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 40,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(4,0,14,.78)', backdropFilter: 'blur(16px)',
    }}>
      <div style={{
        animation: 'completion-in .52s cubic-bezier(.22,1,.36,1) both',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'linear-gradient(145deg,rgba(8,2,26,.97),rgba(18,5,46,.98))',
        border: `1.5px solid ${borderColor}`,
        borderRadius: 22, overflow: 'hidden',
        maxWidth: 500, width: '90%',
        boxShadow: `0 24px 80px rgba(0,0,0,.65), 0 0 55px ${glowColor}`,
      }}>
        {/* Rainbow shimmer line */}
        <div style={{ height: 3, width: '100%', background: isDawn
          ? 'linear-gradient(90deg,transparent,rgba(255,179,230,.85),rgba(196,170,255,.65),transparent)'
          : 'linear-gradient(90deg,transparent,rgba(155,114,207,.85),rgba(196,170,255,.65),transparent)' }}
        />

        {/* Portrait section */}
        <div style={{ paddingTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 100, height: 112, borderRadius: 16,
            border: `1.5px solid ${isDawn ? 'rgba(255,179,230,.52)' : 'rgba(196,170,255,.52)'}`,
            overflow: 'hidden',
            background: isDawn ? 'linear-gradient(135deg,#7b2fb0,#c060c0)' : 'linear-gradient(135deg,#1a1568,#4535c0)',
            boxShadow: `0 0 32px ${glowColor}, 0 0 60px ${isDawn ? 'rgba(255,179,230,.12)' : 'rgba(155,114,207,.12)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CompanionFace guide={guide} size={100} idPrefix="ci_ov" />
          </div>
          <span style={{
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
            fontSize: isAr ? 15 : 11,
            color: nameColor,
            letterSpacing: isAr ? 0 : '.14em',
            textShadow: `0 0 18px ${glowColor}`,
          }}>
            {name}
          </span>
        </div>

        {/* Text content */}
        <div style={{
          padding: '14px 36px 30px',
          textAlign: isAr ? 'right' : 'center',
          direction: isAr ? 'rtl' : 'ltr',
        }}>
          <p style={{
            fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
            fontSize: isAr ? 11 : 9,
            color: 'rgba(253,230,138,.62)',
            letterSpacing: isAr ? 0 : '.22em',
            marginBottom: 10,
            textAlign: 'center',
          }}>
            {titleText}
          </p>

          <div style={{
            background: 'rgba(196,170,255,.055)',
            border: `1px solid ${isDawn ? 'rgba(255,179,230,.16)' : 'rgba(196,170,255,.16)'}`,
            borderRadius: 14, padding: '16px 20px', marginBottom: 22,
          }}>
            <p style={{
              fontFamily: isAr ? "'Nunito',sans-serif" : "'Lora',serif",
              fontStyle: isAr ? 'normal' : 'italic',
              fontSize: 14,
              color: 'rgba(221,205,255,.88)',
              lineHeight: 1.78,
              direction: isAr ? 'rtl' : 'ltr',
              textAlign: isAr ? 'right' : 'center',
              margin: 0,
            }}>
              {`"${text}"`}
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={onStart}
              onMouseEnter={() => setBtnHov(true)}
              onMouseLeave={() => setBtnHov(false)}
              style={{
                padding: '13px 48px', borderRadius: 11, cursor: 'pointer',
                fontFamily: isAr ? "'Nunito',sans-serif" : "'Cinzel',serif",
                fontSize: 13, letterSpacing: isAr ? 0 : '.13em',
                color: btnColor,
                background: btnHov
                  ? (isDawn
                    ? 'linear-gradient(135deg,rgba(255,179,230,.26),rgba(196,170,255,.16))'
                    : 'linear-gradient(135deg,rgba(155,114,207,.30),rgba(196,170,255,.16))')
                  : (isDawn
                    ? 'linear-gradient(135deg,rgba(255,179,230,.12),rgba(196,170,255,.08))'
                    : 'linear-gradient(135deg,rgba(155,114,207,.16),rgba(196,170,255,.08))'),
                border: `1.5px solid ${btnBorder}`,
                boxShadow: btnHov
                  ? `0 4px 36px ${btnGlow}, 0 0 22px ${btnGlow}`
                  : `0 4px 18px ${isDawn ? 'rgba(255,179,230,.18)' : 'rgba(155,114,207,.18)'}`,
                transform: btnHov ? 'translateY(-2px) scale(1.02)' : 'none',
                transition: 'all .35s cubic-bezier(.22,1,.36,1)',
              }}
            >
              {btnLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
