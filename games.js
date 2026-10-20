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

// How tall the game's content is. The timed games show one .screen at a time,
// stretched to fill the frame, so for those add up what is in the screen showing;
// that way the frame can shrink again (e.g. from long instructions to the game).
function contentHeight(doc) {
  const view = doc.defaultView;
  const screen = [...doc.querySelectorAll('.screen')].find((s) => !s.hidden);
  if (!screen) return doc.documentElement.getBoundingClientRect().height;
  const style = view.getComputedStyle(screen);
  let height = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  for (const child of screen.children) {
    const childStyle = view.getComputedStyle(child);
    if (childStyle.position === 'absolute' || childStyle.display === 'none') continue;
    height += child.getBoundingClientRect().height
      + parseFloat(childStyle.marginTop) + parseFloat(childStyle.marginBottom);
  }
  return height;
}

// Keep the frame at least square, and taller when the game needs it,
// so it never needs a scrollbar
frame.addEventListener('load', () => {
  const fit = () => {
    frame.style.aspectRatio = 'auto';
    frame.style.height = Math.max(frame.clientWidth, contentHeight(frame.contentDocument)) + 'px';
  };
  new ResizeObserver(fit).observe(frame.contentDocument.body);
  // Also re-measure when the game switches screens (e.g. instructions -> game),
  // which doesn't always change the game's size by itself
  new MutationObserver(fit).observe(frame.contentDocument.body,
    { subtree: true, attributes: true, attributeFilter: ['hidden'] });
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
