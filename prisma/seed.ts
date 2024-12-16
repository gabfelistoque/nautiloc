import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  try {
    // Limpa o banco de dados
    await prisma.media.deleteMany();
    await prisma.boatAmenityRelation.deleteMany();
    await prisma.amenity.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.boat.deleteMany();
    await prisma.user.deleteMany();

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'admin@example.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    // Criar usuários de teste
    const userPassword = await hashPassword('user123');

    console.log('Senhas hasheadas:', {
      adminPassword: hashedPassword,
      userPassword
    });

    const user = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: 'user@example.com',
        password: userPassword,
        role: 'USER',
      },
    });

    console.log('Usuários criados:', { user });

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

    console.log('Criando amenidades...');
    for (const amenity of amenities) {
      const created = await prisma.amenity.upsert({
        where: { iconName: amenity.iconName },
        update: {},
        create: amenity
      });
      console.log('Amenidade criada:', created);
    }

    // Criar o barco com as amenidades
    const boat = await prisma.boat.create({
      data: {
        name: 'Lancha Exemplo',
        description: 'Uma lancha de luxo para suas férias',
        imageUrl: 'https://example.com/boat.jpg',
        price: 1500,
        capacity: 10,
        length: 25,
        location: 'Marina da Glória, Rio de Janeiro',
        category: 'Lancha',
        year: 2024,
        available: true,
        rating: 4.5,
        userId: user.id,
        amenities: {
          create: amenities.map(amenity => ({
            name: amenity.name,
            iconName: amenity.iconName
          }))
        }
      }
    });

    console.log('Barco criado:', boat);

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
