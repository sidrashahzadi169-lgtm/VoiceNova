const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreAdmin() {
    await prisma.user.update({
        where: { email: 'admin@voicenova.ai' },
        data: {
            status: 'Active',
            plan: 'Root'
        }
    });
    console.log("Admin account successfully restored to Active and Root plan.");
}

restoreAdmin().catch(console.error).finally(() => prisma.$disconnect());
