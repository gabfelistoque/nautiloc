import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Hash da senha
    const hashedPassword = await bcrypt.hash('user123', 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: 'User Test',
        email: 'user@test.com',
        password: hashedPassword,
        role: 'USER',
      },
    });

    console.log('Usuário criado com sucesso:', user);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
