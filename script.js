/* ============ EDIT ME: ALL PLACEHOLDER CONTENT LIVES HERE ============ */
const CONFIG = {
  // Paste your Google Apps Script Web App URL here (see README). Until then, RSVPs CANNOT be saved.
  APPS_SCRIPT_URL: 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE',

  // Background music: paste any YouTube link between the quotes (leave '' for no music).
  // Example: 'https://www.youtube.com/watch?v=XXXXXXXXXXX'. Music starts on the guest's first tap; a 🔊 button mutes it.
  MUSIC_YOUTUBE_URL: '',
  MUSIC_VOLUME: 40, // 0-100

  // Bitmoji images live in assets/. 'height' scales a host relative to the other (1 = same height).
  // Intro text is shown exactly as written (line breaks kept).
  hosts: [
    { name: 'Devansh', image: 'devansh.png', height: 1,
      intro: `Namaste sabhi ko! 🙌 I'm Devansh, your favourite Diwali party host! I absolutely love hosting house parties, and don't worry, drinks are my department! A responsible drinker and officially in charge of your drinks. Not the most photogenic person, but definitely the one who'll be bombing all your pictures! Also, I'm the guy who makes sure everyone arrives as early as possible and leaves as late as possible.` },
    { name: 'Breezer', image: 'breezer.png', height: 0.27, pet: true,
      intro: `Hey hoomans! 🐾 I’m Breezer, your self-appointed security guard. Swagat toh main hi karunga aapka, phir chahe aap mujhse darte ho ya nahi. No excuses, everyone gets a personal welcome! DJing isn’t really my scene. Loud music can scare me a little but force karoge toh thoda dance bhi kar lunga also Breezer mera naam hai, but I’m strictly from the Chakna Party. Toh sharing is caring, yaad rakhnaaa…` },
    { name: 'Ishika', image: 'ishika.png', height: 0.96,
      intro: `Namaste ji🙏🏼, I’m Ishika, your other half of the Diwali party management team! Decor aur food meri zimmedari hai. But you can also reach out to me for three very important things: chatpate gaane, chatpati gossip aur chatpate dance moves. Teeno departments mein I’m always available.

Main thodi ‘apni favourite hoon’ jaisi insaan hoon. Toh thoda bahut judge bhi kar leti hoon. I know, buri aadat hai, isiliye pehle se hi maafi maang leti hoon. Thoda seh lena, guys. 😘

BUT, tumhe saath dena ho toh, it’ll just be sone pe suhaga.` }
  ]
};
/* ===================================================================== */

const $ = s => document.querySelector(s);
const wait = ms => new Promise(r => setTimeout(r, ms));
const PREVIEW = location.search.includes('preview'); // ?preview lets you click through without a backend (nothing is saved)
const STORE = 'diwaliRsvp.v1';

/* ---------- Screens ---------- */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
  document.querySelectorAll(`#${id} .reveal`).forEach(el => io.observe(el));
}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });

/* ---------- Art ---------- */
function diya() {
  return `<svg class="diya" viewBox="0 0 60 56"><path class="flame" d="M30 26C21 15 28 9 30 0c2 9 9 15 0 26z" fill="#ffb347"/><path d="M4 26q26 34 52 0z" fill="#e2b84a"/><path d="M4 26h52" stroke="#b8862b" stroke-width="3"/></svg>`;
}
function fillDiyas() { ['#heroDiyas', '#finalDiyas', '#doorDiyas'].forEach(s => $(s).innerHTML = diya().repeat(s === '#doorDiyas' ? 5 : 3)); }

// Original Bitmoji image. If assets/<file> is missing it falls back to <file> in the site root.
function character(h) {
  const alt = h.image.split('/').pop();
  return `<img src="${h.image}" alt="${h.name}" onerror="this.onerror=null;this.src='${alt}'">`;
}

