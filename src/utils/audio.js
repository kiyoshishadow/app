let audioCtx = null;
let soundEnabled = true;

const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];

export function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
    } catch (e) {
      return null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function playBeep(freq, duration = 0.18, type = "sine", gainVal = 0.09, delay = 0) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const time = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gainNode.gain.setValueAtTime(0, time);
  gainNode.gain.linearRampToValueAtTime(gainVal, time + 0.008);
  gainNode.gain.exponentialRampToValueAtTime(1e-4, time + duration);

  osc.connect(gainNode).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + duration + 0.02);
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function playDefaultClick() {
  playBeep(randomElement(notes), 0.14, "sine", 0.07);
}

export function playSaveSound() {
  playBeep(notes[2], 0.12, "triangle", 0.08, 0);
  playBeep(notes[4], 0.18, "triangle", 0.08, 0.09);
}

export function playDeleteSound() {
  playBeep(220, 0.18, "sawtooth", 0.05);
}

export function playToggleSound(isOn) {
  playBeep(isOn ? notes[3] : notes[1], 0.12, "sine", 0.07);
}

export function playDrawingBeep() {
  playBeep(randomElement([notes[4], notes[5]]), 0.08, "sine", 0.04);
}

export function playFeedbackSound(element) {
  if (!element) return;
  const text = (element.textContent || "").trim();
  const className = element.className || "";

  if (text.includes("✕") || text.includes("🗑") || text.toLowerCase().includes("borrar") || text.toLowerCase().includes("eliminar")) {
    playDeleteSound();
    return;
  }
  if (text.toLowerCase().includes("guardar") || text.toLowerCase().includes("añadir") || text.toLowerCase().includes("agregar")) {
    playSaveSound();
    return;
  }
  if (className.includes("toggle")) {
    playToggleSound(element.classList.contains("on"));
    return;
  }
  if (className.includes("sticker")) {
    playBeep(randomElement([notes[3], notes[4], notes[5]]), 0.1, "triangle", 0.06);
    return;
  }
  playDefaultClick();
}

export function soundFeedbackListener() {
  function handleClick(e) {
    const target = e.target;
    if (!target) return;
    const clickable = target.closest("button, [role='button'], .day-cell, .sticker, .toggle");
    if (clickable) {
      playFeedbackSound(clickable);
    }
  }
  if (typeof document !== 'undefined') {
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }
  return () => {};
}
