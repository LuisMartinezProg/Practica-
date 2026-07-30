// Inventario, equipo y durabilidad. ITEM_DATABASE es la fuente de verdad para todo item.

const INVENTORY_CONFIG = { maxSlots: 30, maxStack: 99 };
const DURABILITY_CONFIG = { pointsLostPerHit: 1 };

const ITEM_DATABASE = {
  sword_iron: { id: 'sword_iron', name: 'Espada de Hierro', type: 'weapon', rarity: 'common', damageCategory: 'slashing', canBlock: true, statBonus: { attack: 5 }, maxDurability: 100 },
  sword_tempered: { id: 'sword_tempered', name: 'Espada Templada', type: 'weapon', rarity: 'rare', damageCategory: 'slashing', canBlock: true, statBonus: { attack: 9 }, maxDurability: 120 },
  dagger_swift: { id: 'dagger_swift', name: 'Daga Veloz', type: 'weapon', rarity: 'common', damageCategory: 'piercing', canBlock: false, statBonus: { attack: 3, speed: 1 }, maxDurability: 90 },
  axe_battle: { id: 'axe_battle', name: 'Hacha de Batalla', type: 'weapon', rarity: 'common', damageCategory: 'blunt', canBlock: true, statBonus: { attack: 7 }, maxDurability: 110 },
  spear_guard: { id: 'spear_guard', name: 'Lanza de Guardia', type: 'weapon', rarity: 'common', damageCategory: 'thrust', canBlock: true, statBonus: { attack: 6, defense: 2 }, maxDurability: 105 },
  armor_leather: { id: 'armor_leather', name: 'Armadura de Cuero', type: 'armor', rarity: 'common', statBonus: { defense: 3, maxHp: 10 }, maxDurability: 80 },
  armor_iron: { id: 'armor_iron', name: 'Armadura de Hierro', type: 'armor', rarity: 'rare', statBonus: { defense: 6, maxHp: 20 }, maxDurability: 120 },
  material_wolf_pelt: { id: 'material_wolf_pelt', name: 'Piel de Lobo', type: 'material', rarity: 'common' },
  material_wolf_fang: { id: 'material_wolf_fang', name: 'Colmillo de Lobo', type: 'material', rarity: 'common' },
  material_stalker_spine: { id: 'material_stalker_spine', name: 'Espina de Acechador', type: 'material', rarity: 'common' },
  material_golem_core: { id: 'material_golem_core', name: 'Núcleo de Golem', type: 'material', rarity: 'common' },
  material_ruin_arrowhead: { id: 'material_ruin_arrowhead', name: 'Punta de Flecha en Ruinas', type: 'material', rarity: 'common' },
  material_ancient_bone: { id: 'material_ancient_bone', name: 'Hueso Antiguo', type: 'material', rarity: 'common' },
  material_ice_crystal: { id: 'material_ice_crystal', name: 'Cristal de Hielo', type: 'material', rarity: 'common' },
  material_sentinel_core: { id: 'material_sentinel_core', name: 'Núcleo del Centinela', type: 'material', rarity: 'rare' },
  material_guardian_heart: { id: 'material_guardian_heart', name: 'Corazón del Guardián', type: 'material', rarity: 'epic' },
  potion_health_minor: { id: 'potion_health_minor', name: 'Poción de Vida Menor', type: 'consumable', rarity: 'common', healAmount: 40 },
  potion_health_medium: { id: 'potion_health_medium', name: 'Poción de Vida Mediana', type: 'consumable', rarity: 'common', healAmount: 80 },
};

let _pendingItemId = null;
let _pendingEquippedSlot = null;

function addItem(itemId, qty = 1) {
  const itemData = ITEM_DATABASE[itemId];
  if (!itemData) { console.error(`addItem: item desconocido "${itemId}"`); return { added: 0, full: false }; }

  const inventory = game.state.inventory;
  const isStackable = itemData.type === 'material' || itemData.type === 'consumable';

  let remaining = qty;
  let added = 0;

  if (isStackable) {
    const existing = inventory.find((e) => e.itemId === itemId && e.quantity < INVENTORY_CONFIG.maxStack);
    if (existing) {
      const space = INVENTORY_CONFIG.maxStack - existing.quantity;
      const toAdd = Math.min(space, remaining);
      existing.quantity += toAdd;
      added += toAdd;
      remaining -= toAdd;
    }
  }

  while (remaining > 0 && inventory.length < INVENTORY_CONFIG.maxSlots) {
    const toAdd = isStackable ? Math.min(INVENTORY_CONFIG.maxStack, remaining) : 1;
    inventory.push({ itemId, quantity: toAdd });
    added += toAdd;
    remaining -= toAdd;
  }

  const full = remaining > 0;
  if (full) showNotification(added > 0 ? 'Inventario lleno, no se pudo recoger todo' : 'Inventario lleno', 'warning');

  refreshInventoryUI();
  return { added, full };
}

