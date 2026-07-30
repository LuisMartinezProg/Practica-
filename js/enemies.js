
// IA de enemigos, spawns, resistencias, jefes por fases, arqueros a distancia y curanderos.

const ENEMY_DATABASE = {
  wolf: {
    name: 'Lobo salvaje', stats: { hp: 40, attack: 8, defense: 2 },
    resistances: { slashing: 1.0, piercing: 1.0, blunt: 1.0, thrust: 1.0 },
    moveSpeed: 4.5, detectionRadius: 8, attackRadius: 1.3, attackCooldown: 1.2,
    xpReward: 15, currencyReward: 3, color: 0x555555,
    dropTable: [{ itemId: 'material_wolf_pelt', chance: 0.6, minQty: 1, maxQty: 2 }, { itemId: 'material_wolf_fang', chance: 0.35, minQty: 1, maxQty: 1 }],
  },
  acechador_matorral: {
    name: 'Acechador de Matorral', stats: { hp: 65, attack: 12, defense: 4 },
    resistances: { slashing: 1.0, piercing: 1.0, blunt: 1.2, thrust: 0.6 },
    moveSpeed: 5, detectionRadius: 7, attackRadius: 1.3, attackCooldown: 1.1,
    xpReward: 30, currencyReward: 7, color: 0x3d5a2f,
    dropTable: [{ itemId: 'material_stalker_spine', chance: 0.65, minQty: 1, maxQty: 2 }],
  },
  golem_piedra: {
    name: 'Golem de Piedra', stats: { hp: 140, attack: 16, defense: 10 },
    resistances: { slashing: 0.9, piercing: 1.4, blunt: 0.4, thrust: 1.0 },
    moveSpeed: 2.2, detectionRadius: 9, attackRadius: 1.6, attackCooldown: 1.8,
    xpReward: 55, currencyReward: 14, color: 0x707068, scale: 1.4,
    dropTable: [{ itemId: 'material_golem_core', chance: 0.65, minQty: 1, maxQty: 1 }],
  },
  arquero_ruinas: {
    name: 'Arquero en Ruinas', stats: { hp: 85, attack: 13, defense: 5 },
    resistances: { slashing: 1.0, piercing: 1.0, blunt: 1.0, thrust: 1.0 },
    moveSpeed: 3.8, detectionRadius: 12, attackRadius: 8, attackCooldown: 1.6,
    ranged: true, retreatDistance: 4,
    xpReward: 90, currencyReward: 20, color: 0x9a8560,
    dropTable: [{ itemId: 'material_ruin_arrowhead', chance: 0.65, minQty: 1, maxQty: 2 }],
  },
  skeleton_warrior: {
    name: 'Esqueleto Guerrero', stats: { hp: 100, attack: 17, defense: 7 },
    resistances: { slashing: 0.8, piercing: 1.0, blunt: 1.3, thrust: 1.0 },
    moveSpeed: 4, detectionRadius: 10, attackRadius: 1.4, attackCooldown: 1.3,
    xpReward: 110, currencyReward: 24, color: 0xd8d0c0, scale: 1.1,
    dropTable: [{ itemId: 'material_ancient_bone', chance: 0.65, minQty: 1, maxQty: 2 }],
  },
  skeleton_healer: {
    name: 'Esqueleto Curandero', stats: { hp: 90, attack: 10, defense: 6 },
    resistances: { slashing: 0.8, piercing: 1.0, blunt: 1.3, thrust: 1.0 },
    moveSpeed: 4, detectionRadius: 10, attackRadius: 1.4, attackCooldown: 1.5,
    role: 'healer', healAmount: 25, healCooldown: 6,
    xpReward: 130, currencyReward: 28, color: 0xc8d8e8, scale: 1.1,
    dropTable: [{ itemId: 'material_ancient_bone', chance: 0.65, minQty: 1, maxQty: 2 }],
  },
  elemental_hielo: {
    name: 'Elemental de Hielo', stats: { hp: 165, attack: 22, defense: 12 },
    resistances: { slashing: 1.1, piercing: 0.5, blunt: 0.5, thrust: 0.6 },
    moveSpeed: 3, detectionRadius: 10, attackRadius: 1.5, attackCooldown: 1.5,
    onHitEffect: { statAffected: 'speed', modifier: -2, durationMs: 3000 },
    xpReward: 210, currencyReward: 42, color: 0x8fd0e8, scale: 1.2,
    dropTable: [{ itemId: 'material_ice_crystal', chance: 0.65, minQty: 1, maxQty: 2 }],
  },
  centinela_torre: {
    name: 'Centinela de la Torre', stats: { hp: 600, attack: 30, defense: 18 },
    resistances: { slashing: 1.0, piercing: 1.0, blunt: 1.0, thrust: 1.0 },
    moveSpeed: 3.5, detectionRadius: 22, attackRadius: 2.5, attackCooldown: 1.5,
    isBoss: true, scale: 2.2, color: 0x704060,
    xpReward: 900, currencyReward: 150,
    dropTable: [{ itemId: 'material_sentinel_core', chance: 1.0, minQty: 1, maxQty: 1 }],
    phases: [
      { hpThreshold: 1.0 },
      { hpThreshold: 0.5, moveSpeedMultiplier: 1.4, attackMultiplier: 1.3, areaAttack: { radius: 4, damageMultiplier: 1.4, cooldown: 5, windUp: 1.0 } },
    ],
  },
  guardian_cima: {
    name: 'Guardián de la Cima', stats: { hp: 1400, attack: 35, defense: 22 },
    resistances: { slashing: 1.0, piercing: 1.0, blunt: 1.0, thrust: 1.0 },
    moveSpeed: 3.2, detectionRadius: 30, attackRadius: 3, attackCooldown: 1.4,
    isBoss: true, isFinalBoss: true, scale: 2.8, color: 0x2a0a0a,
    xpReward: 2500, currencyReward: 400,
    dropTable: [{ itemId: 'material_guardian_heart', chance: 1.0, minQty: 1, maxQty: 1 }],
    phases: [
      { hpThreshold: 1.0 },
      { hpThreshold: 0.66, attackMultiplier: 1.2, moveSpeedMultiplier: 1.15 },
      { hpThreshold: 0.33, attackMultiplier: 1.4, moveSpeedMultiplier: 1.3, areaAttack: { radius: 5, damageMultiplier: 1.8, cooldown: 6, windUp: 1.3, unblockable: true } },
    ],
  },
};

