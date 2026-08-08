// Web Audio API sound engine — interaction SFX only.
// Background audio is handled by the HTML <audio> soundtrack (initSoundtrack).
//
// Gain routing:
//   AudioContext.destination
//     └── masterGain  (mute: 0 | 1)
//          └── sfxOut  (all interaction sound effects)

export type AmbientType =
  | 'opening' | 'garden' | 'portrait' | 'cabinet'
  | 'studio' | 'workshop' | 'gallery' | 'final-door'

const LS_MUTED   = 'mm_muted'
const LS_SFX_VOL = 'mm_sfxVol'

// ─────────────────────────────────────────────────────────────────────────────

class AudioEngine {
  private _ctx: AudioContext | null = null
  private masterGain!: GainNode
  private sfxOut!:     GainNode

  private _muted:  boolean
  private _sfxVol: number

  // Global soundtrack (uploaded MP3)
  private _bgAudio: HTMLAudioElement | null = null
  private _bgTargetVol = 0.20

  constructor() {
    this._muted  = localStorage.getItem(LS_MUTED)  === 'true'
    this._sfxVol = parseFloat(localStorage.getItem(LS_SFX_VOL) ?? '0.55')
  }

  get muted()  { return this._muted  }
  get sfxVol() { return this._sfxVol }
  get ambVol() { return 0 }  // ambient removed; kept for call-site compatibility

  // ── Graph init (lazy, requires user gesture) ──────────────────────────────

  private get ctx(): AudioContext {
    if (!this._ctx) {
      this._ctx = new AudioContext()

      this.masterGain = this._ctx.createGain()
      this.masterGain.gain.value = this._muted ? 0 : 1
      this.masterGain.connect(this._ctx.destination)

      this.sfxOut = this._ctx.createGain()
      this.sfxOut.gain.value = this._sfxVol
      this.sfxOut.connect(this.masterGain)
    }
    if (this._ctx.state === 'suspended') this._ctx.resume()
    return this._ctx
  }

  // ── Controls ──────────────────────────────────────────────────────────────

  setMuted(v: boolean) {
    this._muted = v
    localStorage.setItem(LS_MUTED, String(v))
    if (this._ctx) this.masterGain.gain.value = v ? 0 : 1
    if (this._bgAudio) {
      if (v) {
        this._bgAudio.volume = 0
      } else {
        if (this._bgAudio.paused) {
          this._bgAudio.play().then(() => this._fadeInSoundtrack(1200)).catch(() => {})
        } else {
          this._fadeInSoundtrack(1200)
        }
      }
    }
  }

  setSfxVol(v: number) {
    this._sfxVol = Math.max(0, Math.min(1, v))
    localStorage.setItem(LS_SFX_VOL, String(this._sfxVol))
    if (this._ctx) this.sfxOut.gain.value = this._sfxVol
  }

  // Duck/restore soundtrack for video playback
  private _duckRaf: number | null = null

  duckMusic() {
    if (!this._bgAudio || this._muted) return
    if (this._duckRaf !== null) { cancelAnimationFrame(this._duckRaf); this._duckRaf = null }
    const el = this._bgAudio
    const target = this._bgTargetVol * 0.08   // lower to ~8% while video plays
    const start = performance.now()
    const from  = el.volume
    const tick  = (now: number) => {
      const t = Math.min(1, (now - start) / 800)
      el.volume = from + (target - from) * t
      if (t < 1) this._duckRaf = requestAnimationFrame(tick)
      else { el.volume = target; this._duckRaf = null }
    }
    this._duckRaf = requestAnimationFrame(tick)
  }

  restoreMusic() {
    if (!this._bgAudio || this._muted) return
    if (this._duckRaf !== null) { cancelAnimationFrame(this._duckRaf); this._duckRaf = null }
    const el = this._bgAudio
    const target = this._bgTargetVol
    const start = performance.now()
    const from  = el.volume
    const tick  = (now: number) => {
      const t = Math.min(1, (now - start) / 1400)
      el.volume = from + (target - from) * t
      if (t < 1) this._duckRaf = requestAnimationFrame(tick)
      else { el.volume = target; this._duckRaf = null }
    }
    this._duckRaf = requestAnimationFrame(tick)
  }

