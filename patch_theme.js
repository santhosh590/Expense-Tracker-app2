const fs = require('fs');

function patch(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\[data-theme="light"\]/g, '[data-theme="light"], [data-theme="blue"]');
    
    // Add blue theme variables
    if (file.includes('globals.css') && !content.includes('[data-theme="blue"] {')) {
        const blueVars = `
/* BLUE THEME OVERRIDES */
[data-theme="blue"] {
  --bg: #e0f2fe;
  --bg2: #bae6fd;
  --card: rgba(255, 255, 255, 0.6);
  --card2: rgba(255, 255, 255, 0.8);
  --card-dark: rgba(255, 255, 255, 0.7);
  --glass: rgba(14, 165, 233, 0.05);
  --border: rgba(14, 165, 233, 0.25);
  --text: #0f172a;
  --text-main: #0f172a;
  --text-muted: #334155;
  --muted: #475569;
  --primary: #0284c7;
}
[data-theme="blue"] body {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%) !important;
}
[data-theme="blue"] .card[style*="linear-gradient(135deg, #1e1b4b"] {
  background: linear-gradient(135deg, #0ea5e9, #3b82f6) !important;
  color: white !important;
}
`;
        content += blueVars;
    }
    
    if (file.includes('auth.css') && !content.includes('[data-theme="blue"] .auth-page')) {
        const authBlue = `
/* BLUE AUTH BACKGROUNDS */
[data-theme="blue"] .auth-page {
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%) !important;
}
[data-theme="blue"] .auth-left {
  background: radial-gradient(circle at top left, rgba(2, 132, 199, 0.15), transparent 55%), linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(2, 132, 199, 0.05)) !important;
}
[data-theme="blue"] .auth-btn {
  background: linear-gradient(90deg, #0ea5e9, #3b82f6) !important;
  color: white !important;
}
[data-theme="blue"] .auth-bottom a {
  color: #0284c7 !important;
}
`;
        content += authBlue;
    }

    fs.writeFileSync(file, content);
}

patch('frontend/src/styles/globals.css');
patch('frontend/src/styles/auth.css');
console.log('Themes patched!');
