
// ==========================================
// DESIGNHUB - MAIN JAVASCRIPT
// Frontend demonstration version
// ==========================================

const $ = (id) => document.getElementById(id);

const STORAGE = {
  users: "designhub_users",
  competitions: "designhub_competitions",
  applications: "designhub_applications",
  currentUser: "designhub_current_user"
};

// Safe local storage helpers
function readData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// ==========================================
// SAMPLE COMPETITIONS
// ==========================================

// These are demonstration listings, not verified
// external competitions or real organizer offers.

const sampleCompetitions = [
  {
    id: "DH001",
    name: "Future Interface Challenge",
    category: "UI/UX",
    deadline: "2027-01-15",
    prize: "Portfolio recognition",
    description: "Design an intuitive digital experience that makes everyday technology more accessible.",
    color: "#FF5B24",
    artwork: "DESIGN<br>THE FUTURE"
  },
  {
    id: "DH002",
    name: "Visual Stories 2027",
    category: "Graphic Design",
    deadline: "2027-02-10",
    prize: "Featured design showcase",
    description: "Create an original visual identity that communicates a powerful story.",
    color: "#D7B8F5",
    artwork: "MAKE<br>IT VISUAL"
  },
  {
    id: "DH003",
    name: "Tomorrow's Spaces",
    category: "Architecture",
    deadline: "2027-02-20",
    prize: "Student showcase",
    description: "Imagine sustainable spaces designed for the next generation.",
    color: "#B6D5C3",
    artwork: "BUILD<br>BETTER"
  },
  {
    id: "DH004",
    name: "Product Reimagined",
    category: "Product Design",
    deadline: "2027-03-05",
    prize: "Portfolio feature",
    description: "Reimagine an everyday product with creativity and usability in mind.",
    color: "#F4D36D",
    artwork: "THINK<br>AGAIN"
  },
  {
    id: "DH005",
    name: "Illustration Playground",
    category: "Illustration",
    deadline: "2027-01-25",
    prize: "Creative showcase",
    description: "Bring an original idea to life through illustration and visual storytelling.",
    color: "#F4B6B6",
    artwork: "DRAW<br>YOUR WORLD"
  },
  {
    id: "DH006",
    name: "Digital Experience Lab",
    category: "UI/UX",
    deadline: "2027-03-15",
    prize: "Portfolio recognition",
    description: "Create a user-friendly experience for a real-world student problem.",
    color: "#A9C8EB",
    artwork: "CREATE<br>EXPERIENCES"
  }
];

let competitions = readData(
  STORAGE.competitions,
  sampleCompetitions
);

let users = readData(STORAGE.users, []);
let applications = readData(STORAGE.applications, []);

let currentUser = readData(STORAGE.currentUser, null);
let selectedCompetition = null;

// ==========================================
// PAGE NAVIGATION
// ==========================================

function showPage(pageId) {
  const page = $(pageId);

  if (!page || !page.classList.contains("page")) {
    pageId = "home";
  }

  document.querySelectorAll(".page").forEach(section => {
    section.classList.remove("active");
  });

  $(pageId).classList.add("active");

  if (pageId === "tracking") {
    renderApplications();
  }

  if (pageId === "admin") {
    renderAdmin();
  }

  if (pageId === "explore") {
    renderCompetitions();
  }

  if (pageId === "home") {
    renderFeatured();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", event => {
  const navigation = event.target.closest("[data-page]");

  if (navigation) {
    event.preventDefault();

    const destination = navigation.dataset.page;

    if (destination === "submit" && !requireLogin()) return;
    if (destination === "tracking" && !requireLogin()) return;

    showPage(destination);
    return;
  }

  const competitionButton = event.target.closest("[data-open-competition]");

  if (competitionButton) {
    openCompetition(competitionButton.dataset.openCompetition);
  }
});

// Add admin navigation for this frontend demonstration.
// This is NOT secure admin authorization.
const adminLink = document.createElement("a");
adminLink.href = "#admin";
adminLink.textContent = "Admin";
adminLink.dataset.page = "admin";
document.querySelector(".navbar nav").appendChild(adminLink);

// ==========================================
// COMPETITION DISPLAY
// ==========================================

function formatDate(date) {
  return new Date(date + "T00:00:00").toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
  );
}

function competitionCard(item) {
  return `
    <article class="competition-card">
      <div class="card-art"
        style="background:${escapeHTML(item.color || "#FF5B24")}">
        <div>${item.artwork || escapeHTML(item.category)}</div>
        <span>DESIGNHUB ✳</span>
      </div>

      <div class="card-body">
        <span class="card-category">
          ${escapeHTML(item.category)}
        </span>

        <h3>${escapeHTML(item.name)}</h3>

        <p>${escapeHTML(item.description)}</p>

        <div class="card-meta">
          <span>Prize: ${escapeHTML(item.prize)}</span>
          <span>⌛ ${formatDate(item.deadline)}</span>
        </div>

        <button class="card-link"
          data-open-competition="${escapeHTML(item.id)}">
          View details ↗
        </button>
      </div>
    </article>
  `;
}

