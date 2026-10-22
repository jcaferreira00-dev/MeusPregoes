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
- Fonte atual: divulgador de editais da BLL que chega no Gmail do João.
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
2. Gmail: e-mails dos últimos 8 dias de `avisos@bllcompras.com` com assunto "Divulgador de editais" e
   os de "edital publicado na plataforma BLL" (marketing@irjlic…). O corpo útil está no HTML
   (o texto puro vem vazio): cidade, órgão, modalidade, nº, tipo, início/fim das propostas, link, objeto.
3. Descartar: prazo de proposta já vencido, fora do raio, fora dos CNAEs, itens grandes/pesados,
   serviços/locação/instalação, e os pregões da lista "Já analisados" abaixo.
4. Entregar só a LISTA de oportunidades (tabela curta, mais perto primeiro): cidade e distância aprox.,
   órgão, nº do pregão, fim das propostas, objeto resumido, por que vale, link BLL.
   Depois, uma linha com os principais descartados.
5. Salvar a lista em `buscas/AAAA-MM-DD.md` neste repositório (commit direto na main).
6. Se algo falhar (Gmail, GitHub, página que precise do navegador), avisar o João NA HORA
   (mensagem + notificação) pedindo para ligar o Chrome no PC; às vezes no celular não funciona.

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
