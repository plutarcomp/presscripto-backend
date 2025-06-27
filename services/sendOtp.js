const otpGenerator = require('./otpGenerator');
const EmailService = require('./email.service');
const smsService = require('./sms.service');
require('dotenv').config();

const emailService = new EmailService();

async function sendOtp(email, phoneNumber) {
  if (!email && !phoneNumber) {
    throw new Error('Se requiere al menos email o teléfono');
  }

  // 1. Generar el OTP una sola vez
  const otp = otpGenerator.generate(email || phoneNumber, {
  digits: parseInt(process.env.OTP_DIGITS) || 6,
  expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES) || 10,
});

  const tasks = [];

  // 2. Enviar por correo si hay email
  if (email) {
    const htmlContent = getHtmlContentWithOtp(otp);
    const emailTask = emailService
      .sendEmail(email, 'Tu código OTP para Prescripto', htmlContent)
      .then((result) => {
        if (!result.success) throw new Error('Fallo envío de correo');
        return { email, success: true };
      });
    tasks.push(emailTask);
  }

  // 3. Enviar por SMS si hay número
  if (phoneNumber) {
    const smsMessage = `Tu código de verificación es: ${otp}. Utiliza este código para completar tu verificación.`;
    const smsTask = smsService
      .sendSms(phoneNumber, smsMessage)
      .then((result) => {
        if (!result.success) throw new Error('Fallo envío de SMS');
        return { phoneNumber, success: true };
      });
    tasks.push(smsTask);
  }

  // 4. Esperar que ambos se completen
  await Promise.all(tasks);

  return {
    message: 'OTP enviado exitosamente por los canales disponibles.',
    otp,
    createdAt: new Date(),
  };
}

// Función auxiliar para reemplazar el OTP en el HTML
function getHtmlContentWithOtp(otp) {
  return`<html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Correo de Verificación OTP</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
          }
          .header {
            background-color: #007BFF;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 5px;
          }
          .otp-message {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #333;
          }
          .footer {
            background-color: #f1f1f1;
            color: #333;
            padding: 10px;
            text-align: center;
            font-size: 14px;
            border-top: 1px solid #ddd;
          }
          .footer a {
            color: #007BFF;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Bienvenido a Prescripto</h1>
        </div>
        <div class="container">
          <p>Hola,</p>
          <p>Tu código de verificación es:</p>
          <div class="otp-message">
            123456  <!-- Este es un ejemplo, reemplázalo con el código OTP real -->
          </div>
          <p>Utiliza este código para completar tu verificación.</p>
        </div>
        <div class="footer">
          <p><a href="https://prescripto.einventiva.dev" target="_blank">Visita nuestra página web</a></p>
          <p>Prescripto 2025 ® Copyright. - Todos los derechos reservados.</p>
        </div>
      </body>
    </html>
  `.replace('123456', otp);
}

module.exports = sendOtp;
    

