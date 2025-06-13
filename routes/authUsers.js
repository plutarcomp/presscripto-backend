const express = require('express');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');



/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Usuarios  # Agrupamos esta ruta bajo "Usuarios"
 *     summary: Registra un nuevo usuario y genera un JWT
 *     description: Registra un nuevo usuario en la base de datos, valida la información, hashea la contraseña y genera un JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan.perez@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               first_name:
 *                 type: string
 *                 example: "Juan"
 *               last_name:
 *                 type: string
 *                 example: "Pérez"
 *               role_Id:
 *                 type: integer
 *                 example: 1  # El ID del rol (ej. 1 para 'user', 2 para 'admin', etc.)
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado correctamente"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9hbi5wZXJleiJ9.2e0g8rkl5kakl5g1233"
 *                 user:
 *                   type: object
 *                   properties:
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: "juan.perez@example.com"
 *                     first_name:
 *                       type: string
 *                       example: "Juan"
 *                     last_name:
 *                       type: string
 *                       example: "Pérez"
 *                     roleId:
 *                       type: integer
 *                       example: 1  # El ID del rol
 *       400:
 *         description: Datos incorrectos o incompletos
 *       500:
 *         description: Error al registrar el usuario
 */



// Ruta de registro de usuario
router.post('/register', async (req, res) => {
  const { email, password, first_name, last_name, roleId } = req.body;

  // Verificación básica de los datos
  if (!email || !password || !first_name || !last_name || !roleId) {
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
  }

  // Verificar si el email ya está registrado
  try {
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario en la base de datos
    const newUser = await db.one(
      `INSERT INTO users (email, password, first_name, last_name, role_Id)
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id, email, first_name, last_name, role_Id`,
      [email, hashedPassword, first_name, last_name, role_Id]
    );

    // Generar JWT
    const token = jwt.sign(
      { userId: newUser.user_id, email: newUser.email, role_Id: newUser.role_Id },
      process.env.JWT_SECRET,  // Usamos la clave secreta del .env
      { expiresIn: '1h' }  // El token expirará en 1 hora
    );

    // Devolver la respuesta con el token
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user: {
        user_id: newUser.user_id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role_Id: newUser.role_Id  
      }
    });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ mensaje: 'Error al registrar el usuario' });
  }
});


module.exports = router;