// Full billing cycle calculation

export function getLastCutoffDate(cutoffDay, today) {
  const year = today.getFullYear();
  const month = today.getMonth();
  if (today.getDate() >= cutoffDay) {
    return new Date(year, month, cutoffDay);
  }
  return new Date(year, month - 1, cutoffDay);
}

export function getBillingCycleInfo(account, expenses, today = new Date()) {
  const { cutoffDay, dueDay, balance, id } = account;
  if (!cutoffDay || !dueDay) return null;

  const lastCutoff = getLastCutoffDate(cutoffDay, today);
  const prevCutoff = new Date(lastCutoff.getFullYear(), lastCutoff.getMonth() - 1, cutoffDay);
  const nextCutoff = new Date(lastCutoff.getFullYear(), lastCutoff.getMonth() + 1, cutoffDay);
  const statementDueDate = new Date(lastCutoff.getFullYear(), lastCutoff.getMonth() + 1, dueDay);

  // Use YYYY-MM-DD string comparison (matches expense.date format)
  const pad = (n) => String(n).padStart(2, "0");
  const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const lastCutoffStr = toDateStr(lastCutoff);
  const prevCutoffStr = toDateStr(prevCutoff);

  const accountExpenses = expenses.filter((e) => e.accountId === id);

  // Current cycle: after last cutoff
  const currentCycleItems = accountExpenses.filter((e) => e.date >= lastCutoffStr);
  const currentCycleTotal = currentCycleItems.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  // Statement cycle: between previous cutoff and last cutoff
  const statementCycleItems = accountExpenses.filter(
    (e) => e.date >= prevCutoffStr && e.date < lastCutoffStr
  );

  // Statement balance = what was already "cut" and not paid yet
  const statementBalance = Math.max((Number(balance) || 0) - currentCycleTotal, 0);

  // Days until due date (normalized to midnight)
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dueMidnight = new Date(statementDueDate.getFullYear(), statementDueDate.getMonth(), statementDueDate.getDate());
  const daysUntilDue = Math.round((dueMidnight - todayMidnight) / 86400000);

  const MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const formatShort = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;

  return {
    lastCutoff,
    nextCutoff,
    statementDueDate,
    currentCycleTotal,
    currentCycleItems,
    statementCycleItems,
    statementBalance,
    daysUntilDue,
    isOverdue: daysUntilDue < 0,
    isUrgent: daysUntilDue >= 0 && daysUntilDue <= 5,
    dueDateFormatted: formatShort(statementDueDate),
    nextCutoffFormatted: formatShort(nextCutoff),
  };
}
