# Tarea de Danny: módulo Accesos

| | |
|---|---|
| **Tabla** | `ACCESO` |
| **Rama** | `feature/accesos` |
| **Carpetas tuyas** | `src/modules/acceso/`, `tests/acceso/`, `docs/postman/accesos.postman_collection.json` |
| **Tu PR lo revisa** | Maycol |
| **Tú revisas el PR de** | Andres (`feature/membresias`) |
| **Antes de empezar** | Lee `docs/guias/00-inicio-rapido.md` y `docs/guias/plantilla-modulo.md` |

## 1. Objetivo
Registrar la entrada y salida de los clientes al gimnasio. Solo entra quien tiene membresía vigente y nadie puede tener dos entradas abiertas.

## 2. Tabla (de `database/schema.sql`)
`acceso(id_acceso, id_cliente, fecha_hora_entrada, fecha_hora_salida)`: la salida es `NULL` mientras el cliente sigue dentro; `fecha_hora_salida >= fecha_hora_entrada`.

## 3. Endpoints (`basePath: /api/accesos`)

| Método | Ruta | Cuerpo | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/accesos/entrada` | `{ id_cliente, fecha_hora? }` | 201 + acceso | 400, 404 cliente inexistente, 409 ya tiene una entrada abierta, 422 membresía no vigente |
| POST | `/api/accesos/salida` | `{ id_cliente, fecha_hora? }` | 200 + acceso con salida y `permanencia_minutos` | 400, 404 cliente inexistente, 409 no tiene entrada abierta, 422 salida anterior a la entrada |
| GET | `/api/accesos` | | 200 + lista (filtro opcional `?id_cliente=`) | |
| GET | `/api/accesos/dentro` | | 200 + clientes que están dentro ahora | |

`fecha_hora` es opcional (ISO 8601, por ejemplo `2026-03-01T14:30:00Z`); si no viene se usa la hora actual. Permite probar sin esperar y simular fechas.

No hay PUT ni DELETE: un acceso es un registro histórico.

## 4. Reglas de negocio

| Regla | Detalle |
|---|---|
| Entrada con membresía | Se consulta `tieneMembresiaVigente(id_cliente, fecha)` (módulo de Maycol); si es falso → 422 «Membresía vencida o inexistente» |
| Una sola entrada abierta | Si el cliente ya tiene un acceso sin salida → 409 |
| Salida | Solo si existe una entrada abierta; si no → 409 |
| Orden de fechas | `salida >= entrada`; si no → 422 |
| Permanencia | `permanencia_minutos` = diferencia entre salida y entrada, en **minutos** (entero redondeado hacia abajo) |
| Cruce de medianoche | Entrar a las 23:30 y salir a las 00:15 del día siguiente son 45 minutos |
| Fecha de vigencia | Para consultar vigencia se usa la parte de fecha (`YYYY-MM-DD`) de `fecha_hora` |

## 5. Contrato público (**no cambia su firma**)

| Función | Devuelve |
|---|---|
| `registrarEntrada(idCliente, fechaHora)` | acceso creado, o lanza el error correspondiente |
| `registrarSalida(idCliente, fechaHora)` | acceso con salida y `permanencia_minutos`, o lanza el error correspondiente |

## 6. Dependencias (sin esperar a nadie)
Usas al módulo Cliente (`clienteExiste`) y al de Pago (`tieneMembresiaVigente`). Cárgalos de forma perezosa y en las pruebas usa stubs, como muestra `docs/guias/plantilla-modulo.md`. Mientras Maycol no haya fusionado su módulo, tu rama se prueba solo con stubs.

## 7. Pruebas Jest (mínimo)

| Técnica | Qué probar |
|---|---|
| Transición de estados | sin entrada → dentro → fuera; intentos inválidos: salir sin entrar, entrar dos veces, salir dos veces |
| Casos negativos | cliente inexistente, membresía no vigente, salida anterior a la entrada |
| Valores límite | salida igual a la entrada (0 minutos); 59, 60 y 61 minutos; cruce de medianoche |
| Cálculo de permanencia | función pura aparte (`acceso.permanencia.js`) probada con varios casos |
| Router (supertest) | 201, 200, 400, 404, 409, 422 |

## 8. Defectos intencionales
1. Permitir una segunda entrada sin que haya salida (quitar la verificación de entrada abierta).
2. Calcular la permanencia en horas en lugar de minutos.

Anótalos en `docs/tareas/defectos-accesos.md` con el ciclo prueba que falla → corrección.

## 9. Postman
Colección `accesos.postman_collection.json`. Para probar el flujo completo necesitas un cliente con un pago `PAGADO` vigente; mientras no estén los otros módulos en `main`, insértalos desde el SQL Editor de Supabase. Guía: `docs/guias/postman.md`.

## 10. Definición de terminado
- [x] 4 endpoints funcionando contra Supabase
- [x] Reglas de entrada y salida con todos sus casos negativos
- [x] Contrato público implementado
- [x] Pruebas Jest de permanencia, servicio y router
- [x] 2 defectos intencionales documentados y corregidos
- [x] `npm run lint` y `npm run test:cov` sin errores
- [x] Colección Postman exportada y subida
- [x] Sin problemas altos de SonarQube en tus archivos
- [ ] PR aprobado por Maycol y fusionado con **Squash and merge**
