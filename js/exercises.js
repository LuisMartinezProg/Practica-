// exercises.js — Construcción del texto a escribir según tipo y duración.

import {
  WORDS_COMMON, WORDS_HARD, WORDS_LONG,
  PHRASES_SHORT, PHRASES_LONG,
  NUMBER_TEMPLATES, SYMBOL_SNIPPETS,
} from './data.js';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Construye una cadena de palabras sueltas hasta alcanzar minLen caracteres.
function buildFromWordPool(pool, minLen) {
  const words = [];
  let len = 0;
  const bag = shuffle(pool);
  let i = 0;
  while (len < minLen) {
    const w = bag[i % bag.length];
    words.push(w);
    len += w.length + 1;
    i++;
  }
  // Capitalizar la primera palabra para que se vea como una oración.
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function buildFromSnippetPool(pool, minLen) {
  const parts = [];
  let len = 0;
  const bag = shuffle(pool);
  let i = 0;
  while (len < minLen) {
    const s = bag[i % bag.length];
    parts.push(s);
    len += s.length + 1;
    i++;
  }
  return parts.join(' ');
}

function buildNumbers(minLen) {
  const parts = [];
  let len = 0;
  while (len < minLen) {
    const s = pick(NUMBER_TEMPLATES)();
    parts.push(s);
    len += s.length + 1;
  }
  return parts.join('  ');
}

function buildPhrases(minLen, longForm) {
  const pool = longForm ? PHRASES_LONG : PHRASES_SHORT;
  const parts = [];
  let len = 0;
  const bag = shuffle(pool);
  let i = 0;
  while (len < minLen) {
    const s = bag[i % bag.length];
    parts.push(s);
    len += s.length + 1;
    i++;
  }
  return parts.join(' ');
}

// Tamaños objetivo de texto. En modos cronometrados generamos texto generoso
// para que el usuario nunca se quede sin contenido antes de que acabe el tiempo.
const TARGET_LEN = {
  timed15: 220,
  timed30: 420,
  timed60: 850,
  timed120: 1700,
  freeShort: 60,
  freeLong: 320,
};

/**
 * Genera el texto de un ejercicio.
 * @param {string} type 'common' | 'phrases' | 'numbers' | 'symbols' | 'hard' | 'custom'
 * @param {object} duration { kind: 'timed'|'free', seconds?: number, length?: 'short'|'long' }
 * @param {string[]} customWords lista del usuario (solo se usa si type === 'custom')
 */
export function buildExercise(type, duration, customWords = []) {
  let minLen;
  if (duration.kind === 'timed') {
    minLen = TARGET_LEN['timed' + duration.seconds] || TARGET_LEN.timed30;
  } else {
    minLen = duration.length === 'long' ? TARGET_LEN.freeLong : TARGET_LEN.freeShort;
  }

  let text;
  switch (type) {
    case 'phrases':
      text = buildPhrases(minLen, duration.kind === 'free' && duration.length === 'long');
      break;
    case 'numbers':
      text = buildNumbers(minLen);
      break;
    case 'symbols':
      text = buildFromSnippetPool(SYMBOL_SNIPPETS, minLen);
      break;
    case 'hard':
      text = buildFromWordPool(WORDS_HARD.concat(WORDS_LONG), minLen);
      break;
    case 'custom': {
      const pool = customWords && customWords.length ? customWords : WORDS_COMMON;
      text = buildFromWordPool(pool, minLen);
      break;
    }
    default: // 'common'
      text = buildFromWordPool(WORDS_COMMON, minLen);
  }
  return text;
}

// Combina todas las palabras disponibles en una sola bolsa, usada para
// construir la práctica enfocada (focus) a partir del mapa de errores.
function fullWordBag() {
  return WORDS_COMMON
    .concat(WORDS_HARD, WORDS_LONG)
    .concat(PHRASES_SHORT.join(' ').replace(/[¿?¡!.,;:]/g, '').split(' '))
    .filter(w => w.length > 1);
}

/**
 * Genera un ejercicio de práctica enfocada centrado en los caracteres
 * donde el usuario comete más errores. Si no hay suficientes palabras
 * reales que contengan esas letras, rellena con combinaciones sintéticas.
 */
export function buildFocusExercise(problemChars, duration) {
  const minLen = duration.kind === 'timed'
    ? (TARGET_LEN['timed' + duration.seconds] || TARGET_LEN.timed30)
    : TARGET_LEN.freeShort;

  const chars = problemChars.length ? problemChars : ['e', 'a'];
  const bag = fullWordBag();
  const matches = shuffle(bag.filter(w => chars.some(c => w.toLowerCase().includes(c))));

  const words = [];
  let len = 0;
  let i = 0;
  const vowels = ['a', 'e', 'i', 'o', 'u'];

  while (len < minLen) {
    let w;
    if (i < matches.length) {
      w = matches[i];
    } else {
      // No quedan palabras reales suficientes: generamos micro-combinaciones
      // sintéticas que repiten las teclas problemáticas junto a vocales.
      const c = chars[i % chars.length];
      const v = vowels[Math.floor(Math.random() * vowels.length)];
      w = Math.random() > 0.5 ? c + v + c : v + c + v;
    }
    words.push(w);
    len += w.length + 1;
    i++;
  }
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}
