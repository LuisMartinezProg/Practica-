// Combate: ataque básico, categorías de arma, maestría, sword skills, daño recibido.

const COMBAT_CONFIG = {
  basicAttackRange: 2.2,
  basicAttackHalfAngle: Math.PI / 4,
  basicAttackCooldown: 0.5,
  blockDamageReduction: 0.7,
};

const DAMAGE_CATEGORY_TO_PROFICIENCY_KEY = {
  slashing: 'sword',
  piercing: 'dagger',
  blunt: 'axe',
  thrust: 'spear',
};

const SWORD_SKILL_DATABASE = {
  estocada_simple: {
    name: 'Estocada Simple', category: 'slashing', proficiencyRequired: 0,
    cooldown: 0.8, behavior: 'single', multiplier: 1.3, range: 2.2, halfAngle: Math.PI / 4,
  },
  golpe_giratorio: {
    name: 'Golpe Giratorio', category: 'slashing', proficiencyRequired: 100,
    cooldown: 2.5, behavior: 'aoe360', multiplier: 1.4, range: 2.4,
  },
  filo_ascendente: {
    name: 'Filo Ascendente', category: 'slashing', proficiencyRequired: 500,
    cooldown: 3, behavior: 'comboChain', comboMultipliers: [0.8, 0.8], comboWindow: 1,
    range: 2.2, halfAngle: Math.PI / 4,
  },
  golpe_rapido_doble: {
    name: 'Golpe Rápido Doble', category: 'piercing', proficiencyRequired: 0,
    cooldown: 0.6, behavior: 'multiHit', hits: 2, multiplier: 1.1, hitInterval: 0.12,
    range: 1.8, halfAngle: Math.PI / 4,
  },
  paso_sombra: {
    name: 'Paso Sombra', category: 'piercing', proficiencyRequired: 100,
    cooldown: 2, behavior: 'dash', multiplier: 1.3, dashRange: 4, range: 1.8, halfAngle: Math.PI / 3,
  },
  golpe_aplastante: {
    name: 'Golpe Aplastante', category: 'blunt', proficiencyRequired: 0,
    cooldown: 3.5, behavior: 'single', multiplier: 1.8, range: 2, halfAngle: Math.PI / 4,
    stunChance: 0.35, stunDuration: 1,
  },
  barrido: {
    name: 'Barrido', category: 'blunt', proficiencyRequired: 500,
    cooldown: 3, behavior: 'line', multiplier: 1.2, range: 3.5, halfWidth: 1.2,
  },
  embiste_certero: {
    name: 'Embiste Certero', category: 'thrust', proficiencyRequired: 0,
    cooldown: 1, behavior: 'single', multiplier: 1.4, range: 3.2, halfAngle: Math.PI / 6,
  },
  combo_trueno: {
    name: 'Combo Trueno', category: 'thrust', proficiencyRequired: 1500,
    cooldown: 4, behavior: 'comboChain', comboMultipliers: [0.6, 0.6, 0.8], comboWindow: 1.2,
    range: 3, halfAngle: Math.PI / 6,
  },
};

const PRE_MOTION_DURATION = 0.4;

const _comboChainState = {};

function _getEquippedWeaponCategory() {
  const weapon = game.state.player.equipped.weapon;
  if (!weapon) return 'blunt'; // sin arma: puños
  const item = ITEM_DATABASE[weapon.itemId];
  return item && item.damageCategory ? item.damageCategory : 'blunt';
}

function _canCurrentWeaponBlock() {
  const weapon = game.state.player.equipped.weapon;
  if (!weapon) return false;
  const item = ITEM_DATABASE[weapon.itemId];
  return item ? !!item.canBlock : false;
}

function _gainWeaponProficiency(category) {
  const key = DAMAGE_CATEGORY_TO_PROFICIENCY_KEY[category];
  if (!key) return;
  game.state.player.weaponProficiency[key] += 1;
  checkProficiencyUnlocks(category);
}

