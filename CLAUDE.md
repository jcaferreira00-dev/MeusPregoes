# Meus Pregões — regras do João (LEIA ANTES DE QUALQUER COISA)

> A guia **Itens** (só PC) mostra os itens em blocos simétricos por pregão: nº do edital, nome abreviado, qtd, custo, lance, lance total, teto, lucro, estrelas e botão de compra. A guia Procedimento foi removida (o passo a passo fica aqui neste arquivo).
> No celular o app é fixo (sem rolagem lateral) e só mostra o básico.
> A guia Itens tem seletor "Todos os pregões" para filtrar por pregão. O Painel é um dashboard (tela toda no PC): números do topo, contadores por status (clicar abre a guia Pregões filtrada), rosca interativa no topo do dashboard (responde aos filtros e a cliques), funil, evolução, margem, órgãos e uma tabela única de pregões; depois pendências, entregas e certidões. A guia Pregões é um quadro de colunas por status: no celular uma coluna por vez, sem mostrar um pedaço da próxima, e puxar para a esquerda/direita troca de coluna (encaixa uma por vez); no PC as colunas cabem exatas na tela (3 a 6) e cada uma rola por dentro; encerrados e concluídos ficam num botão só. Rolagem sempre suave.

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
- Antes de publicar: extraia os `<script>` e rode `node --check`; teste no navegador (Playwright) o que mudou E abra TODAS as guias no PC e no celular conferindo erros no console (ao mexer numa função, procure o que dependia dela).
- No PC, aproveitar a tela inteira (largura e altura): janelas de edição do item em tela cheia (preview fixo à esquerda, formulário em 4 colunas), Painel e quadros usando toda a largura.
- Janela do item no PC (decisão de 29/10/2026): coluna da esquerda = resumo (lance mínimo, lucro) + Lance final + Valor do vencedor (no celular esses dois campos ficam no lugar de antes); pregão e local de entrega na mesma linha, nome do item ao lado de lote e nº do item, marca e modelo lado a lado, e o "Exigido no edital" estica até a altura do descritivo ofertado (sem espaço vazio). Sem espaço sobrando: não deixar campo ocupando a linha inteira à toa.
- Guia Pregões (decisão de 29/10/2026): usa a tela toda no PC (sem limite de largura) e as raias são por importância: "Atenção agora" (vermelha, primeiro: pregão hoje, proposta vencendo em até 1 dia, entrega/pagamento atrasado ou vencendo hoje; pregão amanhã também entra, em âmbar), Julgamento (os "perto de ganhar" — algum item até o 3º lugar na colocação, ou "posso ganhar" — primeiro e em dourado; sem itens ganhos), "Venci 🏆" (decisão de 29/10/2026: reúne os pregões em Aguardando empenho e também os em Julgamento que já têm item ganho; não existe mais a raia "Aguardando empenho"; cada cartão leva um selo flutuante, tipo carimbo de qualidade, no canto inferior direito do cartão: uma palavra só, que acompanha a etapa: Julgamento (âmbar) → Empenho (roxo) → Entregar (azul, depois de informar o empenho/prazo) → Parcial (laranja, quando parte dos itens ganhos já foi entregue; os detalhes "Entregues 1 de 4 · faltam 3" ficam na etiqueta do cartão) → Receber (verde-água, depois de marcar a entrega) → Pago (verde); provisório), Enviadas, Analisando, Incompletos. Cada cartão com urgência mostra uma faixa de alerta colorida no topo; a cor da borda segue a importância (vermelho pulsando = hoje/atrasado, âmbar = amanhã/2 dias, dourado = perto de ganhar). As colunas dividem a largura pelo número de raias.
- Sessão que passou de um dia para o outro (decisão de 30/10/2026): pregão em "Proposta enviada" cuja data da sessão já passou vai para "Atenção agora" com a faixa âmbar "Sessão passou · continua?" e três botões no cartão: "Continua amanhã" (sessão vira amanhã, mesma hora), "Mais dias" (abre janela para escolher a nova data/hora) e "Encerrou" (status vira Julgamento). A pergunta some sozinha quando a data da sessão fica no futuro ou o status muda.
- Celular, uso rápido (decisão de 29/10/2026; o app não pode perder a cara de sempre, o uso é esporádico): o Painel abre com o cartão "Agenda" (hoje, amanhã, próximos dias, ganhos com botão "Proposta"); a guia Proposta mostra pregão, inicial/final, os itens como cartões com o campo "Meu lance" (vazio = teto do edital; avisa abaixo do mínimo/acima do teto) e o botão Gerar PDF. Ficam escondidos no celular: opções do documento, cabeçalho, marca d'água, catálogo com imagens (só aparece quando falta marca ou descritivo, para poder digitar) e catálogo/Word. O PDF sai com as configurações feitas no PC.
- Ao mudar algo, inclua só o que foi pedido: não tire nem esconda cálculos e informações que já existiam.
- Visual: mesmo alinhamento, blocos simétricos, status com uma palavra só, órgão em CAIXA ALTA,
  cidade padronizada ("Ortigueira/PR"). Se houver dúvida num ajuste visual, mostre uma prévia antes de publicar.
