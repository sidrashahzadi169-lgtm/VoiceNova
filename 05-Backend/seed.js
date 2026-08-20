const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('superSecret123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@voicenova.ai' },
    update: {},
    create: {
      email: 'admin@voicenova.ai',
      name: 'Admin User',
      salt: 'salt',
      hash: password,
      plan: 'Pro',
      verified: true,
      status: 'Active'
    }
  });
  console.log('User created:', user.email);

  const voice = await prisma.voice.upsert({
    where: { name: 'Nova' },
    update: { providerVoiceId: '21m00Tcm4TlvDq8ikWAM' }, // Rachel ID
    create: {
      name: 'Nova',
      gender: 'Female',
      age: 'young',
      accent: 'american',
      providerVoiceId: '21m00Tcm4TlvDq8ikWAM',
      providerName: 'elevenlabs',
      category: 'Standard'
    }
  });
  console.log('Voice created:', voice.name, voice.id);
  
  const voice2 = await prisma.voice.upsert({
    where: { name: 'Aero' },
    update: { providerVoiceId: 'pNInz6obpgDQGcFmaJgB' }, // Adam ID
    create: {
      name: 'Aero',
      gender: 'Male',
      age: 'middle_aged',
      accent: 'american',
      providerVoiceId: 'pNInz6obpgDQGcFmaJgB',
      providerName: 'elevenlabs',
      category: 'Standard'
    }
  });
  console.log('Voice created:', voice2.name, voice2.id);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
