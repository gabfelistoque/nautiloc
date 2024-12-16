import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar todos os barcos
    const boats = await prisma.boat.findMany({
      include: {
        amenities: true
      }
    });

    console.log(`Encontrados ${boats.length} barcos`);

    // Para cada barco, atualizar suas amenidades
    for (const boat of boats) {
      console.log(`Atualizando amenidades do barco ${boat.name}`);

      // Buscar todas as amenidades existentes
      const amenities = await prisma.amenity.findMany();

      // Atualizar o barco com novas amenidades
      await prisma.boat.update({
        where: { id: boat.id },
        data: {
          amenities: {
            set: amenities.slice(0, 3).map(amenity => ({
              id: amenity.id
            }))
          }
        }
      });

      console.log(`Amenidades atualizadas para o barco ${boat.name}`);
    }

    console.log('Migração concluída com sucesso');
  } catch (error) {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
