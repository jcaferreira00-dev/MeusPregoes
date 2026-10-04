/* Pregões MEI — interface */
(function () {
  'use strict';

  const C = window.Core, S = window.Sync;
  const store = C.createStore(window.localStorage, 'mp.state.v1');
  S.attach(store);

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slugClass = (s) => String(s).replace(/\s+/g, '-');

  /* ---------- ícones ---------- */
  const ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    painel: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    pregoes: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h4"/>',
    itens: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    pdf: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
    config: '<path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    pin: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    cloud: '<path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3A5 5 0 0 0 11 21.1l1.7-1.7"/>',
  };
  const icon = (n, cls) => `<svg class="i ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;

  /* ---------- estado da interface ---------- */
  const UI = {
    tab: 'painel', detailId: null, filtro: 'todos', busca: '', buscaI: '',
    pdf: { pregaoId: null, fonte: 'auto', prazoEntrega: '', localEntrega: '', observacoes: '', data: C.hojeISO(), busy: false, result: null },
    ignorePop: 0, deferredPrompt: null, reloadPending: false, updateBanner: false,
  };
  try {
    const s = JSON.parse(localStorage.getItem('mp.ui') || '{}');
    if (s.tab) UI.tab = s.tab;
    if (s.pdfPregao) UI.pdf.pregaoId = s.pdfPregao;
    if (s.fonte) UI.pdf.fonte = s.fonte;
  } catch (e) { /* ignora */ }
  const saveUI = () => { try { localStorage.setItem('mp.ui', JSON.stringify({ tab: UI.tab, pdfPregao: UI.pdf.pregaoId, fonte: UI.pdf.fonte })); } catch (e) { /* ignora */ } };

  const TABS = [
    { id: 'painel', t: 'Painel', title: 'Visão geral' },
    { id: 'pregoes', t: 'Pregões', title: 'Pregões e compras' },
    { id: 'itens', t: 'Itens', title: 'Itens e valor mínimo' },
    { id: 'pdf', t: 'Proposta', title: 'Proposta em PDF' },
    { id: 'config', t: 'Config', title: 'Configurações' },
  ];

  /* ---------- proteção: rascunhos e saída sem salvar ---------- */
  const Guard = { pending: new Set() };
  const Sheet = { current: null };
  const isDirty = () => !!(Sheet.current && Sheet.current.dirty) || Guard.pending.size > 0;

  const Draft = {
    k: (key) => 'mp.draft:' + key,
    save(key, data) { try { localStorage.setItem(this.k(key), JSON.stringify({ t: Date.now(), data })); } catch (e) { /* ignora */ } },
    load(key) { try { const r = localStorage.getItem(this.k(key)); return r ? JSON.parse(r) : null; } catch (e) { return null; } },
    clear(key) { try { localStorage.removeItem(this.k(key)); } catch (e) { /* ignora */ } },
    all() {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('mp.draft:')) { try { out.push({ key: k.slice(9), t: JSON.parse(localStorage.getItem(k)).t }); } catch (e) { /* ignora */ } }
      }
      return out.sort((a, b) => b.t - a.t);
    },
  };

  window.addEventListener('beforeunload', (e) => {
    if (isDirty()) { e.preventDefault(); e.returnValue = ''; return ''; }
    return undefined;
  });

  /* ---------- toast e diálogos ---------- */
  let toastT;
  function toast(msg) {
    $$('.toast').forEach((t) => t.remove());
    const el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg;
    document.body.appendChild(el);
    clearTimeout(toastT); toastT = setTimeout(() => el.remove(), 3200);
  }
  function dialog({ title, text, buttons }) {
    return new Promise((resolve) => {
      const w = document.createElement('div');
      w.className = 'dlg-wrap';
      w.innerHTML = `<div class="dlg" role="alertdialog" aria-modal="true"><h3>${esc(title)}</h3><p>${esc(text || '')}</p><div class="btns">${
        buttons.map((b, i) => `<button type="button" class="btn ${b.cls || ''}" data-i="${i}">${esc(b.label)}</button>`).join('')}</div></div>`;
      document.body.appendChild(w);
      const done = (v) => { w.remove(); resolve(v); };
      w.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (b) done(buttons[+b.dataset.i].value); });
      const first = $('button', w); if (first) first.focus();
    });
  }
  const confirmar = (title, text, ok, danger) => dialog({ title, text, buttons: [{ label: ok, value: true, cls: danger ? 'danger' : 'primary' }, { label: 'Cancelar', value: false, cls: 'ghost' }] });

  /* ---------- formulários (sheet) com rascunho automático ---------- */
  const readForm = (form) => {
    const o = {};
    for (const el of form.elements) if (el.name) o[el.name] = el.type === 'checkbox' ? el.checked : el.value;
    return o;
  };
  const applyValues = (form, vals) => {
    for (const el of form.elements) {
      if (el.name && Object.prototype.hasOwnProperty.call(vals, el.name)) {
        if (el.type === 'checkbox') el.checked = !!vals[el.name]; else el.value = vals[el.name];
      }
    }
  };

  function field(o) {
    const id = 'f_' + o.name;
    const cls = o.full ? 'field full' : 'field';
    let ctl;
    if (o.type === 'textarea') ctl = `<textarea class="input" id="${id}" name="${o.name}" placeholder="${esc(o.ph || '')}" rows="2">${esc(o.value)}</textarea>`;
    else if (o.type === 'select') ctl = `<select class="input" id="${id}" name="${o.name}">${o.options.map((x) => `<option value="${esc(x.v)}"${String(x.v) === String(o.value) ? ' selected' : ''}>${esc(x.l)}</option>`).join('')}</select>`;
    else ctl = `<input class="input" id="${id}" name="${o.name}" type="${o.type || 'text'}" value="${esc(o.value)}" placeholder="${esc(o.ph || '')}"${o.inputmode ? ` inputmode="${o.inputmode}"` : ''} autocomplete="off"${o.type === 'datetime-local' || o.type === 'date' ? '' : ' autocapitalize="sentences"'}>`;
    return `<div class="${cls}"><label for="${id}">${esc(o.label)}</label>${ctl}${o.hint ? `<div class="hint">${esc(o.hint)}</div>` : ''}</div>`;
  }

  function openForm(o) {
    if (Sheet.current) closeSheetNow();
    const draft = Draft.load(o.key);
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    wrap.innerHTML = `<div class="sheet-backdrop"></div>
      <section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(o.title)}">
        <header class="sheet-head"><button type="button" class="icon-btn" data-sh="close" aria-label="Fechar">${icon('x')}</button><h2>${esc(o.title)}</h2></header>
        <form class="sheet-form" novalidate>
          <div class="sheet-body">${o.top || ''}<div data-slot="draft"></div>${o.body}${o.onDelete ? `<div style="margin-top:8px"><button type="button" class="btn danger block" data-sh="delete">${icon('trash')} ${esc(o.deleteLabel || 'Excluir')}</button></div>` : ''}</div>
          <div class="sheet-foot"><button type="button" class="btn ghost" data-sh="close">Cancelar</button><button type="submit" class="btn primary">${esc(o.saveLabel || 'Salvar')}</button></div>
        </form>
      </section>`;
    document.body.appendChild(wrap);
    document.body.style.overflow = 'hidden';
    const form = $('form', wrap);
    const ctl = { key: o.key, el: wrap, form, dirty: false };
    Sheet.current = ctl;
    history.pushState({ sheet: o.key }, '');

    const restoreOriginal = () => { applyValues(form, o.values); Draft.clear(o.key); ctl.dirty = false; $('[data-slot="draft"]', wrap).innerHTML = ''; if (o.onInput) o.onInput(form); };
    if (draft) {
      applyValues(form, draft.data);
      ctl.dirty = true;
      const quando = new Date(draft.t).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      $('[data-slot="draft"]', wrap).innerHTML = `<div class="draftbar">${icon('alert', 'sm')}<span>Rascunho não salvo recuperado (${quando})</span><button type="button" data-sh="discard-draft">Descartar</button></div>`;
    }

    const onInput = () => { ctl.dirty = true; Draft.save(o.key, readForm(form)); if (o.onInput) o.onInput(form); };
    form.addEventListener('input', onInput);
    form.addEventListener('change', onInput);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = o.onSave(readForm(form), form);
      if (res === true) { Draft.clear(o.key); ctl.dirty = false; closeSheetNow(); if (o.afterSave) o.afterSave(); }
      else if (typeof res === 'string') toast(res);
    });
    wrap.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-sh]');
      if (e.target.classList.contains('sheet-backdrop')) { requestClose(); return; }
      if (!b) return;
      const a = b.dataset.sh;
      if (a === 'close') requestClose();
      else if (a === 'discard-draft') restoreOriginal();
      else if (a === 'delete' && o.onDelete) { if (await o.onDelete()) { Draft.clear(o.key); ctl.dirty = false; closeSheetNow(); } }
    });

    ctl.requestClose = requestClose;
    async function requestClose() {
      if (ctl.dirty) {
        const v = await dialog({
          title: 'Sair sem salvar?',
          text: 'Você começou a preencher e ainda não salvou. O que foi digitado fica guardado como rascunho neste aparelho.',
          buttons: [
            { label: 'Continuar editando', value: 'ficar', cls: 'primary' },
            { label: 'Sair e manter rascunho', value: 'manter' },
            { label: 'Descartar o que digitei', value: 'descartar', cls: 'danger' },
          ],
        });
        if (v === 'ficar') return false;
        if (v === 'descartar') Draft.clear(o.key);
      }
      closeSheetNow();
      return true;
    }
    if (o.onMount) o.onMount(form, ctl);
    if (o.onInput) o.onInput(form);
    const first = $('input[type=text],textarea', form); if (first && !draft && !o.values._noFocus) setTimeout(() => first.focus({ preventScroll: true }), 250);
    return ctl;
  }

  function closeSheetNow() {
    const c = Sheet.current;
    if (!c) return;
    c.el.remove();
    Sheet.current = null;
    document.body.style.overflow = '';
    if (history.state && history.state.sheet) { UI.ignorePop++; history.back(); }
    afterClose();
  }

  window.addEventListener('popstate', async () => {
    if (UI.ignorePop > 0) { UI.ignorePop--; return; }
    if (Sheet.current) {
      const ok = await Sheet.current.requestClose();
      if (!ok) history.pushState({ sheet: Sheet.current.key }, '');
      return;
    }
    if (UI.detailId) { UI.detailId = null; render(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && Sheet.current && !$('.dlg-wrap')) Sheet.current.requestClose();
  });

  /* ---------- editores ---------- */
  const activePregoes = () => store.get().pregoes.filter((p) => !p.deleted);
  const pregaoLabel = (p) => `#${p.numero} — ${p.orgao}`;

  function pregaoValues(p) {
    return {
      numero: p.numero || '', orgao: p.orgao || '', cidadeUf: p.cidadeUf || '', sessao: p.sessao || '', intervaloMin: p.intervaloMin || '',
      prazoEntregaDias: p.prazoEntregaDias == null ? '' : String(p.prazoEntregaDias), exigencias: p.exigencias || '', status: p.status || 'Analisando',
      km: p.km ? C.numBR(p.km, 1) : '', viagens: p.viagens == null ? '1' : String(p.viagens), pedagio: p.pedagio ? C.numBR(p.pedagio) : '',
      link: p.link || '', obs: p.obs || '',
    };
  }
  function openPregaoForm(id) {
    const cur = id ? store.get().pregoes.find((p) => p.id === id && !p.deleted) : null;
    const v = pregaoValues(cur || { status: 'Analisando', viagens: 1 });
    v._noFocus = false;
    const body = `
      <div class="formgrid">
        ${field({ label: 'Nº da compra *', name: 'numero', value: v.numero, ph: 'ex.: 90001/2026' })}
        ${field({ label: 'Status', name: 'status', type: 'select', value: v.status, options: C.STATUS.map((s) => ({ v: s, l: s })) })}
        ${field({ label: 'Órgão / entidade *', name: 'orgao', value: v.orgao, full: true, ph: 'ex.: Universidade de Londrina' })}
        ${field({ label: 'Cidade/UF', name: 'cidadeUf', value: v.cidadeUf, ph: 'Londrina/PR' })}
        ${field({ label: 'Data e hora da sessão', name: 'sessao', type: 'datetime-local', value: v.sessao })}
        ${field({ label: 'Intervalo mín. entre lances', name: 'intervaloMin', value: v.intervaloMin, ph: 'R$ 0,10 ou 0,5%' })}
        ${field({ label: 'Prazo de entrega (dias)', name: 'prazoEntregaDias', value: v.prazoEntregaDias, inputmode: 'numeric' })}
        ${field({ label: 'Exigências (IE, certidões)', name: 'exigencias', type: 'textarea', value: v.exigencias, full: true, ph: 'SICAF, CND estadual…' })}
      </div>
      <div class="sect">${icon('pin', 'sm')} Entrega de carro</div>
      <div class="formgrid">
        ${field({ label: 'Km (ida e volta)', name: 'km', value: v.km, inputmode: 'decimal', ph: '0 = não vou de carro' })}
        ${field({ label: 'Nº de viagens', name: 'viagens', value: v.viagens, inputmode: 'numeric' })}
        ${field({ label: 'Pedágio/outros por viagem (R$)', name: 'pedagio', value: v.pedagio, inputmode: 'decimal' })}
        <div class="field"><label>Custo da entrega</label><div class="input" id="viagemCusto" style="display:flex;align-items:center;font-weight:800">—</div></div>
      </div>
      <div class="sect">Outros</div>
      ${field({ label: 'Link do edital', name: 'link', type: 'url', value: v.link, ph: 'https://…' })}
      ${field({ label: 'Observações', name: 'obs', type: 'textarea', value: v.obs })}`;
    openForm({
      key: 'pregao:' + (id || 'novo'), title: id ? 'Editar pregão' : 'Novo pregão', body, values: v,
      onInput: (form) => {
        const x = readForm(form), cfg = store.get().config;
        const custo = C.custoViagem({ km: C.parseBR(x.km), viagens: C.parseBR(x.viagens), pedagio: C.parseBR(x.pedagio) }, cfg);
        $('#viagemCusto', form).textContent = C.brl(custo);
      },
      onSave: (x, form) => {
        $$('.input.err', form).forEach((e) => e.classList.remove('err'));
        const miss = [];
        if (!x.numero.trim()) miss.push('numero');
        if (!x.orgao.trim()) miss.push('orgao');
        if (miss.length) { miss.forEach((n) => $('[name=' + n + ']', form).classList.add('err')); return 'Preencha o número da compra e o órgão.'; }
        const km = C.parseBR(x.km) || 0;
        const data = {
          numero: x.numero.trim(), orgao: x.orgao.trim(), cidadeUf: x.cidadeUf.trim(), sessao: x.sessao || '', intervaloMin: x.intervaloMin.trim(),
          prazoEntregaDias: x.prazoEntregaDias ? parseInt(x.prazoEntregaDias, 10) : null, exigencias: x.exigencias.trim(), status: x.status,
          km, viagens: x.viagens === '' ? (km > 0 ? 1 : 0) : (C.parseBR(x.viagens) || 0), pedagio: C.parseBR(x.pedagio) || 0, link: x.link.trim(), obs: x.obs.trim(),
        };
        if (id) data.id = id;
        const nid = store.upsertPregao(data);
        toast(id ? 'Pregão atualizado' : 'Pregão cadastrado');
        if (!id) { UI.tab = 'pregoes'; UI.detailId = nid; }
        return true;
      },
      onDelete: id ? async () => {
        const ok = await confirmar('Excluir este pregão?', 'Os itens dele também serão excluídos.', 'Excluir', true);
        if (ok) { store.removePregao(id); if (UI.detailId === id) { UI.detailId = null; } toast('Pregão excluído'); }
        return ok;
      } : null,
    });
  }

  function itemValues(it) {
    return {
      pregaoId: it.pregaoId || '', itemEdital: it.itemEdital || '', descricao: it.descricao || '', descEdital: it.descEdital || '', marca: it.marca || '', unidade: it.unidade || 'Un',
      qtd: it.qtd == null ? '' : C.numBR(it.qtd, 3), onde: it.onde || '',
      custo: it.custo == null ? '' : C.numBR(it.custo), teto: it.teto == null ? '' : C.numBR(it.teto), frete: it.frete ? C.numBR(it.frete) : '',
      margem: it.margem == null ? '' : C.numBR(it.margem * 100, 2), lanceFinal: it.lanceFinal == null ? '' : C.numBR(it.lanceFinal),
    };
  }
  function itemFromForm(x, id) {
    const m = C.parseBR(x.margem);
    return {
      id: id || 'new', pregaoId: x.pregaoId, itemEdital: x.itemEdital.trim(), descricao: x.descricao.trim(), descEdital: x.descEdital.trim(), marca: x.marca.trim(), unidade: x.unidade.trim() || 'Un',
      qtd: C.parseBR(x.qtd), onde: x.onde.trim(), custo: C.parseBR(x.custo), teto: C.parseBR(x.teto), frete: C.parseBR(x.frete) || 0,
      margem: m == null ? null : m / 100, lanceFinal: C.parseBR(x.lanceFinal),
    };
  }
  function openItemForm(id, pregaoId) {
    const list = activePregoes();
    if (!list.length) { toast('Cadastre um pregão primeiro'); openPregaoForm(); return; }
    const cur = id ? store.get().itens.find((i) => i.id === id && !i.deleted) : null;
    const v = itemValues(cur || { pregaoId: pregaoId || (UI.detailId || list[0].id), unidade: 'Un' });
    const cfg = store.get().config;
    const body = `
      <div class="preview" id="prev"></div>
      ${field({ label: 'Pregão / órgão *', name: 'pregaoId', type: 'select', value: v.pregaoId, options: list.map((p) => ({ v: p.id, l: pregaoLabel(p) })) })}
      ${field({ label: 'Item que vou comprar *', name: 'descricao', value: v.descricao, ph: 'ex.: Caixa organizadora plástica 30 L' })}
      <div class="formgrid">
        ${field({ label: 'Nº do item no edital', name: 'itemEdital', value: v.itemEdital, ph: 'ex.: 04', hint: 'Sai como “ITEM 04” no PDF' })}
        ${field({ label: 'Unidade', name: 'unidade', value: v.unidade, ph: 'Un, Cx, Resma…' })}
        ${field({ label: 'Marca / modelo', name: 'marca', value: v.marca, full: true, ph: 'ex.: SONE/Bico RN Anatômico' })}
        ${field({ label: 'Quantidade *', name: 'qtd', value: v.qtd, inputmode: 'decimal' })}
        ${field({ label: 'Onde compro', name: 'onde', value: v.onde })}
        ${field({ label: 'Custo unit. (R$) *', name: 'custo', value: v.custo, inputmode: 'decimal', hint: 'O que eu vou pagar' })}
        ${field({ label: 'Valor unit. do edital (teto)', name: 'teto', value: v.teto, inputmode: 'decimal', hint: 'Máximo que o órgão aceita' })}
        ${field({ label: 'Frete do fornecedor (R$, total do item)', name: 'frete', value: v.frete, inputmode: 'decimal' })}
        ${field({ label: 'Minha margem (%)', name: 'margem', value: v.margem, inputmode: 'decimal', ph: 'padrão: ' + C.numBR(cfg.margemPadrao * 100, 2).replace(',00', '') + '%', hint: 'Vazio = margem padrão' })}
        ${field({ label: 'Lance final (R$ unit., opcional)', name: 'lanceFinal', value: v.lanceFinal, inputmode: 'decimal', full: true, hint: 'Preencha depois de disputar. Vazio = conta pelo teto.' })}
        ${field({ label: 'Descrição completa do edital (vai no PDF)', name: 'descEdital', type: 'textarea', value: v.descEdital, full: true, ph: 'Cole aqui a descrição do item como está no edital', hint: 'Se ficar vazia, o PDF usa o nome do item.' })}
      </div>`;
        openForm({
      key: 'item:' + (id || 'novo'), title: id ? 'Editar item' : 'Novo item', body, values: v,
      onInput: (form) => {
        const x = readForm(form);
        const c = C.previewItem(store.get(), itemFromForm(x, id));
        const el = $('#prev', form);
        if (!c || c.minimo == null) { el.innerHTML = `<div class="small muted">Informe quantidade e custo para ver o valor mínimo da proposta.</div>`; return; }
        const bad = c.sitTipo === 'bad';
        el.innerHTML = `<div class="minbox ${bad ? 'bad' : ''}"><div><div class="t">Valor mínimo p/ proposta (unit.)</div><div class="tiny muted">margem ${C.pct(c.margem, 1)} sobre o preço</div></div><div class="v">${C.brl(c.minimo)}</div></div>
          <div class="kv"><span>Custo unit. final <b>${C.brl(c.custoUnit)}</b></span><span>Entrega rateada <b>${C.brl(c.entrega)}</b></span>
          <span>Posso baixar do teto <b>${c.folgaRs != null ? C.brl(c.folgaRs) + ' (' + C.pct(c.folgaPct, 0) + ')' : '—'}</b></span></div>
          ${c.situacao ? `<div><span class="badge ${c.sitTipo}">${esc(c.situacao)}</span> <span class="tiny muted">Lucro previsto ${C.brl(c.lucro)}</span></div>` : ''}`;
      },
      onSave: (x, form) => {
        $$('.input.err', form).forEach((e) => e.classList.remove('err'));
        const it = itemFromForm(x, id);
        const miss = [];
        if (!it.pregaoId) miss.push('pregaoId');
        if (!it.descricao) miss.push('descricao');
        if (!(it.qtd > 0)) miss.push('qtd');
        if (it.custo == null || it.custo < 0) miss.push('custo');
        if (miss.length) { miss.forEach((n) => $('[name=' + n + ']', form).classList.add('err')); return 'Preencha pregão, item, quantidade e custo.'; }
        if (it.margem != null && it.margem >= 1) { $('[name=margem]', form).classList.add('err'); return 'A margem precisa ser menor que 100%.'; }
        const data = Object.assign({}, it); delete data.id;
        if (id) data.id = id;
        store.upsertItem(data);
        toast(id ? 'Item atualizado' : 'Item adicionado');
        return true;
      },
      onDelete: id ? async () => {
        const ok = await confirmar('Excluir este item?', cur ? cur.descricao : '', 'Excluir', true);
        if (ok) { store.removeItem(id); toast('Item excluído'); }
        return ok;
      } : null,
    });
  }

  /* ---------- telas ---------- */
  const badgeStatus = (s) => `<span class="badge st-${slugClass(s)}">${esc(s)}</span>`;

  function draftDesc(key) {
    const [kind, id] = key.split(':');
    const st = store.get();
    if (kind === 'pregao') { const p = st.pregoes.find((x) => x.id === id); return id === 'novo' ? 'Novo pregão' : 'Pregão ' + (p ? '#' + p.numero : ''); }
    if (kind === 'item') { const i = st.itens.find((x) => x.id === id); return id === 'novo' ? 'Novo item' : 'Item ' + (i ? i.descricao : ''); }
    return key;
  }
  function openDraft(key) {
    const [kind, id] = key.split(':');
    if (kind === 'pregao') openPregaoForm(id === 'novo' ? null : id);
    else if (kind === 'item') openItemForm(id === 'novo' ? null : id);
  }

  function emptyWelcome() {
    return `<div class="page"><div class="card empty">${icon('pregoes')}<h2>Bem-vindo ao Pregões MEI</h2>
      <p class="muted">Cadastre um pregão, adicione os itens que vai vender e veja na hora o <b>valor mínimo</b> da proposta e quanto falta para o teto do MEI.</p>
      <button class="btn primary block" data-act="novo-pregao">${icon('plus')} Cadastrar primeiro pregão</button>
      <button class="btn ghost block" data-act="demo">Ver com dados de exemplo</button></div></div>`;
  }

  function renderPainel() {
    const st = store.get();
    if (!st.pregoes.some((p) => !p.deleted)) return emptyWelcome();
    const R = C.computeAll(st), m = R.mei;
    const drafts = Draft.all();
    const f = m.faturado, a = m.aFaturar, d = m.emDisputa, livre = Math.max(0, m.limite - (f + a + d));
    const scale = Math.max(m.limite, f + a + d) || 1;
    const w = (x) => (Math.max(0, x) / scale * 100).toFixed(2) + '%';
    const alertTxt = m.alerta === 'bad' ? 'ATENÇÃO: o que já está faturado + ganho passa do limite do MEI.'
      : m.alerta === 'warn' ? 'Cuidado: se você ganhar tudo o que está em disputa, passa do limite do MEI.' : 'Dentro do limite do MEI.';
    const meter = (p) => `<div class="meter ${p >= 1 ? 'red' : ''}"><div style="width:${Math.min(100, p * 100).toFixed(1)}%"></div></div>`;
    const maxV = Math.max(1, ...R.statusRows.map((r) => r.venda));
    const comp = R.comp, tot = comp.venda || 1;
    const segs = [['Custo dos produtos', comp.produtos, '#5b6b82'], ['Frete do fornecedor', comp.frete, '#e8a76b'], ['Entrega de carro', comp.entrega, '#f2cf5b'], ['Lucro', comp.lucro, '#4caf66']];
    const CIRC = 2 * Math.PI * 54;
    let acc = 0;
    const arcs = segs.map(([, v, col]) => {
      const len = Math.max(0, v) / tot * CIRC;
      const s = `<circle cx="80" cy="80" r="54" fill="none" stroke="${col}" stroke-width="22" stroke-dasharray="${len.toFixed(2)} ${(CIRC - len).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}" transform="rotate(-90 80 80)"/>`;
      acc += len; return s;
    }).join('');
    const margemTot = comp.venda > 0 ? comp.lucro / comp.venda : null;
    const prox = R.proximas.slice(0, 4);

    return `<div class="page">
      ${drafts.length ? `<div class="alert warn">${icon('alert', 'sm')}<div class="grow">Você tem preenchimento não salvo: ${esc(drafts.slice(0, 2).map((x) => draftDesc(x.key)).join(', '))}.</div><button class="btn sm" data-act="rascunho" data-key="${esc(drafts[0].key)}">Continuar</button></div>` : ''}
      <div class="kpis">
        <div class="kpi" style="--c:#1f3864"><div class="l">Limite do MEI</div><div class="v" style="color:var(--ink)">${C.brl0(m.limite)}</div><div class="s">no ano de ${st.config.anoRef}</div></div>
        <div class="kpi" style="--c:#2e75b6"><div class="l">Comprometido</div><div class="v">${C.brl0(m.comprometido)}</div><div class="s">faturado + ganho · ${C.pct(m.pctComprometido, 0)}</div></div>
        <div class="kpi" style="--c:${m.saldoAgora < 0 ? '#c0392b' : '#2f7d3a'}"><div class="l">Saldo disponível</div><div class="v">${C.brl0(m.saldoAgora)}</div><div class="s">se ganhar tudo: ${C.brl0(m.saldoSeGanhar)}</div></div>
        <div class="kpi" style="--c:#b7791f"><div class="l">Lucro previsto</div><div class="v">${C.brl0(R.lucroPrevisto)}</div><div class="s">pregões ativos</div></div>
      </div>
      ${prox.length ? `<div class="card"><h3>${icon('calendar', 'sm')} Próximas sessões</h3>${prox.map((x) => `<div class="strow" data-act="abrir-pregao" data-id="${x.p.id}" style="cursor:pointer"><div><b>${esc(x.p.orgao)}</b><div class="tiny muted">#${esc(x.p.numero)} · ${esc(C.fmtSessao(x.p.sessao))}</div></div>${badgeStatus(x.p.status)}</div>`).join('')}</div>` : ''}
      <div class="card"><h3>Uso do limite do MEI</h3>
        <div class="stack" role="img" aria-label="Uso do limite">
          <div class="seg" style="width:${w(f)};background:#1f3864"></div><div class="seg" style="width:${w(a)};background:#2e75b6"></div>
          <div class="seg" style="width:${w(d)};background:#f4b183"></div><div class="seg" style="width:${w(livre)};background:#a9d18e"></div>
          ${scale > m.limite ? `<div class="mark" style="left:${(m.limite / scale * 100).toFixed(2)}%"></div>` : ''}
        </div>
        <div class="legend"><span><i style="background:#1f3864"></i>Faturado ${C.brl0(f)}</span><span><i style="background:#2e75b6"></i>A faturar ${C.brl0(a)}</span><span><i style="background:#f4b183"></i>Em disputa ${C.brl0(d)}</span><span><i style="background:#a9d18e"></i>Livre ${C.brl0(livre)}</span></div>
        <div style="margin-top:14px" class="row between small"><b>Comprometido</b><span>${C.pct(m.pctComprometido, 0)}</span></div>${meter(m.pctComprometido)}
        <div style="margin-top:10px" class="row between small"><b>Se ganhar tudo em disputa</b><span>${C.pct(m.pctComTudo, 0)}</span></div>${meter(m.pctComTudo)}
        <div class="alert ${m.alerta}" style="margin-top:14px">${icon(m.alerta === 'ok' ? 'check' : 'alert', 'sm')}<span>${alertTxt}</span></div>
        <p class="tiny muted" style="margin-top:10px">O total de cada pregão usa o lance final; sem lance, usa o valor do edital (pior caso para o teto).</p>
      </div>
      <div class="two-col">
        <div class="card"><h3>Pregões por status</h3>${R.statusRows.map((r) => `<div class="strow"><div class="row">${badgeStatus(r.status)}<span class="small muted">${r.count} pregão(ões)</span></div><b>${C.brl0(r.venda)}</b><div class="bar"><div style="width:${(r.venda / maxV * 100).toFixed(1)}%"></div></div></div>`).join('')}</div>
        <div class="card"><h3>De onde vem o preço de venda</h3><div class="donut-wrap">
          <svg viewBox="0 0 160 160" role="img" aria-label="Composição do preço"><circle cx="80" cy="80" r="54" fill="none" stroke="var(--line)" stroke-width="22"/>${comp.venda > 0 ? arcs : ''}
            <text x="80" y="76" text-anchor="middle" font-size="22" font-weight="800" fill="currentColor">${margemTot == null ? '—' : C.pct(margemTot, 0)}</text><text x="80" y="95" text-anchor="middle" font-size="11" fill="var(--muted)">de lucro</text></svg>
          <div class="donut-leg">${segs.map(([l, v, col]) => `<div><i style="background:${col}"></i>${l}<b>${C.brl0(v)}</b></div>`).join('')}</div></div>
          <p class="tiny muted" style="margin-top:10px">Pregões ativos (exclui Perdeu, Desclassificado e Desisti).</p></div>
      </div></div>`;
  }

  function pregaoCard(pst) {
    const p = pst.p;
    const chips = pst.itens.slice(0, 3).map((i) => `<span class="chip">${esc(i.descricao)}</span>`).join('') + (pst.itens.length > 3 ? `<span class="chip">+${pst.itens.length - 3}</span>` : '');
    return `<article class="pcard" data-act="abrir-pregao" data-id="${p.id}" tabindex="0" role="button">
      <div class="row between"><span class="num">COMPRA Nº ${esc(p.numero)}</span>${badgeStatus(p.status)}</div>
      <h4>${esc(p.orgao)}</h4>
      <div class="small muted row wrap" style="gap:4px 14px">${p.cidadeUf ? `<span class="row" style="gap:4px">${icon('pin', 'sm')}${esc(p.cidadeUf)}</span>` : ''}${p.sessao ? `<span class="row" style="gap:4px">${icon('calendar', 'sm')}${esc(C.fmtSessao(p.sessao))}</span>` : ''}</div>
      <div class="chips">${chips || '<span class="chip">Sem itens ainda</span>'}</div>
      <div class="nums"><div>Venda<b>${C.brl0(pst.venda)}</b></div><div>Lucro<b>${C.brl0(pst.lucro)}</b></div><div>Margem<b>${C.pct(pst.margem, 0)}</b></div></div></article>`;
  }

  function pregoesListHtml() {
    const R = C.computeAll(store.get());
    let list = [...R.pMap.values()];
    if (UI.filtro !== 'todos') list = list.filter((x) => x.p.status === UI.filtro);
    const q = UI.busca.trim().toLowerCase();
    if (q) list = list.filter((x) => (x.p.numero + ' ' + x.p.orgao + ' ' + (x.p.cidadeUf || '') + ' ' + x.itens.map((i) => i.descricao).join(' ')).toLowerCase().includes(q));
    list.sort((a, b) => (b.p.createdAt || 0) - (a.p.createdAt || 0));
    if (!list.length) return `<div class="card empty"><p class="muted">Nenhum pregão encontrado.</p></div>`;
    return `<div class="list">${list.map(pregaoCard).join('')}</div>`;
  }

  function renderPregoes() {
    if (UI.detailId) return renderDetail();
    const st = store.get();
    if (!st.pregoes.some((p) => !p.deleted)) return emptyWelcome();
    const fl = ['todos', ...C.STATUS];
    return `<div class="page">
      <div class="search">${icon('search')}<input class="input" id="busca" type="search" placeholder="Buscar por número, órgão ou item" value="${esc(UI.busca)}"></div>
      <div class="filters">${fl.map((s) => `<button data-act="filtro" data-v="${esc(s)}" class="${UI.filtro === s ? 'on' : ''}">${s === 'todos' ? 'Todos' : esc(s)}</button>`).join('')}</div>
      <div id="plist">${pregoesListHtml()}</div></div>
      <button class="fab" data-act="novo-pregao" aria-label="Novo pregão">${icon('plus')}</button>`;
  }

  function itemCard(it, c, opt) {
    const p = opt.pst && opt.pst.p;
    return `<article class="icard" data-act="editar-item" data-id="${it.id}" tabindex="0" role="button">
      <div class="row between" style="align-items:flex-start"><h4 class="grow">${esc(it.descricao)}</h4>${c.situacao ? `<span class="badge ${c.sitTipo}">${esc(c.situacao)}</span>` : ''}</div>
      ${opt.showOrg && p ? `<div class="chips"><span class="chip org">#${esc(p.numero)} · ${esc(p.orgao)}</span></div>` : ''}
      <div class="small muted">${C.qtdBR(it.qtd)} ${esc(it.unidade || 'Un')} · custo ${C.brl(it.custo)} · teto ${C.brl(c.teto)}${it.marca ? ' · ' + esc(it.marca) : ''}</div>
      <div class="minbox ${c.sitTipo === 'bad' ? 'bad' : ''}"><div><div class="t">Valor mínimo p/ proposta (unit.)</div><div class="tiny muted">margem ${C.pct(c.margem, 0)} · custo final ${C.brl(c.custoUnit)}</div></div><div class="v">${C.brl(c.minimo)}</div></div>
      <div class="row between small muted"><span>Posso baixar do teto: <b style="color:var(--ink)">${c.folgaRs != null ? C.brl(c.folgaRs) + ' (' + C.pct(c.folgaPct, 0) + ')' : '—'}</b></span><span>Lucro: <b style="color:var(--ink)">${C.brl(c.lucro)}</b></span></div></article>`;
  }

  function renderDetail() {
    const R = C.computeAll(store.get());
    const pst = R.pMap.get(UI.detailId);
    if (!pst) { UI.detailId = null; return renderPregoes(); }
    const p = pst.p;
    const kv = (k, v) => v ? `<div><span>${k}</span><b>${v}</b></div>` : '';
    return `<div class="page">
      <button class="back" data-act="voltar">${icon('back')} Pregões</button>
      <div class="hero"><span class="num">COMPRA Nº ${esc(p.numero)}</span><h2>${esc(p.orgao)}</h2>
        <div class="m">${p.cidadeUf ? `<span>${esc(p.cidadeUf)}</span>` : ''}${p.sessao ? `<span>Sessão ${esc(C.fmtSessao(p.sessao))}</span>` : ''}</div></div>
      <div class="card"><div class="field" style="margin:0"><label for="stsel">Status do pregão</label>
        <select class="input" id="stsel" data-status-pregao="${p.id}">${C.STATUS.map((s) => `<option${s === p.status ? ' selected' : ''}>${esc(s)}</option>`).join('')}</select></div></div>
      <div class="kpis">
        <div class="kpi"><div class="l">Total de venda</div><div class="v">${C.brl0(pst.venda)}</div></div>
        <div class="kpi" style="--c:#667489"><div class="l">Custo total</div><div class="v" style="color:var(--ink)">${C.brl0(pst.custo)}</div><div class="s">entrega ${C.brl0(pst.viagem)}</div></div>
        <div class="kpi" style="--c:#2f7d3a"><div class="l">Lucro</div><div class="v">${C.brl0(pst.lucro)}</div></div>
        <div class="kpi" style="--c:#b7791f"><div class="l">Margem real</div><div class="v">${C.pct(pst.margem, 1)}</div></div>
      </div>
      <div class="card"><h3><span class="grow">Itens deste pregão (${pst.nItens})</span><button class="btn sm primary" data-act="novo-item" data-pid="${p.id}">${icon('plus', 'sm')} Item</button></h3>
        ${pst.itens.length ? `<div class="list">${pst.itens.map((it) => itemCard(it, R.iMap.get(it.id), { pst, showOrg: false })).join('')}</div>` : `<p class="muted small">Nenhum item ainda. Toque em “Item” para adicionar o primeiro.</p>`}</div>
      <div class="card"><h3>Dados do pregão</h3><div class="kv-list">
        ${kv('Intervalo mín. lances', esc(p.intervaloMin))}${kv('Prazo de entrega', p.prazoEntregaDias ? esc(p.prazoEntregaDias) + ' dias' : '')}${kv('Exigências', esc(p.exigencias))}
        ${kv('Entrega de carro', p.km ? `${C.numBR(p.km, 1)} km · ${p.viagens || 0} viagem(ns)${p.pedagio ? ' · pedágio ' + C.brl(p.pedagio) : ''} = ${C.brl(pst.viagem)}` : '')}
        ${kv('Link do edital', p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.link)}</a>` : '')}${kv('Observações', esc(p.obs))}</div></div>
      <div class="grid2"><button class="btn" data-act="editar-pregao" data-id="${p.id}">${icon('edit', 'sm')} Editar dados</button>
        <button class="btn navy" data-act="pdf-pregao" data-id="${p.id}">${icon('pdf', 'sm')} Proposta PDF</button></div></div>`;
  }

  function itensListHtml() {
    const R = C.computeAll(store.get());
    const q = UI.buscaI.trim().toLowerCase();
    const groups = [...R.pMap.values()].sort((a, b) => (b.p.createdAt || 0) - (a.p.createdAt || 0));
    let html = '', n = 0;
    for (const g of groups) {
      const its = g.itens.filter((i) => !q || (i.descricao + ' ' + (i.marca || '') + ' ' + (i.onde || '') + ' ' + g.p.orgao + ' ' + g.p.numero).toLowerCase().includes(q));
      if (!its.length) continue;
      n += its.length;
      html += `<div class="grp"><h3>#${esc(g.p.numero)} · ${esc(g.p.orgao)}</h3>${badgeStatus(g.p.status)}</div><div class="list">${its.map((it) => itemCard(it, R.iMap.get(it.id), { pst: g, showOrg: true })).join('')}</div>`;
    }
    return n ? html : `<div class="card empty"><p class="muted">Nenhum item encontrado.</p></div>`;
  }
  function renderItens() {
    if (!activePregoes().length) return emptyWelcome();
    return `<div class="page"><div class="search">${icon('search')}<input class="input" id="buscaI" type="search" placeholder="Buscar item, marca, onde compro ou órgão" value="${esc(UI.buscaI)}"></div>
      <div id="ilist" class="page">${itensListHtml()}</div></div>
      <button class="fab" data-act="novo-item" aria-label="Novo item">${icon('plus')}</button>`;
  }

  /* ---------- tela PDF ---------- */
  const FONTES = [['auto', 'Lance final; sem lance, valor mínimo'], ['minimo', 'Sempre o valor mínimo (custo + margem)'], ['teto', 'Valor do edital (teto)'], ['lance', 'Só o lance final']];
  const wmTexto = (w) => (w.tipo === 'texto' ? esc(w.texto || '') : '');

  function renderPDF() {
    const st = store.get(), cfg = st.config, p = cfg.proposta, w = cfg.marcaDagua, e = cfg.empresa;
    const list = activePregoes();
    if (!list.length) return emptyWelcome();
    if (!UI.pdf.pregaoId || !list.some((x) => x.id === UI.pdf.pregaoId)) UI.pdf.pregaoId = list[0].id;
    const L = C.linhasProposta(st, UI.pdf.pregaoId, UI.pdf.fonte);
    const pz = L.pregao || {};
    const hd = cfg.cabecalho;
    const r = UI.pdf.result;
    const cf = (path, type, val, extra) => `data-cfg="${path}" data-type="${type}" value="${esc(val)}" ${extra || ''}`;
    const empOk = !!(e.nome && e.cnpj);
    return `<div class="page">
      <div class="card"><h3>1 · Qual pregão?</h3>
        <div class="field"><label for="pdfp">Pregão</label><select class="input" id="pdfp" data-ui="pregaoId">${list.map((x) => `<option value="${x.id}"${x.id === UI.pdf.pregaoId ? ' selected' : ''}>${esc(pregaoLabel(x))}</option>`).join('')}</select></div>
        <div class="field"><label for="pdff">Qual valor entra na proposta?</label><select class="input" id="pdff" data-ui="fonte">${FONTES.map(([v, l]) => `<option value="${v}"${v === UI.pdf.fonte ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="tbl-scroll"><table class="tbl"><thead><tr><th>Item</th><th class="r">Qtd</th><th class="r">Unit.</th><th class="r">Total</th></tr></thead><tbody>
          ${L.linhas.map((x) => `<tr><td>${esc(x.descricao)}${x.acimaTeto ? ' <span class="badge bad">acima do teto</span>' : ''}</td><td class="r">${C.qtdBR(x.qtd)}</td><td class="r">${x.unit != null ? C.brl(x.unit) : '<span class="badge bad">sem valor</span>'}</td><td class="r">${x.total != null ? C.brl(x.total) : '—'}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">Nenhum item neste pregão.</td></tr>'}
          </tbody><tfoot><tr><td colspan="3">Total da proposta</td><td class="r">${C.brl(L.total)}</td></tr></tfoot></table></div>
        ${L.semValor ? `<div class="alert warn" style="margin-top:10px">${icon('alert', 'sm')}<span>${L.semValor} item(ns) sem valor nesta opção. Preencha o teto ou o lance final, ou troque a opção acima.</span></div>` : ''}
      </div>
      <div class="card"><h3>2 · Dados desta proposta</h3><div class="formgrid">
        <div class="field"><label>Prazo de entrega</label><input class="input" data-ui="prazoEntrega" value="${esc(UI.pdf.prazoEntrega)}" placeholder="${pz.prazoEntregaDias ? pz.prazoEntregaDias + ' dias (do pregão)' : 'ex.: 10 dias'}"></div>
        <div class="field"><label>Local de entrega</label><input class="input" data-ui="localEntrega" value="${esc(UI.pdf.localEntrega)}" placeholder="${esc(pz.cidadeUf || 'cidade do pregão')}"></div>
        <div class="field"><label>Validade (dias)</label><input class="input" inputmode="numeric" ${cf('proposta.validadeDias', 'int', p.validadeDias)}></div>
        <div class="field"><label>Prazo de pagamento</label><input class="input" ${cf('proposta.condPagamento', 'text', p.condPagamento)}></div>
        <div class="field full"><label>Observações (aparecem no PDF)</label><textarea class="input" data-ui="observacoes" rows="2">${esc(UI.pdf.observacoes)}</textarea></div></div>
        <label class="switch"><span>Dados bancários</span><input type="checkbox" data-cfg="proposta.incluirBancarios" data-type="check" ${p.incluirBancarios ? 'checked' : ''}></label>
        <label class="switch"><span>Valor total por extenso</span><input type="checkbox" data-cfg="proposta.incluirExtenso" data-type="check" ${p.incluirExtenso ? 'checked' : ''}></label>
        <label class="switch"><span>Local e data acima da assinatura</span><input type="checkbox" data-cfg="proposta.incluirLocalData" data-type="check" ${p.incluirLocalData ? 'checked' : ''}></label>
        ${p.incluirLocalData ? `<div class="field"><label>Data do documento</label><input class="input" type="date" data-ui="data" value="${esc(UI.pdf.data)}"></div>` : ''}
        <label class="switch"><span>Declaração de preços</span><input type="checkbox" data-cfg="proposta.incluirDeclaracao" data-type="check" ${p.incluirDeclaracao ? 'checked' : ''}></label>
        ${p.incluirDeclaracao ? `<div class="field"><label>Texto da declaração</label><textarea class="input" rows="3" data-cfg="proposta.textoDeclaracao" data-type="text">${esc(p.textoDeclaracao)}</textarea></div>` : ''}
        <div class="field" style="margin-top:6px"><label>Cor do modelo (faixas, bordas e rótulos)</label><input class="input" type="color" style="padding:4px;height:46px" ${cf('proposta.cor', 'text', p.cor)}></div></div>
      <div class="card"><h3>3 · Papel timbrado (imagem do topo) <span class="grow"></span><span class="saved-ind" id="savedInd">Salvo</span></h3>
        ${hd.imagem ? `<div class="wm-prev" style="height:auto;padding:8px;margin-bottom:12px"><img alt="Papel timbrado" src="${hd.imagem}" style="max-width:100%;max-height:90px"></div>` : `<p class="small muted" style="margin-bottom:12px">Opcional. Sem imagem, o cabeçalho sai em texto com os dados da empresa.</p>`}
        <div class="row"><label class="btn sm grow" style="cursor:pointer">${icon('image', 'sm')} ${hd.imagem ? 'Trocar imagem' : 'Escolher imagem do cabeçalho'}<input type="file" accept="image/png,image/jpeg" data-hd-file class="hidden"></label>${hd.imagem ? `<button type="button" class="btn sm danger" data-act="hd-remover">${icon('trash', 'sm')}</button>` : ''}</div></div>
      <div class="card"><h3>4 · Marca d’água</h3>
        <div class="seg-ctl" role="tablist">${[['nenhuma', 'Nenhuma'], ['texto', 'Texto'], ['imagem', 'Imagem']].map(([v, l]) => `<button type="button" data-act="wm-tipo" data-v="${v}" class="${w.tipo === v ? 'on' : ''}">${l}</button>`).join('')}</div>
        <div style="height:12px"></div>
        <div class="wm-prev" id="wmPrev">${w.tipo === 'imagem' && w.imagem ? `<img alt="" src="${w.imagem}" style="opacity:${Math.max(.15, w.opacidade * 3)};transform:rotate(${-w.angulo}deg)">` : w.tipo === 'texto' ? `<span style="font-size:${Math.min(40, w.tamanho / 2)}px;opacity:${Math.max(.15, w.opacidade * 3)};transform:rotate(${-w.angulo}deg)">${wmTexto(w)}</span>` : '<span class="small muted" style="font-weight:600">Sem marca d’água</span>'}</div>
        <div style="height:12px"></div>
        ${w.tipo === 'texto' ? `<div class="field"><label>Texto</label><input class="input" ${cf('marcaDagua.texto', 'text', w.texto)}></div>` : ''}
        ${w.tipo === 'imagem' ? `<div class="row" style="margin-bottom:12px"><label class="btn sm grow" style="cursor:pointer">${icon('image', 'sm')} ${w.imagem ? 'Trocar imagem' : 'Escolher imagem'}<input type="file" accept="image/png,image/jpeg" data-wm-file class="hidden"></label>${w.imagem ? `<button type="button" class="btn sm danger" data-act="wm-remover">${icon('trash', 'sm')}</button>` : ''}</div>` : ''}
        ${w.tipo !== 'nenhuma' ? `<div class="field"><label>Opacidade: <span id="lbOp">${Math.round(w.opacidade * 100)}%</span></label><input type="range" min="2" max="60" step="1" data-cfg="marcaDagua.opacidade" data-type="pctrange" data-lb="lbOp" value="${Math.round(w.opacidade * 100)}"></div>
        <div class="field"><label>Ângulo: <span id="lbAn">${w.angulo}°</span></label><input type="range" min="-90" max="90" step="5" data-cfg="marcaDagua.angulo" data-type="range" data-lb="lbAn" data-suf="°" value="${w.angulo}"></div>
        <div class="field"><label>Tamanho: <span id="lbTm">${w.tamanho}</span></label><input type="range" min="20" max="140" step="2" data-cfg="marcaDagua.tamanho" data-type="range" data-lb="lbTm" value="${w.tamanho}"></div>` : ''}
      </div>
      ${empOk ? '' : `<div class="alert info">${icon('info', 'sm')}<div class="grow">Preencha o nome e o CNPJ da empresa em <b>Config</b> para sair no cabeçalho da proposta.</div><button class="btn sm" data-act="tab" data-v="config">Abrir</button></div>`}
      <button class="btn primary block" data-act="pdf-gerar" ${UI.pdf.busy ? 'disabled' : ''}>${icon('pdf')} ${UI.pdf.busy ? 'Gerando…' : 'Gerar PDF da proposta'}</button>
      ${r ? `<div class="card"><h3>PDF pronto</h3><p class="small"><b>${esc(r.name)}</b><br><span class="muted">${r.paginas} página(s) · total ${C.brl(r.total)}</span></p>
        ${r.semValor ? `<div class="alert warn" style="margin:10px 0">${icon('alert', 'sm')}<span>Gerado com ${r.semValor} item(ns) sem valor.</span></div>` : ''}
        <div class="grid2" style="margin-top:12px"><button class="btn" data-act="pdf-abrir">${icon('eye', 'sm')} Abrir</button><button class="btn" data-act="pdf-baixar">${icon('download', 'sm')} Baixar</button></div>
        ${navigator.canShare ? `<button class="btn block" style="margin-top:10px" data-act="pdf-compartilhar">${icon('share', 'sm')} Compartilhar</button>` : ''}</div>` : ''}
    </div>`;
  }

  let pdfLibPromise = null;
  function ensurePdfLib() {
    if (window.PDFLib) return Promise.resolve();
    if (!pdfLibPromise) {
      pdfLibPromise = new Promise((res, rej) => {
        const s = document.createElement('script');
        s.src = 'js/vendor/pdf-lib.min.js'; s.onload = res; s.onerror = () => { pdfLibPromise = null; rej(new Error('Não consegui carregar o gerador de PDF (sem internet na primeira vez?)')); };
        document.head.appendChild(s);
      });
    }
    return pdfLibPromise;
  }
  function commitAllPending() { $$('[data-cfg]').forEach((el) => { if (Guard.pending.has(el.dataset.cfg)) commitCfg(el); }); }
  async function gerarPDF() {
    commitAllPending();
    const id = UI.pdf.pregaoId;
    if (!id) { toast('Escolha um pregão'); return; }
    UI.pdf.busy = true; render();
    try {
      await ensurePdfLib();
      const res = await window.PropostaPDF.gerarProposta(store.get(), id, { fonte: UI.pdf.fonte, prazoEntrega: UI.pdf.prazoEntrega.trim(), localEntrega: UI.pdf.localEntrega.trim(), observacoes: UI.pdf.observacoes.trim(), data: UI.pdf.data || C.hojeISO() });
      if (UI.pdf.result) URL.revokeObjectURL(UI.pdf.result.url);
      const blob = new Blob([res.bytes], { type: 'application/pdf' });
      UI.pdf.result = { blob, url: URL.createObjectURL(blob), name: res.filename, total: res.total, paginas: res.paginas, semValor: res.semValor };
      toast('PDF gerado');
    } catch (e) { console.error(e); toast('Erro ao gerar o PDF: ' + (e.message || e)); }
    UI.pdf.busy = false; render();
    const card = $('#main .card:last-child'); if (card && UI.pdf.result) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  function baixarPDF() {
    const r = UI.pdf.result; if (!r) return;
    const a = document.createElement('a'); a.href = r.url; a.download = r.name; document.body.appendChild(a); a.click(); a.remove();
  }
  async function compartilharPDF() {
    const r = UI.pdf.result; if (!r) return;
    try {
      const file = new File([r.blob], r.name, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) await navigator.share({ files: [file], title: r.name });
      else baixarPDF();
    } catch (e) { if (e && e.name !== 'AbortError') toast('Não foi possível compartilhar'); }
  }

  /* ---------- config ---------- */
  function renderConfig() {
    const st = store.get(), c = st.config, e = c.empresa;
    const lim = C.limiteMEI(c);
    const cf = (path, type, val, ph) => `data-cfg="${path}" data-type="${type}" value="${esc(val == null ? '' : val)}"${ph ? ` placeholder="${esc(ph)}"` : ''}`;
    const fld = (label, path, type, val, o) => `<div class="field${o && o.full ? ' full' : ''}"><label>${label}</label><input class="input" ${o && o.im ? `inputmode="${o.im}"` : ''} ${cf(path, type, val, o && o.ph)}>${o && o.hint ? `<div class="hint">${o.hint}</div>` : ''}</div>`;
    const syncCls = S.state === 'erro' ? 'err' : (S.state === 'offline' ? 'off' : '');
    return `<div class="page">
      <div class="row between"><h2 style="font-size:17px">Configurações</h2><span class="saved-ind" id="savedInd">Salvo</span></div>
      <p class="small muted" style="margin-top:-8px">As alterações são salvas automaticamente.</p>
      <div class="card"><h3>Margem e entrega de carro</h3><div class="formgrid">
        ${fld('Minha margem padrão (%)', 'margemPadrao', 'pct', C.numBR(c.margemPadrao * 100, 2), { im: 'decimal', hint: 'Sobre o preço de venda. Vale para itens sem margem própria.' })}
        ${fld('Consumo do carro (km/l)', 'consumo', 'num', C.numBR(c.consumo, 2), { im: 'decimal' })}
        ${fld('Combustível (R$/l)', 'combustivel', 'num', C.numBR(c.combustivel, 2), { im: 'decimal' })}
        ${fld('Desgaste do carro (R$/km)', 'desgaste', 'num', C.numBR(c.desgaste, 2), { im: 'decimal', hint: 'Pneu, óleo, manutenção. Estimativa: ajuste ou zere.' })}</div></div>
      <div class="card"><h3>Limite do MEI</h3><div class="formgrid">
        ${fld('Ano de referência', 'anoRef', 'int', c.anoRef, { im: 'numeric' })}
        ${fld('Limite anual cheio (R$)', 'limiteCheio', 'num', C.numBR(c.limiteCheio, 2), { im: 'decimal', hint: 'Valor de referência. Confirme o vigente.' })}
        ${fld('Ano de abertura do MEI', 'anoAbertura', 'intnull', c.anoAbertura == null ? '' : c.anoAbertura, { im: 'numeric', hint: 'Só se abriu no ano de referência.' })}
        ${fld('Mês de abertura (1 a 12)', 'mesAbertura', 'intnull', c.mesAbertura == null ? '' : c.mesAbertura, { im: 'numeric', hint: 'No ano da abertura o limite é proporcional.' })}
        ${fld('Faturado fora do app no ano (R$)', 'fatFora', 'num', C.numBR(c.fatFora, 2), { im: 'decimal', full: true, hint: 'Notas já emitidas que não estão nos pregões.' })}</div>
        <div class="alert info" style="margin-top:6px">${icon('info', 'sm')}<span id="limAplic">Limite aplicável no ano: <b>${C.brl(lim)}</b></span></div>
        <p class="tiny muted" style="margin-top:8px">Excesso sobre o limite tem regras próprias (até 20% gera DAS complementar; acima disso, desenquadramento). Confirme com um contador.</p></div>
      <div class="card"><h3>Empresa (cabeçalho da proposta)</h3><div class="formgrid">
        ${fld('Nome / razão social', 'empresa.nome', 'text', e.nome, { full: true, ph: 'ex.: JOÃO DA SILVA 00000000000' })}
        ${fld('CNPJ', 'empresa.cnpj', 'text', e.cnpj, { im: 'numeric', ph: '00.000.000/0001-00' })}
        ${fld('CPF do titular (assinatura)', 'empresa.cpf', 'text', e.cpf, { im: 'numeric', ph: '000.000.000-00' })}
        ${fld('Nome do titular (assinatura)', 'empresa.responsavel', 'text', e.responsavel, { full: true })}
        ${fld('Endereço', 'empresa.endereco', 'text', e.endereco, { full: true })}
        ${fld('Cidade/UF (local da assinatura)', 'empresa.cidade', 'text', e.cidade)}
        ${fld('Telefone', 'empresa.telefone', 'text', e.telefone, { im: 'tel' })}
        ${fld('E-mail', 'empresa.email', 'text', e.email, { full: true, im: 'email' })}</div></div>
      <div class="card"><h3>Dados bancários (na proposta)</h3><div class="formgrid">
        ${fld('Banco', 'empresa.banco', 'text', e.banco, { ph: '077 - INTER' })}
        ${fld('Agência', 'empresa.agencia', 'text', e.agencia, { im: 'numeric' })}
        ${fld('Conta', 'empresa.conta', 'text', e.conta)}
        ${fld('PIX', 'empresa.pix', 'text', e.pix)}
        ${fld('Favorecido', 'empresa.favorecido', 'text', e.favorecido, { full: true, hint: 'Vazio = usa o nome da empresa.' })}</div></div>
      <div class="card"><h3>Dados e backup</h3>
        <div class="grid2"><button class="btn" data-act="export">${icon('download', 'sm')} Exportar</button><label class="btn" style="cursor:pointer">${icon('plus', 'sm')} Importar<input type="file" accept="application/json,.json" data-import class="hidden"></label></div>
        <div class="grid2" style="margin-top:10px"><button class="btn" data-act="demo">Dados de exemplo</button><button class="btn danger" data-act="apagar">${icon('trash', 'sm')} Apagar tudo</button></div></div>
      <div class="card"><h3>Aplicativo</h3><div class="kv-list">
        <div><span>Versão</span><b>${C.APP_VERSION}</b></div>
        <div><span>Sincronização</span><b id="syncMsg">${esc(S.message)}</b></div></div>
        <div class="grid2" style="margin-top:12px"><button class="btn" data-act="atualizar">${icon('refresh', 'sm')} Buscar atualização</button>
          ${S.enabled ? `<button class="btn" data-act="sync-agora">${icon('cloud', 'sm')} Sincronizar</button>` : `<button class="btn" disabled>${icon('cloud', 'sm')} Sync (em breve)</button>`}</div>
        ${UI.deferredPrompt ? `<button class="btn primary block" style="margin-top:10px" data-act="instalar">Instalar o app</button>` : ''}
        <p class="tiny muted" style="margin-top:10px">iPhone/iPad: toque em Compartilhar › “Adicionar à Tela de Início”. Android/PC: menu do navegador › “Instalar app”.</p></div></div>`;
  }

  /* ---------- render geral ---------- */
  function render() {
    const main = $('#main');
    const a = document.activeElement;
    if (a && main.contains(a) && /INPUT|TEXTAREA|SELECT/.test(a.tagName) && Guard.pending.size) return;
    const y = window.scrollY;
    const fn = { painel: renderPainel, pregoes: renderPregoes, itens: renderItens, pdf: renderPDF, config: renderConfig }[UI.tab];
    main.innerHTML = fn();
    $$('.nav button').forEach((b) => b.classList.toggle('on', b.dataset.v === UI.tab));
    const t = TABS.find((x) => x.id === UI.tab);
    $('#subt').textContent = UI.tab === 'pregoes' && UI.detailId ? 'Detalhe do pregão' : t.title;
    if (UI.keepScroll) { window.scrollTo(0, y); UI.keepScroll = false; }
    updateStatusPill();
  }
  function setTab(v) {
    if (Guard.pending.size) commitAllPending();
    UI.tab = v; if (v !== 'pregoes') UI.detailId = null;
    saveUI(); render(); window.scrollTo(0, 0);
  }
  function updateStatusPill() {
    const el = $('#pill'); if (!el) return;
    let cls = '', txt = 'Salvo no aparelho';
    if (!navigator.onLine) { cls = 'off'; txt = 'Offline · salvo no aparelho'; }
    if (S.enabled) { txt = S.state === 'sync' ? 'Sincronizando…' : (S.state === 'erro' ? 'Falha no sync' : (navigator.onLine ? 'Sincronizado' : txt)); if (S.state === 'erro') cls = 'err'; }
    el.className = 'pill ' + cls; el.innerHTML = `<span class="dot"></span>${esc(txt)}`;
  }

  /* ---------- config autosave ---------- */
  let savedT;
  function flashSaved() { const el = $('#savedInd'); if (!el) return; el.classList.add('show'); clearTimeout(savedT); savedT = setTimeout(() => el.classList.remove('show'), 1400); }
  function readCfgValue(el) {
    const t = el.dataset.type;
    if (t === 'check') return el.checked;
    if (t === 'range') return Number(el.value);
    if (t === 'pctrange') return Number(el.value) / 100;
    if (t === 'text') return el.value;
    if (t === 'int') { const n = parseInt(el.value, 10); return isFinite(n) ? n : undefined; }
    if (t === 'intnull') { const n = parseInt(el.value, 10); return isFinite(n) ? n : null; }
    if (t === 'pct') { const n = C.parseBR(el.value); return n == null ? undefined : Math.min(95, Math.max(0, n)) / 100; }
    if (t === 'num') { const n = C.parseBR(el.value); return n == null ? undefined : Math.max(0, n); }
    return el.value;
  }
  function commitCfg(el) {
    const path = el.dataset.cfg;
    Guard.pending.delete(path);
    const v = readCfgValue(el);
    if (v === undefined) { render(); return; } // valor inválido: volta ao que estava salvo
    store.setConfigPath(path, v, { silent: true });
    flashSaved();
    if (/^(anoRef|limiteCheio|anoAbertura|mesAbertura)$/.test(path)) { const e = $('#limAplic'); if (e) e.innerHTML = `Limite aplicável no ano: <b>${C.brl(C.limiteMEI(store.get().config))}</b>`; }
    if (path.startsWith('marcaDagua.')) refreshWmPreview();
  }
  function refreshWmPreview() {
    const w = store.get().config.marcaDagua, el = $('#wmPrev'); if (!el) return;
    if (w.tipo === 'texto') el.innerHTML = `<span style="font-size:${Math.min(40, w.tamanho / 2)}px;opacity:${Math.max(.15, w.opacidade * 3)};transform:rotate(${-w.angulo}deg)">${esc(w.texto || '')}</span>`;
    else if (w.tipo === 'imagem' && w.imagem) el.innerHTML = `<img alt="" src="${w.imagem}" style="opacity:${Math.max(.15, w.opacidade * 3)};transform:rotate(${-w.angulo}deg)">`;
  }
  function downscaleImage(file, max) {
    return new Promise((resolve, reject) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        resolve(file.type === 'image/png' ? cv.toDataURL('image/png') : cv.toDataURL('image/jpeg', 0.88));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagem inválida')); };
      img.src = url;
    });
  }

  /* ---------- eventos ---------- */
  function onClick(e) {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const a = t.dataset.act, id = t.dataset.id;
    switch (a) {
      case 'tab': setTab(t.dataset.v); break;
      case 'novo-pregao': openPregaoForm(); break;
      case 'editar-pregao': openPregaoForm(id); break;
      case 'abrir-pregao': UI.tab = 'pregoes'; UI.detailId = id; history.pushState({ detail: id }, ''); saveUI(); render(); window.scrollTo(0, 0); break;
      case 'voltar': if (history.state && history.state.detail) history.back(); else { UI.detailId = null; render(); } break;
      case 'novo-item': openItemForm(null, t.dataset.pid); break;
      case 'editar-item': openItemForm(id); break;
      case 'filtro': UI.filtro = t.dataset.v; UI.keepScroll = true; render(); break;
      case 'rascunho': openDraft(t.dataset.key); break;
      case 'demo': store.mergeDemo(); toast('Dados de exemplo carregados'); break;
      case 'pdf-pregao': UI.pdf.pregaoId = id; UI.pdf.result = null; setTab('pdf'); break;
      case 'pdf-gerar': gerarPDF(); break;
      case 'pdf-abrir': if (UI.pdf.result) window.open(UI.pdf.result.url, '_blank'); break;
      case 'pdf-baixar': baixarPDF(); break;
      case 'pdf-compartilhar': compartilharPDF(); break;
      case 'wm-tipo': commitAllPending(); store.setConfigPath('marcaDagua.tipo', t.dataset.v, { silent: true }); UI.keepScroll = true; render(); break;
      case 'hd-remover': store.setConfigPath('cabecalho.imagem', null, { silent: true }); UI.keepScroll = true; render(); break;
      case 'wm-remover': store.setConfigPath('marcaDagua.imagem', null, { silent: true }); UI.keepScroll = true; render(); break;
      case 'export': {
        const blob = new Blob([store.export()], { type: 'application/json' });
        const el = document.createElement('a'); el.href = URL.createObjectURL(blob); el.download = `pregoes-mei-backup-${C.hojeISO()}.json`; document.body.appendChild(el); el.click(); el.remove();
        setTimeout(() => URL.revokeObjectURL(el.href), 4000); toast('Backup exportado'); break;
      }
      case 'apagar': confirmar('Apagar todos os dados?', 'Pregões e itens serão removidos deste aparelho (e do servidor, quando a sincronização estiver ligada). Exporte um backup antes se precisar.', 'Apagar tudo', true).then((ok) => { if (ok) { store.clearAll(); toast('Dados apagados'); } }); break;
      case 'atualizar': checkUpdate(true); break;
      case 'sync-agora': S.run('manual').then((r) => { if (r && r.ok) toast('Sincronizado'); updateStatusPill(); }); break;
      case 'instalar': if (UI.deferredPrompt) { UI.deferredPrompt.prompt(); UI.deferredPrompt.userChoice.finally(() => { UI.deferredPrompt = null; render(); }); } break;
      case 'banner-atualizar': location.reload(); break;
      default: break;
    }
  }
  function onInput(e) {
    const t = e.target;
    if (t.id === 'busca') { UI.busca = t.value; $('#plist').innerHTML = pregoesListHtml(); return; }
    if (t.id === 'buscaI') { UI.buscaI = t.value; $('#ilist').innerHTML = itensListHtml(); return; }
    if (t.dataset.ui) {
      if (t.dataset.ui === 'pregaoId' || t.dataset.ui === 'fonte') return; // selects: tratados em change
      UI.pdf[t.dataset.ui] = t.value; return;
    }
    if (t.dataset.cfg) {
      Guard.pending.add(t.dataset.cfg);
      if (t.dataset.lb) { const lb = $('#' + t.dataset.lb); if (lb) lb.textContent = t.value + (t.dataset.type === 'pctrange' ? '%' : (t.dataset.suf || '')); }
    }
  }
  function onChange(e) {
    const t = e.target;
    if (t.dataset.ui === 'pregaoId') { UI.pdf.pregaoId = t.value; UI.pdf.result = null; saveUI(); UI.keepScroll = true; render(); return; }
    if (t.dataset.ui === 'fonte') { UI.pdf.fonte = t.value; UI.pdf.result = null; saveUI(); UI.keepScroll = true; render(); return; }
    if (t.dataset.ui) { UI.pdf[t.dataset.ui] = t.value; return; }
    if (t.dataset.cfg) { commitCfg(t); return; }
    if (t.dataset.statusPregao) { store.upsertPregao({ id: t.dataset.statusPregao, status: t.value }); toast('Status: ' + t.value); return; }
    if (t.hasAttribute('data-hd-file') && t.files && t.files[0]) {
      downscaleImage(t.files[0], 1800).then((url) => {
        store.setConfigPath('cabecalho.imagem', url, { silent: true });
        UI.keepScroll = true; render(); toast('Papel timbrado salvo');
      }).catch((err) => toast(err.message || 'Não foi possível usar essa imagem'));
      return;
    }
    if (t.hasAttribute('data-wm-file') && t.files && t.files[0]) {
      downscaleImage(t.files[0], 1000).then((url) => {
        store.setConfigPath('marcaDagua.imagem', url, { silent: true }); store.setConfigPath('marcaDagua.tipo', 'imagem', { silent: true });
        UI.keepScroll = true; render(); toast('Imagem da marca d’água salva');
      }).catch((err) => toast(err.message || 'Não foi possível usar essa imagem'));
      return;
    }
    if (t.hasAttribute('data-import') && t.files && t.files[0]) importarBackup(t.files[0]);
  }
  async function importarBackup(file) {
    try {
      const data = JSON.parse(await file.text());
      if (!data || !Array.isArray(data.pregoes) || !Array.isArray(data.itens)) throw new Error('Arquivo não parece um backup do app.');
      const v = await dialog({ title: 'Importar backup', text: `${data.pregoes.length} pregão(ões) e ${data.itens.length} item(ns).`, buttons: [{ label: 'Mesclar com os dados atuais', value: 'mesclar', cls: 'primary' }, { label: 'Substituir tudo', value: 'subst', cls: 'danger' }, { label: 'Cancelar', value: null, cls: 'ghost' }] });
      if (v === 'mesclar') { store.mergeFrom(data); toast('Backup mesclado'); }
      else if (v === 'subst') { store.replaceAll(data); toast('Backup restaurado'); }
    } catch (e) { toast(e.message || 'Não foi possível ler o arquivo'); }
    $$('[data-import]').forEach((i) => { i.value = ''; });
  }

  /* ---------- atualização forçada (servidor primeiro) ---------- */
  let hadController = !!(navigator.serviceWorker && navigator.serviceWorker.controller);
  let swReg = null;
  function afterClose() { if (UI.reloadPending && !isDirty()) location.reload(); }
  function showUpdateBanner() {
    if ($('.banner')) return;
    const b = document.createElement('div'); b.className = 'banner'; b.setAttribute('role', 'status');
    b.innerHTML = `<span class="grow">Nova versão instalada. Conclua o que está digitando e atualize.</span><button class="btn sm" data-act="banner-atualizar">Atualizar</button>`;
    document.body.appendChild(b); b.addEventListener('click', onClick);
  }
  function applyUpdate() {
    if (!isDirty()) location.reload();
    else { UI.reloadPending = true; showUpdateBanner(); }
  }
  async function checkUpdate(manual) {
    if (!swReg) { if (manual) toast('Atualização automática indisponível neste navegador'); return; }
    try {
      await swReg.update();
      if (manual) setTimeout(() => { if (!UI.reloadPending) toast('Você está na versão mais recente (' + C.APP_VERSION + ')'); }, 1500);
    } catch (e) { if (manual) toast('Sem conexão para buscar atualização'); }
  }
  async function initSW() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    try {
      swReg = await navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' });
    } catch (e) { console.warn('SW', e); return; }
    // servidor primeiro: a cada abertura, volta ao app e reconexão
    checkUpdate(false);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) checkUpdate(false); });
    window.addEventListener('online', () => checkUpdate(false));
    setInterval(() => checkUpdate(false), 20 * 60 * 1000);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) { hadController = true; return; } // primeira instalação: não recarrega
      applyUpdate();
    });
  }

  /* ---------- inicialização ---------- */
  function buildShell() {
    $('#app').innerHTML = `<div class="shell">
      <header class="topbar"><img class="logo" src="icons/icon-96.png" alt="" width="34" height="34"><div class="grow"><h1>Pregões MEI</h1><div class="sub" id="subt"></div></div><span class="pill" id="pill"></span></header>
      <nav class="nav" aria-label="Seções">${TABS.map((t) => `<button data-v="${t.id}" aria-label="${t.t}">${icon(t.id)}<span>${t.t}</span></button>`).join('')}</nav>
      <main class="main" id="main" tabindex="-1"></main></div>`;
    $('.nav').addEventListener('click', (e) => { const b = e.target.closest('button[data-v]'); if (b) setTab(b.dataset.v); });
    const main = $('#main');
    main.addEventListener('click', onClick);
    main.addEventListener('input', onInput);
    main.addEventListener('change', onChange);
    main.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('article[data-act]')) { e.preventDefault(); e.target.click(); } });
  }

  function boot() {
    buildShell();
    store.on((kind) => {
      if (kind === 'error') { toast('Armazenamento do aparelho cheio. Exporte um backup e libere espaço.'); return; }
      S.schedule('alteração');
      if (kind === 'change') render(); else updateStatusPill();
    });
    S.on(() => { updateStatusPill(); const m = $('#syncMsg'); if (m) m.textContent = S.message; });
    window.addEventListener('online', updateStatusPill); window.addEventListener('offline', updateStatusPill);
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); UI.deferredPrompt = e; if (UI.tab === 'config') render(); });
    window.addEventListener('appinstalled', () => { UI.deferredPrompt = null; toast('App instalado'); });

    // atalhos do manifesto (?acao=novo-pregao / ?tab=pdf)
    const q = new URLSearchParams(location.search);
    if (q.get('tab') && TABS.some((t) => t.id === q.get('tab'))) UI.tab = q.get('tab');
    render();
    if (q.get('acao') === 'novo-pregao') openPregaoForm();
    if (q.has('tab') || q.has('acao') || q.has('source')) history.replaceState(null, '', location.pathname);
    initSW();
    S.run('abertura'); // sincroniza ao abrir (puxa primeiro, depois envia)
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.__app = { store, UI, render, openPregaoForm, openItemForm, Guard, Sheet, Draft }; // facilita testes/depuração
})();
