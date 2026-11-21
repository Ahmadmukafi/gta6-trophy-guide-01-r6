// VICE CITY VAULT — GTA VI trophy guide and tracker.
// Loads app/data/trophies.json, renders the checklist, the platinum roadmap and
// one trophy's cited guide at a time. Progress lives in localStorage and can be
// exported to a file and imported back. No network at run time.
const KEY = 'vice-city-vault-progress-v1';
const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
const KIND_LABEL = { story: 'Story', missable: 'Missable', collectible: 'Collectible', activity: 'Activity', online: 'Online' };

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const metaEl = document.getElementById('listMeta');
const emptyEl = document.getElementById('emptyState');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const earnedEl = document.getElementById('earnedFilter');
const spoilerEl = document.getElementById('spoiler');
const chipsEl = document.getElementById('kindChips');

let doc = null;
let earned = new Set(readStored());
let kind = 'all';
let selectedId = null;

function readStored() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? ids.filter((n) => Number.isInteger(n)) : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function spoilered(t) {
  return spoilerEl.checked && t.kinds.includes('story') && !earned.has(t.id);
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return doc.trophies.filter((t) => {
    if (kind === 'missable' && !t.missable) return false;
    if (kind !== 'all' && kind !== 'missable' && !t.kinds.includes(kind)) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (earnedEl.value === 'earned' && !earned.has(t.id)) return false;
    if (earnedEl.value === 'unearned' && earned.has(t.id)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function gradeTag(t) {
  return `<span class="tag grade-${t.grade}">${t.grade}</span>`;
}

function renderProgress() {
  const n = earned.size;
  const total = doc.trophies.length;
  const pct = Math.round((n / total) * 100);
  document.getElementById('counts').textContent = `${n} of ${total} earned`;
  document.getElementById('ringPct').textContent = `${pct}%`;
  document.getElementById('ringFg').style.strokeDashoffset = String(326.7 * (1 - n / total));
  const breakdown = document.getElementById('gradesBreakdown');
  if (breakdown) {
    breakdown.replaceChildren();
    for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
      const ofGrade = doc.trophies.filter((t) => t.grade === g);
      const got = ofGrade.filter((t) => earned.has(t.id)).length;
      const span = document.createElement('span');
      span.className = `gb gb-${g}`;
      span.innerHTML = `<b>${got}/${ofGrade.length}</b> ${g}`;
      breakdown.append(span);
    }
  }
}

function renderRoadmap() {
  const stagesEl = document.getElementById('stages');
  stagesEl.replaceChildren();
  for (const s of doc.roadmap) {
    const done = s.trophies.filter((id) => earned.has(id)).length;
    const li = document.createElement('li');
    li.className = `stage${done === s.trophies.length ? ' done' : ''}`;
    const names = document.createElement('ul');
    names.className = 'stage-trophies';
    for (const id of s.trophies) {
      const t = doc.trophies.find((x) => x.id === id);
      const item = document.createElement('li');
      item.className = earned.has(id) ? 'earned' : '';
      item.textContent = spoilered(t) ? '??? (story trophy)' : t.name;
      names.append(item);
    }
    li.innerHTML = `<h3><span class="stage-num">Stage ${s.stage}</span>${s.title}</h3>
      <p class="stage-count">${done} of ${s.trophies.length} earned</p>
      <div class="stage-bar"><i style="width:${Math.round((done / s.trophies.length) * 100)}%"></i></div>
      <p>${s.note}</p>`;
    li.append(names);
    stagesEl.append(li);
  }
}

function trophyCard(t) {
  const li = document.createElement('li');
  li.className = `trophy${earned.has(t.id) ? ' earned' : ''}${selectedId === t.id ? ' selected' : ''}`;
  li.dataset.id = String(t.id);
  const hidden = spoilered(t);
  const name = hidden ? '???' : t.name;
  const desc = hidden ? 'Hidden until earned — spoiler setting is on.' : t.description;
  const peek = hidden ? '' : `<p class="t-guide-peek">${t.guide.slice(0, 140)}${t.guide.length > 140 ? '…' : ''}</p>`;
  const missTag = t.missable ? '<span class="tag missable">Missable</span>' : '';
  const spoilTag = hidden ? '<span class="tag spoilered">Spoiler hidden</span>' : '';
  li.innerHTML = `
    <input class="check" type="checkbox" ${earned.has(t.id) ? 'checked' : ''} aria-label="Mark ${name} earned">
    <div class="seal ${t.grade}" aria-hidden="true">${GRADE_LETTER[t.grade]}</div>
    <div class="t-body">
      <h3>${name}</h3>
      <p class="t-desc">${desc}</p>
      <p class="t-tags">${gradeTag(t)}${missTag}${spoilTag}<span class="tag">${t.kinds.map((k) => KIND_LABEL[k]).join(' · ')}</span></p>
      ${peek}
    </div>`;
  li.querySelector('.check').addEventListener('change', (e) => {
    if (e.target.checked) earned.add(t.id);
    else earned.delete(t.id);
    save();
    renderAll();
  });
  li.addEventListener('click', (e) => {
    if (e.target.classList.contains('check')) return;
    selectedId = t.id;
    renderAll();
  });
  return li;
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(trophyCard));
  emptyEl.hidden = shown.length !== 0;
  if (kind === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No online trophies — the official list is fully solo. Every trophy is earnable without PlayStation Plus or other players.';
  } else if (shown.length === 0) {
    emptyEl.textContent = 'No trophies match these filters.';
  }
  metaEl.textContent = `Showing ${shown.length} of ${doc.trophies.length} trophies · ${earned.size} earned`;
}

function renderDetail() {
  const t = doc.trophies.find((x) => x.id === selectedId);
  if (!t) {
    detailEl.innerHTML = '<p class="detail-hint">Select a trophy to read its guide and sources.</p>';
    return;
  }
  const hidden = spoilered(t);
  const stage = doc.roadmap.find((s) => s.stage === t.stage);
  const miss = t.missable
    ? '<p class="d-miss"><strong>Missable.</strong> This trophy is tied to a one-time story moment or choice. Earn it on this playthrough — it may not come back.</p>'
    : '';
  const stageDone = stage.trophies.filter((id) => earned.has(id)).length;
  const stageLine = `Roadmap: Stage ${t.stage} — ${stage.title}. Stage progress: ${stageDone} of ${stage.trophies.length} earned.`;
  detailEl.innerHTML = `
    <div class="d-grade"><div class="seal ${t.grade}" aria-hidden="true">${GRADE_LETTER[t.grade]}</div>
    <div><h2>${hidden ? '???' : t.name}</h2></div></div>
    <p class="d-desc">${hidden ? 'Hidden until earned — spoiler setting is on.' : t.description}</p>
    <p class="d-tags">${gradeTag(t)}${t.missable ? '<span class="tag missable">Missable</span>' : ''}<span class="tag">${t.kinds.map((k) => KIND_LABEL[k]).join(' · ')}</span></p>
    ${hidden ? '<p class="d-guide">Turn the spoiler setting off, or earn this trophy, to read its guide.</p>' : `<h3>Guide</h3><p class="d-guide">${t.guide}</p>
    <h3>Sources</h3><ul class="d-sources">${t.sources.map((s) => `<li>${s}</li>`).join('')}</ul>`}
    ${hidden ? '' : miss}
    <p class="d-road">${stageLine}</p>
    <p class="d-earn"><button type="button" id="earnBtn" class="${earned.has(t.id) ? 'earned' : ''}">${earned.has(t.id) ? '✓ Earned — click to unmark' : 'Mark as earned'}</button>
    <button type="button" id="copyBtn">Copy guide</button></p>`;
  document.getElementById('copyBtn').addEventListener('click', async () => {
    const text = `${t.name} (${t.grade}) — ${t.description}\n\n${t.guide}\n\nSources: ${t.sources.join('; ')}`;
    try {
      await navigator.clipboard.writeText(text);
      document.getElementById('copyBtn').textContent = 'Copied ✓';
    } catch {
      document.getElementById('copyBtn').textContent = 'Copy failed — select the text';
    }
  });
  document.getElementById('earnBtn').addEventListener('click', () => {
    if (earned.has(t.id)) earned.delete(t.id);
    else earned.add(t.id);
    save();
    renderAll();
  });
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
  renderDetail();
}

chipsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-kind]');
  if (!btn) return;
  kind = btn.dataset.kind;
  for (const b of chipsEl.querySelectorAll('.chip')) b.classList.toggle('on', b === btn);
  renderAll();
});
searchEl.addEventListener('input', renderAll);
gradeEl.addEventListener('change', renderAll);
earnedEl.addEventListener('change', renderAll);
spoilerEl.addEventListener('change', renderAll);

// Keyboard shortcuts: / focuses search, S toggles the spoiler setting,
// R jumps to the roadmap, E exports progress. Typing in the search box is
// left alone so the keys never hijack a query.
document.addEventListener('keydown', (e) => {
  if (e.target === searchEl || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === '/') {
    e.preventDefault();
    searchEl.focus();
  } else if (e.key === 's' || e.key === 'S') {
    spoilerEl.checked = !spoilerEl.checked;
    renderAll();
  } else if (e.key === 'r' || e.key === 'R') {
    document.getElementById('roadmap').scrollIntoView({ behavior: 'smooth' });
  } else if (e.key === 'e' || e.key === 'E') {
    document.getElementById('exportBtn').click();
  }
});

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ app: 'vice-city-vault', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vice-city-vault-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(doc.trophies.map((t) => t.id));
    const next = new Set((Array.isArray(ids) ? ids : []).filter((n) => valid.has(n)));
    earned = next;
    save();
    renderAll();
  } catch {
    alert('That file is not a Vice City Vault progress export.');
  }
  e.target.value = '';
});

const res = await fetch('data/trophies.json');
doc = await res.json();
if (doc.trophies.length === 55) renderAll();
