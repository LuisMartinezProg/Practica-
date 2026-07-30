// Movimiento, cámara en 3ra persona, joystick táctil, esquiva y bloqueo.
// Ataque básico y sword skills viven en combat.js; acá solo lo que mueve/posiciona al jugador.

const PLAYER_CONFIG = {
  rotationLerpSpeed: 10,
  cameraOffset: { y: 3.2, z: 5.5 },
  cameraLerpSpeed: 6,
  cameraLookHeight: 1.2,
  bobAmount: 0.06,
  bobSpeed: 8,
  collisionRadius: 0.4,
};

const DODGE_CONFIG = {
  cooldown: 1.5,
  staminaCost: 25,
  iframeDuration: 0.3,
  dashDistance: 3,
  dashDuration: 0.2,
};

const BLOCK_CONFIG = { staminaDrainPerSecond: 15 };
const ATTACK_ANIM_DURATION = 0.25;

let _bobElapsed = 0;
let _attackAnimUntil = 0;

const _joystick = {
  active: false, touchId: null, originX: 0, originY: 0,
  input: { x: 0, y: 0 }, maxRadius: 45,
};

function _setupJoystick() {
  const zone = document.getElementById('joystick-zone');
  const knob = document.getElementById('joystick-knob');

  const findTouch = (list, id) => {
    for (let i = 0; i < list.length; i++) if (list[i].identifier === id) return list[i];
    return null;
  };

  zone.addEventListener('touchstart', (e) => {
    if (_joystick.active) return;
    const t = e.changedTouches[0];
    _joystick.active = true;
    _joystick.touchId = t.identifier;
    _joystick.originX = t.clientX;
    _joystick.originY = t.clientY;
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (!_joystick.active) return;
    const t = findTouch(e.changedTouches, _joystick.touchId);
    if (!t) return;

    let dx = t.clientX - _joystick.originX;
    let dy = t.clientY - _joystick.originY;
    const dist = Math.min(Math.hypot(dx, dy), _joystick.maxRadius);
    const angle = Math.atan2(dy, dx);
    dx = Math.cos(angle) * dist;
    dy = Math.sin(angle) * dist;

    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    _joystick.input.x = dx / _joystick.maxRadius;
    _joystick.input.y = -dy / _joystick.maxRadius;
    e.preventDefault();
  }, { passive: false });

  const endTouch = (e) => {
    if (!_joystick.active) return;
    const t = findTouch(e.changedTouches, _joystick.touchId);
    if (!t) return;
    _joystick.active = false;
    _joystick.touchId = null;
    _joystick.input.x = 0;
    _joystick.input.y = 0;
    knob.style.transform = 'translate(0px, 0px)';
  };
  window.addEventListener('touchend', endTouch);
  window.addEventListener('touchcancel', endTouch);
}

function _makePlayerMesh() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.35, 1.1, 8),
    new THREE.MeshLambertMaterial({ color: 0x3b6fa0 })
  );
  body.position.y = 0.75;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 10, 8),
    new THREE.MeshLambertMaterial({ color: 0xe0b088 })
  );
  head.position.y = 1.5;
  group.add(body, head);
  return group;
}

function initPlayer() {
  const mesh = _makePlayerMesh();
  const { x, y, z } = game.state.player.position;
  mesh.position.set(x, y, z);
  mesh.rotation.y = game.state.player.rotation;
  game.refs.scene.add(mesh);
  game.refs.player = mesh;

  const cam = game.refs.camera;
  cam.position.set(x, y + PLAYER_CONFIG.cameraOffset.y, z + PLAYER_CONFIG.cameraOffset.z);
  cam.lookAt(x, y + PLAYER_CONFIG.cameraLookHeight, z);

  _setupJoystick();
  game.registerSystem(updatePlayer);
}

