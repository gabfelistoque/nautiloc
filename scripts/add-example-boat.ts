import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const exampleBoat = {
    name: "Veleiro Sunset Dream",
    description: "Veleiro luxuoso perfeito para passeios ao pôr do sol. Equipado com todos os itens de conforto e segurança para uma experiência inesquecível.",
    imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    capacity: 8,
    location: "Marina da Glória, Rio de Janeiro",
    price: 1500,
    available: true,
    length: 12.5,
    year: 2020,
    category: "Veleiro",
    amenities: [
      { name: "Wi-Fi", iconName: "wifi" },
      { name: "Ar Condicionado", iconName: "wind" },
      { name: "Som", iconName: "music" },
      { name: "Churrasqueira", iconName: "barbecue" },
      { name: "Área de Sol", iconName: "sun" }
    ],
    media: [
      {
        url: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        type: "IMAGE"
      },
      {
        url: "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        type: "IMAGE"
      }
    ]
  };

  try {
    // Primeiro, garante que existe um usuário admin
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        name: 'Admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN'
      }
    });

    // Cria o barco com suas mídias em uma transação
    const boat = await prisma.$transaction(async (tx) => {
      // Primeiro, cria as amenidades se não existirem
      const amenities = await Promise.all(
        exampleBoat.amenities.map(async (amenity) => {
          return await tx.amenity.upsert({
            where: { iconName: amenity.iconName },
            update: {},
            create: {
              name: amenity.name,
              iconName: amenity.iconName,
            },
          });
        })
      );

      // Cria o barco com as amenidades
      const newBoat = await tx.boat.create({
        data: {
          name: exampleBoat.name,
          description: exampleBoat.description,
          imageUrl: exampleBoat.imageUrl,
          capacity: exampleBoat.capacity,
          location: exampleBoat.location,
          price: exampleBoat.price,
          available: exampleBoat.available,
          length: exampleBoat.length,
          year: exampleBoat.year,
          category: exampleBoat.category,
          userId: adminUser.id,
          amenities: {
            connect: amenities.map(amenity => ({ id: amenity.id }))
          },
          media: {
            create: exampleBoat.media
          }
        },
        include: {
          amenities: true,
          media: true
        }
      });

      return newBoat;
    });

    console.log('Barco criado com sucesso:', boat);
  } catch (error) {
    console.error('Erro ao criar barco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
