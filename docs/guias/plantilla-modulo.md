# Plantilla de módulo

Todos los módulos se construyen igual. Así se lee el código de cualquiera y **nadie edita `src/app.js`**: la API carga automáticamente cada carpeta de `src/modules/` que tenga un `index.js` con `basePath` y `router`.

## Estructura

```
src/modules/<modulo>/
    <modulo>.validaciones.js   funciones puras que validan datos (lanzan ErrorValidacion)
    <modulo>.repositorio.js    consultas SQL a Supabase (único archivo que habla con la base)
    <modulo>.servicio.js       reglas de negocio (recibe sus dependencias por parámetro)
    <modulo>.router.js         endpoints de Express (solo traduce HTTP <-> servicio)
    index.js                   exporta { basePath, router } y el contrato público
tests/<modulo>/
    <modulo>.validaciones.test.js
    <modulo>.servicio.test.js     (repositorio y otros módulos reemplazados por stubs)
    <modulo>.router.test.js       (con supertest, servicio reemplazado por un stub)
```

## Errores y códigos HTTP

Se importan de `src/shared/errores.js` y el manejador global los convierte a JSON `{ "error": "mensaje" }`:

| Error | HTTP | Cuándo |
|---|---|---|
| `ErrorValidacion` | 400 | dato con formato inválido o faltante |
| `ErrorNoEncontrado` | 404 | el id no existe |
| `ErrorConflicto` | 409 | duplicado (cédula repetida, doble entrada abierta) |
| `ErrorReglaNegocio` | 422 | dato válido pero la regla de negocio lo impide (membresía vencida) |

Respuestas correctas: `201` al crear, `200` al consultar o modificar, `204` al eliminar.

## Fechas y números
- `DATE` en SQL se maneja como texto `'YYYY-MM-DD'` (en JSON y en JavaScript).
- `TIMESTAMP` se maneja como `Date` en UTC; en JSON va como ISO 8601 (`2026-03-01T14:30:00.000Z`).
- `NUMERIC` (precio, monto) llega como número.

## Ejemplo mínimo (recurso inventado `recurso`)

`recurso.validaciones.js`
```js
const { ErrorValidacion } = require('../../shared/errores');

const validarNombre = (nombre) => {
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    throw new ErrorValidacion('El nombre es obligatorio');
  }
  return nombre.trim();
};

module.exports = { validarNombre };
```

`recurso.repositorio.js`
```js
const db = require('../../config/db');

const crear = async ({ nombre }) => {
  const { rows } = await db.query('INSERT INTO recurso (nombre) VALUES ($1) RETURNING *', [nombre]);
  return rows[0];
};

const buscarPorId = async (id) => {
  const { rows } = await db.query('SELECT * FROM recurso WHERE id_recurso = $1', [id]);
  return rows[0] || null;
};

module.exports = { crear, buscarPorId };
```
Siempre con parámetros (`$1`, `$2`…), **nunca** concatenando texto en el SQL (inyección SQL; SonarQube lo marca como vulnerabilidad).

`recurso.servicio.js`
```js
const { ErrorNoEncontrado } = require('../../shared/errores');
const { validarNombre } = require('./recurso.validaciones');

// El repositorio se recibe por parámetro: en las pruebas se reemplaza por un stub.
const crearServicio = ({ repositorio = require('./recurso.repositorio') } = {}) => ({
  async crear(datos) {
    return repositorio.crear({ nombre: validarNombre(datos.nombre) });
  },
  async obtenerPorId(id) {
    const recurso = await repositorio.buscarPorId(id);
    if (!recurso) {
      throw new ErrorNoEncontrado(`No existe el recurso ${id}`);
    }
    return recurso;
  },
});

module.exports = crearServicio;
```

`recurso.router.js`
```js
const express = require('express');
const asyncHandler = require('../../shared/asyncHandler');

const crearRouter = (servicio) => {
  const router = express.Router();
  router.post('/', asyncHandler(async (req, res) => res.status(201).json(await servicio.crear(req.body))));
  router.get('/:id', asyncHandler(async (req, res) => res.json(await servicio.obtenerPorId(Number(req.params.id)))));
  return router;
};

module.exports = crearRouter;
```

`index.js`
```js
const crearServicio = require('./recurso.servicio');
const crearRouter = require('./recurso.router');

const servicio = crearServicio();

module.exports = {
  basePath: '/api/recursos',
  router: crearRouter(servicio),
  // contrato público: lo que usan los demás módulos
  obtenerPorId: servicio.obtenerPorId,
};
```

## Usar a otro módulo sin esperarlo

Tu servicio recibe al otro módulo por parámetro y lo carga **solo cuando lo usa** (así tu rama funciona aunque el módulo del compañero todavía no esté en `main`):

```js
const crearServicio = ({
  repositorio = require('./pago.repositorio'),
  obtenerClientes = () => require('../cliente'),   // se resuelve al llamarlo
} = {}) => ({
  async registrar(datos) {
    const existe = await obtenerClientes().clienteExiste(datos.id_cliente);
    if (!existe) {
      throw new ErrorNoEncontrado('El cliente no existe');
    }
    // ...
  },
});
```
En las pruebas pasas un stub:
```js
const servicio = crearServicio({
  repositorio: repoFalso,
  obtenerClientes: () => ({ clienteExiste: jest.fn().mockResolvedValue(true) }),
});
```

## Pruebas del router (con supertest)

```js
const request = require('supertest');
const express = require('express');
const crearRouter = require('../../src/modules/recurso/recurso.router');
const { manejadorErrores } = require('../../src/shared/manejadorErrores');

const app = express();
app.use(express.json());
app.use('/api/recursos', crearRouter(servicioFalso));
app.use(manejadorErrores);

test('POST /api/recursos responde 201', async () => {
  const res = await request(app).post('/api/recursos').send({ nombre: 'x' });
  expect(res.status).toBe(201);
});
```

## Reglas ESLint a tener presentes
Comillas simples, punto y coma, `===` (nunca `==`), `const`/`let` (nunca `var`), llaves en todos los `if`, sin variables sin usar (si no usas un parámetro, nómbralo con `_`), sin `console.log` (usa `console.warn`/`console.error` solo si es necesario).
