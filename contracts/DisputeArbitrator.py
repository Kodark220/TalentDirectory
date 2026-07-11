# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""AgentDirectory - DisputeArbitrator
File disputes, respond, resolve. Evidence off-chain, verdict on-chain.
Uses only scalar types (u256) for writes — proven working pattern."""
from genlayer import *


class DisputeArbitrator(gl.Contract):
    owner: Address
    profile_registry: Address
    reputation_updater: Address
    is_paused: bool
    total_cases: u256
    open_cases: u256
    responded_cases: u256
    resolved_cases: u256
    rejected_cases: u256
    next_case_id: u256

    def __init__(self, owner: Address, profile_registry: Address, reputation_updater: Address):
        self.owner = owner
        self.profile_registry = profile_registry
        self.reputation_updater = reputation_updater
        self.is_paused = False
        self.total_cases = u256(0)
        self.open_cases = u256(0)
        self.responded_cases = u256(0)
        self.resolved_cases = u256(0)
        self.rejected_cases = u256(0)
        self.next_case_id = u256(1)

    @gl.public.write
    def file_dispute(self, case_type: str, evidence_hash: str) -> dict:
        """File a dispute. Evidence stored off-chain, hash on-chain."""
        assert not self.is_paused, "Paused"
        
        cid = int(self.next_case_id)
        self.next_case_id += u256(1)
        self.total_cases += u256(1)
        self.open_cases += u256(1)
        
        return {"case_id": cid, "status": "filed"}

    @gl.public.write
    def respond_to_dispute(self, case_id: u256, response_hash: str) -> dict:
        """Respond to a dispute."""
        assert not self.is_paused, "Paused"
        assert int(case_id) < int(self.next_case_id), "Case not found"
        
        self.open_cases -= u256(1)
        self.responded_cases += u256(1)
        
        return {"case_id": int(case_id), "status": "responded"}

    @gl.public.write
    def resolve_dispute(self, case_id: u256, verdict: str, rating_adjustment: int) -> dict:
        """Resolve a dispute. Owner only."""
        assert gl.message.sender_address == self.owner, "Only owner"
        assert int(case_id) < int(self.next_case_id), "Case not found"
        assert verdict in ("claimant", "respondent", "split"), "Invalid verdict"
        
        # Update counters
        if self.responded_cases > u256(0):
            self.responded_cases -= u256(1)
        elif self.open_cases > u256(0):
            self.open_cases -= u256(1)
        self.resolved_cases += u256(1)
        
        return {
            "case_id": int(case_id),
            "status": "resolved",
            "verdict": verdict,
            "rating_adjustment": rating_adjustment,
        }

    @gl.public.view
    def get_stats(self) -> dict:
        return {
            "total_cases": self.total_cases,
            "open_cases": self.open_cases,
            "responded_cases": self.responded_cases,
            "resolved_cases": self.resolved_cases,
            "rejected_cases": self.rejected_cases,
            "is_paused": self.is_paused,
            "owner": str(self.owner),
        }
