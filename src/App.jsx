import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Landmark,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Receipt,
  Plus,
  Trash2,
  PencilLine,
  Target,
  BadgeDollarSign,
  CircleDollarSign,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Download,
  Upload,
  Sparkles,
  ArrowRightLeft,
  Banknote,
  BarChart3 as ChartNoAxesCombined,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  accountTypes,
  expenseCategories,
  LIQUID_ACCOUNT_TYPES,
  INVESTMENT_ACCOUNT_TYPES,
  CREDIT_ACCOUNT_TYPES,
  chartColors,
  defaultProfile,
} from "@/lib/constants";

import {
  getLocalDateString,
  normalizeAccount,
  normalizeLoadedData,
} from "@/lib/storage";

import StatCard from "@/components/dashboard/StatCard";

import InvestmentSummaryCards from "@/components/investments/InvestmentSummaryCards";

import LockScreen from "@/components/security/LockScreen";

import SectionCard from "@/components/common/SectionCard";

import AccountBadge from "@/components/accounts/AccountBadge";
import {
  getAccountValueLabel,
  getAccountPlaceholder,
  getAccountHelpText,
} from "@/lib/account-ui";

import { currency, getInvestmentTypeLabel } from "@/lib/formatters";

import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

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





export default function App() {
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
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    type: "",
    id: "",
    title: "",
    description: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const importRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    const localPin = localStorage.getItem("finance-app-pin") || "";
    setSavedPin(localPin);
    setIsAppUnlocked(!localPin);
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
    } catch (error) {
      console.error(error);
      const empty = normalizeLoadedData({}, defaultProfile);
      setGoals(empty.goals);
      setCardPaymentsHistory(empty.cardPaymentsHistory);
      setCreditLimitHistory(empty.creditLimitHistory);
      setLiquidDepositHistory(empty.liquidDepositHistory);
      setLiquidTransferHistory(empty.liquidTransferHistory);
      setInvestmentMoveHistory(empty.investmentMoveHistory);
    }
  }, []);

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

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = setTimeout(() => setStatusMessage(""), 2600);
    return () => clearTimeout(timeout);
  }, [statusMessage]);

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

    setStatusMessage("Cuenta guardada.");
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

    setStatusMessage("Gasto registrado.");
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
    setStatusMessage("Meta agregada.");
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
      setStatusMessage("Selecciona cuentas válidas.");
      return;
    }

    if (cardPayment.creditAccountId === cardPayment.sourceAccountId) {
      setStatusMessage("No puedes pagar una tarjeta desde la misma cuenta.");
      return;
    }

    if (paymentAmount <= 0) {
      setStatusMessage("El monto debe ser mayor a 0.");
      return;
    }

    if (paymentAmount > (Number(creditAccount.balance) || 0)) {
      setStatusMessage("No puedes pagar más de lo que debes en la tarjeta.");
      return;
    }

    if (paymentAmount > (Number(sourceAccount.balance) || 0)) {
      setStatusMessage("No tienes suficiente saldo en la cuenta origen.");
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

    setStatusMessage("Pago de tarjeta registrado.");
  };

  const handleCreditLimitUpdate = () => {
    if (!creditLimitForm.creditAccountId || !creditLimitForm.newLimit) return;

    const newLimit = Number(creditLimitForm.newLimit);

    const creditAccount = accounts.find(
      (account) => account.id === creditLimitForm.creditAccountId
    );

    if (!creditAccount) {
      setStatusMessage("Selecciona una tarjeta válida.");
      return;
    }

    if (newLimit <= 0) {
      setStatusMessage("La línea de crédito debe ser mayor a 0.");
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

    setStatusMessage("Línea de crédito actualizada.");
  };

  const handleLiquidDeposit = () => {
    if (!liquidDepositForm.accountId || !liquidDepositForm.amount) return;

    const depositAmount = Number(liquidDepositForm.amount);
    const account = accounts.find((item) => item.id === liquidDepositForm.accountId);

    if (!account) {
      setStatusMessage("Selecciona una cuenta válida.");
      return;
    }

    if (!LIQUID_ACCOUNT_TYPES.includes(account.type)) {
      setStatusMessage("Solo puedes depositar a cuentas líquidas.");
      return;
    }

    if (depositAmount <= 0) {
      setStatusMessage("El monto debe ser mayor a 0.");
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

    setStatusMessage("Depósito registrado.");
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
      setStatusMessage("Selecciona cuentas válidas.");
      return;
    }

    if (
      !LIQUID_ACCOUNT_TYPES.includes(source.type) ||
      !LIQUID_ACCOUNT_TYPES.includes(destination.type)
    ) {
      setStatusMessage("Solo puedes transferir entre cuentas líquidas.");
      return;
    }

    if (source.id === destination.id) {
      setStatusMessage("La cuenta origen y destino no pueden ser la misma.");
      return;
    }

    if (transferAmount <= 0) {
      setStatusMessage("El monto debe ser mayor a 0.");
      return;
    }

    if (transferAmount > (Number(source.balance) || 0)) {
      setStatusMessage("No tienes suficiente saldo en la cuenta origen.");
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

    setStatusMessage("Transferencia registrada.");
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
      setStatusMessage("Selecciona una inversión válida.");
      return;
    }

    if (amount <= 0) {
      setStatusMessage("El monto debe ser mayor a 0.");
      return;
    }

    if (
      (investmentMoveForm.type === "aporte" || investmentMoveForm.type === "retiro") &&
      !investmentMoveForm.liquidAccountId
    ) {
      setStatusMessage("Selecciona la cuenta líquida relacionada.");
      return;
    }

    if (
      (investmentMoveForm.type === "aporte" || investmentMoveForm.type === "retiro") &&
      (!liquidAccount || !LIQUID_ACCOUNT_TYPES.includes(liquidAccount.type))
    ) {
      setStatusMessage("Selecciona una cuenta líquida válida.");
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

    setStatusMessage("Movimiento de inversión registrado.");
  };

  const removeAccount = (id) => {
    setAccounts((prev) => prev.filter((item) => item.id !== id));
    setStatusMessage("Cuenta eliminada.");
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
    setStatusMessage("Gasto eliminado.");
  };

  const removeGoal = (id) => {
    setGoals((prev) => prev.filter((item) => item.id !== id));
    setStatusMessage("Meta eliminada.");
  };

  const removeCardPayment = (id) => {
    const paymentToRemove = cardPaymentsHistory.find((payment) => payment.id === id);
    if (!paymentToRemove) return;

    setAccounts((prev) => revertCardPaymentInAccounts(prev, paymentToRemove));

    setCardPaymentsHistory((prev) =>
      prev.filter((payment) => payment.id !== id)
    );

    setStatusMessage("Pago eliminado y saldos revertidos.");
  };

  const removeCreditLimitChange = (id) => {
    const limitChange = creditLimitHistory.find((item) => item.id === id);
    if (!limitChange) return;

    setAccounts((prev) => revertCreditLimitUpdate(prev, limitChange));

    setCreditLimitHistory((prev) => prev.filter((item) => item.id !== id));
    setStatusMessage("Cambio de línea eliminado.");
  };

  const removeLiquidDeposit = (id) => {
    const deposit = liquidDepositHistory.find((item) => item.id === id);
    if (!deposit) return;

    setAccounts((prev) => revertLiquidDepositInAccounts(prev, deposit));

    setLiquidDepositHistory((prev) => prev.filter((item) => item.id !== id));
    setStatusMessage("Depósito eliminado y saldo revertido.");
  };

  const removeLiquidTransfer = (id) => {
    const transfer = liquidTransferHistory.find((item) => item.id === id);
    if (!transfer) return;

    setAccounts((prev) => revertLiquidTransferInAccounts(prev, transfer));

    setLiquidTransferHistory((prev) => prev.filter((item) => item.id !== id));
    setStatusMessage("Transferencia eliminada y saldos revertidos.");
  };

  const removeInvestmentMove = (id) => {
    const move = investmentMoveHistory.find((item) => item.id === id);
    if (!move) return;

    setAccounts((prev) => revertInvestmentMoveInAccounts(prev, move));

    setInvestmentMoveHistory((prev) => prev.filter((item) => item.id !== id));
    setStatusMessage("Movimiento de inversión eliminado y saldos revertidos.");
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
    setStatusMessage("Datos reiniciados.");
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
    setStatusMessage("Datos demo cargados.");
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
    setStatusMessage("Respaldo exportado.");
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
      setStatusMessage("Respaldo importado.");
    } catch (error) {
      console.error(error);
      setStatusMessage("No se pudo importar el archivo.");
    } finally {
      if (event.target) event.target.value = "";
    }
  };

  const handleSavePin = () => {
  const cleanPin = accessPin.trim();

  if (!/^\d{4,6}$/.test(cleanPin)) {
    setStatusMessage("El PIN debe tener entre 4 y 6 números.");
    return;
  }

  localStorage.setItem("finance-app-pin", cleanPin);
  setSavedPin(cleanPin);
  setIsAppUnlocked(true);
  setAccessPin("");
  setStatusMessage("PIN guardado correctamente.");
};
const handleUnlockApp = () => {
  const cleanPin = accessPin.trim();

  if (!savedPin) {
    setIsAppUnlocked(true);
    return;
  }

  if (cleanPin !== savedPin) {
    setStatusMessage("PIN incorrecto.");
    return;
  }

  setIsAppUnlocked(true);
  setAccessPin("");
  setStatusMessage("App desbloqueada.");
};
const handleLockApp = () => {
  setIsAppUnlocked(false);
  setAccessPin("");
  setStatusMessage("App bloqueada.");
};

const handleRemovePin = () => {
  localStorage.removeItem("finance-app-pin");
  setSavedPin("");
  setAccessPin("");
  setIsAppUnlocked(true);
  setStatusMessage("PIN eliminado.");
};
  if (!mounted) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Cargando tu tablero financiero...
      </div>
    );
  }