- Botões de link dos cartões de pregão (guia Pregões, PC): só ícone, sempre nas mesmas posições (edital, modelo, enviar proposta, licitação); o que não tem link fica apagado. No celular, título do órgão sem o prefixo "Prefeitura Municipal de".
- Formulário do item: NÃO existe campo "onde comprar". Só o botão "+" (opções de compra: link, loja, frete, custo e "comprar aqui"; até 8). Cada opção vira tique ✓ + cesta + lápis; o João marca as que vai usar. Marcada uma: custo e frete do item vêm dela; várias: cada uma com a sua quantidade (a que ficar em branco leva o resto), custo médio e soma dos fretes. Sem nenhuma marcada, valem o custo e o frete digitados. No JSON, cada opção de `alternativas` pode ter `usar: true/false`; sem `usar` o item é lido no modelo antigo (principal `onde`/`ondeLink` + alternativas com `qtd`) e o app converte ao abrir.
- Botão de compra (cartão do item, catálogo e formulário): SEMPRE com o nome do site/loja (sem nome, o domínio do link), também no celular. As opções marcadas para usar vêm primeiro, com borda verde.
- Opções de compra aparecem na prévia do item comparando o total (custo × qtd + frete) e marcando a mais barata; o botão "Usar" marca/desmarca.
- Proposta: `marca`, `modelo` (no item) e o descritivo do item ofertado (= `catalogoDesc`, o texto do catálogo na guia Proposta, o mesmo do catálogo) são TODOS digitados pelo João: nunca preencher na análise nem no JSON (deixar vazios). No PDF/Word o texto sai sempre em linha corrida (linhas empilhadas viram parágrafo), e a primeira letra depois de "TÍTULO EM CAIXA ALTA:" fica maiúscula; o campo tem correção ortográfica do navegador. O PDF mostra "EXIGIDO NO EDITAL" (texto do edital) e, logo abaixo, "DESCRITIVO DO ITEM OFERTADO" seguido, depois de uma linha tracejada, da marca/modelo. A proposta NÃO é gerada enquanto algum item tiver marca, modelo ou descritivo ofertado em branco (decisão de 30/10/2026: modelo passou a ser obrigatório), nem quando a marca/modelo do item for diferente do que está escrito no descritivo. Se o descritivo tiver "MARCA:" e/ou "MODELO:", o app preenche sozinho os campos marca e modelo do item com esse texto (no formulário do item e no catálogo da guia Proposta), para nunca sair marca diferente em um e em outro. Botões de gerar (proposta, só catálogo, Word) ficam juntos no fim da guia Proposta. As imagens e o descritivo (com os títulos em caixa alta) podem ser incluídos tanto na janela de edição do item quanto no catálogo da guia Proposta: é o mesmo dado (`catalogoDesc` + fotos), as duas opções convivem.
- Status do pregão: Falta dados, Analisando, Proposta enviada, Julgamento (antigo "Em disputa", que o app converte sozinho; os editais ficam dias avaliando a proposta), Aguardando empenho (ata assinada, esperando o empenho), Faturado, Concluído, Perdeu, Desclassificado, Desisti. Julgamento e Aguardando empenho ficam no topo das listas, com cores próprias (âmbar e roxo). Nos JSON usar "Julgamento", nunca "Em disputa".
- Colocação (`colocacao`, 1º, 2º…): digitável em qualquer item não ganho depois da sessão (perdido, pregão perdido/encerrado ou sem item ganho), no cartão do item e na janela de edição. No Dashboard, o botão "Colocações" lista esses itens do mais perto de ganhar para o mais longe (filtro "Até o 3º"), com valor do vencedor e diferença. Na guia Itens o bloco mostra o selo da colocação.
- Celular (iPhone 13) = só o básico; PC = completo. Não criar guias novas no celular.

