const express = require('express');
const cors = require('cors');  
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swaggerDocs');  
const doctorsRoutes = require('./routes/doctors'); 
const specialtiesRoutes = require('./routes/specialties');
const authRoutes = require('./routes/authUsers'); 
const SmsService = require('./routes/services');
const emailRoutes = require('./routes/services'); 

const app = express();
const port = 3000;

const path = require('path'); 
// Importamos la función de actualización de versión
const updateVersion = require(path.join(__dirname, 'utils', 'updateVersion'));

// Ejecutamos la función de actualización de versión
updateVersion();  // Asegúrate de que esta línea esté correctamente colocada

app.use(cors({
  origin: '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type, Authorization' 
}));


app.use(express.json());

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/login', authRoutes);
  

// Rutas para la api
app.use('/api/doctors', doctorsRoutes);
app.use('/api/specialties', specialtiesRoutes);

// Rutas de servicios
app.use('/api', emailRoutes);
app.use('/send-sms', SmsService);

// Ruta health check
app.get('/health', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const apiVersion = packageJson.version;
  const healthStatus = {
    message: 'API está funcionando correctamente',
    timestamp: new Date().toISOString(),  // Timestamp actual en formato ISO
    version: apiVersion,  // La versión actual de la API
    uptime: process.uptime(),  // El tiempo que el servidor ha estado en funcionamiento (en segundos)
    memoryUsage: process.memoryUsage(),  // Información sobre el uso de memoria del servidor
  };

  res.status(200).json(healthStatus);
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Documentación de la API disponible en http://localhost:${port}/swagger`);
});

