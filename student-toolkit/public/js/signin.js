// Sign in with email/password or an OAuth provider
const form = document.getElementById('form');
const errorEl = document.getElementById('error');
const submitBtn = document.getElementById('submit');

function needsSetup() {
  errorEl.textContent = 'Accounts are not set up yet. Add your Supabase keys in js/supabase-client.js.';
}

function redirectTarget() {
  const params = new URLSearchParams(location.search);
  const target = params.get('redirect');
  return new URL(target && /^[\w-]+\.html$/.test(target) ? target : 'profile.html', location.href).toString();
}

async function oauth(provider) {
  errorEl.textContent = '';
  if (!window.sb) return needsSetup();
  const { error } = await window.sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: redirectTarget() },
  });
  if (error) errorEl.textContent = error.message;
}

document.getElementById('oauth-google').addEventListener('click', () => oauth('google'));
document.getElementById('oauth-facebook').addEventListener('click', () => oauth('facebook'));
document.getElementById('oauth-apple').addEventListener('click', () => oauth('apple'));

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  if (!window.sb) return needsSetup();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!email || !password) {
    errorEl.textContent = 'Enter your email and password.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';
  const { error } = await window.sb.auth.signInWithPassword({ email, password });
  submitBtn.disabled = false;
  submitBtn.textContent = 'Log in';

  if (error) {
    errorEl.textContent = error.message;
    return;
  }
  location.href = redirectTarget();
});
