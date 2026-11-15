'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => (reducedMotion.matches ? 'auto' : 'smooth');
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const pad = n => String(n).padStart(2, '0');

/* Toggle a set of aria-pressed buttons so exactly one is active. */
function pressOnly(buttons, active) {
  buttons.forEach(button => {
    const on = button === active;
    button.classList.toggle('active', on);
    button.setAttribute('aria-pressed', String(on));
  });
}

/* ---------------- Mobile navigation ---------------- */
const header = $('[data-header]');
const menuButton = $('.menu-button');
const mobileMenu = $('#mobile-menu');
const mobileFocusables = () => $$('a,button', mobileMenu);
const menuOpen = () => menuButton.getAttribute('aria-expanded') === 'true';

function setMenu(open, { restoreFocus = true } = {}) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  if (open) mobileFocusables()[0]?.focus();
  else if (restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(!menuOpen()));
$$('a', mobileMenu).forEach(link => link.addEventListener('click', () => setMenu(false, { restoreFocus: false })));
document.addEventListener('keydown', event => {
  if (!menuOpen()) return;
  if (event.key === 'Escape') setMenu(false);
  if (event.key === 'Tab') {
    const all = [menuButton, ...mobileFocusables()];
    if (event.shiftKey && document.activeElement === all[0]) { event.preventDefault(); all.at(-1).focus(); }
    else if (!event.shiftKey && document.activeElement === all.at(-1)) { event.preventDefault(); all[0].focus(); }
  }
});
matchMedia('(min-width: 1181px)').addEventListener('change', event => { if (event.matches && menuOpen()) setMenu(false, { restoreFocus: false }); });
window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 18), { passive: true });
header.classList.toggle('scrolled', scrollY > 18);

/* ---------------- Reveal on scroll ---------------- */
const revealItems = $$('.reveal');
if (!('IntersectionObserver' in window) || reducedMotion.matches) {
  revealItems.forEach(element => element.classList.add('visible'));
} else {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  revealItems.forEach(element => revealObserver.observe(element));
}

/* ---------------- Active navigation ---------------- */
if ('IntersectionObserver' in window) {
  const navLinks = $$('.desktop-nav a');
  const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  }), { rootMargin: '-35% 0px -58% 0px' });
  $$('[data-section]').forEach(section => sectionObserver.observe(section));

  $$('.case-nav').forEach(nav => {
    const links = $$('a', nav);
    const targets = links.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
    }), { rootMargin: '-30% 0px -60% 0px' });
    targets.forEach(target => observer.observe(target));
  });
}

/* ---------------- Project filters ---------------- */
const filterButtons = $$('.filter');
const showcases = $$('.showcase');
filterButtons.forEach(button => button.addEventListener('click', () => {
  pressOnly(filterButtons, button);
  const filter = button.dataset.filter;
  let shown = 0;
  showcases.forEach(card => {
    const visible = filter === 'all' || card.dataset.categories.split(' ').includes(filter);
    card.hidden = !visible;
    if (visible) { shown++; card.classList.add('visible'); }
  });
  // A lone secondary card spans the full row instead of leaving an empty half.
  const secondary = showcases.filter(card => !card.hidden && !card.classList.contains('showcase-sky'));
  showcases.forEach(card => { if (!card.classList.contains('showcase-sky')) card.style.gridColumn = secondary.length === 1 && card === secondary[0] ? '1 / -1' : ''; });
  $('#filter-status').textContent = `${shown} project${shown === 1 ? '' : 's'} shown`;
}));

