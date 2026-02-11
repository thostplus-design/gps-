import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  await prisma.alert.updateMany({
    where: { userId: (session.user as any).id, isRead: false },
    data: { isRead: true },
  });
  return NextResponse.json({ success: true });
}
