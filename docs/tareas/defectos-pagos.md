# Defectos intencionales: módulo Pagos

> **Estado de la entrega: defectos SIN corregir.** Por indicación de la cátedra, el código entregado conserva los dos defectos y las pruebas que los detectan fallan (4 pruebas en rojo). La corrección está descrita abajo y se aplicará en la etapa posterior; para aplicarla basta cambiar la función `esVigente` de `src/modules/pago/pago.vigencia.js` como se indica en cada defecto.

Ejercicio de la materia: introducir un defecto, escribir la prueba que lo detecta (falla) y corregirlo (pasa). Cada paso quedó en un commit distinto de la rama `feature/pagos`.

| Commit | Paso |
|---|---|
| `feat(pagos): módulo de pagos ...` | El módulo se entrega con los dos defectos dentro; las pruebas base pasan (no los detectan) |
| `test(pagos): pruebas de valores límite y tabla de decisión ...` | Se agregan las pruebas que los detectan: **4 de 12 fallan** |
| `fix(pagos): el último día cuenta como vigente ...` | Corrección aplicada en la rama; **luego se revirtió** para la entrega (commit `revert`), de modo que los defectos siguen en el código |

> Con Squash and merge estos commits se unen en uno solo en `main`; la evidencia del ciclo queda en el historial del Pull Request.

## Defecto 1: el día del vencimiento aparecía como vencido

| | |
|---|---|
| **Dónde** | `src/modules/pago/pago.vigencia.js`, función `esVigente` |
| **Código defectuoso** | `fecha < pago.fecha_vencimiento` |
| **Comportamiento incorrecto** | Un cliente cuya membresía vence el 31/03 aparecía como no vigente el propio 31/03, y se le negaba la entrada el último día que pagó |
| **Regla incumplida** | «El día del vencimiento todavía es vigente» (`docs/tareas/maycol-pagos.md`, sección 4) |
| **Técnica de prueba** | Valores límite: día anterior al pago, día del pago, un día antes del vencimiento, **día del vencimiento**, día siguiente |
| **Prueba que lo detecta** | `esVigente: valores límite el día del vencimiento (último día vigente)` |
| **Corrección (pendiente)** | `fecha <= pago.fecha_vencimiento` |

## Defecto 2: los pagos no PAGADOS daban vigencia

| | |
|---|---|
| **Dónde** | `src/modules/pago/pago.vigencia.js`, función `esVigente` |
| **Código defectuoso** | No se revisaba `pago.estado`: solo se comparaban las fechas |
| **Comportamiento incorrecto** | Un pago `ANULADO` o `PENDIENTE` hacía que el cliente apareciera con la membresía vigente y pudiera entrar sin haber pagado |
| **Regla incumplida** | «`PENDIENTE` y `ANULADO` no cuentan» (sección 4 de la guía) |
| **Técnica de prueba** | Tabla de decisión: estado (PAGADO, PENDIENTE, ANULADO) × fecha (dentro, fuera) |
| **Pruebas que lo detectan** | `estado PENDIENTE con fecha dentro -> no vigente`, `estado ANULADO con fecha dentro -> no vigente` y `vencimientoVigente ignora los pagos anulados y pendientes` |
| **Corrección (pendiente)** | `pago.estado === 'PAGADO' && ...` |

## Resultado de las pruebas antes de corregir

```
FAILED  esVigente: valores límite el día del vencimiento (último día vigente)
FAILED  esVigente: tabla de decisión estado x fecha, estado PENDIENTE con fecha 2026-03-15
FAILED  esVigente: tabla de decisión estado x fecha, estado ANULADO con fecha 2026-03-15
FAILED  esVigente: tabla de decisión estado x fecha, vencimientoVigente ignora los pagos anulados y pendientes
```
## Estado actual de las pruebas (con los defectos presentes)

`Tests: 4 failed, 208 passed, 212 total`. Las 4 pruebas en rojo son las mismas de arriba: demuestran que la batería de pruebas detecta ambos defectos. Con la corrección aplicada pasan las 212.

La cobertura se calcula igual con las pruebas en rojo (`npm run test:cov`).
