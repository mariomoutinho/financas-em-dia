import { describe, it, expect } from "vitest";
import {
  parseMoney,
  interpret,
  summary,
  decodeData,
  emptyData,
  validDate,
  type Transaction,
} from "./finance";
describe("valores em reais", () => {
  it("converte sem arredondar centavos indevidamente", () => {
    expect(parseMoney("R$ 1.234,56")).toBe(123456);
    expect(parseMoney("0,01")).toBe(1);
    expect(parseMoney("3.500")).toBe(350000);
  });
  it("rejeita negativos, zero, infinito e formatos ambíguos", () => {
    for (const value of [
      "-1",
      "0",
      "2.50",
      "1,234",
      "Infinity",
      "abc",
      "999999999999999999",
    ])
      expect(parseMoney(value)).toBeNull();
  });
});
describe("conversa", () => {
  it("prepara gasto sem salvar e identifica categoria", () => {
    const result = interpret("Gastei R$ 35,50 no almoço", [], [], "2026-09-29");
    expect(result).toMatchObject({
      kind: "transaction",
      draft: {
        cents: 3550,
        category: "Alimentação",
        date: "2026-09-29",
        source: "chat",
        type: "expense",
      },
    });
  });
  it("reconhece receita e ontem na mudança de mês", () => {
    expect(
      interpret("Recebi 3.500 de salário ontem", [], [], "2026-03-01"),
    ).toMatchObject({
      kind: "transaction",
      draft: { cents: 350000, type: "income", date: "2026-02-28" },
    });
  });
  it("pergunta sobre informações ambíguas", () => {
    for (const value of [
      "Gastei 50 e 30",
      "Gastei no almoço",
      "Gastei 80 de Uber essa semana",
      "Gastei -35 no almoço",
      "Recebi 50 e gastei 20",
      "Gastei 30 em 31/02/2026",
    ])
      expect(interpret(value, [], []).kind).toBe("reply");
  });
  it("aceita data explícita sem confundir com dinheiro", () => {
    expect(interpret("Gastei 80 de Uber em 25/09/2026", [], [])).toMatchObject({
      kind: "transaction",
      draft: { cents: 8000, date: "2026-09-25" },
    });
  });
  it("prepara meta", () => {
    expect(interpret("Quero guardar 2.000 para uma viagem", [], [])).toEqual({
      kind: "goal",
      name: "viagem",
      target: 200000,
    });
  });
});
describe("resumos e persistência", () => {
  const tx: Transaction[] = [
    {
      id: "1",
      type: "income",
      cents: 350000,
      description: "Salário",
      category: "Salário",
      date: "2026-09-01",
      source: "manual",
      createdAt: "",
    },
    {
      id: "2",
      type: "expense",
      cents: 3550,
      description: "Almoço",
      category: "Alimentação",
      date: "2026-09-29",
      source: "chat",
      createdAt: "",
    },
    {
      id: "3",
      type: "expense",
      cents: 10000,
      description: "Anterior",
      category: "Outros",
      date: "2026-08-01",
      source: "manual",
      createdAt: "",
    },
  ];
  it("separa períodos e soma centavos", () => {
    expect(summary(tx, "2026-09")).toMatchObject({
      income: 350000,
      expense: 3550,
      balance: 346450,
    });
  });
  it("consulta categorias e mês passado", () => {
    expect(
      interpret(
        "Quanto gastei com alimentação este mês?",
        tx,
        [],
        "2026-09-29",
      ),
    ).toMatchObject({ kind: "reply", text: expect.stringContaining("35,50") });
    expect(
      interpret("Quanto gastei mês passado?", tx, [], "2026-09-29"),
    ).toMatchObject({ text: expect.stringContaining("100,00") });
  });
  it("valida datas e dados salvos", () => {
    expect(validDate("2026-02-31")).toBe(false);
    expect(decodeData(JSON.stringify(emptyData())).version).toBe(1);
    expect(() => decodeData('{"version":2}')).toThrow();
    expect(() =>
      decodeData(
        JSON.stringify({
          ...emptyData(),
          transactions: [{ ...tx[0], cents: -1 }],
        }),
      ),
    ).toThrow();
  });
});
