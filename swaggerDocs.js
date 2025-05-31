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
        description: 'Endpoint para obtener información de doctores'
      },
      
      {
        name: 'Especialidades',  // Tag para las rutas de especialidades
        description: 'Endpoint para obtener las especialidades médicas'
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerDocs;
