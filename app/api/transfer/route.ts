import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, token, recipient, amount, relayId, memo } = body

    // Validate
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      )
    }
    if (!recipient) {
      return NextResponse.json(
        { success: false, error: "Recipient is required" },
        { status: 400 }
      )
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      )
    }

    // In production, store the transfer record in your database
    // The actual transfer is handled client-side by the Unlink SDK
    console.log("[NeoBank] Private send recorded:", {
      type: type || "private-send",
      token,
      recipient,
      amount,
      relayId: relayId || null,
      memo: memo || null,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      relayId,
      message: "Transfer recorded",
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    )
  }
}
