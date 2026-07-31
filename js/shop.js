// Comercio: un vendedor por piso (definido en world.js), botón contextual de interacción,
// UI de dos columnas (comprar/vender). Vender cualquier item al 50% de su buyPrice de referencia.

const VENDOR_INTERACT_RADIUS = 3;

const SHOP_DATABASE = {
  zone_1: { sellsItemIds: ['potion_health_minor', 'sword_iron', 'dagger_swift', 'axe_battle', 'spear_guard', 'armor_leather'] },
  zone_2: { sellsItemIds: ['potion_health_minor', 'potion_health_medium'] },
  zone_3: { sellsItemIds: ['potion_health_minor', 'potion_health_medium', 'potion_strength'] },
  zone_4: { sellsItemIds: ['potion_health_medium', 'potion_strength'] },
  zone_5: { sellsItemIds: ['potion_health_medium', 'potion_strength'] },
  zone_6: { sellsItemIds: ['potion_health_medium', 'potion_strength', 'armor_iron'] },
  zone_7: { sellsItemIds: ['potion_health_medium', 'potion_strength', 'sword_tempered', 'armor_iron'] },
};

function buyItem(itemId) {
  const itemData = ITEM_DATABASE[itemId];
  if (!itemData || !itemData.buyPrice) return false;

  if (game.state.player.currency < itemData.buyPrice) {
    showNotification('No tenés suficiente Cor', 'warning');
    return false;
  }

  const result = addItem(itemId, 1);
  if (result.added < 1) {
    showNotification('Inventario lleno', 'warning');
    return false;
  }

  game.state.player.currency -= itemData.buyPrice;
  playSound('shopTransaction');
  showNotification(`Compraste: ${itemData.name}`, 'shop');
  refreshShopUI();
  return true;
}

function sellItem(itemId, qty = 1) {
  const itemData = ITEM_DATABASE[itemId];
  if (!itemData || !itemData.buyPrice) return false;

  const removed = removeItem(itemId, qty);
  if (!removed) return false;

  const earned = Math.round(itemData.buyPrice * 0.5) * qty;
  game.state.player.currency += earned;
  playSound('shopTransaction');
  showNotification(`Vendiste ${qty}x ${itemData.name} por ${earned} Cor`, 'shop');
  refreshShopUI();
  return true;
}

function refreshShopUI() {
  const currencyEl = document.getElementById('shop-currency-display');
  if (currencyEl) currencyEl.textContent = `${game.state.player.currency} Cor`;

  const shopData = SHOP_DATABASE[game.state.currentZone];
  const buyList = document.getElementById('shop-buy-list');
  if (buyList) {
    buyList.innerHTML = '';
    (shopData ? shopData.sellsItemIds : []).forEach((itemId) => {
      const itemData = ITEM_DATABASE[itemId];
      const canAfford = game.state.player.currency >= itemData.buyPrice;
      const row = document.createElement('div');
      row.className = 'shop-row';
      row.innerHTML = `<span>${itemData.name}</span><span>${itemData.buyPrice} Cor</span><button ${canAfford ? '' : 'disabled'}>Comprar</button>`;
      row.querySelector('button').addEventListener('click', () => buyItem(itemId));
      buyList.appendChild(row);
    });
  }

  const sellList = document.getElementById('shop-sell-list');
  if (sellList) {
    sellList.innerHTML = '';
    game.state.inventory.forEach((entry) => {
      const itemData = ITEM_DATABASE[entry.itemId];
      if (!itemData.buyPrice) return;
      const sellValue = Math.round(itemData.buyPrice * 0.5);
      const row = document.createElement('div');
      row.className = 'shop-row';
      row.innerHTML = `<span>${itemData.name} x${entry.quantity}</span><span>${sellValue} Cor c/u</span><button>Vender</button>`;
      row.querySelector('button').addEventListener('click', () => sellItem(entry.itemId, 1));
      sellList.appendChild(row);
    });
  }
}

function _checkVendorProximity() {
  const zoneData = ZONE_DATABASE[game.state.currentZone];
  const btn = document.getElementById('vendor-interact-btn');
  if (!btn) return;

  if (!zoneData || !zoneData.vendorPosition || !game.refs.currentVendorMesh) {
    btn.classList.add('hidden');
    return;
  }

  const mesh = game.refs.player;
  const dist = Math.hypot(mesh.position.x - zoneData.vendorPosition.x, mesh.position.z - zoneData.vendorPosition.z);
  btn.classList.toggle('hidden', dist >= VENDOR_INTERACT_RADIUS);
}

function updateShop(delta) {
  if (game.refs.uiState.modalOpen) return;
  _checkVendorProximity();
}

function openShop() {
  if (typeof closeInventory === 'function') closeInventory();
  if (typeof closeCrafting === 'function') closeCrafting();
  if (typeof closeSettings === 'function') closeSettings();
  if (typeof closeProgress === 'function') closeProgress();
  game.refs.uiState.modalOpen = true;
  document.getElementById('shop-overlay').classList.remove('hidden');
  refreshShopUI();
}

function closeShop() {
  game.refs.uiState.modalOpen = false;
  document.getElementById('shop-overlay').classList.add('hidden');
}

function initShop() {
  document.getElementById('vendor-interact-btn').addEventListener('touchstart', (e) => { e.preventDefault(); openShop(); }, { passive: false });
  document.getElementById('shop-close-btn').addEventListener('click', closeShop);
  game.registerSystem(updateShop);
}
