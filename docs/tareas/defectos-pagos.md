# Defectos intencionales: módulo Pagos

Ejercicio de la materia: dos defectos introducidos a propósito en la vigencia de un pago, con las pruebas que los detectan. Ambos están en la función `esVigente` de `src/modules/pago/pago.vigencia.js`.

## Defecto 1: el día del vencimiento aparece como vencido

| | |
|---|---|
| **Dónde** | `esVigente` |
| **Qué pasa** | Un cliente cuya membresía vence el 31/03 aparece como no vigente ese mismo día |
| **Regla incumplida** | «El día del vencimiento todavía es vigente» (`docs/tareas/maycol-pagos.md`, sección 4) |
| **Técnica de prueba** | Valores límite: día anterior al pago, día del pago, un día antes del vencimiento, día del vencimiento y día siguiente |
| **Prueba que lo detecta** | `esVigente: valores límite el día del vencimiento (último día vigente)` |
| **Punto a corregir** | La comparación con `fecha_vencimiento` debe ser `<=` (hoy usa `<`) |

## Defecto 2: los pagos no PAGADOS dan vigencia

| | |
|---|---|
| **Dónde** | `esVigente` |
| **Qué pasa** | Un pago `ANULADO` o `PENDIENTE` hace que el cliente aparezca con la membresía vigente |
| **Regla incumplida** | «`PENDIENTE` y `ANULADO` no cuentan» (sección 4 de la guía) |
| **Técnica de prueba** | Tabla de decisión: estado (PAGADO, PENDIENTE, ANULADO) × fecha (dentro, fuera) |
| **Pruebas que lo detectan** | `estado PENDIENTE con fecha dentro -> no vigente`, `estado ANULADO con fecha dentro -> no vigente` y `vencimientoVigente ignora los pagos anulados y pendientes` |
| **Punto a corregir** | Agregar la condición `pago.estado === 'PAGADO'` |
