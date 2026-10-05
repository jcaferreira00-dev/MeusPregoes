/* Pregões MEI — service worker
 * Estratégia "servidor primeiro": HTML, JS, CSS e manifesto vêm SEMPRE da rede (ignorando o cache HTTP);
 * o cache só é usado se estiver offline. Ícones e a biblioteca de PDF ficam em cache.
 * >>> A cada publicação, mude VERSION abaixo (e APP_VERSION dentro do index.html) para os aparelhos atualizarem. <<< */
const VERSION = '1.2.0';
const CACHE = 'pregoes-mei-' + VERSION;
const BASE = self.registration.scope;
const u = (p) => new URL(p, BASE).toString();

const CORE = ['./', 'index.html', 'manifest.webmanifest'];
const STATIC = ['js/vendor/pdf-lib.min.js', 'icons/icon.svg', 'icons/icon-96.png', 'icons/icon-192.png', 'icons/icon-512.png',
  'icons/maskable-192.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.ico', 'icons/favicon-32.png', 'icons/favicon-16.png'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // 'reload' ignora o cache HTTP: garante arquivos novos do servidor
    await Promise.all([...CORE, ...STATIC].map(async (p) => {
      try { await cache.put(u(p), await fetch(new Request(u(p), { cache: 'reload' }))); } catch (e) { /* offline na instalação: segue */ }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('pregoes-mei-') && k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

const isCore = (url) => /\.(?:html|js|css|webmanifest|json)$/i.test(url.pathname) && !url.pathname.includes('/vendor/');

async function networkFirst(req, fallbackKey) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(new Request(req.url, { cache: 'no-cache', credentials: 'same-origin' }));
    if (res && res.ok) cache.put(req.url.split('#')[0], res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(req.url, { ignoreSearch: true }) || (fallbackKey && await cache.match(u(fallbackKey)));
    if (hit) return hit;
    return new Response('Sem conexão e sem cópia guardada.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req.url, { ignoreSearch: true });
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req.url, res.clone());
  return res;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // Firebase etc.: passa direto
  if (req.mode === 'navigate') { event.respondWith(networkFirst(new Request(u('index.html')), 'index.html')); return; }
  if (isCore(url)) { event.respondWith(networkFirst(req, null)); return; }
  event.respondWith(cacheFirst(req));
});

self.addEventListener('message', (event) => { if (event.data === 'SKIP_WAITING') self.skipWaiting(); });
