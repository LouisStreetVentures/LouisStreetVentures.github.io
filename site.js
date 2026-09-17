// The HTML contains every service and a direct email link before enhancement.
const before = document.getElementById('before');
const after = document.getElementById('after');
const rows = document.getElementById('sample-rows');
const cleanedRows = rows.innerHTML;
const cleanedSummary = document.getElementById('sample-result').textContent;
function showSample(clean) {
  before.setAttribute('aria-pressed', String(!clean));
  after.setAttribute('aria-pressed', String(clean));
  rows.innerHTML = clean ? cleanedRows : '<tr><td class="error">MAPLE &amp; MAIN</td><td>9/1/26</td><td>1200</td></tr><tr><td class="error">cedar studio</td><td>Sep 2, 2026</td><td>$850.00</td></tr><tr><td class="error">MAPLE &amp; MAIN</td><td>9/1/26</td><td>1200</td></tr><tr><td>Northside Co.</td><td>2026-09-03</td><td>2400.0</td></tr>';
  document.getElementById('sample-result').textContent = clean ? cleanedSummary : '4 rows. One repeated record, inconsistent names and formats, and no total.';
}
before.addEventListener('click', () => showSample(false));
after.addEventListener('click', () => showSample(true));

document.querySelector('.sample-controls').classList.add('ready');

const filterButtons = document.querySelectorAll('[data-filter]');
const serviceCards = document.querySelectorAll('#service-list > article');
filterButtons.forEach(button => button.addEventListener('click', () => {
  filterButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let count = 0;
  serviceCards.forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.group !== button.dataset.filter;
    if (!card.hidden) count += 1;
  });
  document.getElementById('filter-count').textContent = `${count} services shown`;
}));
document.querySelector('.service-filters').hidden = false;

const menu = document.querySelector('.mobile-menu');
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
menu.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});

const form = document.getElementById('project-form');
const service = document.getElementById('service');
const brief = document.getElementById('brief');
const summary = document.getElementById('service-summary');
const draftStatus = document.getElementById('draft-status');
const manualCopy = document.getElementById('manual-copy');
const email = 'louisstreetventures@proton.me';

function updateService() {
  const option = service.selectedOptions[0];
  document.getElementById('brief-hint').textContent = option.dataset.prompt;
  summary.hidden = !option.dataset.price;
  summary.textContent = option.dataset.price
    ? `${option.dataset.price} · ${option.dataset.days} · ${option.dataset.revisions} revision ${option.dataset.revisions === '1' ? 'round' : 'rounds'}`
    : '';
  draftStatus.textContent = '';
  manualCopy.hidden = true;
}
service.addEventListener('change', updateService);
brief.addEventListener('input', () => {
  brief.setCustomValidity('');
  draftStatus.textContent = '';
  manualCopy.hidden = true;
});

document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', event => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  service.value = link.dataset.service;
  updateService();
  brief.focus({ preventScroll: true });
  document.getElementById('contact').scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
  });
}));

function getDraft() {
  brief.setCustomValidity(brief.value.trim() ? '' : 'Describe the project before opening or copying a draft.');
  if (!form.reportValidity()) return null;
  const selected = service.selectedOptions[0].textContent;
  return {
    subject: `Project inquiry: ${selected}`,
    body: `Hello,\n\n${brief.value.trim()}\n\nService: ${selected}\n`
  };
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const draft = getDraft();
  if (!draft) return;
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;
  draftStatus.textContent = 'If your email app did not open, use Copy for webmail.';
});
document.getElementById('copy-draft').addEventListener('click', async () => {
  const draft = getDraft();
  if (!draft) return;
  const text = `To: ${email}\nSubject: ${draft.subject}\n\n${draft.body}`;
  try {
    await navigator.clipboard.writeText(text);
    draftStatus.textContent = 'Copied. Paste into your email and send when ready.';
  } catch {
    const output = document.getElementById('draft-text');
    output.value = text;
    manualCopy.hidden = false;
    output.focus();
    output.select();
    draftStatus.textContent = 'Select and copy the draft below.';
  }
});
updateService();
document.getElementById('copy-draft').hidden = false;
form.hidden = false;
document.querySelector('.form-fallback').hidden = true;