const ENEMY_AI_CONFIG = { loseInterestRadius: 14 };
let _enemyIdCounter = 0;

function _makeEnemyMesh(color, scale) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.9, 7), new THREE.MeshLambertMaterial({ color }));
  body.position.y = 0.6;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), new THREE.MeshLambertMaterial({ color }));
  head.position.y = 1.2;
  group.add(body, head);
  group.scale.setScalar(scale || 1);
  return group;
}

function _spawnEnemy(type, x, z, groupId) {
  const data = ENEMY_DATABASE[type];
  if (!data) { console.error(`Tipo de enemigo desconocido: ${type}`); return; }

  const mesh = _makeEnemyMesh(data.color, data.scale);
  const groundY = getGroundHeight(game.state.currentZone, x, z);
  mesh.position.set(x, groundY, z);
  game.refs.scene.add(mesh);

  const enemy = {
    id: `enemy_${_enemyIdCounter++}`,
    type, mesh, groupId: groupId || null,
    stats: { ...data.stats, maxHp: data.stats.hp },
    resistances: data.resistances,
    moveSpeed: data.moveSpeed,
    detectionRadius: data.detectionRadius,
    attackRadius: data.attackRadius,
    attackCooldown: data.attackCooldown,
    xpReward: data.xpReward,
    currencyReward: data.currencyReward,
    ranged: !!data.ranged,
    retreatDistance: data.retreatDistance || 0,
    role: data.role || null,
    healAmount: data.healAmount || 0,
    healCooldown: data.healCooldown || 5,
    lastHealTime: 0,
    aiState: 'idle',
    lastAttackTime: 0,
    stunnedUntil: 0,
    spawnPoint: { x, z },
    phaseIndex: 0,
    currentAreaAttack: null,
    areaAttackState: 'idle',
    areaAttackTriggerAt: 0,
    lastAreaAttackTime: 0,
  };

  game.refs.currentEnemies.push(enemy);
  _syncEnemyStateMirror();
  return enemy;
}

function populateZoneEnemies(zoneId) {
  game.refs.currentEnemies = [];
  const zoneData = ZONE_DATABASE[zoneId];
  if (!zoneData || !zoneData.enemySpawns) return;
  zoneData.enemySpawns.forEach((spawn) => {
    if (spawn.type === ENEMY_DATABASE[spawn.type] && 0) return; // no-op, mantiene forma
    if (ENEMY_DATABASE[spawn.type] && ENEMY_DATABASE[spawn.type].isBoss && game.state.defeatedBosses.includes(spawn.type)) return;
    _spawnEnemy(spawn.type, spawn.x, spawn.z, spawn.groupId);
  });
}

