export const categories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Lazer",
  "Educação",
  "Compras",
  "Salário",
  "Outros",
] as const;
export type Category = (typeof categories)[number];
export type Transaction = {
  id: string;
  type: "expense" | "income";
  cents: number;
  description: string;
  category: Category;
  date: string;
  source: "chat" | "manual";
  createdAt: string;
};
export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
};
export type Message = { id: string; role: "assistant" | "user"; text: string };
export type Data = {
  version: 1;
  transactions: Transaction[];
  goals: Goal[];
  messages: Message[];
  onboarded: boolean;
};
export const money = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    cents / 100,
  );
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export const monthNow = () => localDate().slice(0, 7);
export function parseMoney(value: string): number | null {
  const clean = value.trim().replace(/^R\$\s*/i, "");
  if (!/^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/.test(clean)) return null;
  const cents = Math.round(
    Number(clean.replaceAll(".", "").replace(",", ".")) * 100,
  );
  return Number.isSafeInteger(cents) && cents > 0 && cents <= 100_000_000_000
    ? cents
    : null;
}
export function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
export function categoryFrom(text: string): Category {
  const rules: [Category, RegExp][] = [
    [
      "Alimentação",
      /almoco|jantar|mercado|comida|restaurante|alimentacao|lanche|cafe/,
    ],
    ["Transporte", /uber|onibus|combustivel|gasolina|transporte|taxi/],
    ["Moradia", /aluguel|condominio|luz|energia|moradia|internet/],
    ["Saúde", /saude|farmacia|remedio|medico/],
    ["Educação", /curso|livro|escola|educacao/],
    ["Lazer", /cinema|lazer|passeio|show/],
    ["Compras", /tenis|roupa|compra/],
    ["Salário", /salario/],
  ];
  return rules.find(([, re]) => re.test(normalize(text)))?.[0] ?? "Outros";
}
export function summary(transactions: Transaction[], month: string) {
  const list = transactions.filter((t) => t.date.startsWith(month));
  const income = list
    .filter((t) => t.type === "income")
    .reduce((n, t) => n + t.cents, 0);
  const expense = list
    .filter((t) => t.type === "expense")
    .reduce((n, t) => n + t.cents, 0);
  const distribution = categories
    .map((category) => ({
      category,
      cents: list
        .filter((t) => t.type === "expense" && t.category === category)
        .reduce((n, t) => n + t.cents, 0),
    }))
    .filter((t) => t.cents > 0)
    .sort((a, b) => b.cents - a.cents);
  return { income, expense, balance: income - expense, distribution };
}
export type Intent =
  | { kind: "transaction"; draft: Omit<Transaction, "id" | "createdAt"> }
  | { kind: "goal"; name: string; target: number | null }
  | { kind: "reply"; text: string };
