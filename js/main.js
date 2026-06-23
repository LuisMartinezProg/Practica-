// main.js — Punto de entrada. Conecta el motor de escritura, el almacenamiento,
// la gamificación y el mapa de errores con las funciones de renderizado de ui.js.

import { Store, defaultProfile } from './storage.js';
import { buildExercise, buildFocusExercise } from './exercises.js';
import { TypingTest } from './typingTest.js';
import {
  topProblemChars, confusionPairs, problemWords, categoryAccuracy,
  buildInsightMessage, mergeCharStats, mergeWordStats, mergeCategoryStats,
} from './errorMap.js';
import {
  levelFromXp, computeSessionXp, updateStreak, checkAchievements,
  generateDailyChallenge, evaluateDailyChallenge, generateWeeklyMissions,
  updateMissionsProgress, isoDateOnly, isoWeekKey,
} from './gamification.js';
import * as ui from './ui.js';

// ---------- Estado de la app ----------
const state = {
  config: { type: 'common', duration: { kind: 'timed', seconds: 30, length: 'short' } },
  test: null,
  spans: null,
  timer: null,
  finalized: false,
};

// ---------- Utilidades de datos agregados ----------
function getErrorMapData() {
  const charStats = Store.getCharStats();
  const wordStats = Store.getWordStats();
  const categoryStats = Store.getCategoryStats();
  const topChars = topProblemChars(charStats, 5);
  return {
    charStats,
    confusions: confusionPairs(charStats, 4),
    topChars,
    problemWords: problemWords(wordStats, 8),
    categoryAcc: categoryAccuracy(categoryStats),
    insightMsg: buildInsightMessage(topChars),
  };
}

function getAggregateStats(sessions) {
  if (!sessions.length) return { avgWpm: 0, avgAcc: 0, bestWpm: 0, totalSessions: 0, totalTimeMin: 0 };
  const avgWpm = Math.round(sessions.reduce((s, x) => s + x.wpm, 0) / sessions.length);
  const avgAcc = Math.round(sessions.reduce((s, x) => s + x.accuracy, 0) / sessions.length);
  const bestWpm = Math.max(...sessions.map(s => s.wpm));
  const totalTimeMin = Math.round(sessions.reduce((s, x) => s + x.durationSec, 0) / 60);
  return { avgWpm, avgAcc, bestWpm, totalSessions: sessions.length, totalTimeMin };
}

function ensureDailyChallenge(profile) {
  const today = isoDateOnly();
  let dc = Store.getDailyChallenge();
  if (!dc || dc.date !== today) {
    const sessions = Store.getSessions();
    const avg = getAggregateStats(sessions).avgWpm;
    dc = generateDailyChallenge(today, avg);
    Store.setDailyChallenge(dc);
  }
  return dc;
}

function ensureWeeklyMissions(profile) {
  const weekKey = isoWeekKey();
  let missions = Store.getMissions();
  if (!missions || missions.length === 0 || missions[0].week !== weekKey) {
    const sessions = Store.getSessions();
    const avg = getAggregateStats(sessions).avgWpm;
    missions = generateWeeklyMissions(weekKey, avg);
    Store.setMissions(missions);
  }
  return missions;
}

function weeklyAggregates(sessions) {
  const weekKey = isoWeekKey();
  const inWeek = sessions.filter(s => isoWeekKey(new Date(s.date)) === weekKey);
  const days = new Set(inWeek.map(s => isoDateOnly(new Date(s.date))));
  return {
    sessions: inWeek.length,
    words: Math.round(inWeek.reduce((sum, s) => sum + s.charsTyped / 5, 0)),
    accuracySum: inWeek.reduce((sum, s) => sum + s.accuracy, 0),
    accuracyCount: inWeek.length,
    days,
    numberEx: inWeek.filter(s => s.exerciseType === 'numbers').length,
    symbolEx: inWeek.filter(s => s.exerciseType === 'symbols').length,
    maxWpm: inWeek.length ? Math.max(...inWeek.map(s => s.wpm)) : 0,
  };
}

// ---------- Cabecera global ----------
function refreshHeader() {
  const profile = Store.getProfile();
  const { level } = levelFromXp(profile.xp);
  ui.renderHeader({ streak: profile.streak, level });
}

