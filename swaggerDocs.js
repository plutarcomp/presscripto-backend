const swaggerJSDoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');


const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));


const apiVersion = packageJson.version;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Prescripto',
      version: apiVersion,
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
      {
        name: 'Usuarios',  // Tag para las rutas de usuarios
        description: 'Endpoint para manejar la información de los usuarios'
      },
      {
        name: 'Autenticación',  // Tag para las rutas de autenticación
        description: 'Endpoint para autenticación y autorización de usuarios'
      },
      {
        name: 'Servicios',  
        description: 'Endpoint para servicios como envío de correos electrónicos y SMS'
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerDocs;
