import { NextResponse } from "next/server"
import { getLastWalletEvent } from "@/lib/store"

/**
 * GET /api/wallet - Returns the last recorded wallet connection event.
 * Useful for debugging and session recovery.
 * Note: Private Unlink balances cannot be fetched server-side (they are ZK-shielded).
 */
export async function GET() {
  try {
    const event = getLastWalletEvent()
    if (!event) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No wallet connection recorded",
      })
    }
    return NextResponse.json({
      success: true,
      data: event,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to fetch wallet status" },
      { status: 500 }
    )
  }
}
