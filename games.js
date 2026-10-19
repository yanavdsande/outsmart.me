// Shared code for pages that show a game in a box, with trial settings above it.
// The page needs a <form class="trial-settings"> and an <iframe class="game-frame">.

const frame = document.querySelector('.game-frame');
const settings = document.querySelector('.trial-settings');

// Load the chosen game with the chosen settings, passed in the frame's address
// (e.g. rat.html?condition=win). Pages with no "game" dropdown use data-game.
function loadGame() {
  const params = new URLSearchParams(new FormData(settings));
  const game = params.get('game') || frame.dataset.game;
  params.delete('game');
  frame.src = game + '.html?' + params;
}
settings.addEventListener('change', loadGame);
loadGame();

// Keep the frame at least square, and taller when the game needs it,
// so it never needs a scrollbar
frame.addEventListener('load', () => {
  const fit = () => {
    frame.style.aspectRatio = 'auto';
    const content = frame.contentDocument.documentElement.getBoundingClientRect().height;
    frame.style.height = Math.max(frame.clientWidth, content) + 'px';
  };
  new ResizeObserver(fit).observe(frame.contentDocument.body);
  fit();
});

// Pop-up with the trial outcome. A game reports it with
// parent.postMessage({ type: 'trial-result', won: true/false, lines: [...] })
const popup = document.createElement('dialog');
popup.className = 'result-popup';
popup.innerHTML = `
  <h2></h2>
  <div class="lines"></div>
  <form method="dialog">
    <button value="again" class="primary">Play again</button>
    <button value="close">Close</button>
  </form>`;
document.body.append(popup);

window.addEventListener('message', (event) => {
  if (event.origin !== location.origin || event.data?.type !== 'trial-result') return;
  const result = event.data;
  popup.querySelector('h2').textContent = result.won ? 'You won!' : 'You lost!';
  popup.querySelector('.lines').replaceChildren(...result.lines.map((text) => {
    const line = document.createElement('p');
    line.textContent = text;
    return line;
  }));
  popup.returnValue = ''; // so closing with Esc doesn't repeat the last button
  popup.showModal();
});

// "Play again" restarts the trial with the same settings
popup.addEventListener('close', () => {
  if (popup.returnValue === 'again') frame.contentWindow.location.reload();
});
