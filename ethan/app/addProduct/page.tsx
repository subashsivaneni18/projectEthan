"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CldUploadButton } from "next-cloudinary";
import { Loader2 } from "lucide-react"; // 👈 make sure this is imported

const AddProductPage = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [ratings, setRatings] = useState<number>(0);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); // 👈 new loading state

  const handleImageUpload = (result: any) => {
    if (result?.info?.secure_url) {
      setImage(result.info.secure_url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // 👈 start loading
    try {
      await axios.post("/api/Item/create", {
        name,
        price,
        description,
        Image: image,
        Ratings: ratings,
      });

      setSuccess(true);
      setName("");
      setPrice(0);
      setDescription("");
      setImage("");
      setRatings(0);
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setLoading(false); // 👈 stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />

          <div className="flex flex-col items-start gap-2">
            <CldUploadButton
              uploadPreset="ethan_18"
              onSuccess={handleImageUpload}
              className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 transition"
            >
              Upload Image
            </CldUploadButton>
            {image && (
              <img
                src={image}
                alt="Uploaded preview"
                className="w-full h-40 object-cover rounded border"
              />
            )}
          </div>

          <input
            type="number"
            placeholder="Ratings (0-5)"
            step="0.1"
            value={ratings}
            onChange={(e) => setRatings(parseFloat(e.target.value))}
            className="w-full p-2 border rounded"
          />

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin h-5 w-5" />}
            {loading ? "Adding..." : "Add Product"}
          </Button>

          {success && (
            <p className="text-green-600 text-center mt-2">
              ✅ Product added successfully!
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;
