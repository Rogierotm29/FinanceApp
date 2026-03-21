import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import {
  clamp,
  monthToWeekly,
  getBudgetPlan,
  applyExpenseToAccount,
  revertExpenseFromAccount,
  getAccountTotals,
  getHealthSnapshot,
} from "@/lib/finance";

import {
  STORAGE_KEY,
  LIQUID_ACCOUNT_TYPES,
  INVESTMENT_ACCOUNT_TYPES,
  CREDIT_ACCOUNT_TYPES,
  defaultProfile,
} from "@/lib/constants";

import {
  getLocalDateString,
  normalizeAccount,
  normalizeLoadedData,
} from "@/lib/storage";

import {
  applyInvestmentMoveToAccounts,
  revertInvestmentMoveInAccounts,
} from "@/lib/investments";

import {
  applyCardPaymentToAccounts,
  revertCardPaymentInAccounts,
  applyCreditLimitUpdate,
  revertCreditLimitUpdate,
} from "@/lib/credit";

import {
  applyLiquidDepositToAccounts,
  revertLiquidDepositInAccounts,
  applyLiquidTransferToAccounts,
  revertLiquidTransferInAccounts,
} from "@/lib/liquid-accounts";

import {
  PIN_STORAGE_KEY,
  MAX_PIN_ATTEMPTS,
  LOCKOUT_DURATION_MS,
  hashPin,
  verifyPin,
} from "@/lib/security";

