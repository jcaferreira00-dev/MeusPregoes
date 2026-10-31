# Padrão de análise de editais (regras fixas do MEI)

> Cópia sem dados pessoais do arquivo `mei/cnaes-e-padrao-de-analise.md` do Projeto "Mei - Licitação." (Claude), escrita em 31/10/2026.
> Repositório público: sem CNPJ, endereço, banco nem limite de crédito. Esses dados ficam só na Config do app.
> **Em caso de conflito, o `CLAUDE.md` prevalece** (ele é mais novo). Já mudou: CNAE não desclassifica; não existe mais zip (a entrega é um JSON único + pastas no Google Drive); `usar` das opções de compra é ignorado; status "Julgamento" no lugar de "Em disputa".

## Empresa (resumo)

- MEI aberto em 28/09/2026, em Telêmaco Borba/PR. Atuação pela internet e estabelecimento fixo.
- Alvará: o CCMEI traz o Termo de Ciência com efeito de dispensa. Isso não dispensa licença sanitária para atividade que exija.
- SICAF: cadastro feito. Manter as certidões dos níveis II a IV válidas no dia da sessão.
- Atestado de capacidade técnica: ainda não tem. Vem de uma venda já entregue, com nota fiscal. Tibagi (Licitanet) exige em todos os pregões.
- Capital de giro não é filtro. Só informar o valor necessário e o prazo em que o dinheiro fica fora.

## CNAEs (1 principal + 15 secundários, no limite)

| CNAE | Atividade |
|---|---|
| **4744-0/01** (principal) | Ferragens e ferramentas |
| 4763-6/03 | Bicicletas, triciclos, peças e acessórios |
| 4763-6/01 | Brinquedos e artigos recreativos |
| 4752-1/00 | Equipamentos de telefonia e comunicação |
| 4751-2/01 | Equipamentos e suprimentos de informática |
| 4789-0/07 | Equipamentos para escritório |
| 4756-3/00 | Instrumentos musicais e acessórios |
| 4732-6/00 | Lubrificantes |
| 4744-0/03 | Materiais hidráulicos |
| 4742-3/00 | Material elétrico |
| 4789-0/05 | Produtos saneantes domissanitários |
| 4789-0/99 | Outros produtos não especificados (festas e natal) |
| 4754-7/03 | Artigos de iluminação |
| 4759-8/01 | Tapeçaria, cortinas e persianas |
| 4763-6/02 | Artigos esportivos |
| 4541-2/06 | Peças e acessórios novos para motos |

- Candidatos a sair, se for preciso abrir vaga: tapeçaria, motopeças, bicicletas, instrumentos musicais.

### O que NÃO está coberto (anotar no `obs`; não desclassifica)

| Ramo | CNAE que faltaria | Observação |
|---|---|---|
| Tintas, vernizes, thinner, solventes | 4741-5/00 | |
| Papelaria | 4761-0/03 | |
| Livros | 4761-0/01 | |
| Tecidos e armarinho | 4755-5/01 e 4755-5/02 | |
| Médico-hospitalar (seringas, luvas etc.) | 4773-3/00 / 4645-1/01 | Venda a órgão público exige AFE ANVISA + licença sanitária (RDC 16/2014); em regra, responsável técnico e vistoria. Tetos de prefeitura costumam ficar abaixo do varejo |

- **Saneantes (4789-0/05):** venda a órgão público conta como distribuição. Conferir AFE e licença sanitária antes de entrar.

## Regras fixas de análise

1. Ler o edital inteiro (TR e anexos) antes de montar qualquer coisa. O PNCP pode divergir do PDF; vale o edital.
2. Habilitação e licenças: conferir CNAE, licença sanitária, ANVISA, Polícia Federal (químicos), Anatel, Inmetro, SICAF, Inscrição Estadual, atestado e balanço.
   - **Inmetro (lição de Ortigueira 87/2026):** procurar "Inmetro" no edital INTEIRO, inclusive na execução/entrega, e não só na descrição do item. Balança de plataforma 200–300 kg aprovada custa a partir de ~R$ 1.250 (out/2026); as genéricas de R$ 400–500 não têm aprovação.
3. Margem = (teto − custo) ÷ teto. Meta de 40%. De 15% para cima ainda vale, se o lucro em R$ compensar.
4. Mostrar só os itens que valem a pena. Os descartados entram no JSON como `semLance: true`, com o motivo no `obs`.
5. O limite do MEI (R$ 81 mil/ano) e o capital de giro não são filtro: só informar.
6. **Entrega própria:** carro (Strada com carretinha), até 3 viagens.
   - Itens grandes, pesados ou frágeis ficam de fora. Estimar peso e volume e indicar o nº de viagens.
   - Inflamáveis (thinner, solventes): até ~330 L por viagem, para ficar fora das exigências de transporte de produto perigoso.
