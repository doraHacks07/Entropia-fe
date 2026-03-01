import { NextRequest, NextResponse } from "next/server"
import { createSensitiveTransfer, getSensitiveTransfers } from "@/lib/store"

export async function GET() {
  try {
    const transfers = getSensitiveTransfers()
    return NextResponse.json({
      success: true,
      data: transfers,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch withdrawals" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, token, recipient, amount, relayId, purpose } = body

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      )
    }
    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      return NextResponse.json(
        { success: false, error: "Invalid recipient address (must be 0x...)" },
        { status: 400 }
      )
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid amount" },
        { status: 400 }
      )
    }

    const record = createSensitiveTransfer({
      type: type || "withdrawal",
      token,
      recipient,
      amount: String(amount),
      relayId: relayId ?? null,
      purpose: purpose ?? undefined,
    })

    return NextResponse.json({
      success: true,
      data: record,
      message: "Withdrawal recorded",
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    )
  }
}