### Regras de valor da proposta (não mudar sem o João pedir)
- Lance final preenchido prevalece sobre tudo, na proposta inicial e na final.
- Sem lance final: sai o teto do edital. Margem acima do teto é limitada ao teto.
- Proposta inicial: preço guardado na 1ª geração (sem lance). Depois que o pregão tem item ganho,
  os ajustes da proposta final não mexem na inicial.
- Proposta final: só itens vencidos, com confirmação de preço; ajustes dela não viram padrão.

---

## 2. Análise de edital (quando o João mandar o PDF)

- `descEdital` ("Exigido no edital") é CÓPIA FIEL do edital (decisão de 30/10/2026): copiar e colar o texto do item exatamente como está no edital/TR, completo, sem resumir nem limpar (só tirar quebras de página e cabeçalhos de tabela que entraram no meio). O João confere tudo ao revisar as cotações.

- Focar só nos itens/lotes que valem a pena.
- Cruzar as tabelas do edital (ETP, TR, quadro de preços, modelo de proposta, ata): quantidade,
  unidade e soma por secretaria. Havendo divergência, avisar e já mandar o texto do pedido de esclarecimento.
- Margem = (teto − custo) ÷ teto. Alvo 40%; a partir de 15% ainda vale se o lucro em R$ compensar.
- Considerar o caso de ganhar só um item (frete, carro e combustível todos nele): informar o lance
  mínimo sem prejuízo.
- Custo pela embalagem de compra (ex.: isopor em pacote de 25 placas → para 20 compra 1 pacote).
- Sempre mais de uma opção de compra, de lojas diferentes, com link DIRETO do produto (nunca link de busca).
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
- Habilitação: ainda não tem atestado de capacidade técnica; MEI não tem balanço (descartar se exigido).
  Tem SICAF.
- Pregão inviável: só avisar, sem criar JSON nem arquivos.
- Julgamento por LOTE/GRUPO (ter que comprar o grupo inteiro): descartar. Julgamento por item, ou edital em que
  cada "lote" é um item só, vale.
- Entrega que precisa ser distribuída em vários lugares (cada escola, várias secretarias/endereços): descartar.
  Entrega num endereço só por pedido (ex.: departamento indicado no empenho, mesma cidade) vale, com aviso.
- Atestado de capacidade técnica exigido = descartar enquanto não tiver atestado (citar no aviso).
- CNAE NÃO desclassifica (decisão de 24/10/2026): é fácil incluir/trocar CNAE no MEI. Item ou pregão fora dos
  CNAEs atuais entra normalmente na análise e no JSON, com observação no `obs` dizendo qual CNAE falta
  (ex.: livros = 4761-0/01; papelaria = 4761-0/03; tintas = 4741-5/00; tecidos/armarinho = 4755-5/01/02).
- Na análise, entregar primeiro UM JSON só (todos os pregões; os que não compensam com status Desisti) e depois o
  zip das pastas SEM o JSON dentro.