7. **Pregão inviável, por qualquer motivo:** avisar o motivo em 1–2 linhas. No JSON entra como Desisti.
8. **Entrega parcelada e capital de giro:** sempre que o edital pedir entrega aos poucos, deixar claro.
   - No JSON: `entregaParcelada: true` e `entregaParceladaObs` (vigência, prazo por pedido, local, pagamento). `viagens` = nº real de idas.
   - No LEIA-ME: pior caso (pedirem tudo de uma vez), quanto tempo o dinheiro fica fora (entrega + pagamento), risco de comprar tudo antes e custo de cada viagem pequena. Considerar os outros pregões em andamento.
   - A conta é só informativa.
9. **Detalhes próprios de cada pregão:**
   - Proposta inicial sem identificação: `pdfOpts.anonima: true`.
   - Tabela de especificações técnicas: desligada por padrão.
   - Modelo do edital para a proposta final: `pdfOptsFinal`.
10. **Ganhar, comprar e entregar no prazo:** para cada item, conferir estoque (o fornecedor tem a quantidade inteira?), prazo de compra até Telêmaco Borba comparado com o prazo de entrega do edital (folga em dias) e plano B. Antes de cada sessão, conferir com o João fornecedor, estoque, prazo e lance mínimo. Sem fornecedor confirmado, sem lance.
11. **Cruzar as tabelas do edital** (ETP, TR, quadro de preços, modelo de proposta, ata, PNCP):
    - Comparar quantidade e soma por secretaria, unidade (Un/KT/PCT/CX), preço e numeração.
    - Procurar a cláusula de prevalência.
    - Havendo divergência: avisar, mostrar o impacto na margem e mandar pronto o texto do pedido de esclarecimento, com o prazo (normalmente 3 dias úteis antes da sessão).
    - Embalagem de compra: arredondar para pacotes inteiros e usar o custo por unidade do edital.
    - Casos já vistos: Imbaú 91 (ETP com somas erradas; vale o quadro do item 20.2); Carambeí 55 (unidade KT das raquetes e das bolas); Ortigueira 95 (itens 7 e 11 quase iguais, com tetos diferentes).
12. **Opções de compra:** mais de uma, de lojas diferentes quando der, sempre com link direto do produto (nunca de busca), com custo e frete até Telêmaco Borba. Quando um fornecedor sozinho não tem a quantidade, sugerir a divisão.

## Lições de edital (para conferir sempre)

- Compras.gov (UTFPR): proíbe cotar quantidade menor que a total; pregão centralizado entrega em cada campus (preço único); o resumo do PNCP descreve itens errado, vale o TR.
- Faxinal 52: a capa diz "menor preço por lote" e, no lote, é preciso cotar todos os itens.
- EPI: luva de raspa barata costuma ter CA "não aprovado para soldagem". Conferir o CA no consultaca.com.
- Bolas de competição (Penalty): o varejo fica acima dos tetos de prefeitura.
- Telêmaco e Ponta Grossa: quase todo edital exige balanço ou atestado.
- Os PDFs do IPM (Castro) saem como "Relatório - Edital", sem as regras: pedir o edital completo e o Anexo II.
- O PNCP às vezes repete o mesmo pregão com números diferentes (PCE x PE).
- Indício de inexequibilidade costuma ser preço abaixo de 50% do estimado; conferir o piso antes do lance.

## Formato do JSON e entrega

Ver as seções 3 e 8 do `CLAUDE.md` (formato do JSON de importação e pastas no Google Drive). Pontos que valem sempre:

- Importação em Config → Importar → **Mesclar**. Arquivo `{ "version": 1, "pregoes": [...], "itens": [...] }`, sem `config`.
- Em JSON de atualização, não mandar `marca`, `modelo`, `catalogoDesc`, `lanceFinal`, `margem`, `precoInicial`, fotos nem `ganhou`: o que não vem no arquivo continua como está no app.
- `createdAt`/`updatedAt` em epoch-ms (inteiro); o `updatedAt` tem de ser mais novo que o do app.
- `desc.colunas` e `desc.campos` de `pdfOpts` são dicionários (`{"lote": true, "desc": true}`), não listas.
- Documentos em .docx (o João gera o PDF no Word, porque os PDFs de LibreOffice/reportlab dão aviso na assinatura do Acrobat).
