import re

with open('d:/VoiceNova/05-Backend/src/controllers/elevenlabs.controller.ts', 'r') as f:
    content = f.read()

new_getStorageDir = '''function getStorageDir(): string {
  const p = env.AUDIO_STORAGE_PATH;
  let resolved = path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
  if (process.env.VERCEL) {
    resolved = require('path').join('/tmp', '09-uploads');
  }
  if (!fs.existsSync(resolved)) {
    try {
      fs.mkdirSync(resolved, { recursive: true });
    } catch (e) {
      console.warn("Could not create storage dir:", e);
    }
  }
  return resolved;
}'''

content = re.sub(r'function getStorageDir\(\): string \{.*?return resolved;\s*\}', new_getStorageDir, content, flags=re.DOTALL)

with open('d:/VoiceNova/05-Backend/src/controllers/elevenlabs.controller.ts', 'w') as f:
    f.write(content)

print("Done replacing in elevenlabs.controller.ts")
