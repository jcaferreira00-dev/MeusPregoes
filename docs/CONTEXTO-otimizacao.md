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
- FEITO na v1.112.0 (botão "Limpar desistências" na Config; decisão do João, 31/10/2026): apaga também os itens de desistência (`semLance: true`) dos pregões com proposta já enviada cuja sessão já passou, porque não dá mais para mudar de ideia. Mesmo molde do botão "Apagar pregões Desisti" (confirmação com contagem, lápide mínima). Não mexer nos pregões cuja sessão ainda não passou nem nos itens ganhos.

## 8. Decisões do Depurador (04/11/2026) — ver `docs/decisoes-depurador-2026-11-04.md`
Rodada 1 (v1.115.0) FEITA — removidos: F84 quadro "Dados do pregão" (com o "Intervalo mín. lances", F110); F104–F106 campos antigos de compra, compra dividida e imposto na compra (migração em `migrate()`/`migItem`: custo e frete congelados no valor que as contas usavam, link antigo vira opção 1; testado: lance mínimo, lucro e compra idênticos antes/depois); F111 ocultar do Painel; F112 painelCard/valorPainel; F113 CSS .ag-*; F114 destaque antigo; F116 item-venci/item-ganho; F117 pdf-modelo; F119 dados de exemplo (o botão "Limpar desistências" foi para o lado do "Apagar tudo").
Ficaram para depois, de propósito:
- F109 "Calcular cada ida separadamente": conflita com a nota do F64 ("se forem várias entregas, muda o piso do lance") → perguntar ao João antes.
- F115 status "Ganhou"/"Em disputa": o app ainda precisa ler dados antigos com esses status (regra de item ganho "legado").
- F118 caminho antigo de sincronização: mexe na sincronização (protegida); só com teste de duas fontes.
- F107/F108 (tabela de especificações e 3 jeitos de declaração): vão na rodada 3, junto com F36/F50 (modelo padrão da proposta).
Rodada 2: fundir/enxugar Painel e itens (só informativo pode agrupar sem perguntar; o que mexe em proposta, cálculo ou Config → o João avalia antes). Rodada 3: proposta (modelo padrão p/ todos, só a versão sem identificação muda; sem cláusulas; declarações em documento separado) + tela de login (entra sozinho com senha salva; sem "criar conta" até resolver o limite do Firebase).
F28 "Posso baixar do teto" (nota do João, 04/11): o piso não é lucro zero. Considerar o custo do dinheiro parado (Selic/Tesouro no prazo em que o dinheiro fica fora, compra no cartão) e um lucro mínimo em R$ que compense (≈ R$ 400–500 numa compra maior), proporcional ao valor investido (gastar R$ 10 mil para lucrar R$ 400 não vale). "Nada engessado": propor a regra e mostrar prévia antes.
F38: o selo SRP/Compra tampa a cidade e o número do pregão no cartão → corrigir com prévia.

## 9. Próxima sessão grande (sábado, depois das 18h)
Sincronização com uma ficha por pregão: FEITA em 05/11/2026 (v1.121.0), ver `docs/PLANO-sync-por-pregao.md`.

## 10. Rodada 2 do Depurador (05/11/2026, v1.122.0) — FEITA em parte
- Painel: linha do topo única (F16, F44, F58, F87, F88 fundidos: Limite do MEI com barra e alerta · Lucro previsto com DAS · Resultado das propostas). Cartões “Uso do limite”, “Tributos”, “Resultado” e “Pregões por status” saíram, com tudo o que mostravam levado para a linha do topo e para os botões de status (F89: valor em R$ + botão Encerrados).
- F38: número do pregão inteiro (“Nº 83/2026”) no cartão; selos descem de linha se faltar espaço.
- F30: até 4 opções de compra novas. F31: botão “Comprar” (loja no balão).
- F82: Exigências juntadas às Observações (migração automática).
- Ficaram para o João decidir (mexem em cálculo ou em função protegida): F57 (estrelas × semáforo), F61/F64 (entrega parcelada/por item: “várias entregas mudam o piso do lance”), F81 (“Posso ganhar” é função protegida), F86/F94 (tabelas do dashboard × guia Acompanhar/Pregões), F85 (um desenho só para encerrados), F90 (Certidões), F37 (enxugar observações: o quê?).
