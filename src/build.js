const fs = require('fs');
const path = require('path');

function buildStaticSite() {
  const encryptedDataPath = path.join(process.cwd(), 'encrypted-data.json');
  const templatePath = path.join(__dirname, 'templates', 'index.html');
  const outputPath = path.join(process.cwd(), 'dist', 'index.html');
  
  if (!fs.existsSync(encryptedDataPath)) {
    console.error('Error: encrypted-data.json not found. Run "npm run encrypt" first.');
    process.exit(1);
  }
  
  if (!fs.existsSync(templatePath)) {
    console.error('Error: Template file not found at:', templatePath);
    process.exit(1);
  }
  
  const encryptedData = JSON.parse(fs.readFileSync(encryptedDataPath, 'utf8'));
  const template = fs.readFileSync(templatePath, 'utf8');
  
  const dataScript = `<script>window.ENCRYPTED_DATA = ${JSON.stringify(encryptedData)};</script>`;
  const html = template.replace('{{ENCRYPTED_DATA}}', dataScript);
  
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }
  
  fs.writeFileSync(outputPath, html);
  console.log(`Static site built: ${outputPath}`);
}

buildStaticSite();