function removeEnemy(enemy) {
  game.refs.scene.remove(enemy.mesh);
  game.refs.currentEnemies = game.refs.currentEnemies.filter((e) => e.id !== enemy.id);
  _syncEnemyStateMirror();

  const data = ENEMY_DATABASE[enemy.type];
  if (data.isBoss) {
    if (!game.state.defeatedBosses.includes(enemy.type)) game.state.defeatedBosses.push(enemy.type);
    if (data.isFinalBoss) triggerVictory();
    return;
  }

  setTimeout(() => _spawnEnemy(enemy.type, enemy.spawnPoint.x, enemy.spawnPoint.z, enemy.groupId), 20000);
}

function _syncEnemyStateMirror() {
  game.state.enemies = game.refs.currentEnemies.map((e) => ({ id: e.id, type: e.type, hp: e.stats.hp }));
}

function _applyStunToEnemy(enemy, duration) {
  enemy.stunnedUntil = performance.now() / 1000 + duration;
}

function _updateHealerBehavior(enemy, now) {
  if (enemy.aiState !== 'chasing' && enemy.aiState !== 'attacking') return;
  if (now - enemy.lastHealTime < enemy.healCooldown) return;

  const allies = game.refs.currentEnemies.filter(
    (e) => e.groupId === enemy.groupId && e.id !== enemy.id && e.stats.hp > 0 && e.stats.hp < e.stats.maxHp
  );
  if (allies.length === 0) return;

  allies.sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp));
  const target = allies[0];
  target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + enemy.healAmount);
  enemy.lastHealTime = now;
  showNotification('¡El curandero restauró a un aliado!', 'warning');
}

function _checkBossPhase(enemy, data, now) {
  const nextIndex = enemy.phaseIndex + 1;
  if (nextIndex >= data.phases.length) return;

  const nextPhase = data.phases[nextIndex];
  if (enemy.stats.hp > enemy.stats.maxHp * nextPhase.hpThreshold) return;

  enemy.phaseIndex = nextIndex;
  if (nextPhase.moveSpeedMultiplier) enemy.moveSpeed = data.moveSpeed * nextPhase.moveSpeedMultiplier;
  if (nextPhase.attackMultiplier) enemy.stats.attack = Math.round(data.stats.attack * nextPhase.attackMultiplier);
  enemy.currentAreaAttack = nextPhase.areaAttack || null;
  enemy.areaAttackState = 'idle';
  enemy.lastAreaAttackTime = now;

  showNotification(`¡${data.name} cambia de fase!`, 'boss');
}

function _updateBossAreaAttack(enemy, now) {
  if (!enemy.currentAreaAttack) return;
  const cfg = enemy.currentAreaAttack;

  if (enemy.areaAttackState === 'idle') {
    if (now - enemy.lastAreaAttackTime >= cfg.cooldown) {
      enemy.areaAttackState = 'winding_up';
      enemy.areaAttackTriggerAt = now + (cfg.windUp || 1.2);
      showNotification(cfg.unblockable ? '¡Ataque devastador! ¡Esquivá!' : `${ENEMY_DATABASE[enemy.type].name} prepara un ataque en área`, cfg.unblockable ? 'boss' : 'warning');
    }
  } else if (enemy.areaAttackState === 'winding_up') {
    if (now >= enemy.areaAttackTriggerAt) {
      const playerPos = game.refs.player.position;
      const dist = Math.hypot(playerPos.x - enemy.mesh.position.x, playerPos.z - enemy.mesh.position.z);
      if (dist <= cfg.radius) {
        if (cfg.unblockable) {
          dealUnblockableDamageToPlayer(enemy, cfg.damageMultiplier);
        } else {
          enemyAttackPlayer(enemy, cfg.damageMultiplier);
        }
      }
      enemy.areaAttackState = 'idle';
      enemy.lastAreaAttackTime = now;
    }
  }
}

function _fireProjectile(enemy) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xffdd55 }));
  const start = { x: enemy.mesh.position.x, z: enemy.mesh.position.z };
  const target = { x: game.refs.player.position.x, z: game.refs.player.position.z };
  mesh.position.set(start.x, enemy.mesh.position.y + 1, start.z);
  game.refs.scene.add(mesh);

  game.refs.activeProjectiles.push({ mesh, start, target, elapsed: 0, duration: 0.5, sourceEnemy: enemy });
}

