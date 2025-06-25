const express = require('express');
const router = express.Router();
const SmsService = require('../services/sms.service')
const EmailService = require('../services/email.service');
const sendOtpMail = require('../services/sendOtpMail');

const smsService = new SmsService();

/**
 * @swagger
 * /api/send-sms:
 *   post:
 *     tags:
 *       - Servicios
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


const emailService = new EmailService();

/**
 * @swagger
 * /api/send-email:
 *   post:
 *     tags:
 *       - Servicios
 *     summary: Enviar un correo electrónico
 *     description: Enviar un correo electrónico con un asunto y contenido HTML.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 example: "recipient@example.com"
 *               subject:
 *                 type: string
 *                 example: "Bienvenido a Prescripto"
 *     responses:
 *       200:
 *         description: Correo enviado correctamente
 *       400:
 *         description: Error al enviar el correo
 *       500:
 *         description: Error interno del servidor
 */

router.post('/send-email', async (req, res) => {
  const { to, subject, htmlContent } = req.body;

  if (!to || !subject) {
    return res.status(400).json({ mensaje: 'Faltan datos necesarios para enviar el correo.' });
  }

  try {
    const response = await emailService.sendEmail(to, subject, htmlContent);
    if (response.success) {
      return res.status(200).json({ message: 'Correo enviado exitosamente', data: response.data });
    } else {
      return res.status(500).json({ message: response.message, error: response.error });
    }
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    res.status(500).json({ mensaje: 'Error al enviar el correo' });
  }
});

/**
 * @swagger
 * /api/send-otp:
 *   post:
 *     tags:
 *       - Servicios
 *     summary: Enviar un código OTP al correo electrónico
 *     description: Genera un código OTP y lo envía al correo electrónico proporcionado para su verificación.
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
 *                 example: "recipient@example.com"
 *     responses:
 *       200:
 *         description: OTP enviado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP enviado correctamente al correo."
 *                 email:
 *                   type: string
 *                   example: "recipient@example.com"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-10T12:00:00.000Z"
 *       400:
 *         description: Error en los parámetros de entrada
 *       500:
 *         description: Error al enviar el correo OTP
 */
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ mensaje: 'El correo electrónico es requerido.' });
  }

  try {
    // Llamamos a la función que genera y envía el OTP
    const result = await sendOtpMail(email);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al enviar el OTP:', error);
    res.status(500).json({ mensaje: 'Error al enviar el OTP al correo.' });
  }
});

module.exports = router;