function removeItem(itemId, qty = 1) {
  const inventory = game.state.inventory;
  let remaining = qty;

  for (let i = inventory.length - 1; i >= 0 && remaining > 0; i--) {
    const entry = inventory[i];
    if (entry.itemId !== itemId) continue;
    const take = Math.min(entry.quantity, remaining);
    entry.quantity -= take;
    remaining -= take;
    if (entry.quantity <= 0) inventory.splice(i, 1);
  }

  refreshInventoryUI();
  return remaining === 0;
}

function equipItem(itemId) {
  const itemData = ITEM_DATABASE[itemId];
  if (!itemData) return false;
  if (itemData.type !== 'weapon' && itemData.type !== 'armor') return false;

  const slot = itemData.type;
  const hasInInventory = game.state.inventory.some((e) => e.itemId === itemId && e.quantity > 0);
  if (!hasInInventory) return false;

  const previouslyEquipped = game.state.player.equipped[slot];
  removeItem(itemId, 1);

  if (previouslyEquipped) {
    const result = addItem(previouslyEquipped.itemId, 1);
    if (result.added < 1) {
      addItem(itemId, 1);
      showNotification('Inventario lleno, no se pudo cambiar de equipo', 'warning');
      return false;
    }
  }

  game.state.player.equipped[slot] = { itemId, durability: itemData.maxDurability };
  showNotification(`Equipado: ${itemData.name}`, 'info');
  refreshInventoryUI();
  return true;
}

function unequipItem(slot) {
  const equipped = game.state.player.equipped[slot];
  if (!equipped) return false;

  const result = addItem(equipped.itemId, 1);
  if (result.added < 1) {
    showNotification('Inventario lleno, no se pudo desequipar', 'warning');
    return false;
  }

  game.state.player.equipped[slot] = null;
  refreshInventoryUI();
  return true;
}

function useItem(itemId) {
  const itemData = ITEM_DATABASE[itemId];
  if (!itemData || itemData.type !== 'consumable') return false;

  const hasInInventory = game.state.inventory.some((e) => e.itemId === itemId && e.quantity > 0);
  if (!hasInInventory) return false;

  if (itemData.healAmount) {
    const stats = game.state.player.stats;
    const maxHp = getEffectiveStats().maxHp;
    if (stats.hp >= maxHp) {
      showNotification('Ya estás al máximo de HP', 'info');
      return false;
    }
    stats.hp = Math.min(maxHp, stats.hp + itemData.healAmount);
    showNotification(`+${itemData.healAmount} HP (${itemData.name})`, 'heal');
  }

  removeItem(itemId, 1);
  return true;
}

function damageEquippedWeapon(amount = DURABILITY_CONFIG.pointsLostPerHit) {
  _damageEquippedSlot('weapon', amount);
}

function damageEquippedArmor(amount = DURABILITY_CONFIG.pointsLostPerHit) {
  _damageEquippedSlot('armor', amount);
}

function _damageEquippedSlot(slot, amount) {
  const equipped = game.state.player.equipped[slot];
  if (!equipped) return;

  const wasBroken = equipped.durability <= 0;
  equipped.durability = Math.max(0, equipped.durability - amount);

  if (!wasBroken && equipped.durability <= 0) {
    showNotification(`${ITEM_DATABASE[equipped.itemId].name} está desgastado`, 'warning');
  }

  refreshInventoryUI();
}

function initInventory() {
  document.getElementById('inventory-toggle-btn').addEventListener('touchstart', (e) => { e.preventDefault(); toggleInventory(); }, { passive: false });
  document.getElementById('inventory-close-btn').addEventListener('click', closeInventory);
  document.getElementById('item-action-equip').addEventListener('click', _onActionEquipToggle);
  document.getElementById('item-action-use').addEventListener('click', _onActionUse);
  document.getElementById('item-action-drop').addEventListener('click', _onActionDrop);
  document.getElementById('item-action-cancel').addEventListener('click', _closeItemActionMenu);
  refreshInventoryUI();
}

function toggleInventory() {
  const overlay = document.getElementById('inventory-overlay');
  if (overlay.classList.contains('hidden')) openInventory(); else closeInventory();
}

