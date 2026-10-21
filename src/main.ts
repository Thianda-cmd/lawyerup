import './styles/main.css';
import { CONTENT } from './content';
import { Game } from './engine/game';
import { mountHudButtons, showTitle } from './ui/menus';

const stage = document.getElementById('stage')!;
const viewport = document.getElementById('viewport')!;

/** Scale the fixed 1600x900 stage to fit inside the viewport's safe area. */
function fit(): void {
  const cs = getComputedStyle(viewport);
  const w = viewport.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const h = viewport.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const s = Math.min(w / 1600, h / 900);
  stage.style.transform = `scale(${s})`;
}
window.addEventListener('resize', fit);
fit();

const hint = document.querySelector<HTMLButtonElement>('.rotate-hint');
hint?.addEventListener('click', () => (hint.hidden = true));

const game = new Game(stage, CONTENT);
mountHudButtons(game);
showTitle(game, true);

// Handy for debugging from the console: __game.play('c1_iris')
(window as unknown as { __game: Game }).__game = game;
