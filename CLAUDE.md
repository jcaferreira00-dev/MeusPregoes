# Meus Pregões — regras do João (LEIA ANTES DE QUALQUER COISA)

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
- Antes de publicar: extraia os `<script>` e rode `node --check`; teste no navegador (Playwright) o que mudou.
- Ao mudar algo, inclua só o que foi pedido: não tire nem esconda cálculos e informações que já existiam.
- Visual: mesmo alinhamento, blocos simétricos, status com uma palavra só, órgão em CAIXA ALTA,
  cidade padronizada ("Ortigueira/PR"). Se houver dúvida num ajuste visual, mostre uma prévia antes de publicar.
- Celular (iPhone 13) = só o básico; PC = completo. Não criar guias novas no celular.

### Regras de valor da proposta (não mudar sem o João pedir)
- Lance final preenchido prevalece sobre tudo, na proposta inicial e na final.
- Sem lance final: sai o teto do edital. Margem acima do teto é limitada ao teto.
- Proposta inicial: preço guardado na 1ª geração (sem lance). Depois que o pregão tem item ganho,
  os ajustes da proposta final não mexem na inicial.
- Proposta final: só itens vencidos, com confirmação de preço; ajustes dela não viram padrão.

---

## 2. Análise de edital (quando o João mandar o PDF)

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
- Certificação: procurar "Inmetro" no edital inteiro (inclusive execução/entrega). Ex.: balança do
  PE 87 de Ortigueira; capacete de skate exige EN1078; bola de tênis de mesa "oficial" pode exigir ITTF.
- Habilitação: ainda não tem atestado de capacidade técnica; MEI não tem balanço (descartar se exigido).
  Tem SICAF.
- Pregão inviável: só avisar, sem criar JSON nem arquivos.

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

## 3. JSON de importação (um arquivo por pregão, nunca juntar dois)

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
    "descricao": "nome curto", "descEdital": "descrição completa do edital", "marca": "", "unidade": "Un",
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
    pregao.json                     <- JSON de importação deste pregão (só ele)
    LEIA-ME                         <- resumo, regras do edital, prazos, riscos
    Observacoes                     <- pontos de atenção item a item
    Declaracoes (.docx)             <- declarações do edital já preenchidas
    Proposta modelo proprio (.docx) <- quando o edital tiver modelo próprio
```

- Cotação de cada item em pelo menos 2 fornecedores (lojas diferentes, link direto do produto).
- Observações importantes de cada item no campo `obs` do JSON e no arquivo de observações.

---

## 4. Busca de editais

### Fluxo de trabalho (sempre nesta ordem)
1. **Varredura → só a lista de oportunidades.** Primeiro só listar os pregões que passam no filtro
   abaixo (tabela curta). Não gerar JSON nem arquivos nessa etapa.
2. **João escolhe e manda os PDFs** dos editais que quer.
3. **Análise precisa, item por item**, com todas as regras do edital (seção 2 e checklist).
4. **Entrega:** JSON com cotações em pelo menos 2 fornecedores, observações e o zip no padrão da seção 3.

### Filtro da varredura
- Fonte: **PNCP** (não usar o e-mail do João). Ver "Busca no PNCP" abaixo.
- Raio: até ~180 km de Telêmaco Borba/PR, ou menos (quanto mais perto, melhor): está começando e
  sem caixa para frete grande.
- Entrega de carro de passeio, no máximo Strada com carretinha. Itens pesados ou grandes não compensam.
- Itens em quantidade muito grande são difíceis de comprar (falta de fornecedor e de experiência):
  evitar ou sinalizar.
- Ramos dos CNAEs do MEI: ferragens/ferramentas (principal), informática, telefonia, equip. de escritório,
  material elétrico, hidráulicos, iluminação, lubrificantes, saneantes (só sinalizar: exige licença/AFE),
  brinquedos, esportivos, bicicletas, instrumentos musicais, motopeças, tapeçaria/cortinas, festas/decoração.
- Sem CNAE (descartar, mas citar se o valor for alto): papelaria/expediente, tintas, tecidos/armarinho.
  Pregão de expediente com itens elétricos/ferragem no meio: citar só esses itens (julgamento por item).
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

### Tarefa agendada "Busca de pregões" (todo domingo)
1. Ler este arquivo (já está fazendo isso).
2. Ler o "Log das buscas" (fim deste arquivo) para saber a última verificação.
   Buscar no PNCP (seção "Busca no PNCP"), município por município, faixa 1 e depois faixa 2.
   NÃO usar o Gmail.
3. Descartar: prazo de proposta já vencido, fora do raio, fora dos CNAEs, itens grandes/pesados,
   serviços/locação/instalação, e os pregões da lista "Já analisados" abaixo.
4. Entregar só a LISTA de oportunidades (tabela curta, mais perto primeiro): cidade e distância aprox.,
   órgão, nº do pregão, fim das propostas, objeto resumido, por que vale, link BLL.
   Depois, uma linha com os principais descartados.
5. Salvar a lista em `buscas/AAAA-MM-DD.md` neste repositório e REGISTRAR NO LOG (fim deste arquivo):
   uma linha nova na tabela e os pregões trazidos acrescentados na lista "Já no app ou já descartados".
   Commit direto na main. Busca sem registro no log = busca não feita.
6. Se algo falhar (PNCP fora do ar ou bloqueando, GitHub, página que precise do navegador), avisar o João NA HORA
   (mensagem + notificação) pedindo para ligar o Chrome no PC; às vezes no celular não funciona.

### Busca no PNCP (testado em 22/10/2026: responde por município; o PR inteiro de uma vez é grande demais)
- Só via WebFetch (o shell não acessa pncp.gov.br).
- Consulta: `https://pncp.gov.br/api/consulta/v1/contratacoes/proposta?dataFinal=<hoje+60 dias AAAAMMDD>&codigoModalidadeContratacao=<6 pregão | 8 dispensa>&uf=PR&codigoMunicipioIbge=<código>&pagina=1&tamanhoPagina=50`
  (se `totalPaginas` > 1, buscar as outras páginas).
