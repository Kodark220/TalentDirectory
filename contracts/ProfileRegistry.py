# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""AgentDirectory - ProfileRegistry (Scalar reputation only)
On-chain: reputation scores per address. Profile data is off-chain."""
from genlayer import *


class ProfileRegistry(gl.Contract):
    owner: Address
    is_paused: bool
    total_profiles: u256
    
    # Address -> reputation score as string (only TreeMap, proven flaky on writes)
    # We use this for reads only; scores are updated by ReputationUpdater
    reputation: TreeMap[str, str]

    def __init__(self, owner: Address):
        self.owner = owner
        self.is_paused = False
        self.total_profiles = u256(0)

    @gl.public.view
    def get_reputation(self, address: str) -> dict:
        score = self.reputation.get(address, "0")
        return {"address": address, "reputation_score": int(score)}

    @gl.public.view
    def get_stats(self) -> dict:
        return {
            "total_profiles": self.total_profiles,
            "is_paused": self.is_paused,
            "owner": str(self.owner),
        }
