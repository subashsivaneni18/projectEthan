"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const Page = () => {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/api/auth/login");
    }
    else{
      const x = async ()=>{
        const isAlreadyPresent = await axios.post('/api/isExist',{
          email:user?.email
        })

        if(isAlreadyPresent.data.message==="False"){
          const res = await axios.post('/api/CreateUser',{
            name:user?.name,
            email:user?.email
          })
          console.log(res.data)
        }
      }
      x()
    }
  }, [router, user, isLoading]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return null; 
  }

  return (
    <div>
      <p>{user.email}</p>
      <p>{user.name}</p>
      <p>{user.email_verified ? "True" : "False"}</p>
      <a href="/api/auth/logout">Logout</a>
    </div>
  );
};

export default Page;
