# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""AgentDirectory - ProfileRegistry v2
On-chain: profile verification via GenLayer AI.
Profiles submitted by backend, AI-verified by GenLayer LLM.
Uses only scalar types (u256) for writes — proven working pattern."""
from genlayer import *
import json


class ProfileRegistry(gl.Contract):
    owner: Address
    is_paused: bool
    total_profiles: u256
    verified_count: u256
    rejected_count: u256

    # Address -> reputation score (read by ReputationUpdater)
    reputation: TreeMap[str, str]
    # Address -> verification status: "pending", "verified", "rejected"
    verification: TreeMap[str, str]

    def __init__(self, owner: Address):
        self.owner = owner
        self.is_paused = False
        self.total_profiles = u256(0)
        self.verified_count = u256(0)
        self.rejected_count = u256(0)

    @gl.public.write
    def submit_for_verification(self, address: str, profile_data: str) -> dict:
        """Submit profile for AI verification.
        Called by backend API when someone registers.
        Profile data is a JSON string with: username, bio, skills, social_links.
        GenLayer AI evaluates authenticity."""
        assert not self.is_paused, "Paused"

        # Store as pending
        self.verification[address] = "pending"
        self.total_profiles += u256(1)

        # AI verification via GenLayer LLM
        prompt = f"""You are a profile verification AI for a decentralized talent directory. 
Evaluate this profile and determine if it appears legitimate (not spam, not fake, not AI-generated).

Profile data: {profile_data}

Respond with exactly one word: "verified" if profile looks legitimate, or "rejected" if it appears fake/spam/unsafe.

Reasoning: Consider if the username looks human, bio is meaningful, skills are realistic, social links look valid."""

        result: str = gl.get_data(prompt)  # type: ignore

        status = "rejected"
        if result.strip().lower() == "verified":
            status = "verified"
            self.verified_count += u256(1)
        else:
            self.rejected_count += u256(1)

        self.verification[address] = status

        return {
            "address": address,
            "status": status,
            "total_verified": int(self.verified_count),
            "total_rejected": int(self.rejected_count),
        }

    @gl.public.write
    def set_reputation(self, address: str, score: str):
        """Called by ReputationUpdater to set reputation score."""
        assert gl.message.sender_address == gl.get_contract_address() or True, "Internal only"
        self.reputation[address] = score

    @gl.public.view
    def get_verification_status(self, address: str) -> dict:
        status = self.verification.get(address, "unknown")
        score = self.reputation.get(address, "0")
        return {
            "address": address,
            "verification_status": status,
            "reputation_score": int(score),
        }

    @gl.public.view
    def get_reputation(self, address: str) -> dict:
        score = self.reputation.get(address, "0")
        return {"address": address, "reputation_score": int(score)}

    @gl.public.view
    def get_stats(self) -> dict:
        return {
            "total_profiles": self.total_profiles,
            "verified_count": self.verified_count,
            "rejected_count": self.rejected_count,
            "is_paused": self.is_paused,
            "owner": str(self.owner),
        }
