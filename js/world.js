// Zonas/pisos, terreno, obstáculos, portales, NPC vendedor. Fuente de verdad de ZONE_DATABASE
// para player.js (getGroundHeight, zoneBounds, currentObstacles), shop.js (vendorPosition),
// enemies.js (enemySpawns) y quests.js (evento zoneEntered).

const ZONE_DATABASE = {
  zone_1: {
    name: 'Pradera Inicial', groundColor: 0x6fae5a, skyColor: 0x8ec9e8,
    bounds: { minX: -40, maxX: 40, minZ: -40, maxZ: 40 },
    entryPoint: { x: 0, z: -30 },
    portalPosition: { x: 0, z: 32 }, nextZone: 'zone_2',
    vendorPosition: { x: 8, z: -20 },
    obstacles: [
      { x: -10, z: 5, radius: 2 }, { x: 12, z: -8, radius: 1.6 }, { x: -18, z: 18, radius: 2.4 },
    ],
    enemySpawns: [
      { type: 'wolf', x: 5, z: 5, groupId: null }, { type: 'wolf', x: -8, z: 10, groupId: null },
      { type: 'wolf', x: 14, z: 0, groupId: null }, { type: 'wolf', x: -4, z: -5, groupId: null },
    ],
  },
  zone_2: {
    name: 'Bosque del Pantano', groundColor: 0x3d5a3f, skyColor: 0x5a7a68,
    bounds: { minX: -35, maxX: 35, minZ: -35, maxZ: 35 },
    entryPoint: { x: 0, z: -28 },
    portalPosition: { x: 0, z: 30 }, nextZone: 'zone_3',
    vendorPosition: { x: -6, z: -18 },
    obstacles: [
      { x: 0, z: 0, radius: 3 }, { x: 15, z: 10, radius: 2 }, { x: -15, z: -10, radius: 2 },
      { x: 8, z: -15, radius: 1.8 }, { x: -10, z: 15, radius: 1.8 },
    ],
    enemySpawns: [
      { type: 'acechador_matorral', x: 6, z: 8, groupId: null }, { type: 'acechador_matorral', x: -9, z: -6, groupId: null },
      { type: 'acechador_matorral', x: 16, z: -4, groupId: null }, { type: 'acechador_matorral', x: -14, z: 12, groupId: null },
    ],
  },
  zone_3: {
    name: 'Mina Subterránea', groundColor: 0x4a4238, skyColor: 0x2a2420,
    bounds: { minX: -22, maxX: 22, minZ: -30, maxZ: 30 },
    entryPoint: { x: 0, z: -26 },
    portalPosition: { x: 0, z: 27 }, nextZone: 'zone_4',
    vendorPosition: { x: 5, z: -16 },
    obstacles: [
      { x: -6, z: 0, radius: 2.5 }, { x: 7, z: 6, radius: 2 }, { x: -4, z: 14, radius: 2 },
      { x: 9, z: -8, radius: 2 }, { x: -10, z: -14, radius: 2.2 },
    ],
    enemySpawns: [
      { type: 'golem_piedra', x: 0, z: 8, groupId: null }, { type: 'golem_piedra', x: -8, z: -4, groupId: null },
      { type: 'golem_piedra', x: 8, z: 15, groupId: null },
    ],
  },
  zone_4: {
    name: 'Ruinas de Piedra', groundColor: 0x8a8270, skyColor: 0xa8a090,
    bounds: { minX: -38, maxX: 38, minZ: -38, maxZ: 38 },
    entryPoint: { x: 0, z: -30 },
    portalPosition: { x: 0, z: 32 }, nextZone: 'zone_5',
    vendorPosition: { x: -8, z: -18 },
    obstacles: [
      { x: 0, z: -5, radius: 3 }, { x: 14, z: 8, radius: 2.2 }, { x: -14, z: 5, radius: 2.2 },
      { x: 6, z: 18, radius: 2 }, { x: -6, z: -18, radius: 2 }, { x: 18, z: -10, radius: 1.8 },
    ],
    enemySpawns: [
      { type: 'arquero_ruinas', x: 10, z: 10, groupId: null }, { type: 'arquero_ruinas', x: -12, z: 8, groupId: null },
      { type: 'arquero_ruinas', x: 4, z: -12, groupId: null }, { type: 'arquero_ruinas', x: -8, z: -16, groupId: null },
    ],
  },
  zone_5: {
    name: 'Fortaleza Abandonada', groundColor: 0x6a5f52, skyColor: 0x7a6f62,
    bounds: { minX: -36, maxX: 36, minZ: -36, maxZ: 36 },
    entryPoint: { x: 0, z: -28 },
    portalPosition: { x: 0, z: 30 }, nextZone: 'zone_6',
    vendorPosition: { x: 9, z: -16 },
    obstacles: [
      { x: 0, z: 0, radius: 3.5 }, { x: 12, z: 12, radius: 2 }, { x: -12, z: 12, radius: 2 },
      { x: 12, z: -12, radius: 2 }, { x: -12, z: -12, radius: 2 },
    ],
    enemySpawns: [
      { type: 'skeleton_warrior', x: 8, z: 6, groupId: 'squad_1' }, { type: 'skeleton_warrior', x: 10, z: 8, groupId: 'squad_1' },
      { type: 'skeleton_healer', x: 9, z: 10, groupId: 'squad_1' },
      { type: 'skeleton_warrior', x: -8, z: -6, groupId: 'squad_2' }, { type: 'skeleton_warrior', x: -10, z: -8, groupId: 'squad_2' },
      { type: 'skeleton_healer', x: -9, z: -10, groupId: 'squad_2' },
    ],
  },
  zone_6: {
    name: 'Zona Helada', groundColor: 0xd8e8ec, skyColor: 0xc0d8e0,
    bounds: { minX: -34, maxX: 34, minZ: -34, maxZ: 34 },
    entryPoint: { x: 0, z: -26 },
    portalPosition: { x: 0, z: 28 }, nextZone: 'zone_7',
    vendorPosition: { x: -7, z: -14 },
    movementSpeedMultiplier: 0.75,
    obstacles: [
      { x: 5, z: 5, radius: 2.2 }, { x: -10, z: 8, radius: 2 }, { x: 14, z: -6, radius: 2 },
      { x: -14, z: -10, radius: 2 },
    ],
    enemySpawns: [
      { type: 'elemental_hielo', x: 6, z: 10, groupId: null }, { type: 'elemental_hielo', x: -9, z: -8, groupId: null },
      { type: 'elemental_hielo', x: 16, z: 4, groupId: null },
    ],
  },
  zone_7: {
    name: 'Torre Ascendente', groundColor: 0x5a5060, skyColor: 0x3a3448,
    bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
    entryPoint: { x: 0, z: -16 },
    portalPosition: { x: 0, z: 18 }, nextZone: 'zone_8',
    vendorPosition: { x: 6, z: -10 },
    obstacles: [
      { x: -5, z: 0, radius: 2 }, { x: 5, z: 5, radius: 2 },
    ],
    enemySpawns: [
      { type: 'centinela_torre', x: 0, z: 6, groupId: null },
    ],
  },
  zone_8: {
    name: 'Cima — Sala del Guardián', groundColor: 0x2a1010, skyColor: 0x1a0808,
    bounds: { minX: -16, maxX: 16, minZ: -16, maxZ: 16 },
    entryPoint: { x: 0, z: -12 },
    portalPosition: null, nextZone: null, // arena final, sin portal de salida
    vendorPosition: null,
    obstacles: [],
    enemySpawns: [
      { type: 'guardian_cima', x: 0, z: 4, groupId: null },
    ],
  },
};

