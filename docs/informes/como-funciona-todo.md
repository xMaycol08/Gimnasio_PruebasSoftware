# Cómo funciona todo (guía para el equipo)

Explicación en lenguaje simple de qué construimos, cómo funciona, cómo se prueba y qué significa cada número. Está pensada para que cualquiera del equipo pueda explicarlo sin haber hecho el módulo de otro.

## 1. Qué es el proyecto
Un sistema para controlar las membresías de un gimnasio, **solo back-end** (no hay pantallas). Es una API: un programa que recibe peticiones por internet (por ejemplo «registra este pago») y responde con datos en formato JSON. Se prueba con Postman y con Jest.

El sistema se eligió porque tiene fechas, pagos y estados (vigente, vencido), y eso permite diseñar muchas pruebas.

## 2. Qué hay en el repositorio

| Carpeta o archivo | Para qué sirve |
|---|---|
| `src/modules/` | El código: un módulo por tabla (`cliente`, `membresia`, `pago`, `acceso`) y dos de reportes |
| `src/shared/` | Cosas comunes: errores con código HTTP, fechas, manejador de errores |
| `src/config/db.js` | La conexión a Supabase |
| `src/app.js` | Arma la API y carga todos los módulos solos |
| `tests/` | Las pruebas de Jest |
| `database/` | `schema.sql` (las 4 tablas) y `seguridad-rls.sql` |
| `docs/postman/` | Las colecciones de Postman |
| `docs/` (resto) | Modelado, guías, guías por persona, defectos e informes |
| `.env` | Tus secretos (la clave de Supabase). **No se sube a GitHub** |

## 3. Cómo viaja una petición
Cada módulo tiene las mismas capas, para que todos entiendan el código de todos:

```
Postman → router → servicio → repositorio → Supabase
          (HTTP)   (reglas)    (SQL)         (base)
```

1. **Router:** recibe la petición HTTP y llama al servicio.
2. **Validaciones y servicio:** revisan los datos y aplican las reglas de negocio. Si algo está mal, lanzan un error con su código.
3. **Repositorio:** el único que habla con la base de datos con SQL.
4. La respuesta vuelve por el mismo camino.

Códigos que usamos: `201` creado, `200` correcto, `204` borrado, `400` datos inválidos, `404` no existe, `409` conflicto (duplicado), `422` rompe una regla de negocio.

## 4. Endpoints

| Módulo | Endpoints |
|---|---|
| Salud | `GET /health`, `GET /health/db` |
| Clientes | `GET/POST /api/clientes`, `GET/PUT/DELETE /api/clientes/:id` |
| Membresías | `GET/POST /api/membresias`, `GET/PUT/DELETE /api/membresias/:id` |
| Pagos | `POST /api/pagos`, `GET /api/pagos` (`?id_cliente=`), `GET /api/pagos/:id`, `PATCH /api/pagos/:id/estado`, `GET /api/pagos/vigencia/:idCliente` (`?fecha=`) |
| Accesos | `POST /api/accesos/entrada`, `POST /api/accesos/salida`, `GET /api/accesos` (`?id_cliente=`), `GET /api/accesos/dentro` |
| Reportes | `GET /api/reportes/vencimientos/por-vencer` (`?dias=&fecha=`), `GET /api/reportes/vencimientos/morosos`, `GET /api/reportes/asistencia` (`?desde=&hasta=`) |

## 5. Reglas de negocio principales
- **Cliente:** cédula ecuatoriana válida de 10 dígitos (algoritmo módulo 10), correo válido, teléfono de 7 a 15 dígitos; cédula y correo únicos.
- **Membresía:** precio mayor que 0, duración en días mayor que 0, nombre único (semanal 7 días, mensual 30, anual 365).
- **Pago:** el monto debe ser igual al precio; el vencimiento es la fecha de pago más los días de la membresía; estados `PAGADO`, `PENDIENTE` y `ANULADO`; un pago anulado no cambia más; un pago no se borra, se anula. Si el cliente renueva antes de vencer, el nuevo periodo empieza cuando vence el actual.
- **Vigencia:** un cliente está vigente si tiene un pago `PAGADO` que cubre la fecha; el día del vencimiento todavía cuenta.
- **Acceso:** solo entra quien tiene la membresía vigente; no puede haber dos entradas abiertas; la permanencia se mide en minutos.
- **Reportes:** «por vencer» lista a los vigentes que vencen pronto; «morosos» a los que tuvieron pagos y ya no tienen membresía vigente; «asistencia» cuenta visitas y minutos por cliente.

