# Manual Test Checklist — App Finanzas

## 1. Onboarding inicial
- [ ] La app carga sin pantalla en blanco
- [ ] El onboarding aparece si no hay perfil cargado
- [ ] Se puede avanzar entre pasos
- [ ] Se puede regresar entre pasos
- [ ] Al terminar, entra al tablero principal
- [ ] Los datos del onboarding se guardan correctamente

---

## 2. Dashboard
- [ ] Se muestran las 6 tarjetas KPI
- [ ] Liquidez muestra el valor correcto
- [ ] Invertido muestra el valor correcto
- [ ] Rendimiento muestra el valor correcto
- [ ] Deuda TC muestra el valor correcto
- [ ] Disponible del mes muestra el valor correcto
- [ ] Metas muestra el valor correcto

---

## 3. Seguridad local
- [ ] Se puede crear PIN
- [ ] Se puede cambiar PIN
- [ ] Se puede quitar PIN
- [ ] Al recargar, si existe PIN, la app se bloquea
- [ ] El PIN correcto desbloquea la app
- [ ] El PIN incorrecto muestra error
- [ ] El botón “Bloquear app” funciona

---

## 4. Cuentas - Alta de cuenta
- [ ] Se puede crear cuenta de débito
- [ ] Se puede crear cuenta de ahorro
- [ ] Se puede crear cuenta de efectivo
- [ ] Se puede crear cuenta de crédito
- [ ] Se puede crear cuenta de inversión
- [ ] El formulario cambia labels según el tipo
- [ ] El formulario cambia placeholders según el tipo

---

## 5. Cuentas - Débito / líquidas
### Depósitos
- [ ] Se puede registrar depósito
- [ ] El saldo sube correctamente
- [ ] El depósito aparece en historial
- [ ] Al borrar depósito, el saldo se revierte

### Transferencias
- [ ] Se puede transferir entre cuentas líquidas
- [ ] Baja saldo en origen
- [ ] Sube saldo en destino
- [ ] Aparece en historial
- [ ] Al borrar transferencia, se revierten ambos saldos

---

## 6. Cuentas - Crédito
### Tarjetas
- [ ] Se muestra deuda actual
- [ ] Se muestra límite
- [ ] Se muestra disponible
- [ ] Se muestra porcentaje de uso

### Pagos
- [ ] Se puede pagar tarjeta desde cuenta líquida
- [ ] Baja deuda de tarjeta
- [ ] Baja saldo de cuenta origen
- [ ] Aparece en historial
- [ ] Al borrar pago, se revierten ambos saldos

### Línea de crédito
- [ ] Se puede actualizar línea de crédito
- [ ] El nuevo límite se refleja en la tarjeta
- [ ] El cambio aparece en historial
- [ ] Al borrar cambio, se restaura el límite anterior

---

## 7. Cuentas - Inversión
### Visualización
- [ ] Se muestran cuentas de inversión
- [ ] Se muestra resumen:
  - [ ] Aportado
  - [ ] Retirado
  - [ ] Rendimiento
  - [ ] Minusvalía
  - [ ] Neto

### Movimientos
- [ ] Se puede registrar aporte
- [ ] Se puede registrar retiro / venta
- [ ] Se puede registrar rendimiento
- [ ] Se puede registrar minusvalía

### Reglas
- [ ] El aporte baja cuenta líquida y sube inversión
- [ ] El retiro baja inversión y sube cuenta líquida
- [ ] El rendimiento sube inversión sin tocar cuenta líquida
- [ ] La minusvalía baja inversión sin tocar cuenta líquida

### Historial
- [ ] Todos los movimientos aparecen en historial
- [ ] El tipo se muestra con badge correcto
- [ ] Al borrar aporte, se revierte bien
- [ ] Al borrar retiro, se revierte bien
- [ ] Al borrar rendimiento, se revierte bien
- [ ] Al borrar minusvalía, se revierte bien

---

## 8. Gastos
- [ ] Se puede registrar gasto sin cuenta
- [ ] Se puede registrar gasto con cuenta líquida
- [ ] Se puede registrar gasto con tarjeta
- [ ] El gasto con cuenta líquida baja saldo
- [ ] El gasto con tarjeta aumenta deuda
- [ ] El gasto aparece en historial
- [ ] Al borrar gasto, se revierte correctamente

---

## 9. Metas
- [ ] Se puede crear meta
- [ ] La meta aparece en la lista
- [ ] El total de metas se actualiza
- [ ] Se puede eliminar meta

---

## 10. Importar / Exportar
- [ ] Se puede exportar respaldo JSON
- [ ] Se puede importar respaldo JSON
- [ ] Los datos importados se reflejan correctamente
- [ ] No se rompe la app al importar archivo inválido

---

## 11. Deploy / versión publicada
- [ ] La app corre en local con `npm run dev`
- [ ] La app compila sin errores
- [ ] Los cambios se suben con git
- [ ] Vercel genera deploy correctamente
- [ ] El link publicado abre en celular
- [ ] La versión del celular refleja los últimos cambios

---

## 12. Revisión visual rápida
- [ ] No hay pantalla en blanco
- [ ] No hay errores de consola
- [ ] No hay componentes descuadrados graves
- [ ] La app se ve aceptable en desktop
- [ ] La app se ve aceptable en celular