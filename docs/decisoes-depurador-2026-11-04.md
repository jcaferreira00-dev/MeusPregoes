# Relatório de funcionalidades — Meus Pregões

App v1.114.0 · gerado em 04/11/2026, 18:02:54

> Importância: 5 essencial · 4 importante · 3 útil · 2 pouco usada · 1 redundante/morta.

## 5 · Essencial

### F01 — Lance mínimo do item 🔒

*Cálculo e regras · veredito: Manter*

É o menor preço unitário que ainda dá a sua margem. O app soma o custo de compra, o frete do fornecedor e a parte da viagem que cabe ao item, divide pela quantidade e aplica a margem alvo (padrão da Config): mínimo = custo unitário ÷ (1 − margem − imposto), sempre arredondado para cima em centavos. Aparece no cartão, na janela do item, na guia Itens e na simulação.

- Evidência: Função calcItem (núcleo). Tudo o que fala de “mínimo” nasce aqui.
- **Minha decisão:** manter

### F02 — Custo da viagem e rateio entre os itens 🔒

*Cálculo e regras · veredito: Manter*

Calcula a viagem (km ÷ consumo × combustível + km × desgaste + pedágio) × número de viagens e reparte entre os itens do pregão na proporção do valor da compra de cada um. Quando já existe item ganho, só os ganhos entram no rateio: perdidos e “aguardando” saem da conta, para a viagem não ficar barata demais ou o orçamento inflado.

- Evidência: computeAll + custoViagem. Config › Margem e entrega de carro alimenta (consumo, combustível, desgaste).
- **Minha decisão:** manter

### F03 — Se ganhar só este item 🔒

*Cálculo e regras · veredito: Manter*

Simula o pior caso: este é o único item que você ganha, então a viagem inteira fica nele. Mostra o lance sem prejuízo (“empate”), o lance com a margem, o lucro no seu lance e o valor da viagem. Existe para você nunca dar um lance que vira prejuízo se os outros itens não saírem.

- Evidência: calcSozinho → c.solo. Alimenta o aviso de lance baixo e a etiqueta “N itens dão prejuízo se ganhar só eles”.
- **Minha decisão:** manter

### F04 — Regras do teto do edital 🔒

*Cálculo e regras · veredito: Manter*

Lance acima do teto desclassifica; o mínimo nunca passa do teto (aparece “Não compensa”); a proposta sem lance sai com o teto e o que passar do teto é cortado nele. Evita erro caro por digitação.

- Evidência: unitProposta, decisao() e linhasProposta aplicam a mesma regra.
- **Minha decisão:** manter

### F05 — Aviso e confirmação de lance abaixo do mínimo 🔒

*Cálculo e regras · veredito: Manter*

Se o lance fica abaixo do mínimo “sem prejuízo se ganhar só este”, o campo fica vermelho e o app pede confirmação antes de salvar ou gravar. É a trava contra prejuízo no começo do projeto.

- Evidência: abaixoSolo/avisoSoloTxt. Cobre janela do item, simulador e cartão.
- **Minha decisão:** manter

### F06 — Bloco de decisão do item (número grande + semáforo) 🔒

*Cálculo e regras · veredito: Manter*

O quadro colorido do item: com lance mostra “Meu lucro no lance”; sem lance mostra “Valor mínimo p/ proposta”. Verde/âmbar/vermelho diz se está Seguro, em Atenção ou em Risco, e as colunas mostram lance mínimo, lucro ganhando só este e lucro junto com os outros.

- Evidência: decisaoHtml. É o “destaque” que o João pediu para nunca mais perder.
- **Minha decisão:** manter

### F07 — Custo unitário e frete do item (sempre digitados) 🔒

*Itens · veredito: Manter*

Os dois números que você digita depois de cotar: custo por unidade e frete do fornecedor (total do item). Nunca ficam travados, e as opções de compra não mexem neles. Todo o resto do app parte daqui.

- **Minha decisão:** manter

### F08 — Janela de edição do item

*Itens · veredito: Manter*

Formulário em tela cheia no PC (prévia fixa à esquerda, campos em 4 colunas): pregão, lote/item, nome, “Exigido no edital”, marca/modelo, descritivo ofertado, quantidade, unidade, custo, frete, teto, lance final, opções de compra, observações, colocação, vencedor. No PC o resumo, o lance final e o valor do vencedor ficam na coluna da esquerda; em tela dividida (900–1199 px) a coluna fica estreita.

- **Minha decisão:** manter

### F09 — “Exigido no edital” (cópia fiel do edital)

*Itens · veredito: Manter e enxugar*

Texto do item copiado do edital/TR sem resumir. Sai no PDF como “Exigido no edital” e é o que você confere ao revisar a cotação. Importante, mas é o campo que mais ocupa espaço na nuvem (cerca de 16% do documento de sincronização).

- Nos seus dados: 157 de 158 itens com texto do edital
- Sugestão: Manter para pregões ativos; para pregões Desisti, arquivar o texto fora do documento sincronizado (ver “Limite de 1 MB da nuvem”).
- Evidência: Campo descEdital: maior campo de texto dos itens.
- **Minha decisão:** manter

### F10 — Item “Fora da disputa” (sem lance)

*Itens · veredito: Manter*

Marca o item que você analisou mas não vai disputar (sem margem, ANVISA, grande demais…). Ele fica visível com o motivo na observação, mas não entra em nenhuma conta. Seguindo a regra do João, todos os itens do edital entram no app; os descartados ficam assim.

- Nos seus dados: 51 de 158 itens fora da disputa
- Evidência: Campo semLance.
- **Minha decisão:** manter

### F11 — Resultado do item: Venci · Não ganhei · Desclassificado

*Itens · veredito: Manter*

Três botões no cartão do item registram o resultado da sessão. “Venci” coloca o item nas contas e liga o fluxo empenho → entrega → pagamento; “Desclassif.” guarda a data e o motivo e destaca o pregão com “Rever”.

- Nos seus dados: 9 de 158 itens marcados Venci
- Evidência: definirResultado/marcarGanho/pedirDesclassificacao.
- **Minha decisão:** manter

### F12 — Lance final (o valor que vai na proposta)

*Itens · veredito: Manter e enxugar*

Se você preencher o lance final, ele manda em tudo: proposta inicial, final, painel e avisos. Vazio = vale o teto do edital. Hoje existe em 5 lugares: janela do item, tabela da guia Acompanhar, “Meu lance” da guia Proposta no celular, o simulador (que grava com 2 confirmações) e a tela de confirmação de preços da proposta final.

- Nos seus dados: 59 de 158 itens com lance final
- Sugestão: Manter o campo; usar um único componente de lance em todas as telas para o comportamento (aviso de mínimo/teto) ser idêntico.
- **Minha decisão:** manter