/* ---------- Particles, fireworks & sparkles ---------- */
const cv = $('#fx'), cx = cv.getContext('2d'); let W, H; const P = [], R = [];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HUES = [42, 38, 30, 20, 48, 340, 320, 12];   // golds & oranges with a few pinks/reds
const rnd = (a, b) => a + Math.random() * (b - a);
function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
addEventListener('resize', size); size();
function sparks(x, y, n, speed, h, life) {
  for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), s = rnd(.3, 1) * speed;
    P.push({ x, y, px: x, py: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rnd(1, 2.2), a: 1, d: rnd(.011, .018) * (life || 1), h: h + rnd(-8, 8), fw: 1 }); }
}
function rocket() { R.push({ x: rnd(W * .12, W * .88), y: H + 10, vx: rnd(-.5, .5), vy: -rnd(9, 11), ty: rnd(H * .15, H * .45) }); }
function fireworks(n) { if (reduce) return; for (let i = 0; i < n; i++) setTimeout(() => { if (P.length < 900) rocket(); }, i * 260); }
function burst() {
  if (reduce) return;
  for (let i = 0; i < 100; i++) { const a = Math.random() * 6.283, s = 2 + Math.random() * 7;
    P.push({ x: W / 2, y: H / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, r: 1.5 + Math.random() * 3, a: 1, b: 1, h: 38 + Math.random() * 14 }); }
  fireworks(4);
}
// tap = little cracker; mouse movement = sparkler trail
addEventListener('pointerdown', e => { if (!reduce) sparks(e.clientX, e.clientY, 16, 3.2, rnd(36, 48), .8); });
let lastT = 0;
addEventListener('pointermove', e => { if (reduce || e.pointerType !== 'mouse' || e.timeStamp - lastT < 45) return; lastT = e.timeStamp; sparks(e.clientX, e.clientY, 2, 1.1, rnd(36, 48), 1.8); });
if (!reduce) setInterval(() => { if (!document.hidden && P.length < 500) rocket(); }, 4200);
(function loop() {
  cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = 'rgba(0,0,0,.28)'; cx.fillRect(0, 0, W, H);
  cx.globalCompositeOperation = 'lighter';
  if (!reduce && P.filter(p => !p.b && !p.fw && p.vy < 0).length < 35 && Math.random() < .15)
    P.push({ x: Math.random() * W, y: H + 8, vx: (Math.random() - .5) * .4, vy: -.4 - Math.random() * .7, r: 1 + Math.random() * 2.2, a: .2 + Math.random() * .5, h: 28 + Math.random() * 20 });
  for (let i = R.length - 1; i >= 0; i--) { const r = R[i];
    r.x += r.vx; r.y += r.vy; r.vy *= .985;
    cx.globalAlpha = 1; cx.fillStyle = '#ffd98a'; cx.beginPath(); cx.arc(r.x, r.y, 2.2, 0, 6.283); cx.fill();
    if (r.y <= r.ty || r.vy > -1.5) { const h = HUES[(Math.random() * HUES.length) | 0]; sparks(r.x, r.y, 60 + (Math.random() * 25 | 0), rnd(3.2, 5.2), h, 1); sparks(r.x, r.y, 22, 1.8, h + 22, 1.3); R.splice(i, 1); } }
  for (let i = P.length - 1; i >= 0; i--) { const p = P[i];
    if (p.fw) { p.px = p.x; p.py = p.y; p.x += p.vx; p.y += p.vy; p.vy += .045; p.vx *= .985; p.vy *= .985; p.a -= p.d; }
    else { p.x += p.vx; p.y += p.vy; if (p.b) { p.vy += .09; p.vx *= .985; p.a -= .011; } }
    if (p.a <= 0 || p.y < -10) { P.splice(i, 1); continue; }
    cx.globalAlpha = Math.min(1, p.a);
    if (p.fw) { cx.strokeStyle = `hsl(${p.h},100%,65%)`; cx.lineWidth = p.r; cx.beginPath(); cx.moveTo(p.px, p.py); cx.lineTo(p.x, p.y); cx.stroke(); }
    else { cx.fillStyle = `hsl(${p.h},95%,62%)`; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill(); } }
  requestAnimationFrame(loop);
})();

/* ---------- Festive decor: string lights + twinkling stars ---------- */
(function decor() {
  const n = Math.max(10, Math.round(innerWidth / 34));
  $('#lights').innerHTML = Array.from({ length: n }, (_, i) =>
    `<i style="left:${(i + .5) / n * 100}%;top:${Math.abs(Math.sin(i / n * Math.PI * 3)) * 9}px;--c:hsl(${HUES[i % HUES.length]},95%,60%);--d:${(i % 5) * .35}s"></i>`).join('');
  $('#stars').innerHTML = Array.from({ length: 26 }, () =>
    `<b style="left:${rnd(2, 98)}%;top:${rnd(6, 96)}%;font-size:${rnd(7, 15)}px;animation-delay:${rnd(0, 3)}s">✦</b>`).join('');
})();

