import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email: 'admin@example.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Criar amenidades padrão
    const amenities = [
      { name: 'Wi-Fi a bordo', iconName: 'wifi' },
      { name: 'Equipamentos de segurança', iconName: 'safety' },
      { name: 'Água potável', iconName: 'water' },
      { name: 'Chuveiro de água doce', iconName: 'shower' },
      { name: 'GPS', iconName: 'gps' },
      { name: 'Rádio VHF', iconName: 'radio' },
      { name: 'Microondas', iconName: 'microwave' },
      { name: 'Ar Condicionado', iconName: 'ac' },
      { name: 'Âncora', iconName: 'anchor' },
      { name: 'Churrasqueira', iconName: 'grill' },
      { name: 'Som', iconName: 'sound' },
      { name: 'TV', iconName: 'tv' },
      { name: 'Cooler', iconName: 'cooler' },
      { name: 'Área de Sol', iconName: 'sunarea' },
      { name: 'Toldo', iconName: 'cover' }
    ];

    for (const amenity of amenities) {
      await prisma.amenity.upsert({
        where: { iconName: amenity.iconName },
        update: {},
        create: amenity
      });
    }

    console.log('Seed completed successfully');
  } catch (error) {
    console.error('Error during seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
