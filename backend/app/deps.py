from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models import LogAtividade, Sessao, Tenant, Usuario
from app.services.license import sincronizar_status
from app.utils import new_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_current_user(db: Session = Depends(get_db), token: str | None = Depends(oauth2_scheme)) -> Usuario:
    # MODO SEM LOGIN - retorna usuário master mock
    usuario = db.query(Usuario).filter(Usuario.perfil == "master", Usuario.ativo.is_(True)).first()
    if not usuario:
        # Cria usuário master mock se não existir
        tenant = db.query(Tenant).first()
        if not tenant:
            tenant = Tenant(nome="Sede Sorocaba", slug="sede-sorocaba", ativo=True)
            db.add(tenant)
            db.flush()
        usuario = Usuario(
            id="master-mock",
            tenant_id=tenant.id,
            email="admin@kairos.app",
            nome="Administrador",
            perfil="master",
            ativo=True,
            senha_hash="$2b$12$mock"
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
    return usuario

def require_roles(*perfis: str):
    def _check(cu: Usuario = Depends(get_current_user)) -> Usuario:
        # MODO SEM LOGIN - sempre permite
        return cu
    return _check

require_master = require_roles("master")
require_admin = require_roles("master", "admin")

def congregacao_filter(cu: Usuario = Depends(get_current_user)) -> str | None:
    if cu.perfil in ("cliente", "pastor"):
        return cu.congregacao_id
    return None

def require_active_license(db: Session = Depends(get_db), cu: Usuario = Depends(get_current_user)) -> Usuario:
    # MODO SEM LOGIN - ignora verificação de licença
    return cu

def log_activity(db: Session, tenant_id: int, usuario_id: str | None, acao: str,
                  detalhes: str | None = None, request: Request | None = None) -> None:
    ip = request.client.host if request and request.client else None
    db.add(LogAtividade(id=new_id(), tenant_id=tenant_id, usuario_id=usuario_id,
                         acao=acao, detalhes=detalhes, ip=ip))
    db.commit()
