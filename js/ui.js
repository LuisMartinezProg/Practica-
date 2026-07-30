// HUD, notificaciones, números de daño flotantes, cooldowns, victoria, ajustes y confirmaciones.
// La sección de Ajustes/Confirmación se inicializa en DOMContentLoaded porque se usa
// también ANTES de que arranque la partida (desde el menú principal).

let _hp, _xp, _stamina, _level, _zoneName, _notifContainer, _fatigueIndicator, _damageNumberContainer;
let _confirmCallback = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('confirm-yes-btn').addEventListener('click', () => {
    document.getElementById('confirm-overlay').classList.add('hidden');
    if (_confirmCallback) _confirmCallback();
    _confirmCallback = null;
  });
  document.getElementById('confirm-no-btn').addEventListener('click', () => {
    document.getElementById('confirm-overlay').classList.add('hidden');
    _confirmCallback = null;
  });

  document.getElementById('settings-toggle-btn').addEventListener('touchstart', (e) => { e.preventDefault(); openSettings(); }, { passive: false });
  document.getElementById('settings-close-btn').addEventListener('click', closeSettings);

  document.getElementById('settings-sound-toggle').addEventListener('click', () => {
    game.state.settings.soundOn = !game.state.settings.soundOn;
    _refreshSettingsUI();
  });

  document.getElementById('settings-sensitivity-slider').addEventListener('input', (e) => {
    game.state.settings.joystickSensitivity = parseFloat(e.target.value);
  });

  document.getElementById('settings-save-btn').addEventListener('click', () => {
    saveGame();
    showNotification('Partida guardada', 'info');
  });

  document.getElementById('victory-dismiss-btn').addEventListener('click', () => {
    document.getElementById('victory-overlay').classList.add('hidden');
    game.refs.uiState.modalOpen = false;
  });
});

function showConfirm(message, onConfirm) {
  document.getElementById('confirm-message').textContent = message;
  _confirmCallback = onConfirm;
  document.getElementById('confirm-overlay').classList.remove('hidden');
}

function _refreshSettingsUI() {
  const soundBtn = document.getElementById('settings-sound-toggle');
  soundBtn.textContent = game.state.settings.soundOn ? '🔊 Activado' : '🔇 Desactivado';

  document.getElementById('settings-sensitivity-slider').value = game.state.settings.joystickSensitivity;
  document.getElementById('settings-save-btn').classList.toggle('hidden', !_gameInitialized);
}

function openSettings() {
  if (typeof closeInventory === 'function') closeInventory();
  if (typeof closeCrafting === 'function') closeCrafting();
  if (_gameInitialized) game.refs.uiState.modalOpen = true;
  _refreshSettingsUI();
  document.getElementById('settings-overlay').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.add('hidden');
  if (_gameInitialized) game.refs.uiState.modalOpen = false;
}

function initUI() {
  _hp = document.getElementById('hp-bar-fill');
  _xp = document.getElementById('xp-bar-fill');
  _stamina = document.getElementById('stamina-bar-fill');
  _level = document.getElementById('hud-level');
  _zoneName = document.getElementById('hud-zone-name');
  _notifContainer = document.getElementById('notification-container');
  _fatigueIndicator = document.getElementById('fatigue-indicator');
  _damageNumberContainer = document.getElementById('damage-number-container');

  game.registerSystem(updateHUD);
}

function updateHUD() {
  const player = game.state.player;
  const stats = player.stats;
  const effective = getEffectiveStats();

  _hp.style.width = `${Math.max(0, (stats.hp / effective.maxHp) * 100)}%`;
  _xp.style.width = `${Math.max(0, (player.xp / player.xpToNextLevel) * 100)}%`;
  _stamina.style.width = `${Math.max(0, (stats.stamina / stats.maxStamina) * 100)}%`;
  _level.textContent = `Nv. ${player.level}`;

  const zoneData = ZONE_DATABASE[game.state.currentZone];
  _zoneName.textContent = zoneData ? zoneData.name : '';

  if (player.fatigueUntil && Date.now() < player.fatigueUntil) {
    const secondsLeft = Math.ceil((player.fatigueUntil - Date.now()) / 1000);
    _fatigueIndicator.textContent = `Fatiga: ${secondsLeft}s`;
    _fatigueIndicator.classList.remove('hidden');
  } else {
    _fatigueIndicator.classList.add('hidden');
    if (player.fatigueUntil) player.fatigueUntil = null;
  }

  updateSkillCooldownOverlays();
}

function updateSkillCooldownOverlays() {
  document.querySelectorAll('.skill-btn').forEach((btn) => {
    const fraction = getSkillCooldownFraction(btn.dataset.skillId);
    btn.querySelector('.skill-btn-cooldown').style.height = `${fraction * 100}%`;
    btn.classList.toggle('on-cooldown', fraction > 0);
  });
}

function getSkillCooldownFraction(skillId) {
  const skill = SWORD_SKILL_DATABASE[skillId];
  if (!skill) return 0;
  const remaining = (game.state.cooldowns[skillId] || 0) - performance.now() / 1000;
  return remaining <= 0 ? 0 : Math.min(1, remaining / skill.cooldown);
}

function refreshSkillButtons() {
  const container = document.getElementById('skill-buttons');
  container.innerHTML = '';

  (game.refs.playerCombat.unlockedSkillIds || []).forEach((skillId) => {
    const skill = SWORD_SKILL_DATABASE[skillId];
    const btn = document.createElement('div');
    btn.className = 'skill-btn touch-btn';
    btn.dataset.skillId = skillId;
    btn.innerHTML = `<div class="skill-btn-cooldown"></div><span class="skill-btn-label">${skill.name}</span>`;

    btn.addEventListener('touchstart', (e) => { e.preventDefault(); startSkillPreMotion(skillId); }, { passive: false });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); releaseSkillPreMotion(skillId); }, { passive: false });
    btn.addEventListener('touchcancel', (e) => { e.preventDefault(); releaseSkillPreMotion(skillId); }, { passive: false });

    container.appendChild(btn);
  });
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

function showDamageNumber(worldPos, amount) {
  const vector = new THREE.Vector3(worldPos.x, worldPos.y + 1.4, worldPos.z);
  vector.project(game.refs.camera);

  const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

  const el = document.createElement('div');
  el.className = 'damage-number';
  el.textContent = amount;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  _damageNumberContainer.appendChild(el);

  requestAnimationFrame(() => el.classList.add('rising'));
  setTimeout(() => el.remove(), 800);
}

function triggerVictory() {
  document.getElementById('victory-overlay').classList.remove('hidden');
  game.refs.uiState.modalOpen = true;
  saveGame();
}
