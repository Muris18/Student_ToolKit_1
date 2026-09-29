// Create an account with email/password or an OAuth provider
const form = document.getElementById('form');
const errorEl = document.getElementById('error');
const submitBtn = document.getElementById('submit');

function needsSetup() {
  errorEl.textContent = 'Accounts are not set up yet. Add your Supabase keys in js/supabase-client.js.';
}

async function oauth(provider) {
  errorEl.textContent = '';
  if (!window.sb) return needsSetup();
  const { error } = await window.sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: new URL('profile.html', location.href).toString() },
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

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  if (!name || !email || !password) {
    errorEl.textContent = 'Fill in your name, email and password.';
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'Password must be at least 6 characters.';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating account...';
  const { data, error } = await window.sb.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: new URL('profile.html', location.href).toString(),
    },
  });
  submitBtn.disabled = false;
  submitBtn.textContent = 'Create account';

  if (error) {
    errorEl.textContent = error.message;
    return;
  }
  if (data.session) {
    location.href = 'profile.html';
  } else {
    form.hidden = true;
    document.querySelector('.oauth').hidden = true;
    document.querySelector('.divider').hidden = true;
    const p = document.createElement('p');
    p.className = 'lead';
    p.textContent = 'Check your email for a confirmation link to finish creating your account.';
    form.after(p);
  }
});
