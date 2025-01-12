export const config = {
  // ... existing config
  contract: {
    address: process.env.CONTRACT_ADDRESS,
    network: process.env.ETHEREUM_NETWORK,
  },
  zkProof: {
    wasmPath: "circuits/GameStats_js/GameStats.wasm",
    zkeyPath: "circuits/GameStats_0001.zkey",
  },
  solana: {
    programId: process.env.PROGRAM_ID,
    cluster: process.env.SOLANA_CLUSTER || "mainnet-beta",
    rpcUrl: process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  },
};