- TODOS os itens do pregão entram no JSON (decisão de 25/10/2026), nenhum fica de fora sem registro. O item que
  não vale a pena (sem margem, sem preço confiável, produto não encontrado, hospitalar/ANVISA, fora do CNAE sem
  interesse, grande/pesado etc.) entra como descartado: `semLance: true` e o motivo no `obs`, com o número do
  edital (o da plataforma, já retificado) e o número antigo do TR quando mudou. Quando o motivo for "não achei
  preço", dizer isso (não é o mesmo que "não compensa"), para o João poder reavaliar. Assim o João vê todos os
  itens na ordem do edital e não há dúvida sobre o que foi incluído ou excluído.

- Pregão que compensa mas ficou com item de interesse SEM cotação (não consegui achar preço): status "Falta dados" (aparece em "Incompletos" no app), com "FALTA COTAR: ..." no início do `obs` (decisão de 29/10/2026). Item cortado por "não compensa" ou "Desisti" não conta como pendência; só o que o João quer e eu não consegui cotar. Pregão sem nenhuma pendência fica "Analisando".

### Checklist de regras do edital que mudam a proposta (conferir SEMPRE e colocar no JSON)
| O que procurar no edital | Onde vai no JSON |
|---|---|
| Proposta inicial pode ou não identificar o licitante ("desclassificada a proposta que identifique") | `regrasEdital.semIdentificacao` + `referencia` |
| Validade mínima da proposta (ex.: "não inferior a 90 dias") | `pdfOpts.validade` |
| Condição/prazo de pagamento | `pdfOpts.pagamento` e `pagamentoDias` |
| Prazo de entrega | `prazoEntregaDias` e `pdfOpts.prazoEntrega` |
| Local de entrega | `pdfOpts.localEntrega` |
| Modelo de proposta próprio do edital (anexo) e título dele | `modeloProprio`, `pdfOpts.desc.tituloTexto` |
| Exigências (marca, catálogo, amostra, Inmetro, declarações) | `exigencias` |
| Entrega parcelada | `entregaParcelada`, `entregaParceladaObs` |

A tabela de especificações técnicas da proposta fica sempre DESLIGADA (o detalhamento vai no catálogo).

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
    "status": "Analisando", "prazoEntregaDias": 10, "pagamentoDias": 30,
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
    "onde": "Loja", "ondeLink": "https://link-direto-do-produto",
    "alternativas": [{ "loja": "Outra loja", "link": "https://...", "custo": 2.1, "frete": 0, "qtd": 0 }],
    "obs": "", "createdAt": 0, "updatedAt": 0, "deleted": false
  }]
}
```

- `regrasEdital.semIdentificacao`: `true` = edital proíbe identificar na inicial; `false` = exige; omitir se o
  edital não fala. O app mostra o aviso na guia Proposta e trava a geração se a chavinha estiver diferente.
- `pdfOpts.anonima` deve bater com `regrasEdital.semIdentificacao`.

### Entrega dos arquivos (padrão fixo desde 22/10/2026 — substitui qualquer padrão anterior)
Um zip organizado assim, SEM acentos nem caracteres especiais nos nomes das pastas
(a barra do número vira hífen, porque "/" não pode em nome de pasta):

```
Municipio de Imbau/                 <- pasta com o nome do promotor (órgão)
  EDITAL N 091-2026/                <- uma pasta por pregão
    LEIA-ME                         <- resumo, regras do edital, prazos, riscos
    Observacoes                     <- pontos de atenção item a item
    Declaracoes (.docx)             <- declarações do edital já preenchidas
    Proposta modelo proprio (.docx) <- quando o edital tiver modelo próprio
