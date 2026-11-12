# Meus Pregões — regras do João (LEIA ANTES DE QUALQUER COISA)

> A guia **Itens** (só PC) mostra os itens em blocos simétricos por pregão: nº do edital, nome abreviado, qtd, custo, lance, lance total, teto, lucro, estrelas e botão de compra. A guia Procedimento foi removida (o passo a passo fica aqui neste arquivo).
> No celular o app é fixo (sem rolagem lateral) e só mostra o básico.
> A guia Itens tem seletor "Todos os pregões" para filtrar por pregão. O Painel é um dashboard (tela toda no PC): números do topo, contadores por status (clicar abre a guia Pregões filtrada), rosca interativa no topo do dashboard (responde aos filtros e a cliques), funil, evolução, margem, órgãos e uma tabela única de pregões; depois pendências, entregas e certidões. A guia Pregões: no PC (a partir de 900 px) é uma grade única, preenchida linha por linha na ordem de importância, com a cor dizendo o status e o filtro colorido em cima (05/11/2026); no celular é um quadro de colunas por status, uma coluna por vez, e puxar para a esquerda/direita troca de coluna; encerrados e concluídos ficam num botão só. Rolagem sempre suave.

## 0. Regras de ouro (decisão de 31/10/2026 — valem para tudo)

1. **Ler TODOS os documentos que o João mandar, inteiros, sem pressa e sem perguntar se pode continuar.** Edital, TR, anexos, ata, ETP, planilhas: tudo. Não basta o edital: a falha de 31/10 (Jaboti 44) estava no TR.
2. **Conferir os documentos ANTES de cotar** (seção 2, "Conferência"): o que veio, o que falta e os pontos que derrubam o pregão. Faltou algo → avisar e não cotar.
3. **Tudo pelo Chrome do João** (Claude in Chrome): cotação item por item, entrando na loja e abrindo o produto (link direto), e também a busca no PNCP. Chrome fora do ar ou loja travando → PARAR e avisar NA HORA (mensagem + notificação) para ele ligar o PC. Nunca cotar por resumo de busca.
4. **Plataforma não descarta pregão.** O João só tem cadastro no Compras.gov.br e na BLL: pregão em outra plataforma entra normalmente, mas AVISAR na análise/lista ("plataforma X: precisa de cadastro"; e se cobra taxa do fornecedor).
5. **Salvar sempre no Google Drive** (seção 8), na pasta do órgão/pregão, com o LEIA-ME e as declarações específicas que o edital pedir (.docx). Não existe mais zip.
6. **Trabalhar até o fim sem pedir licença** para continuar; só parar para o que é do João decidir ou quando faltar documento/Chrome.

Este arquivo é a base de regras fixas. Toda vez que for mexer no app, analisar edital,
criar JSON de importação ou buscar editais, leia este arquivo primeiro e siga o que está aqui.
O João não deve precisar repetir estas regras. Quando ele passar uma regra nova que valha
sempre, acrescente aqui (seção certa) no mesmo commit da tarefa.

> Repositório PÚBLICO: não escreva aqui CPF, RG, dados bancários, senhas, limite de crédito
> nem nada pessoal. Esses dados ficam só na Config do app.

---

## 1. O app

