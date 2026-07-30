// Overlay de menú principal: Nueva Partida (con confirmación de sobrescritura y selección
// de dificultad), Continuar (solo si hay guardado), y Ajustes.

document.addEventListener('DOMContentLoaded', () => {
  const menuOverlay = document.getElementById('menu-overlay');
  const mainScreen = document.getElementById('menu-main-screen');
  const difficultyScreen = document.getElementById('menu-difficulty-screen');
  const btnNewGame = document.getElementById('btn-new-game');
  const btnContinue = document.getElementById('btn-continue');
  const btnMenuSettings = document.getElementById('btn-menu-settings');

  if (hasSaveData()) btnContinue.classList.remove('hidden');

  const goToDifficultyScreen = () => {
    mainScreen.classList.add('hidden');
    difficultyScreen.classList.remove('hidden');
  };

  btnNewGame.addEventListener('click', () => {
    if (hasSaveData()) {
      showConfirm('¿Seguro? Se perderá tu partida guardada.', goToDifficultyScreen);
    } else {
      goToDifficultyScreen();
    }
  });

  document.getElementById('btn-difficulty-back').addEventListener('click', () => {
    difficultyScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
  });

  document.querySelectorAll('.difficulty-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      game.state.settings.difficulty = btn.dataset.difficulty;
      menuOverlay.classList.add('hidden');
      startGame();
    });
  });

  btnContinue.addEventListener('click', () => {
    loadGame();
    menuOverlay.classList.add('hidden');
    startGame();
  });

  btnMenuSettings.addEventListener('click', () => openSettings());
});
