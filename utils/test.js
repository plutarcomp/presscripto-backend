// Importamos el generador de OTP desde el mismo directorio
const otpGenerator = require('../services/otpGenerator');

// Función para probar el generador de OTP
function testOTPGenerator() {
  console.log('=== PRUEBA DEL GENERADOR DE OTP ===');
  
  // Identificador de ejemplo (en un caso real podría ser un email o ID de usuario)
  const userIdentifier = 'cesar@vivo.com';
  
  console.log('1. Generando OTP para:', userIdentifier);
  
  // Generar OTP con configuración personalizada
  const otp = otpGenerator.generate(userIdentifier, {
    digits: 6,         // 6 dígitos
    expiryMinutes: 5   // expira en 5 minutos
  });
  
  console.log('   OTP generado:', otp);
  
  // Obtener información sobre el OTP
  const otpInfo = otpGenerator.getOTPInfo(userIdentifier);
  console.log('\n2. Información del OTP:');
  console.log('   - Creado en:', otpInfo.createdAt);
  console.log('   - Expira en:', otpInfo.expiryTime);
  console.log('   - ¿Expirado?:', otpInfo.isExpired ? 'Sí' : 'No');
  
  // Probamos verificación con OTP correcto
  console.log('\n3. Verificando OTP correcto:');
  const isValid = otpGenerator.verify(userIdentifier, otp);
  console.log('   ¿Es válido?:', isValid ? 'Sí' : 'No');
  
  // Después de verificar un OTP válido, este debería eliminarse
  console.log('\n4. Verificando que el OTP no se puede usar dos veces:');
  const isValidAgain = otpGenerator.verify(userIdentifier, otp);
  console.log('   ¿Es válido en segundo intento?:', isValidAgain ? 'Sí' : 'No');
  
  // Generamos un nuevo OTP para probar verificación incorrecta
  console.log('\n5. Generando un nuevo OTP:');
  const newOtp = otpGenerator.generate(userIdentifier);
  console.log('   Nuevo OTP:', newOtp);
  
  // Verificamos con un OTP incorrecto
  console.log('\n6. Verificando con OTP incorrecto:');
  const invalidCheck = otpGenerator.verify(userIdentifier, '000000');
  console.log('   ¿Es válido un OTP incorrecto?:', invalidCheck ? 'Sí' : 'No');
  
  // Verificamos con el OTP correcto
  console.log('\n7. Verificando con OTP correcto:');
  const validCheck = otpGenerator.verify(userIdentifier, newOtp);
  console.log('   ¿Es válido el OTP correcto?:', validCheck ? 'Sí' : 'No');
}

// Ejecutar la prueba
testOTPGenerator();