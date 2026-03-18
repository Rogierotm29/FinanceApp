export function applyCardPaymentToAccounts(accounts, payment) {
  const amount = Number(payment.amount) || 0;

  return accounts.map((account) => {
    if (account.id === payment.creditAccountId) {
      return {
        ...account,
        balance: Math.max((Number(account.balance) || 0) - amount, 0),
      };
    }

    if (account.id === payment.sourceAccountId) {
      return {
        ...account,
        balance: Math.max((Number(account.balance) || 0) - amount, 0),
      };
    }

    return account;
  });
}

export function revertCardPaymentInAccounts(accounts, payment) {
  const amount = Number(payment.amount) || 0;

  return accounts.map((account) => {
    if (account.id === payment.creditAccountId) {
      return {
        ...account,
        balance: (Number(account.balance) || 0) + amount,
      };
    }

    if (account.id === payment.sourceAccountId) {
      return {
        ...account,
        balance: (Number(account.balance) || 0) + amount,
      };
    }

    return account;
  });
}

export function applyCreditLimitUpdate(accounts, updateData) {
  return accounts.map((account) =>
    account.id === updateData.creditAccountId
      ? { ...account, creditLimit: Number(updateData.newLimit) || 0 }
      : account
  );
}

export function revertCreditLimitUpdate(accounts, updateData) {
  return accounts.map((account) =>
    account.id === updateData.creditAccountId
      ? { ...account, creditLimit: Number(updateData.oldLimit) || 0 }
      : account
  );
}