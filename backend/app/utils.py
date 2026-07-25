import hashlib
import secrets
import uuid
from datetime import date, datetime, timezone

def new_id() -> str:
    return str(uuid.uuid4())

def new_token() -> tuple[str, str]:
    """Retorna (token_em_texto_puro, hash_para_armazenar)."""
    token = secrets.token_urlsafe(32)
    return token, hash_token(token)

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def parse_date(value: str | None) -> date | None:
    if not value:
        return None
    value = value[:10].strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%Y/%m/%d", "%m/%d/%Y"):
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None

def parse_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value)

def as_aware_utc(value: datetime | None) -> datetime | None:
    """SQLite descarta o timezone ao persistir; normaliza para UTC-aware antes de comparar."""
    if value is None:
        return None
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
