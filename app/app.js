// Leonida Trophy Guide — tracker logic (vanilla ES module, no dependencies).
// Loads app/data/trophies.json, renders the checklist, roadmap and sources,
// and keeps earned trophies in localStorage. No network request is made at
// run time beyond loading the app's own files.

const STORAGE_KEY = 'gta6-trophy-guide-v1';
const listEl = document.getElementById('trophyList');
const params = new URLSearchParams(location.search);

// The four roadmap stages, in the order a player meets them. Each stage
// names the trophies it covers so the checklist and the roadmap agree.
const ROADMAP_STAGES = [
  {
    title: 'Stage 1 — Before you start',
    text: 'Turn on progress and collectible notifications in Settings, so the game tells you when a counter moves. Keep cheats off your trophy run: they switch trophies and saving off. Make a manual save at the start of every chapter and one before the final mission — the game has no mission replay and no New Game+, so a save is your only way back.',
    trophies: [],
  },
  {
    title: 'Stage 2 — The story, Chapters 1–5',
    text: 'Play the five chapters and take side content as it appears: many stranger and character quests are only offered for a while. The one thing that can pass you by is in Chapter 1: the morning after “Down to Earth”, follow Lucia from the kitchen to the balcony and accept her meditation — it counts toward “Positive Mental Attitude” and is gone after Chapter 1. Everything else in the story pops as you finish its chapter or mission, and none of it can be missed.',
    trophies: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 20, 22, 23, 24, 26, 27, 28, 29],
  },
  {
    title: 'Stage 3 — After the credits: the 100% checklist',
    text: 'Open Progress > Stats > 100% Completion and work through what is left: every robbery, bank vault and gang operation, underwater discoveries, gold medals at every Shooting Range, every drone race, and all 15 of Bret’s Target Decks — plus a share of the rest (100 optional missions, 200 vehicle scans, 100 animal studies, 15 meditations, 70 challenges, 300 stunts, 100 WAiNK scans). This is the longest stretch, around 100 hours, and “A Long Road” pops at 100%.',
    trophies: [14, 15, 17, 18, 30, 40, 43],
  },
  {
    title: 'Stage 4 — Clean-up: strangers, collectibles, moments',
    text: 'Finish the stranger strands (8 for “Strangers & Freaks”), the collectible sets, the remaining activities and races, and the one-off moments — the cocktail on Ocean Beach, the showroom smash, the bowling alley, the melee drive-by. Tick the checklist below as you go; the platinum pops with the last trophy.',
    trophies: [1, 16, 19, 21, 25, 31, 32, 33, 34, 35, 36, 37, 38, 39, 41, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55],
  },
];

const KIND_FILTERS = [
  ['all', 'All'],
  ['story', 'Story'],
  ['missable', 'Missable'],
  ['collectibles', 'Collectibles'],
  ['activities', 'Activities'],
  ['robbery', 'Robbery'],
  ['exploration', 'Exploration'],
  ['side', 'Side quests'],
];

let trophies = [];
let sources = {};
let earned = new Set(loadProgress());
let kindFilter = 'all';
let gradeFilter = 'all';
let earnedOnly = false;
let spoilerMode = params.get('spoiler') === 'on';
let searchText = '';
let openId = params.get('open') ? Number(params.get('open')) : null;

// A link may open the guide with some trophies already ticked, for example
// ?earned=2,3,14 — used for the entry's screenshots, and shareable as a
// "here is what I have done so far" link. It only ever touches this browser.
if (params.get('earned')) {
  for (const raw of params.get('earned').split(',')) {
    const id = Number(raw);
    if (Number.isInteger(id)) earned.add(id);
  }
  saveProgress();
}

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function trophyById(id) {
  return trophies.find((t) => t.id === id);
}

function isStoryTrophy(t) {
  return t.kind === 'story' || t.hidden === true;
}