// ---------- Pantalla Inicio ----------
function refreshHome() {
  const mapData = getErrorMapData();
  const profile = Store.getProfile();
  const dailyChallenge = ensureDailyChallenge(profile);
  ui.renderHome({ topChars: mapData.topChars, insightMsg: mapData.insightMsg, dailyChallenge });
}

// ---------- Pantalla Estadísticas ----------
function refreshStats() {
  const sessions = Store.getSessions();
  const agg = getAggregateStats(sessions);
  ui.renderStats({ ...agg, sessions });
}

// ---------- Pantalla Mapa de errores ----------
function refreshErrorMap() {
  ui.renderErrorMap(getErrorMapData());
}

// ---------- Pantalla Logros ----------
function refreshAchievements() {
  const profile = Store.getProfile();
  const { level, xpIntoLevel, xpForNext } = levelFromXp(profile.xp);
  const missions = ensureWeeklyMissions(profile);
  const achievementsState = Store.getAchievements();
  ui.renderAchievements({ level, xpIntoLevel, xpForNext, streak: profile.streak, missions, achievementsState });
}

// ---------- Pantalla Ajustes ----------
function refreshSettings() {
  const settings = Store.getSettings();
  const customWords = Store.getCustomWords();
  ui.renderSettings({ theme: settings.theme, customWords });
}

// ---------- Navegación ----------
function goTo(screenName) {
  if (screenName === 'home') refreshHome();
  else if (screenName === 'stats') refreshStats();
  else if (screenName === 'errormap') refreshErrorMap();
  else if (screenName === 'achievements') refreshAchievements();
  else if (screenName === 'settings') refreshSettings();
  ui.showScreen(screenName);
}

// ---------- Iniciar una sesión de práctica ----------
function currentDurationCfg() {
  return state.config.duration;
}

function startTest(type) {
  const durCfg = currentDurationCfg();
  const customWords = Store.getCustomWords();
  const text = buildExercise(type, durCfg, customWords);
  launchTest(text, type, durCfg);
}

function startFocusTest() {
  const mapData = getErrorMapData();
  const durCfg = currentDurationCfg();
  const chars = mapData.topChars.map(c => c.char);
  const text = buildFocusExercise(chars, durCfg);
  launchTest(text, 'focus', durCfg);
}

function launchTest(text, type, durCfg) {
  state.config.type = type;
  state.finalized = false;
  const engineMode = durCfg.kind === 'timed'
    ? { kind: 'timed', seconds: durCfg.seconds }
    : { kind: 'free' };
  state.test = new TypingTest(text, engineMode);
  state.test.exerciseType = type;

  const display = document.getElementById('textDisplay');
  state.spans = ui.buildTextSpans(display, text);

  const input = document.getElementById('typingInput');
  input.value = '';
  document.getElementById('finishFreeBtn').hidden = durCfg.kind !== 'free';
  ui.renderLiveStats({ wpm: 0, acc: 100, time: durCfg.kind === 'timed' ? durCfg.seconds : 0, progressPct: 0 });

  ui.showScreen('typing');
  setTimeout(() => input.focus(), 50);

  if (state.timer) clearInterval(state.timer);
  if (durCfg.kind === 'timed') {
    state.timer = setInterval(() => {
      const remaining = state.test.remainingSec;
      ui.renderLiveStats({
        wpm: state.test.liveWpm, acc: state.test.liveAccuracy,
        time: Math.ceil(remaining),
        progressPct: (state.test.elapsedSec / durCfg.seconds) * 100,
      });
      if (remaining <= 0) finalizeTest();
    }, 150);
  }
}

function handleTypingInput(e) {
  if (!state.test || state.finalized) return;
  const reachedEnd = state.test.onInputValue(e.target.value);
  ui.updateTextSpans(state.spans, state.test.text, state.test.typed);
  const durCfg = currentDurationCfg();
  const progressPct = durCfg.kind === 'timed'
    ? (state.test.elapsedSec / durCfg.seconds) * 100
    : (state.test.typed.length / state.test.text.length) * 100;
  ui.renderLiveStats({
    wpm: state.test.liveWpm, acc: state.test.liveAccuracy,
    time: durCfg.kind === 'timed' ? Math.ceil(state.test.remainingSec) : Math.floor(state.test.elapsedSec),
    progressPct,
  });
  if (reachedEnd) finalizeTest();
}