### F13 — Proposta inicial e proposta final

*Proposta (PDF) · veredito: Manter*

Inicial: todos os itens da disputa; na primeira geração os preços ficam guardados (precoInicial), assim ela sai sempre igual. Final (readequada): só os itens vencidos, com tela de confirmação do preço de cada item; os ajustes dela não viram padrão e não mexem na inicial.

- Nos seus dados: 25 de 158 itens com preço inicial guardado
- Evidência: linhasProposta(tipo).
- **Minha decisão:** manter

### F14 — Proposta sem identificação do licitante

*Proposta (PDF) · veredito: Manter*

Para edital que proíbe identificar a empresa na proposta inicial: some nome, CNPJ, cabeçalho, banco, assinatura e declarações; depois de gerar, o app confere se algum dado da empresa vazou no PDF.

- Nos seus dados: 5 de 14 pregões com proposta sem identificação
- Evidência: gerarProposta confere o texto do PDF gerado.
- **Minha decisão:** manter

### F15 — Bloqueio: não gera proposta sem marca, modelo e descritivo

*Proposta (PDF) · veredito: Manter*

A proposta não sai enquanto algum item estiver sem marca, sem modelo ou sem o descritivo do item ofertado, ou quando a marca/modelo do item diferir do que está escrito no descritivo (MARCA:/MODELO:). Protege contra desclassificação por proposta incompleta.

- Evidência: faltasOferta + pendenciasModelo.
- **Minha decisão:** manter

### F16 — Limite de faturamento do MEI

*Cálculo e regras · veredito: Manter e enxugar*

Compara o que já foi faturado e o que está ganho com o limite anual (cheio ou proporcional ao mês de abertura) e avisa se ganhar tudo estoura. Essencial para MEI. Hoje aparece em dois cartões do Painel: a linha de números do topo e o cartão “Uso do limite do MEI”.

- Sugestão: Manter o cálculo; mostrar uma vez só no Painel (veja “Uso do limite do MEI”).
- **Minha decisão:** enxugar

### F17 — Pós-venda: empenho → entrega → pagamento

*Cadastro do pregão · veredito: Manter e enxugar*

Depois de ganhar você registra o empenho, o prazo de entrega, a entrega e o recebimento. O app calcula prazos, avisa atraso, mostra o carimbo “Empenho / Entregar / Parcial / Receber / Pago” no cartão e lista “Entregas e recebimentos” no Painel. Ainda sem uso nos seus dados (você acabou de ganhar o primeiro), mas é o coração de depois da vitória.

- Nos seus dados: 0 de 14 pregões com empenho/entrega/pagamento
- Sugestão: Manter. Quando houver uso real, avaliar juntar “Entrega por item” (hoje em dois lugares) e o carimbo provisório com as etiquetas de texto.
- **Minha decisão:** manter

### F18 — Km da entrega obrigatório + cálculo automático pela cidade 🔒

*Cadastro do pregão · veredito: Manter*

Pregão e item não salvam sem km (sem ele a viagem não entra no custo e o “se ganhar só este” fica errado). O app calcula sozinho a distância ida-e-volta pelo OpenStreetMap (Nominatim + OSRM) a partir do endereço da empresa, quando há internet.

- Nos seus dados: 0 de 14 pregões ativos SEM km (ruim: o ideal é zero)
- Evidência: Rota.calcular + AutoKm. Depende de dois serviços externos gratuitos (podem falhar: então digita o km).
- **Minha decisão:** manter

### F19 — Semáforo do prazo de propostas

*Cadastro do pregão · veredito: Manter*

Mostra quanto falta para o fim do envio das propostas: amarelo com 2 dias, vermelho com 1 dia ou menos, “encerrado” depois. Só avisa enquanto o pregão está Incompleto ou Analisando.

- Evidência: prazoInfo.
- **Minha decisão:** manter

### F20 — Cadastro e edição do pregão

*Cadastro do pregão · veredito: Manter*

Janela com número, órgão, status, plataforma, tipo de compra, cidade/UF, links (edital, enviar proposta, licitação, modelo), prazo de propostas, sessão, observações, entrega e pagamento, modelo próprio, entrega parcelada e entrega de carro (km, viagens, pedágio). Rascunho automático e trava de número (só dígitos e . - /).

- **Minha decisão:** manter

### F21 — Quadro de pregões por raias (guia Pregões)

*Guia Pregões · veredito: Manter e enxugar*

É a tela principal de trabalho: colunas por importância — Atenção agora (vermelha), Julgamento, Venci 🏆, Enviadas, Analisando, Incompletos — com encerrados/concluídos num botão só. No celular uma coluna por vez; no PC as colunas cabem na tela e rolam por dentro.

- Sugestão: Manter. A barra de filtros por status acima do quadro repete as raias (ver “Filtros por status”).
- **Minha decisão:** manter

### F22 — Raia “Atenção agora” e alertas do cartão

*Guia Pregões · veredito: Manter*

Junta o que não pode esperar: pregão hoje, proposta vencendo em até 1 dia, entrega ou pagamento atrasado, sessão que passou sem resultado. Cada cartão ganha uma faixa de alerta colorida e a borda muda de cor conforme a urgência.

- Evidência: alertaPregao.
- **Minha decisão:** manter

### F23 — Config: margem, carro, MEI e tributos

*Config e dados · veredito: Manter*

Margem padrão, lucro que “já compensa”, consumo, combustível, desgaste, capital de giro, limite do MEI, ano/mês de abertura, faturamento fora do app, salário mínimo, atividade (ICMS/ISS) e imposto sobre a venda (0 para MEI). Todo o cálculo depende destes números.

- **Minha decisão:** manter

### F24 — Config: dados da empresa e do titular

*Config e dados · veredito: Manter*

Nome, CNPJ, IE, endereço, contatos, titular, RG, estado civil e dados bancários. Alimentam cabeçalho, declarações e o endereço de partida do cálculo de km. Ficam só no aparelho/nuvem privada: o repositório é público e não guarda nada disso.

- **Minha decisão:** manter

### F25 — Exportar e importar (Mesclar / Substituir)

*Config e dados · veredito: Manter*

Exporta tudo em JSON e importa o JSON da análise feita com o Claude: “Mesclar” atualiza campo a campo o que for mais novo e preserva o que o arquivo não traz (fotos, descritivo, lance final, preços guardados). É o elo entre a análise de edital e o app.

- Evidência: importarBackup + completarComLocal.
- **Minha decisão:** manter

### F26 — Login e sincronização na nuvem (Firebase)

*Nuvem e aplicativo · veredito: Manter*

