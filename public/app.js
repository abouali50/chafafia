'use strict';
/* Chafafia — interface de l'application. Auteur : Aziz Mernissi */

const S = { lang: 'fr', tab: null, d: null, project: null };
try { if (localStorage.getItem('chafafia.lang') === 'ar') S.lang = 'ar'; } catch (e) { /* stockage indisponible */ }

const T = {
  tagline: ["Transparence pour amicales d'habitat", 'الشفافية للوداديات السكنية'],
  dh: ['DH', 'درهم'],
  // onglets
  home: ['Accueil', 'الرئيسية'], pay: ['Paiements', 'الأداءات'], site: ['Chantier', 'الورش'], acc: ['Comptes', 'الحسابات'],
  docs: ['Documents', 'الوثائق'], dash: ['Tableau', 'اللوحة'], members: ['Adhérents', 'المنخرطون'], wait: ['Attente', 'الانتظار'],
  settings: ['Réglages', 'الإعدادات'],
  // commun
  save: ['Enregistrer', 'حفظ'], cancel: ['Annuler', 'إلغاء'], close: ['Fermer', 'إغلاق'], add: ['Ajouter', 'إضافة'], edit: ['Modifier', 'تعديل'],
  del: ['Supprimer', 'حذف'], view: ['Voir', 'عرض'], saved: ['Enregistré', 'تم الحفظ'], deleted: ['Supprimé', 'تم الحذف'],
  confirm_delete: ['Supprimer définitivement ?', 'هل تريد الحذف نهائيا؟'], none: ['Rien pour le moment.', 'لا شيء حاليا.'],
  name: ['Nom complet', 'الاسم الكامل'], phone: ['Téléphone', 'الهاتف'], password: ['Mot de passe', 'كلمة السر'],
  date: ['Date', 'التاريخ'], amount: ['Montant (DH)', 'المبلغ (درهم)'], label: ['Libellé', 'البيان'], file: ['Fichier (photo ou PDF)', 'الملف (صورة أو PDF)'],
  proof: ['Justificatif', 'الإثبات'], proof_opt: ['Justificatif (photo ou PDF, facultatif)', 'الإثبات (صورة أو PDF، اختياري)'],
  // accès
  login_title: ['Connexion', 'تسجيل الدخول'], login_intro: ["Entrez le numéro de téléphone et le mot de passe remis par le bureau de l'amicale.", 'أدخل رقم الهاتف وكلمة السر التي سلمها لك مكتب الودادية.'],
  login_btn: ['Se connecter', 'دخول'], see_demo: ['Voir la démonstration', 'عرض النموذج التجريبي'],
  setup_title: ['Première installation', 'الإعداد الأول'], setup_intro: ["Créez le compte du bureau. Ce compte gère les adhérents, les paiements et les dépenses.", 'أنشئ حساب المكتب. هذا الحساب يدبر المنخرطين والأداءات والمصاريف.'],
  amicale_name: ["Nom de l'amicale", 'اسم الودادية'], project_name: ['Nom du projet', 'اسم المشروع'], city: ['Ville', 'المدينة'],
  setup_code: ["Code d'installation (affiché dans le terminal)", 'رمز الإعداد (المعروض في الطرفية)'],
  pass_min: ['Mot de passe (8 caractères minimum)', 'كلمة السر (8 أحرف على الأقل)'], setup_btn: ["Créer le compte du bureau", 'إنشاء حساب المكتب'],
  account: ['Mon compte', 'حسابي'], change_pass: ['Changer le mot de passe', 'تغيير كلمة السر'], logout: ['Se déconnecter', 'تسجيل الخروج'],
  current_pass: ['Mot de passe actuel', 'كلمة السر الحالية'], new_pass: ['Nouveau mot de passe (8 caractères minimum)', 'كلمة السر الجديدة (8 أحرف على الأقل)'],
  role_admin: ["Bureau de l'amicale", 'مكتب الودادية'], role_member: ['Adhérent', 'منخرط'],
  // adhérent
  hello: ['Bonjour', 'مرحبا'], lot: ['Lot', 'الشقة'], paid: ['Déjà payé', 'المبلغ المؤدى'], of: ['sur', 'من أصل'],
  remaining: ['Reste à payer', 'الباقي'], next: ['Prochaine tranche', 'الدفعة المقبلة'], late_tr: ['Tranche en retard', 'دفعة متأخرة'],
  all_paid: ['Tout est réglé', 'تم أداء كل شيء'], how_pay: ['Comment payer', 'طريقة الأداء'],
  how_pay_msg: ["Payez par virement ou dépôt sur le compte de l'amicale, puis remettez le justificatif au bureau. Votre reçu apparaît ici après validation.", 'أدِّ عبر تحويل أو إيداع في حساب الودادية ثم سلم الإثبات للمكتب. يظهر وصلك هنا بعد المصادقة.'],
  news: ['Annonces', 'الإعلانات'], progress: ['Avancement du chantier', 'تقدم الأشغال'],
  my_pay: ['Mes paiements', 'أداءاتي'], schedule: ['Échéancier', 'جدول الدفعات'], receipts: ['Reçus', 'الوصولات'], receipt: ['Reçu', 'الوصل'],
  st_paid: ['Payée', 'مؤداة'], st_due: ['À venir', 'قادمة'], st_todo: ['Plus tard', 'لاحقا'], st_late: ['En retard', 'متأخرة'],
  no_date: ['date à fixer', 'التاريخ لم يحدد'],
  site_title: ['Le chantier', 'الورش'], delivery: ['Livraison prévue', 'التسليم المرتقب'], global: ['Avancement global', 'التقدم الإجمالي'],
  phases: ['Étapes', 'المراحل'], photos: ['Photos datées', 'صور مؤرخة'],
  acc_title: ["Les comptes de l'amicale", 'حسابات الودادية'], acc_sub: ['Visibles par tous les adhérents du projet', 'متاحة لجميع منخرطي المشروع'],
  collected: ['Encaissé', 'المداخيل'], spent: ['Dépensé', 'المصاريف'], cash: ['Solde en caisse', 'الرصيد'], expenses: ['Dépenses', 'المصاريف'],
  docs_sub: ['Les pièces officielles du projet', 'الوثائق الرسمية للمشروع'],
  // bureau
  dash_title: ['Tableau de bord', 'لوحة القيادة'], rate: ['Taux de recouvrement', 'نسبة التحصيل'], expected: ['Attendu à ce jour', 'المنتظر إلى اليوم'],
  late: ['Retards', 'المتأخرات'], members_n: ['adhérents', 'منخرطا'], to_remind: ['Retards à relancer', 'متأخرات تستوجب التذكير'],
  no_late: ['Aucun retard. Tous les adhérents sont à jour.', 'لا متأخرات. جميع المنخرطين في وضعية سليمة.'],
  remind: ['Relancer', 'تذكير'], up_to_date: ['À jour', 'في وضعية سليمة'], days: ['j', 'يوم'],
  add_member: ['Ajouter un adhérent', 'إضافة منخرط'], price: ['Prix du lot (DH)', 'ثمن الشقة (درهم)'], mre: ["Réside à l'étranger (MRE)", 'مقيم بالخارج'],
  member_none: ["Aucun adhérent pour l'instant. Ajoutez le premier.", 'لا يوجد منخرطون حاليا. أضف الأول.'],
  add_payment: ['Enregistrer un paiement', 'تسجيل أداء'], mode: ['Mode de paiement', 'طريقة الأداء'], note: ['Observation (facultatif)', 'ملاحظة (اختياري)'],
  m_transfer: ['Virement', 'تحويل بنكي'], m_cheque: ['Chèque', 'شيك'], m_deposit: ['Versement', 'إيداع'], m_cash: ['Espèces', 'نقدا'],
  reset_pass: ['Nouveau mot de passe', 'كلمة سر جديدة'], reset_confirm: ["Créer un nouveau mot de passe pour cet adhérent ? L'ancien ne fonctionnera plus.", 'إنشاء كلمة سر جديدة لهذا المنخرط؟ القديمة لن تعمل.'],
  access_title: ["Accès de l'adhérent", 'ولوج المنخرط'], access_intro: ["Notez ou envoyez ces informations maintenant : le mot de passe ne sera plus affiché.", 'دوِّن أو أرسل هذه المعلومات الآن: كلمة السر لن تعرض مرة أخرى.'],
  address: ['Adresse', 'العنوان'], send_wa: ['Envoyer par WhatsApp', 'إرسال عبر واتساب'],
  add_expense: ['Ajouter une dépense', 'إضافة مصروف'], add_phase: ['Ajouter une étape', 'إضافة مرحلة'], percent: ['Avancement (%)', 'التقدم (%)'],
  add_photo: ['Ajouter une photo', 'إضافة صورة'], caption: ['Légende', 'التعليق'], photo: ['Photo', 'الصورة'],
  add_news: ['Publier une annonce', 'نشر إعلان'], news_body: ["Texte de l'annonce", 'نص الإعلان'],
  add_doc: ['Ajouter un document', 'إضافة وثيقة'], doc_title: ['Titre du document', 'عنوان الوثيقة'],
  wait_title: ["Liste d'attente", 'لائحة الانتظار'], wait_sub: ["Ordre d'inscription, daté", 'حسب ترتيب التسجيل، مؤرخ'], add_wait: ['Inscrire une personne', 'تسجيل شخص'],
  since: ['Inscrit le', 'مسجل في'],
  set_amicale: ['Amicale', 'الودادية'], set_project: ['Projet', 'المشروع'], new_project: ['Nouveau projet', 'مشروع جديد'],
  delivery_f: ['Livraison prévue (ex. 4e trimestre 2027)', 'التسليم المرتقب (مثال: الربع الأخير 2027)'],
  tranches: ['Tranches de paiement', 'دفعات الأداء'], tr_help: ['Chaque tranche est un pourcentage du prix du lot. Le total doit faire 100 %.', 'كل دفعة نسبة من ثمن الشقة. المجموع يجب أن يساوي 100%.'],
  add_tranche: ['Ajouter une tranche', 'إضافة دفعة'], tr_percent: ['Part du prix (%)', 'النسبة من الثمن (%)'], due_date: ["Date d'échéance (facultatif)", 'تاريخ الاستحقاق (اختياري)'],
  total: ['Total', 'المجموع'],
  wa_remind: ["Bonjour {name}, rappel de {amicale} : il reste {late} à régler pour votre lot {lot}. Détail et reçus : {url}", 'مرحبا {name}، تذكير من {amicale}: بقي {late} للأداء عن شقتكم {lot}. التفاصيل والوصولات: {url}'],
  wa_access: ["Bonjour {name}, voici votre accès pour suivre vos paiements et le chantier ({amicale}) : {url} — Téléphone : {phone} — Mot de passe : {password}", 'مرحبا {name}، هذا ولوجكم لتتبع أداءاتكم والورش ({amicale}): {url} — الهاتف: {phone} — كلمة السر: {password}'],
  // erreurs
  err_required: ['Remplissez tous les champs obligatoires.', 'املأ جميع الخانات الإلزامية.'], err_invalid: ['Une valeur est incorrecte. Vérifiez les champs.', 'قيمة غير صحيحة. راجع الخانات.'],
  err_bad_login: ['Téléphone ou mot de passe incorrect.', 'رقم الهاتف أو كلمة السر غير صحيحة.'], err_too_many: ['Trop de tentatives. Réessayez dans 15 minutes.', 'محاولات كثيرة. أعد المحاولة بعد 15 دقيقة.'],
  err_phone_taken: ['Ce numéro de téléphone est déjà utilisé.', 'رقم الهاتف مستعمل من قبل.'], err_has_payments: ['Impossible de supprimer : cet adhérent a des paiements enregistrés.', 'لا يمكن الحذف: لهذا المنخرط أداءات مسجلة.'],
  err_bad_current: ['Le mot de passe actuel est incorrect.', 'كلمة السر الحالية غير صحيحة.'], err_bad_file: ['Fichier refusé : seuls JPG, PNG, WEBP et PDF sont acceptés.', 'ملف مرفوض: تقبل فقط JPG و PNG و WEBP و PDF.'],
  err_too_large: ['Fichier trop lourd (15 Mo maximum).', 'الملف كبير جدا (15 ميغا كحد أقصى).'], err_forbidden: ['Action non autorisée.', 'عملية غير مسموح بها.'],
  err_login: ['Session expirée. Reconnectez-vous.', 'انتهت الجلسة. سجل الدخول من جديد.'], err_not_found: ['Élément introuvable.', 'العنصر غير موجود.'],
  err_short_pass: ['Le mot de passe doit contenir au moins 8 caractères.', 'كلمة السر يجب أن تحتوي على 8 أحرف على الأقل.'],
  err_bad_code: ["Code d'installation incorrect.", 'رمز الإعداد غير صحيح.'],
  err_server: ['Erreur du serveur. Réessayez.', 'خطأ في الخادم. أعد المحاولة.']
};
const t = k => { const v = T[k]; return v ? v[S.lang === 'ar' ? 1 : 0] : k; };
const fill = (k, o) => t(k).replace(/\{(\w+)\}/g, (_, n) => (o[n] == null ? '' : o[n]));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = n => Math.round(n || 0).toLocaleString('fr-FR').replace(/\s/g, ' ');
const money = n => '<bdi dir="ltr">' + num(n) + '</bdi> ' + t('dh');
const moneyText = n => num(n).replace(/ /g, ' ') + ' ' + t('dh');
const fdate = d => (d && /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(8, 10) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4) : (d || ''));
const todayISO = () => new Date().toISOString().slice(0, 10);
const $ = s => document.querySelector(s);
const wa = (phone, text) => 'https://wa.me/' + encodeURIComponent(phone) + '?text=' + encodeURIComponent(text);

