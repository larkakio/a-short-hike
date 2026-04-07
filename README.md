# Neon Summit Hike

Base mini-app: cyberpunk hiking game (swipe controls) + daily on-chain check-in.

- **`web/`** — Next.js (App Router), wagmi, viem, Tailwind. Deploy root: `web`.
- **`contracts/`** — Foundry: `DailyCheckIn.sol`.

Production: **https://a-short-hike.vercel.app** (Vercel root directory `web`). Copy `web/.env.example` to `web/.env.local` and fill `NEXT_PUBLIC_*` variables (including `NEXT_PUBLIC_BASE_APP_ID` from [base.dev](https://base.dev)).

```bash
cd web && npm install && npm run build
cd ../contracts && forge test
```
