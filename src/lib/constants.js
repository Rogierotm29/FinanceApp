export const STORAGE_KEY = "money-manager-vite-pro-v2";

export const accountTypes = [
  "Debito",
  "Credito",
  "Ahorro",
  "Inversion",
  "Efectivo",
];

export const expenseCategories = [
  "Renta",
  "Comida",
  "Transporte",
  "Salud",
  "Luz",
  "Agua",
  "Gas",
  "Internet",
  "Telefono",
  "Suscripciones",
  "Educacion",
  "Entretenimiento",
  "Deuda",
  "Ahorro",
  "Mantenimiento",
  "Otro",
];

export const LIQUID_ACCOUNT_TYPES = ["Debito", "Ahorro", "Efectivo"];
export const INVESTMENT_ACCOUNT_TYPES = ["Inversion"];
export const CREDIT_ACCOUNT_TYPES = ["Credito"];

export const chartColors = [
  "#0f172a",
  "#334155",
  "#475569",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
];

export const defaultProfile = {
  name: "",
  monthlyIncome: 0,
  fixedExpenses: 0,
  savingsGoal: 0,
  emergencyFundMonths: 3,
  investmentRate: 15,
  method: "50/30/20",
};