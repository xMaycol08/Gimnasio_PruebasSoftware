const express = require('express');
const asyncHandler = require('../../shared/asyncHandler');

const crearRouter = (servicio) => {
  const router = express.Router();

  router.post(
    '/entrada',
    asyncHandler(async (req, res) => {
      const acceso = await servicio.registrarEntrada(
        req.body.id_cliente,
        req.body.fecha_hora
      );
      res.status(201).json(acceso);
    })
  );

  router.post(
    '/salida',
    asyncHandler(async (req, res) => {
      const acceso = await servicio.registrarSalida(
        req.body.id_cliente,
        req.body.fecha_hora
      );
      res.status(200).json(acceso);
    })
  );

  router.get(
    '/dentro',
    asyncHandler(async (_req, res) => {
      const dentro = await servicio.obtenerDentro();
      res.status(200).json(dentro);
    })
  );

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const accesos = await servicio.listar({
        idCliente: req.query.id_cliente,
      });
      res.status(200).json(accesos);
    })
  );

  return router;
};

module.exports = crearRouter;
