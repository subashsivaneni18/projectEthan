"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useCartStore } from "@/store/cartStore";

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const { user } = useUser();
  const [currUser, setCurrUser] = useState<User | null>(null);
  const { tableNo } = useCartStore();
  

  useEffect(() => {
    const fetchUser = async () => {
      if (user?.email) {
        try {
          const res = await axios.post("/api/currentUser", {
            email: user.email,
          });
          setCurrUser(res.data);
        } catch (err) {
          console.error("Failed to fetch user:", err);
        }
      }
    };
    fetchUser();
  }, [user]);

  const menuLink = tableNo ? `/${tableNo}/Menu` : "/select-table";

const handleTableCall = async () => {
  let currentTableNo = tableNo;

  if (!currentTableNo) {
    const userInput = prompt("Please enter your table number:");

    if (userInput && !isNaN(Number(userInput))) {
      currentTableNo = Number(userInput); // convert to number
      useCartStore.getState().setTableNo(currentTableNo);
    } else {
      alert("Invalid table number.");
      return;
    }
  }

  alert(`A waiter has been notified for table ${currentTableNo}. Please wait!`);

  try {
    const res = await axios.post("/api/TableCall", {
      tableNo: Number(currentTableNo), // ensure it's a number
      userId: currUser?.id, // ✅ include userId here
    });

    console.log(res.data);
  } catch (error) {
    console.error("Error notifying waiter:", error);
    alert("Failed to notify the waiter. Please try again.");
  }
};


  return (
    <div className="bg-blue-600 text-white p-4 shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-lg font-semibold">
          <Link href="/" className="hover:text-gray-300 transition-all">
            My Website
          </Link>
        </div>
        <div className="hidden md:flex space-x-6 items-center">
          <Link href="/" className="hover:text-gray-300 transition-all">
            Home
          </Link>
          <Link href={menuLink} className="hover:text-gray-300 transition-all">
            Menu
          </Link>
          <Link href="/about" className="hover:text-gray-300 transition-all">
            About
          </Link>
          <Link href="/contact" className="hover:text-gray-300 transition-all">
            Contact
          </Link>
          {currUser?.id && (
            <Link
              href={`/waitingList/${currUser.id}`}
              className="hover:text-gray-300 transition-all"
            >
              Waiting List
            </Link>
          )}
          {currUser?.isAdmin && (
            <Link href="/admin" className="hover:text-gray-300 transition-all">
              Admin
            </Link>
          )}
          <button
            onClick={handleTableCall}
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition-all"
          >
            Table Call
          </button>
        </div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 w-3/4 h-full bg-blue-600 text-white p-6 transition-transform transform ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-start space-y-4">
          <Link href="/" className="hover:text-gray-300" onClick={toggleMenu}>
            Home
          </Link>
          <Link
            href={menuLink}
            className="hover:text-gray-300"
            onClick={toggleMenu}
          >
            Menu
          </Link>
          <Link
            href="/about"
            className="hover:text-gray-300"
            onClick={toggleMenu}
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hover:text-gray-300"
            onClick={toggleMenu}
          >
            Contact
          </Link>
          {currUser?.id && (
            <Link
              href={`/waitingList/${currUser.id}`}
              className="hover:text-gray-300"
              onClick={toggleMenu}
            >
              Waiting List
            </Link>
          )}
          {currUser?.isAdmin && (
            <Link
              href="/admin"
              className="hover:text-gray-300"
              onClick={toggleMenu}
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => {
              handleTableCall();
              toggleMenu();
            }}
            className="bg-white text-blue-600 font-semibold px-4 py-2 rounded hover:bg-gray-100 transition-all"
          >
            Table Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
