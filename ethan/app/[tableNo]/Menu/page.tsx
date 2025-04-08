"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { useCartStore } from "@/store/cartStore";
import { Loader2, Star } from "lucide-react";

interface Item {
  id: string;
  name: string;
  price: number;
  description: string;
  Image: string;
  Ratings: number;
}

const Page = () => {
  const [menuItems, setMenuItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useUser();

  const tableNo = params.tableNo as string;
  const {
    addToCart,
    increaseQty,
    decreaseQty,
    getItemQuantity,
    cart,
    setTableNo,
  } = useCartStore();

  useEffect(() => {
    if (tableNo) {
      setTableNo(tableNo);
    }

    const fetchItems = async () => {
      try {
        setLoadingItems(true);
        const res = await axios.get("/api/Item/fetchAll");
        setMenuItems(res.data);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, [tableNo, setTableNo]);

  useMemo(() => {
    if (!isLoading && !user) {
      router.push("/api/auth/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || loadingItems)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
        <span className="ml-4 text-gray-600 text-lg">Loading menu...</span>
      </div>
    );

  if (!user) return null;

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen px-4 py-8 pb-28 bg-gradient-to-br from-gray-50 to-gray-200 relative">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 tracking-tight">
        Menu for Table #{tableNo}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {menuItems.map((item) => {
          const quantity = getItemQuantity(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              <div className="relative h-56 w-full">
                <Image
                  src={item.Image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {item.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-700 mt-2">
                  <p className="text-green-600 font-bold text-lg">
                    ₹{item.price}
                  </p>
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-500 h-4 w-4 fill-yellow-500" />
                    <span>{item.Ratings}/5</span>
                  </div>
                </div>

                {quantity > 0 ? (
                  <div className="flex items-center justify-between mt-auto gap-2 pt-4">
                    <Button
                      onClick={() => decreaseQty(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-full"
                    >
                      −
                    </Button>
                    <span className="text-lg font-semibold w-10 text-center">
                      {quantity}
                    </span>
                    <Button
                      onClick={() => increaseQty(item.id)}
                      className="bg-green-500 hover:bg-green-600 text-white w-10 h-10 rounded-full"
                    >
                      +
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => addToCart(item)}
                    className="mt-auto bg-blue-600 hover:bg-blue-700 text-white w-full"
                  >
                    Add to Cart
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalCartItems > 0 && (
        <div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg text-lg font-semibold hover:bg-blue-700 cursor-pointer transition duration-300 z-50"
          onClick={() => router.push(`/cart/${tableNo}`)}
        >
          View Cart ({totalCartItems})
        </div>
      )}
    </div>
  );
};

export default Page;
