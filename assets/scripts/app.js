const STORAGE_KEY = 'appState';
const DEV_USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'user', password: 'user123', role: 'user' }
];

const EMPTY_STATE = {
  app: { name: 'RecipeBox', version: '0.5' },
  user: { username: '', authenticated: false, role: 'guest' },
  data: [],
  session: { started: new Date().toISOString(), lastUpdated: new Date().toISOString() }
};

let appState = loadState();

function loadState() {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  if (!saved) return JSON.parse(JSON.stringify(EMPTY_STATE));

  try {
    const parsed = JSON.parse(saved);
    if (parsed && Array.isArray(parsed.data)) {
      return parsed;
    }
  } catch (error) {
    console.error('[SESSION] Could not read saved state:', error);
  }

  return JSON.parse(JSON.stringify(EMPTY_STATE));
}

function saveState() {
  appState.session.lastUpdated = new Date().toISOString();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  console.log('[SESSION] appState saved');
}

function logAccounts() {
  console.log(`
DEV TEST ACCOUNTS

ADMIN
username: admin
password: admin123

USER
username: user
password: user123
`);
}

async function fetchData() {
  try {
    const response = await fetch('assets/data/recipes.json');
    if (!response.ok) throw new Error('Could not load recipes');
    const data = await response.json();
    appState.data = data;
    saveState();
    console.log(`[DATA] loaded ${data.length} records`);
  } catch (error) {
    console.warn('[DATA] using fallback data', error);
    appState.data = [
      {
        id: 1,
        title: 'Cinnamon Oat Breakfast Bowl',
        category: 'Breakfast',
        description: 'Simple breakfast bowl with oats and fruit.',
        image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80',
        prepTime: 10,
        servings: 2,
        ingredients: ['1 cup rolled oats', '1 cup milk', '1/2 tsp cinnamon', '1/2 cup berries'],
        instructions: ['Warm oats and milk together.', 'Stir in cinnamon.', 'Top with berries and serve.']
      }
    ];
    saveState();
  }
}

function updateNav() {
  const userName = document.getElementById('nav-user');
  const signInLink = document.getElementById('nav-signin');
  const adminLink = document.getElementById('nav-admin');
  const signOutBtn = document.getElementById('nav-signout');

  if (userName) {
    userName.textContent = appState.user.authenticated ? `${appState.user.username} (${appState.user.role})` : 'Guest';
  }

  if (signInLink) signInLink.classList.toggle('d-none', appState.user.authenticated);
  if (adminLink) adminLink.classList.toggle('d-none', !(appState.user.authenticated && appState.user.role === 'admin'));
  if (signOutBtn) signOutBtn.classList.toggle('d-none', !appState.user.authenticated);
}

