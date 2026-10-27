require('dotenv').config();
const crearApp = require('./app');

const puerto = process.env.PORT || 3000;

crearApp().listen(puerto, () => {
  console.warn(`API del gimnasio escuchando en http://localhost:${puerto}`);
});
