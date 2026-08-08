import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type Lang, type Translations, TRANSLATIONS } from './lang'
import { audio } from './sound/engine'

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
  isAr: boolean
}

const LangContext = createContext<LangContextValue>({
  lang: 'en',
  setLang: () => {},
  t: TRANSLATIONS.en,
  isAr: false,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('mm-lang')
      return saved === 'ar' ? 'ar' : 'en'
    } catch {
      return 'en'
    }
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    try { localStorage.setItem('mm-lang', l) } catch { /* ignore */ }
  }

  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', lang)
  }, [lang])

  return (
    <LangContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang], isAr: lang === 'ar' }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}

// Shared circular button style factory
function circleBtn(hov: boolean, pressed: boolean, active = false) {
  return {
    width: 44,
    height: 44,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    border: `1.5px solid ${hov ? 'rgba(255,179,230,.78)' : active ? 'rgba(255,179,230,.55)' : 'rgba(196,170,255,.48)'}`,
    background: hov
      ? 'linear-gradient(135deg, rgba(110,60,175,.97), rgba(190,140,240,.94))'
      : active
      ? 'linear-gradient(135deg, rgba(80,30,140,.95), rgba(150,90,210,.9))'
      : 'linear-gradient(135deg, rgba(30,8,68,.95), rgba(60,18,120,.92))',
    boxShadow: hov
      ? '0 0 22px rgba(255,179,230,.55), 0 0 40px rgba(155,114,207,.28), 0 4px 18px rgba(0,0,0,.5)'
      : '0 0 12px rgba(155,114,207,.38), 0 4px 14px rgba(0,0,0,.45)',
    transition: 'all .38s cubic-bezier(.22,1,.36,1)',
    transform: pressed ? 'translateY(0) scale(0.96)' : hov ? 'translateY(-2px) scale(1.02)' : 'none',
    userSelect: 'none' as const,
  }
}

// Global sound button — reads/writes audio engine directly
function GlobalSoundBtn() {
  const [muted, setMuted] = useState(() => audio.muted)
  const [hov, setHov] = useState(false)
  const [pressed, setPressed] = useState(false)

  const toggle = () => {
    audio.setMuted(!muted)
    setMuted(!muted)
  }

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      title={muted ? 'Unmute' : 'Mute'}
      aria-label={muted ? 'Unmute' : 'Mute'}
      style={circleBtn(hov, pressed, muted)}
    >
      <svg width="18" height="18" fill="none"
        stroke={muted ? 'rgba(255,179,230,.9)' : 'rgba(220,200,255,.92)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        viewBox="0 0 24 24">
        {muted
          ? <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </>
          : <>
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </>}
      </svg>
    </button>
  )
}

// Global language toggle button
function GlobalLangBtn() {
  const { lang, setLang, t } = useLang()
  const [hov, setHov] = useState(false)
  const [pressed, setPressed] = useState(false)

  return (
    <button
      onClick={() => { setLang(lang === 'en' ? 'ar' : 'en') }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      title={lang === 'en' ? 'Switch to Arabic / العربية' : 'Switch to English'}
      aria-label={lang === 'en' ? 'Switch to Arabic' : 'Switch to English'}
      style={{
        ...circleBtn(hov, pressed),
        color: 'rgba(255,240,255,.96)',
        fontFamily: lang === 'ar' ? "'Nunito', sans-serif" : "'Cinzel', serif",
        fontSize: lang === 'ar' ? 15 : 11,
        fontWeight: 700,
        letterSpacing: lang === 'ar' ? 0 : '.06em',
      }}
    >
      {t.langLabel}
    </button>
  )
}

// Rendered once at App root.
// Sits fixed at the top-right, exactly filling the 64 px header height,
// so the two buttons always appear horizontally centred inside the header bar.
export function GlobalControls() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      height: 64,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingRight: 12,
      paddingLeft: 8,
      pointerEvents: 'auto',
    }}>
      <GlobalSoundBtn />
      <GlobalLangBtn />
    </div>
  )
}

// Keep old export name for backward compatibility
export function LangToggle() {
  return <GlobalLangBtn />
}

// Inline (non-fixed) controls — use inside HUD/header flex rows
export function InlineControls() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
      <GlobalSoundBtn />
      <GlobalLangBtn />
    </div>
  )
}