async function api(method, url, body) {
  const r = await fetch(url, {
    method, credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json', 'X-Chafafia': '1' } : { 'X-Chafafia': '1' },
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || 'server'); e.code = j.error || 'server'; e.status = r.status; throw e; }
  return j;
}
async function upload(file) {
  const r = await fetch('/api/files?name=' + encodeURIComponent(file.name), {
    method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Chafafia': '1' }, body: file
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || 'server'); e.code = j.error || 'server'; throw e; }
  return j.id;
}
const errText = e => (T['err_' + (e && e.code)] ? t('err_' + e.code) : t('err_server'));

function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('on');
  clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('on'), 2800);
}
function openSheet(html) { $('#sheet').innerHTML = html; $('#modal').classList.add('on'); }
function closeSheet() { $('#modal').classList.remove('on'); $('#sheet').innerHTML = ''; F = null; }

/* ---------- formulaires ---------- */
let F = null;
function fieldHtml(f) {
  const req = f.req === false ? '' : ' required';
  const val = f.v == null ? '' : esc(f.v);
  if (f.type === 'checkbox') return `<label class="fld chk"><input type="checkbox" name="${f.k}"${f.v ? ' checked' : ''}><span>${esc(f.label)}</span></label>`;
  let input;
  if (f.type === 'select') input = `<select name="${f.k}"${req}>${f.options.map(o => `<option value="${esc(o[0])}"${String(o[0]) === String(f.v) ? ' selected' : ''}>${esc(o[1])}</option>`).join('')}</select>`;
  else if (f.type === 'textarea') input = `<textarea name="${f.k}" maxlength="600"${req}>${val}</textarea>`;
  else if (f.type === 'file') input = `<input type="file" name="${f.k}" accept="${f.accept || 'image/jpeg,image/png,image/webp,application/pdf'}"${req}>`;
  else input = `<input type="${f.type || 'text'}" name="${f.k}" value="${val}"${req}${f.type === 'number' ? ` min="${f.min == null ? 0 : f.min}"${f.max != null ? ` max="${f.max}"` : ''} step="${f.step || 1}" inputmode="decimal"` : ''}${f.type === 'tel' ? ' inputmode="tel" autocomplete="tel" dir="ltr"' : ''}${f.type === 'password' ? ` autocomplete="${f.auto || 'current-password'}" dir="ltr"` : ''}>`;
  return `<label class="fld"><span>${esc(f.label)}</span>${input}</label>`;
}
function formHtml(title, fields, opt) {
  return `<h3>${esc(title)}</h3>${opt.intro ? `<p class="sub">${esc(opt.intro)}</p>` : ''}
    <form id="f" novalidate>${fields.map(fieldHtml).join('')}<p class="err" id="ferr" hidden></p>
    <div class="acts"><button class="btn" type="submit">${esc(opt.ok || t('save'))}</button>
    ${opt.guest ? '' : `<button class="btn ghost" type="button" data-act="close">${t('cancel')}</button>`}</div></form>${opt.after || ''}`;
}
function form(title, fields, cb, opt = {}) {
  const html = formHtml(title, fields, opt);
  if (opt.guest) $('#view').innerHTML = `<div class="card gcard">${html}</div>`; else openSheet(html);
  F = { fields, cb, opt };
  const first = $('#f input:not([type=file]), #f select, #f textarea');
  if (first && !opt.guest) first.focus();
}
document.addEventListener('submit', async ev => {
  if (ev.target.id !== 'f' || !F) return;
  ev.preventDefault();
  const cur = F, el = ev.target, err = $('#ferr'), btn = el.querySelector('[type=submit]');
  const show = m => { err.textContent = m; err.hidden = false; };
  err.hidden = true;
  const v = {};
  try {
    for (const f of cur.fields) {
      const i = el.elements[f.k];
      if (f.type === 'checkbox') { v[f.k] = i.checked; continue; }
      if (f.type === 'file') {
        if (!i.files.length) { if (f.req !== false) return show(t('err_required')); v[f.k] = ''; continue; }
        v[f.k] = i.files[0]; continue;
      }
      const s = i.value.trim();
      if (!s && f.req !== false) return show(t('err_required'));
      v[f.k] = f.type === 'number' && s !== '' ? Number(s) : s;
    }
    btn.disabled = true;
    for (const f of cur.fields) if (f.type === 'file' && v[f.k]) v[f.k] = await upload(v[f.k]);
    const after = await cur.cb(v);
    if (cur.opt.guest) return;
    closeSheet();
    await load();
    if (typeof after === 'function') after(); else toast(t('saved'));
  } catch (e) {
    btn.disabled = false;
    show(errText(e));
  }
});

