import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const where = categorySlug ? { category: { slug: categorySlug } } : {};
    const products = await prisma.product.findMany({
      where,
      include: { images: true, category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: "Failed to list products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      description,
      originalPrice,
      discountPrice,
      categoryId,
      imageUrls = [],
      isActive = true,
      isFeatured = false,
      isRecentlyAdded = false,
      stockQuantity = 0,
      shortDescription,
      sku,
      weight,
      dimensions,
      seoTitle,
      seoDescription,
      seoKeywords,
      sortOrder = 0,
    } = body ?? {};

    if (!name || !slug || !description || !originalPrice || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        originalPrice,
        discountPrice,
        categoryId,
        isActive,
        isFeatured,
        isRecentlyAdded,
        stockQuantity,
        shortDescription,
        sku,
        weight,
        dimensions,
        seoTitle,
        seoDescription,
        seoKeywords,
        sortOrder,
        images: imageUrls.length
          ? { createMany: { data: imageUrls.map((url: string) => ({ url })) } }
          : undefined,
      },
      include: { images: true, category: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}


