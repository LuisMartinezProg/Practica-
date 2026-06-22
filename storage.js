// storage.js — Capa de persistencia sobre localStorage.
// Todo el progreso del usuario vive en el navegador donde se aloja la app (GitHub Pages).

const KEYS = {
  sessions: 'meca_sessions',
  charStats: 'meca_charstats',
  wordStats: 'meca_wordstats',
  categoryStats: 'meca_categorystats',
  profile: 'meca_profile',
  achievements: 'meca_achievements',
  missions: 'meca_missions',
  dailyChallenge: 'meca_daily',
  customWords: 'meca_customwords',
  settings: 'meca_settings',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('No se pudo leer', key, e);
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('No se pudo guardar', key, e);
  }
}

export const defaultProfile = () => ({
  xp: 0,
  level: 1,
  streak: 0,
  lastSessionDate: null,
  hasCustomWords: false,
  totalSessions: 0,
  totalChars: 0,
  totalTimeSec: 0,
});

export const Store = {
  KEYS,

  getSessions() { return read(KEYS.sessions, []); },
  addSession(session) {
    const list = this.getSessions();
    list.push(session);
    // Conservar como máximo las últimas 300 sesiones para no inflar localStorage.
    if (list.length > 300) list.splice(0, list.length - 300);
    write(KEYS.sessions, list);
    return list;
  },

  getCharStats() { return read(KEYS.charStats, {}); },
  setCharStats(stats) { write(KEYS.charStats, stats); },

  getWordStats() { return read(KEYS.wordStats, {}); },
  setWordStats(stats) { write(KEYS.wordStats, stats); },

  getCategoryStats() {
    return read(KEYS.categoryStats, {
      letter: { attempts: 0, errors: 0 },
      digit: { attempts: 0, errors: 0 },
      symbol: { attempts: 0, errors: 0 },
      space: { attempts: 0, errors: 0 },
    });
  },
  setCategoryStats(stats) { write(KEYS.categoryStats, stats); },

  getProfile() {
    const p = read(KEYS.profile, null);
    return p ? Object.assign(defaultProfile(), p) : defaultProfile();
  },
  setProfile(profile) { write(KEYS.profile, profile); },

  getAchievements() { return read(KEYS.achievements, {}); },
  setAchievements(state) { write(KEYS.achievements, state); },

  getMissions() { return read(KEYS.missions, null); },
  setMissions(missions) { write(KEYS.missions, missions); },

  getDailyChallenge() { return read(KEYS.dailyChallenge, null); },
  setDailyChallenge(dc) { write(KEYS.dailyChallenge, dc); },

  getCustomWords() { return read(KEYS.customWords, []); },
  setCustomWords(words) { write(KEYS.customWords, words); },

  getSettings() { return read(KEYS.settings, { theme: 'dark' }); },
  setSettings(settings) { write(KEYS.settings, settings); },

  resetAll() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  },
};
