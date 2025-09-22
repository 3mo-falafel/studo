import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const banners = await prisma.discountBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: "Failed to list banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageUrl, alt, title, subtitle, href, price, discountPercent, sortOrder = 0, isActive = true, productId } = body ?? {};
    if (!imageUrl) return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    const created = await prisma.discountBanner.create({
      data: { imageUrl, alt, title, subtitle, href, sortOrder, isActive, productId },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}


