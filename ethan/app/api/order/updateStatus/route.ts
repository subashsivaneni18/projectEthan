import { NextResponse } from "next/server"
import prisma from "@/libs/prisma"

export async function POST(req:Request){
    try {
        const body = await req.json()
        const orderId = body.id
        const currentOrder = await prisma.order.update({
            where:{
                id:orderId
            },
            data:{
                completedStatus:true
            }
        })

        return NextResponse.json(currentOrder)
    } catch (error) {
        console.log(error)
        return NextResponse.json(error)
    }
}