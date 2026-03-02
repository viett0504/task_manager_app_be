// Script to generate random JWT secrets for production
const crypto = require('crypto');

const generateSecret = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

console.log('=== JWT Secrets for Production ===\n');
console.log('Copy these to your Render Environment Variables:\n');
console.log(`JWT_SECRET=${generateSecret()}`);
console.log(`JWT_REFRESH_SECRET=${generateSecret()}`);
console.log('\n=================================');
