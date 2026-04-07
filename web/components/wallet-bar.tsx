"use client";

import { useState } from "react";
import { formatEther } from "viem";
import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { base } from "wagmi/chains";

export function WalletBar() {
  const { address, isConnected, status } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { connectors, connect, isPending } = useConnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: bal } = useBalance({ address });
  const [sheet, setSheet] = useState(false);

  const wrong = isConnected && chainId !== base.id;

  if (status === "connecting" || status === "reconnecting") {
    return (
      <div className="rounded-xl border border-cyan-500/40 bg-black/40 px-3 py-2 text-sm text-cyan-200/80">
        Restoring wallet…
      </div>
    );
  }

  if (!isConnected) {
    return (
      <>
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="neon-border rounded-xl bg-fuchsia-600/20 px-4 py-3 text-sm font-semibold tracking-wide text-fuchsia-100 shadow-[0_0_24px_rgba(217,70,239,0.35)] active:scale-[0.98]"
        >
          Connect wallet
        </button>
        {sheet ? (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
            <div
              role="dialog"
              aria-label="Choose wallet"
              className="w-full max-w-sm rounded-2xl border border-cyan-500/30 bg-[#070714] p-4 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-cyan-100">Wallets</h2>
                <button
                  type="button"
                  className="rounded-lg px-2 py-1 text-sm text-cyan-300/70"
                  onClick={() => setSheet(false)}
                >
                  Close
                </button>
              </div>
              <ul className="flex flex-col gap-2">
                {connectors.map((c) => (
                  <li key={c.uid}>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        connect({ connector: c, chainId: base.id });
                        setSheet(false);
                      }}
                      className="w-full rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-4 py-3 text-left text-sm font-medium text-cyan-50 disabled:opacity-40"
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-100/90 sm:text-sm">
        <span className="rounded-lg bg-black/30 px-2 py-1 font-mono">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
        {bal ? (
          <span className="text-cyan-200/70">
            {Number(formatEther(bal.value)).toFixed(4)} {bal.symbol}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {wrong ? (
          <button
            type="button"
            disabled={switching}
            onClick={() => switchChain?.({ chainId: base.id })}
            className="rounded-lg border border-amber-400/50 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-200"
          >
            {switching ? "Switching…" : "Switch to Base"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-lg border border-fuchsia-500/40 px-3 py-2 text-xs text-fuchsia-100"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}