Entra com e-mail e senha e mantém PC e celular iguais: sempre puxa o servidor primeiro, mescla por data de alteração (o registro mais novo vence; exclusões viram “lápides”) e só então envia, dentro de uma transação. Escuta mudanças ao vivo e tenta de novo sozinho se cair a internet.

- Evidência: Sync.run + adaptadorFirebase.sync (mesclarNaNuvem).
- **Minha decisão:** enxugar — querfo que esta opção nao deixe entrar no app, quero uma tela de login, antes de acessar o app. se tiver logn e senha salvo entra sozinho. tirar o botão de criar nova conta por enquanto, até resolver a questão do limite do fire.

### F27 — Limite de 1 MB do documento da nuvem

*Nuvem e aplicativo · veredito: Decidir com dados*

Todos os pregões e itens vivem num único documento do Firestore, que aceita no máximo 1 MB. O app trava a sincronização com erro acima de 950 mil caracteres. Na sua cópia de 31/10 já estava em cerca de 86% desse limite, e quase metade do espaço são itens de pregões em que você desistiu. Veja o painel “Saúde › Espaço na nuvem”.

- Sugestão: Antes de analisar mais editais: arquivar os itens dos pregões Desisti fora do documento sincronizado (ou limpar texto longo), apagar lápides antigas e remover campos legados duplicados (ondeLink).
- Evidência: adaptadorFirebase.sync lança erro acima de 950.000 caracteres.
- **Minha decisão:** manter

## 4 · Importante

### F28 — “Posso baixar do teto até o mínimo” e “Lucro” 🔒

*Cálculo e regras · veredito: Manter*

Duas linhas no cartão e na janela do item: quanto dá para baixar do teto (em R$ e %) até o mínimo, e o lucro no lance (ou pelo teto, se não há lance). Servem na hora de dar lance.

- **Minha decisão:** enxugar — nao adianta eu pode baixar até um valor que meu lucro seja 0.

### F29 — Preço de pacote (“unidades no anúncio”)

*Itens · veredito: Manter*

Se o anúncio é de um pacote (ex.: 10 un.), o app compra em pacotes inteiros e calcula o custo por unidade (20 un. com anúncio de 10 = 2 anúncios). Avisa “o anúncio é de um pacote?” quando o preço passa do teto.

- Nos seus dados: 1 de 216 opções de compra com pacote
- **Minha decisão:** manter

### F30 — Opções de compra (links de lojas)

*Itens · veredito: Manter*

Até 8 opções por item: link direto, loja, preço do anúncio e frete. São só links para você abrir quando quiser (cesta + lápis); não alteram custo nem frete. A prévia compara o total de cada uma e marca a mais barata.

- Nos seus dados: 106 de 158 itens com ao menos uma opção de compra
- **Minha decisão:** enxugar — 4 opções ta bom.

### F31 — Botões de compra com o nome da loja

*Itens · veredito: Manter e enxugar*

Mostra a cesta com o nome do site no cartão do item, no catálogo, no formulário, na tabela da guia Acompanhar (“$”) e na confirmação de preços. Feito em 4 lugares com código parecido.

- Sugestão: Manter a função; gerar o botão sempre pela mesma rotina (comprasDoItem) e padronizar o visual.
- **Minha decisão:** enxugar — só o botao compar, semo nome da loja já está bom.

### F32 — Marca, modelo e descritivo ofertado

*Itens · veredito: Manter e enxugar*

Campos digitados por você (o app nunca preenche). Se o descritivo traz “MARCA:” e “MODELO:”, o app copia para os campos marca/modelo para nunca sair diferente. O PDF mostra “Exigido no edital” e o “Descritivo do item ofertado” em texto corrido.

- Nos seus dados: 60 de 158 itens com descritivo ofertado
- Evidência: marcaModeloDoTexto + onInput do item.
- **Minha decisão:** manter

### F33 — Alerta “Revisar” por item

*Itens · veredito: Manter*

Campo com o motivo (ex.: custo estimado). Vira faixa âmbar no cartão, selo na guia Itens, etiqueta “N itens para revisar” no pregão e linha nas pendências do Painel; “Revisado” limpa. Serve para a análise apontar o que precisa do seu olho.

- Nos seus dados: 1 de 158 itens com alerta Revisar
- **Minha decisão:** manter

### F34 — Minha colocação no item

*Itens · veredito: Manter*

Depois da sessão você anota em que lugar ficou (1º, 2º…). Leva o pregão para “perto de ganhar” (até o 3º) e alimenta a lista “Colocações” no Painel.

- Nos seus dados: 25 de 158 itens com colocação
- **Minha decisão:** manter

### F35 — Simulador de lance

*Itens · veredito: Manter*

Caixa no item de pregão em disputa: digite um valor e veja na hora total, lucro, margem, nota e se fica abaixo do mínimo ou acima do teto, sem salvar nada. Só grava com 2 confirmações. Útil durante a sessão.

- Evidência: simCalc/simResHtml/gravarLanceSimulado.
- **Minha decisão:** manter

### F36 — Edital com modelo próprio de proposta

*Cadastro do pregão · veredito: Manter*

Chavinha + link do modelo no pregão. Avisa no cartão, no topo do pregão e na guia Proposta que o órgão exige formato próprio, para você não usar o modelo padrão por engano.

- Nos seus dados: 8 de 14 pregões com modelo próprio
- **Minha decisão:** enxugar — Quero todos os modelo padrão, com o meu padrão, a unica diferença é o modelo sem identificação. o modelo próprio nao importa, pois a maioria dos editais traz um modelo, mas aceitam o meu desde que tenham todas as informações.

### F37 — Observações do pregão

*Cadastro do pregão · veredito: Manter*

Anotações livres (amostra, atestado, ligar para o pregoeiro). Aparecem em destaque no cartão, no topo do pregão e na guia Proposta.

- Nos seus dados: 9 de 14 pregões com observação
- **Minha decisão:** enxugar

### F38 — Tipo de compra: Registro de preços (SRP) ou Aquisição

*Cadastro do pregão · veredito: Decidir com dados*

Selo no cartão e seletor no pregão. SRP gera ata e pedidos ao longo do tempo; Aquisição é compra direta. Se o campo está vazio, o app tenta adivinhar lendo “registro de preços/SRP” nas observações e exigências.

- Nos seus dados: 5 de 14 pregões com tipo de compra preenchido
- Sugestão: Manter o campo. Decidir se a adivinhação por texto (tipoCompraDe) continua: ela pode contradizer o que você escolheu e a regra diz para não usar observações.
- **Minha decisão:** enxugar — Importante, mas nao pode esconder o nome da cidade e numero do pregão.

### F39 — Sessão que passou de um dia para outro

*Guia Pregões · veredito: Manter*

