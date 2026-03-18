export function getLocalDateString() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 10);
}

export function normalizeAccount(account) {
  return {
    id: account?.id || crypto.randomUUID(),
    name: account?.name || "",
    type: account?.type || "Debito",
    balance: Number(account?.balance) || 0,
    creditLimit: Number(account?.creditLimit) || 0,
    cutoffDay: Number(account?.cutoffDay) || 0,
    dueDay: Number(account?.dueDay) || 0,
    monthlyContribution: Number(account?.monthlyContribution) || 0,
    profit: Number(account?.profit) || 0,
  };
}

export function normalizeLoadedData(data, defaultProfile) {
  return {
    profile: { ...defaultProfile, ...(data?.profile || {}) },
    accounts: Array.isArray(data?.accounts)
      ? data.accounts.map(normalizeAccount)
      : [],
    expenses: Array.isArray(data?.expenses)
      ? data.expenses.map((expense) => ({
          id: expense?.id || crypto.randomUUID(),
          concept: expense?.concept || "",
          category: expense?.category || "Otro",
          amount: Number(expense?.amount) || 0,
          accountId: expense?.accountId || "",
          accountName: expense?.accountName || "",
          date: expense?.date || getLocalDateString(),
        }))
      : [],
    goals:
      Array.isArray(data?.goals) && data.goals.length
        ? data.goals.map((goal) => ({
            id: goal?.id || crypto.randomUUID(),
            name: goal?.name || "Meta",
            amount: Number(goal?.amount) || 0,
          }))
        : [
            {
              id: crypto.randomUUID(),
              name: "Fondo de emergencia",
              amount: 0,
            },
            {
              id: crypto.randomUUID(),
              name: "Inversión",
              amount: 0,
            },
          ],
    cardPaymentsHistory: Array.isArray(data?.cardPaymentsHistory)
      ? data.cardPaymentsHistory
      : [],
    creditLimitHistory: Array.isArray(data?.creditLimitHistory)
      ? data.creditLimitHistory
      : [],
    liquidDepositHistory: Array.isArray(data?.liquidDepositHistory)
      ? data.liquidDepositHistory
      : [],
    liquidTransferHistory: Array.isArray(data?.liquidTransferHistory)
      ? data.liquidTransferHistory
      : [],
    investmentMoveHistory: Array.isArray(data?.investmentMoveHistory)
      ? data.investmentMoveHistory
      : [],
  };
}