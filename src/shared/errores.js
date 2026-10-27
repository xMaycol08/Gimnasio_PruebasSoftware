class ErrorApp extends Error {
  constructor(mensaje, estado = 500) {
    super(mensaje);
    this.name = this.constructor.name;
    this.estado = estado;
  }
}

// 400: datos de entrada inválidos (formato, campos obligatorios, rangos)
class ErrorValidacion extends ErrorApp {
  constructor(mensaje) {
    super(mensaje, 400);
  }
}

// 404: el recurso solicitado no existe
class ErrorNoEncontrado extends ErrorApp {
  constructor(mensaje) {
    super(mensaje, 404);
  }
}

// 409: choca con algo existente (cédula duplicada, doble entrada abierta)
class ErrorConflicto extends ErrorApp {
  constructor(mensaje) {
    super(mensaje, 409);
  }
}

// 422: los datos son válidos pero incumplen una regla de negocio (membresía vencida)
class ErrorReglaNegocio extends ErrorApp {
  constructor(mensaje) {
    super(mensaje, 422);
  }
}

module.exports = {
  ErrorApp,
  ErrorValidacion,
  ErrorNoEncontrado,
  ErrorConflicto,
  ErrorReglaNegocio,
};