/* ---------- petits éléments ---------- */
const ring = p => {
  const c = 2 * Math.PI * 38;
  return `<div class="ring"><svg width="92" height="92" viewBox="0 0 92 92">
    <circle cx="46" cy="46" r="38" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="9"/>
    <circle cx="46" cy="46" r="38" fill="none" stroke="#e0a45c" stroke-width="9" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(100, Math.max(0, p)) / 100)}"/></svg><b>${p}%</b></div>`;
};
const bar = (p, cls = '') => `<div class="track"><i class="${cls}" style="width:${Math.min(100, Math.max(0, p))}%"></i></div>`;
const foot = () => `<footer>© 2026 Aziz Mernissi · Chafafia</footer>`;
const empty = k => `<p class="empty">${t(k || 'none')}</p>`;
const isAdmin = () => S.d && S.d.me.role === 'admin';
const ST = { paid: ['ok', '✓', 'st_paid'], due: ['due', '!', 'st_due'], todo: ['todo', '·', 'st_todo'], late: ['late', '!', 'st_late'] };
const scheduleRows = list => list.map(x => {
  const s = ST[x.status];
  return `<div class="row"><div class="dot ${s[0]}">${s[1]}</div>
    <div class="grow"><b>${esc(x.label)}</b><small>${x.due_date ? fdate(x.due_date) : t('no_date')} · <span class="tag ${s[0] === 'todo' ? 'due' : s[0]}">${t(s[2])}</span></small></div>
    <div class="amt">${money(x.amount)}</div></div>`;
}).join('');

