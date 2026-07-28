# SAO-Style Action RPG — Especificación Técnica y Esqueleto de Proyecto

> Este documento es la fuente única de verdad para construir este proyecto desde cero, en cualquier chat/sesión, sin contexto previo. Sigue el orden de construcción exactamente como está descrito — cada paso debe quedar jugable y probado en el navegador antes de avanzar al siguiente.

## 1. Resumen del proyecto

RPG de acción 3D en tercera persona, inspirado en las mecánicas de juego de Sword Art Online (sistema de niveles, combate con espadas/"sword skills", inventario, crafteo, zonas de dificultad progresiva). **No es multijugador ni VR** — es un juego single-player que corre en el navegador de un celular, sin backend ni servidor. El progreso se guarda con `localStorage`.

**Plataforma objetivo:** navegador móvil (Chrome/Safari en Android/iOS). Todo debe ser táctil (joystick virtual + botones en pantalla), sin depender de teclado/mouse.

**Stack técnico:** HTML + CSS + JavaScript vanilla + Three.js (vía CDN, sin build step, sin npm). Todo debe correr abriendo `index.html` directamente en el navegador — cero instalación, cero compilación.

**Estilo visual:** low-poly estilizado (geometría simple, colores planos/flat shading). Prioridad #1: que corra fluido en hardware de celular. El estilo específico (paleta de colores, formas de enemigos) es ajustable después sin tocar la lógica de ningún sistema — mantener presentación separada de lógica en todo momento.

**Importante — límites de contenido:** este proyecto usa mecánicas *genéricas* de RPG/MMORPG (niveles, sword skills, crafteo, categorías de arma, maestría) inspiradas en el tipo de sistemas que Sword Art Online popularizó. NO incluye personajes, Unique Skills con nombre propio, monstruos con nombre propio, lore, ni ningún contenido específico protegido por derechos de autor de la novela/anime/juegos oficiales. Todo el contenido (enemigos, zonas, skills) es inventado y genérico.

## 2. Estructura de archivos (arquitectura modular)

```
sao-game/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── main.js
    ├── state.js
    ├── save.js
    ├── audio.js
    ├── menu.js
    ├── world.js
    ├── player.js
    ├── leveling.js
    ├── combat.js
    ├── enemies.js
    ├── inventory.js
    ├── crafting.js
    ├── quests.js
    ├── achievements.js
    ├── stats-tracker.js
    ├── bestiary.js
    ├── shop.js
    └── ui.js
```

**Regla de comunicación entre archivos:** ningún sistema accede directamente a variables internas de otro. Todos leen y escriben a través de `game.state` (definido en `state.js`), que se carga primero y es accesible globalmente. Esto evita dependencias circulares entre archivos.

