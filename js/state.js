// Estado central del juego. TODOS los sistemas leen y escriben a través de este objeto.
// Regla 3: este objeto SOLO CRECE. Los campos existentes nunca cambian de nombre/tipo/ubicación.

const game = {
  // ---- state: todo lo serializable, se guarda en localStorage (a partir del Hito 7) ----
  state: {
    player: {
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      stats: { hp: 100, maxHp: 100, attack: 10, defense: 5, speed: 5, stamina: 100, maxStamina: 100 },
      equipped: {
        weapon: { itemId: 'sword_iron', durability: 100 },
        armor: { itemId: 'armor_leather', durability: 80 },
      },
      weaponProficiency: { sword: 0, dagger: 0, axe: 0, spear: 0 },
      activeBuffs: [],
      currency: 0,
      fatigueUntil: null,
    },
    inventory: [
      { itemId: 'dagger_swift', quantity: 1 },
      { itemId: 'axe_battle', quantity: 1 },
      { itemId: 'spear_guard', quantity: 1 },
      { itemId: 'potion_health_minor', quantity: 3 },
    ],
    currentZone: 'zone_1',
    unlockedZones: ['zone_1'],
    enemies: [],
    cooldowns: {},
    quests: { active: [], completed: [] },
    achievements: { unlocked: [] },
    playerStats: { enemiesKilled: 0, deaths: 0, itemsCrafted: 0, timePlayedSeconds: 0, highestZoneReached: 1, totalDamageDealt: 0 },
    bestiary: {},
    settings: { difficulty: 'normal', soundOn: true, joystickSensitivity: 1.0 },
  },

  // ---- refs: objetos vivos de Three.js y datos derivados. NUNCA se guardan. ----
  refs: {
    scene: null,
    camera: null,
    renderer: null,
    clock: null,
    player: null,
    currentObstacles: [],
    zoneBounds: null,
    currentEnemies: [],
    playerCombat: {
      isBlocking: false,
      invulnerableUntil: 0,
      preMotionSkillId: null,
      preMotionStartAt: 0,
      unlockedSkillIds: [],
      dodgeActiveUntil: 0,
      dodgeStartPos: null,
      dodgeEndPos: null,
    },
    uiState: {
      modalOpen: false, // true mientras cualquier overlay (inventario, y a futuro crafteo/quests/tienda) esté abierto
    },
  },

  // ---- registro extensible de sistemas ----
  _updateFns: [],
  registerSystem(fn) {
    this._updateFns.push(fn);
  },
  emit(eventName, detail) {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  },
};
