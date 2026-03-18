import { useEffect, useRef, useCallback, useState } from 'react'
import * as Tone from 'tone'
import { useSoundStore } from '@/store/soundStore'
import type { SoundKey } from '@/types'

// ── Each sound is a self-contained Tone.js graph ─────────────────────────────

type SoundEngine = {
  volume: Tone.Volume
  stop: () => void
}

// Ambient — slow evolving pad with reverb + chorus
function makeAmbient(): SoundEngine {
  const vol = new Tone.Volume(-18).toDestination()
  const reverb = new Tone.Reverb({ decay: 8, wet: 0.7 }).connect(vol)
  const chorus = new Tone.Chorus({ frequency: 0.3, depth: 0.6, wet: 0.4 }).connect(reverb)
  chorus.start()

  const notes = ['C2', 'G2', 'E3', 'B3', 'D4']
  const synths = notes.map((note, i) => {
    const synth = new Tone.Synth({
      oscillator: { type: i % 2 === 0 ? 'sine' : 'triangle' },
      envelope: { attack: 3, decay: 1, sustain: 0.8, release: 4 },
    }).connect(chorus)
    synth.triggerAttack(note, Tone.now() + i * 0.3)
    return synth
  })

  // Slowly modulate volume for breathing effect
  const lfo = new Tone.LFO({ frequency: 0.05, min: -24, max: -16 }).start()
  lfo.connect(vol.volume)

  return {
    volume: vol,
    stop: () => {
      synths.forEach(s => { try { s.triggerRelease(); s.dispose() } catch (_) {} })
      try { lfo.dispose(); chorus.dispose(); reverb.dispose(); vol.dispose() } catch (_) {}
    }
  }
}

// Rain — pink noise through a resonant filter with slow LFO sweep
function makeRain(): SoundEngine {
  const vol = new Tone.Volume(-20).toDestination()
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).connect(vol)
  const filter = new Tone.Filter({ frequency: 1800, type: 'bandpass', Q: 0.6 }).connect(reverb)

  const lfo = new Tone.LFO({ frequency: 0.08, min: 1200, max: 2400 }).start()
  lfo.connect(filter.frequency)

  const noise = new Tone.Noise('pink').connect(filter)
  noise.start()

  // Occasional drip — short pluck
  const pluck = new Tone.PluckSynth({ attackNoise: 1, dampening: 4000, resonance: 0.9 }).connect(reverb)
  const dripNotes = ['C5', 'E5', 'G5', 'A5', 'D5']
  let stopped = false
  function drip() {
    if (stopped) return
    pluck.triggerAttack(dripNotes[Math.floor(Math.random() * dripNotes.length)])
    Tone.getDraw().schedule(() => {
      if (!stopped) setTimeout(drip, 800 + Math.random() * 2000)
    }, '+0.1')
  }
  drip()

  return {
    volume: vol,
    stop: () => {
      stopped = true
      try { noise.stop(); noise.dispose(); lfo.dispose(); filter.dispose(); pluck.dispose(); reverb.dispose(); vol.dispose() } catch (_) {}
    }
  }
}

// Fire — low crackle + warm sub hum
function makeFire(): SoundEngine {
  const vol = new Tone.Volume(-22).toDestination()
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).connect(vol)

  // Sub hum
  const hum = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 2, decay: 0, sustain: 1, release: 2 },
  }).connect(reverb)
  hum.triggerAttack('C1')

  // Crackle noise
  const filter = new Tone.Filter({ frequency: 350, type: 'bandpass', Q: 1.2 }).connect(reverb)
  const lfo = new Tone.LFO({ frequency: 3, min: 200, max: 600 }).start()
  lfo.connect(filter.frequency)
  const noise = new Tone.Noise('brown').connect(filter)
  noise.start()

  return {
    volume: vol,
    stop: () => {
      try { hum.triggerRelease(); hum.dispose(); noise.stop(); noise.dispose(); lfo.dispose(); filter.dispose(); reverb.dispose(); vol.dispose() } catch (_) {}
    }
  }
}

// Wind — bandpass filtered noise with slow swells
function makeWind(): SoundEngine {
  const vol = new Tone.Volume(-20).toDestination()
  const filter = new Tone.Filter({ frequency: 700, type: 'bandpass', Q: 0.8 }).connect(vol)

  const freqLfo = new Tone.LFO({ frequency: 0.04, min: 400, max: 1200 }).start()
  freqLfo.connect(filter.frequency)

  const ampLfo = new Tone.LFO({ frequency: 0.03, min: -28, max: -18 }).start()
  ampLfo.connect(vol.volume)

  const noise = new Tone.Noise('white').connect(filter)
  noise.start()

  return {
    volume: vol,
    stop: () => {
      try { noise.stop(); noise.dispose(); freqLfo.dispose(); ampLfo.dispose(); filter.dispose(); vol.dispose() } catch (_) {}
    }
  }
}

