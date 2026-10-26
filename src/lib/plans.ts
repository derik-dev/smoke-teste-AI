export const PLANS = {
  free: {
    name: "Grátis",
    price: "R$ 0",
    tests: Number(process.env.FREE_TESTS_PER_MONTH || 3),
    features: ["Testes desktop e mobile", "Relatório completo com prints", "Link de compartilhamento"],
  },
  pro: {
    name: "Pro",
    price: "R$ 49",
    tests: Number(process.env.PRO_TESTS_PER_MONTH || 100),
    features: [
      "Tudo do Grátis",
      "Monitoramento diário (em breve)",
      "Relatório white-label com a marca da agência (em breve)",
      "Histórico ilimitado",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;

/** Pagamentos ficam fora do MVP: todo usuário está no plano grátis. */
export function planOf(): PlanId {
  return "free";
}

export function startOfMonthISO() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}
