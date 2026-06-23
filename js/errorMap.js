// errorMap.js — Analiza charStats/wordStats acumulados para detectar patrones
// de error: teclas que se confunden, palabras problemáticas y categorías débiles.

const MIN_ATTEMPTS = 3;

// Combina dos objetos charStats (sumando attempts/correct/errors/confusions).
export function mergeCharStats(base, addition) {
  for (const [ch, s] of Object.entries(addition)) {
    if (!base[ch]) base[ch] = { attempts: 0, correct: 0, errors: 0, confusions: {} };
    base[ch].attempts += s.attempts;
    base[ch].correct += s.correct;
    base[ch].errors += s.errors;
    for (const [t, n] of Object.entries(s.confusions)) {
      base[ch].confusions[t] = (base[ch].confusions[t] || 0) + n;
    }
  }
  return base;
}

export function mergeWordStats(base, addition) {
  for (const [w, s] of Object.entries(addition)) {
    if (!base[w]) base[w] = { attempts: 0, errors: 0, totalMs: 0, totalChars: 0 };
    base[w].attempts += s.attempts;
    base[w].errors += s.errors;
    base[w].totalMs += s.totalMs;
    base[w].totalChars += s.totalChars;
  }
  return base;
}

export function mergeCategoryStats(base, addition) {
  for (const [cat, s] of Object.entries(addition)) {
    if (!base[cat]) base[cat] = { attempts: 0, errors: 0 };
    base[cat].attempts += s.attempts;
    base[cat].errors += s.errors;
  }
  return base;
}

/** Top N caracteres con mayor tasa de error, ponderando por número de intentos. */
export function topProblemChars(charStats, limit = 5) {
  const rows = Object.entries(charStats)
    .filter(([, s]) => s.attempts >= MIN_ATTEMPTS && s.errors > 0)
    .map(([ch, s]) => {
      const errorRate = s.errors / s.attempts;
      const score = errorRate * Math.log2(s.attempts + 1);
      const topConfusion = Object.entries(s.confusions).sort((a, b) => b[1] - a[1])[0];
      return {
        char: ch,
        attempts: s.attempts,
        errors: s.errors,
        errorRate,
        score,
        confusedWith: topConfusion ? topConfusion[0] : null,
        confusedCount: topConfusion ? topConfusion[1] : 0,
      };
    })
    .sort((a, b) => b.score - a.score);
  return rows.slice(0, limit);
}

/**
 * Detecta pares de teclas que se confunden mutuamente (ej. m ↔ n), que son
 * más interesantes que un simple error en una dirección porque indican una
 * confusión real de posición/forma, no solo un descuido aislado.
 */
export function confusionPairs(charStats, limit = 5) {
  const seen = new Map();
  for (const [ch, s] of Object.entries(charStats)) {
    for (const [t, n] of Object.entries(s.confusions)) {
      const key = [ch, t].sort().join('|');
      const prev = seen.get(key) || { a: ch, b: t, count: 0 };
      prev.count += n;
      seen.set(key, prev);
    }
  }
  return Array.from(seen.values()).sort((a, b) => b.count - a.count).slice(0, limit);
}

/** Palabras con tasa de error alta o que se escriben notablemente más lento que el promedio. */
export function problemWords(wordStats, limit = 8) {
  const entries = Object.entries(wordStats).filter(([, s]) => s.attempts >= 2);
  if (!entries.length) return [];

  const globalMsPerChar = entries.reduce((sum, [, s]) => sum + s.totalMs, 0) /
    Math.max(1, entries.reduce((sum, [, s]) => sum + s.totalChars, 0));

  const rows = entries.map(([word, s]) => {
    const errorRate = s.errors / s.attempts;
    const msPerChar = s.totalChars ? s.totalMs / s.totalChars : 0;
    const slowFactor = globalMsPerChar > 0 ? msPerChar / globalMsPerChar : 1;
    const isSlow = word.length >= 7 && slowFactor > 1.4;
    const score = errorRate * 2 + (isSlow ? 0.5 : 0);
    return { word, attempts: s.attempts, errorRate, isSlow, slowFactor, score };
  }).filter(r => r.errorRate > 0 || r.isSlow);

  return rows.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Precisión por categoría: letras, números, símbolos y espacios. */
export function categoryAccuracy(categoryStats) {
  const out = {};
  for (const [cat, s] of Object.entries(categoryStats)) {
    out[cat] = s.attempts ? Math.round(((s.attempts - s.errors) / s.attempts) * 100) : null;
  }
  return out;
}

/** Mensaje dinámico tipo "Tus mayores errores son: r, t y y..." */
export function buildInsightMessage(topChars) {
  if (!topChars.length) {
    return 'Aún no hay suficientes datos. Completa algunas sesiones más para detectar tus teclas débiles.';
  }
  const names = topChars.map(c => c.char);
  let joined;
  if (names.length === 1) joined = names[0];
  else joined = names.slice(0, -1).join(', ') + ' y ' + names[names.length - 1];
  return `Tus mayores errores son: ${joined}. Se generará una práctica enfocada en esas teclas.`;
}

/** Color de calor (de neutro a frío "dominado" a cálido "problemático") como HSL. */
export function heatColor(errorRate, attempts) {
  if (!attempts || attempts < MIN_ATTEMPTS) return null; // sin datos suficientes
  // 0 errores -> verde/teal (160°), errores altos -> rojo/coral (8°)
  const hue = 160 - Math.min(1, errorRate * 1.6) * 152;
  const sat = 70;
  const light = 50;
  const alpha = Math.min(1, 0.25 + Math.log2(attempts + 1) / 8);
  return `hsla(${hue}, ${sat}%, ${light}%, ${alpha.toFixed(2)})`;
}
