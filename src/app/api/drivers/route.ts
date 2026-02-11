import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN")
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });

  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER" },
    select: {
      id: true, name: true, email: true, isActive: true, createdAt: true,
      driverDeliveries: {
        select: { id: true, status: true, startTime: true, endTime: true, order: { select: { totalAmount: true } } },
        orderBy: { startTime: "desc" },
        take: 50,
      },
    },
    orderBy: { name: "asc" },
  });

  const result = drivers.map((d) => {
    const deliveries = d.driverDeliveries;
    const active = deliveries.filter((dl) => ["PICKING_UP", "DELIVERING"].includes(dl.status)).length;
    const completed = deliveries.filter((dl) => dl.status === "DELIVERED").length;
    const totalRevenue = deliveries
      .filter((dl) => dl.status === "DELIVERED")
      .reduce((s, dl) => s + (dl.order?.totalAmount || 0), 0);
    return {
      id: d.id, name: d.name, email: d.email, isActive: d.isActive, createdAt: d.createdAt,
      stats: { active, completed, totalRevenue: Math.round(totalRevenue) },
    };
  });

  return NextResponse.json(result);
}
