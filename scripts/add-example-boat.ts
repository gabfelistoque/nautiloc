const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const exampleBoat = {
    name: "Veleiro Sunset Dream",
    description: "Veleiro luxuoso perfeito para passeios ao pôr do sol. Equipado com todos os itens de conforto e segurança para uma experiência inesquecível.",
    imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    capacity: 8,
    location: "Marina da Glória, Rio de Janeiro",
    pricePerDay: 1500,
    available: true,
    length: 12.5,
    year: 2020,
    category: "Veleiro",
    amenities: [
      { name: "Wi-Fi", icon: "WifiIcon" },
      { name: "Ar Condicionado", icon: "SignalIcon" },
      { name: "Som", icon: "MusicalNoteIcon" },
      { name: "Churrasqueira", icon: "FireIcon" },
      { name: "Área de Sol", icon: "SunIcon" }
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
    // Cria o barco com suas mídias em uma transação
    const boat = await prisma.$transaction(async (tx) => {
      // Primeiro, cria o barco
      const newBoat = await tx.boat.create({
        data: {
          name: exampleBoat.name,
          description: exampleBoat.description,
          imageUrl: exampleBoat.imageUrl,
          capacity: exampleBoat.capacity,
          location: exampleBoat.location,
          pricePerDay: exampleBoat.pricePerDay,
          available: exampleBoat.available,
          length: exampleBoat.length,
          year: exampleBoat.year,
          category: exampleBoat.category,
        },
      });

      // Adiciona as mídias
      if (exampleBoat.media.length > 0) {
        await tx.media.createMany({
          data: exampleBoat.media.map((m) => ({
            url: m.url,
            type: m.type,
            boatId: newBoat.id,
          })),
        });
      }

      // Adiciona as amenidades
      if (exampleBoat.amenities.length > 0) {
        await tx.amenity.createMany({
          data: exampleBoat.amenities.map((amenity) => ({
            name: amenity.name,
            iconName: amenity.icon,
          })),
          skipDuplicates: true,
        });

        // Agora cria as relações com o barco
        const createdAmenities = await tx.amenity.findMany({
          where: {
            iconName: {
              in: exampleBoat.amenities.map(a => a.icon)
            }
          }
        });

        await tx.boatAmenityRelation.createMany({
          data: createdAmenities.map((amenity) => ({
            amenityId: amenity.id,
            boatId: newBoat.id,
          })),
        });
      }

      // Retorna o barco criado com suas relações
      return tx.boat.findUnique({
        where: {
          id: newBoat.id,
        },
        include: {
          media: true,
          amenities: true,
        },
      });
    });

    console.log('Barco criado com sucesso:', boat);
  } catch (error) {
    console.error('Erro ao criar barco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
