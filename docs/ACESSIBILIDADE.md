# Experiência do usuário, acessibilidade e Design Universal

Complemento do PRD fornecido pelo usuário e aplicado à primeira versão.

## Diretrizes

Uma mesma experiência flexível deve atender pessoas com diferentes níveis de familiaridade tecnológica. Clareza tem prioridade sobre sofisticação visual.

- Linguagem simples e educativa; resumo que diz quanto entrou, saiu e restou.
- Navegação consistente; chat como entrada principal, com alternativa por formulário.
- Textos legíveis, contraste adequado, fontes confortáveis e áreas de toque.
- Não usar somente cores, animações ou gráficos para transmitir informação.
- Feedback após ações; erros com explicação e caminho para corrigir.
- Confirmação, correção e cancelamento antes de salvar; edição posterior.
- Layout responsivo para smartphones, tablets e computadores.
- Navegação por teclado, foco visível e estrutura semântica para leitores de tela.
- Ícones decorativos acompanham nomes textuais; botões de ícone possuem nome acessível.
- Botão claro/escuro em todas as telas, com persistência da escolha.

## Implementação

Diálogos usam `showModal()` para conter o foco; Escape fecha e o foco retorna ao botão original. Campos possuem rótulos visíveis. A conversa usa `role=log`; resultados usam `role=status`; falhas usam `role=alert`. Progresso das metas usa `progress` com nome acessível e valores em texto. O CSS respeita `prefers-reduced-motion` e reorganiza a interface em telas estreitas.

A auditoria automatizada usa axe com regras WCAG 2 A/AA e 2.1 AA em ambos os temas. Não equivale a uma certificação ou auditoria humana completa.

## Roteiro com 5–10 usuários

1. Entrar no app e concluir a apresentação.
2. Registrar pelo chat uma despesa, corrigir o valor e confirmar.
3. Registrar uma receita por formulário e consultar o resumo.
4. Encontrar uma transação, editar, excluir e desfazer.
5. Criar uma meta e atualizar a reserva.
6. Trocar o tema; repetir navegação somente com teclado.
7. Repetir os passos com leitor de tela (NVDA/Firefox ou VoiceOver/Safari), zoom de 200% e celular.
8. Perguntar onde houve dúvida, se as respostas foram claras e se o app facilitaria a rotina.

Registrar dificuldades antes de afirmar compatibilidade integral com tecnologias assistivas. Validar também dispositivos reais e larguras de 320 px.
