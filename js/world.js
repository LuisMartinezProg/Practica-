// Construcción de zonas: los 8 pisos, transición por portal, terreno con desnivel donde aplica.

const ZONE_DATABASE = {
  zone_1: {
    name: 'Pradera del Amanecer',
    groundColor: 0x4a8f3c, skyColor: 0x8ec9e8, groundSize: 100,
    obstacles: [
      { type: 'tree', x: 8, z: -6, scale: 1.2 },
      { type: 'tree', x: -10, z: -12, scale: 1 },
      { type: 'tree', x: 14, z: 10, scale: 1.4 },
      { type: 'tree', x: -16, z: 4, scale: 0.9 },
      { type: 'rock', x: -6, z: 8, scale: 1 },
      { type: 'rock', x: 4, z: -16, scale: 1.3 },
      { type: 'rock', x: 18, z: -2, scale: 0.8 },
    ],
    enemySpawns: [
      { type: 'wolf', x: 6, z: 6 },
      { type: 'wolf', x: -8, z: -4 },
      { type: 'wolf', x: 12, z: -10 },
    ],
    portalPosition: { x: 0, z: -42 }, nextZone: 'zone_2',
  },

  zone_2: {
    name: 'Bosque del Pantano',
    groundColor: 0x2f4a2a, skyColor: 0x3a4a3a, groundSize: 90,
    fogColor: 0x3a4a3a, fogFar: 16,
    obstacles: [
      { type: 'tree', x: 6, z: 20, scale: 1.1 }, { type: 'tree', x: -8, z: 14, scale: 1.3 },
      { type: 'tree', x: 12, z: 0, scale: 1 }, { type: 'tree', x: -14, z: -6, scale: 1.2 },
      { type: 'tree', x: 4, z: -20, scale: 1.4 }, { type: 'tree', x: -6, z: -28, scale: 1 },
      { type: 'rock', x: -2, z: 8, scale: 1.1 }, { type: 'rock', x: 16, z: -14, scale: 0.9 },
    ],
    enemySpawns: [
      { type: 'acechador_matorral', x: 5, z: 10 }, { type: 'acechador_matorral', x: -10, z: 0 },
      { type: 'acechador_matorral', x: 8, z: -18 }, { type: 'acechador_matorral', x: -6, z: -30 },
    ],
    entryPoint: { x: 0, z: 40 },
    portalPosition: { x: 0, z: -38 }, nextZone: 'zone_3',
  },

  zone_3: {
    name: 'Mina Subterránea',
    groundColor: 0x3a3a3a, skyColor: 0x101010, groundSize: 60,
    fogColor: 0x1a1a1a, fogFar: 14,
    obstacles: [
      { type: 'wall', x: -4, z: 14, width: 5, height: 4, depth: 1.2, colorOverride: 0x2e2e2e },
      { type: 'wall', x: 4, z: 6, width: 5, height: 4, depth: 1.2, colorOverride: 0x2e2e2e },
      { type: 'wall', x: -4, z: -2, width: 5, height: 4, depth: 1.2, colorOverride: 0x2e2e2e },
      { type: 'wall', x: 4, z: -10, width: 5, height: 4, depth: 1.2, colorOverride: 0x2e2e2e },
      { type: 'rock', x: -2, z: 20, scale: 1.2, colorOverride: 0x454545 },
      { type: 'rock', x: 2, z: -18, scale: 1.2, colorOverride: 0x454545 },
    ],
    enemySpawns: [
      { type: 'golem_piedra', x: 0, z: 10 }, { type: 'golem_piedra', x: 0, z: 2 }, { type: 'golem_piedra', x: 0, z: -6 },
    ],
    entryPoint: { x: 0, z: 26 },
    portalPosition: { x: 0, z: -26 }, nextZone: 'zone_4',
  },

  zone_4: {
    name: 'Ruinas de Piedra',
    groundColor: 0xb0a080, skyColor: 0xcfc7a8, groundSize: 70,
    bounds: { minX: -31, maxX: 35, minZ: -30, maxZ: 30 },
    heightProfile: [
      { type: 'plateau', minX: -31, maxX: -10, minZ: -30, maxZ: 30, height: 0 },
      { type: 'ramp', minX: -10, maxX: -4, minZ: -30, maxZ: 30, heightStart: 0, heightEnd: 3, axis: 'x' },
      { type: 'plateau', minX: -4, maxX: 14, minZ: -30, maxZ: 30, height: 3 },
      { type: 'ramp', minX: 14, maxX: 20, minZ: -30, maxZ: 30, heightStart: 3, heightEnd: 6, axis: 'x' },
      { type: 'plateau', minX: 20, maxX: 35, minZ: -30, maxZ: 30, height: 6 },
    ],
    obstacles: [
      { type: 'pillar', x: -22, z: 10, height: 4 }, { type: 'pillar', x: -20, z: -12, height: 3.5 },
      { type: 'pillar', x: 2, z: 12, height: 4.5 }, { type: 'pillar', x: 6, z: -14, height: 4 },
      { type: 'pillar', x: 26, z: 8, height: 5 }, { type: 'pillar', x: 28, z: -10, height: 4.5 },
    ],
    enemySpawns: [
      { type: 'arquero_ruinas', x: 0, z: 8 }, { type: 'arquero_ruinas', x: 4, z: -10 },
      { type: 'arquero_ruinas', x: 25, z: 6 }, { type: 'arquero_ruinas', x: 23, z: -8 },
    ],
    entryPoint: { x: -20, z: 0 },
    portalPosition: { x: 27, z: 0 }, nextZone: 'zone_5',
  },

  zone_5: {
    name: 'Fortaleza Abandonada',
    groundColor: 0x55555f, skyColor: 0x2a2a35, groundSize: 85,
    obstacles: [
      { type: 'wall', x: -14, z: 10, width: 6, height: 5, depth: 1.5 }, { type: 'wall', x: 14, z: 10, width: 6, height: 5, depth: 1.5 },
      { type: 'pillar', x: -8, z: -6, height: 5 }, { type: 'pillar', x: 8, z: -6, height: 5 },
      { type: 'wall', x: 0, z: -22, width: 10, height: 5, depth: 1.5 },
    ],
    enemySpawns: [
      { type: 'skeleton_warrior', x: -10, z: 4, groupId: 'patrol_a' },
      { type: 'skeleton_warrior', x: -6, z: 6, groupId: 'patrol_a' },
      { type: 'skeleton_healer', x: -8, z: 2, groupId: 'patrol_a' },
      { type: 'skeleton_warrior', x: 10, z: -12, groupId: 'patrol_b' },
      { type: 'skeleton_warrior', x: 6, z: -14, groupId: 'patrol_b' },
      { type: 'skeleton_healer', x: 8, z: -10, groupId: 'patrol_b' },
    ],
    entryPoint: { x: 0, z: 38 },
    portalPosition: { x: 0, z: -36 }, nextZone: 'zone_6',
  },

  zone_6: {
    name: 'Zona Helada',
    groundColor: 0xdce8f0, skyColor: 0xb8d4e8, groundSize: 90,
    movementSpeedMultiplier: 1.5,
    obstacles: [
      { type: 'rock', x: 6, z: 20, scale: 1.1, colorOverride: 0xe8f2f8 }, { type: 'rock', x: -10, z: 10, scale: 1.3, colorOverride: 0xe8f2f8 },
      { type: 'tree', x: 12, z: -8, scale: 1, colorOverride: { trunk: 0x8fa0a8, foliage: 0xe0f0f5 } },
      { type: 'tree', x: -14, z: -18, scale: 1.2, colorOverride: { trunk: 0x8fa0a8, foliage: 0xe0f0f5 } },
      { type: 'rock', x: 2, z: -28, scale: 0.9, colorOverride: 0xe8f2f8 },
    ],
    enemySpawns: [
      { type: 'elemental_hielo', x: 8, z: 6 }, { type: 'elemental_hielo', x: -8, z: -4 }, { type: 'elemental_hielo', x: 4, z: -20 },
    ],
    entryPoint: { x: 0, z: 42 },
    portalPosition: { x: 0, z: -40 }, nextZone: 'zone_7',
  },

  zone_7: {
    name: 'Torre Ascendente',
    groundColor: 0x606068, skyColor: 0x1a1a28, groundSize: 40,
    bounds: { minX: -11, maxX: 11, minZ: -31, maxZ: 19 },
    heightProfile: [
      { type: 'plateau', minX: -11, maxX: 11, minZ: -31, maxZ: -18, height: 0 },
      { type: 'ramp', minX: -11, maxX: 11, minZ: -18, maxZ: -12, heightStart: 0, heightEnd: 4, axis: 'z' },
      { type: 'plateau', minX: -11, maxX: 11, minZ: -12, maxZ: 0, height: 4 },
      { type: 'ramp', minX: -11, maxX: 11, minZ: 0, maxZ: 6, heightStart: 4, heightEnd: 8, axis: 'z' },
      { type: 'plateau', minX: -11, maxX: 11, minZ: 6, maxZ: 19, height: 8 },
    ],
    obstacles: [
      { type: 'pillar', x: -8, z: -26, height: 4 }, { type: 'pillar', x: 8, z: -26, height: 4 },
      { type: 'pillar', x: -8, z: -4, height: 4 }, { type: 'pillar', x: 8, z: -4, height: 4 },
      { type: 'pillar', x: -8, z: 14, height: 4 }, { type: 'pillar', x: 8, z: 14, height: 4 },
    ],
    enemySpawns: [{ type: 'centinela_torre', x: 0, z: 12 }],
    entryPoint: { x: 0, z: -24 },
    portalPosition: { x: 0, z: 15 }, nextZone: 'zone_8',
    requiresBossDefeated: 'centinela_torre',
  },

  zone_8: {
    name: 'Sala del Guardián',
    groundColor: 0x1a0a0a, skyColor: 0x0a0505, groundSize: 40,
    obstacles: [
      { type: 'wall', x: -16, z: 0, width: 2, height: 5, depth: 30 }, { type: 'wall', x: 16, z: 0, width: 2, height: 5, depth: 30 },
      { type: 'wall', x: 0, z: 18, width: 34, height: 5, depth: 2 },
    ],
    enemySpawns: [{ type: 'guardian_cima', x: 0, z: -6 }],
    entryPoint: { x: 0, z: 16 },
  },
};

