"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useParams, useRouter } from "next/navigation";
import { mutate } from "swr"; // 👈 Import this

const CartPage = () => {
  const { cart, clearCart, increaseQty, decreaseQty, getItemQuantity } =
    useCartStore();
  const { user } = useUser();
  const params = useParams();
  const router = useRouter()

  const [loading, setLoading] = useState(false);

  const totalAmount = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const currUser = await axios.post("/api/currentUser", {
        email: user?.email,
      });

      const formattedCart = cart.map((item) => ({
        Itemid: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const res = await axios.post("/api/order/create", {
        data: formattedCart,
        userId: currUser.data.id,
        tableNo: parseInt(params.tableNo as string, 10),
      });

      console.log("Order placed:", res.data);
      clearCart();

      // 🔄 Trigger re-fetch in Home page
      mutate("/api/order/fetchAll");
      router.push(`/waitingList/${currUser.data.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-600">₹{item.price}</p>

                  <div className="mt-2 flex items-center space-x-3">
                    <Button
                      onClick={() => decreaseQty(item.id)}
                      className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full text-lg"
                    >
                      −
                    </Button>
                    <span className="text-lg font-semibold">
                      {getItemQuantity(item.id)}
                    </span>
                    <Button
                      onClick={() => increaseQty(item.id)}
                      className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full text-lg"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="text-right font-bold text-green-600 text-xl">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Total: ₹{totalAmount}</h2>
              <Button
                onClick={clearCart}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Clear Cart
              </Button>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {loading && (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {loading ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;
