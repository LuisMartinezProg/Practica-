// Inicialización de Three.js y loop principal.
// El loop NO arranca hasta que menu.js llama a startGame().

let _gameInitialized = false;

function initThree() {
  game.refs.scene = new THREE.Scene();
  game.refs.scene.background = new THREE.Color(0x8ec9e8);

  const aspect = window.innerWidth / window.innerHeight;
  game.refs.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 500);

  game.refs.renderer = new THREE.WebGLRenderer({ antialias: true });
  game.refs.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  game.refs.renderer.setSize(window.innerWidth, window.innerHeight);
  game.refs.renderer.shadowMap.enabled = false; // mejora futura opcional
  document.getElementById('game-canvas-container').appendChild(game.refs.renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const sun = new THREE.DirectionalLight(0xffffff, 0.8);
  sun.position.set(20, 30, 10);
  game.refs.scene.add(ambient, sun);

  game.refs.clock = new THREE.Clock();

  window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
  if (!game.refs.camera || !game.refs.renderer) return;
  game.refs.camera.aspect = window.innerWidth / window.innerHeight;
  game.refs.camera.updateProjectionMatrix();
  game.refs.renderer.setSize(window.innerWidth, window.innerHeight);
}

// Llamada por menu.js al elegir "Nueva Partida" (y por "Continuar" a partir del Hito 7)
function startGame() {
  if (_gameInitialized) return;
  _gameInitialized = true;

  initThree();
  buildZone(game.state.currentZone); // world.js
  initPlayer();                       // player.js

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const delta = game.refs.clock.getDelta();

  game._updateFns.forEach((fn) => fn(delta));

  game.state.playerStats.timePlayedSeconds += delta;

  game.refs.renderer.render(game.refs.scene, game.refs.camera);
}
