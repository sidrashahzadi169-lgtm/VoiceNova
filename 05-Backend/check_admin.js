const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@voicenova.ai' }});
    console.log("Admin details:", admin);
    
    if (!admin) {
        console.log("Admin doesn't exist, creating one...");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('superSecret123', salt);
        const newAdmin = await prisma.user.create({
            data: {
                email: 'admin@voicenova.ai',
                password: hashedPassword,
                name: 'System Admin',
                plan: 'Enterprise Admin',
                status: 'Active'
            }
        });
        console.log("Created admin:", newAdmin);
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