```

- Cotação de cada item em pelo menos 2 fornecedores (lojas diferentes, link direto do produto).
- Qualidade da cotação (decisão de 26/10/2026): a opção marcada para USAR (`usar: true`) deve cumprir TODAS as
  especificações mínimas do TR/edital (potência, dimensões, capacidade, material, garantia etc.), em loja
  especializada ou fabricante do ramo, para não arriscar desclassificação por produto errado. Margem muito alta
  (acima de ~50-60%) costuma indicar produto inferior à especificação: marcar no `obs` "conferir ficha técnica".
  Cotações mais baratas/inferiores PODEM entrar como opção extra de comparação (`usar: false`), sem serem a base do lance.
- Edital que exige montagem, instalação ou nivelamento do equipamento (aparelhos de academia etc.): item fora
  (`semLance: true`, motivo no `obs`), conforme a regra de itens que exigem instalação (decisão de 26/10/2026).
- Observações importantes de cada item no campo `obs` do JSON e no arquivo de observações.
- COMO COTAR, PADRÃO OBRIGATÓRIO (decisão de 30/10/2026, reforçada pelo João): toda cotação é feita no Chrome do João (Claude in Chrome), entrando nas lojas, buscando nas páginas e abrindo o produto, para conferir preço atual, especificação e pegar o LINK DIRETO. Resumo de busca (WebSearch) NÃO vale como cotação: gasta token e sai incompleto (links de listagem, preços velhos). Loja do Mecânico: `https://www.lojadomecanico.com.br/busca?q=<termo>` (link do produto = `/produto/<id>`); Mercado Livre: `https://lista.mercadolivre.com.br/<termo-com-hifens>`; Magazine Luiza: `/busca/<termo>/`. O WebFetch só abre páginas já vistas na conversa e algumas lojas (Pichau, Casas Bahia) bloqueiam.
- Se o Chrome não estiver disponível ou não responder (PC desligado, extensão desconectada) ou se eu travar em alguma loja: PARAR e avisar o João NA HORA (mensagem + notificação) para ele ligar o computador/Chrome. Não seguir cotando por resumo de busca.

---

## 4. Busca de editais

### Fluxo de trabalho (sempre nesta ordem)
1. **Varredura → lista de oportunidades + UM JSON único** com todos os pregões novos (cadastro básico,
   para importar com "Mesclar"). Sem pastas, sem zip, sem análise de itens nessa etapa.
2. **João escolhe e manda os PDFs** dos editais que quer.
3. **Análise precisa, item por item**, com todas as regras do edital (seção 2 e checklist).
4. **Entrega da análise:** JSON com cotações em pelo menos 2 fornecedores, observações e o zip com as pastas da seção 3.

### Filtro da varredura
- Fonte: **PNCP** (não usar o e-mail do João). Ver "Busca no PNCP" abaixo.
- Raio: até ~120 km de estrada de Telêmaco Borba/PR, MAIS Ponta Grossa (~126 km) — decisão de 22/10/2026
  (180 km ficou longe demais). Quanto mais perto, melhor: está começando e sem caixa para frete grande.
  A lista de municípios com código IBGE está em "Busca no PNCP".
- Plataformas (decisão de 30/10/2026): o João só usa **Compras.gov.br** e **BLL**. As outras (Licitanet, BNC, Portal de Compras Públicas, Compras Paraná etc.) cobram taxa/mensalidade, então por enquanto NÃO usar: pregão em outra plataforma é descartado na busca e na análise (citar a plataforma no aviso). Na busca, conferir `usuarioNome`/`linkSistemaOrigem` do PNCP. Se o João voltar a usar outra, mudar AQUI.
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

### Ciclo semanal (decisão de 24/10/2026)
- Sábado 18h43 (depois que os tokens da semana reiniciam): busca no PNCP, lista + JSON da busca.
- Até domingo ou segunda: o João manda os PDFs dos escolhidos; análise e cotação de todos juntos (um JSON só).
- Durante a semana: o João revisa e envia as propostas.

### Tarefa agendada "Busca de pregões" (todo sábado 18h43)
1. Ler este arquivo (já está fazendo isso).
2. Ler o "Log das buscas" (fim deste arquivo) para saber a última verificação.
   Buscar no PNCP (seção "Busca no PNCP"), município por município, pregões e dispensas.
   NÃO usar o Gmail.
3. Descartar: prazo de proposta já vencido, fora do raio, itens grandes/pesados,
   serviços/locação/instalação, e os pregões da lista "Já analisados" abaixo.
4. Entregar só a LISTA de oportunidades (tabela curta, mais perto primeiro): cidade e distância aprox.,
   órgão, nº do pregão, fim das propostas, objeto resumido, por que vale, link BLL.
   Depois, uma linha com os principais descartados.
