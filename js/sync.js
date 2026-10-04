/* Pregões MEI — sincronização (pronta para receber o Firebase)
 *
 * REGRA: toda sincronização PRIMEIRO puxa o que está no servidor e mescla (vence o registro com
 * updatedAt mais novo; exclusões são "lápides" com deleted:true), e SÓ DEPOIS envia o que mudou.
 * Assim um aparelho desatualizado nunca sobrescreve o servidor nem trava a fila de gravações.
 * Só roda uma sincronização por vez (mutex) e só com internet.
 *
 * COMO LIGAR O FIREBASE: implemente um adaptador com os 2 métodos abaixo e chame
 *   Sync.configure(meuAdaptador)
 * (o código do seu sync entra aqui; o resto do app já chama Sync.schedule() a cada alteração).
 *
 *   adaptador.pull()        -> Promise<{config, pregoes:[], itens:[]}>   estado completo do servidor
 *   adaptador.push(changed) -> Promise<void>   changed = {config|null, pregoes:[], itens:[]}
 */
(function (root) {
  'use strict';

  const LS = 'mp.lastSync';
  const listeners = new Set();

  const Sync = {
    enabled: false,
    running: false,
    state: 'off',          // off | idle | sync | erro | offline
    message: 'Sincronização não configurada',
    lastSync: Number((root.localStorage && root.localStorage.getItem(LS)) || 0),
    adapter: null,
    store: null,
    _t: null,

    attach(store) { this.store = store; },
    configure(adapter) {
      this.adapter = adapter || null;
      this.enabled = !!adapter;
      this._set(this.enabled ? 'idle' : 'off', this.enabled ? 'Pronta' : 'Sincronização não configurada');
      if (this.enabled) this.schedule('configurado', 300);
    },
    on(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    _set(state, message) {
      this.state = state; this.message = message;
      for (const fn of listeners) { try { fn(this); } catch (e) { /* ignora */ } }
    },

    // chamado a cada alteração local (com atraso, juntando várias alterações numa só)
    schedule(reason, delay) {
      if (!this.enabled) return;
      clearTimeout(this._t);
      this._t = setTimeout(() => this.run(reason), delay == null ? 2500 : delay);
    },

    async run(reason) {
      if (!this.enabled || !this.store) return { skipped: 'desligado' };
      if (this.running) return { skipped: 'ocupado' };
      if (root.navigator && root.navigator.onLine === false) { this._set('offline', 'Sem internet: sincroniza quando voltar'); return { skipped: 'offline' }; }
      this.running = true;
      this._set('sync', 'Sincronizando…');
      const t0 = Date.now();
      try {
        // 1) PRIMEIRO traz o servidor e mescla
        const remote = await this.adapter.pull();
        if (remote) this.store.mergeFrom(remote);
        // 2) DEPOIS envia só o que mudou desde a última sincronização
        const changed = this.store.changedSince(this.lastSync);
        if (changed.config || changed.pregoes.length || changed.itens.length) await this.adapter.push(changed);
        this.lastSync = t0;
        try { root.localStorage.setItem(LS, String(t0)); } catch (e) { /* ignora */ }
        this._set('idle', 'Sincronizado às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
        return { ok: true, reason };
      } catch (e) {
        console.error('[sync]', e);
        this._set('erro', 'Falha ao sincronizar: ' + (e && e.message ? e.message : e));
        return { ok: false, error: e };
      } finally {
        this.running = false;
      }
    },
  };

  root.addEventListener && root.addEventListener('online', () => Sync.schedule('online', 500));
  root.Sync = Sync;
  if (typeof module !== 'undefined' && module.exports) module.exports = Sync;
})(typeof window !== 'undefined' ? window : globalThis);
