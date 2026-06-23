// charts.js — Gráficas de línea ligeras dibujadas en <canvas>, sin librerías
// externas. Leen los colores desde las variables CSS para respetar el tema.

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Dibuja una gráfica de línea simple.
 * @param {HTMLCanvasElement} canvas
 * @param {number[]} values
 * @param {object} opts { color, fill, suffix, minY, maxY }
 */
export function drawLineChart(canvas, values, opts = {}) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(rect.width, 1);
  const h = Math.max(rect.height, 1);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const padL = 34, padR = 8, padT = 14, padB = 18;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const color = opts.color || cssVar('--signal');
  const gridColor = cssVar('--grid-line') || 'rgba(255,255,255,0.08)';
  const textColor = cssVar('--text-muted') || '#8590A6';

  if (!values || values.length === 0) {
    ctx.fillStyle = textColor;
    ctx.font = '12px var(--font-mono, monospace)';
    ctx.textAlign = 'center';
    ctx.fillText('Sin datos todavía', w / 2, h / 2);
    return;
  }

  const minY = opts.minY ?? Math.min(...values) * 0.9;
  const maxY = opts.maxY ?? (Math.max(...values) * 1.1 || 1);

  // Líneas de cuadrícula horizontales (3).
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  ctx.font = '10px var(--font-mono, monospace)';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'right';
  for (let i = 0; i <= 2; i++) {
    const y = padT + (plotH * i) / 2;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(w - padR, y);
    ctx.stroke();
    const val = Math.round(maxY - ((maxY - minY) * i) / 2);
    ctx.fillText(String(val), padL - 6, y + 3);
  }

  const stepX = values.length > 1 ? plotW / (values.length - 1) : 0;
  const xAt = (i) => padL + stepX * i;
  const yAt = (v) => padT + plotH - ((v - minY) / (maxY - minY || 1)) * plotH;

  // Relleno bajo la curva.
  if (opts.fill) {
    ctx.beginPath();
    ctx.moveTo(xAt(0), yAt(values[0]));
    values.forEach((v, i) => ctx.lineTo(xAt(i), yAt(v)));
    ctx.lineTo(xAt(values.length - 1), padT + plotH);
    ctx.lineTo(xAt(0), padT + plotH);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Línea principal.
  ctx.beginPath();
  ctx.moveTo(xAt(0), yAt(values[0]));
  values.forEach((v, i) => ctx.lineTo(xAt(i), yAt(v)));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Punto final destacado.
  const lastX = xAt(values.length - 1);
  const lastY = yAt(values[values.length - 1]);
  ctx.beginPath();
  ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}
