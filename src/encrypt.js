const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { encryptCode } = require('./core/mimicrypt');

function processEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found');
    process.exit(1);
  }

  const password = process.env.MASTER_PASSWORD;
  if (!password) {
    console.error('Error: MASTER_PASSWORD not found in .env');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  const encryptedData = {};
  
  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      const cleanKey = key.trim();
      const cleanValue = value.trim().replace(/^["']|["']$/g, '');
      
      if (cleanKey === 'MASTER_PASSWORD') {
        return;
      }
      
      if (cleanKey.endsWith('_FC')) {
        try {
          const result = encryptCode(cleanValue, password);
          encryptedData[cleanKey] = {
            encrypted: result.encrypted,
            format: result.format
          };
          console.log(`Encrypted ${cleanKey}: ${result.encrypted} (format: ${result.format})`);
        } catch (error) {
          console.error(`Error encrypting ${cleanKey}: ${error.message}`);
          process.exit(1);
        }
      }
    }
  });
  
  const outputPath = path.join(process.cwd(), 'encrypted-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(encryptedData, null, 2));
  console.log(`Encrypted data saved to: ${outputPath}`);
}

processEnvFile();