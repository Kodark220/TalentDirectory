"""
Deploy all 3 AgentDirectory contracts to GenLayer Bradbury Testnet.

Usage:
  python scripts/deploy.py
"""

import sys
import json
import os

from genlayer_py.client import create_client
from genlayer_py.accounts import create_account
from genlayer_py.chains import testnet_bradbury

PRIVATE_KEY = os.environ.get("GENLAYER_PRIVATE_KEY", "5678a4edece8e3ebfc492d01219254ce18b4088ccec7570c789d7680226a38c8")
RPC = "https://rpc-bradbury.genlayer.com"

# If ProfileRegistry is already deployed, set it here to skip redeployment
EXISTING_PROFILE_REGISTRY = "0x8e6E79C98e0473Ba32dF339345744AB2cc95FD9D"


def deploy_contract(client, name: str, filepath: str, args: list) -> str:
    """Deploy a contract and return its address."""
    print(f"\n📦 Deploying {name}...")
    print(f"   Source: {filepath}")
    print(f"   Args: {args}")

    with open(filepath, "r") as f:
        code = f.read()

    tx_hash = client.deploy_contract(code=code, args=args)
    print(f"   ⏳ Tx hash: {tx_hash}")
    print("   Waiting for acceptance...")

    receipt = client.wait_for_transaction_receipt(
        transaction_hash=tx_hash,
        retries=120,
    )

    status = receipt.get("status_name", "") or receipt.get("status", "")
    result = receipt.get("result_name", "")
    print(f"   Status: {status} | Result: {result}")

    contract_address = receipt.get("recipient", None)
    if not contract_address:
        raise Exception(f"Failed to extract address for {name}")

    print(f"   ✅ {name} deployed at: {contract_address}")
    return str(contract_address)


def main():
    account = create_account(account_private_key=PRIVATE_KEY)
    print(f"Deployer address: {account.address}")

    client = create_client(
        chain=testnet_bradbury,
        endpoint=RPC,
        account=account,
    )

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    contracts_dir = os.path.join(base_dir, "contracts")

    # 1. ProfileRegistry (already deployed)
    profile_registry = EXISTING_PROFILE_REGISTRY
    print(f"\n✅ Using existing ProfileRegistry: {profile_registry}")

    # 2. Deploy ReputationUpdater
    rep_updater = deploy_contract(
        client,
        "ReputationUpdater",
        os.path.join(contracts_dir, "ReputationUpdater.py"),
        [str(account.address), profile_registry],
    )

    # 3. Deploy DisputeArbitrator
    dispute_arb = deploy_contract(
        client,
        "DisputeArbitrator",
        os.path.join(contracts_dir, "DisputeArbitrator.py"),
        [str(account.address), profile_registry, rep_updater],
    )

    # Summary
    addresses = {
        "profileRegistry": profile_registry,
        "reputationUpdater": rep_updater,
        "disputeArbitrator": dispute_arb,
    }

    print("\n" + "=" * 50)
    print("✅ ALL CONTRACTS DEPLOYED SUCCESSFULLY")
    print("=" * 50)
    for name, addr in addresses.items():
        print(f"  {name}: {addr}")

    print("\n📝 Update frontend/src/lib/genlayer.ts:\n")
    print(f"export const CONTRACT_ADDRESSES = {{")
    for name, addr in addresses.items():
        print(f"  {name}: '{addr}',")
    print(f"}};")

    print("\n--- JSON ---")
    print(json.dumps(addresses, indent=2))


if __name__ == "__main__":
    main()
