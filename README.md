# Neon Summit Hike

Base mini-app: cyberpunk hiking game (swipe controls) + daily on-chain check-in.

- **`web/`** — Next.js (App Router), wagmi, viem, Tailwind. Deploy root: `web`.
- **`contracts/`** — Foundry: `DailyCheckIn.sol`.

Copy `web/.env.example` to `web/.env.local` and fill `NEXT_PUBLIC_*` variables.

```bash
cd web && npm install && npm run build
cd ../contracts && forge test
```
