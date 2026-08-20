import wave
import struct
import math

# Audio settings
sample_rate = 44100
duration = 1.0  # seconds
frequency = 440.0  # Hz (A4 note)
num_samples = int(sample_rate * duration)

# Open a new WAV file
with wave.open('dummy.wav', 'w') as wav_file:
    wav_file.setnchannels(1) # mono
    wav_file.setsampwidth(2) # 2 bytes per sample (16-bit)
    wav_file.setframerate(sample_rate)

    # Generate sine wave samples
    for i in range(num_samples):
        # Sine wave formula
        value = int(32767.0 * math.sin(2.0 * math.pi * frequency * i / sample_rate))
        # Pack the value as a 16-bit integer (little endian)
        data = struct.pack('<h', value)
        wav_file.writeframesraw(data)

print("Generated valid dummy.wav")
