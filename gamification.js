// gamification.js — XP/niveles, rachas, misiones semanales, desafío diario y logros.

import { ACHIEVEMENTS, MISSION_TEMPLATES, DAILY_CHALLENGE_TEMPLATES } from './data.js';

// ---------- PRNG sembrado (mulberry32) para que retos/misiones sean
// consistentes durante el día/semana sin necesitar un servidor. ----------
function hashStr(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}
function seededRandom(seedStr) {
  const seedFn = hashStr(seedStr);
  let state = seedFn();
  return () => {
    state |= 0; state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function isoDateOnly(d = new Date()) { return d.toISOString().slice(0, 10); }
export function isoWeekKey(d = new Date()) {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7)); // lunes de esa semana
  return isoDateOnly(date);
}

// ---------- Niveles ----------
export function xpForLevel(level) {
  return Math.round(80 * Math.pow(level, 1.3) + 40);
}
export function levelFromXp(totalXp) {
  let level = 1, remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level++;
  }
  return { level, xpIntoLevel: remaining, xpForNext: xpForLevel(level) };
}

// ---------- XP por sesión ----------
export function computeSessionXp(result) {
  let xp = Math.round(result.charsTyped / 5) * 2; // 2 xp por palabra neta
  if (result.accuracy >= 98) xp += 25;
  else if (result.accuracy >= 95) xp += 15;
  else if (result.accuracy >= 85) xp += 8;

  if (result.wpm >= 80) xp += 25;
  else if (result.wpm >= 60) xp += 15;
  else if (result.wpm >= 40) xp += 8;

  return Math.max(5, xp);
}

// ---------- Racha ----------
export function updateStreak(profile, now = new Date()) {
  const today = isoDateOnly(now);
  if (profile.lastSessionDate === today) return profile.streak;

  const yesterday = isoDateOnly(new Date(now.getTime() - 86400000));
  if (profile.lastSessionDate === yesterday) {
    profile.streak += 1;
  } else {
    profile.streak = 1;
  }
  profile.lastSessionDate = today;
  return profile.streak;
}

// ---------- Logros ----------
export function checkAchievements(ctx, achievementsState) {
  const unlockedNow = [];
  for (const def of ACHIEVEMENTS) {
    if (achievementsState[def.id]) continue;
    if (def.check(ctx)) {
      achievementsState[def.id] = { unlockedAt: new Date().toISOString() };
      unlockedNow.push(def);
    }
  }
  return unlockedNow;
}

// ---------- Desafío diario ----------
export function generateDailyChallenge(dateStr, avgWpm) {
  const rnd = seededRandom('daily-' + dateStr);
  const def = DAILY_CHALLENGE_TEMPLATES[Math.floor(rnd() * DAILY_CHALLENGE_TEMPLATES.length)];
  const target = def.target(avgWpm, rnd);
  return {
    date: dateStr,
    id: def.id,
    desc: def.desc(target),
    target,
    xp: def.xp,
    progress: 0,
    completed: false,
  };
}

export function evaluateDailyChallenge(challenge, sessionResult, sessionsToday) {
  if (!challenge || challenge.completed) return false;
  let done = false;
  switch (challenge.id) {
    case 'reto_precision':
      done = sessionResult.durationSec >= 55 && sessionResult.accuracy >= challenge.target;
      break;
    case 'reto_numeros':
      done = sessionResult.exerciseType === 'numbers' && sessionResult.accuracy >= challenge.target;
      break;
    case 'reto_simbolos':
      done = sessionResult.exerciseType === 'symbols' && sessionResult.accuracy >= challenge.target;
      break;
    case 'reto_velocidad':
      done = sessionResult.exerciseType === 'phrases' && sessionResult.wpm >= challenge.target;
      break;
    case 'reto_constancia':
      challenge.progress = sessionsToday;
      done = sessionsToday >= challenge.target;
      break;
    case 'reto_perfecto':
      done = sessionResult.durationSec >= 14 && sessionResult.accuracy >= 100;
      break;
  }
  if (done) challenge.completed = true;
  return done;
}

// ---------- Misiones semanales ----------
export function generateWeeklyMissions(weekKey, avgWpm) {
  const rnd = seededRandom('week-' + weekKey);
  const pool = MISSION_TEMPLATES.slice();
  const chosen = [];
  for (let i = 0; i < 3 && pool.length; i++) {
    const idx = Math.floor(rnd() * pool.length);
    chosen.push(pool.splice(idx, 1)[0]);
  }
  return chosen.map(def => {
    const target = def.target(avgWpm, rnd);
    return {
      week: weekKey, id: def.id, metric: def.metric,
      desc: def.desc(target), target, xp: def.xp,
      progress: 0, completed: false,
    };
  });
}

/** weekly = { sessions, words, accuracySum, accuracyCount, days:Set, numberEx, symbolEx, maxWpm } */
export function updateMissionsProgress(missions, weekly) {
  const newlyCompleted = [];
  for (const m of missions) {
    if (m.completed) continue;
    let value = 0;
    switch (m.metric) {
      case 'sessions': value = weekly.sessions; break;
      case 'words': value = weekly.words; break;
      case 'accuracy': value = weekly.accuracyCount ? Math.round(weekly.accuracySum / weekly.accuracyCount) : 0; break;
      case 'days': value = weekly.days.size; break;
      case 'numberEx': value = weekly.numberEx; break;
      case 'symbolEx': value = weekly.symbolEx; break;
      case 'maxWpm': value = weekly.maxWpm; break;
    }
    m.progress = value;
    if (value >= m.target) {
      m.completed = true;
      newlyCompleted.push(m);
    }
  }
  return newlyCompleted;
}
