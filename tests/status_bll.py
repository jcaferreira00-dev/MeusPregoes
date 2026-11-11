"""Status padrão BLL (11/11/2026): python3 tests/status_bll.py
Confere a conversão dos nomes antigos, selo/borda verde com item Venci em qualquer status, encerrados sem ganho e o Dashboard."""
import json, sys, time, os
from playwright.sync_api import sync_playwright
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
t = int(time.time() * 1000)
P = lambda **k: dict(dict(cidadeUf='Tibagi/PR', plataforma='BLL', status='Analisando', viagens=1, pedagio=0, km=100, tipoCompra='Aquisição', createdAt=t, updatedAt=t, deleted=False), **k)
I = lambda **k: dict(dict(unidade='Un', frete=0, margem=None, semLance=False, alternativas=[], qtd=10, custo=5, teto=10, lanceFinal=8, createdAt=t, updatedAt=t, deleted=False), **k)
pregs = [P(id='h_g', numero='1/2026', orgao='Prefeitura de Homologado Ganho', status='Homologado'),
         P(id='h_p', numero='2/2026', orgao='Prefeitura de Homologado Perdido', status='Homologado'),
         P(id='d_g', numero='3/2026', orgao='Prefeitura de Disputa Ganho', status='Disputa'),
         P(id='e_g', numero='4/2026', orgao='Prefeitura de Empenho', status='Empenho'),
         P(id='old_pe', numero='5/2026', orgao='Prefeitura Antigo Proposta Enviada', status='Proposta enviada'),
         P(id='old_pd', numero='6/2026', orgao='Prefeitura Antigo Perdeu', status='Perdeu'),
         P(id='old_fa', numero='7/2026', orgao='Prefeitura Antigo Faturado', status='Faturado'),
         P(id='des', numero='8/2026', orgao='Prefeitura Deserto', status='Deserto'),
         P(id='an', numero='9/2026', orgao='Prefeitura Analisando', status='Analisando')]
itens = [I(id='i1', pregaoId='h_g', itemEdital='01', descricao='x', ganhou=True), I(id='i2', pregaoId='h_p', itemEdital='01', descricao='y', ganhou=False),
         I(id='i3', pregaoId='d_g', itemEdital='01', descricao='z', ganhou=True), I(id='i4', pregaoId='e_g', itemEdital='01', descricao='w', ganhou=True),
         I(id='i5', pregaoId='old_fa', itemEdital='01', descricao='v'), I(id='i6', pregaoId='an', itemEdital='01', descricao='u')]
