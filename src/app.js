const express = require('express');
const db = require('./config/db');
const cargarModulos = require('./cargarModulos');
const asyncHandler = require('./shared/asyncHandler');
const { manejadorErrores, noEncontrado } = require('./shared/manejadorErrores');

const crearApp = ({ directorioModulos } = {}) => {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ estado: 'ok', fecha: new Date().toISOString() });
  });

  app.get(
    '/health/db',
    asyncHandler(async (_req, res) => {
      await db.query('SELECT 1');
      res.json({ estado: 'ok', baseDeDatos: 'conectada' });
    })
  );

  cargarModulos(app, directorioModulos);

  app.use(noEncontrado);
  app.use(manejadorErrores);
  return app;
};

module.exports = crearApp;
