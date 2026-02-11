import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const alert = await prisma.alert.update({
    where: { id, userId: (session.user as any).id },
    data: { isRead: body.isRead ?? true },
  });
  return NextResponse.json(alert);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const { id } = await params;
  await prisma.alert.delete({ where: { id, userId: (session.user as any).id } });
  return NextResponse.json({ success: true });
}