function renderFeatured() {
  $("featured-list").innerHTML = competitions
    .slice(0, 3)
    .map(competitionCard)
    .join("");

  $("competition-count").textContent =
    competitions.length + "+";
}

function renderCompetitions() {
  const search = $("search-input").value.toLowerCase().trim();
  const category = $("category-filter").value;
  const sort = $("sort-filter").value;

  let filtered = competitions.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search);

    const matchesCategory =
      category === "all" || item.category === category;

    return matchesSearch && matchesCategory;
  });

  filtered.sort((a, b) => {
    if (sort === "deadline") {
      return new Date(a.deadline) - new Date(b.deadline);
    }

    return new Date(b.createdAt || b.deadline) -
      new Date(a.createdAt || a.deadline);
  });

  $("competition-list").innerHTML = filtered.length
    ? filtered.map(competitionCard).join("")
    : "<p>No competitions found. Try another search.</p>";
}

$("search-input").addEventListener("input", renderCompetitions);
$("category-filter").addEventListener("change", renderCompetitions);
$("sort-filter").addEventListener("change", renderCompetitions);

// ==========================================
// COMPETITION DETAILS
// ==========================================

function openCompetition(id) {
  selectedCompetition = competitions.find(item => item.id === id);

  if (!selectedCompetition) return;

  const item = selectedCompetition;

  $("competition-details").innerHTML = `
    <span class="eyebrow">${escapeHTML(item.category)}</span>

    <h1 class="page-title">
      ${escapeHTML(item.name)}
    </h1>

    <div class="application-card">
      <h3>About this competition</h3>
      <p>${escapeHTML(item.description)}</p>

      <br>

      <h3>Eligibility</h3>
      <p>Open to student participants for this demonstration listing.
      Check organizer requirements before participating in a real event.</p>

      <br>

      <h3>Deadline</h3>
      <p>${formatDate(item.deadline)}</p>

      <br>

      <h3>Recognition / Prize</h3>
      <p>${escapeHTML(item.prize)}</p>

      <br>

      <button class="primary-btn" id="apply-button">
        Apply now ↗
      </button>
    </div>
  `;

  showPage("details");

  $("apply-button").addEventListener("click", () => {
    if (!requireLogin()) return;

    if (new Date(item.deadline + "T23:59:59") < new Date()) {
      alert("This competition deadline has passed.");
      return;
    }

    $("submit-competition").value = item.name;
    showPage("submit");
  });
}

// ==========================================
// USER REGISTRATION
// ==========================================

$("register-form").addEventListener("submit", event => {
  event.preventDefault();

  const name = $("register-name").value.trim();
  const email = $("register-email").value.trim().toLowerCase();
  const interest = $("register-interest").value;
  const password = $("register-password").value;

  if (password.length < 8) {
    $("register-message").textContent =
      "Password must have at least 8 characters.";
    return;
  }

  if (users.some(user => user.email === email)) {
    $("register-message").textContent =
      "This email is already registered. Please log in.";
    return;
  }

  const newUser = {
    id: "USER" + Date.now(),
    name,
    email,
    interest,
    password
  };

  users.push(newUser);
  saveData(STORAGE.users, users);

  currentUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    interest: newUser.interest
  };

  saveData(STORAGE.currentUser, currentUser);

  $("register-message").textContent =
    "Account created successfully!";

  updateNavigation();

  setTimeout(() => showPage("home"), 700);
});

// ==========================================
// USER LOGIN
// ==========================================

$("login-form").addEventListener("submit", event => {
  event.preventDefault();

  const email = $("login-email").value.trim().toLowerCase();
  const password = $("login-password").value;

  const user = users.find(item =>
    item.email === email && item.password === password
  );

  if (!user) {
    $("login-message").textContent =
      "Incorrect email or password.";
    return;
  }

  currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    interest: user.interest
  };

  saveData(STORAGE.currentUser, currentUser);

  $("login-message").textContent = "Login successful!";

  updateNavigation();

  setTimeout(() => showPage("home"), 700);
});

function requireLogin() {
  if (!currentUser) {
    alert("Please log in or register first.");
    showPage("login");
    return false;
  }

  return true;
}

