# PRD — Organizador de Finanças Pessoais com IA

## 1. Visão do produto

Criar um aplicativo de organização de finanças pessoais baseado em conversas em linguagem natural.

O usuário deverá conseguir registrar gastos, consultar sua situação financeira, acompanhar metas e receber orientações simples por meio de uma interface de chat, evitando a necessidade de preencher formulários complexos ou utilizar planilhas.

A experiência deve ser simples, educativa e adequada principalmente para pessoas que estão começando a organizar a própria vida financeira.

---

## 2. Problema

Muitas pessoas têm dificuldade em manter o controle das próprias finanças porque as soluções disponíveis normalmente exigem:

- preenchimento manual frequente;
- organização de categorias;
- conhecimento prévio sobre finanças;
- navegação por muitas telas;
- interpretação de gráficos e relatórios complexos.

Como consequência, parte dos usuários abandona o controle financeiro depois de pouco tempo.

O produto pretende reduzir essa barreira utilizando uma experiência conversacional.

---

## 3. Proposta de valor

Permitir que o usuário organize suas finanças utilizando frases naturais, como:

"Hoje gastei R$ 32 no almoço."

"Recebi meu salário de R$ 3.500."

"Quanto gastei com alimentação este mês?"

"Quero guardar R$ 2.000 para uma viagem."

O sistema interpreta a mensagem, registra ou consulta as informações necessárias e apresenta uma resposta simples ao usuário.

---

## 4. Público-alvo

Pessoas que querem começar a organizar suas finanças pessoais de maneira simples e que possuem pouca experiência com aplicativos financeiros ou planilhas.

O foco inicial são usuários que:

- possuem renda pessoal;
- querem entender melhor seus gastos;
- desejam criar o hábito de acompanhar suas finanças;
- querem estabelecer pequenas metas financeiras;
- preferem interação simples e conversacional.

---

## 5. Objetivo do MVP

Validar se uma interface baseada em conversa facilita o registro e acompanhamento das finanças pessoais.

O MVP deve permitir que o usuário:

1. registre receitas e despesas utilizando linguagem natural;
2. visualize as transações registradas;
3. consulte um resumo financeiro;
4. acompanhe uma meta financeira;
5. receba orientações simples baseadas nos próprios dados.

---

## 6. Funcionalidades do MVP

### 6.1 Chat financeiro

O aplicativo deverá possuir uma interface de chat como principal forma de interação.

Exemplos:

"Comprei um tênis por R$ 250."

"Gastei R$ 80 de Uber essa semana."

"Recebi R$ 1.200 de um trabalho freelancer."

A aplicação deverá identificar:

- tipo da transação;
- valor;
- descrição;
- categoria;
- data.

Quando alguma informação importante estiver ausente ou ambígua, o sistema deverá perguntar ao usuário antes de salvar.

Exemplo:

Usuário:
"Gastei 50 no mercado."

Sistema:
"Vou registrar R$ 50 em alimentação/mercado hoje. Está correto?"

---

### 6.2 Registro de receitas e despesas

Cada transação deverá possuir:

- valor;
- tipo: receita ou despesa;
- categoria;
- descrição;
- data;
- origem da informação.

Categorias iniciais:

- alimentação;
- transporte;
- moradia;
- saúde;
- lazer;
- educação;
- compras;
- salário;
- outros.

O usuário poderá corrigir uma classificação posteriormente.

---

### 6.3 Histórico de transações

O usuário deverá visualizar uma lista com suas transações.

Exemplo:

29/09 — Alimentação — Restaurante — R$ 45
28/09 — Transporte — Uber — R$ 23
27/09 — Receita — Salário — R$ 3.500

O usuário poderá editar ou excluir uma transação.

---

### 6.4 Dashboard

O aplicativo deverá apresentar um painel simples contendo:

- total de receitas do mês;
- total de despesas do mês;
- saldo do período;
- categoria com maior gasto;
- distribuição dos gastos por categoria.

Os gráficos devem ser simples e fáceis de interpretar.

---

### 6.5 Metas financeiras

O usuário poderá criar uma meta informando:

- nome da meta;
- valor desejado;
- valor já reservado;
- prazo opcional.

Exemplo:

Meta: Viagem
Objetivo: R$ 3.000
Valor acumulado: R$ 900
Progresso: 30%

---

### 6.6 Agente Financeiro

O aplicativo terá um assistente chamado provisoriamente de "Agente Financeiro".

Ele poderá analisar os dados registrados e gerar observações simples.

Exemplos:

"Neste mês, alimentação representa 32% das suas despesas."

"Seus gastos com transporte aumentaram em comparação com o período anterior."

"Você ainda precisa economizar R$ 2.100 para atingir sua meta de viagem."

