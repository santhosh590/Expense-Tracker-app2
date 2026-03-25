const fs = require('fs');

function revert(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/, \[data-theme="blue"\]/g, '');
    
    if (file.includes('globals.css') && content.includes('/* BLUE THEME OVERRIDES */')) {
        content = content.split('/* BLUE THEME OVERRIDES */')[0].trim() + '\n';
    }
    
    if (file.includes('auth.css') && content.includes('/* BLUE AUTH BACKGROUNDS */')) {
        content = content.split('/* BLUE AUTH BACKGROUNDS */')[0].trim() + '\n';
    }

    fs.writeFileSync(file, content);
}

revert('frontend/src/styles/globals.css');
revert('frontend/src/styles/auth.css');
console.log('Themes reverted!');
