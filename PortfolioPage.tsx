import { useState, useEffect, useRef, useCallback } from 'react'
import { useLang, InlineControls } from './LangContext'
import { audio } from './sound/engine'
import logoImg from './imports/__________2026-07-11_163025.png'
import claudeCert from './imports/Claude_App_Certificate.pdf'
import aiEthicsCert from './imports/AI_Ethics_Certificate.pdf'
import dataProtCert from './imports/Data_Protection_Certificate.jpeg'
import mentalHealthCert from './imports/Mental_Health_Certificate.pdf'
import selfAwarenessCert from './imports/Self_Awareness_Certificate.pdf'
import uniReadinessRec from './imports/University_Readiness_Recognition.pdf'

// ── Helpers ───────────────────────────────────────────────────────────────────

function GlowDot({ color = '#c4aaff', size = 6 }: { color?: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, boxShadow: `0 0 ${size * 2}px ${color}88`,
      display: 'inline-block', flexShrink: 0,
    }} />
  )
}

function SectionTitle({ label, title, accent = '#c4aaff', labelColor }: { label: string; title: string; accent?: string; labelColor?: string }) {
  const { isAr } = useLang()
  const isGold = accent.includes('fde68a') || accent.includes('e8c27d')
  const resolvedLabelColor = labelColor ?? (isGold ? 'rgba(232,194,125,.68)' : 'rgba(255,179,230,.72)')
  return (
    <div style={{ marginBottom: 40, textAlign: 'center' }}>
      <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '0.3em', color: resolvedLabelColor, marginBottom: 10 }}>
        {label}
      </p>
      <h2 style={{
        fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel Decorative', serif",
        fontSize: 'clamp(20px, 2.8vw, 30px)',
        color: 'rgba(235,220,255,.95)',
        textShadow: `0 0 32px ${accent}66`,
        marginBottom: 14,
        letterSpacing: isAr ? 0 : undefined,
        fontStyle: isAr ? 'normal' : undefined,
        textTransform: isAr ? 'none' : undefined,
      }}>
        {title}
      </h2>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ width: 80, height: 1, background: isGold ? `linear-gradient(90deg, transparent, ${accent}80)` : 'linear-gradient(90deg, transparent, rgba(255,179,230,.50), rgba(200,177,228,.60))' }} />
        <GlowDot color={isGold ? accent : '#ffb3e6'} size={5} />
        <div style={{ width: 80, height: 1, background: isGold ? `linear-gradient(90deg, ${accent}80, transparent)` : 'linear-gradient(90deg, rgba(200,177,228,.60), rgba(255,179,230,.50), transparent)' }} />
      </div>
    </div>
  )
}

function Card({ children, accent = 'rgba(196,170,255,.22)', style }: {
  children: React.ReactNode; accent?: string; style?: React.CSSProperties
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov
          ? 'linear-gradient(145deg, rgba(18,6,44,.96), rgba(30,10,62,.98))'
          : 'linear-gradient(145deg, rgba(12,4,30,.92), rgba(22,8,48,.95))',
        border: `1px solid ${hov ? 'rgba(196,170,255,.55)' : accent}`,
        borderRadius: 16,
        padding: '28px 32px',
        backdropFilter: 'blur(20px)',
        boxShadow: hov
          ? '0 14px 48px rgba(0,0,0,.55), 0 0 36px rgba(139,92,246,.26), inset 0 0 28px rgba(139,92,246,.08)'
          : '0 8px 32px rgba(0,0,0,.4)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform .22s ease, box-shadow .22s ease, border-color .22s ease, background .22s ease',
        transform: hov ? 'translateY(-3px)' : 'none',
        cursor: style?.cursor ?? 'default',
        ...style,
      }}
    >
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: hov
          ? 'linear-gradient(90deg, transparent, rgba(232,194,125,.38), rgba(255,179,230,.60), rgba(200,177,228,.55), rgba(255,179,230,.50), rgba(232,194,125,.32), transparent)'
          : `linear-gradient(90deg, transparent, ${accent}, transparent)`,
        transition: 'background .22s',
      }} />
      {/* Inner glow wash on hover — sky rose primary */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
        background: hov ? 'radial-gradient(ellipse at 50% 0%, rgba(255,179,230,.18) 0%, rgba(155,114,207,.10) 40%, transparent 68%)' : 'transparent',
        transition: 'background .38s',
      }} />
      {children}
    </div>
  )
}

function SkillTag({ label }: { label: string }) {
  const [hov, setHov] = useState(false)
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '7px 15px', borderRadius: 20,
        background: hov
          ? 'linear-gradient(135deg, rgba(83,43,136,.30), rgba(255,179,230,.12), rgba(155,114,207,.18))'
          : 'rgba(83,43,136,.18)',
        border: `1px solid ${hov ? 'rgba(255,179,230,.55)' : 'rgba(155,114,207,.30)'}`,
        boxShadow: hov
          ? '0 5px 20px rgba(83,43,136,.28), 0 0 16px rgba(255,179,230,.16), 0 0 10px rgba(155,114,207,.14), inset 0 0 12px rgba(255,179,230,.08)'
          : 'none',
        fontFamily: "'Nunito', sans-serif", fontSize: 12.5,
        color: hov ? 'rgba(235,220,255,.98)' : 'rgba(200,177,228,.88)', letterSpacing: '.03em',
        display: 'inline-block',
        transition: 'all .38s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-2px) scale(1.012)' : 'none',
      }}
    >
      {label}
    </span>
  )
}

function ToolBadge({ name, emoji, large }: { name: string; emoji: string; large?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: large ? 10 : 8,
        padding: large ? '22px 18px' : '18px 16px', borderRadius: 14, cursor: 'default',
        background: hov
          ? 'linear-gradient(145deg, rgba(83,43,136,.28), rgba(255,179,230,.10), rgba(155,114,207,.16))'
          : 'linear-gradient(145deg, rgba(83,43,136,.12), rgba(155,114,207,.08))',
        border: `1px solid ${hov ? 'rgba(255,179,230,.48)' : 'rgba(155,114,207,.22)'}`,
        transition: 'all .38s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-4px) scale(1.018)' : 'none',
        boxShadow: hov
          ? '0 10px 32px rgba(83,43,136,.30), 0 0 22px rgba(255,179,230,.16), 0 0 14px rgba(155,114,207,.14), inset 0 0 18px rgba(255,179,230,.08)'
          : '0 2px 10px rgba(0,0,0,.25)',
        minWidth: large ? 110 : 90, position: 'relative', overflow: 'hidden',
      }}
    >
      {/* inner glow wash */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none',
        background: hov ? 'radial-gradient(ellipse at 50% 0%, rgba(255,179,230,.14) 0%, rgba(155,114,207,.10) 40%, transparent 65%)' : 'transparent',
        transition: 'background .38s',
      }} />
      <span style={{ fontSize: large ? 32 : 26, position: 'relative' }}>{emoji}</span>
      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: large ? 13 : 11.5, color: hov ? 'rgba(235,220,255,.95)' : 'rgba(200,177,228,.82)', textAlign: 'center', position: 'relative', transition: 'color .38s' }}>{name}</span>
    </div>
  )
}

function SmallToolTag({ label }: { label: string }) {
  const [hov, setHov] = useState(false)
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '3px 10px', borderRadius: 20, fontSize: 11,
        background: hov
          ? 'linear-gradient(135deg, rgba(83,43,136,.24), rgba(255,179,230,.10), rgba(155,114,207,.14))'
          : 'rgba(83,43,136,.14)',
        border: `1px solid ${hov ? 'rgba(255,179,230,.44)' : 'rgba(155,114,207,.28)'}`,
        boxShadow: hov ? '0 3px 14px rgba(83,43,136,.22), 0 0 10px rgba(255,179,230,.12), inset 0 0 8px rgba(255,179,230,.07)' : 'none',
        fontFamily: "'Nunito', sans-serif", color: hov ? 'rgba(255,218,240,.96)' : 'rgba(200,177,228,.84)',
        transition: 'all .38s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-1px) scale(1.01)' : 'none',
      }}
    >{label}</span>
  )
}

// ── Hover-aware stat card for video production ─────────────────────────────────

function StatCard({ count, label }: { count: string; label: string }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
        borderRadius: 10, cursor: 'default',
        background: hov ? 'linear-gradient(135deg, rgba(155,114,207,.20), rgba(255,179,230,.10))' : 'rgba(139,92,246,.09)',
        border: `1px solid ${hov ? 'rgba(255,179,230,.45)' : 'rgba(196,170,255,.16)'}`,
        boxShadow: hov ? '0 6px 24px rgba(155,114,207,.28), 0 0 16px rgba(255,179,230,.14), inset 0 0 16px rgba(255,179,230,.08)' : 'none',
        transition: 'all .38s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-2px) scale(1.012)' : 'none',
      }}
    >
      <span style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 20, color: '#fde68a', minWidth: 28, textAlign: 'center' }}>{count}</span>
      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: 'rgba(221,205,255,.78)', lineHeight: 1.4 }}>{label}</span>
    </div>
  )
}

function TechBadge({ label }: { label: string }) {
  const [hov, setHov] = useState(false)
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '4px 11px', borderRadius: 20, fontSize: 11.5, cursor: 'default',
        background: hov ? 'linear-gradient(135deg, rgba(155,114,207,.20), rgba(255,179,230,.10))' : 'rgba(139,92,246,.12)',
        border: `1px solid ${hov ? 'rgba(255,179,230,.48)' : 'rgba(196,170,255,.28)'}`,
        fontFamily: "'Nunito', sans-serif", color: hov ? 'rgba(255,220,242,.98)' : 'rgba(221,205,255,.85)',
        boxShadow: hov ? '0 4px 18px rgba(155,114,207,.28), 0 0 12px rgba(255,179,230,.14), inset 0 0 10px rgba(255,179,230,.08)' : 'none',
        display: 'inline-block',
        transition: 'all .38s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-2px) scale(1.015)' : 'none',
      }}
    >{label}</span>
  )
}

function ContribPill({ label }: { label: string }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 8, cursor: 'default',
        background: hov ? 'linear-gradient(135deg, rgba(155,114,207,.16), rgba(255,179,230,.09))' : 'rgba(139,92,246,.09)',
        border: `1px solid ${hov ? 'rgba(255,179,230,.42)' : 'rgba(196,170,255,.18)'}`,
        boxShadow: hov ? '0 5px 20px rgba(155,114,207,.24), 0 0 14px rgba(255,179,230,.12), inset 0 0 12px rgba(255,179,230,.07)' : 'none',
        transition: 'all .38s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-2px) scale(1.012)' : 'none',
      }}
    >
      <GlowDot color="#ffb3e6" size={4} />
      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: 'rgba(221,205,255,.78)' }}>{label}</span>
    </div>
  )
}

function FocusAreaRow({ icon, label }: { icon: string; label: string }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 9,
        background: hov
          ? 'linear-gradient(135deg, rgba(255,179,230,.09) 0%, rgba(155,114,207,.10) 100%)'
          : 'rgba(83,43,136,.06)',
        border: `1px solid ${hov ? 'rgba(255,179,230,.38)' : 'rgba(196,170,255,.10)'}`,
        boxShadow: hov
          ? '0 2px 18px rgba(255,179,230,.18), 0 0 10px rgba(155,114,207,.14), inset 0 0 14px rgba(255,179,230,.06)'
          : 'none',
        transform: hov ? 'translateY(-2px)' : 'none',
        transition: 'all .40s cubic-bezier(.22,1,.36,1)',
        cursor: 'default',
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: 'rgba(221,205,255,.8)' }}>{label}</span>
    </div>
  )
}

// ── Certificate / Recognition modal ───────────────────────────────────────────

type CertEntry = { title: string; src: string; isPdf: boolean; isRecognition?: boolean }

function CertificateModal({ entry, onClose }: { entry: CertEntry; onClose: () => void }) {
  const { t, isAr } = useLang()
  const [openBtnHov, setOpenBtnHov] = useState(false)
  const [closeBtnHov, setCloseBtnHov] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(2,0,12,.90)', backdropFilter: 'blur(22px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 860,
          maxHeight: 'calc(100vh - 56px)',
          borderRadius: 20, overflow: 'hidden',
          background: 'linear-gradient(145deg, rgba(8,2,22,.99), rgba(20,6,44,.99))',
          border: `1.5px solid ${entry.isRecognition ? 'rgba(232,194,125,.32)' : 'rgba(200,177,228,.30)'}`,
          boxShadow: entry.isRecognition
            ? '0 32px 100px rgba(0,0,0,.86), 0 0 50px rgba(255,179,230,.10), 0 0 30px rgba(232,194,125,.08)'
            : '0 32px 100px rgba(0,0,0,.85), 0 0 50px rgba(255,179,230,.12)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Top shimmer bar */}
        <div style={{
          height: 3, flexShrink: 0,
          background: entry.isRecognition
            ? 'linear-gradient(90deg, transparent, rgba(232,194,125,.50), rgba(255,179,230,.55), rgba(200,177,228,.50), rgba(232,194,125,.42), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,179,230,.58), rgba(200,177,228,.52), rgba(255,179,230,.45), transparent)',
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 22px', flexShrink: 0,
          borderBottom: '1px solid rgba(196,170,255,.10)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            {entry.isRecognition && <span style={{ fontSize: 16, flexShrink: 0 }}>🏅</span>}
            <p style={{
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.16em',
              color: entry.isRecognition ? 'rgba(232,194,125,.82)' : 'rgba(200,177,228,.80)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {entry.title}
            </p>
          </div>
          <button
            onMouseEnter={() => setCloseBtnHov(true)}
            onMouseLeave={() => setCloseBtnHov(false)}
            onClick={onClose}
            style={{
              flexShrink: 0, marginLeft: 12,
              background: closeBtnHov
                ? 'linear-gradient(135deg, rgba(155,114,207,.22), rgba(255,179,230,.14))'
                : 'rgba(155,114,207,.12)',
              border: `1px solid ${closeBtnHov ? 'rgba(255,179,230,.48)' : 'rgba(200,177,228,.24)'}`,
              borderRadius: 8, padding: '5px 14px', cursor: 'pointer',
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.08em',
              color: closeBtnHov ? 'rgba(255,218,240,.92)' : 'rgba(200,177,228,.72)',
              boxShadow: closeBtnHov
                ? 'inset 0 0 16px rgba(255,179,230,.14), 0 4px 18px rgba(255,179,230,.14)'
                : 'none',
              transition: 'all .40s cubic-bezier(.22,1,.36,1)',
              transform: closeBtnHov ? 'translateY(-1px) scale(1.02)' : 'none',
            }}
          >{t.pp_closeBtn}</button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {entry.isRecognition ? (
            // ── Recognition: PDF + description ──
            <>
              <embed
                src={entry.src + '#toolbar=0&navpanes=0'}
                type="application/pdf"
                style={{ width: '100%', height: 520, borderRadius: 10, border: '1px solid rgba(232,194,125,.18)', background: '#fff' }}
              />
              {/* Description below PDF */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '6px 8px 4px' }}>
                <div style={{ width: 180, height: 1, background: 'linear-gradient(90deg, transparent, rgba(232,194,125,.50), rgba(255,179,230,.40), transparent)' }} />
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 12px', borderRadius: 20, fontSize: 9,
                  fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", letterSpacing: isAr ? 0 : '.15em',
                  background: 'rgba(232,194,125,.12)', border: '1px solid rgba(232,194,125,.38)',
                  color: 'rgba(232,194,125,.88)',
                }}>{isAr ? '★ تكريم' : '★ RECOGNITION'}</span>
                <p style={{
                  fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 13.5,
                  color: 'rgba(221,205,255,.78)', textAlign: 'center',
                  lineHeight: 1.75, maxWidth: 540,
                }}>
                  {isAr
                    ? 'الحصول على وسام جاهزية في تخصص نظم المعلومات تقديرًا للأداء المتميز في اختبار جاهزية لخريجي مؤسسات التعليم الجامعي للعام الدراسي 2025–2026.'
                    : 'Awarded the Readiness Medal in Information Systems for distinguished performance in the Readiness Assessment for University-Level Education Graduates for the 2025–2026 academic year.'}
                </p>
              </div>
              <button
                onMouseEnter={() => setOpenBtnHov(true)}
                onMouseLeave={() => setOpenBtnHov(false)}
                onClick={() => window.open(entry.src, '_blank', 'noopener')}
                style={{
                  alignSelf: 'center', cursor: 'pointer',
                  padding: '10px 30px', borderRadius: 9,
                  background: openBtnHov
                    ? 'linear-gradient(135deg, rgba(232,194,125,.28), rgba(255,179,230,.16))'
                    : 'rgba(83,43,136,.18)',
                  border: `1px solid ${openBtnHov ? 'rgba(232,194,125,.58)' : 'rgba(232,194,125,.28)'}`,
                  boxShadow: openBtnHov
                    ? 'inset 0 0 20px rgba(255,179,230,.16), inset 0 0 12px rgba(232,194,125,.12), 0 6px 22px rgba(255,179,230,.18)'
                    : 'none',
                  fontFamily: "'Cinzel', serif", fontSize: 10.5, letterSpacing: '.12em',
                  color: openBtnHov ? 'rgba(255,218,240,.92)' : 'rgba(232,194,125,.82)',
                  transition: 'all .40s cubic-bezier(.22,1,.36,1)',
                  transform: openBtnHov ? 'translateY(-2px) scale(1.015)' : 'none',
                }}
              >{isAr ? '↗ فتح التكريم' : '↗ Open Recognition'}</button>
            </>
          ) : entry.isPdf ? (
            // ── PDF certificate ──
            <>
              <embed
                src={entry.src + '#toolbar=0&navpanes=0'}
                type="application/pdf"
                style={{ width: '100%', height: 520, borderRadius: 10, border: '1px solid rgba(196,170,255,.12)', background: '#fff' }}
              />
              <button
                onMouseEnter={() => setOpenBtnHov(true)}
                onMouseLeave={() => setOpenBtnHov(false)}
                onClick={() => window.open(entry.src, '_blank', 'noopener')}
                style={{
                  alignSelf: 'center', cursor: 'pointer',
                  padding: '10px 30px', borderRadius: 9,
                  background: openBtnHov
                    ? 'linear-gradient(135deg, rgba(155,114,207,.28), rgba(255,179,230,.16))'
                    : 'rgba(83,43,136,.18)',
                  border: `1px solid ${openBtnHov ? 'rgba(255,179,230,.52)' : 'rgba(200,177,228,.28)'}`,
                  boxShadow: openBtnHov
                    ? 'inset 0 0 20px rgba(255,179,230,.16), inset 0 0 12px rgba(155,114,207,.10), 0 6px 22px rgba(255,179,230,.18)'
                    : 'none',
                  fontFamily: "'Cinzel', serif", fontSize: 10.5, letterSpacing: '.12em',
                  color: openBtnHov ? 'rgba(255,218,240,.92)' : 'rgba(221,205,255,.80)',
                  transition: 'all .40s cubic-bezier(.22,1,.36,1)',
                  transform: openBtnHov ? 'translateY(-2px) scale(1.015)' : 'none',
                }}
              >{isAr ? '↗ فتح الشهادة' : '↗ Open Certificate'}</button>
            </>
          ) : (
            // ── Image certificate ──
            <img
              src={entry.src}
              alt={entry.title}
              style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(196,170,255,.12)', objectFit: 'contain' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Generic expand modal (for Academic Projects etc.) ────────────────────────

function ExpandModal({ icon, title, desc, onClose }: {
  icon: string; title: string; desc: string; onClose: () => void
}) {
  const { t, isAr } = useLang()
  const [closeBtnHov, setCloseBtnHov] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(2,0,12,.88)', backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          maxHeight: 'calc(100vh - 56px)',
          borderRadius: 20, overflow: 'hidden',
          background: 'linear-gradient(145deg, rgba(8,2,22,.99), rgba(22,6,50,.99))',
          border: '1.5px solid rgba(200,177,228,.28)',
          boxShadow: '0 32px 100px rgba(0,0,0,.82), 0 0 48px rgba(255,179,230,.10)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Top shimmer */}
        <div style={{ height: 3, flexShrink: 0, background: 'linear-gradient(90deg, transparent, rgba(255,179,230,.55), rgba(200,177,228,.48), rgba(255,179,230,.40), transparent)' }} />
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 22px', borderBottom: '1px solid rgba(196,170,255,.08)', flexShrink: 0,
        }}>
          <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(200,177,228,.60)' }}>
            {isAr ? 'التفاصيل' : 'DETAILS'}
          </span>
          <button
            onMouseEnter={() => setCloseBtnHov(true)}
            onMouseLeave={() => setCloseBtnHov(false)}
            onClick={onClose}
            style={{
              background: closeBtnHov
                ? 'linear-gradient(135deg, rgba(155,114,207,.22), rgba(255,179,230,.14))'
                : 'rgba(155,114,207,.10)',
              border: `1px solid ${closeBtnHov ? 'rgba(255,179,230,.48)' : 'rgba(200,177,228,.22)'}`,
              borderRadius: 8, padding: '5px 14px', cursor: 'pointer',
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.08em',
              color: closeBtnHov ? 'rgba(255,218,240,.92)' : 'rgba(200,177,228,.68)',
              boxShadow: closeBtnHov ? 'inset 0 0 16px rgba(255,179,230,.14), 0 4px 18px rgba(255,179,230,.14)' : 'none',
              transition: 'all .40s cubic-bezier(.22,1,.36,1)',
              transform: closeBtnHov ? 'translateY(-1px) scale(1.02)' : 'none',
            }}
          >{t.pp_closeBtn}</button>
        </div>
        {/* Content — scrollable */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px 36px 36px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', fontSize: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(83,43,136,.22)', border: '1px solid rgba(255,179,230,.22)',
            boxShadow: '0 0 24px rgba(255,179,230,.12)',
          }}>{icon}</div>
          <h3 style={{
            fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 18, lineHeight: 1.45,
            color: 'rgba(253,230,138,.92)', maxWidth: 440,
            letterSpacing: isAr ? 0 : undefined,
          }}>{title}</h3>
          <div style={{ width: 160, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,179,230,.40), rgba(200,177,228,.35), transparent)' }} />
          <p style={{
            fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: 'normal', fontSize: 15,
            color: 'rgba(221,205,255,.82)', lineHeight: 1.82, maxWidth: 440,
          }}>{desc}</p>
        </div>
      </div>
    </div>
  )
}

// ── Generic section expand modal ─────────────────────────────────────────────

function SectionModal({ title, accent = '#c4aaff', onClose, children }: {
  title: string; accent?: string; onClose: () => void; children: React.ReactNode
}) {
  const { t, isAr } = useLang()
  const [closeBtnHov, setCloseBtnHov] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const isGold = accent.includes('fde68a') || accent.includes('e8c27d')
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(2,0,12,.90)', backdropFilter: 'blur(22px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 760,
        maxHeight: 'calc(100vh - 56px)',
        borderRadius: 20, overflow: 'hidden',
        background: 'linear-gradient(145deg, rgba(8,2,22,.99), rgba(20,6,44,.99))',
        border: '1.5px solid rgba(200,177,228,.28)',
        boxShadow: '0 32px 100px rgba(0,0,0,.85), 0 0 50px rgba(255,179,230,.10)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ height: 3, flexShrink: 0, background: isGold ? 'linear-gradient(90deg, transparent, rgba(232,194,125,.50), rgba(255,179,230,.48), rgba(232,194,125,.42), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,179,230,.55), rgba(200,177,228,.48), rgba(255,179,230,.40), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', flexShrink: 0, borderBottom: '1px solid rgba(196,170,255,.08)' }}>
          <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 11, letterSpacing: isAr ? 0 : '.22em', color: isGold ? 'rgba(253,230,138,.80)' : 'rgba(200,177,228,.72)' }}>
            {title}
          </span>
          <button
            onMouseEnter={() => setCloseBtnHov(true)}
            onMouseLeave={() => setCloseBtnHov(false)}
            onClick={onClose}
            style={{
              background: closeBtnHov ? 'linear-gradient(135deg, rgba(155,114,207,.22), rgba(255,179,230,.14))' : 'rgba(155,114,207,.10)',
              border: `1px solid ${closeBtnHov ? 'rgba(255,179,230,.48)' : 'rgba(200,177,228,.22)'}`,
              borderRadius: 8, padding: '5px 14px', cursor: 'pointer',
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.08em',
              color: closeBtnHov ? 'rgba(255,218,240,.92)' : 'rgba(200,177,228,.68)',
              boxShadow: closeBtnHov ? 'inset 0 0 16px rgba(255,179,230,.14), 0 4px 18px rgba(255,179,230,.14)' : 'none',
              transition: 'all .40s cubic-bezier(.22,1,.36,1)',
              transform: closeBtnHov ? 'translateY(-1px) scale(1.02)' : 'none',
            }}
          >{t.pp_closeBtn}</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px 36px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Expandable Academic Project card ─────────────────────────────────────────

function ProjectCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  const [hov, setHov] = useState(false)
  const [open, setOpen] = useState(false)
  const closeModal = useCallback(() => setOpen(false), [])
  return (
    <>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={() => setOpen(true)}
        style={{
          borderRadius: 14, padding: '22px 22px',
          cursor: 'pointer',
          background: hov
            ? 'linear-gradient(145deg, rgba(18,6,44,.97), rgba(30,10,62,.98))'
            : 'linear-gradient(145deg, rgba(12,4,30,.92), rgba(22,8,48,.95))',
          border: `1.5px solid ${hov ? 'rgba(255,179,230,.38)' : 'rgba(200,177,228,.18)'}`,
          boxShadow: hov
            ? '0 12px 40px rgba(0,0,0,.50), 0 0 28px rgba(255,179,230,.18), 0 0 14px rgba(155,114,207,.12), inset 0 0 22px rgba(255,179,230,.08)'
            : '0 6px 24px rgba(0,0,0,.36)',
          transition: 'all .40s cubic-bezier(.22,1,.36,1)',
          transform: hov ? 'translateY(-3px) scale(1.014)' : 'none',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Top shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: hov
            ? 'linear-gradient(90deg, transparent, rgba(255,179,230,.52), rgba(200,177,228,.44), rgba(255,179,230,.38), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(200,177,228,.10), transparent)',
          transition: 'background .40s',
        }} />
        {/* Inner glow */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14, pointerEvents: 'none',
          background: hov ? 'radial-gradient(ellipse at 50% 0%, rgba(255,179,230,.16) 0%, transparent 65%)' : 'transparent',
          transition: 'background .40s',
        }} />
        {/* Expand hint */}
        {hov && (
          <div style={{
            position: 'absolute', top: 10, right: 12,
            fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '.10em',
            color: 'rgba(255,179,230,.55)',
          }}>⤢</div>
        )}
        <div style={{ fontSize: 28, marginBottom: 12, position: 'relative' }}>{icon}</div>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: 'rgba(253,230,138,.9)', marginBottom: 8, lineHeight: 1.4, position: 'relative' }}>{title}</h3>
        <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: 'rgba(196,170,255,.62)', lineHeight: 1.6, position: 'relative' }}>{desc}</p>
      </div>
      {open && <ExpandModal icon={icon} title={title} desc={desc} onClose={closeModal} />}
    </>
  )
}