As mensagens deverão ser educativas e informativas.

O agente não deverá apresentar suas respostas como consultoria financeira profissional nem prometer resultados financeiros.

---

## 7. Principais telas

### Tela 1 — Onboarding

Explicar rapidamente o funcionamento do aplicativo.

Mensagem sugerida:

"Organize suas finanças conversando comigo. Você pode registrar gastos, receitas, consultar seus dados e acompanhar metas."

Botão:

"Começar"

---

### Tela 2 — Chat

Tela principal do aplicativo.

Elementos:

- histórico da conversa;
- campo de mensagem;
- botão de envio;
- sugestões de comandos.

Exemplos de sugestões:

"Registrar um gasto"

"Quanto gastei este mês?"

"Criar uma meta"

---

### Tela 3 — Dashboard

Apresentar:

- saldo;
- receitas;
- despesas;
- categorias de gastos;
- progresso das metas.

---

### Tela 4 — Transações

Lista completa de receitas e despesas.

Permitir:

- visualizar;
- editar;
- excluir;
- filtrar por período ou categoria.

---

### Tela 5 — Metas

Exibir as metas criadas pelo usuário e o progresso de cada uma.

Permitir criar, editar e excluir metas.

---

## 8. Fluxo principal do usuário

Usuário acessa o aplicativo.

→

Realiza o onboarding.

→

Entra na tela de chat.

→

Escreve:

"Gastei R$ 35 no almoço."

→

Sistema interpreta a mensagem.

→

Classifica como:

Despesa
R$ 35
Categoria: alimentação
Descrição: almoço
Data: hoje

→

Solicita confirmação quando necessário.

→

Salva a transação.

→

Atualiza o dashboard.

→

Responde ao usuário:

"Registrei R$ 35 em alimentação."

---

## 9. Estrutura básica de dados

### Usuário

- id
- nome
- email
- created_at

### Transação

- id
- user_id
- tipo
- valor
- categoria
- descrição
- data
- created_at

### Meta

- id
- user_id
- nome
- valor_objetivo
- valor_atual
- prazo
- created_at

---

## 10. Requisitos de experiência

O aplicativo deverá:

- utilizar linguagem simples;
- evitar termos financeiros complexos;
- priorizar a interação pelo chat;
- funcionar bem em dispositivos móveis;
- apresentar respostas curtas;
- solicitar confirmação quando houver interpretação ambígua;
- permitir que o usuário corrija informações registradas incorretamente.

---

## 11. Critérios de sucesso do MVP

O MVP será considerado funcional quando o usuário conseguir:

- registrar uma receita pelo chat;
- registrar uma despesa pelo chat;
- visualizar a transação registrada;
- consultar o total de gastos;
- visualizar o dashboard;
- criar uma meta financeira;
- acompanhar o progresso dessa meta.

Para uma validação inicial com usuários, observar:

- se conseguem registrar uma despesa sem instruções;
- se entendem as respostas do agente;
- se conseguem localizar seus gastos;
- se compreendem o dashboard;
- se consideram a experiência mais simples do que preencher formulários.

---

## 12. Fora do escopo do MVP

Para manter o projeto pequeno durante a primeira versão, não implementar inicialmente:

- Open Finance;
- integração automática com bancos;
- leitura automática de cartões;
- importação de extratos;
- pagamentos;
- investimentos;
- previsão avançada de gastos;
- planejamento tributário;
- múltiplas moedas;
- compartilhamento de contas entre usuários.

Esses recursos poderão ser avaliados posteriormente.

---

## 13. Validação inicial

Criar um protótipo funcional e testar com aproximadamente 5 a 10 usuários.

Solicitar que realizem tarefas como:

1. registrar um gasto;
2. registrar uma receita;
3. consultar quanto gastaram;
4. criar uma meta;
5. localizar uma transação.

Após o teste, perguntar:

"Foi fácil registrar um gasto?"

"Em algum momento você não sabia o que fazer?"

"A resposta do assistente ficou clara?"

"Você utilizaria esse aplicativo no dia a dia?"

"Qual funcionalidade sentiu falta?"

Os aprendizados deverão orientar a próxima iteração do produto.

---

## 14. Diretriz para implementação com IA

Construir inicialmente apenas as funcionalidades necessárias para validar o fluxo principal.

Prioridade:

Chat → interpretação da transação → armazenamento → histórico → dashboard → metas.

A cada funcionalidade implementada:

1. testar manualmente;
2. identificar erros;
3. corrigir;
4. validar o fluxo;
5. somente então avançar para a próxima funcionalidade.

Evitar adicionar funcionalidades não especificadas neste PRD sem necessidade para o funcionamento do MVP.