5. Entregar UM JSON SÓ com todos os pregões novos da busca (cadastro básico, status "Falta dados",
   link do PNCP em `link`/`linkLicitacao`, objeto e triagem em `obs`, id fixo que a análise depois
   reaproveita) — o João importa com "Mesclar". Na mesma lista, marcar `deleted: true` nos pregões do app
   que deixaram de valer (prazo vencido sem proposta, fora do raio), nunca nos que têm proposta enviada,
   item ganho, empenho, entrega ou pagamento. NÃO criar pastas nem zip na busca: as pastas da seção 3
   só existem depois da análise dos PDFs.
6. Salvar a lista em `buscas/AAAA-MM-DD.md` neste repositório e REGISTRAR NO LOG (fim deste arquivo):
   uma linha nova na tabela e os pregões trazidos acrescentados na lista "Já no app ou já descartados".
   Commit direto na main. Busca sem registro no log = busca não feita.
7. Se algo falhar (PNCP fora do ar ou bloqueando, GitHub, página que precise do navegador), avisar o João NA HORA
   (mensagem + notificação) pedindo para ligar o Chrome no PC; às vezes no celular não funciona.

### Busca no PNCP (testado em 22/10/2026: responde por município; o PR inteiro de uma vez é grande demais)
- Só via WebFetch (o shell não acessa pncp.gov.br).
- Consulta: `https://pncp.gov.br/api/consulta/v1/contratacoes/proposta?dataFinal=<hoje+60 dias AAAAMMDD>&codigoModalidadeContratacao=<6 pregão | 8 dispensa>&uf=PR&codigoMunicipioIbge=<código>&pagina=1&tamanhoPagina=50`
  (se `totalPaginas` > 1, buscar as outras páginas).
- Itens e tetos (só dos candidatos): `https://pncp.gov.br/api/pncp/v1/orgaos/<cnpj>/compras/<ano>/<sequencial>/itens?pagina=1&tamanhoPagina=50`
  (cnpj, ano e sequencial vêm do `numeroControlePNCP` = "cnpj-1-sequencial/ano").
- Link para o João baixar o edital: `https://pncp.gov.br/app/editais/<cnpj>/<ano>/<sequencial>`; plataforma em `usuarioNome` e `linkSistemaOrigem`.
- Pregões (modalidade 6) e dispensas (8) em todos os municípios da lista.
- Para economizar: pedir ao WebFetch só as compras dos ramos do MEI (lista de áreas no prompt), uma linha por compra.
- Limite: até ~5 chamadas por vez. Se vier HTTP 429, esperar 2 min e seguir; listar no fim o que falhou.
- Órgãos estaduais/federais nesses municípios (UTFPR, UEPG, UEL etc.) aparecem na mesma consulta.
- Distância = linha reta × 1,3 (estimativa de estrada a partir de Telêmaco Borba).

**Municípios da busca — até ~120 km + Ponta Grossa (35):**
Telêmaco Borba 4127106 (~0); Imbaú 4110078 (~25); Tibagi 4127502 (~38); Ortigueira 4117305 (~43); Curiúva 4107009 (~47); Ventania 4128534 (~51); Reserva 4121703 (~56); Sapopema 4126207 (~60); Figueira 4107751 (~75); Rosário do Ivaí 4122651 (~87); São Jerônimo da Serra 4124707 (~89); Ibaiti 4109708 (~89); Rio Branco do Ivaí 4122172 (~92); Piraí do Sul 4119400 (~94); Japira 4112306 (~97); Cândido de Abreu 4104402 (~101); Ipiranga 4110508 (~101); Mauá da Serra 4115754 (~101); Ivaí 4111407 (~104); Faxinal 4107603 (~104); Castro 4104907 (~104); Pinhalão 4119202 (~106); Arapoti 4101606 (~107); Tamarana 4126678 (~108); Nova Santa Bárbara 4117214 (~108); Carambeí 4104659 (~109); Jaboti 4111704 (~111); Congonhinhas 4106001 (~112); Conselheiro Mairinck 4106100 (~117); Tomazina 4127809 (~118); Santa Cecília do Pavão 4123204 (~118); Cruzmaltina 4106852 (~119); Santo Antônio do Paraíso 4124301 (~120); Grandes Rios 4108700 (~120); Ponta Grossa 4119905 (~126)

