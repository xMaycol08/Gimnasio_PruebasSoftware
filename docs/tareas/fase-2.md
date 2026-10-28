# Fase 2: integración y reportes

## 1. Integración entre módulos
Los 4 módulos (clientes, membresías, pagos y accesos) trabajan juntos:

| Quien llama | A quién | Para qué |
|---|---|---|
| Pagos | Clientes | `clienteExiste`: el cliente debe existir |
| Pagos | Membresías | `obtenerPorId` y `calcularVencimiento`: monto igual al precio y fecha de vencimiento |
| Accesos | Clientes | `clienteExiste` |
| Accesos | Pagos | `tieneMembresiaVigente`: solo entra quien tiene membresía vigente |

### Pruebas de integración
- **Jest:** `tests/integracion/flujo.integracion.test.js` levanta la API con los módulos reales y el esquema real (`database/schema.sql`) sobre un PostgreSQL simulado en memoria (`pg-mem`). Ejercita el SQL de verdad sin necesitar Supabase ni el `.env`.
- **Postman:** `docs/postman/05-flujo-completo.postman_collection.json` recorre membresía → cliente → entrada sin pago (422) → pago → vigencia → entrada y salida → reportes. Genera datos únicos en cada ejecución, así que se puede repetir.

Ambas solo verifican comportamientos que no dependen de los defectos intencionales. La prueba de Jest no entra en `npm run test:cov` (ver `docs/tareas/cobertura.md`); se ejecuta con `npm run test:completo`.

## 2. Reportes (`/api/reportes`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/reportes/vencimientos/por-vencer?dias=7&fecha=` | Clientes con membresía vigente que vence en los próximos `dias` días (1 a 365, por defecto 7), ordenados por vencimiento, con `dias_restantes` |
| GET | `/api/reportes/vencimientos/morosos?fecha=` | Clientes que tuvieron pagos y no tienen ninguna membresía pagada que cubra la fecha. `motivo`: `MEMBRESIA_VENCIDA` o `PAGO_PENDIENTE` |
| GET | `/api/reportes/asistencia?desde=&hasta=` | Visitas, minutos totales y accesos sin salida por cliente. Por defecto los últimos 30 días; rango máximo de 366 días; `hasta` incluido |

`fecha`, `desde` y `hasta` usan el formato `YYYY-MM-DD` y se rechazan con 400 si son inválidos. Un cliente que pagó por adelantado no aparece como moroso; uno que nunca pagó tampoco.

Cada reporte es un módulo independiente (`src/modules/reporte-vencimientos`, `src/modules/reporte-asistencia`) con la misma estructura que los demás. Colección de Postman: `docs/postman/reportes.postman_collection.json`.

## 3. ¿Dónde se usa la base de datos?
- **Al correr la API** (`npm run dev` y Postman), todos los módulos leen y escriben en Supabase mediante `DATABASE_URL`. La conexión se comprueba con `GET /health/db` y `npm run db:check`.
- **En Jest y en el CI** no se usa Supabase: los módulos se prueban con repositorios simulados, y la integración con `pg-mem`. Por eso las pruebas corren en cualquier equipo sin `.env`.
- **Las tablas de Supabase están vacías** hasta que alguien ejecuta la API y crea datos. Para verlos en la base real: `npm run dev`, ejecutar en Postman la colección `05 - Flujo completo` y abrir *Table Editor* en Supabase; aparecerán filas en `membresia`, `cliente`, `pago` y `acceso`.
