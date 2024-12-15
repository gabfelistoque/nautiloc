import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Buscar todas as amenidades antigas
    const oldAmenities = await prisma.$queryRaw`
      SELECT * FROM "boatAmenity"
    `;

    // Criar novas amenidades
    for (const oldAmenity of oldAmenities as any[]) {
      await prisma.amenity.upsert({
        where: {
          iconName: oldAmenity.icon
        },
        create: {
          name: oldAmenity.name,
          iconName: oldAmenity.icon,
        },
        update: {
          name: oldAmenity.name,
        }
      });
    }

    // Buscar todas as relações antigas
    const oldRelations = await prisma.$queryRaw`
      SELECT DISTINCT "boatId", "icon" 
      FROM "boatAmenity"
    `;

    // Criar novas relações
    for (const relation of oldRelations as any[]) {
      const amenity = await prisma.amenity.findUnique({
        where: {
          iconName: relation.icon
        }
      });

      if (amenity) {
        await prisma.boatAmenityRelation.create({
          data: {
            boatId: relation.boatId,
            amenityId: amenity.id,
          }
        });
      }
    }

    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração:', error);
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
