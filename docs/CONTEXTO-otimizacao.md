# Contexto da otimização do app (leia ANTES de mexer — escrito em 31/10/2026)

> Este arquivo é a memória da conversa que levou ao Depurador. Repositório público: sem dados pessoais.
> Quem for continuar (Claude em nova conversa): leia este arquivo + `CLAUDE.md` + `depurador/catalogo.js`. Não mude nada do app sem decisão do João.

## 1. Estado atual
- App `index.html` v1.110.0 publicado na `main` (GitHub Pages). `tests/protegidas.py` = TUDO OK.
- Depurador (PWA) publicado em `/depurador/` (mesmo domínio do app, lê o app em iframe e os dados do navegador; só leitura).
  - Arquivos: `depurador/index.html`, `catalogo.js` (117 funcionalidades), `manifest.webmanifest`, `sw.js` (cache próprio `depurador-*`, não toca `pregoes-mei-*`), `icons/`.
  - Abas: Resumo · Funcionalidades (marcar decisão Manter/Enxugar/Fundir/Remover/Decidir depois + anotação) · App ao vivo (varredura, inspetor, destaque, tamanhos PC/1000/390, erros do console) · Saúde · Código (análise estática) · Uso (sondas nos dados + cliques).
  - Exporta: relatório .md, decisões .json, impressão/PDF. Decisões ficam no `localStorage` do navegador (`dep.decisoes`); cliques em `dep.uso`.
  - Relatório estático: `docs/relatorio-funcionalidades.md` (gerado do catálogo, sem uso real).
- Regra nova no CLAUDE.md: ao criar/mudar/tirar função do app, atualizar a entrada no `catalogo.js` no mesmo commit.

## 2. Como o João vai trabalhar (semana de 02/11/2026)
1. Abrir o Depurador, percorrer Funcionalidades (ordem: importância 5 → 1) e marcar a decisão de cada uma; usar "Mostrar no app ao vivo" e o inspetor para conferir.
2. Baixar `decisoes-depurador.json` (e o relatório .md) no mesmo aparelho em que marcou e mandar ao Claude.
3. Claude aplica SÓ o que foi decidido, em commits pequenos, rodando `python3 tests/protegidas.py`, `node --check` e teste nas guias (PC, 900–1199 px e celular) antes de publicar; sobe `VERSION` (sw.js) e `APP_VERSION` (index.html); atualiza o catálogo.

## 3. O que NÃO pode ser mexido sem decisão do João
**Funções protegidas** (lista completa no CLAUDE.md): destaque grande do item (com lance = "Meu lucro no lance"; sem lance = "Valor mínimo p/ proposta"); "Se ganhar só este" (lucro, total sem prejuízo, valor da viagem; com lance nada de "pelo teto"); "Posso baixar do teto" e "Lucro" no cartão e na janela; avisos de lance abaixo do mínimo/acima do teto (+ confirmação); simulador, colocação, Posso ganhar, Deixar de fora, Venci/Não ganhei/Desclassif.; opções de compra só como link (custo/frete do item nunca travados); km obrigatório + cálculo automático; alerta Revisar; destaque Venci/Rever; "Verificar com a nuvem"; tela dividida 900–1199 px.
**Regras de valor da proposta:** lance final prevalece; sem lance sai o teto; margem acima do teto é cortada no teto; inicial guarda preço na 1ª geração e não muda depois de haver item ganho; final só com itens vencidos e confirmação de preço.
**Bloqueios da proposta:** sem marca/modelo/descritivo ofertado, ou marca/modelo diferente do descritivo → não gera. Proposta sem identificação quando o edital proíbe.
**Sincronização:** puxar antes de enviar, mesclar por `updatedAt`, lápides para exclusão, limite de 950.000 caracteres. Não alterar a lógica sem teste com duas fontes.
**Marca/modelo/descritivo/lance final/fotos:** digitados pelo João; nunca preencher por análise nem JSON.
**Visual:** blocos simétricos, mesmo alinhamento, sem espaço sobrando; dúvida visual = mostrar prévia antes de publicar; no PC usar a tela toda. Celular = só o básico, sem guias novas.
**Ao mudar algo, incluir só o que foi pedido:** não tirar nem esconder cálculos e informações que já existiam.

