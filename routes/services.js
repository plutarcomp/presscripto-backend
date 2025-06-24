const express = require('express');
const router = express.Router();
const SmsService = require('../services/sms.service');
const EmailService = require('../services/email.service');
const otpGenerator = require('../services/otpGenerator');

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

const otpGeneratorSms = otpGenerator;

/**
 * @swagger
 * /api/otpGenerator-sms:
 *   post:
 *     tags:
 *       - Servicios
 *     summary: Generar el OTP y enviarlo mendiante un SMS
 *     description: Envia un SMS a un número de teléfono usando LabsMobile, cuyo contenido es el OTP.
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
 *               
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *       400:
 *         description: Error al enviar el SMS
 */
router.post('/otpGenerator-sms', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  const otp = otpGeneratorSms.generate(phoneNumber, {
    digits: 6,         // 6 dígitos
    expiryMinutes: 5   // expira en 5 minutos
  });
  
  const message = 'Su código de identificación es ' + otp;
  
  const result = await smsService.sendSms(phoneNumber, message);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
});

module.exports = router;
