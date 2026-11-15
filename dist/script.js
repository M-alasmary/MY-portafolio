const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const header = $('[data-header]');
const menuButton = $('.menu-button');
const mobileMenu = $('#mobile-menu');
const mobileFocusables = $$('a,button', mobileMenu);

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) mobileFocusables[0]?.focus();
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
$$('a', mobileMenu).forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
  if (event.key === 'Tab' && menuButton.getAttribute('aria-expanded') === 'true') {
    const all = [menuButton, ...mobileFocusables];
    if (event.shiftKey && document.activeElement === all[0]) { event.preventDefault(); all.at(-1).focus(); }
    if (!event.shiftKey && document.activeElement === all.at(-1)) { event.preventDefault(); all[0].focus(); }
  }
});
window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 18), { passive: true });

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), { threshold: .1 });
$$('.reveal').forEach(element => revealObserver.observe(element));

const navLinks = $$('.desktop-nav a');
const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
}), { rootMargin: '-35% 0px -58% 0px' });
$$('[data-section]').forEach(section => sectionObserver.observe(section));

const heroMap = $('[data-hero-map]');
if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  heroMap.addEventListener('pointermove', event => {
    const rect = heroMap.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    heroMap.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg) translate3d(${x * 6}px,${y * 6}px,0)`;
  });
  heroMap.addEventListener('pointerleave', () => heroMap.style.transform = '');
}

$$('.filter').forEach(button => button.addEventListener('click', () => {
  $$('.filter').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  const filter = button.dataset.filter;
  $$('.project-link').forEach(project => { project.hidden = filter !== 'all' && !project.dataset.categories.split(' ').includes(filter); });
}));

const capabilities = {
  perception: { count:'01 / 06', title:'Perception', status:'Implemented prototype', tone:'implemented', purpose:'Detects and tracks pretrained object classes in webcam or uploaded video, then emits deterministic image-zone events.', inputs:'Webcam or recorded video', outputs:'Boxes, confidence, track IDs, zone events', connects:'Reasoning, mission history, dashboard', evidence:'Source: AI Core v0.2 README, app code, and rule tests.' },
  reasoning: { count:'02 / 06', title:'Reasoning', status:'Limited implementation', tone:'partial', purpose:'A constrained assistant proposes supported visual missions and explains saved detection context. It cannot act autonomously.', inputs:'User request, detection metadata, history', outputs:'Natural-language answer, validated mission proposal', connects:'Perception, human review, memory', evidence:'Offline Ollama and online OpenAI adapters are implemented; provider calls were tested with mocks.' },
  autonomy: { count:'03 / 06', title:'Autonomy', status:'Concept only', tone:'concept', purpose:'Envisions adaptive navigation and mission execution under explicit operator and safety constraints.', inputs:'Mission goals, aircraft state, environment', outputs:'Bounded task progression', connects:'Reasoning, control, perception', evidence:'The AI Core explicitly states that geographic navigation, obstacle avoidance, and flight control are not implemented.' },
  collaboration: { count:'04 / 06', title:'Collaboration', status:'Concept only', tone:'concept', purpose:'Frames multi-agent coordination and distributed intelligence across a future connected fleet.', inputs:'Peer state, shared mission intent', outputs:'Coordinated task model', connects:'Autonomy, reasoning, telemetry', evidence:'The AI Core explicitly states that swarm coordination is not implemented.' },
  prediction: { count:'05 / 06', title:'Prediction', status:'Concept only', tone:'concept', purpose:'Envisions anomaly detection, risk forecasting, predictive analytics, and future-state support.', inputs:'Current and historical observations', outputs:'Forecasts and risk signals', connects:'Perception, reasoning', evidence:'Trajectory prediction and measured predictive performance are not implemented or claimed.' },
  control: { count:'06 / 06', title:'Control', status:'Human-supervised UI', tone:'partial', purpose:'The dashboard lets an operator review mission proposals, apply validated settings, monitor events, and export records.', inputs:'Approved mission settings, system state', outputs:'Dashboard configuration and evidence records', connects:'Perception, reasoning, operator', evidence:'The software has no drone connection and sends no flight commands.' }
};
$$('.arch-node').forEach(button => button.addEventListener('click', () => {
  $$('.arch-node').forEach(item => item.classList.toggle('active', item === button));
  const item = capabilities[button.dataset.capability];
  $('#arch-count').textContent = item.count; $('#arch-title').textContent = item.title;
  $('#arch-status').textContent = item.status; $('#arch-status').className = `status ${item.tone}`;
  $('#arch-purpose').textContent = item.purpose; $('#arch-inputs').textContent = item.inputs;
  $('#arch-outputs').textContent = item.outputs; $('#arch-connects').textContent = item.connects;
  $('#arch-evidence').textContent = item.evidence;
}));

const platforms = {
  ten: { index:'10”', role:'Wide-area observation', priority:'Payload headroom / stability', details:['EO; thermal optional','Companion computer','Planned survey routes','Endurance TBD after flight trials'] },
  five: { index:'5”', role:'Rapid local inspection', priority:'Agility / portability', details:['Lightweight EO','Compact compute module','Short-range response','Endurance TBD after flight trials'] }
};
$$('.platform-tab').forEach(button => button.addEventListener('click', () => {
  $$('.platform-tab').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); });
  const item = platforms[button.dataset.platform]; $('#platform-index').textContent = item.index;
  $('#platform-role').textContent = item.role; $('#platform-priority').textContent = item.priority;
  $('#platform-details').innerHTML = item.details.map(detail => `<li>${detail}</li>`).join('');
}));

const scenarios = {
  credential:{id:'ACDS-024',title:'SSH authentication spray',severity:'HIGH',mitre:'T1110',events:[['09:42','Signal received','Authentication failures exceed demo threshold.'],['09:43','Scope checked','Analyst access resolved against environment.'],['09:44','Incident opened','Awaiting an authorized response.']]},
  lateral:{id:'ACDS-031',title:'Lateral movement sequence',severity:'CRITICAL',mitre:'T1021',events:[['10:16','Remote service use','Unexpected connection path observed.'],['10:17','Host correlated','Demo signals joined across two subnets.'],['10:19','Incident escalated','Higher-risk response requires approval.']]},
  exfil:{id:'ACDS-046',title:'Outbound transfer anomaly',severity:'HIGH',mitre:'T1041',events:[['11:03','Volume anomaly','Outbound pattern differs from demo baseline.'],['11:04','Destination tagged','Indicator added to investigation context.'],['11:07','Review requested','Analyst confirmation is pending.']]}
};
$$('.scenario').forEach(button => button.addEventListener('click', () => {
  $$('.scenario').forEach(item => item.classList.toggle('active', item === button));
  const item = scenarios[button.dataset.scenario]; $('#incident-id').textContent = item.id; $('#incident-title').textContent = item.title;
  $('#incident-severity').textContent = item.severity; $('#incident-mitre').textContent = item.mitre;
  $('#incident-timeline').innerHTML = item.events.map(row => `<li><time>${row[0]}</time><span><b>${row[1]}</b>${row[2]}</span></li>`).join('');
  $('#response-feedback').textContent = 'No action has been executed. This is an isolated demonstration.';
}));
$('#preview-response').addEventListener('click', () => {
  const approval = $('#response-action').value === 'isolate';
  $('#response-feedback').textContent = approval ? 'Preview: this higher-risk action would be sent for administrator approval.' : 'Preview: this low-risk action would be authorized, executed, and added to the audit record.';
});

const courses = {
  architecture:['01','Software Architecture and Design','Connects to full-stack boundaries, role-specific workspaces, and explicit system components in ACDS.'],
  quality:['02','Software Quality Assurance','Connects to the tested authorization matrix, rule tests, validation plans, and explicit evidence boundaries.'],
  requirements:['03','Software Requirements Engineering','Connects to SkyCrypt acceptance criteria and the scoped workflows documented across both projects.'],
  database:['04','Database Systems','Connects to PostgreSQL persistence in ACDS and SQLite mission/event history in SkyCrypt AI Core.'],
  os:['05','Operating Systems','Supports process, resource, permission, and deployment reasoning across local AI and backend systems.'],
  computer:['06','Computer Architecture','Connects to edge-compute choices, NVIDIA Jetson, Raspberry Pi, and companion-computer design.'],
  soa:['07','Service-Oriented Architecture','Connects to the separation between frontend, API, identity, simulation, and data services.'],
  web:['08','Web Services','Connects to REST APIs, secure mutations, provider adapters, and integration boundaries.'],
  hci:['09','Human-Computer Interaction','Connects to operator review, role-specific interfaces, accessible workflows, and human authority over automation.']
};
$$('.course').forEach(button => button.addEventListener('click', () => {
  $$('.course').forEach(item => item.classList.toggle('active', item === button));
  const item = courses[button.dataset.course]; $('#course-code').textContent = item[0]; $('#course-title').textContent = item[1]; $('#course-link').textContent = item[2];
}));

let credentialIssuer = 'all';
const credentialSearch = $('#credential-search');
const credentialItems = $$('#credential-list article');
function updateCredentials() {
  const query = credentialSearch.value.trim().toLowerCase(); let shown = 0;
  credentialItems.forEach(item => { const visible = (credentialIssuer === 'all' || item.dataset.issuer === credentialIssuer) && item.dataset.search.includes(query); item.hidden = !visible; if (visible) shown++; });
  $('.credential-empty').hidden = shown > 0;
}
credentialSearch.addEventListener('input', updateCredentials);
$$('.issuer').forEach(button => button.addEventListener('click', () => {
  credentialIssuer = button.dataset.issuer; $$('.issuer').forEach(item => { item.classList.toggle('active', item === button); item.setAttribute('aria-pressed', String(item === button)); }); updateCredentials();
}));

const gallery = $('#gallery-modal');
$$('[data-gallery-src]').forEach(button => button.addEventListener('click', () => {
  $('#gallery-image').src = button.dataset.gallerySrc; $('#gallery-image').alt = button.dataset.galleryAlt;
  $('#gallery-title').textContent = button.dataset.galleryCaption; document.body.classList.add('modal-open'); gallery.showModal();
}));
const cvModal = $('#cv-modal');
function openCv() {
  if (menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
  const frame = $('iframe', cvModal); if (!frame.src) frame.src = frame.dataset.src;
  document.body.classList.add('modal-open'); cvModal.showModal();
}
$$('[data-open-cv]').forEach(button => button.addEventListener('click', openCv));
$$('[data-close-modal]').forEach(button => button.addEventListener('click', () => { button.closest('dialog').close(); document.body.classList.remove('modal-open'); }));
[gallery, cvModal].forEach(dialog => {
  dialog.addEventListener('click', event => { if (event.target === dialog) { dialog.close(); document.body.classList.remove('modal-open'); } });
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
});

const copyStatus = $('.copy-status');
async function copyEmail() {
  try { await navigator.clipboard.writeText('alasmarymohsa@gmail.com'); copyStatus.textContent = 'Email copied.'; }
  catch { copyStatus.textContent = 'Copy unavailable — alasmarymohsa@gmail.com'; }
}
$('.copy-email').addEventListener('click', copyEmail);

const palette = $('#command-palette');
const commandInput = $('#command-input');
const commandButtons = $$('.command-list button');
function openPalette() { if (!palette.open) { palette.showModal(); commandInput.value = ''; commandButtons.forEach(button => button.hidden = false); setTimeout(() => commandInput.focus(), 0); } }
function runCommand(command) {
  palette.close();
  if (['skycrypt','acds','experience','credentials'].includes(command)) { location.hash = command; document.getElementById(command)?.scrollIntoView(); }
  if (command === 'cv') { const link = document.createElement('a'); link.href = '/documents/mohammed-alasmary-cv.pdf'; link.download = 'Mohammed-Alasmary-CV.pdf'; link.click(); }
  if (command === 'email') { document.getElementById('contact')?.scrollIntoView(); copyEmail(); }
}
$('.command-trigger').addEventListener('click', openPalette);
document.addEventListener('keydown', event => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openPalette(); } });
commandInput.addEventListener('input', () => { const query = commandInput.value.toLowerCase(); commandButtons.forEach(button => button.hidden = !button.textContent.toLowerCase().includes(query)); });
commandInput.addEventListener('keydown', event => { const visible = commandButtons.filter(button => !button.hidden); if (event.key === 'ArrowDown') { event.preventDefault(); visible[0]?.focus(); } if (event.key === 'Enter') { event.preventDefault(); visible[0] && runCommand(visible[0].dataset.command); } });
commandButtons.forEach((button, index) => {
  button.addEventListener('click', () => runCommand(button.dataset.command));
  button.addEventListener('keydown', event => { const visible = commandButtons.filter(item => !item.hidden); const current = visible.indexOf(button); if (event.key === 'ArrowDown') { event.preventDefault(); visible[(current + 1) % visible.length]?.focus(); } if (event.key === 'ArrowUp') { event.preventDefault(); (current === 0 ? commandInput : visible[current - 1])?.focus(); } });
});

if (location.hash) setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView(), 80);
