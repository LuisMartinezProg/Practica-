// Sistema de misiones. Se suscribe a eventos genéricos ya emitidos por otros sistemas
// (enemyKilled, itemCollected, zoneEntered) sin que esos archivos sepan que quests.js existe.

const QUEST_DATABASE = {
  q_z1_kill: { title: 'Control de Plaga', description: 'Derrotá 5 lobos salvajes.', type: 'kill', target: 'wolf', requiredAmount: 5, rewardXp: 40, rewardCurrency: 10, zone: 'zone_1' },
  q_z1_collect: { title: 'Materiales Básicos', description: 'Conseguí 5 pieles de lobo.', type: 'collect', target: 'material_wolf_pelt', requiredAmount: 5, rewardXp: 40, rewardCurrency: 10, zone: 'zone_1' },
  q_z1_reach: { title: 'Hacia el Pantano', description: 'Llegá al Bosque del Pantano.', type: 'reachZone', target: 'zone_2', requiredAmount: 1, rewardXp: 30, rewardCurrency: 15, zone: 'zone_1' },

  q_z2_kill: { title: 'Limpieza del Matorral', description: 'Derrotá 5 acechadores de matorral.', type: 'kill', target: 'acechador_matorral', requiredAmount: 5, rewardXp: 90, rewardCurrency: 20, zone: 'zone_2' },
  q_z2_collect: { title: 'Espinas Útiles', description: 'Conseguí 5 espinas de acechador.', type: 'collect', target: 'material_stalker_spine', requiredAmount: 5, rewardXp: 90, rewardCurrency: 20, zone: 'zone_2' },
  q_z2_reach: { title: 'Hacia la Mina', description: 'Llegá a la Mina Subterránea.', type: 'reachZone', target: 'zone_3', requiredAmount: 1, rewardXp: 70, rewardCurrency: 25, zone: 'zone_2' },

  q_z3_kill: { title: 'Demolición', description: 'Derrotá 4 golems de piedra.', type: 'kill', target: 'golem_piedra', requiredAmount: 4, rewardXp: 150, rewardCurrency: 35, zone: 'zone_3' },
  q_z3_collect: { title: 'Núcleos de Golem', description: 'Conseguí 4 núcleos de golem.', type: 'collect', target: 'material_golem_core', requiredAmount: 4, rewardXp: 150, rewardCurrency: 35, zone: 'zone_3' },
  q_z3_reach: { title: 'Hacia las Ruinas', description: 'Llegá a las Ruinas de Piedra.', type: 'reachZone', target: 'zone_4', requiredAmount: 1, rewardXp: 120, rewardCurrency: 40, zone: 'zone_3' },

  q_z4_kill: { title: 'Silencio a los Arqueros', description: 'Derrotá 4 arqueros en ruinas.', type: 'kill', target: 'arquero_ruinas', requiredAmount: 4, rewardXp: 220, rewardCurrency: 50, zone: 'zone_4' },
  q_z4_collect: { title: 'Puntas de Flecha', description: 'Conseguí 4 puntas de flecha en ruinas.', type: 'collect', target: 'material_ruin_arrowhead', requiredAmount: 4, rewardXp: 220, rewardCurrency: 50, zone: 'zone_4' },
  q_z4_reach: { title: 'Hacia la Fortaleza', description: 'Llegá a la Fortaleza Abandonada.', type: 'reachZone', target: 'zone_5', requiredAmount: 1, rewardXp: 180, rewardCurrency: 55, zone: 'zone_4' },

  q_z5_kill: { title: 'Descanso Eterno', description: 'Derrotá 6 esqueletos guerreros.', type: 'kill', target: 'skeleton_warrior', requiredAmount: 6, rewardXp: 320, rewardCurrency: 70, zone: 'zone_5' },
  q_z5_collect: { title: 'Huesos Antiguos', description: 'Conseguí 6 huesos antiguos.', type: 'collect', target: 'material_ancient_bone', requiredAmount: 6, rewardXp: 320, rewardCurrency: 70, zone: 'zone_5' },
  q_z5_reach: { title: 'Hacia el Hielo', description: 'Llegá a la Zona Helada.', type: 'reachZone', target: 'zone_6', requiredAmount: 1, rewardXp: 260, rewardCurrency: 80, zone: 'zone_5' },

  q_z6_kill: { title: 'Deshielo', description: 'Derrotá 4 elementales de hielo.', type: 'kill', target: 'elemental_hielo', requiredAmount: 4, rewardXp: 450, rewardCurrency: 100, zone: 'zone_6' },
  q_z6_collect: { title: 'Cristales de Hielo', description: 'Conseguí 4 cristales de hielo.', type: 'collect', target: 'material_ice_crystal', requiredAmount: 4, rewardXp: 450, rewardCurrency: 100, zone: 'zone_6' },
  q_z6_reach: { title: 'Hacia la Torre', description: 'Llegá a la Torre Ascendente.', type: 'reachZone', target: 'zone_7', requiredAmount: 1, rewardXp: 380, rewardCurrency: 110, zone: 'zone_6' },

  q_z7_kill: { title: 'El Centinela', description: 'Derrotá al Centinela de la Torre.', type: 'kill', target: 'centinela_torre', requiredAmount: 1, rewardXp: 600, rewardCurrency: 150, zone: 'zone_7' },

  q_z8_kill: { title: 'El Guardián Final', description: 'Derrotá al Guardián de la Cima.', type: 'kill', target: 'guardian_cima', requiredAmount: 1, rewardXp: 1000, rewardCurrency: 250, zone: 'zone_8' },
};