function openInventory() {
  if (typeof closeCrafting === 'function') closeCrafting();
  game.refs.uiState.modalOpen = true;
  document.getElementById('inventory-overlay').classList.remove('hidden');
  refreshInventoryUI();
}

function closeInventory() {
  game.refs.uiState.modalOpen = false;
  document.getElementById('inventory-overlay').classList.add('hidden');
  _closeItemActionMenu();
}

function refreshInventoryUI() {
  const countEl = document.getElementById('inventory-count');
  if (countEl) countEl.textContent = `${game.state.inventory.length}/${INVENTORY_CONFIG.maxSlots}`;

  _renderEquippedSlot('weapon', 'equipped-weapon-slot');
  _renderEquippedSlot('armor', 'equipped-armor-slot');
  _renderInventoryGrid();
}

function _renderEquippedSlot(slot, elementId) {
  const container = document.getElementById(elementId);
  if (!container) return;
  const content = container.querySelector('.equipped-slot-content');
  const equipped = game.state.player.equipped[slot];

  if (!equipped) {
    content.innerHTML = `<div class="equipped-item-empty">Vacío</div>`;
    return;
  }

  const itemData = ITEM_DATABASE[equipped.itemId];
  const maxDur = itemData.maxDurability;
  const pct = Math.max(0, (equipped.durability / maxDur) * 100);
  const durClass = equipped.durability <= 0 ? 'broken' : pct < 30 ? 'low' : '';

  content.innerHTML = `
    <div class="equipped-item-name">${itemData.name}</div>
    <div class="durability-bar-bg"><div class="durability-bar-fill ${durClass}" style="width:${pct}%"></div></div>
  `;
  content.onclick = () => _openItemActionMenuForEquipped(slot);
}

function _renderInventoryGrid() {
  const grid = document.getElementById('inventory-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let i = 0; i < INVENTORY_CONFIG.maxSlots; i++) {
    const entry = game.state.inventory[i];
    const cell = document.createElement('div');
    cell.className = 'inventory-slot';

    if (entry) {
      const itemData = ITEM_DATABASE[entry.itemId];
      cell.classList.add(`rarity-${itemData.rarity}`);
      cell.innerHTML = `${itemData.name}${entry.quantity > 1 ? `<span class="inventory-slot-qty">${entry.quantity}</span>` : ''}`;
      cell.addEventListener('click', () => _openItemActionMenuForSlot(i));
    } else {
      cell.classList.add('inventory-slot-empty');
    }

    grid.appendChild(cell);
  }
}

function _openItemActionMenuForSlot(index) {
  const entry = game.state.inventory[index];
  if (!entry) return;
  _showItemActionMenu(entry.itemId, null);
}

function _openItemActionMenuForEquipped(slot) {
  const equipped = game.state.player.equipped[slot];
  if (!equipped) return;
  _showItemActionMenu(equipped.itemId, slot);
}

function _showItemActionMenu(itemId, equippedSlot) {
  const itemData = ITEM_DATABASE[itemId];
  _pendingItemId = itemId;
  _pendingEquippedSlot = equippedSlot;

  document.getElementById('item-action-name').textContent = itemData.name;

  const isGear = itemData.type === 'weapon' || itemData.type === 'armor';
  const equipBtn = document.getElementById('item-action-equip');
  equipBtn.classList.toggle('hidden', !isGear);
  equipBtn.textContent = equippedSlot ? 'Desequipar' : 'Equipar';

  document.getElementById('item-action-use').classList.toggle('hidden', itemData.type !== 'consumable');
  document.getElementById('item-action-drop').classList.toggle('hidden', !!equippedSlot);

  document.getElementById('item-action-menu').classList.remove('hidden');
}

function _onActionEquipToggle() {
  if (_pendingEquippedSlot) unequipItem(_pendingEquippedSlot);
  else if (_pendingItemId) equipItem(_pendingItemId);
  _closeItemActionMenu();
}

function _onActionUse() {
  if (_pendingItemId) useItem(_pendingItemId);
  _closeItemActionMenu();
}

function _onActionDrop() {
  if (_pendingItemId) {
    const itemData = ITEM_DATABASE[_pendingItemId];
    removeItem(_pendingItemId, 1);
    showNotification(`Descartaste: ${itemData.name}`, 'info');
  }
  _closeItemActionMenu();
}

function _closeItemActionMenu() {
  document.getElementById('item-action-menu').classList.add('hidden');
  _pendingItemId = null;
  _pendingEquippedSlot = null;
}
