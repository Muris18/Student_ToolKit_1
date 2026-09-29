// Two steps: request a reset email, then (after clicking the link) set a new password
const requestForm = document.getElementById('request-form');
const updateForm = document.getElementById('update-form');
const errorEl = document.getElementById('error');
const updateErrorEl = document.getElementById('update-error');
const leadEl = document.getElementById('lead');

function needsSetup(el) {
  el.textContent = 'Accounts are not set up yet. Add your Supabase keys in js/supabase-client.js.';
}

requestForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  if (!window.sb) return needsSetup(errorEl);

  const email = document.getElementById('email').value.trim();
  if (!email) {
    errorEl.textContent = 'Enter your email.';
    return;
  }
  const btn = document.getElementById('submit');
  btn.disabled = true;
  const { error } = await window.sb.auth.resetPasswordForEmail(email, {
    redirectTo: new URL('reset-password.html', location.href).toString(),
  });
  btn.disabled = false;
  if (error) {
    errorEl.textContent = error.message;
    return;
  }
  leadEl.textContent = 'If an account exists for that email, a reset link is on its way.';
  requestForm.hidden = true;
});

updateForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  updateErrorEl.textContent = '';
  if (!window.sb) return needsSetup(updateErrorEl);

  const password = document.getElementById('password').value;
  if (password.length < 6) {
    updateErrorEl.textContent = 'Password must be at least 6 characters.';
    return;
  }
  const btn = document.getElementById('update-submit');
  btn.disabled = true;
  const { error } = await window.sb.auth.updateUser({ password });
  btn.disabled = false;
  if (error) {
    updateErrorEl.textContent = error.message;
    return;
  }
  location.href = 'profile.html';
});

// If the visitor arrived via a password-recovery email link, Supabase fires this event.
if (window.sb) {
  window.sb.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      requestForm.hidden = true;
      leadEl.textContent = 'Choose a new password.';
      updateForm.hidden = false;
    }
  });
}
