import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowUp,
  Check,
  ChevronRight,
  CircleHelp,
  LayoutDashboard,
  ListFilter,
  MessageCircle,
  Moon,
  Plus,
  ShieldCheck,
  Sprout,
  Sun,
  Target,
  Trash2,
  Pencil,
  X,
  Wallet,
  Download,
} from "lucide-react";
import {
  categories,
  decodeData,
  emptyData,
  interpret,
  localDate,
  money,
  monthNow,
  parseMoney,
  STORAGE_KEY,
  summary,
  validDate,
  type Data,
  type Goal,
  type Transaction,
} from "./finance";
type Page = "chat" | "dashboard" | "transactions" | "goals";
type Editor =
  | { kind: "transaction"; value?: Partial<Transaction> }
  | { kind: "goal"; value?: Partial<Goal> }
  | {
      kind: "delete";
      entity: "transactions" | "goals";
      id: string;
      name: string;
    }
  | { kind: "help" };
const names: Record<Page, string> = {
  chat: "Meu assistente",
  dashboard: "Visão geral",
  transactions: "Transações",
  goals: "Minhas metas",
};
const icons = {
  chat: MessageCircle,
  dashboard: LayoutDashboard,
  transactions: ListFilter,
  goals: Target,
};
function readInitial(): { data: Data; error: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { data: raw ? decodeData(raw) : emptyData(), error: "" };
  } catch {
    return {
      data: emptyData(),
      error:
        "Não foi possível ler os dados salvos. Eles não serão sobrescritos. Exporte os dados existentes para recuperá-los antes de continuar.",
    };
  }
}
function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const dialog = ref.current;
    dialog?.showModal();
    dialog?.querySelector<HTMLInputElement>("input")?.focus();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="modal-heading">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-button"
          onClick={close}
          aria-label="Fechar janela"
        >
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function EditorForm({
  editor,
  save,
  close,
}: {
  editor: Extract<Editor, { kind: "transaction" | "goal" }>;
  save: (value: Transaction | Goal) => void;
  close: () => void;
}) {
  const [error, setError] = useState("");
  const isTx = editor.kind === "transaction";
  const tx = isTx ? editor.value : undefined;
  const goal = !isTx ? editor.value : undefined;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const amount = parseMoney(String(f.get("amount")));
    if (!amount) {
      setError(
        "Informe um valor maior que zero, como 35,50. Use vírgula para centavos.",
      );
      return;
    }
    const name = String(f.get("name")).trim();
    if (!name) {
      setError("Escreva uma descrição para identificar este registro.");
      return;
    }
    if (isTx) {
      const date = String(f.get("date"));
      if (!validDate(date) || date > localDate()) {
        setError("Informe uma data válida até hoje.");
        return;
      }
      save({
        id: tx?.id ?? crypto.randomUUID(),
        type: f.get("type") as Transaction["type"],
        cents: amount,
        description: name,
        category: f.get("category") as Transaction["category"],
        date,
        source: tx?.source ?? "manual",
        createdAt: tx?.createdAt ?? new Date().toISOString(),
      });
    } else {
      const raw = String(f.get("saved"));
      const saved = /^0(?:,0{1,2})?$/.test(raw) ? 0 : parseMoney(raw);
      const deadline = String(f.get("deadline"));
      if (saved === null) {
        setError("Informe quanto já reservou. Pode ser 0.");
        return;
      }
      if (deadline && !validDate(deadline)) {
        setError("Informe uma data válida para o prazo ou deixe em branco.");
        return;
      }
      save({
        id: goal?.id ?? crypto.randomUUID(),
        name,
        target: amount,
        saved,
        deadline,
      });
    }
  }
  return (
    <form onSubmit={submit}>
      <p className="muted">
        {isTx
          ? "Confira os detalhes. Você pode editar depois."
          : "Um plano fica mais perto quando você dá o primeiro passo."}
      </p>
      <Field label={isTx ? "Descrição" : "Nome da meta"}>
        <input
          name="name"
          required
          maxLength={200}
          defaultValue={tx?.description ?? goal?.name ?? ""}
          placeholder={isTx ? "Ex.: almoço de hoje" : "Ex.: minha viagem"}
          autoFocus
        />
      </Field>
      {isTx && (
        <Field label="Tipo">
          <select name="type" defaultValue={tx?.type ?? "expense"}>
            <option value="expense">Despesa — dinheiro que saiu</option>
            <option value="income">Receita — dinheiro que entrou</option>
          </select>
        </Field>
      )}
      <Field label={isTx ? "Valor (R$)" : "Quanto quer guardar (R$)"}>
        <input
          name="amount"
          inputMode="decimal"
          required
          placeholder="0,00"
          defaultValue={
            tx?.cents
              ? (tx.cents / 100).toFixed(2).replace(".", ",")
              : goal?.target
                ? (goal.target / 100).toFixed(2).replace(".", ",")
                : ""
          }
        />
      </Field>
      {isTx ? (
        <div className="form-grid">
          <Field label="Categoria">
            <select name="category" defaultValue={tx?.category ?? "Outros"}>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Data">
            <input
              name="date"
              type="date"
              required
              max={localDate()}
              defaultValue={tx?.date ?? localDate()}
            />
          </Field>
        </div>
      ) : (
        <>
          <Field label="Quanto já reservou (R$)">
            <input
              name="saved"
              inputMode="decimal"
              required
              defaultValue={((goal?.saved ?? 0) / 100)
                .toFixed(2)
                .replace(".", ",")}
            />
          </Field>
          <Field label="Prazo (opcional)">
            <input
              name="deadline"
              type="date"
              defaultValue={goal?.deadline ?? ""}
            />
          </Field>
          <p className="fine">
            A meta acompanha sua reserva. Ela não cria uma despesa nem movimenta
            seu saldo.
          </p>
        </>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="modal-actions">
        <button type="button" className="secondary" onClick={close}>
          Cancelar
        </button>
        <button className="primary" type="submit">
          <Check size={18} />
          {isTx ? "Confirmar registro" : "Salvar meta"}
        </button>
      </div>
    </form>
  );
}
export default function App() {
  const [initial] = useState(readInitial);
  const [data, setData] = useState(initial.data);
  const [storageError, setStorageError] = useState(initial.error);
  const [page, setPage] = useState<Page>("chat");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [notice, setNotice] = useState("");
  const [input, setInput] = useState("");
  const [month, setMonth] = useState(monthNow());
  const [filter, setFilter] = useState("Todas");
  const [search, setSearch] = useState("");
  const [undo, setUndo] = useState<{
    entity: "transactions" | "goals";
    value: Transaction | Goal;
  } | null>(null);
  const [theme, setTheme] = useState(() => {
    try {
      return (
        localStorage.getItem("financas-theme") ??
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      );
    } catch {
      return "light";
    }
  });
  const chatInput = useRef<HTMLTextAreaElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("financas-theme", theme);
    } catch {
      /* Tema funciona nesta sessão. */
    }
  }, [theme]);
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "nearest" });
  }, [data.messages, page]);
  function commit(next: Data): boolean {
    if (initial.error) {
      setNotice(initial.error);
      return false;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setData(next);
      setStorageError("");
      return true;
    } catch {
      setStorageError(
        "Não foi possível salvar. Verifique o espaço e a permissão de armazenamento do navegador e tente novamente.",
      );
      return false;
    }
  }
  function navigate(next: Page) {
    setPage(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  function addMessage(text: string, role: "assistant" | "user" = "assistant") {
    return { id: crypto.randomUUID(), role, text };
  }
  function send(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const result = interpret(input, data.transactions, data.goals);
    const messages = [...data.messages, addMessage(input, "user")];
    if (result.kind === "reply") messages.push(addMessage(result.text));
    else
      messages.push(
        addMessage(
          result.kind === "transaction"
            ? "Preparei seu registro. Confira o valor, a categoria e a data antes de confirmar."
            : "Vamos preparar sua meta. Confira os detalhes para salvar.",
        ),
      );
    if (!commit({ ...data, messages: messages.slice(-200) })) return;
    setInput("");
    if (result.kind === "transaction")
      setEditor({ kind: "transaction", value: result.draft });
    if (result.kind === "goal")
      setEditor({
        kind: "goal",
        value: { name: result.name, target: result.target ?? undefined },
      });
  }
  function save(value: Transaction | Goal) {
    const isTx = "cents" in value;
    const existing = isTx
      ? data.transactions.some((t) => t.id === value.id)
      : data.goals.some((g) => g.id === value.id);
    const text = isTx
      ? `${existing ? "Atualizei" : "Registrei"} ${money(value.cents)} em ${value.category.toLowerCase()}.`
      : `Meta “${value.name}” ${existing ? "atualizada" : "criada"}.`;
    const next = {
      ...data,
      transactions: isTx
        ? [value, ...data.transactions.filter((t) => t.id !== value.id)]
        : data.transactions,
      goals: !isTx
        ? [value, ...data.goals.filter((g) => g.id !== value.id)]
        : data.goals,
      messages: [...data.messages, addMessage(text)].slice(-200),
    };
    if (commit(next)) {
      setNotice(text);
      setEditor(null);
    }
  }
  function remove() {
    if (editor?.kind !== "delete") return;
    const value = data[editor.entity].find((t) => t.id === editor.id)!;
    const next = {
      ...data,
      [editor.entity]: data[editor.entity].filter((t) => t.id !== editor.id),
    };
    if (commit(next)) {
      setUndo({ entity: editor.entity, value });
      setNotice("Registro excluído. Você pode desfazer.");
      setEditor(null);
    }
  }
  function restore() {
    if (!undo) return;
    const next =
      undo.entity === "transactions"
        ? {
            ...data,
            transactions: [undo.value as Transaction, ...data.transactions],
          }
        : { ...data, goals: [undo.value as Goal, ...data.goals] };
    if (commit(next)) {
      setUndo(null);
      setNotice("Exclusão desfeita.");
    }
  }
  function exportData() {
    try {
      const raw = initial.error
        ? localStorage.getItem(STORAGE_KEY)
        : JSON.stringify(data, null, 2);
      const url = URL.createObjectURL(
        new Blob([raw ?? ""], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `financas-em-dia-${localDate()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setNotice("Cópia dos dados exportada.");
    } catch {
      setStorageError(
        "Não foi possível exportar. Verifique a permissão de armazenamento e download do navegador.",
      );
    }
  }
  const s = summary(data.transactions, month || monthNow());
  const current = summary(data.transactions, monthNow());
  const list = data.transactions
    .filter(
      (t) =>
        (!month || t.date.startsWith(month)) &&
        (filter === "Todas" || t.category === filter) &&
        t.description.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const monthLabel = new Date(
    `${month || monthNow()}-01T12:00:00`,
  ).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  function goalCard(g: Goal) {
    const percent = Math.min(100, Math.round((g.saved / g.target) * 100));
    return (
      <article className="goal-card" key={g.id}>
        <div className="row">
          <span className="tile">
            <Target size={22} />
          </span>
          <div className="row">
            <button
              className="icon-button"
              aria-label={`Editar meta ${g.name}`}
              onClick={() => setEditor({ kind: "goal", value: g })}
            >
              <Pencil size={17} />
            </button>
            <button
              className="icon-button"
              aria-label={`Excluir meta ${g.name}`}
              onClick={() =>
                setEditor({
                  kind: "delete",
                  entity: "goals",
                  id: g.id,
                  name: g.name,
                })
              }
            >
              <Trash2 size={17} />
            </button>
          </div>
        </div>
        <h3>{g.name}</h3>
        <p>
          <strong>{money(g.saved)}</strong>{" "}
          <span className="muted">de {money(g.target)}</span>
        </p>
        <progress
          value={percent}
          max="100"
          aria-label={`Progresso da meta ${g.name}`}
        />
        <div className="row fine">
          <span>{percent}% concluído</span>
          <span>
            {g.saved >= g.target
              ? "Meta alcançada!"
              : `Faltam ${money(g.target - g.saved)}`}
          </span>
        </div>
        {g.deadline && (
          <p className="fine">
            Prazo:{" "}
            {new Date(`${g.deadline}T12:00:00`).toLocaleDateString("pt-BR")}
          </p>
        )}
      </article>
    );
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="#main" onClick={() => navigate("chat")}>
            <span className="brand-icon">
              <Sprout />
            </span>
            <span>
              finanças
              <span className="brand-sub">
                em dia<span className="brand-dot">.</span>
              </span>
            </span>
          </a>
          <p className="nav-caption">SEU ESPAÇO FINANCEIRO</p>
          <nav aria-label="Navegação principal">
            {(Object.keys(names) as Page[]).map((key) => {
              const Icon = icons[key];
              return (
                <button
                  key={key}
                  className={`nav-item ${page === key ? "active" : ""}`}
                  aria-current={page === key ? "page" : undefined}
                  onClick={() => navigate(key)}
                >
                  <Icon size={21} />
                  <span>{names[key]}</span>
                  {page === key && <span className="active-dot" />}
                </button>
              );
            })}
          </nav>
          <div className="sidebar-bottom">
            <div className="local-note">
              <ShieldCheck size={23} />
              <strong>Seu dinheiro, sua privacidade</strong>
              <p>
                Dados salvos só neste navegador. Faça uma cópia para guardá-los.
              </p>
            </div>
            <button
              className="nav-item"
              onClick={() => setEditor({ kind: "help" })}
            >
              <CircleHelp size={20} />
              Como funciona
            </button>
            <button className="nav-item" onClick={exportData}>
              <Download size={20} />
              Exportar meus dados
            </button>
            <div className="profile">
              <span className="avatar">EU</span>
              <div>
                <strong>Meu espaço pessoal</strong>
                <small>Um passo de cada vez</small>
              </div>
            </div>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <span className="breadcrumb">
              Meu espaço <ChevronRight size={14} />
              <strong>{names[page]}</strong>
            </span>
            <button
              className="theme-button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={`Ativar tema ${theme === "dark" ? "claro" : "escuro"}`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span>Tema {theme === "dark" ? "claro" : "escuro"}</span>
            </button>
          </header>
          <main id="main" tabIndex={-1}>
            <div className="page-heading">
              <div>
                <p className="eyebrow">MAIS CLAREZA, MAIS TRANQUILIDADE</p>
                <h1 ref={heading} tabIndex={-1}>
                  {page === "chat"
                    ? "Seu dinheiro. Uma boa conversa."
                    : names[page]}
                </h1>
                <p className="muted">
                  {page === "chat"
                    ? "Organizar suas finanças pode ser mais simples do que parece."
                    : page === "dashboard"
                      ? "Entenda seu mês, sem complicação."
                      : page === "transactions"
                        ? "Tudo o que entrou e saiu, organizado em um só lugar."
                        : "Pequenos passos para os seus próximos planos."}
                </p>
              </div>
              <button
                className="primary"
                onClick={() =>
                  setEditor(
                    page === "goals"
                      ? { kind: "goal" }
                      : { kind: "transaction" },
                  )
                }
              >
                <Plus size={19} />
                {page === "goals" ? "Nova meta" : "Novo registro"}
              </button>
            </div>
            {storageError && !editor && data.onboarded && (
              <div role="alert" className="error">
                {storageError}
              </div>
            )}
            <div className="notice" role="status">
              {notice}
              {undo && <button onClick={restore}>Desfazer exclusão</button>}
            </div>
            {page === "chat" && (
              <div className="chat-layout">
                <section
                  className="chat-panel"
                  aria-label="Conversa com o agente financeiro"
                >
                  <div className="chat-heading">
                    <span className="agent-icon">
                      <Sprout size={25} />
                    </span>
                    <div>
                      <h2>Agente Financeiro</h2>
                      <p>
                        <span className="status-dot" />
                        Assistente local • pronto para ajudar
                      </p>
                    </div>
                    <span className="badge">SEU ALIADO</span>
                  </div>
                  <div
                    className="conversation"
                    role="log"
                    aria-label="Histórico da conversa"
                    aria-live="polite"
                    aria-relevant="additions"
                  >
                    {data.messages.map((m) => (
                      <div key={m.id} className={`message ${m.role}`}>
                        <span className="message-author">
                          {m.role === "assistant"
                            ? "Agente Financeiro"
                            : "Você"}
                        </span>
                        <p>{m.text}</p>
                      </div>
                    ))}
                    <div ref={chatEnd} />
                  </div>
                  <div
                    className="suggestions"
                    aria-label="Sugestões de conversa"
                  >
                    {[
                      "Gastei 35 no almoço",
                      "Quanto gastei este mês?",
                      "Criar uma meta",
                    ].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setInput(t);
                          chatInput.current?.focus();
                        }}
                      >
                        {t}
                        <ArrowUpRight size={14} />
                      </button>
                    ))}
                  </div>
                  <form className="composer" onSubmit={send}>
                    <label htmlFor="message" className="sr-only">
                      Mensagem para o agente financeiro
                    </label>
                    <textarea
                      id="message"
                      ref={chatInput}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ex.: Hoje gastei R$ 35 no almoço..."
                      maxLength={500}
                      rows={2}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          !e.shiftKey &&
                          !e.nativeEvent.isComposing
                        ) {
                          e.preventDefault();
                          e.currentTarget.form?.requestSubmit();
                        }
                      }}
                    />
                    <button
                      className="send-button"
                      disabled={!input.trim()}
                      aria-label="Enviar mensagem"
                    >
                      <ArrowUp size={22} />
                    </button>
                  </form>
                  <p className="chat-footnote">
                    Você sempre confere antes de salvar. Enter envia; Shift +
                    Enter cria uma linha.
                  </p>
                </section>
                <aside className="insight-column">
                  <section className="balance-card">
                    <div className="row">
                      <span>Seu saldo neste mês</span>
                      <Wallet size={21} />
                    </div>
                    <strong className="balance-number">
                      {money(current.balance)}
                    </strong>
                    <p>Recebimentos menos despesas</p>
                    <div className="balance-detail">
                      <span>
                        <ArrowDownLeft size={18} />
                        Entrou
                      </span>
                      <strong>{money(current.income)}</strong>
                    </div>
                    <div className="balance-detail">
                      <span>
                        <ArrowUpRight size={18} />
                        Saiu
                      </span>
                      <strong>{money(current.expense)}</strong>
                    </div>
                    <button onClick={() => navigate("dashboard")}>
                      Ver meu resumo
                      <ArrowUpRight size={17} />
                    </button>
                  </section>
                  <section className="tip-card">
                    <span className="tile">
                      <Sprout size={23} />
                    </span>
                    <p className="eyebrow">UM PASSO DE CADA VEZ</p>
                    <h2>
                      {current.distribution.length
                        ? "Conhecer é o primeiro passo."
                        : "Pequenos hábitos, grandes mudanças."}
                    </h2>
                    <p>
                      {current.distribution.length
                        ? `${current.distribution[0].category} representa ${Math.round((current.distribution[0].cents / current.expense) * 100)}% das suas despesas neste mês. Olhar os registros ajuda a entender sua rotina.`
                        : "Comece anotando os gastos do dia. Até o cafezinho ajuda a entender para onde seu dinheiro vai."}
                    </p>
                  </section>
                  <section className="mini-goal">
                    <div className="row">
                      <h2>Seu próximo plano</h2>
                      <Target size={20} />
                    </div>
                    {data.goals[0] ? (
                      <>
                        <h3>{data.goals[0].name}</h3>
                        <progress
                          value={Math.min(
                            data.goals[0].saved,
                            data.goals[0].target,
                          )}
                          max={data.goals[0].target}
                          aria-label="Progresso da primeira meta"
                        />
                        <p className="fine">
                          {money(data.goals[0].saved)} de{" "}
                          {money(data.goals[0].target)}
                        </p>
                        <button
                          className="text-button"
                          onClick={() => navigate("goals")}
                        >
                          Acompanhar metas <ChevronRight size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="muted">
                          Uma viagem? Uma reserva? Dê um nome ao seu próximo
                          objetivo.
                        </p>
                        <button
                          className="text-button"
                          onClick={() => setEditor({ kind: "goal" })}
                        >
                          Criar minha primeira meta <Plus size={16} />
                        </button>
                      </>
                    )}
                  </section>
                </aside>
              </div>
            )}
            {page === "dashboard" && (
              <>
                <div className="section-toolbar">
                  <h2>Seu mês em números</h2>
                  <Field label="Mês do resumo">
                    <input
                      type="month"
                      value={month || monthNow()}
                      onChange={(e) => setMonth(e.target.value || monthNow())}
                    />
                  </Field>
                </div>
                <div className="stats-grid">
                  {[
                    ["Entrou no mês", s.income, "income"],
                    ["Saiu no mês", s.expense, "expense"],
                    ["Saldo do mês", s.balance, "balance"],
                  ].map(([title, value, type]) => (
                    <section key={title} className={`stat-card ${type}`}>
                      <span>{title}</span>
                      <strong>{money(Number(value))}</strong>
                    </section>
                  ))}
                </div>
                <p className="summary-sentence">
                  Em {monthLabel}, você recebeu{" "}
                  <strong>{money(s.income)}</strong> e gastou{" "}
                  <strong>{money(s.expense)}</strong>. Seu saldo é{" "}
                  <strong>{money(s.balance)}</strong>.
                </p>
                <div className="dashboard-grid">
                  <section className="panel">
                    <h2>Para onde foi seu dinheiro?</h2>
                    <p className="muted">
                      Despesas por categoria • {monthLabel}
                    </p>
                    {s.distribution.length ? (
                      s.distribution.map((c) => (
                        <div className="category-bar" key={c.category}>
                          <div className="row">
                            <strong>{c.category}</strong>
                            <span>
                              {money(c.cents)} ·{" "}
                              {Math.round((c.cents / s.expense) * 100)}%
                            </span>
                          </div>
                          <div className="bar-track" aria-hidden="true">
                            <div
                              style={{
                                width: `${(c.cents / s.expense) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <Empty
                        title="Seu resumo começa com um registro"
                        text="Registre uma receita ou despesa para acompanhar seu mês."
                        action={() => setEditor({ kind: "transaction" })}
                        label="Adicionar registro"
                      />
                    )}
                  </section>
                  <section className="panel">
                    <h2>Planos ganhando forma</h2>
                    {data.goals.length ? (
                      data.goals.slice(0, 2).map(goalCard)
                    ) : (
                      <Empty
                        title="O que você quer conquistar?"
                        text="Crie uma meta e acompanhe cada passo."
                        action={() => setEditor({ kind: "goal" })}
                        label="Criar meta"
                      />
                    )}
                  </section>
                </div>
              </>
            )}
            {page === "transactions" && (
              <section className="panel">
                <div className="filters">
                  <Field label="Período">
                    <input
                      type="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                    />
                  </Field>
                  <Field label="Categoria">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option>Todas</option>
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Buscar descrição">
                    <input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Ex.: mercado"
                    />
                  </Field>
                  <button
                    className="secondary"
                    onClick={() => {
                      setMonth("");
                      setFilter("Todas");
                      setSearch("");
                    }}
                  >
                    Limpar filtros
                  </button>
                </div>
                <p className="fine">
                  {list.length}{" "}
                  {list.length === 1
                    ? "registro encontrado"
                    : "registros encontrados"}
                </p>
                {list.length ? (
                  <div className="transaction-list">
                    {list.map((t) => (
                      <article className="transaction" key={t.id}>
                        <span className={`transaction-icon ${t.type}`}>
                          {t.type === "income" ? (
                            <ArrowDownLeft />
                          ) : (
                            <ArrowUpRight />
                          )}
                        </span>
                        <div className="transaction-info">
                          <h3>{t.description}</h3>
                          <p>
                            {t.category} ·{" "}
                            {new Date(`${t.date}T12:00:00`).toLocaleDateString(
                              "pt-BR",
                            )}{" "}
                            · {t.source === "chat" ? "Conversa" : "Manual"}
                          </p>
                        </div>
                        <div className={`transaction-amount ${t.type}`}>
                          <strong>
                            {t.type === "income" ? "+" : "−"} {money(t.cents)}
                          </strong>
                          <small>
                            {t.type === "income" ? "Receita" : "Despesa"}
                          </small>
                        </div>
                        <div className="row transaction-actions">
                          <button
                            className="icon-button"
                            aria-label={`Editar ${t.description}`}
                            onClick={() =>
                              setEditor({ kind: "transaction", value: t })
                            }
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            className="icon-button"
                            aria-label={`Excluir ${t.description}`}
                            onClick={() =>
                              setEditor({
                                kind: "delete",
                                entity: "transactions",
                                id: t.id,
                                name: t.description,
                              })
                            }
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <Empty
                    title="Nenhum registro por aqui"
                    text="Adicione seu primeiro registro ou ajuste os filtros para encontrar outros períodos."
                    action={() => setEditor({ kind: "transaction" })}
                    label="Adicionar registro"
                  />
                )}
              </section>
            )}
            {page === "goals" &&
              (data.goals.length ? (
                <div className="goals-grid">{data.goals.map(goalCard)}</div>
              ) : (
                <section className="panel">
                  <Empty
                    title="Todo plano começa com um primeiro passo"
                    text="Conte o que você quer conquistar, quanto precisa e quanto já guardou."
                    action={() => setEditor({ kind: "goal" })}
                    label="Criar minha primeira meta"
                  />
                </section>
              ))}
            <div className="mobile-tools">
              <button onClick={() => setEditor({ kind: "help" })}>
                <CircleHelp size={18} />
                Como funciona
              </button>
              <button onClick={exportData}>
                <Download size={18} />
                Exportar meus dados
              </button>
            </div>
            <footer>
              Feito para simplificar sua relação com o dinheiro.
              <span>
                Uma conversa de cada vez <Sprout size={15} />
              </span>
            </footer>
          </main>
        </div>
      </div>
      {!data.onboarded && !initial.error && (
        <Modal
          title="Sua vida financeira, mais leve."
          close={() => commit({ ...data, onboarded: true })}
        >
          {storageError && (
            <p role="alert" className="error">
              {storageError}
            </p>
          )}
          <div className="welcome-icon">
            <Sprout size={40} />
          </div>
          <p>
            Organize suas finanças conversando. Registre gastos, veja seu resumo
            e acompanhe seus planos, no seu ritmo.
          </p>
          <ol className="welcome-steps">
            <li>Conte o que gastou ou recebeu.</li>
            <li>Confira e confirme o registro.</li>
            <li>Acompanhe seu mês e suas metas.</li>
          </ol>
          <p className="fine">
            Esta versão usa interpretação local de frases, sem IA generativa. Os
            dados ficam neste navegador, sem conta ou sincronização. Exporte uma
            cópia para guardá-los.
          </p>
          <button
            className="primary full"
            onClick={() => commit({ ...data, onboarded: true })}
          >
            Começar <ArrowUpRight size={19} />
          </button>
        </Modal>
      )}
      {editor && (
        <Modal
          title={
            editor.kind === "help"
              ? "Um jeito simples de se organizar"
              : editor.kind === "delete"
                ? "Excluir este registro?"
                : editor.kind === "goal"
                  ? editor.value?.id
                    ? "Editar meta"
                    : "Criar uma meta"
                  : editor.value?.id
                    ? "Editar registro"
                    : "Confira seu registro"
          }
          close={() => setEditor(null)}
        >
          {storageError && (
            <p role="alert" className="error">
              {storageError}
            </p>
          )}
          {editor.kind === "help" ? (
            <div className="help">
              <p>
                Converse com o assistente ou use <strong>Novo registro</strong>.
                Experimente “Gastei 35 no almoço”, “Recebi 3.500 de salário” ou
                “Quanto gastei este mês?”.
              </p>
              <p>
                Para datas, use “hoje”, “ontem” ou dia/mês/ano. Envie um valor
                por mensagem. Valores usam vírgula nos centavos: 35,50.
              </p>
              <p>
                O assistente usa regras locais, não um modelo de IA generativa.
                As observações são educativas e não substituem orientação
                financeira profissional.
              </p>
              <p>
                Você pode editar registros e metas, confirmar exclusões e
                desfazê-las. Navegue com Tab, use Enter para ativar botões e
                Escape para fechar janelas.
              </p>
              <p>
                Seus dados ficam apenas neste navegador. Limpar os dados do site
                pode apagá-los. Use <strong>Exportar meus dados</strong> para
                guardar uma cópia JSON; restauração pela interface ainda não
                está disponível.
              </p>
            </div>
          ) : editor.kind === "delete" ? (
            <>
              <p>
                Deseja excluir “{editor.name}”? Você poderá desfazer a exclusão
                nesta sessão.
              </p>
              <div className="modal-actions">
                <button className="secondary" onClick={() => setEditor(null)}>
                  Cancelar
                </button>
                <button className="danger" onClick={remove}>
                  Excluir registro
                </button>
              </div>
            </>
          ) : (
            <EditorForm
              editor={editor}
              save={save}
              close={() => {
                setEditor(null);
                setNotice("Registro cancelado. Nenhuma informação foi salva.");
              }}
            />
          )}
        </Modal>
      )}
    </>
  );
}
function Empty({
  title,
  text,
  action,
  label,
}: {
  title: string;
  text: string;
  action: () => void;
  label: string;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Sprout size={34} />
      </span>
      <h3>{title}</h3>
      <p className="muted">{text}</p>
      <button className="secondary" onClick={action}>
        <Plus size={18} />
        {label}
      </button>
    </div>
  );
}