**Orden de carga de scripts en `index.html`** (importa el orden, cada uno depende de que el anterior ya exista):

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="js/state.js"></script>
<script src="js/save.js"></script>
<script src="js/audio.js"></script>
<script src="js/menu.js"></script>
<script src="js/main.js"></script>
<script src="js/world.js"></script>
<script src="js/player.js"></script>
<script src="js/leveling.js"></script>
<script src="js/combat.js"></script>
<script src="js/enemies.js"></script>
<script src="js/inventory.js"></script>
<script src="js/crafting.js"></script>
<script src="js/quests.js"></script>
<script src="js/achievements.js"></script>
<script src="js/stats-tracker.js"></script>
<script src="js/bestiary.js"></script>
<script src="js/shop.js"></script>
<script src="js/ui.js"></script>
```

`menu.js` se carga antes que `main.js` porque el juego no debe arrancar el loop principal hasta que el jugador elija "Nueva Partida" o "Continuar" desde el menú.

Nota de versión de Three.js: usar r128 (`THREE.OrbitControls` no aplica aquí porque la cámara es custom, no orbit-controlled; evitar `THREE.CapsuleGeometry` por no estar disponible en esta versión — usar `CylinderGeometry` + `SphereGeometry` combinadas para cápsulas de colisión si se necesitan).

## 3. Orden de construcción (hitos, cada uno jugable antes de avanzar)

1. Mundo base + jugador moviéndose en 3ra persona + controles táctiles
2. Sistema de niveles/stats (sin combate aún, solo la estructura de datos y HUD)
3. Combate + enemigos con IA (incluye categorías de arma, maestría, esquiva, bloqueo, muerte)
4. Inventario + equipo (incluye durabilidad/reparación)
5. Crafteo
6. Zonas múltiples conectadas (8 pisos)
7. UI general, pulido, guardado, menú principal
7.5. Sistemas de profundidad sin arte: quests, logros, stats tracker, bestiario, tienda, buffs, dificultad — todos construibles sin necesitar ningún asset visual nuevo, reutilizando enemigos/items/zonas ya existentes.
8. Split final a estructura modular + limpieza para GitHub

---

## 4. Especificación detallada por sistema

### 4.1 `state.js` — Estado central

Objeto global `game.state` con esta forma (incluye todos los campos usados por todos los sistemas del documento):

```javascript
const game = {
  state: {
    player: {
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      stats: { hp: 100, maxHp: 100, attack: 10, defense: 5, speed: 5, stamina: 100, maxStamina: 100 },
      equipped: {
        weapon: null, // { itemId, durability }
        armor: null,  // { itemId, durability }
      },
      weaponProficiency: { sword: 0, dagger: 0, axe: 0, spear: 0 },
      activeBuffs: [], // [{ statAffected, modifier, expiresAt }]
      currency: 0,
      fatigueUntil: null, // timestamp; mientras activo, aplica debuff de Fatiga (ver 4.15)
    },
    inventory: [], // [{ itemId, quantity }], máx 30 slots (ver 4.21)
    currentZone: 'zone_1',
    unlockedZones: ['zone_1'],
    enemies: [], // enemigos activos en la zona actual
    cooldowns: {}, // { skillId: timestampDisponible }
    quests: { active: [], completed: [] },
    achievements: { unlocked: [] }, // guardado en clave separada 'sao_achievements', no se resetea con Nueva Partida
    playerStats: { enemiesKilled: 0, deaths: 0, itemsCrafted: 0, timePlayedSeconds: 0, highestZoneReached: 1, totalDamageDealt: 0 },
    bestiary: {}, // { enemyType: { discovered: bool, timesKilled: N } }
    settings: { difficulty: 'normal', soundOn: true, joystickSensitivity: 1.0 },
  },
  refs: {}, // referencias no serializables: scene, camera, renderer, meshes, mixers — NUNCA se guardan en localStorage
};
```

`refs` es intencionalmente separado de `state`: `state` es todo lo que se guarda en `localStorage` (serializable a JSON), `refs` son objetos vivos de Three.js (mallas, cámara, escena) que nunca se guardan.

### 4.2 `main.js` — Inicialización y loop

Responsabilidades:
- Crear `scene`, `camera` (perspectiva, FOV ~60-70 para que se vea bien en pantallas verticales), `renderer` (`antialias: true`, `setPixelRatio` limitado a máx 2 para no sobrecargar el cel).
- Luz ambiental + una luz direccional (sol) — nada de sombras dinámicas complejas en la primera pasada, son costosas en cel; usar `renderer.shadowMap.enabled = false` inicialmente, dejarlo como mejora opcional posterior.
- Loop principal con `requestAnimationFrame`, delta time calculado con `THREE.Clock`, y llamar en cada frame a las funciones de update de cada sistema (`updatePlayer(delta)`, `updateEnemies(delta)`, `updateCombat(delta)`, `updateBuffs(delta)`) — cada sistema expone su propia función `update` en su archivo.
- Incrementar `game.state.playerStats.timePlayedSeconds` con el delta acumulado, solo mientras el juego está activo (no en el menú).
- Resize listener para adaptar a rotación de pantalla del cel.
- El loop **no arranca** hasta que `menu.js` dispare la señal de "Nueva Partida" o "Continuar" (ver 4.20).

### 4.3 `world.js` — Zonas, terreno y los 8 pisos

Cada zona es una función `buildZone(zoneId)` que limpia la escena anterior y genera terreno (`PlaneGeometry`, color plano), obstáculos, puntos de spawn de enemigos, un NPC vendedor (ver 4.26), y un portal/marcador hacia el siguiente piso.

Estructura de 8 pisos (concepto genérico de torre con dificultad apilada, sin relación con ninguna planta específica de una obra protegida):

| Piso | Bioma | Nivel enemigos | Identidad de diseño |
|------|-------|----------------|----------------------|
| 1 | Pradera/bosque inicial | 1-5 | Zona tutorial, terreno abierto, poca densidad de enemigos |
| 2 | Bosque denso/pantano | 5-10 | Visibilidad reducida, enemigos que emboscan desde vegetación |
| 3 | Cueva/mina subterránea | 10-15 | Pasillos estrechos, enemigos que fuerzan combate 1 a 1 |
| 4 | Ruinas de piedra | 15-20 | Plataformas y desniveles, requiere más movimiento vertical |
| 5 | Fortaleza abandonada | 20-28 | Enemigos en grupo/patrulla coordinada |
| 6 | Zona helada | 28-36 | Terreno resbaladizo (afecta velocidad), enemigos resistentes al frío |
| 7 | Torre ascendente | 36-45 | Diseño vertical, mini-jefe intermedio |
| 8 | Cima — Sala del Guardián | 45+ | Jefe final único, arena de combate cerrada |

- Transición: al tocar el portal, `world.js` llama a `save.js` para guardar progreso, limpia la escena actual, reconstruye con `buildZone(siguienteZona)`, reposiciona al jugador en el punto de entrada.
- `game.state.unlockedZones` controla qué portales están activos (no se puede saltar de piso sin haber tocado el portal anterior al menos una vez).
- Terreno resbaladizo en piso 6: multiplicador de velocidad/fricción distinto aplicado en `player.js`, dato que vive en la config de la zona, no hardcodeado en el jugador.
- Piso 7 introduce un mini-jefe (dificultad intermedia entre enemigo normal y jefe final).

### 4.4 `player.js` — Movimiento, controles táctiles, esquiva y bloqueo

- Personaje representado con geometría simple (cilindro + esfera para cabeza, o grupo de formas low-poly) — intercambiable después sin tocar lógica.
- Cámara en tercera persona: offset detrás y arriba del jugador, con `lerp` para suavizar el seguimiento.
- Controles táctiles:
  - Joystick virtual (esquina inferior izquierda) controla dirección relativa a la cámara. Implementado con eventos táctiles nativos (`touchstart`, `touchmove`, `touchend`) sobre un `<div>` posicionado con CSS.
  - Botón de ataque básico (esquina inferior derecha).
  - Botones de sword skills (2-3 botones sobre el de ataque, con overlay de cooldown).
  - Botón de esquiva (junto al joystick, accesible con el pulgar de movimiento).
  - Botón de bloqueo (mantener presionado; solo activo si el arma equipada tiene `canBlock: true`).
- Colisión básica con el terreno/obstáculos definidos en `world.js` (raycasting simple o chequeo de distancia contra bounding boxes).

**Esquiva:** al tocar el botón, dash rápido en la dirección del joystick (o hacia atrás si está neutral), con ~0.3s de invulnerabilidad (i-frames). Cooldown ~1.5s. Cuesta 25 stamina.

**Bloqueo:** mientras se mantiene presionado (solo con arma `canBlock: true`), reduce daño recibido en 70%, inmoviliza al jugador, consume 15 stamina/segundo. El jefe final (piso 8, fase 3) tiene un ataque que rompe bloqueo y no puede evadirse sin esquiva — da propósito a tener ambos sistemas.

**Stamina:** `player.stats.stamina` (máx 100), se regenera ~10/segundo cuando no se usa. Sin stamina suficiente, el botón correspondiente se muestra grisado/deshabilitado.

**Animaciones (sin modelos importados, geometría simple):**
- Caminar/correr: oscilación con `Math.sin(time * velocidad)` o bobbing del cuerpo.
- Ataque: rotación/traslación corta del arma (~200-400ms con easing), sincronizada con el momento exacto del impacto de daño.
- Muerte de enemigo: escala progresiva a 0 + rotación, o caída (rotación 90° eje X) antes de remover el mesh, ~0.5s de feedback antes de desaparecer.
- Mejora futura documentada (no parte del alcance inicial): migrar a modelos `.glb` con `THREE.AnimationMixer` si se sube la fidelidad visual más adelante.

### 4.5 `leveling.js` — Niveles y stats

- `gainXp(amount)`: suma XP, si `xp >= xpToNextLevel` sube de nivel, resetea XP sobrante, incrementa `xpToNextLevel = 100 * level^1.5`, recalcula stats derivados, cura HP al máximo, dispara `showLevelUpNotification()` (en `ui.js`).
- Fórmulas de stats por nivel: `maxHp = 100 + (level-1)*20`, `attack = 10 + (level-1)*3`, `defense = 5 + (level-1)*2`.
- `getEffectiveStats()`: función que suma stats base + bonos de equipo + buffs activos (ver 4.27) — usada por `combat.js` en cada cálculo de daño, en vez de leer `player.stats` directo.

**Tabla de balance de referencia (XP acumulado esperado por piso):**

| Piso | Nivel jugador recomendado al entrar | XP acumulado aproximado esperado |
|------|--------------------------------------|-----------------------------------|
| 1 | 1 | 0 |
| 2 | 5-6 | ~600 |
| 3 | 10-11 | ~2,200 |
| 4 | 15-16 | ~4,800 |
| 5 | 20-22 | ~8,500 |
| 6 | 28-30 | ~16,000 |
| 7 | 36-38 | ~26,000 |
| 8 | 45+ | ~42,000 |

Si al probar el juego el jugador llega sobrenivelado/sublevelado respecto a esta tabla, ajustar `xpReward` de los enemigos (4.7), no las fórmulas de nivel de arriba, para no descuadrar el resto del balance.

### 4.6 `combat.js` — Combate, categorías de arma, maestría, sword skills, muerte

**Ataque básico:** al tocar el botón, chequear enemigos dentro de un radio/cono frente al jugador, aplicar `damage = getEffectiveStats().attack - enemy.stats.defense` (mínimo 1), cooldown corto (~0.5s).

**Categorías de daño por tipo de arma** (propiedad `damageCategory` en cada arma del `ITEM_DATABASE`):
- **Cortante** (espadas rectas/curvas): daño constante, sin bonos especiales.
- **Perforante** (dagas, lanzas): menor daño base, mayor velocidad de ataque (cooldown básico más corto).
- **Contundente** (mazas, hachas): mayor daño base, probabilidad de stun breve al enemigo.
- **Estocada/Rapier:** mayor alcance, ideal para golpear antes de que el enemigo responda.

**Maestría por arma (Weapon Proficiency):** `player.weaponProficiency = { sword: 0, dagger: 0, axe: 0, spear: 0 }`, sube con cada golpe conectado usando esa categoría. Al alcanzar umbrales (100, 500, 1500 golpes) se desbloquean nuevas sword skills para esa categoría vía `checkProficiencyUnlocks(category)`.

**Mecánica de Pre-Motion (postura de carga):** mantener presionado el botón de una sword skill entra en `player.state = 'preMotion'` (~0.3-0.6s, sin moverse, sin penalización); al soltar se ejecuta el golpe con multiplicador completo. Soltar antes de tiempo cancela sin gastar cooldown.

**Sword skills por categoría** (tabla `SWORD_SKILL_DATABASE`, leída por función genérica `executeSwordSkill(skillId)` — evita funciones hardcodeadas por skill):

*Cortante (espada):*
1. Estocada Simple — cooldown corto, x1.3, disponible desde el inicio.
2. Golpe Giratorio — área 360°, x1.4, desbloquea en maestría 100.
3. Filo Ascendente — combo de 2 golpes (segundo se activa tocando de nuevo dentro de 1s), x1.6 total, desbloquea en maestría 500.

*Perforante (daga):*
1. Golpe Rápido Doble — dos golpes casi simultáneos, x1.1 cada uno, cooldown muy corto.
2. Paso Sombra — dash hacia el enemigo + golpe, x1.3, desbloquea en maestría 100.

*Contundente (hacha/maza):*
1. Golpe Aplastante — lento, probabilidad de stun 1s, x1.8, cooldown largo.
2. Barrido — golpe en línea recta que atraviesa varios enemigos, x1.2 por objetivo, desbloquea en maestría 500.

*Estocada/Rapier:*
1. Embiste Certero — mayor alcance, x1.4, buen ataque de apertura.
2. Combo Trueno (Composite Skill) — encadena 3 estocadas en ventanas sucesivas, multiplicador acumulado hasta x2.0 en el tercer golpe, desbloquea en maestría 1500.

**Muerte del jugador (muerte amigable):** al llegar a 0 HP, NO se pierde progreso de nivel, XP acumulada de niveles pasados, inventario ni equipo. En su lugar:
- Reaparece en el último punto de guardado/entrada de la zona actual (no retrocede de piso).
- Penalización: pierde 10% de la XP parcial hacia el siguiente nivel (nunca baja de nivel) y sufre debuff de "Fatiga" (-15% attack, -15% defense) por 60 segundos reales (`player.fatigueUntil`).
- HP se restaura al máximo al reaparecer.
- UI muestra notificación + ícono/timer de Fatiga mientras dura.
- Función `handlePlayerDeath()` en `player.js`, llamada desde `combat.js` cuando `hp <= 0`.

**Al matar un enemigo:** llamar `gainXp(enemy.xpReward)`, generar drop de materiales y currency, incrementar `playerStats.enemiesKilled`, disparar eventos para que `quests.js`/`achievements.js`/`bestiary.js` reaccionen (sin que `combat.js` sepa de su existencia), remover el enemigo de la escena y de `game.state.enemies`.

### 4.7 `enemies.js` — IA, tipos de enemigo, resistencias

Cada enemigo: `{ id, type, position, stats: {hp, attack, defense}, resistances: {slashing, piercing, blunt}, state, xpReward, currencyReward, dropTable }`.

`resistances` es un multiplicador aplicado al daño recibido según la categoría de arma usada (ej. `blunt: 0.6` = resiste contundente, `piercing: 1.3` = vulnerable a perforante) — incentiva variar de arma según el enemigo.

**Máquina de estados:** `idle` (patrulla/detección) → `chasing` (persigue si detecta al jugador) → `attacking` (ataca en rango, cooldown propio) → `fleeing` (opcional, retrocede bajo cierto % de HP).

**8 tipos de enemigo + mini-jefe + jefe final** (uno por piso mínimo):
1. Piso 1 — "Lobo salvaje": rápido, poca vida, daño bajo, sin resistencias especiales.
2. Piso 2 — "Acechador de matorral": emboscada, resistente a estocada.
3. Piso 3 — "Golem de piedra": lento, tanque, alta resistencia contundente, vulnerable a perforante.
4. Piso 4 — "Arquero en ruinas": ataca a distancia, obliga a cerrar distancia o esquivar.
5. Piso 5 — "Patrulla de esqueletos": grupos de 2-3 coordinados, uno puede curar a los demás.
6. Piso 6 — "Elemental de hielo": resistente a todo excepto cortante, aplica debuff de lentitud al golpear.
7. Piso 7 (mini-jefe) — "Centinela de la Torre": 2 fases (fase 2 al bajar de 50% HP, más rápido + ataque en área).
8. Piso 8 (jefe final) — "Guardián de la Cima": 3 fases, patrones distintos, fase 3 con ataque de área que rompe bloqueo y requiere esquiva obligatoria.

Valores numéricos exactos de HP/attack/defense por tipo quedan para ajuste durante pruebas de juego (no se fijan en teoría antes de tener el juego corriendo) — usar la tabla de balance de 4.5 como referencia.

Spawns: `world.js` define puntos de spawn por zona, `enemies.js` los puebla al construir la zona y opcionalmente repone enemigos caídos tras un tiempo.

### 4.8 `inventory.js` — Inventario, equipo, durabilidad, límite de slots

- `game.state.inventory`: array de `{itemId, quantity}`. Catálogo en `ITEM_DATABASE`: `{id, name, type (weapon/armor/material/consumable), rarity (common/rare/epic), damageCategory, canBlock, buffEffect, statBonus}`.
- Funciones: `addItem(itemId, qty)`, `removeItem(itemId, qty)`, `equipItem(itemId)`, `unequipItem(slot)`.
- Rareza afecta color/borde visual (común=blanco, raro=azul, épico=morado).

**Durabilidad y reparación:** cada arma/armadura equipada tiene `durability` (empieza en 100, baja ~1 punto cada N golpes conectados/recibidos). Al llegar a 0, pierde su bono de stats hasta reparar. Reparación consume materiales vía `crafting.js` (receta de "reparar" en vez de "crear nuevo") — no se rompe permanentemente, para no frustrar en single-player.

**Límite de inventario:** 30 slots, cada uno acumula hasta 99 de un mismo material/consumible; armas/armaduras ocupan 1 slot por unidad (no se apilan). `addItem` chequea espacio: si hay espacio parcial, agrega lo que quepa y notifica "Inventario lleno, no se pudo recoger todo"; si no hay espacio, el drop simplemente no se agrega (no queda flotando en el mundo). UI muestra conteo actual/máximo (ej. "18/30").

### 4.9 `crafting.js` — Crafteo y reparación

- `RECIPE_DATABASE`: `{resultItemId, materials: [{itemId, quantity}], category (damageCategory del resultado), tier (rarity)}`.
- `canCraft(recipeId)`: chequea materiales suficientes. `craft(recipeId)`: remueve materiales, agrega resultado, incrementa `playerStats.itemsCrafted`, notifica en UI.
- Materiales de piso más alto requeridos para recetas de tier superior — da razón concreta para avanzar de piso más allá de solo XP.
- Recetas de "reparar" siguen el mismo patrón (materiales → restaurar `durability` a 100 en vez de crear item nuevo).

### 4.10 `ui.js` — HUD y menús

- HUD permanente: barra HP, barra XP, nivel, joystick, botones de ataque/skills/esquiva/bloqueo, indicador de stamina.
- Menús superpuestos (toggle): inventario, crafteo, quests, logros, perfil/stats, bestiario, tienda, pausa/configuración.
- Notificaciones temporales (level up, item obtenido, skill en cooldown, logro desbloqueado) — aparecen y desaparecen solas tras 2-3s.
- Íconos con timer para buffs activos y Fatiga (mismo patrón visual para ambos).
- Todo construido con HTML/CSS superpuesto sobre el `<canvas>` (`position: fixed`, z-index apropiado), no dentro de la escena 3D.

### 4.11 `save.js` — Guardado

- `saveGame()`: serializa `game.state` a JSON, `localStorage.setItem('sao_save', ...)`.
- `loadGame()`: al iniciar, si existe `localStorage.getItem('sao_save')`, parsear y restaurar; si no, valores por defecto.
- Guardado automático al cambiar de zona, cada ~30s, y al subir de nivel.
- `game.state.achievements` se guarda en clave separada `sao_achievements` (persiste aunque se empiece Nueva Partida, es un logro del jugador-perfil, no del personaje actual).

### 4.12 Sistema de audio — `js/audio.js`

- Web Audio API nativa (sin librerías externas, sin assets pesados).
- **Opción recomendada para v1:** sonidos sintéticos generados con osciladores (beep corto para golpe, acorde ascendente para level up, clic para crafteo) — cero dependencia de archivos externos.
- **Opción alternativa futura:** cargar efectos reales con licencia libre vía `Audio()`/`AudioBufferSourceNode` desde `assets/sfx/`.
- Función `playSound(soundId)` expuesta globalmente, llamada desde `combat.js`, `leveling.js`, `crafting.js` sin que estos necesiten saber cómo se genera el sonido.

### 4.13 Menú principal — `js/menu.js`

- Overlay HTML sobre canvas de fondo simple (escena estática sin lógica activa).
- Botón **Nueva Partida** (visible siempre; si hay guardado previo, pide confirmación antes de sobrescribir). Aquí se elige la dificultad (ver 4.19).
- Botón **Continuar** (solo visible si existe guardado; carga estado y entra a la última zona guardada).
- Botón **Ajustes** (volumen on/off, sensibilidad del joystick).
- Al elegir Nueva Partida o Continuar, oculta su overlay y dispara la inicialización real (`main.js` arranca el loop recién en este momento).

### 4.14 Sistema de Quests/Misiones — `js/quests.js`

- `QUEST_DATABASE`: `{id, title, description, type (kill/collect/reachZone), target, requiredAmount, rewardXp, rewardCurrency, rewardItems}`.
- `game.state.quests`: `{active: [...], completed: [...]}`.
- `updateQuestProgress(type, target, amount)`: llamada desde `combat.js`/`inventory.js`/`world.js` según el evento — revisa quests activas que coincidan y suma progreso, sin que esos archivos sepan de quests directamente (quests.js se suscribe al evento, no al revés).
- `completeQuest(questId)`: entrega recompensas, mueve de active a completed.
- Mínimo 3-4 quests por piso (una kill, una collect, la de reachZone al avanzar naturalmente).
- UI: lista con barra de progreso simple (ej. "Derrota lobos: 3/5").

### 4.15 Sistema de Logros — `js/achievements.js`

- `ACHIEVEMENT_DATABASE`: `{id, title, description, condition: {type, value}}`.
- `game.state.achievements.unlocked`: array persistente en clave separada `sao_achievements`.
- `checkAchievements()`: llamada tras eventos relevantes, marca condiciones cumplidas no desbloqueadas.
- Notificación breve al desbloquear (similar a level-up).
- Sugeridos mínimos: "Primera Sangre" (primer enemigo), "Superviviente" (piso 5), "Maestro Artesano" (10 crafteos), "Sin Piedad" (jefe final derrotado), "Coleccionista" (inventario lleno al menos una vez).

### 4.16 Sistema de Estadísticas del jugador — `js/stats-tracker.js`

- `game.state.playerStats`: `{enemiesKilled, deaths, itemsCrafted, timePlayedSeconds, highestZoneReached, totalDamageDealt}`.
- Se incrementa desde los mismos eventos que ya disparan otros sistemas — un solo punto de entrada por evento, múltiples sistemas escuchan sin duplicarse.
- UI: pantalla de "Perfil" accesible desde el menú de pausa, lista de texto simple.

### 4.17 Sistema de Bestiario — `js/bestiary.js`

- `game.state.bestiary`: `{enemyType: {discovered: bool, timesKilled: N}}`, uno por cada tipo (8 + mini-jefe + jefe).
- Al derrotar un tipo por primera vez, se marca `discovered: true`.
- UI: lista de entradas (bloqueadas = "???" hasta descubrirlas), reveladas muestran nombre, stats base, y resistencias (reutiliza datos de 4.7).

### 4.18 Sistema de Comercio — extiende `world.js`, nuevo `js/shop.js`

- Nueva moneda `player.currency` ("Cor" como nombre de display, ajustable). Enemigos dropean `currencyReward` además de materiales.
- Un NPC vendedor por piso (geometría básica, sin animación, definido en `world.js`), zona de interacción con botón contextual "Hablar/Comerciar".
- `SHOP_DATABASE`: por NPC, items disponibles con precio compra/venta. Venta de cualquier item del inventario al 50% de su precio de compra (regla simple ajustable).
- `buyItem(shopId, itemId)` / `sellItem(itemId, qty)`, conectadas a `inventory.js` y descontando/sumando `currency`.
- UI: dos columnas (comprar/vender), estructura similar a la UI de inventario.

### 4.19 Sistema de Buffs/Consumibles temporales — extiende `inventory.js` y `player.js`

- `player.activeBuffs`: `[{statAffected, modifier, expiresAt}]`.
- Consumibles con `buffEffect: {statAffected, modifier, durationMs}` en `ITEM_DATABASE`, en vez de solo curación instantánea.
- `applyBuff(buffData)` al usar consumible; `updateBuffs(delta)` en el loop principal, remueve expirados y recalcula vía `getEffectiveStats()`.
- UI: íconos con timer (mismo patrón visual que Fatiga).

### 4.20 Sistema de dificultad seleccionable — extiende `menu.js` y `state.js`

- `settings.difficulty`: `'easy' | 'normal' | 'hard'`, elegido al crear Nueva Partida (no cambiable a mitad de partida).
- Multiplicadores al instanciar enemigos: Fácil = HP x0.75, daño x0.75. Normal = x1.0. Difícil = HP x1.3, daño x1.25.
- Se leen una sola vez al generar cada enemigo (no afecta retroactivamente enemigos ya existentes).

---

## 5. Decisiones ya tomadas (no volver a preguntar estas cosas)

- Plataforma: navegador móvil, sin instalación, sin build step.
- No es multijugador, no es VR — es un RPG de acción single-player que simula mecánicas de SAO, no la experiencia sensorial de SAO.
- Vista: tercera persona con cámara siguiendo al jugador.
- Estilo visual: low-poly estilizado, prioridad a rendimiento sobre fidelidad gráfica.
- Stack: Three.js vía CDN, JS vanilla, sin frameworks, sin npm/build.
- Arquitectura: modular, un archivo por sistema, comunicación a través de `game.state` central.
- Persistencia: `localStorage`, no hay servidor ni backend.
- Muerte del jugador: amigable (reaparece con penalización leve, nunca pierde todo el progreso).
- Todo el contenido (enemigos, zonas, skills, items) es genérico e inventado, sin nombres ni lore de ninguna obra protegida.

## 6. Qué NO incluye este proyecto (para evitar scope creep)

- Multijugador real (otros jugadores, chat, gremios, mercado entre jugadores, PvP).
- Cualquier forma de interfaz neural o simulación sensorial — no es tecnológicamente posible fuera de la ficción.
- Voces, cinemáticas, o narrativa de la extensión de ninguna serie/novela/juego oficial.
- Sistema de físicas avanzado (ragdoll, destrucción de entorno).
- Ningún personaje, Unique Skill con nombre propio, arma icónica, o evento específico de ningún canon oficial — todo el sistema de arriba es genérico, no una copia de contenido protegido.

## 7. Criterio de completitud del proyecto

Este documento especifica un RPG de acción **completo y jugable de principio a fin**: menú → 8 pisos → jefe final → fin, con progresión de nivel, equipo, combate, y sistemas de profundidad (quests, logros, bestiario, tienda, buffs, dificultad).

**Está terminado cuando:** un jugador puede entrar por primera vez, jugar sin encontrarse con un sistema roto o faltante, y llegar hasta el final del piso 8.

**Cualquier idea nueva que surja durante o después de la construcción se evalúa con esta pregunta:** ¿el juego, tal como está especificado arriba, se puede jugar de principio a fin sin esto?
- Si la respuesta es **no** → es un hueco real, hay que cerrarlo.
- Si la respuesta es **sí** (ej: sistema de mascotas, clima dinámico, más quests, más enemigos, casa del jugador, New Game+) → es expansión de contenido para una v2, no bloquea la v1.

## 8. Reglas de extensibilidad (obligatorias durante toda la construcción)

Estas 4 reglas garantizan que agregar algo nuevo en el futuro NUNCA requiera reescribir código ya funcionando:

**Regla 1 — Todo dato nuevo va en una tabla, nunca en lógica hardcodeada.** Agregar un enemigo/item/quest/logro/receta nuevo = una entrada nueva en su `_DATABASE`, nunca un `if` nuevo dentro de una función que ya funciona. Si agregar contenido requiere tocar una función existente, esa función está mal diseñada y hay que corregirla antes de seguir.

**Regla 2 — Todo sistema nuevo se suscribe a eventos existentes, nunca modifica el emisor.** Cuando un sistema necesita reaccionar a algo que ya pasa (matar enemigo, subir nivel, craftear), se conecta escuchando ese evento desde su propio archivo, sin tocar el archivo que genera el evento. Ya aplicado así entre combate/crafteo y quests/logros/stats-tracker/bestiario — la misma regla aplica a cualquier sistema futuro.

**Regla 3 — `game.state` solo crece, nunca se reestructura.** Los campos ya definidos no cambian de nombre/tipo/ubicación una vez que otros sistemas los usan. Un sistema nuevo agrega SUS PROPIOS campos en paralelo, nunca reorganiza los existentes.

**Regla 4 — Cada sistema expone funciones públicas simples, esconde su implementación interna.** Otros archivos solo llaman funciones (`addItem()`, `gainXp()`, `updateQuestProgress()`), nunca acceden a variables internas de otro sistema. Esto permite reescribir el interior de un sistema sin que los demás se enteren, siempre que la función pública mantenga su forma.

**Consecuencia práctica:** siguiendo estas 4 reglas desde el hito 1, cualquier expansión futura (clima, facciones, mascotas, más contenido, lo que sea) significa crear un archivo nuevo + agregar entradas a tablas existentes + suscribirse a eventos existentes — nunca reabrir y reescribir un archivo que ya funcionaba y estaba probado. Si en algún punto agregar algo SÍ requiere tocar un archivo viejo, es señal de que ese archivo rompió la Regla 1 o la Regla 4 en algún momento, y hay que corregir eso primero.

## 9. Cómo correrlo

1. Descargar/clonar la carpeta completa manteniendo la estructura de archivos.
2. Abrir `index.html` directamente en un navegador (doble clic, o arrastrar al navegador).
3. Se mostrará la pantalla de menú principal primero — elegir "Nueva Partida" (con selección de dificultad) o "Continuar" para entrar al juego.
4. No requiere servidor local para funcionar (todo es rutas relativas y CDN), pero si el navegador bloquea carga de scripts locales por CORS, correr un servidor simple (`python3 -m http.server` o extensión "Live Server") como alternativa.
