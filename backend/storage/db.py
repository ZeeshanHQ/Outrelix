import logging
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

logger = logging.getLogger(__name__)


DB_PATH = Path("data/leads.db")
DEDUP_DB_PATH = Path("data/dedupe.db")


def ensure_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              full_name TEXT,
              role TEXT,
              company TEXT,
              email TEXT,
              phone TEXT,
              website TEXT,
              source TEXT,
              confidence REAL
            );
            """
        )
        conn.commit()


def ensure_dedupe_db() -> None:
    """Ensure dedupe database exists."""
    DEDUP_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DEDUP_DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS seen (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              domain TEXT,
              phone TEXT,
              email TEXT,
              first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              UNIQUE(domain, phone, email)
            );
            """
        )
        conn.commit()


@contextmanager
def db_conn():
    ensure_db()
    conn = sqlite3.connect(DB_PATH)
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def dedupe_conn():
    ensure_dedupe_db()
    conn = sqlite3.connect(DEDUP_DB_PATH)
    try:
        yield conn
    finally:
        conn.close()


def save_leads(rows: Iterable[Tuple[Any, ...]]) -> int:
    with db_conn() as conn:
        cur = conn.executemany(
            "INSERT INTO leads (full_name, role, company, email, phone, website, source, confidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rows,
        )
        conn.commit()
        return cur.rowcount or 0


def fetch_leads(limit: int = 200) -> List[Tuple[Any, ...]]:
    with db_conn() as conn:
        cur = conn.execute("SELECT full_name, role, company, email, phone, website, source, confidence FROM leads ORDER BY id DESC LIMIT ?", (limit,))
        return list(cur.fetchall())


