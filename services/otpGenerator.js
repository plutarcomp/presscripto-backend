const crypto = require('crypto');
require('dotenv').config();
//Clase para generar OTP
class OTPGenerator {
  constructor() {
    // Almacena temporalmente el OTP en la memoria
    this.otpStore = new Map();
  }

  generate(identifier, options = {}) {
    const { digits = parseInt(process.env.OTP_DIGITS) || 6, 
    expiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10 
  } = options;
    
    // Generamos un número aleatorio con la cantidad de dígitos especificada
    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    
    // Utilizamos crypto.randomInt para mayor seguridad
    const otp = crypto.randomInt(min, max).toString().padStart(digits, '0');
    
    // Calculamos la expiración
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);
    
    // Almacenamos el OTP con su tiempo de expiración
    this.otpStore.set(identifier, {
      otp,
      expiryTime,
      createdAt: new Date()
    });
    
    return otp;
  }


  getOTPInfo(identifier) {
    const otpData = this.otpStore.get(identifier);
    if (!otpData) return null;
    
    return {
      createdAt: otpData.createdAt,
      expiryTime: otpData.expiryTime,
      isExpired: new Date() > otpData.expiryTime,
      // No se el OTP actual por seguridad
    };
  }


  verify(identifier, otpToVerify) {
    const otpData = this.otpStore.get(identifier);
    
    // Si no existe un OTP para este identificador
    if (!otpData) {
      return false;
    }
    
    // Si el OTP ha expirado
    if (new Date() > otpData.expiryTime) {
      // Limpiamos el OTP expirado
      this.otpStore.delete(identifier);
      return false;
    }
    
    // Verificamos si el OTP coincide
    const isValid = otpData.otp === otpToVerify;
    
    // Si es válido, lo eliminamos para que no se pueda usar nuevamente
    if (isValid) {
      this.otpStore.delete(identifier);
    }
    
    return isValid;
  }
}

// Exportamos una instancia única para toda la aplicación
const otpGenerator = new OTPGenerator();
module.exports = otpGenerator;