function isHiddenFromViewer(t) {
  return spoilerMode && isStoryTrophy(t) && !earned.has(t.id);
}

function matchesFilters(t) {
  if (gradeFilter !== 'all' && t.grade !== gradeFilter) return false;
  if (earnedOnly && !earned.has(t.id)) return false;
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
  if (searchText) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
    if (!hay.includes(searchText)) return false;
  }
  return true;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function sourceLink(key) {
  const s = sources[key];
  if (!s) return key;
  return s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>` : s.name;
}

function renderProgress() {
  const done = earned.size;
  const total = trophies.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  document.getElementById('progressPct').textContent = `${pct}%`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  const counts = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => {
      const all = trophies.filter((t) => t.grade === g).length;
      const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
      return `${got}/${all} ${gradeLabel(g)}`;
    })
    .join(' · ');
  document.getElementById('gradeCounts').textContent = counts;
  document.getElementById('footCount').textContent =
    `55 trophies · 1 platinum, 2 gold, 6 silver, 46 bronze · 28 hidden · 1 possibly missable.`;
}

function renderTrophyCard(t) {
  const card = document.createElement('article');
  card.className = `trophy${earned.has(t.id) ? ' earned' : ''}`;
  card.dataset.id = t.id;

  const head = document.createElement('div');
  head.className = 'trophy-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Earned: ${t.name}`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveProgress();
    renderProgress();
    renderTrophyList();
  });
  head.append(box);

  const title = document.createElement('div');
  title.className = 'trophy-title';
  const name = document.createElement('p');
  name.className = 'trophy-name';
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  if (isHiddenFromViewer(t)) {
    name.textContent = 'Hidden story trophy — earn it to reveal';
    desc.textContent = 'Spoilers hidden. Tick the box once you have earned it in-game.';
  } else {
    name.textContent = t.name;
    desc.textContent = t.description;
  }
  title.append(name, desc);

  const badges = document.createElement('div');
  badges.className = 'badges';
  const gradeBadge = document.createElement('span');
  gradeBadge.className = `badge ${t.grade}`;
  gradeBadge.textContent = gradeLabel(t.grade);
  badges.append(gradeBadge);
  if (t.hidden) {
    const b = document.createElement('span');
    b.className = 'badge hidden';
    b.textContent = 'Hidden';
    badges.append(b);
  }
  if (t.missable) {
    const b = document.createElement('span');
    b.className = 'badge missable';
    b.textContent = 'Missable';
    badges.append(b);
  }
  const kindBadge = document.createElement('span');
  kindBadge.className = 'badge kind';
  kindBadge.textContent = t.kind;
  if (t.kind !== t.grade) badges.append(kindBadge);
  if (t.count) {
    const c = document.createElement('span');
    c.className = 'trophy-count';
    c.textContent = t.count;
    badges.append(c);
  }
  title.append(badges);
  head.append(title);
  card.append(head);

  if (isHiddenFromViewer(t)) {
    const note = document.createElement('p');
    note.className = 'spoiler-note';
    note.textContent = 'Guide hidden until earned — it names a story moment.';
    card.append(note);
    return card;
  }

  const details = document.createElement('details');
  details.className = 'trophy-guide';
  if (openId === t.id) details.open = true;
  const summary = document.createElement('summary');
  summary.textContent = 'Guide & sources';
  details.append(summary);
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  details.append(guide);
  if (t.timing) {
    const timing = document.createElement('p');
    timing.className = 'timing';
    timing.textContent = `When: ${t.timing}`;
    details.append(timing);
  }
  if (t.unconfirmed) {
    const warn = document.createElement('p');
    warn.className = 'unconfirmed';
    warn.textContent =
      'Not yet confirmed: no guide has verified the exact steps for this one at launch. The description’s hint is all we can stand behind — see the sources.';
    details.append(warn);
  }
  const src = document.createElement('p');
  src.className = 'src';
  src.innerHTML = `Sources: ${(t.src || []).map(sourceLink).join(' · ')}`;
  details.append(src);
  card.append(details);
  return card;
}

