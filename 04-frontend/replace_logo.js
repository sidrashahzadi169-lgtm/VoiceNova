const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/Administrator/Desktop/VoiceNova/04-frontend';

const newSVG = `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="leftArmGrad" x1="10" y1="15" x2="52" y2="95" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6C63FF"/>
            <stop offset="1" stop-color="#857DFF"/>
        </linearGradient>
        <linearGradient id="rightArmGrad" x1="88" y1="15" x2="46" y2="95" gradientUnits="userSpaceOnUse">
            <stop stop-color="#00C2FF"/>
            <stop offset="1" stop-color="#0088FF"/>
        </linearGradient>
    </defs>
    <!-- Left Arm Bars -->
    <rect x="10" y="15" width="12" height="30" rx="6" fill="url(#leftArmGrad)" />
    <rect x="26" y="28" width="12" height="40" rx="6" fill="url(#leftArmGrad)" />
    <rect x="42" y="45" width="12" height="50" rx="6" fill="url(#leftArmGrad)" />
    <!-- Right Arm -->
    <path d="M48 95 L88 15" stroke="url(#rightArmGrad)" stroke-width="16" stroke-linecap="round" />
</svg>`;

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Regex to match the entire existing SVG tag inside .logo-icon
    const svgRegex = /<svg viewBox="0 0 40 40" fill="none" xmlns="http:\/\/www\.w3\.org\/2000\/svg">[\s\S]*?<\/svg>/g;
    
    let matches = content.match(svgRegex);
    if(matches) {
        content = content.replace(svgRegex, newSVG);
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log('Updated ' + file);
    } else {
        console.log('No match found in ' + file);
    }
});