st = {'version': 1, 'config': {'margemPadrao': 0.4, 'consumo': 10, 'combustivel': 6.5, 'desgaste': 0.3}, 'pregoes': pregs, 'itens': itens}
falhas, erros = [], []
def ok(c, n):
    print(('OK   ' if c else 'FALHA') + ' ' + n)
    if not c: falhas.append(n)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1500, 'height': 950})
    for h in ['**/gstatic.com/**', '**/nominatim.openstreetmap.org/**', '**/router.project-osrm.org/**']: pg.route(h, lambda r: r.abort())
    pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto(APP); pg.evaluate("(s)=>{localStorage.setItem('mp.state.v1',s)}", json.dumps(st))
    pg.evaluate("()=>localStorage.setItem('mp.ui',JSON.stringify({tab:'pregoes'}))"); pg.reload(); pg.wait_for_timeout(1000)
    S = pg.evaluate("()=>Object.fromEntries(window.__app.store.get().pregoes.map(p=>[p.id,p.status]))")
    ok(S['old_pe'] == 'Aguardando disputa' and S['old_pd'] == 'Resultado final' and S['old_fa'] == 'Empenho', 'Nomes antigos viram o padrão BLL ' + str(S))
    ok(pg.evaluate("()=>window.__app.store.get().pregoes.find(p=>p.id==='old_fa').faturado") is True, 'Faturado antigo vira Empenho com a marca de faturado')
    txt = pg.inner_text('#main')
    card = lambda i: pg.query_selector(f'article.pcard[data-id={i}]')
    for i in ['h_g', 'd_g', 'e_g']:
        c = card(i)
        ok(c is not None and 'p-venci' in (c.get_attribute('class') or '') and c.query_selector('.selo-st') is not None, f'Com item Venci ({i}): borda verde e selo')
    ok('HOMOLOGADO' in card('h_g').query_selector('.selo-st').inner_text().upper(), 'Selo acompanha o status BLL (Homologado)')
    ok('DISPUTA' in card('d_g').query_selector('.selo-st').inner_text().upper(), 'Selo acompanha o status BLL (Disputa)')
    ok('EMPENHO' in card('e_g').query_selector('.selo-st').inner_text().upper(), 'Selo do Empenho')
    ok(card('h_p') is None and card('old_pd') is None and card('des') is None, 'Homologado sem Venci, antigo Perdeu e Deserto ficam em Encerrados (sem cartão completo)')
    ok(card('an') is not None and 'p-venci' not in (card('an').get_attribute('class') or ''), 'Analisando sem Venci: sem borda verde')
    # painel
    pg.evaluate("()=>localStorage.setItem('mp.ui',JSON.stringify({tab:'painel'}))"); pg.reload(); pg.wait_for_timeout(1000)
    pt = pg.inner_text('#main')
    ok('ENCERRADOS' in pt.upper() and 'EMPENHO' in pt.upper() and 'FATURADOS' in pt.upper(), 'Painel: faixa de status por grupo')
    nenc = pg.evaluate("()=>{const b=document.querySelector('.st-enc b');return b?b.textContent:null}")
    ok(nenc == '3', 'Painel: encerrados = 3 (Homologado sem Venci, antigo Perdeu, Deserto) ' + str(nenc))
    # clicar na faixa abre a guia Pregões filtrada por grupo
    pg.evaluate("()=>document.querySelector('[data-act=ir-status][data-v=\"g:Julgamento\"]').click()"); pg.wait_for_timeout(700)
    t2 = pg.inner_text('#main')
    ok('Homologado Ganho' in t2.title() or 'HOMOLOGADO GANHO' in t2.upper(), 'Filtro por grupo Julgamento mostra o Homologado com Venci')
    ok('HOMOLOGADO PERDIDO' not in t2.upper().split('ENCERRADOS')[0], 'Filtro por grupo não mostra Homologado perdido entre os ativos')
    # lista de status do pregão
    pg.evaluate("()=>document.querySelector('[data-act=abrir-pregao][data-id=h_g]').click()"); pg.wait_for_timeout(700)
    opts = pg.evaluate("()=>[...document.querySelectorAll('#stsel option')].map(o=>o.value)")
    ok(opts[:3] == ['Falta dados', 'Analisando', 'Gravado'] and 'Recepção de propostas' in opts and 'Resultado final' in opts and 'Empenho' in opts and 'Proposta enviada' not in opts and 'Faturado' not in opts and 'Perdeu' not in opts, 'Seletor de status: padrão BLL + os do João')
    # dashboard
    pg.evaluate("()=>localStorage.setItem('mp.ui',JSON.stringify({tab:'painel'}))"); pg.reload(); pg.wait_for_timeout(1000)
    m = pg.evaluate("()=>{const R=Core.computeAll(window.__app.store.get());const g=(i)=>R.pMap.get(i);return {fat:R.mei.faturado,aFat:R.mei.aFaturar,disp:R.mei.emDisputa,hg:g('h_g').ganho,hp:g('h_p').ganho,vOld:g('old_fa').venda>0}}")
    ok(m['hg'] is True and m['hp'] is False, 'Cálculo: Homologado com Venci é ganho; sem Venci não é ' + str(m))
    ok(m['fat'] > 0, 'Cálculo: antigo Faturado (Empenho + marca) segue contando como faturado ' + str(m['fat']))
    ok(m['aFat'] > 0 and m['disp'] >= 0, 'Cálculo: ganhos firmes a faturar (Empenho/Disputa/Homologado com Venci)')
    for vw in [(1500, 950), (390, 844)]:
        pg.set_viewport_size({'width': vw[0], 'height': vw[1]})
        for tab in ['painel', 'pregoes', 'itens', 'acomp', 'pdf', 'config']:
            pg.evaluate("(t)=>localStorage.setItem('mp.ui',JSON.stringify({tab:t}))", tab); pg.reload(); pg.wait_for_timeout(500)
    ok(not erros, 'Sem erro de JavaScript ' + str(erros[:3]))
    b.close()
print('\nTUDO OK' if not falhas else '\nFALHAS: ' + str(falhas)); sys.exit(1 if falhas else 0)
