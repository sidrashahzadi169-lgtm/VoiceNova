import io
import re
import base64

with open('dummy.wav', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

with open('studio.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the specific dummy base64 string
js = re.sub(r'const dummyWavB64 = "UklGRvQ.*?==";', f'const dummyWavB64 = "{b64}";', js)

with open('studio.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Patched studio.js successfully with actual dummy.wav base64!")
