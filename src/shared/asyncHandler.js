// Envuelve un handler async para que los errores lleguen al manejador de errores de Express.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