Pregão “Proposta enviada” cuja sessão já passou vai para Atenção agora com 3 botões: “Continua amanhã”, “Mais dias” e “Encerrou” (vira Julgamento). A pergunta some quando a data fica no futuro.

- **Minha decisão:** manter

### F40 — Selo-carimbo e raia “Venci 🏆”

*Guia Pregões · veredito: Manter e enxugar*

Reúne pregões com item ganho. O carimbo no canto do cartão acompanha a etapa: Julgamento → Empenho → Entregar → Parcial → Receber → Pago (marcado como provisório no CLAUDE.md). O mesmo estado também aparece como etiqueta de texto e como faixa de alerta.

- Sugestão: Quando fechar o desenho, manter só o carimbo e a etiqueta de texto do detalhe; tirar a repetição na faixa de alerta.
- **Minha decisão:** manter

### F41 — Voltar ao cartão em que estava

*Guia Pregões · veredito: Manter*

Abrir um pregão e voltar devolve a mesma tela (grupo em tela cheia ou quadro), já rolada até o cartão, com um destaque rápido. Você pediu para nunca mais ter que procurar.

- Evidência: UI.lastCard (CLAUDE.md §7).
- **Minha decisão:** manter

### F42 — Busca de pregões e de itens

*Guia Pregões · veredito: Manter*

Campo de busca por número, órgão, cidade ou nome do item (guia Pregões) e por item, marca ou órgão (guia Itens).

- **Minha decisão:** manter

### F43 — Tela de detalhe do pregão

*Guia Pregões · veredito: Manter e enxugar*

Cabeçalho com links, “Atenção neste edital”, status e tipo, cartão de pós-venda, itens ganhos, quatro números (venda, custo, lucro, margem real), lista de itens e dados do pregão. Os seletores de status e tipo repetem os campos do formulário e o quadro “Dados do pregão” repete o que está no formulário.

- Sugestão: Manter. Tirar o quadro “Dados do pregão” (repete o formulário) ou deixar só o que não está no cabeçalho.
- **Minha decisão:** manter

### F44 — Painel: quatro números do topo

*Painel · veredito: Manter*

Limite do MEI, comprometido, saldo disponível e lucro previsto (ganho e em disputa). Resposta rápida a “posso arriscar mais?”.

- **Minha decisão:** enxugar

### F45 — Painel: Pendências

*Painel · veredito: Manter*

Lista única do que pede ação: completar dados, enviar proposta, informar km, revisar itens, cadastrar itens, registrar resultado, completar catálogo e certidões vencendo. É a lista que deveria ser a “fonte única” do que fazer.

- Evidência: painelPendenciasHtml.
- **Minha decisão:** manter

### F46 — Painel: Entregas e recebimentos

*Painel · veredito: Manter*

Pregões ganhos a entregar ou a receber, ordenados por urgência, com os totais “a entregar” e “a receber”.

- **Minha decisão:** manter

### F47 — Agenda do celular (hoje, amanhã, próximos)

*Painel · veredito: Manter*

Cartão no topo do Painel só no celular: o que acontece hoje, amanhã e nos próximos dias, mais os ganhos com botão “Proposta”. Foi pensado para o uso rápido no iPhone.

- **Minha decisão:** manter

### F48 — Capital de giro (cartão do Painel + aviso por pregão)

*Painel · veredito: Manter*

Mostra quanto dinheiro sai antes de receber (pior caso: pedirem tudo de uma vez) e compara com o capital informado na Config. No pregão de entrega parcelada repete a conta só para aquele pregão.

- Sugestão: Manter; o aviso por pregão e o cartão geral respondem a perguntas diferentes.
- **Minha decisão:** manter

### F49 — Proposta no celular (modo rápido)

*Proposta (PDF) · veredito: Manter*

Escolhe o pregão, mostra inicial/final e os itens como cartões com “Meu lance” (vazio = teto) e o botão Gerar PDF; esconde as opções do documento. O PDF sai com as configurações feitas no PC.

- **Minha decisão:** manter

### F50 — Cláusulas, {campos} e declarações do edital

*Proposta (PDF) · veredito: Manter e enxugar*

Textos com {razao}, {cnpj}, {rg}… são preenchidos com os dados da Config; falta algum, o app avisa onde preencher. Há cláusulas livres e “declarações do edital” (cada uma em página própria, com data e assinatura).

- Nos seus dados: 1 de 14 pregões com declarações do edital
- **Minha decisão:** enxugar — nunca uso, deixa só os dados importantes que todo pregão pede, declarar clausulas na proposta não é interesssante. as declarações entram em documento separado.

### F51 — Catálogo dos produtos (fotos + descrição)

*Proposta (PDF) · veredito: Manter e enxugar*

Para o pregoeiro confrontar o edital com o que você oferece: por item, o que o edital exige, marca/modelo, sua descrição detalhada e até 4 fotos. As fotos ficam no aparelho (IndexedDB) e vão reduzidas para a nuvem, uma coleção por item.

- Nos seus dados: 56 de 158 itens com foto
- Evidência: CatImg/enviarFotos/preencherFotosCatalogo.
- **Minha decisão:** manter

### F52 — Aplicativo instalável + atualização automática

*Nuvem e aplicativo · veredito: Manter*

Service worker “servidor primeiro” (sempre baixa a versão nova e só usa cópia guardada se estiver sem internet), faixa de “nova versão”, botão “Buscar atualização” e instalação na tela inicial.

- Evidência: sw.js + checkUpdate/applyUpdate. Versão tem que subir nos 2 lugares a cada publicação.
- **Minha decisão:** manter

### F53 — Segurança da sincronização: pílula, “Verificar com a nuvem”, relógio

*Nuvem e aplicativo · veredito: Manter*

A pílula do topo mostra se está tudo enviado; “Verificar” compara este aparelho com a nuvem lendo direto do servidor; o app mede o relógio contra a hora da internet porque a data de alteração decide quem vence.

- **Minha decisão:** manter

### F54 — Rascunho automático e “sair sem salvar?”

*Cadastro do pregão · veredito: Manter*

Tudo o que você digita nas janelas é guardado como rascunho; se fechar sem salvar o app pergunta e o rascunho volta na próxima vez. Também mostra um aviso no Painel para continuar.

- Evidência: Draft + Guard.
- **Minha decisão:** manter

### F55 — Config: conta, nuvem e versão

*Config e dados · veredito: Manter*

Cartão com e-mail, estado da sincronização, alterações pendentes, relógio, versão do app e botão de atualizar.

- **Minha decisão:** manter

### F56 — Cartão do pregão (conteúdo)

*Guia Pregões · veredito: Manter e enxugar*

