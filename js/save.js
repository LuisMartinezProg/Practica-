// Guardado y carga. game.state se persiste en localStorage; game.refs NUNCA se guarda.
// achievements se guarda en clave separada porque persiste aunque se empiece Nueva Partida.

const SAVE_KEY = 'sao_save';
const ACHIEVEMENTS_KEY = 'sao_achievements';

function hasSaveData() {
  return localStorage.getItem(SAVE_KEY) !== null;
}

function _deepMergeInto(target, source) {
  Object.keys(source).forEach((key) => {
    const sourceVal = source[key];
    const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
    if (isPlainObject(sourceVal) && isPlainObject(target[key])) {
      _deepMergeInto(target[key], sourceVal);
    } else {
      target[key] = sourceVal;
    }
  });
}

function saveGame() {
  try {
    const { achievements, ...toSave } = game.state;
    localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(game.state.achievements));
  } catch (err) {
    console.error('No se pudo guardar la partida:', err);
    if (typeof showNotification === 'function') showNotification('No se pudo guardar la partida', 'warning');
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) _deepMergeInto(game.state, JSON.parse(raw));
  } catch (err) {
    console.error('No se pudo cargar la partida guardada:', err);
  }

  try {
    const rawAchievements = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (rawAchievements) game.state.achievements = JSON.parse(rawAchievements);
  } catch (err) {
    console.error('No se pudo cargar el perfil de logros:', err);
  }
}

function initSave() {
  setInterval(saveGame, 30000);
}
