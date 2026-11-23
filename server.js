'use strict';
/*
 * Chafafia — serveur de l'application
 * Auteur : Aziz Mernissi
 * Aucune dépendance externe : Node.js 22 (http, sqlite, crypto).
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT) || 3000;
const DATA = process.env.DATA_DIR || path.join(__dirname, 'data');
const PUBLIC = path.join(__dirname, 'public');
const FILES = path.join(DATA, 'files');
const SECURE = process.env.INSECURE_COOKIES !== '1';
const SETUP_CODE = String(process.env.CHAFAFIA_SETUP_CODE || '').trim();
const SESSION_DAYS = 30;
const MAX_JSON = 64 * 1024;
const MAX_FILE = 15 * 1024 * 1024;
const MIME = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'application/pdf': '.pdf' };

fs.mkdirSync(FILES, { recursive: true });
const db = new DatabaseSync(path.join(DATA, 'chafafia.db'));
db.exec(`
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL DEFAULT '',
  delivery TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, role TEXT NOT NULL CHECK (role IN ('admin','member')),
  name TEXT NOT NULL, phone TEXT NOT NULL UNIQUE, pass TEXT NOT NULL,
  project_id INTEGER REFERENCES projects(id), lot TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0, mre INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS tranches (
  id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id),
  label TEXT NOT NULL, percent REAL NOT NULL, due_date TEXT NOT NULL DEFAULT '', position INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), amount INTEGER NOT NULL,
  paid_on TEXT NOT NULL, mode TEXT NOT NULL, note TEXT NOT NULL DEFAULT '',
  receipt_no TEXT NOT NULL UNIQUE, created_by INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, mime TEXT NOT NULL, path TEXT NOT NULL,
  size INTEGER NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id), label TEXT NOT NULL,
  amount INTEGER NOT NULL, spent_on TEXT NOT NULL, file_id INTEGER REFERENCES files(id));
CREATE TABLE IF NOT EXISTS phases (
  id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id), label TEXT NOT NULL,
  percent INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id),
  file_id INTEGER NOT NULL REFERENCES files(id), caption TEXT NOT NULL DEFAULT '', taken_on TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id), title TEXT NOT NULL,
  file_id INTEGER NOT NULL REFERENCES files(id), doc_date TEXT NOT NULL DEFAULT '');
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id), body TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS waitlist (
  id INTEGER PRIMARY KEY, project_id INTEGER NOT NULL REFERENCES projects(id), name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY, user_id INTEGER, action TEXT NOT NULL, detail TEXT NOT NULL DEFAULT '', at TEXT NOT NULL);
`);

/* ---------- outils ---------- */
const all = (sql, ...p) => db.prepare(sql).all(...p);
const get = (sql, ...p) => db.prepare(sql).get(...p);
const run = (sql, ...p) => db.prepare(sql).run(...p);
const now = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0, 10);
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const setting = (k, d = '') => { const r = get('SELECT value FROM settings WHERE key = ?', k); return r ? r.value : d; };
const setSetting = (k, v) => run('INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', k, String(v));
const log = (user, action, detail = '') => run('INSERT INTO audit(user_id, action, detail, at) VALUES(?, ?, ?, ?)', user ? user.id : null, action, String(detail).slice(0, 500), now());

class HttpError extends Error { constructor(status, code) { super(code); this.status = status; this.code = code; } }
const bad = () => { throw new HttpError(400, 'invalid'); };
const Str = (v, max = 200, min = 1) => { if (typeof v !== 'string') bad(); v = v.trim(); if (v.length < min || v.length > max) bad(); return v; };
const Int = (v, min = 0, max = 1e11) => { v = Number(v); if (!Number.isInteger(v) || v < min || v > max) bad(); return v; };
const Num = (v, min, max) => { v = Number(v); if (!Number.isFinite(v) || v < min || v > max) bad(); return v; };
const Dat = (v, optional = false) => {
  if (optional && (v === '' || v == null)) return '';
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) bad();
  return v;
};
const phoneNorm = v => {
  let d = String(v == null ? '' : v).replace(/\D/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 10 && d.startsWith('0')) d = '212' + d.slice(1);
  if (d.length < 8 || d.length > 15) bad();
  return d;
};
const hashPass = p => { const salt = crypto.randomBytes(16).toString('hex'); return salt + ':' + crypto.scryptSync(p, salt, 32).toString('hex'); };
const checkPass = (p, stored) => {
  const [salt, h] = String(stored).split(':');
  if (!salt || !h) return false;
  const a = Buffer.from(h, 'hex'), b = crypto.scryptSync(String(p), salt, 32);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
const tempPass = () => { const abc = 'abcdefghjkmnpqrstuvwxyz23456789'; let s = ''; for (const b of crypto.randomBytes(8)) s += abc[b % abc.length]; return s; };
const escHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fdate = d => (/^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4) : d);
const fmoney = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

