import { http, createConfig, createStorage, cookieStorage } from "wagmi";
import { injected, baseAccount } from "wagmi/connectors";
import { base } from "wagmi/chains";

const connectors = [
  injected(),
  baseAccount({ appName: "Neon Summit Hike" }),
];

export const wagmiConfig = createConfig({
  chains: [base],
  connectors,
  storage: createStorage({ storage: cookieStorage, key: "neon-hike-wagmi" }),
  ssr: true,
  transports: {
    [base.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
