# Gimnasio_PruebasSoftware

Sistema de Gestión de Gimnasio / Control de Membresías.

Proyecto corto de la asignatura **Pruebas de Software** (Carrera de Software, Universidad de las Fuerzas Armadas ESPE, periodo Septiembre 2026 – Febrero 2027). Docente: Ing. Luis Castillo, Mgtr.

## Equipo

| Integrante | Responsabilidad principal |
|---|---|
| Maycol Celi | Pagos (`PAGO`) y configuración de calidad (Jest, ESLint, SonarQube, CI) |
| Rubén Alejandro | Clientes (`CLIENTE`) |
| Andres Espinoza | Membresías (`MEMBRESIA`) |
| Danny Tiupul | Accesos (`ACCESO`) |

El detalle del reparto está en [`docs/planificacion/asignacion-y-arquitectura.md`](docs/planificacion/asignacion-y-arquitectura.md).

## Descripción

El gimnasio vende **membresías** (semanal, mensual, anual) a sus **clientes**. Cada compra se registra como un **pago** que fija la fecha de vencimiento, y cada entrada o salida queda registrada como un **acceso**. Solo los clientes con membresía vigente pueden ingresar.

El sistema se escogió porque tiene fechas, pagos y estados (activo/vencido), lo que permite diseñar muchas pruebas: valores límite, particiones de equivalencia, tablas de decisión y transiciones de estado. Parte del ejercicio es provocar errores intencionales y detectarlos con pruebas.

## Tecnologías

| Uso | Herramienta |
|---|---|
| Lenguaje | JavaScript (Node.js) |
| Pruebas y cobertura (mínimo 70 %) | Jest |
| Análisis estático de estilo | ESLint |
| Análisis estático de calidad | SonarQube (Docker) |
| Control de versiones | Git y GitHub, con ramas de funcionalidad y Pull Requests |

## Base de datos

**Motor elegido: PostgreSQL (SQL).** El modelo es relacional (claves foráneas, restricciones `CHECK` y `UNIQUE`) y las restricciones del esquema son útiles para probar errores de integridad. Una base documental como MongoDB obligaría a reimplementar esas reglas en código.

- El esquema está en [`database/schema.sql`](database/schema.sql).
- Los diagramas están en [`docs/modelado/`](docs/modelado/) (conceptual, lógico, físico y completo).
- **Las pruebas con Jest no necesitan base de datos:** los repositorios son en memoria, así cada integrante trabaja sin depender de los demás.
- **Base compartida (opcional) para integración:** una instancia PostgreSQL gratuita en la nube (por ejemplo Neon o Supabase) con una sola cadena de conexión para el equipo. Esa cadena va en una variable de entorno o archivo `.env` (nunca en el repositorio). Si prefieren trabajar localmente, se puede usar PostgreSQL con Docker.

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/modelado/`](docs/modelado/) | Modelos conceptual, lógico y físico (`.mmd`, Mermaid) |
| [`docs/planificacion/reparto-trabajo.mmd`](docs/planificacion/reparto-trabajo.mmd) | Reparto por fases y flujo de Pull Requests |
| [`docs/planificacion/asignacion-y-arquitectura.md`](docs/planificacion/asignacion-y-arquitectura.md) | Funcionamiento, arquitectura, contratos y reglas anti-conflicto |

## Flujo de trabajo

1. `main` está protegido: no se hace push directo.
2. Cada funcionalidad se desarrolla en una rama `feature/<funcionalidad>` creada desde `main`.
3. Se abre un Pull Request, lo revisa otro integrante y se fusiona con el CI en verde (ESLint, Jest ≥ 70 % y SonarQube).

## Estado

Fase actual: modelado de datos y planificación. El código de la aplicación comienza con la configuración de calidad (`feature/setup-calidad`).
