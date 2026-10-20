// Shared engine for the timed games (RAT, anagrams, Eyes test).
// 2 minutes in total, 15 seconds per problem, a fixation cross before each one.
//
// The page defines, before loading this file:
//   a <section id="start" class="screen"> with instructions and a #start-button
//   and either a fixed list, shown in order:
//     const problems = [{ lines: ['word', ...], answers: ['solution', ...] }, ...]
//   or a function that picks the next problem as the game goes (null to end):
//     function nextWordProblem(solvedCount) { return { lines, answers } }
//
// A problem is typed in, unless it has an image and four choices: then it is
// multiple choice, answered by clicking (a wrong word can be tried again):
//     { image: 'photo.jpg', choices: ['a', 'b', 'c', 'd'], answers: ['b'] }
// Optionally the page words the score itself:
//     function scoreText(who, count) { return who + ' got ' + count + ' right.' }

const TOTAL_MS = 2 * 60 * 1000;  // whole test
const PROBLEM_MS = 15 * 1000;    // time limit per problem
const FIXATION_MS = 500;         // fixation cross before each problem
const CORRECT_MS = 700;          // how long "Correct!" shows before the next problem

// Set by the trial settings on the page around the game ("win" or "lose")
const condition = new URLSearchParams(location.search).get('condition');

document.body.insertAdjacentHTML('beforeend', `
  <section id="trial" class="screen" hidden>
    <div class="clock">
      <div id="time-left">${TOTAL_MS / 60000}:00</div>
      <div class="problem-bar"><div id="problem-bar"></div></div>
    </div>
    <div id="fixation" class="center">+</div>
    <div id="problem" class="center" hidden></div>
    <p id="choice-message" class="choice-message" hidden></p>
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
const describeScore = typeof scoreText === 'function'
  ? scoreText
  : (who, count) => who + ' solved ' + plural(count);

let testStart, problemStart, answeredAt, clockTimer, fixationTimer, problemTimer, correctTimer;
let showingCorrect = false;  // "Correct!" is on screen, the next problem follows shortly
let current = null;      // the problem on screen
let shownCount = 0;      // problems shown so far
let attempts = [];       // wrong and right answers typed for the current problem
let solvedCount = 0;
let finished = false;
const log = [];          // one row per problem shown, printed to the console at the end

$('start-button').addEventListener('click', () => {
  hide('start');
  show('trial');
  // Load all photos now, so none appears late when its 15 seconds start
  if (typeof problems !== 'undefined') {
    problems.forEach((problem) => { if (problem.image) new Image().src = problem.image; });
  }
  testStart = performance.now();
  clockTimer = setInterval(updateClock, 100);
  updateClock();
  nextProblem();
});

function takeProblem() {
  if (typeof nextWordProblem === 'function') return nextWordProblem(solvedCount);
  return problems[shownCount] || null;
}

function nextProblem() {
  current = takeProblem();
  if (!current) return finish('done');
  shownCount++;
  hide('problem');
  hide('answer-form');
  hide('choice-message');
  show('fixation');
  problemStart = null;
  fixationTimer = setTimeout(showProblem, FIXATION_MS);
}

function showProblem() {
  hide('fixation');
  if (current.choices) {
    showChoices(current);
    $('choice-message').textContent = '';
    show('choice-message');
  } else {
    $('problem').replaceChildren(...current.lines.map((text) => {
      const line = document.createElement('div');
      line.textContent = text;
      return line;
    }));
    show('answer-form');
    $('answer').value = '';
    $('message').textContent = '';
    $('answer').focus();
  }
  show('problem');
  attempts = [];
  answeredAt = null;
  problemStart = performance.now();
  problemTimer = setTimeout(() => endProblem(false), PROBLEM_MS);
}

$('answer-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const answer = $('answer').value.trim().toLowerCase();
  if (!answer || problemStart === null) return;
  attempts.push(answer);
  if (current.answers.includes(answer)) {
    endProblem(true);
  } else {
    $('answer').value = '';
    $('message').textContent = 'Try again';
  }
});

// Multiple choice: the photo with its four words, two above and two below it,
// as on the paper version
function showChoices(problem) {
  const row = (words) => {
    const div = document.createElement('div');
    div.className = 'choice-row';
    div.append(...words.map((word) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice';
      button.dataset.choice = word;
      button.textContent = word;
      return button;
    }));
    return div;
  };
  const image = document.createElement('img');
  image.className = 'problem-image';
  image.src = problem.image;
  image.alt = '';
  $('problem').replaceChildren(row(problem.choices.slice(0, 2)), image, row(problem.choices.slice(2)));
}

// A right word shows "Correct!" and moves on; a wrong word is crossed out
// and another one can be tried, until the 15 seconds are up
$('problem').addEventListener('click', (event) => {
  const choice = event.target.closest('[data-choice]');
  if (!choice || choice.disabled || problemStart === null || showingCorrect) return;
  attempts.push(choice.dataset.choice);
  if (current.answers.includes(choice.dataset.choice)) {
    answeredAt = performance.now();
    clearTimeout(problemTimer);
    showingCorrect = true;
    choice.classList.add('correct');
    $('choice-message').textContent = 'Correct!';
    correctTimer = setTimeout(() => {
      showingCorrect = false;
      endProblem(true);
    }, CORRECT_MS);
  } else {
    choice.disabled = true;
    choice.classList.add('wrong');
    $('choice-message').textContent = 'Incorrect, try again';
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
    problem: shownCount,
    shown: current.image || current.lines.join(' / '),
    solution: current.answers.join(' / '),
    solved: solved,
    seconds: solved ? Math.round((answeredAt ?? performance.now()) - problemStart) / 1000 : null,
    firstTry: solved && attempts.length === 1,
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
  clearTimeout(correctTimer);
  if (showingCorrect) {
    // Answered right just before the time ran out: still counts
    record(true);
    solvedCount++;
  } else if (reason === 'time' && problemStart !== null) {
    // A problem cut off by the total time limit still counts as shown, unsolved
    record(false);
  }

  hide('trial');
  show('end');
  const solvedText = describeScore('You', solvedCount);
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
      lines: [solvedText, describeScore('The AI', aiCount)],
      log: log,
    }, location.origin);
  }
}