function _getProficiency(category) {
  const key = DAMAGE_CATEGORY_TO_PROFICIENCY_KEY[category];
  return key ? game.state.player.weaponProficiency[key] : 0;
}

function _getSkillsForCategory(category) {
  return Object.entries(SWORD_SKILL_DATABASE)
    .filter(([, skill]) => skill.category === category)
    .map(([id, skill]) => ({ id, ...skill }));
}

function checkProficiencyUnlocks(category, silent = false) {
  const proficiency = _getProficiency(category);
  const skills = _getSkillsForCategory(category);
  const previouslyUnlocked = game.refs.playerCombat.unlockedSkillIds || [];

  const nowUnlocked = skills.filter((s) => proficiency >= s.proficiencyRequired).map((s) => s.id);
  const newlyUnlocked = nowUnlocked.filter((id) => !previouslyUnlocked.includes(id));

  game.refs.playerCombat.unlockedSkillIds = nowUnlocked;

  if (!silent) {
    newlyUnlocked.forEach((id) => {
      showNotification(`¡Nueva sword skill: ${SWORD_SKILL_DATABASE[id].name}!`, 'skill');
    });
  }

  refreshSkillButtons();
}

function _getPlayerForward() {
  const rot = game.refs.player.rotation.y;
  return { x: -Math.sin(rot), z: -Math.cos(rot) };
}

function _findEnemiesInCone(range, halfAngle) {
  const playerPos = game.refs.player.position;
  const forward = _getPlayerForward();
  const results = [];
  for (const enemy of game.refs.currentEnemies) {
    if (enemy.stats.hp <= 0) continue;
    const dx = enemy.mesh.position.x - playerPos.x;
    const dz = enemy.mesh.position.z - playerPos.z;
    const dist = Math.hypot(dx, dz);
    if (dist > range || dist < 0.001) continue;
    const dot = (dx / dist) * forward.x + (dz / dist) * forward.z;
    const angle = Math.acos(Math.max(-1, Math.min(1, dot)));
    if (angle <= halfAngle) results.push({ enemy, dist });
  }
  return results.sort((a, b) => a.dist - b.dist);
}

function _findEnemiesInRadius(range) {
  const playerPos = game.refs.player.position;
  const results = [];
  for (const enemy of game.refs.currentEnemies) {
    if (enemy.stats.hp <= 0) continue;
    const dist = Math.hypot(enemy.mesh.position.x - playerPos.x, enemy.mesh.position.z - playerPos.z);
    if (dist <= range) results.push({ enemy, dist });
  }
  return results.sort((a, b) => a.dist - b.dist);
}

function _dealDamageToEnemy(enemy, baseAttack, category) {
  const resistance = (enemy.resistances && enemy.resistances[category]) ?? 1.0;
  const rawDamage = (baseAttack - enemy.stats.defense) * resistance;
  const damage = Math.max(1, Math.round(rawDamage));

  enemy.stats.hp -= damage;
  game.state.playerStats.totalDamageDealt += damage;
  damageEquippedWeapon(); // desgaste del arma equipada

  showDamageNumber(enemy.mesh.position, damage);

  if (enemy.stats.hp <= 0) _killEnemy(enemy);
  return damage;
}

function _killEnemy(enemy) {
  gainXp(enemy.xpReward);
  game.state.player.currency += enemy.currencyReward;
  game.state.playerStats.enemiesKilled += 1;

  _rollEnemyDropTable(enemy);

  game.emit('enemyKilled', { type: enemy.type, xpReward: enemy.xpReward, currencyReward: enemy.currencyReward });

  removeEnemy(enemy);
}

function _rollEnemyDropTable(enemy) {
  const data = ENEMY_DATABASE[enemy.type];
  if (!data || !data.dropTable) return;

  data.dropTable.forEach((drop) => {
    if (Math.random() > drop.chance) return;
    const qty = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty;
    const result = addItem(drop.itemId, qty);
    if (result.added > 0) {
      const itemData = ITEM_DATABASE[drop.itemId];
      showNotification(`+${result.added} ${itemData.name}`, 'loot');
    }
  });
}

