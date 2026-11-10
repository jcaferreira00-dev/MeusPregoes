import json, os, time
from playwright.sync_api import sync_playwright
APP='file://'+os.path.abspath('index.html'); t=int(time.time()*1000)
P=lambda **k: dict(dict(cidadeUf='Tibagi/PR',plataforma='BLL',status='Analisando',viagens=1,km=100,createdAt=t,updatedAt=t,deleted=False),**k)
I=lambda **k: dict(dict(unidade='Un',frete=0,margem=None,semLance=False,alternativas=[],createdAt=t,updatedAt=t,deleted=False,qtd=10,custo=5,teto=10),**k)
st={'version':1,'config':{'empresa':{'nome':'EMPRESA','cnpj':'1','telefone':'(42) 1111','whatsapps':['(42) 2222']}},'pregoes':[P(id='p1',numero='1/2026',orgao='Prefeitura Municipal de A')],'itens':[I(id='a',pregaoId='p1',itemEdital='01',descricao='x',marca='m',modelo='n',catalogoDesc='MARCA: m MODELO: n descr')]}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1500,'height':900}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: m.type=='error' and 'tunnel' not in m.text.lower() and 'manifest' not in m.text and errs.append(m.text))
    pg.goto(APP); pg.evaluate("(s)=>{localStorage.setItem('mp.state.v1',s);localStorage.setItem('mp.ui',JSON.stringify({tab:'pdf',pdfPregao:'p1'}))}",json.dumps(st)); pg.reload(); pg.wait_for_timeout(1000)
    pg.click('[data-act="pdf-previa"]'); pg.wait_for_timeout(4000)
    ok = pg.locator('#pdfPronto').count() == 1
    print('OK   PDF (visualização) gera com dois telefones' if ok else 'FALHA PDF não gerou', errs[:3])
    raise SystemExit(0 if ok and not errs else 1)
