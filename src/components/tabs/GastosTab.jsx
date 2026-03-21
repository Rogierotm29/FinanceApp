import {
  Receipt,
  Plus,
  Trash2,
  Wallet,
  BadgeDollarSign,
  Pencil,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

import SectionCard from "@/components/common/SectionCard";

import { expenseCategories } from "@/lib/constants";
import { currency } from "@/lib/formatters";

import { useApp } from "@/context/AppContext";

const MONTH_LABELS = {
  "01": "Enero", "02": "Febrero", "03": "Marzo", "04": "Abril",
  "05": "Mayo", "06": "Junio", "07": "Julio", "08": "Agosto",
  "09": "Septiembre", "10": "Octubre", "11": "Noviembre", "12": "Diciembre",
};

function formatMonth(ym) {
  if (!ym || ym === "all") return "Todos";
  const [year, month] = ym.split("-");
  return `${MONTH_LABELS[month] || month} ${year}`;
}

export default function GastosTab() {
  const {
    newExpense,
    setNewExpense,
    addExpense,
    accounts,
    expenses,
    filteredExpenses,
    expenseMonthFilter,
    setExpenseMonthFilter,
    expenseMonths,
    totalExpenses,
    committedThisMonth,
    availableThisMonth,
    openDeleteConfirm,
    editingExpense,
    setEditingExpense,
    updateExpense,
  } = useApp();

  return (
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
              onKeyDown={(e) => e.key === "Enter" && addExpense()}
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
                min="0"
                placeholder="550"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                onKeyDown={(e) => e.key === "Enter" && addExpense()}
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
          {/* Month filter */}
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select
              value={expenseMonthFilter}
              onValueChange={setExpenseMonthFilter}
            >
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los meses</SelectItem>
                {expenseMonths.map((ym) => (
                  <SelectItem key={ym} value={ym}>
                    {formatMonth(ym)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-slate-400">
              {filteredExpenses.length} gasto{filteredExpenses.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3">
            {filteredExpenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
                {expenses.length === 0
                  ? "Aún no registras gastos."
                  : "Sin gastos en este mes."}
              </div>
            ) : (
              filteredExpenses.map((expense) => (
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
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      {currency.format(expense.amount)}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Editar gasto ${expense.concept}`}
                      onClick={() => setEditingExpense({ ...expense })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Eliminar gasto ${expense.concept}`}
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

      {/* Edit expense dialog */}
      <Dialog
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
      >
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Editar gasto</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Concepto</Label>
                <Input
                  value={editingExpense.concept}
                  onChange={(e) =>
                    setEditingExpense((prev) => ({ ...prev, concept: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Categoría</Label>
                <Select
                  value={editingExpense.category}
                  onValueChange={(value) =>
                    setEditingExpense((prev) => ({ ...prev, category: value }))
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
                    min="0"
                    value={editingExpense.amount}
                    onChange={(e) =>
                      setEditingExpense((prev) => ({ ...prev, amount: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) =>
                      setEditingExpense((prev) => ({ ...prev, date: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cuenta</Label>
                <Select
                  value={editingExpense.accountId || "sin-cuenta"}
                  onValueChange={(value) =>
                    setEditingExpense((prev) => ({
                      ...prev,
                      accountId: value === "sin-cuenta" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingExpense(null)}>
                  Cancelar
                </Button>
                <Button onClick={() => updateExpense(editingExpense.id, editingExpense)}>
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
