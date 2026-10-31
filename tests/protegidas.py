"""Funções protegidas do Meus Pregões: rodar ANTES de publicar (python3 tests/protegidas.py).
Se alguma falhar, NÃO publicar: alguma coisa que o João usa sumiu."""
import json, sys, time, os
from playwright.sync_api import sync_playwright
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
t = int(time.time() * 1000)
P = lambda **k: dict(dict(cidadeUf='Tibagi/PR', plataforma='BLL', status='Analisando', viagens=1, pedagio=0, createdAt=t, updatedAt=t, deleted=False), **k)
I = lambda **k: dict(dict(unidade='Un', frete=0, margem=None, semLance=False, alternativas=[], createdAt=t, updatedAt=t, deleted=False), **k)
st = {'version': 1, 'config': {'margemPadrao': 0.4, 'consumo': 10, 'combustivel': 6.5, 'desgaste': 0.3},
      'pregoes': [P(id='p1', numero='1/2026', orgao='Prefeitura Municipal de Teste', km=200, sessao='2099-01-10T09:00', prazoPropostas='2099-01-10T08:00'),
                  P(id='p2', numero='2/2026', orgao='Prefeitura Municipal de Semkm', km=None)],
      'itens': [I(id='a', pregaoId='p1', itemEdital='01', descricao='Item com lance', qtd=100, custo=5, teto=10, lanceFinal=8,
                  alternativas=[{'loja': 'Loja X', 'link': 'https://x.com/p', 'custo': 50, 'emb': 10, 'frete': 0, 'usar': False}]),
                I(id='b', pregaoId='p1', itemEdital='02', descricao='Item sem lance', qtd=10, custo=20, teto=30, revisar='Conferir isto'),
                I(id='c', pregaoId='p1', itemEdital='03', descricao='Lance acima do teto', qtd=5, custo=5, teto=9, lanceFinal=27),
                I(id='d', pregaoId='p2', itemEdital='01', descricao='Item de pregão sem km', qtd=5, custo=5, teto=9)]}
falhas, erros = [], []
def ok(cond, nome):
    print(('OK   ' if cond else 'FALHA') + ' ' + nome)
    if not cond: falhas.append(nome)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1500, 'height': 950})
    for h in ['**/gstatic.com/**', '**/nominatim.openstreetmap.org/**', '**/router.project-osrm.org/**']: pg.route(h, lambda r: r.abort())
    pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto(APP); pg.evaluate("(s)=>{localStorage.setItem('mp.state.v1',s)}", json.dumps(st))
    for vw in [(1500, 950), (960, 1000), (390, 844)]:
        pg.set_viewport_size({'width': vw[0], 'height': vw[1]})
        for tab in ['painel', 'pregoes', 'itens', 'acomp', 'pdf', 'config']:
            pg.evaluate("(t)=>localStorage.setItem('mp.ui',JSON.stringify({tab:t}))", tab); pg.reload(); pg.wait_for_timeout(500)
    pg.set_viewport_size({'width': 1500, 'height': 950})
    pg.evaluate("()=>localStorage.setItem('mp.ui',JSON.stringify({tab:'painel'}))"); pg.reload(); pg.wait_for_timeout(800)
    ok('Informar km da entrega' in pg.inner_text('#main'), 'Painel: pendência de pregão sem km')
    pg.evaluate("()=>localStorage.setItem('mp.ui',JSON.stringify({tab:'pregoes'}))"); pg.reload(); pg.wait_for_timeout(800)
    txt = pg.inner_text('#main')
    ok('Sem km da entrega' in txt, 'Cartão do pregão: etiqueta sem km')
    ok('para revisar' in txt, 'Cartão do pregão: itens para revisar')
    pg.evaluate("()=>document.querySelector('[data-act=abrir-pregao][data-id=p1]').click()"); pg.wait_for_timeout(800)
    A = lambda i: pg.inner_text(f'article.icard[data-id={i}]')
    a, bb, c = A('a'), A('b'), A('c')
    ok('MEU LUCRO NO LANCE' in a.upper(), 'Item com lance: destaque "Meu lucro no lance"')
    ok('GANHANDO SÓ ESTE' in a.upper() and 'sem prejuízo' in a and 'no total' in a, 'Item: "se ganhar só este" com total sem prejuízo')
    ok('Posso baixar do teto' in a and 'Lucro no lance' in a, 'Item: "Posso baixar do teto" e "Lucro" no cartão')
    ok('pelo teto' not in a.lower(), 'Item com lance: sem "lucro pelo teto"')
    ok('VALOR MÍNIMO P/ PROPOSTA' in bb.upper(), 'Item sem lance: destaque "Valor mínimo p/ proposta"')
    ok('REVISAR' in bb.upper() and pg.query_selector('article.icard[data-id=b] [data-act=item-revisado]') is not None, 'Item: alerta Revisar com botão Revisado')
    ok('ACIMA do teto' in c, 'Item: lance acima do teto em vermelho')
    ok('Loja X' in a, 'Item: botão de compra com o nome da loja')
    pg.evaluate("()=>document.querySelector('[data-act=editar-item][data-id=a]').click()"); pg.wait_for_timeout(900)
    f = pg.inner_text('.sheet')
    ok('MEU LUCRO NO LANCE' in f.upper() and 'sem prejuízo' in f and 'no total' in f, 'Janela do item: destaque + total se ganhar só este')
    ok('Posso baixar do teto' in f and 'Lucro no lance' in f, 'Janela do item: posso baixar + lucro')
    ok('anúncio de 10 un.' in f and 'Abrir' in f, 'Janela do item: opção com unidades no anúncio e botão Abrir')
    ok(not pg.evaluate("()=>document.querySelector('[name=custo]').readOnly"), 'Janela do item: custo nunca travado')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
    pg.evaluate("()=>localStorage.setItem('mp.ui',JSON.stringify({tab:'pregoes'}))"); pg.reload(); pg.wait_for_timeout(800)
    pg.click('[data-act=novo-pregao]'); pg.wait_for_timeout(700)
    pg.fill('[name=numero]', '99/2026'); pg.fill('[name=orgao]', 'Teste'); pg.fill('[name=km]', '')
    pg.click('button[type=submit]'); pg.wait_for_timeout(600)
    salvo = any(x['numero'] == '99/2026' for x in json.loads(pg.evaluate("()=>localStorage.getItem('mp.state.v1')"))['pregoes'])
    ok(not salvo, 'Cadastro do pregão: não salva sem km')
    b.close()
ok(not erros, 'Sem erro de JavaScript em nenhuma guia (PC, tela dividida e celular)' + ('' if not erros else ': ' + erros[0][:120]))
print('\n' + ('TUDO OK' if not falhas else str(len(falhas)) + ' FALHA(S): NÃO PUBLICAR'))
sys.exit(1 if falhas else 0)
