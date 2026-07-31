// Logros. Se suscribe a eventos genéricos ya existentes; nunca modifica los emisores.

const ACHIEVEMENT_DATABASE = {
  primera_sangre: { title: 'Primera Sangre', description: 'Derrotá tu primer enemigo.', condition: { type: 'enemiesKilled', value: 1 } },
  superviviente: { title: 'Superviviente', description: 'Alcanzá el Piso 5.', condition: { type: 'zoneReached', value: 5 } },
  maestro_artesano: { title: 'Maestro Artesano', description: 'Crafteá 10 items.', condition: { type: 'itemsCrafted', value: 10 } },
  sin_piedad: { title: 'Sin Piedad', description: 'Derrotá al jefe final.', condition: { type: 'bossDefeated', value: 'guardian_cima' } },
  coleccionista: { title: 'Coleccionista', description: 'Llená tu inventario al menos una vez.', condition: { type: 'inventoryFull' } },
};

function _isConditionMet(condition) {
  switch (condition.type) {
    case 'enemiesKilled': return game.state.playerStats.enemiesKilled >= condition.value;
    case 'zoneReached': return game.state.playerStats.highestZoneReached >= condition.value;
    case 'itemsCrafted': return game.state.playerStats.itemsCrafted >= condition.value;
    case 'bossDefeated': return game.state.defeatedBosses.includes(condition.value);
    case 'inventoryFull': return game.state.inventory.length >= INVENTORY_CONFIG.maxSlots;
    default: return false;
  }
}

function checkAchievements() {
  Object.entries(ACHIEVEMENT_DATABASE).forEach(([id, def]) => {
    if (game.state.achievements.unlocked.includes(id)) return;
    if (_isConditionMet(def.condition)) _unlockAchievement(id, def);
  });
}

function _unlockAchievement(id, def) {
  game.state.achievements.unlocked.push(id);
  playSound('achievementUnlock');
  showNotification(`🏆 Logro desbloqueado: ${def.title}`, 'achievement');
  refreshAchievementsUI();
}

function refreshAchievementsUI() {
  const container = document.getElementById('progress-tab-achievements');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(ACHIEVEMENT_DATABASE).forEach(([id, def]) => {
    const unlocked = game.state.achievements.unlocked.includes(id);
    const row = document.createElement('div');
    row.className = `achievement-row ${unlocked ? 'unlocked' : 'locked'}`;
    row.innerHTML = `
      <div class="achievement-row-title">${unlocked ? '🏆' : '🔒'} ${def.title}</div>
      <div class="achievement-row-desc">${def.description}</div>
    `;
    container.appendChild(row);
  });
}

function initAchievements() {
  window.addEventListener('enemyKilled', checkAchievements);
  window.addEventListener('bossDefeated', checkAchievements);
  window.addEventListener('itemCrafted', checkAchievements);
  window.addEventListener('zoneEntered', checkAchievements);
  window.addEventListener('itemCollected', checkAchievements);

  checkAchievements(); // por si se continúa una partida que ya cumplía alguna condición
}
