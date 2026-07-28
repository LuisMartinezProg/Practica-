// Overlay de menú principal. Bloquea el arranque de main.js hasta elegir Nueva Partida.
// (Continuar, Ajustes y selección de dificultad se agregan en el Hito 7 sin reescribir esto.)

document.addEventListener('DOMContentLoaded', () => {
  const btnNewGame = document.getElementById('btn-new-game');
  const menuOverlay = document.getElementById('menu-overlay');

  btnNewGame.addEventListener('click', () => {
    menuOverlay.classList.add('hidden');
    startGame(); // definido en main.js
  });
});
