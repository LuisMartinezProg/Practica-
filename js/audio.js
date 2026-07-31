// Web Audio API nativa: sonidos sintéticos con osciladores, sin archivos externos.

let _audioCtx = null;

function _getAudioContext() {
  if (!_audioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    _audioCtx = new AudioCtx();
  }
  return _audioCtx;
}

const SOUND_DATABASE = {
  hit: { freq: 220, duration: 0.08, type: 'square', gain: 0.15 },
  playerHurt: { freq: 140, duration: 0.15, type: 'sawtooth', gain: 0.18 },
  enemyDeath: { freq: 90, duration: 0.3, type: 'triangle', gain: 0.2 },
  dodge: { freq: 500, duration: 0.08, type: 'sine', gain: 0.12 },
  equip: { freq: 660, duration: 0.06, type: 'square', gain: 0.1 },
  craft: { freq: 440, duration: 0.12, type: 'triangle', gain: 0.15 },
  zoneTransition: { freq: 330, duration: 0.4, type: 'sine', gain: 0.15 },
  levelup: { chord: [523, 659, 784], duration: 0.5, type: 'sine', gain: 0.15 },
  questComplete: { freq: 587, duration: 0.3, type: 'sine', gain: 0.15 },
  achievementUnlock: { chord: [440, 554, 659, 880], duration: 0.6, type: 'sine', gain: 0.15 },
  shopTransaction: { freq: 800, duration: 0.08, type: 'square', gain: 0.12 },
};

function playSound(soundId) {
  if (!game.state.settings.soundOn) return;
  const def = SOUND_DATABASE[soundId];
  if (!def) return;

  try {
    const ctx = _getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const frequencies = def.chord || [def.freq];
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = def.type;
      osc.frequency.value = freq;

      const startAt = ctx.currentTime + i * 0.08;
      gainNode.gain.setValueAtTime(def.gain, startAt);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startAt + def.duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + def.duration + 0.05);
    });
  } catch (err) {
    console.error('Error reproduciendo sonido:', err);
  }
}
