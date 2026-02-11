import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const { orderId } = await request.json();
  if (!orderId) return NextResponse.json({ error: "orderId requis" }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { delivery: true } });
  if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  if (order.delivery) return NextResponse.json({ error: "Commande deja prise" }, { status: 400 });

  const delivery = await prisma.delivery.create({
    data: {
      orderId,
      driverId: (session.user as any).id,
      status: "PICKING_UP",
    },
  });

  await prisma.order.update({ where: { id: orderId }, data: { status: "ACCEPTED" } });

  const io = (global as any).io;
  if (io) {
    io.to(`order:${orderId}`).emit("delivery:accepted", {
      deliveryId: delivery.id,
      driverName: (session.user as any).name,
    });
  }

  return NextResponse.json(delivery, { status: 201 });
}