function updateQuestProgress(type, target, amount) {
  game.state.quests.active.forEach((q) => {
    const def = QUEST_DATABASE[q.questId];
    if (!def || def.type !== type || def.target !== target) return;
    q.progress = Math.min(def.requiredAmount, q.progress + amount);
    if (q.progress >= def.requiredAmount) completeQuest(q.questId);
  });
  refreshQuestUI();
}

function completeQuest(questId) {
  const def = QUEST_DATABASE[questId];
  if (!def) return;
  if (game.state.quests.completed.includes(questId)) return;

  game.state.quests.active = game.state.quests.active.filter((q) => q.questId !== questId);
  game.state.quests.completed.push(questId);

  if (def.rewardXp) gainXp(def.rewardXp);
  if (def.rewardCurrency) game.state.player.currency += def.rewardCurrency;
  if (def.rewardItems) def.rewardItems.forEach((r) => addItem(r.itemId, r.quantity));

  playSound('questComplete');
  showNotification(`¡Misión completa: ${def.title}!`, 'quest');
  refreshQuestUI();
}

function _activateQuestsForZone(zoneId) {
  Object.entries(QUEST_DATABASE).forEach(([questId, def]) => {
    if (def.zone !== zoneId) return;
    const alreadyActive = game.state.quests.active.some((q) => q.questId === questId);
    const alreadyDone = game.state.quests.completed.includes(questId);
    if (!alreadyActive && !alreadyDone) game.state.quests.active.push({ questId, progress: 0 });
  });
  refreshQuestUI();
}

function refreshQuestUI() {
  const container = document.getElementById('progress-tab-quests');
  if (!container) return;
  container.innerHTML = '';

  if (game.state.quests.active.length === 0) {
    container.innerHTML = '<div class="progress-empty">No hay misiones activas.</div>';
    return;
  }

  game.state.quests.active.forEach((q) => {
    const def = QUEST_DATABASE[q.questId];
    if (!def) return;
    const pct = Math.min(100, (q.progress / def.requiredAmount) * 100);

    const row = document.createElement('div');
    row.className = 'quest-row';
    row.innerHTML = `
      <div class="quest-row-title">${def.title}</div>
      <div class="quest-row-desc">${def.description}</div>
      <div class="quest-row-progress-bg"><div class="quest-row-progress-fill" style="width:${pct}%"></div></div>
      <div class="quest-row-progress-text">${q.progress}/${def.requiredAmount}</div>
    `;
    container.appendChild(row);
  });
}

function initQuests() {
  window.addEventListener('enemyKilled', (e) => updateQuestProgress('kill', e.detail.type, 1));
  window.addEventListener('itemCollected', (e) => updateQuestProgress('collect', e.detail.itemId, e.detail.amount));
  window.addEventListener('zoneEntered', (e) => {
    updateQuestProgress('reachZone', e.detail.zoneId, 1);
    _activateQuestsForZone(e.detail.zoneId);
  });

  _activateQuestsForZone(game.state.currentZone);
}