const ICON = {
  home: '<path d="M3 11l9-8 9 8M5 10v10h14V10"/>',
  pay: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>',
  site: '<path d="M4 21V9l8-6 8 6v12M9 21v-6h6v6"/>',
  acc: '<path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/>',
  docs: '<path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6"/>',
  dash: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="11" width="8" height="10" rx="1.5"/><rect x="3" y="14" width="8" height="7" rx="1.5"/>',
  members: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M16 4.8a3.5 3.5 0 010 6.4M18 14.8c2 .7 3.2 2.4 3.6 5.2"/>',
  wait: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>'
};
const TABS = { member: ['home', 'pay', 'site', 'acc', 'docs'], admin: ['dash', 'members', 'acc', 'site', 'docs', 'wait', 'settings'] };

/* ---------- écrans ---------- */
const V = {
  home(d) {
    const m = d.mine, pct = d.me.price ? Math.round(m.paid / d.me.price * 100) : 0;
    const nx = m.schedule.find(x => x.status === 'late') || m.schedule.find(x => x.status === 'due');
    return `<h1>${t('hello')} ${esc(d.me.name.split(' ')[0])}</h1>
    <p class="sub">${esc(d.project.name)}${d.project.city ? ' · ' + esc(d.project.city) : ''}${d.me.lot ? ' · ' + t('lot') + ' ' + esc(d.me.lot) : ''}</p>
    <div class="card hero">${ring(pct)}<div><small>${t('paid')}</small><strong>${money(m.paid)}</strong><small>${t('of')} ${money(d.me.price)}</small></div></div>
    ${nx ? `<div class="card next ${nx.status === 'late' ? 'late' : ''}"><div><small>${t(nx.status === 'late' ? 'late_tr' : 'next')} · ${esc(nx.label)}${nx.due_date ? ' · ' + fdate(nx.due_date) : ''}</small><b>${money(nx.amount - nx.paid)}</b></div>
      <button class="btn" data-act="howpay">${t('how_pay')}</button></div>` : `<div class="card next"><b>${t('all_paid')}</b></div>`}
    <div class="grid2" style="margin-top:10px">
      <div class="card kpi"><small>${t('remaining')}</small><b>${money(Math.max(0, d.me.price - m.paid))}</b></div>
      <div class="card kpi good"><small>${t('progress')}</small><b>${d.progress}%</b>${bar(d.progress)}</div></div>
    <h2>${t('news')}</h2>
    <div class="card">${d.news.length ? d.news.map(x => `<div class="row"><div class="grow"><small>${fdate(x.created_at)}</small><b style="font-weight:500">${esc(x.body)}</b></div></div>`).join('') : empty()}</div>${foot()}`;
  },
  pay(d) {
    const m = d.mine;
    return `<h1>${t('my_pay')}</h1><p class="sub">${esc(d.project.name)}</p>
    <div class="grid2"><div class="card kpi good"><small>${t('paid')}</small><b>${money(m.paid)}</b></div>
      <div class="card kpi ${m.late ? 'bad' : ''}"><small>${t(m.late ? 'late' : 'remaining')}</small><b>${money(m.late || Math.max(0, d.me.price - m.paid))}</b></div></div>
    <h2>${t('schedule')}</h2><div class="card">${m.schedule.length ? scheduleRows(m.schedule) : empty()}</div>
    <h2>${t('receipts')}</h2>
    <div class="card">${m.payments.length ? m.payments.map(x => `<div class="row"><div class="dot ok">✓</div>
      <div class="grow"><b>${money(x.amount)}</b><small>${fdate(x.paid_on)} · ${esc(x.mode)} · N° ${esc(x.receipt_no)}</small></div>
      <a class="btn ghost small" target="_blank" rel="noopener" href="/receipt/${x.id}">${t('receipt')}</a></div>`).join('') : empty()}</div>${foot()}`;
  },
  site(d) {
    const a = isAdmin();
    return `<div class="topline"><div><h1>${t('site_title')}</h1><p class="sub">${d.project.delivery ? t('delivery') + ' : ' + esc(d.project.delivery) : esc(d.project.name)}</p></div></div>
    <div class="card kpi good"><small>${t('global')}</small><b>${d.progress}%</b>${bar(d.progress)}</div>
    <h2>${t('phases')}</h2>
    <div class="card">${d.phases.length ? d.phases.map(x => `<div class="phase"><div class="top"><b>${esc(x.label)}</b><span>${x.percent}%</span></div>${bar(x.percent, x.percent < 100 && x.percent > 0 ? 'o' : '')}
      ${a ? `<div class="rowacts" style="margin-top:6px"><button class="btn ghost small" data-act="phaseEdit" data-id="${x.id}">${t('edit')}</button><button class="x" data-act="rm" data-kind="phases" data-id="${x.id}">${t('del')}</button></div>` : ''}</div>`).join('') : empty()}</div>
    ${a ? `<div class="btns"><button class="btn" data-act="phaseAdd">+ ${t('add_phase')}</button></div>` : ''}
    <h2>${t('photos')}</h2>
    ${d.photos.length ? `<div class="photos">${d.photos.map(x => `<div class="photo"><a href="/files/${x.file_id}" target="_blank" rel="noopener"><img src="/files/${x.file_id}" alt="${esc(x.caption)}" loading="lazy"></a>
      <p><b>${fdate(x.taken_on)}</b>${esc(x.caption)}${a ? ` <button class="x" data-act="rm" data-kind="photos" data-id="${x.id}">${t('del')}</button>` : ''}</p></div>`).join('')}</div>` : `<div class="card">${empty()}</div>`}
    ${a ? `<div class="btns"><button class="btn" data-act="photoAdd">+ ${t('add_photo')}</button></div>
    <h2>${t('news')}</h2><div class="card">${d.news.length ? d.news.map(x => `<div class="row"><div class="grow"><small>${fdate(x.created_at)}</small><b style="font-weight:500">${esc(x.body)}</b></div>
      <button class="x" data-act="rm" data-kind="news" data-id="${x.id}">${t('del')}</button></div>`).join('') : empty()}</div>
    <div class="btns"><button class="btn" data-act="newsAdd">+ ${t('add_news')}</button></div>` : ''}${foot()}`;
  },
  acc(d) {
    const a = isAdmin(), c = d.accounts;
    return `<h1>${t('acc_title')}</h1><p class="sub">${t('acc_sub')}</p>
    <div class="card hero" style="display:block"><small>${t('cash')}</small><strong>${money(c.cash)}</strong></div>
    <div class="grid2" style="margin-top:10px"><div class="card kpi good"><small>${t('collected')}</small><b>${money(c.collected)}</b></div>
      <div class="card kpi"><small>${t('spent')}</small><b>${money(c.spent)}</b></div></div>
    <h2>${t('expenses')}</h2>
    <div class="card">${d.expenses.length ? d.expenses.map(x => `<div class="row"><div class="grow"><b>${esc(x.label)}</b><small>${fdate(x.spent_on)}${c.spent ? ' · ' + Math.round(x.amount / c.spent * 100) + '%' : ''}</small></div>
      <div class="amt">${money(x.amount)}</div><div class="rowacts">${x.file_id ? `<a class="btn ghost small" target="_blank" rel="noopener" href="/files/${x.file_id}">${t('proof')}</a>` : ''}
      ${a ? `<button class="x" data-act="rm" data-kind="expenses" data-id="${x.id}">${t('del')}</button>` : ''}</div></div>`).join('') : empty()}</div>
    ${a ? `<div class="btns"><button class="btn" data-act="expAdd">+ ${t('add_expense')}</button></div>` : ''}${foot()}`;
  },
  docs(d) {
    const a = isAdmin();
    return `<h1>${t('docs')}</h1><p class="sub">${t('docs_sub')}</p>
    <div class="card">${d.documents.length ? d.documents.map(x => `<div class="row"><div class="dot ok">PDF</div>
      <div class="grow"><b>${esc(x.title)}</b><small>${fdate(x.doc_date)}</small></div>
      <div class="rowacts"><a class="btn ghost small" target="_blank" rel="noopener" href="/files/${x.file_id}">${t('view')}</a>
      ${a ? `<button class="x" data-act="rm" data-kind="documents" data-id="${x.id}">${t('del')}</button>` : ''}</div></div>`).join('') : empty()}</div>
    ${a ? `<div class="btns"><button class="btn" data-act="docAdd">+ ${t('add_doc')}</button></div>` : ''}${foot()}`;
  },
  dash(d) {
    const s = d.stats, late = d.members.filter(m => m.late > 0).sort((x, y) => y.late - x.late);
    return `<h1>${t('dash_title')}</h1><p class="sub">${esc(d.project.name)} · ${d.members.length} ${t('members_n')}</p>
    <div class="card hero">${ring(s.rate)}<div><small>${t('rate')}</small><strong>${money(d.accounts.collected)}</strong><small>${t('expected')} : ${money(s.expected)}</small></div></div>
    <div class="grid2" style="margin-top:10px">
      <div class="card kpi ${s.lateCount ? 'bad' : 'good'}"><small>${t('late')} · ${s.lateCount} ${t('members_n')}</small><b>${money(s.lateAmount)}</b></div>
      <div class="card kpi good"><small>${t('cash')}</small><b>${money(d.accounts.cash)}</b></div>
      <div class="card kpi"><small>${t('spent')}</small><b>${money(d.accounts.spent)}</b></div>
      <div class="card kpi good"><small>${t('progress')}</small><b>${d.progress}%</b>${bar(d.progress)}</div></div>
    <h2>${t('to_remind')}</h2>
    <div class="card">${late.length ? late.map(memberRow).join('') : empty('no_late')}</div>${foot()}`;
  },
  members(d) {
    return `<div class="topline"><div><h1>${t('members')}</h1><p class="sub">${d.members.length} ${t('members_n')} · ${esc(d.project.name)}</p></div>
      <button class="btn" data-act="memberAdd">+ ${t('add_member')}</button></div>
    <div class="card">${d.members.length ? d.members.map(memberRow).join('') : empty('member_none')}</div>${foot()}`;
  },
  wait(d) {
    return `<div class="topline"><div><h1>${t('wait_title')}</h1><p class="sub">${t('wait_sub')}</p></div><button class="btn" data-act="waitAdd">+ ${t('add_wait')}</button></div>
    <div class="card">${d.waitlist.length ? d.waitlist.map((x, i) => `<div class="row"><div class="dot todo">${i + 1}</div>
      <div class="grow"><b>${esc(x.name)}</b><small>${t('since')} ${fdate(x.created_at)}${x.phone ? ' · <bdi dir="ltr">+' + esc(x.phone) + '</bdi>' : ''}</small></div>
      <button class="x" data-act="rm" data-kind="waitlist" data-id="${x.id}">${t('del')}</button></div>`).join('') : empty()}</div>${foot()}`;
  },
  settings(d) {
    const ok = Math.abs(d.percentTotal - 100) < 0.01;
    return `<h1>${t('settings')}</h1><p class="sub">${esc(d.amicale)}</p>
    <h2>${t('set_amicale')}</h2><div class="card"><div class="row"><div class="grow"><b>${esc(d.amicale)}</b></div><button class="btn ghost small" data-act="amicaleEdit">${t('edit')}</button></div></div>
    <h2>${t('set_project')}</h2><div class="card"><div class="row"><div class="grow"><b>${esc(d.project.name)}</b><small>${esc([d.project.city, d.project.delivery].filter(Boolean).join(' · '))}</small></div>
      <button class="btn ghost small" data-act="projectEdit">${t('edit')}</button></div></div>
    <div class="btns"><button class="btn ghost" data-act="projectAdd">+ ${t('new_project')}</button></div>
    <h2>${t('tranches')}</h2><p class="note" style="margin:0 0 10px">${t('tr_help')}</p>
    <div class="card">${d.tranches.map(x => `<div class="row"><div class="grow"><b>${esc(x.label)}</b><small>${x.percent}% · ${x.due_date ? fdate(x.due_date) : t('no_date')}</small></div>
      <div class="rowacts"><button class="btn ghost small" data-act="trancheEdit" data-id="${x.id}">${t('edit')}</button><button class="x" data-act="rm" data-kind="tranches" data-id="${x.id}">${t('del')}</button></div></div>`).join('')}
      <div class="row"><div class="grow"><b>${t('total')}</b></div><span class="tag ${ok ? 'ok' : 'late'}">${d.percentTotal}%</span></div></div>
    <div class="btns"><button class="btn" data-act="trancheAdd">+ ${t('add_tranche')}</button></div>
    <h2>${t('account')}</h2><div class="btns" style="margin-top:0"><button class="btn ghost" data-act="passEdit">${t('change_pass')}</button><button class="btn ghost" data-act="logout">${t('logout')}</button></div>${foot()}`;
  }
};
function memberRow(x) {
  return `<div class="row" data-act="member" data-id="${x.id}" role="button" tabindex="0"><div class="dot ${x.late ? 'late' : 'ok'}">${x.late ? '!' : '✓'}</div>
    <div class="grow"><b>${esc(x.name)} ${x.mre ? '<span class="tag mre">MRE</span>' : ''}</b>
      <small>${esc(x.lot || '—')} · ${x.late ? `<span class="tag late">${t('late')} ${money(x.late)} · ${x.days} ${t('days')}</span>` : `<span class="tag ok">${t('up_to_date')}</span>`}</small></div>
    <div class="amt">${money(x.paid)}</div></div>`;
}

