import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const amenities = await prisma.amenity.findMany();
  console.log('Amenities disponíveis:');
  amenities.forEach(amenity => {
    console.log(`- ${amenity.name} (id: ${amenity.id})`);
  });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
