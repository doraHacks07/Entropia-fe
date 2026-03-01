import { NextRequest, NextResponse } from "next/server"
import { saveWalletEvent } from "@/lib/store"
import type { WalletConnectPayload, WalletEventType } from "@/lib/api-types"

const VALID_TYPES: WalletEventType[] = ["metamask-connect", "unlink-wallet-created", "wallet-linked"]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      metamaskAddress,
      unlinkAddress,
      address,
      chainId,
      balanceHex,
      connectedAt,
      createdAt,
    } = body as WalletConnectPayload & { address?: string }

    // Normalize: support legacy "address" for metamask
    const metaAddress = metamaskAddress ?? address
    const eventType = (type && VALID_TYPES.includes(type) ? type : "metamask-connect") as WalletEventType

    const payload: WalletConnectPayload = {
      type: eventType,
      metamaskAddress: metaAddress || undefined,
      unlinkAddress: unlinkAddress || undefined,
      chainId: chainId || undefined,
      balanceHex: balanceHex || undefined,
      connectedAt: connectedAt || undefined,
      createdAt: createdAt || undefined,
    }

    const { id, timestamp } = saveWalletEvent(payload)

    return NextResponse.json({
      success: true,
      data: { id, ...payload, timestamp },
      message: "Wallet event recorded",
    })
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    )
  }
}