function getGroundHeight(zoneId, x, z) {
  // Terreno plano por piso (low-poly, sin relieve) — punto de extensión documentado
  // si más adelante se quiere terreno con altura variable (README 4.2, mejora futura).
  return 0;
}

function _clearCurrentZone() {
  const scene = game.refs.scene;
  if (!scene) return;

  if (game.refs.currentGroundMesh) scene.remove(game.refs.currentGroundMesh);
  if (game.refs.currentPortalMesh) scene.remove(game.refs.currentPortalMesh);
  if (game.refs.currentVendorMesh) scene.remove(game.refs.currentVendorMesh);
  (game.refs.currentObstacleMeshes || []).forEach((m) => scene.remove(m));

  game.refs.currentGroundMesh = null;
  game.refs.currentPortalMesh = null;
  game.refs.currentVendorMesh = null;
  game.refs.currentObstacleMeshes = [];
}

function _buildGround(zoneData) {
  const width = zoneData.bounds.maxX - zoneData.bounds.minX;
  const depth = zoneData.bounds.maxZ - zoneData.bounds.minZ;
  const geometry = new THREE.PlaneGeometry(width, depth);
  const material = new THREE.MeshLambertMaterial({ color: zoneData.groundColor });
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(
    (zoneData.bounds.minX + zoneData.bounds.maxX) / 2,
    0,
    (zoneData.bounds.minZ + zoneData.bounds.maxZ) / 2
  );
  game.refs.scene.add(ground);
  game.refs.currentGroundMesh = ground;
}

