const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Médicos',
      version: '1.0.0',
      description: 'API para manejar la información sobre médicos',
    },
    tags: [
      {
        name: 'Doctores',  // Tag para las rutas generales de doctores
        description: 'Catalogo de la tabla de "doctors"'
      },
      {
        name: 'Detalles de los Doctores',  // Tag para las rutas específicas de detalles de doctores
        description: 'Endpoint para obtener información detallada'
      }
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerDocs;