const PORTAL_TRIGGER_RADIUS = 2.2;
let _lastPortalLockedNotifAt = 0;

function _zoneNumber(zoneId) {
  return parseInt(zoneId.replace('zone_', ''), 10) || 1;
}

function _makeTree(scale, colorOverride) {
  const group = new THREE.Group();
  const trunkColor = (colorOverride && colorOverride.trunk) || 0x6b4423;
  const foliageColor = (colorOverride && colorOverride.foliage) || 0x2d6a1f;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.4, 6), new THREE.MeshLambertMaterial({ color: trunkColor }));
  trunk.position.y = 0.7;
  const foliage = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 7), new THREE.MeshLambertMaterial({ color: foliageColor }));
  foliage.position.y = 2.1;
  group.add(trunk, foliage);
  group.scale.setScalar(scale);
  return group;
}

function _makeRock(scale, colorOverride) {
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.6, 0), new THREE.MeshLambertMaterial({ color: colorOverride || 0x8a8a8a }));
  rock.position.y = 0.4;
  rock.scale.setScalar(scale);
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  return rock;
}

function _makeWall(width, height, depth, color) {
  const wall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshLambertMaterial({ color: color || 0x707070 }));
  wall.position.y = height / 2;
  return wall;
}

function _makePillar(height, color) {
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, height, 8), new THREE.MeshLambertMaterial({ color: color || 0xa89878 }));
  pillar.position.y = height / 2;
  return pillar;
}

