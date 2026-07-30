// IA de enemigos, spawns y resistencias. Hito 3-5: solo "Lobo salvaje" (Piso 1).

const ENEMY_DATABASE = {
  wolf: {
    name: 'Lobo salvaje',
    stats: { hp: 40, attack: 8, defense: 2 },
    resistances: { slashing: 1.0, piercing: 1.0, blunt: 1.0, thrust: 1.0 },
    moveSpeed: 4.5,
    detectionRadius: 8,
    attackRadius: 1.3,
    attackCooldown: 1.2,
    xpReward: 15,
    currencyReward: 3,
    color: 0x555555,
    dropTable: [
      { itemId: 'material_wolf_pelt', chance: 0.6, minQty: 1, maxQty: 2 },
      { itemId: 'material_wolf_fang', chance: 0.35, minQty: 1, maxQty: 1 },
      { itemId: 'sword_tempered', chance: 0.03, minQty: 1, maxQty: 1 },
      { itemId: 'armor_iron', chance: 0.03, minQty: 1, maxQty: 1 },
    ],
  },
};

const ENEMY_AI_CONFIG = { loseInterestRadius: 14 };

let _enemyIdCounter = 0;

function _makeEnemyMesh(color) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.35, 0.9, 7),
    new THREE.MeshLambertMaterial({ color })
  );
  body.position.y = 0.6;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 8, 6),
    new THREE.MeshLambertMaterial({ color })
  );
  head.position.y = 1.2;
  group.add(body, head);
  return group;
}

function _spawnEnemy(type, x, z) {
  const data = ENEMY_DATABASE[type];
  if (!data) { console.error(`Tipo de enemigo desconocido: ${type}`); return; }

  const mesh = _makeEnemyMesh(data.color);
  mesh.position.set(x, 0, z);
  game.refs.scene.add(mesh);

  const enemy = {
    id: `enemy_${_enemyIdCounter++}`,
    type, mesh,
    stats: { ...data.stats, maxHp: data.stats.hp },
    resistances: data.resistances,
    moveSpeed: data.moveSpeed,
    detectionRadius: data.detectionRadius,
    attackRadius: data.attackRadius,
    attackCooldown: data.attackCooldown,
    xpReward: data.xpReward,
    currencyReward: data.currencyReward,
    aiState: 'idle',
    lastAttackTime: 0,
    stunnedUntil: 0,
    spawnPoint: { x, z },
  };

  game.refs.currentEnemies.push(enemy);
  _syncEnemyStateMirror();
  return enemy;
}

function populateZoneEnemies(zoneId) {
  game.refs.currentEnemies = [];
  const zoneData = ZONE_DATABASE[zoneId];
  if (!zoneData || !zoneData.enemySpawns) return;
  zoneData.enemySpawns.forEach((spawn) => _spawnEnemy(spawn.type, spawn.x, spawn.z));
}

function removeEnemy(enemy) {
  game.refs.scene.remove(enemy.mesh);
  game.refs.currentEnemies = game.refs.currentEnemies.filter((e) => e.id !== enemy.id);
  _syncEnemyStateMirror();

  setTimeout(() => _spawnEnemy(enemy.type, enemy.spawnPoint.x, enemy.spawnPoint.z), 20000);
}

function _syncEnemyStateMirror() {
  game.state.enemies = game.refs.currentEnemies.map((e) => ({ id: e.id, type: e.type, hp: e.stats.hp }));
}

function _applyStunToEnemy(enemy, duration) {
  enemy.stunnedUntil = performance.now() / 1000 + duration;
}

function _updateEnemyAI(enemy, delta) {
  const now = performance.now() / 1000;
  if (now < enemy.stunnedUntil) return;

  const playerPos = game.refs.player.position;
  const dx = playerPos.x - enemy.mesh.position.x;
  const dz = playerPos.z - enemy.mesh.position.z;
  const dist = Math.hypot(dx, dz);

  switch (enemy.aiState) {
    case 'idle':
      if (dist <= enemy.detectionRadius) enemy.aiState = 'chasing';
      break;

    case 'chasing':
      if (dist > ENEMY_AI_CONFIG.loseInterestRadius) {
        enemy.aiState = 'idle';
      } else if (dist <= enemy.attackRadius) {
        enemy.aiState = 'attacking';
      } else if (dist > 0.01) {
        const step = enemy.moveSpeed * delta;
        enemy.mesh.position.x += (dx / dist) * step;
        enemy.mesh.position.z += (dz / dist) * step;
        enemy.mesh.rotation.y = Math.atan2(-dx, -dz);
      }
      break;

    case 'attacking':
      if (dist > enemy.attackRadius * 1.4) {
        enemy.aiState = 'chasing';
      } else if (now - enemy.lastAttackTime >= enemy.attackCooldown) {
        enemy.lastAttackTime = now;
        enemyAttackPlayer(enemy);
      }
      break;
  }
}

function updateEnemies(delta) {
  if (game.refs.uiState.modalOpen) return;

  game.refs.currentEnemies.forEach((enemy) => _updateEnemyAI(enemy, delta));
}

function initEnemies() {
  populateZoneEnemies(game.state.currentZone);
  game.registerSystem(updateEnemies);
}
