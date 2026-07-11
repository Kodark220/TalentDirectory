# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
"""AgentDirectory - ProfileRegistry v2 (AI verification)
On-chain profile verification using GenLayer AI."""
from genlayer import *


class ProfileRegistry(gl.Contract):
    owner: Address
    is_paused: bool
    total_profiles: u256
    verified_count: u256
    rejected_count: u256

    def __init__(self, owner: Address):
        self.owner = owner
        self.is_paused = False
        self.total_profiles = u256(0)
        self.verified_count = u256(0)
        self.rejected_count = u256(0)

    @gl.public.write
    def submit_for_verification(self, address: str, profile_data: str) -> dict:
        assert not self.is_paused, "Paused"
        self.total_profiles += u256(1)

        result: str = gl.get_data(
            "You are a profile verifier. Reply exactly: 'verified' if the profile looks legitimate, "
            "'rejected' if it looks fake or spam. Profile: " + profile_data
        )

        status = "rejected" if result.strip().lower() != "verified" else "verified"
        if status == "verified":
            self.verified_count += u256(1)
        else:
            self.rejected_count += u256(1)

        return {
            "address": address,
            "status": status,
            "verified_count": int(self.verified_count),
            "rejected_count": int(self.rejected_count),
        }

    @gl.public.view
    def get_stats(self) -> dict:
        return {
            "total_profiles": int(self.total_profiles),
            "verified_count": int(self.verified_count),
            "rejected_count": int(self.rejected_count),
            "is_paused": self.is_paused,
            "owner": str(self.owner),
        }
