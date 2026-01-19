import re

with open(r'c:\Users\myafk\Desktop\antigravity2\app.js', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
new_lines = []

in_preset_section = False
for line in lines:
    if 'PARTNER_PRESET_COMMENTS' in line:
        in_preset_section = True
    if in_preset_section and '// ====' in line and 'State' in line:
        in_preset_section = False
    
    if in_preset_section and line.strip().startswith('"'):
        # Replace inner double quotes with full-width quotes 「」
        # Pattern: inside a string, find "word" patterns that are inner quotes
        
        # Find the string content (between first " and last " or ",)
        match = re.match(r'^(\s*)(".*)(\"[,]?\s*)$', line)
        if match:
            indent = match.group(1)
            content_part = match.group(2)[1:]  # Remove opening quote
            end_part = match.group(3)
            
            # Replace inner "..." patterns with 「...」
            content_part = re.sub(r'"([^"]+)"', r'「\1」', content_part)
            
            line = indent + '"' + content_part + end_part
    
    new_lines.append(line)

with open(r'c:\Users\myafk\Desktop\antigravity2\app.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print('Fixed!')