// ── Uniform Certificate / Recognition card ────────────────────────────────────

function CertCard({ title, type, isRecognition, onClick }: {
  title: string; type: string; isRecognition?: boolean; onClick: () => void
}) {
  const { t, isAr } = useLang()
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        height: 210,
        borderRadius: 16,
        padding: '18px 20px 16px',
        cursor: 'pointer',
        background: hov
          ? 'linear-gradient(145deg, rgba(18,6,44,.97), rgba(30,10,62,.98))'
          : 'linear-gradient(145deg, rgba(12,4,30,.92), rgba(22,8,48,.95))',
        border: `1.5px solid ${hov
          ? isRecognition ? 'rgba(232,194,125,.52)' : 'rgba(255,179,230,.46)'
          : isRecognition ? 'rgba(232,194,125,.26)' : 'rgba(200,177,228,.22)'}`,
        boxShadow: hov
          ? isRecognition
            ? '0 14px 44px rgba(0,0,0,.52), 0 0 30px rgba(255,179,230,.16), 0 0 18px rgba(232,194,125,.12), inset 0 0 24px rgba(255,179,230,.08)'
            : '0 14px 44px rgba(0,0,0,.52), 0 0 30px rgba(255,179,230,.22), 0 0 16px rgba(155,114,207,.14), inset 0 0 24px rgba(255,179,230,.10)'
          : '0 6px 24px rgba(0,0,0,.36)',
        transition: 'all .40s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-3px) scale(1.014)' : 'none',
        display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: hov
          ? isRecognition
            ? 'linear-gradient(90deg, transparent, rgba(232,194,125,.48), rgba(255,179,230,.44), rgba(232,194,125,.40), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,179,230,.58), rgba(200,177,228,.48), rgba(255,179,230,.42), transparent)'
          : isRecognition
          ? 'linear-gradient(90deg, transparent, rgba(232,194,125,.18), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(200,177,228,.14), transparent)',
        transition: 'background .40s',
      }} />
      {/* Inner glow wash */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
        background: hov
          ? isRecognition
            ? 'radial-gradient(ellipse at 50% 0%, rgba(255,179,230,.14) 0%, rgba(232,194,125,.07) 45%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(255,179,230,.20) 0%, rgba(155,114,207,.09) 45%, transparent 70%)'
          : 'transparent',
        transition: 'background .40s',
      }} />

      {/* Badge row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: 10, position: 'relative' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '2px 8px', borderRadius: 20, fontSize: 9,
          fontFamily: "'Cinzel', serif", letterSpacing: '.10em',
          background: isRecognition ? 'rgba(232,194,125,.12)' : 'rgba(255,179,230,.10)',
          border: `1px solid ${isRecognition ? 'rgba(232,194,125,.32)' : 'rgba(255,179,230,.28)'}`,
          color: isRecognition ? 'rgba(232,194,125,.90)' : 'rgba(255,218,240,.88)',
        }}>
          {isRecognition ? '★' : '◈'}&nbsp;{isAr ? (isRecognition ? 'تكريم' : 'شهادة') : type.toUpperCase()}
        </span>
        {isRecognition && <span style={{ fontSize: 18, opacity: 0.85 }}>🏅</span>}
      </div>

      {/* Fixed-height title area — text clips cleanly */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <p style={{
          fontFamily: "'Nunito', sans-serif",
          fontSize: 13,
          color: isRecognition ? 'rgba(232,194,125,.92)' : 'rgba(221,205,255,.88)',
          lineHeight: 1.54,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {title}
        </p>
      </div>

      {/* Bottom CTA — always at the same position */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 5,
        paddingTop: 10, flexShrink: 0,
        borderTop: `1px solid ${hov
          ? isRecognition ? 'rgba(232,194,125,.18)' : 'rgba(255,179,230,.16)'
          : 'rgba(196,170,255,.08)'}`,
        transition: 'border-color .40s',
        position: 'relative',
      }}>
        <span style={{ fontSize: 10, lineHeight: 1, opacity: hov ? 0.9 : 0.5, transition: 'opacity .40s' }}>👁</span>
        <span style={{
          fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 8.5, letterSpacing: isAr ? 0 : '.12em',
          color: hov
            ? isRecognition ? 'rgba(232,194,125,.88)' : 'rgba(255,218,240,.86)'
            : 'rgba(200,177,228,.42)',
          transition: 'color .40s',
        }}>
          {isRecognition ? t.pp_viewRecognition : isAr ? 'عرض الشهادة ↗' : 'VIEW CERTIFICATE ↗'}
        </span>
      </div>
    </div>
  )
}

function PlayVideoBtn({ which, activeVideo, onPlay }: { which: 'cyber' | 'guardian'; activeVideo: 'cyber' | 'guardian' | null; onPlay: () => void }) {
  const { t, isAr } = useLang()
  const [hov, setHov] = useState(false)
  const isPlaying = activeVideo === which
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onPlay}
      style={{
        padding: '12px 0', borderRadius: 8, cursor: 'pointer', width: '100%',
        background: isPlaying
          ? 'linear-gradient(135deg, rgba(155,114,207,.30), rgba(255,179,230,.14))'
          : hov
          ? 'linear-gradient(135deg, rgba(155,114,207,.22), rgba(255,179,230,.12))'
          : 'rgba(83,43,136,.16)',
        border: `1px solid ${isPlaying ? 'rgba(255,179,230,.65)' : hov ? 'rgba(255,179,230,.52)' : 'rgba(196,170,255,.30)'}`,
        boxShadow: hov && !isPlaying
          ? 'inset 0 0 22px rgba(255,179,230,.16), inset 0 0 14px rgba(155,114,207,.12), 0 6px 24px rgba(255,179,230,.18)'
          : isPlaying
          ? '0 0 20px rgba(255,179,230,.20), inset 0 0 16px rgba(255,179,230,.10)'
          : 'none',
        fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10.5, letterSpacing: isAr ? 0 : '.12em',
        color: 'rgba(255,218,240,.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'all .40s cubic-bezier(.22,1,.36,1)',
        transform: hov && !isPlaying ? 'translateY(-2px) scale(1.012)' : 'none',
      }}
    >
      <span style={{ fontSize: 13 }}>▶</span>
      {isPlaying ? t.pp_stopVideo : t.pp_playVideo}
    </button>
  )
}

// ── Dedicated Recognition card — visually distinguished from certificates ────

function RecognitionCard({ onClick }: { onClick: () => void }) {
  const { t, isAr } = useLang()
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      style={{
        borderRadius: 18,
        padding: '26px 28px',
        cursor: 'pointer',
        background: hov
          ? 'linear-gradient(145deg, rgba(26,10,50,.97), rgba(40,16,68,.99))'
          : 'linear-gradient(145deg, rgba(14,5,30,.93), rgba(24,10,48,.96))',
        border: `1.5px solid ${hov ? 'rgba(232,194,125,.62)' : 'rgba(232,194,125,.28)'}`,
        boxShadow: hov
          ? '0 18px 56px rgba(0,0,0,.58), 0 0 40px rgba(255,179,230,.20), 0 0 28px rgba(232,194,125,.18), 0 0 16px rgba(155,114,207,.14), inset 0 0 30px rgba(232,194,125,.08)'
          : '0 8px 32px rgba(0,0,0,.42), 0 0 16px rgba(232,194,125,.06)',
        transition: 'all .42s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-4px) scale(1.012)' : 'none',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top shimmer — gold + rose */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: hov
          ? 'linear-gradient(90deg, transparent, rgba(232,194,125,.65), rgba(255,179,230,.58), rgba(200,177,228,.50), rgba(255,179,230,.50), rgba(232,194,125,.55), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(232,194,125,.32), rgba(255,179,230,.22), rgba(232,194,125,.28), transparent)',
        transition: 'background .42s',
      }} />
      {/* Inner glow wash — gold primary, rose secondary */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
        background: hov
          ? 'radial-gradient(ellipse at 50% 0%, rgba(255,179,230,.18) 0%, rgba(232,194,125,.10) 35%, rgba(155,114,207,.07) 60%, transparent 80%)'
          : 'radial-gradient(ellipse at 50% 0%, rgba(232,194,125,.05) 0%, transparent 60%)',
        transition: 'background .42s',
      }} />
      {/* Subtle gold particle dots */}
      {[
        { top: '12%', left: '8%', size: 2.5, opacity: hov ? 0.65 : 0.22 },
        { top: '22%', right: '6%', size: 2, opacity: hov ? 0.55 : 0.18 },
        { bottom: '18%', left: '12%', size: 1.8, opacity: hov ? 0.50 : 0.16 },
        { bottom: '28%', right: '9%', size: 2.2, opacity: hov ? 0.60 : 0.20 },
        { top: '50%', left: '4%', size: 1.5, opacity: hov ? 0.45 : 0.14 },
        { top: '60%', right: '5%', size: 1.8, opacity: hov ? 0.52 : 0.17 },
      ].map((p, i) => (
        <div key={i} style={{
          position: 'absolute', ...p, width: p.size, height: p.size,
          borderRadius: '50%',
          background: 'rgba(232,194,125,1)',
          boxShadow: hov ? `0 0 ${p.size * 3}px rgba(232,194,125,.70)` : 'none',
          transition: 'opacity .42s, box-shadow .42s',
          pointerEvents: 'none',
        }} />
      ))}

      {/* Content */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 18 }}>
        {/* Medal icon */}
        <div style={{
          flexShrink: 0, width: 56, height: 56, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: hov
            ? 'radial-gradient(circle, rgba(232,194,125,.22), rgba(83,43,136,.28))'
            : 'radial-gradient(circle, rgba(232,194,125,.12), rgba(83,43,136,.18))',
          border: `1.5px solid ${hov ? 'rgba(232,194,125,.55)' : 'rgba(232,194,125,.30)'}`,
          boxShadow: hov ? '0 0 20px rgba(232,194,125,.22), inset 0 0 14px rgba(255,179,230,.10)' : '0 0 8px rgba(232,194,125,.10)',
          transition: 'all .42s cubic-bezier(.22,1,.36,1)',
          fontSize: 26,
        }}>
          🏅
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 10px', borderRadius: 20, fontSize: 9,
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", letterSpacing: isAr ? 0 : '.12em',
              background: 'rgba(232,194,125,.12)', border: '1px solid rgba(232,194,125,.38)',
              color: 'rgba(232,194,125,.92)',
            }}>{isAr ? '★ تكريم' : '★ RECOGNITION'}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 10px', borderRadius: 20, fontSize: 9,
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", letterSpacing: isAr ? 0 : '.12em',
              background: 'rgba(255,179,230,.08)', border: '1px solid rgba(255,179,230,.22)',
              color: 'rgba(255,218,240,.78)',
            }}>{isAr ? '◈ وسام جاهزية' : '◈ READINESS MEDAL'}</span>
          </div>

          {/* Title */}
          <p style={{
            fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 13.5, lineHeight: 1.52,
            color: hov ? 'rgba(253,230,138,.98)' : 'rgba(232,194,125,.90)',
            transition: 'color .42s', marginBottom: 10,
          }}>
            {isAr ? 'وسام جاهزية في تخصص نظم المعلومات' : 'Readiness Medal in Information Systems'}
          </p>

          {/* Description line */}
          <p style={{
            fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 12,
            color: 'rgba(200,177,228,.58)', lineHeight: 1.65, marginBottom: 14,
          }}>
            {isAr ? 'الحصول على وسام جاهزية في تخصص نظم المعلومات تقديرًا للأداء المتميز في اختبار جاهزية لخريجي مؤسسات التعليم الجامعي للعام الدراسي 2025–2026.' : 'Awarded the Readiness Medal in Information Systems for distinguished performance in the Readiness Assessment for University-Level Education Graduates for the 2025–2026 academic year.'}
          </p>

          {/* CTA row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            paddingTop: 12, borderTop: `1px solid ${hov ? 'rgba(232,194,125,.22)' : 'rgba(232,194,125,.10)'}`,
            transition: 'border-color .42s',
          }}>
            <span style={{ fontSize: 10, opacity: hov ? 0.9 : 0.5, transition: 'opacity .42s' }}>👁</span>
            <span style={{
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9, letterSpacing: isAr ? 0 : '.14em',
              color: hov ? 'rgba(232,194,125,.92)' : 'rgba(232,194,125,.48)',
              transition: 'color .42s',
            }}>{t.pp_viewRecognition}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const NAV_IDS = ['About', 'Experience', 'Work', 'Skills', 'Recognition', 'Contact']

// ── Contact cards ─────────────────────────────────────────────────────────────


// SVG icons — consistent 28×28, three-stop lavender → sky-rose gradient
// All three share the same Deep Lavender → Soft Lavender → Sky Rose palette.

function IconEnvelope() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="icg-email" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#532b88" />
          <stop offset="50%" stopColor="#9b72cf" />
          <stop offset="100%" stopColor="#ffb3e6" />
        </linearGradient>
      </defs>
      {/* Envelope body with a very subtle fill so the shape reads clearly */}
      <rect x="3" y="7" width="22" height="15" rx="2.5"
        stroke="url(#icg-email)" strokeWidth="1.8"
        fill="rgba(155,114,207,.08)" />
      {/* Flap V — the defining envelope feature */}
      <path d="M3 9.5l11 7 11-7"
        stroke="url(#icg-email)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="icg-phone" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#532b88" />
          <stop offset="50%" stopColor="#9b72cf" />
          <stop offset="100%" stopColor="#ffb3e6" />
        </linearGradient>
      </defs>
      <path d="M8.5 4.5h4l1.5 4-2.5 1.5c1.2 2.6 3 4.4 5.5 5.6l1.5-2.6 4 1.5v4C22.5 21.5 14 22 8.5 15 3 8.5 4.5 4.5 8.5 4.5Z"
        stroke="url(#icg-phone)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  )
}

