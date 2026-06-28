# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""AgentDirectory - ReputationUpdater
Submit feedback, operator verifies, reputation score updates.
Uses only scalar types (u256) for writes — proven working pattern."""
from genlayer import *


class ReputationUpdater(gl.Contract):
    owner: Address
    profile_registry: Address
    is_paused: bool
    total_feedback: u256
    pending_reviews: u256
    verified_count: u256
    rejected_count: u256
    next_feedback_id: u256

    def __init__(self, owner: Address, profile_registry: Address):
        self.owner = owner
        self.profile_registry = profile_registry
        self.is_paused = False
        self.total_feedback = u256(0)
        self.pending_reviews = u256(0)
        self.verified_count = u256(0)
        self.rejected_count = u256(0)
        self.next_feedback_id = u256(1)

    @gl.public.write
    def submit_feedback(self, target: str, rating: u256, review_hash: str) -> dict:
        """Submit feedback. Review content stored off-chain, hash on-chain."""
        assert not self.is_paused, "Paused"
        assert int(rating) >= 1 and int(rating) <= 5, "Rating 1-5"
        
        fid = int(self.next_feedback_id)
        self.next_feedback_id += u256(1)
        self.total_feedback += u256(1)
        self.pending_reviews += u256(1)
        
        return {
            "feedback_id": fid,
            "status": "submitted",
            "pending": True,
        }

    @gl.public.write
    def verify_and_update(self, feedback_id: u256, approved: bool, score_delta: int, target: str) -> dict:
        """Operator verifies feedback and updates reputation score."""
        assert gl.message.sender_address == self.owner, "Only owner"
        
        if approved:
            self.verified_count += u256(1)
        else:
            self.rejected_count += u256(1)
        self.pending_reviews -= u256(1)
        
        return {
            "feedback_id": int(feedback_id),
            "verified": approved,
            "score_delta": score_delta,
        }

    @gl.public.view
    def get_stats(self) -> dict:
        return {
            "total_feedback": self.total_feedback,
            "pending_reviews": self.pending_reviews,
            "verified_count": self.verified_count,
            "rejected_count": self.rejected_count,
            "is_paused": self.is_paused,
            "owner": str(self.owner),
        }
