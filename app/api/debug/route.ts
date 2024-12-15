import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ 
      error: "Erro ao buscar usuários",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
