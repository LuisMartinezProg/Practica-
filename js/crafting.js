// Crafteo de items nuevos y reparación del equipo actualmente puesto.
// Sin recetas nuevas en este hito: los materiales de pisos 2-8 quedan listos para cuando se amplíe.

const RECIPE_DATABASE = {
  craft_potion_medium: { resultItemId: 'potion_health_medium', type: 'craft', materials: [{ itemId: 'material_wolf_pelt', quantity: 2 }], category: null, tier: 'common' },
  craft_sword_tempered: { resultItemId: 'sword_tempered', type: 'craft', materials: [{ itemId: 'material_wolf_pelt', quantity: 8 }, { itemId: 'material_wolf_fang', quantity: 5 }], category: 'slashing', tier: 'rare' },
  craft_armor_iron: { resultItemId: 'armor_iron', type: 'craft', materials: [{ itemId: 'material_wolf_pelt', quantity: 6 }, { itemId: 'material_wolf_fang', quantity: 6 }], category: null, tier: 'rare' },
  repair_sword_iron: { resultItemId: 'sword_iron', type: 'repair', materials: [{ itemId: 'material_wolf_pelt', quantity: 2 }] },
  repair_sword_tempered: { resultItemId: 'sword_tempered', type: 'repair', materials: [{ itemId: 'material_wolf_pelt', quantity: 3 }, { itemId: 'material_wolf_fang', quantity: 2 }] },
  repair_dagger_swift: { resultItemId: 'dagger_swift', type: 'repair', materials: [{ itemId: 'material_wolf_fang', quantity: 2 }] },
  repair_axe_battle: { resultItemId: 'axe_battle', type: 'repair', materials: [{ itemId: 'material_wolf_pelt', quantity: 2 }] },
  repair_spear_guard: { resultItemId: 'spear_guard', type: 'repair', materials: [{ itemId: 'material_wolf_pelt', quantity: 1 }, { itemId: 'material_wolf_fang', quantity: 1 }] },
  repair_armor_leather: { resultItemId: 'armor_leather', type: 'repair', materials: [{ itemId: 'material_wolf_pelt', quantity: 2 }] },
  repair_armor_iron: { resultItemId: 'armor_iron', type: 'repair', materials: [{ itemId: 'material_wolf_pelt', quantity: 3 }, { itemId: 'material_wolf_fang', quantity: 2 }] },
};

function _getSlotForItem(itemId) {
  const itemData = ITEM_DATABASE[itemId];
  if (!itemData) return null;
  if (itemData.type === 'weapon') return 'weapon';
  if (itemData.type === 'armor') return 'armor';
  return null;
}

function _getTotalQuantity(itemId) {
  return game.state.inventory.filter((e) => e.itemId === itemId).reduce((sum, e) => sum + e.quantity, 0);
}

function canCraft(recipeId) {
  const recipe = RECIPE_DATABASE[recipeId];
  if (!recipe) return false;

  if (recipe.type === 'repair') {
    const slot = _getSlotForItem(recipe.resultItemId);
    if (!slot) return false;
    const equipped = game.state.player.equipped[slot];
    if (!equipped || equipped.itemId !== recipe.resultItemId) return false;
    const itemData = ITEM_DATABASE[recipe.resultItemId];
    if (equipped.durability >= itemData.maxDurability) return false;
  }

  return recipe.materials.every((m) => _getTotalQuantity(m.itemId) >= m.quantity);
}

function craft(recipeId) {
  if (!canCraft(recipeId)) return false;
  const recipe = RECIPE_DATABASE[recipeId];

  recipe.materials.forEach((m) => removeItem(m.itemId, m.quantity));

  if (recipe.type === 'repair') {
    const slot = _getSlotForItem(recipe.resultItemId);
    const itemData = ITEM_DATABASE[recipe.resultItemId];
    game.state.player.equipped[slot].durability = itemData.maxDurability;
    showNotification(`${itemData.name} reparada`, 'craft');
  } else {
    addItem(recipe.resultItemId, 1);
    game.state.playerStats.itemsCrafted += 1;
    showNotification(`Crafteado: ${ITEM_DATABASE[recipe.resultItemId].name}`, 'craft');
  }

  refreshInventoryUI();
  refreshCraftingUI();
  return true;
}

function _getRepairRecipeForEquippedSlot(slot) {
  const equipped = game.state.player.equipped[slot];
  if (!equipped) return null;
  const entry = Object.entries(RECIPE_DATABASE).find(([, r]) => r.type === 'repair' && r.resultItemId === equipped.itemId);
  return entry ? entry[0] : null;
}

function initCrafting() {
  document.getElementById('crafting-toggle-btn').addEventListener('touchstart', (e) => { e.preventDefault(); toggleCrafting(); }, { passive: false });
  document.getElementById('crafting-close-btn').addEventListener('click', closeCrafting);
  refreshCraftingUI();
}

function toggleCrafting() {
  const overlay = document.getElementById('crafting-overlay');
  if (overlay.classList.contains('hidden')) openCrafting(); else closeCrafting();
}

function openCrafting() {
  if (typeof closeInventory === 'function') closeInventory();
  game.refs.uiState.modalOpen = true;
  document.getElementById('crafting-overlay').classList.remove('hidden');
  refreshCraftingUI();
}

function closeCrafting() {
  game.refs.uiState.modalOpen = false;
  document.getElementById('crafting-overlay').classList.add('hidden');
}

function refreshCraftingUI() {
  const list = document.getElementById('crafting-list');
  if (!list) return;
  list.innerHTML = '';

  ['weapon', 'armor'].forEach((slot) => {
    const recipeId = _getRepairRecipeForEquippedSlot(slot);
    if (recipeId) list.appendChild(_buildRecipeRow(recipeId));
  });

  Object.keys(RECIPE_DATABASE).forEach((recipeId) => {
    if (RECIPE_DATABASE[recipeId].type === 'craft') list.appendChild(_buildRecipeRow(recipeId));
  });
}

function _buildRecipeRow(recipeId) {
  const recipe = RECIPE_DATABASE[recipeId];
  const itemData = ITEM_DATABASE[recipe.resultItemId];
  const canDo = canCraft(recipeId);

  const row = document.createElement('div');
  row.className = 'recipe-row';

  const materialsHtml = recipe.materials.map((m) => {
    const have = _getTotalQuantity(m.itemId);
    const mData = ITEM_DATABASE[m.itemId];
    const ok = have >= m.quantity;
    return `<span class="recipe-material ${ok ? 'ok' : 'missing'}">${mData.name} ${have}/${m.quantity}</span>`;
  }).join('');

  const actionLabel = recipe.type === 'repair' ? 'Reparar' : 'Craftear';

  row.innerHTML = `
    <div class="recipe-row-name">${itemData.name} ${recipe.type === 'repair' ? '<span class="recipe-row-type">(reparar)</span>' : ''}</div>
    <div class="recipe-row-materials">${materialsHtml}</div>
    <button class="recipe-row-btn" ${canDo ? '' : 'disabled'}>${actionLabel}</button>
  `;

  row.querySelector('.recipe-row-btn').addEventListener('click', () => craft(recipeId));

  return row;
}