function _applySkillDamage(enemy, skill, multiplierOverride) {
  const mult = multiplierOverride != null ? multiplierOverride : skill.multiplier;
  _dealDamageToEnemy(enemy, getEffectiveStats().attack * mult, skill.category);

  if (skill.stunChance && Math.random() < skill.stunChance) {
    _applyStunToEnemy(enemy, skill.stunDuration);
  }
}

function performBasicAttack() {
  const now = performance.now() / 1000;
  if ((game.state.cooldowns['basicAttack'] || 0) > now) return;
  if (game.refs.playerCombat.isBlocking) return;
  if (now < game.refs.playerCombat.dodgeActiveUntil) return;

  game.state.cooldowns['basicAttack'] = now + COMBAT_CONFIG.basicAttackCooldown;

  const category = _getEquippedWeaponCategory();
  const hits = _findEnemiesInCone(COMBAT_CONFIG.basicAttackRange, COMBAT_CONFIG.basicAttackHalfAngle);
  if (hits.length > 0) {
    _dealDamageToEnemy(hits[0].enemy, getEffectiveStats().attack, category);
    _gainWeaponProficiency(category);
  }
  playSwingAnimation();
}

function canUseSkill(skillId) {
  const skill = SWORD_SKILL_DATABASE[skillId];
  if (!skill) return false;
  const now = performance.now() / 1000;
  if ((game.state.cooldowns[skillId] || 0) > now) return false;
  if (_getProficiency(skill.category) < skill.proficiencyRequired) return false;
  if (skill.category !== _getEquippedWeaponCategory()) return false;
  if (game.refs.playerCombat.isBlocking) return false;
  if (now < game.refs.playerCombat.dodgeActiveUntil) return false;
  return true;
}

function startSkillPreMotion(skillId) {
  if (!canUseSkill(skillId)) return;
  game.refs.playerCombat.preMotionSkillId = skillId;
  game.refs.playerCombat.preMotionStartAt = performance.now() / 1000;
}

function releaseSkillPreMotion(skillId) {
  const pc = game.refs.playerCombat;
  if (pc.preMotionSkillId !== skillId) return;

  const held = performance.now() / 1000 - pc.preMotionStartAt;
  pc.preMotionSkillId = null;

  if (held >= PRE_MOTION_DURATION) executeSwordSkill(skillId);
}

function executeSwordSkill(skillId) {
  const skill = SWORD_SKILL_DATABASE[skillId];
  if (!skill) return;

  game.state.cooldowns[skillId] = performance.now() / 1000 + skill.cooldown;

  switch (skill.behavior) {
    case 'single': _executeSingleHitSkill(skill); break;
    case 'aoe360': _executeAoe360Skill(skill); break;
    case 'line': _executeLineSkill(skill); break;
    case 'dash': _executeDashSkill(skill); break;
    case 'multiHit': _executeMultiHitSkill(skill); break;
    case 'comboChain': _executeComboChainSkill(skillId, skill); break;
  }

  playSwingAnimation();
  _gainWeaponProficiency(skill.category);
}

function _executeSingleHitSkill(skill) {
  const hits = _findEnemiesInCone(skill.range, skill.halfAngle);
  if (hits.length > 0) _applySkillDamage(hits[0].enemy, skill);
}

function _executeAoe360Skill(skill) {
  _findEnemiesInRadius(skill.range).forEach(({ enemy }) => _applySkillDamage(enemy, skill));
}

function _executeLineSkill(skill) {
  const playerPos = game.refs.player.position;
  const forward = _getPlayerForward();
  const rightX = -forward.z;
  const rightZ = forward.x;

  game.refs.currentEnemies.forEach((enemy) => {
    if (enemy.stats.hp <= 0) return;
    const dx = enemy.mesh.position.x - playerPos.x;
    const dz = enemy.mesh.position.z - playerPos.z;
    const forwardDist = dx * forward.x + dz * forward.z;
    const lateralDist = Math.abs(dx * rightX + dz * rightZ);
    if (forwardDist >= 0 && forwardDist <= skill.range && lateralDist <= skill.halfWidth) {
      _applySkillDamage(enemy, skill);
    }
  });
}

