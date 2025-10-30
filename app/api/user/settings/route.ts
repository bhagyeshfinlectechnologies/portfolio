import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        dhanClientId: true,
        dhanApiKey: true,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, dhanClientId, dhanApiKey } = await req.json()

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        dhanClientId,
        dhanApiKey,
      },
      select: {
        id: true,
        email: true,
        name: true,
        dhanClientId: true,
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}