/* ---------- rendu ---------- */
function shell() {
  const ar = S.lang === 'ar';
  document.documentElement.lang = S.lang;
  document.documentElement.dir = ar ? 'rtl' : 'ltr';
  $('#tagline').textContent = t('tagline');
  $('#lang').textContent = ar ? 'FR' : 'ع';
}
function render() {
  shell();
  const d = S.d;
  if (!d) return;
  const tabs = TABS[d.me.role];
  if (!tabs.includes(S.tab)) S.tab = tabs[0];
  $('#app').classList.remove('guest');
  $('#user').hidden = false; $('#user').textContent = d.me.name.split(' ')[0];
  const strip = $('#strip'); strip.hidden = false;
  strip.innerHTML = esc(d.amicale) + ' · ' + (isAdmin() && d.projects.length > 1
    ? `<select id="proj" aria-label="${t('set_project')}">${d.projects.map(p => `<option value="${p.id}"${p.id === d.project.id ? ' selected' : ''}>${esc(p.name)}</option>`).join('')}</select>`
    : esc(d.project.name));
  $('#tabs').innerHTML = tabs.map(k => `<button data-act="go" data-tab="${k}" class="${k === S.tab ? 'on' : ''}"><svg viewBox="0 0 24 24">${ICON[k]}</svg>${t(k)}</button>`).join('');
  $('#view').innerHTML = V[S.tab](d);
}
function guest() {
  shell();
  S.d = null;
  $('#app').classList.add('guest');
  $('#user').hidden = true; $('#strip').hidden = true; $('#tabs').innerHTML = '';
}
function screenLogin() {
  guest();
  form(t('login_title'), [{ k: 'phone', label: t('phone'), type: 'tel' }, { k: 'password', label: t('password'), type: 'password' }],
    async v => { await api('POST', '/api/login', v); await boot(); },
    { guest: true, intro: t('login_intro'), ok: t('login_btn'), after: `<p style="margin-top:16px;text-align:center"><a href="/demo">${t('see_demo')}</a></p>` });
  S.screen = screenLogin;
}
function screenSetup(needCode) {
  if (needCode !== undefined) S.needCode = !!needCode;
  guest();
  form(t('setup_title'), [
    ...(S.needCode ? [{ k: 'code', label: t('setup_code') }] : []),
    { k: 'amicale', label: t('amicale_name') }, { k: 'project', label: t('project_name') }, { k: 'city', label: t('city'), req: false },
    { k: 'name', label: t('name') }, { k: 'phone', label: t('phone'), type: 'tel' }, { k: 'password', label: t('pass_min'), type: 'password', auto: 'new-password' }
  ], async v => {
    if (v.password.length < 8) { const e = new Error('short_pass'); e.code = 'short_pass'; throw e; }
    await api('POST', '/api/setup', v); await boot();
  }, { guest: true, intro: t('setup_intro'), ok: t('setup_btn') });
  S.screen = () => screenSetup();
}
async function load() {
  try {
    S.d = await api('GET', '/api/state' + (S.project ? '?project=' + S.project : ''));
    S.screen = null;
    render();
  } catch (e) {
    if (e.status === 401) return screenLogin();
    toast(errText(e));
  }
}
async function boot() {
  try {
    const me = await api('GET', '/api/me');
    if (me.setup) return screenSetup(!!me.code);
    if (!me.user) return screenLogin();
    await load();
  } catch (e) { screenLogin(); }
}

