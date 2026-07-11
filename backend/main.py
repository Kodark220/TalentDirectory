"""
AgentDirectory — Backend API
FastAPI app with SQLite. Handles profiles, feedback, disputes.
On-chain GenLayer contracts handle reputation scores & case IDs.
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
import json

app = FastAPI(title="AgentDirectory API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.environ.get("DATABASE_URL", "/data/agent_directory.db")

# ─── Database ─────────────────────────────────────────────


def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS profiles (
            address TEXT PRIMARY KEY,
            profile_type TEXT NOT NULL CHECK(profile_type IN ('human','ai_agent')),
            username TEXT UNIQUE NOT NULL,
            bio TEXT DEFAULT '',
            skills TEXT DEFAULT '[]',
            rates TEXT DEFAULT '{}',
            social_links TEXT DEFAULT '{}',
            agent_endpoint TEXT DEFAULT '',
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target TEXT NOT NULL,
            reviewer TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
            review TEXT DEFAULT '',
            evidence_links TEXT DEFAULT '[]',
            verified INTEGER DEFAULT 0,
            score_delta INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS disputes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            claimant TEXT NOT NULL,
            respondent TEXT NOT NULL,
            case_type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT DEFAULT '',
            evidence_links TEXT DEFAULT '[]',
            binding INTEGER DEFAULT 1,
            status TEXT DEFAULT 'filed' CHECK(status IN ('filed','responded','resolved','rejected')),
            verdict TEXT DEFAULT '',
            verdict_text TEXT DEFAULT '',
            rating_adjustment INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            recipient TEXT NOT NULL,
            encrypted_content TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()


# ─── Schemas ──────────────────────────────────────────────


class ProfileCreate(BaseModel):
    address: str
    profile_type: str
    username: str
    bio: str = ""
    skills: str = "[]"
    rates: str = "{}"
    social_links: str = "{}"
    agent_endpoint: str = ""


class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    rates: Optional[str] = None
    social_links: Optional[str] = None
    agent_endpoint: Optional[str] = None


class FeedbackCreate(BaseModel):
    target: str
    reviewer: str
    rating: int
    review: str = ""
    evidence_links: str = "[]"


class DisputeCreate(BaseModel):
    claimant: str
    respondent: str
    case_type: str
    title: str
    description: str = ""
    evidence_links: str = "[]"
    binding: bool = True


class DisputeResponse(BaseModel):
    response_text: str
    evidence_links: str = "[]"


class MessageCreate(BaseModel):
    sender: str
    recipient: str
    encrypted_content: str


# ─── Routes ───────────────────────────────────────────────


@app.get("/api/health")
def health():
    return {"status": "ok"}


# ─── Profiles ───────────────────────


@app.get("/api/profiles")
def list_profiles(search: str = "", profile_type: str = "", offset: int = 0, limit: int = 50):
    conn = get_db()
    query = "SELECT * FROM profiles WHERE is_active = 1"
    params = []
    if search:
        query += " AND (username LIKE ? OR bio LIKE ? OR skills LIKE ?)"
        like = f"%{search}%"
        params.extend([like, like, like])
    if profile_type:
        query += " AND profile_type = ?"
        params.append(profile_type)
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    rows = conn.execute(query, params).fetchall()
    total = conn.execute("SELECT COUNT(*) FROM profiles WHERE is_active=1").fetchone()[0]
    conn.close()
    return {
        "profiles": [dict(r) for r in rows],
        "total": total,
        "offset": offset,
        "limit": limit,
    }


@app.get("/api/profiles/{address}")
def get_profile(address: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM profiles WHERE address = ?", (address,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Profile not found")
    return dict(row)


@app.post("/api/profiles", status_code=201)
def register_profile(profile: ProfileCreate):
    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO profiles (address, profile_type, username, bio, skills, rates, social_links, agent_endpoint)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (profile.address, profile.profile_type, profile.username, profile.bio,
             profile.skills, profile.rates, profile.social_links, profile.agent_endpoint),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM profiles WHERE address = ?", (profile.address,)).fetchone()
        conn.close()
        return dict(row)
    except sqlite3.IntegrityError as e:
        conn.close()
        raise HTTPException(409, f"Profile already exists: {e}")


@app.put("/api/profiles/{address}")
def update_profile(address: str, update: ProfileUpdate):
    conn = get_db()
    existing = conn.execute("SELECT * FROM profiles WHERE address = ?", (address,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(404, "Profile not found")

    fields = {}
    for key in ("username", "bio", "skills", "rates", "social_links", "agent_endpoint"):
        val = getattr(update, key)
        if val is not None:
            fields[key] = val

    if not fields:
        conn.close()
        return dict(existing)

    fields["updated_at"] = "datetime('now')"
    set_clause = ", ".join(f"{k} = ?" if k != "updated_at" else f"{k} = datetime('now')" for k in fields)
    values = [v for k, v in fields.items() if k != "updated_at"]
    values.append(address)
    conn.execute(f"UPDATE profiles SET {set_clause} WHERE address = ?", values)
    conn.commit()
    row = conn.execute("SELECT * FROM profiles WHERE address = ?", (address,)).fetchone()
    conn.close()
    return dict(row)


@app.delete("/api/profiles/{address}")
def deactivate_profile(address: str):
    conn = get_db()
    conn.execute("UPDATE profiles SET is_active = 0, updated_at = datetime('now') WHERE address = ?", (address,))
    conn.commit()
    conn.close()
    return {"status": "deactivated"}


# ─── Feedback ───────────────────────


@app.get("/api/feedback")
def list_feedback(target: str = "", offset: int = 0, limit: int = 50):
    conn = get_db()
    query = "SELECT * FROM feedback"
    params = []
    if target:
        query += " WHERE target = ?"
        params.append(target)
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    rows = conn.execute(query, params).fetchall()
    total = conn.execute("SELECT COUNT(*) FROM feedback" + (" WHERE target=?" if target else ""), params[:1] if target else []).fetchone()[0]
    conn.close()
    return {"feedback": [dict(r) for r in rows], "total": total}


@app.post("/api/feedback", status_code=201)
def submit_feedback(fb: FeedbackCreate):
    conn = get_db()
    conn.execute(
        """INSERT INTO feedback (target, reviewer, rating, review, evidence_links)
           VALUES (?, ?, ?, ?, ?)""",
        (fb.target, fb.reviewer, fb.rating, fb.review, fb.evidence_links),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM feedback ORDER BY id DESC LIMIT 1").fetchone()
    conn.close()
    return dict(row)


# ─── Disputes ───────────────────────


@app.get("/api/disputes")
def list_disputes(address: str = "", offset: int = 0, limit: int = 50):
    conn = get_db()
    query = "SELECT * FROM disputes"
    params = []
    if address:
        query += " WHERE claimant = ? OR respondent = ?"
        params.extend([address, address])
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return {"disputes": [dict(r) for r in rows]}


@app.post("/api/disputes", status_code=201)
def file_dispute(d: DisputeCreate):
    conn = get_db()
    conn.execute(
        """INSERT INTO disputes (claimant, respondent, case_type, title, description, evidence_links, binding, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'filed')""",
        (d.claimant, d.respondent, d.case_type, d.title, d.description, d.evidence_links, int(d.binding)),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM disputes ORDER BY id DESC LIMIT 1").fetchone()
    conn.close()
    return dict(row)


@app.get("/api/disputes/{case_id}")
def get_dispute(case_id: int):
    conn = get_db()
    row = conn.execute("SELECT * FROM disputes WHERE id = ?", (case_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(404, "Dispute not found")
    return dict(row)


@app.post("/api/disputes/{case_id}/respond")
def respond_to_dispute(case_id: int, resp: DisputeResponse):
    conn = get_db()
    existing = conn.execute("SELECT * FROM disputes WHERE id = ?", (case_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(404, "Dispute not found")
    conn.execute(
        "UPDATE disputes SET status='responded', updated_at=datetime('now') WHERE id=?",
        (case_id,),
    )
    conn.commit()
    conn.close()
    return {"status": "responded"}


@app.post("/api/disputes/{case_id}/resolve")
def resolve_dispute(case_id: int, verdict: str, verdict_text: str = "", rating_adjustment: int = 0):
    conn = get_db()
    existing = conn.execute("SELECT * FROM disputes WHERE id = ?", (case_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(404, "Dispute not found")
    conn.execute(
        """UPDATE disputes SET status='resolved', verdict=?, verdict_text=?, rating_adjustment=?, updated_at=datetime('now') WHERE id=?""",
        (verdict, verdict_text, rating_adjustment, case_id),
    )
    conn.commit()
    conn.close()
    return {"status": "resolved", "verdict": verdict}


# ─── Messages ───────────────────────


@app.get("/api/messages/{address}")
def get_messages(address: str):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM messages WHERE recipient = ? ORDER BY created_at DESC LIMIT 100",
        (address,),
    ).fetchall()
    conn.close()
    return {"messages": [dict(r) for r in rows]}


@app.get("/api/messages/{address}/unread")
def get_unread_count(address: str):
    conn = get_db()
    count = conn.execute(
        "SELECT COUNT(*) FROM messages WHERE recipient = ? AND is_read = 0",
        (address,),
    ).fetchone()[0]
    conn.close()
    return {"unread": count}


@app.post("/api/messages", status_code=201)
def send_message(msg: MessageCreate):
    conn = get_db()
    conn.execute(
        "INSERT INTO messages (sender, recipient, encrypted_content) VALUES (?, ?, ?)",
        (msg.sender, msg.recipient, msg.encrypted_content),
    )
    conn.commit()
    row = conn.execute("SELECT * FROM messages ORDER BY id DESC LIMIT 1").fetchone()
    conn.close()
    return dict(row)


@app.post("/api/messages/{message_id}/read")
def mark_message_read(message_id: int):
    conn = get_db()
    conn.execute("UPDATE messages SET is_read = 1 WHERE id = ?", (message_id,))
    conn.commit()
    conn.close()
    return {"status": "read"}


# ─── Start ─────────────────────────

init_db()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