function json(res, status, obj, extra = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
  res.end(JSON.stringify(obj));
}
function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0, done = false;
    req.on('data', c => {
      if (done) return;
      n += c.length;
      if (n > limit) { done = true; reject(new HttpError(413, 'too_large')); req.resume(); return; }
      chunks.push(c);
    });
    req.on('end', () => { if (!done) resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}
async function readJson(req) {
  const buf = await readBody(req, MAX_JSON);
  try { const o = JSON.parse(buf.toString('utf8') || '{}'); if (!o || typeof o !== 'object' || Array.isArray(o)) bad(); return o; }
  catch (e) { if (e instanceof HttpError) throw e; bad(); }
}

/* ---------- sessions ---------- */
function auth(req) {
  const m = /(?:^|;\s*)sid=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '');
  if (!m) return null;
  const u = get('SELECT u.*, s.expires AS expires FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?', sha(m[1]));
  if (!u || u.expires < Date.now()) return null;
  return u;
}
function cookie(token, maxAge) {
  return `sid=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${SECURE ? '; Secure' : ''}`;
}
function openSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  run('DELETE FROM sessions WHERE expires < ?', Date.now());
  run('INSERT INTO sessions(token, user_id, expires) VALUES(?, ?, ?)', sha(token), user.id, Date.now() + SESSION_DAYS * 864e5);
  return cookie(token, SESSION_DAYS * 86400);
}
const attempts = new Map();
function throttle(key, max) {
  const t = Date.now(), a = attempts.get(key);
  if (attempts.size > 5000) for (const [k, v] of attempts) if (v.reset < t) attempts.delete(k);
  if (!a || a.reset < t) { attempts.set(key, { n: 1, reset: t + 15 * 60e3 }); return; }
  if (++a.n > max) throw new HttpError(429, 'too_many');
}
const needUser = u => { if (!u) throw new HttpError(401, 'login'); return u; };
const needAdmin = u => { needUser(u); if (u.role !== 'admin') throw new HttpError(403, 'forbidden'); return u; };
const publicUser = u => ({ id: u.id, role: u.role, name: u.name, phone: u.phone, lot: u.lot, price: u.price, mre: u.mre, project_id: u.project_id });