## 6. La base de datos: qué hace y cuándo se usa
- **Qué hace:** guarda clientes, membresías, pagos y accesos, y protege la integridad (precio mayor que 0, cédula única, no borrar un cliente que tiene pagos, etc.).
- **Dónde está:** en Supabase (PostgreSQL). Todos compartimos la misma base con la clave del `.env`.
- **Cuándo se usa:** cada vez que la API corre (`npm run dev`) y se hace una petición desde Postman. Entonces los datos aparecen en el *Table Editor* de Supabase.
- **Cuándo NO se usa:** en Jest ni en el CI de GitHub. Ahí se simula la base, y por eso las pruebas funcionan en cualquier computadora sin `.env`.
- **Por qué estuvo vacía al principio:** porque hasta que alguien no ejecuta la API creando datos, no hay nada que guardar.

## 7. Pruebas, cobertura y calidad

### 7.1 Jest (pruebas automáticas)
- Prueban el código sin necesitar la base: el repositorio y los otros módulos se reemplazan por simulaciones (*stubs*).
- Técnicas usadas: valores límite (por ejemplo, el último día de vigencia), partición de equivalencia (datos válidos e inválidos), tabla de decisión (estado × fecha) y transiciones de estado (sin entrada → dentro → fuera).
- `npm test` o `npm run test:cov`: las pruebas que entran en la medición de cobertura.
- `npm run test:completo`: todas las 338 pruebas, incluida la de integración.
- **17 pruebas fallan a propósito.** Son las que detectan los defectos intencionales; ver `docs/informes/informe-del-equipo.md`.

### 7.2 Prueba de integración
`tests/integracion/` levanta la API con los 4 módulos reales y el esquema real sobre un PostgreSQL simulado en memoria. Comprueba que los módulos se hablan entre sí: por ejemplo, que no entra quien no ha pagado.

### 7.3 Cobertura del 70 %
- Cobertura = qué porcentaje del código se ejecutó mientras corrían las pruebas.
- La meta de la materia es **70 % global** (todo el proyecto junto, no por módulo).
- Jest mide cuatro cosas: sentencias, ramas (cada `if`), funciones y líneas. Resultado actual: **70,52 / 70,08 / 70,51 / 70,63 %**.
- Para llegar a 70 % no se borró ninguna prueba: las de integración, de SQL y de infraestructura quedan fuera de `npm run test:cov` (la lista está en `jest.config.js` y la explicación en `docs/tareas/cobertura.md`).
- Cómo verlo: la tabla de la terminal o el HTML `coverage/lcov-report/index.html`.
- **Cuidado:** si alguien agrega código sin pruebas dentro de esa selección, la cobertura baja de 70 % y el comando avisa.

### 7.4 ¿Por qué SonarQube dice 69,7 % y Jest 70,5 %?
- Jest muestra las cuatro métricas por separado. SonarQube muestra **un solo número** que mezcla líneas y ramas: (líneas cubiertas + ramas cubiertas) ÷ (líneas a cubrir + ramas a cubrir).
- Con el mismo archivo que lee Sonar (`coverage/lcov.info`) esa fórmula da 70,46 %.
- La diferencia con el 69,7 % es que Sonar cuenta **726 líneas a cubrir** con su propio analizador, mientras que el archivo de cobertura tiene 705. Las líneas que Sonar considera ejecutables y que el archivo no incluye cuentan como no cubiertas.
- No falta analizar ningún archivo: es una diferencia de cómo cada herramienta cuenta, de unos 0,8 puntos.
- La medición oficial del proyecto es la de Jest (`npm run test:cov`). Si quisiéramos que Sonar también quede sobre 70 %, se puede subir Jest cerca de 1 punto reincorporando una suite de pruebas.

