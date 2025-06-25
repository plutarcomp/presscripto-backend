require('dotenv').config();

console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_PASSWORD:', process.env.GMAIL_PASSWORD ? '✅ cargada' : '❌ NO cargada');