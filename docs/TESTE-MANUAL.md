# Teste manual antes da entrega na DIO

Abra o app com `npm run dev` e acesse <http://localhost:5173>. Use dados fictícios. O armazenamento é separado por navegador e endereço: mudar a porta, o perfil ou o domínio abre outro conjunto de dados.

Se já houver registros seus, abra uma janela anônima para executar o roteiro com saldo inicial zero. Não é necessário apagar seus dados.

| Passo | Ação                                                                | Resultado esperado                                                      |
| ----- | ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1     | Clique em Começar.                                                  | A conversa principal aparece.                                           |
| 2     | Envie `Recebi 3.500 de salário`. Confira e confirme.                | Receita de R$ 3.500,00, categoria Salário, data de hoje.                |
| 3     | Envie `Gastei 35 no almoço`. Confira e confirme.                    | Despesa de R$ 35,00 em Alimentação.                                     |
| 4     | Envie `Quanto gastei este mês?`.                                    | Receitas de R$ 3.500,00, despesas de R$ 35,00 e saldo de R$ 3.465,00.   |
| 5     | Abra Visão geral.                                                   | Os mesmos totais aparecem; Alimentação corresponde a 100% das despesas. |
| 6     | Abra Transações, edite o almoço para R$ 45,50.                      | A despesa muda e o saldo fica em R$ 3.454,50.                           |
| 7     | Exclua o almoço e clique em Desfazer exclusão.                      | O registro volta com o valor corrigido.                                 |
| 8     | Crie a meta Viagem: objetivo de R$ 2.000,00 e reserva de R$ 500,00. | Progresso de 25%; faltam R$ 1.500,00. O saldo não muda.                 |
| 9     | Envie `Gastei 500 no almoço`, mas cancele a confirmação.            | Nenhuma nova despesa é salva.                                           |
| 10    | Envie `Gastei 80 de Uber essa semana`.                              | O assistente pede uma data mais específica.                             |
| 11    | Alterne claro/escuro e recarregue a página.                         | O tema e os registros são preservados.                                  |
| 12    | Navegue com Tab e Enter. Abra Novo registro e pressione Escape.     | O foco é visível, a janela fecha e o foco retorna ao botão.             |
| 13    | Use Exportar meus dados.                                            | Um arquivo JSON é baixado. A interface ainda não importa esse arquivo.  |

Teste também em uma largura de celular pelas ferramentas do navegador. Isso não substitui a validação posterior em um dispositivo real ou com leitor de tela.

## Anotações do autor

Preencha depois de testar; estes resultados não foram presumidos:

- O que foi fácil de entender?
- Em qual passo houve dúvida ou erro?
- A interpretação das mensagens correspondeu ao que você quis dizer?
- Qual melhoria considera necessária antes da entrega?
- Como descreveria o aprendizado ao orientar a IA durante a construção?

## Evidências para a DIO

As imagens em `docs/images/` mostram o aplicativo funcionando com dados fictícios. O assistente do app usa regras locais, portanto essas imagens não comprovam uma conversa com um modelo generativo.

Para documentar o uso de IA na construção, capture esta conversa de desenvolvimento: o pedido com o PRD, a inclusão de acessibilidade e tema claro/escuro e uma resposta com implementação ou validação. Recorte apenas o trecho relevante e confira se não há informações pessoais ou credenciais. Salve os prints em `docs/images/` e inclua links no README. Não apresente uma montagem ou conversa inventada como registro real.

A reflexão no README é um rascunho baseado em fatos da implementação. Revise-a com suas observações antes de enviar o link à DIO.
