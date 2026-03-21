import {
  Wallet,
  Landmark,
  CreditCard,
  TrendingUp,
  Receipt,
  Plus,
  Trash2,
  ArrowRightLeft,
  Banknote,
  BarChart3 as ChartNoAxesCombined,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import SectionCard from "@/components/common/SectionCard";
import AccountBadge from "@/components/accounts/AccountBadge";
import InvestmentSummaryCards from "@/components/investments/InvestmentSummaryCards";

import {
  getAccountValueLabel,
  getAccountPlaceholder,
  getAccountHelpText,
} from "@/lib/account-ui";
import { currency, getInvestmentTypeLabel } from "@/lib/formatters";
import { accountTypes } from "@/lib/constants";

import { useApp } from "@/context/AppContext";

export default function CuentasTab() {
  const {
    newAccount,
    setNewAccount,
    addAccount,
    groupedAccounts,
    totals,
    openDeleteConfirm,
    liquidAccounts,
    liquidDepositForm,
    setLiquidDepositForm,
    handleLiquidDeposit,
    liquidTransferForm,
    setLiquidTransferForm,
    handleLiquidTransfer,
    liquidDepositHistory,
    liquidTransferHistory,
    creditCards,
    creditLimitForm,
    setCreditLimitForm,
    handleCreditLimitUpdate,
    creditLimitHistory,
    cardPayment,
    setCardPayment,
    handleCardPayment,
    paymentSourceAccounts,
    cardPaymentsHistory,
    investmentAccounts,
    investmentMoveForm,
    setInvestmentMoveForm,
    handleInvestmentMove,
    investmentMoveHistory,
    investmentSummary,
  } = useApp();

  return (
    <Tabs defaultValue="resumen-cuentas" className="space-y-4">
      <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-white p-1 shadow-sm">
        <TabsTrigger value="resumen-cuentas">Resumen</TabsTrigger>
        <TabsTrigger value="debito-cuentas">Débito</TabsTrigger>
        <TabsTrigger value="credito-cuentas">Crédito</TabsTrigger>
        <TabsTrigger value="inversion-cuentas">Inversión</TabsTrigger>
      </TabsList>

      {/* RESUMEN */}
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
                  min="0"
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
                      min="0"
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
                          aria-label={`Eliminar cuenta ${account.name}`}
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

      {/* DEBITO */}
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
                        aria-label={`Eliminar cuenta ${account.name}`}
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
                  min="0"
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
                  min="0"
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
                        aria-label={`Eliminar depósito ${item.concept}`}
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
                        aria-label={`Eliminar transferencia ${item.concept}`}
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

      {/* CREDITO */}
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
                          aria-label={`Eliminar tarjeta ${account.name}`}
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
                  min="0"
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
                      aria-label={`Eliminar cambio de línea de ${item.creditAccountName}`}
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
                  min="0"
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
                        aria-label={`Eliminar pago de tarjeta ${payment.creditAccountName}`}
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

      {/* INVERSION */}
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
                          aria-label={`Eliminar inversión ${account.name}`}
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
                    min="0"
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
                          aria-label={`Eliminar movimiento de ${item.investmentAccountName}`}
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
  );
}
