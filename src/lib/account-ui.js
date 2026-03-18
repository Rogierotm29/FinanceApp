export function getAccountValueLabel(type) {
  if (type === "Credito") return "Deuda actual";
  if (type === "Inversion") return "Valor actual";
  return "Saldo";
}

export function getAccountPlaceholder(type) {
  if (type === "Credito") return "4500";
  if (type === "Inversion") return "18000";
  return "12000";
}

export function getAccountHelpText(type) {
  if (type === "Credito") {
    return "Guarda lo que debes actualmente, no el dinero disponible de la tarjeta.";
  }

  if (type === "Inversion") {
    return "Ideal para GBM u otra plataforma. Pon el valor actual de tu portafolio.";
  }

  return "Aquí va el dinero que sí tienes disponible o apartado.";
}