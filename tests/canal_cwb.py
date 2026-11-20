"""Canal compartilhado da praça Curitiba (v1.170.0): João (uid próprio) e William (uid fixo do app) com um Firebase falso.
Rodar: python3 tests/canal_cwb.py   (reaproveita o servidor falso do teste de sincronização)"""
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
const U=(/uid=([^&]+)/.exec(location.hash)||[0,'%s'])[1]; let user = location.hash.includes('semlogin') ? null : {uid:U,email:'t@t.com'}; const cbs=[];
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


WILLIAM = 'jRUcEfhYowPwfubkswkLRTlSUh32'; JOAO = 'u-joao'
t0 = int(time.time() * 1000) - 86400000
P = lambda **k: dict(dict(plataforma='BLL', status='Cotando', viagens=1, pedagio=0, km=100, createdAt=t0, updatedAt=t0, deleted=False), **k)
I = lambda **k: dict(dict(unidade='Un', frete=0, margem=None, semLance=False, alternativas=[], createdAt=t0, updatedAt=t0, deleted=False), **k)
estado = {'version': 1, 'config': {'margemPadrao': 0.4, 'updatedAt': t0, 'consumo': 10, 'combustivel': 6, 'origemCwb': 'Rua X, Curitiba',
   'empresa': {'nome': 'EMPRESA TESTE', 'cnpj': '11.111.111/0001-11', 'banco': '208', 'conta': '9999', 'cpf': '000.000.000-00'}},
  'pregoes': [P(id='tb1', numero='1/2026', orgao='Prefeitura de Tibagi', cidadeUf='Tibagi/PR'), P(id='cw1', numero='2/2026', orgao='Prefeitura de Curitiba', cidadeUf='Curitiba/PR')],
  'itens': [I(id='i_tb', pregaoId='tb1', itemEdital='01', descricao='Item TB', qtd=1, custo=5, teto=9), I(id='i_cw', pregaoId='cw1', itemEdital='01', descricao='Item CWB', qtd=2, custo=5, teto=9)]}
falhas, erros = [], []
def ok(c, n):
    print(('OK   ' if c else 'FALHA') + ' ' + n)
    if not c: falhas.append(n)
def esperar(pg, js, ms=15000):
    fim = time.time() + ms / 1000
    while time.time() < fim:
        try:
            if pg.evaluate(js): return True
        except Exception: pass
        time.sleep(0.25)
    return False
