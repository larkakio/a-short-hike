import { Attribution } from "ox/erc8021";
import type { Hex } from "viem";

/** ERC-8021 suffix for check-in txs (Base builder code). */
export function getBuilderDataSuffix(): Hex | undefined {
  const override = process.env.NEXT_PUBLIC_BUILDER_CODE_SUFFIX as Hex | undefined;
  if (override?.startsWith("0x")) return override;

  const code = process.env.NEXT_PUBLIC_BUILDER_CODE?.trim();
  if (!code) return undefined;

  return Attribution.toDataSuffix({ codes: [code] });
}
