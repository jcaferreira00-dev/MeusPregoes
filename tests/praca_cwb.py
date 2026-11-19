"""Praça Curitiba (v1.169.0): visão do João x visão de Curitiba, acerto e despesas. Rodar: python3 tests/praca_cwb.py (SHOTS_DIR=pasta para guardar as telas)."""
import json, sys, time, os
from playwright.sync_api import sync_playwright
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
OUT = os.environ.get('SHOTS_DIR') or None
t = int(time.time() * 1000)
P = lambda **k: dict(dict(cidadeUf='Tibagi/PR', plataforma='BLL', status='Cotando', viagens=1, pedagio=0, km=120, createdAt=t, updatedAt=t, deleted=False), **k)
I = lambda **k: dict(dict(unidade='Un', frete=0, margem=None, semLance=False, alternativas=[], createdAt=t, updatedAt=t, deleted=False), **k)
st = {'version': 1, 'config': {'margemPadrao': 0.4, 'consumo': 10, 'combustivel': 6.5, 'desgaste': 0.3, 'capitalGiro': 20000},
 'pregoes': [
  P(id='p1', numero='12/2026', orgao='Prefeitura Municipal de Tibagi', status='Julgamento', sessao='2099-01-10T09:00'),
  P(id='p2', numero='45/2026', orgao='Prefeitura Municipal de Curitiba', cidadeUf='Curitiba/PR', km=230, status='Homologado', sessao='2026-11-05T09:00', empenhoData='2026-11-10', entregueEm='2026-11-14', pagoEm='2026-11-18', despesas=[{'desc':'Taxa BLL','valor':80},{'desc':'Combustível extra','valor':45.5}]),
  P(id='p3', numero='88/2026', orgao='Prefeitura de São José dos Pinhais', cidadeUf='São José dos Pinhais/PR', km=240, status='Julgamento', sessao='2099-01-12T09:00'),
  P(id='p4', numero='7/2026', orgao='Câmara de Curitiba', cidadeUf='Curitiba/PR', km=230, status='Homologado', sessao='2026-11-06T09:00', empenhoData='2026-11-12'),
  P(id='p5', numero='9/2026', orgao='Prefeitura de Imbaú', cidadeUf='Imbaú/PR', status='Homologado', sessao='2026-11-03T09:00')],
 'itens': [
  I(id='a', pregaoId='p1', itemEdital='01', descricao='Item TB', qtd=10, custo=5, teto=10, lanceFinal=9),
  I(id='b', pregaoId='p2', itemEdital='01', descricao='Caixa organizadora', qtd=100, custo=20, teto=40, lanceFinal=35, ganhou=True),
  I(id='c', pregaoId='p3', itemEdital='01', descricao='Item CWB disputa', qtd=20, custo=10, teto=22, lanceFinal=20),
  I(id='d', pregaoId='p4', itemEdital='01', descricao='Cadeira', qtd=10, custo=100, teto=130, lanceFinal=120, ganhou=True),
  I(id='e', pregaoId='p5', itemEdital='01', descricao='Item TB ganho', qtd=10, custo=10, teto=20, lanceFinal=18, ganhou=True)]}
