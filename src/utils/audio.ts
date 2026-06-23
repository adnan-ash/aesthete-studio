// Web Audio API Premium Sound Synthesizer for Aesthete Studio
// Engineered to sound warm, bespoke, satisfyingly tactile, and extremely high-end (similar to Apple/Google physical interface sounds).
// Self-contained, highly optimized, memory-safe, and offline-compatible.

let audioCtx: AudioContext | null = null;
let zenDroneNode1: OscillatorNode | null = null;
let zenDroneNode2: OscillatorNode | null = null;
let zenDroneNode3: OscillatorNode | null = null;
let zenDroneLFO: OscillatorNode | null = null;
let zenDroneGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Premium Apple-style UI Tick.
 * Extremely soft, tactile, organic pop. 
 * High-quality dampened physical tap.
 */
export const playTick = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  // Gentle, warm pitch tumble
  osc.type = 'sine';
  osc.frequency.setValueAtTime(380, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.022);

  // Severe lowpass to eliminate any synthesis harshness and deliver a premium, velvety "thump"
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, now);

  // Micro envelope with lightning-fast exponential decay
  gain.gain.setValueAtTime(0.045, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);
};

/**
 * Celestial Golden-Ratio Multi-Tonal Chime.
 * Strummed major pentatonic cluster. Soft attacks and luscious, warm decays.
 * Inspired by ultra-premium product boots and ambient sound design.
 */
export const playChime = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Golden ratio strummed frequencies (C# major 9)
  const tones = [
    { freq: 277.18, delay: 0.00, duration: 1.5, gain: 0.015 }, // C#4 Root (warm stabilizer)
    { freq: 415.30, delay: 0.012, duration: 1.4, gain: 0.012 }, // G#4 (perfect fifth)
    { freq: 554.37, delay: 0.024, duration: 1.3, gain: 0.010 }, // C#5 (pure octave)
    { freq: 698.46, delay: 0.036, duration: 1.2, gain: 0.008 }, // F5 (third)
    { freq: 932.33, delay: 0.048, duration: 1.1, gain: 0.006 }  // A#5 (ninth / golden ratio detail)
  ];

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, now); // cuts harsh highs for an organic, metallic-yet-creamy bell tone

  tones.forEach((tone) => {
    const osc = ctx.createOscillator();
    const subGain = ctx.createGain();
    const toneTime = now + tone.delay;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(tone.freq, toneTime);

    // Fade-in to prevent initial digital clicking, then beautiful exponential decay
    subGain.gain.setValueAtTime(0.0, toneTime);
    subGain.gain.linearRampToValueAtTime(tone.gain, toneTime + 0.015);
    subGain.gain.exponentialRampToValueAtTime(0.0001, toneTime + tone.duration);

    osc.connect(subGain);
    subGain.connect(filter);

    osc.start(toneTime);
    osc.stop(toneTime + tone.duration + 0.1);
  });

  filter.connect(ctx.destination);
};

/**
 * Satisfying Multi-Tone Success Feedback Arpeggio.
 * Harmonized pentatonic run with micro-strumming.
 */
export const playSuccess = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Ascending premium feedback notes
  const noteFreqs = [440.00, 554.37, 659.25, 880.00, 1109.73]; // A4, C#5, E5, A5, C#6
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1500, now);

  noteFreqs.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const delay = index * 0.045; // ultra-fast elegant rolling strum
    const toneTime = now + delay;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, toneTime);

    // Luxurious smooth envelope
    gain.gain.setValueAtTime(0.0, toneTime);
    gain.gain.linearRampToValueAtTime(0.012, toneTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, toneTime + 0.55);

    osc.connect(gain);
    gain.connect(filter);

    osc.start(toneTime);
    osc.stop(toneTime + 0.65);
  });

  filter.connect(ctx.destination);
};

/**
 * Deep, cinematic Brian Eno-inspired warm ambient drone.
 * Employs sub-bass grounding, a perfect-fifth triangle resin, and a slow LFO to simulate organic breathing.
 */
export const startZenDrone = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  
  // Make sure we stop any active drone first
  stopZenDrone();

  zenDroneGain = ctx.createGain();
  zenDroneGain.gain.setValueAtTime(0.0, now);
  // Warm atmospheric fade-in over 3 seconds
  zenDroneGain.gain.linearRampToValueAtTime(0.04, now + 3.0);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  // Cozy low-frequency filter
  filter.frequency.setValueAtTime(140, now);

  // Voice 1: Ultra deep grounding sub-bass (A1)
  zenDroneNode1 = ctx.createOscillator();
  zenDroneNode1.type = 'sine';
  zenDroneNode1.frequency.setValueAtTime(55.00, now);

  // Voice 2: Mid stabilizer (A2) with slight chorus detune
  zenDroneNode2 = ctx.createOscillator();
  zenDroneNode2.type = 'triangle';
  zenDroneNode2.frequency.setValueAtTime(110.00, now);
  zenDroneNode2.detune.setValueAtTime(-5, now);

  // Voice 3: Harmonious Perfect Fifth (E3) creating rich ambient density
  zenDroneNode3 = ctx.createOscillator();
  zenDroneNode3.type = 'sine';
  zenDroneNode3.frequency.setValueAtTime(164.81, now);
  zenDroneNode3.detune.setValueAtTime(5, now);

  // Slow breathing LFO (0.12 Hz is a beautiful, 8.3-second rise-and-fall lung cycle)
  zenDroneLFO = ctx.createOscillator();
  zenDroneLFO.type = 'sine';
  zenDroneLFO.frequency.setValueAtTime(0.12, now);

  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(0.015, now); // soft fluctuation range

  // Wire LFO to modulate our master gain smoothly
  zenDroneLFO.connect(lfoGain);
  lfoGain.connect(zenDroneGain.gain);

  // Connect active voices
  zenDroneNode1.connect(filter);
  zenDroneNode2.connect(filter);
  zenDroneNode3.connect(filter);
  filter.connect(zenDroneGain);
  zenDroneGain.connect(ctx.destination);

  // Start everything at once
  zenDroneNode1.start(now);
  zenDroneNode2.start(now);
  zenDroneNode3.start(now);
  zenDroneLFO.start(now);
};

/**
 * Fades out and releases the ambient drone smoothly inside standard Web Audio parameters.
 */
export const stopZenDrone = () => {
  const ctx = getAudioContext();
  const now = ctx ? ctx.currentTime : 0;

  if (zenDroneGain && ctx) {
    const currentGain = zenDroneGain;
    const voice1 = zenDroneNode1;
    const voice2 = zenDroneNode2;
    const voice3 = zenDroneNode3;
    const lfo = zenDroneLFO;

    // Elegant exponential fadeout over 1.5 seconds
    currentGain.gain.setValueAtTime(currentGain.gain.value, now);
    currentGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    setTimeout(() => {
      try {
        if (voice1) voice1.stop();
        if (voice2) voice2.stop();
        if (voice3) voice3.stop();
        if (lfo) lfo.stop();
      } catch (err) {
        // Safe protection against double-stop
      }
    }, 1800);
  }

  zenDroneNode1 = null;
  zenDroneNode2 = null;
  zenDroneNode3 = null;
  zenDroneLFO = null;
  zenDroneGain = null;
};