/* ---------- actions ---------- */
const pid = () => S.d.project.id;
const MODES = () => ['m_transfer', 'm_cheque', 'm_deposit', 'm_cash'].map(k => [T[k][0], t(k)]);
function showAccess(name, phone, password) {
  const msg = fill('wa_access', { name, amicale: S.d.amicale, url: location.origin, phone: '+' + phone, password });
  openSheet(`<h3>${t('access_title')}</h3><p class="sub" style="margin:0">${t('access_intro')}</p>
    <dl><div><dt>${t('address')}</dt><dd><bdi dir="ltr">${esc(location.origin)}</bdi></dd></div>
    <div><dt>${t('phone')}</dt><dd><bdi dir="ltr">+${esc(phone)}</bdi></dd></div>
    <div><dt>${t('password')}</dt><dd><bdi dir="ltr" id="newpass">${esc(password)}</bdi></dd></div></dl>
    <div class="acts"><a class="btn wa" target="_blank" rel="noopener" href="${esc(wa(phone, msg))}">${t('send_wa')}</a><button class="btn ghost" data-act="close">${t('close')}</button></div>`);
}
async function memberSheet(id) {
  const r = await api('GET', '/api/members/' + id), m = r.member;
  const msg = fill('wa_remind', { name: m.name, amicale: S.d.amicale, late: moneyText(r.late), lot: m.lot, url: location.origin });
  openSheet(`<h3>${esc(m.name)} ${m.mre ? '<span class="tag mre">MRE</span>' : ''}</h3>
    <p class="sub" style="margin:0"><bdi dir="ltr">+${esc(m.phone)}</bdi> · ${t('lot')} ${esc(m.lot || '—')} · ${money(m.price)}</p>
    <div class="grid2" style="margin:14px 0"><div class="card kpi good"><small>${t('paid')}</small><b>${money(r.paid)}</b></div>
      <div class="card kpi ${r.late ? 'bad' : ''}"><small>${t(r.late ? 'late' : 'remaining')}</small><b>${money(r.late || Math.max(0, m.price - r.paid))}</b></div></div>
    <div class="acts"><button class="btn" data-act="payAdd" data-id="${m.id}">+ ${t('add_payment')}</button>
      ${r.late ? `<a class="btn wa" target="_blank" rel="noopener" href="${esc(wa(m.phone, msg))}">${t('remind')}</a>` : ''}</div>
    <h2>${t('schedule')}</h2><div class="card">${r.schedule.length ? scheduleRows(r.schedule) : empty()}</div>
    <h2>${t('receipts')}</h2><div class="card">${r.payments.length ? r.payments.map(x => `<div class="row"><div class="grow"><b>${money(x.amount)}</b><small>${fdate(x.paid_on)} · ${esc(x.mode)} · N° ${esc(x.receipt_no)}</small></div>
      <div class="rowacts"><a class="btn ghost small" target="_blank" rel="noopener" href="/receipt/${x.id}">${t('receipt')}</a><button class="x" data-act="rm" data-kind="payments" data-id="${x.id}" data-back="${m.id}">${t('del')}</button></div></div>`).join('') : empty()}</div>
    <div class="acts" style="margin-top:16px"><button class="btn ghost small" data-act="memberEdit" data-id="${m.id}">${t('edit')}</button>
      <button class="btn ghost small" data-act="memberPass" data-id="${m.id}">${t('reset_pass')}</button>
      <button class="x" data-act="rm" data-kind="members" data-id="${m.id}">${t('del')}</button>
      <button class="btn ghost small" data-act="close">${t('close')}</button></div>`);
}
const memberFields = m => [
  { k: 'name', label: t('name'), v: m && m.name }, { k: 'phone', label: t('phone'), type: 'tel', v: m && '+' + m.phone },
  { k: 'lot', label: t('lot'), v: m && m.lot, req: false }, { k: 'price', label: t('price'), type: 'number', v: m && m.price },
  { k: 'mre', label: t('mre'), type: 'checkbox', v: m && m.mre }
];
const find = (list, id) => S.d[list].find(x => x.id === Number(id));

