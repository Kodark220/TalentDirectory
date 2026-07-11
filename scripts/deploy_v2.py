"""
Deploy ProfileRegistry v2 with AI verification.
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
    print(f"  ⚠️  {label}: timed out")
    return None


def main():
    account = create_account(PRIVATE_KEY)
    print(f"Deployer: {account.address}")

    client = create_client(chain=testnet_bradbury, account=account)

    # Deploy ProfileRegistry v2
    print("\n=== Deploying ProfileRegistry v2 ===")
    with open(os.path.join(CONTRACTS_DIR, "ProfileRegistry_v2.py"), "r") as f:
        code = f.read()

    tx_hash = client.deploy_contract(code=code, args=[account.address])
    print(f"Tx: {tx_hash}")
    receipt = wait_for_tx(client, tx_hash, label="ProfileRegistry v2")

    if receipt:
        addr = None
        tx_data = receipt.get("txDataDecoded", {})
        if tx_data and tx_data.get("contractAddress"):
            addr = tx_data["contractAddress"]
        elif receipt.get("recipient"):
            addr = receipt["recipient"]

        if addr:
            print(f"\n✅ ProfileRegistry v2 deployed at: {addr}")
            print(f"\n📝 Update frontend/src/lib/genlayer.ts:")
            print(f"  profileRegistry: '{addr}'")
            print(f"\n📝 Set env var for backend:")
            print(f"  PROFILE_REGISTRY_ADDRESS={addr}")

            # Save
            out = {"profileRegistryV2": addr}
            out_path = os.path.join(CONTRACTS_DIR, "deployed_addresses_v2.json")
            with open(out_path, "w") as f:
                json.dump(out, f, indent=2)
            print(f"\n📄 Saved to {out_path}")
        else:
            print(f"⚠️  Could not extract address")
    else:
        print("❌ Deploy failed")


if __name__ == "__main__":
    main()