/* ---------- Screen 1: hosts ---------- */
function renderHosts() {
  const figs = CONFIG.hosts.map((h, i) =>
    `<button class="host${h.pet ? ' pet' : ''}" data-i="${i}" style="--k:${h.height || 1}" aria-label="Meet ${h.name}">${character(h)}</button>`).join('');
  const names = CONFIG.hosts.map((h, i) =>
    `<button class="host-name" data-i="${i}" aria-label="Meet ${h.name}">${h.name}</button>`).join('');
  $('#hostGrid').innerHTML = `<div class="figs">${figs}</div><div class="names">${names}</div>`;
  document.querySelectorAll('#hostGrid [data-i]').forEach(b => b.onclick = () => openHost(+b.dataset.i));
}
function openHost(i) {
  const h = CONFIG.hosts[i];
  $('#detailAvatar').innerHTML = character(h);
  $('#detailName').textContent = h.name; $('#detailIntro').textContent = h.intro;
  $('#hostPick').hidden = true; $('#hostDetail').hidden = false; window.scrollTo(0, 0);
}
$('#backBtn').onclick = () => { $('#hostDetail').hidden = true; $('#hostPick').hidden = false; window.scrollTo(0, 0); };

/* ---------- Screen 2: invitation + door transition ---------- */
async function enterInvite() {
  const d = $('#doors'); d.className = 'on'; await wait(40);
  d.classList.add('closed'); await wait(1000);
  d.classList.add('lit'); await wait(1300);
  show('invite'); d.classList.add('open'); burst(); setTimeout(burst, 1100); await wait(1300);
  d.className = '';
}
$('#skipBtn').onclick = enterInvite;
$('#toRsvp').onclick = () => show('rsvp');
$('#rsvpBack').onclick = () => show('invite');

/* ---------- Screen 3: RSVP ---------- */
const form = $('#rsvpForm'); let attending = null, busy = false;
const saved = () => { try { return JSON.parse(localStorage.getItem(STORE)); } catch { return null; } };
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(16).slice(2));
let submissionId = (saved() || {}).id || uid();

let choiceText = '';
function choose(yes, btn) {
  attending = yes; form.hidden = false; choiceText = btn.dataset.resp || "Sorry, can't make it";
  document.querySelectorAll('.choice').forEach(b => b.setAttribute('aria-pressed', b === btn));
  document.querySelector('.yesOnly').hidden = !yes; document.querySelector('.noOnly').hidden = yes;
  clearErrors(); $('#formBanner').hidden = true;
}
document.querySelectorAll('.choice').forEach(b => b.onclick = () => choose(!b.classList.contains('no'), b));

function initRsvpState() {
  const s = saved();
  if (s && !PREVIEW) {
    $('#dupNotice').hidden = false; $('#rsvpBody').hidden = true;
    $('#dupText').textContent = `You've already responded as ${s.name} (${s.attending ? 'attending' : 'not attending'}).`;
  }
}
$('#updateBtn').onclick = () => { $('#dupNotice').hidden = true; $('#rsvpBody').hidden = false; };

function setErr(k, m) { const el = document.querySelector(`.err[data-for="${k}"]`); if (el) { el.textContent = m; el.closest('.field').classList.add('bad'); } }
function clearErrors() { document.querySelectorAll('.err').forEach(e => { e.textContent = ''; e.closest('.field').classList.remove('bad'); }); }

function validate() {
  clearErrors(); let ok = true; const bad = (k, m) => { setErr(k, m); ok = false; };
  const name = form.name.value.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || !/\p{L}/u.test(name)) bad('name', 'Enter your full name.');
  if (attending) {
    if (!form.team.value) bad('team', 'Pick a team.');
    if (!form.drinking.value) bad('drinking', 'Select a drinking preference.');
  }
  return ok;
}

async function send(p) {
  const url = CONFIG.APPS_SCRIPT_URL;
  if (url.startsWith('PASTE_')) {
    if (PREVIEW) return;
    throw new Error('RSVP saving is not set up yet: the Google Apps Script URL has not been added.');
  }
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 20000);
  try {
    // text/plain avoids a CORS preflight, which Apps Script does not support.
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p), signal: ctl.signal });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'The server rejected the RSVP.');
  } catch (e) {
    throw new Error(e.name === 'AbortError' ? 'The request timed out. Check your connection and try again.' : e.message || 'Could not reach the server.');
  } finally { clearTimeout(t); }
}

