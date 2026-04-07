"use client";

import { useMemo } from "react";
import { base } from "wagmi/chains";
import { isAddress, zeroAddress } from "viem";
import {
  useAccount,
  useReadContract,
  useSwitchChain,
  useWriteContract,
  useChainId,
} from "wagmi";
import { checkInAbi } from "@/lib/check-in-abi";
import { getBuilderDataSuffix } from "@/lib/builder-suffix";

function calendarDayIndex(tsMs: number) {
  return BigInt(Math.floor(tsMs / 1000 / 86400));
}

export function CheckInCard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync, isPending: switching } = useSwitchChain();
  const {
    writeContractAsync,
    isPending: writing,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const contractAddress = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS;
    if (!raw || !isAddress(raw) || raw === zeroAddress) return null;
    return raw as `0x${string}`;
  }, []);

  const { data: rawLast } = useReadContract({
    address: contractAddress ?? undefined,
    abi: checkInAbi,
    functionName: "lastCheckInDay",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(contractAddress && address && isConnected) },
  });

  const { data: streak } = useReadContract({
    address: contractAddress ?? undefined,
    abi: checkInAbi,
    functionName: "streak",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(contractAddress && address && isConnected) },
  });

  const today = calendarDayIndex(Date.now());
  const zero = BigInt(0);
  const one = BigInt(1);
  const lastDay =
    rawLast === undefined || rawLast === zero ? null : rawLast - one;
  const alreadyToday = lastDay !== null && lastDay === today;
  const canCheckToday = lastDay === null || lastDay < today;

  async function onCheckIn() {
    if (!contractAddress || !address) return;
    resetWrite();
    if (chainId !== base.id) {
      await switchChainAsync({ chainId: base.id });
    }
    const suffix = getBuilderDataSuffix();
    await writeContractAsync({
      address: contractAddress,
      abi: checkInAbi,
      functionName: "checkIn",
      chainId: base.id,
      ...(suffix ? { dataSuffix: suffix } : {}),
    });
  }

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-cyan-500/20 bg-black/30 p-4 text-sm text-cyan-100/70">
        Connect your wallet on Base to use the daily check-in.
      </div>
    );
  }

  if (!contractAddress) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-100/80">
        Set{" "}
        <code className="text-amber-200">NEXT_PUBLIC_CHECK_IN_CONTRACT_ADDRESS</code>{" "}
        after deploying the contract.
      </div>
    );
  }

  return (
    <div className="neon-border rounded-2xl bg-black/35 p-4">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-fuchsia-200/90">
        Daily check-in (Base)
      </h3>
      <p className="mb-3 text-xs text-cyan-100/60">
        One check-in per calendar day. You only pay L2 gas — no fee to the
        contract.
      </p>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-cyan-100/80">
        <span>Streak: {streak !== undefined ? String(streak) : "—"}</span>
        <span>
          Status:{" "}
          {alreadyToday
            ? "Already checked in today"
            : canCheckToday
              ? "Ready"
              : "—"}
        </span>
      </div>
      <button
        type="button"
        disabled={!canCheckToday || alreadyToday || writing || switching}
        onClick={() => void onCheckIn()}
        className="w-full rounded-xl bg-gradient-to-r from-cyan-600/80 to-fuchsia-600/80 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(34,211,238,0.25)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {writing || switching ? "Confirm in wallet…" : "Check in on-chain"}
      </button>
      {writeError ? (
        <p className="mt-2 text-xs text-red-300/90">{writeError.message}</p>
      ) : null}
    </div>
  );
}
