export function applyLiquidDepositToAccounts(accounts, deposit) {
  const amount = Number(deposit.amount) || 0;

  return accounts.map((account) =>
    account.id === deposit.accountId
      ? {
          ...account,
          balance: (Number(account.balance) || 0) + amount,
        }
      : account
  );
}

export function revertLiquidDepositInAccounts(accounts, deposit) {
  const amount = Number(deposit.amount) || 0;

  return accounts.map((account) =>
    account.id === deposit.accountId
      ? {
          ...account,
          balance: Math.max((Number(account.balance) || 0) - amount, 0),
        }
      : account
  );
}

export function applyLiquidTransferToAccounts(accounts, transfer) {
  const amount = Number(transfer.amount) || 0;

  return accounts.map((account) => {
    if (account.id === transfer.sourceAccountId) {
      return {
        ...account,
        balance: Math.max((Number(account.balance) || 0) - amount, 0),
      };
    }

    if (account.id === transfer.destinationAccountId) {
      return {
        ...account,
        balance: (Number(account.balance) || 0) + amount,
      };
    }

    return account;
  });
}

export function revertLiquidTransferInAccounts(accounts, transfer) {
  const amount = Number(transfer.amount) || 0;

  return accounts.map((account) => {
    if (account.id === transfer.sourceAccountId) {
      return {
        ...account,
        balance: (Number(account.balance) || 0) + amount,
      };
    }

    if (account.id === transfer.destinationAccountId) {
      return {
        ...account,
        balance: Math.max((Number(account.balance) || 0) - amount, 0),
      };
    }

    return account;
  });
}