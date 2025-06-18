const axios = require('axios');

class SmsService {
  constructor() {
    this.serviceName = 'SmsService';
  }

  async sendSms(phoneNumber, message) {
    console.log(`[${this.serviceName}] Enviando SERVICE SMS a ${phoneNumber} con el mensaje: ${message}`);

    const data = JSON.stringify({
      message: message,
      tpoa: "Sender",
      recipient: [
        {
          msisdn: phoneNumber,
        },
      ],
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://api.labsmobile.com/json/send",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.SMS_USERNAME}:${process.env.SMS_TOKEN}`
          ).toString("base64"),
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      console.log(`[${this.serviceName}] SMS enviado exitosamente: ${JSON.stringify(response.data)}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`[${this.serviceName}] Error enviando SMS: ${error.message}`);
      return {
        success: false,
        error: error.response?.data || "SMS sending failed",
        message: "No se pudo enviar el SMS, pero el servicio continúa funcionando",
      };
    }
  }
}

module.exports = SmsService;