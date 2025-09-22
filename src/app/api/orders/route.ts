import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to list orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerName, whatsappNumber, deliveryOption, items = [], note } = body ?? {};
    if (!customerName || !whatsappNumber || !deliveryOption || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const DELIVERY_FEE = deliveryOption === "HOME_DELIVERY" ? 20 : 0;
    const subtotal = items.reduce((sum: number, it: any) => sum + Number(it.unitPrice) * Number(it.quantity), 0);
    const total = subtotal + DELIVERY_FEE;

    const created = await prisma.order.create({
      data: {
        customerName,
        whatsappNumber,
        deliveryOption,
        deliveryFee: DELIVERY_FEE,
        totalPrice: total,
        note,
        items: {
          create: items.map((it: any) => ({
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            lineTotal: Number(it.unitPrice) * Number(it.quantity),
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ message: "Your order has been successfully sent.", order: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}