const A = {
  lang() {
    S.lang = S.lang === 'fr' ? 'ar' : 'fr';
    try { localStorage.setItem('chafafia.lang', S.lang); } catch (e) { /* stockage indisponible */ }
    closeSheet();
    if (S.d) render(); else if (S.screen) S.screen();
  },
  close() { closeSheet(); },
  go(el) { S.tab = el.dataset.tab; window.scrollTo(0, 0); render(); },
  howpay() { toast(t('how_pay_msg')); },
  account() {
    const me = S.d.me;
    openSheet(`<h3>${esc(me.name)}</h3><p class="sub" style="margin:0">${t(me.role === 'admin' ? 'role_admin' : 'role_member')} · <bdi dir="ltr">+${esc(me.phone)}</bdi></p>
      <div class="acts" style="margin-top:18px"><button class="btn" data-act="passEdit">${t('change_pass')}</button><button class="btn ghost" data-act="logout">${t('logout')}</button>
      <button class="btn ghost" data-act="close">${t('close')}</button></div>`);
  },
  passEdit() {
    form(t('change_pass'), [{ k: 'current', label: t('current_pass'), type: 'password' }, { k: 'password', label: t('new_pass'), type: 'password', auto: 'new-password' }],
      async v => { if (v.password.length < 8) { const e = new Error('short_pass'); e.code = 'short_pass'; throw e; } await api('POST', '/api/password', v); });
  },
  async logout() { await api('POST', '/api/logout').catch(() => {}); closeSheet(); S.project = null; S.tab = null; screenLogin(); },
  member(el) { memberSheet(el.dataset.id).catch(e => toast(errText(e))); },
  memberAdd() {
    form(t('add_member'), memberFields(null), async v => {
      const r = await api('POST', '/api/members', { ...v, project_id: pid() });
      return () => showAccess(v.name, r.phone, r.password);
    });
  },
  async memberEdit(el) {
    const r = await api('GET', '/api/members/' + el.dataset.id);
    form(t('edit'), memberFields(r.member), v => api('PUT', '/api/members/' + r.member.id, v));
  },
  async memberPass(el) {
    if (!confirm(t('reset_confirm'))) return;
    const m = find('members', el.dataset.id);
    const r = await api('POST', '/api/members/' + el.dataset.id + '/password', {});
    showAccess(m ? m.name : '', r.phone, r.password);
  },
  payAdd(el) {
    const id = Number(el.dataset.id);
    form(t('add_payment'), [
      { k: 'amount', label: t('amount'), type: 'number', min: 1 }, { k: 'paid_on', label: t('date'), type: 'date', v: todayISO() },
      { k: 'mode', label: t('mode'), type: 'select', options: MODES() }, { k: 'note', label: t('note'), req: false }
    ], async v => { await api('POST', '/api/payments', { ...v, user_id: id }); return () => memberSheet(id); });
  },
  expAdd() {
    form(t('add_expense'), [{ k: 'label', label: t('label') }, { k: 'amount', label: t('amount'), type: 'number', min: 1 },
      { k: 'spent_on', label: t('date'), type: 'date', v: todayISO() }, { k: 'file_id', label: t('proof_opt'), type: 'file', req: false }],
    v => api('POST', '/api/expenses', { ...v, project_id: pid() }));
  },
  phaseAdd() {
    form(t('add_phase'), [{ k: 'label', label: t('label') }, { k: 'percent', label: t('percent'), type: 'number', max: 100, v: 0 }],
      v => api('POST', '/api/phases', { ...v, project_id: pid() }));
  },
  phaseEdit(el) {
    const x = find('phases', el.dataset.id);
    form(t('edit'), [{ k: 'label', label: t('label'), v: x.label }, { k: 'percent', label: t('percent'), type: 'number', max: 100, v: x.percent }],
      v => api('PUT', '/api/phases/' + x.id, v));
  },
  photoAdd() {
    form(t('add_photo'), [{ k: 'file_id', label: t('photo'), type: 'file', accept: 'image/jpeg,image/png,image/webp' }, { k: 'caption', label: t('caption'), req: false },
      { k: 'taken_on', label: t('date'), type: 'date', v: todayISO() }], v => api('POST', '/api/photos', { ...v, project_id: pid() }));
  },
  newsAdd() { form(t('add_news'), [{ k: 'body', label: t('news_body'), type: 'textarea' }], v => api('POST', '/api/news', { ...v, project_id: pid() })); },
  docAdd() {
    form(t('add_doc'), [{ k: 'title', label: t('doc_title') }, { k: 'doc_date', label: t('date'), type: 'date', v: todayISO(), req: false }, { k: 'file_id', label: t('file'), type: 'file' }],
      v => api('POST', '/api/documents', { ...v, project_id: pid() }));
  },
  waitAdd() { form(t('add_wait'), [{ k: 'name', label: t('name') }, { k: 'phone', label: t('phone'), type: 'tel', req: false }], v => api('POST', '/api/waitlist', { ...v, project_id: pid() })); },
  amicaleEdit() { form(t('set_amicale'), [{ k: 'amicale', label: t('amicale_name'), v: S.d.amicale }], v => api('PUT', '/api/amicale', v)); },
  projectEdit() {
    const p = S.d.project;
    form(t('set_project'), [{ k: 'name', label: t('project_name'), v: p.name }, { k: 'city', label: t('city'), v: p.city, req: false }, { k: 'delivery', label: t('delivery_f'), v: p.delivery, req: false }],
      v => api('PUT', '/api/projects/' + p.id, v));
  },
  projectAdd() {
    form(t('new_project'), [{ k: 'name', label: t('project_name') }, { k: 'city', label: t('city'), req: false }, { k: 'delivery', label: t('delivery_f'), req: false }],
      async v => { const r = await api('POST', '/api/projects', v); S.project = r.id; });
  },
  trancheAdd() {
    form(t('add_tranche'), [{ k: 'label', label: t('label') }, { k: 'percent', label: t('tr_percent'), type: 'number', max: 100, step: 'any' }, { k: 'due_date', label: t('due_date'), type: 'date', req: false }],
      v => api('POST', '/api/tranches', { ...v, project_id: pid() }));
  },
  trancheEdit(el) {
    const x = find('tranches', el.dataset.id);
    form(t('edit'), [{ k: 'label', label: t('label'), v: x.label }, { k: 'percent', label: t('tr_percent'), type: 'number', max: 100, step: 'any', v: x.percent }, { k: 'due_date', label: t('due_date'), type: 'date', v: x.due_date, req: false }],
      v => api('PUT', '/api/tranches/' + x.id, v));
  },
  async rm(el) {
    if (!confirm(t('confirm_delete'))) return;
    const back = el.dataset.back;
    await api('DELETE', '/api/' + el.dataset.kind + '/' + el.dataset.id);
    closeSheet();
    await load();
    toast(t('deleted'));
    if (back) memberSheet(back).catch(() => {});
  }
};
document.addEventListener('click', ev => {
  if (ev.target.id === 'modal') return closeSheet();
  const el = ev.target.closest('[data-act]');
  if (!el || !A[el.dataset.act]) return;
  if (ev.target.closest('a')) return;
  Promise.resolve(A[el.dataset.act](el)).catch(e => toast(errText(e)));
});
document.addEventListener('change', ev => {
  if (ev.target.id === 'proj') { S.project = Number(ev.target.value); load(); }
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') closeSheet();
  if (ev.key === 'Enter' && ev.target.dataset && ev.target.dataset.act === 'member') A.member(ev.target);
});
boot();
