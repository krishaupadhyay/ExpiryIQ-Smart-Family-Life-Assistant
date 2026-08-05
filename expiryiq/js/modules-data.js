// ===================== Module Data (shared across pages) =====================

const MODULES = [
  { name: 'MediTrack',    icon: '💊', color: 'rose',    desc: 'Medicine expiry, dosage schedules and refill reminders.' },
  { name: 'DocuVault',    icon: '📄', color: 'amber',   desc: 'Aadhaar, PAN, passport and document expiry tracking.' },
  { name: 'PolicyWatch',  icon: '🛡️', color: 'violet',  desc: 'Life, health and vehicle insurance premium tracking.' },
  { name: 'UtilityDesk',  icon: '⚡', color: 'cyan',    desc: 'Electricity, gas, water, LPG and society bill reminders.' },
  { name: 'PantryIQ',     icon: '🧺', color: 'emerald', desc: 'Grocery and ration stock with expiry alerts.' },
  { name: 'GharCare',     icon: '🔧', color: 'orange',  desc: 'Appliance warranty, servicing and domestic help tracking.' },
  { name: 'TaskRota',     icon: '✅', color: 'sky',     desc: 'Household chores assigned and rotated fairly.' },
  { name: 'UtsavPlanner', icon: '🎉', color: 'pink',    desc: 'Festival, vrat and family occasion reminders.' },
  { name: 'SafeCircle',   icon: '📞', color: 'red',     desc: 'Emergency contacts, always one tap away.' },
  { name: 'FamilyPulse',  icon: '📅', color: 'indigo',  desc: 'One unified calendar for the whole family.' }
];

/**
 * Renders module cards into a container.
 * @param {string} gridId - id of the container element
 * @param {boolean} clickable - if true, cards show a toast on click (used on dashboard)
 */
function renderModules(gridId, clickable) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = MODULES.map(m => `
    <div class="bg-white border border-gray-100 rounded-xl p-5 card-hover ${clickable ? 'cursor-pointer' : ''}"
         ${clickable ? `onclick="toast('Opening ${m.name}…')"` : ''}>
      <div class="w-11 h-11 rounded-lg bg-${m.color}-50 flex items-center justify-center text-xl mb-3">${m.icon}</div>
      <p class="font-bold mb-1">${m.name}</p>
      <p class="text-xs text-gray-500 leading-relaxed">${m.desc}</p>
    </div>`).join('');
}
