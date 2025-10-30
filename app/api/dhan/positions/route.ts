import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createDhanClient } from "@/lib/dhan-api"

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
        dhanClientId: true,
        dhanApiKey: true,
      }
    })

    if (!user?.dhanClientId || !user?.dhanApiKey) {
      return NextResponse.json(
        { error: "Dhan API credentials not configured" },
        { status: 400 }
      )
    }

    const dhanClient = createDhanClient({
      clientId: user.dhanClientId,
      accessToken: user.dhanApiKey,
    })

    const positions = await dhanClient.getPositions()

    return NextResponse.json(positions)
  } catch (error) {
    console.error("Error fetching positions:", error)
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 }
    )
  }
}