/* ---------- calculs ---------- */
function finance(member, tranches, paid, day) {
  let rem = paid, due = 0, firstLate = '', nextSet = false;
  const schedule = tranches.map(t => {
    const amount = Math.round(member.price * t.percent / 100);
    const p = Math.min(amount, rem); rem -= p;
    const isDue = t.due_date !== '' && t.due_date <= day;
    if (isDue) due += amount;
    let status = p >= amount ? 'paid' : (isDue ? 'late' : 'todo');
    if (status === 'late' && !firstLate) firstLate = t.due_date;
    if (status === 'todo' && !nextSet) { status = 'due'; nextSet = true; }
    return { id: t.id, label: t.label, amount, paid: p, due_date: t.due_date, status };
  });
  const late = Math.max(0, due - paid);
  const days = late > 0 && firstLate ? Math.max(0, Math.round((Date.parse(day) - Date.parse(firstLate)) / 864e5)) : 0;
  return { schedule, paid, due, late, days };
}
function projectFor(user, url) {
  if (user.role === 'member') return get('SELECT * FROM projects WHERE id = ?', user.project_id);
  const want = url.searchParams.get('project');
  let p = want ? get('SELECT * FROM projects WHERE id = ?', Int(want, 1)) : null;
  if (!p) p = get('SELECT * FROM projects ORDER BY id LIMIT 1');
  return p;
}
function state(user, url) {
  const project = projectFor(user, url);
  if (!project) throw new HttpError(404, 'not_found');
  const pid = project.id, day = today();
  const tranches = all('SELECT id, label, percent, due_date FROM tranches WHERE project_id = ? ORDER BY position, id', pid);
  const phases = all('SELECT id, label, percent FROM phases WHERE project_id = ? ORDER BY position, id', pid);
  const expenses = all('SELECT id, label, amount, spent_on, file_id FROM expenses WHERE project_id = ? ORDER BY spent_on DESC, id DESC', pid);
  const collected = get(`SELECT COALESCE(SUM(p.amount), 0) AS s FROM payments p JOIN users u ON u.id = p.user_id WHERE u.project_id = ?`, pid).s;
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const out = {
    me: publicUser(user),
    amicale: setting('amicale', 'Amicale'),
    project: { id: pid, name: project.name, city: project.city, delivery: project.delivery },
    tranches, phases,
    progress: phases.length ? Math.round(phases.reduce((s, p) => s + p.percent, 0) / phases.length) : 0,
    photos: all('SELECT id, file_id, caption, taken_on FROM photos WHERE project_id = ? ORDER BY taken_on DESC, id DESC', pid),
    documents: all('SELECT id, title, file_id, doc_date FROM documents WHERE project_id = ? ORDER BY id DESC', pid),
    news: all('SELECT id, body, created_at FROM news WHERE project_id = ? ORDER BY id DESC LIMIT 30', pid),
    expenses,
    accounts: { collected, spent, cash: collected - spent }
  };
  if (user.role === 'member') {
    const paid = get('SELECT COALESCE(SUM(amount), 0) AS s FROM payments WHERE user_id = ?', user.id).s;
    out.mine = finance(user, tranches, paid, day);
    out.mine.payments = all('SELECT id, amount, paid_on, mode, receipt_no FROM payments WHERE user_id = ? ORDER BY paid_on DESC, id DESC', user.id);
    out.projects = [out.project];
    return out;
  }
  const paidBy = new Map(all(`SELECT p.user_id AS id, SUM(p.amount) AS s FROM payments p JOIN users u ON u.id = p.user_id WHERE u.project_id = ? GROUP BY p.user_id`, pid).map(r => [r.id, r.s]));
  let expected = 0, lateCount = 0, lateAmount = 0;
  out.members = all(`SELECT id, name, phone, lot, price, mre FROM users WHERE role = 'member' AND project_id = ? ORDER BY name COLLATE NOCASE`, pid).map(m => {
    const f = finance(m, tranches, paidBy.get(m.id) || 0, day);
    expected += f.due; if (f.late > 0) { lateCount++; lateAmount += f.late; }
    return { ...m, paid: f.paid, due: f.due, late: f.late, days: f.days };
  });
  out.stats = { expected, lateCount, lateAmount, rate: expected > 0 ? Math.min(100, Math.round(collected / expected * 100)) : 100 };
  out.waitlist = all('SELECT id, name, phone, created_at FROM waitlist WHERE project_id = ? ORDER BY id', pid);
  out.projects = all('SELECT id, name FROM projects ORDER BY id');
  out.percentTotal = Math.round(tranches.reduce((s, t) => s + t.percent, 0) * 100) / 100;
  return out;
}
function newProject(name, city, delivery) {
  const id = Number(run('INSERT INTO projects(name, city, delivery, created_at) VALUES(?, ?, ?, ?)', name, city, delivery, now()).lastInsertRowid);
  [['Réservation', 10], ['Tranche 1 — Terrain', 20], ['Tranche 2 — Fondations', 20], ['Tranche 3 — Gros œuvre', 20], ['Tranche 4 — Second œuvre', 15], ['Solde — Remise des clés', 15]]
    .forEach(([l, p], i) => run('INSERT INTO tranches(project_id, label, percent, position) VALUES(?, ?, ?, ?)', id, l, p, i));
  ['Terrain et titre foncier', 'Autorisation de construire', 'Terrassement et fondations', 'Gros œuvre', 'Second œuvre', 'Finitions et livraison']
    .forEach((l, i) => run('INSERT INTO phases(project_id, label, percent, position) VALUES(?, ?, 0, ?)', id, l, i));
  return id;
}
const projectId = v => { const id = Int(v, 1); if (!get('SELECT id FROM projects WHERE id = ?', id)) throw new HttpError(404, 'not_found'); return id; };
const fileId = (v, optional) => {
  if (optional && (v === '' || v == null)) return null;
  const id = Int(v, 1); if (!get('SELECT id FROM files WHERE id = ?', id)) bad(); return id;
};
function dropFile(id) {
  if (!id) return;
  const f = get('SELECT path FROM files WHERE id = ?', id);
  if (!f) return;
  run('DELETE FROM files WHERE id = ?', id);
  fs.rm(path.join(FILES, f.path), { force: true }, () => {});
}

