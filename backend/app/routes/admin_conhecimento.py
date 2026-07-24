from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.deps import get_current_user, log_activity, require_admin
from app.models import Usuario
from app.services.conhecimento import (
    listar_conhecimento, criar_conhecimento, atualizar_conhecimento,
    deletar_conhecimento, listar_categorias,
)

router = APIRouter(prefix="/admin/assistente-conhecimento", tags=["admin_assistente"])


class ConhecimentoIn(BaseModel):
    titulo: str
    pergunta: str
    resposta: str
    categoria: Optional[str] = None
    tags: Optional[str] = None
    video_url: Optional[str] = None
    imagem_url: Optional[str] = None
    ativo: bool = True


class ConhecimentoOut(ConhecimentoIn):
    id: str
    criado_em: str = ""
    model_config = {"from_attributes": True}


@router.get("")
def listar(
    categoria: Optional[str] = None,
    busca: Optional[str] = None,
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    registros = listar_conhecimento(db, cu, categoria, busca)
    return [
        {
            "id": r.id, "titulo": r.titulo, "pergunta": r.pergunta,
            "resposta": r.resposta, "categoria": r.categoria, "tags": r.tags,
            "video_url": r.video_url, "imagem_url": r.imagem_url,
            "ativo": r.ativo,
            "criado_em": r.criado_em.isoformat() if r.criado_em else "",
        }
        for r in registros
    ]


@router.get("/categorias")
def categorias(
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    return listar_categorias(db, cu)


@router.post("", response_model=ConhecimentoOut, status_code=201)
def criar(
    payload: ConhecimentoIn,
    request: Request,
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    obj = criar_conhecimento(payload.model_dump(), db, cu)
    log_activity(db, cu.tenant_id, cu.id, "conhecimento.criar", f"Criou pergunta: {obj.titulo}", request)
    return obj


@router.put("/{conhecimento_id}")
def atualizar(
    conhecimento_id: str,
    payload: ConhecimentoIn,
    request: Request,
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    obj = atualizar_conhecimento(conhecimento_id, payload.model_dump(exclude_unset=True), db, cu)
    if not obj:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    log_activity(db, cu.tenant_id, cu.id, "conhecimento.atualizar", f"Atualizou: {obj.titulo}", request)
    return {
        "id": obj.id, "titulo": obj.titulo, "pergunta": obj.pergunta,
        "resposta": obj.resposta, "categoria": obj.categoria, "tags": obj.tags,
        "video_url": obj.video_url, "imagem_url": obj.imagem_url,
        "ativo": obj.ativo,
        "criado_em": obj.criado_em.isoformat() if obj.criado_em else "",
    }


@router.delete("/{conhecimento_id}")
def deletar(
    conhecimento_id: str,
    request: Request,
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    if not deletar_conhecimento(conhecimento_id, db, cu):
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    log_activity(db, cu.tenant_id, cu.id, "conhecimento.deletar", f"Removeu conhecimento {conhecimento_id}", request)
    return {"ok": True}
