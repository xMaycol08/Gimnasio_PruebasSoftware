# Gimnasio_PruebasSoftware

Sistema de Gestión de Gimnasio / Control de Membresías.

Proyecto corto de la asignatura **Pruebas de Software** (Carrera de Software, Universidad de las Fuerzas Armadas ESPE, periodo Septiembre 2026 – Febrero 2027). Docente: Ing. Luis Castillo, Mgtr.

**Alcance:** solo back-end (API REST). No hay frontend: el código se prueba con Jest (cobertura ≥ 70 %), ESLint, SonarQube y Postman.

## Equipo

| Integrante | Responsabilidad principal |
|---|---|
| Maycol Celi | Pagos (`PAGO`) y configuración de calidad (Jest, ESLint, SonarQube, CI) |
| Rubén Bustos | Clientes (`CLIENTE`) |
| Andres Espinosa | Membresías (`MEMBRESIA`) |
| Danny Tiupul | Accesos (`ACCESO`) |

El detalle del reparto está en [`docs/planificacion/asignacion-y-arquitectura.md`](docs/planificacion/asignacion-y-arquitectura.md).

## Descripción

El gimnasio vende **membresías** (semanal, mensual, anual) a sus **clientes**. Cada compra se registra como un **pago** que fija la fecha de vencimiento, y cada entrada o salida queda registrada como un **acceso**. Solo los clientes con membresía vigente pueden ingresar.

El sistema se escogió porque tiene fechas, pagos y estados (activo/vencido), lo que permite diseñar muchas pruebas: valores límite, particiones de equivalencia, tablas de decisión y transiciones de estado. Parte del ejercicio es provocar errores intencionales y detectarlos con pruebas.

## Entregables

| Entregable | Cómo se cumple |
|---|---|
| Reporte de SonarQube | [`docs/guias/sonarqube.md`](docs/guias/sonarqube.md) |
| Back-end | API REST con Node.js y Express, conectada a Supabase (sin frontend) |
| Cobertura de código ≥ 70 % | `npm run test:cov` (falla si baja del 70 %) |
| Pruebas Jest y lint | `npm test` y `npm run lint` |
| Pruebas de endpoints con Postman | [`docs/guias/postman.md`](docs/guias/postman.md) y colecciones en `docs/postman/` |

## Tecnologías

| Uso | Herramienta |
|---|---|
| Lenguaje y servidor | JavaScript (Node.js 20+) con Express |
| Base de datos | PostgreSQL en Supabase |
| Pruebas y cobertura (mínimo 70 %) | Jest y Supertest |
| Análisis estático de estilo | ESLint |
| Análisis estático de calidad | SonarQube (Docker) |
| Pruebas de endpoints | Postman |
| Control de versiones | Git y GitHub, con ramas de funcionalidad y Pull Requests |

## Inicio rápido

```
git clone https://github.com/xMaycol08/Gimnasio_PruebasSoftware.git
cd Gimnasio_PruebasSoftware
npm install
cp .env.example .env     # en Windows: copy .env.example .env
npm run db:check         # comprueba la conexión a Supabase y las 4 tablas
npm run dev              # API en http://localhost:3000  (prueba: /health)
```

El `.env` con la cadena de conexión real **no se sube a Git**: Maycol lo comparte por un medio privado. La guía completa está en [`docs/guias/00-inicio-rapido.md`](docs/guias/00-inicio-rapido.md).

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta la API con reinicio automático |
| `npm test` | Pruebas Jest |
| `npm run test:cov` | Pruebas y cobertura (umbral 70 %) |
| `npm run lint` | ESLint |
| `npm run db:check` | Verifica la conexión a la base |

## Base de datos

**Motor: PostgreSQL (SQL), alojado en Supabase.** El modelo es relacional (claves foráneas, restricciones `CHECK` y `UNIQUE`) y las restricciones del esquema sirven para probar errores de integridad.

- El esquema está en [`database/schema.sql`](database/schema.sql) y se ejecuta una vez en el *SQL Editor* de Supabase.
- [`database/seguridad-rls.sql`](database/seguridad-rls.sql) activa RLS en las 4 tablas (también una sola vez).
- Los diagramas están en [`docs/modelado/`](docs/modelado/) (conceptual, lógico, físico y completo).
- Todos usan la misma base compartida con la cadena `DATABASE_URL` de su `.env` (ver `.env.example`).
- **Las pruebas con Jest no necesitan base de datos:** el repositorio se reemplaza por un stub, así cada integrante trabaja sin depender de los demás.

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/modelado/`](docs/modelado/) | Modelos conceptual, lógico y físico (`.mmd`, Mermaid) |
| [`docs/planificacion/reparto-trabajo.mmd`](docs/planificacion/reparto-trabajo.mmd) | Reparto por fases y flujo de Pull Requests |
| [`docs/planificacion/asignacion-y-arquitectura.md`](docs/planificacion/asignacion-y-arquitectura.md) | Funcionamiento, arquitectura, contratos y reglas anti-conflicto |
| [`docs/guias/`](docs/guias/) | Inicio rápido, plantilla de módulo, Postman y SonarQube |
| [`docs/tareas/`](docs/tareas/) | Guía detallada por integrante: endpoints, reglas, pruebas y checklist |
| [`docs/tareas/fase-2.md`](docs/tareas/fase-2.md) | Integración entre módulos, reportes y uso de la base de datos |

## Flujo de trabajo

1. Por acuerdo del grupo, nadie hace push directo a `main` (GitHub no lo bloquea, así que depende de todos): todo entra por Pull Request.
2. Cada funcionalidad se desarrolla en su rama de funcionalidad (`feature/clientes`, `feature/membresias`, `feature/pagos`, `feature/accesos`), creada desde `main`.
3. Quien termina abre un Pull Request hacia `main`. Lo revisa el compañero asignado (comenta o aprueba) y debe tener el CI en verde (ESLint y Jest ≥ 70 %).
4. **Maycol hace el merge de todos los PRs** con **Squash and merge**. Así el historial de `main` queda limpio y uniforme, y el mensaje del commit lo controla una sola persona.

## Estado

- Fase 0 (base del proyecto): hecha.
- Fase 1 (módulos en paralelo): ver la guía de cada integrante en [`docs/tareas/`](docs/tareas/).
