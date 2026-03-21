import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  CreditCard,
  PiggyBank,
  TrendingUp,
  PencilLine,
  Target,
  BadgeDollarSign,
  CircleDollarSign,
  AlertCircle,
  Sparkles,
  Download,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import StatCard from "@/components/dashboard/StatCard";
import SectionCard from "@/components/common/SectionCard";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

const CuentasTab = lazy(() => import("@/components/tabs/CuentasTab"));
const GastosTab = lazy(() => import("@/components/tabs/GastosTab"));
const AnalisisTab = lazy(() => import("@/components/tabs/AnalisisTab"));
const PerfilTab = lazy(() => import("@/components/tabs/PerfilTab"));

const TabFallback = () => (
  <div className="p-8 text-center text-sm text-slate-500">Cargando...</div>
);

import { currency } from "@/lib/formatters";

import { useApp } from "@/context/AppContext";

export default function DashboardPage() {
  const {
    profile,
    setProfile,
    statusMessage,
    healthSnapshot,
    netWorth,
    creditUsage,
    totals,
    weeklyInvestment,
    plan,
    availableThisMonth,
    emergencyTarget,
    emergencyProgress,
    totalGoals,
    savingsGoalProgress,
    editMode,
    setEditMode,
    handleLockApp,
    exportBackup,
    importRef,
    handleImportFile,
    resetAll,
    confirmDelete,
    setConfirmDelete,
    handleConfirmDelete,
  } = useApp();

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
            <Suspense fallback={<TabFallback />}>
              <CuentasTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="gastos">
            <Suspense fallback={<TabFallback />}>
              <GastosTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="analisis">
            <Suspense fallback={<TabFallback />}>
              <AnalisisTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="perfil">
            <Suspense fallback={<TabFallback />}>
              <PerfilTab />
            </Suspense>
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
