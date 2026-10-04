/* Pregões MEI — núcleo (cálculos, formatação, armazenamento e merge)
 * Sem dependências. Funciona no navegador (window.Core) e no Node (testes). */
(function (root) {
  'use strict';

  const APP_VERSION = '1.0.0';
  const STATUS = ['Analisando', 'Proposta enviada', 'Em disputa', 'Ganhou', 'Faturado', 'Perdeu', 'Desclassificado', 'Desisti'];
  const INATIVOS = ['Perdeu', 'Desclassificado', 'Desisti'];
  const DECL_PADRAO =
    'Declaramos que, nos preços ofertados, estão incluídas todas as despesas com tributos, fretes, embalagens, ' +
    'seguros e demais custos necessários ao fornecimento, e que concordamos com todas as condições do edital.';

  /* ---------- utilitários ---------- */
  const uid = () =>
    (root.crypto && root.crypto.randomUUID)
      ? root.crypto.randomUUID()
      : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

  const n0 = (v) => (v === null || v === undefined || v === '' || !isFinite(v)) ? 0 : Number(v);
  const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
  // equivalente ao ROUNDUP(x, 2) da planilha (sempre para cima, em centavos)
  const ceil2 = (x) => Math.ceil(Math.round(x * 100 * 1e6) / 1e6 - 1e-9) / 100;

  // "1.234,56" | "19,5" | "19.50" | "R$ 20" | "20%" -> número (ou null)
  function parseBR(v) {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return isFinite(v) ? v : null;
    let s = String(v).trim();
    if (s === '') return null;
    s = s.replace(/[R$\s%]/g, '');
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    const n = Number(s);
    return isFinite(n) ? n : null;
  }

  const _brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const _brl0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const brl = (n) => (n === null || n === undefined || n === '' || !isFinite(n)) ? '—' : _brl.format(n);
  const brl0 = (n) => (n === null || n === undefined || n === '' || !isFinite(n)) ? '—' : _brl0.format(n);
  const pct = (n, d = 1) => (n === null || n === undefined || !isFinite(n)) ? '—' : (n * 100).toFixed(d).replace('.', ',') + '%';
  const numBR = (n, d = 2) => (n === null || n === undefined || !isFinite(n)) ? '' : String(Number(Number(n).toFixed(d))).replace('.', ',');
  const qtdBR = (n) => (n === null || n === undefined || !isFinite(n)) ? '—' : new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(n);

  // 'YYYY-MM-DDTHH:mm' -> '10/09/2026 10:00'
  function fmtSessao(s) {
    if (!s) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(s);
    if (!m) return s;
    return `${m[3]}/${m[2]}/${m[1]}` + (m[4] ? ` ${m[4]}:${m[5]}` : '');
  }
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  // 'YYYY-MM-DD' -> '3 de outubro de 2026'
  function dataExtensa(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || '');
    if (!m) return '';
    return `${Number(m[3])} de ${MESES[Number(m[2]) - 1]} de ${m[1]}`;
  }
  const hojeISO = () => {
    const d = new Date();
    const p = (x) => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };

  /* ---------- estado padrão ---------- */
  const defaultConfig = () => ({
    margemPadrao: 0.20,
    consumo: 10,
    combustivel: 6,
    desgaste: 0.30,
    anoRef: new Date().getFullYear(),
    limiteCheio: 81000,
    anoAbertura: null,
    mesAbertura: null,
    fatFora: 0,
    empresa: {
      nome: '', cnpj: '', cpf: '', endereco: '', cidade: 'Telêmaco Borba/PR', telefone: '', email: '', responsavel: '',
      banco: '', agencia: '', conta: '', pix: '', favorecido: '',
    },
    proposta: {
      validadeDias: 60, condPagamento: '30 dias', textoDeclaracao: DECL_PADRAO, cor: '#FFC000',
      incluirExtenso: true, incluirBancarios: true, incluirDeclaracao: false, incluirLocalData: false,
    },
    cabecalho: { imagem: null },
    marcaDagua: { tipo: 'texto', texto: 'PROPOSTA COMERCIAL', imagem: null, opacidade: 0.12, angulo: 0, tamanho: 64 },
    updatedAt: 0,
  });

  const emptyState = () => ({ version: 1, config: defaultConfig(), pregoes: [], itens: [] });

  function migrate(s) {
    const d = defaultConfig();
    const c = (s && s.config) || {};
    return {
      version: 1,
      config: Object.assign({}, d, c, {
        empresa: Object.assign({}, d.empresa, c.empresa),
        proposta: Object.assign({}, d.proposta, c.proposta),
        marcaDagua: Object.assign({}, d.marcaDagua, c.marcaDagua),
        cabecalho: Object.assign({}, d.cabecalho, c.cabecalho),
      }),
      pregoes: Array.isArray(s && s.pregoes) ? s.pregoes : [],
      itens: Array.isArray(s && s.itens) ? s.itens : [],
    };
  }

  /* ---------- cálculo (espelha a planilha) ---------- */
  function custoViagem(p, cfg) {
    const consumo = n0(cfg.consumo);
    if (consumo === 0) return 0;
    return (n0(p.km) / consumo * n0(cfg.combustivel) + n0(p.km) * n0(cfg.desgaste) + n0(p.pedagio)) * n0(p.viagens);
  }

  function calcItem(it, pst, cfg) {
    const qtd = n0(it.qtd), custo = n0(it.custo), frete = n0(it.frete);
    const compra = qtd * custo + frete;
    const entrega = pst && pst.base > 0 ? pst.viagem * compra / pst.base : 0;
    const custoTotal = compra + entrega;
    const custoUnit = qtd > 0 ? custoTotal / qtd : null;
    const margem = (it.margem !== null && it.margem !== undefined) ? it.margem : cfg.margemPadrao;
    const minimo = (custoUnit !== null && margem < 1) ? ceil2(custoUnit / (1 - margem)) : null;
    const teto = (it.teto !== null && it.teto !== undefined) ? it.teto : null;
    const lance = (it.lanceFinal !== null && it.lanceFinal !== undefined) ? it.lanceFinal : null;
    const folgaRs = (minimo !== null && teto !== null) ? teto - minimo : null;
    const folgaPct = (minimo !== null && teto !== null && teto > 0) ? 1 - minimo / teto : null;
    let totalVenda = null;
    if (lance !== null) totalVenda = qtd * lance; else if (teto !== null) totalVenda = qtd * teto;
    const lucro = totalVenda !== null ? totalVenda - custoTotal : null;
    let situacao = '', sitTipo = '';
    if (minimo !== null && teto !== null) {
      if (minimo > teto) { situacao = 'Inviável: mínimo acima do teto'; sitTipo = 'bad'; }
      else if (lance !== null && lance < minimo) { situacao = 'Lance abaixo do mínimo'; sitTipo = 'bad'; }
      else { situacao = 'OK'; sitTipo = 'ok'; }
    }
    return { compra, entrega, custoTotal, custoUnit, margem, minimo, teto, lance, folgaRs, folgaPct, totalVenda, lucro, situacao, sitTipo, produtos: qtd * custo, frete };
  }

  function limiteMEI(cfg) {
    const ab = Number(cfg.anoAbertura), mes = Number(cfg.mesAbertura);
    if (ab && mes >= 1 && mes <= 12 && ab === Number(cfg.anoRef)) return round2(n0(cfg.limiteCheio) / 12 * (13 - mes));
    return n0(cfg.limiteCheio);
  }

  function computeAll(state) {
    const cfg = state.config;
    const pregoes = state.pregoes.filter((p) => !p.deleted);
    const itens = state.itens.filter((i) => !i.deleted);
    const byP = new Map();
    for (const it of itens) {
      if (!byP.has(it.pregaoId)) byP.set(it.pregaoId, []);
      byP.get(it.pregaoId).push(it);
    }
    const pMap = new Map();
    for (const p of pregoes) {
      const list = byP.get(p.id) || [];
      let base = 0;
      for (const it of list) base += n0(it.qtd) * n0(it.custo) + n0(it.frete);
      pMap.set(p.id, { p, viagem: custoViagem(p, cfg), base, itens: list, nItens: list.length, venda: 0, custo: 0, lucro: 0, margem: null });
    }
    const iMap = new Map();
    for (const it of itens) {
      const pst = pMap.get(it.pregaoId) || null;
      const c = calcItem(it, pst, cfg);
      iMap.set(it.id, c);
      if (pst) { pst.custo += c.custoTotal; pst.venda += c.totalVenda || 0; pst.lucro += c.lucro || 0; }
    }
    for (const pst of pMap.values()) pst.margem = pst.venda > 0 ? pst.lucro / pst.venda : null;

    // limite do MEI
    const limite = limiteMEI(cfg);
    let somaFat = 0, aFaturar = 0, emDisputa = 0;
    for (const pst of pMap.values()) {
      const s = pst.p.status;
      if (s === 'Faturado') somaFat += pst.venda;
      else if (s === 'Ganhou') aFaturar += pst.venda;
      else if (s === 'Proposta enviada' || s === 'Em disputa') emDisputa += pst.venda;
    }
    const faturado = n0(cfg.fatFora) + somaFat;
    const comprometido = faturado + aFaturar;
    const mei = {
      limite, faturado, aFaturar, comprometido, emDisputa,
      saldoAgora: limite - comprometido,
      saldoSeGanhar: limite - comprometido - emDisputa,
      pctComprometido: limite > 0 ? comprometido / limite : 0,
      pctComTudo: limite > 0 ? (comprometido + emDisputa) / limite : 0,
    };
    mei.alerta = mei.saldoAgora < 0 ? 'bad' : (mei.saldoSeGanhar < 0 ? 'warn' : 'ok');

    // por status
    const statusRows = STATUS.map((s) => {
      let count = 0, venda = 0, lucro = 0;
      for (const pst of pMap.values()) if (pst.p.status === s) { count++; venda += pst.venda; lucro += pst.lucro; }
      return { status: s, count, venda, lucro };
    });

    // composição do preço (pregões ativos)
    const comp = { produtos: 0, frete: 0, entrega: 0, lucro: 0, venda: 0 };
    for (const it of itens) {
      const pst = pMap.get(it.pregaoId);
      if (!pst || INATIVOS.includes(pst.p.status)) continue;
      const c = iMap.get(it.id);
      comp.produtos += c.produtos; comp.frete += c.frete; comp.entrega += c.entrega; comp.lucro += c.lucro || 0;
    }
    comp.venda = comp.produtos + comp.frete + comp.entrega + comp.lucro;

    // próximas sessões
    const agora = Date.now();
    const proximas = [...pMap.values()]
      .filter((x) => x.p.sessao && !INATIVOS.includes(x.p.status) && x.p.status !== 'Faturado')
      .map((x) => ({ x, t: new Date(x.p.sessao).getTime() }))
      .filter((o) => isFinite(o.t) && o.t >= agora)
      .sort((a, b) => a.t - b.t)
      .map((o) => o.x);

    return { pMap, iMap, mei, statusRows, comp, proximas, lucroPrevisto: comp.lucro };
  }

  // calcula um item "em edição" (ainda não salvo), recalculando o rateio da entrega do pregão
  function previewItem(state, draft) {
    const itens = state.itens.filter((i) => i.id !== draft.id && !i.deleted).concat([Object.assign({}, draft, { deleted: false })]);
    const R = computeAll(Object.assign({}, state, { itens }));
    return R.iMap.get(draft.id) || null;
  }

  /* ---------- linhas da proposta (PDF) ---------- */
  // fonte: 'auto' (lance final, senão mínimo) | 'minimo' | 'teto' | 'lance'
  function linhasProposta(state, pregaoId, fonte) {
    const R = computeAll(state);
    const pst = R.pMap.get(pregaoId);
    if (!pst) return { linhas: [], total: 0, semValor: 0 };
    const linhas = [];
    let total = 0, semValor = 0, n = 0;
    for (const it of pst.itens) {
      const c = R.iMap.get(it.id);
      let unit = null;
      if (fonte === 'minimo') unit = c.minimo;
      else if (fonte === 'teto') unit = c.teto;
      else if (fonte === 'lance') unit = c.lance;
      else unit = c.lance !== null ? c.lance : c.minimo;
      n += 1;
      const qtd = n0(it.qtd);
      const tot = unit !== null ? round2(qtd * unit) : null;
      if (unit === null) semValor += 1; else total += tot;
      linhas.push({
        n, numeroItem: (it.itemEdital && String(it.itemEdital).trim()) || String(n).padStart(2, '0'),
        descricao: it.descricao || '', descEdital: (it.descEdital && it.descEdital.trim()) || it.descricao || '',
        marca: it.marca || '', un: it.unidade || 'Un', qtd,
        unit, total: tot, teto: c.teto, acimaTeto: (unit !== null && c.teto !== null && unit > c.teto + 1e-9),
      });
    }
    return { linhas, total: round2(total), semValor, pregao: pst.p };
  }

  /* ---------- merge (sincronização: sempre puxa antes de empurrar) ---------- */
  function mergeById(a, b) {
    const m = new Map();
    for (const r of a) m.set(r.id, r);
    for (const r of b) {
      const x = m.get(r.id);
      if (!x || (r.updatedAt || 0) > (x.updatedAt || 0)) m.set(r.id, r);
    }
    return [...m.values()];
  }
  function mergeState(local, remote) {
    const r = migrate(remote || {});
    const l = migrate(local || {});
    return {
      version: 1,
      config: (r.config.updatedAt || 0) > (l.config.updatedAt || 0) ? r.config : l.config,
      pregoes: mergeById(l.pregoes, r.pregoes),
      itens: mergeById(l.itens, r.itens),
    };
  }

  /* ---------- armazenamento ---------- */
  function createStore(storage, key) {
    let state = load();
    const listeners = new Set();
    let lastError = null;

    function load() {
      try {
        const raw = storage.getItem(key);
        if (raw) return migrate(JSON.parse(raw));
      } catch (e) { /* ignora e recomeça */ }
      return emptyState();
    }
    function emit(kind) { for (const fn of listeners) { try { fn(kind); } catch (e) { console.error(e); } } }
    function persist(silent) {
      try { storage.setItem(key, JSON.stringify(state)); lastError = null; }
      catch (e) { lastError = e; emit('error'); return false; }
      emit(silent ? 'silent' : 'change');
      return true;
    }
    const now = () => Date.now();

    return {
      get: () => state,
      on: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
      error: () => lastError,

      upsertPregao(data) {
        const t = now();
        const i = state.pregoes.findIndex((p) => p.id === data.id);
        if (i >= 0) state.pregoes[i] = Object.assign({}, state.pregoes[i], data, { updatedAt: t, deleted: false });
        else {
          const id = data.id || uid();
          state.pregoes.push(Object.assign({ status: 'Analisando', viagens: 1, km: 0, pedagio: 0 }, data, { id, createdAt: t, updatedAt: t, deleted: false }));
          data = { id };
        }
        persist();
        return data.id;
      },
      removePregao(id) {
        const t = now();
        const p = state.pregoes.find((x) => x.id === id);
        if (p) { p.deleted = true; p.updatedAt = t; }
        for (const it of state.itens) if (it.pregaoId === id && !it.deleted) { it.deleted = true; it.updatedAt = t; }
        persist();
      },
      upsertItem(data) {
        const t = now();
        const i = state.itens.findIndex((x) => x.id === data.id);
        if (i >= 0) state.itens[i] = Object.assign({}, state.itens[i], data, { updatedAt: t, deleted: false });
        else {
          const id = data.id || uid();
          state.itens.push(Object.assign({}, data, { id, createdAt: t, updatedAt: t, deleted: false }));
          data = { id };
        }
        persist();
        return data.id;
      },
      removeItem(id) {
        const it = state.itens.find((x) => x.id === id);
        if (it) { it.deleted = true; it.updatedAt = now(); }
        persist();
      },
      // caminho tipo 'empresa.nome' ou 'margemPadrao'
      setConfigPath(path, value, opts) {
        const parts = path.split('.');
        let o = state.config;
        for (let i = 0; i < parts.length - 1; i++) {
          if (typeof o[parts[i]] !== 'object' || o[parts[i]] === null) o[parts[i]] = {};
          o = o[parts[i]];
        }
        o[parts[parts.length - 1]] = value;
        state.config.updatedAt = now();
        persist(opts && opts.silent);
      },
      replaceAll(next) { state = migrate(next); persist(); },
      mergeFrom(remote) { state = mergeState(state, remote); persist(); },
      mergeDemo() { state = mergeState(state, demoState()); persist(); },
      clearAll() {
        const t = now();
        for (const p of state.pregoes) { p.deleted = true; p.updatedAt = t; }
        for (const i of state.itens) { i.deleted = true; i.updatedAt = t; }
        persist();
      },
      changedSince(ts) {
        return {
          config: (state.config.updatedAt || 0) > ts ? state.config : null,
          pregoes: state.pregoes.filter((p) => (p.updatedAt || 0) > ts),
          itens: state.itens.filter((i) => (i.updatedAt || 0) > ts),
        };
      },
      export() { return JSON.stringify(state, null, 1); },
    };
  }

  /* ---------- dados de exemplo (os mesmos da planilha) ---------- */
  function demoState() {
    const d = (dias, h, m) => {
      const x = new Date(); x.setDate(x.getDate() + dias); x.setHours(h, m, 0, 0);
      const p = (v) => String(v).padStart(2, '0');
      return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`;
    };
    const t = Date.now();
    const P = (id, numero, orgao, cidadeUf, sessao, intervaloMin, prazo, exig, status, km, viagens, pedagio) => ({
      id, numero, orgao, cidadeUf, sessao, intervaloMin, prazoEntregaDias: prazo, exigencias: exig, status, km, viagens, pedagio,
      link: '', obs: 'Dado de exemplo: pode apagar.', createdAt: t, updatedAt: t, deleted: false,
    });
    const I = (id, pregaoId, descricao, marca, unidade, qtd, onde, custo, teto, frete, margem, lanceFinal) => ({
      id, pregaoId, descricao, marca, unidade, qtd, onde, custo, teto, frete, margem, lanceFinal, createdAt: t, updatedAt: t, deleted: false,
    });
    return {
      version: 1,
      config: Object.assign(defaultConfig(), { updatedAt: 0 }),
      pregoes: [
        P('demo-p1', '90001/2026', 'Universidade de Londrina (exemplo)', 'Londrina/PR', d(-23, 10, 0), 'R$ 0,10', 15, 'SICAF, CND estadual', 'Faturado', 120, 1, 0),
        P('demo-p2', '90002/2026', 'Câmara Municipal de Exemplo B', 'Cidade B/PR', d(-8, 9, 0), 'R$ 0,50', 20, 'SICAF, CND federal', 'Ganhou', 80, 1, 0),
        P('demo-p3', '90003/2026', 'Autarquia de Exemplo C', 'Cidade C/PR', d(11, 10, 0), '0,5%', 30, 'SICAF, declaração ME/EPP', 'Em disputa', 200, 1, 30),
        P('demo-p4', '90004/2026', 'Hospital de Exemplo D', 'Cidade D/PR', d(19, 14, 0), 'R$ 0,10', 15, 'SICAF', 'Analisando', 0, 0, 0),
      ],
      itens: [
        I('demo-i1', 'demo-p1', 'Caixa organizadora plástica 30 L', 'Marca X', 'Un', 200, 'Atacado Y', 28, 49, 120, null, 44),
        I('demo-i2', 'demo-p1', 'Estilete 18 mm', 'Marca Z', 'Un', 300, 'Distribuidor Z', 3.2, 6.5, 0, null, 5.8),
        I('demo-i3', 'demo-p2', 'Resma de papel A4 75 g', 'Marca W', 'Resma', 500, 'Atacado Y', 24.9, 33, 0, null, null),
        I('demo-i4', 'demo-p2', 'Grampeador de mesa', 'Marca V', 'Un', 80, 'Atacado Y', 30, 38, 0, null, null),
        I('demo-i5', 'demo-p3', 'Mouse USB óptico', 'Marca U', 'Un', 300, 'Distribuidor X', 14, 25, 90, null, null),
        I('demo-i6', 'demo-p3', 'Teclado ABNT2 USB', 'Marca T', 'Un', 200, 'Distribuidor X', 32, 55, 120, 0.30, null),
        I('demo-i7', 'demo-p4', 'Cadeado de segurança 50 mm', 'Marca S', 'Un', 250, 'Distribuidor Z', 28, 45, 80, null, null),
      ],
    };
  }

  const api = {
    APP_VERSION, STATUS, INATIVOS, DECL_PADRAO, uid, n0, round2, ceil2, parseBR, brl, brl0, pct, numBR, qtdBR,
    fmtSessao, dataExtensa, hojeISO, defaultConfig, emptyState, migrate, custoViagem, calcItem, limiteMEI,
    computeAll, previewItem, linhasProposta, mergeState, createStore, demoState,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Core = api;
})(typeof window !== 'undefined' ? window : globalThis);
