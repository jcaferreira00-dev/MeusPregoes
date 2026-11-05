"""Sincronização com uma ficha por pregão (v1.121.0): teste com DUAS fontes (PC e celular) e um Firebase falso.
Rodar antes de publicar qualquer mudança na sincronização:  python3 tests/sync_duas_fontes.py
O Firebase falso guarda os documentos num servidor local e faz transações de verdade (lê -> confere versão -> grava)."""
import json, os, re, sys, threading, time, copy
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
UID = 'u-teste'

# ---------------- "Firestore" local ----------------
DB, LOCK, VER = {}, threading.Lock(), [0]
class H(BaseHTTPRequestHandler):
    def log_message(self, *a): pass
    def _ok(self, obj):
        b = json.dumps(obj).encode(); self.send_response(200)
        self.send_header('Content-Type', 'application/json'); self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', '*'); self.end_headers(); self.wfile.write(b)
    def do_OPTIONS(self): self._ok({})
    def do_GET(self):
        path = self.path.split('?p=', 1)[1] if '?p=' in self.path else ''
        from urllib.parse import unquote; path = unquote(path)
        with LOCK: v, d = DB.get(path, (0, None))
        self._ok({'ver': v, 'data': d})
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers['Content-Length'])) or b'{}')
        with LOCK:
            for p, v in body.get('reads', {}).items():
                if DB.get(p, (0, None))[0] != v: return self._ok({'ok': False})
            for w in body.get('writes', []):
                VER[0] += 1
                if w['data'] is None: DB.pop(w['path'], None)
                else: DB[w['path']] = (VER[0], w['data'])
        self._ok({'ok': True})
srv = ThreadingHTTPServer(('127.0.0.1', 0), H); PORT = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{PORT}'

FAKE = {
 'firebase-app.js': "export function initializeApp(c){return {c};}",
 'firebase-auth.js': """export function getAuth(){return {};}
const U='%s'; let user = location.hash.includes('semlogin') ? null : {uid:U,email:'t@t.com'}; const cbs=[];
export function onAuthStateChanged(a,cb){cbs.push(cb);setTimeout(()=>cb(user),30);return ()=>{};}
export async function signInWithEmailAndPassword(a,e,senha){ if(senha!=='certa') throw Object.assign(new Error('x'),{code:'auth/wrong-password'}); user={uid:U,email:e}; cbs.forEach((c)=>c(user)); return {user}; }
export async function createUserWithEmailAndPassword(){} export async function signOut(){ user=null; cbs.forEach((c)=>c(null)); }""" % UID,
 'firebase-firestore.js': """const U='%s';
const off=()=>globalThis.__offline===true;
async function get(path){ if(off()) throw Object.assign(new Error('offline'),{code:'unavailable'}); const r=await fetch(U+'/doc?p='+encodeURIComponent(path)); return r.json(); }
async function commit(reads,writes){ if(off()) throw Object.assign(new Error('offline'),{code:'unavailable'}); const r=await fetch(U+'/commit',{method:'POST',body:JSON.stringify({reads,writes})}); return (await r.json()).ok; }
const snap=(path,r,fromCache)=>({id:path,exists:()=>r.data!==null&&r.data!==undefined,data:()=>JSON.parse(JSON.stringify(r.data)),metadata:{fromCache:!!fromCache}});
export function getFirestore(){return {};} export function enableIndexedDbPersistence(){return Promise.resolve();}
export function doc(db,c,id){return {path:c+'/'+id};}
export async function getDoc(ref){return snap(ref.path,await get(ref.path),false);}
export async function getDocFromServer(ref){return snap(ref.path,await get(ref.path),false);}
export async function setDoc(ref,d){await commit({},[{path:ref.path,data:JSON.parse(JSON.stringify(d))}]);}
export async function runTransaction(db,fn){
  for(let t=0;t<8;t++){ const reads={},writes=[];
    const tx={get:async(ref)=>{const r=await get(ref.path);reads[ref.path]=r.ver;return snap(ref.path,r,false);},
      set:(ref,d)=>{writes.push({path:ref.path,data:JSON.parse(JSON.stringify(d))});},delete:(ref)=>{writes.push({path:ref.path,data:null});}};
    const res=await fn(tx); if(await commit(reads,writes)) { globalThis.__commits=(globalThis.__commits||0)+1; globalThis.__writes=(globalThis.__writes||0)+writes.length; return res; } }
  throw new Error('transação: conflito demais');
}
export function onSnapshot(ref,a,b,c){ const cb=typeof a==='function'?a:b; let last=-1,stop=false;
  const tick=async()=>{ if(stop)return; try{ if(!off()){const r=await get(ref.path); if(r.ver!==last){last=r.ver;cb(snap(ref.path,r,false));}} }catch(e){} if(!stop)setTimeout(tick,250); };
  tick(); return ()=>{stop=true;}; }
""" % URL,
}

