const express = require('express');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const SmsService = require('../services/sms.service')

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Autenticación  # Agrupamos esta ruta bajo "Autenticación"
 *     summary: Registra un nuevo usuario
 *     description: Registra un nuevo usuario con su correo, contraseña, nombre, teléfono y role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "juan.perez@example.com"
 *               password:
 *                 type: string
 *                 example: "contraseña123"
 *               first_name:
 *                 type: string
 *                 example: "Juan"
 *               last_name:
 *                 type: string
 *                 example: "Pérez"
 *               role_id:
 *                 type: integer
 *                 example: 1  # El ID del rol
 *               phone_number:
 *                 type: string
 *                 example: "5551234567"
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 email:
 *                   type: string
 *                   example: "juan.perez@example.com"
 *                 first_name:
 *                   type: string
 *                   example: "Juan"
 *                 last_name:
 *                   type: string
 *                   example: "Pérez"
 *                 role_id:
 *                   type: integer
 *                   example: 1
 *                 role_name:
 *                   type: string
 *                   example: "Administrador"
 *                 phone_number:
 *                   type: string
 *                   example: "5551234567"
 *       400:
 *         description: Faltan datos o el role_id no existe
 *       500:
 *         description: Error al registrar el usuario
 */



router.post('/register', async (req, res) => {
  const { email, password, first_name, last_name, role_id, phone_number } = req.body; 

  // Verificación básica de los datos
  if (!email || !password || !first_name || !last_name || !role_id || !phone_number) {
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
  }

  // Verificar si el role_id existe en la tabla roles
  try {
    const roleExists = await db.oneOrNone('SELECT * FROM roles WHERE role_id = $1', [role_id]);
    if (!roleExists) {
      return res.status(400).json({ mensaje: 'El role_id proporcionado no existe' });
    }

    // Verificar si el email ya está registrado
    const existingUser = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser) {
      return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario en la base de datos
    const newUser = await db.one(
      `INSERT INTO users (email, password, first_name, last_name, role_id, phone_number)  
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING user_id, email, first_name, last_name, role_id, phone_number`,  
      [email, hashedPassword, first_name, last_name, role_id, phone_number]  
    );

    // Obtener el nombre del rol asociado al user_id
    const role = await db.oneOrNone(
      'SELECT name FROM roles WHERE role_id = $1',
      [newUser.role_id]
    );

    // Devolver la respuesta con el token
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      user: {
        user_id: newUser.user_id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role_id: newUser.role_id, 
        role_name: role ? role.name : null,  // Devolvemos el nombre del rol
        phone_number: newUser.phone_number  
      }
    });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).json({ mensaje: 'Error al registrar el usuario' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Autenticación  # Agrupamos esta ruta bajo "Autenticación"
 *     summary: Inicia sesión con el correo y la contraseña
 *     description: Inicia sesión con el correo y la contraseña, y devuelve el token de acceso junto con los datos del usuario, incluyendo el nombre del rol.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "juan.perez@example.com"
 *               password:
 *                 type: string
 *                 example: "contraseña123"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login exitoso"
 *                 token:
 *                   type: string
 *                   example: "JWT_TOKEN"
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
 *                     role_id:
 *                       type: integer
 *                       example: 1
 *                     role_name:
 *                       type: string
 *                       example: "Administrador"
 *                     phone_number:
 *                       type: string
 *                       example: "5551234567"
 *       400:
 *         description: Email o contraseña incorrectos
 *       500:
 *         description: Error al realizar el login
 */


router.post('/login', async (req, res) => {
  const { email, password } = req.body;  // Ahora obtenemos email y password desde el cuerpo (body)

  if (!email || !password) {
    return res.status(400).json({ mensaje: 'Email y contraseña son requeridos.' });
  }

  try {
    // Verificar si el email existe
    const user = await db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar que la contraseña coincida con la almacenada (usando bcrypt)
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Obtener el nombre del rol asociado al user_id
    const role = await db.oneOrNone(
      'SELECT name FROM roles WHERE role_id = $1',
      [user.role_id]
    );

    // Generar JWT
    const token = jwt.sign(
      { userId: user.user_id, email: user.email, role_id: user.role_id },
      process.env.JWT_SECRET,  
      { expiresIn: process.env.EXP_TOKEN }  
    );

    // Devolver la respuesta con el token 
    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: user.role_id,
        role_name: role ? role.name : null,  
        phone_number: user.phone_number  
      }
    });

  } catch (error) {
    console.error('Error al realizar el login:', error);
    res.status(500).json({ mensaje: 'Error al realizar el login' });
  }
});

const smsService = new SmsService();

/**
 * @swagger
 * /api/auth/send-sms:
 *   post:
 *     tags:
 *       - Autenticación  # Agrupamos esta ruta bajo "Autenticación"
 *     summary: Enviar un SMS
 *     description: Envia un SMS a un número de teléfono usando LabsMobile.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - message
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 example: "+34612345678"
 *               message:
 *                 type: string
 *                 example: "Hola, este es un mensaje de prueba"
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *       400:
 *         description: Error al enviar el SMS
 */
router.post('/send-sms', async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  const result = await smsService.sendSms(phoneNumber, message);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
});

module.exports = router;