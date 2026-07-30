// Niveles, stats derivados, XP y buffs temporales (activeBuffs).

function _recalculateStatsForLevel(level) {
  const stats = game.state.player.stats;
  stats.maxHp = 100 + (level - 1) * 20;
  stats.attack = 10 + (level - 1) * 3;
  stats.defense = 5 + (level - 1) * 2;
}

function gainXp(amount) {
  const player = game.state.player;
  player.xp += amount;
  let leveledUp = false;

  while (player.xp >= player.xpToNextLevel) {
    player.xp -= player.xpToNextLevel;
    player.level += 1;
    player.xpToNextLevel = Math.round(100 * Math.pow(player.level, 1.5));

    _recalculateStatsForLevel(player.level);
    player.stats.hp = getEffectiveStats().maxHp;

    showLevelUpNotification(player.level);
    leveledUp = true;
  }

  if (leveledUp) {
    playSound('levelup');
    saveGame();
  }
}

function getEffectiveStats() {
  const base = game.state.player.stats;
  const effective = { ...base };

  const equipped = game.state.player.equipped;
  [equipped.weapon, equipped.armor].forEach((eq) => {
    if (!eq) return;
    const item = ITEM_DATABASE[eq.itemId];
    if (item && item.statBonus && eq.durability > 0) {
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

function applyTimedBuff(statAffected, modifier, durationMs) {
  game.state.player.activeBuffs.push({ statAffected, modifier, expiresAt: Date.now() + durationMs });
  _pruneExpiredBuffs();
}

function _pruneExpiredBuffs() {
  const now = Date.now();
  game.state.player.activeBuffs = game.state.player.activeBuffs.filter((b) => b.expiresAt > now);
}