// Keys — soft piano-like keystrokes with melody
function makeKeys(): SoundEngine {
  const vol = new Tone.Volume(-20).toDestination()
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.5 }).connect(vol)
  const delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.2, wet: 0.15 }).connect(reverb)

  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 1.2 },
  }).connect(delay)

  // Pentatonic scale — always sounds pleasant
  const scale = ['C4','D4','E4','G4','A4','C5','D5','E5','G5','A5']
  let stopped = false

  function playNote() {
    if (stopped) return
    synth.triggerAttackRelease(
      scale[Math.floor(Math.random() * scale.length)],
      '16n'
    )
    setTimeout(playNote, 200 + Math.random() * 600)
  }
  setTimeout(playNote, 300)

  return {
    volume: vol,
    stop: () => {
      stopped = true
      try { synth.dispose(); delay.dispose(); reverb.dispose(); vol.dispose() } catch (_) {}
    }
  }
}

// Space — deep evolving drone with harmonics
function makeSpace(): SoundEngine {
  const vol = new Tone.Volume(-16).toDestination()
  const reverb = new Tone.Reverb({ decay: 12, wet: 0.85 }).connect(vol)
  const chorus = new Tone.Chorus({ frequency: 0.1, depth: 0.8, wet: 0.5 }).connect(reverb)
  chorus.start()

  const notes = ['C1', 'C2', 'G2', 'C3']
  const synths = notes.map((note, i) => {
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 4, decay: 2, sustain: 1, release: 6 },
    }).connect(chorus)
    synth.triggerAttack(note, Tone.now() + i * 0.8)
    return synth
  })

  const lfo = new Tone.LFO({ frequency: 0.02, min: -20, max: -14 }).start()
  lfo.connect(vol.volume)

  return {
    volume: vol,
    stop: () => {
      synths.forEach(s => { try { s.triggerRelease(); s.dispose() } catch (_) {} })
      try { lfo.dispose(); chorus.dispose(); reverb.dispose(); vol.dispose() } catch (_) {}
    }
  }
}

// White noise — gentle background hiss
function makeNoise(): SoundEngine {
  const vol = new Tone.Volume(-30).toDestination()
  const filter = new Tone.Filter({ frequency: 2000, type: 'lowpass' }).connect(vol)
  const noise = new Tone.Noise('pink').connect(filter)
  noise.start()
  return {
    volume: vol,
    stop: () => { try { noise.stop(); noise.dispose(); filter.dispose(); vol.dispose() } catch (_) {} }
  }
}

// ── Factory map ───────────────────────────────────────────────────────────────
const SOUND_FACTORIES: Record<SoundKey, () => SoundEngine> = {
  ambient: makeAmbient,
  rain:    makeRain,
  fire:    makeFire,
  wind:    makeWind,
  keys:    makeKeys,
  space:   makeSpace,
  noise:   makeNoise,
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAudio() {
  const enginesRef = useRef<Partial<Record<SoundKey, SoundEngine>>>({})
  const [unlocked, setUnlocked] = useState(false)
  const { layers, masterVolume, muted } = useSoundStore()

  const resume = useCallback(async () => {
    await Tone.start()
    setUnlocked(true)
  }, [])

  useEffect(() => {
    if (!unlocked) return

    layers.forEach((layer) => {
      const existing = enginesRef.current[layer.key]
      const targetVol = muted ? -Infinity : Tone.gainToDb(layer.volume * masterVolume)

      if (layer.active && !existing) {
        const engine = SOUND_FACTORIES[layer.key]()
        engine.volume.volume.value = targetVol
        enginesRef.current[layer.key] = engine
      } else if (!layer.active && existing) {
        existing.stop()
        delete enginesRef.current[layer.key]
      } else if (layer.active && existing) {
        existing.volume.volume.rampTo(targetVol, 0.1)
      }
    })
  }, [layers, masterVolume, muted, unlocked])

  useEffect(() => {
    return () => {
      Object.values(enginesRef.current).forEach(e => { try { e?.stop() } catch (_) {} })
    }
  }, [])

  return { resume, unlocked }
}