/* ---------------- SkyCrypt loops ---------------- */
const skyLoops = {
  perception: [
    ['eye', 'Capture', 'Webcam stream or uploaded video'],
    ['target', 'Detect', 'YOLO11 nano inference with confidence scores'],
    ['activity', 'Track', 'ByteTrack assigns persistent track IDs'],
    ['layers', 'Apply rules', 'Deterministic zone-entry events in normalized image zones'],
    ['database', 'Record', 'SQLite mission history and CSV event export'],
    ['users', 'Review', 'Streamlit dashboard for the operator']
  ],
  mission: [
    ['mail', 'Request', 'Operator describes the mission in natural language'],
    ['cpu', 'Propose', 'Ollama (offline) or OpenAI (online) drafts mission settings'],
    ['shield', 'Validate', 'Only recognized classes, normalized zones, and bounded thresholds pass'],
    ['alert', 'Reject', 'Invalid or reversed bounds are refused with a reason', 'gate'],
    ['users', 'Approve', 'The operator reviews and applies — the model never does'],
    ['sliders', 'Reconfigure', 'Applied settings drive the perception loop']
  ]
};
const loopTabs = $$('.loop-tab');
loopTabs.forEach(button => button.addEventListener('click', () => {
  pressOnly(loopTabs, button);
  $('#sky-flow').innerHTML = skyLoops[button.dataset.loop]
    .map(([ic, title, text, cls]) => `<li${cls ? ` class="${cls}"` : ''}>${icon(ic)}<b>${title}</b><span>${text}</span></li>`).join('');
}));

