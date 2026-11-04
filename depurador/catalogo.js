/* Catálogo de funcionalidades do Meus Pregões (usado pelo depurador e pelo relatório).
 * COMO MANTER: ao criar, mudar ou tirar uma função do app, ajuste a entrada correspondente aqui (regra no CLAUDE.md).
 * Campos: k (chave fixa), area, imp (5 essencial · 4 importante · 3 útil · 2 pouco usada · 1 redundante/morta),
 *   v (manter · enxugar · fundir · revisar · remover), nome, faz (o que é, em português simples),
 *   red (chaves das funções que ela repete: "vá para lá"), para (para onde direcionar / o que fazer),
 *   ev (evidência fixa encontrada no código), sel (seletores CSS para achar na tela), probe (contagem nos seus dados), prot (função protegida). */
(function (root) {
  'use strict';
  const L = [];
  const F = (k, area, imp, v, nome, faz, o) => L.push(Object.assign({ k, area, imp, v, nome, faz }, o || {}));

  const AR = {
    calc: 'Cálculo e regras', preg: 'Cadastro do pregão', item: 'Itens', pain: 'Painel', quad: 'Guia Pregões', outr: 'Outras guias',
    pdf: 'Proposta (PDF)', conf: 'Config e dados', sync: 'Nuvem e aplicativo', cod: 'Código interno',
  };

  /* ================= 5 · ESSENCIAIS (sem isto o app não serve) ================= */
  F('lance-minimo', AR.calc, 5, 'manter', 'Lance mínimo do item',
    `É o menor preço unitário que ainda dá a sua margem. O app soma o custo de compra, o frete do fornecedor e a parte da viagem que cabe ao item, divide pela quantidade e aplica a margem alvo (padrão da Config): mínimo = custo unitário ÷ (1 − margem − imposto), sempre arredondado para cima em centavos. Aparece no cartão, na janela do item, na guia Itens e na simulação.`,
    { prot: true, sel: ['.dec-min', '.v-min', '.dec-big'], ev: 'Função calcItem (núcleo). Tudo o que fala de “mínimo” nasce aqui.' });
  F('rateio-viagem', AR.calc, 5, 'manter', 'Custo da viagem e rateio entre os itens',
    `Calcula a viagem (km ÷ consumo × combustível + km × desgaste + pedágio) × número de viagens e reparte entre os itens do pregão na proporção do valor da compra de cada um. Quando já existe item ganho, só os ganhos entram no rateio: perdidos e “aguardando” saem da conta, para a viagem não ficar barata demais ou o orçamento inflado.`,
    { prot: true, ev: 'computeAll + custoViagem. Config › Margem e entrega de carro alimenta (consumo, combustível, desgaste).' });
  F('solo', AR.calc, 5, 'manter', 'Se ganhar só este item',
    `Simula o pior caso: este é o único item que você ganha, então a viagem inteira fica nele. Mostra o lance sem prejuízo (“empate”), o lance com a margem, o lucro no seu lance e o valor da viagem. Existe para você nunca dar um lance que vira prejuízo se os outros itens não saírem.`,
    { prot: true, sel: ['.dec-solo', '.solo'], ev: 'calcSozinho → c.solo. Alimenta o aviso de lance baixo e a etiqueta “N itens dão prejuízo se ganhar só eles”.' });
  F('teto-regra', AR.calc, 5, 'manter', 'Regras do teto do edital',
    `Lance acima do teto desclassifica; o mínimo nunca passa do teto (aparece “Não compensa”); a proposta sem lance sai com o teto e o que passar do teto é cortado nele. Evita erro caro por digitação.`,
    { prot: true, sel: ['.neg-tx', '.dec.bad'], ev: 'unitProposta, decisao() e linhasProposta aplicam a mesma regra.' });
  F('aviso-lance-baixo', AR.calc, 5, 'manter', 'Aviso e confirmação de lance abaixo do mínimo',
    `Se o lance fica abaixo do mínimo “sem prejuízo se ganhar só este”, o campo fica vermelho e o app pede confirmação antes de salvar ou gravar. É a trava contra prejuízo no começo do projeto.`,
    { prot: true, sel: ['.solo-baixo', '.solo-alerta'], ev: 'abaixoSolo/avisoSoloTxt. Cobre janela do item, simulador e cartão.' });
  F('destaque-decisao', AR.calc, 5, 'manter', 'Bloco de decisão do item (número grande + semáforo)',
    `O quadro colorido do item: com lance mostra “Meu lucro no lance”; sem lance mostra “Valor mínimo p/ proposta”. Verde/âmbar/vermelho diz se está Seguro, em Atenção ou em Risco, e as colunas mostram lance mínimo, lucro ganhando só este e lucro junto com os outros.`,
    { prot: true, sel: ['.dec', '.dec-big', '.dec-cols'], ev: 'decisaoHtml. É o “destaque” que o João pediu para nunca mais perder.' });
  F('custo-frete', AR.item, 5, 'manter', 'Custo unitário e frete do item (sempre digitados)',
    `Os dois números que você digita depois de cotar: custo por unidade e frete do fornecedor (total do item). Nunca ficam travados, e as opções de compra não mexem neles. Todo o resto do app parte daqui.`,
    { prot: true, sel: ['[name=custo]', '[name=frete]'] });
  F('item-form', AR.item, 5, 'manter', 'Janela de edição do item',
    `Formulário em tela cheia no PC (prévia fixa à esquerda, campos em 4 colunas): pregão, lote/item, nome, “Exigido no edital”, marca/modelo, descritivo ofertado, quantidade, unidade, custo, frete, teto, lance final, opções de compra, observações, colocação, vencedor. No PC o resumo, o lance final e o valor do vencedor ficam na coluna da esquerda; em tela dividida (900–1199 px) a coluna fica estreita.`,
    { sel: ['.sheet-wide', '[data-act=editar-item]'] });
  F('desc-edital', AR.item, 5, 'enxugar', '“Exigido no edital” (cópia fiel do edital)',
    `Texto do item copiado do edital/TR sem resumir. Sai no PDF como “Exigido no edital” e é o que você confere ao revisar a cotação. Importante, mas é o campo que mais ocupa espaço na nuvem (cerca de 16% do documento de sincronização).`,
    { probe: 'descEdital', para: 'Manter para pregões ativos; para pregões Desisti, arquivar o texto fora do documento sincronizado (ver “Limite de 1 MB da nuvem”).', ev: 'Campo descEdital: maior campo de texto dos itens.', sel: ['[name=descEdital]'] });
  F('fora-disputa', AR.item, 5, 'manter', 'Item “Fora da disputa” (sem lance)',
    `Marca o item que você analisou mas não vai disputar (sem margem, ANVISA, grande demais…). Ele fica visível com o motivo na observação, mas não entra em nenhuma conta. Seguindo a regra do João, todos os itens do edital entram no app; os descartados ficam assim.`,
    { probe: 'foraDisputa', sel: ['.icard.fora', '[data-act=item-fora]'], ev: 'Campo semLance.' });
  F('resultado-item', AR.item, 5, 'manter', 'Resultado do item: Venci · Não ganhei · Desclassificado',
    `Três botões no cartão do item registram o resultado da sessão. “Venci” coloca o item nas contas e liga o fluxo empenho → entrega → pagamento; “Desclassif.” guarda a data e o motivo e destaca o pregão com “Rever”.`,
    { probe: 'ganhou', sel: ['.res-sel', '[data-act=item-res]'], red: [], ev: 'definirResultado/marcarGanho/pedirDesclassificacao.' });
  F('lance-final', AR.item, 5, 'enxugar', 'Lance final (o valor que vai na proposta)',
    `Se você preencher o lance final, ele manda em tudo: proposta inicial, final, painel e avisos. Vazio = vale o teto do edital. Hoje existe em 5 lugares: janela do item, tabela da guia Acompanhar, “Meu lance” da guia Proposta no celular, o simulador (que grava com 2 confirmações) e a tela de confirmação de preços da proposta final.`,
    { probe: 'lanceFinal', para: 'Manter o campo; usar um único componente de lance em todas as telas para o comportamento (aviso de mínimo/teto) ser idêntico.', sel: ['[name=lanceFinal]', '[data-acomp-lance]', '[data-pm-lance]', '[data-sim]'] });
  F('pdf-inicial-final', AR.pdf, 5, 'manter', 'Proposta inicial e proposta final',
    `Inicial: todos os itens da disputa; na primeira geração os preços ficam guardados (precoInicial), assim ela sai sempre igual. Final (readequada): só os itens vencidos, com tela de confirmação do preço de cada item; os ajustes dela não viram padrão e não mexem na inicial.`,
    { probe: 'precoInicial', sel: ['.pdf-tipo', '[data-act=pdf-tipo]'], ev: 'linhasProposta(tipo).' });
  F('pdf-anonima', AR.pdf, 5, 'manter', 'Proposta sem identificação do licitante',
    `Para edital que proíbe identificar a empresa na proposta inicial: some nome, CNPJ, cabeçalho, banco, assinatura e declarações; depois de gerar, o app confere se algum dado da empresa vazou no PDF.`,
    { probe: 'anonima', sel: ['[data-pdf*="anonima"]'], ev: 'gerarProposta confere o texto do PDF gerado.' });
  F('pdf-bloqueio-oferta', AR.pdf, 5, 'manter', 'Bloqueio: não gera proposta sem marca, modelo e descritivo',
    `A proposta não sai enquanto algum item estiver sem marca, sem modelo ou sem o descritivo do item ofertado, ou quando a marca/modelo do item diferir do que está escrito no descritivo (MARCA:/MODELO:). Protege contra desclassificação por proposta incompleta.`,
    { sel: ['#gerarCard .alert.bad'], ev: 'faltasOferta + pendenciasModelo.' });
  F('limite-mei', AR.calc, 5, 'enxugar', 'Limite de faturamento do MEI',
    `Compara o que já foi faturado e o que está ganho com o limite anual (cheio ou proporcional ao mês de abertura) e avisa se ganhar tudo estoura. Essencial para MEI. Hoje aparece em dois cartões do Painel: a linha de números do topo e o cartão “Uso do limite do MEI”.`,
    { red: [], para: 'Manter o cálculo; mostrar uma vez só no Painel (veja “Uso do limite do MEI”).', sel: ['.p-kpis'] });
  F('pos-venda', AR.preg, 5, 'enxugar', 'Pós-venda: empenho → entrega → pagamento',
    `Depois de ganhar você registra o empenho, o prazo de entrega, a entrega e o recebimento. O app calcula prazos, avisa atraso, mostra o carimbo “Empenho / Entregar / Parcial / Receber / Pago” no cartão e lista “Entregas e recebimentos” no Painel. Ainda sem uso nos seus dados (você acabou de ganhar o primeiro), mas é o coração de depois da vitória.`,
    { probe: 'posVenda', sel: ['.psteps', '.selo-st'], para: 'Manter. Quando houver uso real, avaliar juntar “Entrega por item” (hoje em dois lugares) e o carimbo provisório com as etiquetas de texto.' });
  F('km-obrigatorio', AR.preg, 5, 'manter', 'Km da entrega obrigatório + cálculo automático pela cidade',
    `Pregão e item não salvam sem km (sem ele a viagem não entra no custo e o “se ganhar só este” fica errado). O app calcula sozinho a distância ida-e-volta pelo OpenStreetMap (Nominatim + OSRM) a partir do endereço da empresa, quando há internet.`,
    { prot: true, probe: 'kmFalta', ev: 'Rota.calcular + AutoKm. Depende de dois serviços externos gratuitos (podem falhar: então digita o km).', sel: ['[name=km]', '[data-rota=calc]'] });
  F('prazo-semaforo', AR.preg, 5, 'manter', 'Semáforo do prazo de propostas',
    `Mostra quanto falta para o fim do envio das propostas: amarelo com 2 dias, vermelho com 1 dia ou menos, “encerrado” depois. Só avisa enquanto o pregão está Incompleto ou Analisando.`,
    { sel: ['.prazo.warn', '.prazo.bad'], ev: 'prazoInfo.' });
  F('pregao-form', AR.preg, 5, 'manter', 'Cadastro e edição do pregão',
    `Janela com número, órgão, status, plataforma, tipo de compra, cidade/UF, links (edital, enviar proposta, licitação, modelo), prazo de propostas, sessão, observações, entrega e pagamento, modelo próprio, entrega parcelada e entrega de carro (km, viagens, pedágio). Rascunho automático e trava de número (só dígitos e . - /).`,
    { sel: ['[data-act=editar-pregao]', '[data-act=novo-pregao]'] });
  F('cartao-quadro', AR.quad, 5, 'enxugar', 'Quadro de pregões por raias (guia Pregões)',
    `É a tela principal de trabalho: colunas por importância — Atenção agora (vermelha), Julgamento, Venci 🏆, Enviadas, Analisando, Incompletos — com encerrados/concluídos num botão só. No celular uma coluna por vez; no PC as colunas cabem na tela e rolam por dentro.`,
    { sel: ['.pq-board', '.pq-col'], para: 'Manter. A barra de filtros por status acima do quadro repete as raias (ver “Filtros por status”).' });
  F('atencao-agora', AR.quad, 5, 'manter', 'Raia “Atenção agora” e alertas do cartão',
    `Junta o que não pode esperar: pregão hoje, proposta vencendo em até 1 dia, entrega ou pagamento atrasado, sessão que passou sem resultado. Cada cartão ganha uma faixa de alerta colorida e a borda muda de cor conforme a urgência.`,
    { sel: ['.p-alert', '.al-bad', '.al-warn'], ev: 'alertaPregao.' });
  F('config-negocio', AR.conf, 5, 'manter', 'Config: margem, carro, MEI e tributos',
    `Margem padrão, lucro que “já compensa”, consumo, combustível, desgaste, capital de giro, limite do MEI, ano/mês de abertura, faturamento fora do app, salário mínimo, atividade (ICMS/ISS) e imposto sobre a venda (0 para MEI). Todo o cálculo depende destes números.`,
    { sel: ['[data-cfg=margemPadrao]'] });
  F('config-empresa', AR.conf, 5, 'manter', 'Config: dados da empresa e do titular',
    `Nome, CNPJ, IE, endereço, contatos, titular, RG, estado civil e dados bancários. Alimentam cabeçalho, declarações e o endereço de partida do cálculo de km. Ficam só no aparelho/nuvem privada: o repositório é público e não guarda nada disso.`,
    { sel: ['[data-cfg="empresa.nome"]'] });
  F('backup-importar', AR.conf, 5, 'manter', 'Exportar e importar (Mesclar / Substituir)',
    `Exporta tudo em JSON e importa o JSON da análise feita com o Claude: “Mesclar” atualiza campo a campo o que for mais novo e preserva o que o arquivo não traz (fotos, descritivo, lance final, preços guardados). É o elo entre a análise de edital e o app.`,
    { sel: ['[data-act=export]', '[data-import]'], ev: 'importarBackup + completarComLocal.' });
  F('nuvem-sync', AR.sync, 5, 'manter', 'Login e sincronização na nuvem (Firebase)',
    `Entra com e-mail e senha e mantém PC e celular iguais: sempre puxa o servidor primeiro, mescla por data de alteração (o registro mais novo vence; exclusões viram “lápides”) e só então envia, dentro de uma transação. Escuta mudanças ao vivo e tenta de novo sozinho se cair a internet.`,
    { sel: ['#pill'], ev: 'Sync.run + adaptadorFirebase.sync (mesclarNaNuvem).' });
  F('espaco-nuvem', AR.sync, 5, 'revisar', 'Limite de 1 MB do documento da nuvem',
    `Todos os pregões e itens vivem num único documento do Firestore, que aceita no máximo 1 MB. O app trava a sincronização com erro acima de 950 mil caracteres. Na sua cópia de 31/10 já estava em cerca de 86% desse limite, e quase metade do espaço são itens de pregões em que você desistiu. Veja o painel “Saúde › Espaço na nuvem”.`,
    { probe: 'espaco', para: 'Antes de analisar mais editais: arquivar os itens dos pregões Desisti fora do documento sincronizado (ou limpar texto longo), apagar lápides antigas e remover campos legados duplicados (ondeLink).', ev: 'adaptadorFirebase.sync lança erro acima de 950.000 caracteres.' });

  /* ================= 4 · IMPORTANTES ================= */
  F('posso-baixar', AR.calc, 4, 'manter', '“Posso baixar do teto até o mínimo” e “Lucro”',
    `Duas linhas no cartão e na janela do item: quanto dá para baixar do teto (em R$ e %) até o mínimo, e o lucro no lance (ou pelo teto, se não há lance). Servem na hora de dar lance.`,
    { prot: true, sel: ['.i-fin2'] });
  F('pacote', AR.item, 4, 'manter', 'Preço de pacote (“unidades no anúncio”)',
    `Se o anúncio é de um pacote (ex.: 10 un.), o app compra em pacotes inteiros e calcula o custo por unidade (20 un. com anúncio de 10 = 2 anúncios). Avisa “o anúncio é de um pacote?” quando o preço passa do teto.`,
    { probe: 'emb', sel: ['[name$=Emb]', '.alt-pac'] });
  F('opcoes-compra', AR.item, 4, 'manter', 'Opções de compra (links de lojas)',
    `Até 8 opções por item: link direto, loja, preço do anúncio e frete. São só links para você abrir quando quiser (cesta + lápis); não alteram custo nem frete. A prévia compara o total de cada uma e marca a mais barata.`,
    { probe: 'opcoes', sel: ['.altpar', '.altplus', '.altcomp'] });
  F('botao-comprar', AR.item, 4, 'enxugar', 'Botões de compra com o nome da loja',
    `Mostra a cesta com o nome do site no cartão do item, no catálogo, no formulário, na tabela da guia Acompanhar (“$”) e na confirmação de preços. Feito em 4 lugares com código parecido.`,
    { para: 'Manter a função; gerar o botão sempre pela mesma rotina (comprasDoItem) e padronizar o visual.', sel: ['.comprar-btn', '.buy', '.cat-buy'] });
  F('marca-modelo', AR.item, 4, 'enxugar', 'Marca, modelo e descritivo ofertado',
    `Campos digitados por você (o app nunca preenche). Se o descritivo traz “MARCA:” e “MODELO:”, o app copia para os campos marca/modelo para nunca sair diferente. O PDF mostra “Exigido no edital” e o “Descritivo do item ofertado” em texto corrido.`,
    { probe: 'catalogoDesc', sel: ['[name=marca]', '[name=catalogoDesc]'], ev: 'marcaModeloDoTexto + onInput do item.' });
  F('revisar', AR.item, 4, 'manter', 'Alerta “Revisar” por item',
    `Campo com o motivo (ex.: custo estimado). Vira faixa âmbar no cartão, selo na guia Itens, etiqueta “N itens para revisar” no pregão e linha nas pendências do Painel; “Revisado” limpa. Serve para a análise apontar o que precisa do seu olho.`,
    { probe: 'revisar', sel: ['.rev-item', '[data-act=item-revisado]'] });
  F('colocacao', AR.item, 4, 'manter', 'Minha colocação no item',
    `Depois da sessão você anota em que lugar ficou (1º, 2º…). Leva o pregão para “perto de ganhar” (até o 3º) e alimenta a lista “Colocações” no Painel.`,
    { probe: 'colocacao', sel: ['.coloc-in', '[data-coloc]'] });
  F('simulador-lance', AR.item, 4, 'manter', 'Simulador de lance',
    `Caixa no item de pregão em disputa: digite um valor e veja na hora total, lucro, margem, nota e se fica abaixo do mínimo ou acima do teto, sem salvar nada. Só grava com 2 confirmações. Útil durante a sessão.`,
    { sel: ['.sim', '[data-sim]'], ev: 'simCalc/simResHtml/gravarLanceSimulado.' });
  F('modelo-proprio', AR.preg, 4, 'manter', 'Edital com modelo próprio de proposta',
    `Chavinha + link do modelo no pregão. Avisa no cartão, no topo do pregão e na guia Proposta que o órgão exige formato próprio, para você não usar o modelo padrão por engano.`,
    { probe: 'modeloProprio', sel: ['[name=modeloProprio]'] });
  F('obs-pregao', AR.preg, 4, 'manter', 'Observações do pregão',
    `Anotações livres (amostra, atestado, ligar para o pregoeiro). Aparecem em destaque no cartão, no topo do pregão e na guia Proposta.`,
    { probe: 'obsPregao', sel: ['.obsline', '.obstxt'] });
  F('tipo-compra', AR.preg, 4, 'revisar', 'Tipo de compra: Registro de preços (SRP) ou Aquisição',
    `Selo no cartão e seletor no pregão. SRP gera ata e pedidos ao longo do tempo; Aquisição é compra direta. Se o campo está vazio, o app tenta adivinhar lendo “registro de preços/SRP” nas observações e exigências.`,
    { probe: 'tipoCompra', para: 'Manter o campo. Decidir se a adivinhação por texto (tipoCompraDe) continua: ela pode contradizer o que você escolheu e a regra diz para não usar observações.', sel: ['.tipo-chip', '[name=tipoCompra]'] });
  F('sessao-passou', AR.quad, 4, 'manter', 'Sessão que passou de um dia para outro',
    `Pregão “Proposta enviada” cuja sessão já passou vai para Atenção agora com 3 botões: “Continua amanhã”, “Mais dias” e “Encerrou” (vira Julgamento). A pergunta some quando a data fica no futuro.`,
    { sel: ['.p-ask', '[data-act=sessao-continua]'] });
  F('selo-venci', AR.quad, 4, 'enxugar', 'Selo-carimbo e raia “Venci 🏆”',
    `Reúne pregões com item ganho. O carimbo no canto do cartão acompanha a etapa: Julgamento → Empenho → Entregar → Parcial → Receber → Pago (marcado como provisório no CLAUDE.md). O mesmo estado também aparece como etiqueta de texto e como faixa de alerta.`,
    { sel: ['.selo-st'], red: [], para: 'Quando fechar o desenho, manter só o carimbo e a etiqueta de texto do detalhe; tirar a repetição na faixa de alerta.' });
  F('voltar-cartao', AR.quad, 4, 'manter', 'Voltar ao cartão em que estava',
    `Abrir um pregão e voltar devolve a mesma tela (grupo em tela cheia ou quadro), já rolada até o cartão, com um destaque rápido. Você pediu para nunca mais ter que procurar.`,
    { ev: 'UI.lastCard (CLAUDE.md §7).' });
  F('busca', AR.quad, 4, 'manter', 'Busca de pregões e de itens',
    `Campo de busca por número, órgão, cidade ou nome do item (guia Pregões) e por item, marca ou órgão (guia Itens).`,
    { sel: ['#busca', '#buscaI'] });
  F('detalhe-pregao', AR.quad, 4, 'enxugar', 'Tela de detalhe do pregão',
    `Cabeçalho com links, “Atenção neste edital”, status e tipo, cartão de pós-venda, itens ganhos, quatro números (venda, custo, lucro, margem real), lista de itens e dados do pregão. Os seletores de status e tipo repetem os campos do formulário e o quadro “Dados do pregão” repete o que está no formulário.`,
    { sel: ['.hero', '.st-tipo'], para: 'Manter. Tirar o quadro “Dados do pregão” (repete o formulário) ou deixar só o que não está no cabeçalho.' });
  F('painel-kpis', AR.pain, 4, 'manter', 'Painel: quatro números do topo',
    `Limite do MEI, comprometido, saldo disponível e lucro previsto (ganho e em disputa). Resposta rápida a “posso arriscar mais?”.`,
    { sel: ['.p-kpis'] });
  F('painel-pendencias', AR.pain, 4, 'manter', 'Painel: Pendências',
    `Lista única do que pede ação: completar dados, enviar proposta, informar km, revisar itens, cadastrar itens, registrar resultado, completar catálogo e certidões vencendo. É a lista que deveria ser a “fonte única” do que fazer.`,
    { sel: ['.pend-lista', '.posrow'], ev: 'painelPendenciasHtml.' });
  F('painel-entregas', AR.pain, 4, 'manter', 'Painel: Entregas e recebimentos',
    `Pregões ganhos a entregar ou a receber, ordenados por urgência, com os totais “a entregar” e “a receber”.`,
    { sel: ['.possum'] });
  F('agenda-mobile', AR.pain, 4, 'manter', 'Agenda do celular (hoje, amanhã, próximos)',
    `Cartão no topo do Painel só no celular: o que acontece hoje, amanhã e nos próximos dias, mais os ganhos com botão “Proposta”. Foi pensado para o uso rápido no iPhone.`,
    { sel: ['.agm'] });
  F('capital-giro', AR.pain, 4, 'manter', 'Capital de giro (cartão do Painel + aviso por pregão)',
    `Mostra quanto dinheiro sai antes de receber (pior caso: pedirem tudo de uma vez) e compara com o capital informado na Config. No pregão de entrega parcelada repete a conta só para aquele pregão.`,
    { sel: ['.card .meter'], para: 'Manter; o aviso por pregão e o cartão geral respondem a perguntas diferentes.' });
  F('proposta-mobile', AR.pdf, 4, 'manter', 'Proposta no celular (modo rápido)',
    `Escolhe o pregão, mostra inicial/final e os itens como cartões com “Meu lance” (vazio = teto) e o botão Gerar PDF; esconde as opções do documento. O PDF sai com as configurações feitas no PC.`,
    { sel: ['.pdfm', '[data-pm-lance]'] });
  F('pdf-modelo-campos', AR.pdf, 4, 'enxugar', 'Cláusulas, {campos} e declarações do edital',
    `Textos com {razao}, {cnpj}, {rg}… são preenchidos com os dados da Config; falta algum, o app avisa onde preencher. Há cláusulas livres e “declarações do edital” (cada uma em página própria, com data e assinatura).`,
    { probe: 'docsEdital', sel: ['#acc-bl', '#acc-docs'], red: [] });
  F('pdf-catalogo', AR.pdf, 4, 'enxugar', 'Catálogo dos produtos (fotos + descrição)',
    `Para o pregoeiro confrontar o edital com o que você oferece: por item, o que o edital exige, marca/modelo, sua descrição detalhada e até 4 fotos. As fotos ficam no aparelho (IndexedDB) e vão reduzidas para a nuvem, uma coleção por item.`,
    { probe: 'fotos', sel: ['#catCard', '.cat-item'], ev: 'CatImg/enviarFotos/preencherFotosCatalogo.' });
  F('pwa-atualizacao', AR.sync, 4, 'manter', 'Aplicativo instalável + atualização automática',
    `Service worker “servidor primeiro” (sempre baixa a versão nova e só usa cópia guardada se estiver sem internet), faixa de “nova versão”, botão “Buscar atualização” e instalação na tela inicial.`,
    { ev: 'sw.js + checkUpdate/applyUpdate. Versão tem que subir nos 2 lugares a cada publicação.' });
  F('sync-seguranca', AR.sync, 4, 'manter', 'Segurança da sincronização: pílula, “Verificar com a nuvem”, relógio',
    `A pílula do topo mostra se está tudo enviado; “Verificar” compara este aparelho com a nuvem lendo direto do servidor; o app mede o relógio contra a hora da internet porque a data de alteração decide quem vence.`,
    { sel: ['#pill', '[data-act=sync-verificar]'] });
  F('rascunho', AR.preg, 4, 'manter', 'Rascunho automático e “sair sem salvar?”',
    `Tudo o que você digita nas janelas é guardado como rascunho; se fechar sem salvar o app pergunta e o rascunho volta na próxima vez. Também mostra um aviso no Painel para continuar.`,
    { sel: ['.draftbar'], ev: 'Draft + Guard.' });
  F('config-nuvem', AR.conf, 4, 'manter', 'Config: conta, nuvem e versão',
    `Cartão com e-mail, estado da sincronização, alterações pendentes, relógio, versão do app e botão de atualizar.`, { sel: ['[data-act=nuvem-entrar]', '[data-act=atualizar]'] });
  F('cartao-pregao', AR.quad, 4, 'enxugar', 'Cartão do pregão (conteúdo)',
    `Cada cartão mostra número, tipo, status, órgão, cidade, sessão, nº de itens, etiquetas (até 13 tipos: prazo, venci, desclassificação, aguardando resultado, posso ganhar, pós-venda, modelo próprio, parcelada, prejuízo se ganhar só um, observações…), valores e ícones de link. O número de itens é impresso até 3 vezes (versões de PC e de celular escondidas por CSS).`,
    { sel: ['.pcard', '.p-tags'], para: 'Reduzir etiquetas repetidas (o carimbo, a faixa e a etiqueta de pós-venda contam a mesma coisa) e imprimir o nº de itens uma vez só.' });

  /* ================= 3 · ÚTEIS ================= */
  F('nota-estrelas', AR.calc, 3, 'fundir', 'Nota 0–5, estrelas e rótulo (Excelente … Prejuízo)',
    `Dá uma nota ao item pela margem real (0% = 0,5; 15% = 2; 25% = 3; 35% = 4; 50% = 5) com bônus se o lucro em R$ já compensa. Aparece como estrelas no cartão, na guia Itens e na simulação. Hoje existem quatro formas de dizer “vale a pena”: nota/estrelas, selo OK/Abaixo da meta/Inviável, o semáforo Seguro/Atenção/Risco e a cor do bloco.`,
    { red: ['destaque-decisao'], para: 'Deixar o semáforo (Seguro/Atenção/Risco) como resposta oficial e as estrelas só como complemento visual.', sel: ['.stars', '.st-one'], ev: 'calcItem calcula nota/viab/situacao; decisao() calcula outra classificação.' });
  F('das-tributos', AR.pain, 3, 'manter', 'Tributos do MEI (DAS) no Painel e na Config',
    `DAS mensal (5% do salário mínimo + R$ 1 ICMS e/ou R$ 5 ISS), DAS do ano, imposto sobre vendas e “lucro depois do DAS”.`, { sel: ['.trib'] });
  F('local-item', AR.item, 3, 'manter', 'Local de entrega próprio do item',
    `Item que vai para outro endereço tem km, viagens e pedágio próprios; itens com o mesmo local dividem aquela viagem entre si.`, { probe: 'localItem', sel: ['[name=localEntrega]', '#boxLocalItem'] });
  F('plataforma', AR.preg, 3, 'manter', 'Plataforma do pregão',
    `Onde é a disputa (BLL, Compras.gov.br, Licitanet…). Se estiver vazia, o app reconhece pelo link da proposta. Lembra que você só tem cadastro em duas plataformas.`, { probe: 'plataforma', sel: ['[name=plataforma]', '.pgc-plat'] });
  F('entrega-parcelada', AR.preg, 3, 'manter', 'Entrega parcelada (aviso com conta de capital de giro)',
    `Para registro de preços com pedidos aos poucos: o aviso mostra quanto sai de uma vez, em quantos dias o dinheiro volta e se o seu capital cobre.`, { probe: 'entregaParcelada', sel: ['[name=entregaParcelada]'] });
  F('marcar-ganhos-lote', AR.item, 3, 'manter', '“Escolher os itens que ganhei” (marcação em lote)',
    `Janela com a lista dos itens para marcar vários de uma vez. Faz o mesmo que o botão Venci de cada item, mas é mais rápida em pregão grande.`, { sel: ['[data-act=itens-ganhos]'], red: [] });
  F('vencedor', AR.item, 3, 'manter', 'Valor do vencedor',
    `Quanto quem ganhou ofertou. Mostra a diferença para o seu lance e alimenta “Preço de quem ganhou” no Painel (quanto sobraria de margem se você tivesse igualado).`, { probe: 'vencedor', sel: ['[name=vencedor]', '.vrow'] });
  F('entrega-por-item', AR.item, 3, 'fundir', 'Entrega por item',
    `Cada item ganho pode ter a própria data de entrega; entregando o último, o pregão inteiro vira “entregue”. Existe como botão no cartão do item e também como lista dentro do cartão “Entrega e pagamento”.`,
    { probe: 'entregaItem', red: ['pos-venda'], para: 'Manter a regra; deixar a marcação em um só lugar (a lista do cartão de pós-venda).', sel: ['[data-act=item-entregue]', '.ent-itens'] });
  F('grupo-tela-cheia', AR.quad, 3, 'manter', 'Grupo em tela cheia',
    `Clicar no título de um grupo abre só aquele grupo em grade (2 por linha, 3 em tela grande), com botão para voltar a todos.`, { sel: ['.lane-head', '.pq-full'] });
  F('guia-itens', AR.outr, 3, 'revisar', 'Guia Itens (só PC)',
    `Todos os itens de todos os pregões em blocos simétricos (nº, nome curto, qtd, custo, lance, total, teto, lucro, estrelas, compra), com filtro por pregão. É a única visão que cruza pregões, mas o mesmo item também aparece no detalhe do pregão, em Acompanhar e na Proposta.`,
    { red: ['detalhe-pregao'], para: 'Decidir se continua: se você usa mais o detalhe do pregão, esta guia vira redundante.', sel: ['.ibox', '#ilist'] });
  F('acompanhar', AR.outr, 3, 'revisar', 'Guia Acompanhar (só PC)',
    `Tabela editável só dos itens “Venci” e “Posso ganhar”, agrupados por pregão, com lance, colocação, botão de compra e botão que gera a proposta final. Repete funções de Itens, do detalhe do pregão e das tabelas “Itens que posso ganhar/Colocações” do Painel.`,
    { red: ['guia-itens', 'resultado-item', 'painel-itens'], para: 'Se mantiver, fazer dela o único lugar com tabela de “posso ganhar / colocação” e tirar as duas tabelas do Painel.', sel: ['.acp-tbl', '.acp-kpis'] });
  F('certidoes-guia', AR.outr, 3, 'manter', 'Guia Certidões (só PC)',
    `Botões para os sites onde você baixa cada certidão (federal, FGTS, trabalhista…), com data de emissão e vencimento. Avisa no Painel quando falta pouco para vencer.`, { sel: ['.cert-list', '.cert-row'] });
  F('painel-funil', AR.pain, 3, 'manter', 'Painel: funil das propostas',
    `Barras: enviadas → ganhas → entregues → pagas, clicáveis para filtrar a tabela do dashboard.`, { sel: ['.dash-top'] });
  F('painel-composicao', AR.pain, 3, 'manter', 'Painel: de onde vem o preço de venda (rosca)',
    `Rosca interativa: custo dos produtos, frete, entrega de carro, impostos e lucro dos pregões ativos. Responde aos filtros e a cliques.`, { sel: ['.dash svg circle'] });
  F('painel-vencedor', AR.pain, 3, 'manter', 'Painel: preço de quem ganhou',
    `Mostra, nos itens em que você anotou o valor do vencedor, quantos ficariam abaixo do seu custo, com margem menor ou com sua margem.`, { probe: 'vencedor', sel: ['.vstats'] });
  F('pdf-chavinhas', AR.pdf, 3, 'enxugar', 'Chavinhas do documento (11 grupos, cerca de 40 opções)',
    `Cada bloco do PDF liga/desliga (cabeçalho, fornecedor, banco, itens, resumo, extenso, observações, declaração, cláusulas, local e data, assinatura), com “Usar como padrão” e “Voltar ao padrão”. Os valores seguem uma cascata de 4 níveis: padrão do app ← padrão seu ← ajuste do pregão ← ajuste da proposta final.`,
    { probe: 'pdfOpts', sel: ['#acc-forn', '.swgrid'], para: 'Manter, mas esconder em “Avançado” o que você nunca desliga (veja o uso real em “Uso”).' });
  F('pdf-cabecalho-marca', AR.pdf, 3, 'enxugar', 'Cabeçalho (imagem/nome) e marca d’água (texto/imagem)',
    `Escolhe imagem e posição, tamanho, opacidade e ajuste fino do cabeçalho; marca d’água de texto ou imagem com opacidade, ângulo, tamanho e posição. São 10 controles deslizantes.`,
    { sel: ['#hdPrev', '#wmPrev'], para: 'Manter; reduzir controles de ajuste fino (deslocamento horizontal/vertical) se você quase não os usa.' });
  F('pdf-extenso', AR.pdf, 3, 'manter', 'Valor por extenso',
    `Escreve o valor total em palavras (reais e centavos) no resumo comercial.`, { sel: ['[data-pdf="com.extenso"]'] });
  F('pdf-recalcular', AR.pdf, 3, 'manter', 'Recalcular preços da proposta inicial',
    `Libera os preços guardados na primeira geração para a próxima proposta inicial usar os valores atuais.`, { sel: ['[data-act=pdf-recalcular]'] });
  F('auto-km-detalhe', AR.preg, 3, 'manter', 'Recalcular trajeto',
    `Botão no pregão e no item para refazer a distância automática depois de mudar a cidade (e aviso de qual rota foi usada).`, { sel: ['[data-rota=calc]'] });
  F('exclusao', AR.preg, 3, 'revisar', 'Excluir pregão/item (lápides)',
    `Excluir marca o registro como deletado (“lápide”) em vez de apagar, para a exclusão chegar aos outros aparelhos. As lápides nunca são limpas: ficam no documento da nuvem para sempre.`,
    { probe: 'lapides', para: 'Criar limpeza de lápides antigas (por exemplo, com mais de 60 dias e já sincronizadas em todos os aparelhos).', ev: 'removePregao/removeItem + mergeById.' });

  /* ================= 2 · POUCO USADAS / PARA DECIDIR ================= */
  F('margem-item', AR.item, 2, 'revisar', 'Margem própria do item',
    `Permite uma margem diferente da padrão para um item específico. Nos seus dados nenhum item usa; a margem da Config resolve.`, { probe: 'margemItem', para: 'Remover o campo se continuar sem uso.', sel: ['[name=margem]'] });
  F('posso-ganhar', AR.item, 2, 'fundir', 'Marcação “Posso ganhar”',
    `Estrela manual para itens em que você ficou perto do 1º lugar. Faz quase o mesmo que a Colocação (1º a 3º já leva o pregão para “perto de ganhar”) e é a base da guia Acompanhar.`,
    { red: ['colocacao'], probe: 'possoGanhar', para: 'Usar só a Colocação (1º–3º = posso ganhar) e remover a estrela.', sel: ['[name=possivelGanhar]', '[data-act=item-pode]'] });
  F('exigencias', AR.preg, 2, 'fundir', 'Campo “Exigências (IE, certidões)” do pregão',
    `Texto livre separado das Observações. Não aparece em nenhum cartão: só no formulário (e a leitura automática do tipo de compra o consulta).`, { red: ['obs-pregao'], probe: 'exigencias', para: 'Juntar às Observações do pregão.', sel: ['[name=exigencias]'] });
  F('filtros-status', AR.quad, 2, 'remover', 'Barra de filtros por status (acima do quadro)',
    `Botões Todos/Incompleto/Analisando/Enviada/…/Desisti que filtram o quadro. As raias já agrupam por status e o grupo em tela cheia mostra um status só; o Painel também leva à guia já filtrada.`,
    { red: ['cartao-quadro', 'grupo-tela-cheia'], para: 'Remover a barra; manter o clique nos números do Painel (que filtra) ou trocar por abrir o grupo em tela cheia.', sel: ['.filters'] });
  F('mini-pregao', AR.quad, 2, 'fundir', 'Cartão compacto de encerrados (duas versões)',
    `Há dois desenhos para o pregão encerrado: o cartão pequeno “mini” (guia Itens) e o chip “enc-chip” (guia Pregões, botão Encerrados e concluídos).`, { red: ['cartao-quadro'], para: 'Ficar com um só desenho.', sel: ['.mini-p', '.enc-chip'] });
  F('painel-itens', AR.pain, 2, 'fundir', 'Painel: tabelas “Itens que posso ganhar” e “Itens com colocação”',
    `Duas tabelas do dashboard (PC) com os mesmos itens da guia Acompanhar.`, { red: ['acompanhar'], para: 'Manter só em Acompanhar (ou só no Painel).', sel: ['.dtbl'] });
  F('painel-resultados', AR.pain, 2, 'fundir', 'Painel: cartão “Resultado das propostas”',
    `Conversão, margem dos ganhos, em aberto e barra ganhos/perdas/aberto. Repete o funil e a “Margem por pregão ganho”.`, { red: ['painel-funil'], para: 'Levar os três números para o funil e apagar o cartão.', sel: ['.kpis3'] });
  F('painel-uso-limite', AR.pain, 2, 'fundir', 'Painel: cartão “Uso do limite do MEI”',
    `Barra faturado / a faturar / em disputa / livre e duas barras de porcentagem. Repete Limite, Comprometido e Saldo da linha de números do topo.`, { red: ['limite-mei', 'painel-kpis'], para: 'Fundir com a linha de números do topo.', sel: ['.stack'] });
  F('painel-por-status', AR.pain, 2, 'fundir', 'Painel: cartão “Pregões por status”',
    `Barras com valor por status. Os mesmos números aparecem nos botões coloridos (um por status) e no funil.`, { red: ['painel-status-strip'], para: 'Apagar o cartão; manter os botões do topo.', sel: ['.strow'] });
  F('painel-status-strip', AR.pain, 3, 'manter', 'Painel: botões de status',
    `Faixa com o número de pregões por status; clicar abre a guia Pregões filtrada.`, { sel: ['.st-strip', '[data-act=ir-status]'] });
  F('painel-certidoes', AR.pain, 2, 'enxugar', 'Painel: cartão Certidões',
    `Chips com cada certidão e a validade. A guia Certidões tem o detalhe e as Pendências já avisam quando vence.`, { red: ['painel-pendencias', 'certidoes-guia'], sel: ['.cchips'] });
  F('painel-evolucao', AR.pain, 2, 'revisar', 'Painel: evolução por mês',
    `Gráfico de pregões/valores por mês. Informação de histórico, não de ação.`, { sel: ['.dash svg'] });
  F('painel-margem', AR.pain, 2, 'revisar', 'Painel: margem por pregão ganho',
    `Barras de margem de cada pregão ganho. Útil só quando houver vários ganhos.`, { sel: ['.two-col'] });
  F('painel-orgaos', AR.pain, 2, 'revisar', 'Painel: órgãos que mais compram',
    `Ranking de órgãos por valor. Informação de planejamento.`, { sel: ['.two-col'] });
  F('painel-tabela-pregoes', AR.pain, 2, 'fundir', 'Painel: tabela de pregões filtrados',
    `Lista os pregões que passam nos filtros do dashboard. É outra lista de pregões ao lado do quadro da guia Pregões.`, { red: ['cartao-quadro'], sel: ['.dtbl'] });
  F('painel-filtros-cruzados', AR.pain, 2, 'revisar', 'Painel: filtros cruzados (período, etapa, órgão, mês, fatia, posso ganhar, colocação)',
    `Cliques na rosca, no funil, nos meses e nos órgãos filtram o resto do dashboard. Poderoso, mas é preciso saber que existe.`, { sel: ['.dash-bar', '.dpill'] });
  F('pdf-fonte-valor', AR.pdf, 2, 'revisar', 'Escolha “qual valor entra na proposta”',
    `Seletor (PC) com 4 opções: lance final (senão teto), sempre o mínimo, sempre o teto, só o lance. Pela regra do app o lance final sempre prevalece e o resto é cortado no teto; as outras opções raramente fazem sentido.`, { probe: 'fonteValor', para: 'Esconder o seletor se não usa.', sel: ['#pdff'] });
  F('pdf-catalogo-docx', AR.pdf, 2, 'revisar', 'Catálogo em Word (.docx) e “só o catálogo (PDF)”',
    `Gera o catálogo isolado em PDF ou em Word (montado “na mão”: XML do Word + zip sem compressão, cerca de 100 linhas).`, { red: ['pdf-catalogo'], para: 'Manter só se você realmente envia o catálogo em Word.', sel: ['[data-act=cat-docx]', '[data-act=cat-gerar]'] });
  F('pdf-compartilhar', AR.pdf, 2, 'revisar', 'Botão Compartilhar o PDF',
    `Usa a folha de compartilhamento do celular. Em PC não aparece.`, { sel: ['[data-act=pdf-compartilhar]'] });
  F('catalogo-dois-lugares', AR.item, 2, 'revisar', 'Descritivo/fotos no item E no catálogo da guia Proposta',
    `É o mesmo dado (descritivo + fotos) editável em dois lugares, mais o atalho “Fotos e descrição para o catálogo”. Decisão de 30/10 foi manter as duas opções.`, { red: ['pdf-catalogo'], para: 'Se um dos lugares quase não for usado, tirar.', sel: ['[data-ir-catalogo]', '[data-cat-desc]'] });
  F('titulos-catalogo', AR.item, 2, 'fundir', 'Sugestões de título (MARCA, MODELO, DIMENSÕES…)',
    `Atalhos para inserir “TÍTULO:” no descritivo, que aprendem os mais usados. Existem duas implementações (janela do item e catálogo).`, { red: ['catalogo-dois-lugares'], para: 'Uma implementação só.', sel: ['[data-ftit]', '[data-cat-tit]'] });
  F('apagar-tudo', AR.conf, 2, 'enxugar', 'Apagar todos os dados',
    `Botão na Config que apaga pregões e itens (também na nuvem). Útil raramente e perigoso.`, { para: 'Pedir digitar uma palavra para confirmar.', sel: ['[data-act=apagar]'] });
  F('apagar-desisti', AR.conf, 3, 'manter', 'Limpar desistências (pregões Desisti, itens deixados de fora e lápides)',
    `Botão na Config: apaga de vez os pregões em Desisti e seus itens, os itens deixados de fora (semLance) dos pregões já enviados com a sessão passada (em Proposta enviada, 2 dias depois), e encolhe as lápides antigas. Excluir agora deixa só uma lápide mínima (id, pregaoId, deleted, datas), para liberar espaço no documento da nuvem.`, { sel: ['[data-act=apagar-desisti]'] });
  F('abrir-depurador', AR.conf, 2, 'manter', 'Botão “Depurar” no topo do app',
    `Atalho no canto esquerdo do topo (só no PC), na mesma posição do “← Pregões” do Depurador. O Depurador tem o botão “← Pregões” para voltar.`, { sel: ['[data-depurador]'] });
  F('hook-app', AR.cod, 2, 'manter', 'Gancho de depuração (window.__app)',
    `O app expõe store, UI e render para testes e para este depurador.`, { ev: 'index.html, fim do script de interface.' });

  /* ================= 1 · REDUNDANTES, LEGADAS E MORTAS ================= */
  F('pdf-tabela-espec', AR.pdf, 1, 'remover', 'Tabela de especificações técnicas do PDF (11 colunas)',
    `Tabela alternativa à lista de itens, com colunas opcionais (código, marca, ICMS…). É sempre desligada por padrão (o detalhamento vai no catálogo) e o campo “código do produto” não tem onde ser digitado.`,
    { red: ['pdf-catalogo'], probe: 'tabelaEspec', para: 'Remover tabela, colunas, código e especificações.', ev: 'resolverPdfOpts força tabela=false.', sel: ['#acc-tab'] });
  F('pdf-declaracao-3', AR.pdf, 1, 'fundir', 'Três jeitos de escrever declaração na proposta',
    `Declaração de preços (texto único da Config), cláusulas livres e declarações do edital (documentos). Mais quatro opções antigas em Config.proposta (incluir extenso/banco/declaração/local) que o PDF não lê mais.`,
    { red: ['pdf-modelo-campos'], para: 'Ficar com cláusulas + declarações do edital e apagar o texto único e os 4 interruptores da Config.', sel: ['#acc-obs'] });
  F('entrega-separada', AR.preg, 1, 'fundir', '“Calcular cada ida separadamente” (entregas do pregão)',
    `Divide o pregão em várias entregas, cada uma com km/viagens/pedágio e itens próprios. Faz o mesmo que o local de entrega do item, de outra forma. Nenhum dos seus pregões usa.`,
    { red: ['local-item'], probe: 'entregaDiferente', para: 'Ficar com o local do item.', sel: ['[name=entregaDiferente]', '#egList'] });
  F('status-legado', AR.preg, 1, 'remover', 'Status antigos “Ganhou” e “Em disputa”',
    `“Em disputa” já é convertido em Julgamento ao abrir; “Ganhou” ficou como leitura de dados antigos e aparece em listas de ordem e de cores.`, { probe: 'statusLegado', para: 'Converter e tirar das listas.', ev: 'migrate(), ORDEM_STATUS, COR_STATUS, DASH_PART.' });
  F('sync-antigo', AR.cod, 1, 'remover', 'Caminho antigo de sincronização (pull/push) e flags nunca lidos',
    `A sincronização tem dois caminhos: o atômico (transação, o único usado) e um pull+push antigo que nenhum adaptador alimenta. Também sobram: lastSync/changedSince para o caminho antigo, a flag kmAuto (só gravada) e a constante OPCOES_SO_LINK.`, { ev: 'adaptadorFirebase só implementa sync().' });

  /* ----- ordem final: importância (5→1), mantendo a ordem em que foram escritas; numeração F01… ----- */
  const ordem = L.map((x, i) => [x, i]).sort((a, b) => (b[0].imp - a[0].imp) || (a[1] - b[1])).map((p) => p[0]);
  const porK = {};
  ordem.forEach((x, i) => { x.n = i + 1; x.id = 'F' + String(i + 1).padStart(2, '0'); porK[x.k] = x; });
  ordem.forEach((x) => { x.red = (x.red || []).filter((k) => porK[k]); x.redIds = x.red.map((k) => porK[k].id); });

  const NIVEIS = { 5: 'Essencial', 4: 'Importante', 3: 'Útil', 2: 'Pouco usada / decidir', 1: 'Redundante ou morta' };
  const VEREDITOS = { manter: 'Manter', enxugar: 'Manter e enxugar', fundir: 'Fundir com outra', revisar: 'Decidir com dados', remover: 'Remover' };

  /* ----- sondas: contam, nos SEUS dados, quanto cada função é usada. ctx = { P: pregões ativos, I: itens ativos, cfg, allP, allI, ui } ----- */
  const has = (x) => x !== null && x !== undefined && x !== '' && x !== false;
  const cnt = (arr, f) => arr.filter(f).length;
  const alts = (I) => I.reduce((a, i) => a.concat(Array.isArray(i.alternativas) ? i.alternativas : []), []);
  const R = (n, de, rot) => ({ n, de, rot });
  const PROBES = {
    descEdital: (c) => R(cnt(c.I, (i) => has(i.descEdital)), c.I.length, 'itens com texto do edital'),
    foraDisputa: (c) => R(cnt(c.I, (i) => i.semLance), c.I.length, 'itens fora da disputa'),
    ganhou: (c) => R(cnt(c.I, (i) => i.ganhou === true), c.I.length, 'itens marcados Venci'),
    lanceFinal: (c) => R(cnt(c.I, (i) => has(i.lanceFinal)), c.I.length, 'itens com lance final'),
    precoInicial: (c) => R(cnt(c.I, (i) => has(i.precoInicial)), c.I.length, 'itens com preço inicial guardado'),
    anonima: (c) => R(cnt(c.P, (p) => p.pdfOpts && p.pdfOpts.anonima === true), c.P.length, 'pregões com proposta sem identificação'),
    posVenda: (c) => R(cnt(c.P, (p) => has(p.empenhoNum) || has(p.empenhoData) || has(p.entregueEm) || has(p.pagoEm)), c.P.length, 'pregões com empenho/entrega/pagamento'),
    kmFalta: (c) => R(cnt(c.P, (p) => !['Desisti', 'Perdeu', 'Desclassificado', 'Concluído'].includes(p.status) && !(Number(p.km) > 0) && !p.entregaDiferente), cnt(c.P, (p) => !['Desisti', 'Perdeu', 'Desclassificado', 'Concluído'].includes(p.status)), 'pregões ativos SEM km (ruim: o ideal é zero)'),
    espaco: (c) => R(c.nuvemChars || 0, 950000, 'caracteres do documento da nuvem (limite de segurança 950.000)'),
    emb: (c) => R(cnt(alts(c.I), (a) => Number(a.emb) > 1), alts(c.I).length, 'opções de compra com pacote'),
    opcoes: (c) => R(cnt(c.I, (i) => Array.isArray(i.alternativas) && i.alternativas.length), c.I.length, 'itens com ao menos uma opção de compra'),
    catalogoDesc: (c) => R(cnt(c.I, (i) => has(i.catalogoDesc)), c.I.length, 'itens com descritivo ofertado'),
    revisar: (c) => R(cnt(c.I, (i) => has(i.revisar)), c.I.length, 'itens com alerta Revisar'),
    colocacao: (c) => R(cnt(c.I, (i) => has(i.colocacao)), c.I.length, 'itens com colocação'),
    modeloProprio: (c) => R(cnt(c.P, (p) => p.modeloProprio), c.P.length, 'pregões com modelo próprio'),
    obsPregao: (c) => R(cnt(c.P, (p) => has(p.obs)), c.P.length, 'pregões com observação'),
    tipoCompra: (c) => R(cnt(c.P, (p) => p.tipoCompra === 'SRP' || p.tipoCompra === 'Aquisição'), c.P.length, 'pregões com tipo de compra preenchido'),
    docsEdital: (c) => R(cnt(c.P, (p) => p.pdfOpts && Array.isArray(p.pdfOpts.documentos) && p.pdfOpts.documentos.length), c.P.length, 'pregões com declarações do edital'),
    fotos: (c) => R(cnt(c.I, (i) => Number(i.fotosN) > 0), c.I.length, 'itens com foto'),
    localItem: (c) => R(cnt(c.I, (i) => has(i.localEntrega)), c.I.length, 'itens com local de entrega próprio'),
    plataforma: (c) => R(cnt(c.P, (p) => has(p.plataforma)), c.P.length, 'pregões com plataforma'),
    entregaParcelada: (c) => R(cnt(c.P, (p) => p.entregaParcelada), c.P.length, 'pregões com entrega parcelada'),
    vencedor: (c) => R(cnt(c.I, (i) => Number(i.vencedor) > 0), c.I.length, 'itens com valor do vencedor'),
    entregaItem: (c) => R(cnt(c.I, (i) => has(i.entregueEm)), c.I.length, 'itens com entrega registrada'),
    pdfOpts: (c) => R(cnt(c.P, (p) => has(p.pdfOpts)), c.P.length, 'pregões com ajustes próprios do PDF'),
    lapides: (c) => R(c.allP.length - c.P.length + (c.allI.length - c.I.length), c.allP.length + c.allI.length, 'registros excluídos (lápides) guardados'),
    margemItem: (c) => R(cnt(c.I, (i) => i.margem !== null && i.margem !== undefined), c.I.length, 'itens com margem própria'),
    possoGanhar: (c) => R(cnt(c.I, (i) => i.possivelGanhar), c.I.length, 'itens marcados “posso ganhar”'),
    exigencias: (c) => R(cnt(c.P, (p) => has(p.exigencias)), c.P.length, 'pregões com o campo Exigências'),
    fonteValor: (c) => R(c.ui && c.ui.fonte && c.ui.fonte !== 'auto' ? 1 : 0, 1, 'a opção escolhida hoje não é a automática'),
    ondeLegado: (c) => R(cnt(c.I, (i) => has(i.onde) || has(i.ondeLink)), c.I.length, 'itens com os campos antigos de compra'),
    optQtd: (c) => R(cnt(alts(c.I), (a) => Number(a.qtd) > 0), alts(c.I).length, 'opções de compra com “comprar aqui”'),
    impostoCompra: (c) => R(cnt(c.I, (i) => Number(i.impostoCompraPct) > 0 || has(i.icmsAliq)), c.I.length, 'itens com imposto de compra/ICMS'),
    tabelaEspec: (c) => R(cnt(c.P, (p) => p.pdfOpts && p.pdfOpts.desc && p.pdfOpts.desc.tabela === true), c.P.length, 'pregões com a tabela ligada'),
    entregaDiferente: (c) => R(cnt(c.P, (p) => p.entregaDiferente), c.P.length, 'pregões com entregas separadas'),
    intervaloMin: (c) => R(cnt(c.P, (p) => has(p.intervaloMin)), c.P.length, 'pregões com intervalo de lances'),
    ocultoPainel: (c) => R(cnt(c.P, (p) => p.ocultoPainel), c.P.length, 'pregões ocultos do painel'),
    statusLegado: (c) => R(cnt(c.P, (p) => p.status === 'Ganhou' || p.status === 'Em disputa'), c.P.length, 'pregões com status antigo'),
  };

  root.Catalogo = { lista: ordem, porK, AR, NIVEIS, VEREDITOS, PROBES };
  if (typeof module !== 'undefined' && module.exports) module.exports = root.Catalogo;
})(typeof window !== 'undefined' ? window : globalThis);
