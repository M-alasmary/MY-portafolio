const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const menuLinks = [...mobileMenu.querySelectorAll('a')];
let lastFocus = null;

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mobileMenu.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) { lastFocus = document.activeElement; menuLinks[0].focus(); }
  else if (lastFocus === menuButton) menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menuLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
  if (e.key === 'Tab' && menuButton.getAttribute('aria-expanded') === 'true') {
    const focusables = [menuButton, ...menuLinks]; const first = focusables[0]; const last = focusables.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20), {passive:true});
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
}), {threshold:.12});
reveals.forEach(el => revealObserver.observe(el));

const navLinks = [...document.querySelectorAll('.desktop-nav a')];
const sections = document.querySelectorAll('[data-section]');
const sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
}), {rootMargin:'-35% 0px -55% 0px'});
sections.forEach(section => sectionObserver.observe(section));

const heroSystem = document.querySelector('[data-hero-system]');
if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  heroSystem.addEventListener('pointermove', e => {
    const r = heroSystem.getBoundingClientRect(); const x = (e.clientX-r.left)/r.width-.5; const y = (e.clientY-r.top)/r.height-.5;
    heroSystem.style.transform = `perspective(900px) rotateX(${-y*4}deg) rotateY(${x*4}deg) translate3d(${x*5}px,${y*5}px,0)`;
  });
  heroSystem.addEventListener('pointerleave', () => heroSystem.style.transform = '');
}

const filters = document.querySelectorAll('.filter');
const projects = document.querySelectorAll('.project-row');
const emptyFilter = document.querySelector('.empty-filter');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(b => { b.classList.toggle('active', b===button); b.setAttribute('aria-pressed', String(b===button)); });
  let count=0; const value=button.dataset.filter;
  projects.forEach(project => { const show=value==='all'||project.dataset.categories.split(' ').includes(value); project.hidden=!show; if(show) count++; });
  emptyFilter.hidden = count !== 0;
}));

const scenarios = {
  credential:{id:'ACDS-024',title:'SSH authentication spray',severity:'HIGH',mitre:'T1110',events:[['09:42','Signal received','Authentication failures exceed demo threshold.'],['09:43','Scope checked','Analyst access resolved against environment.'],['09:44','Incident opened','Awaiting an authorized response.']]},
  lateral:{id:'ACDS-031',title:'Lateral movement sequence',severity:'CRITICAL',mitre:'T1021',events:[['10:16','Remote service use','Unexpected connection path observed.'],['10:17','Host correlated','Demo signals joined across two subnets.'],['10:19','Incident escalated','Higher-risk response requires approval.']]},
  exfil:{id:'ACDS-046',title:'Outbound transfer anomaly',severity:'HIGH',mitre:'T1041',events:[['11:03','Volume anomaly','Outbound pattern differs from demo baseline.'],['11:04','Destination tagged','Indicator added to investigation context.'],['11:07','Review requested','Analyst confirmation is pending.']]}
};
document.querySelectorAll('.scenario').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.scenario').forEach(b=>b.classList.toggle('active',b===button));
  const s=scenarios[button.dataset.scenario];
  document.querySelector('#incident-id').textContent=s.id; document.querySelector('#incident-title').textContent=s.title;
  document.querySelector('#incident-severity').textContent=s.severity; document.querySelector('#incident-mitre').textContent=s.mitre;
  document.querySelector('#incident-timeline').innerHTML=s.events.map(e=>`<li><time>${e[0]}</time><span><b>${e[1]}</b>${e[2]}</span></li>`).join('');
  document.querySelector('#response-feedback').textContent='No action has been executed. This is an isolated portfolio demonstration.';
}));
document.querySelector('#preview-response').addEventListener('click', () => {
  const select=document.querySelector('#response-action'); const approval=select.value==='isolate';
  document.querySelector('#response-feedback').textContent=approval?'Preview: this higher-risk action would be sent for administrator approval.':'Preview: this low-risk action would be authorized, executed, and added to the audit record.';
});

const capabilities={
  perception:{i:'01 / 06',title:'Perception',purpose:'Transforms sensor observations into a structured understanding of the operating environment.',inputs:'Sensor observations',outputs:'Environment representation',connects:'Reasoning, prediction'},
  reasoning:{i:'02 / 06',title:'Reasoning',purpose:'Evaluates current context and candidate decisions against mission intent and constraints.',inputs:'Environment representation, goals',outputs:'Decision candidates',connects:'Autonomy, control'},
  autonomy:{i:'03 / 06',title:'Autonomy',purpose:'Coordinates task execution while preserving explicit operational boundaries.',inputs:'Plans, state, constraints',outputs:'Task progression',connects:'Control, collaboration'},
  collaboration:{i:'04 / 06',title:'Collaboration',purpose:'Frames how multiple platforms could exchange intent, state, and task information.',inputs:'Peer state, shared objectives',outputs:'Coordinated task model',connects:'Reasoning, autonomy'},
  prediction:{i:'05 / 06',title:'Prediction',purpose:'Anticipates possible state changes to support earlier, more informed decisions.',inputs:'Current and historical state',outputs:'Forecast states',connects:'Perception, reasoning'},
  control:{i:'06 / 06',title:'Control',purpose:'Translates authorized decisions into bounded platform commands and feedback loops.',inputs:'Approved action, platform state',outputs:'Control intent',connects:'Autonomy, perception'}
};
document.querySelectorAll('.arch-node').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.arch-node').forEach(b=>b.classList.toggle('active',b===button)); const c=capabilities[button.dataset.capability];
  document.querySelector('#arch-index').textContent=c.i; document.querySelector('#arch-title').textContent=c.title; document.querySelector('#arch-purpose').textContent=c.purpose;
  document.querySelector('#arch-inputs').textContent=c.inputs; document.querySelector('#arch-outputs').textContent=c.outputs; document.querySelector('#arch-connects').textContent=c.connects;
}));

document.querySelector('.copy-handle').addEventListener('click', async e => {
  const status=document.querySelector('.copy-status');
  try { await navigator.clipboard.writeText(e.currentTarget.dataset.copy); status.textContent='GitHub handle copied.'; }
  catch { status.textContent='Copy unavailable — the handle is M-alasmary.'; }
});

if (location.hash) setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 80);
