// generate-jwt-secret.js
const crypto = require('crypto');

// Genera una clave de 32 bytes (256 bits) en hexadecimal
const secret = crypto.randomBytes(32).toString('hex');

console.log('Tu JWT_SECRET es:');
console.log(secret);
