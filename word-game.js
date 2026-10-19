// Shared engine for the timed word games (RAT, anagrams).
// 5 minutes in total, 15 seconds per problem, a fixation cross before each one.
//
// The page defines, before loading this file:
//   const problems = [{ lines: ['word', ...], answers: ['solution', ...] }, ...]
//   a <section id="start" class="screen"> with instructions and a #start-button

const TOTAL_MS = 5 * 60 * 1000;  // whole test
const PROBLEM_MS = 15 * 1000;    // time limit per problem
const FIXATION_MS = 500;         // fixation cross before each problem

// Set by the trial settings on the page around the game ("win" or "lose")
const condition = new URLSearchParams(location.search).get('condition');

document.body.insertAdjacentHTML('beforeend', `
  <section id="trial" class="screen" hidden>
    <div class="clock">
      <div id="time-left">5:00</div>
      <div class="problem-bar"><div id="problem-bar"></div></div>
    </div>
    <div id="fixation" class="center">+</div>
    <div id="problem" class="center" hidden></div>
    <form id="answer-form" class="answer-form" autocomplete="off" hidden>
      <input id="answer" aria-label="Your answer" autocapitalize="off" spellcheck="false">
      <p id="message" class="message"></p>
    </form>
  </section>
  <section id="end" class="screen" hidden>
    <p id="end-title"></p>
    <p id="end-score"></p>
  </section>`);

const $ = (id) => document.getElementById(id);
const show = (id) => { $(id).hidden = false; };
const hide = (id) => { $(id).hidden = true; };
const plural = (n) => n + (n === 1 ? ' problem.' : ' problems.');

let testStart, problemStart, clockTimer, fixationTimer, problemTimer;
let current = -1;        // index of the problem on screen
let attempts = [];       // wrong and right answers typed for the current problem
let solvedCount = 0;
let finished = false;
const log = [];          // one row per problem shown, printed to the console at the end

$('start-button').addEventListener('click', () => {
  hide('start');
  show('trial');
  testStart = performance.now();
  clockTimer = setInterval(updateClock, 100);
  updateClock();
  nextProblem();
});

function nextProblem() {
  current++;
  if (current >= problems.length) return finish('done');
  hide('problem');
  hide('answer-form');
  show('fixation');
  problemStart = null;
  fixationTimer = setTimeout(showProblem, FIXATION_MS);
}

function showProblem() {
  $('problem').replaceChildren(...problems[current].lines.map((text) => {
    const line = document.createElement('div');
    line.textContent = text;
    return line;
  }));
  hide('fixation');
  show('problem');
  show('answer-form');
  $('answer').value = '';
  $('message').textContent = '';
  $('answer').focus();
  attempts = [];
  problemStart = performance.now();
  problemTimer = setTimeout(() => endProblem(false), PROBLEM_MS);
}

$('answer-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const answer = $('answer').value.trim().toLowerCase();
  if (!answer || problemStart === null) return;
  attempts.push(answer);
  if (problems[current].answers.includes(answer)) {
    endProblem(true);
  } else {
    $('answer').value = '';
    $('message').textContent = 'Try again';
  }
});

function endProblem(solved) {
  clearTimeout(problemTimer);
  record(solved);
  if (solved) solvedCount++;
  nextProblem();
}

function record(solved) {
  log.push({
    problem: current + 1,
    shown: problems[current].lines.join(' / '),
    solved: solved,
    seconds: solved ? Math.round(performance.now() - problemStart) / 1000 : null,
    attempts: attempts.join(', '),
  });
}

function updateClock() {
  const now = performance.now();
  const left = TOTAL_MS - (now - testStart);
  if (left <= 0) return finish('time');
  const seconds = Math.ceil(left / 1000);
  $('time-left').textContent = Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  const problemLeft = problemStart === null ? 1 : Math.max(0, 1 - (now - problemStart) / PROBLEM_MS);
  $('problem-bar').style.width = problemLeft * 100 + '%';
}

function finish(reason) {
  if (finished) return;
  finished = true;
  clearInterval(clockTimer);
  clearTimeout(fixationTimer);
  clearTimeout(problemTimer);
  // A problem cut off by the 5-minute limit still counts as shown, unsolved
  if (reason === 'time' && problemStart !== null) record(false);

  hide('trial');
  show('end');
  const solvedText = 'You solved ' + plural(solvedCount);
  $('end-title').textContent = reason === 'time' ? "Time's up!" : 'You have done all the problems!';
  $('end-score').textContent = solvedText;
  console.table(log);

  // Tell the page around the game how it went, so it can show the outcome:
  // the AI solved 2 fewer (win) or 2 more (lose) than the participant
  if (condition && window.parent !== window) {
    const won = condition === 'win';
    const aiCount = won ? Math.max(0, solvedCount - 2) : solvedCount + 2;
    window.parent.postMessage({
      type: 'trial-result',
      won: won,
      lines: [solvedText, 'The AI solved ' + plural(aiCount)],
      log: log,
    }, location.origin);
  }
}
