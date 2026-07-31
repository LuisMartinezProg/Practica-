// Bestiario: descubre enemigos al derrotarlos por primera vez, reutiliza datos de enemies.js.

function _recordBestiaryKill(type) {
  if (!game.state.bestiary[type]) {
    game.state.bestiary[type] = { discovered: true, timesKilled: 0 };
  }
  game.state.bestiary[type].discovered = true;
  game.state.bestiary[type].timesKilled += 1;
  refreshBestiaryUI();
}

function refreshBestiaryUI() {
  const container = document.getElementById('progress-tab-bestiary');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(ENEMY_DATABASE).forEach(([type, data]) => {
    const entry = game.state.bestiary[type];
    const row = document.createElement('div');
    row.className = 'bestiary-row';

    if (!entry || !entry.discovered) {
      row.innerHTML = `<div class="bestiary-row-name">???</div>`;
    } else {
      const resistText = Object.entries(data.resistances).map(([k, v]) => `${k} x${v}`).join(' · ');
      row.innerHTML = `
        <div class="bestiary-row-name">${data.name} <span class="bestiary-row-count">(x${entry.timesKilled})</span></div>
        <div class="bestiary-row-stats">HP ${data.stats.hp} · ATQ ${data.stats.attack} · DEF ${data.stats.defense}</div>
        <div class="bestiary-row-resist">${resistText}</div>
      `;
    }
    container.appendChild(row);
  });
}

function initBestiary() {
  window.addEventListener('enemyKilled', (e) => _recordBestiaryKill(e.detail.type));
}