### Já no app ou já descartados (não trazer como novos) — atualizado 22/10/2026
Concluídos/encerrados: UFPR 2922; Ortigueira 87 (desclassificado);
UEL 162; Faxinal 52; Ortigueira 95 (desistiu).
Em andamento: Mauá da Serra 60 (itens ganhos); Ortigueira 91; Imbaú 84 e Carambeí 54 (Julgamento, confirmado pelo João em 29/10); Imbaú 85 e EPR-UEL 146 (Julgamento no app); Carambeí 54 e 55; UTFPR Ponta Grossa 15 e 17;
Imbaú 91.
Analisados em 24/10 (JSON entregue): Faxinal 49; São Jerônimo da Serra 47 (PE 40/2026); Ortigueira 102.
Descartados na análise de 24/10: Castro 150 (por lote); Japira 38 e 39 (por lote); Ipiranga 77 (expediente e
entrega em ~15 endereços); Grandes Rios 41 e Conselheiro Mairinck 62 (exigem atestado de capacidade técnica).
Analisados em 29-30/10 (JSON entregue): Imbaú 94, Jaboti 44 e Piraí do Sul 47 (Analisando); Castro 157 e 163 (Desisti: plataforma IPM, cotação pronta no JSON); demais da busca de 29/10 como Desisti.
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


---

## 6. Entrega por item (decisão de 29/10/2026)

- Cada item ganho tem a sua data de entrega (`entregueEm` no item). No pregão, `entregueEm` continua significando "tudo entregue"; ele é preenchido sozinho quando o último item ganho é entregue, e a entrega marcada no pregão inteiro vale para todos os itens.
- Marcar/desmarcar: botão "Marcar entregue" no cartão do item ganho e lista "Entrega por item" no cartão "Entrega e pagamento" do pregão. "Marcar o restante como entregue hoje" fecha o que faltar. "Desfazer entrega" limpa as datas dos itens também.
- Etapas do selo: Julgamento → Empenho → Entregar → Parcial → Receber → Pago. O pagamento (prazo e "Receber") só conta depois da entrega total; pagamento parcial por entrega ainda não existe.
- Nos JSON de importação, `entregueEm` do item só vem no backup do app; análise nova não manda esse campo.

## 7. Guia Pregões: grupo em tela cheia (decisão de 29/10/2026)

- Clicar no título de um grupo do quadro (ex.: "Incompletos") abre só aquele grupo na tela toda, em grade de cartões, com o botão "Todos os grupos" para voltar ao quadro.
- Abrir um pregão e voltar pelo "Pregões" de cima devolve a tela em que estava (grupo em tela cheia ou quadro), já rolada até o cartão clicado, com um destaque rápido nele. Não tirar isso: o João não quer rolar de novo para achar o pregão.
- Na tela cheia do grupo, os cartões ficam 2 por linha (3 por linha em tela grande, a partir de ~1500 px) e não mais, para não ficarem estreitos (pedido do João, tela grande).

## 8. Pastas no Google Drive (decisão de 29/10/2026)

- As pastas das análises ficam no Google Drive do João, dentro de "01- PREGÕES": uma pasta por órgão ("Municipio de Castro"; sem acento) e, dentro, "PREGÃO ELETRÔNICO - EDITAL nº 157-2026" (dispensa: "DISPENSA ELETRÔNICA - EDITAL nº 48-2026"; quando o PNCP usa outro número, pôr entre parênteses, ex.: "(PCE 53-2026)"). Dentro de cada uma, o LEIA-ME.txt.
- Só vão para o Drive os pregões que COMPENSAM (status Analisando). Os que ficam Desisti NÃO ganham pasta no Drive: o motivo fica no JSON (obs) e no resumo do projeto.
- Pasta de órgão que já existe (ex.: "Município de Faxinal") é reaproveitada: procurar antes de criar.
