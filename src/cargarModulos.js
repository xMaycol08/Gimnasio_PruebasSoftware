const fs = require('node:fs');
const path = require('node:path');

const DIRECTORIO_POR_DEFECTO = path.join(__dirname, 'modules');

// Registra automáticamente cada módulo de src/modules/<modulo>/index.js.
// Cada módulo exporta { basePath, router } y así nadie edita app.js (evita conflictos entre ramas).
// Las carpetas que empiezan con "_" o "." se ignoran.
const cargarModulos = (app, directorio = DIRECTORIO_POR_DEFECTO) => {
  const cargados = [];
  const entradas = fs.readdirSync(directorio, { withFileTypes: true });

  for (const entrada of entradas) {
    if (!entrada.isDirectory() || /^[_.]/.test(entrada.name)) {
      continue;
    }
    const archivo = path.join(directorio, entrada.name, 'index.js');
    if (!fs.existsSync(archivo)) {
      continue;
    }
    const modulo = require(archivo);
    if (!modulo.basePath || typeof modulo.router !== 'function') {
      throw new Error(`El módulo "${entrada.name}" debe exportar basePath y router`);
    }
    app.use(modulo.basePath, modulo.router);
    cargados.push(modulo.basePath);
  }
  return cargados;
};

module.exports = cargarModulos;