/* ---------------- SkyCrypt architecture explorer ---------------- */
const capabilityOrder = ['perception', 'reasoning', 'autonomy', 'control', 'collaboration', 'prediction'];
const capabilityPoints = { perception: [50, 10], reasoning: [84.6, 30], autonomy: [84.6, 70], control: [50, 90], collaboration: [15.4, 70], prediction: [15.4, 30] };
const capabilities = {
  perception: { title: 'Perception', built: true, purpose: 'Detects and tracks objects in webcam or uploaded video, then turns each track into deterministic zone events the rest of the system can reason about.', inputs: 'Webcam stream or recorded video', outputs: 'Boxes, confidence, track IDs, zone events', tech: ['YOLO11 nano', 'ByteTrack', 'Zone rules'] },
  reasoning: { title: 'Reasoning', built: true, purpose: 'A constrained mission assistant explains detection context and proposes supported missions through a validated contract. It recommends; it never acts on its own.', inputs: 'Operator request, detection metadata, mission history', outputs: 'Answers and validated mission proposals', tech: ['Ollama', 'OpenAI', 'Schema validation'] },
  autonomy: { title: 'Autonomy', built: false, purpose: 'Adaptive navigation and mission execution inside operator-defined bounds — progressing tasks while respecting explicit safety constraints.', inputs: 'Approved mission intent, aircraft state, environment', outputs: 'Bounded task progression', tech: ['Mission contracts', 'Safety envelope'] },
  control: { title: 'Control', built: true, purpose: 'The operator dashboard: review proposals, apply validated settings, monitor events, and export records. Human authority sits here.', inputs: 'Validated proposals, live events, history', outputs: 'Applied mission settings and evidence records', tech: ['Streamlit', 'SQLite', 'CSV export'] },
  collaboration: { title: 'Collaboration', built: false, purpose: 'Multi-agent coordination across a connected fleet, sharing mission intent and state so airframes divide work instead of duplicating it.', inputs: 'Peer state, shared mission intent', outputs: 'Coordinated task allocation', tech: ['Fleet model', 'Shared intent'] },
  prediction: { title: 'Prediction', built: false, purpose: 'Anomaly detection and risk forecasting from observation history, giving the reasoning layer an early view of what is likely to happen next.', inputs: 'Current and historical observations', outputs: 'Forecasts and risk signals', tech: ['Anomaly detection', 'Risk forecasting'] }
};
// [from, to, built?, description]
const capabilityLinks = [
  ['perception', 'reasoning', true, 'detections, track IDs, and zone events'],
  ['reasoning', 'control', true, 'validated mission proposals for review'],
  ['control', 'perception', true, 'applied classes, zones, and thresholds'],
  ['perception', 'prediction', false, 'observation history'],
  ['prediction', 'reasoning', false, 'risk signals and forecasts'],
  ['control', 'autonomy', false, 'operator-approved mission bounds'],
  ['autonomy', 'collaboration', false, 'task state shared with the fleet'],
  ['collaboration', 'autonomy', false, 'coordinated task allocation']
];
const linkLayer = $('#arch-links');
const archSvg = $('.arch-svg');
if (linkLayer) {
  const ns = 'http://www.w3.org/2000/svg';
  capabilityOrder.forEach(key => {
    const [x, y] = capabilityPoints[key];
    const spoke = document.createElementNS(ns, 'line');
    Object.entries({ x1: 50, y1: 50, x2: x, y2: y }).forEach(([k, v]) => spoke.setAttribute(k, v));
    spoke.setAttribute('class', 'arch-link spoke'); spoke.dataset.a = key; spoke.dataset.b = 'core';
    linkLayer.append(spoke);
  });
  const drawn = new Set();
  capabilityLinks.forEach(([from, to, built]) => {
    const id = [from, to].sort().join('|');
    if (drawn.has(id)) return; drawn.add(id);
    const [x1, y1] = capabilityPoints[from]; const [x2, y2] = capabilityPoints[to];
    const path = document.createElementNS(ns, 'path');
    let mx = (x1 + x2) / 2 + (50 - (x1 + x2) / 2) * 0.35; let my = (y1 + y2) / 2 + (50 - (y1 + y2) / 2) * 0.35;
    // Opposite nodes would route straight through the core; bow those links to one side instead.
    if (Math.hypot(mx - 50, my - 50) < 4) { const len = Math.hypot(x2 - x1, y2 - y1); mx = 50 + ((y2 - y1) / len) * 30; my = 50 - ((x2 - x1) / len) * 30; }
    path.setAttribute('d', `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`);
    path.setAttribute('class', `arch-link${built ? '' : ' planned'}`);
    path.dataset.a = from; path.dataset.b = to;
    linkLayer.append(path);
  });
}
const archNodes = $$('.arch-node');
function selectCapability(key) {
  const item = capabilities[key];
  const index = capabilityOrder.indexOf(key);
  const related = new Set();
  const rows = capabilityLinks.filter(([a, b]) => a === key || b === key).map(([a, b, built, text]) => {
    const outgoing = a === key; const other = outgoing ? b : a; related.add(other);
    return `<li><span class="dir${built ? '' : ' planned'}">${outgoing ? '→ to' : '← from'}</span><b>${capabilities[other].title}</b><span>${text}</span></li>`;
  });
  archNodes.forEach(node => {
    const on = node.dataset.capability === key;
    node.classList.toggle('active', on); node.setAttribute('aria-pressed', String(on));
    node.classList.toggle('related', related.has(node.dataset.capability));
  });
  $$('.arch-link').forEach(link => link.classList.toggle('hot', link.dataset.a === key || link.dataset.b === key));
  archSvg?.classList.add('focus');
  $('#arch-count').textContent = `${pad(index + 1)} / 06`;
  $('#arch-title').textContent = item.title;
  const status = $('#arch-status');
  status.textContent = item.built ? 'Running in AI Core v0.2' : 'Architecture roadmap';
  status.className = `status ${item.built ? 'built' : 'arch'}`;
  $('#arch-purpose').textContent = item.purpose;
  $('#arch-inputs').textContent = item.inputs;
  $('#arch-outputs').textContent = item.outputs;
  $('#arch-relations').innerHTML = rows.join('');
  $('#arch-tech').innerHTML = item.tech.map(t => `<span>${escapeHtml(t)}</span>`).join('');
}
archNodes.forEach(button => {
  button.addEventListener('click', () => selectCapability(button.dataset.capability));
  button.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const next = capabilityOrder[(capabilityOrder.indexOf(button.dataset.capability) + step + 6) % 6];
    const target = archNodes.find(node => node.dataset.capability === next);
    target.focus(); selectCapability(next);
  });
});
if (archNodes.length) selectCapability('perception');

/* ---------------- SkyCrypt platforms ---------------- */
const platforms = {
  ten: { index: '10”', role: 'Wide-area observation', priority: 'Payload headroom and stability', summary: 'The larger frame carries more sensing and compute, holding a steady platform for planned survey routes.', specs: [['Sensors', 'EO camera; thermal optional'], ['Compute', 'Companion computer'], ['Missions', 'Planned survey routes'], ['Strength', 'Payload headroom, stable observation']] },
  five: { index: '5”', role: 'Rapid local inspection', priority: 'Agility and portability', summary: 'The compact frame trades payload for speed and reach — quick to deploy for short-range, close-in response.', specs: [['Sensors', 'Lightweight EO camera'], ['Compute', 'Compact compute module'], ['Missions', 'Short-range response'], ['Strength', 'Agility, portability, fast deployment']] }
};
const platformTabs = $$('.platform-tab');
platformTabs.forEach(button => button.addEventListener('click', () => {
  pressOnly(platformTabs, button);
  const item = platforms[button.dataset.platform];
  $('#platform-index').textContent = item.index;
  $('#platform-role').textContent = item.role;
  $('#platform-priority').textContent = item.priority;
  $('#platform-summary').textContent = item.summary;
  $('#platform-specs').innerHTML = item.specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  $('#pv-frame').classList.toggle('five', button.dataset.platform === 'five');
}));

