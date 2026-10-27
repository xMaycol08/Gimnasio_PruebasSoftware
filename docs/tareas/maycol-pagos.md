# Tarea de Maycol: módulo Pagos (y calidad del proyecto)

| | |
|---|---|
| **Tabla** | `PAGO` |
| **Rama** | `feature/pagos` |
| **Carpetas tuyas** | `src/modules/pago/`, `tests/pago/`, `docs/postman/pagos.postman_collection.json` y los archivos globales (ver 9) |
| **Tu PR lo revisa** | Rubén |
| **Tú revisas el PR de** | Danny (`feature/accesos`) |
| **Antes de empezar** | Fase 0 lista (este PR). Lee `docs/guias/plantilla-modulo.md` |

## 1. Objetivo
Registrar los pagos de membresías, calcular su vencimiento, controlar su estado y responder si un cliente tiene la membresía **vigente** (lo usa Danny para permitir la entrada).

## 2. Tabla (de `database/schema.sql`)
`pago(id_pago, id_cliente, id_membresia, fecha_pago, fecha_vencimiento, monto, estado)`: `estado` ∈ `PAGADO`, `PENDIENTE`, `ANULADO`; `monto > 0`; `fecha_vencimiento >= fecha_pago`.

## 3. Endpoints (`basePath: /api/pagos`)

| Método | Ruta | Cuerpo | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/pagos` | `{ id_cliente, id_membresia, fecha_pago, monto, estado? }` | 201 + pago | 400, 404 cliente o membresía inexistente, 422 monto distinto del precio |
| GET | `/api/pagos` | | 200 + lista (filtro opcional `?id_cliente=`) | |
| GET | `/api/pagos/:id` | | 200 + pago | 404 |
| PATCH | `/api/pagos/:id/estado` | `{ estado }` | 200 + pago | 400 estado inválido, 404, 422 transición no permitida |
| GET | `/api/pagos/vigencia/:idCliente` | `?fecha=YYYY-MM-DD` (opcional, por defecto hoy) | 200 `{ vigente, fecha_vencimiento }` | 404 cliente inexistente |

No hay DELETE: un pago nunca se borra, se **anula**.

## 4. Reglas de negocio

| Regla | Detalle |
|---|---|
| Vencimiento | `fecha_vencimiento = calcularVencimiento(fecha_pago, duracion_dias)` (función de Andres) |
| Monto | Debe ser igual al `precio` de la membresía → si no, 422 |
| Estado inicial | Si no viene, `PAGADO` |
| Transiciones | `PENDIENTE → PAGADO`, `PENDIENTE → ANULADO`, `PAGADO → ANULADO`. Un pago `ANULADO` no cambia más (422) |
| Vigencia | El cliente está vigente en una fecha si existe un pago `PAGADO` con `fecha_pago <= fecha <= fecha_vencimiento`. `PENDIENTE` y `ANULADO` no cuentan. **El día del vencimiento todavía es vigente.** |
| Renovación anticipada | Si el cliente paga estando vigente, el nuevo vencimiento se cuenta desde el vencimiento actual (no desde la fecha de pago) |
| Pago duplicado | Mismo cliente, misma membresía y misma `fecha_pago` con un pago no anulado → 409 |

## 5. Contrato público (**no cambia su firma**)

| Función | Devuelve |
|---|---|
| `tieneMembresiaVigente(idCliente, fecha)` | `boolean` (`fecha` en `'YYYY-MM-DD'`) |

## 6. Dependencias (sin esperar a nadie)
Usas al módulo Cliente (`clienteExiste`) y al de Membresía (`obtenerPorId`, `calcularVencimiento`). Cárgalos de forma perezosa y en las pruebas usa stubs, como muestra `docs/guias/plantilla-modulo.md`. El contrato exacto está en `docs/planificacion/asignacion-y-arquitectura.md`.

## 7. Pruebas Jest (mínimo)

| Técnica | Qué probar |
|---|---|
| Valores límite de fechas | consultar vigencia el día antes del vencimiento, **el día del vencimiento**, el día siguiente; el día del pago |
| Tabla de decisión | estado (`PAGADO`, `PENDIENTE`, `ANULADO`) × fecha (dentro / fuera de rango) → vigente sí/no |
| Transición de estados | las 3 transiciones válidas y las inválidas (desde `ANULADO`, de `PAGADO` a `PENDIENTE`) |
| Renovación | pago anticipado extiende desde el vencimiento actual; pago tardío cuenta desde la fecha de pago |
| Casos negativos | cliente inexistente, membresía inexistente, monto incorrecto, pago duplicado |
| Router (supertest) | 201, 200, 400, 404, 409, 422 |

## 8. Defectos intencionales
1. Comparar `<` en lugar de `<=` al evaluar si el vencimiento es hoy (el último día sale como vencido).
2. Contar los pagos `ANULADO` como vigentes.

Anótalos en `docs/tareas/defectos-pagos.md` con el ciclo prueba que falla → corrección.

## 9. Además: archivos globales (calidad del proyecto)
Eres el dueño de `package.json`, `eslint.config.js`, `jest.config.js`, `sonar-project.properties`, `.github/workflows/` y `README.md`. Pendientes después de la Fase 0:
- [ ] Activar protección de `main` en GitHub (*Settings → Branches*: exigir Pull Request y que el check `calidad` del CI pase; solo permitir Squash merge).
- [ ] Cuando los 4 módulos estén en `main`: correr SonarQube global (`docs/guias/sonarqube.md`) y recopilar el reporte (inicial y final).
- [ ] Verificar la cobertura global ≥ 70 % (`npm run test:cov`).
- [ ] Armar el informe final con capturas: SonarQube, cobertura Jest, lint y las colecciones de Postman.

## 10. Postman
Colección `pagos.postman_collection.json`. Prepárala con un cliente y una membresía existentes. Guía: `docs/guias/postman.md`.

## 11. Definición de terminado
- [ ] 4 endpoints funcionando contra Supabase
- [ ] `tieneMembresiaVigente` implementada y probada con valores límite
- [ ] Pruebas Jest de validaciones, servicio y router
- [ ] 2 defectos intencionales documentados y corregidos
- [ ] `npm run lint` y `npm run test:cov` sin errores
- [ ] Colección Postman exportada y subida
- [ ] Sin problemas altos de SonarQube en tus archivos
- [ ] PR aprobado por Rubén y fusionado con **Squash and merge**