Cada cartão mostra número, tipo, status, órgão, cidade, sessão, nº de itens, etiquetas (até 13 tipos: prazo, venci, desclassificação, aguardando resultado, posso ganhar, pós-venda, modelo próprio, parcelada, prejuízo se ganhar só um, observações…), valores e ícones de link. O número de itens é impresso até 3 vezes (versões de PC e de celular escondidas por CSS).

- Sugestão: Reduzir etiquetas repetidas (o carimbo, a faixa e a etiqueta de pós-venda contam a mesma coisa) e imprimir o nº de itens uma vez só.
- **Minha decisão:** manter

## 3 · Útil

### F57 — Nota 0–5, estrelas e rótulo (Excelente … Prejuízo)

*Cálculo e regras · veredito: Fundir com outra*

Dá uma nota ao item pela margem real (0% = 0,5; 15% = 2; 25% = 3; 35% = 4; 50% = 5) com bônus se o lucro em R$ já compensa. Aparece como estrelas no cartão, na guia Itens e na simulação. Hoje existem quatro formas de dizer “vale a pena”: nota/estrelas, selo OK/Abaixo da meta/Inviável, o semáforo Seguro/Atenção/Risco e a cor do bloco.

- Repete / ir para: F06 Bloco de decisão do item (número grande + semáforo)
- Sugestão: Deixar o semáforo (Seguro/Atenção/Risco) como resposta oficial e as estrelas só como complemento visual.
- Evidência: calcItem calcula nota/viab/situacao; decisao() calcula outra classificação.
- **Minha decisão:** fundir

### F58 — Tributos do MEI (DAS) no Painel e na Config

*Painel · veredito: Manter*

DAS mensal (5% do salário mínimo + R$ 1 ICMS e/ou R$ 5 ISS), DAS do ano, imposto sobre vendas e “lucro depois do DAS”.

- **Minha decisão:** fundir

### F59 — Local de entrega próprio do item

*Itens · veredito: Manter*

Item que vai para outro endereço tem km, viagens e pedágio próprios; itens com o mesmo local dividem aquela viagem entre si.

- Nos seus dados: 0 de 158 itens com local de entrega próprio
- **Minha decisão:** manter

### F60 — Plataforma do pregão

*Cadastro do pregão · veredito: Manter*

Onde é a disputa (BLL, Compras.gov.br, Licitanet…). Se estiver vazia, o app reconhece pelo link da proposta. Lembra que você só tem cadastro em duas plataformas.

- Nos seus dados: 11 de 14 pregões com plataforma
- **Minha decisão:** manter

### F61 — Entrega parcelada (aviso com conta de capital de giro)

*Cadastro do pregão · veredito: Manter*

Para registro de preços com pedidos aos poucos: o aviso mostra quanto sai de uma vez, em quantos dias o dinheiro volta e se o seu capital cobre.

- Nos seus dados: 6 de 14 pregões com entrega parcelada
- **Minha decisão:** fundir

### F62 — “Escolher os itens que ganhei” (marcação em lote)

*Itens · veredito: Manter*

Janela com a lista dos itens para marcar vários de uma vez. Faz o mesmo que o botão Venci de cada item, mas é mais rápida em pregão grande.

- **Minha decisão:** manter

### F63 — Valor do vencedor

*Itens · veredito: Manter*

Quanto quem ganhou ofertou. Mostra a diferença para o seu lance e alimenta “Preço de quem ganhou” no Painel (quanto sobraria de margem se você tivesse igualado).

- Nos seus dados: 27 de 158 itens com valor do vencedor
- **Minha decisão:** manter

### F64 — Entrega por item

*Itens · veredito: Fundir com outra*

Cada item ganho pode ter a própria data de entrega; entregando o último, o pregão inteiro vira “entregue”. Existe como botão no cartão do item e também como lista dentro do cartão “Entrega e pagamento”.

- Nos seus dados: 0 de 158 itens com entrega registrada
- Repete / ir para: F17 Pós-venda: empenho → entrega → pagamento
- Sugestão: Manter a regra; deixar a marcação em um só lugar (a lista do cartão de pós-venda).
- **Minha decisão:** fundir — mas aqui, se for várias entregas, muda o piso do lance.

### F65 — Grupo em tela cheia

*Guia Pregões · veredito: Manter*

Clicar no título de um grupo abre só aquele grupo em grade (2 por linha, 3 em tela grande), com botão para voltar a todos.

- **Minha decisão:** manter

### F66 — Guia Itens (só PC)

*Outras guias · veredito: Decidir com dados*

Todos os itens de todos os pregões em blocos simétricos (nº, nome curto, qtd, custo, lance, total, teto, lucro, estrelas, compra), com filtro por pregão. É a única visão que cruza pregões, mas o mesmo item também aparece no detalhe do pregão, em Acompanhar e na Proposta.

- Repete / ir para: F43 Tela de detalhe do pregão
- Sugestão: Decidir se continua: se você usa mais o detalhe do pregão, esta guia vira redundante.
- **Minha decisão:** manter

### F67 — Guia Acompanhar (só PC)

*Outras guias · veredito: Decidir com dados*

Tabela editável só dos itens “Venci” e “Posso ganhar”, agrupados por pregão, com lance, colocação, botão de compra e botão que gera a proposta final. Repete funções de Itens, do detalhe do pregão e das tabelas “Itens que posso ganhar/Colocações” do Painel.

- Repete / ir para: F66 Guia Itens (só PC); F11 Resultado do item: Venci · Não ganhei · Desclassificado; F86 Painel: tabelas “Itens que posso ganhar” e “Itens com colocação”
- Sugestão: Se mantiver, fazer dela o único lugar com tabela de “posso ganhar / colocação” e tirar as duas tabelas do Painel.
- **Minha decisão:** manter

### F68 — Guia Certidões (só PC)

*Outras guias · veredito: Manter*

Botões para os sites onde você baixa cada certidão (federal, FGTS, trabalhista…), com data de emissão e vencimento. Avisa no Painel quando falta pouco para vencer.

- **Minha decisão:** manter

### F69 — Painel: funil das propostas

*Painel · veredito: Manter*

Barras: enviadas → ganhas → entregues → pagas, clicáveis para filtrar a tabela do dashboard.

- **Minha decisão:** manter

### F70 — Painel: de onde vem o preço de venda (rosca)

*Painel · veredito: Manter*

Rosca interativa: custo dos produtos, frete, entrega de carro, impostos e lucro dos pregões ativos. Responde aos filtros e a cliques.

- **Minha decisão:** manter

### F71 — Painel: preço de quem ganhou

*Painel · veredito: Manter*

Mostra, nos itens em que você anotou o valor do vencedor, quantos ficariam abaixo do seu custo, com margem menor ou com sua margem.

- Nos seus dados: 27 de 158 itens com valor do vencedor
- **Minha decisão:** manter