/* ---------------- ACDS decision loop ---------------- */
const loopStages = [
  { title: 'Simulation environment', text: 'CybORG hosts a simulated enterprise: 10 hosts across 3 subnets, where adversaries run the six attack categories and the concurrent multi-vector case.', handoff: 'Raw network and host state for each time step' },
  { title: 'State observation', text: 'The environment is compressed into an 8-feature security state vector — the agent sees the network the way an analyst would summarize it.', handoff: '8-feature state vector to the policy' },
  { title: 'Autonomous AI policy', text: 'Defense is modeled as a Markov Decision Process. PPO and DQN policies, implemented in PyTorch, map each state to the most valuable defensive action.', handoff: 'Action preferences over the response space' },
  { title: 'Defensive decision', text: 'The policy selects one action from an 8-action response space, balancing threat containment against the cost of disrupting legitimate services.', handoff: 'One selected defensive action' },
  { title: 'Action execution', text: 'FastAPI executes the action against CybORG. The resulting reward and next state flow back to the policy, closing the loop; the SOC view visualizes observations, actions, and evaluation logs.', handoff: 'Reward + next state back to the policy' }
];
const stageButtons = $$('.loop-stage');
let currentStage = 0;
function setStage(index) {
  currentStage = (index + loopStages.length) % loopStages.length;
  const stage = loopStages[currentStage];
  stageButtons.forEach((button, i) => {
    button.classList.toggle('active', i === currentStage); button.setAttribute('aria-pressed', String(i === currentStage));
    button.classList.toggle('done', i < currentStage);
  });
  $('#loop-step').textContent = `Stage ${pad(currentStage + 1)} of 05`;
  $('#loop-title').textContent = stage.title;
  $('#loop-text').textContent = stage.text;
  $('#loop-handoff').textContent = stage.handoff;
  const circumference = 502.65;
  $('#loop-progress').style.strokeDashoffset = String(circumference * (1 - (currentStage + 1) / loopStages.length));
}
stageButtons.forEach(button => button.addEventListener('click', () => setStage(Number(button.dataset.stage))));
$('#loop-prev')?.addEventListener('click', () => setStage(currentStage - 1));
$('#loop-next')?.addEventListener('click', () => setStage(currentStage + 1));
if (stageButtons.length) setStage(0);

/* ---------------- ACDS role workspaces (tabs) ---------------- */
const roles = {
  admin: { title: 'Admin workspace', text: 'Owns identity and trust boundaries: who can see which environment, and which high-risk actions are allowed to run.', items: ['Manages users, roles, and environment scopes', 'Approves high-risk responses such as host isolation', 'Reviews the hash-chained audit log'] },
  soc: { title: 'SOC workspace', text: 'Where analysts work incidents end to end, with live updates limited to the environments they are scoped to.', items: ['Investigates incidents with timelines and MITRE ATT&CK context', 'Runs low-risk responses directly; escalates high-risk ones', 'Receives scoped real-time updates over WebSockets'] },
  research: { title: 'Research workspace', text: 'Connects the reinforcement-learning research to the product, keeping experiments and simulations traceable.', items: ['Records experiments and their configurations', 'Explores simulation views of agent behavior', 'Compares PPO and DQN runs side by side'] }
};
const roleTabs = $$('.role-tab');
function selectRole(tab, focus = false) {
  roleTabs.forEach(item => { const on = item === tab; item.setAttribute('aria-selected', String(on)); item.tabIndex = on ? 0 : -1; });
  const role = roles[tab.dataset.role];
  $('#role-panel').setAttribute('aria-labelledby', tab.id);
  $('#role-title').textContent = role.title;
  $('#role-text').textContent = role.text;
  $('#role-list').innerHTML = role.items.map(item => `<li>${icon('check')}${escapeHtml(item)}</li>`).join('');
  if (focus) tab.focus();
}
roleTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectRole(tab));
  tab.addEventListener('keydown', event => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    if (event.key in keys) { event.preventDefault(); selectRole(roleTabs[(index + keys[event.key] + roleTabs.length) % roleTabs.length], true); }
    if (event.key === 'Home') { event.preventDefault(); selectRole(roleTabs[0], true); }
    if (event.key === 'End') { event.preventDefault(); selectRole(roleTabs.at(-1), true); }
  });
});
if (roleTabs.length) selectRole(roleTabs[0]);

