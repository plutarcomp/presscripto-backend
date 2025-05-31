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


app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log(`Documentación de la API disponible en http://localhost:${port}/swagger`);
});

