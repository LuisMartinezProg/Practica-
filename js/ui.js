// HUD permanente (Hito 2). Los menús (inventario, crafteo, quests, logros, bestiario,
// tienda, pausa/ajustes) se agregan en sus propios hitos como overlays nuevos,
// sin tocar lo que ya está armado acá.

let _hp, _xp, _stamina, _level, _notifContainer;

function initUI() {
  _hp = document.getElementById('hp-bar-fill');
  _xp = document.getElementById('xp-bar-fill');
  _stamina = document.getElementById('stamina-bar-fill');
  _level = document.getElementById('hud-level');
  _notifContainer = document.getElementById('notification-container');

  // Botón temporal de testeo — se retira en el Hito 3, cuando el combate dé XP real.
  const debugBtn = document.getElementById('debug-xp-btn');
  if (debugBtn) debugBtn.addEventListener('click', () => gainXp(50));

  game.registerSystem(updateHUD);
}

function updateHUD() {
  const player = game.state.player;
  const stats = player.stats;

  _hp.style.width = `${Math.max(0, (stats.hp / stats.maxHp) * 100)}%`;
  _xp.style.width = `${Math.max(0, (player.xp / player.xpToNextLevel) * 100)}%`;
  _stamina.style.width = `${Math.max(0, (stats.stamina / stats.maxStamina) * 100)}%`;
  _level.textContent = `Nv. ${player.level}`;
}

function showNotification(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `notification notification-${type}`;
  el.textContent = message;
  _notifContainer.appendChild(el);

  requestAnimationFrame(() => el.classList.add('visible'));

  setTimeout(() => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

function showLevelUpNotification(newLevel) {
  showNotification(`¡Subiste a nivel ${newLevel}!`, 'levelup');
}