SYNC_OK = "()=>window.Sync&&window.Sync.state==='idle'&&window.Sync.confirmado&&!window.Sync.running"
NUVEM = lambda: {k: v[1] for k, v in DB.items()}
with sync_playwright() as p:
    b = p.chromium.launch(args=['--no-proxy-server'])
    def aparelho(nome, uid, est):
        ctx = b.new_context(viewport={'width': 1400, 'height': 900})
        ctx.route(re.compile(r'gstatic\.com/'), rota)
        for h in ['**/nominatim.openstreetmap.org/**', '**/router.project-osrm.org/**', '**/api.bcb.gov.br/**']: ctx.route(h, lambda r: r.abort())
        pg = ctx.new_page(); pg.on('pageerror', lambda e: erros.append(nome + ': ' + str(e)))
        pg.goto(APP + '#uid=' + uid)
        for _ in range(3):
            try:
                pg.wait_for_load_state('load'); time.sleep(0.4)
                pg.evaluate("(s)=>{localStorage.clear(); if(s) localStorage.setItem('mp.state.v1',s)}", json.dumps(est) if est else None)
                pg.reload(); break
            except Exception: time.sleep(1)
        time.sleep(1.5); return ctx, pg
    # 1. João envia: o canal 'cwb' recebe SÓ o pregão de Curitiba (e o item dele) + config sem dados pessoais
    cj, J = aparelho('João', JOAO, estado)
    ok(esperar(J, SYNC_OK), 'João: sincronizou')
    time.sleep(1.5)
    nuv = NUVEM()
    pzs = [k for k in nuv if k.startswith('pregoesmei_pz_') and k.endswith('/cwb')]
    ok(len(pzs) == 1 and pzs[0] == 'pregoesmei_pz_cw1/cwb', 'canal cwb tem só o pregão de Curitiba (%s)' % pzs)
    ok(not any(k.startswith('pregoesmei_pz_tb1') and k.endswith('/cwb') for k in nuv), 'pregão de Telêmaco NÃO está no canal cwb')
    emp = nuv.get('pregoesmei_cfg/cwb', {}).get('config', {}).get('empresa', {})
    ok(emp.get('nome') == 'EMPRESA TESTE' and not emp.get('conta') and not emp.get('cpf') and not emp.get('banco'), 'config do canal cwb sem banco/CPF')
    ok(nuv.get('pregoesmei_cfg/cwb', {}).get('config', {}).get('origemCwb') == 'Rua X, Curitiba', 'config do canal cwb leva o endereço de saída')
    ok('pregoesmei_pz_tb1/' + JOAO in nuv, 'canal do João continua com todos os pregões')
    # 2. William entra: só o canal cwb, modo Curitiba, só o pregão de Curitiba
    cw, W = aparelho('William', WILLIAM, None)
    esperar(W, "()=>document.documentElement.classList.contains('cwb')", 8000)
    ok(esperar(W, SYNC_OK, 20000), 'William: sincronizou')
    esperar(W, "()=>window.__app.store.full().pregoes.length>=1")
    nomes = W.evaluate("()=>window.__app.store.full().pregoes.map(p=>p.id)")
    ok(nomes == ['cw1'], 'William só tem o pregão de Curitiba (%s)' % nomes)
    ok(W.evaluate("()=>document.documentElement.classList.contains('cwb')"), 'William abre no modo Curitiba')
    ok(not any(k.endswith('/' + WILLIAM) for k in NUVEM()), 'William não grava nada na gaveta própria (usa só o canal cwb)')
    # 3. William edita (status + novo pregão): vai para o canal e chega no João
    W.evaluate("()=>{const a=window.__app.store; a.upsertPregao({id:'cw1', status:'Julgamento'}); a.upsertPregao({id:'cw2', numero:'9/2026', orgao:'Câmara de Curitiba', cidadeUf:'Curitiba/PR'});}")
    esperar(W, SYNC_OK)
    fim = time.time() + 15
    while time.time() < fim and 'pregoesmei_pz_cw2/cwb' not in NUVEM(): time.sleep(0.3)
    ok(NUVEM().get('pregoesmei_pz_cw2/cwb', {}).get('pregao', {}).get('praca') == 'CWB', 'pregão novo do William nasce com praça CWB')
    ok(esperar(J, "()=>{const s=window.__app.store.full();const p=s.pregoes.find(x=>x.id==='cw1');const q=s.pregoes.find(x=>x.id==='cw2');return p&&p.status==='Julgamento'&&!!q}", 20000), 'João recebeu a edição e o pregão novo do William')
    # 4. João edita pregão de Curitiba: chega no William; pregão de Telêmaco nunca chega
    J.evaluate("()=>window.__app.store.upsertPregao({id:'cw1', obs:'nota do João'})")
    esperar(J, SYNC_OK)
    ok(esperar(W, "()=>{const p=window.__app.store.full().pregoes.find(x=>x.id==='cw1');return p&&p.obs==='nota do João'}", 20000), 'William recebeu a edição do João')
    ok(not W.evaluate("()=>window.__app.store.full().pregoes.some(p=>p.id==='tb1')"), 'William continua sem ver pregão de Telêmaco')
    # 5. config do William não entra no João
    W.evaluate("()=>window.__app.store.setConfigPath('consumo', 99)")
    esperar(W, SYNC_OK); time.sleep(1.5); esperar(J, SYNC_OK)
    ok(J.evaluate("()=>window.__app.store.full().config.consumo") == 10, 'config do William não altera a do João')
    # 6. João sozinho (sem William): nada quebra e o canal main segue igual
    ok(not erros, 'sem erros de JS: ' + '; '.join(erros[:3]))
    b.close()
print('\nTUDO OK' if not falhas else '\nFALHAS: ' + ', '.join(falhas)); sys.exit(1 if falhas else 0)
