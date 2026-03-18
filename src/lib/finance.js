export function clamp(value, min, max) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

export function monthToWeekly(monthly) {
  return monthly / 4.33;
}

export function getBudgetPlan(income, fixed, rate, method) {
  const safeIncome = Number(income) || 0;
  const safeFixed = Number(fixed) || 0;
  const investRate = clamp(rate, 0, 100);

  if (method === "Personalizado") {
    const investment = safeIncome * (investRate / 100);
    const essentials = Math.max(safeFixed, safeIncome * 0.45);
    const lifestyle = Math.max(safeIncome - essentials - investment, 0);
    return { essentials, lifestyle, investment };
  }

  const essentials = Math.max(safeFixed, safeIncome * 0.5);
  const investment = Math.max(safeIncome * 0.2, safeIncome * (investRate / 100));
  const adjustedLifestyle = Math.max(safeIncome - essentials - investment, 0);

  return {
    essentials,
    lifestyle: adjustedLifestyle,
    investment,
  };
}

export function applyExpenseToAccount(account, amount) {
  if (!account) return account;
  const numericAmount = Number(amount) || 0;

  if (account.type === "Credito") {
    return {
      ...account,
      balance: (Number(account.balance) || 0) + numericAmount,
    };
  }

  return {
    ...account,
    balance: Math.max((Number(account.balance) || 0) - numericAmount, 0),
  };
}

export function revertExpenseFromAccount(account, amount) {
  if (!account) return account;
  const numericAmount = Number(amount) || 0;

  if (account.type === "Credito") {
    return {
      ...account,
      balance: Math.max((Number(account.balance) || 0) - numericAmount, 0),
    };
  }

  return {
    ...account,
    balance: (Number(account.balance) || 0) + numericAmount,
  };
}

export function getAccountTotals(
  accounts,
  liquidTypes = ["Debito", "Ahorro", "Efectivo"],
  investmentTypes = ["Inversion"],
  creditTypes = ["Credito"]
) {
  return accounts.reduce(
    (acc, account) => {
      const balance = Number(account.balance) || 0;
      const creditLimit = Number(account.creditLimit) || 0;
      const monthlyContribution = Number(account.monthlyContribution) || 0;
      const profit = Number(account.profit) || 0;

      if (liquidTypes.includes(account.type)) {
        acc.liquid += balance;
      }

      if (investmentTypes.includes(account.type)) {
        acc.investment += balance;
        acc.investmentProfit += profit;
        acc.configuredInvestment += monthlyContribution;
      }

      if (creditTypes.includes(account.type)) {
        acc.creditDebt += balance;
        acc.creditLimit += creditLimit;
      }

      return acc;
    },
    {
      liquid: 0,
      investment: 0,
      creditDebt: 0,
      creditLimit: 0,
      investmentProfit: 0,
      configuredInvestment: 0,
    }
  );
}

export function getHealthSnapshot({
  emergencyProgress,
  creditUsage,
  availableThisMonth,
  configuredInvestment,
  targetInvestment,
}) {
  const emergencyScore = Math.min(emergencyProgress, 100) * 0.35;
  const creditScore = Math.max(0, 100 - Math.min(creditUsage, 100)) * 0.25;
  const cashflowScore = availableThisMonth >= 0 ? 20 : 5;
  const investRatio =
    targetInvestment > 0
      ? Math.min((configuredInvestment / targetInvestment) * 100, 100)
      : 100;
  const investScore = investRatio * 0.2;

  const score = Math.round(
    emergencyScore + creditScore + cashflowScore + investScore
  );

  let status = "Estable";
  if (score >= 80) status = "Muy buena";
  else if (score >= 65) status = "Buena";
  else if (score >= 45) status = "En mejora";
  else status = "Atención";

  const messages = [];

  if (emergencyProgress < 100) {
    messages.push("Prioriza crecer tu fondo de emergencia.");
  } else {
    messages.push("Tu fondo de emergencia va por buen camino.");
  }

  if (creditUsage > 30) {
    messages.push("Baja el uso de tus tarjetas para respirar más tranquilo.");
  } else {
    messages.push("Tu uso de crédito está controlado.");
  }

  if (configuredInvestment < targetInvestment) {
    messages.push(
      "Tu aportación invertida mensual puede acercarse más a tu objetivo."
    );
  } else {
    messages.push("Tu ritmo de inversión está alineado con tu meta mensual.");
  }

  return { score, status, messages };
}