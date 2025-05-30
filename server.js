const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware para parsear el cuerpo de las peticiones en formato JSON
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('¡Hola Mundo desde Express!');
});

// Middleware para habilitar CORS
app.use(cors({
  origin: '*', // Permitir todas las solicitudes de origen
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Métodos permitidos
  allowedHeaders: 'Content-Type, Authorization' // Encabezados permitidos
}));

// Endpoint de ejemplo
app.get('/api', (req, res) => {
  res.json({
    mensaje: 'API funcionando correctamente',
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});