/* ---------------- ACDS incident walkthrough ---------------- */
const scenarios = {
  credential: { id: 'ACDS-024', title: 'SSH authentication spray', severity: 'high', mitre: 'T1110', host: 'access-gw-02', events: [['09:42', 'Signal received', 'Authentication failures exceed the demo threshold.'], ['09:43', 'Scope checked', 'Analyst access resolved against the environment scope.'], ['09:44', 'Incident opened', 'Awaiting an authorized response.']] },
  lateral: { id: 'ACDS-031', title: 'Lateral movement sequence', severity: 'critical', mitre: 'T1021', host: 'app-srv-07', events: [['10:16', 'Remote service use', 'Unexpected connection path observed.'], ['10:17', 'Hosts correlated', 'Signals joined across two subnets.'], ['10:19', 'Incident escalated', 'A higher-risk response will require approval.']] },
  exfil: { id: 'ACDS-046', title: 'Outbound transfer anomaly', severity: 'high', mitre: 'T1041', host: 'data-db-01', events: [['11:03', 'Volume anomaly', 'Outbound pattern differs from the baseline.'], ['11:04', 'Destination tagged', 'Indicator added to the investigation context.'], ['11:07', 'Review requested', 'Analyst confirmation is pending.']] }
};
const responses = {
  watch: { label: 'Added to watchlist', approval: false },
  block: { label: 'Source blocked for 1 hour', approval: false },
  isolate: { label: 'Host isolation', approval: true }
};
const scenarioButtons = $$('.scenario');
const walk = { scenario: 'credential', step: 0, result: null };
const STEPS = 4;
function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number); const total = h * 60 + m + minutes;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}
function renderWalkthrough() {
  const s = scenarios[walk.scenario];
  $('#incident-id').textContent = s.id;
  $('#incident-title').textContent = s.title;
  const severity = $('#incident-severity');
  severity.textContent = s.severity === 'critical' ? 'Critical' : 'High';
  severity.dataset.level = s.severity;
  $('#incident-mitre').textContent = s.mitre;
  const statusText = walk.result ? (walk.result.approval ? 'Pending approval' : 'Contained') : walk.step >= 2 ? 'Open' : 'Investigating';
  $('#incident-status').textContent = statusText;

  const rows = s.events.map(([time, title, text], i) => `<li class="${i <= walk.step ? '' : 'pending'}"><time>${time}</time><span class="tl-body"><b>${title}</b><span>${text}</span></span></li>`);
  const last = s.events.at(-1)[0];
  if (walk.result) {
    const r = walk.result;
    if (r.approval) {
      rows.push(`<li class="approval"><time>${addMinutes(last, 1)}</time><span class="tl-body"><b>Approval requested</b><span>${r.label} on ${s.host} routed to an Admin for approval.</span></span></li>`);
      rows.push(`<li class="pending"><time>--:--</time><span class="tl-body"><b>Execute &amp; audit</b><span>Runs only after approval, then is appended to the hash-chained audit log.</span></span></li>`);
    } else {
      rows.push(`<li class="final"><time>${addMinutes(last, 1)}</time><span class="tl-body"><b>${r.label}</b><span>Authorized for the analyst’s scope, executed, and appended to the hash-chained audit log.</span></span></li>`);
    }
  } else {
    rows.push(`<li class="pending"><time>--:--</time><span class="tl-body"><b>Response</b><span>Choose an authorized action.</span></span></li>`);
  }
  $('#incident-timeline').innerHTML = rows.join('');

  $('#step-dots').innerHTML = Array.from({ length: STEPS }, (_, i) => {
    const cls = i < walk.step || (walk.result && i === walk.step) ? 'done' : i === walk.step ? 'current' : '';
    return `<li class="${cls}"${i === walk.step ? ' aria-current="step"' : ''}><span class="sr-only">Step ${i + 1}${i < walk.step ? ', complete' : ''}</span></li>`;
  }).join('');
  $('#walk-count').textContent = `Step ${walk.step + 1} of ${STEPS}`;
  $('#walk-prev').disabled = walk.step === 0;
  const next = $('#walk-next');
  next.disabled = walk.step === STEPS - 1;
  $('#response-box').hidden = walk.step !== STEPS - 1;
  const feedback = $('#response-feedback');
  if (!walk.result) {
    feedback.className = 'response-feedback';
    feedback.textContent = walk.step === STEPS - 1 ? 'Select a response and run it.' : '';
  }
}
function setScenario(key) {
  walk.scenario = key; walk.step = 0; walk.result = null;
  scenarioButtons.forEach(button => { const on = button.dataset.scenario === key; button.classList.toggle('active', on); button.setAttribute('aria-pressed', String(on)); });
  renderWalkthrough();
}
scenarioButtons.forEach(button => button.addEventListener('click', () => setScenario(button.dataset.scenario)));
$('#walk-next')?.addEventListener('click', () => { if (walk.step < STEPS - 1) { walk.step++; renderWalkthrough(); if (walk.step === STEPS - 1) $('#response-action').focus(); } });
$('#walk-prev')?.addEventListener('click', () => { if (walk.step > 0) { walk.step--; walk.result = null; renderWalkthrough(); } });
$('#preview-response')?.addEventListener('click', () => {
  const r = responses[$('#response-action').value];
  walk.result = r;
  renderWalkthrough();
  const feedback = $('#response-feedback');
  feedback.className = `response-feedback ${r.approval ? 'warn' : 'ok'}`;
  feedback.textContent = r.approval ? 'High-risk action: queued for Admin approval before it can run.' : 'Low-risk action: authorized, executed, and recorded in the audit log.';
});
$('#response-action')?.addEventListener('change', () => { if (walk.result) { walk.result = null; renderWalkthrough(); } });
if (scenarioButtons.length) setScenario('credential');

