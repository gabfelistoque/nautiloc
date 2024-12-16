const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const exampleBoat = await prisma.boat.create({
      data: {
        name: "Veleiro Sunset Dream",
        description: "Veleiro luxuoso perfeito para passeios ao pôr do sol. Equipado com todos os itens de conforto e segurança para uma experiência inesquecível.",
        imageUrl: "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        capacity: 8,
        location: "Marina da Glória, Rio de Janeiro",
        price: 1500,
        available: true,
        length: 12.5,
        year: 2020,
        category: "SAILBOAT",
        amenities: {
          create: [
            { amenityId: "cm4r0iifc0001w184z5k0lca0" }, // Wi-Fi
            { amenityId: "cm4r0imz20008w184vix8pbl0" }, // Ar Condicionado
            { amenityId: "cm4r0iorz000bw1848cy83k3z" }, // Som
            { amenityId: "cm4r0io60000aw184neozuf1u" }  // Churrasqueira
          ]
        },
        user: {
          connect: {
            email: "admin@example.com"
          }
        }
      }
    });

    console.log('Barco de exemplo criado:', exampleBoat);
  } catch (error) {
    console.error('Erro ao criar barco de exemplo:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
