// Pantalla de perfil/stats. Los contadores ya se incrementan desde sus propios sistemas
// (combat.js, player.js, crafting.js, world.js, main.js) — este archivo solo los muestra.

function _formatPlaytime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function refreshStatsUI() {
  const container = document.getElementById('progress-tab-stats');
  if (!container) return;

  const stats = game.state.playerStats;
  const player = game.state.player;
  const zoneName = (ZONE_DATABASE[game.state.currentZone] || {}).name || game.state.currentZone;

  container.innerHTML = `
    <div class="stats-row"><span>Nivel</span><span>${player.level}</span></div>
    <div class="stats-row"><span>Zona actual</span><span>${zoneName}</span></div>
    <div class="stats-row"><span>Cor</span><span>${player.currency}</span></div>
    <div class="stats-row"><span>Tiempo jugado</span><span>${_formatPlaytime(stats.timePlayedSeconds)}</span></div>
    <div class="stats-row"><span>Enemigos derrotados</span><span>${stats.enemiesKilled}</span></div>
    <div class="stats-row"><span>Muertes</span><span>${stats.deaths}</span></div>
    <div class="stats-row"><span>Items crafteados</span><span>${stats.itemsCrafted}</span></div>
    <div class="stats-row"><span>Piso más alto alcanzado</span><span>${stats.highestZoneReached}</span></div>
    <div class="stats-row"><span>Daño total infligido</span><span>${Math.round(stats.totalDamageDealt)}</span></div>
  `;
}

function initStatsTracker() {
  // Sin inicialización adicional: esta función solo renderiza bajo demanda al abrir la pestaña.
}
