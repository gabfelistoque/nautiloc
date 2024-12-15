import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DefaultAmenity {
  name: string;
  iconName: string;
}

const defaultAmenities: DefaultAmenity[] = [
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
  { name: 'Toldo', iconName: 'cover' },
];

async function main() {
  console.log('Iniciando seed de amenidades...');

  for (const amenity of defaultAmenities) {
    await prisma.amenity.upsert({
      where: { iconName: amenity.iconName },
      update: { name: amenity.name },
      create: {
        name: amenity.name,
        iconName: amenity.iconName,
      },
    });
  }

  console.log('Seed de amenidades concluído!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