function _canOccupy(x, z) {
  for (const obs of game.refs.currentObstacles) {
    const dx = x - obs.x;
    const dz = z - obs.z;
    const minDist = obs.radius + PLAYER_CONFIG.collisionRadius;
    if (dx * dx + dz * dz < minDist * minDist) return false;
  }
  return true;
}

function _clampBounds(v) {
  const b = game.refs.zoneBounds;
  return b == null ? v : Math.max(-b, Math.min(b, v));
}

function playSwingAnimation() {
  _attackAnimUntil = performance.now() / 1000 + ATTACK_ANIM_DURATION;
}

function performDodge() {
  const pc = game.refs.playerCombat;
  const now = performance.now() / 1000;

  if ((game.state.cooldowns['dodge'] || 0) > now) return;
  if (game.state.player.stats.stamina < DODGE_CONFIG.staminaCost) return;
  if (pc.isBlocking) return;

  game.state.cooldowns['dodge'] = now + DODGE_CONFIG.cooldown;
  game.state.player.stats.stamina -= DODGE_CONFIG.staminaCost;
  pc.invulnerableUntil = now + DODGE_CONFIG.iframeDuration;

  const mesh = game.refs.player;
  const input = _joystick.input;
  let dirX, dirZ;

  if (Math.abs(input.x) > 0.05 || Math.abs(input.y) > 0.05) {
    const camForward = new THREE.Vector3();
    game.refs.camera.getWorldDirection(camForward);
    camForward.y = 0;
    camForward.normalize();
    const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0));
    const dir = new THREE.Vector3()
      .addScaledVector(camForward, input.y)
      .addScaledVector(camRight, input.x)
      .normalize();
    dirX = dir.x; dirZ = dir.z;
  } else {
    dirX = Math.sin(mesh.rotation.y);
    dirZ = Math.cos(mesh.rotation.y);
  }

  const targetX = _clampBounds(mesh.position.x + dirX * DODGE_CONFIG.dashDistance);
  const targetZ = _clampBounds(mesh.position.z + dirZ * DODGE_CONFIG.dashDistance);

  pc.dodgeStartPos = { x: mesh.position.x, z: mesh.position.z };
  pc.dodgeEndPos = _canOccupy(targetX, targetZ)
    ? { x: targetX, z: targetZ }
    : { x: mesh.position.x, z: mesh.position.z };
  pc.dodgeActiveUntil = now + DODGE_CONFIG.dashDuration;
}

function startBlock() {
  const pc = game.refs.playerCombat;
  const now = performance.now() / 1000;
  if (!_canCurrentWeaponBlock()) return;
  if (game.state.player.stats.stamina <= 0) return;
  if (now < pc.dodgeActiveUntil) return;
  pc.isBlocking = true;
}

function endBlock() {
  game.refs.playerCombat.isBlocking = false;
}

function handlePlayerDeath() {
  const player = game.state.player;

  game.state.playerStats.deaths += 1;
  player.xp = Math.floor(player.xp * 0.9);
  player.fatigueUntil = Date.now() + 60000;

  player.stats.hp = getEffectiveStats().maxHp;
  const mesh = game.refs.player;
  mesh.position.set(0, 0, 0);
  player.position.x = 0;
  player.position.z = 0;

  game.refs.playerCombat.isBlocking = false;
  game.refs.playerCombat.preMotionSkillId = null;
  game.refs.playerCombat.dodgeActiveUntil = 0;

  showNotification('Has caído... reapareces con Fatiga (-15% ATQ/DEF, 60s)', 'death');
  game.emit('playerDied', {});
}

