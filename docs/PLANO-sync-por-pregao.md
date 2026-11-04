# Plano: sincronização com uma ficha por pregão (para sábado, depois das 18h)

> Planejado em 04/11/2026 com o João. **Não está feito.** No sábado, depois que o limite de uso reiniciar, abrir uma conversa e dizer: "vamos fazer o plano da sincronização por pregão".
> Mexe na sincronização, que é uma função protegida: só publicar depois de passar em TODOS os testes da seção 5.

## 1. Por que

- Hoje todos os pregões e itens ficam num documento só do Firestore (`pregoesmei_usuarios/{uid}`). O Firestore aceita no máximo 1 MB por documento, e o app trava a sincronização em 950 mil caracteres. Em 31/10/2026 estava em cerca de 86%.
- O "Limpar desistências" (v1.112.0) e a rodada 1 do Depurador (v1.115.0) aliviam, mas a ficha volta a encher com novas análises.
- Não é limite do plano do Firebase (o gratuito tem cerca de 1 GB). É o limite de tamanho de **cada documento**.
- As fotos do catálogo já ficam fora, um documento por item (`pregoesmei_cat_<itemId>/{uid}`).

## 2. Como vai ficar

Mesmo padrão das fotos, que já funciona com as regras de segurança atuais do Firebase (documento com o id do usuário):

| O quê | Onde | Conteúdo |
|---|---|---|
| Índice | `pregoesmei_idx/{uid}` | lista pequena: id de cada pregão + `updatedAt` mais novo dele + versão da estrutura (2) + `atualizadoEm` |
| Config | `pregoesmei_cfg/{uid}` | a config (sem as imagens, como hoje) |
| Cada pregão | `pregoesmei_pz_<pregaoId>/{uid}` | o pregão + os itens dele |
| Itens sem pregão (se houver) | `pregoesmei_pz__sem/{uid}` | itens órfãos |
| Ficha antiga | `pregoesmei_usuarios/{uid}` | **fica como cópia de segurança**, sem apagar, e para de ser usada |

- O limite de 1 MB passa a ser por pregão: um pregão de 300 itens com todo o texto do edital fica em torno de 0,3 MB.
- **Conferir no sábado, antes de começar:** se as regras do Firestore no console aceitam coleções novas com esse padrão (as fotos `pregoesmei_cat_*` aceitam). Se não aceitarem, o João cola a regra nova no console (Firestore › Regras); deixo o texto pronto.

## 3. Como a sincronização vai funcionar (a lógica não muda, só o lugar)

1. **Puxar antes de enviar:** lê o índice; só baixa os pregões cujo `updatedAt` no índice é mais novo que o do aparelho.
2. **Mesclar registro a registro por `updatedAt`** (o mais novo vence), com as lápides mínimas para exclusão (v1.111.0).
3. **Enviar só o que mudou:** para cada pregão alterado, uma transação que lê o documento dele, mescla e grava. Depois atualiza o índice (também em transação).
4. **Tempo real:** o aparelho escuta o índice (hoje escuta a ficha inteira); quando muda, puxa só os pregões alterados.
5. "Verificar com a nuvem", pílula do topo, relógio da internet e aviso de pendências continuam iguais (funções protegidas).
6. O aviso de tamanho passa a ser por pregão (ex.: pregão acima de 900 mil caracteres → avisa qual é).

## 4. Migração (uma vez só)

- Na primeira vez que a versão nova abrir logada: se o índice não existe e a ficha antiga existe → mescla a ficha antiga com o aparelho, divide por pregão, grava tudo e só por último grava o índice com versão 2.
- Se o índice já existe (o outro aparelho já migrou) → usa a estrutura nova direto.
- A ficha antiga não é apagada. A versão nova nunca mais escreve nela.
- **Risco:** um aparelho com a versão antiga guardada continuaria escrevendo na ficha antiga. Para evitar: depois de publicar, abrir o app no PC e no celular (fechar e abrir duas vezes) antes de editar qualquer coisa. A versão nova, se perceber que a ficha antiga mudou depois da migração, mescla essa diferença uma vez e avisa.

## 5. Testes antes de publicar (todos têm de passar)

Dois navegadores separados simulando PC e celular, logados na mesma conta de teste (ou com o Firebase simulado no Playwright):

1. Migração com dados reais de um backup (contagem de pregões e itens igual antes e depois; lance mínimo e lucro iguais).
2. Editar um item no aparelho A → aparece no B.
3. Editar o MESMO item nos dois quase ao mesmo tempo → vence o mais novo, nada some.
4. Excluir no A enquanto o B edita outro item do mesmo pregão → exclusão e edição sobrevivem.
5. Aparelho sem internet edita, volta online → envia e mescla certo.
6. "Limpar desistências" no A → somem no B.
7. Importar JSON (Mesclar) → chega ao outro aparelho.
8. Criar pregão novo no B → aparece no A e entra no índice.
9. `python3 tests/protegidas.py` TUDO OK + todas as guias no PC, tela dividida e celular sem erro no console.
10. Fotos do catálogo continuam subindo e descendo (não mudam de lugar).

## 6. O que o João faz

- **Antes (sábado):** exportar backup no PC E no celular; dizer a % do Depurador em Saúde › Espaço na nuvem.
- **Durante:** se preciso, colar a regra nova no console do Firebase (texto pronto).
- **Depois de publicar:** abrir o app no PC e no celular (fechar e abrir duas vezes) antes de editar; conferir se os pregões estão iguais nos dois.

## 7. Depois disso

- Depurador › Saúde › Espaço na nuvem: mostrar o maior pregão e o total, em vez da ficha única.
- Tela de login (rodada 3 do Depurador): o "criar conta" pode voltar, porque o limite deixa de ser problema (manter fora só se o João não quiser estranhos usando o Firebase dele).
- Catálogo do Depurador e CLAUDE.md atualizados no mesmo commit.
