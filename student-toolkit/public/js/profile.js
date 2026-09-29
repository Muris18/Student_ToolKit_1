// Profile: requires a session, loads/saves a row in the "profiles" table
const loadingEl = document.getElementById('loading');
const panelEl = document.getElementById('profile-panel');
const form = document.getElementById('form');
const errorEl = document.getElementById('error');
const savedEl = document.getElementById('saved');
let currentUser = null;

function needsSetup() {
  loadingEl.textContent = 'Accounts are not set up yet. Add your Supabase keys in js/supabase-client.js.';
}

async function init() {
  if (!window.sb) return needsSetup();

  const { data } = await window.sb.auth.getSession();
  const session = data.session;
  if (!session) {
    location.href = 'signin.html?redirect=profile.html';
    return;
  }
  currentUser = session.user;
  document.getElementById('email-line').textContent = currentUser.email || '';

  const { data: profile, error } = await window.sb
    .from('profiles')
    .select('display_name, bio')
    .eq('id', currentUser.id)
    .maybeSingle();

  if (error) {
    loadingEl.textContent = 'Could not load your profile: ' + error.message;
    return;
  }

  const meta = currentUser.user_metadata || {};
  document.getElementById('name').value = (profile && profile.display_name) || meta.display_name || '';
  document.getElementById('bio').value = (profile && profile.bio) || '';

  loadingEl.hidden = true;
  panelEl.hidden = false;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  savedEl.textContent = '';

  const name = document.getElementById('name').value.trim();
  const bio = document.getElementById('bio').value.trim();
  const submitBtn = document.getElementById('submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  const { error } = await window.sb.from('profiles').upsert({
    id: currentUser.id,
    display_name: name,
    bio,
    updated_at: new Date().toISOString(),
  });

  // Keep the name in user metadata too, so it shows in the header right away
  if (!error) await window.sb.auth.updateUser({ data: { display_name: name } });

  submitBtn.disabled = false;
  submitBtn.textContent = 'Save changes';

  if (error) {
    errorEl.textContent = error.message;
    return;
  }
  savedEl.textContent = 'Saved.';
});

document.getElementById('logout').addEventListener('click', async () => {
  await window.sb.auth.signOut();
  location.href = 'index.html';
});

init();
