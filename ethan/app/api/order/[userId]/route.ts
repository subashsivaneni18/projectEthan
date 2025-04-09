import { NextResponse } from "next/server";
import prisma from "@/libs/prisma";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "Invalid userId" });
    }

    // Fetch all orders for the user
    const userOrders = await prisma.order.findMany({
      where: { userId },
      // orderBy: { created: "desc" },
    });

    // Populate cart item details for each order
    const enrichedOrders = await Promise.all(
      userOrders.map(async (order) => {
        const cartItems = await prisma.cartItem.findMany({
          where: {
            id: {
              in: order.cartItemIds,
            },
          },
        });

        return {
          ...order,
          cartItems,
        };
      })
    );

    return NextResponse.json(enrichedOrders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json({ error: "Internal server error" });
  }
}