form.onsubmit = async ev => {
  ev.preventDefault(); if (busy || attending === null || !validate()) return;
  const name = form.name.value.trim().replace(/\s+/g, ' ');
  const payload = attending
    ? { id: submissionId, name, attending: 'Yes', response: choiceText, team: form.team.value, drinking: form.drinking.value, comments: form.comments.value.trim(), submittedAt: new Date().toISOString() }
    : { id: submissionId, name, attending: 'No', response: choiceText, team: '', drinking: '', comments: form.message.value.trim(), submittedAt: new Date().toISOString() };
  busy = true; $('#submitBtn').disabled = true; $('#submitBtn').textContent = 'SENDING…'; $('#formBanner').hidden = true;
  try {
    await send(payload);               // success is shown ONLY after the backend confirms
    if (!PREVIEW) localStorage.setItem(STORE, JSON.stringify({ id: submissionId, name, attending }));
    finish(name, attending); 
  } catch (e) {
    $('#formBanner').textContent = `Your RSVP was not sent. ${e.message}`; $('#formBanner').hidden = false;
  } finally { busy = false; $('#submitBtn').disabled = false; $('#submitBtn').textContent = 'SEND MY RSVP'; }
};

/* ---------- Screens 4 & 5 ---------- */
function finish(name, yes) {
  $('#previewNote').hidden = !(PREVIEW && CONFIG.APPS_SCRIPT_URL.startsWith('PASTE_'));
  if (yes) {
    $('#finalHead').textContent = `Thank you, ${name}!`;
    $('#finalText').textContent = "You're officially on the guest list. See you at the Diwali party!";
    finalFrom = 'mission'; burst(); show('mission');
  } else {
    $('#finalHead').textContent = `We'll miss you, ${name}`;
    $('#finalText').textContent = 'Thank you for letting us know. Wishing you a bright, sweet and joyful Diwali. Save us some mithai!';
    finalFrom = 'rsvp'; show('final');
  }
}
$('#envelope').onclick = function () {
  this.classList.remove('shake'); void this.offsetWidth; this.classList.add('shake'); burst();
  $('#missionHint').textContent = 'Sealed until the party. Your mission will be revealed soon.';
};
$('#toFinal').onclick = () => show('final');
/* ---------- Back buttons ---------- */
let finalFrom = 'rsvp';
$('#inviteBack').onclick = () => { $('#hostDetail').hidden = true; $('#hostPick').hidden = false; show('hosts'); };
$('#missionBack').onclick = () => show('rsvp');
$('#finalBack').onclick = () => show(finalFrom);
$('#viewAgain').onclick = () => show('invite');

/* ---------- Background music (YouTube) ---------- */
(function () {
  const m = (CONFIG.MUSIC_YOUTUBE_URL || '').match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  const btn = $('#musicBtn'); if (!m) return;            // no link set: no music, no button
  const id = m[1]; let yt = null, ready = false, on = false, want = false;
  btn.hidden = false;
  const paint = () => { btn.textContent = on ? '🔊' : '🔇'; btn.setAttribute('aria-pressed', on); };
  const play = () => { if (ready) { yt.setVolume(CONFIG.MUSIC_VOLUME); yt.playVideo(); on = true; paint(); } };
  const pause = () => { if (ready) yt.pauseVideo(); on = false; paint(); };
  window.onYouTubeIframeAPIReady = () => {
    yt = new YT.Player('ytPlayer', { height: '200', width: '200', videoId: id,
      playerVars: { controls: 0, loop: 1, playlist: id, playsinline: 1, rel: 0 },
      events: { onReady: () => { ready = true; if (want) play(); } } });
  };
  const tag = document.createElement('script'); tag.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(tag);
  // Browsers only allow sound after a tap, so music starts on the guest's first tap anywhere.
  const first = e => { if (e.target.closest('#musicBtn')) return; removeEventListener('pointerdown', first); want = true; play(); };
  addEventListener('pointerdown', first);
  btn.onclick = () => { want = !on; on ? pause() : play(); };
})();

/* ---------- Init ---------- */
fillDiyas(); renderHosts(); initRsvpState();