function updateNavigation() {
  const loginButton = document.querySelector(".login-btn");
  const joinButton = document.querySelector(".nav-actions .primary-btn");

  if (currentUser) {
    loginButton.textContent = "Logout";
    loginButton.dataset.page = "logout";

    joinButton.textContent = "Hi, " + currentUser.name.split(" ")[0];
    joinButton.dataset.page = "tracking";
  } else {
    loginButton.textContent = "Login";
    loginButton.dataset.page = "login";

    joinButton.textContent = "Join Now ↗";
    joinButton.dataset.page = "register";
  }
}

// Handle logout
document.querySelector(".login-btn").addEventListener("click", event => {
  if (event.currentTarget.dataset.page === "logout") {
    currentUser = null;
    localStorage.removeItem(STORAGE.currentUser);
    updateNavigation();
    showPage("home");
  }
});

// ==========================================
// SUBMISSION MANAGEMENT
// ==========================================

$("submission-form").addEventListener("submit", event => {
  event.preventDefault();

  if (!requireLogin()) return;

  const item = competitions.find(c =>
    c.name === $("submit-competition").value
  );

  if (!item) {
    $("submission-message").textContent =
      "Competition not found.";
    return;
  }

  if (new Date(item.deadline + "T23:59:59") < new Date()) {
    $("submission-message").textContent =
      "The deadline has passed.";
    return;
  }

  const file = $("design-file").files[0];

  if (!file) {
    $("submission-message").textContent =
      "Please select a file.";
    return;
  }

  const allowedTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg"
  ];

  if (!allowedTypes.includes(file.type)) {
    $("submission-message").textContent =
      "Only PDF, PNG and JPG files are allowed.";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    $("submission-message").textContent =
      "File must be smaller than 10 MB.";
    return;
  }

  const existing = applications.find(app =>
    app.userId === currentUser.id &&
    app.competitionId === item.id
  );

  if (existing) {
    $("submission-message").textContent =
      "You have already applied to this competition.";
    return;
  }

  const application = {
    id: "APP" + Date.now(),
    userId: currentUser.id,
    studentName: currentUser.name,
    competitionId: item.id,
    competition: item.name,
    projectTitle: $("project-title").value.trim(),
    description: $("project-description").value.trim(),
    filename: file.name,
    portfolio: $("portfolio-link").value.trim(),
    submissionDate: new Date().toISOString(),
    status: "Submitted"
  };

  applications.push(application);
  saveData(STORAGE.applications, applications);

  $("submission-message").textContent =
    "Your entry has been recorded successfully!";

  $("submission-form").reset();
  $("submit-competition").value = item.name;
});

// ==========================================
// APPLICATION TRACKING
// ==========================================

function renderApplications() {
  const myApplications = applications.filter(app =>
    app.userId === currentUser?.id
  );

  $("applications-list").innerHTML = myApplications.length
    ? myApplications.map(app => `
      <div class="application-card">
        <h3>${escapeHTML(app.projectTitle)}</h3>
        <p>Competition: ${escapeHTML(app.competition)}</p>
        <p>File: ${escapeHTML(app.filename)}</p>
        <p>Submitted: ${new Date(app.submissionDate).toLocaleDateString("en-IN")}</p>
        <span class="status">${escapeHTML(app.status)}</span>
      </div>
    `).join("")
    : "<div class='application-card'>You haven't submitted any entries yet. Explore competitions to get started!</div>";
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================

// Demonstration only. A real application must
// protect admin actions with server-side roles.

function renderAdmin() {
  $("admin-competitions").textContent = competitions.length;
  $("admin-users").textContent = users.length;
  $("admin-submissions").textContent = applications.length;
}

// ==========================================
// ADD COMPETITION
// ==========================================

$("admin-form").addEventListener("submit", event => {
  event.preventDefault();

  const competition = {
    id: "DH" + Date.now(),
    name: $("new-name").value.trim(),
    category: $("new-category").value,
    deadline: $("new-deadline").value,
    prize: $("new-prize").value.trim(),
    description: $("new-description").value.trim(),
    color: "#FF5B24",
    artwork: "CREATE<br>INSPIRE",
    createdAt: new Date().toISOString()
  };

  if (new Date(competition.deadline + "T23:59:59") < new Date()) {
    $("admin-message").textContent =
      "Choose a future deadline.";
    return;
  }

  competitions.push(competition);

  saveData(STORAGE.competitions, competitions);

  $("admin-form").reset();
  $("admin-message").textContent =
    "Competition added successfully!";

  renderAdmin();
  renderFeatured();
  renderCompetitions();
});

// ==========================================
// INITIALIZE WEBSITE
// ==========================================

function initializeWebsite() {
  renderFeatured();
  renderCompetitions();
  updateNavigation();

  if (currentUser && !users.some(user => user.id === currentUser.id)) {
    currentUser = null;
    localStorage.removeItem(STORAGE.currentUser);
    updateNavigation();
  }

  showPage("home");
}

initializeWebsite();