function _executeDashSkill(skill) {
  const hits = _findEnemiesInCone(skill.dashRange, skill.halfAngle);
  if (hits.length === 0) return;
  const target = hits[0].enemy;

  const mesh = game.refs.player;
  const dx = target.mesh.position.x - mesh.position.x;
  const dz = target.mesh.position.z - mesh.position.z;
  const dist = Math.hypot(dx, dz);
  const stopShort = 1;
  if (dist > stopShort) {
    const ratio = (dist - stopShort) / dist;
    mesh.position.x += dx * ratio;
    mesh.position.z += dz * ratio;
  }

  _applySkillDamage(target, skill);
}

function _executeMultiHitSkill(skill) {
  let hitCount = 0;
  const doHit = () => {
    if (hitCount >= skill.hits) return;
    hitCount += 1;
    const hits = _findEnemiesInCone(skill.range, skill.halfAngle);
    if (hits.length > 0) _applySkillDamage(hits[0].enemy, skill);
    if (hitCount < skill.hits) setTimeout(doHit, skill.hitInterval * 1000);
  };
  doHit();
}

function _executeComboChainSkill(skillId, skill) {
  const now = performance.now() / 1000;
  let chain = _comboChainState[skillId];
  if (!chain || now > chain.expiresAt) chain = { hitIndex: 0, expiresAt: 0 };

  const hits = _findEnemiesInCone(skill.range, skill.halfAngle);
  if (hits.length > 0) _applySkillDamage(hits[0].enemy, skill, skill.comboMultipliers[chain.hitIndex]);

  chain.hitIndex += 1;
  if (chain.hitIndex >= skill.comboMultipliers.length) {
    delete _comboChainState[skillId];
  } else {
    chain.expiresAt = now + skill.comboWindow;
    _comboChainState[skillId] = chain;
  }
}

function enemyAttackPlayer(enemy) {
  const now = performance.now() / 1000;
  if (now < game.refs.playerCombat.invulnerableUntil) return;

  const effective = getEffectiveStats();
  const baseDamage = Math.max(1, enemy.stats.attack - effective.defense);
  const finalDamage = game.refs.playerCombat.isBlocking
    ? baseDamage * (1 - COMBAT_CONFIG.blockDamageReduction)
    : baseDamage;
  applyDamageToPlayer(finalDamage);
}

function applyDamageToPlayer(amount) {
  const stats = game.state.player.stats;
  stats.hp = Math.max(0, stats.hp - Math.round(amount));
  damageEquippedArmor(); // desgaste de la armadura equipada
  showNotification(`-${Math.round(amount)} HP`, 'damage');
  if (stats.hp <= 0) handlePlayerDeath();
}

function _setupCombatButtons() {
  document.getElementById('attack-btn').addEventListener('touchstart', (e) => {
    e.preventDefault(); performBasicAttack();
  }, { passive: false });

  document.getElementById('dodge-btn').addEventListener('touchstart', (e) => {
    e.preventDefault(); performDodge();
  }, { passive: false });

  const blockBtn = document.getElementById('block-btn');
  blockBtn.addEventListener('touchstart', (e) => { e.preventDefault(); startBlock(); }, { passive: false });
  blockBtn.addEventListener('touchend', (e) => { e.preventDefault(); endBlock(); }, { passive: false });
  blockBtn.addEventListener('touchcancel', (e) => { e.preventDefault(); endBlock(); }, { passive: false });
}

function initCombat() {
  _setupCombatButtons();
  checkProficiencyUnlocks(_getEquippedWeaponCategory(), true);
  game.registerSystem(updateCombat);
}

function updateCombat(delta) {
  // Punto de extensión documentado en el README (4.2); sin lógica por frame todavía.
}