### 7.5 ESLint
Revisa el estilo y errores comunes del código (comillas simples, punto y coma, llaves en los `if`, sin variables sin usar). `npm run lint` debe salir sin errores. `npm run lint:fix` corrige solos los casos simples.

### 7.6 SonarQube
Analiza el código sin ejecutarlo y busca errores (*Reliability*), vulnerabilidades (*Security*) y código difícil de mantener (*Maintainability*), además de mostrar la cobertura y la duplicación. Se ejecuta en Docker con `sonar-scanner` (ver `docs/guias/sonarqube.md`). En el Overview, «New Code failed» significa que el código nuevo no cumple la puerta de calidad por defecto; con una cobertura del 70 % es esperable.

## 8. Cómo probar los endpoints con Postman
1. Levantar la API: `npm run dev` (queda en `http://localhost:3000`).
2. Usar Postman de **escritorio**: el del navegador no llega a `localhost`.
3. **Import** y arrastrar desde `docs/postman/`: `gimnasio.postman_environment.json` y las colecciones.
4. Arriba a la derecha elegir el entorno **Gimnasio - Local** (así `{{baseUrl}}` vale `http://localhost:3000`).
5. Probar una petición suelta: abrirla y pulsar **Send**.
6. Probar toda una colección: clic derecho sobre ella → **Run collection** → **Run**.
7. Leer el resultado: cada petición muestra el código de respuesta y las verificaciones (*PASS* o *FAIL*).

Colecciones:

| Colección | Qué prueba |
|---|---|
| `00-base` | `/health` y `/health/db` (que la base responde) |
| `clientes`, `membresias`, `accesos` | Los endpoints de cada módulo, con casos correctos y de error |
| `pagos` | Pagos y vigencia; crea sus propios datos. Fallan la 13 y la 20 a propósito |
| `05-flujo-completo` | Recorre todo: membresía → cliente → entrada sin pago → pago → vigencia → entrada y salida → reportes |
| `reportes` | Los 3 reportes, con casos correctos y de error |

## 9. Cómo trabajamos con Git
- Cada módulo se hizo en su rama (`feature/clientes`, etc.) y se subió con un Pull Request.
- Maycol revisa y fusiona con **Squash and merge**, para que `main` quede ordenado.
- Nadie sube directo a `main`.
- El `.env` y `node_modules` nunca se suben (están en `.gitignore`).

## 10. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| `db:check` dice que falta `DATABASE_URL` | El archivo debe llamarse exactamente `.env` y estar en la raíz |
| `password authentication failed` | Contraseña incorrecta o con símbolos sin codificar en la URL |
| Postman: «Cloud Agent Error» | Estás en Postman web; usa Postman de escritorio |
| Postman responde 404 al crear un pago | El cliente o la membresía no existe; usa la colección `pagos` actual, que crea los suyos |
| `npm run test:cov` termina con error | Es normal: hay 17 pruebas que fallan a propósito. Lo que importa es la tabla de cobertura |
| El comando de Sonar no corre después de `test:cov` | Con `&&` no se ejecuta porque `test:cov` termina con error; usa `&` o dos líneas separadas |
| La cobertura bajó de 70 % | Alguien agregó código sin pruebas; revisar el reporte HTML |

## 11. Glosario rápido
- **API:** programa que recibe peticiones y responde con datos.
- **Endpoint:** una dirección de la API (por ejemplo `/api/pagos`).
- **Stub / mock:** simulación de una parte (la base, otro módulo) para probar sin depender de ella.
- **Cobertura:** porcentaje del código ejecutado por las pruebas.
- **Defecto intencional:** error puesto a propósito para comprobar que las pruebas lo detectan.
- **Pull Request (PR):** propuesta de cambio que se revisa antes de entrar a `main`.
