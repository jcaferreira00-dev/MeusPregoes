# Pregões MEI (PWA)

Controle de pregões, itens, **valor mínimo da proposta**, **limite do MEI** e **proposta em PDF**.
Funciona offline, instala no celular/PC e guarda tudo no próprio aparelho (a sincronização com o Firebase entra depois).

## Publicar no GitHub Pages (gera o link)

1. No GitHub: **New repository** (ex.: `pregoes-mei`), público.
2. Envie **todo o conteúdo desta pasta** para a raiz do repositório (arraste tudo em *Add file → Upload files*; não há arquivos ocultos).
3. **Settings → Pages → Build and deployment**: *Deploy from a branch*, branch `main`, pasta `/ (root)` → **Save**.
4. Em 1 a 2 minutos o link aparece: `https://SEU-USUARIO.github.io/pregoes-mei/`.
5. No celular, abra o link e **instale** (Android/PC: menu do navegador → *Instalar app*; iPhone: Compartilhar → *Adicionar à Tela de Início*).

## Publicar uma nova versão (atualização forçada)

1. Mude o número em **dois lugares**: `const VERSION` em `sw.js` e `APP_VERSION` dentro do `index.html` (procure por `APP_VERSION`).
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

## Sincronização com o Firebase (já ligada)

Usa o seu `cloud-sync.js` (mesmo projeto `ajuste-financeiro`, login por e-mail e senha, Firestore). Coleção própria: `pregoesmei_usuarios`, um documento por usuário.

**Faça uma vez no console do Firebase:**
1. **Authentication › Configurações › Domínios autorizados**: adicione `SEU-USUARIO.github.io`. Sem isso o login falha.
2. **Firestore › Regras**: acrescente este bloco dentro de `match /databases/{database}/documents { ... }` (sem apagar as regras dos outros apps):
```
match /pregoesmei_usuarios/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```
3. No app: **Config › Conta e sincronização › Entrar** (ou *Criar conta*). Use a mesma conta em todos os aparelhos.

**Como funciona:** a cada alteração, e ao abrir, o app lê o servidor, mescla (vence o registro com `updatedAt` mais novo; exclusões viram "lápides") e grava numa **transação**, uma sincronização por vez. Mudanças de outro aparelho chegam ao vivo. Se a nuvem ficar sem algo que o aparelho tem, ele reenvia sozinho. Em falha, tenta de novo com espera crescente.

**Limites:**
- Papel timbrado e marca d'água ficam só em cada aparelho (imagens grandes estourariam o limite de 1 MB do documento).
- Todo o estado cabe em um documento de até ~1 MB (cerca de 1.500 itens). Passando disso, o app avisa; exporte um backup e apague pregões antigos.
- Ao entrar com uma conta diferente num aparelho que já tem dados, o app pergunta o que fazer com eles.

## Proposta em PDF

- A aba **Proposta** segue o modelo enviado: dados do órgão e do processo, dados bancários, um bloco por item (“ITEM 04”, descrição completa do edital, marca/modelo), resumo comercial, valor por extenso e assinatura.
- **Papel timbrado**: envie a imagem do cabeçalho (vai no topo de todas as páginas).
- **Marca d’água**: nenhuma, texto ou imagem; opacidade, ângulo e tamanho ajustáveis.
- **Cor do modelo** (faixas, bordas e rótulos) configurável.
- O layout está no bloco `PDF DA PROPOSTA` do `index.html`, em blocos comentados, e a marca d’água isolada em `desenharMarca()`.
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
index.html            <- app inteiro (estilos, cálculos, telas, PDF e Firebase), em blocos comentados
sw.js                 <- atualização e modo offline (mude VERSION a cada publicação)
manifest.webmanifest  <- nome, cores e atalhos do app instalado
browserconfig.xml     <- ícones de tile do Windows
icons/                <- ícones (Android, maskable, Apple, favicons, Windows, SVG)
js/vendor/            <- pdf-lib (gera o PDF; MIT)
```

Para testar no computador (precisa de servidor, não abre direto do arquivo): `python3 -m http.server 8000` e acesse `http://localhost:8000`.
