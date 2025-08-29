"use strict";

/*
  ===============================
  Part 1: Basics (variables + conditionals)
  ===============================
*/
const titleInput   = document.getElementById("titleInput");
const yearInput    = document.getElementById("yearInput");
const addForm      = document.getElementById("addForm");
const filterSelect = document.getElementById("filterSelect");
const searchInput  = document.getElementById("searchInput");
const listEl       = document.getElementById("movieList");
const statsText    = document.getElementById("statsText");
const formHint     = document.getElementById("formHint");
const randomBtn    = document.getElementById("randomPickBtn");
const randomOut    = document.getElementById("randomResult");

// seed data (array of objects)
let movies = [
  { id: cryptoRandomId(), title: "The Iron Giant", year: 1999, watched: false },
  { id: cryptoRandomId(), title: "Get Out",        year: 2017, watched: true  },
  { id: cryptoRandomId(), title: "Your Name",      year: 2016, watched: false }
];

// UI state
let currentFilter = "all";
let currentQuery  = "";

/*
  ===============================
  Part 2: Functions (reusability)
  ===============================
*/

// Utility: simple unique id
function cryptoRandomId() {
  // not cryptographically strong across all browsers, but fine for demo
  return Math.random().toString(36).slice(2, 10);
}

// Function: cleans and normalizes a title
function sanitizeTitle(raw) {
  if (!raw) return "";
  let t = raw.trim();

  // while loop → collapse multiple spaces into one (loop example #1)
  while (t.includes("  ")) {
    t = t.replace(/ {2,}/g, " ");
  }

  // Title-case-ish for fun
  t = t
    .split(" ")
    .map(word => word[0] ? word[0].toUpperCase() + word.slice(1).toLowerCase() : "")
    .join(" ");
  return t;
}

// Function: add a movie (validates input, prevents duplicates)
function addMovie(title, year) {
  const cleanTitle = sanitizeTitle(title);
  const yr = year ? Number(year) : null;

  // conditionals for validation
  if (!cleanTitle) {
    showHint("Please enter a title.", "warn");
    return;
  }
  if (yr && (yr < 1888 || yr > 2100)) {
    showHint("Year looks off. Try something between 1888 and 2100.", "warn");
    return;
  }

  // prevent duplicates by (title + year) combo
  const exists = movies.some(m => m.title.toLowerCase() === cleanTitle.toLowerCase() && (!!m.year) === (!!yr) && m.year === yr);
  if (exists) {
    showHint(`"${cleanTitle}" is already on your list.`, "warn");
    return;
  }

  movies.push({ id: cryptoRandomId(), title: cleanTitle, year: yr, watched: false });
  showHint(`Added "${cleanTitle}".`, "ok");

  renderList();   // DOM update #1
  updateStats();  // DOM update #2
  addForm.reset(); // DOM update #3
  titleInput.focus();
}

// Function: toggle watched state by id
function toggleWatched(id) {
  const m = movies.find(x => x.id === id);
  if (!m) return;
  m.watched = !m.watched;
  renderList();   // re-render to update classes/button labels
  updateStats();
}

// Function: remove movie by id
function removeMovie(id) {
  movies = movies.filter(m => m.id !== id);
  renderList();
  updateStats();
}

// Function: simple helper for hints
function showHint(text, type = "muted") {
  formHint.textContent = text;
  formHint.className = type === "ok" ? "muted badge ok" :
                       type === "warn" ? "muted badge warn" : "muted";
}

// Function: get filtered + searched list
function getVisibleMovies() {
  const q = currentQuery.trim().toLowerCase();
  return movies.filter(m => {
    const matchesFilter =
      currentFilter === "all" ||
      (currentFilter === "watched" && m.watched) ||
      (currentFilter === "unwatched" && !m.watched);

    const matchesQuery = !q || m.title.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });
}

// Function: render the list (uses forEach loop → loop example #2)
function renderList() {
  const items = getVisibleMovies();

  // clear
  listEl.innerHTML = "";

  // create a fragment for performance
  const frag = document.createDocumentFragment();

  items.forEach(m => {
    const li = document.createElement("li");
    li.className = `movie${m.watched ? " watched" : ""}`;
    li.dataset.id = m.id;

    // minimal template
    li.innerHTML = `
      <div>
        <strong>${m.title}</strong>
        ${m.year ? `<span class="badge">${m.year}</span>` : ""}
        ${m.watched ? `<span class="badge ok">Watched</span>` : `<span class="badge">To watch</span>`}
      </div>
      <div class="actions">
        <button type="button" data-action="toggle">${m.watched ? "Mark Unwatched" : "Mark Watched"}</button>
        <button type="button" data-action="remove" title="Remove this movie">🗑️</button>
      </div>
    `;
    frag.appendChild(li);
  });

  listEl.appendChild(frag);
}

// Function: update stats (classic for loop → loop example #3)
function updateStats() {
  let watched = 0;
  for (let i = 0; i < movies.length; i++) {
    if (movies[i].watched) watched++;
  }
  const total = movies.length;
  const remaining = total - watched;
  statsText.textContent = `Total: ${total} • Watched: ${watched} • Remaining: ${remaining}`;
}

// Function: pick a random visible movie and announce it
function pickRandom() {
  const visible = getVisibleMovies();
  if (visible.length === 0) {
    randomOut.textContent = "Nothing to pick from. Try adjusting your filter or add movies.";
    return;
  }
  const choice = visible[Math.floor(Math.random() * visible.length)];
  randomOut.textContent = `🎲 Tonight’s pick: "${choice.title}"${choice.year ? " (" + choice.year + ")" : ""}!`;
}

/*
  ===============================
  Part 3: Loops
  - Already shown in sanitizeTitle (while), renderList (forEach),
    updateStats (for)
  ===============================
*/

/*
  ===============================
  Part 4: DOM interactions
  - Creating elements, updating text/classes, event listeners, dataset
  ===============================
*/

// Add movie (form submit)
addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addMovie(titleInput.value, yearInput.value);
});

// Clicks inside the list (event delegation for toggle/remove)
listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const li = e.target.closest("li.movie");
  if (!li) return;
  const id = li.dataset.id;

  const action = btn.dataset.action;
  if (action === "toggle") toggleWatched(id);
  if (action === "remove") removeMovie(id);
});

// Filter + search controls
filterSelect.addEventListener("change", () => {
  currentFilter = filterSelect.value;
  renderList();
  updateStats();
});

searchInput.addEventListener("input", () => {
  currentQuery = searchInput.value;
  renderList();
  updateStats();
});

// Random pick
randomBtn.addEventListener("click", pickRandom);

// Initial render
renderList();
updateStats();
showHint("Add a movie to get started.");