/* ---------- fichiers statiques ---------- */
const STATIC = {
  '/': ['index.html', 'text/html; charset=utf-8'], '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/app.css': ['app.css', 'text/css; charset=utf-8'], '/demo': ['demo.html', 'text/html; charset=utf-8']
};
const CSP_APP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; frame-ancestors 'none'; base-uri 'none'; form-action 'self'";
const CSP_DEMO = CSP_APP.replace("script-src 'self'", "script-src 'unsafe-inline'");
function baseHeaders(csp) {
  return { 'Content-Security-Policy': csp, 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', 'X-Frame-Options': 'DENY' };
}
function serveStatic(p, res) {
  const s = STATIC[p];
  if (!s) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Page introuvable'); }
  fs.readFile(path.join(PUBLIC, s[0]), (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Page introuvable'); }
    res.writeHead(200, { 'Content-Type': s[1], 'Cache-Control': 'no-cache', ...baseHeaders(p === '/demo' ? CSP_DEMO : CSP_APP) });
    res.end(buf);
  });
}

/* ---------- reçu imprimable ---------- */
function receiptPage(pay) {
  const amicale = escHtml(setting('amicale', 'Amicale'));
  const row = (a, b) => `<tr><th>${a}</th><td>${escHtml(b)}</td></tr>`;
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reçu ${escHtml(pay.receipt_no)}</title><meta name="author" content="Aziz Mernissi">
<style>body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#12261f;background:#f4efe6;margin:0;padding:24px}
.r{max-width:640px;margin:0 auto;background:#fff;border:1px solid #e4dccd;border-radius:14px;padding:32px}
h1{font-size:22px;margin:0 0 4px}.s{color:#5d6e66;margin:0 0 22px}.no{float:right;text-align:right;font-weight:700}
table{width:100%;border-collapse:collapse;margin:8px 0 22px}th,td{padding:11px 8px;border-bottom:1px solid #e4dccd;text-align:left;font-size:15px}
th{color:#5d6e66;font-weight:500;width:42%}.amt td{font-size:20px;font-weight:700;color:#0f6b4f}
.sig{display:flex;justify-content:space-between;margin-top:46px;color:#5d6e66;font-size:14px}.sig div{border-top:1px solid #12261f;padding-top:6px;width:42%}
button{background:#0f6b4f;color:#fff;border:0;border-radius:10px;padding:12px 18px;font:inherit;font-weight:700;cursor:pointer}
.f{font-size:12px;color:#5d6e66;margin-top:26px}@media print{body{background:#fff;padding:0}.r{border:0}.np{display:none}}</style></head><body>
<div class="r"><div class="no">N° ${escHtml(pay.receipt_no)}<br><span dir="rtl">وصل الأداء</span></div>
<h1>Reçu de paiement</h1><p class="s">${amicale} · ${escHtml(pay.project)}</p>
<table>${row('Adhérent', pay.name)}${row('Lot', pay.lot || '—')}${row('Date du paiement', fdate(pay.paid_on))}${row('Mode de paiement', pay.mode)}${pay.note ? row('Observation', pay.note) : ''}
<tr class="amt"><th>Montant reçu</th><td>${fmoney(pay.amount)} DH</td></tr></table>
<div class="sig"><div>Signature du trésorier</div><div>Cachet de l'amicale</div></div>
<p class="f">Reçu enregistré le ${fdate(pay.created_at)} · Chafafia</p>
<p class="np" style="margin-top:22px"><button onclick="window.print()">Imprimer ou enregistrer en PDF</button></p></div></body></html>`;
}

/* ---------- routes ---------- */
async function handle(req, res) {
  const url = new URL(req.url, 'http://local');
  const p = url.pathname, m = req.method;
  let x;

  if (m === 'GET' && p === '/api/health') return json(res, 200, { ok: true });
  if (m === 'GET' && !p.startsWith('/api/') && !p.startsWith('/files/') && !p.startsWith('/receipt/')) return serveStatic(p, res);
  if (m !== 'GET' && req.headers['x-chafafia'] !== '1') throw new HttpError(403, 'forbidden');

  const user = auth(req);
  const hasAdmin = () => !!get("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

  /* --- accès --- */
  if (m === 'GET' && p === '/api/me') {
    if (!hasAdmin()) return json(res, 200, { setup: true, code: !!SETUP_CODE });
    return json(res, 200, { user: user ? publicUser(user) : null });
  }
  if (m === 'POST' && p === '/api/setup') {
    if (hasAdmin()) throw new HttpError(403, 'forbidden');
    throttle('setup:' + ip, 10);
    const b = await readJson(req);
    if (SETUP_CODE && String(b.code || '').trim() !== SETUP_CODE) throw new HttpError(403, 'bad_code');
    const amicale = Str(b.amicale, 120), name = Str(b.name, 120), phone = phoneNorm(b.phone), pass = Str(b.password, 200, 8);
    const project = Str(b.project, 120), city = Str(b.city || '', 80, 0);
    db.exec('BEGIN IMMEDIATE');
    try {
      setSetting('amicale', amicale);
      newProject(project, city, '');
      const id = Number(run("INSERT INTO users(role, name, phone, pass, created_at) VALUES('admin', ?, ?, ?, ?)", name, phone, hashPass(pass), now()).lastInsertRowid);
      db.exec('COMMIT');
      log({ id }, 'setup', amicale);
      return json(res, 200, { ok: true }, { 'Set-Cookie': openSession({ id }) });
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  if (m === 'POST' && p === '/api/login') {
    throttle('ip:' + ip, 40);
    const b = await readJson(req);
    let phone; try { phone = phoneNorm(b.phone); } catch { throw new HttpError(401, 'bad_login'); }
    throttle('ph:' + phone, 10);
    const u = get('SELECT * FROM users WHERE phone = ?', phone);
    if (!u || !checkPass(b.password, u.pass)) throw new HttpError(401, 'bad_login');
    log(u, 'login');
    return json(res, 200, { ok: true }, { 'Set-Cookie': openSession(u) });
  }
  if (m === 'POST' && p === '/api/logout') {
    const c = /(?:^|;\s*)sid=([a-f0-9]{64})/.exec(req.headers.cookie || '');
    if (c) run('DELETE FROM sessions WHERE token = ?', sha(c[1]));
    return json(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });
  }
  if (m === 'POST' && p === '/api/password') {
    needUser(user);
    const b = await readJson(req);
    if (!checkPass(b.current, user.pass)) throw new HttpError(400, 'bad_current');
    run('UPDATE users SET pass = ? WHERE id = ?', hashPass(Str(b.password, 200, 8)), user.id);
    log(user, 'password');
    return json(res, 200, { ok: true });
  }
  if (m === 'GET' && p === '/api/state') return json(res, 200, state(needUser(user), url));

  /* --- fichiers et reçus --- */
  if (m === 'POST' && p === '/api/files') {
    needAdmin(user);
    const mime = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    if (!MIME[mime]) throw new HttpError(400, 'bad_file');
    const buf = await readBody(req, MAX_FILE);
    if (!buf.length) bad();
    const name = Str(url.searchParams.get('name') || 'fichier', 150).replace(/[^\p{L}\p{N} ._-]/gu, '_');
    const stored = crypto.randomBytes(16).toString('hex') + MIME[mime];
    fs.writeFileSync(path.join(FILES, stored), buf);
    const id = Number(run('INSERT INTO files(name, mime, path, size, created_at) VALUES(?, ?, ?, ?, ?)', name, mime, stored, buf.length, now()).lastInsertRowid);
    return json(res, 200, { id });
  }
  if (m === 'GET' && (x = /^\/files\/(\d+)$/.exec(p))) {
    needUser(user);
    const f = get('SELECT * FROM files WHERE id = ?', Number(x[1]));
    if (!f) throw new HttpError(404, 'not_found');
    if (user.role !== 'admin') {
      const ok = all(`SELECT project_id FROM expenses WHERE file_id = ?1 UNION SELECT project_id FROM photos WHERE file_id = ?1 UNION SELECT project_id FROM documents WHERE file_id = ?1`, f.id)
        .some(r => r.project_id === user.project_id);
      if (!ok) throw new HttpError(403, 'forbidden');
    }
    const full = path.join(FILES, path.basename(f.path));
    if (!fs.existsSync(full)) throw new HttpError(404, 'not_found');
    res.writeHead(200, {
      'Content-Type': f.mime, 'Content-Length': f.size, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, max-age=3600',
      'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(f.name)}`, 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; object-src 'none'"
    });
    return fs.createReadStream(full).pipe(res);
  }
  if (m === 'GET' && (x = /^\/receipt\/(\d+)$/.exec(p))) {
    needUser(user);
    const pay = get(`SELECT p.*, u.name AS name, u.lot AS lot, u.id AS uid, pr.name AS project FROM payments p
      JOIN users u ON u.id = p.user_id LEFT JOIN projects pr ON pr.id = u.project_id WHERE p.id = ?`, Number(x[1]));
    if (!pay) throw new HttpError(404, 'not_found');
    if (user.role !== 'admin' && pay.uid !== user.id) throw new HttpError(403, 'forbidden');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', ...baseHeaders("default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'") });
    return res.end(receiptPage(pay));
  }

  /* --- tout ce qui suit est réservé au bureau --- */
  if (!p.startsWith('/api/')) throw new HttpError(404, 'not_found');
  needAdmin(user);
  const b = (m === 'POST' || m === 'PUT') ? await readJson(req) : {};
  const ok = (extra = {}) => json(res, 200, { ok: true, ...extra });
  const idOf = re => { const r = re.exec(p); return r ? Number(r[1]) : 0; };

  if (m === 'PUT' && p === '/api/amicale') { setSetting('amicale', Str(b.amicale, 120)); log(user, 'amicale'); return ok(); }

  if (m === 'POST' && p === '/api/projects') {
    db.exec('BEGIN IMMEDIATE');
    try { const id = newProject(Str(b.name, 120), Str(b.city || '', 80, 0), Str(b.delivery || '', 80, 0)); db.exec('COMMIT'); log(user, 'project.new', id); return ok({ id }); }
    catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  if (m === 'PUT' && (x = idOf(/^\/api\/projects\/(\d+)$/))) {
    run('UPDATE projects SET name = ?, city = ?, delivery = ? WHERE id = ?', Str(b.name, 120), Str(b.city || '', 80, 0), Str(b.delivery || '', 80, 0), projectId(x));
    log(user, 'project.edit', x); return ok();
  }

  /* adhérents */
  if (m === 'POST' && p === '/api/members') {
    const phone = phoneNorm(b.phone);
    if (get('SELECT id FROM users WHERE phone = ?', phone)) throw new HttpError(409, 'phone_taken');
    const password = tempPass();
    const id = Number(run(`INSERT INTO users(role, name, phone, pass, project_id, lot, price, mre, created_at) VALUES('member', ?, ?, ?, ?, ?, ?, ?, ?)`,
      Str(b.name, 120), phone, hashPass(password), projectId(b.project_id), Str(b.lot || '', 40, 0), Int(b.price, 0), b.mre ? 1 : 0, now()).lastInsertRowid);
    log(user, 'member.new', id);
    return ok({ id, phone, password });
  }
  if ((x = idOf(/^\/api\/members\/(\d+)(?:\/password)?$/))) {
    const mem = get("SELECT * FROM users WHERE id = ? AND role = 'member'", x);
    if (!mem) throw new HttpError(404, 'not_found');
    if (m === 'POST' && p.endsWith('/password')) {
      const password = tempPass();
      run('UPDATE users SET pass = ? WHERE id = ?', hashPass(password), x);
      run('DELETE FROM sessions WHERE user_id = ?', x);
      log(user, 'member.password', x);
      return ok({ phone: mem.phone, password });
    }
    if (m === 'GET') {
      const tranches = all('SELECT id, label, percent, due_date FROM tranches WHERE project_id = ? ORDER BY position, id', mem.project_id);
      const payments = all('SELECT id, amount, paid_on, mode, note, receipt_no FROM payments WHERE user_id = ? ORDER BY paid_on DESC, id DESC', x);
      const f = finance(mem, tranches, payments.reduce((s, q) => s + q.amount, 0), today());
      return json(res, 200, { member: publicUser(mem), ...f, payments });
    }
    if (m === 'PUT') {
      const phone = phoneNorm(b.phone);
      if (get('SELECT id FROM users WHERE phone = ? AND id <> ?', phone, x)) throw new HttpError(409, 'phone_taken');
      run('UPDATE users SET name = ?, phone = ?, lot = ?, price = ?, mre = ? WHERE id = ?', Str(b.name, 120), phone, Str(b.lot || '', 40, 0), Int(b.price, 0), b.mre ? 1 : 0, x);
      log(user, 'member.edit', x); return ok();
    }
    if (m === 'DELETE') {
      if (get('SELECT id FROM payments WHERE user_id = ? LIMIT 1', x)) throw new HttpError(409, 'has_payments');
      run('DELETE FROM users WHERE id = ?', x);
      log(user, 'member.delete', mem.name); return ok();
    }
  }

  /* paiements */
  if (m === 'POST' && p === '/api/payments') {
    const uid = Int(b.user_id, 1);
    if (!get("SELECT id FROM users WHERE id = ? AND role = 'member'", uid)) throw new HttpError(404, 'not_found');
    const amount = Int(b.amount, 1), paidOn = Dat(b.paid_on), mode = Str(b.mode, 40), note = Str(b.note || '', 200, 0);
    db.exec('BEGIN IMMEDIATE');
    try {
      const year = paidOn.slice(0, 4), key = 'receipt_seq_' + year;
      const n = Number(setting(key, '0')) + 1;
      setSetting(key, n);
      const receiptNo = year + '-' + String(n).padStart(4, '0');
      const id = Number(run('INSERT INTO payments(user_id, amount, paid_on, mode, note, receipt_no, created_by, created_at) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
        uid, amount, paidOn, mode, note, receiptNo, user.id, now()).lastInsertRowid);
      db.exec('COMMIT');
      log(user, 'payment.new', `${receiptNo} ${amount} DH adhérent ${uid}`);
      return ok({ id, receipt_no: receiptNo });
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  if (m === 'DELETE' && (x = idOf(/^\/api\/payments\/(\d+)$/))) {
    const pay = get('SELECT * FROM payments WHERE id = ?', x);
    if (!pay) throw new HttpError(404, 'not_found');
    run('DELETE FROM payments WHERE id = ?', x);
    log(user, 'payment.delete', `${pay.receipt_no} ${pay.amount} DH adhérent ${pay.user_id}`);
    return ok();
  }

  /* tranches et étapes du chantier */
  if (m === 'POST' && p === '/api/tranches') {
    const pid = projectId(b.project_id);
    const pos = get('SELECT COALESCE(MAX(position), -1) + 1 AS n FROM tranches WHERE project_id = ?', pid).n;
    run('INSERT INTO tranches(project_id, label, percent, due_date, position) VALUES(?, ?, ?, ?, ?)', pid, Str(b.label, 120), Num(b.percent, 0, 100), Dat(b.due_date, true), pos);
    log(user, 'tranche.new'); return ok();
  }
  if ((x = idOf(/^\/api\/tranches\/(\d+)$/))) {
    if (m === 'PUT') { run('UPDATE tranches SET label = ?, percent = ?, due_date = ? WHERE id = ?', Str(b.label, 120), Num(b.percent, 0, 100), Dat(b.due_date, true), x); log(user, 'tranche.edit', x); return ok(); }
    if (m === 'DELETE') { run('DELETE FROM tranches WHERE id = ?', x); log(user, 'tranche.delete', x); return ok(); }
  }
  if (m === 'POST' && p === '/api/phases') {
    const pid = projectId(b.project_id);
    const pos = get('SELECT COALESCE(MAX(position), -1) + 1 AS n FROM phases WHERE project_id = ?', pid).n;
    run('INSERT INTO phases(project_id, label, percent, position) VALUES(?, ?, ?, ?)', pid, Str(b.label, 120), Int(b.percent, 0, 100), pos);
    return ok();
  }
  if ((x = idOf(/^\/api\/phases\/(\d+)$/))) {
    if (m === 'PUT') { run('UPDATE phases SET label = ?, percent = ? WHERE id = ?', Str(b.label, 120), Int(b.percent, 0, 100), x); log(user, 'phase.edit', x); return ok(); }
    if (m === 'DELETE') { run('DELETE FROM phases WHERE id = ?', x); return ok(); }
  }

  /* dépenses, photos, documents, annonces, liste d'attente */
  if (m === 'POST' && p === '/api/expenses') {
    run('INSERT INTO expenses(project_id, label, amount, spent_on, file_id) VALUES(?, ?, ?, ?, ?)', projectId(b.project_id), Str(b.label, 160), Int(b.amount, 1), Dat(b.spent_on), fileId(b.file_id, true));
    log(user, 'expense.new', `${b.label} ${b.amount} DH`); return ok();
  }
  if (m === 'DELETE' && (x = idOf(/^\/api\/expenses\/(\d+)$/))) {
    const e = get('SELECT * FROM expenses WHERE id = ?', x);
    if (!e) throw new HttpError(404, 'not_found');
    run('DELETE FROM expenses WHERE id = ?', x); dropFile(e.file_id);
    log(user, 'expense.delete', `${e.label} ${e.amount} DH`); return ok();
  }
  if (m === 'POST' && p === '/api/photos') {
    run('INSERT INTO photos(project_id, file_id, caption, taken_on) VALUES(?, ?, ?, ?)', projectId(b.project_id), fileId(b.file_id), Str(b.caption || '', 160, 0), Dat(b.taken_on));
    return ok();
  }
  if (m === 'DELETE' && (x = idOf(/^\/api\/photos\/(\d+)$/))) {
    const e = get('SELECT * FROM photos WHERE id = ?', x);
    if (!e) throw new HttpError(404, 'not_found');
    run('DELETE FROM photos WHERE id = ?', x); dropFile(e.file_id); return ok();
  }
  if (m === 'POST' && p === '/api/documents') {
    run('INSERT INTO documents(project_id, title, file_id, doc_date) VALUES(?, ?, ?, ?)', projectId(b.project_id), Str(b.title, 160), fileId(b.file_id), Dat(b.doc_date, true));
    log(user, 'document.new', b.title); return ok();
  }
  if (m === 'DELETE' && (x = idOf(/^\/api\/documents\/(\d+)$/))) {
    const e = get('SELECT * FROM documents WHERE id = ?', x);
    if (!e) throw new HttpError(404, 'not_found');
    run('DELETE FROM documents WHERE id = ?', x); dropFile(e.file_id);
    log(user, 'document.delete', e.title); return ok();
  }
  if (m === 'POST' && p === '/api/news') {
    run('INSERT INTO news(project_id, body, created_at) VALUES(?, ?, ?)', projectId(b.project_id), Str(b.body, 600), now()); return ok();
  }
  if (m === 'DELETE' && (x = idOf(/^\/api\/news\/(\d+)$/))) { run('DELETE FROM news WHERE id = ?', x); return ok(); }
  if (m === 'POST' && p === '/api/waitlist') {
    run('INSERT INTO waitlist(project_id, name, phone, created_at) VALUES(?, ?, ?, ?)', projectId(b.project_id), Str(b.name, 120), b.phone ? phoneNorm(b.phone) : '', now()); return ok();
  }
  if (m === 'DELETE' && (x = idOf(/^\/api\/waitlist\/(\d+)$/))) { run('DELETE FROM waitlist WHERE id = ?', x); return ok(); }

  throw new HttpError(404, 'not_found');
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(e => {
    if (res.headersSent) return res.end();
    if (e instanceof HttpError) return json(res, e.status, { error: e.code });
    if (e && /UNIQUE constraint/.test(String(e.message))) return json(res, 409, { error: 'phone_taken' });
    console.error(new Date().toISOString(), req.method, req.url, e);
    json(res, 500, { error: 'server' });
  });
});
server.listen(PORT, () => console.log(`Chafafia en écoute sur le port ${PORT}`));
process.on('SIGTERM', () => server.close(() => { db.close(); process.exit(0); }));