function _updateProjectiles() {
  for (let i = game.refs.activeProjectiles.length - 1; i >= 0; i--) {
    const p = game.refs.activeProjectiles[i];
    p.elapsed += 1 / 60; // aproximación estable independiente del delta variable
    const t = Math.min(1, p.elapsed / p.duration);
    p.mesh.position.x = p.start.x + (p.target.x - p.start.x) * t;
    p.mesh.position.z = p.start.z + (p.target.z - p.start.z) * t;

    if (t >= 1) {
      const dx = p.mesh.position.x - game.refs.player.position.x;
      const dz = p.mesh.position.z - game.refs.player.position.z;
      if (Math.hypot(dx, dz) < 1.2 && p.sourceEnemy.stats.hp > 0) enemyAttackPlayer(p.sourceEnemy);
      game.refs.scene.remove(p.mesh);
      game.refs.activeProjectiles.splice(i, 1);
    }
  }
}

function _updateEnemyAI(enemy, delta) {
  const now = performance.now() / 1000;
  if (now < enemy.stunnedUntil) return;

  const data = ENEMY_DATABASE[enemy.type];
  if (data.phases) {
    _checkBossPhase(enemy, data, now);
    _updateBossAreaAttack(enemy, now);
  }

  const playerPos = game.refs.player.position;
  const dx = playerPos.x - enemy.mesh.position.x;
  const dz = playerPos.z - enemy.mesh.position.z;
  const dist = Math.hypot(dx, dz);

  if (enemy.role === 'healer') _updateHealerBehavior(enemy, now);

  switch (enemy.aiState) {
    case 'idle':
      if (dist <= enemy.detectionRadius) enemy.aiState = 'chasing';
      break;

    case 'chasing':
      if (dist > ENEMY_AI_CONFIG.loseInterestRadius) {
        enemy.aiState = 'idle';
      } else if (enemy.ranged && dist <= enemy.attackRadius) {
        enemy.aiState = dist < enemy.retreatDistance ? 'retreating' : 'attacking';
      } else if (!enemy.ranged && dist <= enemy.attackRadius) {
        enemy.aiState = 'attacking';
      } else if (dist > 0.01) {
        const step = enemy.moveSpeed * delta;
        enemy.mesh.position.x += (dx / dist) * step;
        enemy.mesh.position.z += (dz / dist) * step;
        enemy.mesh.rotation.y = Math.atan2(-dx, -dz);
      }
      break;

    case 'retreating':
      if (dist > ENEMY_AI_CONFIG.loseInterestRadius) {
        enemy.aiState = 'idle';
      } else if (dist >= enemy.retreatDistance * 1.3) {
        enemy.aiState = 'attacking';
      } else if (dist > 0.01) {
        const step = enemy.moveSpeed * delta;
        enemy.mesh.position.x -= (dx / dist) * step;
        enemy.mesh.position.z -= (dz / dist) * step;
        enemy.mesh.rotation.y = Math.atan2(-dx, -dz);
      }
      break;

    case 'attacking':
      if (enemy.ranged) {
        if (dist < enemy.retreatDistance) {
          enemy.aiState = 'retreating';
        } else if (dist > enemy.attackRadius * 1.3) {
          enemy.aiState = 'chasing';
        } else if (now - enemy.lastAttackTime >= enemy.attackCooldown) {
          enemy.lastAttackTime = now;
          _fireProjectile(enemy);
        }
      } else {
        if (dist > enemy.attackRadius * 1.4) {
          enemy.aiState = 'chasing';
        } else if (now - enemy.lastAttackTime >= enemy.attackCooldown) {
          enemy.lastAttackTime = now;
          enemyAttackPlayer(enemy);
        }
      }
      break;
  }

  const groundY = getGroundHeight(game.state.currentZone, enemy.mesh.position.x, enemy.mesh.position.z);
  enemy.mesh.position.y += (groundY - enemy.mesh.position.y) * Math.min(1, 8 * delta);
}

function updateEnemies(delta) {
  if (game.refs.uiState.modalOpen) return;
  game.refs.currentEnemies.forEach((enemy) => _updateEnemyAI(enemy, delta));
  _updateProjectiles();
}

function initEnemies() {
  populateZoneEnemies(game.state.currentZone);
  game.registerSystem(updateEnemies);
}