function renderTrophyList() {
  const shown = trophies.filter(matchesFilters);
  listEl.replaceChildren(...shown.map(renderTrophyCard));
  document.getElementById('resultCount').textContent =
    `Showing ${shown.length} of ${trophies.length} trophies` +
    (spoilerMode ? ' · spoiler hiding is ON (story trophies stay hidden until earned)' : '');
  const missable = trophies.filter((t) => t.missable);
  document.getElementById('missableBanner').textContent =
    missable.length === 1
      ? `⚠ Missable: ${missable[0].name} — the only trophy the guides flag as possibly missable. Do its Chapter 1 meditation before the chapter ends; everything else stays available after the story.`
      : '';
}

function renderRoadmap() {
  const wrap = document.getElementById('roadmapStages');
  wrap.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const el = document.createElement('div');
    el.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = stage.title;
    const p = document.createElement('p');
    p.textContent = stage.text;
    el.append(h, p);
    if (stage.trophies.length) {
      const names = stage.trophies.map((id) => trophyById(id)).filter(Boolean);
      const line = document.createElement('p');
      line.className = 'stage-trophies';
      line.innerHTML =
        '<strong>Trophies in this stage:</strong> ' +
        names.map((t) => `${t.name} (${gradeLabel(t.grade)})`).join(' · ');
      el.append(line);
    }
    wrap.append(el);
  }
}

function renderSources() {
  const ul = document.getElementById('sourceList');
  ul.replaceChildren();
  for (const key of Object.keys(sources)) {
    const li = document.createElement('li');
    li.innerHTML = sourceLink(key) + (sources[key].note ? ` — ${sources[key].note}` : '');
    ul.append(li);
  }
}

function renderKindFilters() {
  const field = document.getElementById('kindFilters');
  for (const [value, label] of KIND_FILTERS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip${kindFilter === value ? ' active' : ''}`;
    btn.textContent = label;
    btn.addEventListener('click', () => {
      kindFilter = value;
      field.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
      btn.classList.add('active');
      renderTrophyList();
    });
    field.append(btn);
  }
}

function showView(view) {
  for (const v of ['guide', 'roadmap', 'about']) {
    document.getElementById(`view-${v}`).classList.toggle('hidden', v !== view);
    document.getElementById(`tab-${v}`).classList.toggle('active', v === view);
  }
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  if (!file) return;
  const data = JSON.parse(await file.text());
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  earned = new Set(ids.filter((id) => Number.isInteger(id) && trophyById(id)));
  saveProgress();
  renderProgress();
  renderTrophyList();
}

const doc = await (await fetch('data/trophies.json')).json();
trophies = doc.trophies;
sources = doc.sources || {};

renderKindFilters();
document.getElementById('gradeFilter').addEventListener('change', (e) => {
  gradeFilter = e.target.value;
  renderTrophyList();
});
document.getElementById('earnedOnly').addEventListener('change', (e) => {
  earnedOnly = e.target.checked;
  renderTrophyList();
});
document.getElementById('spoilerToggle').checked = spoilerMode;
document.getElementById('spoilerToggle').addEventListener('change', (e) => {
  spoilerMode = e.target.checked;
  renderTrophyList();
});
document.getElementById('search').addEventListener('input', (e) => {
  searchText = e.target.value.trim().toLowerCase();
  renderTrophyList();
});
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', async (e) => {
  try {
    await importProgress(e.target.files[0]);
  } catch {
    alert('That file is not a trophy-progress export from this guide.');
  }
  e.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear every ticked trophy?')) {
    earned = new Set();
    saveProgress();
    renderProgress();
    renderTrophyList();
  }
});
for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}
if (params.get('view')) showView(params.get('view'));

renderProgress();
renderRoadmap();
renderSources();
renderTrophyList();