- Itens e tetos (só dos candidatos): `https://pncp.gov.br/api/pncp/v1/orgaos/<cnpj>/compras/<ano>/<sequencial>/itens?pagina=1&tamanhoPagina=50`
  (cnpj, ano e sequencial vêm do `numeroControlePNCP` = "cnpj-1-sequencial/ano").
- Link para o João baixar o edital: `https://pncp.gov.br/app/editais/<cnpj>/<ano>/<sequencial>`; plataforma em `usuarioNome` e `linkSistemaOrigem`.
- Limite: até ~5 chamadas por vez. Se vier HTTP 429, esperar 2 min e seguir; listar no fim o que falhou.
- Órgãos estaduais/federais nesses municípios (UTFPR, UEPG, UEL etc.) aparecem na mesma consulta.
- Distância = linha reta × 1,3 (estimativa de estrada a partir de Telêmaco Borba).

**Faixa 1 — até ~125 km (36 municípios), buscar SEMPRE:**
Telêmaco Borba 4127106 (~0); Imbaú 4110078 (~25); Tibagi 4127502 (~38); Ortigueira 4117305 (~43); Curiúva 4107009 (~47); Ventania 4128534 (~51); Reserva 4121703 (~56); Sapopema 4126207 (~60); Figueira 4107751 (~75); Rosário do Ivaí 4122651 (~87); São Jerônimo da Serra 4124707 (~89); Ibaiti 4109708 (~89); Rio Branco do Ivaí 4122172 (~92); Piraí do Sul 4119400 (~94); Japira 4112306 (~97); Cândido de Abreu 4104402 (~101); Ipiranga 4110508 (~101); Mauá da Serra 4115754 (~101); Ivaí 4111407 (~104); Faxinal 4107603 (~104); Castro 4104907 (~104); Pinhalão 4119202 (~106); Arapoti 4101606 (~107); Tamarana 4126678 (~108); Nova Santa Bárbara 4117214 (~108); Carambeí 4104659 (~109); Jaboti 4111704 (~111); Congonhinhas 4106001 (~112); Conselheiro Mairinck 4106100 (~117); Tomazina 4127809 (~118); Santa Cecília do Pavão 4123204 (~118); Cruzmaltina 4106852 (~119); Santo Antônio do Paraíso 4124301 (~120); Grandes Rios 4108700 (~120); Jaguariaíva 4112009 (~121); Marilândia do Sul 4114906 (~125)

