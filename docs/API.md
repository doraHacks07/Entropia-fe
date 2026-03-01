# NeoBank API Reference

This document describes the REST API endpoints used by the NeoBank frontend. Backend developers can use this as a reference for integration, replication, or extension.

## Payment orchestration mode

- The frontend now supports backend-orchestrated payments via the `neobank-backend` service.
- Configure:
  - `NEXT_PUBLIC_BACKEND_BASE_URL` (example: `http://localhost:3000`)
  - `NEXT_PUBLIC_PAYMENT_FLOW=backend|legacy`
- In `backend` mode, payment initiation/status/verification uses:
  - `POST {BACKEND}/api/initiate`
  - `GET {BACKEND}/api/status/:internalTxId`
  - `GET {BACKEND}/api/verify/:txHash`
- Current backend orchestration scope uses MON native flow. Amounts should be sent as MON wei strings.
- Legacy Next.js local routes (`/api/transfer*`) are kept for compatibility and non-authoritative record flows.

**Base URL:** `/api` (relative to the application root)

**Content-Type:** All POST requests expect `application/json`.

**Response Format:** All responses return JSON. Success responses include `success: true` and a `data` field. Error responses include `success: false` and an `error` message.

---

## Table of Contents

1. [Wallet](#wallet)
   - [GET /api/wallet](#get-apiwallet)
   - [POST /api/wallet/connect](#post-apiwalletconnect)
2. [Transfer](#transfer)
   - [GET /api/transfer](#get-apitransfer)
   - [POST /api/transfer](#post-apitransfer)
3. [Sensitive Transfer (Withdrawals)](#sensitive-transfer-withdrawals)
   - [GET /api/transfer/sensitive](#get-apitransfersensitive)
   - [POST /api/transfer/sensitive](#post-apitransfersensitive)

---

## Wallet

### GET /api/wallet

Returns the last recorded wallet connection event. Used for debugging and session recovery.

**Note:** Private Unlink balances cannot be fetched server-side (they are ZK-shielded). Balance data comes from the client via the Unlink SDK.

#### Request

- **Method:** `GET`
- **Headers:** None required
- **Body:** None

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "evt_1709308800000",
    "type": "metamask-connect",
    "metamaskAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "unlinkAddress": "unlink1abc...xyz",
    "chainId": "0x28",
    "balanceHex": "0xde0b6b3a7640000",
    "connectedAt": "2024-03-01T12:00:00.000Z",
    "timestamp": "2024-03-01T12:00:00.000Z"
  }
}
```

When no wallet has been connected:

```json
{
  "success": true,
  "data": null,
  "message": "No wallet connection recorded"
}
```

**Error (500 Internal Server Error)**

```json
{
  "success": false,
  "error": "Failed to fetch wallet status"
}
```

---

### POST /api/wallet/connect

Records a wallet connection or lifecycle event. Called when the user connects MetaMask, creates an Unlink wallet, or links accounts.

#### Request

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**

| Field            | Type   | Required | Description                                                                 |
|------------------|--------|----------|-----------------------------------------------------------------------------|
| `type`           | string | No       | Event type. Default: `"metamask-connect"`. See allowed values below.        |
| `metamaskAddress`| string | No       | MetaMask public address (0x...). Legacy: `address` is also accepted.        |
| `unlinkAddress`  | string | No       | Unlink private address (unlink1...).                                        |
| `chainId`        | string | No       | Chain ID as hex string (e.g. `"0x28"` for Monad Testnet).                    |
| `balanceHex`     | string | No       | Native balance in wei, hex format (e.g. `"0xde0b6b3a7640000"`).             |
| `connectedAt`    | string | No       | ISO 8601 timestamp.                                                         |
| `createdAt`      | string | No       | ISO 8601 timestamp (alternative to `connectedAt`).                          |

**Allowed `type` values:**
- `metamask-connect` — MetaMask connected
- `unlink-wallet-created` — Unlink private wallet created
- `wallet-linked` — Wallet linked/linked state updated

#### Example Request

```json
{
  "type": "metamask-connect",
  "metamaskAddress": "0x1234567890abcdef1234567890abcdef12345678",
  "unlinkAddress": "unlink1abc123def456ghi789jkl012mno345pqr678",
  "chainId": "0x28",
  "balanceHex": "0xde0b6b3a7640000",
  "connectedAt": "2024-03-01T12:00:00.000Z"
}
```

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "evt_1709308800000",
    "type": "metamask-connect",
    "metamaskAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "unlinkAddress": "unlink1abc123def456ghi789jkl012mno345pqr678",
    "chainId": "0x28",
    "balanceHex": "0xde0b6b3a7640000",
    "connectedAt": "2024-03-01T12:00:00.000Z",
    "timestamp": "2024-03-01T12:00:00.000Z"
  },
  "message": "Wallet event recorded"
}
```

**Error (400 Bad Request)**

```json
{
  "success": false,
  "error": "Invalid request body"
}
```

---

## Transfer

Private transfers between Unlink addresses. The actual ZK proof generation and relay happen client-side via the Unlink SDK. This API is for record-keeping and history.

### GET /api/transfer

Returns a list of private transfer records, newest first.

#### Request

- **Method:** `GET`
- **Headers:** None required
- **Body:** None

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "rec_1709308800000_abc123xyz",
      "type": "private-send",
      "token": "0x0000000000000000000000000000000000000000",
      "recipient": "unlink1abc123def456ghi789jkl012mno345pqr678",
      "amount": "1.5",
      "relayId": "0xrelay123...",
      "memo": "Payment for services",
      "timestamp": "2024-03-01T12:00:00.000Z"
    }
  ]
}
```

**Error (500 Internal Server Error)**

```json
{
  "success": false,
  "error": "Failed to fetch transfers"
}
```

---

### POST /api/transfer

Creates a record for a private transfer. Called after the client successfully submits a transfer via the Unlink SDK.

#### Request

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**

| Field      | Type   | Required | Description                                              |
|------------|--------|----------|----------------------------------------------------------|
| `type`     | string | No       | Transfer type. Default: `"private-send"`.                |
| `token`    | string | **Yes**  | Token contract address (use `0x0...0` for native token). |
| `recipient`| string | **Yes**  | Recipient Unlink address (unlink1...).                  |
| `amount`   | string | **Yes**  | Amount as string (e.g. `"1.5"`). Must be > 0.           |
| `relayId`  | string | No       | Relay/transaction ID from Unlink SDK.                   |
| `memo`     | string | No       | Optional memo (local only, not onchain).                |

#### Validation Rules

- `token`: Required, non-empty
- `recipient`: Required, non-empty (typically `unlink1...`)
- `amount`: Required, numeric, > 0

#### Example Request

```json
{
  "type": "private-send",
  "token": "0x0000000000000000000000000000000000000000",
  "recipient": "unlink1abc123def456ghi789jkl012mno345pqr678",
  "amount": "1.5",
  "relayId": "0xrelay123abc456def789",
  "memo": "Payment for services"
}
```

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "rec_1709308800000_abc123xyz",
    "type": "private-send",
    "token": "0x0000000000000000000000000000000000000000",
    "recipient": "unlink1abc123def456ghi789jkl012mno345pqr678",
    "amount": "1.5",
    "relayId": "0xrelay123abc456def789",
    "memo": "Payment for services",
    "timestamp": "2024-03-01T12:00:00.000Z"
  },
  "message": "Transfer recorded"
}
```

**Error (400 Bad Request)**

| Error Message           | Condition                          |
|-------------------------|------------------------------------|
| `"Token is required"`   | `token` missing                    |
| `"Recipient is required"`| `recipient` missing               |
| `"Invalid amount"`       | `amount` missing, not numeric, or ≤ 0 |
| `"Invalid request body"`| Malformed JSON or other parse error |

```json
{
  "success": false,
  "error": "Token is required"
}
```

**Error (500 Internal Server Error)**

```json
{
  "success": false,
  "error": "Failed to fetch transfers"
}
```

---

## Sensitive Transfer (Withdrawals)

Withdrawals move funds from the private Unlink wallet to a public Ethereum address. The recipient and amount are visible onchain. The ZK proof and relay are handled client-side via the Unlink SDK; this API stores records for history and auditing.

### GET /api/transfer/sensitive

Returns a list of sensitive transfer (withdrawal) records, newest first.

#### Request

- **Method:** `GET`
- **Headers:** None required
- **Body:** None

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "rec_1709308800000_xyz789abc",
      "type": "withdrawal",
      "token": "0x0000000000000000000000000000000000000000",
      "recipient": "0x1234567890abcdef1234567890abcdef12345678",
      "amount": "0.5",
      "relayId": "0xrelay456...",
      "purpose": "personal",
      "privacyLevel": "enhanced",
      "encryptedMemo": true,
      "memo": "Encrypted note",
      "timestamp": "2024-03-01T12:00:00.000Z"
    }
  ]
}
```

**Error (500 Internal Server Error)**

```json
{
  "success": false,
  "error": "Failed to fetch withdrawals"
}
```

---

### POST /api/transfer/sensitive

Creates a record for a sensitive transfer (withdrawal). Called after the client successfully submits a withdrawal via the Unlink SDK.

#### Request

- **Method:** `POST`
- **Headers:** `Content-Type: application/json`
- **Body:**

-----------------------------------------------------------------------------------------------------------
| Field          | Type    | Required | Description                                                       |
|----------------|---------|----------|-------------------------------------------------------------------|
| `type`         | string  | No       | Transfer type. Default: `"withdrawal"`.                           |
| `token`        | string  | **Yes**  | Token contract address (use `0x0...0` for native token).          |
| `recipient`    | string  | **Yes**  | Recipient **public** Ethereum address (0x..., 40 hex chars).      |
| `amount`       | string  | **Yes**  | Amount as string (e.g. `"0.5"`). Must be > 0.                     |
| `relayId`      | string  | No       | Relay/transaction ID from Unlink SDK.                             |
| `purpose`      | string  | No       | Purpose category: `personal`, `business`, `investment`, `other`.  |
| `privacyLevel` | string  | No       | Privacy level: `standard`, `enhanced`, `maximum`.                 |
| `encryptedMemo`| boolean | No       | Whether the memo was encrypted.                                   |
| `memo`         | string  | No       | Optional memo (may be encrypted client-side).                     |
-----------------------------------------------------------------------------------------------------------
#### Validation Rules

- `token`: Required, non-empty
- `recipient`: Required, must match `^0x[a-fA-F0-9]{40}$` (40 hex chars after `0x`)
- `amount`: Required, numeric, > 0

#### Example Request

```json
{
  "type": "withdrawal",
  "token": "0x0000000000000000000000000000000000000000",
  "recipient": "0x1234567890abcdef1234567890abcdef12345678",
  "amount": "0.5",
  "relayId": "0xrelay456def789",
  "purpose": "personal",
  "privacyLevel": "enhanced",
  "encryptedMemo": true,
  "memo": "Encrypted note for records"
}
```

#### Response

**Success (200 OK)**

```json
{
  "success": true,
  "data": {
    "id": "rec_1709308800000_xyz789abc",
    "type": "withdrawal",
    "token": "0x0000000000000000000000000000000000000000",
    "recipient": "0x1234567890abcdef1234567890abcdef12345678",
    "amount": "0.5",
    "relayId": "0xrelay456def789",
    "purpose": "personal",
    "privacyLevel": "enhanced",
    "encryptedMemo": true,
    "memo": "Encrypted note for records",
    "timestamp": "2024-03-01T12:00:00.000Z"
  },
  "message": "Withdrawal recorded"
}
```

**Error (400 Bad Request)**

| Error Message                              | Condition                                      |
|--------------------------------------------|------------------------------------------------|
| `"Token is required"`                      | `token` missing                                |
| `"Invalid recipient address (must be 0x...)"` | `recipient` missing or invalid format       |
| `"Invalid amount"`                          | `amount` missing, not numeric, or ≤ 0          |
| `"Invalid request body"`                    | Malformed JSON or other parse error             |

```json
{
  "success": false,
  "error": "Invalid recipient address (must be 0x...)"
}
```

---

## Data Models

### TransferRecord

| Field      | Type   | Description                          |
|------------|--------|--------------------------------------|
| `id`       | string | Auto-generated record ID             |
| `type`     | string | `"private-send"`                     |
| `token`    | string | Token contract address                |
| `recipient`| string | Unlink address (unlink1...)          |
| `amount`   | string | Amount as string                      |
| `relayId`  | string \| null | Relay/transaction ID          |
| `memo`     | string | Optional memo                         |
| `timestamp`| string | ISO 8601 timestamp                    |

### SensitiveTransferRecord

| Field          | Type    | Description                          |
|----------------|---------|--------------------------------------|
| `id`           | string  | Auto-generated record ID             |
| `type`         | string  | `"withdrawal"`                       |
| `token`        | string  | Token contract address                |
| `recipient`    | string  | Public Ethereum address (0x...)      |
| `amount`       | string  | Amount as string                      |
| `relayId`      | string \| null | Relay/transaction ID          |
| `purpose`      | string  | Optional purpose category            |
| `privacyLevel` | string  | `standard` \| `enhanced` \| `maximum` |
| `encryptedMemo`| boolean | Whether memo is encrypted            |
| `memo`         | string  | Optional memo                         |
| `timestamp`    | string  | ISO 8601 timestamp                    |

### WalletConnectPayload

| Field            | Type   | Description                          |
|------------------|--------|--------------------------------------|
| `type`           | string | Event type (see allowed values)      |
| `metamaskAddress`| string | MetaMask address (0x...)             |
| `unlinkAddress`  | string | Unlink address (unlink1...)          |
| `chainId`        | string | Chain ID (hex)                       |
| `balanceHex`     | string | Balance in wei (hex)                 |
| `connectedAt`    | string | ISO 8601 timestamp                   |
| `createdAt`      | string | ISO 8601 timestamp                   |

---

## Implementation Notes

1. **In-memory store:** The current implementation uses an in-memory store. For production, replace with a database (PostgreSQL, MongoDB, etc.).

2. **Authentication:** Endpoints do not enforce authentication. Add auth (e.g. JWT, session) for production.

3. **Rate limiting:** Consider rate limiting for POST endpoints to prevent abuse.

4. **Private transfers vs withdrawals:**
   - **Private transfer:** Recipient is `unlink1...` (Unlink address). Amount and recipient are hidden onchain.
   - **Sensitive transfer:** Recipient is `0x...` (public address). Amount and recipient are visible onchain.

5. **Chain:** The app targets Monad Testnet. `chainId` `0x28` (40) is used for Monad Testnet.