/* ---------------- Coursework map ---------------- */
const projectLinks = { acds: ['shield', 'ACDS', '#acds'], sky: ['drone', 'SkyCrypt', '#skycrypt'], defense: ['trophy', 'Defensethon', '#experience'], cred: ['award', 'Credentials', '#credentials'] };
const courses = {
  architecture: ['Software Architecture and Design', 'Clear component boundaries: the SkyCrypt AI Core separates perception, rules, assistant, and dashboard; ACDS separates frontend, API, identity, and simulation.', ['sky', 'acds']],
  quality: ['Software Quality Assurance', 'Seven passing backend tests in the SkyCrypt AI Core, plus explicit acceptance criteria for each airframe class.', ['sky']],
  requirements: ['Software Requirements Engineering', 'Mission contracts, acceptance items, and role-scoped workflows defined before implementation.', ['sky', 'acds']],
  database: ['Database Systems', 'PostgreSQL persistence for ACDS incidents and experiments; SQLite mission and event history in SkyCrypt.', ['acds', 'sky']],
  os: ['Operating Systems', 'Process, resource, and permission reasoning behind local AI inference and backend services.', ['sky', 'acds']],
  computer: ['Computer Architecture', 'Edge-compute choices across NVIDIA Jetson, Raspberry Pi, and companion computers.', ['defense', 'sky']],
  soa: ['Service-Oriented Architecture', 'Independent services for frontend, API, identity, simulation, and data in ACDS.', ['acds']],
  web: ['Web Services', 'REST APIs, secure mutations with CSRF and origin checks, scoped WebSockets, and LLM provider adapters.', ['acds', 'sky']],
  hci: ['Human-Computer Interaction', 'Operator review before any AI-proposed change, role-specific workspaces, and accessible workflows.', ['sky', 'acds']]
};
const courseButtons = $$('.course');
function selectCourse(button) {
  pressOnly(courseButtons, button);
  const [title, text, links] = courses[button.dataset.course];
  $('#course-code').textContent = pad(courseButtons.indexOf(button) + 1);
  $('#course-title').textContent = title;
  $('#course-link').textContent = text;
  $('#course-projects').innerHTML = links.map(key => { const [ic, label, href] = projectLinks[key]; return `<a href="${href}">${icon(ic)}${label}</a>`; }).join('');
}
courseButtons.forEach(button => button.addEventListener('click', () => selectCourse(button)));
if (courseButtons.length) selectCourse(courseButtons[0]);