function _buildObstacles(zoneData) {
  game.refs.currentObstacleMeshes = [];
  game.refs.currentObstacles = zoneData.obstacles.map((obs) => ({ x: obs.x, z: obs.z, radius: obs.radius }));

  zoneData.obstacles.forEach((obs) => {
    const geometry = new THREE.CylinderGeometry(obs.radius, obs.radius * 1.1, 1.6, 7);
    const material = new THREE.MeshLambertMaterial({ color: 0x8a7d6a });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(obs.x, 0.8, obs.z);
    game.refs.scene.add(mesh);
    game.refs.currentObstacleMeshes.push(mesh);
  });
}

function _buildPortal(zoneData) {
  if (!zoneData.portalPosition) return;

  const geometry = new THREE.TorusGeometry(1.3, 0.22, 8, 16);
  const material = new THREE.MeshLambertMaterial({ color: 0x4cd0e0, emissive: 0x1a5a66 });
  const portal = new THREE.Mesh(geometry, material);
  portal.position.set(zoneData.portalPosition.x, 1.5, zoneData.portalPosition.z);
  game.refs.scene.add(portal);
  game.refs.currentPortalMesh = portal;
}

function _buildVendor(zoneData) {
  if (!zoneData.vendorPosition) return;

  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 1.15, 7), new THREE.MeshLambertMaterial({ color: 0xc9a24b }));
  body.position.y = 0.7;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), new THREE.MeshLambertMaterial({ color: 0xe0b088 }));
  head.position.y = 1.4;
  group.add(body, head);
  group.position.set(zoneData.vendorPosition.x, 0, zoneData.vendorPosition.z);
  game.refs.scene.add(group);
  game.refs.currentVendorMesh = group;
}

function _checkPortalProximity() {
  const zoneData = ZONE_DATABASE[game.state.currentZone];
  if (!zoneData || !zoneData.portalPosition || !game.refs.player) return;

  const dx = game.refs.player.position.x - zoneData.portalPosition.x;
  const dz = game.refs.player.position.z - zoneData.portalPosition.z;
  if (Math.hypot(dx, dz) < 2) enterZone(zoneData.nextZone);
}

function enterZone(zoneId) {
  if (!zoneId || !ZONE_DATABASE[zoneId]) return;

  saveGame();

  if (!game.state.unlockedZones.includes(zoneId)) game.state.unlockedZones.push(zoneId);
  game.state.currentZone = zoneId;

  const zoneNumber = parseInt(zoneId.replace('zone_', ''), 10);
  if (zoneNumber > game.state.playerStats.highestZoneReached) {
    game.state.playerStats.highestZoneReached = zoneNumber;
  }

  buildZone(zoneId);

  const entry = ZONE_DATABASE[zoneId].entryPoint;
  if (game.refs.player) {
    game.refs.player.position.set(entry.x, getGroundHeight(zoneId, entry.x, entry.z), entry.z);
    game.state.player.position.x = entry.x;
    game.state.player.position.z = entry.z;
  }

  populateZoneEnemies(zoneId);
  playSound('zoneTransition');
  showNotification(`Entraste a: ${ZONE_DATABASE[zoneId].name}`, 'zone');
  game.emit('zoneEntered', { zoneId });
}

function buildZone(zoneId) {
  const zoneData = ZONE_DATABASE[zoneId];
  if (!zoneData) { console.error(`Zona desconocida: ${zoneId}`); return; }

  _clearCurrentZone();

  game.refs.scene.background = new THREE.Color(zoneData.skyColor);
  game.refs.zoneBounds = zoneData.bounds;

  _buildGround(zoneData);
  _buildObstacles(zoneData);
  _buildPortal(zoneData);
  _buildVendor(zoneData);
}

function updateWorld(delta) {
  if (game.refs.uiState.modalOpen) return;
  _checkPortalProximity();
}

function initWorld() {
  game.refs.currentObstacleMeshes = [];
  game.registerSystem(updateWorld);
}
