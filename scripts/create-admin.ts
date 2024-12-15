const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@boatrental.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('Admin criado com sucesso:', admin);
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