function getDemoData() {
  return normalizeLoadedData({
    profile: {
      name: "Ricardo",
      monthlyIncome: 32000,
      fixedExpenses: 12500,
      savingsGoal: 100000,
      emergencyFundMonths: 4,
      investmentRate: 18,
      method: "50/30/20",
    },
    accounts: [
      {
        name: "BBVA Nómina",
        type: "Debito",
        balance: 18400,
      },
      {
        name: "Fondo ahorro",
        type: "Ahorro",
        balance: 6500,
      },
      {
        name: "Efectivo",
        type: "Efectivo",
        balance: 1200,
      },
      {
        name: "NU Crédito",
        type: "Credito",
        balance: 3900,
        creditLimit: 18000,
        cutoffDay: 25,
        dueDay: 10,
      },
      {
        name: "GBM",
        type: "Inversion",
        balance: 28600,
        monthlyContribution: 4500,
        profit: 2600,
      },
    ],
    expenses: [
      {
        concept: "Supermercado",
        category: "Comida",
        amount: 1800,
        date: getLocalDateString(),
        accountName: "BBVA Nómina",
      },
      {
        concept: "Gasolina",
        category: "Transporte",
        amount: 950,
        date: getLocalDateString(),
        accountName: "BBVA Nómina",
      },
      {
        concept: "Spotify y herramientas",
        category: "Suscripciones",
        amount: 680,
        date: getLocalDateString(),
        accountName: "NU Crédito",
      },
    ],
    goals: [
      { name: "Fondo de emergencia", amount: 50000 },
      { name: "Meta de inversión anual", amount: 70000 },
      { name: "Viaje / proyecto personal", amount: 25000 },
    ],
    cardPaymentsHistory: [],
    creditLimitHistory: [],
    liquidDepositHistory: [],
    liquidTransferHistory: [],
    investmentMoveHistory: [],
  });
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);

  const [profile, setProfile] = useState(defaultProfile);
  const [accounts, setAccounts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [goals, setGoals] = useState([]);

  const [newAccount, setNewAccount] = useState({
    name: "",
    type: "Debito",
    balance: "",
    creditLimit: "",
    cutoffDay: "",
    dueDay: "",
    monthlyContribution: "",
    profit: "",
  });

  const [newExpense, setNewExpense] = useState({
    concept: "",
    category: "Comida",
    amount: "",
    accountId: "",
    accountName: "",
    date: getLocalDateString(),
  });

  const [newGoal, setNewGoal] = useState({ name: "", amount: "" });

  const [cardPayment, setCardPayment] = useState({
    creditAccountId: "",
    sourceAccountId: "",
    amount: "",
    date: getLocalDateString(),
  });

  const [creditLimitForm, setCreditLimitForm] = useState({
    creditAccountId: "",
    newLimit: "",
    date: getLocalDateString(),
  });

  const [liquidDepositForm, setLiquidDepositForm] = useState({
    accountId: "",
    amount: "",
    concept: "",
    date: getLocalDateString(),
  });

  const [liquidTransferForm, setLiquidTransferForm] = useState({
    sourceAccountId: "",
    destinationAccountId: "",
    amount: "",
    concept: "",
    date: getLocalDateString(),
  });

  const [investmentMoveForm, setInvestmentMoveForm] = useState({
    investmentAccountId: "",
    liquidAccountId: "",
    type: "aporte",
    amount: "",
    concept: "",
    date: getLocalDateString(),
  });

  const [cardPaymentsHistory, setCardPaymentsHistory] = useState([]);
  const [creditLimitHistory, setCreditLimitHistory] = useState([]);
  const [liquidDepositHistory, setLiquidDepositHistory] = useState([]);
  const [liquidTransferHistory, setLiquidTransferHistory] = useState([]);
  const [investmentMoveHistory, setInvestmentMoveHistory] = useState([]);

  const [editMode, setEditMode] = useState(false);

  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const [accessPin, setAccessPin] = useState("");
  const [savedPin, setSavedPin] = useState("");
  const [pinAttempts, setPinAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    type: "",
    id: "",
    title: "",
    description: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const importRef = useRef(null);

  const showSuccess = (msg) => { setStatusMessage(msg); setStatusType("success"); };
  const showError = (msg) => { setStatusMessage(msg); setStatusType("error"); };

  // Load data on mount
  useEffect(() => {
    setMounted(true);

    // Load PIN - support migration from plain text to hash
    const legacyPin = localStorage.getItem("finance-app-pin") || "";
    const hashedPin = localStorage.getItem(PIN_STORAGE_KEY) || "";

    if (legacyPin && !hashedPin) {
      // Migrate: hash the plain text PIN and store as hash
      hashPin(legacyPin).then((hash) => {
        localStorage.setItem(PIN_STORAGE_KEY, hash);
        localStorage.removeItem("finance-app-pin");
        setSavedPin(hash);
        setIsAppUnlocked(false);
      });
    } else if (hashedPin) {
      setSavedPin(hashedPin);
      setIsAppUnlocked(false);
    } else {
      setSavedPin("");
      setIsAppUnlocked(true);
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const empty = normalizeLoadedData({}, defaultProfile);
        setGoals(empty.goals);
        setCardPaymentsHistory(empty.cardPaymentsHistory);
        setCreditLimitHistory(empty.creditLimitHistory);
        setLiquidDepositHistory(empty.liquidDepositHistory);
        setLiquidTransferHistory(empty.liquidTransferHistory);
        setInvestmentMoveHistory(empty.investmentMoveHistory);
        return;
      }

      const parsed = JSON.parse(raw);
      const normalized = normalizeLoadedData(parsed, defaultProfile);

      setProfile(normalized.profile);
      setAccounts(normalized.accounts);
      setExpenses(normalized.expenses);
      setGoals(normalized.goals);
      setCardPaymentsHistory(normalized.cardPaymentsHistory);
      setCreditLimitHistory(normalized.creditLimitHistory);
      setLiquidDepositHistory(normalized.liquidDepositHistory);
      setLiquidTransferHistory(normalized.liquidTransferHistory);
      setInvestmentMoveHistory(normalized.investmentMoveHistory);

      if (normalized.profile?.name) {
        setStep(4);
      }
    } catch {
      const empty = normalizeLoadedData({}, defaultProfile);
      setGoals(empty.goals);
      setCardPaymentsHistory(empty.cardPaymentsHistory);
      setCreditLimitHistory(empty.creditLimitHistory);
      setLiquidDepositHistory(empty.liquidDepositHistory);
      setLiquidTransferHistory(empty.liquidTransferHistory);
      setInvestmentMoveHistory(empty.investmentMoveHistory);
    }
  }, []);

  // Persist data on changes
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profile,
        accounts,
        expenses,
        goals,
        cardPaymentsHistory,
        creditLimitHistory,
        liquidDepositHistory,
        liquidTransferHistory,
        investmentMoveHistory,
      })
    );
  }, [
    mounted,
    profile,
    accounts,
    expenses,
    goals,
    cardPaymentsHistory,
    creditLimitHistory,
    liquidDepositHistory,
    liquidTransferHistory,
    investmentMoveHistory,
  ]);

  // Auto-clear status message
  useEffect(() => {
    if (!statusMessage) return;
    const timeout = setTimeout(() => setStatusMessage(""), 2600);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

  // --- Computed values ---

  const totals = useMemo(() => getAccountTotals(accounts), [accounts]);

  const totalExpenses = useMemo(
    () => expenses.reduce((acc, item) => acc + (Number(item.amount) || 0), 0),
    [expenses]
  );

  const totalGoals = useMemo(
    () => goals.reduce((acc, item) => acc + (Number(item.amount) || 0), 0),
    [goals]
  );

  const plan = useMemo(
    () =>
      getBudgetPlan(
        profile.monthlyIncome,
        profile.fixedExpenses,
        profile.investmentRate,
        profile.method
      ),
    [profile]
  );

  const committedThisMonth =
    (Number(profile.fixedExpenses) || 0) + totalExpenses;
  const availableThisMonth =
    (Number(profile.monthlyIncome) || 0) - committedThisMonth;
  const weeklyInvestment =
    plan.investment > 0 ? monthToWeekly(plan.investment) : 0;
  const emergencyTarget =
    (Number(profile.fixedExpenses) || 0) *
    (Number(profile.emergencyFundMonths) || 0);
  const emergencyProgress =
    emergencyTarget > 0
      ? Math.min((totals.liquid / emergencyTarget) * 100, 100)
      : 0;
  const netWorth = totals.liquid + totals.investment - totals.creditDebt;
  const savingsGoalProgress =
    Number(profile.savingsGoal) > 0
      ? Math.min(
          ((totals.liquid + totals.investment) /
            Number(profile.savingsGoal)) *
            100,
          100
        )
      : 0;
  const creditUsage =
    totals.creditLimit > 0
      ? Math.min((totals.creditDebt / totals.creditLimit) * 100, 100)
      : 0;

  const healthSnapshot = useMemo(
    () =>
      getHealthSnapshot({
        emergencyProgress,
        creditUsage,
        availableThisMonth,
        configuredInvestment: totals.configuredInvestment,
        targetInvestment: plan.investment,
      }),
    [
      emergencyProgress,
      creditUsage,
      availableThisMonth,
      totals.configuredInvestment,
      plan.investment,
    ]
  );

  const expenseByCategory = useMemo(() => {
    const map = new Map();
    expenses.forEach((item) => {
      const current = map.get(item.category) || 0;
      map.set(item.category, current + (Number(item.amount) || 0));
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [expenses]);

  const budgetBars = useMemo(
    () => [
      { name: "Ingreso", value: Number(profile.monthlyIncome) || 0 },
      { name: "Fijos", value: Number(profile.fixedExpenses) || 0 },
      { name: "Variables", value: totalExpenses },
      { name: "Invertir", value: plan.investment },
    ],
    [profile.monthlyIncome, profile.fixedExpenses, totalExpenses, plan.investment]
  );

  const groupedAccounts = useMemo(
    () => ({
      liquidas: accounts.filter((account) =>
        LIQUID_ACCOUNT_TYPES.includes(account.type)
      ),
      inversion: accounts.filter((account) =>
        INVESTMENT_ACCOUNT_TYPES.includes(account.type)
      ),
      credito: accounts.filter((account) =>
        CREDIT_ACCOUNT_TYPES.includes(account.type)
      ),
    }),
    [accounts]
  );

  const creditCards = groupedAccounts.credito;
  const paymentSourceAccounts = groupedAccounts.liquidas;
  const investmentAccounts = groupedAccounts.inversion;
  const liquidAccounts = groupedAccounts.liquidas;

  const investmentSummary = useMemo(() => {
    const aporte = investmentMoveHistory
      .filter((item) => item.type === "aporte")
      .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    const retiro = investmentMoveHistory
      .filter((item) => item.type === "retiro")
      .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    const rendimiento = investmentMoveHistory
      .filter((item) => item.type === "rendimiento")
      .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    const minusvalia = investmentMoveHistory
      .filter((item) => item.type === "minusvalia")
      .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    return {
      aporte,
      retiro,
      rendimiento,
      minusvalia,
      neto: rendimiento - minusvalia,
    };
  }, [investmentMoveHistory]);

  // --- Handlers ---

  const addAccount = () => {
    if (!newAccount.name || newAccount.balance === "") return;

    const account = normalizeAccount({
      ...newAccount,
      balance: Number(newAccount.balance),
      creditLimit: Number(newAccount.creditLimit) || 0,
      cutoffDay: Number(newAccount.cutoffDay) || 0,
      dueDay: Number(newAccount.dueDay) || 0,
      monthlyContribution: Number(newAccount.monthlyContribution) || 0,
      profit: Number(newAccount.profit) || 0,
    });

    setAccounts((prev) => [account, ...prev]);

    setNewAccount({
      name: "",
      type: "Debito",
      balance: "",
      creditLimit: "",
      cutoffDay: "",
      dueDay: "",
      monthlyContribution: "",
      profit: "",
    });

    showSuccess("Cuenta guardada.");
  };

  const addExpense = () => {
    if (!newExpense.concept || !newExpense.amount) return;

    const selectedAccount = accounts.find(
      (account) => account.id === newExpense.accountId
    );
    const amount = Number(newExpense.amount);

    if (selectedAccount) {
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === selectedAccount.id
            ? applyExpenseToAccount(account, amount)
            : account
        )
      );
    }

    setExpenses((prev) => [
      {
        id: crypto.randomUUID(),
        concept: newExpense.concept,
        category: newExpense.category,
        amount,
        accountId: selectedAccount?.id || "",
        accountName: selectedAccount?.name || "",
        date: newExpense.date,
      },
      ...prev,
    ]);

    setNewExpense({
      concept: "",
      category: "Comida",
      amount: "",
      accountId: "",
      accountName: "",
      date: getLocalDateString(),
    });

    showSuccess("Gasto registrado.");
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.amount) return;

    setGoals((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newGoal.name,
        amount: Number(newGoal.amount),
      },
    ]);

    setNewGoal({ name: "", amount: "" });
    showSuccess("Meta agregada.");
  };

  const handleCardPayment = () => {
    if (
      !cardPayment.creditAccountId ||
      !cardPayment.sourceAccountId ||
      !cardPayment.amount
    )
      return;

    const paymentAmount = Number(cardPayment.amount);

    const creditAccount = accounts.find(
      (account) => account.id === cardPayment.creditAccountId
    );

    const sourceAccount = accounts.find(
      (account) => account.id === cardPayment.sourceAccountId
    );

    if (!creditAccount || !sourceAccount) {
      showError("Selecciona cuentas válidas.");
      return;
    }

    if (cardPayment.creditAccountId === cardPayment.sourceAccountId) {
      showError("No puedes pagar una tarjeta desde la misma cuenta.");
      return;
    }

    if (paymentAmount <= 0) {
      showError("El monto debe ser mayor a 0.");
      return;
    }

    if (paymentAmount > (Number(creditAccount.balance) || 0)) {
      showError("No puedes pagar más de lo que debes en la tarjeta.");
      return;
    }

    if (paymentAmount > (Number(sourceAccount.balance) || 0)) {
      showError("No tienes suficiente saldo en la cuenta origen.");
      return;
    }

    setAccounts((prev) =>
      applyCardPaymentToAccounts(prev, {
        creditAccountId: cardPayment.creditAccountId,
        sourceAccountId: cardPayment.sourceAccountId,
        amount: paymentAmount,
      })
    );
    setCardPaymentsHistory((prev) => [
      {
        id: crypto.randomUUID(),
        creditAccountId: creditAccount.id,
        creditAccountName: creditAccount.name,
        sourceAccountId: sourceAccount.id,
        sourceAccountName: sourceAccount.name,
        amount: paymentAmount,
        date: cardPayment.date,
      },
      ...prev,
    ]);

    setCardPayment({
      creditAccountId: "",
      sourceAccountId: "",
      amount: "",
      date: getLocalDateString(),
    });

    showSuccess("Pago de tarjeta registrado.");
  };

  const handleCreditLimitUpdate = () => {
    if (!creditLimitForm.creditAccountId || !creditLimitForm.newLimit) return;

    const newLimit = Number(creditLimitForm.newLimit);

    const creditAccount = accounts.find(
      (account) => account.id === creditLimitForm.creditAccountId
    );

    if (!creditAccount) {
      showError("Selecciona una tarjeta válida.");
      return;
    }

    if (newLimit <= 0) {
      showError("La línea de crédito debe ser mayor a 0.");
      return;
    }

    setAccounts((prev) =>
      applyCreditLimitUpdate(prev, {
        creditAccountId: creditLimitForm.creditAccountId,
        newLimit,
      })
    );
    setCreditLimitHistory((prev) => [
      {
        id: crypto.randomUUID(),
        creditAccountId: creditAccount.id,
        creditAccountName: creditAccount.name,
        oldLimit: Number(creditAccount.creditLimit) || 0,
        newLimit,
        date: creditLimitForm.date,
      },
      ...prev,
    ]);

    setCreditLimitForm({
      creditAccountId: "",
      newLimit: "",
      date: getLocalDateString(),
    });

    showSuccess("Línea de crédito actualizada.");
  };

  const handleLiquidDeposit = () => {
    if (!liquidDepositForm.accountId || !liquidDepositForm.amount) return;

    const depositAmount = Number(liquidDepositForm.amount);
    const account = accounts.find((item) => item.id === liquidDepositForm.accountId);

    if (!account) {
      showError("Selecciona una cuenta válida.");
      return;
    }

    if (!LIQUID_ACCOUNT_TYPES.includes(account.type)) {
      showError("Solo puedes depositar a cuentas líquidas.");
      return;
    }

    if (depositAmount <= 0) {
      showError("El monto debe ser mayor a 0.");
      return;
    }

    setAccounts((prev) =>
      applyLiquidDepositToAccounts(prev, {
        accountId: liquidDepositForm.accountId,
        amount: depositAmount,
      })
    );
    setLiquidDepositHistory((prev) => [
      {
        id: crypto.randomUUID(),
        accountId: account.id,
        accountName: account.name,
        amount: depositAmount,
        concept: liquidDepositForm.concept || "Depósito",
        date: liquidDepositForm.date,
      },
      ...prev,
    ]);

    setLiquidDepositForm({
      accountId: "",
      amount: "",
      concept: "",
      date: getLocalDateString(),
    });

    showSuccess("Depósito registrado.");
  };

  const handleLiquidTransfer = () => {
    if (
      !liquidTransferForm.sourceAccountId ||
      !liquidTransferForm.destinationAccountId ||
      !liquidTransferForm.amount
    )
      return;

    const transferAmount = Number(liquidTransferForm.amount);

    const source = accounts.find(
      (item) => item.id === liquidTransferForm.sourceAccountId
    );
    const destination = accounts.find(
      (item) => item.id === liquidTransferForm.destinationAccountId
    );

    if (!source || !destination) {
      showError("Selecciona cuentas válidas.");
      return;
    }

    if (
      !LIQUID_ACCOUNT_TYPES.includes(source.type) ||
      !LIQUID_ACCOUNT_TYPES.includes(destination.type)
    ) {
      showError("Solo puedes transferir entre cuentas líquidas.");
      return;
    }

    if (source.id === destination.id) {
      showError("La cuenta origen y destino no pueden ser la misma.");
      return;
    }

    if (transferAmount <= 0) {
      showError("El monto debe ser mayor a 0.");
      return;
    }

    if (transferAmount > (Number(source.balance) || 0)) {
      showError("No tienes suficiente saldo en la cuenta origen.");
      return;
    }

    setAccounts((prev) =>
      applyLiquidTransferToAccounts(prev, {
        sourceAccountId: source.id,
        destinationAccountId: destination.id,
        amount: transferAmount,
      })
    );

    setLiquidTransferHistory((prev) => [
      {
        id: crypto.randomUUID(),
        sourceAccountId: source.id,
        sourceAccountName: source.name,
        destinationAccountId: destination.id,
        destinationAccountName: destination.name,
        amount: transferAmount,
        concept: liquidTransferForm.concept || "Transferencia",
        date: liquidTransferForm.date,
      },
      ...prev,
    ]);

    setLiquidTransferForm({
      sourceAccountId: "",
      destinationAccountId: "",
      amount: "",
      concept: "",
      date: getLocalDateString(),
    });

    showSuccess("Transferencia registrada.");
  };

  const handleInvestmentMove = () => {
    if (!investmentMoveForm.investmentAccountId || !investmentMoveForm.amount) return;

    const amount = Number(investmentMoveForm.amount);
    const investmentAccount = accounts.find(
      (item) => item.id === investmentMoveForm.investmentAccountId
    );
    const liquidAccount = accounts.find(
      (item) => item.id === investmentMoveForm.liquidAccountId
    );

    if (!investmentAccount || investmentAccount.type !== "Inversion") {
      showError("Selecciona una inversión válida.");
      return;
    }

    if (amount <= 0) {
      showError("El monto debe ser mayor a 0.");
      return;
    }

    if (
      (investmentMoveForm.type === "aporte" || investmentMoveForm.type === "retiro") &&
      !investmentMoveForm.liquidAccountId
    ) {
      showError("Selecciona la cuenta líquida relacionada.");
      return;
    }

    if (
      (investmentMoveForm.type === "aporte" || investmentMoveForm.type === "retiro") &&
      (!liquidAccount || !LIQUID_ACCOUNT_TYPES.includes(liquidAccount.type))
    ) {
      showError("Selecciona una cuenta líquida válida.");
      return;
    }

    setAccounts((prev) =>
      applyInvestmentMoveToAccounts(prev, {
        investmentAccountId: investmentAccount.id,
        liquidAccountId: liquidAccount?.id || "",
        type: investmentMoveForm.type,
        amount,
      })
    );

    setInvestmentMoveHistory((prev) => [
      {
        id: crypto.randomUUID(),
        investmentAccountId: investmentAccount.id,
        investmentAccountName: investmentAccount.name,
        liquidAccountId: liquidAccount?.id || "",
        liquidAccountName: liquidAccount?.name || "",
        type: investmentMoveForm.type,
        amount,
        concept: investmentMoveForm.concept || "Movimiento de inversión",
        date: investmentMoveForm.date,
      },
      ...prev,
    ]);

    setInvestmentMoveForm({
      investmentAccountId: "",
      liquidAccountId: "",
      type: "aporte",
      amount: "",
      concept: "",
      date: getLocalDateString(),
    });

    showSuccess("Movimiento de inversión registrado.");
  };

  const removeAccount = (id) => {
    setAccounts((prev) => prev.filter((item) => item.id !== id));
    showSuccess("Cuenta eliminada.");
  };

  const removeExpense = (id) => {
    const expenseToRemove = expenses.find((expense) => expense.id === id);

    if (expenseToRemove?.accountId) {
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === expenseToRemove.accountId
            ? revertExpenseFromAccount(account, expenseToRemove.amount)
            : account
        )
      );
    }

    setExpenses((prev) => prev.filter((item) => item.id !== id));
    showSuccess("Gasto eliminado.");
  };

  const removeGoal = (id) => {
    setGoals((prev) => prev.filter((item) => item.id !== id));
    showSuccess("Meta eliminada.");
  };

  const removeCardPayment = (id) => {
    const paymentToRemove = cardPaymentsHistory.find((payment) => payment.id === id);
    if (!paymentToRemove) return;

    setAccounts((prev) => revertCardPaymentInAccounts(prev, paymentToRemove));

    setCardPaymentsHistory((prev) =>
      prev.filter((payment) => payment.id !== id)
    );

    showSuccess("Pago eliminado y saldos revertidos.");
  };

  const removeCreditLimitChange = (id) => {
    const limitChange = creditLimitHistory.find((item) => item.id === id);
    if (!limitChange) return;

    setAccounts((prev) => revertCreditLimitUpdate(prev, limitChange));

    setCreditLimitHistory((prev) => prev.filter((item) => item.id !== id));
    showSuccess("Cambio de línea eliminado.");
  };

  const removeLiquidDeposit = (id) => {
    const deposit = liquidDepositHistory.find((item) => item.id === id);
    if (!deposit) return;

    setAccounts((prev) => revertLiquidDepositInAccounts(prev, deposit));

    setLiquidDepositHistory((prev) => prev.filter((item) => item.id !== id));
    showSuccess("Depósito eliminado y saldo revertido.");
  };

  const removeLiquidTransfer = (id) => {
    const transfer = liquidTransferHistory.find((item) => item.id === id);
    if (!transfer) return;

    setAccounts((prev) => revertLiquidTransferInAccounts(prev, transfer));

    setLiquidTransferHistory((prev) => prev.filter((item) => item.id !== id));
    showSuccess("Transferencia eliminada y saldos revertidos.");
  };

  const removeInvestmentMove = (id) => {
    const move = investmentMoveHistory.find((item) => item.id === id);
    if (!move) return;

    setAccounts((prev) => revertInvestmentMoveInAccounts(prev, move));

    setInvestmentMoveHistory((prev) => prev.filter((item) => item.id !== id));
    showSuccess("Movimiento de inversión eliminado y saldos revertidos.");
  };

  const openDeleteConfirm = (type, id, title, description) => {
    setConfirmDelete({
      open: true,
      type,
      id,
      title,
      description,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirmDelete.id || !confirmDelete.type) return;

    if (confirmDelete.type === "account") removeAccount(confirmDelete.id);
    if (confirmDelete.type === "expense") removeExpense(confirmDelete.id);
    if (confirmDelete.type === "goal") removeGoal(confirmDelete.id);
    if (confirmDelete.type === "cardPayment") removeCardPayment(confirmDelete.id);
    if (confirmDelete.type === "creditLimitChange")
      removeCreditLimitChange(confirmDelete.id);
    if (confirmDelete.type === "deposit")
      removeLiquidDeposit(confirmDelete.id);
    if (confirmDelete.type === "transfer")
      removeLiquidTransfer(confirmDelete.id);
    if (confirmDelete.type === "investmentMove")
      removeInvestmentMove(confirmDelete.id);

    setConfirmDelete({
      open: false,
      type: "",
      id: "",
      title: "",
      description: "",
    });
  };

  const resetAll = () => {
    const empty = normalizeLoadedData({}, defaultProfile);
    setProfile(defaultProfile);
    setAccounts([]);
    setExpenses([]);
    setGoals(empty.goals);
    setCardPaymentsHistory([]);
    setCreditLimitHistory([]);
    setLiquidDepositHistory([]);
    setLiquidTransferHistory([]);
    setInvestmentMoveHistory([]);
    setStep(1);
    localStorage.removeItem(STORAGE_KEY);
    showSuccess("Datos reiniciados.");
  };

  const loadDemo = () => {
    const demo = getDemoData();
    setProfile(demo.profile);
    setAccounts(demo.accounts);
    setExpenses(demo.expenses);
    setGoals(demo.goals);
    setCardPaymentsHistory(demo.cardPaymentsHistory);
    setCreditLimitHistory(demo.creditLimitHistory);
    setLiquidDepositHistory(demo.liquidDepositHistory);
    setLiquidTransferHistory(demo.liquidTransferHistory);
    setInvestmentMoveHistory(demo.investmentMoveHistory);
    setStep(4);
    showSuccess("Datos demo cargados.");
  };

  const exportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile,
      accounts,
      expenses,
      goals,
      cardPaymentsHistory,
      creditLimitHistory,
      liquidDepositHistory,
      liquidTransferHistory,
      investmentMoveHistory,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `money-manager-backup-${getLocalDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess("Respaldo exportado.");
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const normalized = normalizeLoadedData(parsed, defaultProfile);

      setProfile(normalized.profile);
      setAccounts(normalized.accounts);
      setExpenses(normalized.expenses);
      setGoals(normalized.goals);
      setCardPaymentsHistory(normalized.cardPaymentsHistory);
      setCreditLimitHistory(normalized.creditLimitHistory);
      setLiquidDepositHistory(normalized.liquidDepositHistory);
      setLiquidTransferHistory(normalized.liquidTransferHistory);
      setInvestmentMoveHistory(normalized.investmentMoveHistory);
      setStep(normalized.profile?.name ? 4 : 1);
      showSuccess("Respaldo importado.");
    } catch {
      showError("No se pudo importar el archivo.");
    } finally {
      if (event.target) event.target.value = "";
    }
  };

  const handleSavePin = async () => {
    const cleanPin = accessPin.trim();

    if (!/^\d{4,6}$/.test(cleanPin)) {
      showError("El PIN debe tener entre 4 y 6 números.");
      return;
    }

    const hash = await hashPin(cleanPin);
    localStorage.setItem(PIN_STORAGE_KEY, hash);
    // Remove legacy plain-text key if present
    localStorage.removeItem("finance-app-pin");
    setSavedPin(hash);
    setIsAppUnlocked(true);
    setAccessPin("");
    showSuccess("PIN guardado correctamente.");
  };

  const handleUnlockApp = async () => {
    const cleanPin = accessPin.trim();

    if (!savedPin) {
      setIsAppUnlocked(true);
      return;
    }

    // Check lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      showError("App bloqueada temporalmente. Intenta más tarde.");
      return;
    }

    const isValid = await verifyPin(cleanPin, savedPin);

    if (!isValid) {
      const newAttempts = pinAttempts + 1;
      setPinAttempts(newAttempts);

      if (newAttempts >= MAX_PIN_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutUntil(lockUntil);
        setPinAttempts(0);
        showError("Demasiados intentos. App bloqueada por 5 minutos.");
      } else {
        showError("PIN incorrecto.");
      }
      return;
    }

    setIsAppUnlocked(true);
    setAccessPin("");
    setPinAttempts(0);
    setLockoutUntil(null);
    showSuccess("App desbloqueada.");
  };

  const handleLockApp = () => {
    setIsAppUnlocked(false);
    setAccessPin("");
    showSuccess("App bloqueada.");
  };

  const handleRemovePin = () => {
    localStorage.removeItem(PIN_STORAGE_KEY);
    localStorage.removeItem("finance-app-pin");
    setSavedPin("");
    setAccessPin("");
    setIsAppUnlocked(true);
    showSuccess("PIN eliminado.");
  };

  return (
    <AppContext.Provider
      value={{
        // State
        mounted,
        step,
        setStep,
        profile,
        setProfile,
        accounts,
        setAccounts,
        expenses,
        setExpenses,
        goals,
        setGoals,
        newAccount,
        setNewAccount,
        newExpense,
        setNewExpense,
        newGoal,
        setNewGoal,
        cardPayment,
        setCardPayment,
        creditLimitForm,
        setCreditLimitForm,
        liquidDepositForm,
        setLiquidDepositForm,
        liquidTransferForm,
        setLiquidTransferForm,
        investmentMoveForm,
        setInvestmentMoveForm,
        cardPaymentsHistory,
        setCardPaymentsHistory,
        creditLimitHistory,
        setCreditLimitHistory,
        liquidDepositHistory,
        setLiquidDepositHistory,
        liquidTransferHistory,
        setLiquidTransferHistory,
        investmentMoveHistory,
        setInvestmentMoveHistory,
        editMode,
        setEditMode,
        isAppUnlocked,
        setIsAppUnlocked,
        accessPin,
        setAccessPin,
        savedPin,
        setSavedPin,
        pinAttempts,
        setPinAttempts,
        lockoutUntil,
        setLockoutUntil,
        confirmDelete,
        setConfirmDelete,
        statusMessage,
        setStatusMessage,
        statusType,
        importRef,

        // Computed values
        totals,
        totalExpenses,
        totalGoals,
        plan,
        committedThisMonth,
        availableThisMonth,
        weeklyInvestment,
        emergencyTarget,
        emergencyProgress,
        netWorth,
        savingsGoalProgress,
        creditUsage,
        healthSnapshot,
        expenseByCategory,
        budgetBars,
        groupedAccounts,
        creditCards,
        paymentSourceAccounts,
        investmentAccounts,
        liquidAccounts,
        investmentSummary,

        // Handlers
        addAccount,
        addExpense,
        addGoal,
        handleCardPayment,
        handleCreditLimitUpdate,
        handleLiquidDeposit,
        handleLiquidTransfer,
        handleInvestmentMove,
        removeAccount,
        removeExpense,
        removeGoal,
        removeCardPayment,
        removeCreditLimitChange,
        removeLiquidDeposit,
        removeLiquidTransfer,
        removeInvestmentMove,
        openDeleteConfirm,
        handleConfirmDelete,
        resetAll,
        loadDemo,
        exportBackup,
        handleImportFile,
        handleSavePin,
        handleUnlockApp,
        handleLockApp,
        handleRemovePin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
