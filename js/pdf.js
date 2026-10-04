/* Pregões MEI — gerador de PDF da proposta (usa pdf-lib, carregado sob demanda)
 *
 * COMO TROCAR O MODELO: todo o desenho está em gerarProposta(), em blocos comentados
 * (cabeçalho, destinatário, tabela, totais, condições, declaração, assinatura).
 * A MARCA D'ÁGUA está isolada em desenharMarca(): texto ou imagem, com opacidade e ângulo. */
(function (root) {
  'use strict';

  const C = root.Core || (typeof require !== 'undefined' ? require('./core.js') : null);
  const PL = () => root.PDFLib || (typeof require !== 'undefined' ? require('pdf-lib') : null);

  /* ---------- valor por extenso ---------- */
  const U = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const D = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const CT = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function ate999(n) {
    if (n === 0) return '';
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100), r = n % 100, parts = [];
    if (c) parts.push(CT[c]);
    if (r) {
      if (r < 20) parts.push(U[r]);
      else { const d = Math.floor(r / 10), u = r % 10; parts.push(u ? D[d] + ' e ' + U[u] : D[d]); }
    }
    return parts.join(' e ');
  }
  function inteiroExtenso(n) {
    if (n === 0) return 'zero';
    const escalas = [[1e9, 'bilhão', 'bilhões'], [1e6, 'milhão', 'milhões'], [1e3, 'mil', 'mil']];
    let resto = n; const partes = [], valores = [];
    for (const [v, s, p] of escalas) {
      const q = Math.floor(resto / v);
      if (q) {
        partes.push(v === 1e3 && q === 1 ? 'mil' : ate999(q) + ' ' + (q === 1 ? s : p));
        valores.push(q); resto %= v;
      }
    }
    if (resto) { partes.push(ate999(resto)); valores.push(resto); }
    if (partes.length === 1) return partes[0];
    const ult = valores[valores.length - 1];
    const juntaE = ult < 100 || ult % 100 === 0;
    return partes.slice(0, -1).join(' ') + (juntaE ? ' e ' : ' ') + partes[partes.length - 1];
  }
  function valorExtenso(v) {
    const tot = Math.round(v * 100);
    const reais = Math.floor(tot / 100), cent = tot % 100;
    const out = [];
    if (reais > 0) {
      let t = inteiroExtenso(reais);
      if (reais % 1e6 === 0) t += ' de';
      out.push(reais === 1 ? 'um real' : t + ' reais');
    }
    if (cent > 0) out.push(cent === 1 ? 'um centavo' : inteiroExtenso(cent) + ' centavos');
    return out.length ? out.join(' e ') : 'zero real';
  }

  /* ---------- auxiliares ---------- */
  const safe = (s) => String(s == null ? '' : s).replace(/\r/g, '').replace(/\t/g, ' ')
    .replace(/[^\n\u0020-\u007E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u20AC]/g, '?');

  function wrap(text, f, size, maxW) {
    const out = [];
    for (const para of safe(text).split('\n')) {
      const words = para.split(/\s+/).filter(Boolean);
      let line = '';
      for (const w of words) {
        const t = line ? line + ' ' + w : w;
        if (f.widthOfTextAtSize(t, size) <= maxW) { line = t; continue; }
        if (line) out.push(line);
        if (f.widthOfTextAtSize(w, size) > maxW) {
          let chunk = '';
          for (const ch of w) {
            if (f.widthOfTextAtSize(chunk + ch, size) > maxW) { out.push(chunk); chunk = ch; } else chunk += ch;
          }
          line = chunk;
        } else line = w;
      }
      out.push(line);
    }
    return out;
  }

  function dataUrlToBytes(url) {
    const b64 = url.split(',')[1] || '';
    const bin = (root.atob || atob)(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  const slug = (s) => safe(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40);

  /* ---------- geração ---------- */
  const hexRgb = (h, rgb) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
    const n = m ? parseInt(m[1], 16) : 0xFFC000;
    return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  };
  const cap = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1) : t;

  async function gerarProposta(state, pregaoId, o) {
    const { PDFDocument, StandardFonts, rgb, degrees } = PL();
    const cfg = state.config, emp = cfg.empresa;
    o = Object.assign({
      fonte: 'auto',
      validadeDias: cfg.proposta.validadeDias,
      condPagamento: cfg.proposta.condPagamento,
      incluirExtenso: cfg.proposta.incluirExtenso,
      incluirBancarios: cfg.proposta.incluirBancarios,
      incluirDeclaracao: cfg.proposta.incluirDeclaracao,
      incluirLocalData: cfg.proposta.incluirLocalData,
      textoDeclaracao: cfg.proposta.textoDeclaracao,
      cor: cfg.proposta.cor,
      local: emp.cidade,
      data: C.hojeISO(),
      prazoEntrega: '',
      localEntrega: '',
      observacoes: '',
      marcaDagua: cfg.marcaDagua,
      cabecalho: cfg.cabecalho,
    }, o || {});

    const L = C.linhasProposta(state, pregaoId, o.fonte);
    const preg = L.pregao;
    if (!preg) throw new Error('Pregão não encontrado.');

    const doc = await PDFDocument.create();
    doc.setTitle('Proposta comercial — ' + (preg.numero || ''));
    doc.setAuthor(emp.nome || 'Pregões MEI');
    doc.setCreator('Pregões MEI');
    doc.setProducer('Pregões MEI (pdf-lib)');
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const bold = await doc.embedFont(StandardFonts.HelveticaBold);
    const ital = await doc.embedFont(StandardFonts.HelveticaOblique);

    const PW = 595.28, PH = 841.89, M = 36, CW = PW - 2 * M;
    const ACC = hexRgb(o.cor, rgb);                                   // cor do modelo (bordas, faixas, rótulos)
    const ACCT = rgb(ACC.red * 0.72, ACC.green * 0.72, ACC.blue * 0.72); // versão escura para texto legível
    const INK = rgb(0.08, 0.08, 0.1), GRAY = rgb(0.4, 0.42, 0.46), WHITE = rgb(1, 1, 1);
    const BOTTOM = 40;

    const embedImg = async (dataUrl) => {
      if (!dataUrl) return null;
      try {
        const bytes = dataUrlToBytes(dataUrl);
        return /^data:image\/png/i.test(dataUrl) ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
      } catch (e) { return null; }
    };

    /* ===== PAPEL TIMBRADO (imagem do topo, em todas as páginas) ===== */
    const hdImg = await embedImg(o.cabecalho && o.cabecalho.imagem);
    let hdW = 0, hdH = 0;
    if (hdImg) {
      const s = Math.min(CW / hdImg.width, 78 / hdImg.height);
      hdW = hdImg.width * s; hdH = hdImg.height * s;
    }

    /* ===== MARCA D'ÁGUA (troque aqui: texto ou imagem, opacidade, ângulo, tamanho) ===== */
    const wm = o.marcaDagua || {};
    const wmImg = wm.tipo === 'imagem' ? await embedImg(wm.imagem) : null;
    function desenharMarca(page) {
      const op = Math.min(1, Math.max(0.02, Number(wm.opacidade) || 0.1));
      const ang = Number(wm.angulo) || 0, rad = ang * Math.PI / 180;
      const cx = PW / 2, cy = PH / 2;
      if (wm.tipo === 'texto' && wm.texto) {
        const txt = safe(wm.texto).split('\n')[0];
        let size = Number(wm.tamanho) || 64;
        const w1 = bold.widthOfTextAtSize(txt, 1) || 1;
        const disp = Math.min(PW / Math.max(Math.abs(Math.cos(rad)), 0.001), PH / Math.max(Math.abs(Math.sin(rad)), 0.001)) * 0.86;
        if (w1 * size > disp) size = disp / w1;
        const w = w1 * size, h = size * 0.35;
        const x0 = cx - (w / 2 * Math.cos(rad) - h * Math.sin(rad));
        const y0 = cy - (w / 2 * Math.sin(rad) + h * Math.cos(rad));
        page.drawText(txt, { x: x0, y: y0, size, font: bold, color: rgb(0.45, 0.5, 0.58), opacity: op, rotate: degrees(ang) });
      } else if (wmImg) {
        const maxW = PW * 0.7 * ((Number(wm.tamanho) || 64) / 64), maxH = PH * 0.5;
        const s = Math.min(maxW / wmImg.width, maxH / wmImg.height);
        const w = wmImg.width * s, h = wmImg.height * s;
        const x0 = cx - (w / 2 * Math.cos(rad) - h / 2 * Math.sin(rad));
        const y0 = cy - (w / 2 * Math.sin(rad) + h / 2 * Math.cos(rad));
        page.drawImage(wmImg, { x: x0, y: y0, width: w, height: h, opacity: op, rotate: degrees(ang) });
      }
    }

    /* ===== controle de páginas ===== */
    const pages = [];
    let page, y;
    const topo = () => (hdImg ? PH - 20 - hdH - 8 : PH - M);
    function novaPagina() {
      page = doc.addPage([PW, PH]); pages.push(page); desenharMarca(page);
      if (hdImg) page.drawImage(hdImg, { x: (PW - hdW) / 2, y: PH - 20 - hdH, width: hdW, height: hdH });
      y = topo();
    }
    const garantir = (h) => { if (y - h < BOTTOM) { novaPagina(); return true; } return false; };
    const T = (t, x, yy, size, f, color) => page.drawText(safe(t), { x, y: yy, size, font: f || font, color: color || INK });
    const TR = (t, xr, yy, size, f, color) => { const s = safe(t); page.drawText(s, { x: xr - (f || font).widthOfTextAtSize(s, size), y: yy, size, font: f || font, color: color || INK }); };
    const TC = (t, xc, yy, size, f, color) => { const s = safe(t); page.drawText(s, { x: xc - (f || font).widthOfTextAtSize(s, size) / 2, y: yy, size, font: f || font, color: color || INK }); };
    const box = (x, yy, w, h, fill) => page.drawRectangle({ x, y: yy, width: w, height: h, borderColor: ACC, borderWidth: 1, color: fill, opacity: fill ? 1 : undefined });

    novaPagina();

    /* ===== 1) CABEÇALHO (sem papel timbrado: texto simples) ===== */
    if (!hdImg) {
      T(emp.nome || 'SUA EMPRESA (preencha em Config)', M, y - 14, 15, bold, ACCT);
      let yl = y - 27;
      [emp.cnpj ? 'CNPJ: ' + emp.cnpj : '', emp.endereco || '', [emp.telefone, emp.email].filter(Boolean).join('  ·  ')]
        .filter(Boolean).forEach((l) => { T(l, M, yl, 8.5, font, GRAY); yl -= 11; });
      page.drawLine({ start: { x: M, y: yl - 2 }, end: { x: PW - M, y: yl - 2 }, thickness: 1.2, color: ACC });
      y = yl - 12;
    }

    /* ===== 2) GRADE DE DADOS (órgão, processo, validade, pagamento, entrega) ===== */
    function grade(pares) {
      for (let i = 0; i < pares.length; i += 2) {
        const par = pares.slice(i, i + 2);
        const cw = CW / 2;
        const lines = par.map(([, v]) => wrap(v || '—', font, 11, cw - 10));
        const h = Math.max(40, 24 + Math.max(...lines.map((l) => l.length)) * 13);
        garantir(h + 2);
        par.forEach(([lab], k) => {
          const x = M + k * cw;
          box(x, y - h, cw, h);
          T(lab, x + 4, y - 13, 10.5, font, ACC);
          lines[k].forEach((l, j) => T(l, x + 4, y - 27 - j * 13, 11, font, INK));
        });
        y -= h;
      }
    }
    const prazoEnt = o.prazoEntrega || (preg.prazoEntregaDias ? preg.prazoEntregaDias + ' dias' : 'Conforme edital');
    grade([
      ['ÓRGÃO / CLIENTE', preg.orgao], ['PROCESSO', preg.numero],
      ['VALIDADE DA PROPOSTA', (o.validadeDias || 60) + ' dias'], ['PRAZO DE PAGAMENTO', o.condPagamento || 'Conforme edital'],
      ['LOCAL DE ENTREGA', o.localEntrega || preg.cidadeUf], ['PRAZO DE ENTREGA', prazoEnt],
    ]);
    y -= 10;

    /* ===== 3) DADOS BANCÁRIOS ===== */
    const temBanco = o.incluirBancarios && [emp.banco, emp.agencia, emp.conta, emp.pix, emp.favorecido].some(Boolean);
    if (temBanco) {
      garantir(24 + 3 * 40);
      T('DADOS BANCÁRIOS', M + 8, y - 12, 12, font, INK); y -= 18;
      grade([
        ['BANCO', emp.banco], ['AGÊNCIA', emp.agencia],
        ['CONTA', emp.conta], ['PIX', emp.pix],
        ['FAVORECIDO', emp.favorecido || emp.nome], ['CNPJ DA EMPRESA', emp.cnpj],
      ]);
      y -= 10;
    }

    /* ===== 4) ITENS DA PROPOSTA (um bloco por item) ===== */
    garantir(24 + 90);
    T('ITENS DA PROPOSTA', M + 8, y - 12, 12, font, INK); y -= 18;
    const fr = [0.14, 0.34, 0.12, 0.09, 0.15, 0.16];
    const cx = []; { let a = M; for (const f of fr) { cx.push([a, f * CW]); a += f * CW; } }
    const fmtNum = (n) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    const brlTxt = (n) => 'R$ ' + fmtNum(n);
    const heads = ['Item', 'Descrição', 'Unid', 'Qtd', 'Valor Unit. (R$)', 'Valor Total (R$)'];

    if (!L.linhas.length) { garantir(24); T('Nenhum item cadastrado neste pregão.', M + 8, y - 12, 10, ital, GRAY); y -= 24; }
    for (const ln of L.linhas) {
      const descL = wrap(ln.descEdital, font, 10, CW - 14);
      const marcaL = wrap('MARCA/MODELO: ' + (ln.marca || '—'), font, 9.5, CW - 14);
      const hHead = 19, hRow = 24, hDesc = descL.length * 12.5 + 10, hMarca = marcaL.length * 12 + 8;
      const total = hHead + hRow + hDesc + hMarca;
      garantir(total + 2);
      // faixa de cabeçalho
      page.drawRectangle({ x: M, y: y - hHead, width: CW, height: hHead, color: ACC, borderColor: ACC, borderWidth: 1 });
      heads.forEach((t, k) => {
        const [x, w] = cx[k];
        if (k <= 1) T(t, x + 4, y - 13, 9.5, bold, WHITE); else TC(t, x + w / 2, y - 13, 9.5, bold, WHITE);
      });
      y -= hHead;
      // linha principal
      box(M, y - hRow, CW, hRow);
      const vals = [`ITEM ${ln.numeroItem}`, 'Ver descrição abaixo', ln.un.toUpperCase(),
        new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 }).format(ln.qtd),
        ln.unit !== null ? brlTxt(ln.unit) : '—', ln.total !== null ? brlTxt(ln.total) : '—'];
      vals.forEach((t, k) => {
        const [x, w] = cx[k];
        const f = k === 1 ? bold : font;
        if (k <= 1) T(t, x + 4, y - 16, 10, f, ACCT); else TC(t, x + w / 2, y - 16, 10, f, ACCT);
      });
      y -= hRow;
      // descrição completa
      box(M, y - hDesc, CW, hDesc);
      descL.forEach((l, j) => T(l, M + 7, y - 15 - j * 12.5, 10, font, ACCT));
      y -= hDesc;
      // marca / modelo
      box(M, y - hMarca, CW, hMarca);
      marcaL.forEach((l, j) => T(l, M + 7, y - 14 - j * 12, 9.5, font, ACCT));
      y -= hMarca;
    }

    /* ===== 5) RESUMO COMERCIAL ===== */
    garantir(80);
    y -= 12;
    T('Resumo Comercial', M, y - 12, 12.5, bold, ACC); y -= 18;
    box(M, y - 18, CW, 18);
    T('Valor global da proposta', M + 4, y - 12.5, 10.5, bold, ACCT);
    TR(brlTxt(L.total), PW - M - 6, y - 12.5, 10.5, bold, ACCT);
    y -= 18 + 8;
    if (o.incluirExtenso && L.total > 0) {
      const ln = wrap('Valor por extenso: ' + cap(valorExtenso(L.total)) + '.', font, 11.5, CW - 30);
      ln.forEach((l, i) => {
        garantir(14);
        if (i === 0) { T('Valor por extenso:', M + 14, y - 11, 11.5, bold, INK); T(l.slice('Valor por extenso:'.length), M + 14 + bold.widthOfTextAtSize('Valor por extenso:', 11.5), y - 11, 11.5, font, INK); }
        else T(l, M + 14, y - 11, 11.5, font, INK);
        y -= 14;
      });
      y -= 4;
    }
    if (L.semValor > 0) {
      const ln = wrap('Atenção: ' + L.semValor + ' item(ns) sem valor definido nesta proposta.', bold, 9.5, CW);
      ln.forEach((l) => { garantir(14); T(l, M, y - 10, 9.5, bold, rgb(0.75, 0.2, 0.1)); y -= 13; });
    }
    if (o.observacoes) {
      y -= 4; garantir(30);
      T('Observações:', M + 14, y - 10, 10.5, bold, INK); y -= 15;
      wrap(o.observacoes, font, 10.5, CW - 30).forEach((l) => { garantir(14); T(l, M + 14, y - 10, 10.5, font, INK); y -= 13.5; });
    }

    /* ===== 6) DECLARAÇÃO (opcional) ===== */
    if (o.incluirDeclaracao && o.textoDeclaracao) {
      y -= 8; garantir(50);
      wrap(o.textoDeclaracao, font, 10, CW - 30).forEach((l) => { garantir(14); T(l, M + 14, y - 10, 10, font, INK); y -= 13; });
    }

    /* ===== 7) LOCAL/DATA (opcional) E ASSINATURA ===== */
    garantir(o.incluirLocalData ? 120 : 96);
    y -= 14;
    if (o.incluirLocalData) {
      T([o.local, C.dataExtensa(o.data)].filter(Boolean).join(', ') + '.', M + 14, y - 10, 10.5, font, INK); y -= 34;
    } else y -= 20;
    const sigW = 250, sx = (PW - sigW) / 2;
    page.drawLine({ start: { x: sx, y }, end: { x: sx + sigW, y }, thickness: 1, color: INK });
    const nome = (emp.responsavel || emp.nome || '').toUpperCase();
    const doc2 = emp.cpf ? 'CPF: ' + emp.cpf : (emp.cnpj ? 'CNPJ: ' + emp.cnpj : '');
    if (nome) TC(nome, PW / 2, y - 13, 10.5, bold, INK);
    if (doc2) TC(doc2, PW / 2, y - 26, 10.5, bold, INK);
    y -= 34;

    /* ===== numeração de páginas (só se houver mais de uma) ===== */
    if (pages.length > 1) {
      pages.forEach((pg, i) => {
        const pt = `Página ${i + 1} de ${pages.length}`;
        pg.drawText(pt, { x: PW / 2 - font.widthOfTextAtSize(pt, 8) / 2, y: 20, size: 8, font, color: GRAY });
      });
    }

    const bytes = await doc.save();
    const filename = `Proposta_${slug(preg.numero) || 'compra'}_${slug(preg.orgao) || 'orgao'}.pdf`;
    return { bytes, filename, total: L.total, linhas: L.linhas.length, semValor: L.semValor, paginas: pages.length };
  }

  const api = { gerarProposta, valorExtenso, inteiroExtenso };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.PropostaPDF = api;
})(typeof window !== 'undefined' ? window : globalThis);