function _buildObstacleMesh(obs) {
  switch (obs.type) {
    case 'tree': return _makeTree(obs.scale || 1, obs.colorOverride);
    case 'rock': return _makeRock(obs.scale || 1, obs.colorOverride);
    case 'wall': return _makeWall(obs.width || 4, obs.height || 3, obs.depth || 1, obs.colorOverride);
    case 'pillar': return _makePillar(obs.height || 4, obs.colorOverride);
    default: return _makeRock(1);
  }
}

function _buildSteppedGround(zoneData) {
  const group = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: zoneData.groundColor });

  zoneData.heightProfile.forEach((region) => {
    const width = region.maxX - region.minX;
    const depth = region.maxZ - region.minZ;
    const segment = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mat);
    segment.rotation.x = -Math.PI / 2;

    const cx = (region.minX + region.maxX) / 2;
    const cz = (region.minZ + region.maxZ) / 2;

    if (region.type === 'plateau') {
      segment.position.set(cx, region.height, cz);
    } else {
      const avgHeight = (region.heightStart + region.heightEnd) / 2;
      segment.position.set(cx, avgHeight, cz);
      const heightDiff = region.heightEnd - region.heightStart;
      const span = region.axis === 'x' ? width : depth;
      const angle = Math.atan2(heightDiff, span);
      if (region.axis === 'x') segment.rotation.z = -angle;
      else segment.rotation.x = -Math.PI / 2 - angle;
    }

    group.add(segment);
  });

  return group;
}

function getGroundHeight(zoneId, x, z) {
  const zoneData = ZONE_DATABASE[zoneId];
  if (!zoneData || !zoneData.heightProfile) return 0;

  for (const region of zoneData.heightProfile) {
    if (x < region.minX || x > region.maxX || z < region.minZ || z > region.maxZ) continue;

    if (region.type === 'plateau') return region.height;

    if (region.type === 'ramp') {
      const t = region.axis === 'x'
        ? (x - region.minX) / (region.maxX - region.minX)
        : (z - region.minZ) / (region.maxZ - region.minZ);
      return region.heightStart + (region.heightEnd - region.heightStart) * Math.max(0, Math.min(1, t));
    }
  }
  return 0;
}

