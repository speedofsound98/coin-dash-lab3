// Scoring sounds synthesized with the Web Audio API (no audio files).
// Every call is wrapped in try/catch so the game keeps working without audio.
window.CoinDashSound = (() => {
  let ctx = null;
  let muted = false;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // One oscillator note: type, start/end frequency, delay and length in seconds.
  function tone(type, from, to, delay, length, volume) {
    if (muted) return;
    try {
      const a = audio();
      if (!a) return;
      const t = a.currentTime + delay;
      const osc = a.createOscillator();
      const gain = a.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(from, t);
      osc.frequency.exponentialRampToValueAtTime(to, t + length);
      gain.gain.setValueAtTime(volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + length);
      osc.connect(gain).connect(a.destination);
      osc.start(t);
      osc.stop(t + length);
    } catch (e) { /* audio unavailable: stay silent */ }
  }

  function showState() {
    const note = document.getElementById('sound-state');
    if (note) note.textContent = `Sound: ${muted ? 'off' : 'on'}`;
  }

  // Browsers block audio until a user gesture; the first key press unlocks it.
  window.addEventListener('keydown', () => { try { audio(); } catch (e) { /* ignore */ } }, { once: true });

  return {
    coin() { tone('square', 880, 880, 0, 0.07, 0.08); tone('square', 1320, 1320, 0.07, 0.09, 0.08); },
    crash() { tone('sawtooth', 220, 55, 0, 0.35, 0.15); },
    timeUp() { tone('sine', 660, 660, 0, 0.5, 0.15); tone('sine', 990, 990, 0.12, 0.5, 0.1); },
    toggleMute() { muted = !muted; showState(); return muted; }
  };
})();
