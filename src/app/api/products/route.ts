import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const shop = searchParams.get("shop");
  const where: any = { isAvailable: true };
  if (category) where.category = category;
  if (shop) where.shopName = { contains: shop, mode: "insensitive" };
  const products = await prisma.product.findMany({ where, orderBy: { shopName: "asc" } });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  const body = await request.json();
  const product = await prisma.product.create({ data: body });
  return NextResponse.json(product, { status: 201 });
}
