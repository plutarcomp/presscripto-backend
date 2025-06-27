const express = require('express');
const router = express.Router();
const SmsService = require('../services/sms.service')
const EmailService = require('../services/email.service');
const sendOtp = require('../services/sendOtp');
const verifyOtp = require('../services/verifyOtp')


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
 *       - Servicios  # Agrupamos esta ruta bajo "Servicios"
 *     summary: Enviar OTP a correo electrónico y número de celular
 *     description: Genera y envía un código OTP (One-Time Password) al correo electrónico y número de celular proporcionados.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *                 description: Correo electrónico del usuario al que se le enviará el OTP.
 *               phoneNumber:
 *                 type: string
 *                 example: "5551234567"
 *                 description: Número de celular del usuario al que se le enviará el OTP.
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
 *                   example: "OTP enviado correctamente"
 *                 email:
 *                   type: string
 *                   example: "user@example.com"
 *                 phoneNumber:
 *                   type: string
 *                   example: "5551234567"
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-05-29T12:00:00Z"
 *       400:
 *         description: Correo electrónico o número de celular faltante
 *       500:
 *         description: Error al enviar el OTP
 */
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const {phoneNumber} = req.body;

  if (!email || !phoneNumber) {
    return res.status(400).json({ mensaje: 'El correo electrónico y el numero de celular es requerido.' });
  }

  try {
    // Llamamos a la función que genera y envía el OTP
    const result = await sendOtp(email, phoneNumber);

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al enviar el OTP:', error);
    res.status(500).json({ mensaje: 'Error al enviar el OTP.' });
  }
});



/**
 * @swagger
 * /api/verify-otp:
 *   post:
 *     tags:
 *       - Servicios  # Agrupamos esta ruta bajo "Servicios"
 *     summary: Verificar un código OTP
 *     description: Verifica un código OTP enviado previamente a un correo electrónico o número de celular. Si el OTP es válido y no ha expirado, se devuelve un mensaje de éxito.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               identifier:
 *                 type: string
 *                 example: "user@example.com"
 *                 description: Identificador del usuario al que se le envió el OTP (puede ser el correo electrónico o número de celular).
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: Código OTP que el usuario ha recibido y necesita verificar.
 *     responses:
 *       200:
 *         description: OTP verificado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "OTP verificado correctamente."
 *       400:
 *         description: OTP inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "OTP inválido o expirado."
 *       500:
 *         description: Error al verificar el OTP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al verificar el OTP."
 */
router.post('/verify-otp', async (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({ mensaje: 'Identificador y código OTP son requeridos.' });
  }

  try {
    const result = await verifyOtp(identifier, otp); // <- devuelve un objeto con success

    if (result.success) {
      return res.status(200).json({ mensaje: result.message });
    } else {
      return res.status(400).json({ mensaje: result.message });
    }
  } catch (error) {
    console.error('Error al verificar el OTP:', error);
    res.status(500).json({ mensaje: 'Error al verificar el OTP.' });
  }
});

module.exports = router;

