import { readFileSync } from "fs";
import path from "path";
import { GenLayerClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { createWalletClient } from "genlayer-js/clients";

/**
 * Deploy all 3 AgentDirectory contracts to GenLayer Bradbury Testnet.
 *
 * Usage:
 *   GENLAYER_PRIVATE_KEY=your_key_here npx tsx deploy_agent_directory.ts
 *
 * The private key should WITHOUT the 0x prefix.
 */

const PRIVATE_KEY = process.env.GENLAYER_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.error("❌ GENLAYER_PRIVATE_KEY not set");
  console.error("   Usage: GENLAYER_PRIVATE_KEY=your_key npx tsx deploy_agent_directory.ts");
  process.exit(1);
}

async function deployContract(name: string, filePath: string, args: any[], client: GenLayerClient<any>): Promise<string> {
  console.log(`\n📦 Deploying ${name}...`);
  console.log(`   Source: ${filePath}`);

  const contractCode = new Uint8Array(readFileSync(filePath));

  const txHash = await client.deployContract({
    code: contractCode,
    args: args,
  });

  console.log(`   ⏳ Tx: ${txHash}`);
  console.log("   Waiting for confirmation...");

  const receipt = await client.waitForTransactionReceipt({
    hash: txHash as `0x${string}`,
    retries: 200,
  });

  const statusName = receipt.statusName;
  if (statusName !== "ACCEPTED" && statusName !== "FINALIZED") {
    throw new Error(`${name} deployment failed. Status: ${statusName}. Receipt: ${JSON.stringify(receipt)}`);
  }

  // Extract contract address from txDataDecoded
  const addr = (receipt.txDataDecoded as any)?.contractAddress || receipt.data?.contract_address;
  if (!addr) {
    console.warn(`⚠️  Could not extract address for ${name}`);
    console.log("   Raw receipt:", JSON.stringify(receipt, null, 2));
    throw new Error(`Address extraction failed for ${name}`);
  }

  console.log(`   ✅ ${name} deployed at: ${addr}`);
  return addr;
}

async function main() {
  console.log("🚀 Deploying AgentDirectory contracts to Bradbury Testnet...");
  console.log("   Network: https://rpc-bradbury.genlayer.com");
  console.log("   Chain ID: 4221\n");

  // Create client
  const walletClient = createWalletClient({
    privateKey: PRIVATE_KEY,
    chain: testnetBradbury,
  });

  const client = new GenLayerClient({
    client: walletClient,
    chain: testnetBradbury,
  });

  await client.initializeConsensusSmartContract();

  const contractDir = path.resolve(process.cwd(), "contracts");

  // 1. Deploy ProfileRegistry first
  const profileRegistry = await deployContract(
    "ProfileRegistry",
    path.join(contractDir, "ProfileRegistry.py"),
    [walletClient.account.address],
    client
  );

  // 2. Deploy ReputationUpdater
  const reputationUpdater = await deployContract(
    "ReputationUpdater",
    path.join(contractDir, "ReputationUpdater.py"),
    [walletClient.account.address, profileRegistry],
    client
  );

  // 3. Deploy DisputeArbitrator
  const disputeArbitrator = await deployContract(
    "DisputeArbitrator",
    path.join(contractDir, "DisputeArbitrator.py"),
    [walletClient.account.address, profileRegistry, reputationUpdater],
    client
  );

  console.log("\n" + "=".repeat(50));
  console.log("✅ ALL CONTRACTS DEPLOYED SUCCESSFULLY");
  console.log("=".repeat(50));
  console.log(`\nProfileRegistry:     ${profileRegistry}`);
  console.log(`ReputationUpdater:   ${reputationUpdater}`);
  console.log(`DisputeArbitrator:   ${disputeArbitrator}`);

  console.log("\n📝 Update frontend/src/lib/genlayer.ts:");
  console.log(`\nexport const CONTRACT_ADDRESSES = {`);
  console.log(`  profileRegistry:     '${profileRegistry}',`);
  console.log(`  reputationUpdater:   '${reputationUpdater}',`);
  console.log(`  disputeArbitrator:   '${disputeArbitrator}',`);
  console.log(`};\n`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
