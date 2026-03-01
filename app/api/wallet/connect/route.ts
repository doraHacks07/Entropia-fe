import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, address, chainId, createdAt, connectedAt } = body

    // Log wallet event for backend tracking
    // In production, store in your database for analytics/audit
    console.log("[NeoBank] Wallet event:", {
      type: type || "metamask-connect",
      address: address || null,
      chainId: chainId || null,
      createdAt: createdAt || connectedAt || new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "Wallet event recorded",
    })
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}