**Faixa 2 — ~125 a 180 km (63 municípios), buscar depois da faixa 1:**
São Sebastião da Amoreira 4126009 (~126); Wenceslau Braz 4128500 (~126); Ponta Grossa 4119905 (~126); Ariranha do Ivaí 4101853 (~128); Guamiranga 4108957 (~128); Nova Fátima 4117008 (~129); Imbituva 4110102 (~131); Rio Bom 4122107 (~133); Prudentópolis 4120606 (~136); Ribeirão do Pinhal 4121901 (~137); Califórnia 4103503 (~137); Jundiaí do Sul 4112900 (~137); Siqueira Campos 4126603 (~139); Guapirama 4109005 (~139); Lidianópolis 4113429 (~140); Borrazópolis 4103305 (~140); Ivaiporã 4111506 (~140); São José da Boa Vista 4125407 (~140); Manoel Ribas 4114500 (~141); Assaí 4101903 (~141); Novo Itacolomi 4117297 (~143); Jardim Alegre 4112504 (~143); Quatiguá 4120705 (~143); Nova América da Colina 4116604 (~144); Lunardelli 4113759 (~152); Joaquim Távora 4112801 (~152); Teixeira Soares 4127007 (~153); Abatiá 4100103 (~153); Arapuã 4101655 (~154); Santana do Itararé 4124004 (~154); Boa Ventura de São Roque 4103040 (~154); Santa Amélia 4123105 (~155); Sengés 4126306 (~155); Kaloré 4113106 (~157); Fernandes Pinheiro 4107736 (~157); Apucarana 4101408 (~158); Turvo 4127965 (~158); Doutor Ulysses 4128633 (~161); Jataizinho 4112702 (~161); Marumbi 4115507 (~162); Pitanga 4119608 (~163); Ibiporã 4109807 (~163); Uraí 4128401 (~164); Londrina 4113700 (~165); Santo Antônio da Platina 4124103 (~165); Cornélio Procópio 4106407 (~165); Irati 4110706 (~166); Cambira 4103800 (~166); Salto do Itararé 4122909 (~166); São João do Ivaí 4125001 (~166); Arapongas 4101507 (~169); Santa Mariana 4123907 (~171); Jandaia do Sul 4112108 (~171); Godoy Moreira 4108551 (~174); Cambé 4103701 (~175); Carlópolis 4104709 (~176); Nova Tebas 4117271 (~176); Bom Sucesso 4103206 (~176); São Pedro do Ivaí 4125803 (~177); Rolândia 4122404 (~177); Palmeira 4117701 (~178); Bandeirantes 4102406 (~179); Mandaguari 4114203 (~179)


### Já no app ou já descartados (não trazer como novos) — atualizado 22/10/2026
Concluídos/encerrados: EPR-UEL 146; Imbaú 84 e 85; UFPR 2922; Ortigueira 87 (desclassificado);
UEL 162; Faxinal 52; Ortigueira 95 (desistiu).
Em andamento: Mauá da Serra 60 (itens ganhos); Ortigueira 91; Carambeí 54 e 55; UTFPR Ponta Grossa 15 e 17;
Imbaú 91.
Aguardando PDFs: Assaí 103; Castro 150; Conselheiro Mairinck 62; Faxinal 49; Grandes Rios 41;
Guamiranga 32; Ipiranga 77 e 78; Japira 38 e 39.
Descartados: Manoel Ribas Disp. 27; Ivaiporã 132; Japira 37; Nova Santa Bárbara 29; Piraí do Sul 43;
São João do Ivaí 77.
Antigos (já analisados antes): Imbaú 89 e 92, Dispensa 15; Ortigueira 90 e 99; Mauá da Serra 61;
Tibagi 60 e 61; Telêmaco 83; Castro 143 e 461; Piraí 99; Cândido de Abreu 72 e 98.
(Quando o João mandar um backup do app ou os PDFs de um pregão, atualizar esta lista.)

### Orientações adicionais do João
<!-- acrescentar aqui as novas orientações de busca -->

---

## 5. Log das buscas (OBRIGATÓRIO a cada busca)
Antes de buscar: ler a última linha para saber a data da última verificação.
Depois de buscar: acrescentar uma linha. Nunca trazer de novo um pregão que já aparece neste log
ou na lista "Já no app ou já descartados" — comparar por órgão + nº do pregão.

| Data da busca | Fonte e período | Novos trazidos | Arquivo |
|---|---|---|---|
| 22/10/2026 | divulgador BLL de 21/10/2026 (últimos 14 dias) | Japira 38 e 39; Castro 150; Conselheiro Mairinck 62; Ipiranga 77 e 78; Grandes Rios 41; Faxinal 49; Assaí 103; Manoel Ribas Disp. 27; São João do Ivaí 77 | buscas/2026-10-22.md |