function renderRecipes() {
  const list = document.getElementById('recipe-list');
  if (!list) return;

  list.innerHTML = '';

  appState.data.forEach((recipe) => {
    const canDelete = appState.user.role === 'admin';
    const card = document.createElement('article');
    card.className = 'col-lg-6';
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${recipe.image}" class="card-img-top recipe-image" alt="${recipe.title}" />
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div>
              <span class="badge bg-light text-dark mb-2">${recipe.category}</span>
              <h3 class="h5">${recipe.title}</h3>
            </div>
            <div class="text-end small text-muted">
              <div>${recipe.servings} servings</div>
              <div>${recipe.prepTime} min</div>
            </div>
          </div>
          <p class="text-muted">${recipe.description}</p>
          <div class="row">
            <div class="col-6">
              <h4 class="small text-uppercase text-secondary">Ingredients</h4>
              <ul>${(recipe.ingredients || []).map((item) => `<li>${item}</li>`).join('')}</ul>
            </div>
            <div class="col-6">
              <h4 class="small text-uppercase text-secondary">Steps</h4>
              <ol>${(recipe.instructions || []).map((item) => `<li>${item}</li>`).join('')}</ol>
            </div>
          </div>
          <div class="d-flex justify-content-between mt-3">
            <span class="small text-muted">#${recipe.id}</span>
            <div>
              <button type="button" class="btn btn-sm btn-outline-primary" data-action="edit" data-id="${recipe.id}">Edit</button>
              ${canDelete ? `<button type="button" class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${recipe.id}">Delete</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

function showMessage(id, message, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = isError ? 'mt-3 mb-0 text-danger' : 'mt-3 mb-0 text-success';
}

function resetForm() {
  const form = document.getElementById('recipe-form');
  if (!form) return;
  form.reset();
  document.getElementById('recipe-id').value = '';
  document.getElementById('recipe-submit-btn').textContent = 'Add recipe';
  document.getElementById('recipe-cancel-btn').classList.add('d-none');
}

function fillForm(recipe) {
  const form = document.getElementById('recipe-form');
  if (!form) return;

  document.getElementById('recipe-id').value = recipe.id;
  document.getElementById('recipe-title').value = recipe.title;
  document.getElementById('recipe-category').value = recipe.category;
  document.getElementById('recipe-description').value = recipe.description;
  document.getElementById('recipe-image').value = recipe.image;
  document.getElementById('recipe-prep-time').value = recipe.prepTime;
  document.getElementById('recipe-servings').value = recipe.servings;
  document.getElementById('recipe-ingredients').value = (recipe.ingredients || []).join('\n');
  document.getElementById('recipe-instructions').value = (recipe.instructions || []).join('\n');
  document.getElementById('recipe-submit-btn').textContent = 'Update recipe';
  document.getElementById('recipe-cancel-btn').classList.remove('d-none');
}

function bindHomeForm() {
  const form = document.getElementById('recipe-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!appState.user.authenticated) {
      showMessage('recipe-form-status', 'Please sign in before changing recipes.', true);
      return;
    }

    const recipeId = document.getElementById('recipe-id').value;
    const payload = {
      id: recipeId ? Number(recipeId) : Date.now(),
      title: document.getElementById('recipe-title').value.trim(),
      category: document.getElementById('recipe-category').value,
      description: document.getElementById('recipe-description').value.trim(),
      image: document.getElementById('recipe-image').value.trim() || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
      prepTime: Number(document.getElementById('recipe-prep-time').value) || 15,
      servings: Number(document.getElementById('recipe-servings').value) || 2,
      ingredients: document.getElementById('recipe-ingredients').value.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
      instructions: document.getElementById('recipe-instructions').value.split(/\n|,/).map((item) => item.trim()).filter(Boolean)
    };

    if (!payload.title || !payload.description || payload.ingredients.length === 0 || payload.instructions.length === 0) {
      showMessage('recipe-form-status', 'Please complete every field.', true);
      return;
    }

    if (recipeId) {
      const index = appState.data.findIndex((item) => item.id === Number(recipeId));
      if (index >= 0) appState.data[index] = payload;
      console.log(`[UPDATE] record ${payload.id} updated`);
      showMessage('recipe-form-status', 'Recipe updated.');
    } else {
      appState.data.unshift(payload);
      console.log(`[CREATE] record ${payload.id} added`);
      showMessage('recipe-form-status', 'Recipe created.');
    }

    saveState();
    renderRecipes();
    resetForm();
  });

  document.getElementById('recipe-cancel-btn').addEventListener('click', () => {
    resetForm();
    showMessage('recipe-form-status', '');
  });

  document.getElementById('recipe-list').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const action = button.dataset.action;
    const recipeId = Number(button.dataset.id);

    if (action === 'edit') {
      const recipe = appState.data.find((item) => item.id === recipeId);
      if (recipe) fillForm(recipe);
    }

    if (action === 'delete') {
      if (appState.user.role !== 'admin') {
        showMessage('recipe-form-status', 'You are not allowed to delete records.', true);
        return;
      }

      appState.data = appState.data.filter((item) => item.id !== recipeId);
      saveState();
      renderRecipes();
      console.log(`[DELETE] record ${recipeId} removed`);
      showMessage('recipe-form-status', 'Recipe deleted.');
    }
  });
}

function signOut() {
  appState.user = { username: '', authenticated: false, role: 'guest' };
  saveState();
  updateNav();
  console.log('[AUTH] user signed out');

  if (document.body.dataset.page === 'admin') {
    window.location.href = '../index.html';
  }
}

async function initHomePage() {
  if (!appState.data.length) {
    await fetchData();
  }

  updateNav();
  renderRecipes();
  bindHomeForm();

  const signOutBtn = document.getElementById('nav-signout');
  signOutBtn?.addEventListener('click', signOut);
}

async function initSignInPage() {
  updateNav();
  const form = document.getElementById('signin-form');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('signin-username').value.trim();
    const password = document.getElementById('signin-password').value.trim();
    const match = DEV_USERS.find((user) => user.username === username && user.password === password);

    if (!match) {
      showMessage('signin-status', 'Invalid username or password.', true);
      document.getElementById('signin-password').value = '';
      return;
    }

    appState.user = { username: match.username, authenticated: true, role: match.role };
    saveState();
    console.log(`[AUTH] user authenticated: ${match.username}`);
    console.log(`[AUTHZ] role: ${match.role}`);
    showMessage('signin-status', 'Authentication successful. Redirecting...');

    setTimeout(() => {
      window.location.href = '../index.html';
    }, 300);
  });

  document.getElementById('nav-signout')?.addEventListener('click', signOut);
}

function renderAdminPage() {
  const currentUser = appState.user;
  const panel = document.getElementById('admin-panel');

  if (!currentUser.authenticated || currentUser.role !== 'admin') {
    panel.innerHTML = '<div class="alert alert-warning">You are not authorized to access the admin dashboard.</div>';
    return;
  }

  document.getElementById('admin-user').textContent = currentUser.username;
  document.getElementById('admin-role').textContent = currentUser.role;
  document.getElementById('admin-authenticated').textContent = String(currentUser.authenticated);
  document.getElementById('admin-session-started').textContent = appState.session.started;
  document.getElementById('admin-data-count').textContent = `${appState.data.length} recipes`;
  document.getElementById('app-state-output').textContent = JSON.stringify(appState, null, 2);
  document.getElementById('session-state-output').textContent = JSON.stringify({ key: STORAGE_KEY, saved: JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') }, null, 2);

  const list = document.getElementById('admin-record-list');
  list.innerHTML = appState.data
    .map((recipe) => `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-semibold">${recipe.title}</div>
          <div class="small text-muted">${recipe.category}</div>
        </div>
        <div>
          <button type="button" class="btn btn-sm btn-outline-primary" data-admin-action="edit" data-id="${recipe.id}">Edit</button>
          <button type="button" class="btn btn-sm btn-outline-danger" data-admin-action="delete" data-id="${recipe.id}">Delete</button>
        </div>
      </li>
    `)
    .join('');

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-admin-action]');
    if (!button) return;

    const id = Number(button.dataset.id);

    if (button.dataset.adminAction === 'edit') {
      window.location.href = `../index.html?edit=${id}`;
    }

    if (button.dataset.adminAction === 'delete') {
      appState.data = appState.data.filter((recipe) => recipe.id !== id);
      saveState();
      renderAdminPage();
      console.log(`[DELETE] record ${id} removed by admin`);
    }
  });
}

async function initAdminPage() {
  if (!appState.data.length) {
    await fetchData();
  }

  updateNav();
  renderAdminPage();
  document.getElementById('nav-signout')?.addEventListener('click', signOut);
}

document.addEventListener('DOMContentLoaded', async () => {
  logAccounts();
  console.log(appState);
  console.log(JSON.stringify(appState, null, 2));

  const page = document.body.dataset.page;

  if (page === 'home') initHomePage();
  if (page === 'signin') initSignInPage();
  if (page === 'admin') initAdminPage();
});