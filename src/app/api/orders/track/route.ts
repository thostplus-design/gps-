import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");

  if (!phone || phone.length < 8) {
    return NextResponse.json({ error: "Numero de telephone invalide" }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { guestPhone: phone },
    include: {
      items: { include: { product: true } },
      delivery: {
        include: {
          driver: { select: { id: true, name: true } },
          positions: { orderBy: { timestamp: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(orders);
}
