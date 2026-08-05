// ===================== Toast Utility =====================
// Include a <div id="toast">...</div> (see any page's HTML) before using this.

function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toastMsg').textContent = msg;
  t.classList.remove('opacity-0', '-translate-y-2', 'pointer-events-none');
  t.classList.add('opacity-100', 'translate-y-0');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    t.classList.add('opacity-0', '-translate-y-2', 'pointer-events-none');
    t.classList.remove('opacity-100', 'translate-y-0');
  }, 2200);
}
