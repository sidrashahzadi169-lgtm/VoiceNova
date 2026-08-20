const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const match = env.match(/ELEVENLABS_API_KEY=(.+)/);
const key = match ? match[1].replace(/['"]+/g, '').trim() : '';
fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM?output_format=mp3_44100_128', {
  method: 'POST',
  headers: {
    'Accept': 'audio/mpeg',
    'Content-Type': 'application/json',
    'xi-api-key': key
  },
  body: JSON.stringify({
    text: 'Hello world',
    model_id: 'eleven_multilingual_v2',
    voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true }
  })
}).then(async r => console.log(r.status, await r.text()));
