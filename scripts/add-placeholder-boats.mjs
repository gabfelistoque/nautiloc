import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    amenities: {
      connect: [
        { name: 'Wi-Fi' },
        { name: 'Banheiro' },
        { name: 'Cozinha' },
        { name: 'Som' }
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
    amenities: {
      connect: [
        { name: 'Wi-Fi' },
        { name: 'Banheiro' },
        { name: 'Cozinha' },
        { name: 'Som' },
        { name: 'Chuveiro' },
        { name: 'Geladeira' }
      ]
    }
  }
];

async function main() {
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