def rota(route):
    nome = route.request.url.rsplit('/', 1)[-1]
    if nome in FAKE: route.fulfill(status=200, body=FAKE[nome], headers={'Content-Type': 'application/javascript', 'Access-Control-Allow-Origin': '*'})
    else: route.abort()

# ---------------- dados de teste (parecidos com o backup real: muitos pregões, texto longo do edital) ----------------
t0 = int(time.time() * 1000) - 86400000
def mk_state():
    ps, its = [], []
    for n in range(45):
        pid = f'p{n}' if n % 3 else f'5f1c{n:04d}-aaaa-bbbb-cccc-0000000000{n:02d}'   # ids no formato do app e UUID
        ps.append(dict(id=pid, numero=f'{n}/2026', orgao=f'PREFEITURA {n}', cidadeUf='Tibagi/PR', km=80, viagens=1, pedagio=0,
                       status='Desisti' if n % 4 == 0 else 'Analisando', createdAt=t0, updatedAt=t0 + n, deleted=False))
        for k in range(18):
            its.append(dict(id=f'{pid}-i{k}', pregaoId=pid, itemEdital=str(k + 1), descricao=f'Item {k}', unidade='Un', qtd=10, custo=5, teto=9,
                            frete=0, margem=None, semLance=(k % 5 == 0), alternativas=[{'loja': 'Loja', 'link': 'https://x.com/p', 'custo': 5, 'frete': 0}],
                            descEdital='Texto do edital ' * 50, createdAt=t0, updatedAt=t0 + k, deleted=False))
    its.append(dict(id='orfao', pregaoId='nao-existe', descricao='Item órfão', qtd=1, custo=1, teto=2, createdAt=t0, updatedAt=t0, deleted=False))
    cfg = {'margemPadrao': 0.4, 'updatedAt': t0, 'empresa': {'nome': 'EMPRESA TESTE', 'cnpj': '11.111.111/0001-11', 'banco': '208', 'conta': '123'}}
    return {'version': 1, 'config': cfg, 'pregoes': ps, 'itens': its}

falhas, erros = [], []
def ok(cond, nome):
    print(('OK   ' if cond else 'FALHA') + ' ' + nome)
    if not cond: falhas.append(nome)

def esperar(pg, js, ms=15000):
    fim = time.time() + ms / 1000
    while time.time() < fim:
        try:
            if pg.evaluate(js): return True
        except Exception: pass
        time.sleep(0.25)
    return False

ATIVOS = "()=>{const s=window.__app.store.get();return [s.pregoes.filter(p=>!p.deleted).length,s.itens.filter(i=>!i.deleted).length]}"
SYNC_OK = "()=>window.Sync&&window.Sync.state==='idle'&&window.Sync.confirmado&&!window.Sync.running"
NUVEM = lambda: {k: v[1] for k, v in DB.items()}

