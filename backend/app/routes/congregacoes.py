from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.core.database import get_db
from app.deps import congregacao_filter, get_current_user, log_activity, require_admin
from app.models import Congregacao, Membro, Usuario
from app.utils import new_id

router = APIRouter(prefix="/congregacoes", tags=["congregacoes"])

class CongregacaoIn(BaseModel):
    nome: str
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    pastor_email: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    status: str = "ativa"

class CongregacaoOut(CongregacaoIn):
    id: str
    total_membros: int = 0
    model_config = {"from_attributes": True}

@router.get("", response_model=list[CongregacaoOut])
def listar(db: Session = Depends(get_db), cu: Usuario = Depends(get_current_user),
           cong_filtro: Optional[str] = Depends(congregacao_filter)):
    q = db.query(Congregacao, func.count(Membro.id).label("total_membros"))\
        .outerjoin(Membro, Membro.congregacao_id == Congregacao.id)\
        .filter(Congregacao.tenant_id == cu.tenant_id)\
        .group_by(Congregacao.id)
    if cong_filtro:
        q = q.filter(Congregacao.id == cong_filtro)
    result = q.order_by(Congregacao.nome).all()
    return [
        CongregacaoOut(
            id=c.id, nome=c.nome, endereco=c.endereco, cidade=c.cidade, estado=c.estado,
            pastor_email=c.pastor_email, telefone=c.telefone, whatsapp=c.whatsapp,
            email=c.email, status=c.status, total_membros=total
        )
        for c, total in result
    ]

@router.get("/{congregacao_id}")
def obter(congregacao_id: str, db: Session = Depends(get_db), cu: Usuario = Depends(get_current_user),
          cong_filtro: Optional[str] = Depends(congregacao_filter)):
    cong = db.query(Congregacao).filter(Congregacao.id == congregacao_id, Congregacao.tenant_id == cu.tenant_id).first()
    if not cong:
        raise HTTPException(status_code=404, detail="Não encontrada")
    if cong_filtro and cong.id != cong_filtro:
        raise HTTPException(status_code=403, detail="Acesso negado")
    total_membros = db.query(func.count(Membro.id)).filter(Membro.congregacao_id == congregacao_id).scalar() or 0
    return {**{k: getattr(cong, k) for k in ("id","nome","endereco","cidade","estado","pastor_email","telefone","whatsapp","email","status")}, "total_membros": total_membros}

@router.post("", response_model=CongregacaoOut, status_code=201)
def criar(payload: CongregacaoIn, request: Request, db: Session = Depends(get_db), cu: Usuario = Depends(require_admin)):
    cong = Congregacao(id=new_id(), tenant_id=cu.tenant_id, **payload.model_dump())
    db.add(cong); db.commit(); db.refresh(cong)
    log_activity(db, cu.tenant_id, cu.id, "congregacao.criar", f"Criou congregação {cong.nome}", request)
    return cong

@router.put("/{congregacao_id}", response_model=CongregacaoOut)
def atualizar(congregacao_id: str, payload: CongregacaoIn, request: Request,
              db: Session = Depends(get_db), cu: Usuario = Depends(require_admin)):
    cong = db.query(Congregacao).filter(Congregacao.id == congregacao_id, Congregacao.tenant_id == cu.tenant_id).first()
    if not cong:
        raise HTTPException(status_code=404, detail="Não encontrada")
    for field, value in payload.model_dump().items():
        setattr(cong, field, value)
    db.commit(); db.refresh(cong)
    log_activity(db, cu.tenant_id, cu.id, "congregacao.atualizar", f"Atualizou congregação {cong.nome}", request)
    return cong

@router.delete("/{congregacao_id}")
def remover(congregacao_id: str, request: Request, db: Session = Depends(get_db), cu: Usuario = Depends(require_admin)):
    cong = db.query(Congregacao).filter(Congregacao.id == congregacao_id, Congregacao.tenant_id == cu.tenant_id).first()
    if not cong:
        raise HTTPException(status_code=404, detail="Não encontrada")
    nome = cong.nome
    db.delete(cong); db.commit()
    log_activity(db, cu.tenant_id, cu.id, "congregacao.remover", f"Removeu congregação {nome}", request)
    return {"ok": True}