### F72 — Chavinhas do documento (11 grupos, cerca de 40 opções)

*Proposta (PDF) · veredito: Manter e enxugar*

Cada bloco do PDF liga/desliga (cabeçalho, fornecedor, banco, itens, resumo, extenso, observações, declaração, cláusulas, local e data, assinatura), com “Usar como padrão” e “Voltar ao padrão”. Os valores seguem uma cascata de 4 níveis: padrão do app ← padrão seu ← ajuste do pregão ← ajuste da proposta final.

- Nos seus dados: 12 de 14 pregões com ajustes próprios do PDF
- Sugestão: Manter, mas esconder em “Avançado” o que você nunca desliga (veja o uso real em “Uso”).
- **Minha decisão:** enxugar — Esconder em avançado.

### F73 — Cabeçalho (imagem/nome) e marca d’água (texto/imagem)

*Proposta (PDF) · veredito: Manter e enxugar*

Escolhe imagem e posição, tamanho, opacidade e ajuste fino do cabeçalho; marca d’água de texto ou imagem com opacidade, ângulo, tamanho e posição. São 10 controles deslizantes.

- Sugestão: Manter; reduzir controles de ajuste fino (deslocamento horizontal/vertical) se você quase não os usa.
- **Minha decisão:** enxugar

### F74 — Valor por extenso

*Proposta (PDF) · veredito: Manter*

Escreve o valor total em palavras (reais e centavos) no resumo comercial.

- **Minha decisão:** manter

### F75 — Recalcular preços da proposta inicial

*Proposta (PDF) · veredito: Manter*

Libera os preços guardados na primeira geração para a próxima proposta inicial usar os valores atuais.

- **Minha decisão:** manter

### F76 — Recalcular trajeto

*Cadastro do pregão · veredito: Manter*

Botão no pregão e no item para refazer a distância automática depois de mudar a cidade (e aviso de qual rota foi usada).

- **Minha decisão:** manter

### F77 — Excluir pregão/item (lápides)

*Cadastro do pregão · veredito: Decidir com dados*

Excluir marca o registro como deletado (“lápide”) em vez de apagar, para a exclusão chegar aos outros aparelhos. As lápides nunca são limpas: ficam no documento da nuvem para sempre.

- Nos seus dados: 637 de 809 registros excluídos (lápides) guardados
- Sugestão: Criar limpeza de lápides antigas (por exemplo, com mais de 60 dias e já sincronizadas em todos os aparelhos).
- Evidência: removePregao/removeItem + mergeById.
- **Minha decisão:** depois

### F78 — Painel: botões de status

*Painel · veredito: Manter*

Faixa com o número de pregões por status; clicar abre a guia Pregões filtrada.

- **Minha decisão:** manter

### F79 — Limpar desistências (pregões Desisti, itens deixados de fora e lápides)

*Config e dados · veredito: Manter*

Botão na Config: apaga de vez os pregões em Desisti e seus itens, os itens deixados de fora (semLance) dos pregões já enviados com a sessão passada (em Proposta enviada, 2 dias depois), e encolhe as lápides antigas. Excluir agora deixa só uma lápide mínima (id, pregaoId, deleted, datas), para liberar espaço no documento da nuvem.

- **Minha decisão:** manter

## 2 · Pouco usada / decidir

### F80 — Margem própria do item

*Itens · veredito: Decidir com dados*

Permite uma margem diferente da padrão para um item específico. Nos seus dados nenhum item usa; a margem da Config resolve.

- Nos seus dados: 0 de 158 itens com margem própria
- Sugestão: Remover o campo se continuar sem uso.
- **Minha decisão:** depois

### F81 — Marcação “Posso ganhar”

*Itens · veredito: Fundir com outra*

Estrela manual para itens em que você ficou perto do 1º lugar. Faz quase o mesmo que a Colocação (1º a 3º já leva o pregão para “perto de ganhar”) e é a base da guia Acompanhar.

- Nos seus dados: 4 de 158 itens marcados “posso ganhar”
- Repete / ir para: F34 Minha colocação no item
- Sugestão: Usar só a Colocação (1º–3º = posso ganhar) e remover a estrela.
- **Minha decisão:** fundir

### F82 — Campo “Exigências (IE, certidões)” do pregão

*Cadastro do pregão · veredito: Fundir com outra*

Texto livre separado das Observações. Não aparece em nenhum cartão: só no formulário (e a leitura automática do tipo de compra o consulta).

- Nos seus dados: 9 de 14 pregões com o campo Exigências
- Repete / ir para: F37 Observações do pregão
- Sugestão: Juntar às Observações do pregão.
- **Minha decisão:** fundir

### F83 — Barra de filtros por status (acima do quadro)

*Guia Pregões · veredito: Remover*

Botões Todos/Incompleto/Analisando/Enviada/…/Desisti que filtram o quadro. As raias já agrupam por status e o grupo em tela cheia mostra um status só; o Painel também leva à guia já filtrada.

- Repete / ir para: F21 Quadro de pregões por raias (guia Pregões); F65 Grupo em tela cheia
- Sugestão: Remover a barra; manter o clique nos números do Painel (que filtra) ou trocar por abrir o grupo em tela cheia.
- **Minha decisão:** manter

### F84 — Quadro “Dados do pregão” no detalhe

*Guia Pregões · veredito: Remover*

Lista com envio das propostas, local, prazo de entrega, entregas e link do edital. Quase tudo já está no cabeçalho, nas etiquetas ou no formulário.

- Repete / ir para: F43 Tela de detalhe do pregão
- **Minha decisão:** remover

### F85 — Cartão compacto de encerrados (duas versões)

*Guia Pregões · veredito: Fundir com outra*

Há dois desenhos para o pregão encerrado: o cartão pequeno “mini” (guia Itens) e o chip “enc-chip” (guia Pregões, botão Encerrados e concluídos).

- Repete / ir para: F21 Quadro de pregões por raias (guia Pregões)
- Sugestão: Ficar com um só desenho.
- **Minha decisão:** fundir

### F86 — Painel: tabelas “Itens que posso ganhar” e “Itens com colocação”

*Painel · veredito: Fundir com outra*

Duas tabelas do dashboard (PC) com os mesmos itens da guia Acompanhar.

- Repete / ir para: F67 Guia Acompanhar (só PC)
- Sugestão: Manter só em Acompanhar (ou só no Painel).
- **Minha decisão:** fundir

### F87 — Painel: cartão “Resultado das propostas”

*Painel · veredito: Fundir com outra*

Conversão, margem dos ganhos, em aberto e barra ganhos/perdas/aberto. Repete o funil e a “Margem por pregão ganho”.

- Repete / ir para: F69 Painel: funil das propostas
- Sugestão: Levar os três números para o funil e apagar o cartão.
- **Minha decisão:** fundir

