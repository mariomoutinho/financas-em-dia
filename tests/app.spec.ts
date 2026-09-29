import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Começar", exact: true }).click();
});
test("chat, confirmação, edição, exclusão, restauração e persistência", async ({
  page,
}) => {
  await page
    .getByRole("textbox", { name: "Mensagem para o agente financeiro" })
    .fill("Gastei 35 no almoço");
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Confirmar registro" }).click();
  await page.getByRole("button", { name: "Transações", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Gastei 35 no almoço" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Editar Gastei 35 no almoço", exact: true })
    .click();
  await page.getByLabel("Valor (R$)", { exact: true }).fill("45,50");
  await page.getByRole("button", { name: "Confirmar registro" }).click();
  await expect(page.getByText("− R$ 45,50")).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Transações", exact: true }).click();
  await expect(page.getByText("− R$ 45,50")).toBeVisible();
  await page
    .getByRole("button", { name: "Excluir Gastei 35 no almoço", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Excluir registro", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Nenhum registro por aqui" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Desfazer exclusão" }).click();
  await expect(page.getByText("− R$ 45,50")).toBeVisible();
});
test("receita, resumo, meta e cancelamento", async ({ page }) => {
  await page
    .getByRole("textbox", { name: "Mensagem para o agente financeiro" })
    .fill("Recebi 3.500 de salário");
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  await page.getByRole("button", { name: "Confirmar registro" }).click();
  await page.getByRole("button", { name: "Visão geral", exact: true }).click();
  await expect(
    page.getByText("R$ 3.500,00", { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Minhas metas", exact: true }).click();
  await page.getByRole("button", { name: "Nova meta", exact: true }).click();
  await page.getByLabel("Nome da meta").fill("Viagem");
  await page.getByLabel("Quanto quer guardar").fill("2.000");
  await page.getByLabel("Quanto já reservou").fill("500");
  await page.getByRole("button", { name: "Salvar meta" }).click();
  await expect(page.getByText("25% concluído")).toBeVisible();
  await page.getByRole("button", { name: "Editar meta Viagem" }).click();
  await page.getByLabel("Quanto já reservou").fill("1.000");
  await page.getByRole("button", { name: "Salvar meta" }).click();
  await expect(page.getByText("50% concluído")).toBeVisible();
  await page
    .getByRole("button", { name: "Meu assistente", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Mensagem para o agente financeiro" })
    .fill("Gastei 500 no almoço");
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.getByRole("button", { name: "Transações", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Gastei 500 no almoço" }),
  ).toHaveCount(0);
});
test("acessibilidade, teclado, temas e largura móvel", async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    if (theme === "dark")
      await page.getByRole("button", { name: "Ativar tema escuro" }).click();
    for (const name of [
      "Meu assistente",
      "Visão geral",
      "Transações",
      "Minhas metas",
    ]) {
      await page.getByRole("button", { name, exact: true }).click();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page
    .getByRole("button", { name: "Novo registro", exact: true })
    .click();
  await expect(page.getByLabel("Descrição", { exact: true })).toBeFocused();
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Novo registro", exact: true }),
  ).toBeFocused();
});

test("filtros e resumo usam períodos consistentes", async ({ page }) => {
  await page
    .getByRole("button", { name: "Novo registro", exact: true })
    .click();
  await page.getByLabel("Descrição", { exact: true }).fill("Mercado antigo");
  await page.getByLabel("Valor (R$)", { exact: true }).fill("80");
  await page.getByLabel("Data", { exact: true }).fill("2020-01-10");
  await page
    .getByRole("combobox", { name: "Categoria", exact: true })
    .selectOption("Alimentação");
  await page.getByRole("button", { name: "Confirmar registro" }).click();
  await page.getByRole("button", { name: "Transações", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Mercado antigo" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Limpar filtros" }).click();
  await expect(
    page.getByRole("heading", { name: "Mercado antigo" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Categoria", exact: true })
    .selectOption("Transporte");
  await expect(
    page.getByRole("heading", { name: "Mercado antigo" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Visão geral", exact: true }).click();
  await expect(page.locator(".stat-card.expense")).toContainText("R$ 0,00");
});

test("falha de armazenamento não anuncia sucesso nem perde o formulário", async ({
  page,
}) => {
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "Novo registro", exact: true })
    .click();
  await page.getByLabel("Descrição", { exact: true }).fill("Teste sem espaço");
  await page.getByLabel("Valor (R$)", { exact: true }).fill("25");
  await page.getByRole("button", { name: "Confirmar registro" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("Descrição", { exact: true })).toHaveValue(
    "Teste sem espaço",
  );
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText(
    "Não foi possível salvar",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alert")).toContainText(
    "Não foi possível salvar",
  );
  await page.getByRole("button", { name: "Transações", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Teste sem espaço" }),
  ).toHaveCount(0);
});
