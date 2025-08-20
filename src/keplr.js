import { SigningStargateClient } from "@cosmjs/stargate";

export async function connectWallet() {
  if (!window.keplr) {
    alert("Please install Keplr extension");
    return null;
  }

  // ✅ Use Andromeda Testnet
  const chainId = "galileo-3";  
  const rpcEndpoint = "https://api.andromedaprotocol.io/rpc/testnet";

  // Request Keplr to enable the chain
  await window.keplr.enable(chainId);

  // Get offline signer (signs transactions)
  const offlineSigner = window.getOfflineSigner(chainId);

  // Get account info (address, pubkey)
  const accounts = await offlineSigner.getAccounts();

  // Connect Stargate client with signer
  const client = await SigningStargateClient.connectWithSigner(
    rpcEndpoint,
    offlineSigner
  );

  // Return both client (for tx) + address (for UI)
  return { client, address: accounts[0].address };
}