### F88 — Painel: cartão “Uso do limite do MEI”

*Painel · veredito: Fundir com outra*

Barra faturado / a faturar / em disputa / livre e duas barras de porcentagem. Repete Limite, Comprometido e Saldo da linha de números do topo.

- Repete / ir para: F16 Limite de faturamento do MEI; F44 Painel: quatro números do topo
- Sugestão: Fundir com a linha de números do topo.
- **Minha decisão:** fundir

### F89 — Painel: cartão “Pregões por status”

*Painel · veredito: Fundir com outra*

Barras com valor por status. Os mesmos números aparecem nos botões coloridos (um por status) e no funil.

- Repete / ir para: F78 Painel: botões de status
- Sugestão: Apagar o cartão; manter os botões do topo.
- **Minha decisão:** fundir

### F90 — Painel: cartão Certidões

*Painel · veredito: Manter e enxugar*

Chips com cada certidão e a validade. A guia Certidões tem o detalhe e as Pendências já avisam quando vence.

- Repete / ir para: F45 Painel: Pendências; F68 Guia Certidões (só PC)
- **Minha decisão:** enxugar

### F91 — Painel: evolução por mês

*Painel · veredito: Decidir com dados*

Gráfico de pregões/valores por mês. Informação de histórico, não de ação.

- **Minha decisão:** depois

### F92 — Painel: margem por pregão ganho

*Painel · veredito: Decidir com dados*

Barras de margem de cada pregão ganho. Útil só quando houver vários ganhos.

- **Minha decisão:** manter

### F93 — Painel: órgãos que mais compram

*Painel · veredito: Decidir com dados*

Ranking de órgãos por valor. Informação de planejamento.

- **Minha decisão:** manter

### F94 — Painel: tabela de pregões filtrados

*Painel · veredito: Fundir com outra*

Lista os pregões que passam nos filtros do dashboard. É outra lista de pregões ao lado do quadro da guia Pregões.

- Repete / ir para: F21 Quadro de pregões por raias (guia Pregões)
- **Minha decisão:** fundir

### F95 — Painel: filtros cruzados (período, etapa, órgão, mês, fatia, posso ganhar, colocação)

*Painel · veredito: Decidir com dados*

Cliques na rosca, no funil, nos meses e nos órgãos filtram o resto do dashboard. Poderoso, mas é preciso saber que existe.

- **Minha decisão:** depois

### F96 — Escolha “qual valor entra na proposta”

*Proposta (PDF) · veredito: Decidir com dados*

Seletor (PC) com 4 opções: lance final (senão teto), sempre o mínimo, sempre o teto, só o lance. Pela regra do app o lance final sempre prevalece e o resto é cortado no teto; as outras opções raramente fazem sentido.

- Nos seus dados: 0 de 1 a opção escolhida hoje não é a automática
- Sugestão: Esconder o seletor se não usa.
- **Minha decisão:** depois

### F97 — Catálogo em Word (.docx) e “só o catálogo (PDF)”

*Proposta (PDF) · veredito: Decidir com dados*

Gera o catálogo isolado em PDF ou em Word (montado “na mão”: XML do Word + zip sem compressão, cerca de 100 linhas).

- Repete / ir para: F51 Catálogo dos produtos (fotos + descrição)
- Sugestão: Manter só se você realmente envia o catálogo em Word.
- **Minha decisão:** depois

### F98 — Botão Compartilhar o PDF

*Proposta (PDF) · veredito: Decidir com dados*

Usa a folha de compartilhamento do celular. Em PC não aparece.

- **Minha decisão:** depois

### F99 — Descritivo/fotos no item E no catálogo da guia Proposta

*Itens · veredito: Decidir com dados*

É o mesmo dado (descritivo + fotos) editável em dois lugares, mais o atalho “Fotos e descrição para o catálogo”. Decisão de 30/10 foi manter as duas opções.

- Repete / ir para: F51 Catálogo dos produtos (fotos + descrição)
- Sugestão: Se um dos lugares quase não for usado, tirar.
- **Minha decisão:** fundir

### F100 — Sugestões de título (MARCA, MODELO, DIMENSÕES…)

*Itens · veredito: Fundir com outra*

Atalhos para inserir “TÍTULO:” no descritivo, que aprendem os mais usados. Existem duas implementações (janela do item e catálogo).

- Repete / ir para: F99 Descritivo/fotos no item E no catálogo da guia Proposta
- Sugestão: Uma implementação só.
- **Minha decisão:** fundir

### F101 — Apagar todos os dados

*Config e dados · veredito: Manter e enxugar*

Botão na Config que apaga pregões e itens (também na nuvem). Útil raramente e perigoso.

- Sugestão: Pedir digitar uma palavra para confirmar.
- **Minha decisão:** manter

### F102 — Botão “Depurar” no topo do app

*Config e dados · veredito: Manter*

Atalho no canto esquerdo do topo (só no PC), na mesma posição do “← Pregões” do Depurador. O Depurador tem o botão “← Pregões” para voltar.

- **Minha decisão:** manter

### F103 — Gancho de depuração (window.__app)

*Código interno · veredito: Manter*

O app expõe store, UI e render para testes e para este depurador.

- Evidência: index.html, fim do script de interface.
- **Minha decisão:** manter

## 1 · Redundante ou morta

### F104 — Campos antigos de compra: onde, ondeLink e “usar”

*Itens · veredito: Remover*

Antes das opções de compra existiam os campos “onde comprar” e o tique “Usar”. Os dados antigos continuam no item e duplicam o link da primeira opção; o código ainda tem ramos para o modelo antigo.

- Nos seus dados: 74 de 158 itens com os campos antigos de compra
- Repete / ir para: F30 Opções de compra (links de lojas)
- Sugestão: Migrar (copiar para a opção 1 quando faltar) e apagar onde/ondeLink/usar. Só os links já ocupam cerca de 33 mil caracteres da nuvem.
- Evidência: comprasDoItem/opcoesParaForm/opcoesUsadas guardam o caminho antigo; OPCOES_SO_LINK nunca é lida.
- **Minha decisão:** remover

### F105 — Compra dividida entre fornecedores (“Comprar aqui”)

*Cálculo e regras · veredito: Remover*

Calculava custo médio quando cada loja levava uma parte da quantidade. O campo foi tirado da tela (ficou oculto) e a decisão de 31/10 é que as opções são só links.

- Nos seus dados: 1 de 216 opções de compra com “comprar aqui”
- Repete / ir para: F30 Opções de compra (links de lojas)
- Sugestão: Remover divisaoCompra e o campo oculto; conferir os poucos itens que ainda têm quantidade em alguma opção.
- Evidência: divisaoCompra + hidden input altNQtd.
- **Minha decisão:** remover

