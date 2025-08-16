import { createConfig, http } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { getDefaultConfig } from "connectkit"

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

export const config = createConfig(
  getDefaultConfig({
    chains: [mainnet, sepolia],
    transports: {
      [mainnet.id]: alchemyApiKey
        ? http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`)
        : http(),
      [sepolia.id]: alchemyApiKey
        ? http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`)
        : http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
    appName: "Emerge",
    appDescription: "Your Web3 App with ConnectKit",
    appUrl: "https://emerge.app",
    appIcon: "https://emerge.app/logo.png",
  })
)
