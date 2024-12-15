import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  // Limpa o banco de dados
  await prisma.media.deleteMany();
  await prisma.boatAmenityRelation.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.boat.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuários de teste
  const adminPassword = await hashPassword('admin123');
  const userPassword = await hashPassword('user123');

  console.log('Senhas hasheadas:', {
    adminPassword,
    userPassword
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Usuário Teste',
      email: 'user@example.com',
      password: userPassword,
      role: 'USER',
    },
  });

  console.log('Usuários criados:', { admin, user });

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

  // Cria os barcos
  const boats = [
    {
      name: 'Veleiro Sunset',
      description: 'Um elegante veleiro de 40 pés, perfeito para passeios ao pôr do sol. Equipado com 3 cabines, cozinha completa e área de lazer.',
      imageUrl: 'https://res.cloudinary.com/gaburo/image/upload/v1734179325/boats/veleiro-sunset-main.jpg',
      capacity: 8,
      location: 'Marina da Glória, Rio de Janeiro',
      pricePerDay: 1200.00,
      length: 40.0,
      year: 2020,
      category: 'Veleiro',
      amenities: ['wifi', 'shower', 'water', 'ac'],
      media: [
        {
          url: 'https://res.cloudinary.com/gaburo/image/upload/v1734179325/boats/veleiro-sunset-1.jpg',
          type: 'IMAGE'
        },
        {
          url: 'https://res.cloudinary.com/gaburo/image/upload/v1734179326/boats/veleiro-sunset-2.jpg',
          type: 'IMAGE'
        },
        {
          url: 'https://res.cloudinary.com/gaburo/video/upload/v1734179333/boats/veleiro-sunset-tour.mp4',
          type: 'VIDEO'
        }
      ]
    },
    {
      name: 'Lancha Sport 32',
      description: 'Lancha esportiva de 32 pés com design moderno. Ideal para passeios diurnos e esportes aquáticos. Inclui equipamentos para wakeboard.',
      imageUrl: 'https://res.cloudinary.com/gaburo/image/upload/v1734179328/boats/lancha-sport-2.jpg',
      capacity: 12,
      location: 'Marina da Glória, Rio de Janeiro',
      pricePerDay: 1500.00,
      length: 32.0,
      year: 2022,
      category: 'Lancha',
      amenities: ['wifi', 'sound', 'sunarea', 'water'],
      media: [
        {
          url: 'https://res.cloudinary.com/gaburo/image/upload/v1734179327/boats/lancha-sport-1.jpg',
          type: 'IMAGE'
        },
        {
          url: 'https://res.cloudinary.com/gaburo/image/upload/v1734179329/boats/lancha-sport-3.jpg',
          type: 'IMAGE'
        }
      ]
    }
  ];

  for (const boatData of boats) {
    const { media, amenities: boatAmenities, ...boat } = boatData;
    const createdBoat = await prisma.boat.create({
      data: {
        ...boat,
        amenities: {
          create: await Promise.all(boatAmenities.map(async (iconName) => {
            const amenity = await prisma.amenity.findUnique({
              where: { iconName }
            });
            if (!amenity) {
              throw new Error(`Amenidade com iconName ${iconName} não encontrada`);
            }
            return {
              amenity: {
                connect: {
                  id: amenity.id
                }
              }
            };
          }))
        },
        media: {
          create: media
        }
      }
    });
    console.log('Barco criado:', createdBoat);
  }

  console.log('Seed concluído!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
