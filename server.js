const express = require('express');
const cors = require('cors');  
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerDocs');  
const doctorsRoutes = require('./routes/doctors'); 
const specialtiesRoutes = require('./routes/specialties');


const app = express();
const port = 3000;


app.use(cors({
  origin: '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization' 
}));


app.use(express.json());

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas para la api
app.use('/api/doctors', doctorsRoutes);
app.use('/api/specialties', specialtiesRoutes); 

// Ruta health check
app.get('/health', (req, res) => {
  const healthStatus = {
    message: 'API está funcionando correctamente',
    timestamp: new Date().toISOString(),  // Timestamp actual en formato ISO
    version: '1.0.0',  // La versión actual de la API
    uptime: process.uptime(),  // El tiempo que el servidor ha estado en funcionamiento (en segundos)
    memoryUsage: process.memoryUsage(),  // Información sobre el uso de memoria del servidor
  };

  res.status(200).json(healthStatus);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Documentación de la API disponible en http://localhost:${port}/swagger`);
});

