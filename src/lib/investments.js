export function applyInvestmentMoveToAccounts(accounts, move) {
  const amount = Number(move.amount) || 0;

  return accounts.map((item) => {
    if (move.type === "aporte") {
      if (item.id === move.investmentAccountId) {
        return {
          ...item,
          balance: (Number(item.balance) || 0) + amount,
          monthlyContribution: (Number(item.monthlyContribution) || 0) + amount,
        };
      }

      if (item.id === move.liquidAccountId) {
        return {
          ...item,
          balance: Math.max((Number(item.balance) || 0) - amount, 0),
        };
      }
    }

    if (move.type === "retiro") {
      if (item.id === move.investmentAccountId) {
        return {
          ...item,
          balance: Math.max((Number(item.balance) || 0) - amount, 0),
        };
      }

      if (item.id === move.liquidAccountId) {
        return {
          ...item,
          balance: (Number(item.balance) || 0) + amount,
        };
      }
    }

    if (move.type === "rendimiento") {
      if (item.id === move.investmentAccountId) {
        return {
          ...item,
          balance: (Number(item.balance) || 0) + amount,
          profit: (Number(item.profit) || 0) + amount,
        };
      }
    }

    if (move.type === "minusvalia") {
      if (item.id === move.investmentAccountId) {
        return {
          ...item,
          balance: Math.max((Number(item.balance) || 0) - amount, 0),
          profit: (Number(item.profit) || 0) - amount,
        };
      }
    }

    return item;
  });
}

export function revertInvestmentMoveInAccounts(accounts, move) {
  return accounts.map((account) => {
    if (move.type === "aporte") {
      if (account.id === move.investmentAccountId) {
        return {
          ...account,
          balance: Math.max(
            (Number(account.balance) || 0) - Number(move.amount || 0),
            0
          ),
          monthlyContribution: Math.max(
            (Number(account.monthlyContribution) || 0) -
              Number(move.amount || 0),
            0
          ),
        };
      }

      if (account.id === move.liquidAccountId) {
        return {
          ...account,
          balance: (Number(account.balance) || 0) + Number(move.amount || 0),
        };
      }
    }

    if (move.type === "retiro") {
      if (account.id === move.investmentAccountId) {
        return {
          ...account,
          balance: (Number(account.balance) || 0) + Number(move.amount || 0),
        };
      }

      if (account.id === move.liquidAccountId) {
        return {
          ...account,
          balance: Math.max(
            (Number(account.balance) || 0) - Number(move.amount || 0),
            0
          ),
        };
      }
    }

    if (move.type === "rendimiento") {
      if (account.id === move.investmentAccountId) {
        return {
          ...account,
          balance: Math.max(
            (Number(account.balance) || 0) - Number(move.amount || 0),
            0
          ),
          profit: Math.max(
            (Number(account.profit) || 0) - Number(move.amount || 0),
            0
          ),
        };
      }
    }

    if (move.type === "minusvalia") {
      if (account.id === move.investmentAccountId) {
        return {
          ...account,
          balance: (Number(account.balance) || 0) + Number(move.amount || 0),
          profit: (Number(account.profit) || 0) + Number(move.amount || 0),
        };
      }
    }

    return account;
  });
}