function IconLinkedIn() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="icg-li" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#532b88" />
          <stop offset="50%" stopColor="#9b72cf" />
          <stop offset="100%" stopColor="#ffb3e6" />
        </linearGradient>
      </defs>
      {/* Rounded rectangle box — recognizable LinkedIn shape */}
      <rect x="4" y="4" width="20" height="20" rx="4"
        stroke="url(#icg-li)" strokeWidth="1.8" fill="none" />
      {/* Dot above the vertical line */}
      <circle cx="9.5" cy="10" r="1.4" fill="url(#icg-li)" />
      {/* Left vertical line */}
      <line x1="9.5" y1="13" x2="9.5" y2="20" stroke="url(#icg-li)" strokeWidth="1.8" strokeLinecap="round" />
      {/* Right vertical + curve */}
      <line x1="13" y1="13" x2="13" y2="20" stroke="url(#icg-li)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 16.5c0-2 1.2-3.5 3-3.5s3 1.5 3 3.5v3.5"
        stroke="url(#icg-li)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function EmailText() {
  return (
    <span
      style={{
        fontFamily: "'Nunito', sans-serif", fontSize: 13,
        color: 'rgba(221,205,255,.88)',
        lineHeight: 1.5, wordBreak: 'break-word',
        cursor: 'default',
      }}
    >
      alahmarylayan1@gmail.com
    </span>
  )
}

function ContactCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  const { isAr } = useLang()
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 176,
        padding: '0 24px',
        borderRadius: 18,
        background: hov
          ? 'linear-gradient(145deg, rgba(25,10,58,.97), rgba(40,14,76,.98))'
          : 'linear-gradient(145deg, rgba(12,4,30,.94), rgba(22,8,50,.96))',
        border: `1.5px solid ${hov ? 'rgba(255,179,230,.48)' : 'rgba(200,177,228,.20)'}`,
        boxShadow: hov
          ? '0 16px 48px rgba(0,0,0,.54), 0 0 36px rgba(255,179,230,.20), 0 0 22px rgba(155,114,207,.16), inset 0 0 26px rgba(255,179,230,.09)'
          : '0 8px 28px rgba(0,0,0,.40)',
        textAlign: 'center', cursor: 'default',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0,
        position: 'relative', overflow: 'hidden',
        transition: 'all .42s cubic-bezier(.22,1,.36,1)',
        transform: hov ? 'translateY(-4px) scale(1.016)' : 'none',
      }}
    >
      {/* Inner glow wash */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
        background: hov ? 'radial-gradient(ellipse at 50% 0%, rgba(255,179,230,.22) 0%, rgba(155,114,207,.10) 48%, transparent 72%)' : 'transparent',
        transition: 'background .42s',
      }} />
      {/* Top shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: hov
          ? 'linear-gradient(90deg, transparent, rgba(255,179,230,.55), rgba(200,177,228,.48), rgba(255,179,230,.42), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(200,177,228,.18), transparent)',
        transition: 'background .42s',
      }} />

      {/* Icon container */}
      <div style={{
        width: 52, height: 52, borderRadius: '50%', marginBottom: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hov ? 'rgba(83,43,136,.32)' : 'rgba(83,43,136,.18)',
        border: `1px solid ${hov ? 'rgba(255,179,230,.32)' : 'rgba(200,177,228,.20)'}`,
        boxShadow: hov ? '0 0 18px rgba(255,179,230,.18), inset 0 0 12px rgba(155,114,207,.10)' : 'none',
        transition: 'all .42s cubic-bezier(.22,1,.36,1)',
        position: 'relative',
      }}>
        {icon}
      </div>

      <p style={{
        fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.20em',
        color: 'rgba(232,194,125,.68)', marginBottom: 10, lineHeight: 1,
      }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function ContactCards() {
  const { t, isAr } = useLang()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
      <ContactCard icon={<IconEnvelope />} label={isAr ? 'البريد الإلكتروني' : 'EMAIL'}>
        <EmailText />
      </ContactCard>
      <ContactCard icon={<IconPhone />} label={isAr ? 'رقم الجوال' : 'PHONE'}>
        <span style={{
          fontFamily: "'Nunito', sans-serif", fontSize: 13,
          color: 'rgba(221,205,255,.88)', lineHeight: 1.5,
          cursor: 'default',
        }}>
          +966 53 926 8880
        </span>
      </ContactCard>
      <ContactCard icon={<IconLinkedIn />} label={isAr ? 'لينكد إن' : 'LinkedIn'}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <a
            href="https://www.linkedin.com/in/layan-alahmari-23a897414/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View Layan Alahmari's LinkedIn profile"
            onClick={e => e.stopPropagation()}
            style={{
              fontFamily: "'Nunito', sans-serif", fontSize: 13,
              color: 'rgba(221,205,255,.88)', lineHeight: 1.5,
              textDecoration: 'none', cursor: 'pointer',
            }}
          >
            {t.pp_viewLinkedIn}
          </a>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11.5, color: 'rgba(196,170,255,.48)' }}>Layan M. Alahmari</span>
        </div>
      </ContactCard>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PortfolioPage({
  onMainMenu,
  onEnterGame,
  hasGuide,
  initialSection,
}: {
  onMainMenu: () => void
  onEnterGame: () => void
  hasGuide: boolean
  initialSection?: string
}) {
  const { t, isAr } = useLang()
  const [activeSection, setActiveSection] = useState(initialSection ?? 'About')
  const [activeVideo, setActiveVideo] = useState<'cyber' | 'guardian' | null>(null)
  const [logoHov, setLogoHov] = useState(false)
  const [cyberBtnHov, setCyberBtnHov] = useState(false)
  const [guardianBtnHov, setGuardianBtnHov] = useState(false)
  const [cyberCardHov, setCyberCardHov] = useState(false)
  const [guardianCardHov, setGuardianCardHov] = useState(false)
  const [openCert, setOpenCert] = useState<CertEntry | null>(null)
  const closeCert = useCallback(() => setOpenCert(null), [])
  const [showBackTop, setShowBackTop] = useState(false)
  const [backTopHov, setBackTopHov] = useState(false)
  const [backTopPressed, setBackTopPressed] = useState(false)
  const [skillsOpen, setSkillsOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [techOpen, setTechOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [eduOpen, setEduOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const closeSkills = useCallback(() => setSkillsOpen(false), [])
  const closeTools = useCallback(() => setToolsOpen(false), [])
  const closeTech = useCallback(() => setTechOpen(false), [])
  const closeAbout = useCallback(() => setAboutOpen(false), [])
  const closeEdu = useCallback(() => setEduOpen(false), [])
  const closeLang = useCallback(() => setLangOpen(false), [])
  const [internOpen, setInternOpen] = useState(false)
  const [vidProdOpen, setVidProdOpen] = useState(false)
  const [cyberModalOpen, setCyberModalOpen] = useState(false)
  const [guardianModalOpen, setGuardianModalOpen] = useState(false)
  const closeIntern = useCallback(() => setInternOpen(false), [])
  const closeVidProd = useCallback(() => setVidProdOpen(false), [])
  const closeCyberModal = useCallback(() => setCyberModalOpen(false), [])
  const closeGuardianModal = useCallback(() => setGuardianModalOpen(false), [])
  const [embedSrc, setEmbedSrc] = useState<string | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  const rowLabelAr: Record<string, string> = {
    'OBJECTIVE': 'الهدف', 'ROLE': 'الدور', 'PROCESS': 'العملية', 'RESULT': 'النتيجة',
    'SCOPE': 'النطاق', 'TOOLS': 'الأدوات', 'OUTPUT': 'الناتج',
  }
  const rowLabel = (label: string) => isAr ? (rowLabelAr[label] ?? label) : label

  const navLabelMap: Record<string, string> = {
    'About': t.pp_nav[0],
    'Experience': t.pp_nav[3],
    'Work': t.pp_nav[5],
    'Skills': t.pp_nav[8],
    'Recognition': t.pp_nav[10],
    'Contact': t.pp_nav[11],
  }

  const scrollTo = (id: string) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
  }

  useEffect(() => {
    if (!initialSection) return
    const t = setTimeout(() => scrollTo(initialSection), 120)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onScroll = () => {
      setShowBackTop(window.scrollY > 320)
      for (let i = NAV_IDS.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[NAV_IDS[i]]
        if (el && el.getBoundingClientRect().top < 120) {
          setActiveSection(NAV_IDS[i])
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const YT: Record<'cyber' | 'guardian', string> = {
    cyber:    'https://www.youtube.com/embed/gZVfhWyDXL8',
    guardian: 'https://www.youtube.com/embed/L3bjSK_mgkk',
  }

  // Duck background music while a video is playing; restore when stopped
  useEffect(() => {
    if (activeVideo) {
      audio.duckMusic()
    } else {
      audio.restoreMusic()
    }
  }, [activeVideo])

  function playVideo(which: 'cyber' | 'guardian') {
    setActiveVideo(which)
    setEmbedSrc(`${YT[which]}?autoplay=1&rel=0&modestbranding=1`)
  }

  function closeVideo() {
    setActiveVideo(null)
    setEmbedSrc(null)
  }

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(160deg, #0a0020 0%, #0d0230 30%, #130438 55%, #0b0128 80%, #070018 100%)',
      fontFamily: "'Nunito', sans-serif", position: 'relative',
    }}>

      {/* ── Fixed atmospheric background layer ── */}
      <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>

        {/* ── Primary ambient orbs ── */}
        <div style={{ position: 'absolute', top: '-5%', left: '10%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(83,43,136,.26) 0%, rgba(47,24,75,.12) 55%, transparent 75%)', filter: 'blur(72px)' }} />
        <div style={{ position: 'absolute', top: '5%', right: '6%', width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.18) 0%, rgba(200,120,185,.08) 55%, transparent 75%)', filter: 'blur(68px)' }} />
        <div style={{ position: 'absolute', top: '12%', left: '38%', width: 340, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,114,207,.16) 0%, transparent 70%)', filter: 'blur(58px)' }} />
        <div style={{ position: 'absolute', top: '38%', left: '-4%', width: 380, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,26,58,.60) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', top: '32%', right: '8%', width: 420, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.16) 0%, rgba(180,90,160,.07) 55%, transparent 75%)', filter: 'blur(62px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '35%', width: 300, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,114,207,.12) 0%, transparent 70%)', filter: 'blur(48px)' }} />
        <div style={{ position: 'absolute', bottom: '18%', left: '6%', width: 360, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,114,207,.18) 0%, rgba(83,43,136,.10) 55%, transparent 75%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '30%', width: 340, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.12) 0%, transparent 70%)', filter: 'blur(52px)' }} />
        <div style={{ position: 'absolute', bottom: '2%', right: '15%', width: 440, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(83,43,136,.20) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', top: '60%', left: '52%', width: 220, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,194,125,.09) 0%, transparent 70%)', filter: 'blur(42px)' }} />
        {/* ── Extra dreamy depth orbs ── */}
        <div style={{ position: 'absolute', top: '22%', left: '60%', width: 260, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,168,255,.12) 0%, transparent 70%)', filter: 'blur(55px)' }} />
        <div style={{ position: 'absolute', top: '72%', right: '-2%', width: 320, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '78%', left: '20%', width: 280, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,114,207,.10) 0%, transparent 70%)', filter: 'blur(48px)' }} />
        <div style={{ position: 'absolute', top: '45%', left: '70%', width: 200, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,194,125,.07) 0%, transparent 70%)', filter: 'blur(38px)' }} />
        <div style={{ position: 'absolute', top: '8%', left: '22%', width: 240, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.08) 0%, transparent 70%)', filter: 'blur(44px)' }} />
        {/* ── Mist bands ── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'linear-gradient(180deg, rgba(255,179,230,.06) 0%, transparent 100%)', filter: 'blur(3px)' }} />
        <div style={{ position: 'absolute', top: '40%', left: 0, right: 0, height: '30%', background: 'linear-gradient(180deg, transparent, rgba(200,177,228,.05) 50%, transparent)', filter: 'blur(2px)' }} />
        <div style={{ position: 'absolute', top: '68%', left: 0, right: 0, height: '22%', background: 'linear-gradient(180deg, transparent, rgba(155,114,207,.04) 50%, transparent)', filter: 'blur(3px)' }} />
        {/* ── Diagonal mist streaks ── */}
        <div style={{ position: 'absolute', top: '15%', left: '-10%', width: '70%', height: 80, borderRadius: '50%', background: 'linear-gradient(90deg, transparent, rgba(200,177,228,.04), transparent)', filter: 'blur(20px)', transform: 'rotate(-6deg)' }} />
        <div style={{ position: 'absolute', top: '55%', right: '-5%', width: '60%', height: 60, borderRadius: '50%', background: 'linear-gradient(90deg, transparent, rgba(255,179,230,.04), transparent)', filter: 'blur(18px)', transform: 'rotate(4deg)' }} />

        {/* ── Moon: semi-realistic Lavender Moon ── */}
        {/* Outer atmospheric corona — wide, soft */}
        <div style={{
          position: 'absolute', top: '1%', left: '62%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,168,255,.07) 0%, rgba(155,114,207,.04) 40%, transparent 68%)',
          filter: 'blur(70px)',
          transform: 'translate(-50%, 0)',
          pointerEvents: 'none',
        }} />
        {/* Inner halo — distinct lavender ring around moon */}
        <div style={{
          position: 'absolute', top: '3%', left: '62%',
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(210,185,255,.18) 0%, rgba(180,145,255,.09) 40%, transparent 70%)',
          filter: 'blur(28px)',
          transform: 'translate(-50%, 0)',
          pointerEvents: 'none',
        }} />
        {/* Moon body — large sphere with realistic side-lighting */}
        <div style={{
          position: 'absolute', top: '4.2%', left: '62%',
          width: 220, height: 220, borderRadius: '50%',
          background: `
            radial-gradient(circle at 36% 30%,
              rgba(248,238,255,.96) 0%,
              rgba(225,205,255,.90) 18%,
              rgba(200,175,255,.82) 36%,
              rgba(170,135,240,.65) 56%,
              rgba(130,95,210,.38) 76%,
              rgba(80,50,160,.14) 92%,
              transparent 100%)
          `,
          boxShadow: '0 0 50px rgba(196,168,255,.55), 0 0 100px rgba(155,114,207,.22), 0 0 20px rgba(210,185,255,.30), inset 0 0 30px rgba(255,255,255,.10)',
          transform: 'translate(-50%, 0)',
          pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          {/* Dark patches simulating mare (lunar seas) */}
          <div style={{ position: 'absolute', top: '28%', left: '38%', width: '34%', height: '28%', borderRadius: '50%', background: 'rgba(80,50,150,.20)', filter: 'blur(8px)' }} />
          <div style={{ position: 'absolute', top: '52%', left: '22%', width: '26%', height: '20%', borderRadius: '50%', background: 'rgba(75,45,145,.18)', filter: 'blur(7px)' }} />
          <div style={{ position: 'absolute', top: '16%', left: '55%', width: '22%', height: '18%', borderRadius: '50%', background: 'rgba(85,55,155,.16)', filter: 'blur(6px)' }} />
          <div style={{ position: 'absolute', top: '65%', left: '48%', width: '20%', height: '16%', borderRadius: '50%', background: 'rgba(78,48,148,.14)', filter: 'blur(6px)' }} />
          {/* Dusty-pink subtle tonal variation */}
          <div style={{ position: 'absolute', top: '60%', left: '10%', width: '30%', height: '24%', borderRadius: '50%', background: 'rgba(220,170,220,.08)', filter: 'blur(9px)' }} />
          {/* Bright highlight — primary light source upper-left */}
          <div style={{ position: 'absolute', top: '8%', left: '14%', width: '32%', height: '28%', borderRadius: '50%', background: 'rgba(255,248,255,.28)', filter: 'blur(10px)' }} />
          {/* Subtle limb darkening at edge */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 36% 30%, transparent 55%, rgba(60,30,120,.22) 100%)' }} />
        </div>
        {/* Lunar surface texture SVG — natural crater impressions */}
        <svg style={{
          position: 'absolute', top: '4.2%', left: '62%',
          transform: 'translate(-50%, 0) translate(-110px, 0)',
          width: 220, height: 220, opacity: 1, pointerEvents: 'none',
          overflow: 'hidden',
        }} viewBox="0 0 220 220">
          <defs>
            <clipPath id="moon-clip"><circle cx="110" cy="110" r="110"/></clipPath>
          </defs>
          <g clipPath="url(#moon-clip)">
            {/* Large crater — upper left area, naturalistic ellipse */}
            <ellipse cx="72" cy="75" rx="17" ry="14" fill="none" stroke="rgba(100,65,185,.38)" strokeWidth="1.8"/>
            <ellipse cx="72" cy="75" rx="11" ry="9" fill="rgba(80,48,160,.16)"/>
            <ellipse cx="68" cy="71" rx="4" ry="3.5" fill="rgba(60,36,140,.10)"/>
            {/* Medium crater — right quadrant */}
            <ellipse cx="148" cy="88" rx="12" ry="11" fill="none" stroke="rgba(95,58,178,.30)" strokeWidth="1.4"/>
            <ellipse cx="148" cy="88" rx="7" ry="6.5" fill="rgba(78,46,156,.12)"/>
            {/* Smaller crater — lower area */}
            <ellipse cx="88" cy="148" rx="10" ry="9" fill="none" stroke="rgba(105,68,188,.28)" strokeWidth="1.2"/>
            <ellipse cx="88" cy="148" rx="5.5" ry="5" fill="rgba(80,50,160,.10)"/>
            {/* Small craters — scattered naturally */}
            <ellipse cx="134" cy="140" rx="7" ry="6.5" fill="none" stroke="rgba(95,60,175,.25)" strokeWidth="1"/>
            <ellipse cx="134" cy="140" rx="4" ry="3.5" fill="rgba(78,46,155,.09)"/>
            <ellipse cx="110" cy="60" rx="6" ry="5.5" fill="none" stroke="rgba(100,64,182,.22)" strokeWidth=".9"/>
            <ellipse cx="55" cy="120" rx="8" ry="7.5" fill="none" stroke="rgba(90,56,172,.22)" strokeWidth="1"/>
            <ellipse cx="55" cy="120" rx="4" ry="3.5" fill="rgba(75,44,150,.09)"/>
            {/* Tiny craters for surface complexity */}
            <circle cx="96" cy="92" r="3.5" fill="rgba(80,50,158,.12)" stroke="rgba(95,60,175,.20)" strokeWidth=".7"/>
            <circle cx="160" cy="120" r="4" fill="rgba(78,48,155,.10)" stroke="rgba(92,58,172,.18)" strokeWidth=".7"/>
            <circle cx="80" cy="170" r="3" fill="rgba(76,46,152,.09)"/>
            <circle cx="140" cy="170" r="2.5" fill="rgba(78,48,154,.08)"/>
            <circle cx="170" cy="65" r="3" fill="rgba(82,52,160,.09)"/>
            <circle cx="40" cy="88" r="2.5" fill="rgba(78,48,155,.08)"/>
            {/* Surface texture lines — subtle ridge suggestion */}
            <path d="M60 100 Q90 95 120 105 Q145 112 160 100" stroke="rgba(90,56,170,.10)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            <path d="M75 130 Q100 125 125 132 Q145 138 155 130" stroke="rgba(88,54,168,.09)" strokeWidth="1" fill="none" strokeLinecap="round"/>
          </g>
        </svg>
        {/* Moon edge ring — crisp sphere outline */}
        <div style={{
          position: 'absolute', top: '4.2%', left: '62%',
          width: 220, height: 220, borderRadius: '50%',
          border: '1px solid rgba(215,192,255,.32)',
          boxShadow: 'inset 0 0 0 1px rgba(180,150,255,.10)',
          transform: 'translate(-50%, 0)',
          pointerEvents: 'none',
        }} />

        {/* ── Left tree branches ── */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: 240, height: '80%', opacity: .11, pointerEvents: 'none' }} viewBox="0 0 240 700" fill="none" preserveAspectRatio="none">
          <path d="M-10 700 L20 500 L8 460 L30 380 L18 340 L45 250 L32 200 L60 120 L50 80 L70 20" stroke="rgba(55,30,90,1)" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M20 500 Q-20 440 -40 400" stroke="rgba(55,30,90,1)" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M30 380 Q70 320 100 300 Q130 285 110 260" stroke="rgba(55,30,90,1)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M45 250 Q10 210 -10 180" stroke="rgba(55,30,90,1)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M45 250 Q80 220 105 195 Q125 178 118 155" stroke="rgba(55,30,90,1)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M60 120 Q20 100 -5 75" stroke="rgba(55,30,90,1)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M60 120 Q95 90 115 65 Q128 48 122 30" stroke="rgba(55,30,90,1)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M100 300 Q140 260 160 230 Q175 210 168 188" stroke="rgba(55,30,90,1)" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>

        {/* ── Right tree branches ── */}
        <svg style={{ position: 'absolute', top: 0, right: 0, width: 220, height: '75%', opacity: .10, pointerEvents: 'none' }} viewBox="0 0 220 660" fill="none" preserveAspectRatio="none">
          <path d="M230 660 L200 470 L215 420 L188 335 L205 280 L175 185 L192 140 L162 55 L175 15" stroke="rgba(55,30,90,1)" strokeWidth="6.5" strokeLinecap="round" fill="none" />
          <path d="M200 470 Q240 410 260 370" stroke="rgba(55,30,90,1)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <path d="M188 335 Q150 285 120 265 Q100 252 112 228" stroke="rgba(55,30,90,1)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M175 185 Q210 155 235 125" stroke="rgba(55,30,90,1)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M175 185 Q140 155 118 130 Q105 112 110 92" stroke="rgba(55,30,90,1)" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M162 55 Q195 38 215 18" stroke="rgba(55,30,90,1)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M162 55 Q130 40 108 22 Q95 10 98 -5" stroke="rgba(55,30,90,1)" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>

        {/* ── Lavender flower botanical — bottom-left ── */}
        <svg style={{ position: 'absolute', bottom: 0, left: 0, width: 260, height: 340, opacity: .22, pointerEvents: 'none' }} viewBox="0 0 260 340" fill="none">
          {/* Muted natural stems */}
          <path d="M30 340 Q42 265 58 210 Q70 162 65 115" stroke="rgba(80,110,70,.85)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M70 340 Q82 270 92 225 Q102 183 97 138" stroke="rgba(80,110,70,.80)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M110 340 Q118 278 128 235 Q137 196 133 155" stroke="rgba(80,110,70,.75)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M148 340 Q155 290 162 252 Q168 218 165 185" stroke="rgba(80,110,70,.65)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Leaves */}
          <path d="M65 210 Q42 196 35 174 Q52 176 65 196Z" fill="rgba(80,110,70,.72)" />
          <path d="M65 210 Q86 196 90 174 Q76 178 65 198Z" fill="rgba(80,110,70,.62)" />
          <path d="M92 225 Q72 212 65 192 Q82 196 92 212Z" fill="rgba(80,110,70,.58)" />
          <path d="M128 235 Q110 224 104 206 Q118 209 128 222Z" fill="rgba(80,110,70,.52)" />
          {/* Deep violet blossoms — first stem (tall) */}
          {[0,9,18,27,36,46,56,66].map((dy, i) => (
            <ellipse key={`lbl${i}`} cx={62 + (i%2===0?-4:4)} cy={115-dy} rx="5.5" ry="9.5"
              fill={i%3===0 ? 'rgba(88,40,160,.90)' : i%3===1 ? 'rgba(155,114,207,.88)' : 'rgba(210,185,255,.78)'}
              transform={`rotate(${i%2===0?-12:12} ${62+(i%2===0?-4:4)} ${115-dy})`} />
          ))}
          {/* Soft lavender — second stem */}
          {[0,9,18,27,36,46,56].map((dy, i) => (
            <ellipse key={`lb2${i}`} cx={97+(i%2===0?-3.5:3.5)} cy={138-dy} rx="5" ry="8.5"
              fill={i%2===0 ? 'rgba(196,170,255,.85)' : 'rgba(230,210,255,.75)'}
              transform={`rotate(${i%2===0?-10:10} ${97+(i%2===0?-3.5:3.5)} ${138-dy})`} />
          ))}
          {/* Pastel lilac — third stem */}
          {[0,9,18,27,36,45].map((dy, i) => (
            <ellipse key={`lb3${i}`} cx={133+(i%2===0?-3:3)} cy={155-dy} rx="4.5" ry="7.5"
              fill={i%2===0 ? 'rgba(220,195,255,.82)' : 'rgba(245,220,255,.72)'}
              transform={`rotate(${i%2===0?-9:9} ${133+(i%2===0?-3:3)} ${155-dy})`} />
          ))}
          {/* Sky Rose accent — fourth shorter stem */}
          {[0,9,18,27,36].map((dy, i) => (
            <ellipse key={`lb4${i}`} cx={163+(i%2===0?-2.5:2.5)} cy={185-dy} rx="4" ry="6.5"
              fill={i%2===0 ? 'rgba(255,179,230,.78)' : 'rgba(196,170,255,.70)'}
              transform={`rotate(${i%2===0?-8:8} ${163+(i%2===0?-2.5:2.5)} ${185-dy})`} />
          ))}
        </svg>

        {/* ── Lavender flower botanical — bottom-right ── */}
        <svg style={{ position: 'absolute', bottom: 0, right: 0, width: 250, height: 320, opacity: .20, pointerEvents: 'none' }} viewBox="0 0 250 320" fill="none">
          <path d="M220 320 Q208 250 195 200 Q183 158 187 115" stroke="rgba(80,110,70,.85)" strokeWidth="2.8" strokeLinecap="round" fill="none" />
          <path d="M185 320 Q174 258 162 210 Q152 170 156 128" stroke="rgba(80,110,70,.80)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M148 320 Q138 265 128 222 Q118 184 122 148" stroke="rgba(80,110,70,.75)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M110 320 Q102 276 95 240 Q88 210 91 182" stroke="rgba(80,110,70,.65)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* Leaves */}
          <path d="M195 200 Q215 187 222 165 Q205 168 195 185Z" fill="rgba(80,110,70,.70)" />
          <path d="M195 200 Q175 188 170 165 Q185 170 195 186Z" fill="rgba(80,110,70,.60)" />
          <path d="M162 210 Q180 198 184 178 Q168 180 162 196Z" fill="rgba(80,110,70,.55)" />
          {[0,9,18,27,36,46,56,66].map((dy, i) => (
            <ellipse key={`rbr${i}`} cx={189+(i%2===0?-4:4)} cy={115-dy} rx="5.5" ry="9.5"
              fill={i%3===0 ? 'rgba(88,40,160,.90)' : i%3===1 ? 'rgba(155,114,207,.88)' : 'rgba(210,185,255,.78)'}
              transform={`rotate(${i%2===0?12:-12} ${189+(i%2===0?-4:4)} ${115-dy})`} />
          ))}
          {[0,9,18,27,36,46,56].map((dy, i) => (
            <ellipse key={`rb2${i}`} cx={157+(i%2===0?-3.5:3.5)} cy={128-dy} rx="5" ry="8.5"
              fill={i%2===0 ? 'rgba(196,170,255,.85)' : 'rgba(230,210,255,.75)'}
              transform={`rotate(${i%2===0?10:-10} ${157+(i%2===0?-3.5:3.5)} ${128-dy})`} />
          ))}
          {[0,9,18,27,36,45].map((dy, i) => (
            <ellipse key={`rb3${i}`} cx={122+(i%2===0?-3:3)} cy={148-dy} rx="4.5" ry="7.5"
              fill={i%2===0 ? 'rgba(220,195,255,.82)' : 'rgba(245,220,255,.72)'}
              transform={`rotate(${i%2===0?9:-9} ${122+(i%2===0?-3:3)} ${148-dy})`} />
          ))}
          {[0,9,18,27,36].map((dy, i) => (
            <ellipse key={`rb4${i}`} cx={92+(i%2===0?-2.5:2.5)} cy={182-dy} rx="4" ry="6.5"
              fill={i%2===0 ? 'rgba(255,179,230,.78)' : 'rgba(196,170,255,.70)'}
              transform={`rotate(${i%2===0?8:-8} ${92+(i%2===0?-2.5:2.5)} ${182-dy})`} />
          ))}
        </svg>

        {/* ── Extra purple mist depth layers ── */}
        {/* Deep purple mist — low, wide */}
        <div style={{ position: 'absolute', bottom: '8%', left: 0, right: 0, height: '28%', background: 'linear-gradient(0deg, rgba(83,43,136,.14) 0%, rgba(140,90,200,.06) 60%, transparent 100%)', filter: 'blur(28px)' }} />
        {/* Mid-air lilac veil */}
        <div style={{ position: 'absolute', top: '20%', left: '-8%', width: '55%', height: '22%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(155,114,207,.09) 0%, transparent 70%)', filter: 'blur(40px)', transform: 'rotate(-4deg)' }} />
        {/* Moonbeam shaft — subtle diagonal cone from moon position */}
        <div style={{ position: 'absolute', top: '8%', left: '52%', width: '30%', height: '60%', background: 'linear-gradient(175deg, rgba(196,160,255,.05) 0%, transparent 80%)', filter: 'blur(18px)', transform: 'rotate(5deg)', transformOrigin: 'top center' }} />
        {/* Ground-level rose mist */}
        <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: '18%', background: 'radial-gradient(ellipse at 50% 100%, rgba(255,179,230,.08) 0%, transparent 70%)', filter: 'blur(22px)' }} />

        {/* ── Star / sparkle field ── */}
        {[...Array(95)].map((_, i) => {
          const gold = i % 5 === 0
          const rose = i % 4 === 0 || i % 11 === 0 || i % 13 === 0
          const lilac = i % 17 === 0
          const size = i % 7 === 0 ? 3.2 : i % 3 === 0 ? 2.0 : 1.2
          const color = gold
            ? `rgba(232,194,125,${0.75 + (i % 3) * 0.08})`
            : rose
            ? `rgba(255,179,230,${0.65 + (i % 4) * 0.08})`
            : lilac
            ? `rgba(196,170,255,${0.70 + (i % 3) * 0.06})`
            : `rgba(200,177,228,${0.48 + (i % 5) * 0.06})`
          return (
            <div key={i} className="animate-star-twinkle" style={{
              position: 'absolute',
              width: size, height: size, borderRadius: '50%',
              background: color,
              boxShadow: gold ? `0 0 ${size * 2.4}px rgba(232,194,125,.60)` : rose ? `0 0 ${size * 2.2}px rgba(255,179,230,.50)` : lilac ? `0 0 ${size * 2}px rgba(196,170,255,.40)` : 'none',
              top: `${(i * 17 + 9) % 100}%`,
              left: `${(i * 37 + 13) % 100}%`,
              animationDelay: `${(i * 0.18) % 3.8}s`,
              animationDuration: `${2.0 + (i % 6) * 0.36}s`,
            }} />
          )
        })}
        {/* ── Larger soft glow particles ── */}
        {[...Array(10)].map((_, i) => (
          <div key={`glow-${i}`} className="animate-star-twinkle" style={{
            position: 'absolute',
            width: i % 3 === 0 ? 5 : 4, height: i % 3 === 0 ? 5 : 4,
            borderRadius: '50%',
            background: i % 2 === 0 ? 'rgba(255,179,230,.82)' : 'rgba(196,170,255,.78)',
            boxShadow: i % 2 === 0 ? '0 0 12px rgba(255,179,230,.50)' : '0 0 10px rgba(196,170,255,.45)',
            top: `${(i * 31 + 5) % 94}%`,
            left: `${(i * 53 + 19) % 96}%`,
            animationDelay: `${(i * 0.40) % 4.0}s`,
            animationDuration: `${3.0 + (i % 4) * 0.50}s`,
          }} />
        ))}

        {/* ── Vignette layers ── */}
        {/* Edge darkening */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, transparent 40%, rgba(3,0,14,.55) 100%)' }} />
        {/* Top and bottom edge fade */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(180deg, rgba(5,0,16,.50) 0%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(0deg, rgba(5,0,16,.50) 0%, transparent 100%)' }} />
      </div>

      {/* ── Fixed header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 56,
        background: 'linear-gradient(180deg, rgba(5,0,18,.98) 0%, rgba(8,1,24,.94) 100%)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(196,170,255,.14)',
        display: 'flex', alignItems: 'center',
        padding: '0 12px 0 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginRight: 18 }}>
          {/* Header brand seal */}
          <div style={{ position: 'relative', width: 30, height: 30, flexShrink: 0 }}>
            {/* Gold outer ring */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid rgba(253,230,138,.32)',
              boxShadow: '0 0 8px rgba(139,92,246,.22)',
            }} />
            {/* Inner lavender ring */}
            <div style={{
              position: 'absolute', inset: 3, borderRadius: '50%',
              border: '1px solid rgba(196,170,255,.30)',
            }} />
            {/* Glass disc */}
            <div style={{
              position: 'absolute', inset: 5, borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 35%, rgba(55,18,105,.85), rgba(10,2,28,.94))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <img src={logoImg} alt="LM" style={{ width: 16, height: 16, objectFit: 'cover', borderRadius: '50%', clipPath: 'circle(50% at 50% 50%)', mixBlendMode: 'screen', filter: 'brightness(1.2) saturate(1.2) contrast(1.1)', opacity: .96 }} />
            </div>
          </div>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, color: 'rgba(253,230,138,.82)', letterSpacing: '.1em', whiteSpace: 'nowrap' }}>
            Layan Alahmari
          </span>
        </div>

        <nav style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto', scrollbarWidth: 'none', justifyContent: 'center' }}>
          {NAV_IDS.map(id => {
            const active = activeSection === id
            return (
              <button key={id} className="hov-btn" onClick={() => scrollTo(id)} style={{
                background: active ? 'rgba(196,170,255,.14)' : 'transparent',
                border: active ? '1px solid rgba(255,179,230,.32)' : '1px solid transparent',
                borderRadius: 6, padding: '5px 11px', cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10.5,
                color: active ? 'rgba(255,218,240,.96)' : 'rgba(196,170,255,.58)',
                letterSpacing: isAr ? 0 : '.06em', transition: 'all .2s',
              }}>
                {navLabelMap[id] ?? id}
              </button>
            )
          })}
        </nav>

        <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 14 }}>
          <button className="hov-btn" onClick={onMainMenu} style={{
            background: 'rgba(255,179,230,.08)', border: '1px solid rgba(255,179,230,.30)',
            borderRadius: 7, padding: '5px 13px', cursor: 'pointer',
            fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, color: 'rgba(255,218,240,.80)', letterSpacing: isAr ? 0 : '.05em', whiteSpace: 'nowrap',
          }}>
            {isAr ? 'الرئيسية' : 'Home'}
          </button>
          <button className="hov-btn" onClick={onEnterGame} style={{
            background: 'rgba(196,170,255,.12)', border: '1px solid rgba(196,170,255,.38)',
            borderRadius: 7, padding: '5px 13px', cursor: 'pointer',
            fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, color: 'rgba(196,170,255,.88)', letterSpacing: isAr ? 0 : '.05em', whiteSpace: 'nowrap',
          }}>
            ✦ {hasGuide ? (isAr ? 'الحديقة' : 'Enter Garden') : (isAr ? 'وضع اللعبة' : 'Game Mode')}
          </button>
          <InlineControls />
        </div>
      </header>

      {/* ── Scrollable body (window scroll) ── */}
      <div id="portfolio-scroll" style={{ flex: 1, paddingTop: 56, position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 24px 80px' }}>

          {/* ── HERO ── */}
          <section style={{ paddingTop: 72, paddingBottom: 56, textAlign: 'center', position: 'relative' }}>
            {/* Hero atmospheric layers */}
            <div style={{ position: 'absolute', top: 0, left: '4%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(83,43,136,.22) 0%, rgba(47,24,75,.10) 60%, transparent 80%)', filter: 'blur(65px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 20, right: '4%', width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.18) 0%, rgba(180,90,160,.08) 60%, transparent 80%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 300, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(155,114,207,.14) 0%, rgba(200,177,228,.06) 55%, transparent 80%)', filter: 'blur(50px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', width: 600, height: 150, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(83,43,136,.16) 0%, transparent 70%)', filter: 'blur(45px)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              {/* Logo medallion / emblem */}
              <div
                onMouseEnter={() => setLogoHov(true)}
                onMouseLeave={() => setLogoHov(false)}
                style={{ position: 'relative', width: 136, height: 136, cursor: 'default' }}
              >
                {/* Radial lavender ambient behind medallion */}
                <div style={{
                  position: 'absolute', inset: -24,
                  borderRadius: '50%',
                  background: logoHov
                    ? 'radial-gradient(circle, rgba(139,92,246,.28) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(139,92,246,.16) 0%, transparent 70%)',
                  transition: 'background .4s ease',
                  pointerEvents: 'none',
                }} />

                {/* Decorative SVG ornament ring — stars & tick marks */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 136 136">
                  {/* Thin outer dashed orbit ring */}
                  <circle cx="68" cy="68" r="65" fill="none"
                    stroke={logoHov ? 'rgba(253,230,138,.30)' : 'rgba(253,230,138,.18)'}
                    strokeWidth="0.8" strokeDasharray="3 6"
                    style={{ transition: 'stroke .4s' }}
                  />
                  {/* Four cardinal tick marks */}
                  {[[68,3,68,10],[68,126,68,133],[3,68,10,68],[126,68,133,68]].map(([x1,y1,x2,y2],i) => (
                    <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={logoHov ? 'rgba(253,230,138,.55)' : 'rgba(253,230,138,.32)'}
                      strokeWidth="1.2" style={{ transition: 'stroke .4s' }}
                    />
                  ))}
                  {/* Eight small diamond dots at 45° intervals */}
                  {[0,45,90,135,180,225,270,315].map((deg, i) => {
                    const r = 65, a = (deg - 90) * Math.PI / 180
                    const x = 68 + r * Math.cos(a), y = 68 + r * Math.sin(a)
                    return <rect key={i} x={x-2} y={y-2} width={4} height={4} rx={0.5}
                      fill={logoHov ? 'rgba(253,230,138,.55)' : 'rgba(253,230,138,.30)'}
                      transform={`rotate(45 ${x} ${y})`}
                      style={{ transition: 'fill .4s' }}
                    />
                  })}
                  {/* Four tiny star-points at inter-cardinal positions */}
                  {[22.5,112.5,202.5,292.5].map((deg, i) => {
                    const r = 65, a = (deg - 90) * Math.PI / 180
                    const x = 68 + r * Math.cos(a), y = 68 + r * Math.sin(a)
                    return <circle key={i} cx={x} cy={y} r={1.5}
                      fill={logoHov ? 'rgba(196,170,255,.7)' : 'rgba(196,170,255,.4)'}
                      style={{ transition: 'fill .4s' }}
                    />
                  })}
                </svg>

                {/* Outer gold border ring */}
                <div style={{
                  position: 'absolute', inset: 8,
                  borderRadius: '50%',
                  border: `1.5px solid ${logoHov ? 'rgba(253,230,138,.60)' : 'rgba(253,230,138,.36)'}`,
                  boxShadow: logoHov
                    ? '0 0 22px rgba(253,230,138,.18)'
                    : 'none',
                  transition: 'border-color .4s, box-shadow .4s',
                  pointerEvents: 'none',
                }} />

                {/* Inner lavender ring */}
                <div style={{
                  position: 'absolute', inset: 14,
                  borderRadius: '50%',
                  border: `1px solid ${logoHov ? 'rgba(196,170,255,.65)' : 'rgba(196,170,255,.38)'}`,
                  transition: 'border-color .4s',
                  pointerEvents: 'none',
                }} />

                {/* Glass disc — dark translucent purple */}
                <div style={{
                  position: 'absolute', inset: 18,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 34%, rgba(55,18,105,.82) 0%, rgba(10,2,28,.92) 100%)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: logoHov
                    ? 'inset 0 0 32px rgba(139,92,246,.30), 0 0 40px rgba(139,92,246,.40)'
                    : 'inset 0 0 20px rgba(139,92,246,.18), 0 0 28px rgba(139,92,246,.28)',
                  transition: 'box-shadow .4s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden',
                }}>
                  <img
                    src={logoImg}
                    alt="LM — Layan Alahmari"
                    style={{
                      width: 62, height: 62, objectFit: 'cover',
                      borderRadius: '50%',
                      clipPath: 'circle(50% at 50% 50%)',
                      mixBlendMode: 'screen',
                      filter: `brightness(${logoHov ? 1.28 : 1.15}) saturate(1.2) contrast(1.1)`,
                      transition: 'filter .4s ease',
                    }}
                  />
                </div>
              </div>
            </div>

            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 10.5, letterSpacing: '0.32em', color: 'rgba(253,230,138,.58)', marginBottom: 12 }}>
              {isAr ? 'ملف الأعمال · جامعة الملك عبدالعزيز' : 'PORTFOLIO  ·  KING ABDULAZIZ UNIVERSITY'}
            </p>
            <h1 style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: 'clamp(28px, 4.5vw, 50px)',
              color: 'rgba(235,220,255,.98)',
              textShadow: '0 0 60px rgba(196,170,255,.5)',
              marginBottom: 14, lineHeight: 1.12,
            }}>
              Layan M. Alahmari
            </h1>
            <p style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 'clamp(13px, 1.8vw, 17px)', color: 'rgba(242,190,230,.78)', marginBottom: 36 }}>
              {isAr ? 'طالبة نظم معلومات | محتوى رقمي | الذكاء الاصطناعي وتقنيات الويب' : 'Information Systems Student  |  Digital Content  |  AI & Web Technologies'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <button className="hov-btn" onClick={() => scrollTo('Work')} style={{
                padding: '13px 32px', borderRadius: 8, cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(139,92,246,.35), rgba(196,170,255,.2))',
                border: '1px solid rgba(196,170,255,.45)',
                fontFamily: "'Cinzel', serif", fontSize: 11.5, letterSpacing: '.08em',
                color: 'rgba(221,205,255,.95)',
              }}>
                {isAr ? '✦ استكشف أعمالي' : '✦ Explore My Work'}
              </button>
              <button className="hov-btn" onClick={() => scrollTo('Contact')} style={{
                padding: '13px 32px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(253,230,138,.1)', border: '1px solid rgba(253,230,138,.38)',
                fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 11.5, letterSpacing: isAr ? 0 : '.08em',
                color: 'rgba(253,230,138,.9)',
              }}>
                {isAr ? '✉ تواصل معي' : '✉ Contact Me'}
              </button>
            </div>
          </section>

          {/* ── ABOUT ── */}
          <section ref={el => { sectionRefs.current['About'] = el }} style={{ paddingTop: 40, paddingBottom: 40, position: 'relative' }}>
            {/* Section atmosphere: soft rose mist + lavender */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 24 }}>
              <div style={{ position: 'absolute', top: -40, right: '10%', width: 280, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: '5%', width: 220, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,114,207,.10) 0%, transparent 70%)', filter: 'blur(36px)' }} />
            </div>
            <SectionTitle label={`01 — ${t.pp_aboutLabel}`} title={t.pp_aboutTitle} accent="#c4aaff" />
            <div onClick={() => setAboutOpen(true)} style={{ cursor: 'pointer' }}>
              <Card>
                <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 15, lineHeight: 1.88, color: 'rgba(221,205,255,.85)' }}>
                  {isAr
                    ? 'طالبة في تخصص نظم المعلومات بجامعة الملك عبدالعزيز، مع اهتمام بالمحتوى الرقمي وتقنيات الويب والذكاء الاصطناعي والتجارب الرقمية التي تركز على المستخدم. شمل التدريب الصيفي في عمادة التعلم الإلكتروني والتعليم عن بُعد إنتاج الفيديوهات التعليمية، وإنشاء المحتوى بمساعدة الذكاء الاصطناعي، وتنفيذ مهام برمجية وتقنية. اهتمام بتحويل الأفكار المعقدة إلى تجارب رقمية واضحة وجذابة من خلال الجمع بين التفكير التحليلي والإبداع.'
                    : 'An Information Systems student at King Abdulaziz University with interests in digital content, web technologies, artificial intelligence, and user-focused digital experiences. Summer internship experience at the Deanship of E-Learning and Distance Education included educational video production, AI-assisted content creation, and coding and technical tasks. Interest in transforming complex ideas into clear and engaging digital experiences through a combination of analytical thinking and creativity.'}
                </p>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderTop: '1px solid rgba(196,170,255,.08)', paddingTop: 12 }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '.16em', color: 'rgba(255,179,230,.38)' }}>{t.pp_expandHint}</span>
                </div>
              </Card>
            </div>
            {aboutOpen && (
              <SectionModal title={t.pp_aboutTitle} onClose={closeAbout}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
                  {/* Decorative icon */}
                  <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(83,43,136,.22)', border: '1px solid rgba(255,179,230,.22)', boxShadow: '0 0 24px rgba(255,179,230,.10)', fontSize: 26 }}>
                    ✦
                  </div>
                  {/* Pink/lavender accent line */}
                  <div style={{ width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,179,230,.40), rgba(200,177,228,.35), transparent)' }} />
                  <p style={{
                    fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic',
                    fontSize: 17, lineHeight: 2.0,
                    color: 'rgba(228,210,255,.88)',
                    maxWidth: 580, textAlign: 'center',
                  }}>
                    {isAr
                      ? 'طالبة في تخصص نظم المعلومات بجامعة الملك عبدالعزيز، مع اهتمام بالمحتوى الرقمي وتقنيات الويب والذكاء الاصطناعي والتجارب الرقمية التي تركز على المستخدم. شمل التدريب الصيفي في عمادة التعلم الإلكتروني والتعليم عن بُعد إنتاج الفيديوهات التعليمية، وإنشاء المحتوى بمساعدة الذكاء الاصطناعي، وتنفيذ مهام برمجية وتقنية. اهتمام بتحويل الأفكار المعقدة إلى تجارب رقمية واضحة وجذابة من خلال الجمع بين التفكير التحليلي والإبداع.'
                      : 'An Information Systems student at King Abdulaziz University with interests in digital content, web technologies, artificial intelligence, and user-focused digital experiences. Summer internship experience at the Deanship of E-Learning and Distance Education included educational video production, AI-assisted content creation, and coding and technical tasks. Interest in transforming complex ideas into clear and engaging digital experiences through a combination of analytical thinking and creativity.'}
                  </p>
                  <div style={{ width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(200,177,228,.30), rgba(255,179,230,.35), transparent)' }} />
                  {/* Signature line */}
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.24em', color: 'rgba(232,194,125,.58)' }}>
                    LAYAN M. ALAHMARI &nbsp;·&nbsp; KING ABDULAZIZ UNIVERSITY
                  </span>
                </div>
              </SectionModal>
            )}
          </section>

          {/* ── EDUCATION & LANGUAGES ── */}
          <section style={{ paddingTop: 40, paddingBottom: 40, borderRadius: 20, position: 'relative', background: 'linear-gradient(180deg, rgba(31,26,58,.55) 0%, rgba(20,5,50,.30) 60%, rgba(14,3,35,.0) 100%)', margin: '0 -8px', padding: '40px 8px', overflow: 'hidden' }}>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: '10%', left: '-8%', width: 300, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,194,125,.08) 0%, transparent 70%)', filter: 'blur(42px)' }} />
              <div style={{ position: 'absolute', bottom: '5%', right: '-4%', width: 260, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.08) 0%, transparent 70%)', filter: 'blur(38px)' }} />
            </div>
            <SectionTitle label={`02 — ${t.pp_eduLabel}`} title={`${t.pp_eduTitle} & ${t.pp_langTitle}`} accent="#fde68a" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20, alignItems: 'stretch' }}>
              <div onClick={() => setEduOpen(true)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                <Card accent="rgba(253,230,138,.26)" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <GlowDot color="#fde68a" size={8} />
                    <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.2em', color: 'rgba(253,230,138,.65)' }}>{isAr ? 'درجة علمية' : 'DEGREE'}</span>
                  </div>
                  <h3 style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 14.5, color: 'rgba(253,230,138,.92)', marginBottom: 8, lineHeight: 1.4 }}>
                    {isAr ? 'بكالوريوس العلوم في نظم المعلومات' : 'Bachelor of Science in Information Systems'}
                  </h3>
                  <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13.5, color: 'rgba(221,205,255,.75)', marginBottom: 5 }}>
                    {isAr ? 'جامعة الملك عبدالعزيز' : 'King Abdulaziz University'}
                  </p>
                  <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10.5, color: 'rgba(196,170,255,.5)', letterSpacing: isAr ? 0 : '.08em' }}>
                    {isAr ? 'أغسطس 2021 – يونيو 2027' : 'Aug 2021 – Jun 2027'}
                  </p>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderTop: '1px solid rgba(253,230,138,.08)', paddingTop: 12 }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '.16em', color: 'rgba(253,230,138,.34)' }}>{`${t.pp_expandHint}`}</span>
                  </div>
                </Card>
              </div>

              <div onClick={() => setLangOpen(true)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                <Card accent="rgba(196,170,255,.26)" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <GlowDot color="#c4aaff" size={8} />
                    <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.2em', color: 'rgba(196,170,255,.65)' }}>{isAr ? 'اللغات' : 'LANGUAGES'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13.5, color: 'rgba(221,205,255,.85)' }}>Arabic</span>
                        <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, color: 'rgba(253,230,138,.7)', letterSpacing: isAr ? 0 : '.06em' }}>{isAr ? 'لغة أم' : 'NATIVE'}</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 4, background: 'rgba(196,170,255,.14)' }}>
                        <div style={{ height: '100%', width: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #c4aaff, #a87fff)' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13.5, color: 'rgba(221,205,255,.85)' }}>English</span>
                        <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, color: 'rgba(253,230,138,.7)', letterSpacing: isAr ? 0 : '.06em' }}>{isAr ? 'متقدم' : 'ADVANCED'}</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 4, background: 'rgba(196,170,255,.14)' }}>
                        <div style={{ height: '100%', width: '85%', borderRadius: 4, background: 'linear-gradient(90deg, #fde68a, #f59e0b)' }} />
                      </div>
                      <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 12, color: 'rgba(196,170,255,.52)', marginTop: 6 }}>
                        {isAr ? 'القدرة على فهم اللغة الإنجليزية والكتابة والتحدث بها في المواقف الدراسية واليومية والعملية.' : 'Able to understand, write, and communicate in English for academic, everyday, and practical situations.'}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderTop: '1px solid rgba(196,170,255,.08)', paddingTop: 12 }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '.16em', color: 'rgba(196,170,230,.34)' }}>{`${t.pp_expandHint}`}</span>
                  </div>
                </Card>
              </div>
            </div>

            {/* Education modal */}
            {eduOpen && (
              <SectionModal title={t.pp_eduTitle} accent="#fde68a" onClose={closeEdu}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(83,43,136,.22)', border: '1px solid rgba(232,194,125,.26)', boxShadow: '0 0 24px rgba(232,194,125,.10)', fontSize: 26 }}>
                    🎓
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.22em', color: 'rgba(232,194,125,.60)' }}>{isAr ? 'درجة علمية' : 'DEGREE'}</span>
                    <h3 style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 22, color: 'rgba(253,230,138,.95)', lineHeight: 1.38, maxWidth: 500 }}>
                      {isAr ? 'بكالوريوس العلوم في نظم المعلومات' : 'Bachelor of Science in Information Systems'}
                    </h3>
                    <div style={{ width: 180, height: 1, background: 'linear-gradient(90deg, transparent, rgba(232,194,125,.40), rgba(255,179,230,.30), transparent)' }} />
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 17, color: 'rgba(221,205,255,.82)', lineHeight: 1.6 }}>
                      {isAr ? 'جامعة الملك عبدالعزيز' : 'King Abdulaziz University'}
                    </p>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 12, color: 'rgba(196,170,255,.58)', letterSpacing: isAr ? 0 : '.10em' }}>
                      {isAr ? 'أغسطس 2021 – يونيو 2027' : 'Aug 2021 – Jun 2027'}
                    </p>
                  </div>
                  <div style={{ width: 180, height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,170,255,.25), transparent)' }} />
                  <span style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 13, color: 'rgba(196,170,255,.48)' }}>
                    King Abdulaziz University · Jeddah, Saudi Arabia
                  </span>
                </div>
              </SectionModal>
            )}

            {/* Languages modal */}
            {langOpen && (
              <SectionModal title={t.pp_langTitle} onClose={closeLang}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, textAlign: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(83,43,136,.22)', border: '1px solid rgba(200,177,228,.26)', boxShadow: '0 0 24px rgba(200,177,228,.10)', fontSize: 26 }}>
                    🌐
                  </div>
                  <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 28 }}>
                    {/* Arabic */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 18, color: 'rgba(221,205,255,.90)' }}>{isAr ? 'العربية' : 'Arabic'}</span>
                        <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 11, color: 'rgba(253,230,138,.72)', letterSpacing: isAr ? 0 : '.10em' }}>{isAr ? 'لغة أم' : 'NATIVE'}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 6, background: 'rgba(196,170,255,.14)' }}>
                        <div style={{ height: '100%', width: '100%', borderRadius: 6, background: 'linear-gradient(90deg, #c4aaff, #a87fff)', boxShadow: '0 0 10px rgba(196,170,255,.30)' }} />
                      </div>
                    </div>
                    <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,170,255,.18), transparent)' }} />
                    {/* English */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 18, color: 'rgba(221,205,255,.90)' }}>{isAr ? 'الإنجليزية' : 'English'}</span>
                        <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 11, color: 'rgba(253,230,138,.72)', letterSpacing: isAr ? 0 : '.10em' }}>{isAr ? 'متقدم' : 'ADVANCED'}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 6, background: 'rgba(196,170,255,.14)' }}>
                        <div style={{ height: '100%', width: '85%', borderRadius: 6, background: 'linear-gradient(90deg, #fde68a, #f59e0b)', boxShadow: '0 0 10px rgba(253,230,138,.25)' }} />
                      </div>
                      <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 14.5, color: 'rgba(196,170,255,.60)', lineHeight: 1.72, marginTop: 4 }}>
                        {isAr ? 'القدرة على فهم اللغة الإنجليزية والكتابة والتحدث بها في المواقف الدراسية واليومية والعملية.' : 'Able to understand, write, and communicate in English for academic, everyday, and practical situations.'}
                      </p>
                    </div>
                  </div>
                </div>
              </SectionModal>
            )}
          </section>

          {/* ── EXPERIENCE ── */}
          <section ref={el => { sectionRefs.current['Experience'] = el }} style={{ paddingTop: 40, paddingBottom: 40, position: 'relative' }}>
            {/* Section atmosphere: gentle rose mist */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 24 }}>
              <div style={{ position: 'absolute', top: '5%', right: '-6%', width: 320, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.11) 0%, transparent 70%)', filter: 'blur(48px)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '-4%', width: 240, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(83,43,136,.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            </div>
            <SectionTitle label={`03 — ${t.pp_internLabel}`} title={t.pp_internTitle} accent="#c4aaff" />
            <div onClick={() => setInternOpen(true)} style={{ cursor: 'pointer' }}>
              <Card accent="rgba(196,170,255,.24)">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'flex-start' }}>
                  <div style={{ flex: '1 1 220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                      <GlowDot color="#c4aaff" size={8} />
                      <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.2em', color: 'rgba(196,170,255,.62)' }}>{isAr ? 'الدور' : 'ROLE'}</span>
                    </div>
                    <h3 style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 17, color: 'rgba(235,220,255,.95)', marginBottom: 6 }}>{isAr ? 'متدربة صيفية' : 'Summer Intern'}</h3>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13.5, color: 'rgba(221,205,255,.85)', marginBottom: 4, lineHeight: 1.5 }}>
                      {isAr ? 'عمادة التعلم الإلكتروني والتعليم عن بُعد' : 'Deanship of E-Learning and Distance Education'}
                    </p>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: 'rgba(196,170,255,.62)', marginBottom: 5 }}>{isAr ? 'جامعة الملك عبدالعزيز' : 'King Abdulaziz University'}</p>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, color: 'rgba(253,230,138,.58)', letterSpacing: isAr ? 0 : '.08em', marginBottom: 4 }}>
                      {isAr ? '29 يونيو 2026 – 13 أغسطس 2026' : 'Jun 29, 2026 – Aug 13, 2026'}
                    </p>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: 'rgba(196,170,255,.48)' }}>{isAr ? 'جدة، المملكة العربية السعودية · حضوري' : 'Jeddah, Saudi Arabia · On-site'}</p>
                  </div>

                  <div style={{ flex: '1 1 220px' }}>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.15em', color: 'rgba(196,170,255,.52)', marginBottom: 12 }}>{isAr ? 'مجالات التركيز' : 'FOCUS AREAS'}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {[
                        { icon: '🎬', en: 'Educational Video Production', ar: 'إنتاج الفيديوهات التعليمية' },
                        { icon: '🤖', en: 'AI-Assisted Content Creation', ar: 'إنشاء المحتوى بمساعدة الذكاء الاصطناعي' },
                        { icon: '💻', en: 'Coding and Technical Tasks', ar: 'المهام البرمجية والتقنية' },
                        { icon: '🤝', en: 'Collaborative Workflows', ar: 'العمل التعاوني' },
                      ].map(item => (
                        <FocusAreaRow key={item.en} icon={item.icon} label={isAr ? item.ar : item.en} />
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderTop: '1px solid rgba(196,170,255,.08)', paddingTop: 14 }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '.16em', color: 'rgba(255,179,230,.38)' }}>{`${t.pp_expandHint}`}</span>
                </div>
              </Card>
            </div>
            {internOpen && (
              <SectionModal title={t.pp_internTitle} onClose={closeIntern}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {/* Role block */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(83,43,136,.22)', border: '1px solid rgba(200,177,228,.26)', fontSize: 24 }}>💼</div>
                    <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.22em', color: 'rgba(196,170,255,.55)' }}>{isAr ? 'الدور' : 'ROLE'}</span>
                    <h3 style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 22, color: 'rgba(235,220,255,.95)', lineHeight: 1.3 }}>{isAr ? 'متدربة صيفية' : 'Summer Intern'}</h3>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 16, color: 'rgba(221,205,255,.82)', lineHeight: 1.6 }}>
                      {isAr ? 'عمادة التعلم الإلكتروني والتعليم عن بُعد' : 'Deanship of E-Learning and Distance Education'}
                    </p>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14.5, color: 'rgba(196,170,255,.62)' }}>{isAr ? 'جامعة الملك عبدالعزيز' : 'King Abdulaziz University'}</p>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 11, color: 'rgba(253,230,138,.62)', letterSpacing: isAr ? 0 : '.10em' }}>
                      {isAr ? '29 يونيو 2026 – 13 أغسطس 2026' : 'Jun 29, 2026 – Aug 13, 2026'}
                    </p>
                    <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: 13, color: 'rgba(196,170,255,.48)' }}>{isAr ? 'جدة، المملكة العربية السعودية · حضوري' : 'Jeddah, Saudi Arabia · On-site'}</p>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 14, color: 'rgba(221,205,255,.72)', lineHeight: 1.80, marginTop: 8, maxWidth: 480 }}>
                      {isAr
                        ? 'تدريب صيفي ركز على إنتاج الفيديوهات التعليمية، وإنشاء المحتوى بمساعدة الذكاء الاصطناعي، وتنفيذ المهام البرمجية والتقنية، والعمل ضمن مسارات تعاونية.'
                        : 'Summer internship focused on educational video production, AI-assisted content creation, coding and technical tasks, and collaborative workflows.'}
                    </p>
                  </div>
                  {/* Divider */}
                  <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,179,230,.28), rgba(200,177,228,.22), transparent)' }} />
                  {/* Focus areas */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.20em', color: 'rgba(196,170,255,.52)', marginBottom: 18, textAlign: 'center' }}>{isAr ? 'مجالات التركيز' : 'FOCUS AREAS'}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { icon: '🎬', en: 'Educational Video Production', ar: 'إنتاج الفيديوهات التعليمية' },
                        { icon: '🤖', en: 'AI-Assisted Content Creation', ar: 'إنشاء المحتوى بمساعدة الذكاء الاصطناعي' },
                        { icon: '💻', en: 'Coding and Technical Tasks', ar: 'المهام البرمجية والتقنية' },
                        { icon: '🤝', en: 'Collaborative Workflows', ar: 'العمل التعاوني' },
                      ].map(item => (
                        <FocusAreaRow key={item.en} icon={item.icon} label={isAr ? item.ar : item.en} />
                      ))}
                    </div>
                  </div>
                </div>
              </SectionModal>
            )}

            <div style={{ marginTop: 20 }}>
              <div onClick={() => setVidProdOpen(true)} style={{ cursor: 'pointer' }}>
                <Card accent="rgba(196,170,255,.18)">
                  <div style={{ textAlign: 'center', marginBottom: 22 }}>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.25em', color: 'rgba(253,230,138,.58)', marginBottom: 10 }}>{isAr ? 'إنتاج الفيديو' : 'VIDEO PRODUCTION'}</p>
                    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 10 }}>
                      <span style={{
                        fontFamily: "'Cinzel Decorative', serif",
                        fontSize: 'clamp(44px, 7vw, 70px)',
                        background: 'linear-gradient(135deg, #fde68a, #c4aaff)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                      }}>16</span>
                      <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 17, color: 'rgba(253,230,138,.68)' }}>{isAr ? 'فيديو منتج' : 'Videos Produced'}</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10, marginBottom: 18 }}>
                    {(isAr ? [
                      { count: '8', label: 'فيديوهات في الإحصاء' },
                      { count: '4', label: 'فيديوهات في قياس وتقويم الأداء' },
                      { count: '2', label: 'فيديو في نظام الأحوال الشخصية' },
                      { count: '1', label: 'فيديو ترويجي لفعالية الأمن السيبراني' },
                      { count: '1', label: 'فيديو تعليمي عن الفريق الأزرق والفريق الأحمر لطلاب موهبة' },
                    ] : [
                      { count: '8', label: 'Statistics educational videos' },
                      { count: '4', label: 'Performance Measurement & Evaluation videos' },
                      { count: '2', label: 'Personal Status Law videos' },
                      { count: '1', label: 'Cybersecurity event promotional video' },
                      { count: '1', label: 'Blue Team vs Red Team educational video for Mawhiba students' },
                    ]).map(item => (
                      <StatCard key={item.label} count={item.count} label={item.label} />
                    ))}
                  </div>
                  <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 13, color: 'rgba(196,170,255,.56)', lineHeight: 1.78, marginBottom: 18 }}>
                    {isAr
                      ? 'شملت عملية إنتاج الفيديوهات مراجعة المواد والمحتوى، وتحديد المفاهيم الأساسية وتبسيطها، وإعداد النصوص التعليمية، وتصميم المحتوى المرئي، وإنتاج التعليق الصوتي بمساعدة الذكاء الاصطناعي، والمونتاج، والتسليم النهائي.'
                      : 'The video production process included reviewing source materials and content, identifying and simplifying key concepts, developing educational scripts, designing visual content, producing AI-assisted voice-over, editing, and final delivery.'}
                  </p>
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(253,230,138,.52)', marginBottom: 10 }}>{isAr ? 'أدوات مستخدمة' : 'TOOLS USED'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {['PowerPoint', 'Canva', 'Adobe Express', 'ElevenLabs', 'ChatGPT', 'Gemini', 'Copilot'].map(t => (
                        <SmallToolTag key={t} label={t} />
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderTop: '1px solid rgba(196,170,255,.08)', paddingTop: 14 }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '.16em', color: 'rgba(255,179,230,.38)' }}>{`${t.pp_expandHint}`}</span>
                  </div>
                </Card>
              </div>
            </div>
            {vidProdOpen && (
              <SectionModal title={t.pp_vidTitle} accent="#fde68a" onClose={closeVidProd}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {/* Headline stat */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
                      <span style={{
                        fontFamily: "'Cinzel Decorative', serif", fontSize: 72,
                        background: 'linear-gradient(135deg, #fde68a, #c4aaff)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        lineHeight: 1,
                      }}>16</span>
                      <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 20, color: 'rgba(253,230,138,.72)' }}>{isAr ? 'فيديو تم إنتاجها' : 'Videos Produced'}</span>
                    </div>
                    <div style={{ width: 200, height: 1, background: 'linear-gradient(90deg, transparent, rgba(232,194,125,.40), transparent)', margin: '0 auto' }} />
                  </div>
                  {/* Category breakdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(isAr ? [
                      { count: '8', label: 'فيديوهات في الإحصاء' },
                      { count: '4', label: 'فيديوهات في قياس وتقويم الأداء' },
                      { count: '2', label: 'فيديو في نظام الأحوال الشخصية' },
                      { count: '1', label: 'فيديو ترويجي لفعالية الأمن السيبراني' },
                      { count: '1', label: 'فيديو تعليمي عن الفريق الأزرق والفريق الأحمر لطلاب موهبة' },
                    ] : [
                      { count: '8', label: 'Statistics educational videos' },
                      { count: '4', label: 'Performance Measurement & Evaluation videos' },
                      { count: '2', label: 'Personal Status Law videos' },
                      { count: '1', label: 'Cybersecurity event promotional video' },
                      { count: '1', label: 'Blue Team vs Red Team educational video for Mawhiba students' },
                    ]).map(item => (
                      <StatCard key={item.label} count={item.count} label={item.label} />
                    ))}
                  </div>
                  {/* Divider */}
                  <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,170,255,.22), transparent)' }} />
                  {/* Production process */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.20em', color: 'rgba(253,230,138,.52)', marginBottom: 14 }}>{isAr ? 'عملية الإنتاج' : 'PRODUCTION PROCESS'}</p>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 15, color: 'rgba(196,170,255,.68)', lineHeight: 1.88 }}>
                      {isAr
                        ? 'شملت عملية إنتاج الفيديوهات مراجعة المواد والمحتوى، وتحديد المفاهيم الأساسية وتبسيطها، وإعداد النصوص التعليمية، وتصميم المحتوى المرئي، وإنتاج التعليق الصوتي بمساعدة الذكاء الاصطناعي، والمونتاج، والتسليم النهائي.'
                        : 'The video production process included reviewing source materials and content, identifying and simplifying key concepts, developing educational scripts, designing visual content, producing AI-assisted voice-over, editing, and final delivery.'}
                    </p>
                  </div>
                  {/* Tools */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.20em', color: 'rgba(253,230,138,.52)', marginBottom: 14 }}>{isAr ? 'أدوات مستخدمة' : 'TOOLS USED'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                      {['PowerPoint', 'Canva', 'Adobe Express', 'ElevenLabs', 'ChatGPT', 'Gemini', 'Copilot'].map(t => (
                        <SmallToolTag key={t} label={t} />
                      ))}
                    </div>
                  </div>
                </div>
              </SectionModal>
            )}
          </section>

          {/* ── FEATURED WORK ── */}
          <section ref={el => { sectionRefs.current['Work'] = el }} style={{ paddingTop: 40, paddingBottom: 40, position: 'relative' }}>
            {/* Section atmosphere: deeper lavender + subtle gold and pink light */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 24 }}>
              <div style={{ position: 'absolute', top: '-5%', left: '20%', width: 400, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,114,207,.14) 0%, transparent 70%)', filter: 'blur(56px)' }} />
              <div style={{ position: 'absolute', top: '20%', right: '-2%', width: 260, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.12) 0%, transparent 70%)', filter: 'blur(44px)' }} />
              <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 200, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,194,125,.07) 0%, transparent 70%)', filter: 'blur(36px)' }} />
            </div>
            <SectionTitle label={`04 — ${t.pp_featuredLabel}`} title={t.pp_featuredTitle} accent="#c4aaff" />

            {/* Project cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22, marginBottom: 28 }}>

              {/* Project 1 — Cybersecurity */}
              <div
                onMouseEnter={() => setCyberCardHov(true)}
                onMouseLeave={() => setCyberCardHov(false)}
                onClick={() => setCyberModalOpen(true)}
                style={{
                  borderRadius: 16, overflow: 'hidden',
                  border: activeVideo === 'cyber' ? '1.5px solid rgba(255,179,230,.62)' : cyberCardHov ? '1.5px solid rgba(255,179,230,.45)' : '1px solid rgba(196,170,255,.22)',
                  boxShadow: activeVideo === 'cyber'
                    ? '0 0 36px rgba(255,179,230,.22), 0 0 22px rgba(155,114,207,.20), 0 8px 32px rgba(0,0,0,.45)'
                    : cyberCardHov
                    ? '0 16px 52px rgba(0,0,0,.50), 0 0 36px rgba(255,179,230,.22), 0 0 22px rgba(155,114,207,.18), inset 0 0 28px rgba(255,179,230,.08)'
                    : '0 8px 32px rgba(0,0,0,.35)',
                  background: cyberCardHov
                    ? 'linear-gradient(145deg, rgba(18,6,44,.96), rgba(30,8,58,.98))'
                    : 'linear-gradient(145deg, rgba(12,4,30,.92), rgba(22,8,48,.95))',
                  transition: 'border-color .40s cubic-bezier(.22,1,.36,1), box-shadow .40s ease, background .40s ease, transform .40s cubic-bezier(.22,1,.36,1)',
                  transform: cyberCardHov ? 'translateY(-4px) scale(1.015)' : 'none',
                  display: 'flex', flexDirection: 'column',
                  cursor: 'pointer',
                }}>
                {/* Cover */}
                <div style={{
                  height: 160, position: 'relative',
                  background: 'linear-gradient(135deg, rgba(14,4,36,.95) 0%, rgba(28,8,60,.90) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: activeVideo === 'cyber' ? 'radial-gradient(ellipse at 50% 40%, rgba(255,179,230,.12), rgba(155,114,207,.08) 60%, transparent)' : cyberCardHov ? 'radial-gradient(ellipse at 50% 40%, rgba(255,179,230,.07), transparent 70%)' : 'rgba(83,43,136,.04)', transition: 'background .40s' }} />
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .06 }} viewBox="0 0 400 160" preserveAspectRatio="none">
                    {[0,1,2,3,4,5].map(i => <line key={i} x1={i*80} y1="0" x2={i*80} y2="160" stroke="#c8b1e4" strokeWidth="1"/>)}
                    {[0,1,2,3].map(i => <line key={i} x1="0" y1={i*40} x2="400" y2={i*40} stroke="#c8b1e4" strokeWidth="1"/>)}
                  </svg>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'rgba(83,43,136,.22)', border: '1.5px solid rgba(200,177,228,.42)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 22px rgba(155,114,207,.24)', position: 'relative', zIndex: 1,
                  }}>
                    <span style={{ fontSize: 20 }}>🛡️</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 10, left: 12, zIndex: 1 }}>
                    <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 8.5, letterSpacing: isAr ? 0 : '.14em', color: 'rgba(253,230,138,.85)', background: 'rgba(0,0,0,.5)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(253,230,138,.28)' }}>{isAr ? 'فيديو ترويجي' : 'PROMOTIONAL VIDEO'}</span>
                  </div>
                  {activeVideo === 'cyber' && (
                    <div style={{ position: 'absolute', top: 10, right: 12, zIndex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffb3e6', display: 'inline-block', boxShadow: '0 0 7px rgba(255,179,230,.80)' }} />
                      <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 8, color: 'rgba(255,218,240,.92)', letterSpacing: isAr ? 0 : '.1em' }}>{isAr ? 'يُشغَّل' : 'PLAYING'}</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(253,230,138,.55)', marginBottom: 5 }}>{isAr ? 'المشروع الأول' : 'PROJECT 01'}</p>
                    <h3 style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 14, color: 'rgba(235,220,255,.95)', lineHeight: 1.42, marginBottom: 0 }}>
                      {isAr ? 'فيديو ترويجي لفعالية الأمن السيبراني' : 'Cybersecurity Event Promotional Video'}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {(isAr ? [
                      { label: 'الهدف', text: 'إنتاج فيديو ترويجي قصير انطلاقًا من موجز يتضمن هدف الفعالية وفكرة مستوحاة من أجواء المطار.' },
                      { label: 'الدور', text: 'التنفيذ بشكل كامل، بما يشمل تطوير الفكرة الإبداعية، والتوجيه البصري، وتنظيم المحتوى، والمونتاج، واختيار المؤثرات الصوتية.' },
                      { label: 'آلية العمل', text: 'تطوير التوجه الإبداعي انطلاقًا من الموجز الأولي، وبناء التسلسل البصري، وإعداد المحتوى الترويجي، ومونتاج المشاهد النهائية، واختيار التصميم الصوتي المناسب.' },
                      { label: 'النتيجة', text: 'إنتاج فيديو ترويجي متكامل تم تسليمه للاستخدام المؤسسي.' },
                    ] : [
                      { label: 'OBJECTIVE', text: 'Produce a short promotional video from a brief covering only the event purpose and an airport theme.' },
                      { label: 'ROLE', text: 'Sole creator — creative concept, visual direction, content structuring, editing, and sound selection.' },
                      { label: 'PROCESS', text: 'Developed the creative direction from the initial brief, structured the visual narrative, created the promotional content, edited the final sequence, and selected the supporting sound design.' },
                      { label: 'RESULT', text: 'Complete standalone promotional video delivered for institutional use.' },
                    ]).map(row => (
                      <div key={row.label}>
                        <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 8.5, letterSpacing: isAr ? 0 : '.15em', color: 'rgba(196,170,255,.45)', display: 'block', marginBottom: 2 }}>{row.label}</span>
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: 'rgba(221,205,255,.76)', lineHeight: 1.62 }}>{row.text}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 8.5, letterSpacing: isAr ? 0 : '.15em', color: 'rgba(196,170,255,.45)', marginBottom: 7 }}>{isAr ? 'الأدوات' : 'TOOLS'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['Canva', 'Adobe Express', 'Gemini', 'ChatGPT'].map(t => <SmallToolTag key={t} label={t} />)}
                    </div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); playVideo('cyber') }}
                    onMouseEnter={() => setCyberBtnHov(true)}
                    onMouseLeave={() => setCyberBtnHov(false)}
                    style={{
                      marginTop: 4,
                      padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                      background: activeVideo === 'cyber'
                        ? 'linear-gradient(135deg, rgba(155,114,207,.30), rgba(255,179,230,.14))'
                        : cyberBtnHov
                        ? 'linear-gradient(135deg, rgba(155,114,207,.22), rgba(255,179,230,.12))'
                        : 'rgba(83,43,136,.16)',
                      border: `1px solid ${activeVideo === 'cyber' ? 'rgba(255,179,230,.65)' : cyberBtnHov ? 'rgba(255,179,230,.52)' : 'rgba(196,170,255,.30)'}`,
                      boxShadow: cyberBtnHov && activeVideo !== 'cyber'
                        ? 'inset 0 0 22px rgba(255,179,230,.16), inset 0 0 14px rgba(155,114,207,.12), 0 6px 24px rgba(255,179,230,.18), 0 0 14px rgba(155,114,207,.14)'
                        : activeVideo === 'cyber'
                        ? '0 0 20px rgba(255,179,230,.20), inset 0 0 16px rgba(255,179,230,.10)'
                        : 'none',
                      fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.1em',
                      color: 'rgba(255,218,240,.92)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all .40s cubic-bezier(.22,1,.36,1)',
                      transform: cyberBtnHov && activeVideo !== 'cyber' ? 'translateY(-3px) scale(1.015)' : 'none',
                    }}
                  >
                    <span style={{ color: 'rgba(232,194,125,.85)', fontSize: 11 }}>▶</span>
                    {activeVideo === 'cyber' ? (isAr ? 'يُشغَّل الآن' : 'Now Playing') : (isAr ? 'تشغيل الفيديو' : 'Play Video')}
                  </button>
                </div>
              </div>

              {/* Project 2 — Guardianship */}
              <div
                onMouseEnter={() => setGuardianCardHov(true)}
                onMouseLeave={() => setGuardianCardHov(false)}
                onClick={() => setGuardianModalOpen(true)}
                style={{
                  borderRadius: 16, overflow: 'hidden',
                  border: activeVideo === 'guardian' ? '1.5px solid rgba(255,179,230,.62)' : guardianCardHov ? '1.5px solid rgba(255,179,230,.45)' : '1px solid rgba(196,170,255,.22)',
                  boxShadow: activeVideo === 'guardian'
                    ? '0 0 36px rgba(255,179,230,.22), 0 0 22px rgba(155,114,207,.20), 0 8px 32px rgba(0,0,0,.45)'
                    : guardianCardHov
                    ? '0 16px 52px rgba(0,0,0,.50), 0 0 36px rgba(255,179,230,.22), 0 0 22px rgba(155,114,207,.18), inset 0 0 28px rgba(255,179,230,.08)'
                    : '0 8px 32px rgba(0,0,0,.35)',
                  background: guardianCardHov
                    ? 'linear-gradient(145deg, rgba(18,6,44,.96), rgba(28,8,58,.98))'
                    : 'linear-gradient(145deg, rgba(12,4,30,.92), rgba(22,8,48,.95))',
                  transition: 'border-color .40s cubic-bezier(.22,1,.36,1), box-shadow .40s ease, background .40s ease, transform .40s cubic-bezier(.22,1,.36,1)',
                  transform: guardianCardHov ? 'translateY(-4px) scale(1.015)' : 'none',
                  display: 'flex', flexDirection: 'column',
                  cursor: 'pointer',
                }}>
                {/* Cover */}
                <div style={{
                  height: 160, position: 'relative',
                  background: 'linear-gradient(135deg, rgba(14,4,36,.95) 0%, rgba(28,8,60,.90) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: activeVideo === 'guardian' ? 'radial-gradient(ellipse at 50% 40%, rgba(255,179,230,.12), rgba(155,114,207,.08) 60%, transparent)' : guardianCardHov ? 'radial-gradient(ellipse at 50% 40%, rgba(255,179,230,.07), transparent 70%)' : 'rgba(83,43,136,.04)', transition: 'background .40s' }} />
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .06 }} viewBox="0 0 400 160" preserveAspectRatio="none">
                    {[0,40,80,120,160,200,240,280,320,360,400].map((x,i) => <line key={i} x1={x} y1="0" x2={x-80} y2="160" stroke="#c8b1e4" strokeWidth="1"/>)}
                  </svg>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%',
                    background: 'rgba(180,80,160,.16)', border: '1.5px solid rgba(255,179,230,.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 22px rgba(255,179,230,.22)', position: 'relative', zIndex: 1,
                  }}>
                    <span style={{ fontSize: 20 }}>⚖️</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: 10, left: 12, zIndex: 1 }}>
                    <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 8.5, letterSpacing: isAr ? 0 : '.14em', color: 'rgba(253,230,138,.85)', background: 'rgba(0,0,0,.5)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(253,230,138,.28)' }}>{isAr ? 'فيديو تعليمي' : 'EDUCATIONAL VIDEO'}</span>
                  </div>
                  {activeVideo === 'guardian' && (
                    <div style={{ position: 'absolute', top: 10, right: 12, zIndex: 1, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffb3e6', display: 'inline-block', boxShadow: '0 0 7px rgba(255,179,230,.80)' }} />
                      <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 8, color: 'rgba(255,218,240,.92)', letterSpacing: isAr ? 0 : '.1em' }}>{isAr ? 'يُشغَّل' : 'PLAYING'}</span>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '20px 22px 22px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(253,230,138,.55)', marginBottom: 5 }}>{isAr ? 'المشروع الثاني' : 'PROJECT 02'}</p>
                    <h3 style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 14, color: 'rgba(235,220,255,.95)', lineHeight: 1.42, marginBottom: 0 }}>
                      {isAr ? 'الولاية والوصاية' : 'Guardianship and Custodianship'}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                    {(isAr ? [
                      { label: 'الهدف', text: 'تحويل مادة تفصيلية من مقرر نظام الأحوال الشخصية إلى فيديو تعليمي واضح وسهل الفهم.' },
                      { label: 'الدور', text: 'تحليل المحتوى، وإعداد النص التعليمي، والتصميم البصري، وإنتاج التعليق الصوتي بمساعدة الذكاء الاصطناعي، والمونتاج، والإنتاج النهائي.' },
                      { label: 'آلية العمل', text: 'اختيار المفاهيم القانونية الأساسية وتبسيطها، وإعداد النص، وتصميم العناصر المرئية، وإنتاج التعليق الصوتي، ثم تنفيذ المونتاج النهائي.' },
                      { label: 'النتيجة', text: 'تحويل محتوى المقرر إلى فيديو تعليمي منظم وواضح.' },
                    ] : [
                      { label: 'OBJECTIVE', text: 'Transform detailed Personal Status Law course material into an accessible educational video.' },
                      { label: 'ROLE', text: 'Content analysis, educational scriptwriting, visual design, AI-assisted voice-over, editing, and final production.' },
                      { label: 'PROCESS', text: 'Selected and simplified key legal concepts, developed an educational script, designed visuals, produced AI-assisted voice-over, and edited the final video.' },
                      { label: 'RESULT', text: 'Course material delivered as a structured educational video.' },
                    ]).map(row => (
                      <div key={row.label}>
                        <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 8.5, letterSpacing: isAr ? 0 : '.15em', color: 'rgba(196,170,255,.45)', display: 'block', marginBottom: 2 }}>{row.label}</span>
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12.5, color: 'rgba(221,205,255,.76)', lineHeight: 1.62 }}>{row.text}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 8.5, letterSpacing: isAr ? 0 : '.15em', color: 'rgba(196,170,255,.45)', marginBottom: 7 }}>{isAr ? 'الأدوات' : 'TOOLS'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {['Canva', 'PowerPoint', 'ElevenLabs', 'ChatGPT', 'Gemini', 'Copilot'].map(t => <SmallToolTag key={t} label={t} />)}
                    </div>
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); playVideo('guardian') }}
                    onMouseEnter={() => setGuardianBtnHov(true)}
                    onMouseLeave={() => setGuardianBtnHov(false)}
                    style={{
                      marginTop: 4,
                      padding: '10px 0', borderRadius: 8, cursor: 'pointer',
                      background: activeVideo === 'guardian'
                        ? 'linear-gradient(135deg, rgba(155,114,207,.30), rgba(255,179,230,.14))'
                        : guardianBtnHov
                        ? 'linear-gradient(135deg, rgba(155,114,207,.22), rgba(255,179,230,.12))'
                        : 'rgba(83,43,136,.16)',
                      border: `1px solid ${activeVideo === 'guardian' ? 'rgba(255,179,230,.65)' : guardianBtnHov ? 'rgba(255,179,230,.52)' : 'rgba(196,170,255,.30)'}`,
                      boxShadow: guardianBtnHov && activeVideo !== 'guardian'
                        ? 'inset 0 0 22px rgba(255,179,230,.16), inset 0 0 14px rgba(155,114,207,.12), 0 6px 24px rgba(255,179,230,.18), 0 0 14px rgba(155,114,207,.14)'
                        : activeVideo === 'guardian'
                        ? '0 0 20px rgba(255,179,230,.20), inset 0 0 16px rgba(255,179,230,.10)'
                        : 'none',
                      fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.1em',
                      color: 'rgba(255,218,240,.92)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      transition: 'all .40s cubic-bezier(.22,1,.36,1)',
                      transform: guardianBtnHov && activeVideo !== 'guardian' ? 'translateY(-3px) scale(1.015)' : 'none',
                    }}
                  >
                    <span style={{ color: 'rgba(232,194,125,.85)', fontSize: 11 }}>▶</span>
                    {activeVideo === 'guardian' ? (isAr ? 'يُشغَّل الآن' : 'Now Playing') : (isAr ? 'تشغيل الفيديو' : 'Play Video')}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Project expand modals ── */}
            {cyberModalOpen && (
              <SectionModal title={isAr ? `المشروع الأول — ${t.pp_featuredTitle}` : "PROJECT 01 — FEATURED WORK"} onClose={closeCyberModal}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(83,43,136,.22)', border: '1.5px solid rgba(200,177,228,.38)', boxShadow: '0 0 18px rgba(155,114,207,.20)', fontSize: 22 }}>🛡️</div>
                    <div>
                      <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(253,230,138,.55)', display: 'block', marginBottom: 5 }}>{isAr ? 'فيديو ترويجي' : 'PROMOTIONAL VIDEO'}</span>
                      <h3 style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 20, color: 'rgba(235,220,255,.95)', lineHeight: 1.35 }}>{isAr ? 'فيديو ترويجي لفعالية الأمن السيبراني' : 'Cybersecurity Event Promotional Video'}</h3>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,179,230,.28), rgba(200,177,228,.22), transparent)' }} />
                  {/* Detail rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {(isAr ? [
                      { label: 'الهدف', text: 'إنتاج فيديو ترويجي قصير انطلاقًا من موجز يتضمن هدف الفعالية وفكرة مستوحاة من أجواء المطار.' },
                      { label: 'الدور', text: 'التنفيذ بشكل كامل، بما يشمل تطوير الفكرة الإبداعية، والتوجيه البصري، وتنظيم المحتوى، والمونتاج، واختيار المؤثرات الصوتية.' },
                      { label: 'آلية العمل', text: 'تطوير التوجه الإبداعي انطلاقًا من الموجز الأولي، وبناء التسلسل البصري، وإعداد المحتوى الترويجي، ومونتاج المشاهد النهائية، واختيار التصميم الصوتي المناسب.' },
                      { label: 'النتيجة', text: 'إنتاج فيديو ترويجي متكامل تم تسليمه للاستخدام المؤسسي.' },
                    ] : [
                      { label: 'OBJECTIVE', text: 'Produce a short promotional video from a brief covering only the event purpose and an airport theme.' },
                      { label: 'ROLE', text: 'Sole creator — creative concept, visual direction, content structuring, editing, and sound selection.' },
                      { label: 'PROCESS', text: 'Developed the creative direction from the initial brief, structured the visual narrative, created the promotional content, edited the final sequence, and selected the supporting sound design.' },
                      { label: 'RESULT', text: 'Complete standalone promotional video delivered for institutional use.' },
                    ]).map(row => (
                      <div key={row.label} style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(83,43,136,.10)', border: '1px solid rgba(196,170,255,.10)' }}>
                        <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(196,170,255,.48)', display: 'block', marginBottom: 6 }}>{row.label}</span>
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14.5, color: 'rgba(221,205,255,.84)', lineHeight: 1.72 }}>{row.text}</span>
                      </div>
                    ))}
                  </div>
                  {/* Tools */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(196,170,255,.48)', marginBottom: 12 }}>{isAr ? 'الأدوات' : 'TOOLS'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['Canva', 'Adobe Express', 'Gemini', 'ChatGPT'].map(t => <SmallToolTag key={t} label={t} />)}
                    </div>
                  </div>
                  {/* Play button */}
                  <PlayVideoBtn which="cyber" activeVideo={activeVideo} onPlay={() => { playVideo('cyber'); closeCyberModal() }} />
                </div>
              </SectionModal>
            )}
            {guardianModalOpen && (
              <SectionModal title={isAr ? `المشروع الثاني — ${t.pp_featuredTitle}` : "PROJECT 02 — FEATURED WORK"} onClose={closeGuardianModal}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(180,80,160,.14)', border: '1.5px solid rgba(255,179,230,.40)', boxShadow: '0 0 18px rgba(255,179,230,.16)', fontSize: 22 }}>⚖️</div>
                    <div>
                      <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(253,230,138,.55)', display: 'block', marginBottom: 5 }}>{isAr ? 'فيديو تعليمي' : 'EDUCATIONAL VIDEO'}</span>
                      <h3 style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 20, color: 'rgba(235,220,255,.95)', lineHeight: 1.35 }}>{isAr ? 'الولاية والوصاية' : 'Guardianship and Custodianship'}</h3>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,179,230,.28), rgba(200,177,228,.22), transparent)' }} />
                  {/* Detail rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {(isAr ? [
                      { label: 'الهدف', text: 'تحويل مادة تفصيلية من مقرر نظام الأحوال الشخصية إلى فيديو تعليمي واضح وسهل الفهم.' },
                      { label: 'الدور', text: 'تحليل المحتوى، وإعداد النص التعليمي، والتصميم البصري، وإنتاج التعليق الصوتي بمساعدة الذكاء الاصطناعي، والمونتاج، والإنتاج النهائي.' },
                      { label: 'آلية العمل', text: 'اختيار المفاهيم القانونية الأساسية وتبسيطها، وإعداد النص، وتصميم العناصر المرئية، وإنتاج التعليق الصوتي، ثم تنفيذ المونتاج النهائي.' },
                      { label: 'النتيجة', text: 'تحويل محتوى المقرر إلى فيديو تعليمي منظم وواضح.' },
                    ] : [
                      { label: 'OBJECTIVE', text: 'Transform detailed Personal Status Law course material into an accessible educational video.' },
                      { label: 'ROLE', text: 'Content analysis, educational scriptwriting, visual design, AI-assisted voice-over, editing, and final production.' },
                      { label: 'PROCESS', text: 'Selected and simplified key legal concepts, developed an educational script, designed visuals, produced AI-assisted voice-over, and edited the final video.' },
                      { label: 'RESULT', text: 'Course material delivered as a structured educational video.' },
                    ]).map(row => (
                      <div key={row.label} style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(83,43,136,.10)', border: '1px solid rgba(196,170,255,.10)' }}>
                        <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(196,170,255,.48)', display: 'block', marginBottom: 6 }}>{row.label}</span>
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 14.5, color: 'rgba(221,205,255,.84)', lineHeight: 1.72 }}>{row.text}</span>
                      </div>
                    ))}
                  </div>
                  {/* Tools */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(196,170,255,.48)', marginBottom: 12 }}>{isAr ? 'الأدوات' : 'TOOLS'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {['Canva', 'PowerPoint', 'ElevenLabs', 'ChatGPT', 'Gemini', 'Copilot'].map(t => <SmallToolTag key={t} label={t} />)}
                    </div>
                  </div>
                  {/* Play button */}
                  <PlayVideoBtn which="guardian" activeVideo={activeVideo} onPlay={() => { playVideo('guardian'); closeGuardianModal() }} />
                </div>
              </SectionModal>
            )}

            {/* Shared video player */}
            {activeVideo ? (
              <Card accent="rgba(196,170,255,.2)" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <GlowDot color="#c4aaff" size={7} />
                  <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.15em', color: 'rgba(196,170,255,.65)', flex: 1 }}>
                    {activeVideo === 'cyber'
                      ? (isAr ? 'فيديو ترويجي لفعالية الأمن السيبراني' : 'Cybersecurity Event Promotional Video')
                      : (isAr ? 'الولاية والوصاية' : 'Guardianship and Custodianship')}
                  </span>
                  <button
                    onClick={closeVideo}
                    style={{
                      background: 'none', border: '1px solid rgba(196,170,255,.25)',
                      borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
                      color: 'rgba(196,170,255,.5)', fontSize: 11,
                      fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", letterSpacing: isAr ? 0 : '.08em',
                    }}
                  >{isAr ? '✕ إغلاق' : '✕ close'}</button>
                </div>
                <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: 10, overflow: 'hidden', background: '#000' }}>
                  {embedSrc && (
                    <iframe
                      key={embedSrc}
                      src={embedSrc}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', borderRadius: 10 }}
                      title={activeVideo === 'cyber' ? 'Cybersecurity Event Promotional Video' : 'Guardianship and Custodianship'}
                    />
                  )}
                  <a
                    href={`https://www.youtube.com/watch?v=${activeVideo === 'cyber' ? 'gZVfhWyDXL8' : 'L3bjSK_mgkk'}`}
                    target="_blank"
                    rel="noopener"
                    style={{
                      position: 'absolute', bottom: 12, right: 12,
                      background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(196,170,255,.3)', borderRadius: 7,
                      padding: '6px 13px', textDecoration: 'none',
                      fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: '.08em',
                      color: 'rgba(196,170,255,.85)',
                      display: 'flex', alignItems: 'center', gap: 6, zIndex: 2,
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,80,80,.9)"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    Watch on YouTube
                  </a>
                </div>
              </Card>
            ) : (
              <p style={{ fontFamily: "'Lora', serif", fontStyle: 'italic', fontSize: 13, color: 'rgba(196,170,255,.35)', textAlign: 'center', padding: '8px 0' }}>
                Select a project above to watch the video
              </p>
            )}
          </section>

          {/* ── TECHNICAL CONTRIBUTION ── */}
          <section style={{ paddingTop: 40, paddingBottom: 40, borderRadius: 20, position: 'relative', background: 'linear-gradient(160deg, rgba(31,26,58,.55) 0%, rgba(30,8,60,.40) 50%, rgba(15,4,35,.20) 100%)', margin: '0 -8px', padding: '40px 8px', overflow: 'hidden' }}>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: '10%', right: '5%', width: 300, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,114,207,.16) 0%, transparent 70%)', filter: 'blur(46px)' }} />
              <div style={{ position: 'absolute', bottom: '8%', left: '10%', width: 260, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.09) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            </div>
            <SectionTitle label={`05 — ${t.pp_techLabel}`} title={t.pp_techTitle} accent="#c4aaff" />
            <div onClick={() => setTechOpen(true)} style={{ cursor: 'pointer' }}>
              <Card accent="rgba(196,170,255,.26)">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 22 }}>⚙️</span>
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.14em', color: 'rgba(253,230,138,.58)', marginBottom: 3 }}>{isAr ? 'الخدمة 8' : 'SERVICE 8'}</p>
                    <h3 style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 15.5, color: 'rgba(235,220,255,.95)', lineHeight: 1.3 }}>
                      {isAr ? 'خدمة مراجعة المحتوى الرقمي وطلب التعديلات' : 'Digital Content Review and Revisions Service'}
                    </h3>
                  </div>
                </div>
                <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 13.5, color: 'rgba(221,205,255,.78)', lineHeight: 1.8, marginBottom: 18 }}>
                  {isAr
                    ? 'تم بناء واختبار خدمة لمراجعة المحتوى وطلب التعديلات ضمن منصة لإدارة المحتوى الرقمي. شمل العمل معايير تقييم منظمة، واتخاذ قرارات تلقائية بالموافقة أو طلب التعديل، وتحديث حالات الطلبات، وإجراء تعديلات على قاعدة البيانات، واختبار سير العمل، واستكمال عملية طلب السحب والدمج عبر GitHub.'
                    : 'Built and tested a review-and-revisions service for a digital content management platform. The work included structured evaluation criteria, automatic approval and revision decisions, request-status updates, database changes, workflow testing, and completing the GitHub pull-request and merge process.'}
                </p>
                <div style={{ marginBottom: 18 }}>
                  <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.16em', color: 'rgba(196,170,255,.50)', marginBottom: 10 }}>{isAr ? 'التقنيات' : 'TECHNOLOGIES'}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {['C#', 'ASP.NET Core', 'Entity Framework Core', 'Swagger', 'GitHub', 'Visual Studio'].map(tech => (
                      <TechBadge key={tech} label={tech} />
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.16em', color: 'rgba(196,170,255,.50)', marginBottom: 10 }}>{isAr ? 'المساهمات' : 'CONTRIBUTIONS'}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                    {(isAr
                      ? ['سير عمل المراجعة', 'منطق اتخاذ القرار', 'تحديث حالات الطلبات', 'تعديلات قاعدة البيانات', 'اختبار واجهات API', 'طلب السحب والدمج']
                      : ['Review Workflow', 'Decision Logic', 'Status Updates', 'Database Changes', 'API Testing', 'Pull Request and Merge']
                    ).map(item => (
                      <ContribPill key={item} label={item} />
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderTop: '1px solid rgba(196,170,255,.08)', paddingTop: 12 }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '.16em', color: 'rgba(196,170,230,.36)' }}>{t.pp_expandHint}</span>
                </div>
              </Card>
            </div>
            {techOpen && (
              <SectionModal title={t.pp_techTitle} onClose={closeTech}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(83,43,136,.22)', border: '1px solid rgba(200,177,228,.28)', boxShadow: '0 0 22px rgba(155,114,207,.16)', flexShrink: 0, fontSize: 26 }}>⚙️</div>
                    <div>
                      <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.16em', color: 'rgba(253,230,138,.60)', marginBottom: 5 }}>{isAr ? 'الخدمة 8' : 'SERVICE 8'}</p>
                      <h3 style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 19, color: 'rgba(235,220,255,.95)', lineHeight: 1.32 }}>{isAr ? 'خدمة مراجعة المحتوى الرقمي وطلب التعديلات' : 'Digital Content Review and Revisions Service'}</h3>
                    </div>
                  </div>
                  {/* Description */}
                  <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 15, color: 'rgba(221,205,255,.82)', lineHeight: 1.90 }}>
                    {isAr
                      ? 'تم بناء واختبار خدمة لمراجعة المحتوى وطلب التعديلات ضمن منصة لإدارة المحتوى الرقمي. شمل العمل معايير تقييم منظمة، واتخاذ قرارات تلقائية بالموافقة أو طلب التعديل، وتحديث حالات الطلبات، وإجراء تعديلات على قاعدة البيانات، واختبار سير العمل، واستكمال عملية طلب السحب والدمج عبر GitHub.'
                      : 'Built and tested a review-and-revisions service for a digital content management platform. The work included structured evaluation criteria, automatic approval and revision decisions, request-status updates, database changes, workflow testing, and completing the GitHub pull-request and merge process.'}
                  </p>
                  <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,170,255,.28), rgba(255,179,230,.18), transparent)' }} />
                  {/* Technologies */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.22em', color: 'rgba(196,170,255,.58)', marginBottom: 16 }}>{isAr ? 'التقنيات' : 'TECHNOLOGIES'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      {['C#', 'ASP.NET Core', 'Entity Framework Core', 'Swagger', 'GitHub', 'Visual Studio'].map(tech => (
                        <TechBadge key={tech} label={tech} />
                      ))}
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,170,255,.18), transparent)' }} />
                  {/* Contributions */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 10, letterSpacing: isAr ? 0 : '.22em', color: 'rgba(196,170,255,.58)', marginBottom: 16 }}>{isAr ? 'المساهمات' : 'CONTRIBUTIONS'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                      {(isAr
                        ? ['سير عمل المراجعة', 'منطق اتخاذ القرار', 'تحديث حالات الطلبات', 'تعديلات قاعدة البيانات', 'اختبار واجهات API', 'طلب السحب والدمج']
                        : ['Review Workflow', 'Decision Logic', 'Status Updates', 'Database Changes', 'API Testing', 'Pull Request and Merge']
                      ).map(item => (
                        <ContribPill key={item} label={item} />
                      ))}
                    </div>
                  </div>
                </div>
              </SectionModal>
            )}
          </section>

          {/* ── ACADEMIC PROJECTS ── */}
          <section style={{ paddingTop: 40, paddingBottom: 40, position: 'relative' }}>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 24 }}>
              <div style={{ position: 'absolute', top: '5%', right: '5%', width: 240, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,194,125,.08) 0%, transparent 70%)', filter: 'blur(38px)' }} />
              <div style={{ position: 'absolute', bottom: '5%', left: '8%', width: 220, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.08) 0%, transparent 70%)', filter: 'blur(34px)' }} />
            </div>
            <SectionTitle label={`06 — ${t.pp_projLabel}`} title={t.pp_projTitle} accent="#fde68a" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {(isAr ? [
                { icon: '👗', title: 'نظام التعرّف على الملابس باستخدام الذكاء الاصطناعي', desc: 'مشروع نظم معلومات يطبق الذكاء الاصطناعي للتصنيف الآلي للملابس.' },
                { icon: '🤝', title: 'نظام مواءمة فرص التدريب', desc: 'منصة مفاهيمية مصممة لربط الطلاب بفرص التدريب المناسبة.' },
                { icon: '🛒', title: 'موقع للتجارة الإلكترونية', desc: 'تطبيق ويب وظيفي للتجارة الإلكترونية طُوِّر كمشروع مقررات.' },
                { icon: '🏠', title: 'نظام عقاري', desc: 'نظام معلومات لإدارة القوائم العقارية والمعاملات.' },
              ] : [
                { icon: '👗', title: 'AI Clothing Identification System', desc: 'An information systems project applying AI for automated clothing classification.' },
                { icon: '🤝', title: 'Internship Matching System', desc: 'A platform concept designed to connect students with internship opportunities.' },
                { icon: '🛒', title: 'E-commerce Website', desc: 'A functional e-commerce web application developed as a course project.' },
                { icon: '🏠', title: 'Real Estate System', desc: 'An information system for managing real estate listings and transactions.' },
              ]).map(proj => (
                <ProjectCard key={proj.title} icon={proj.icon} title={proj.title} desc={proj.desc} />
              ))}
            </div>
          </section>

          {/* ── SKILLS ── */}
          <section ref={el => { sectionRefs.current['Skills'] = el }} style={{ paddingTop: 40, paddingBottom: 40, position: 'relative' }}>
            {/* Section atmosphere: lighter purple with pink radial highlights */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 24 }}>
              <div style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 200, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,179,230,.10) 0%, transparent 70%)', filter: 'blur(48px)' }} />
              <div style={{ position: 'absolute', bottom: '0%', right: '10%', width: 220, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,114,207,.12) 0%, transparent 70%)', filter: 'blur(36px)' }} />
            </div>
            <SectionTitle label={`07 — ${t.pp_skillsLabel}`} title={t.pp_skillsTitle} accent="#c4aaff" />
            <div onClick={() => setSkillsOpen(true)} style={{ cursor: 'pointer' }}>
              <Card>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  {/* Hard Skills group */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(255,179,230,.42)', marginBottom: 10 }}>
                      {isAr ? 'المهارات الصلبة' : 'Hard Skills'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                      {(isAr
                        ? ['إنتاج المحتوى الرقمي', 'تطوير المحتوى التعليمي', 'مونتاج الفيديو', 'تحليل المحتوى وتبسيطه', 'كتابة النصوص', 'التسويق الرقمي', 'إنشاء المحتوى بمساعدة الذكاء الاصطناعي']
                        : ['Digital Content Production', 'Educational Content Development', 'Video Editing', 'Content Analysis and Simplification', 'Scriptwriting', 'Digital Marketing', 'AI-Assisted Content Creation']
                      ).map(s => <SkillTag key={s} label={s} />)}
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,179,230,.14), rgba(196,170,255,.10), transparent)' }} />
                  {/* Soft Skills group */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9, letterSpacing: isAr ? 0 : '.18em', color: 'rgba(255,179,230,.42)', marginBottom: 10 }}>
                      {isAr ? 'المهارات الناعمة' : 'Soft Skills'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9 }}>
                      {(isAr
                        ? ['الإبداع والابتكار', 'مهارات البحث', 'حل المشكلات', 'الاهتمام بالتفاصيل', 'إدارة الوقت', 'التفكير النقدي', 'التفكير التحليلي']
                        : ['Creativity and Innovation', 'Research Skills', 'Problem Solving', 'Attention to Detail', 'Time Management', 'Critical Thinking', 'Analytical Thinking']
                      ).map(s => <SkillTag key={s} label={s} />)}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderTop: '1px solid rgba(196,170,255,.08)', paddingTop: 12 }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '.16em', color: 'rgba(255,179,230,.38)' }}>{t.pp_expandHint}</span>
                </div>
              </Card>
            </div>
            {skillsOpen && (
              <SectionModal title={t.pp_skillsTitle} onClose={closeSkills}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {/* Hard Skills group */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.20em', color: 'rgba(255,179,230,.48)', marginBottom: 16 }}>{isAr ? 'المهارات الصلبة' : 'Hard Skills'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                      {(isAr
                        ? ['إنتاج المحتوى الرقمي', 'تطوير المحتوى التعليمي', 'مونتاج الفيديو', 'تحليل المحتوى وتبسيطه', 'كتابة النصوص', 'التسويق الرقمي', 'إنشاء المحتوى بمساعدة الذكاء الاصطناعي']
                        : ['Digital Content Production', 'Educational Content Development', 'Video Editing', 'Content Analysis and Simplification', 'Scriptwriting', 'Digital Marketing', 'AI-Assisted Content Creation']
                      ).map(s => <SkillTag key={s} label={s} />)}
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,179,230,.18), rgba(200,177,228,.14), transparent)' }} />
                  {/* Soft Skills group */}
                  <div>
                    <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.20em', color: 'rgba(255,179,230,.48)', marginBottom: 16 }}>{isAr ? 'المهارات الناعمة' : 'Soft Skills'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                      {(isAr
                        ? ['الإبداع والابتكار', 'مهارات البحث', 'حل المشكلات', 'الاهتمام بالتفاصيل', 'إدارة الوقت', 'التفكير النقدي', 'التفكير التحليلي']
                        : ['Creativity and Innovation', 'Research Skills', 'Problem Solving', 'Attention to Detail', 'Time Management', 'Critical Thinking', 'Analytical Thinking']
                      ).map(s => <SkillTag key={s} label={s} />)}
                    </div>
                  </div>
                </div>
              </SectionModal>
            )}
          </section>

          {/* ── TOOLS ── */}
          <section style={{ paddingTop: 40, paddingBottom: 40, borderRadius: 20, position: 'relative', background: 'linear-gradient(180deg, rgba(31,26,58,.50) 0%, rgba(20,5,50,.28) 60%, transparent 100%)', margin: '0 -8px', padding: '40px 8px', overflow: 'hidden' }}>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: '5%', right: '8%', width: 280, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.11) 0%, transparent 70%)', filter: 'blur(42px)' }} />
              <div style={{ position: 'absolute', bottom: '5%', left: '5%', width: 240, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,114,207,.12) 0%, transparent 70%)', filter: 'blur(38px)' }} />
            </div>
            <SectionTitle label={`08 — ${t.pp_toolsLabel}`} title={t.pp_toolsTitle} accent="#fde68a" />
            <div onClick={() => setToolsOpen(true)} style={{ cursor: 'pointer' }}>
              <Card accent="rgba(253,230,138,.18)">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
                  {[
                    { name: 'Canva', emoji: '🎨' },
                    { name: 'PowerPoint', emoji: '📊' },
                    { name: 'ChatGPT', emoji: '🤖' },
                    { name: 'Gemini', emoji: '💎' },
                    { name: 'Copilot', emoji: '🤝' },
                    { name: 'ElevenLabs', emoji: '🎙️' },
                    { name: 'Adobe Express', emoji: '✨' },
                    { name: 'Visual Studio', emoji: '💻' },
                    { name: 'GitHub', emoji: '🐙' },
                  ].map(t => <ToolBadge key={t.name} {...t} />)}
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, borderTop: '1px solid rgba(253,230,138,.08)', paddingTop: 12 }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 8.5, letterSpacing: '.16em', color: 'rgba(253,230,138,.36)' }}>{t.pp_expandHint}</span>
                </div>
              </Card>
            </div>
            {toolsOpen && (
              <SectionModal title={t.pp_toolsTitle} accent="#fde68a" onClose={closeTools}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 20 }}>
                  {[
                    { name: 'Canva', emoji: '🎨' },
                    { name: 'PowerPoint', emoji: '📊' },
                    { name: 'ChatGPT', emoji: '🤖' },
                    { name: 'Gemini', emoji: '💎' },
                    { name: 'Copilot', emoji: '🤝' },
                    { name: 'ElevenLabs', emoji: '🎙️' },
                    { name: 'Adobe Express', emoji: '✨' },
                    { name: 'Visual Studio', emoji: '💻' },
                    { name: 'GitHub', emoji: '🐙' },
                  ].map(t => <ToolBadge key={t.name} {...t} large />)}
                </div>
              </SectionModal>
            )}
          </section>

          {/* ── LEARNING & RECOGNITION ── */}
          <section ref={el => { sectionRefs.current['Recognition'] = el }} style={{ paddingTop: 40, paddingBottom: 40, position: 'relative' }}>
            {/* Section atmosphere: deep plum with rose and gold light */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 24 }}>
              <div style={{ position: 'absolute', top: '-10%', left: '15%', width: 380, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,179,230,.12) 0%, transparent 70%)', filter: 'blur(52px)' }} />
              <div style={{ position: 'absolute', top: '30%', right: '-5%', width: 280, height: 220, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,194,125,.08) 0%, transparent 70%)', filter: 'blur(44px)' }} />
              <div style={{ position: 'absolute', bottom: '-5%', left: '30%', width: 300, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(83,43,136,.20) 0%, transparent 70%)', filter: 'blur(48px)' }} />
            </div>
            <SectionTitle label={`10 — ${t.pp_learnLabel}`} title={t.pp_learnTitle} accent="#c4aaff" />

            {/* ── Certificate grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
              {([
                { title: 'From Idea to Interactive Prototype: Build Your First App Using Claude', arTitle: 'من الفكرة إلى نموذج تفاعلي: صمّم تطبيقك الأول باستخدام Claude بدون خبرة برمجية', type: 'Certificate', certSrc: claudeCert, isPdf: true },
                { title: 'Ethics of Artificial Intelligence and Data Governance', arTitle: 'أخلاقيات الذكاء الاصطناعي وحوكمة البيانات', type: 'Certificate', certSrc: aiEthicsCert, isPdf: true },
                { title: 'How to Protect Your Data in the Information Age?', arTitle: 'كيف تحمي بياناتك في عصر المعلومات؟', type: 'Certificate', certSrc: dataProtCert, isPdf: false },
                { title: 'Mental Health in the Workplace', arTitle: 'الصحة النفسية في بيئة العمل', type: 'Certificate', certSrc: mentalHealthCert, isPdf: true },
                { title: 'Self-Awareness and Development Methods', arTitle: 'إدراك الذات وأساليب تنميتها', type: 'Certificate', certSrc: selfAwarenessCert, isPdf: true },
              ] as Array<{ title: string; arTitle: string; type: string; certSrc: string; isPdf: boolean }>).map(item => {
                const displayTitle = isAr ? item.arTitle : item.title
                return (
                <CertCard
                  key={item.title}
                  title={displayTitle}
                  type={item.type}
                  onClick={() => setOpenCert({ title: displayTitle, src: item.certSrc, isPdf: item.isPdf })}
                />
              )})}
            </div>

            {/* ── Recognition divider ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(232,194,125,.30))' }} />
              <span style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9, letterSpacing: isAr ? 0 : '.22em', color: 'rgba(232,194,125,.52)' }}>{isAr ? '★ تكريم' : '★ RECOGNITION'}</span>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(232,194,125,.30), transparent)' }} />
            </div>

            {/* ── Recognition card — full width, visually distinguished ── */}
            <RecognitionCard
              onClick={() => setOpenCert({ title: isAr ? 'وسام جاهزية في تخصص نظم المعلومات' : 'Readiness Medal in Information Systems', src: uniReadinessRec, isPdf: true, isRecognition: true })}
            />
          </section>

          {/* ── CONTACT ── */}
          <section ref={el => { sectionRefs.current['Contact'] = el }} style={{ paddingTop: 40, paddingBottom: 60, borderRadius: 20, position: 'relative', background: 'linear-gradient(160deg, rgba(47,24,75,.55) 0%, rgba(31,26,58,.40) 50%, rgba(10,2,28,.28) 100%)', margin: '0 -8px', padding: '40px 8px 60px', overflow: 'hidden' }}>
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', top: '0%', left: '50%', transform: 'translateX(-50%)', width: 560, height: 220, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,179,230,.12) 0%, transparent 70%)', filter: 'blur(55px)' }} />
              <div style={{ position: 'absolute', bottom: '-10%', left: '10%', width: 320, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,114,207,.14) 0%, transparent 70%)', filter: 'blur(50px)' }} />
              <div style={{ position: 'absolute', bottom: '-5%', right: '10%', width: 260, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(83,43,136,.22) 0%, transparent 70%)', filter: 'blur(46px)' }} />
            </div>
            <SectionTitle label={`11 — ${t.pp_contactLabel}`} title={t.pp_contactTitle} accent="#c4aaff" />
            {/* Accent rule */}
            <div style={{ width: 160, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,179,230,.40), rgba(232,194,125,.50), rgba(255,179,230,.35), transparent)', margin: '0 auto 28px' }} />
            <ContactCards />
          </section>

        </div>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: '1px solid rgba(196,170,255,.1)',
          padding: '28px 24px',
          textAlign: 'center',
          background: 'rgba(5,0,16,.6)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            {/* Footer brand seal */}
            <div style={{ position: 'relative', width: 28, height: 28 }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '1px solid rgba(253,230,138,.22)',
                boxShadow: '0 0 7px rgba(139,92,246,.16)',
              }} />
              <div style={{
                position: 'absolute', inset: 3, borderRadius: '50%',
                border: '1px solid rgba(196,170,255,.22)',
              }} />
              <div style={{
                position: 'absolute', inset: 5, borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 35%, rgba(40,12,80,.7), rgba(8,1,20,.85))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                <img src={logoImg} alt="LM" style={{ width: 14, height: 14, objectFit: 'cover', borderRadius: '50%', clipPath: 'circle(50% at 50% 50%)', mixBlendMode: 'screen', filter: 'brightness(1.15) saturate(1.1)', opacity: .7 }} />
              </div>
            </div>
          </div>
          <p style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 13, color: 'rgba(196,170,255,.52)', marginBottom: 4 }}>
            Mildly Mysterious
          </p>
          <p style={{ fontFamily: isAr ? "'Nunito', sans-serif" : "'Lora', serif", fontStyle: isAr ? 'normal' : 'italic', fontSize: 12, color: 'rgba(196,170,255,.32)', marginBottom: 16 }}>
            {isAr ? 'مغامرة بنكهة اللافندر' : 'A Lavender-Tinted Adventure'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
            <button className="hov-btn" onClick={onMainMenu} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.12em',
              color: 'rgba(253,230,138,.38)', padding: 0,
            }}>
              {t.pp_returnMenu}
            </button>
            <span style={{ color: 'rgba(196,170,255,.2)', fontSize: 10 }}>·</span>
            <button className="hov-btn" onClick={onEnterGame} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: isAr ? "'Nunito', sans-serif" : "'Cinzel', serif", fontSize: 9.5, letterSpacing: isAr ? 0 : '.12em',
              color: 'rgba(196,170,255,.38)', padding: 0,
            }}>
              {isAr ? '✦ وضع اللعبة' : '✦ Enter Game Mode'}
            </button>
          </div>
        </footer>
      </div>

      {/* ── Back to Top button ── */}
      <button
        aria-label={isAr ? 'العودة للأعلى' : 'Back to Top'}
        title={isAr ? 'العودة للأعلى' : 'Back to Top'}
        onMouseEnter={() => setBackTopHov(true)}
        onMouseLeave={() => { setBackTopHov(false); setBackTopPressed(false) }}
        onMouseDown={() => setBackTopPressed(true)}
        onMouseUp={() => setBackTopPressed(false)}
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        style={{
          position: 'fixed',
          bottom: 88,
          ...(isAr ? { left: 24 } : { right: 24 }),
          zIndex: 9998,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: backTopHov
            ? 'linear-gradient(145deg, rgba(60,28,110,.97), rgba(120,70,200,.94))'
            : 'linear-gradient(145deg, rgba(40,14,80,.94), rgba(83,43,136,.90))',
          border: `1.5px solid ${backTopHov ? 'rgba(255,179,230,.68)' : 'rgba(155,114,207,.40)'}`,
          boxShadow: backTopHov
            ? '0 6px 28px rgba(83,43,136,.60), 0 0 20px rgba(255,179,230,.30), 0 0 0 1px rgba(255,179,230,.18)'
            : '0 4px 16px rgba(83,43,136,.44), 0 0 0 1px rgba(155,114,207,.12)',
          color: 'rgba(255,240,255,.96)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: showBackTop ? 1 : 0,
          pointerEvents: showBackTop ? 'auto' : 'none',
          transition: 'opacity .40s cubic-bezier(.22,1,.36,1), transform .40s cubic-bezier(.22,1,.36,1), box-shadow .40s, border-color .40s, background .40s',
          transform: backTopPressed
            ? 'translateY(1px) scale(0.96)'
            : backTopHov
            ? 'translateY(-2.5px) scale(1.06)'
            : 'none',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* Certificate / recognition modal */}
      {openCert && <CertificateModal entry={openCert} onClose={closeCert} />}
    </div>
  )
}
