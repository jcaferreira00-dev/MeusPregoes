# Pregões MEI (PWA)

Controle de pregões, itens, **valor mínimo da proposta**, **limite do MEI** e **proposta em PDF**.
Funciona offline, instala no celular/PC e guarda tudo no próprio aparelho (a sincronização com o Firebase entra depois).

## Publicar no GitHub Pages (gera o link)

1. No GitHub: **New repository** (ex.: `pregoes-mei`), público.
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório (arraste os arquivos em *Add file → Upload files*; inclua as pastas `css`, `js`, `icons`, `screenshots` e o arquivo oculto `.nojekyll`).
3. **Settings → Pages → Build and deployment**: *Deploy from a branch*, branch `main`, pasta `/ (root)` → **Save**.
4. Em 1 a 2 minutos o link aparece: `https://SEU-USUARIO.github.io/pregoes-mei/`.
5. No celular, abra o link e **instale** (Android/PC: menu do navegador → *Instalar app*; iPhone: Compartilhar → *Adicionar à Tela de Início*).

## Publicar uma nova versão (atualização forçada)

1. Mude o número em **dois lugares**: `const VERSION` em `sw.js` e `APP_VERSION` em `js/core.js`.
2. Envie os arquivos alterados ao GitHub.
3. Os aparelhos buscam a versão nova **no servidor, antes de usar o cache**, ao abrir o app, ao voltar para ele e ao reconectar.
   Se houver texto não salvo, o app **não recarrega**: mostra um aviso e atualiza depois que você salvar ou sair do formulário.

> Dica: o GitHub Pages pode levar alguns minutos para publicar. Use *Config → Buscar atualização* para forçar a checagem.

## Proteção contra perder o que está sendo digitado

- Todo formulário (pregão, item) grava **rascunho automático** a cada tecla.
- Fechar, tocar fora, usar o botão voltar ou a tecla Esc com texto não salvo abre a pergunta: *continuar editando*, *sair e manter rascunho* ou *descartar*.
- Fechar a aba/app com texto não salvo dispara o aviso do navegador.
- O Painel avisa quando existe rascunho pendente e reabre o formulário com o que foi digitado.
- Configurações e dados da proposta salvam sozinhos ao sair de cada campo.

## Sincronização com o Firebase (a ser ligada)

`js/sync.js` já traz a lógica pronta. A regra é **sempre puxar do servidor primeiro**, mesclar (vence o registro com `updatedAt` mais novo; exclusões viram "lápides" `deleted:true`) e **só depois enviar o que mudou**, uma sincronização por vez. Assim um aparelho desatualizado não sobrescreve o servidor nem trava a fila de gravações.

Para ligar, basta criar um adaptador com dois métodos e chamar `Sync.configure(adaptador)`:

```js
adaptador.pull()        // -> Promise<{ config, pregoes: [], itens: [] }>  estado completo do servidor
adaptador.push(changed) // -> Promise<void>  changed = { config|null, pregoes: [], itens: [] }
```

O app já chama `Sync.schedule()` a cada alteração, `Sync.run()` ao abrir e ao voltar a internet.
Registros: `pregoes[]` e `itens[]` (cada um com `id`, `updatedAt`, `deleted`), mais `config`.

## Proposta em PDF

- A aba **Proposta** segue o modelo enviado: dados do órgão e do processo, dados bancários, um bloco por item (“ITEM 04”, descrição completa do edital, marca/modelo), resumo comercial, valor por extenso e assinatura.
- **Papel timbrado**: envie a imagem do cabeçalho (vai no topo de todas as páginas).
- **Marca d’água**: nenhuma, texto ou imagem; opacidade, ângulo e tamanho ajustáveis.
- **Cor do modelo** (faixas, bordas e rótulos) configurável.
- O layout está em `js/pdf.js`, em blocos comentados, e a marca d’água isolada em `desenharMarca()`.
- O PDF é gerado no próprio aparelho (biblioteca `pdf-lib`, MIT, em `js/vendor/`), inclusive sem internet.

## Como o valor mínimo é calculado

- Entrega de carro = (km ÷ consumo × combustível + km × desgaste + pedágio) × viagens, dividida entre os itens do pregão pelo valor de compra.
- Custo unitário final = (qtd × custo + frete + entrega rateada) ÷ qtd.
- **Valor mínimo da proposta** = custo unitário final ÷ (1 − margem), arredondado para cima em centavos. A margem é sobre o preço de venda.
- Total de venda = qtd × lance final; sem lance, usa o valor do edital (pior caso para o teto do MEI).

## Limite do MEI

Status **Ganhou** = a faturar; **Faturado** = nota emitida; **Proposta enviada/Em disputa** entram só no cenário “se ganhar tudo”; Perdeu, Desclassificado e Desisti não contam. No ano de abertura o limite é proporcional (preencha ano e mês em Config). O limite de R$ 81.000 é valor de referência: **confirme o vigente**. Regras de excesso: confirme com um contador.

## Arquivos

```
index.html  manifest.webmanifest  sw.js  browserconfig.xml  .nojekyll
css/style.css
js/core.js  js/pdf.js  js/sync.js  js/app.js  js/vendor/pdf-lib.min.js
icons/      (Android, maskable, Apple, favicons, Windows, SVG)
screenshots/
```

Para testar no computador (precisa de servidor, não abre direto do arquivo): `python3 -m http.server 8000` e acesse `http://localhost:8000`.
