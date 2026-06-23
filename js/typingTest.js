// typingTest.js — Motor central del test: avanza con cada carácter escrito,
// calcula PPM/precisión en vivo y registra estadísticas por tecla y por palabra.

export function classifyChar(ch) {
  if (ch === ' ') return 'space';
  if (/[0-9]/.test(ch)) return 'digit';
  if (/[a-zñáéíóúü]/i.test(ch)) return 'letter';
  return 'symbol';
}

export class TypingTest {
  /**
   * @param {string} text Texto objetivo a escribir.
   * @param {object} mode { kind: 'timed'|'free', seconds?: number }
   */
  constructor(text, mode) {
    this.text = text;
    this.mode = mode;
    this.typed = '';
    this.startTime = null;
    this.endTime = null;
    this.finished = false;

    // Acumuladores en vivo para el cálculo de estadísticas finales.
    this.totalKeystrokes = 0;
    this.errorKeystrokes = 0;
    this.categoryStats = {
      letter: { attempts: 0, errors: 0 },
      digit: { attempts: 0, errors: 0 },
      symbol: { attempts: 0, errors: 0 },
      space: { attempts: 0, errors: 0 },
    };

    // charStats[expectedChar] = { attempts, correct, errors, confusions: {typedChar: count} }
    this.charStats = {};
    // wordStats[word] = { attempts, errors, totalMs, totalChars }
    this.wordStats = {};

    this._wordStartIndex = 0;
    this._wordStartTime = null;
    this._wordHadError = false;
  }

  start() {
    this.startTime = performance.now();
    this._wordStartTime = this.startTime;
  }

  get elapsedSec() {
    if (!this.startTime) return 0;
    const end = this.endTime || performance.now();
    return (end - this.startTime) / 1000;
  }

  get remainingSec() {
    if (this.mode.kind !== 'timed') return null;
    return Math.max(0, this.mode.seconds - this.elapsedSec);
  }

  _statFor(ch) {
    if (!this.charStats[ch]) {
      this.charStats[ch] = { attempts: 0, correct: 0, errors: 0, confusions: {} };
    }
    return this.charStats[ch];
  }

  _logChar(expected, typedCh) {
    const stat = this._statFor(expected);
    stat.attempts++;
    this.totalKeystrokes++;

    const cat = classifyChar(expected);
    this.categoryStats[cat].attempts++;

    if (typedCh === expected) {
      stat.correct++;
    } else {
      stat.errors++;
      this.errorKeystrokes++;
      this.categoryStats[cat].errors++;
      stat.confusions[typedCh] = (stat.confusions[typedCh] || 0) + 1;
      this._wordHadError = true;
    }
  }

  _closeWord(endIndex) {
    const word = this.text.slice(this._wordStartIndex, endIndex).trim();
    if (!word) return;
    if (!this.wordStats[word]) {
      this.wordStats[word] = { attempts: 0, errors: 0, totalMs: 0, totalChars: 0 };
    }
    const w = this.wordStats[word];
    w.attempts++;
    if (this._wordHadError) w.errors++;
    w.totalMs += performance.now() - this._wordStartTime;
    w.totalChars += word.length;
  }

  /**
   * Llamar con el valor completo y actual del <input> cada vez que cambie.
   * Solo se registran estadísticas para los caracteres NUEVOS añadidos
   * (un backspace permite corregir sin volver a contar ese tramo).
   */
  onInputValue(newValue) {
    if (!this.startTime) this.start();
    const oldLen = this.typed.length;
    const newLen = newValue.length;

    if (newLen > oldLen) {
      for (let i = oldLen; i < newLen && i < this.text.length; i++) {
        const expected = this.text[i];
        const typedCh = newValue[i];
        this._logChar(expected, typedCh);
        if (expected === ' ') {
          this._closeWord(i);
          this._wordStartIndex = i + 1;
          this._wordStartTime = performance.now();
          this._wordHadError = false;
        }
      }
    }
    this.typed = newValue.slice(0, this.text.length);

    const reachedEnd = this.typed.length >= this.text.length;
    if (this.mode.kind === 'free' && reachedEnd) {
      this._closeWord(this.text.length);
      this.finish();
    }
    return reachedEnd;
  }

  get correctChars() {
    let n = 0;
    for (let i = 0; i < this.typed.length; i++) {
      if (this.typed[i] === this.text[i]) n++;
    }
    return n;
  }

  get liveWpm() {
    const minutes = this.elapsedSec / 60;
    if (minutes <= 0) return 0;
    return Math.round((this.correctChars / 5) / minutes);
  }

  get liveAccuracy() {
    if (this.totalKeystrokes === 0) return 100;
    return Math.round(((this.totalKeystrokes - this.errorKeystrokes) / this.totalKeystrokes) * 100);
  }

  finish() {
    if (this.finished) return this.result();
    this.finished = true;
    this.endTime = performance.now();
    return this.result();
  }

  result() {
    const minutes = Math.max(this.elapsedSec, 0.5) / 60;
    const wpm = Math.round((this.correctChars / 5) / minutes);
    const rawWpm = Math.round((this.typed.length / 5) / minutes);
    const accuracy = this.totalKeystrokes
      ? Math.round(((this.totalKeystrokes - this.errorKeystrokes) / this.totalKeystrokes) * 100)
      : 100;

    return {
      date: new Date().toISOString(),
      mode: this.mode.kind,
      durationSec: Math.round(this.elapsedSec),
      wpm, rawWpm, accuracy,
      charsTyped: this.typed.length,
      errors: this.errorKeystrokes,
      categoryStats: this.categoryStats,
      charStats: this.charStats,
      wordStats: this.wordStats,
    };
  }
}