- Tudo em `index.html` (arquivo único). Publicação: GitHub Pages, direto na `main`
  (https://jcaferreira00-dev.github.io/MeusPregoes/). Faça o commit e o push direto, sem PR.
- A cada publicação, suba a versão em DOIS lugares: `VERSION` no `sw.js` e `APP_VERSION` no `index.html`.
- Antes de publicar: rode `python3 tests/protegidas.py` (tem que dar TUDO OK) e, se mexeu na sincronização ou na Config, também `python3 tests/sync_duas_fontes.py` (dois aparelhos + Firebase falso; desde a v1.121.0 cada pregão tem a sua ficha na nuvem); extraia os `<script>` e rode `node --check`; teste no navegador (Playwright) o que mudou E abra TODAS as guias no PC e no celular conferindo erros no console (ao mexer numa função, procure o que dependia dela).
- No PC, aproveitar a tela inteira (largura e altura): janelas de edição do item em tela cheia (preview fixo à esquerda, formulário em 4 colunas), Painel e quadros usando toda a largura.
- Janela do item no PC (decisão de 29/10/2026): coluna da esquerda = resumo (lance mínimo, lucro) + Lance final + Valor do vencedor (no celular esses dois campos ficam no lugar de antes); pregão e local de entrega na mesma linha, nome do item ao lado de lote e nº do item, marca e modelo lado a lado, e o "Exigido no edital" estica até a altura do descritivo ofertado (sem espaço vazio). Sem espaço sobrando: não deixar campo ocupando a linha inteira à toa.
- Guia Pregões (decisão de 29/10/2026): usa a tela toda no PC (sem limite de largura) e as raias são por importância: "Atenção agora" (vermelha, primeiro: pregão hoje, proposta vencendo em até 1 dia, entrega/pagamento atrasado ou vencendo hoje; pregão amanhã também entra, em âmbar), Julgamento (os "perto de ganhar" — algum item até o 3º lugar na colocação, ou "posso ganhar" — primeiro e em dourado; sem itens ganhos), "Venci 🏆" (decisão de 29/10/2026: reúne os pregões em Aguardando empenho e também os em Julgamento que já têm item ganho; não existe mais a raia "Aguardando empenho"; cada cartão leva um selo flutuante, tipo carimbo de qualidade, no canto inferior direito do cartão: uma palavra só, que acompanha a etapa: Julgamento (âmbar) → Empenho (verde-água) → Entregar (azul, depois de informar o empenho/prazo) → Parcial (laranja, quando parte dos itens ganhos já foi entregue; os detalhes "Entregues 1 de 4 · faltam 3" ficam na etiqueta do cartão) → Receber (verde-água, depois de marcar a entrega) → Pago (verde); provisório), Enviadas, Analisando, Incompletos. Cada cartão com urgência mostra uma faixa de alerta colorida no topo; a cor da borda segue a importância (vermelho pulsando = hoje/atrasado, âmbar = amanhã/2 dias, dourado = perto de ganhar). As colunas dividem a largura pelo número de raias.
- Sessão que passou de um dia para o outro (decisão de 30/10/2026): pregão em "Proposta enviada" cuja data da sessão já passou vai para "Atenção agora" com a faixa âmbar "Sessão passou · continua?" e três botões no cartão: "Continua amanhã" (sessão vira amanhã, mesma hora), "Mais dias" (abre janela para escolher a nova data/hora) e "Encerrou" (status vira Julgamento). A pergunta some sozinha quando a data da sessão fica no futuro ou o status muda.
- Celular, uso rápido (decisão de 29/10/2026; o app não pode perder a cara de sempre, o uso é esporádico): o Painel abre com o cartão "Agenda" (hoje, amanhã, próximos dias, ganhos com botão "Proposta"); a guia Proposta mostra pregão, inicial/final, os itens como cartões com o campo "Meu lance" (vazio = teto do edital; avisa abaixo do mínimo/acima do teto) e o botão Gerar PDF. Ficam escondidos no celular: opções do documento, cabeçalho, marca d'água, catálogo com imagens (só aparece quando falta marca ou descritivo, para poder digitar) e catálogo/Word. O PDF sai com as configurações feitas no PC.
- Ao mudar algo, inclua só o que foi pedido: não tire nem esconda cálculos e informações que já existiam.
- Visual: mesmo alinhamento, blocos simétricos, status com uma palavra só, órgão em CAIXA ALTA,
  cidade padronizada ("Ortigueira/PR"). Se houver dúvida num ajuste visual, mostre uma prévia antes de publicar.
- Botões de link dos cartões de pregão (guia Pregões, PC): só ícone, sempre nas mesmas posições (edital, modelo, enviar proposta, licitação); o que não tem link fica apagado. No celular, título do órgão sem o prefixo "Prefeitura Municipal de".
- Formulário do item: NÃO existe campo "onde comprar". Só o botão "+" (opções de compra: link, loja, frete, preço do anúncio e unidades no anúncio; até 4 novas — decisão F30 de 04/11/2026; item antigo com mais continua mostrando todas). Decisão de 31/10/2026: as opções são SÓ LINKS para o João abrir quando quiser (cesta + lápis); NÃO existe mais "Usar"/tique e as opções NÃO mexem no custo: Custo e Frete do item são sempre os digitados (nunca travados). A prévia lista as opções com o total de cada uma e marca a mais barata, com botão "Abrir". No JSON não mandar `usar` (saiu na v1.115.0, decisão de 04/11/2026).
- Preço de pacote (decisão de 31/10/2026): cada opção de compra tem "Preço do anúncio" (`custo`) e "Unidades no anúncio" (`emb`, vazio/1 = preço por unidade); a prévia mostra o custo por unidade comprando anúncios inteiros (20 un. com anúncio de 10 = 2 anúncios). Opção com preço acima do teto e sem `emb` mostra o aviso "o anúncio é de um pacote?". O custo do item (por unidade) é digitado pelo João.
- Botão de compra (cartão do item, guia Itens e catálogo): "Comprar" (várias opções: "Comprar 1", "Comprar 2"…), sem o nome da loja, que fica no balão ao passar o mouse (decisão F31 de 04/11/2026, aplicada em 05/11). Na ordem do cadastro, também no celular. No formulário do item a lista de opções continua com o nome da loja (é onde se edita).
- Opções de compra aparecem na prévia do item comparando o total (custo × qtd + frete) e marcando a mais barata; cada uma com botão "Abrir".
- Proposta: `marca`, `modelo` (no item) e o descritivo do item ofertado (= `catalogoDesc`, o texto do catálogo na guia Proposta, o mesmo do catálogo) são TODOS digitados pelo João: nunca preencher na análise nem no JSON (deixar vazios). No PDF/Word o texto sai sempre em linha corrida (linhas empilhadas viram parágrafo), e a primeira letra depois de "TÍTULO EM CAIXA ALTA:" fica maiúscula; o campo tem correção ortográfica do navegador. O PDF mostra "EXIGIDO NO EDITAL" (texto do edital) e, logo abaixo, "DESCRITIVO DO ITEM OFERTADO" seguido, depois de uma linha tracejada, da marca/modelo. A proposta NÃO é gerada enquanto algum item tiver marca, modelo ou descritivo ofertado em branco (decisão de 30/10/2026: modelo passou a ser obrigatório), nem quando a marca/modelo do item for diferente do que está escrito no descritivo. Se o descritivo tiver "MARCA:" e/ou "MODELO:", o app preenche sozinho os campos marca e modelo do item com esse texto (no formulário do item e no catálogo da guia Proposta), para nunca sair marca diferente em um e em outro. Botões de gerar (proposta, só catálogo, Word) ficam juntos no fim da guia Proposta. Botão "Visualizar (rascunho, mesmo com dados faltando)" (pedido do João, 05/11/2026): gera o PDF mesmo sem marca/modelo/descritivo/fotos, sem as conferências e SEM guardar os preços da proposta inicial; o arquivo sai com "VISUALIZACAO" no nome. Serve só para ajustar o visual. As imagens e o descritivo (com os títulos em caixa alta) podem ser incluídos tanto na janela de edição do item quanto no catálogo da guia Proposta: é o mesmo dado (`catalogoDesc` + fotos), as duas opções convivem.
- Tipo de compra (decisão de 31/10/2026): campo `tipoCompra` do pregão = "SRP" (Registro de preços: gera ata, pedidos conforme a demanda) ou "Aquisição" (compra direta). Aparece como selo ao lado do status: no cartão do quadro "SRP" / "Compra" / "?" (não informado), no cabeçalho do pregão "Reg. preços" / "Aquisição", e há um seletor "Tipo de compra" ao lado do Status no pregão e no cadastro. Sem o campo, o app tenta reconhecer "registro de preços"/"SRP" nas observações. NÃO usar observações para isso.
- Cores dos status (pedido do João, 05/11/2026; hoje por GRUPO, ver o item de status de 11/11/2026): Proposta enviada (= Recepção/Aguardando disputa/Disputa) = azul, Falta dados = vermelho, Analisando = roxo, Julgamento = âmbar, Venci/Ganhou = verde (como estavam); Aguardando empenho = verde-água, Faturado = anil, Concluído = cinza-azulado, Perdeu = marrom, Desclassificado = magenta, Desisti = cinza. Mesma cor na borda do cartão, no selo, no título da raia e nos botões do Painel.
- Guia Pregões no PC (pedido do João, 05/11/2026; a partir de 900 px): NÃO tem mais raias. É uma grade única que se enche da esquerda para a direita e de cima para baixo (tantos por linha quanto couberem, mínimo 300 px cada), na ordem de importância das raias: Atenção agora → Julgamento → Venci → Enviadas → Analisando → Incompletos. A cor (borda e selo) diz o status; o filtro de cima tem a cor e a quantidade de cada status. Cartões compactos e TODOS do mesmo tamanho (o do maior, sem cortar alerta); etiqueta numa linha com o texto inteiro no balão. No celular continuam as raias (uma coluna por vez).
- Status do pregão (decisão do João, 11/11/2026, v1.154.0 — SUBSTITUI a lista anterior): padrão da BLL + os dele. Lista (nesta ordem no seletor): Falta dados, Analisando, Gravado, Publicado, Em retificação, Recepção de propostas, Aguardando disputa, Disputa, Suspenso, Análise de propostas, Julgamento, Habilitação, Adjudicado, Homologado, Resultado final, Empenho, Concluído, Deserto, Fracassado, Cancelado, Revogado, Anulado, Desisti. "Venci" não é status: é o item ganho. O que diferencia o tratamento nos cálculos, no Painel e no Dashboard é o pregão ter ou não item Venci (`pst.ganho`), em qualquer status (Homologado vale para ganhei e para perdi). Com item Venci: borda verde (`p-venci`) + selo no cartão (o selo mostra o status BLL em uma palavra até sair o empenho; depois Entregar → Parcial → Receber → Pago) e entra na raia "Venci 🏆". Sem item Venci, Adjudicado/Homologado/Resultado final = terminou sem ganhar → vai para "Encerrados" (`C.fimP`). Código: grupos em `GRUPO_ST`/`LEG(status)` (cada status novo usa as regras do grupo antigo: Recepção/Aguardando disputa/Disputa = "Proposta enviada" (Modo pregão, alerta "sessão passou · continua?"); Análise de propostas/Julgamento/Habilitação/Adjudicado/Homologado/Resultado final = "Julgamento"; Empenho = "Aguardando empenho"; Gravado/Publicado/Em retificação/Suspenso = "Analisando"; Deserto/Fracassado/Cancelado/Revogado/Anulado = encerrado). Nomes antigos são convertidos sozinhos ao abrir (`MIGRA_ST`): Proposta enviada → Aguardando disputa; Aguardando empenho/Faturado/Ganhou → Empenho (Faturado grava `faturado: true`); Perdeu/Desclassificado → Resultado final; Em disputa → Julgamento. "Faturado" deixou de ser status: o pregão conta como faturado (limite do MEI) com `faturado`, entrega marcada, pagamento ou Concluído (`C.faturadoP`). Nos JSON de análise/busca usar só nomes da lista nova (Falta dados, Analisando e Desisti continuam como antes; Julgamento idem); nomes antigos ainda são aceitos e convertidos. Painel: a faixa de contagem é por grupo (clicar abre a guia Pregões com o filtro de grupo `g:…`); a guia Pregões filtra por status exato. Teste: `python3 tests/status_bll.py`.
- Alerta "Revisar" (decisão de 31/10/2026): campo `revisar` do item (texto com o motivo). Aparece como faixa âmbar no cartão do item (também nos "fora da disputa"), selo "Revisar" na guia Itens, etiqueta "N itens para revisar" no cartão do pregão e linha nas pendências do Painel; o botão "Revisado" limpa o campo. Usar em JSON de correção quando algo precisa do olho do João (custo estimado, lance estranho, item excluído que dava lucro).
- Guia Itens, avisos (decisão de 04/11/2026): no topo, aviso de itens sem foto no catálogo (itens na disputa de pregões ativos) e de itens com alerta Revisar (preço cotado a conferir), com os pregões em botões (filtram) e "Mostrar só esses". Selo "Sem foto" no bloco do item. Nos JSON de análise, usar `revisar` quando o preço cotado precisar do olho do João.
- Comparação com o Tesouro Selic (decisão de 04/11/2026; é medida, não piso fixo): item e pregão mostram "vs Tesouro N×" = lucro ÷ o que o custo total renderia na Selic durante entrega + pagamento (sem prazos, Config › "Dias com o dinheiro fora"), o equivalente ao ano e o lance unitário que empata com o Tesouro. A Selic vem sozinha do Banco Central (SGS série 432, meta Copom) uma vez por dia e fica na Config (dá para digitar; sem internet fica o último valor). Nada é bloqueado por isso.
- Dados pessoais (decisão de 05/11/2026): ficam só em Config › "Meus dados", fechados atrás do botão "Abrir meus dados" (com a contagem de preenchidos). Na guia Proposta só as chavinhas de quais dados aparecem, fechadas por padrão; o "Preencher" leva direto ao card aberto.
- Painel no PC (decisão de 05/11/2026): cada linha com cartões da mesma altura (também no dashboard: rosca/funil/evolução e margem/órgãos). A partir de 1200 px os cards de baixo têm altura fixa (440 px), lista comprida rola por dentro, título fixo; com 4 cards ficam 2 × 2 (4 lado a lado a partir de 1700 px); com 5, o último ocupa o resto da linha. Nada de card esticando e empurrando os outros.
- Lance acima do teto: o bloco de decisão do item fica vermelho ("ACIMA do teto: desclassifica") e o "Meu lance" também.
- Colocação (`colocacao`, 1º, 2º…): digitável em qualquer item não ganho depois da sessão (perdido, pregão perdido/encerrado ou sem item ganho), no cartão do item e na janela de edição. No Dashboard, o botão "Colocações" lista esses itens do mais perto de ganhar para o mais longe (filtro "Até o 3º"), com valor do vencedor e diferença. Na guia Itens o bloco mostra o selo da colocação.
- Modo pregão (pedido do João, 07/11/2026, v1.131.0): com o pregão em "Proposta enviada" aparece o botão "Modo pregão" na página do pregão (PC e celular). Abre uma janela separada (blob) só com o nº do item, o teto, o PISO (menor lance sem prejuízo ganhando só este item = `c.solo.empate`), quanto posso baixar do teto e o lucro do lance digitado (só este / no conjunto). Abaixo do piso o campo fica vermelho, sem lucro, e ao sair volta para o piso; acima do teto é cortado no teto. Os lances digitados são simulação (ficam só no navegador). Cada item tem "🏆 Venci" (grava o lance digitado como lance final e marca vencido, então entra na proposta final) e "Não venci" (antigo "Já foi"; desde a v1.143.0, 10/11/2026, abre uma caixinha para digitar a minha colocação; marca não ganho, sai da proposta final e grava a `colocacao` do item; caixinha vazia só marca não ganho; não existe botão "Já foi"): o item encerrado vira uma linha pequena no fim da janela, com "Reabrir". A janela fala com o app pela fila `mp.modo.fila` (localStorage); o app esvazia ao receber o evento storage, ao ganhar foco e ao abrir. Cada caixa de lance já abre preenchida: o lance do cadastro (`lanceFinal`) ou, se não houver, o teto em centavos para baixo; "Restaurar lances" volta a isso. Item com risco leva um triângulo discreto no canto superior direito do cartão; ao tocar aparece um balão escuro por cima do cartão (some sozinho em 3 s ou mais conforme o texto; toque fecha). Riscos (campo `riscos`, calculados em `modoPregaoDados`): 30 unidades ou mais; alto valor (custo total ≥ R$ 3.000); item grande/pesado/volumoso e frágil (palavras na descrição); possível registro/selo (Inmetro, CA, Anatel...); item marcado Revisar; não há trava pela Selic, o João avalia na hora (07/11/2026, v1.133.0). Teto com 3 casas (ex.: 56,445) sai em centavos para BAIXO na proposta (v1.130.0, `floor2`).
- Janela do item, limpeza (pedido do João, 09/11/2026, v1.135.0): o LANCE MÍNIMO sugerido passou a ser o lance do LUCRO IDEAL ganhando só este item (`calcSozinho`: `lucroIdeal` = o maior entre R$ 300 até 2 h de estrada, R$ 400 até 4 h, R$ 500 acima — ~60 km/h, km é ida e volta — e 2× o rendimento do capital na Selic no prazo; `idealUnit` = lance unitário que dá esse lucro). Só ALERTA: cor âmbar na caixa do lance, aviso na faixa do destaque e uma pergunta ao salvar ("Lucro abaixo do ideal… Manter este lance?"). Travas que continuam: acima do teto (desclassifica) e abaixo do piso sem prejuízo (`abaixoSolo`, vermelho + confirmação). O piso do Modo pregão segue sendo o empate; a "meta" dele passou a ser o `idealUnit`. A linha "Custo unit. final / Entrega rateada / Posso baixar do teto / Lucro / vs Tesouro" ficou recolhida em "Ver cálculos" (os cálculos continuam; a conferência protegida abre o recolhido). A margem do item saiu da janela (campo oculto mantém o valor já gravado; a margem padrão fica só em Config). Unidade, quantidade, custo e frete ficam numa linha só (caixas estreitas) e o teto do edital fica ao lado do campo de título do descritivo (PC, a partir de 900 px; no celular voltam ao lugar de sempre). O local de entrega do item virou um ícone de GPS ao lado do pregão que abre um popup (vazio = local do edital; o ícone acende quando há local próprio).
- Cartão do item, limpeza (pedido do João, 09/11/2026, v1.138.0): o cartão mostra só os valores grandes coloridos (lance/lucro, lance mínimo, lucro ganhando só este) mais "Posso baixar do teto", "Lucro" e "vs Tesouro"; saíram "Edital total", "Mín. total" e os textos repetidos ("sem prejuízo… no total… viagem", "% sobre a venda", "custo final"). Tudo isso fica no botão ⓘ (só ícone, com borda, ao lado do Venci / Não ganhei / Desclassif.), que abre o popup "Detalhes dos custos e lucros" (`detalhesItemHtml`). A janela de edição do item continua com os textos completos. O teto unitário vai numa etiqueta ao lado do nº do item ("Item 01 · Teto R$ 10,00"). Cada cartão tem borda forte e clicar em qualquer lugar dele (fora de botões, campos, links e simulador) abre a edição (decisão de 09/11/2026; antes só o lápis abria).
- Janela do item, ajustes de layout (pedido do João, 09/11/2026, v1.139.0): edital, proposta/lances e site do pregão viram ícones (como o GPS) entre o seletor do pregão e o GPS; o seletor tem seta própria; "Item que vou comprar" alinhado com lote/item; rótulo "Teto" (sem "R$ unit."); no PC "Opções de compra" sobe para a linha do "Incluir imagem"; em tela dividida (900–1199 px) as caixas ficam menores, em 4 colunas, sem dicas e sem rolar à toa.
- Celular, ajustes do item (pedido do João, 09/11/2026, v1.140.0; só até 699 px, PC e tela dividida não mudam): no cartão do item a etiqueta do teto fica legível no tema escuro e o "Comprar" é só o ícone do carrinho; na janela do item os botões do pregão (edital, proposta, site, GPS) ficam menores, Teto e Lance final ficam lado a lado, a chavinha "Posso ganhar" é compacta e sem o texto explicativo, "Incluir imagem" é só o botão e as sugestões de título (Marca, Modelo, Dimensões…) não aparecem.
- Celular, mais ajustes (pedido do João, 09/11/2026, v1.141.0; só até 699 px): rótulo só "Lance final"; sem a borda grande em volta, a própria caixa do lance fica amarelada; no cartão do item sai a linha "Posso baixar do teto até o mínimo" (continua no ⓘ e na janela de edição) e os carrinhos ficam em grade de 2 por linha, à esquerda.
- Celular, padronização (pedido do João, 09/11/2026, v1.142.0; só até 699 px): rótulo "Lance vencedor" com a própria caixa vermelha (sem borda grande por fora) e todas as caixas de texto da janela do item com a mesma altura (42 px) e largura da célula.
- Certidões (pedido do João, 10/11/2026, v1.144.0): além de "Emitida em" + "Validade (dias)", a certidão tem o campo "Vence em (data)" (`venceEm`); se preenchido, vale a data digitada (a do documento) no lugar de emissão + dias. Marcar ✓ (emiti hoje) limpa o `venceEm` quando há validade em dias.
- Guia Certidões, visual (pedido do João, 10/11/2026, v1.145.0): no topo o cartão do CNPJ da empresa (vem de Config › Meus dados, nunca escrito no código) com "Copiar CNPJ" (como está salvo) e "Só números"; sem CNPJ preenchido mostra "Preencher". Resumo (em dia / atenção / sem data) e certidões em grade de cartões com ícone de situação e borda na cor da situação; a guia usa a largura toda no PC.
- Filtro "Ganhei 🏆" na guia Pregões (pedido do João, 10/11/2026, v1.146.0): botão (verde) depois de "Todos", só aparece quando existe pelo menos 1 item marcado como ganho; mostra os pregões com algum item ganho em qualquer status (inclusive Concluído). PC e celular.
- Filtros da guia Pregões (pedido do João, 10/11/2026, v1.147.0): botão de status sem nenhum pregão NÃO aparece (ex.: sem "Perdeu", sem botão); "Todos" fica sempre; se o filtro ligado ficar vazio, volta para "Todos".
- Filtro "Todos" no celular (pedido do João, 12/11/2026, v1.161.1): mostra TODOS os pregões numa coluna só, na ordem de importância, com os encerrados/concluídos (cinza) no fim, sem o botão "Encerrados e concluídos" (antes ficava uma coluna por grupo, uma por vez, e os encerrados escondidos, então "Todos" não mostrava todos). No PC nada mudou.
- Item fora da disputa e telas (pedido do João, 12/11/2026, v1.162.0): item `semLance` mostra, em cinza logo abaixo da descrição (cartão do pregão e bloco da guia Itens), o motivo em 3 ou 4 palavras tirado do `obs` (função `motivoFora`; o texto inteiro vai no balão). Por isso o `obs` dos itens fora deve começar com o motivo ("Sem margem: …", "Item pesado ou frágil: …", "FALTA COTAR: …"). Guia Itens: o bloco não pode crescer com descrição longa (coluna `minmax(0,1fr)`) e "sem marca/modelo" e "sem foto" viraram só ícone para o lápis nunca sair da margem. Modo pregão: a caixinha da colocação ("Não venci") tem largura própria para não sair da margem.
- Mais de um WhatsApp (pedido do João, 10/11/2026, v1.148.0): em Config › Meus dados, abaixo de "Telefone / WhatsApp", a lista "Outros WhatsApp" (`empresa.whatsapps`, lista de textos) com "Incluir WhatsApp" e lixeira em cada um. Por enquanto só ficam guardados na Config; a proposta e as declarações continuam usando só o `telefone` principal.
- Guia Proposta, blocos destacados (pedido do João, 10/11/2026, v1.149.0): cada bloco (1 Qual pregão, 2 Documento, 3 Condições, 4 Frases, Avançado, Catálogo, Gerar) tem cor própria, borda forte e faixa colorida no título (classes `pd-blk pd-b1…pd-b7`), para achar logo o bloco de editar. Não voltar ao cartão branco igual.
- Celular (iPhone 13) = só o básico; PC = completo. Não criar guias novas no celular.
- Janela de editar item no celular (pedido do João, 08/11/2026, v1.135.0): rola normalmente (as prévias não grudam mais no topo, antes travavam com muitas opções de compra); mostra menos informação (sem dicas dos campos, sem a lista de totais das opções de compra, sem custo final/entrega rateada/impostos; ficam o destaque, "Posso baixar do teto" e "Lucro"); as opções de compra aparecem só com o ícone do carrinho (sem o nome da loja). O PC não mudou.
- Cartões do pregão no celular (pedido do João, 08/11/2026, v1.136.0): só o que diz se dá lucro e se está na margem segura (aviso de seguro/risco, lance mínimo, lucro ganhando só este, "Posso baixar do teto", "Lucro", simulador). Saem no celular: "Custo total"/"Edital total" do item, comparação com o Tesouro, "sem prejuízo… viagem", entrega/Tesouro nos números do topo e os textos de ajuda do simulador. Sem repetição: o lucro aparece uma vez só (no destaque) e, sem lance, o valor mínimo também (o quadro "Lance mínimo" some). No PC continua tudo completo.
- Backup automático (pedido do João, 05/11/2026, v1.128.0): em Config › Backup automático ele escolhe uma pasta diária (ex.: D:\Backups\MeusPregoes) e uma semanal (pasta do Google Drive para computador). Com o app aberto no PC (Chrome/Edge), todo dia num horário sorteado entre 12h e 20h grava SOZINHO e SEM AVISAR `meus-pregoes-AAAA-MM-DD.json` (e o semanal `meus-pregoes-semana-AAAA-MM-DD.json` uma vez por semana); mantém 30 diários e 12 semanais e só apaga os arquivos que ele mesmo criou. PC desligado ou PC sem a pasta escolhida (ex.: do trabalho) = não faz nada, sem aviso. Teste: `python3 tests/backup_pasta.py`.
- Tela de entrada (decisão F26 de 04/11/2026, v1.123.0): sem a conta conectada o app não abre; sessão guardada abre sozinho; sem internet abre com os dados do aparelho; não há "Criar conta" (limite do Firebase).
- Nuvem (v1.121.0): uma ficha por pregão (`pregoesmei_idx`, `pregoesmei_cfg`, `pregoesmei_pz_<pregão>`); a ficha antiga `pregoesmei_usuarios` ficou só como cópia. Mexeu na sincronização ou na entrada: rodar `tests/sync_duas_fontes.py`.

- Contexto da otimização (31/10/2026): leia `docs/CONTEXTO-otimizacao.md` (o que não mexer sem decisão, achados e plano). Nada do relatório é aplicado sem o João decidir.
- Depurador (decisão de 31/10/2026): `depurador/` é um PWA que lê o app e mostra o catálogo de funcionalidades (`depurador/catalogo.js`). Ao criar, mudar ou tirar uma função do app, atualize a entrada dela no catálogo no mesmo commit. O relatório `docs/relatorio-funcionalidades.md` é gerado desse catálogo.

### Funções protegidas (decisão de 31/10/2026 — NUNCA tirar sem o João pedir)
O João perdeu funções em mudanças de layout. Antes de publicar, rodar `python3 tests/protegidas.py`: se der FALHA, não publicar.
Ao acrescentar uma função que o João usa, acrescentar a conferência dela no teste.
- Cartão e janela do item: destaque grande (com lance = "Meu lucro no lance"; sem lance = "Valor mínimo p/ proposta"), cor pela situação.
- "Se ganhar só este": lucro e TOTAL sem prejuízo (R$ do item inteiro e por unidade) e o valor da viagem. Com lance, nada de "pelo teto".
- "Posso baixar do teto" e "Lucro" no cartão E na janela do item.
- Aviso de lance abaixo do mínimo (vermelho + confirmação ao salvar/gravar) e de lance acima do teto.
- Simulador de lance, colocação, Posso ganhar, Deixar de fora, resultado por item (Venci/Não ganhei/Desclassif.).
- Opções de compra só como link (botão Comprar, unidades no anúncio, botão Abrir); custo e frete do item nunca travados.
- km da entrega obrigatório (pregão e item não salvam sem km; o app calcula sozinho pela cidade); etiqueta e pendência "sem km".
- Alerta Revisar; destaque de Venci e de desclassificação (Rever); sincronização com "Verificar com a nuvem".
- Tela dividida no PC (900–1199 px): coluna da esquerda estreita e fixa com o destaque, mínimo e "se ganhar só este"; lance final e vencedor compactos logo abaixo; marca/modelo no formulário; caixas alinhadas.

### Regras de valor da proposta (não mudar sem o João pedir)
- Lance final preenchido prevalece sobre tudo, na proposta inicial e na final.
- Sem lance final: sai o teto do edital. Margem acima do teto é limitada ao teto.
- Proposta inicial: preço guardado na 1ª geração (sem lance). Depois que o pregão tem item ganho,
  os ajustes da proposta final não mexem na inicial.
- Proposta final: só itens vencidos, com confirmação de preço; ajustes dela não viram padrão.

---

- Guia Proposta, v1.150.0 (pedido do João, 10/11/2026): TODOS os blocos são recolhíveis como o "Avançado" (`<details class="pdf-avanc" data-k="pdfB1…pdfB7">`; abertos por padrão, o que o João fechar fica lembrado na sessão em `UI`). "Meus dados" (empresa, titular e banco) MUDOU da Config para a guia Proposta (bloco vermelho `pd-b8`, fechado por padrão, `meusDadosHtml`); na Config ficou só o atalho "Abrir em Proposta" (`abrir-meus-dados` leva à Proposta). Isso SUBSTITUI a regra de 05/11 que mandava deixar os dados só na Config. Os dois telefones (principal + "Outros WhatsApp", `telsEmp`) saem juntos no cabeçalho e no bloco "dados do fornecedor" do PDF e do Word; nas declarações continua só o principal.

- Painel, topo (pedido do João, 10/11/2026, v1.151.0): o limite do MEI destaca os GANHOS FIRMES ("Comprometido" = faturado + a faturar). Só é firme o pregão ganho que seja compra direta ("Aquisição") ou registro de preços (SRP, `isSRP`) JÁ COM EMPENHO (`temEmpenho`: empenhoData/empenhoNum/prazo de entrega/entrega/pagamento, ou status Faturado/Concluído). SRP ganha SEM empenho (ata) NÃO compromete o limite: fica à parte ("Ata sem empenho", faixa listrada na barra e linha própria; `mei.ataSemEmp`, `mei.nAta`) e entra só na conta "se ganhar tudo". O "Lucro previsto" virou "Lucro garantido" (só ganhos firmes) com as camadas ata a empenhar, em disputa e em análise (esta última NÃO conta), mais "Se tudo vingar" (soma de tudo) e "Garantido depois do DAS" (`tributos.lucroGarantidoLiquido`); `mei.lucroN` guarda os 4 valores. Pregão sem tipo informado é reconhecido por "registro de preços/SRP" no texto, como no selo. Desde a v1.152.0 (10/11/2026) o pregão tem o campo "Valor empenhado (R$)" (`empenhoValor`, no bloco do empenho): só vale para SRP; preenchido, só esse valor (e a mesma fração do lucro) é firme e o resto da ata continua "a empenhar"; vazio = o valor inteiro do pregão (`pst.fracFirme`).
- Painel, bloco "Caixa · se todos pedirem juntos" (pedido do João, 11/11/2026, v1.161.0; substitui o "Ganho provável" da v1.160): a preocupação dele é o CAIXA (as entregas são parceladas e ele precisa saber se tem dinheiro caso todos os órgãos peçam ao mesmo tempo), NÃO o faturamento/nota. Primeiro bloco do Painel (acima da Agenda do celular e do cartão do Limite do MEI no PC; `ganhoProvavelHtml`, números em `mei.caixa`). Valor = CUSTO de compra (`pst.custo`, com frete e viagem; nunca o valor de venda) dos pregões com item Venci (mesmo em Julgamento) até marcar o pagamento recebido: Já comprometido (`firme`: compra direta ou ata com empenho, pela fração `fracFirme`) + Ata a empenhar (`ata`: resto da ata, que só sai se o órgão pedir, mas entra no pior caso) = Pode sair do caixa (`total`), comparado ao capital de giro da Config (`capitalGiro`): "Sobram R$ X para novas propostas" ou "Faltam R$ X" (vermelho). Sem capital de giro informado, avisa para preencher na Config. NÃO inclui propostas em disputa. Barra e legenda só no PC. O cartão "Limite do MEI" (faturamento) não mudou.
- Janela do item, PC (pedido do João, 10/11/2026, v1.151.0): o rótulo "Opções de compra" saiu da linha das imagens; o botão é "Imagem" (antes "Incluir imagem"); lápis e "+" menores (34 px) e a linha quebra em vez de as fotos saírem da margem.
- Borda dos cartões da guia Pregões (pedido do João, 10/11/2026, v1.152.1): pregão com item ganho tem borda verde (`p-venci`), mas um alerta (dourado "perto de ganhar/posso ganhar", âmbar, vermelho) passa por cima. Quando TODOS os itens cotados já têm resultado (Venci, Não venci ou desclassificado: `pst.ganho && pst.nAguard === 0`), os alertas dourado e âmbar deixam de valer e a borda fica verde; o vermelho (entrega/pagamento atrasado, pregão hoje) continua valendo. Com item ainda sem resultado, tudo igual a antes (`alertaPregao` → `alertaPregaoBruto`).
- Destaque da OBSERVAÇÃO no PDF (pedido do João, 11/11/2026, v1.156.1): no descritivo do item OFERTADO (`catalogoDesc`, o texto que o João digita), se aparecer a palavra OBSERVAÇÃO (ou OBSERVAÇÕES, com ou sem acento, maiúscula ou minúscula), ela e TUDO que vem depois saem com marca-texto amarelo e sempre começando numa linha nova (`C.separarObservacao`; ignora acento, pois texto colado de PDF vem com acento solto). Vale na proposta e no PDF do catálogo. NÃO vale para o "Exigido no edital" (o João esclareceu que o pedido era só para a descrição dele). O Word ainda não tem esse destaque.
- Garantia por pregão (pedido do João, 11/11/2026, v1.158.0): na guia Proposta › "3 · Condições deste pregão" há o campo "Garantia" (`pdfOpts.garantia`, só do pregão como validade/pagamento: não vira padrão). Preenchido (ex.: "12 meses"), a frase Garantia sai "Os produtos têm garantia de 12 meses contra defeitos de fabricação, contada do recebimento definitivo; substituiremos sem custo…"; vazio, continua a frase padrão ("conforme o edital e, no mínimo, a garantia legal do CDC"). Edital que fixa prazo (ex.: Piraí do Sul 47: 12 meses do recebimento definitivo, edital 2.7) → mandar `pdfOpts.garantia` no JSON da análise.
- Selo do pregão enviado (pedido do João, 12/11/2026, v1.159.0): "Entregar" só aparece com item Venci (`pst.ganho`) e empenho/prazo; `entregaPrazo` vindo da análise NÃO ativa mais o selo sozinho. "Enviada" vale até o dia da sessão; depois que a data da sessão passa (ainda sem Venci/Não venci), o selo vira "Pregão" (âmbar, `sel-pregao`) até o João marcar ganhei/perdi.
- Selo "Enviada" (pedido do João, 11/11/2026, v1.157.0): pregão com a proposta enviada (grupo Recepção/Aguardando disputa/Disputa, sem item Venci) leva o selo azul "ENVIADA" no canto inferior direito do cartão, igual ao selo dos Venci (`selo-st sel-env`, PC e celular), para ver de relance o que já foi enviado. Com item Venci o selo continua sendo o da etapa (Julgamento → Empenho → Entregar → Parcial → Receber → Pago).
- Exportar JSON do pregão (pedido do João, 10/11/2026, v1.153.0): além do ícone no cartão (só PC), a página do pregão (PC e celular) tem, junto dos atalhos do cabeçalho (edital, lances, licitação, modelo), um botãozinho só com ícone (`export-pregao`). Desde a v1.153.1 ele abre a folha de compartilhar do aparelho (para mandar ao Claude) só em aparelho de toque (`pointer: coarse`); no PC sempre baixa o arquivo (v1.157.1, 11/11/2026: no PC a folha de compartilhar do Windows fazia os botões parecerem mortos).

## 2. Análise de edital (quando o João mandar o PDF)

### Conferência dos documentos (ANTES de analisar ou cotar — decisão de 31/10/2026)
O João baixa os documentos da plataforma (BLL, Compras.gov etc.), que vêm em vários arquivos. Ler TODOS, inteiros.
1. **Listar o que veio e o que falta:** edital completo, Termo de Referência, habilitação (atestado, balanço, certidões), modelo de proposta e declarações (e ETP/ata quando houver). Faltando algo → avisar o João e NÃO cotar até ele mandar. Relatório de itens do PNCP NÃO é edital.
2. **Procurar no edital E no TR (o edital pode remeter a habilitação ao TR):**
   - atestado/qualificação técnica — também "fornecimento anterior", "aptidão", "comprovação de fornecimento", "bens de natureza e complexidade semelhantes" (ex.: Jaboti 44, edital 6.1 → TR 9);
   - balanço / DASN-SIMEI / demonstrações contábeis (ex.: Ipiranga 78 pede DASN dos 2 últimos anos);
   - prazo de entrega (ex.: Castro 157 = 48 h úteis);
   - locais de entrega (um endereço ou vários);
   - tipo de julgamento (item ou lote/grupo), tipo de compra (registro de preços ou aquisição → `tipoCompra`) e plataforma real (o PNCP às vezes erra: Castro 157 e 163 apareciam como IPM e são BLL).
3. **Mostrar a conferência ao João** (o que veio, o que falta, os pontos acima) e só então cotar. Atestado exigido = Desisti sem cotar (avisar). **Balanço exigido (decisão do João, 12/11/2026): NÃO descartar** — cotar normalmente e mandar no LEIA-ME o texto do pedido de esclarecimento (MEI dispensado de escrituração; aberto em 2026, sem exercício encerrado; aceitar CCMEI/DASN-SIMEI ou balanço de abertura), com o prazo.

- `descEdital` ("Exigido no edital") é CÓPIA FIEL do edital (decisão de 30/10/2026): copiar e colar o texto do item exatamente como está no edital/TR, completo, sem resumir nem limpar (só tirar quebras de página e cabeçalhos de tabela que entraram no meio). O João confere tudo ao revisar as cotações.

- Focar só nos itens/lotes que valem a pena.
- Cruzar as tabelas do edital (ETP, TR, quadro de preços, modelo de proposta, ata): quantidade,
  unidade e soma por secretaria. Havendo divergência, avisar e já mandar o texto do pedido de esclarecimento.
- Margem = (teto − custo) ÷ teto. Alvo 40%; a partir de 15% ainda vale se o lucro em R$ compensar.
- Considerar o caso de ganhar só um item (frete, carro e combustível todos nele): informar o lance
  mínimo sem prejuízo.
- Custo pela embalagem de compra (ex.: isopor em pacote de 25 placas → para 20 compra 1 pacote).
- Procurar mais de uma opção de compra, de lojas diferentes, com link DIRETO do produto (nunca link de busca). Se só achar uma loja, tudo bem: deixar anotado no `obs` (o João avalia depois — 31/10/2026).
- Entrega parcelada: deixar claro e mostrar o capital de giro necessário.
- Valor e capital de giro NÃO são motivo de descarte (nem o limite anual do MEI).
- Entrega de carro: Strada com carretinha, até 3 viagens. Fora: itens grandes, pesados, frágeis
  ou que exigem instalação (geladeira, móveis grandes, barras de 6 m, telhas, toneladas…).
- Registros e selos (conferir em TODO item, mesmo que o edital não fale — decisão de 24/10/2026):
  ANVISA (produto para saúde: MEI não tem AFE nem licença sanitária → item fora/sem lance);
  CA (todo EPI); Inmetro (brinquedos e jogos para criança, entre outros → comprar só com selo);
  ANATEL (rádio, Bluetooth, Wi-Fi); Marinha (coletes e boias); IBAMA (motosserra). Marcar no `obs` do item
  e, quando o item não puder ser vendido, `semLance: true`.
- Certificação: procurar "Inmetro" no edital inteiro (inclusive execução/entrega). Ex.: balança do
  PE 87 de Ortigueira; capacete de skate exige EN1078; bola de tênis de mesa "oficial" pode exigir ITTF.
- Habilitação: ainda não tem atestado de capacidade técnica (descartar se exigido); MEI não tem balanço: se exigido, cotar e pedir esclarecimento (decisão de 12/11/2026).
  Tem SICAF.
- Pregão inviável: avisar o motivo em 1–2 linhas; no JSON ele entra como Desisti com o motivo no `obs`, sem pasta no Drive.
- Julgamento por LOTE/GRUPO (ter que comprar o grupo inteiro): descartar. Julgamento por item, ou edital em que
  cada "lote" é um item só, vale.
- Entrega que precisa ser distribuída em vários lugares (cada escola, várias secretarias/endereços): descartar.
  Entrega num endereço só por pedido (ex.: departamento indicado no empenho, mesma cidade) vale, com aviso.
- Atestado de capacidade técnica exigido = descartar enquanto não tiver atestado (citar no aviso).
- CNAE NÃO desclassifica (decisão de 24/10/2026): é fácil incluir/trocar CNAE no MEI. Item ou pregão fora dos
  CNAEs atuais entra normalmente na análise e no JSON, com observação no `obs` dizendo qual CNAE falta
  (ex.: livros = 4761-0/01; papelaria = 4761-0/03; tintas = 4741-5/00; tecidos/armarinho = 4755-5/01/02).
- Na análise, entregar UM JSON só (todos os pregões; os que não compensam com status Desisti) e salvar as pastas
  no Google Drive (seção 8). Não existe mais zip.
- TODOS os itens do pregão entram no JSON (decisão de 25/10/2026), nenhum fica de fora sem registro. O item que
  não vale a pena (sem margem, sem preço confiável, produto não encontrado, hospitalar/ANVISA, fora do CNAE sem
  interesse, grande/pesado etc.) entra como descartado: `semLance: true` e o motivo no `obs`, com o número do
  edital (o da plataforma, já retificado) e o número antigo do TR quando mudou. Quando o motivo for "não achei
  preço", dizer isso (não é o mesmo que "não compensa"), para o João poder reavaliar. Assim o João vê todos os
  itens na ordem do edital e não há dúvida sobre o que foi incluído ou excluído.

- Pregão que compensa mas ficou com item de interesse SEM cotação (não consegui achar preço): status "Falta dados" (aparece em "Incompletos" no app), com "FALTA COTAR: ..." no início do `obs` (decisão de 29/10/2026). Item cortado por "não compensa" ou "Desisti" não conta como pendência; só o que o João quer e eu não consegui cotar. Pregão sem nenhuma pendência fica "Analisando".

### Checklist de regras do edital que mudam a proposta (conferir SEMPRE e colocar no JSON)

**Regra do João (05/11/2026), na fase 2 (leitura do edital em PDF):**
- **Declaração unificada:** avaliar SEMPRE se o edital pede declaração unificada/conjunta (ou declarações separadas por escrito: ME/EPP, fatos impeditivos, menor, habilitação etc.) e AVISAR o João na conferência e no LEIA-ME: se pede, qual anexo/modelo, em que momento (com a proposta, na habilitação ou só no sistema) e o prazo. Se pede por escrito, fazer o .docx (seção 8).
- **Condições da proposta:** prazo de entrega, condição/prazo de pagamento, validade da proposta e local de entrega saem do edital/TR e vão no JSON daquele pregão, em `pdfOpts.prazoEntrega`, `pdfOpts.pagamento`, `pdfOpts.validade` e `pdfOpts.localEntrega` (mais `prazoEntregaDias` e `pagamentoDias` em número). Assim a proposta já sai com as condições certas daquele edital. Citar no LEIA-ME o item do edital de onde veio cada uma.
| O que procurar no edital | Onde vai no JSON |
|---|---|
| Declaração unificada/conjunta ou declarações por escrito (anexo, momento, prazo) | aviso ao João + `obs` do pregão + .docx no Drive quando for por escrito |
| Proposta inicial pode ou não identificar o licitante ("desclassificada a proposta que identifique") | `regrasEdital.semIdentificacao` + `referencia` |
| Validade mínima da proposta (ex.: "não inferior a 90 dias") | `pdfOpts.validade` |
| Condição/prazo de pagamento | `pdfOpts.pagamento` e `pagamentoDias` |
| Prazo de entrega | `prazoEntregaDias` e `pdfOpts.prazoEntrega` |
| Local de entrega | `pdfOpts.localEntrega` |
| Modelo de proposta próprio do edital (anexo) | `modeloProprio` (só aviso: desde a v1.124.0 a proposta sai sempre no modelo padrão; não mandar `pdfOpts.desc`, `documentos` nem `pdfOptsFinal` com modelo do edital) |
| Exigências (marca, catálogo, amostra, Inmetro, declarações) | `obs` (desde a v1.122.0 o campo Exigências foi juntado às Observações; `exigencias` ainda é aceito e o app põe no fim do `obs` com "Exigências:") |
| Entrega parcelada | `entregaParcelada`, `entregaParceladaObs` |

A tabela de especificações técnicas saiu da proposta (o detalhamento vai no catálogo).

**Proposta = modelo padrão para todos (decisão do João, 05/11/2026, v1.124.0).** Do pregão, o PDF só usa `pdfOpts.validade`, `pagamento`, `prazoEntrega`, `localEntrega`, `observacoes` e `anonima` (sem identificação). Essas condições são de cada edital e são respeitadas sempre (o padrão é só o desenho): em branco, prazo de entrega e pagamento saem de `prazoEntregaDias`/`pagamentoDias` do pregão; validade e pagamento de um pregão NÃO viram padrão dos outros (v1.126.1). Título, faixa, chavinhas e as frases fixas (“O que os pregões costumam pedir”: Preços, Condições do edital, Produtos, Garantia, Entrega, Enquadramento, Representante legal) vêm do padrão (Config). Sem cláusulas livres; as declarações do edital são feitas à parte (.docx no Drive), nunca dentro da proposta.

Exemplo real: Imbaú PE 91/2026 — item 10.2.1 desclassifica proposta que identifique o licitante
(inicial SEM identificação); item 9.5 exige validade ≥ 90 dias; a proposta final (Anexo III) é identificada.

---

## 3. JSON de importação da ANÁLISE (UM JSON só com todos os pregões analisados — decisão de 24/10/2026)

(Na BUSCA também é um JSON único com todos os pregões novos — ver seção 4.)
Os pregões analisados que não compensam (lote/grupo, atestado, entrega espalhada, sem margem) entram no
mesmo JSON com `status: "Desisti"` e o motivo em `obs` (não ficam de fora nem são excluídos). Se o pregão já
veio da busca, reaproveitar o mesmo `id` para não duplicar no app.

Formato de backup do app (Config › Importar › Mesclar). IDs únicos e novos; `createdAt`/`updatedAt` em ms.

```json
{
  "pregoes": [{
    "id": "pz_imbau_91_2026", "numero": "91/2026", "orgao": "Prefeitura Municipal de Imbaú",
    "plataforma": "BLL", "cidadeUf": "Imbaú/PR",
    "prazoPropostas": "2026-11-03T13:00", "sessao": "2026-11-03T13:30",
    "status": "Analisando", "tipoCompra": "SRP", "prazoEntregaDias": 10, "pagamentoDias": 30,
    "exigencias": "", "obs": "", "link": "", "linkProposta": "", "linkLicitacao": "",
    "modeloProprio": false, "linkModelo": "", "entregaParcelada": false, "entregaParceladaObs": "",
    "regrasEdital": {
      "semIdentificacao": true,
      "referencia": "item 10.2.1 do edital",
      "observacoes": "Proposta final (Anexo III) identificada. Validade mínima 90 dias (item 9.5)."
    },
    "pdfOpts": { "anonima": true, "validade": 90, "pagamento": "Conforme edital", "prazoEntrega": "", "localEntrega": "" },
    "createdAt": 0, "updatedAt": 0, "deleted": false
  }],
  "itens": [{
    "id": "it_imbau_91_01", "pregaoId": "pz_imbau_91_2026", "loteEdital": "", "itemEdital": "01",
    "descricao": "nome curto", "descEdital": "descrição completa do edital", "marca": "", "modelo": "", "unidade": "Un",
    "qtd": 10, "custo": 2.0, "teto": 5.0, "frete": 0, "margem": null, "lanceFinal": null,
    "semLance": false,
    "alternativas": [
      { "loja": "Loja A", "link": "https://link-direto-do-produto", "custo": 2.0, "frete": 0 },
      { "loja": "Loja C (pacote)", "link": "https://link-direto-do-produto", "custo": 18.0, "emb": 10, "frete": 0 },
      { "loja": "Loja B", "link": "https://link-direto-do-produto", "custo": 2.1, "frete": 0 }
    ],
    "obs": "", "createdAt": 0, "updatedAt": 0, "deleted": false
  }]
}
```

- `tipoCompra`: SEMPRE preencher, "SRP" ou "Aquisição" (na busca, pelo campo `srp` do PNCP; na análise, confirmar no edital: "Registro de preços"/"Ata de registro" = SRP; "aquisição" com contrato/empenho único = Aquisição).
- Compra: `custo` da opção = preço do anúncio como está na loja; se o anúncio for de pacote/caixa/kit com várias unidades, informar `emb` (unidades no anúncio) em vez de dividir à mão.
- Compra: `custo` e `frete` do ITEM = os da loja escolhida (são eles que valem nas contas); `alternativas` são só links de referência (sem `usar` nem `qtd`: a compra dividida e os campos `onde`/`ondeLink`/`impostoCompraPct` saíram na v1.115.0; o app migra dados antigos sozinho, congelando custo e frete no valor que já valia). `semLance` sempre explícito (`true`/`false`), senão a mesclagem mantém o valor antigo do app.
- Atualizar um pregão que já está no app: partir do backup mais recente, reaproveitar os ids, mandar `updatedAt` novo e NÃO mandar `marca`, `modelo`, `catalogoDesc`, `lanceFinal` nem fotos (o que o JSON não traz continua como está no app).
- Pregão: SEMPRE mandar `km` (ida e volta a partir de Telêmaco Borba) e `viagens` (decisão de 31/10/2026; sem km o app não conta a viagem nem o "se ganhar só este").
- `regrasEdital.semIdentificacao`: `true` = edital proíbe identificar na inicial; `false` = exige; omitir se o
  edital não fala. O app mostra o aviso na guia Proposta e trava a geração se a chavinha estiver diferente.
- `pdfOpts.anonima` deve bater com `regrasEdital.semIdentificacao`.

### Entrega dos arquivos (decisão de 31/10/2026 — substitui o zip)
JSON único (acima) + pastas no Google Drive conforme a seção 8:
```
01- PREGÕES/
  Municipio de Imbau/                               <- pasta do órgão (sem acento)
    PREGÃO ELETRÔNICO - EDITAL nº 094-2026/         <- uma pasta por pregão
      LEIA-ME.txt                                   <- conferência dos documentos, regras do edital, prazos, riscos, itens
      Observacoes.txt                               <- pontos de atenção item a item (quando houver muitos)
      Declaracoes (.docx)                           <- as declarações que o edital pede, já preenchidas
      Proposta modelo proprio (.docx)               <- quando o edital tiver modelo próprio
```

- Cotação de cada item, de preferência em 2 lojas diferentes, com link direto do produto (uma só é aceitável, anotada no `obs`).
- Qualidade da cotação (decisão de 26/10/2026): a loja escolhida (a que dá o `custo`/`frete` do item) deve cumprir TODAS as
  especificações mínimas do TR/edital (potência, dimensões, capacidade, material, garantia etc.), em loja
  especializada ou fabricante do ramo, para não arriscar desclassificação por produto errado. Margem muito alta
  (acima de ~50-60%) costuma indicar produto inferior à especificação: marcar no `obs` "conferir ficha técnica".
  Cotações mais baratas/inferiores PODEM entrar como opção extra de comparação (só link), sem serem a base do custo.
- Edital que exige montagem, instalação ou nivelamento do equipamento (aparelhos de academia etc.): item fora
  (`semLance: true`, motivo no `obs`), conforme a regra de itens que exigem instalação (decisão de 26/10/2026).
- Observações importantes de cada item no campo `obs` do JSON e no arquivo de observações.
- COMO COTAR, PADRÃO OBRIGATÓRIO (decisão de 30/10/2026, reforçada pelo João): toda cotação é feita no Chrome do João (Claude in Chrome), entrando nas lojas, buscando nas páginas e abrindo o produto, para conferir preço atual, especificação e pegar o LINK DIRETO. Resumo de busca (WebSearch) NÃO vale como cotação: gasta token e sai incompleto (links de listagem, preços velhos). Item por item, direto no navegador (decisão de 31/10/2026). Mercado Livre pode pedir captcha: aí parar e pedir ao João para liberar no PC. Amazon: `/s?k=<termo>` e produto `/dp/<código>`. Loja do Mecânico: `https://www.lojadomecanico.com.br/busca?q=<termo>` (link do produto = `/produto/<id>`); Mercado Livre: `https://lista.mercadolivre.com.br/<termo-com-hifens>`; Magazine Luiza: `/busca/<termo>/`. O WebFetch só abre páginas já vistas na conversa e algumas lojas (Pichau, Casas Bahia) bloqueiam.
- Se o Chrome não estiver disponível ou não responder (PC desligado, extensão desconectada) ou se eu travar em alguma loja: PARAR e avisar o João NA HORA (mensagem + notificação) para ele ligar o computador/Chrome. Não seguir cotando por resumo de busca.

---

## 4. Busca de editais

### Fluxo de trabalho (sempre nesta ordem)
1. **Varredura → lista de oportunidades + UM JSON único** com todos os pregões novos (cadastro básico,
   para importar com "Mesclar"). Sem pastas e sem análise de itens nessa etapa.
2. **João escolhe e manda os documentos** (edital, TR e anexos) dos que quer.
3. **Conferência dos documentos (seção 2) e depois análise precisa, item por item**, com todas as regras do edital (seção 2 e checklist).
4. **Entrega da análise:** JSON com as cotações (link direto, de preferência 2 lojas), observações e as pastas no Google Drive (seção 8) com LEIA-ME e declarações.

### Filtro da varredura
- Fonte: **PNCP** (não usar o e-mail do João). Ver "Busca no PNCP" abaixo.
- Raio: até ~120 km de estrada de Telêmaco Borba/PR, MAIS Ponta Grossa (~126 km) — decisão de 22/10/2026
  (180 km ficou longe demais). Quanto mais perto, melhor: está começando e sem caixa para frete grande.
  A lista de municípios com código IBGE está em "Busca no PNCP".
- Plataformas (decisão de 31/10/2026): NÃO descartar por plataforma. O João só tem cadastro no **Compras.gov.br** e na **BLL**; pregão em outra plataforma (IPM/eLicita, Licitanet, BNC, Portal de Compras Públicas, Compras Paraná etc.) entra na lista/análise normalmente, com AVISO: "plataforma X — precisa de cadastro" e se ela cobra taxa do fornecedor (a IPM não cobra; Licitanet, BNC e outras costumam cobrar). Conferir a plataforma em `usuarioNome`/`linkSistemaOrigem` do PNCP e no próprio edital (o PNCP pode errar).
- Entrega de carro de passeio, no máximo Strada com carretinha. Itens pesados ou grandes não compensam.
- Itens em quantidade muito grande são difíceis de comprar (falta de fornecedor e de experiência):
  evitar ou sinalizar.
- Ramos dos CNAEs atuais do MEI (prioridade, não limite): ferragens/ferramentas (principal), informática, telefonia, equip. de escritório,
  material elétrico, hidráulicos, iluminação, lubrificantes, saneantes (só sinalizar: exige licença/AFE),
  brinquedos, esportivos, bicicletas, instrumentos musicais, motopeças, tapeçaria/cortinas, festas/decoração.
- Fora dos CNAEs atuais (papelaria/expediente, tintas, tecidos/armarinho, livros): NÃO descartar por isso —
  trazer normalmente e anotar em `obs` qual CNAE precisaria ser incluído (o João ajusta o MEI).
- Sempre fora: alimentos, medicamentos/saúde, hospitalar, serviços, veículos/combustível,
  personalizados com amostra em prazo curto.
- Itens com fornecedor já conhecido (priorizar): pilhas/baterias Elgin, pistolas de cola quente,
  headset C3Tech PH-380BK, skate Lyons, raquete Vollo, caixas organizadoras, dispensers, EPIs com CA,
  calhas/rufos e ferragens de portão, Arduino/ESP32 (Eletrogate), percussão, testes psicológicos.
- Comparar sempre pelo nº do pregão no edital e pelo processo (não pelo sequencial do PNCP).

### REGRA: a busca segue SÓ este arquivo
Toda busca de editais (agendada ou pedida na conversa) usa somente as definições deste CLAUDE.md
e as buscas salvas em `buscas/`. Não usar contexto de conversas antigas nem memória para decidir
filtro, raio, ramos ou o que já foi analisado. Se precisar mudar uma regra, mudar AQUI primeiro.

### Ciclo semanal (decisão de 31/10/2026 — substitui o de sábado)
- O limite de uso do João reinicia no sábado. Estratégia: usar os créditos que sobram da semana na quinta e na sexta.
- **Quinta 07h47: busca no PNCP** (tarefa agendada), com aviso ao João no início ("deixe o Chrome ligado") e a lista + JSON no fim.
- Quinta e sexta: o João manda os documentos completos dos escolhidos; conferência + análise + cotação de todos juntos (um JSON só) até sexta.
- Depois: o João revisa e envia as propostas. Referência do que já está no app: `buscas/referencia-app-2026-10-31.md` (backup de 31/10) + este arquivo; atualizar a referência quando ele mandar backup novo.

### Tarefa agendada "Busca de pregões" (toda quinta 07h47)
0. Avisar o João no início (mensagem + notificação): começou a busca, deixar o Chrome ligado no PC.
1. Ler este arquivo (já está fazendo isso).
2. Ler o "Log das buscas" (fim deste arquivo) e a referência mais recente do app em `buscas/` (hoje: `referencia-app-2026-10-31.md`).
   Buscar no PNCP (seção "Busca no PNCP"), município por município, pregões e dispensas.
   NÃO usar o Gmail.
3. Descartar: prazo de proposta já vencido, fora do raio, itens grandes/pesados,
   serviços/locação/instalação, e os pregões da lista "Já analisados" abaixo.
4. Entregar só a LISTA de oportunidades (tabela curta, mais perto primeiro): cidade e distância aprox.,
   órgão, nº do pregão, fim das propostas, objeto resumido, por que vale, link BLL.
   Depois, uma linha com os principais descartados.
5. Entregar UM JSON SÓ com todos os pregões novos da busca (cadastro básico, status "Falta dados", `tipoCompra` pelo campo `srp` do PNCP,
   link do PNCP em `link`/`linkLicitacao`, objeto e triagem em `obs`, id fixo que a análise depois
   reaproveita) — o João importa com "Mesclar". Na mesma lista, marcar `deleted: true` nos pregões do app
   que deixaram de valer (prazo vencido sem proposta, fora do raio), nunca nos que têm proposta enviada,
   item ganho, empenho, entrega ou pagamento. NÃO criar pastas na busca: as pastas do Drive (seção 8)
   só existem depois da análise dos documentos.
6. Salvar a lista em `buscas/AAAA-MM-DD.md` neste repositório e REGISTRAR NO LOG (fim deste arquivo):
   uma linha nova na tabela e os pregões trazidos acrescentados na lista "Já no app ou já descartados".
   Commit direto na main. Busca sem registro no log = busca não feita.
7. Se algo falhar (Chrome desligado, PNCP fora do ar ou bloqueando, GitHub), avisar o João NA HORA
   (mensagem + notificação) pedindo para ligar o Chrome no PC; às vezes no celular não funciona.

### Busca no PNCP (responde por município; o PR inteiro de uma vez é grande demais)
- Pelo Chrome do João (desde 29/10/2026): abrir as URLs da API numa aba e ler o JSON (o shell não acessa pncp.gov.br; WebFetch só como último recurso).
- Consulta: `https://pncp.gov.br/api/consulta/v1/contratacoes/proposta?dataFinal=<hoje+60 dias AAAAMMDD>&codigoModalidadeContratacao=<6 pregão | 8 dispensa>&uf=PR&codigoMunicipioIbge=<código>&pagina=1&tamanhoPagina=50`
  (se `totalPaginas` > 1, buscar as outras páginas).
- Itens e tetos (só dos candidatos): `https://pncp.gov.br/api/pncp/v1/orgaos/<cnpj>/compras/<ano>/<sequencial>/itens?pagina=1&tamanhoPagina=50`
  (cnpj, ano e sequencial vêm do `numeroControlePNCP` = "cnpj-1-sequencial/ano").
- Link para o João baixar o edital: `https://pncp.gov.br/app/editais/<cnpj>/<ano>/<sequencial>`; plataforma em `usuarioNome` e `linkSistemaOrigem`.
- Pregões (modalidade 6) e dispensas (8) em todos os municípios da lista.
- Para economizar: ler do JSON só as compras dos ramos do MEI, uma linha por compra (no Chrome, filtrar com JavaScript na própria aba).
- Limite: até ~5 chamadas por vez. Se vier HTTP 429, esperar 2 min e seguir; listar no fim o que falhou.
- Órgãos estaduais/federais nesses municípios (UTFPR, UEPG, UEL etc.) aparecem na mesma consulta.
- Distância = linha reta × 1,3 (estimativa de estrada a partir de Telêmaco Borba).

**Municípios da busca — até ~120 km + Ponta Grossa (35):**
Telêmaco Borba 4127106 (~0); Imbaú 4110078 (~25); Tibagi 4127502 (~38); Ortigueira 4117305 (~43); Curiúva 4107009 (~47); Ventania 4128534 (~51); Reserva 4121703 (~56); Sapopema 4126207 (~60); Figueira 4107751 (~75); Rosário do Ivaí 4122651 (~87); São Jerônimo da Serra 4124707 (~89); Ibaiti 4109708 (~89); Rio Branco do Ivaí 4122172 (~92); Piraí do Sul 4119400 (~94); Japira 4112306 (~97); Cândido de Abreu 4104402 (~101); Ipiranga 4110508 (~101); Mauá da Serra 4115754 (~101); Ivaí 4111407 (~104); Faxinal 4107603 (~104); Castro 4104907 (~104); Pinhalão 4119202 (~106); Arapoti 4101606 (~107); Tamarana 4126678 (~108); Nova Santa Bárbara 4117214 (~108); Carambeí 4104659 (~109); Jaboti 4111704 (~111); Congonhinhas 4106001 (~112); Conselheiro Mairinck 4106100 (~117); Tomazina 4127809 (~118); Santa Cecília do Pavão 4123204 (~118); Cruzmaltina 4106852 (~119); Santo Antônio do Paraíso 4124301 (~120); Grandes Rios 4108700 (~120); Ponta Grossa 4119905 (~126)

### Já no app ou já descartados (não trazer como novos) — atualizado 31/10/2026
Lista completa e oficial: `buscas/referencia-app-2026-10-31.md` (todos os pregões do backup de 31/10, por status, inclusive os excluídos). O histórico abaixo explica os motivos.
Concluídos/encerrados: UFPR 2922; Ortigueira 87 (desclassificado);
UEL 162; Faxinal 52; Ortigueira 95 (desistiu).
Situação no backup de 31/10: Aguardando empenho — Mauá da Serra 60. Julgamento — Ortigueira 91, Imbaú 84 e 85, Carambeí 54, EPR-UEL 146, Faxinal 49. Proposta enviada — Imbaú 91, Carambeí 55, São Jerônimo da Serra 47. Analisando — Ortigueira 102, Ipiranga 78, Imbaú 94, Piraí do Sul 47. Falta dados — Castro 163. Desisti — UTFPR 15 e 17, Castro 157, Jaboti 44 (31/10) e os demais da lista.
Analisados em 24/10 (JSON entregue): Faxinal 49; São Jerônimo da Serra 47 (PE 40/2026); Ortigueira 102.
Descartados na análise de 24/10: Castro 150 (por lote); Japira 38 e 39 (por lote); Ipiranga 77 (expediente e
entrega em ~15 endereços); Grandes Rios 41 e Conselheiro Mairinck 62 (exigem atestado de capacidade técnica).
Analisados em 29-30/10 (JSON entregue): Imbaú 94 e Piraí do Sul 47 (Analisando); Jaboti 44 (Desisti em 31/10: atestado no TR 9); demais da busca de 29/10 como Desisti.
Analisados em 31/10 com o edital completo (JSON entregue, mesmos ids da busca): Castro 157 = Desisti (edital completo: BLL, Registro de Preços; exige atestado de capacidade técnica na habilitação 1.5 e TR 9.1, e entrega em 48 h úteis após o empenho; 16 itens ficaram cotados no JSON caso o João consiga atestado) e Castro 163 (BLL; só o item 5 compensa, item 6 falta cotar; pasta no Drive em Municipio de Castro). Castro 157 e 163 são ambos BLL (o PNCP os listava como IPM).
Conferência de documentos em 31/10: Jaboti 44 = Desisti (atestado no TR 9, via edital 6.1); Ortigueira 102 conferido com o edital completo (sem atestado/balanço, segue); Ipiranga 78 segue com pendência da DASN-SIMEI (Anexo II 2.3.3, pedir esclarecimento); Imbaú 94 e Piraí 47 sem atestado/balanço.
Analisado em 26/10 (JSON entregue): Ipiranga 78 (itens 1–8 aparelhos = Desisti por montagem/nivelamento; 9–16 cotados).
Trazidos na busca PNCP de 22/10 (aguardando escolha): Rio Branco do Ivaí 36.
Excluídos em 22/10 por ficarem acima de 120 km: Prudentópolis 124; Califórnia 69; Jardim Alegre 51 e 52;
Turvo 65; Jataizinho 35; Ibiporã 72; UEL 137; Câmara de Londrina 5; Embrapa Soja 1; Sto. Antônio da
Platina 101; UTFPR Cornélio Procópio 189; Câmara de São João do Ivaí 9; Arapongas 37; Santa Mariana 53;
Bandeirantes 39; Assaí 103; Guamiranga 32.
Vistos e descartados na busca PNCP de 22/10: Ortigueira 103 (mochilas) e 104; Pinhalão 18; Apucarana 42
(180 kits de computador); UEL 140 (louças); Londrina Iluminação 11; Rolândia 107 e 111 (prazo 23/10);
Sto. Antônio da Platina 96; Prudentópolis 132 e 140; Imbituva 35; Arapongas 35 e 40; Tibagi 61.
Descartados: Manoel Ribas Disp. 27; Ivaiporã 132; Japira 37; Nova Santa Bárbara 29; Piraí do Sul 43;
São João do Ivaí 77.
Antigos (já analisados antes): Imbaú 89 e 92, Dispensa 15; Ortigueira 90 e 99; Mauá da Serra 61;
Tibagi 60 e 61; Telêmaco 83; Castro 143 e 461; Piraí 99; Cândido de Abreu 72 e 98.
Trazidos na busca PNCP de 29/10 (aguardando escolha): Telêmaco Borba 20, 49 (= PCE 85) e 53 (= PCE 87); Imbaú 94;
Reserva Disp. 48; Piraí do Sul 47; Faxinal 54; Castro 151, 152, 157 e 163; Jaboti 42, 43 e 44; Conselheiro Mairinck 66;
Tomazina 31; Santo Antônio do Paraíso 37; Ponta Grossa 114 e 118 (= 178); FAS Ponta Grossa 16; Exército Ponta Grossa Disp. 38.
Vistos e descartados na busca de 29/10: São Jerônimo da Serra 46 (lotes/pesado); Arapoti Disp. 28; Castro 149, 153, 158 e 161;
Tomazina 32 (volume); Piraí do Sul 45 (volume); Ponta Grossa 101, 110 e 144; UTFPR 86; Pinhalão 20; Carambeí 59;
Santo Antônio do Paraíso 38; Tibagi 64 e 65; Rosário do Ivaí 42 e 43.
Conferido com o backup do app de 29/10/2026: Rio Branco do Ivaí 36 está como Desisti; Ortigueira 91 com a sessão ainda em andamento em 29/10; Imbaú 84 e Carambeí 54 em julgamento (confirmado); Imbaú 85 e EPR-UEL 146 em Julgamento no app (não confirmado).
Conferido com o backup do app de 30/10/2026: Imbaú 91, Carambeí 55 e São Jerônimo da Serra 47 com proposta enviada; UTFPR 17 (sessão 09/11), Ortigueira 102 (10/11) e Ipiranga 78 (05/11) em Analisando, recotados pelo Chrome em 30/10 (Mercado Livre reconferido depois do captcha).
Trazidos na busca PNCP de 05/11 (completada no Chrome, aguardando escolha): Telêmaco Borba 56 (= PCE 90); Ivaí 42; Tamarana 066; Carambeí PCE 62 e 63; Conselheiro Mairinck 068; UEPG 78 (= SEAP 1643); FAS Ponta Grossa 19; Câmara de Ponta Grossa 8.
Analisado em 09/11 (edital completo, cotado no varejo): Ortigueira PE 104/2026 (BLL, Registro de Preços, descartáveis para refeições do Centro de Saúde 24h) = Desisti: no varejo a colher e o copo dão prejuízo, a marmita fica em ~0–5% e o saco em ~18% (não confirmado); item 4 sem cotação. Só reavaliar com orçamento de atacado (JSON: `buscas/pregoes-ortigueira-104-desisti-2026-11-09.json`). Antes disso, em 22/10, já constava como visto e descartado na busca.
Vistos e descartados na busca de 05/11: Ortigueira 100 e 109; Mauá da Serra 65; Tamarana 059 e 060; Castro 156, 159, 160 e 162; Arapoti PCE 53; Faxinal 53; Ponta Grossa 117, 176 e 180; FAS Ponta Grossa 18; Cândido de Abreu 77 (prazo hoje), 78 (transporte escolar) e 79 (cestas); Imbaú 75, 93 e 95; Tibagi 66 a 69; Ortigueira PE 107 (playground com instalação); Reserva 074 (móveis planejados); Jaboti 45 (gráficos); Tomazina 32; Tamarana 061 e 067; Carambeí PCE 58 a 61; Mauá da Serra 66; UEPG 53; demais serviços.
Trazidos na busca PNCP de 12/11 (aguardando escolha): Telêmaco Borba 59 (= PCE 92); Ventania 19; Reserva Disp. 050; Ibaiti 242; Cândido de Abreu 80; Nova Santa Bárbara 29 e Disp. 28; Congonhinhas 13 (Fundo Municipal de Saúde); Cruzmaltina Disp. 022.
Vistos e descartados na busca de 12/11: UTFPR 97 (entrega em Guarapuava) e 109; FAS Ponta Grossa 20; Arapoti PCE 50, 54, 56 e 57; Ponta Grossa 181, 182 e 184; Tamarana 063 a 065, 067 e 068; Castro PCE 164 a 172; Jaboti 46 e Disp. 29; Mauá da Serra 67 a 74 e Disp. 43 e 44; Cândido de Abreu 77; Telêmaco 58/PCE 91, 60/PCE 93 e 61/PCE 94 (tintas); Rio Branco do Ivaí 38, 39 e Disp. 39; Ipiranga 79 e Disp. 13 e 14; 5ª Brigada Disp. 6 e 97; Santo Antônio do Paraíso 39; Ortigueira 105 e 108; Imbaú 96; Ventania 20; Reserva 75 e 76; Figueira 16; Japira 37 e 40; Piraí do Sul 42 e 49 a 52; Carambeí PCE 64 a 66; Congonhinhas 12, 20 a 22; Conselheiro Mairinck 65, 69 e 70; Grandes Rios 47 a 49; Pinhalão 21 e 22; Cruzmaltina Disp. 6 e 21; São Jerônimo da Serra 7, 10, Consórcio 10 e Disp. 49 e 50; Tibagi 62, 69, 70 e Disp. 30; Nova Santa Bárbara DE 28 (Betha, mesmo objeto); UEPG 77, 79, 82 a 84, 87, 88 e SEAP 1662, 1666, 1687, 1688, 1709, 1720, 1724; UTFPR 10; Ponta Grossa 174, 175, 177, 179; FAS PG 17.
Analisados em 12/11 (edital completo, JSON `buscas/meus-pregoes-analise-2026-11-12.json`, mesmos ids da busca): Desisti — Congonhinhas 13 (= PE 90.007; atestado + balanço), Ventania 19 (balanço), Reserva Disp. 050 (atestado + lote), Ibaiti 242 (= PE 46/2026, BLL e não Equiplano; atestado + balanço), Nova Santa Bárbara 29 (= PE 30/2026; atestado), Cândido de Abreu 80 (balanço com índices + BNC), Cruzmaltina Disp. 022 (atestado). Falta dados — Nova Santa Bárbara Disp. 28 (lote único de 2 itens; ficha = Fortlux Natal FTX201S e FTX80001S, sem preço público; pasta no Drive). Telêmaco 59 não veio no pacote.
Reabertos em 12/11 por decisão do João (balanço não descarta mais), JSON `buscas/meus-pregoes-reabertos-2026-11-12.json`: Telêmaco 59 (= PE 92/2026; 78 itens, 28 cotados; Falta dados: 12, 13, 18, 19 e conexões pequenas de PVC), Ventania 19 (21 cotados; falta o item 6) e Cândido de Abreu 80 (BNC; 22 cotados; falta o item 3). Pastas no Drive com LEIA-ME e declarações. O arquivo do "Telêmaco" no pacote anterior era, na verdade, o Congonhinhas 13.
(Quando o João mandar um backup do app ou os PDFs de um pregão, atualizar esta lista.)

### Orientações adicionais do João
- (nenhuma pendente; Ipiranga 78 e Rio Branco do Ivaí 36 foram trazidos de novo na busca de 29/10/2026)
<!-- acrescentar aqui as novas orientações de busca -->

---

## 5. Log das buscas (OBRIGATÓRIO a cada busca)
Antes de buscar: ler a última linha para saber a data da última verificação.
Depois de buscar: acrescentar uma linha. Nunca trazer de novo um pregão que já aparece neste log
ou na lista "Já no app ou já descartados" — comparar por órgão + nº do pregão.

| Data da busca | Fonte e período | Novos trazidos | Arquivo |
|---|---|---|---|
| 22/10/2026 | divulgador BLL de 21/10/2026 (últimos 14 dias) | Japira 38 e 39; Castro 150; Conselheiro Mairinck 62; Ipiranga 77 e 78; Grandes Rios 41; Faxinal 49; Assaí 103; Manoel Ribas Disp. 27; São João do Ivaí 77 | buscas/2026-10-22.md |
| 22/10/2026 | PNCP, pregões abertos até 21/12, faixas 1 e 2 (dispensas não) | 19 novos (ver buscas/2026-10-22-pncp.md) | buscas/2026-10-22-pncp.md |
| 22/10/2026 | Ajuste: raio reduzido para ~120 km + Ponta Grossa; 17 pregões acima disso excluídos do app | — | (JSON pregoes-mei-120km-2026-10-22) |
| 29/10/2026 | PNCP via Chrome do João, 35 municípios, pregões + dispensas com propostas abertas até 28/12 (201 compras) | 21 novos (+ Ipiranga 78 e Rio Branco do Ivaí 36 de novo) | buscas/2026-10-29.md + pregoes-busca-pncp-2026-10-29.json |
| 05/11/2026 | 1ª rodada parcial (nuvem sem Chrome, WebFetch, só pregões); completada no mesmo dia pelo Chrome do João: 35 municípios, pregões + dispensas com propostas abertas até 04/01/2027 (170 compras, sem falhas), itens dos candidatos baixados | 9 novos: Telêmaco 56; Ivaí 42; Tamarana 066; Carambeí PCE 62 e 63; Conselheiro Mairinck 068; UEPG 78; FAS Ponta Grossa 19; Câmara de Ponta Grossa 8 (Cândido de Abreu 78 saiu: transporte escolar) | buscas/2026-11-05.md + pregoes-busca-pncp-2026-11-05.json |
| 12/11/2026 | PNCP via Chrome do João, 35 municípios, pregões + dispensas com propostas abertas até 11/01/2027 (176 compras, sem falhas), itens dos 22 candidatos baixados | 9 novos: Telêmaco 59 (= PCE 92); Ventania 19; Reserva Disp. 050; Ibaiti 242; Cândido de Abreu 80; Nova Santa Bárbara 29 e Disp. 28; Congonhinhas 13 (FMS); Cruzmaltina Disp. 022 | buscas/2026-11-12.md + pregoes-busca-pncp-2026-11-12.json |


---

## 6. Entrega por item (decisão de 29/10/2026)

- Cada item ganho tem a sua data de entrega (`entregueEm` no item). No pregão, `entregueEm` continua significando "tudo entregue"; ele é preenchido sozinho quando o último item ganho é entregue, e a entrega marcada no pregão inteiro vale para todos os itens.
- Marcar/desmarcar: botão "Marcar entregue" no cartão do item ganho e lista "Entrega por item" no cartão "Entrega e pagamento" do pregão. "Marcar o restante como entregue hoje" fecha o que faltar. "Desfazer entrega" limpa as datas dos itens também.
- Etapas do selo: Julgamento → Empenho → Entregar → Parcial → Receber → Pago. O pagamento (prazo e "Receber") só conta depois da entrega total; pagamento parcial por entrega ainda não existe.
- Nos JSON de importação, `entregueEm` do item só vem no backup do app; análise nova não manda esse campo.

## 7. Guia Pregões: grupo em tela cheia (decisão de 29/10/2026)

- Desde 05/11/2026 vale só no celular (no PC a guia é uma grade única, sem raias). O "voltar para o cartão em que estava" vale nos dois.

- Clicar no título de um grupo do quadro (ex.: "Incompletos") abre só aquele grupo na tela toda, em grade de cartões, com o botão "Todos os grupos" para voltar ao quadro.
- Abrir um pregão e voltar pelo "Pregões" de cima devolve a tela em que estava (grupo em tela cheia ou quadro), já rolada até o cartão clicado, com um destaque rápido nele. Não tirar isso: o João não quer rolar de novo para achar o pregão.
- Na tela cheia do grupo, os cartões ficam 2 por linha (3 por linha em tela grande, a partir de ~1500 px) e não mais, para não ficarem estreitos (pedido do João, tela grande).

## 8. Pastas no Google Drive (decisão de 29/10/2026)

- Arquivos .docx: subir como .docx (não converter para Google Docs), em formato enxuto (sem o modelo pesado do python-docx), com as lacunas em amarelo.
- As pastas das análises ficam no Google Drive do João, dentro de "01- PREGÕES": uma pasta por órgão ("Municipio de Castro"; sem acento) e, dentro, "PREGÃO ELETRÔNICO - EDITAL nº 157-2026" (dispensa: "DISPENSA ELETRÔNICA - EDITAL nº 48-2026"; quando o PNCP usa outro número, pôr entre parênteses, ex.: "(PCE 53-2026)"). Dentro de cada uma, o LEIA-ME.txt.
- Toda análise que compensa é SALVA no Drive sem o João precisar pedir. Só vão para o Drive os pregões que COMPENSAM (status Analisando/Falta dados). Os que ficam Desisti NÃO ganham pasta no Drive: o motivo fica no JSON (obs) e no resumo do projeto.
- Cada pasta de pregão que compensa leva, além do LEIA-ME, as DECLARAÇÕES que o edital pede por escrito (Declaração Unificada/Conjunta, ME/EPP etc.) em .docx, já com razão social, CNPJ e endereço do MEI e as lacunas de CPF/RG/data em amarelo, e o modelo próprio de proposta quando houver (decisão de 30/10/2026; o João cobrou: "esses documentos são importantes"). Edital em que as declarações são só no sistema (Compras.gov, "desnecessária a apresentação por escrito") não precisa: dizer isso no LEIA-ME.
- Pasta de órgão que já existe (ex.: "Município de Faxinal") é reaproveitada: procurar antes de criar.