function updatePlayer(delta) {
  if (game.refs.uiState.modalOpen) return;

  const mesh = game.refs.player;
  const cam = game.refs.camera;
  if (!mesh || !cam) return;

  const pc = game.refs.playerCombat;
  const stats = game.state.player.stats;
  const now = performance.now() / 1000;

  const isDodging = now < pc.dodgeActiveUntil;
  const isBlocking = pc.isBlocking;

  if (isBlocking) {
    stats.stamina = Math.max(0, stats.stamina - BLOCK_CONFIG.staminaDrainPerSecond * delta);
    if (stats.stamina <= 0) pc.isBlocking = false;
  } else {
    stats.stamina = Math.min(stats.maxStamina, stats.stamina + 10 * delta);
  }

  if (isDodging) {
    const t = 1 - (pc.dodgeActiveUntil - now) / DODGE_CONFIG.dashDuration;
    const ct = Math.max(0, Math.min(1, t));
    mesh.position.x = pc.dodgeStartPos.x + (pc.dodgeEndPos.x - pc.dodgeStartPos.x) * ct;
    mesh.position.z = pc.dodgeStartPos.z + (pc.dodgeEndPos.z - pc.dodgeStartPos.z) * ct;
  } else if (isBlocking) {
    // inmovilizado mientras bloquea
  } else {
    const input = _joystick.input;
    const moving = Math.abs(input.x) > 0.05 || Math.abs(input.y) > 0.05;

    if (moving) {
      const camForward = new THREE.Vector3();
      cam.getWorldDirection(camForward);
      camForward.y = 0;
      camForward.normalize();
      const camRight = new THREE.Vector3().crossVectors(camForward, new THREE.Vector3(0, 1, 0));

      const moveDir = new THREE.Vector3()
        .addScaledVector(camForward, input.y)
        .addScaledVector(camRight, input.x);
      if (moveDir.lengthSq() > 1) moveDir.normalize();

      const dist = getEffectiveStats().speed * delta;
      const nx = _clampBounds(mesh.position.x + moveDir.x * dist);
      const nz = _clampBounds(mesh.position.z + moveDir.z * dist);

      if (_canOccupy(nx, nz)) {
        mesh.position.x = nx; mesh.position.z = nz;
      } else if (_canOccupy(nx, mesh.position.z)) {
        mesh.position.x = nx;
      } else if (_canOccupy(mesh.position.x, nz)) {
        mesh.position.z = nz;
      }

      const targetRot = Math.atan2(-moveDir.x, -moveDir.z);
      const diff = Math.atan2(Math.sin(targetRot - mesh.rotation.y), Math.cos(targetRot - mesh.rotation.y));
      mesh.rotation.y += diff * Math.min(1, PLAYER_CONFIG.rotationLerpSpeed * delta);

      _bobElapsed += delta * PLAYER_CONFIG.bobSpeed;
      mesh.position.y = Math.sin(_bobElapsed) * PLAYER_CONFIG.bobAmount;
    } else {
      mesh.position.y += (0 - mesh.position.y) * Math.min(1, 8 * delta);
    }
  }

  if (now < _attackAnimUntil) {
    const t = 1 - (_attackAnimUntil - now) / ATTACK_ANIM_DURATION;
    mesh.rotation.x = Math.sin(Math.max(0, Math.min(1, t)) * Math.PI) * 0.35;
  } else {
    mesh.rotation.x = 0;
  }

  game.state.player.position.x = mesh.position.x;
  game.state.player.position.z = mesh.position.z;
  game.state.player.rotation = mesh.rotation.y;

  const camDist = PLAYER_CONFIG.cameraOffset.z;
  const camTargetX = mesh.position.x + Math.sin(mesh.rotation.y) * camDist;
  const camTargetZ = mesh.position.z + Math.cos(mesh.rotation.y) * camDist;
  const camTargetY = game.state.player.position.y + PLAYER_CONFIG.cameraOffset.y;

  const lerp = Math.min(1, PLAYER_CONFIG.cameraLerpSpeed * delta);
  cam.position.x += (camTargetX - cam.position.x) * lerp;
  cam.position.y += (camTargetY - cam.position.y) * lerp;
  cam.position.z += (camTargetZ - cam.position.z) * lerp;
  cam.lookAt(mesh.position.x, game.state.player.position.y + PLAYER_CONFIG.cameraLookHeight, mesh.position.z);
}