function _makePortal() {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.18, 8, 20), new THREE.MeshBasicMaterial({ color: 0x8fd8ff }));
  const core = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), new THREE.MeshBasicMaterial({ color: 0x1a3a55, transparent: true, opacity: 0.6, side: THREE.DoubleSide }));
  group.add(ring, core);
  group.position.y = 1.3;
  return group;
}

function buildZone(zoneId) {
  const zoneData = ZONE_DATABASE[zoneId];
  if (!zoneData) { console.error(`buildZone: zona desconocida "${zoneId}"`); return; }

  const scene = game.refs.scene;
  const keepLights = new Set();
  scene.traverse((obj) => { if (obj.isLight) keepLights.add(obj); });
  [...scene.children].forEach((child) => { if (!keepLights.has(child)) scene.remove(child); });

  scene.background = new THREE.Color(zoneData.skyColor != null ? zoneData.skyColor : 0x8ec9e8);
  scene.fog = (zoneData.fogColor != null && zoneData.fogFar != null)
    ? new THREE.Fog(zoneData.fogColor, 2, zoneData.fogFar)
    : null;

  if (zoneData.heightProfile) {
    scene.add(_buildSteppedGround(zoneData));
  } else {
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(zoneData.groundSize, zoneData.groundSize), new THREE.MeshLambertMaterial({ color: zoneData.groundColor }));
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
  }

  game.refs.currentObstacles = [];
  (zoneData.obstacles || []).forEach((obs) => {
    const mesh = _buildObstacleMesh(obs);
    mesh.position.x = obs.x;
    mesh.position.z = obs.z;
    scene.add(mesh);

    let radius = 0.5 * (obs.scale || 1);
    if (obs.type === 'wall') radius = Math.max(obs.width || 4, obs.depth || 1) / 2;
    if (obs.type === 'pillar') radius = 0.6;
    game.refs.currentObstacles.push({ x: obs.x, z: obs.z, radius });
  });

  game.refs.currentPortalMesh = null;
  if (zoneData.portalPosition && zoneData.nextZone) {
    const portal = _makePortal();
    portal.position.x = zoneData.portalPosition.x;
    portal.position.z = zoneData.portalPosition.z;
    scene.add(portal);
    game.refs.currentPortalMesh = portal;
  }

  const half = zoneData.groundSize / 2 - 1;
  game.refs.zoneBounds = zoneData.bounds || { minX: -half, maxX: half, minZ: -half, maxZ: half };
}

function transitionToZone(nextZoneId) {
  if (!game.state.unlockedZones.includes(nextZoneId)) game.state.unlockedZones.push(nextZoneId);
  game.state.currentZone = nextZoneId;
  game.state.playerStats.highestZoneReached = Math.max(game.state.playerStats.highestZoneReached, _zoneNumber(nextZoneId));

  buildZone(nextZoneId);
  populateZoneEnemies(nextZoneId);

  const entry = ZONE_DATABASE[nextZoneId].entryPoint || { x: 0, z: 0 };
  const mesh = game.refs.player;
  mesh.position.set(entry.x, getGroundHeight(nextZoneId, entry.x, entry.z), entry.z);
  game.state.player.position.x = entry.x;
  game.state.player.position.z = entry.z;

  showNotification(`Entraste a: ${ZONE_DATABASE[nextZoneId].name}`, 'zone');
  playSound('zoneTransition');
  saveGame();
}

function _notifyPortalLocked() {
  const now = performance.now() / 1000;
  if (now - _lastPortalLockedNotifAt < 4) return;
  _lastPortalLockedNotifAt = now;
  showNotification('El portal está sellado. Derrotá al enemigo de este piso primero.', 'warning');
}

function _checkPortalProximity() {
  const zoneData = ZONE_DATABASE[game.state.currentZone];
  if (!zoneData || !zoneData.portalPosition || !zoneData.nextZone) return;

  const mesh = game.refs.player;
  const dx = mesh.position.x - zoneData.portalPosition.x;
  const dz = mesh.position.z - zoneData.portalPosition.z;
  if (Math.hypot(dx, dz) >= PORTAL_TRIGGER_RADIUS) return;

  if (zoneData.requiresBossDefeated && !game.state.defeatedBosses.includes(zoneData.requiresBossDefeated)) {
    _notifyPortalLocked();
    return;
  }

  transitionToZone(zoneData.nextZone);
}

function _updatePortalAnimation(delta) {
  if (game.refs.currentPortalMesh) game.refs.currentPortalMesh.rotation.z += delta * 0.8;
}

function updateWorld(delta) {
  if (game.refs.uiState.modalOpen) return;
  _checkPortalProximity();
  _updatePortalAnimation(delta);
}

function initWorld() {
  game.registerSystem(updateWorld);
}
