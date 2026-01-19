const fs = require('fs');

const filePath = 'c:\\Users\\myafk\\Desktop\\antigravity2\\app.js';
let content = fs.readFileSync(filePath, 'utf8');

// Find lines within PARTNER_PRESET_COMMENTS and replace inner quotes
const lines = content.split('\n');
const newLines = [];

let inPresetSection = false;

for (let line of lines) {
    if (line.includes('PARTNER_PRESET_COMMENTS')) {
        inPresetSection = true;
    }
    if (inPresetSection && line.includes('// ====') && line.includes('State')) {
        inPresetSection = false;
    }

    if (inPresetSection && line.trim().startsWith('"')) {
        // Replace inner "word" patterns with 「word」
        // Pattern: the line is a string like "...\"word\"..."
        // We need to replace \" with 「 and then the closing \" with 」

        // Match pattern: \"something\" (escaped quotes inside the string)
        line = line.replace(/"([^"]+)"/g, function (match, p1, offset, string) {
            // Check if this is the outer quote (at start or end of trimmed string value)
            const trimmed = string.trim();
            if (offset === string.indexOf('"') || offset === string.lastIndexOf('"') - match.length + 1) {
                // This might be outer quote, but actually all quotes should be replaced except first and last
                return match;
            }
            return '「' + p1 + '」';
        });
    }

    newLines.push(line);
}

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('Fixed!');
