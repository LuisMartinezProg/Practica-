// Construcción de zonas. Hito 1: solo zone_1 (terreno + obstáculos low-poly).
// Hito 6 agrega zone_2..zone_8 como nuevas entradas en ZONE_DATABASE; buildZone() no cambia de forma.

const ZONE_DATABASE = {
  zone_1: {
    name: 'Pradera del Amanecer',
    groundColor: 0x4a8f3c,
    groundSize: 100,
    obstacles: [
      { type: 'tree', x: 8, z: -6, scale: 1.2 },
      { type: 'tree', x: -10, z: -12, scale: 1 },
      { type: 'tree', x: 14, z: 10, scale: 1.4 },
      { type: 'tree', x: -16, z: 4, scale: 0.9 },
      { type: 'rock', x: -6, z: 8, scale: 1 },
      { type: 'rock', x: 4, z: -16, scale: 1.3 },
      { type: 'rock', x: 18, z: -2, scale: 0.8 },
    ],
    // enemySpawns: []   -> TODO(Hito 3)
    enemySpawns: [
      { type: 'wolf', x: 6, z: 6 },
      { type: 'wolf', x: -8, z: -4 },
      { type: 'wolf', x: 12, z: -10 },
    ],
  },
    // vendorPosition    -> TODO(Hito 7.5)
    // portalPosition    -> TODO(Hito 6)
  },
};

function _makeTree(scale) {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 1.4, 6),
    new THREE.MeshLambertMaterial({ color: 0x6b4423 })
  );
  trunk.position.y = 0.7;
  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 7),
    new THREE.MeshLambertMaterial({ color: 0x2d6a1f })
  );
  foliage.position.y = 2.1;
  group.add(trunk, foliage);
  group.scale.setScalar(scale);
  return group;
}

function _makeRock(scale) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.6, 0),
    new THREE.MeshLambertMaterial({ color: 0x8a8a8a })
  );
  rock.position.y = 0.4;
  rock.scale.setScalar(scale);
  rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
  return rock;
}

function buildZone(zoneId) {
  const zoneData = ZONE_DATABASE[zoneId];
  if (!zoneData) {
    console.error(`buildZone: zona desconocida "${zoneId}"`);
    return;
  }

  const scene = game.refs.scene;
  const keepLights = new Set();
  scene.traverse((obj) => { if (obj.isLight) keepLights.add(obj); });
  [...scene.children].forEach((child) => {
    if (!keepLights.has(child)) scene.remove(child);
  });

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(zoneData.groundSize, zoneData.groundSize),
    new THREE.MeshLambertMaterial({ color: zoneData.groundColor })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  game.refs.currentObstacles = [];
  zoneData.obstacles.forEach((obs) => {
    const mesh = obs.type === 'tree' ? _makeTree(obs.scale) : _makeRock(obs.scale);
    mesh.position.set(obs.x, 0, obs.z);
    scene.add(mesh);
    game.refs.currentObstacles.push({ x: obs.x, z: obs.z, radius: 0.5 * obs.scale });
  });

  game.refs.zoneBounds = zoneData.groundSize / 2 - 1;
}