function cancelTest() {
  if (state.timer) clearInterval(state.timer);
  state.test = null;
  goTo('home');
}

function finalizeTest() {
  if (!state.test || state.finalized) return;
  state.finalized = true;
  if (state.timer) clearInterval(state.timer);

  const result = state.test.finish();
  result.exerciseType = state.test.exerciseType;

  const sessionsBefore = Store.getSessions();
  const aggBefore = getAggregateStats(sessionsBefore);
  const isFirst = sessionsBefore.length === 0;

  // Estadísticas acumuladas (mapa de errores).
  const charStats = mergeCharStats(Store.getCharStats(), result.charStats);
  const wordStats = mergeWordStats(Store.getWordStats(), result.wordStats);
  const categoryStats = mergeCategoryStats(Store.getCategoryStats(), result.categoryStats);
  Store.setCharStats(charStats);
  Store.setWordStats(wordStats);
  Store.setCategoryStats(categoryStats);

  // Perfil / XP / racha.
  const profile = Store.getProfile();
  profile.totalSessions++;
  profile.totalChars += result.charsTyped;
  profile.totalTimeSec += result.durationSec;
  updateStreak(profile);

  let xpGained = computeSessionXp(result);
  const xpBeforeTotal = profile.xp;

  // Sesión compacta para el historial (sin los mapas detallados).
  const sessionRecord = {
    date: result.date, mode: result.mode, durationSec: result.durationSec,
    wpm: result.wpm, accuracy: result.accuracy, charsTyped: result.charsTyped,
    errors: result.errors, exerciseType: result.exerciseType,
  };
  const sessionsAfter = Store.addSession(sessionRecord);

  // Logros.
  const achievementsState = Store.getAchievements();
  const unlocked = checkAchievements(
    { profile, sessions: sessionsAfter, last: sessionRecord, charStats, wordStats },
    achievementsState
  );
  unlocked.forEach(def => { xpGained += def.xp; });
  Store.setAchievements(achievementsState);

  // Desafío diario.
  const dailyChallenge = ensureDailyChallenge(profile);
  const sessionsToday = sessionsAfter.filter(s => isoDateOnly(new Date(s.date)) === isoDateOnly()).length;
  const dailyDone = evaluateDailyChallenge(dailyChallenge, sessionRecord, sessionsToday);
  if (dailyDone) xpGained += dailyChallenge.xp;
  Store.setDailyChallenge(dailyChallenge);

  // Misiones semanales.
  const missions = ensureWeeklyMissions(profile);
  const weekly = weeklyAggregates(sessionsAfter);
  const completedMissions = updateMissionsProgress(missions, weekly);
  completedMissions.forEach(m => { xpGained += m.xp; });
  Store.setMissions(missions);

  profile.xp = xpBeforeTotal + xpGained;
  Store.setProfile(profile);

  const levelBefore = levelFromXp(xpBeforeTotal).level;
  const levelInfo = levelFromXp(profile.xp);
  const leveledUp = levelInfo.level > levelBefore;

  // Mensaje de la sesión (puntos débiles detectados solo en esta práctica).
  const sChars = topProblemChars(result.charStats, 3);
  const sWords = problemWords(result.wordStats, 2);
  let sessionInsight = null;
  if (sChars.length) {
    sessionInsight = `En esta sesión tus errores se concentraron en: ${sChars.map(c => c.char).join(', ')}.`;
    if (sWords.length) sessionInsight += ` Palabra más difícil: "${sWords[0].word}".`;
  } else if (sWords.length) {
    sessionInsight = `Palabra que más te costó esta sesión: "${sWords[0].word}".`;
  }

  const unlockedExtras = [];
  unlocked.forEach(def => unlockedExtras.push(`🏆 <b>${def.name}</b> — ${def.desc} (+${def.xp} XP)`));
  if (dailyDone) unlockedExtras.push(`✓ <b>Desafío diario</b> completado (+${dailyChallenge.xp} XP)`);
  completedMissions.forEach(m => unlockedExtras.push(`✓ <b>Misión</b>: ${m.desc} (+${m.xp} XP)`));

  ui.renderResults({
    result, avgWpm: aggBefore.avgWpm, isFirst, xpGained, levelInfo, leveledUp,
    sessionInsight, unlockedExtras,
  });
  refreshHeader();
  if (leveledUp) ui.toast(`✨ ¡Subiste a <b>nivel ${levelInfo.level}</b>!`, 'xp');
  ui.showScreen('results');
}

