"use client";
import fetcher from "@/libs/fetcher";
import React, { useEffect, useRef } from "react";
import useSWR from "swr";
import { Loader2 } from "lucide-react";

interface TableRequest {
  id: string;
  TableNumber: number;
  userId: string;
  completedStatus: boolean;
}

const Page = () => {
  const { data, isLoading, mutate } = useSWR<TableRequest[]>(
    "/api/TableCall",
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 10000,
    }
  );

  const previousRequestCount = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play sound when new table request appears
  useEffect(() => {
    if (data && data.length > previousRequestCount.current) {
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.warn("Audio play failed:", err);
        });
      }
    }
    if (data) {
      previousRequestCount.current = data.length;
    }
  }, [data]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/TableCall/${id}`, {
        method: "DELETE",
      });
      mutate();
    } catch (error) {
      console.error("Failed to delete request", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <audio ref={audioRef} src="/sounds/ding.mp3" preload="auto" />
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Table Requests
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh] text-gray-600">
          <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
          <span className="ml-4 text-lg">Loading table requests...</span>
        </div>
      ) : data?.length === 0 ? (
        <div className="text-center text-gray-600 text-lg mt-10">
          No table requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data?.map((request) => (
            <div
              key={request.id}
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Table #{request.TableNumber}
              </h2>

              {request.completedStatus ? (
                <p className="text-green-600 font-semibold text-sm">
                  Completed
                </p>
              ) : (
                <>
                  <p className="text-red-500 font-semibold text-sm mb-2">
                    Pending
                  </p>
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition"
                  >
                    Remove Request
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