  // No-ops — kept so existing call sites in room components compile without changes
  startAmbient(_type: AmbientType) {}
  stopAmbient()  {}
  setAmbVol(_v: number) {}

  // ── Global soundtrack ─────────────────────────────────────────────────────

  initSoundtrack() {
    if (this._bgAudio) return
    const el = new Audio('/soundtrack.mp3')
    el.loop = true
    el.volume = 0
    el.preload = 'auto'
    this._bgAudio = el

    if (this._muted) return

    // Try immediate autoplay (works on many browsers when tab is active)
    el.play().then(() => {
      this._fadeInSoundtrack(2500)
    }).catch(() => {
      // Browser blocked — unlock on first interaction, then fade in naturally
      const unlock = () => {
        if (!this._bgAudio || this._muted) return
        this._bgAudio.play()
          .then(() => this._fadeInSoundtrack(2000))
          .catch(() => {})
      }
      window.addEventListener('pointerdown', unlock, { capture: true, once: true })
      window.addEventListener('keydown',     unlock, { capture: true, once: true })
    })
  }

  private _fadeInSoundtrack(durationMs = 2500) {
    const el = this._bgAudio
    if (!el) return
    const start = performance.now()
    const target = this._bgTargetVol
    const tick = (now: number) => {
      if (!this._bgAudio || this._muted) return
      const t = Math.min(1, (now - start) / durationMs)
      el.volume = target * (t * t)  // ease-in — gentle swell
      if (t < 1) requestAnimationFrame(tick)
      else el.volume = target
    }
    requestAnimationFrame(tick)
  }

  // ── Low-level helpers ─────────────────────────────────────────────────────