// ---------- Selección de chips (tipo / duración / longitud) ----------
function wireChipGroup(containerId, dataAttr, onChange) {
  const container = document.getElementById(containerId);
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    onChange(btn.dataset[dataAttr]);
  });
}

function wireHomeControls() {
  wireChipGroup('typeChips', 'type', (val) => { state.config.type = val; });
  wireChipGroup('durationChips', 'duration', (val) => {
    document.getElementById('lengthChips').hidden = val !== 'free';
    if (val === 'free') {
      state.config.duration = { kind: 'free', length: state.config.duration.length || 'short' };
    } else {
      state.config.duration = { kind: 'timed', seconds: Number(val) };
    }
  });
  wireChipGroup('lengthChips', 'length', (val) => {
    state.config.duration = { kind: 'free', length: val };
  });

  document.getElementById('startBtn').addEventListener('click', () => startTest(state.config.type));
  document.getElementById('startFocusBtn').addEventListener('click', startFocusTest);
}

// ---------- Wiring general ----------
function wireNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => goTo(btn.dataset.screen));
  });
}

function wireTypingScreen() {
  document.getElementById('typingInput').addEventListener('input', handleTypingInput);
  document.getElementById('cancelTestBtn').addEventListener('click', cancelTest);
  document.getElementById('finishFreeBtn').addEventListener('click', finalizeTest);
}

function wireResultsScreen() {
  document.getElementById('repeatBtn').addEventListener('click', () => {
    if (state.config.type === 'focus') startFocusTest();
    else startTest(state.config.type);
  });
  document.getElementById('backHomeBtn').addEventListener('click', () => goTo('home'));
}

function wireErrorMapScreen() {
  document.getElementById('generateFocusBtn').addEventListener('click', startFocusTest);
}

function wireSettingsScreen() {
  document.getElementById('themeSwitch').addEventListener('click', () => {
    const settings = Store.getSettings();
    settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
    Store.setSettings(settings);
    applyTheme(settings.theme);
    refreshSettings();
  });

  document.getElementById('saveCustomWordsBtn').addEventListener('click', () => {
    const raw = document.getElementById('customWordsArea').value;
    const words = raw.split('\n').map(w => w.trim()).filter(Boolean);
    Store.setCustomWords(words);
    const profile = Store.getProfile();
    if (words.length && !profile.hasCustomWords) {
      profile.hasCustomWords = true;
      Store.setProfile(profile);
      const achievementsState = Store.getAchievements();
      const unlocked = checkAchievements(
        { profile, sessions: Store.getSessions(), charStats: Store.getCharStats(), wordStats: Store.getWordStats() },
        achievementsState
      );
      if (unlocked.length) {
        profile.xp += unlocked.reduce((s, d) => s + d.xp, 0);
        Store.setProfile(profile);
        Store.setAchievements(achievementsState);
        unlocked.forEach(def => ui.toast(`🏆 <b>${def.name}</b> desbloqueado (+${def.xp} XP)`));
        refreshHeader();
      }
    }
    refreshSettings();
    ui.toast('Lista de palabras guardada', 'signal');
  });

  document.getElementById('resetDataBtn').addEventListener('click', () => {
    if (confirm('¿Seguro que quieres borrar todo tu progreso? Esta acción no se puede deshacer.')) {
      Store.resetAll();
      location.reload();
    }
  });
}

function applyTheme(theme) {
  document.body.classList.remove('theme-dark', 'theme-light');
  document.body.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
}

// ---------- Inicialización ----------
function init() {
  const settings = Store.getSettings();
  applyTheme(settings.theme || 'dark');

  wireNav();
  wireHomeControls();
  wireTypingScreen();
  wireResultsScreen();
  wireErrorMapScreen();
  wireSettingsScreen();

  refreshHeader();
  goTo('home');
}

document.addEventListener('DOMContentLoaded', init);
