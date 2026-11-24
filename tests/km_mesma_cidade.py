"""Km dentro da mesma cidade (v1.175.1): rota de 0 km não pode deixar o pregão "sem km" nem fazer o app recalcular em laço."""
import json, time, os
from playwright.sync_api import sync_playwright
APP = 'file://' + os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'index.html'))
t = int(time.time() * 1000)
st = {'version': 1, 'config': {'empresa': {'cidade': 'Telêmaco Borba', 'uf': 'PR', 'endereco': 'Rua X'}},
      'pregoes': [dict(id='p1', numero='61/2026', orgao='Prefeitura Municipal de Telêmaco Borba', cidadeUf='Telêmaco Borba/PR', status='Falta dados', km=10, viagens=1, createdAt=t, updatedAt=t, deleted=False)], 'itens': []}
falhas = []
def ok(c, n):
    print(('OK   ' if c else 'FALHA') + ' ' + n)
    if not c: falhas.append(n)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    chamadas = {'osrm': 0}
    pg.route('**/gstatic.com/**', lambda r: r.abort())
    pg.route('**/nominatim.openstreetmap.org/**', lambda r: r.fulfill(status=200, content_type='application/json', body='[{"lat":"-24.32","lon":"-50.61"}]'))
    def osrm(r):
        chamadas['osrm'] += 1
        r.fulfill(status=200, content_type='application/json', body='{"routes":[{"distance":0,"duration":0}]}')
    pg.route('**/router.project-osrm.org/**', osrm)
    pg.goto(APP); pg.evaluate("(s)=>{localStorage.setItem('mp.state.v1',s);localStorage.setItem('mp.ui',JSON.stringify({tab:'pregoes'}))}", json.dumps(st)); pg.reload()
    pg.wait_for_timeout(9000)
    s = json.loads(pg.evaluate("()=>localStorage.getItem('mp.state.v1')"))
    p1 = [x for x in s['pregoes'] if x['id'] == 'p1'][0]
    ok(p1['km'] >= 10, 'Mesma cidade: km gravado com o mínimo de 10 km (veio %s)' % p1['km'])
    ok(chamadas['osrm'] == 1, 'Mesma cidade: rota calculada uma vez só, sem laço (%d chamadas)' % chamadas['osrm'])
    b.close()
print('\nTUDO OK' if not falhas else '\nFALHOU: ' + ', '.join(falhas))