## 4. Achados do relatório (31/10/2026) — viram propostas, nenhuma aplicada
- **Nuvem a 86% do limite** (≈817 mil de 950 mil caracteres): ≈49% são itens de pregões "Desisti", ≈39% itens `semLance`; `ondeLink` legado ≈33 mil; lápides ≈53 mil. Opções: arquivar itens de Desisti fora do documento sincronizado, limpar lápides antigas, remover `onde`/`ondeLink`/`usar`. **Decidir antes de analisar mais editais.**
- **Código morto** (apagar só com decisão): `painelCard`, `valorPainel`, `soloHtml`, `destaqueHtml`, `viabLinha`, `foraNoFim`, `copiarTexto` (e `destaqueInfo`); ações sem botão: `item-ganho`, `item-venci`, `mostrar-painel`, `painel-concluidos`, `painel-ocultos`, `pdf-modelo`; ≈70 classes de CSS sem uso aparente (grupo `ag-*` = agenda antiga do PC; cuidado com nomes dinâmicos al-/st-/sel-/res-/prz-).
- **Legado de dados/código:** campos `onde`/`ondeLink`/`usar`, `divisaoCompra` (compra dividida), `impostoCompraPct`/ICMS, tabela de especificações do PDF, `Config.proposta.incluir*` (sobrescrito por `op.com.*`), `exigencias`, `intervaloMin`, `ocultoPainel`, status "Ganhou"/"Em disputa", caminho antigo de sync (pull/push), dados de exemplo.
- **Repetições de tela:** Painel (limite do MEI em 2 cartões; "Pregões por status", "Resultado das propostas", tabelas de posso ganhar/colocação repetem outros blocos); Guia Itens × Acompanhar × detalhe do pregão; lance final editável em 5 lugares; botão de compra em 4 implementações; barra de filtros por status repete as raias; "Dados do pregão" repete o formulário; "Posso ganhar" ≈ Colocação 1º–3º; duas implementações de sugestão de títulos do catálogo; dois desenhos de cartão de encerrado.
- **Para decidir com dados:** `tipoCompra` (adivinhação por texto vs campo escolhido), `fonteValor` (seletor de qual valor entra), catálogo em Word, Compartilhar PDF, margem por item (0 usos), entregas separadas (0 usos), chavinhas do PDF (cerca de 40) e controles de marca d'água.
- **Pendência do João:** restaurar ou não a "Agenda dos pregões" no Painel do PC (recomendação: não; "Atenção agora" + Pendências cobrem).

## 5. Pendências fora do depurador (do João)
- Importar `revisar-itens-2026-10-31.json` (e, opcional, `km-pregoes-2026-10-31.json`: 5 pregões ativos estão sem km).
- Ipiranga 78: conferir o lance do cone (R$ 27,12 contra teto R$ 9,10).
- Ciclo semanal: busca no PNCP quinta 07h47; análise com documentos completos quinta/sexta (ver CLAUDE.md).

## 6. Ideias de melhoria do próprio depurador (se o João quiser)
Sonda de uso por clique mais longa (guardar por dia), botão "gerar plano de mudanças" a partir das decisões (lista de commits sugeridos), comparação de backups (antes/depois da limpeza), simulação de quanto espaço cada limpeza libera na nuvem.

## 7. Atualização 31/10/2026 (v1.111.0)
- Excluir pregão/item agora deixa só uma lápide mínima (`id`, `pregaoId`, `deleted`, `createdAt`, `updatedAt`); antes o registro inteiro ficava no documento da nuvem e nada era liberado.
- Botão novo na Config, "Apagar pregões Desisti" (decisão do João): apaga de vez os pregões Desisti e seus itens e encolhe as lápides antigas. Não desfaz; exportar backup antes.
- Feito: passo 1 e parte do passo 2 do plano de espaço. Falta decidir: remover `onde`/`ondeLink`/`usar` (legado de compra).
