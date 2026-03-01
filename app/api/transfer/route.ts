import { NextRequest, NextResponse } from "next/server"
import { createTransfer, getTransfers } from "@/lib/store"

export async function GET() {
  try {
    const transfers = getTransfers()
    return NextResponse.json({
      success: true,
      data: transfers,
      legacy: true,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch transfers" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, token, recipient, amount, relayId, memo } = body

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

    const record = createTransfer({
      type: type || "private-send",
      token,
      recipient,
      amount: String(amount),
      relayId: relayId ?? null,
      memo: memo ?? undefined,
    })

    return NextResponse.json({
      success: true,
      data: record,
      message: "Transfer recorded (legacy route)",
      legacy: true,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    )
  }
}
