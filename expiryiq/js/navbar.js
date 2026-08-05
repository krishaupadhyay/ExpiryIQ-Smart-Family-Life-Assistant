// ===================== Navbar State =====================
// Updates the navbar on every page depending on whether a session exists.
// Requires elements with ids: navButtons, navUser, navUserName in the navbar markup.

function initNavbar() {
  const session = getSession();
  const navButtons = document.getElementById('navButtons');
  const navUser = document.getElementById('navUser');
  const navUserName = document.getElementById('navUserName');

  if (!navButtons || !navUser || !navUserName) return;

  if (session) {
    navButtons.classList.add('hidden');
    navUser.classList.remove('hidden');
    navUser.classList.add('flex');
    navUserName.textContent = session.name;
  } else {
    navButtons.classList.remove('hidden');
    navUser.classList.add('hidden');
    navUser.classList.remove('flex');
  }
}

document.addEventListener('DOMContentLoaded', initNavbar);
