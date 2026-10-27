# Tarea de Andres: módulo Membresías

| | |
|---|---|
| **Tabla** | `MEMBRESIA` |
| **Rama** | `feature/membresias` |
| **Carpetas tuyas** | `src/modules/membresia/`, `tests/membresia/`, `docs/postman/membresias.postman_collection.json` |
| **Tu PR lo revisa** | Danny |
| **Tú revisas el PR de** | Rubén (`feature/clientes`) |
| **Antes de empezar** | Lee `docs/guias/00-inicio-rapido.md` y `docs/guias/plantilla-modulo.md` |

## 1. Objetivo
Gestionar los tipos de membresía (CRUD completo) y ofrecer el **cálculo de la fecha de vencimiento**, que usa el módulo de Pagos.

## 2. Tabla (de `database/schema.sql`)
`membresia(id_membresia, nombre, precio, duracion_dias)`: `nombre` único, `precio > 0`, `duracion_dias > 0`.

Datos base que debe poder crear el sistema: **semanal** (7 días), **mensual** (30 días), **anual** (365 días).

## 3. Endpoints (`basePath: /api/membresias`)

| Método | Ruta | Cuerpo | Éxito | Errores |
|---|---|---|---|---|
| POST | `/api/membresias` | `{ nombre, precio, duracion_dias }` | 201 + membresía | 400 datos inválidos, 409 nombre repetido |
| GET | `/api/membresias` | | 200 + lista | |
| GET | `/api/membresias/:id` | | 200 + membresía | 404 |
| PUT | `/api/membresias/:id` | `{ nombre, precio, duracion_dias }` | 200 + membresía | 400, 404, 409 |
| DELETE | `/api/membresias/:id` | | 204 | 404, 409 si ya tiene pagos |

## 4. Reglas de negocio y validaciones

| Campo | Regla |
|---|---|
| `nombre` | Obligatorio, 1 a 30 caracteres, único (sin distinguir mayúsculas) → 409 si se repite |
| `precio` | Número mayor que 0, máximo 2 decimales, menor que 1 000 000 (columna `NUMERIC(8,2)`) |
| `duracion_dias` | Entero mayor que 0 (no acepta 1.5 ni texto) |
| Eliminar | Si ya tiene pagos, Postgres lo impide (error `23503`); respóndelo como 409 con un mensaje claro |

**Cálculo de vencimiento:** `calcularVencimiento(fechaPago, duracionDias)` recibe `'YYYY-MM-DD'` y devuelve `'YYYY-MM-DD'` sumando los días calendario. Cuida:
- fines de mes (`2026-01-31` + 30 días),
- febrero y año bisiesto (`2028-02-28` + 1 día es `2028-02-29`),
- cambio de año (`2026-12-31` + 1 día).

Consejo: suma los días con `Date.UTC` y convierte de vuelta a texto; no uses la hora local (el horario de verano o la zona horaria descuadran el resultado).

## 5. Contrato público (**no cambia su firma**)

| Función | Devuelve |
|---|---|
| `obtenerPorId(idMembresia)` | `{ id_membresia, nombre, precio, duracion_dias }` o `null` |
| `calcularVencimiento(fechaPago, duracionDias)` | `'YYYY-MM-DD'` |

Exportadas desde `src/modules/membresia/index.js` junto a `basePath` y `router`. `calcularVencimiento` es una función pura; ponla en un archivo aparte (por ejemplo `membresia.fechas.js`) para probarla fácilmente.

## 6. Pruebas Jest (mínimo; amplía las que quieras)

| Técnica | Qué probar |
|---|---|
| Valores límite | precio `-1`, `0`, `0.01`, `999999.99`, `1000000`; duración `0`, `1`; nombre de 0, 1, 30 y 31 caracteres |
| Partición de equivalencia | duración entera / decimal / texto / vacía; precio numérico / texto / con 3 decimales |
| Pruebas de fechas | 7, 30 y 365 días; fin de mes; 28 y 29 de febrero (año bisiesto y no bisiesto); cambio de año |
| Servicio (repositorio con stub) | crear OK, nombre duplicado → `ErrorConflicto`, obtener inexistente → `ErrorNoEncontrado`, eliminar con pagos → `ErrorConflicto` |
| Router (supertest) | códigos 201, 200, 204, 400, 404, 409 |

## 7. Defectos intencionales
Introduce **dos defectos** y sigue el ciclo: documentarlo → prueba que falla (`test:`) → corrección (`fix:`). Ideas para ti:
1. Sumar mal los días en febrero bisiesto (tratar siempre febrero como de 28 días).
2. Aceptar `precio = 0` (cambiar `> 0` por `>= 0`).

Anótalos en `docs/tareas/defectos-membresias.md`.

## 8. Postman
Colección `membresias.postman_collection.json` con una petición por endpoint y una por error. Crea en ella las 3 membresías base (semanal, mensual, anual): las usarán los demás en sus pruebas. Guía: `docs/guias/postman.md`.

## 9. Definición de terminado
- [ ] 5 endpoints funcionando contra Supabase
- [ ] `calcularVencimiento` correcta en todos los casos de fechas
- [ ] Contrato público implementado
- [ ] Pruebas Jest de validaciones, fechas, servicio y router
- [ ] 2 defectos intencionales documentados y corregidos
- [ ] `npm run lint` y `npm run test:cov` sin errores
- [ ] Colección Postman exportada y subida
- [ ] Sin problemas altos de SonarQube en tus archivos
- [ ] PR aprobado por Danny y fusionado con **Squash and merge**
