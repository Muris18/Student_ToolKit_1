// Shared: shows "Log in / Sign up" or the user's name in the header,
// depending on whether they are signed in. Runs on every page.
(function () {
  const area = document.getElementById('account-area');
  if (!area) return;

  // signin/signup/profile/reset-password live in account/; everything else is
  // at the site root or one level down in tools/.
  const inTools = location.pathname.includes('/tools/');
  const inAccount = location.pathname.includes('/account/');
  const toRoot = inTools || inAccount ? '../' : '';
  const toAccount = inAccount ? '' : toRoot + 'account/';
  const base = toRoot; // used for index.html links

  function link(href, text, cls) {
    const a = document.createElement('a');
    a.href = href;
    a.className = cls || 'account-link';
    a.textContent = text;
    return a;
  }

  function renderSignedOut() {
    area.replaceChildren(
      link(toAccount + 'signin.html', 'Log in'),
      link(toAccount + 'signup.html', 'Sign up', 'account-link primary')
    );
  }

  function renderSignedIn(user) {
    const meta = user.user_metadata || {};
    const name = meta.display_name || (user.email ? user.email.split('@')[0] : 'Profile');
    const out = document.createElement('button');
    out.type = 'button';
    out.className = 'account-link';
    out.textContent = 'Log out';
    out.addEventListener('click', async () => {
      await window.sb.auth.signOut();
      location.href = base + 'index.html';
    });
    area.replaceChildren(link(toAccount + 'profile.html', name), out);
  }

  if (!window.sb) {
    renderSignedOut();
    return;
  }

  window.sb.auth.getSession().then(({ data }) => {
    if (data.session && data.session.user) renderSignedIn(data.session.user);
    else renderSignedOut();
  });
  window.sb.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) renderSignedIn(session.user);
    else renderSignedOut();
  });
})();