export function interpret(
  input: string,
  transactions: Transaction[],
  goals: Goal[],
  today = localDate(),
): Intent {
  const text = normalize(input);
  if (/meta|quero guardar|quero juntar|quero economizar/.test(text)) {
    if (/quanto falta|progresso|minhas metas/.test(text))
      return {
        kind: "reply",
        text: goals.length
          ? goals
              .map(
                (g) =>
                  `${g.name}: você já reservou ${money(g.saved)}. Faltam ${money(Math.max(0, g.target - g.saved))}.`,
              )
              .join("\n")
          : "Você ainda não criou uma meta. Use “Criar uma meta” para começar.",
      };
    const amount = input.match(/(?:R\$\s*)?(\d[\d.,]*)/i)?.[1];
    return {
      kind: "goal",
      name: input.match(/para\s+(?:uma?\s+)?(.+?)[.!]?$/i)?.[1] ?? "",
      target: amount ? parseMoney(amount) : null,
    };
  }
  if (/quanto|resumo|saldo|como estao|maior gasto/.test(text)) {
    let month = today.slice(0, 7);
    if (/mes passado|mes anterior/.test(text)) {
      const d = new Date(`${today}T12:00:00`);
      d.setDate(1);
      d.setMonth(d.getMonth() - 1);
      month = localDate(d).slice(0, 7);
    } else if (/semana|ano|ontem|\d/.test(text))
      return {
        kind: "reply",
        text: "Posso consultar este mês ou o mês passado. Para outras datas, use os filtros em Transações.",
      };
    const s = summary(transactions, month),
      category = categoryFrom(text);
    return {
      kind: "reply",
      text:
        category !== "Outros"
          ? `Em ${month.split("-").reverse().join("/")}, você gastou ${money(s.distribution.find((c) => c.category === category)?.cents ?? 0)} em ${category.toLowerCase()}.`
          : `Em ${month.split("-").reverse().join("/")}, você recebeu ${money(s.income)} e gastou ${money(s.expense)}. Seu saldo é ${money(s.balance)}.${s.distribution.length ? ` A maior despesa foi em ${s.distribution[0].category.toLowerCase()}: ${money(s.distribution[0].cents)}.` : ""}`,
    };
  }
  const income = /recebi|ganhei|entrou|salario/.test(text),
    expense = /gastei|paguei|comprei|despesa|gasto/.test(text);
  if (income === expense)
    return {
      kind: "reply",
      text: "Conte um recebimento ou gasto por vez, com o valor. Por exemplo: “Gastei 35 no almoço” ou “Recebi 3.500 de salário”. Você também pode usar Novo registro.",
    };
  let date = today;
  const explicit = input.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  if (explicit) {
    date = `${explicit[3]}-${explicit[2]}-${explicit[1]}`;
    if (!validDate(date))
      return {
        kind: "reply",
        text: "Essa data não existe. Informe uma data válida no formato dia/mês/ano.",
      };
  } else if (/ontem/.test(text)) {
    const d = new Date(`${today}T12:00:00`);
    d.setDate(d.getDate() - 1);
    date = localDate(d);
  } else if (
    /semana|mes|dia\s+\d|segunda|terca|quarta|quinta|sexta|sabado|domingo|amanha/.test(
      text,
    )
  )
    return {
      kind: "reply",
      text: "Em que data aconteceu? Envie novamente o gasto com a data completa, por exemplo: “Gastei 80 de Uber em 25/09/2026”.",
    };
  const withoutDate = explicit ? input.replace(explicit[0], "") : input;
  const amounts = [...withoutDate.matchAll(/(?:R\$\s*)?(-?\d[\d.,]*)/gi)];
  const cents =
    amounts.length === 1
      ? parseMoney(amounts[0][1].replace(/[.!]$/, ""))
      : null;
  if (!cents)
    return {
      kind: "reply",
      text: "Não consegui identificar um único valor válido. Envie um registro por vez, como “Gastei R$ 35,50 no almoço”.",
    };
  return {
    kind: "transaction",
    draft: {
      type: income ? "income" : "expense",
      cents,
      description: input.trim(),
      category: categoryFrom(text),
      date,
      source: "chat",
    },
  };
}
export function emptyData(): Data {
  return {
    version: 1,
    transactions: [],
    goals: [],
    messages: [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Olá! Vamos cuidar do seu dinheiro, um passo de cada vez? Conte o que você gastou ou recebeu. Eu preparo o registro e você confirma antes de salvar.",
      },
    ],
    onboarded: false,
  };
}
export const STORAGE_KEY = "financas-em-dia:v1";
export function decodeData(raw: string): Data {
  const d = JSON.parse(raw) as Data;
  if (
    d?.version !== 1 ||
    typeof d.onboarded !== "boolean" ||
    !Array.isArray(d.transactions) ||
    !Array.isArray(d.goals) ||
    !Array.isArray(d.messages)
  )
    throw new Error("Formato inválido");
  const cents = (n: unknown) =>
    Number.isSafeInteger(n) && Number(n) >= 0 && Number(n) <= 100_000_000_000;
  if (
    d.transactions.some(
      (t) =>
        !t ||
        typeof t.id !== "string" ||
        !["income", "expense"].includes(t.type) ||
        !cents(t.cents) ||
        t.cents === 0 ||
        !categories.includes(t.category) ||
        typeof t.description !== "string" ||
        !validDate(t.date) ||
        !["chat", "manual"].includes(t.source),
    )
  )
    throw new Error("Transação inválida");
  if (
    d.goals.some(
      (g) =>
        !g ||
        typeof g.id !== "string" ||
        typeof g.name !== "string" ||
        !cents(g.target) ||
        g.target === 0 ||
        !cents(g.saved) ||
        (g.deadline !== "" && !validDate(g.deadline)),
    )
  )
    throw new Error("Meta inválida");
  if (
    d.messages.some(
      (m) =>
        !m ||
        typeof m.id !== "string" ||
        !["user", "assistant"].includes(m.role) ||
        typeof m.text !== "string",
    )
  )
    throw new Error("Conversa inválida");
  return d;
}