  private tone(
    freq:  number,
    dur:   number,
    vol:   number,
    type:  OscillatorType = 'sine',
    delay = 0,
  ) {
    const c = this.ctx
    const t = c.currentTime + delay
    const osc = c.createOscillator()
    const g   = c.createGain()
    osc.type = type
    osc.frequency.value = freq
    g.gain.setValueAtTime(0.001, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(g)
    g.connect(this.sfxOut)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  }

  private noiseBurst(
    dur:    number,
    vol:    number,
    loFreq: number,
    hiFreq: number,
    delay = 0,
  ) {
    const c = this.ctx
    const t = c.currentTime + delay
    const len = Math.floor(c.sampleRate * Math.min(dur, 0.5))
    const buf = c.createBuffer(1, len, c.sampleRate)
    const d   = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1

    const src = c.createBufferSource()
    src.buffer = buf
    src.loop = dur > 0.5

    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = loFreq
    const lp = c.createBiquadFilter(); lp.type = 'lowpass';  lp.frequency.value = hiFreq
    const g  = c.createGain()
    g.gain.setValueAtTime(0.001, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.015)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(this.sfxOut)
    src.start(t)
    src.stop(t + dur + 0.02)
  }

  // ── Interaction sound effects ─────────────────────────────────────────────

  playClick() {
    this.tone(900, 0.055, 0.10, 'sine')
    this.tone(1350, 0.035, 0.05, 'sine', 0.008)
  }

  playHover() {
    this.tone(1180, 0.048, 0.028, 'sine')
  }

  playRoomOpen() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => this.tone(f, 0.38, 0.16, 'sine', i * 0.11))
    this.noiseBurst(0.06, 0.05, 2000, 8000, 0.35)
  }

  playSelect() {
    this.tone(660, 0.16, 0.13, 'triangle')
    this.tone(990, 0.10, 0.06, 'sine', 0.018)
  }

  playDrag() {
    this.noiseBurst(0.14, 0.07, 800, 3500)
  }

  playDrop() {
    this.tone(440, 0.07, 0.14, 'sine')
    this.noiseBurst(0.05, 0.06, 2000, 7000, 0.018)
  }

  playCorrect() {
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => {
      this.tone(f, 0.32, 0.14, 'sine', i * 0.075)
      this.tone(f * 2, 0.18, 0.035, 'sine', i * 0.075 + 0.01)
    })
  }

  playIncorrect() {
    this.tone(370, 0.18, 0.13, 'sine')
    this.tone(311, 0.28, 0.13, 'sine', 0.16)
  }

  playCardFlip() {
    this.noiseBurst(0.07, 0.10, 1500, 6000)
    this.tone(900, 0.09, 0.055, 'sine', 0.035)
  }

  playPuzzleComplete() {
    const notes = [523, 659, 784, 1047, 1319, 1568]
    notes.forEach((f, i) => {
      this.tone(f,       0.50, 0.15, 'sine', i * 0.10)
      this.tone(f * 1.5, 0.28, 0.04, 'sine', i * 0.10 + 0.018)
    })
    for (let i = 0; i < 6; i++) {
      this.tone(2200 + i * 280, 0.28, 0.035, 'sine', 0.55 + i * 0.075)
    }
  }

  playKeyCollect() {
    const notes = [659, 784, 988, 1319, 1568]
    notes.forEach((f, i) => {
      this.tone(f,     0.28, 0.13, 'sine', i * 0.065)
      this.tone(f * 2, 0.14, 0.04, 'sine', i * 0.065 + 0.01)
    })
  }

  playFinalDoorUnlock() {
    this.tone(110, 1.4, 0.18, 'sine')
    this.tone(165, 1.1, 0.10, 'sine', 0.06)
    const notes = [523, 659, 784, 1047, 1319, 1568, 2093]
    notes.forEach((f, i) => {
      this.tone(f,     0.55, 0.13, 'sine', 0.28 + i * 0.11)
      this.tone(f * 2, 0.28, 0.04, 'sine', 0.28 + i * 0.11 + 0.018)
    })
  }

  playInventoryOpen() {
    this.noiseBurst(0.11, 0.07, 400, 2200)
    this.tone(660, 0.14, 0.09, 'sine', 0.045)
    this.tone(990, 0.09, 0.05, 'sine', 0.095)
  }

  playInventoryClose() {
    this.tone(990, 0.09, 0.09, 'sine')
    this.tone(660, 0.14, 0.09, 'sine', 0.045)
    this.noiseBurst(0.09, 0.06, 400, 2200, 0.08)
  }

  playHint() {
    this.tone(880,  0.65, 0.13, 'sine')
    this.tone(1320, 0.45, 0.06, 'sine', 0.018)
    this.tone(1760, 0.28, 0.04, 'sine', 0.035)
  }

  playReturnGarden() {
    const notes = [784, 659, 523, 392]
    notes.forEach((f, i) => this.tone(f, 0.28, 0.12, 'sine', i * 0.09))
  }

  playPageTurn() {
    this.noiseBurst(0.10, 0.09, 600, 4500)
    this.noiseBurst(0.07, 0.05, 1500, 6000, 0.06)
  }

  playDrawerOpen() {
    this.noiseBurst(0.16, 0.08, 180, 900)
    this.tone(330, 0.09, 0.055, 'triangle', 0.11)
  }

  playFilmClick() {
    this.noiseBurst(0.045, 0.11, 1000, 5000)
    this.tone(1200, 0.055, 0.07, 'square', 0.008)
  }

  playMechanicalClick() {
    this.noiseBurst(0.038, 0.09, 500, 2500)
    this.tone(500, 0.048, 0.07, 'square')
  }

  playKeyInsert() {
    this.noiseBurst(0.07, 0.055, 300, 1800)
    this.tone(220, 0.14, 0.09, 'sine', 0.05)
    this.tone(330, 0.10, 0.055, 'sine', 0.10)
  }

  playDoorSwing() {
    this.noiseBurst(0.38, 0.07, 80, 500)
    this.tone(110, 0.90, 0.14, 'sine')
    this.tone(165, 0.70, 0.08, 'sine', 0.09)
  }

  playShimmer() {
    const freqs = [1047, 1319, 1568, 2093]
    freqs.forEach((f, i) => this.tone(f, 0.22, 0.055, 'sine', i * 0.04))
  }
}

export const audio = new AudioEngine()
