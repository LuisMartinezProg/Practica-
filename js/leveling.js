// Niveles, stats derivados y XP.

function _recalculateStatsForLevel(level) {
  const stats = game.state.player.stats;
  stats.maxHp = 100 + (level - 1) * 20;
  stats.attack = 10 + (level - 1) * 3;
  stats.defense = 5 + (level - 1) * 2;
}

function gainXp(amount) {
  const player = game.state.player;
  player.xp += amount;

  while (player.xp >= player.xpToNextLevel) {
    player.xp -= player.xpToNextLevel;
    player.level += 1;
    player.xpToNextLevel = Math.round(100 * Math.pow(player.level, 1.5));

    _recalculateStatsForLevel(player.level);
    player.stats.hp = player.stats.maxHp;

    showLevelUpNotification(player.level);
  }
}

// Suma stats base + bonos de equipo + buffs activos + Fatiga.
// combat.js SIEMPRE debe leer stats a través de esta función, nunca player.stats directo.
function getEffectiveStats() {
  const base = game.state.player.stats;
  const effective = { ...base };

  const equipped = game.state.player.equipped;
  [equipped.weapon, equipped.armor].forEach((eq) => {
    if (!eq || typeof ITEM_DATABASE === 'undefined') return;
    const item = ITEM_DATABASE[eq.itemId];
    if (item && item.statBonus) {
      Object.entries(item.statBonus).forEach(([stat, value]) => {
        if (effective[stat] !== undefined) effective[stat] += value;
      });
    }
  });

  const now = Date.now();
  game.state.player.activeBuffs.forEach((buff) => {
    if (buff.expiresAt > now && effective[buff.statAffected] !== undefined) {
      effective[buff.statAffected] += buff.modifier;
    }
  });

  if (game.state.player.fatigueUntil && now < game.state.player.fatigueUntil) {
    effective.attack *= 0.85;
    effective.defense *= 0.85;
  }

  return effective;
}
