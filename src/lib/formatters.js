export const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function getInvestmentTypeLabel(type) {
  if (type === "aporte") return "Aporte";
  if (type === "retiro") return "Retiro / venta";
  if (type === "rendimiento") return "Rendimiento";
  if (type === "minusvalia") return "Minusvalía / pérdida";
  return type;
}