if (!isAppUnlocked) {
  return (
    <LockScreen
      accessPin={accessPin}
      setAccessPin={setAccessPin}
      handleUnlockApp={handleUnlockApp}
    />
  );
}

  if (step < 4) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-sm">
              <BadgeDollarSign className="h-4 w-4" />
              Configuración inicial de tu dinero
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              Una app personal para manejar tu dinero
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Te pregunta tus datos, los guarda localmente, separa efectivo,
              crédito e inversión, y te ayuda a registrar movimientos reales.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={loadDemo}>
                <Sparkles className="mr-2 h-4 w-4" /> Cargar demo
              </Button>
              <Button
                variant="outline"
                onClick={() => importRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" /> Importar respaldo
              </Button>
              <input
                ref={importRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="rounded-3xl border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Paso {step} de 3</CardTitle>
                <CardDescription>
                  Completa esta parte para personalizar tus recomendaciones.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Progress value={(step / 3) * 100} />

                {step === 1 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2 md:col-span-2">
                      <Label>¿Cómo te llamas?</Label>
                      <Input
                        placeholder="Ej. Ricardo"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ingreso mensual aproximado</Label>
                      <Input
                        type="number"
                        placeholder="25000"
                        value={profile.monthlyIncome || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            monthlyIncome: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gastos fijos mensuales</Label>
                      <Input
                        type="number"
                        placeholder="12000"
                        value={profile.fixedExpenses || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            fixedExpenses: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Meta grande de ahorro o patrimonio</Label>
                      <Input
                        type="number"
                        placeholder="100000"
                        value={profile.savingsGoal || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            savingsGoal: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Meses para fondo de emergencia</Label>
                      <Input
                        type="number"
                        placeholder="3"
                        value={profile.emergencyFundMonths || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            emergencyFundMonths: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Porcentaje de inversión mensual</Label>
                      <Input
                        type="number"
                        placeholder="15"
                        value={profile.investmentRate || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            investmentRate: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Método base</Label>
                      <Select
                        value={profile.method}
                        onValueChange={(value) =>
                          setProfile((prev) => ({ ...prev, method: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un método" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50/30/20">
                            50 / 30 / 20
                          </SelectItem>
                          <SelectItem value="Personalizado">
                            Personalizado
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="font-semibold">Resumen inicial</h3>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-white p-3 text-sm">
                          <p className="text-slate-500">Nombre</p>
                          <p className="font-medium">
                            {profile.name || "Sin definir"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white p-3 text-sm">
                          <p className="text-slate-500">Ingreso mensual</p>
                          <p className="font-medium">
                            {currency.format(profile.monthlyIncome || 0)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white p-3 text-sm">
                          <p className="text-slate-500">Gastos fijos</p>
                          <p className="font-medium">
                            {currency.format(profile.fixedExpenses || 0)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-white p-3 text-sm">
                          <p className="text-slate-500">
                            Inversión semanal sugerida
                          </p>
                          <p className="font-medium">
                            {currency.format(
                              monthToWeekly(
                                getBudgetPlan(
                                  profile.monthlyIncome,
                                  profile.fixedExpenses,
                                  profile.investmentRate,
                                  profile.method
                                ).investment
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      Tus datos se guardan localmente. Después podrás exportarlos
                      o importarlos entre dispositivos.
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep((prev) => Math.max(prev - 1, 1))}
                  >
                    Atrás
                  </Button>

                  {step < 3 ? (
                    <Button
                      onClick={() =>
                        setStep((prev) => Math.min(prev + 1, 3))
                      }
                    >
                      Siguiente
                    </Button>
                  ) : (
                    <Button onClick={() => setStep(4)}>Entrar al tablero</Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <SectionCard
                title="Qué trae esta versión"
                description="Pensada para sentirse más app y menos formulario."
                icon={Sparkles}
              >
                <div className="grid gap-3 text-sm text-slate-600">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    Subpestañas por tipo de cuenta.
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    Pagos de tarjeta con historial.
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    Depósitos y transferencias en débito.
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    Aportes, retiros y rendimiento en inversión.
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="overflow-hidden rounded-[28px] bg-slate-900 text-white shadow-xl">
            <div className="grid gap-4 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
                  <CircleDollarSign className="h-4 w-4" />
                  Control financiero personal
                </div>
                <h1 className="text-3xl font-bold md:text-4xl">
                  Hola {profile.name || ""}, este es tu tablero
                </h1>
                <p className="mt-3 max-w-2xl text-slate-300">
                  Tienes una vista más clara de liquidez, deuda, inversión,
                  metas y movimientos.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    className="rounded-2xl"
                    onClick={() => setEditMode(true)}
                  >
                    <PencilLine className="mr-2 h-4 w-4" /> Editar perfil
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-2x1"
                    onClick={handleLockApp}
                    >
                      Bloquear app
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-2xl"
                    onClick={exportBackup}
                  >
                    <Download className="mr-2 h-4 w-4" /> Exportar
                  </Button>
                  <Button
                    variant="secondary"
                    className="rounded-2xl"
                    onClick={() => importRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" /> Importar
                  </Button>
                  <Button
                    variant="destructive"
                    className="rounded-2xl"
                    onClick={resetAll}
                  >
                    Reiniciar
                  </Button>
                  <input
                    ref={importRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleImportFile}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-slate-300">Salud financiera</p>
                  <p className="mt-1 text-3xl font-bold">
                    {healthSnapshot.score}/100
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    {healthSnapshot.status}
                  </p>
                  <div className="mt-3">
                    <Progress value={healthSnapshot.score} />
                  </div>
                </div>
                <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-slate-300">Patrimonio neto</p>
                  <p className="mt-1 text-3xl font-bold">
                    {currency.format(netWorth)}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Liquidez + inversión - deuda
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-slate-300">Uso de tarjetas</p>
                  <p className="mt-1 text-3xl font-bold">
                    {creditUsage.toFixed(0)}%
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Sobre un límite total de {currency.format(totals.creditLimit)}
                  </p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm text-slate-300">Invertir por semana</p>
                  <p className="mt-1 text-3xl font-bold">
                    {currency.format(weeklyInvestment)}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">
                    Meta mensual sugerida: {currency.format(plan.investment)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {statusMessage ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {statusMessage}
          </div>
        ) : null}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              <StatCard
                title="Liquidez"
                value={currency.format(totals.liquid)}
                icon={Wallet}
              />

              <StatCard
                title="Invertido"
                value={currency.format(totals.investment)}
                icon={TrendingUp}
              />

              <StatCard
                title="Rendimiento"
                value={currency.format(totals.investmentProfit)}
                icon={PiggyBank}
              />

              <StatCard
                title="Deuda TC"
                value={currency.format(totals.creditDebt)}
                icon={CreditCard}
              />

              <StatCard
                title="Disponible mes"
                value={currency.format(availableThisMonth)}
                icon={BadgeDollarSign}
              />

              <StatCard
                title="Metas"
                value={currency.format(totalGoals)}
                icon={Target}
              />
            </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <SectionCard
            title="Plan sugerido"
            description="Cómo repartir mejor tu mes."
            icon={Target}
          >
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Necesidades</p>
                <p className="mt-1 text-xl font-semibold">
                  {currency.format(plan.essentials)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Estilo de vida</p>
                <p className="mt-1 text-xl font-semibold">
                  {currency.format(plan.lifestyle)}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Ahorro / inversión</p>
                <p className="mt-1 text-xl font-semibold">
                  {currency.format(plan.investment)}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Fondo de emergencia"
            description="Calculado solo con cuentas líquidas."
            icon={AlertCircle}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Objetivo</span>
                <span className="font-medium">
                  {currency.format(emergencyTarget)}
                </span>
              </div>
              <Progress value={emergencyProgress} />
              <div className="flex items-center justify-between text-sm">
                <span>Avance</span>
                <span className="font-medium">
                  {emergencyProgress.toFixed(0)}%
                </span>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Siguiente foco"
            description="Acciones útiles para esta semana."
            icon={Sparkles}
          >
            <div className="space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">1. Reserva semanal</p>
                <p className="mt-1">
                  Aparta {currency.format(weeklyInvestment)} para inversión o
                  ahorro automatizado.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">2. Tarjetas</p>
                <p className="mt-1">
                  Mantén el uso de crédito idealmente por debajo de 30%.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">3. Flujo del mes</p>
                <p className="mt-1">
                  Después de fijos y variables, te quedan{" "}
                  {currency.format(availableThisMonth)} este mes.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <Tabs defaultValue="cuentas" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white p-1 shadow-sm">
            <TabsTrigger value="cuentas">Cuentas</TabsTrigger>
            <TabsTrigger value="gastos">Gastos</TabsTrigger>
            <TabsTrigger value="analisis">Análisis</TabsTrigger>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="cuentas">
            <Tabs defaultValue="resumen-cuentas" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white p-1 shadow-sm">
                <TabsTrigger value="resumen-cuentas">Resumen</TabsTrigger>
                <TabsTrigger value="debito-cuentas">Débito</TabsTrigger>
                <TabsTrigger value="credito-cuentas">Crédito</TabsTrigger>
                <TabsTrigger value="inversion-cuentas">Inversión</TabsTrigger>
              </TabsList>

              <TabsContent value="resumen-cuentas">
                <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                  <SectionCard
                    title="Agregar cuenta"
                    description="Banco, efectivo, tarjeta o inversión."
                    icon={Landmark}
                  >
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Nombre</Label>
                        <Input
                          placeholder="Ej. BBVA, NU o GBM"
                          value={newAccount.name}
                          onChange={(e) =>
                            setNewAccount((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={newAccount.type}
                          onValueChange={(value) =>
                            setNewAccount((prev) => ({ ...prev, type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {accountTypes.map((item) => (
                              <SelectItem key={item} value={item}>
                                {item}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{getAccountValueLabel(newAccount.type)}</Label>
                        <Input
                          type="number"
                          placeholder={getAccountPlaceholder(newAccount.type)}
                          value={newAccount.balance}
                          onChange={(e) =>
                            setNewAccount((prev) => ({
                              ...prev,
                              balance: e.target.value,
                            }))
                          }
                        />
                        <p className="text-xs text-slate-500">
                          {getAccountHelpText(newAccount.type)}
                        </p>
                      </div>

                      {newAccount.type === "Credito" ? (
                        <div className="grid gap-3 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label>Límite</Label>
                            <Input
                              type="number"
                              placeholder="18000"
                              value={newAccount.creditLimit}
                              onChange={(e) =>
                                setNewAccount((prev) => ({
                                  ...prev,
                                  creditLimit: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Día corte</Label>
                            <Input
                              type="number"
                              placeholder="25"
                              value={newAccount.cutoffDay}
                              onChange={(e) =>
                                setNewAccount((prev) => ({
                                  ...prev,
                                  cutoffDay: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Día pago</Label>
                            <Input
                              type="number"
                              placeholder="10"
                              value={newAccount.dueDay}
                              onChange={(e) =>
                                setNewAccount((prev) => ({
                                  ...prev,
                                  dueDay: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      ) : null}

                      {newAccount.type === "Inversion" ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Aportación mensual</Label>
                            <Input
                              type="number"
                              placeholder="4500"
                              value={newAccount.monthlyContribution}
                              onChange={(e) =>
                                setNewAccount((prev) => ({
                                  ...prev,
                                  monthlyContribution: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Rendimiento ganado</Label>
                            <Input
                              type="number"
                              placeholder="2600"
                              value={newAccount.profit}
                              onChange={(e) =>
                                setNewAccount((prev) => ({
                                  ...prev,
                                  profit: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                      ) : null}

                      <Button className="w-full" onClick={addAccount}>
                        <Plus className="mr-2 h-4 w-4" /> Guardar cuenta
                      </Button>
                    </div>
                  </SectionCard>

                  <div className="grid gap-4">
                    <SectionCard
                      title="Cuentas líquidas"
                      description="Dinero disponible entre débito, ahorro y efectivo."
                      icon={Wallet}
                    >
                      <div className="space-y-3">
                        {groupedAccounts.liquidas.length === 0 ? (
                          <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                            No hay cuentas líquidas registradas.
                          </div>
                        ) : (
                          groupedAccounts.liquidas.map((account) => (
                            <div
                              key={account.id}
                              className="flex items-center justify-between rounded-2xl border p-4"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{account.name}</p>
                                  <AccountBadge type={account.type} />
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                  {getAccountValueLabel(account.type)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-semibold">
                                  {currency.format(account.balance)}
                                </p>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    openDeleteConfirm(
                                      "account",
                                      account.id,
                                      "Eliminar cuenta",
                                      `Se eliminará la cuenta ${account.name}.`
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </SectionCard>

                    <SectionCard
                      title="Vista general"
                      description="Resumen por tipo de cuenta."
                      icon={ChartNoAxesCombined}
                    >
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm text-slate-500">Débito / líquido</p>
                          <p className="mt-1 text-xl font-semibold">
                            {currency.format(totals.liquid)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm text-slate-500">Crédito usado</p>
                          <p className="mt-1 text-xl font-semibold">
                            {currency.format(totals.creditDebt)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-sm text-slate-500">Invertido</p>
                          <p className="mt-1 text-xl font-semibold">
                            {currency.format(totals.investment)}
                          </p>
                        </div>
                      </div>
                    </SectionCard>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="debito-cuentas">
                <div className="grid gap-4 xl:grid-cols-2">
                  <SectionCard
                    title="Cuentas líquidas"
                    description="Débito, ahorro y efectivo."
                    icon={Wallet}
                  >
                    <div className="space-y-3">
                      {groupedAccounts.liquidas.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                          No hay cuentas líquidas registradas.
                        </div>
                      ) : (
                        groupedAccounts.liquidas.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between rounded-2xl border p-4"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{account.name}</p>
                                <AccountBadge type={account.type} />
                              </div>
                              <p className="mt-1 text-sm text-slate-500">
                                Saldo actual
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold">
                                {currency.format(account.balance)}
                              </p>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  openDeleteConfirm(
                                    "account",
                                    account.id,
                                    "Eliminar cuenta",
                                    `Se eliminará la cuenta ${account.name}.`
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Registrar depósito"
                    description="Cuando te cae dinero a una cuenta líquida."
                    icon={Banknote}
                  >
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Cuenta</Label>
                        <Select
                          value={liquidDepositForm.accountId}
                          onValueChange={(value) =>
                            setLiquidDepositForm((prev) => ({
                              ...prev,
                              accountId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una cuenta" />
                          </SelectTrigger>
                          <SelectContent>
                            {liquidAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Monto</Label>
                        <Input
                          type="number"
                          placeholder="5000"
                          value={liquidDepositForm.amount}
                          onChange={(e) =>
                            setLiquidDepositForm((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Concepto</Label>
                        <Input
                          placeholder="Ej. Nómina, depósito, pago recibido"
                          value={liquidDepositForm.concept}
                          onChange={(e) =>
                            setLiquidDepositForm((prev) => ({
                              ...prev,
                              concept: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fecha</Label>
                        <Input
                          type="date"
                          value={liquidDepositForm.date}
                          onChange={(e) =>
                            setLiquidDepositForm((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <Button className="w-full" onClick={handleLiquidDeposit}>
                        Registrar depósito
                      </Button>
                    </div>
                  </SectionCard>
                  <SectionCard
                    title="Transferencia entre cuentas"
                    description="Mover dinero entre tus cuentas líquidas."
                    icon={ArrowRightLeft}
                  >
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Cuenta origen</Label>
                        <Select
                          value={liquidTransferForm.sourceAccountId}
                          onValueChange={(value) =>
                            setLiquidTransferForm((prev) => ({
                              ...prev,
                              sourceAccountId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona cuenta origen" />
                          </SelectTrigger>
                          <SelectContent>
                            {liquidAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Cuenta destino</Label>
                        <Select
                          value={liquidTransferForm.destinationAccountId}
                          onValueChange={(value) =>
                            setLiquidTransferForm((prev) => ({
                              ...prev,
                              destinationAccountId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona cuenta destino" />
                          </SelectTrigger>
                          <SelectContent>
                            {liquidAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Monto</Label>
                        <Input
                          type="number"
                          placeholder="1500"
                          value={liquidTransferForm.amount}
                          onChange={(e) =>
                            setLiquidTransferForm((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Concepto</Label>
                        <Input
                          placeholder="Ej. Mover a ahorro"
                          value={liquidTransferForm.concept}
                          onChange={(e) =>
                            setLiquidTransferForm((prev) => ({
                              ...prev,
                              concept: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fecha</Label>
                        <Input
                          type="date"
                          value={liquidTransferForm.date}
                          onChange={(e) =>
                            setLiquidTransferForm((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <Button className="w-full" onClick={handleLiquidTransfer}>
                        Registrar transferencia
                      </Button>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Historial de depósitos"
                    description="Entradas de dinero a cuentas líquidas."
                    icon={Receipt}
                  >
                    <div className="space-y-3">
                      {liquidDepositHistory.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                          Aún no hay depósitos registrados.
                        </div>
                      ) : (
                        liquidDepositHistory.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl border p-4"
                          >
                            <div>
                              <p className="font-medium">{item.accountName}</p>
                              <p className="text-sm text-slate-500">
                                {item.concept} · {item.date}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <p className="font-semibold">
                                {currency.format(item.amount)}
                              </p>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  openDeleteConfirm(
                                    "deposit",
                                    item.id,
                                    "Eliminar depósito",
                                    `Se eliminará el depósito por ${currency.format(
                                      item.amount
                                    )} en ${item.accountName}.`
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Historial de transferencias"
                    description="Movimientos entre tus cuentas líquidas."
                    icon={Receipt}
                  >
                    <div className="space-y-3">
                      {liquidTransferHistory.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                          Aún no hay transferencias registradas.
                        </div>
                      ) : (
                        liquidTransferHistory.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl border p-4"
                          >
                            <div>
                              <p className="font-medium">
                                {item.sourceAccountName} → {item.destinationAccountName}
                              </p>
                              <p className="text-sm text-slate-500">
                                {item.concept} · {item.date}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <p className="font-semibold">
                                {currency.format(item.amount)}
                              </p>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  openDeleteConfirm(
                                    "transfer",
                                    item.id,
                                    "Eliminar transferencia",
                                    `Se eliminará la transferencia por ${currency.format(
                                      item.amount
                                    )} y se revertirán los saldos.`
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </SectionCard>
                </div>
              </TabsContent>

              <TabsContent value="credito-cuentas">
                <div className="grid gap-4 xl:grid-cols-2">
                  <SectionCard
                    title="Tarjetas de crédito"
                    description="Se miden como deuda y uso sobre el límite."
                    icon={CreditCard}
                  >
                    <div className="space-y-3">
                      {groupedAccounts.credito.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                          No hay tarjetas registradas.
                        </div>
                      ) : (
                        groupedAccounts.credito.map((account) => {
                          const usage =
                            account.creditLimit > 0
                              ? Math.min(
                                  (account.balance / account.creditLimit) * 100,
                                  100
                                )
                              : 0;

                          const availableCredit = Math.max(
                            (Number(account.creditLimit) || 0) -
                              (Number(account.balance) || 0),
                            0
                          );

                          return (
                            <div
                              key={account.id}
                              className="rounded-2xl border p-4"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{account.name}</p>
                                    <AccountBadge type={account.type} />
                                  </div>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Deuda: {currency.format(account.balance)} ·
                                    Límite: {currency.format(account.creditLimit)}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Disponible: {currency.format(availableCredit)}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-500">
                                    Corte: {account.cutoffDay || "-"} · Pago:{" "}
                                    {account.dueDay || "-"}
                                  </p>
                                </div>

                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() =>
                                    openDeleteConfirm(
                                      "account",
                                      account.id,
                                      "Eliminar tarjeta",
                                      `Se eliminará la tarjeta ${account.name}.`
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="mt-3 space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Uso</span>
                                  <span className="font-medium">
                                    {usage.toFixed(0)}%
                                  </span>
                                </div>
                                <Progress value={usage} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Actualizar línea de crédito"
                    description="Cambia la línea de crédito de una tarjeta."
                    icon={CreditCard}
                  >
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Tarjeta</Label>
                        <Select
                          value={creditLimitForm.creditAccountId}
                          onValueChange={(value) =>
                            setCreditLimitForm((prev) => ({
                              ...prev,
                              creditAccountId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una tarjeta" />
                          </SelectTrigger>
                          <SelectContent>
                            {creditCards.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Nueva línea de crédito</Label>
                        <Input
                          type="number"
                          placeholder="25000"
                          value={creditLimitForm.newLimit}
                          onChange={(e) =>
                            setCreditLimitForm((prev) => ({
                              ...prev,
                              newLimit: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fecha del cambio</Label>
                        <Input
                          type="date"
                          value={creditLimitForm.date}
                          onChange={(e) =>
                            setCreditLimitForm((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <Button
                        className="w-full"
                        onClick={handleCreditLimitUpdate}
                      >
                        Guardar nueva línea
                      </Button>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Historial de líneas"
                    description="Cambios en la línea de crédito."
                    icon={Receipt}
                  >
                    <div className="space-y-3">
                      {creditLimitHistory.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                          Aún no hay cambios registrados.
                        </div>
                      ) : (
                        creditLimitHistory.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl border p-4"
                          >
                            <div>
                              <p className="font-medium">
                                {item.creditAccountName}
                              </p>
                              <p className="text-sm text-slate-500">
                                Antes {currency.format(item.oldLimit)} → Ahora{" "}
                                {currency.format(item.newLimit)} · {item.date}
                              </p>
                            </div>

                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                openDeleteConfirm(
                                  "creditLimitChange",
                                  item.id,
                                  "Eliminar cambio de línea",
                                  `Se revertirá la línea de crédito de ${item.creditAccountName}.`
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </SectionCard>
                  <SectionCard
                    title="Registrar pago de tarjeta"
                    description="Paga tus tarjetas desde una cuenta líquida."
                    icon={CreditCard}
                  >
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Tarjeta</Label>
                        <Select
                          value={cardPayment.creditAccountId}
                          onValueChange={(value) =>
                            setCardPayment((prev) => ({
                              ...prev,
                              creditAccountId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una tarjeta" />
                          </SelectTrigger>
                          <SelectContent>
                            {creditCards.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Cuenta de origen</Label>
                        <Select
                          value={cardPayment.sourceAccountId}
                          onValueChange={(value) =>
                            setCardPayment((prev) => ({
                              ...prev,
                              sourceAccountId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona cuenta origen" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentSourceAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Monto</Label>
                        <Input
                          type="number"
                          placeholder="1500"
                          value={cardPayment.amount}
                          onChange={(e) =>
                            setCardPayment((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fecha del pago</Label>
                        <Input
                          type="date"
                          value={cardPayment.date}
                          onChange={(e) =>
                            setCardPayment((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <Button className="w-full" onClick={handleCardPayment}>
                        Registrar pago
                      </Button>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Historial de pagos de tarjeta"
                    description="Pagos que ya registraste."
                    icon={Receipt}
                  >
                    <div className="space-y-3">
                      {cardPaymentsHistory.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                          Aún no hay pagos registrados.
                        </div>
                      ) : (
                        cardPaymentsHistory.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between rounded-2xl border p-4"
                          >
                            <div>
                              <p className="font-medium">
                                {payment.creditAccountName}
                              </p>
                              <p className="text-sm text-slate-500">
                                Desde {payment.sourceAccountName} · {payment.date}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <p className="font-semibold">
                                {currency.format(payment.amount)}
                              </p>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  openDeleteConfirm(
                                    "cardPayment",
                                    payment.id,
                                    "Eliminar pago de tarjeta",
                                    `Se eliminará el pago de ${currency.format(
                                      payment.amount
                                    )} de ${payment.creditAccountName} y se revertirán los saldos.`
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </SectionCard>
                </div>
              </TabsContent>

              <TabsContent value="inversion-cuentas">
                  <div className="space-y-4">
                    <InvestmentSummaryCards
                      investmentSummary={investmentSummary}
                      currency={currency}
                    />

                    <div className="grid gap-4 xl:grid-cols-2">
                  <SectionCard
                    title="Inversiones"
                    description="Tus cuentas de inversión como GBM."
                    icon={TrendingUp}
                  >
                    <div className="space-y-3">
                      {investmentAccounts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                          No hay inversiones registradas.
                        </div>
                      ) : (
                        investmentAccounts.map((account) => (
                          <div
                            key={account.id}
                            className="rounded-2xl border p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{account.name}</p>
                                  <AccountBadge type={account.type} />
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                  Valor actual: {currency.format(account.balance)}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Aportación mensual:{" "}
                                  {currency.format(account.monthlyContribution)} ·
                                  Rendimiento: {currency.format(account.profit)}
                                </p>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  openDeleteConfirm(
                                    "account",
                                    account.id,
                                    "Eliminar inversión",
                                    `Se eliminará la cuenta de inversión ${account.name}.`
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="Movimiento de inversión"
                    description="Aportar, retirar o registrar rendimiento."
                    icon={ChartNoAxesCombined}
                  >
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Inversión</Label>
                        <Select
                          value={investmentMoveForm.investmentAccountId}
                          onValueChange={(value) =>
                            setInvestmentMoveForm((prev) => ({
                              ...prev,
                              investmentAccountId: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona inversión" />
                          </SelectTrigger>
                          <SelectContent>
                            {investmentAccounts.map((account) => (
                              <SelectItem key={account.id} value={account.id}>
                                {account.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select
                          value={investmentMoveForm.type}
                          onValueChange={(value) =>
                            setInvestmentMoveForm((prev) => ({
                              ...prev,
                              type: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="aporte">Aporte</SelectItem>
                            <SelectItem value="retiro">Retiro / venta</SelectItem>
                            <SelectItem value="rendimiento">Rendimiento</SelectItem>
                            <SelectItem value="minusvalia">Minusvalía / pérdida</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {investmentMoveForm.type === "aporte" || investmentMoveForm.type === "retiro" ? (
                        <div className="space-y-2">
                          <Label>Cuenta líquida relacionada</Label>
                          <Select
                            value={investmentMoveForm.liquidAccountId}
                            onValueChange={(value) =>
                              setInvestmentMoveForm((prev) => ({
                                ...prev,
                                liquidAccountId: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona cuenta" />
                            </SelectTrigger>
                            <SelectContent>
                              {liquidAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <Label>
                          {investmentMoveForm.type === "aporte"
                            ? "Monto del aporte"
                            : investmentMoveForm.type === "retiro"
                            ? "Monto del retiro"
                            : investmentMoveForm.type === "rendimiento"
                            ? "Monto del rendimiento"
                            : investmentMoveForm.type === "minusvalia"
                            ? "Monto de la pérdida"
                            : "Monto"}
                        </Label>
                        <Input
                          type="number"
                          placeholder={
                            investmentMoveForm.type === "aporte"
                              ? "1000"
                              : investmentMoveForm.type === "retiro"
                              ? "1500"
                              : investmentMoveForm.type === "rendimiento"
                              ? "350"
                              : investmentMoveForm.type === "minusvalia"
                              ? "500"
                              : "1000"
                          }
                          value={investmentMoveForm.amount}
                          onChange={(e) =>
                            setInvestmentMoveForm((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>
                          {investmentMoveForm.type === "aporte"
                            ? "Concepto del aporte"
                            : investmentMoveForm.type === "retiro"
                            ? "Concepto del retiro"
                            : investmentMoveForm.type === "rendimiento"
                            ? "Concepto del rendimiento"
                            : investmentMoveForm.type === "minusvalia"
                            ? "Concepto de la pérdida"
                            : "Concepto"}
                        </Label>
                        <Input
                          placeholder={
                            investmentMoveForm.type === "aporte"
                              ? "Ej. Aporte semanal a GBM"
                              : investmentMoveForm.type === "retiro"
                              ? "Ej. Venta parcial o retiro"
                              : investmentMoveForm.type === "rendimiento"
                              ? "Ej. Ganancia del periodo"
                              : investmentMoveForm.type === "minusvalia"
                              ? "Ej. Baja de mercado"
                              : "Ej. Movimiento de inversión"
                          }
                          value={investmentMoveForm.concept}
                          onChange={(e) =>
                            setInvestmentMoveForm((prev) => ({
                              ...prev,
                              concept: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Fecha</Label>
                        <Input
                          type="date"
                          value={investmentMoveForm.date}
                          onChange={(e) =>
                            setInvestmentMoveForm((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>

                        <Button className="w-full" onClick={handleInvestmentMove}>
                          {investmentMoveForm.type === "aporte"
                            ? "Registrar aporte"
                            : investmentMoveForm.type === "retiro"
                            ? "Registrar retiro"
                            : investmentMoveForm.type === "rendimiento"
                            ? "Registrar rendimiento"
                            : investmentMoveForm.type === "minusvalia"
                            ? "Registrar pérdida"
                            : "Guardar movimiento"}
                        </Button>
                    </div>
                  </SectionCard>
                  <SectionCard
                    title="Historial de inversión"
                    description="Aportes, retiros y rendimientos."
                    icon={Receipt}
                  >
                    <div className="space-y-3">
                      {investmentMoveHistory.length === 0 ? (
                        <div className="rounded-2xl border border-dashed p-6 text-center text-slate-500">
                          Aún no hay movimientos registrados.
                        </div>
                      ) : (
                        investmentMoveHistory.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-2xl border p-4"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{item.investmentAccountName}</p>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                    item.type === "aporte"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : item.type === "retiro"
                                      ? "bg-amber-100 text-amber-700"
                                      : item.type === "rendimiento"
                                      ? "bg-cyan-100 text-cyan-700"
                                      : item.type === "minusvalia"
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                    {getInvestmentTypeLabel(item.type)}
                                </span>
                              </div>
                              <p className="text-sm text-slate-500">
                                {item.concept} · {item.date}
                                {item.liquidAccountName
                                  ? ` · ${item.liquidAccountName}`
                                  : ""}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <p className="font-semibold">
                                {currency.format(item.amount)}
                              </p>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() =>
                                  openDeleteConfirm(
                                    "investmentMove",
                                    item.id,
                                    "Eliminar movimiento de inversión",
                                    `Se eliminará el movimiento de ${currency.format(
                                      item.amount
                                    )} en ${item.investmentAccountName} y se revertirán saldos.`
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </SectionCard>
                </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="gastos">
            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <SectionCard
                title="Registrar gasto"
                description="Si eliges una cuenta, se ajusta el saldo o la deuda."
                icon={Receipt}
              >
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Concepto</Label>
                    <Input
                      placeholder="Ej. Oxxo, luz, gasolina"
                      value={newExpense.concept}
                      onChange={(e) =>
                        setNewExpense((prev) => ({
                          ...prev,
                          concept: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Select
                      value={newExpense.category}
                      onValueChange={(value) =>
                        setNewExpense((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Monto</Label>
                      <Input
                        type="number"
                        placeholder="550"
                        value={newExpense.amount}
                        onChange={(e) =>
                          setNewExpense((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={newExpense.date}
                        onChange={(e) =>
                          setNewExpense((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cuenta usada</Label>
                    <Select
                      value={newExpense.accountId || "sin-cuenta"}
                      onValueChange={(value) =>
                        setNewExpense((prev) => ({
                          ...prev,
                          accountId: value === "sin-cuenta" ? "" : value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sin-cuenta">Sin especificar</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} · {account.type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button className="w-full" onClick={addExpense}>
                    <Plus className="mr-2 h-4 w-4" /> Guardar gasto
                  </Button>
                </div>
              </SectionCard>

              <div className="space-y-4">
                <SectionCard
                  title="Resumen de gastos"
                  description="Flujo real del mes considerando fijos y variables."
                  icon={BadgeDollarSign}
                >
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Variables</p>
                      <p className="mt-1 text-xl font-semibold">
                        {currency.format(totalExpenses)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Comprometido</p>
                      <p className="mt-1 text-xl font-semibold">
                        {currency.format(committedThisMonth)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">Disponible</p>
                      <p className="mt-1 text-xl font-semibold">
                        {currency.format(availableThisMonth)}
                      </p>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Historial de gastos"
                  description="Tus movimientos registrados."
                  icon={Wallet}
                >
                  <div className="space-y-3">
                    {expenses.length === 0 ? (
                      <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
                        Aún no registras gastos.
                      </div>
                    ) : (
                      expenses.map((expense) => (
                        <div
                          key={expense.id}
                          className="flex items-center justify-between rounded-2xl border p-4"
                        >
                          <div>
                            <p className="font-medium">{expense.concept}</p>
                            <p className="text-sm text-slate-500">
                              {expense.category} · {expense.date}
                              {expense.accountName
                                ? ` · ${expense.accountName}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold">
                              {currency.format(expense.amount)}
                            </p>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                openDeleteConfirm(
                                  "expense",
                                  expense.id,
                                  "Eliminar gasto",
                                  `Se eliminará el gasto "${expense.concept}" por ${currency.format(
                                    expense.amount
                                  )}.`
                                )
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </SectionCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analisis">
            <div className="grid gap-4 xl:grid-cols-2">
              <SectionCard
                title="Gastos por categoría"
                description="Vista rápida de a dónde se va tu dinero."
                icon={BarChart3}
              >
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          expenseByCategory.length
                            ? expenseByCategory
                            : [{ name: "Sin datos", value: 1 }]
                        }
                        dataKey="value"
                        nameKey="name"
                        outerRadius={100}
                        innerRadius={55}
                      >
                        {(
                          expenseByCategory.length
                            ? expenseByCategory
                            : [{ name: "Sin datos", value: 1 }]
                        ).map((_, index) => (
                          <Cell
                            key={index}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => currency.format(Number(value))}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>

              <SectionCard
                title="Resumen mensual"
                description="Ingreso, gastos fijos, variables e inversión sugerida."
                icon={ChartNoAxesCombined}
              >
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetBars}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => currency.format(Number(value))}
                      />
                      <Legend />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </SectionCard>
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-3">
              <SectionCard
                title="Meta grande"
                description="Avance hacia tu objetivo general."
                icon={Target}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Objetivo</span>
                    <span className="font-medium">
                      {currency.format(Number(profile.savingsGoal) || 0)}
                    </span>
                  </div>
                  <Progress value={savingsGoalProgress} />
                  <p className="text-sm text-slate-600">
                    Llevas {savingsGoalProgress.toFixed(0)}% considerando
                    liquidez + inversión.
                  </p>
                </div>
              </SectionCard>

              <SectionCard
                title="Consistencia de inversión"
                description="Lo que ya configuraste vs lo recomendado."
                icon={PiggyBank}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border p-3 text-sm">
                    <span>Configurado</span>
                    <span className="font-medium">
                      {currency.format(totals.configuredInvestment)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border p-3 text-sm">
                    <span>Sugerido</span>
                    <span className="font-medium">
                      {currency.format(plan.investment)}
                    </span>
                  </div>
                  <Progress
                    value={
                      plan.investment > 0
                        ? Math.min(
                            (totals.configuredInvestment / plan.investment) *
                              100,
                            100
                          )
                        : 0
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Señales rápidas"
                description="Lectura simple de tu situación actual."
                icon={CheckCircle2}
              >
                <div className="space-y-3 text-sm text-slate-600">
                  {healthSnapshot.messages.map((message, index) => (
                    <div key={index} className="rounded-2xl bg-slate-50 p-4">
                      {message}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </TabsContent>

          <TabsContent value="perfil">
            <SectionCard
              title="Seguridad de acceso"
              description="Protege tu app con un PIN local de 4 a 6 dígitos."
              icon={AlertCircle}
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>{savedPin ? "Cambiar PIN" : "Crear PIN"}</Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="Ej. 1234"
                    value={accessPin}
                    onChange={(e) => setAccessPin(e.target.value)}
                  />
                </div>

                <Button onClick={handleSavePin}>
                  {savedPin ? "Guardar nuevo PIN" : "Guardar PIN"}
                </Button>
                {savedPin ? (
                <Button variant="outline" onClick={handleRemovePin}>
                  Quitar PIN
                </Button>
              ) : null}

                {savedPin ? (
                  <p className="text-xs text-slate-500">
                    Ya tienes un PIN configurado. Si guardas uno nuevo, reemplazará el actual.
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">
                    Este PIN se guarda localmente en este dispositivo.
                  </p>
                )}
              </div>
            </SectionCard>
            <div className="grid gap-4 xl:grid-cols-2">
              <SectionCard
                title="Tu configuración"
                description="Edita tus datos base cuando quieras."
                icon={PencilLine}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={profile.name}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ingreso mensual</Label>
                    <Input
                      type="number"
                      value={profile.monthlyIncome || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          monthlyIncome: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gastos fijos</Label>
                    <Input
                      type="number"
                      value={profile.fixedExpenses || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          fixedExpenses: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meta de ahorro</Label>
                    <Input
                      type="number"
                      value={profile.savingsGoal || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          savingsGoal: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Meses para fondo de emergencia</Label>
                    <Input
                      type="number"
                      value={profile.emergencyFundMonths || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          emergencyFundMonths: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>% de inversión</Label>
                    <Input
                      type="number"
                      value={profile.investmentRate || ""}
                      onChange={(e) =>
                        setProfile((prev) => ({
                          ...prev,
                          investmentRate: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Tus metas"
                description="Objetivos de ahorro o inversión."
                icon={CheckCircle2}
              >
                <div className="space-y-3">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="flex items-center justify-between rounded-2xl border p-3"
                    >
                      <div>
                        <p className="font-medium">{goal.name}</p>
                        <p className="text-sm text-slate-500">
                          {currency.format(goal.amount)}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          openDeleteConfirm(
                            "goal",
                            goal.id,
                            "Eliminar meta",
                            `Se eliminará la meta "${goal.name}".`
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="grid gap-2 md:grid-cols-[1fr_140px_auto]">
                    <Input
                      placeholder="Nueva meta"
                      value={newGoal.name}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Monto"
                      value={newGoal.amount}
                      onChange={(e) =>
                        setNewGoal((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                    />
                    <Button onClick={addGoal}>
                      <Plus className="mr-2 h-4 w-4" /> Agregar
                    </Button>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                    Total en metas:{" "}
                    <span className="font-semibold">
                      {currency.format(totalGoals)}
                    </span>
                  </div>
                </div>
              </SectionCard>
            </div>
          </TabsContent>
        </Tabs>

          <ConfirmDeleteDialog
            open={confirmDelete.open}
            onOpenChange={(open) =>
              setConfirmDelete((prev) => ({
                ...prev,
                open,
              }))
            }
            title={confirmDelete.title}
            description={confirmDelete.description}
            onConfirm={handleConfirmDelete}
          />

        <Dialog open={editMode} onOpenChange={setEditMode}>
          <DialogContent className="sm:max-w-2xl rounded-3xl">
            <DialogHeader>
              <DialogTitle>Editar datos principales</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Ingreso mensual</Label>
                <Input
                  type="number"
                  value={profile.monthlyIncome || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      monthlyIncome: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Gastos fijos mensuales</Label>
                <Input
                  type="number"
                  value={profile.fixedExpenses || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      fixedExpenses: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Porcentaje de inversión</Label>
                <Input
                  type="number"
                  value={profile.investmentRate || ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      investmentRate: Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setEditMode(false)}>
                Guardar cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}