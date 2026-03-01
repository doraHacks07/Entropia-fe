import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, token, recipient, amount, relayId, purpose } = body

    // Validate
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      )
    }
    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient address" },
        { status: 400 }
      )
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      )
    }

    // In production, store the withdrawal record in your database
    // The actual withdrawal is handled client-side by the Unlink SDK
    console.log("[NeoBank] Withdrawal recorded:", {
      type: type || "withdrawal",
      token,
      recipient,
      amount,
      relayId: relayId || null,
      purpose: purpose || null,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      relayId,
      message: "Withdrawal recorded",
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    )
  }
}
