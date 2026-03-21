import {
  BarChart3,
  Target,
  PiggyBank,
  CheckCircle2,
  TrendingUp,
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
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

import { Progress } from "@/components/ui/progress";

import SectionCard from "@/components/common/SectionCard";

import { chartColors } from "@/lib/constants";
import { currency } from "@/lib/formatters";

import { useApp } from "@/context/AppContext";

export default function AnalisisTab() {
  const {
    expenseByCategory,
    budgetBars,
    profile,
    savingsGoalProgress,
    totals,
    plan,
    healthSnapshot,
    netWorthHistory,
  } = useApp();

  const MONTHS = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const netWorthChartData = netWorthHistory.map((entry) => {
    const d = new Date(entry.date + "T00:00:00");
    return {
      label: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
      value: entry.value,
    };
  });

  return (
    <>
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

      {netWorthChartData.length > 1 && (
        <SectionCard
          title="Patrimonio en el tiempo"
          description="Evolución de liquidez + inversión − deuda (últimos 90 días)."
          icon={TrendingUp}
          className="mt-4"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthChartData}>
                <defs>
                  <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11 }}
                  width={55}
                />
                <Tooltip formatter={(v) => currency.format(Number(v))} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#nwGradient)"
                  dot={false}
                  name="Patrimonio"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}

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
    </>
  );
}
