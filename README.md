# Finanças em Dia

Aplicativo web de finanças pessoais baseado no PRD: organize receitas, despesas e metas por uma conversa ou por formulários simples. Interface em português, responsiva, com temas claro e escuro.

## Executar

Requer Node.js 22.12+ (recomendado: 24) e npm.

```bash
npm ci
npm run dev
```

Abra o endereço mostrado no terminal. Para gerar a versão de produção: `npm run build`. Para visualizar esse build: `npm run preview`. A pasta `dist/` pode ser hospedada em um servidor estático HTTPS.

## Implementado

- Onboarding e chat principal com histórico local.
- Interpretação local de receitas, despesas, categorias, metas e consultas mensais.
- Confirmação/edição de todo lançamento antes de salvar.
- Registro manual; edição; exclusão com confirmação e opção de desfazer.
- Histórico com filtros por mês, categoria e descrição.
- Resumo mensal, receitas, despesas, saldo e distribuição por categoria.
- Metas com valor desejado, reserva, prazo opcional e progresso; edição e exclusão.
- Observações educativas calculadas a partir dos registros.
- Persistência no navegador, exportação JSON e tratamento de falha de armazenamento.
- Tema claro/escuro persistente; preferência inicial do sistema operacional.

## Escopo desta primeira versão

O assistente **usa regras locais**, e não IA generativa. Não há chamadas a modelos, custos de API, backend, autenticação, conta compartilhada ou sincronização entre dispositivos. É um protótipo funcional para validar o fluxo do PRD com usuários. A integração a um modelo de IA e armazenamento por usuário é uma próxima etapa de produto, não uma capacidade já entregue.

Dados financeiros ficam no `localStorage` deste navegador e origem. Não há criptografia de aplicação. Limpar o armazenamento ou usar outro navegador não preserva os registros; exporte cópias JSON. A interface ainda não importa essas cópias. Se houver dados inválidos, o app evita sobrescrevê-los. Metas são acompanhamento manual e não movimentam saldo. Registros aceitam datas até hoje e valores positivos até R$ 1 bilhão. O chat mantém as últimas 200 mensagens.

Valores monetários são inteiros em centavos; entradas seguem formato brasileiro (`1.234,56`). O chat aceita hoje, ontem ou data `DD/MM/AAAA`; referências ambíguas pedem esclarecimento. Registre um valor por mensagem. Consultas aceitam este mês e mês passado. Transações de outros períodos podem ser filtradas na tela própria.

## Exemplos

- `Gastei R$ 35,50 no almoço`
- `Recebi meu salário de 3.500`
- `Gastei 80 de Uber em 25/09/2026`
- `Quanto gastei com alimentação este mês?`
- `Quanto gastei mês passado?`
- `Quero guardar 2.000 para uma viagem`
- `Quanto falta para minhas metas?`

## Acessibilidade e Design Universal

Ver [requisitos de acessibilidade](docs/ACESSIBILIDADE.md). Estrutura HTML semântica, controles rotulados, foco visível, link para pular navegação, estados anunciados, confirmações nativas com `<dialog>`, Escape, retorno de foco, textos junto às cores, áreas de toque, respeito à redução de movimento e layout móvel. Os gráficos têm valores e categorias em texto.

Referências: [W3C: diálogos](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) e [W3C: HTML dialog](https://www.w3.org/WAI/WCAG22/Techniques/html/H102). Testes automáticos ajudam a detectar falhas, mas não certificam conformidade integral WCAG. É necessário validar manualmente com leitores de tela e usuários reais.

## Validação

```bash
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

Testes unitários cobrem centavos, valores inválidos, datas, ambiguidades, categorias, metas e resumos. Playwright cobre CRUD de transações, restauração, persistência, metas, cancelamento, teclado, tema e auditoria axe em quatro telas, dois temas e duas larguras. A CI repete os comandos no GitHub.

## Estrutura

- `src/finance.ts`: tipos, regras financeiras, interpretação e validação do armazenamento.
- `src/App.tsx`: telas, formulários, persistência e ações.
- `src/styles.css`: design responsivo e temas.
- `src/finance.test.ts`, `tests/app.spec.ts`: testes unitários e de navegador.
- `docs/PRD.md`: PRD original fornecido pelo usuário.
- `docs/ACESSIBILIDADE.md`: complemento de Design Universal e roteiro de validação.

Não há integração bancária, pagamentos ou recomendações de investimento. O assistente apresenta informações educativas sobre os dados registrados.
