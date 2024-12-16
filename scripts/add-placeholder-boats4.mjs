import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Buscando usuário admin...');
  
  // Primeiro, vamos buscar o usuário admin
  const adminUser = await prisma.user.findFirst({
    where: {
      role: 'ADMIN'
    }
  });

  if (!adminUser) {
    throw new Error('Usuário admin não encontrado');
  }

  const placeholderBoats = [
    {
      name: 'Essência II',
      description: 'Lancha esportiva perfeita para passeios em família',
      price: 1500.00,
      capacity: 8,
      rating: 4.8,
      available: true,
      imageUrl: '/boats/boat2.jpg',
      location: 'Marina da Glória, Rio de Janeiro',
      length: 32.5,
      user: {
        connect: {
          id: adminUser.id
        }
      },
      amenities: {
        connect: [
          { id: 'cm4r0iifc0001w184z5k0lca0' }, // Wi-Fi
          { id: 'cm4r0ijdr0002w184mqfgylnd' }, // Equipamentos de segurança
          { id: 'cm4r0imdn0007w184w9oo2dtb' }, // Microondas
          { id: 'cm4r0iorz000bw1848cy83k3z' }  // Som
        ]
      }
    },
    {
      name: 'Essência III',
      description: 'Iate luxuoso para eventos especiais',
      price: 2500.00,
      capacity: 12,
      rating: 4.9,
      available: true,
      imageUrl: '/boats/boat3.jpg',
      location: 'Marina da Glória, Rio de Janeiro',
      length: 45.0,
      user: {
        connect: {
          id: adminUser.id
        }
      },
      amenities: {
        connect: [
          { id: 'cm4r0iifc0001w184z5k0lca0' }, // Wi-Fi
          { id: 'cm4r0ijdr0002w184mqfgylnd' }, // Equipamentos de segurança
          { id: 'cm4r0imdn0007w184w9oo2dtb' }, // Microondas
          { id: 'cm4r0iorz000bw1848cy83k3z' }, // Som
          { id: 'cm4r0ikkr0004w184p2kphizj' }, // Chuveiro
          { id: 'cm4r0imz20008w184vix8pbl0' }  // Ar Condicionado
        ]
      }
    }
  ];

  console.log('Adicionando barcos placeholder...');
  
  for (const boatData of placeholderBoats) {
    const boat = await prisma.boat.create({
      data: boatData,
      include: {
        amenities: true
      }
    });
    console.log(`Barco criado: ${boat.name}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
