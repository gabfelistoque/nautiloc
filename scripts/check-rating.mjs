import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const boats = await prisma.boat.findMany({
    select: {
      id: true,
      name: true,
      rating: true
    }
  });

  console.log('Boats and their ratings:');
  boats.forEach(boat => {
    console.log(`${boat.name}: ${boat.rating} (raw value)`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
