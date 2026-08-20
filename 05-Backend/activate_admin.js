const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('superSecret123', salt);
    
    const updatedAdmin = await prisma.user.update({
        where: { email: 'admin@voicenova.ai' },
        data: {
            status: 'Active',
            salt: salt,
            hash: hashedPassword
        }
    });
    console.log("Re-activated admin:", updatedAdmin.email, "Status:", updatedAdmin.status);
}
main().catch(console.error).finally(() => prisma.$disconnect());
