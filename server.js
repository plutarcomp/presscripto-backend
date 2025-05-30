const express = require('express');
const cors = require('cors');  // Importamos el middleware CORS
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerDocs');  // Importamos la configuración de Swagger
const doctorsRoutes = require('./routes/doctors');  // Importamos las rutas de los doctores
const doctorDetailsRoutes = require('./routes/doctorDetails');  // Importamos la nueva ruta para los detalles del doctor


const app = express();
const port = 3000;

// Middleware para habilitar CORS
app.use(cors({
  origin: '*', // Permitir todas las solicitudes de origen
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
  allowedHeaders: 'Content-Type, Authorization' // Encabezados permitidos
}));

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Configuración de Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas para la api
app.use('/api/doctors', doctorsRoutes);
app.use('/api/doctors', doctorDetailsRoutes); 

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Documentación de la API disponible en http://localhost:${port}/swagger`);
});