/* ---------------- Credentials ---------------- */
let credentialIssuer = 'all';
const credentialSearch = $('#credential-search');
const credentialItems = $$('#credential-list li');
const issuerButtons = $$('.issuer');
function updateCredentials() {
  const words = credentialSearch.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let shown = 0;
  credentialItems.forEach(item => {
    // Match each query word against word starts, so "nse" finds NSE but not "defense".
    const tokens = `${item.dataset.search} ${item.textContent.toLowerCase()}`.split(/[^a-z0-9]+/).filter(Boolean);
    const visible = (credentialIssuer === 'all' || item.dataset.issuer === credentialIssuer) && words.every(word => tokens.some(token => token.startsWith(word.replace(/[^a-z0-9]/g, ''))));
    item.hidden = !visible; if (visible) shown++;
  });
  $('.credential-empty').hidden = shown > 0;
  $('#credential-status').textContent = `${shown} credential${shown === 1 ? '' : 's'} shown`;
}
credentialSearch.addEventListener('input', updateCredentials);
issuerButtons.forEach(button => button.addEventListener('click', () => { credentialIssuer = button.dataset.issuer; pressOnly(issuerButtons, button); updateCredentials(); }));
$('#credential-reset')?.addEventListener('click', () => { credentialSearch.value = ''; credentialIssuer = 'all'; pressOnly(issuerButtons, issuerButtons[0]); updateCredentials(); credentialSearch.focus(); });