### F106 — Imposto na compra por item (ICMS-ST) e alíquota ICMS

*Cálculo e regras · veredito: Remover*

Campos retirados do formulário. A conta ainda soma o imposto na compra; a alíquota ICMS só alimenta colunas da tabela de especificações (sempre desligada).

- Nos seus dados: 0 de 158 itens com imposto de compra/ICMS
- Sugestão: Remover os dois campos e a conta.
- Evidência: calcItem/compraBase/linhasProposta.
- **Minha decisão:** remover

### F107 — Tabela de especificações técnicas do PDF (11 colunas)

*Proposta (PDF) · veredito: Remover*

Tabela alternativa à lista de itens, com colunas opcionais (código, marca, ICMS…). É sempre desligada por padrão (o detalhamento vai no catálogo) e o campo “código do produto” não tem onde ser digitado.

- Nos seus dados: 1 de 14 pregões com a tabela ligada
- Repete / ir para: F51 Catálogo dos produtos (fotos + descrição)
- Sugestão: Remover tabela, colunas, código e especificações.
- Evidência: resolverPdfOpts força tabela=false.
- **Minha decisão:** remover

### F108 — Três jeitos de escrever declaração na proposta

*Proposta (PDF) · veredito: Fundir com outra*

Declaração de preços (texto único da Config), cláusulas livres e declarações do edital (documentos). Mais quatro opções antigas em Config.proposta (incluir extenso/banco/declaração/local) que o PDF não lê mais.

- Repete / ir para: F50 Cláusulas, {campos} e declarações do edital
- Sugestão: Ficar com cláusulas + declarações do edital e apagar o texto único e os 4 interruptores da Config.
- **Minha decisão:** remover

### F109 — “Calcular cada ida separadamente” (entregas do pregão)

*Cadastro do pregão · veredito: Fundir com outra*

Divide o pregão em várias entregas, cada uma com km/viagens/pedágio e itens próprios. Faz o mesmo que o local de entrega do item, de outra forma. Nenhum dos seus pregões usa.

- Nos seus dados: 0 de 14 pregões com entregas separadas
- Repete / ir para: F59 Local de entrega próprio do item
- Sugestão: Ficar com o local do item.
- **Minha decisão:** remover

### F110 — Intervalo mínimo entre lances

*Cadastro do pregão · veredito: Remover*

Só aparece como linha no quadro de dados; não existe campo para digitar (foi retirado do formulário).

- Nos seus dados: 0 de 14 pregões com intervalo de lances
- Evidência: Texto “Intervalo mín. lances” em renderDetail.
- **Minha decisão:** remover

### F111 — Tirar pregão do Painel (ocultar)

*Painel · veredito: Remover*

O botão “×” só existia no cartão antigo do Painel (que não é mais desenhado). Ficaram os controles “mostrar ocultos / concluídos” sem botão e o campo ocultoPainel, que só ainda esconde da agenda do celular.

- Nos seus dados: 0 de 14 pregões ocultos do painel
- Evidência: Ações mostrar-painel, painel-ocultos, painel-concluidos e ocultar-painel sem botão que as chame.
- **Minha decisão:** remover

### F112 — Cartão antigo do Painel (painelCard e valorPainel)

*Código interno · veredito: Remover*

Funções que desenhavam o cartão do Painel antes da versão 98. Ninguém chama mais, mas o CSS correspondente continua no arquivo.

- Evidência: Nenhuma chamada a painelCard/valorPainel.
- **Minha decisão:** remover

### F113 — Agenda dos pregões no PC (removida na v1.98)

*Painel · veredito: Decidir com dados*

O bloco “Agenda” do Painel no PC saiu quando o Painel virou dashboard; sobraram cerca de 28 classes de CSS (ag-*). A raia “Atenção agora” e as Pendências cobrem o mesmo.

- Sugestão: Decidir: não restaurar (recomendado, já há Atenção agora) ou restaurar uma agenda curta. Em qualquer caso apagar o CSS sobrando.
- Evidência: Classes .ag-* sem uso no HTML ou JS.
- **Minha decisão:** remover

### F114 — Faixa antiga “se ganhar só este” e destaque antigo

*Código interno · veredito: Remover*

As funções soloHtml, destaqueHtml e destaqueInfo (e viabLinha, foraNoFim, copiarTexto) ficaram no arquivo, mas nenhuma tela as chama; o bloco de decisão novo as substituiu.

- Repete / ir para: F06 Bloco de decisão do item (número grande + semáforo); F03 Se ganhar só este item
- Evidência: Nenhuma chamada no código.
- **Minha decisão:** remover

### F115 — Status antigos “Ganhou” e “Em disputa”

*Cadastro do pregão · veredito: Remover*

“Em disputa” já é convertido em Julgamento ao abrir; “Ganhou” ficou como leitura de dados antigos e aparece em listas de ordem e de cores.

- Nos seus dados: 0 de 14 pregões com status antigo
- Sugestão: Converter e tirar das listas.
- Evidência: migrate(), ORDEM_STATUS, COR_STATUS, DASH_PART.
- **Minha decisão:** remover

### F116 — Botões antigos Venci/“Não ganho” (item-venci, item-ganho)

*Itens · veredito: Remover*

Tratadores que ficaram para botões que não existem mais (o seletor Venci/Não ganhei/Desclassif. os substituiu). O campo naoGanhou segue sendo lido para dados antigos.

- Repete / ir para: F11 Resultado do item: Venci · Não ganhei · Desclassificado
- Evidência: Ações sem botão: item-venci, item-ganho.
- **Minha decisão:** remover

### F117 — Escolha antiga de modelo de proposta (pdf-modelo)

*Código interno · veredito: Remover*

Tratador de quando havia modelos “comercial” e “descritivo”. Hoje o modelo é único.

- Evidência: Ação pdf-modelo sem botão; resolverPdfOpts força modelo = unico.
- **Minha decisão:** remover

### F118 — Caminho antigo de sincronização (pull/push) e flags nunca lidos

*Código interno · veredito: Remover*

A sincronização tem dois caminhos: o atômico (transação, o único usado) e um pull+push antigo que nenhum adaptador alimenta. Também sobram: lastSync/changedSince para o caminho antigo, a flag kmAuto (só gravada) e a constante OPCOES_SO_LINK.

- Evidência: adaptadorFirebase só implementa sync().
- **Minha decisão:** remover

### F119 — Dados de exemplo e tela de boas-vindas

*Config e dados · veredito: Remover*

Cria pregões de mentira para testar. O app já está em uso real; os exemplos só ocupam código e confundem a tela vazia.

- Evidência: demoState, mergeDemo, emptyWelcome.
- **Minha decisão:** remover
