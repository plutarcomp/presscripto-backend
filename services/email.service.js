const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.serviceName = 'EmailService';
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, 
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  // Método para enviar el correo, con valor por defecto para htmlContent
  async sendEmail(to, subject, htmlContent = null) {
    console.log(`[${this.serviceName}] Enviando EMAIL a ${to} con el asunto: ${subject}`);

    // Si no se proporciona htmlContent, usamos el predeterminado
    if (!htmlContent) {
      htmlContent = `
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
      `;
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    try {
      const response = await this.transporter.sendMail(mailOptions);
      console.log(`[${this.serviceName}] Correo enviado exitosamente: ${JSON.stringify(response)}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error(`[${this.serviceName}] Error enviando el correo: ${error.message}`);
      return {
        success: false,
        error: error.response?.body || "Email sending failed",
        message: "No se pudo enviar el correo, pero el servicio continúa funcionando",
      };
    }
  }
}

module.exports = EmailService;