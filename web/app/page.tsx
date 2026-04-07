import { CheckInCard } from "@/components/check-in-card";
import { HikeGame } from "@/components/hike-game";
import { WalletBar } from "@/components/wallet-bar";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-full max-w-lg flex-col gap-6 px-4 py-6 pb-10 sm:max-w-xl">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-fuchsia-400/80">
          Base · mobile hike
        </p>
        <h1 className="neon-text text-3xl font-bold leading-tight text-cyan-50 sm:text-4xl">
          Neon Summit Hike
        </h1>
        <p className="text-sm leading-relaxed text-cyan-100/65">
          Inspired by{" "}
          <span className="text-cyan-200/90">A Short Hike</span>: a calm climb
          through glitch-pine trails — collect feathers, then the summit gate
          unlocks the next ridge.
        </p>
        <WalletBar />
      </header>

      <HikeGame />

      <CheckInCard />

      <footer className="pt-4 text-center text-[11px] text-cyan-200/35">
        Standard web app + wallet on Base. No Farcaster manifest required.
      </footer>
    </main>
  );
}
