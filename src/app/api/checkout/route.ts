import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, whatsapp, deliveryOption, items } = body;

    // Validate required fields
    if (!fullName || !whatsapp || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, whatsapp, and items are required' },
        { status: 400 }
      );
    }

    // Validate delivery option
    if (!['free_pickup', 'home_delivery'].includes(deliveryOption)) {
      return NextResponse.json(
        { error: 'Invalid delivery option. Must be "free_pickup" or "home_delivery"' },
        { status: 400 }
      );
    }

    // Calculate delivery fee
    const deliveryFee = deliveryOption === 'home_delivery' ? 20.00 : 0.00;

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { 
          id: true, 
          name: true, 
          discountPrice: true, 
          originalPrice: true,
          isActive: true,
          stockQuantity: true
        }
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Product "${product.name}" is not available` },
          { status: 400 }
        );
      }

      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Available: ${product.stockQuantity}, Requested: ${item.quantity}` },
          { status: 400 }
        );
      }

      const price = product.discountPrice || product.originalPrice;
      const itemTotal = Number(price) * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: price
      });
    }

    totalAmount += deliveryFee;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        customerName: fullName,
        whatsappNumber: whatsapp,
        deliveryOption: deliveryOption === 'home_delivery' ? 'HOME_DELIVERY' : 'PICKUP',
        deliveryFee,
        totalPrice: totalAmount,
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    // Update stock quantities
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Your order has been successfully sent.',
      order: {
        id: order.id,
        totalAmount: order.totalPrice,
        deliveryOption: order.deliveryOption,
        deliveryFee: order.deliveryFee
      }
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error during checkout' },
      { status: 500 }
    );
  }
}
