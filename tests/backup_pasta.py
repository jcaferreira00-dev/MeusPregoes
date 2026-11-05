"""Backup automático em pasta (v1.128.0): sem pasta não faz nada; com pasta grava o dia, mantém 30 diários e 12 semanais e não apaga arquivos de fora; não repete no mesmo dia; horário entre 12h e 20h."""
import json, re
from playwright.sync_api import sync_playwright
FAKE = """
window.__fs = {diaria:{}, semanal:{}};
function fakeDir(nome){ const files = window.__fs[nome];
  return { kind:'directory', name:nome,
    async getFileHandle(n,o){ return { kind:'file', async createWritable(){ let buf=''; return { async write(t){ buf+=t; }, async close(){ files[n]=buf; } }; } }; },
    async *entries(){ for (const k of Object.keys(files)) yield [k,{kind:'file'}]; },
    async removeEntry(n){ delete files[n]; } }; }
"""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900}); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route(re.compile(r'gstatic|nominatim|osrm|bcb'), lambda r:r.abort())
    pg.goto('file://' + __import__('os').path.abspath(__import__('os').path.join(__import__('os').path.dirname(__file__), '..', 'index.html')) + '')
    pg.evaluate("()=>localStorage.setItem('mp.state.v1',JSON.stringify({version:1,config:{},pregoes:[{id:'x',numero:'1/2026',orgao:'A',km:10,createdAt:1,updatedAt:1,deleted:false}],itens:[]}))"); pg.reload(); pg.wait_for_timeout(600)
    pg.add_script_tag(content=FAKE)
    r = pg.evaluate("""async()=>{
      const B=window.__app.Backup;
      // 1) sem pasta (ex.: PC do trabalho): não faz nada e não dá erro
      const r0 = await B.rodar(true);
      // 2) com pastas: 35 dias de arquivos antigos na diária e 15 na semanal -> mantém 30 e 12
      for (let i=1;i<=35;i++) window.__fs.diaria['meus-pregoes-2026-09-'+String(i).padStart(2,'0')+'.json']='x';
      window.__fs.diaria['outro-arquivo.json']='nao apagar';
      for (let i=1;i<=15;i++) window.__fs.semanal['meus-pregoes-semana-2026-0'+(i<10?'7':'8')+'-'+String(i).padStart(2,'0')+'.json']='x';
      await B._setPasta('diaria', fakeDir('diaria')); await B._setPasta('semanal', fakeDir('semanal'));
      const r1 = await B.rodar(true);
      const hoje = new Date().toISOString().slice(0,10);
      const d = Object.keys(window.__fs.diaria), s = Object.keys(window.__fs.semanal);
      const conteudo = JSON.parse(window.__fs.diaria['meus-pregoes-'+window.Core.hojeISO()+'.json']||'{}');
      // 3) automático: já fez hoje -> não repete
      const r2 = await B.rodar(false);
      const h = B.horaDoDia();
      return {r0:r0.feitos, r1:r1.feitos, nd:d.filter(x=>x.startsWith('meus-pregoes-2')).length, outro:d.includes('outro-arquivo.json'), ns:s.length, pregoes:(conteudo.pregoes||[]).length, r2:r2.feitos, hora:h, semana:B.semanaDe('2026-11-05')};
    }""")
    ok = r['r0']==[] and r['r1']==['diaria','semanal'] and r['nd']==30 and r['outro'] and r['ns']==12 and r['pregoes']==1 and r['r2']==[] and 720<=r['hora']<1200 and not errs
    print(r); print('TUDO OK' if ok else 'FALHA: NÃO PUBLICAR'); import sys
    if not ok: sys.exit(1)
    pg.evaluate("()=>localStorage.setItem('mp.ui',JSON.stringify({tab:'config'}))"); pg.reload(); pg.wait_for_timeout(800)
    print(pg.inner_text('.card:has(.bk-row)')[:400] if pg.query_selector('.bk-row') else 'sem cartao (sem showDirectoryPicker no headless?)')
    b.close()
