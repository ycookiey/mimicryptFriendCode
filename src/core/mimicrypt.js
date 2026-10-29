// ブラウザで復号するsrc/templates/index.htmlにも、同じCHARACTER_SETSと鍵の作り方を書いてある。片方だけ変えると復号できなくなる
const CHARACTER_SETS = {
  numeric: '0123456789',
  alphanumeric_lower: '0123456789abcdefghijklmnopqrstuvwxyz',
  alphanumeric_mixed: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alphanumeric_upper: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
};

function detectFormat(code) {
  const hasLower = /[a-z]/.test(code);
  const hasUpper = /[A-Z]/.test(code);
  const hasNumber = /[0-9]/.test(code);
  
  if (hasLower && hasUpper && hasNumber) return 'alphanumeric_mixed';
  if (hasLower && hasNumber) return 'alphanumeric_lower';
  if (hasUpper && hasNumber) return 'alphanumeric_upper';
  if (hasNumber && !hasLower && !hasUpper) return 'numeric';
  
  throw new Error('Unsupported character format');
}

function generateKey(password, length, charset) {
  const crypto = require('crypto');
  const key = [];
  
  for (let i = 0; i < length; i++) {
    const hash = crypto.createHash('sha256')
      .update(password + i.toString())
      .digest('hex');
    const index = parseInt(hash.substring(0, 8), 16) % charset.length;
    key.push(charset[index]);
  }
  
  return key.join('');
}

function encryptCode(originalCode, password) {
  const format = detectFormat(originalCode);
  const charset = CHARACTER_SETS[format];
  const key = generateKey(password, originalCode.length, charset);
  
  let encrypted = '';
  for (let i = 0; i < originalCode.length; i++) {
    const originalIndex = charset.indexOf(originalCode[i]);
    const keyIndex = charset.indexOf(key[i]);
    const encryptedIndex = (originalIndex + keyIndex) % charset.length;
    encrypted += charset[encryptedIndex];
  }
  
  return {
    encrypted,
    format
  };
}

function decryptCode(encryptedCode, password, format) {
  const charset = CHARACTER_SETS[format];
  const key = generateKey(password, encryptedCode.length, charset);
  
  let decrypted = '';
  for (let i = 0; i < encryptedCode.length; i++) {
    const encryptedIndex = charset.indexOf(encryptedCode[i]);
    const keyIndex = charset.indexOf(key[i]);
    const decryptedIndex = (encryptedIndex - keyIndex + charset.length) % charset.length;
    decrypted += charset[decryptedIndex];
  }
  
  return decrypted;
}

module.exports = {
  CHARACTER_SETS,
  detectFormat,
  encryptCode,
  decryptCode
};