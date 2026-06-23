// ui.js — Funciones de renderizado puro. No contienen lógica de negocio:
// reciben datos ya calculados y actualizan el DOM.

import { KEYBOARD_ROWS, NUMBER_ROW, ACHIEVEMENTS } from './data.js';
import { heatColor } from './errorMap.js';
import { drawLineChart } from './charts.js';

const $ = (sel) => document.querySelector(sel);
const $all = (sel) => Array.from(document.querySelectorAll(sel));

// ---------- Navegación entre pantallas ----------
export function showScreen(name) {
  $all('.screen').forEach(s => s.classList.toggle('active', s.dataset.screen === name));
  $all('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
}

// ---------- Toasts ----------
export function toast(html, kind = 'xp') {
  const el = document.createElement('div');
  el.className = 'toast' + (kind === 'signal' ? ' signal' : '');
  el.innerHTML = html;
  $('#toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

// ---------- Cabecera (racha / nivel) ----------
export function renderHeader({ streak, level }) {
  $('#streakValue').textContent = streak;
  $('#levelValue').textContent = level;
}

// ---------- Pantalla de inicio ----------
export function renderHome({ topChars, insightMsg, dailyChallenge }) {
  const focusCard = $('#focusCard');
  if (topChars && topChars.length) {
    focusCard.hidden = false;
    $('#focusMessage').textContent = insightMsg;
  } else {
    focusCard.hidden = true;
  }

  if (dailyChallenge) {
    $('#dailyDesc').textContent = dailyChallenge.desc;
    const pct = Math.min(100, Math.round((dailyChallenge.progress / dailyChallenge.target) * 100));
    $('#dailyBar').style.width = (dailyChallenge.completed ? 100 : pct) + '%';
    $('#dailyXp').textContent = `+${dailyChallenge.xp} XP`;
    $('#dailyStatus').textContent = dailyChallenge.completed ? '✓ Completado' : '';
  }
}

// ---------- Pantalla de escritura ----------
export function buildTextSpans(container, text) {
  container.innerHTML = '';
  const frag = document.createDocumentFragment();
  const spans = [];
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'ch-pending';
    span.textContent = ch;
    frag.appendChild(span);
    spans.push(span);
  }
  container.appendChild(frag);
  if (spans.length) spans[0].className = 'ch-current';
  return spans;
}

export function updateTextSpans(spans, text, typed) {
  const len = spans.length;
  const typedLen = typed.length;
  for (let i = 0; i < len; i++) {
    let cls;
    if (i < typedLen) cls = typed[i] === text[i] ? 'ch-correct' : 'ch-incorrect';
    else if (i === typedLen) cls = 'ch-current';
    else cls = 'ch-pending';
    if (spans[i].className !== cls) spans[i].className = cls;
  }
  const cur = spans[Math.min(typedLen, len - 1)];
  if (cur) cur.scrollIntoView({ block: 'nearest' });
}

export function renderLiveStats({ wpm, acc, time, progressPct }) {
  $('#statWpm').textContent = wpm;
  $('#statAcc').textContent = acc;
  $('#statTime').textContent = time;
  $('#testProgressBar').style.width = Math.max(0, Math.min(100, progressPct)) + '%';
}

// ---------- Pantalla de resultados ----------
const TYPE_LABELS = {
  common: 'Palabras comunes', phrases: 'Frases', numbers: 'Números',
  symbols: 'Símbolos', hard: 'Combinaciones difíciles', custom: 'Personalizadas', focus: 'Práctica enfocada',
};
export function typeLabel(t) { return TYPE_LABELS[t] || t; }

export function renderResults(data) {
  const { result, avgWpm, isFirst, xpGained, levelInfo, leveledUp, sessionInsight, unlockedExtras } = data;
  $('#resWpm').textContent = result.wpm;
  $('#resAcc').textContent = result.accuracy + '%';
  $('#resTime').textContent = result.durationSec + 's';
  $('#resChars').textContent = result.charsTyped;

  $('#compareText').textContent = isFirst
    ? 'Esta es tu primera sesión registrada.'
    : (result.wpm >= avgWpm
        ? `+${result.wpm - avgWpm} PPM sobre tu promedio (${avgWpm} PPM)`
        : `${result.wpm - avgWpm} PPM respecto a tu promedio (${avgWpm} PPM)`);

  $('#xpGain').textContent = `+${xpGained} XP`;
  const pct = Math.round((levelInfo.xpIntoLevel / levelInfo.xpForNext) * 100);
  $('#xpBar').style.width = pct + '%';
  $('#xpSub').textContent = leveledUp
    ? `¡Subiste a nivel ${levelInfo.level}!`
    : `Nivel ${levelInfo.level} — ${levelInfo.xpIntoLevel}/${levelInfo.xpForNext} XP`;

  const insightCard = $('#resultInsightCard');
  if (sessionInsight) {
    insightCard.hidden = false;
    $('#resultInsightText').textContent = sessionInsight;
  } else {
    insightCard.hidden = true;
  }

  const list = $('#unlockedList');
  list.innerHTML = '';
  (unlockedExtras || []).forEach(line => {
    const div = document.createElement('div');
    div.className = 'unlocked-item';
    div.innerHTML = line;
    list.appendChild(div);
  });
}

// ---------- Pantalla de estadísticas ----------
function statBlock(value, label) {
  return `<div class="stat-block"><span class="stat-value">${value}</span><span class="stat-label">${label}</span></div>`;
}

export function renderStats({ avgWpm, avgAcc, bestWpm, totalSessions, totalTimeMin, sessions }) {
  $('#statsSummary').innerHTML =
    statBlock(avgWpm, 'Promedio PPM') +
    statBlock(avgAcc + '%', 'Precisión promedio') +
    statBlock(bestWpm, 'Mejor PPM') +
    statBlock(totalSessions, 'Sesiones') +
    statBlock(totalTimeMin + ' min', 'Tiempo total');

  const recent = sessions.slice(-20);
  drawLineChart($('#chartWpm'), recent.map(s => s.wpm), { fill: true });
  drawLineChart($('#chartAcc'), recent.map(s => s.accuracy), { fill: true, minY: 0, maxY: 100 });

  const list = $('#historyList');
  list.innerHTML = '';
  sessions.slice().reverse().slice(0, 30).forEach(s => {
    const d = new Date(s.date);
    const dateStr = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' }) +
      ' ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    const row = document.createElement('div');
    row.className = 'history-item';
    row.innerHTML = `<div><div>${typeLabel(s.exerciseType)}</div><div class="history-meta">${dateStr} · ${s.durationSec}s</div></div>
      <div class="history-nums">${s.wpm} PPM<br><span class="history-meta">${s.accuracy}%</span></div>`;
    list.appendChild(row);
  });
  if (!sessions.length) list.innerHTML = '<p class="hint-text">Todavía no tienes sesiones registradas.</p>';
}

// ---------- Mapa de errores ----------
function keyLabel(k) { return k === 'ñ' ? 'Ñ' : k.toUpperCase(); }

export function renderErrorMap({ insightMsg, charStats, confusions, topChars, problemWords, categoryAcc }) {
  $('#mapInsightText').textContent = insightMsg;

  const map = $('#keyboardMap');
  map.innerHTML = '';
  const tileRefs = {};
  const rows = [NUMBER_ROW, ...KEYBOARD_ROWS];
  const indentClasses = ['', '', 'indent-1', 'indent-2'];
  rows.forEach((row, ri) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'kb-row ' + (indentClasses[ri] || '');
    row.forEach(k => {
      const tile = document.createElement('div');
      tile.className = 'key-tile';
      tile.textContent = keyLabel(k);
      const s = charStats[k];
      if (s) {
        const color = heatColor(s.errors / Math.max(1, s.attempts), s.attempts);
        if (color) {
          tile.style.background = color;
          tile.style.color = '#fff';
          tile.style.borderColor = 'transparent';
        }
      }
      rowEl.appendChild(tile);
      tileRefs[k] = tile;
    });
    map.appendChild(rowEl);
  });

  // Overlay SVG con arcos entre teclas que se confunden entre sí.
  requestAnimationFrame(() => {
    const old = map.querySelector('.confusion-overlay');
    if (old) old.remove();
    if (!confusions.length) return;
    const mapRect = map.getBoundingClientRect();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'confusion-overlay');
    svg.setAttribute('width', mapRect.width);
    svg.setAttribute('height', mapRect.height);
    confusions.forEach(pair => {
      const ta = tileRefs[pair.a], tb = tileRefs[pair.b];
      if (!ta || !tb) return;
      const ra = ta.getBoundingClientRect(), rb = tb.getBoundingClientRect();
      const x1 = ra.left + ra.width / 2 - mapRect.left, y1 = ra.top + ra.height / 2 - mapRect.top;
      const x2 = rb.left + rb.width / 2 - mapRect.left, y2 = rb.top + rb.height / 2 - mapRect.top;
      const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 18;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`);
      path.setAttribute('stroke', 'var(--error)');
      path.setAttribute('stroke-width', Math.min(3, 1 + pair.count / 4));
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', Math.min(0.85, 0.3 + pair.count / 10));
      svg.appendChild(path);
    });
    map.appendChild(svg);
  });

  const charsList = $('#problemCharsList');
  charsList.innerHTML = '';
  if (!topChars.length) {
    charsList.innerHTML = '<p class="hint-text">Aún no hay suficientes datos.</p>';
  } else {
    topChars.forEach(c => {
      const pill = document.createElement('div');
      pill.className = 'pill';
      const sub = c.confusedWith ? `confundes con "${c.confusedWith}" (${c.confusedCount}×)` : `${c.errors} errores`;
      pill.innerHTML = `<span class="pill-main">${keyLabel(c.char)}</span><span class="pill-sub">${sub}</span>`;
      charsList.appendChild(pill);
    });
  }

  const wordsList = $('#problemWordsList');
  wordsList.innerHTML = '';
  if (!problemWords.length) {
    wordsList.innerHTML = '<p class="hint-text">Aún no hay palabras problemáticas detectadas.</p>';
  } else {
    problemWords.forEach(w => {
      const pill = document.createElement('div');
      pill.className = 'pill';
      const badge = w.isSlow && w.errorRate > 0 ? 'errores + lenta' : (w.isSlow ? 'lenta' : 'errores');
      pill.innerHTML = `<span class="pill-main">${w.word}</span><span class="pill-sub">${badge}</span>`;
      wordsList.appendChild(pill);
    });
  }

  const catLabels = { letter: 'Letras', digit: 'Números', symbol: 'Símbolos', space: 'Espacios' };
  const bars = $('#categoryBars');
  bars.innerHTML = '';
  Object.entries(categoryAcc).forEach(([cat, val]) => {
    if (val === null || cat === 'space') return;
    const row = document.createElement('div');
    row.className = 'category-row';
    row.innerHTML = `<div class="row-top"><span>${catLabels[cat]}</span><span>${val}%</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${val}%"></div></div>`;
    bars.appendChild(row);
  });
}

// ---------- Logros y gamificación ----------
export function renderAchievements({ level, xpIntoLevel, xpForNext, streak, missions, achievementsState }) {
  $('#bigLevel').textContent = level;
  $('#bigStreak').textContent = streak;
  $('#levelBar').style.width = Math.round((xpIntoLevel / xpForNext) * 100) + '%';
  $('#levelSub').textContent = `${xpIntoLevel}/${xpForNext} XP para el siguiente nivel`;

  const mList = $('#missionsList');
  mList.innerHTML = '';
  (missions || []).forEach(m => {
    const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
    const item = document.createElement('div');
    item.className = 'mission-item' + (m.completed ? ' completed' : '');
    item.innerHTML = `<div class="mission-top"><span>${m.completed ? '✓ ' : ''}${m.desc}</span><span class="mission-xp">+${m.xp} XP</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>`;
    mList.appendChild(item);
  });
  if (!missions || !missions.length) mList.innerHTML = '<p class="hint-text">Las misiones se generan al iniciar la semana.</p>';

  const grid = $('#achievementsGrid');
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(def => {
    const unlocked = !!achievementsState[def.id];
    const card = document.createElement('div');
    card.className = 'ach-card ' + (unlocked ? 'unlocked' : 'locked');
    card.innerHTML = `<span class="ach-icon">${unlocked ? '🏆' : '🔒'}</span>
      <div class="ach-name">${def.name}</div>
      <div class="ach-desc">${def.desc}</div>
      <span class="ach-xp">+${def.xp} XP</span>`;
    grid.appendChild(card);
  });
}

// ---------- Ajustes ----------
export function renderSettings({ theme, customWords }) {
  $('#themeSwitch').classList.toggle('on', theme === 'dark');
  $('#themeSwitch').setAttribute('aria-checked', theme === 'dark');
  $('#customWordsArea').value = customWords.join('\n');
  $('#customWordsCount').textContent = `${customWords.length} palabras/frases guardadas`;
}

export { $, $all };
