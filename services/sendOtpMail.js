const otpGenerator = require('./otpGenerator');
const EmailService = require('./email.service');

const emailService = new EmailService();

async function sendOtpMail(email) {
  if (!email) throw new Error('Email requerido');

  // 1. Generar el código OTP
  const otp = otpGenerator.generate(email, { digits: 6, expiryMinutes: 10 });

  // 2. Usar la plantilla que ya está en tu servicio, reemplazando el 123456
  // Copiamos aquí el HTML por defecto (el mismo que tienes en email.service.js)
  const htmlContent = `
    <html lang="es">
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

  // 3. Enviar correo con el OTP insertado
  const result = await emailService.sendEmail(
    email,
    'Tu código OTP para Prescripto',
    htmlContent
  );

  if (!result.success) {
    throw new Error('No se pudo enviar el correo OTP');
  }

  return {
    message: 'OTP enviado correctamente al correo.',
    email,
    createdAt: new Date(),
  };
}

module.exports = sendOtpMail;