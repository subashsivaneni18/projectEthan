"use client";

import { Button } from "@/components/ui/button";
import fetcher from "@/libs/fetcher";
import axios from "axios";
import { useCallback, useState } from "react";
import useSWR, { mutate } from "swr";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  cartItems: CartItem[];
  userId: string;
  paymentStatus: boolean;
  completedStatus: boolean;
  TableNo: number;
  TotalValue: number;
}

export default function Home() {
  const router = useRouter();
  const [showCompleted, setShowCompleted] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [cookedItemsMap, setCookedItemsMap] = useState<{
    [orderId: string]: Set<string>;
  }>({});

  const {
    data: availableOrders,
    isLoading,
    mutate,
  } = useSWR<Order[]>("/api/order/fetchAll", fetcher, {
    refreshInterval: 5000,
    onSuccess: (data) => {
      const initialMap: { [key: string]: Set<string> } = {};
      data?.forEach((order) => {
        initialMap[order.id] = new Set();
      });
      setCookedItemsMap(initialMap);
    },
  });

  const handleStatus = useCallback(
    async (id: string) => {
      setLoadingOrderId(id);
      try {
        await axios.post("/api/order/updateStatus", { id });
        await mutate();
      } catch (error) {
        console.error("Failed to update order status:", error);
      } finally {
        setLoadingOrderId(null);
      }
    },
    [mutate]
  );

  const handleToggleCookedItem = (orderId: string, itemId: string) => {
    setCookedItemsMap((prev) => {
      const newMap = { ...prev };
      const set = new Set(newMap[orderId]);

      if (set.has(itemId)) {
        set.delete(itemId);
      } else {
        set.add(itemId);
      }

      newMap[orderId] = set;
      return newMap;
    });
  };

  const filteredOrders =
    availableOrders?.filter(
      (order) => order.completedStatus === showCompleted
    ) || [];

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
        {showCompleted ? "Completed Orders" : "Current Orders"}
      </h1>

      <div className="flex justify-center mb-6 gap-4 flex-wrap">
        <Button
          variant={!showCompleted ? "default" : "outline"}
          onClick={() => setShowCompleted(false)}
        >
          Current Orders
        </Button>
        <Button
          variant={showCompleted ? "default" : "outline"}
          onClick={() => setShowCompleted(true)}
        >
          Completed Orders
        </Button>
        <Button variant="outline" onClick={() => router.push("/addProduct")}>
          Add Product
        </Button>
        <Button variant="outline" onClick={() => router.push("/delProduct")}>
          Delete Product
        </Button>
        <Button variant="outline" onClick={() => router.push("/tableRequests")}>
          Table Requests
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh] text-gray-600">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
          <span className="ml-4 text-lg">Loading orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center text-gray-600 text-lg mt-10">
          No {showCompleted ? "completed" : "current"} orders found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-4 space-y-3"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Table #{order.TableNo}
                </h2>

                {order.cartItems.map((item) => {
                  const isCooked =
                    cookedItemsMap[order.id]?.has(item.id) ?? false;

                  return (
                    <div
                      key={item.id}
                      className="border p-2 rounded mb-2 bg-gray-50"
                    >
                      <p
                        className={`text-gray-800 font-semibold cursor-pointer ${
                          isCooked ? "line-through text-red-500" : ""
                        }`}
                        onClick={() =>
                          handleToggleCookedItem(order.id, item.id)
                        }
                      >
                        {item.name}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Price: ₹{item.price} x {item.quantity} = ₹
                        {item.price * item.quantity}
                      </p>
                    </div>
                  );
                })}

                <div className="flex justify-between items-center px-2 py-1">
                  <p className="text-lg font-bold text-green-600">
                    Total: ₹{order.TotalValue}
                  </p>

                  {!order.completedStatus && (
                    <Button
                      onClick={() => handleStatus(order.id)}
                      className="flex gap-2 items-center"
                      disabled={loadingOrderId === order.id}
                    >
                      {loadingOrderId === order.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Marking...
                        </>
                      ) : (
                        "Mark as Completed"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
