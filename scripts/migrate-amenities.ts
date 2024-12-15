import { PrismaClient } from '@prisma/client';
import sqlite3 from 'sqlite3';

const prisma = new PrismaClient();
const db = new sqlite3.Database('./prisma/dev.db');

interface OldBoatAmenity {
  id: string;
  name: string;
  icon: string;
  boatId: string;
}

interface AmenityGroup {
  name: string;
  iconName: string;
  boatIds: string[];
}

function getOldAmenities(): Promise<OldBoatAmenity[]> {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM BoatAmenity', (err: Error | null, rows: OldBoatAmenity[]) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

async function main() {
  console.log('Iniciando migração de amenidades...');

  try {
    // 1. Busca todas as amenidades existentes
    const existingAmenities = await getOldAmenities();
    console.log(`Encontradas ${existingAmenities.length} amenidades existentes`);

    // 2. Agrupa amenidades por iconName para evitar duplicatas
    const amenityGroups = existingAmenities.reduce((acc: Record<string, AmenityGroup>, curr: OldBoatAmenity) => {
      const iconName = curr.icon;
      if (!acc[iconName]) {
        acc[iconName] = {
          name: curr.name,
          iconName: curr.icon,
          boatIds: [curr.boatId]
        };
      } else {
        acc[iconName].boatIds.push(curr.boatId);
      }
      return acc;
    }, {});

    // 3. Cria as novas amenidades e suas relações
    for (const [iconName, data] of Object.entries<AmenityGroup>(amenityGroups)) {
      console.log(`Migrando amenidade: ${data.name} (${iconName})`);

      // Cria a amenidade
      const amenity = await prisma.amenity.create({
        data: {
          name: data.name,
          iconName: data.iconName,
        },
      });

      // Cria as relações com os barcos
      for (const boatId of data.boatIds) {
        await prisma.boatAmenityRelation.create({
          data: {
            boatId,
            amenityId: amenity.id,
          },
        });
      }
    }

    console.log('Migração concluída!');
  } finally {
    db.close();
  }
}

main()
  .catch((e) => {
    console.error('Erro durante a migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