/* ---------------- Dialog helpers ---------------- */
let lastFocus = null;
function openDialog(dialog) {
  if (menuOpen()) setMenu(false, { restoreFocus: false });
  lastFocus = document.activeElement;
  document.body.classList.add('modal-open');
  dialog.showModal();
}
$$('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  });
});
$$('[data-close-modal]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));

/* ---------------- Gallery ---------------- */
const gallery = $('#gallery-modal');
const galleryState = { items: [], index: 0 };
function showGalleryItem(index) {
  const { items } = galleryState;
  galleryState.index = (index + items.length) % items.length;
  const item = items[galleryState.index];
  const img = $('#gallery-image');
  img.src = item.dataset.gallerySrc; img.alt = item.dataset.galleryAlt;
  $('#gallery-title').textContent = item.dataset.galleryCaption;
  $('#gallery-count').textContent = `${galleryState.index + 1} / ${items.length}`;
  const multi = items.length > 1;
  $('#gallery-prev').hidden = !multi; $('#gallery-next').hidden = !multi;
}
$$('[data-gallery-src]').forEach(button => button.addEventListener('click', () => {
  const group = button.dataset.gallery;
  galleryState.items = group ? $$(`[data-gallery="${group}"]`) : [button];
  // De-duplicate entries pointing at the same image (e.g., the hero frame and a card).
  const seen = new Set();
  galleryState.items = galleryState.items.filter(item => !seen.has(item.dataset.gallerySrc) && seen.add(item.dataset.gallerySrc));
  openDialog(gallery);
  showGalleryItem(galleryState.items.findIndex(item => item.dataset.gallerySrc === button.dataset.gallerySrc));
}));
$('#gallery-prev').addEventListener('click', () => showGalleryItem(galleryState.index - 1));
$('#gallery-next').addEventListener('click', () => showGalleryItem(galleryState.index + 1));
gallery.addEventListener('keydown', event => {
  if (galleryState.items.length < 2) return;
  if (event.key === 'ArrowRight') { event.preventDefault(); showGalleryItem(galleryState.index + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showGalleryItem(galleryState.index - 1); }
});

/* ---------------- CV preview ---------------- */
const cvModal = $('#cv-modal');
function openCv() {
  const frame = $('iframe', cvModal);
  if (!frame.getAttribute('src')) frame.src = frame.dataset.src;
  openDialog(cvModal);
}
$$('[data-open-cv]').forEach(button => button.addEventListener('click', openCv));
function downloadCv() {
  const link = document.createElement('a');
  link.href = '/documents/mohammed-alasmary-cv.pdf'; link.download = 'Mohammed-Alasmary-CV.pdf';
  document.body.append(link); link.click(); link.remove();
}

/* ---------------- Copy email ---------------- */
const EMAIL = 'alasmarymohsa@gmail.com';
const copyStatus = $('.copy-status');
async function copyEmail() {
  try { await navigator.clipboard.writeText(EMAIL); copyStatus.textContent = 'Email copied to clipboard.'; }
  catch { copyStatus.textContent = `Copy unavailable — ${EMAIL}`; }
  clearTimeout(copyEmail.timer);
  copyEmail.timer = setTimeout(() => { copyStatus.textContent = ''; }, 4000);
}
$('.copy-email').addEventListener('click', copyEmail);

/* ---------------- Command palette ---------------- */
const palette = $('#command-palette');
const commandInput = $('#command-input');
const commandButtons = $$('.command-list button');
let selectedCommand = 0;
const visibleCommands = () => commandButtons.filter(button => !button.hidden);
function highlightCommand(index) {
  const visible = visibleCommands();
  commandButtons.forEach(button => { button.classList.remove('selected'); button.setAttribute('aria-selected', 'false'); });
  if (!visible.length) { commandInput.removeAttribute('aria-activedescendant'); return; }
  selectedCommand = (index + visible.length) % visible.length;
  const button = visible[selectedCommand];
  button.classList.add('selected'); button.setAttribute('aria-selected', 'true');
  commandInput.setAttribute('aria-activedescendant', button.id);
  button.scrollIntoView({ block: 'nearest' });
}
function filterCommands() {
  const query = commandInput.value.trim().toLowerCase();
  commandButtons.forEach(button => { button.hidden = !button.textContent.toLowerCase().includes(query); });
  $('.command-empty').hidden = visibleCommands().length > 0;
  highlightCommand(0);
}
function openPalette() {
  if (palette.open) return;
  commandInput.value = '';
  openDialog(palette);
  filterCommands();
  commandInput.focus();
}
function goTo(id) {
  const target = document.getElementById(id);
  if (!target) return;
  history.replaceState(null, '', `#${id}`);
  target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
}
function runCommand(command) {
  palette.close();
  const external = { linkedin: 'https://www.linkedin.com/in/mohammed-alasmarymsa', github: 'https://github.com/M-alasmary' };
  if (command === 'cv') return downloadCv();
  if (command === 'cv-preview') return openCv();
  if (command === 'email') { goTo('contact'); return copyEmail(); }
  if (external[command]) return window.open(external[command], '_blank', 'noopener');
  goTo(command);
}
$('.command-trigger').addEventListener('click', openPalette);
$$('[data-open-palette]').forEach(button => button.addEventListener('click', openPalette));
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); palette.open ? palette.close() : openPalette(); }
});
commandInput.addEventListener('input', filterCommands);
commandInput.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') { event.preventDefault(); highlightCommand(selectedCommand + 1); }
  if (event.key === 'ArrowUp') { event.preventDefault(); highlightCommand(selectedCommand - 1); }
  if (event.key === 'Enter') { event.preventDefault(); const target = visibleCommands()[selectedCommand]; if (target) runCommand(target.dataset.command); }
});
commandButtons.forEach(button => {
  button.tabIndex = -1;
  button.addEventListener('click', () => runCommand(button.dataset.command));
  button.addEventListener('mousemove', () => highlightCommand(visibleCommands().indexOf(button)));
});

/* ---------------- Initial hash ---------------- */
if (location.hash) {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (target) setTimeout(() => target.scrollIntoView({ behavior: 'auto' }), 60);
}
