# neobank-frontend

## Backend orchestration integration

This frontend supports two payment flow modes:

- `NEXT_PUBLIC_PAYMENT_FLOW=backend` (default): uses `neobank-backend` orchestration endpoints.
- `NEXT_PUBLIC_PAYMENT_FLOW=legacy`: keeps previous local record-oriented flow.

Set backend URL:

```bash
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:3000
```

In backend mode, transfer tab uses:

- `POST /api/initiate`
- `GET /api/status/:internalTxId`
- `GET /api/verify/:txHash`

Backend orchestration currently runs MON native payment flow (amounts in wei).