erros=[]; fal=[]
def ok(c, n):
    print(('OK   ' if c else 'FALHA')+' '+n)
    if not c: fal.append(n)
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width':1500,'height':950}); pg = ctx.new_page()
    for h in ['**/gstatic.com/**','**/nominatim.openstreetmap.org/**','**/router.project-osrm.org/**']: pg.route(h, lambda r: r.abort())
    pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.on('console', lambda m: erros.append('console: '+m.text) if m.type=='error' and 'Failed to load resource' not in m.text and 'net::' not in m.text else None)
    pg.goto(APP); pg.evaluate("(s)=>{localStorage.setItem('mp.state.v1',s)}", json.dumps(st))
    def tab(t): pg.evaluate("(t)=>localStorage.setItem('mp.ui',JSON.stringify({tab:t}))", t); pg.reload(); pg.wait_for_timeout(900)
    # ---- visão do João
    tab('painel'); txt = pg.inner_text('#main')
    ok('curitiba · praça do irmão' in txt.lower(), 'João: card Curitiba no Painel')
    ok('acerto com curitiba' in txt.lower(), 'João: card Acerto no Painel')
    OUT and pg.screenshot(path=OUT+'/joao_painel.png')
    tab('pregoes'); txt = pg.inner_text('#main')
    ok(pg.locator('.pr-chip').count()==3, 'João: filtro Todas/Telêmaco/Curitiba')
    ok(pg.locator('.pcard.pz-cwb').count()==3, 'João: 3 cartões com faixa Curitiba (esperado 3, tem %d)' % pg.locator('.pcard.pz-cwb').count())
    OUT and pg.screenshot(path=OUT+'/joao_pregoes.png')
    pg.click('.pr-chip.cwb'); pg.wait_for_timeout(400)
    ok(pg.locator('.pcard').count()==3 and 'Tibagi' not in pg.inner_text('#main'), 'João: filtro Curitiba mostra só os 3')
    pg.click('.pcard[data-id=p2]'); pg.wait_for_timeout(700)
    d = pg.inner_text('#main')
    ok('despesas e acerto' in d.lower() and 'Lucro líquido' in d, 'João: detalhe com despesas e acerto')
    OUT and pg.screenshot(path=OUT+'/joao_detalhe.png', full_page=True)
    ok('Acertar com Curitiba' in d or 'acertar com curitiba' in d.lower(), 'João: pregão pago pelo órgão fica "acertar"')
    # lançar despesa e marcar acerto
    pg.click('[data-act=desp-add][data-bll]'); pg.wait_for_timeout(300)
    pg.click('[data-act=acerto-marcar]'); pg.wait_for_timeout(400)
    ok('Acertado em' in pg.inner_text('#main'), 'João: marcar acerto')
    tab('config'); ok('praça curitiba' in pg.inner_text('#main').lower(), 'João: Config tem o card da praça')
    OUT and pg.screenshot(path=OUT+'/joao_config.png', full_page=True)
    # ---- visão de Curitiba
    pg.evaluate("()=>localStorage.setItem('mp.modoCwb','1')"); tab('painel'); txt = pg.inner_text('#main')
    ok(pg.evaluate("()=>document.documentElement.classList.contains('cwb')"), 'Curitiba: modo ligado')
    ok('acerto com curitiba' in txt.lower() and 'limite do mei' not in txt.lower(), 'Curitiba: acerto sim, limite do MEI não')
    ok('Caixa' not in txt.split('Acerto com Curitiba')[0], 'Curitiba: sem bloco de caixa do João')
    OUT and pg.screenshot(path=OUT+'/cwb_painel.png')
    tab('pregoes'); txt = pg.inner_text('#main')
    ok('Tibagi' not in txt and 'Imbaú' not in txt.upper().replace('IMBAÚ','Imbaú') or ('TIBAGI' not in txt.upper()), 'Curitiba: não vê pregões de Telêmaco')
    ok(pg.locator('.pcard').count()==3, 'Curitiba: vê só os 3 da praça')
    ok(pg.locator('.pr-chip').count()==0, 'Curitiba: sem filtro de praça')
    OUT and pg.screenshot(path=OUT+'/cwb_pregoes.png')
    tab('itens'); ok('Item TB' not in pg.inner_text('#main'), 'Curitiba: Itens só da praça')
    # a sincronização continua enxergando tudo
    n = pg.evaluate("()=>window.__app.store.full().pregoes.filter(p=>!p.deleted).length"); ok(n==5, 'Sync/backup enxerga os 5 pregões (full)')
    n2 = pg.evaluate("()=>window.__app.store.get().pregoes.length"); ok(n2==3, 'Telas enxergam 3 (get)')
    # celular
    pg.set_viewport_size({'width':390,'height':844}); tab('painel'); OUT and pg.screenshot(path=OUT+'/cwb_painel_cel.png', full_page=True)
    pg.evaluate("()=>localStorage.removeItem('mp.modoCwb')"); pg.set_viewport_size({'width':390,'height':844}); tab('pregoes'); OUT and pg.screenshot(path=OUT+'/joao_pregoes_cel.png')
    b.close()
erros = [e for e in erros if 'file:///' not in e]
print('OK   Sem erro de JavaScript' if not erros else 'FALHA erros JS: ' + str(erros[:5]))
if erros: fal.append('erro de JavaScript')
print('\nTUDO OK' if not fal else '\nFALHAS: ' + str(fal))
sys.exit(1 if fal else 0)
