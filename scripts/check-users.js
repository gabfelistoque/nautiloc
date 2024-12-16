const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    console.log('Users:', users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role
    })));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