with sync_playwright() as p:
    b = p.chromium.launch(args=['--no-proxy-server'])
    def aparelho(nome, estado, vw):
        ctx = b.new_context(viewport=vw)
        ctx.route(re.compile(r'gstatic\.com/'), rota)
        for h in ['**/nominatim.openstreetmap.org/**', '**/router.project-osrm.org/**', '**/api.bcb.gov.br/**']: ctx.route(h, lambda r: r.abort())
        pg = ctx.new_page(); pg.on('pageerror', lambda e: erros.append(nome + ': ' + str(e)))
        pg.goto(APP)
        pg.evaluate("(s)=>{localStorage.clear(); if(s) localStorage.setItem('mp.state.v1',s)}", json.dumps(estado) if estado else None)
        pg.reload(); return ctx, pg

    # ---- 1. migração: a nuvem só tem a ficha antiga (como hoje) ----
    real = mk_state()
    antiga = copy.deepcopy(real); antiga['atualizadoEm'] = t0
    DB['pregoesmei_usuarios/' + UID] = (1, antiga); VER[0] = 1
    ctxA, A = aparelho('PC', None, {'width': 1500, 'height': 950})
    ok(esperar(A, SYNC_OK), 'PC: primeira sincronização (migração) terminou')
    esperar(A, "()=>window.__app.store.get().pregoes.length===45")
    nuv = NUVEM()
    idx = nuv.get('pregoesmei_idx/' + UID) or {}
    ok(idx.get('v') == 2 and len(idx.get('pz', [])) == 46, 'Migração: índice com 45 pregões + itens sem pregão (%s fichas)' % len(idx.get('pz', [])))
    ok('pregoesmei_usuarios/' + UID in nuv and nuv['pregoesmei_usuarios/' + UID] == antiga, 'Migração: ficha antiga guardada sem mudança')
    ok(A.evaluate(ATIVOS) == [45, 18 * 45 + 1], 'Migração: contagem de pregões e itens igual no aparelho')
    ok(nuv.get('pregoesmei_cfg/' + UID, {}).get('config', {}).get('empresa', {}).get('nome') == 'EMPRESA TESTE', 'Migração: config (dados da empresa) na ficha própria')
    maior = max(len(json.dumps(v)) for k, v in nuv.items() if k.startswith('pregoesmei_pz_'))
    total = sum(len(json.dumps(v)) for k, v in nuv.items() if k.startswith('pregoesmei_pz_'))
    print('     (maior ficha de pregão: %d caracteres; soma: %d; antes era um documento só)' % (maior, total))
    lm = A.evaluate("()=>{const s=window.__app.store.get();const r=window.Core.computeAll(s);return JSON.stringify(Object.keys(r).length)}")
    ok(bool(lm), 'Migração: cálculos rodam com os dados migrados')

    # ---- celular abre depois, vazio, e recebe tudo ----
    ctxB, B = aparelho('celular', None, {'width': 390, 'height': 844})
    ok(esperar(B, SYNC_OK) and esperar(B, "()=>window.__app.store.get().itens.filter(i=>!i.deleted).length===%d" % (18 * 45 + 1)), 'Celular: recebe tudo da estrutura nova')
    ok(B.evaluate("()=>window.__app.store.get().config.empresa.nome") == 'EMPRESA TESTE', 'Celular: dados da empresa chegaram')

    # ---- 2. editar um item no PC -> aparece no celular ----
    w0 = A.evaluate("()=>globalThis.__writes||0")
    A.evaluate("()=>window.__app.store.upsertItem({id:'p1-i3',custo:7.77})")
    ok(esperar(B, "()=>window.__app.store.get().itens.find(i=>i.id==='p1-i3').custo===7.77"), 'Editar item no PC aparece no celular')
    esperar(A, SYNC_OK)
    w1 = A.evaluate("()=>globalThis.__writes||0")
    ok(0 < w1 - w0 <= 3, 'Edição grava só a ficha do pregão + índice (%d gravações)' % (w1 - w0))

    # ---- 3. mesmo item nos dois quase ao mesmo tempo -> vence o mais novo, nada some ----
    A.evaluate("()=>window.__app.store.upsertItem({id:'p2-i1',descricao:'do PC'})")
    time.sleep(0.05)
    B.evaluate("()=>window.__app.store.upsertItem({id:'p2-i1',descricao:'do celular'})")
    ok(esperar(A, "()=>window.__app.store.get().itens.find(i=>i.id==='p2-i1').descricao==='do celular'") and
       esperar(B, "()=>window.__app.store.get().itens.find(i=>i.id==='p2-i1').descricao==='do celular'"), 'Mesmo item nos dois: vence o mais novo nos dois aparelhos')

    # ---- 4. excluir no PC enquanto o celular edita outro item do MESMO pregão ----
    A.evaluate("()=>window.__app.store.removeItem('p4-i2')")
    B.evaluate("()=>window.__app.store.upsertItem({id:'p4-i5',descricao:'editado no celular'})")
    cond = "()=>{const s=window.__app.store.get();const a=s.itens.find(i=>i.id==='p4-i2'),b=s.itens.find(i=>i.id==='p4-i5');return a.deleted===true&&b.descricao==='editado no celular'}"
    ok(esperar(A, cond) and esperar(B, cond), 'Exclusão e edição no mesmo pregão sobrevivem nos dois')

    # ---- 5. sem internet: edita, volta online, envia ----
    B.evaluate("()=>{globalThis.__offline=true;}"); ctxB.set_offline(True)
    B.evaluate("()=>window.__app.store.upsertItem({id:'p5-i1',descricao:'feito sem internet'})")
    time.sleep(1.5)
    ok(A.evaluate("()=>window.__app.store.get().itens.find(i=>i.id==='p5-i1').descricao") != 'feito sem internet', 'Sem internet: nada sai do celular')
    ctxB.set_offline(False); B.evaluate("()=>{globalThis.__offline=false;window.dispatchEvent(new Event('online'))}")
    ok(esperar(A, "()=>window.__app.store.get().itens.find(i=>i.id==='p5-i1').descricao==='feito sem internet'", 25000), 'Volta a internet: envia e o PC recebe')

    # ---- 6. Limpar desistências no PC -> some no celular ----
    A.evaluate("()=>window.__app.store.apagarDesisti()")
    cond = "()=>window.__app.store.get().pregoes.filter(p=>!p.deleted&&p.status==='Desisti').length===0"
    ok(esperar(B, cond, 20000), 'Limpar desistências no PC some no celular')

    # ---- 7. importar (Mesclar) no celular -> chega ao PC ----
    B.evaluate("""()=>{window.__app.store.mergeFrom({version:1,config:{},pregoes:[{id:'imp1',numero:'900/2026',orgao:'IMPORTADO',km:10,viagens:1,createdAt:Date.now(),updatedAt:Date.now(),deleted:false}],itens:[{id:'imp1-a',pregaoId:'imp1',descricao:'x',qtd:1,custo:1,teto:2,createdAt:Date.now(),updatedAt:Date.now(),deleted:false}]}); window.Sync.schedule('importação',100);}""")
    ok(esperar(A, "()=>!!window.__app.store.get().itens.find(i=>i.id==='imp1-a')"), 'Importar (Mesclar) no celular chega ao PC')

    # ---- 8. pregão novo no celular -> aparece no PC e entra no índice ----
    B.evaluate("()=>window.__app.store.upsertPregao({id:'novo-cel',numero:'777/2026',orgao:'NOVO',km:20,viagens:1})")
    ok(esperar(A, "()=>!!window.__app.store.get().pregoes.find(p=>p.id==='novo-cel')"), 'Pregão novo no celular aparece no PC')
    ok(any(x['k'] == 'novo-cel' for x in NUVEM()['pregoesmei_idx/' + UID]['pz']), 'Pregão novo entra no índice')

    # ---- 9. aparelho com a versão ANTIGA grava na ficha antiga -> o novo junta e reenvia ----
    with LOCK:
        v, d = DB['pregoesmei_usuarios/' + UID]
        d = copy.deepcopy(d); d['itens'].append(dict(id='velho-1', pregaoId='p7', descricao='gravado pela versão antiga', qtd=1, custo=1, teto=2, createdAt=int(time.time()*1000), updatedAt=int(time.time()*1000), deleted=False))
        VER[0] += 1; DB['pregoesmei_usuarios/' + UID] = (VER[0], d)
    ok(esperar(B, "()=>!!window.__app.store.get().itens.find(i=>i.id==='velho-1')", 20000), 'Versão antiga gravando: o celular junta as mudanças')
    ok(esperar(A, "()=>!!window.__app.store.get().itens.find(i=>i.id==='velho-1')", 20000), 'Versão antiga gravando: chega também ao outro aparelho')

    # ---- 10. "Verificar com a nuvem" bate com o servidor ----
    esperar(A, SYNC_OK); esperar(B, SYNC_OK); time.sleep(1.5)
    r = A.evaluate("async()=>{const n=await window.CloudSync.buscarDoServidor('%s');const s=window.__app.store.get();return [window.Core.pendenciasNuvem(s,n).n, window.Core.pendenciasNuvem(n,s).n]}" % UID)
    ok(r == [0, 0], 'Verificar com a nuvem: PC igual ao servidor (%s)' % r)
    r = B.evaluate("async()=>{const n=await window.CloudSync.buscarDoServidor('%s');const s=window.__app.store.get();return [window.Core.pendenciasNuvem(s,n).n, window.Core.pendenciasNuvem(n,s).n]}" % UID)
    ok(r == [0, 0], 'Verificar com a nuvem: celular igual ao servidor (%s)' % r)
    # parado: não fica regravando (o hash estável evita envio à toa)
    w0 = A.evaluate("()=>globalThis.__writes||0"); time.sleep(4); w1 = A.evaluate("()=>globalThis.__writes||0")
    ok(w1 == w0, 'Parado: não fica regravando a nuvem à toa')
    ok(not any(k.startswith('pregoesmei_cat_') for k in NUVEM()), 'Fotos do catálogo continuam no lugar delas (não mexi)')

    # ---- limite de 1 MB agora é por pregão ----
    A.evaluate("()=>window.__app.store.upsertItem({id:'p10-i1',descEdital:'x'.repeat(980000)})")
    ok(esperar(A, "()=>window.Sync.state==='erro'&&/pregão 10\\/2026/.test(window.Sync.message)"), 'Pregão acima de 1 MB: erro diz qual pregão')
    A.evaluate("()=>window.__app.store.upsertItem({id:'p10-i1',descEdital:'curto'})")
    ok(esperar(A, SYNC_OK, 40000), 'Corrigido o pregão grande, volta a sincronizar')
    # ---- tela de entrada (F26): sem conta conectada o app não abre ----
    ctxC = b.new_context(viewport={'width': 1500, 'height': 950}); ctxC.route(re.compile(r'gstatic\.com/'), rota)
    for h in ['**/nominatim.openstreetmap.org/**', '**/router.project-osrm.org/**', '**/api.bcb.gov.br/**']: ctxC.route(h, lambda r: r.abort())
    C3 = ctxC.new_page(); C3.on('pageerror', lambda e: erros.append('entrada: ' + str(e)))
    C3.goto(APP + '#semlogin'); C3.wait_for_timeout(1200)
    ok(C3.is_visible('#gate') and not C3.is_visible('text=Criar conta'), 'Entrada: sem conta conectada aparece a tela de entrada (sem "Criar conta")')
    C3.fill('#gEmail', 't@t.com'); C3.fill('#gSenha', 'errada'); C3.click('#gate button[type=submit]'); C3.wait_for_timeout(600)
    ok(C3.is_visible('#gate') and len(C3.inner_text('#gate .g-msg')) > 3, 'Entrada: senha errada mostra o aviso e não abre')
    C3.fill('#gSenha', 'certa'); C3.click('#gate button[type=submit]')
    ok(esperar(C3, "()=>document.getElementById('gate').hidden===true") and esperar(C3, SYNC_OK), 'Entrada: senha certa abre o app e sincroniza')
    ok(esperar(C3, "()=>window.__app.store.get().pregoes.some(p=>p.id==='novo-cel')"), 'Entrada: depois de entrar, os pregões da conta chegam')
    C3.evaluate("()=>window.CloudSync.logout()")
    ok(esperar(C3, "()=>document.getElementById('gate').hidden===false"), 'Entrada: sair da conta volta para a tela de entrada')
    b.close()

srv.shutdown()
erros = [e for e in erros if 'offline' not in e]
ok(not erros, 'Sem erro de JavaScript nos dois aparelhos' + ('' if not erros else ': ' + erros[0][:160]))
print('\n' + ('TUDO OK' if not falhas else str(len(falhas)) + ' FALHA(S): NÃO PUBLICAR'))
sys.exit(1 if falhas else 0)
