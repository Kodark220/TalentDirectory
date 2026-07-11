"""
Deploy all 3 AgentDirectory contracts to GenLayer Bradbury Testnet.

Usage:
  GENLAYER_PRIVATE_KEY=your_key python3 deploy_all.py
"""
import sys
import json
import os
import time

sys.path.insert(0, os.path.expanduser("~/.local/lib/python3.12/site-packages"))

from genlayer_py import create_account, create_client, testnet_bradbury

PRIVATE_KEY = os.environ.get("GENLAYER_PRIVATE_KEY")
if not PRIVATE_KEY:
    print("❌ GENLAYER_PRIVATE_KEY not set")
    sys.exit(1)

CONTRACTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "contracts")


def wait_for_tx(client, tx_hash, label="", max_retries=120):
    for i in range(max_retries):
        try:
            receipt = client.get_transaction_receipt(tx_hash)
            status = receipt.get("statusName", "")
            result_name = receipt.get("tx_execution_result_name", "")
            tx_data = receipt.get("txDataDecoded", {})

            if status in ("ACCEPTED", "FINALIZED"):
                return receipt
            elif status in ("FAILED", "REJECTED"):
                print(f"  ❌ {label}: {status} | result: {result_name}")
                return receipt
            else:
                if i % 15 == 0:
                    print(f"  ⏳ {label}: {status} (attempt {i+1})")
        except Exception as e:
            if i % 15 == 0:
                print(f"  ⏳ {label}: waiting... ({e})")
        time.sleep(2)
    print(f"  ⚠️  {label}: timed out after {max_retries * 2}s")
    return None


def deploy_and_get_address(client, code_path, args=None, label="Contract"):
    with open(code_path, "r") as f:
        code = f.read()

    print(f"  Deploying {label}...")
    tx_hash = client.deploy_contract(code=code, args=args or [])
    print(f"  Tx: {tx_hash}")

    receipt = wait_for_tx(client, tx_hash, label=label)
    if not receipt:
        return None, tx_hash

    status_name = receipt.get("statusName", "unknown")
    result_name = receipt.get("tx_execution_result_name", "")
    print(f"  Receipt status: {status_name} | result: {result_name}")

    # Extract address
    tx_data = receipt.get("txDataDecoded", {})
    addr = None
    if tx_data and tx_data.get("contractAddress"):
        addr = tx_data["contractAddress"]
    elif receipt.get("recipient"):
        addr = receipt["recipient"]
    elif receipt.get("data", {}).get("contract_address"):
        addr = receipt["data"]["contract_address"]

    if addr:
        print(f"  ✅ {label} deployed at: {addr}")
    else:
        print(f"  ⚠️  Could not extract address from receipt")
        print(f"  Receipt keys: {list(receipt.keys())}")
        if isinstance(tx_data, dict):
            for k, v in tx_data.items():
                print(f"    txData.{k}: {v}")
    return addr, tx_hash


def main():
    account = create_account(PRIVATE_KEY)
    print(f"Deployer address: {account.address}")

    client = create_client(
        chain=testnet_bradbury,
        account=account,
    )

    # ─── 1. ProfileRegistry ───────────────
    print("\n=== Deploying ProfileRegistry ===")
    pr_addr, pr_tx = deploy_and_get_address(
        client,
        os.path.join(CONTRACTS_DIR, "ProfileRegistry.py"),
        args=[account.address],
        label="ProfileRegistry",
    )
    if not pr_addr:
        print("❌ ProfileRegistry deploy failed")
        sys.exit(1)

    print("\n⏳ Waiting 10s for finalization...")
    time.sleep(10)

    # ─── 2. ReputationUpdater ─────────────
    print("\n=== Deploying ReputationUpdater ===")
    rep_addr, rep_tx = deploy_and_get_address(
        client,
        os.path.join(CONTRACTS_DIR, "ReputationUpdater.py"),
        args=[account.address, pr_addr],
        label="ReputationUpdater",
    )
    if not rep_addr:
        print("❌ ReputationUpdater deploy failed")
        sys.exit(1)

    print("\n⏳ Waiting 10s for finalization...")
    time.sleep(10)

    # ─── 3. DisputeArbitrator ─────────────
    print("\n=== Deploying DisputeArbitrator ===")
    disp_addr, disp_tx = deploy_and_get_address(
        client,
        os.path.join(CONTRACTS_DIR, "DisputeArbitrator.py"),
        args=[account.address, pr_addr, rep_addr],
        label="DisputeArbitrator",
    )
    if not disp_addr:
        print("❌ DisputeArbitrator deploy failed")
        sys.exit(1)

    # ─── Summary ──────────────────────────
    addresses = {
        "profileRegistry": pr_addr,
        "reputationUpdater": rep_addr,
        "disputeArbitrator": disp_addr,
    }

    print("\n" + "=" * 50)
    print("✅ DEPLOYMENT COMPLETE")
    print("=" * 50)
    for name, addr in addresses.items():
        print(f"  {name}: {addr}")

    print("\n📝 Update frontend/src/lib/genlayer.ts:\n")
    print(f"export const CONTRACT_ADDRESSES = {{")
    print(f"  profileRegistry: '{pr_addr}',")
    print(f"  reputationUpdater: '{rep_addr}',")
    print(f"  disputeArbitrator: '{disp_addr}',")
    print(f"}};")

    # Save
    out_path = os.path.join(CONTRACTS_DIR, "deployed_addresses.json")
    with open(out_path, "w") as f:
        json.dump(addresses, f, indent=2)
    print(f"\n📄 Addresses saved to: {out_path}")


if __name__ == "__main__":
    main()
