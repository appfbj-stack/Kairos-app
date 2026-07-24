import json
import os
import threading
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from app.core.config import settings
from app.core.database import get_db
from app.deps import get_current_user, log_activity, require_admin
from app.models import Congregacao, ImportacaoLog, Membro, Usuario
from app.services.importacao import (
    BATCH_SIZE, detectar_formato, executar_importacao, ler_csv, ler_excel, ler_pdf,
    mapear_campos_ia, processar_em_segundo_plano, salvar_linhas_em_arquivo,
    validar_preview, desfazer_por_importacao,
)
from app.utils import new_id

router = APIRouter(prefix="/importacao", tags=["importacao"])

class ConfirmarMapeamentoIn(BaseModel):
    sessao_id: str
    mapeamento: dict
    congregacao_id: str

class ExecutarImportacaoIn(BaseModel):
    sessao_id: str
    mapeamento: dict
    congregacao_id: str
    decisoes_duplicados: dict = {}

_sessoes: dict = {}

@router.post("/analisar")
async def analisar(
    arquivo: UploadFile = File(...),
    congregacao_id: str = Form(...),
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    conteudo = await arquivo.read()
    if len(conteudo) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Arquivo muito grande. Maximo 20MB.")

    formato = detectar_formato(arquivo.filename or "", arquivo.content_type or "")

    try:
        if formato == "excel":
            colunas, linhas = ler_excel(conteudo)
        elif formato == "pdf":
            colunas, linhas = ler_pdf(conteudo)
        else:
            colunas, linhas = ler_csv(conteudo)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao ler arquivo: {str(e)}")

    if not linhas:
        raise HTTPException(status_code=400, detail="Arquivo vazio ou sem dados reconheciveis.")

    mapeamento = await mapear_campos_ia(colunas, linhas[:5])

    cong = db.query(Congregacao).filter(
        Congregacao.id == congregacao_id, Congregacao.tenant_id == cu.tenant_id
    ).first()
    if not cong:
        raise HTTPException(status_code=404, detail="Congregacao nao encontrada.")

    sessao_id = new_id()
    _sessoes[sessao_id] = {
        "linhas": linhas,
        "colunas": colunas,
        "mapeamento": mapeamento,
        "congregacao_id": congregacao_id,
        "nome_arquivo": arquivo.filename,
        "formato": formato,
        "tenant_id": cu.tenant_id,
        "usuario_id": cu.id,
    }

    return {
        "sessao_id": sessao_id,
        "total_linhas": len(linhas),
        "colunas": colunas,
        "mapeamento_sugerido": mapeamento,
        "amostra": linhas[:5],
        "formato": formato,
        "congregacao": {"id": cong.id, "nome": cong.nome},
    }

@router.post("/preview")
def preview(
    payload: ConfirmarMapeamentoIn,
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    sessao = _sessoes.get(payload.sessao_id)
    if not sessao or sessao["tenant_id"] != cu.tenant_id:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada ou expirada.")

    sessao["mapeamento"] = payload.mapeamento
    sessao["congregacao_id"] = payload.congregacao_id

    resultado = validar_preview(
        sessao["linhas"],
        payload.mapeamento,
        payload.congregacao_id,
        cu.tenant_id,
        db,
    )
    return resultado

@router.post("/executar")
def executar(
    payload: ExecutarImportacaoIn,
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    sessao = _sessoes.get(payload.sessao_id)
    if not sessao or sessao["tenant_id"] != cu.tenant_id:
        raise HTTPException(status_code=404, detail="Sessao nao encontrada ou expirada.")

    resultado = executar_importacao(
        linhas=sessao["linhas"],
        mapeamento=payload.mapeamento,
        congregacao_id=payload.congregacao_id,
        tenant_id=cu.tenant_id,
        usuario_id=cu.id,
        nome_arquivo=sessao.get("nome_arquivo", "arquivo"),
        formato=sessao.get("formato", "csv"),
        decisoes_duplicados=payload.decisoes_duplicados,
        db=db,
    )

    _sessoes.pop(payload.sessao_id, None)
    log_activity(db, cu.tenant_id, cu.id, "importacao.executar",
                 f"Importou {resultado['importados']} membros de {sessao.get('nome_arquivo','')}")
    return resultado

@router.post("/agendar")
async def agendar(
    arquivo: UploadFile = File(...),
    congregacao_id: str = Form(...),
    mapeamento_json: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    conteudo = await arquivo.read()
    if len(conteudo) > 100 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Arquivo muito grande. Maximo 100MB.")

    formato = detectar_formato(arquivo.filename or "", arquivo.content_type or "")

    try:
        if formato == "excel":
            colunas, linhas = ler_excel(conteudo)
        elif formato == "pdf":
            colunas, linhas = ler_pdf(conteudo)
        else:
            colunas, linhas = ler_csv(conteudo)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao ler arquivo: {str(e)}")

    if not linhas:
        raise HTTPException(status_code=400, detail="Arquivo vazio ou sem dados reconheciveis.")

    if mapeamento_json:
        mapeamento = json.loads(mapeamento_json)
    else:
        mapeamento = await mapear_campos_ia(colunas, linhas[:5])

    cong = db.query(Congregacao).filter(
        Congregacao.id == congregacao_id, Congregacao.tenant_id == cu.tenant_id
    ).first()
    if not cong:
        raise HTTPException(status_code=404, detail="Congregacao nao encontrada.")

    importacao_id = new_id()
    storage_dir = f"{settings.STORAGE_DIR}/importacao"
    storage_path = f"{storage_dir}/{importacao_id}.json"
    salvar_linhas_em_arquivo(linhas, storage_path)

    log = ImportacaoLog(
        id=importacao_id,
        tenant_id=cu.tenant_id,
        usuario_id=cu.id,
        nome_arquivo=arquivo.filename or "arquivo",
        formato=formato,
        status="pendente",
        total_linhas=len(linhas),
        mapeamento=mapeamento,
        storage_path=storage_path,
    )
    db.add(log)
    db.commit()

    decisoes_duplicados = {}
    thread = threading.Thread(
        target=processar_em_segundo_plano,
        args=(importacao_id, storage_path, mapeamento, congregacao_id, cu.tenant_id, decisoes_duplicados),
        daemon=True,
    )
    thread.start()

    return {
        "importacao_id": importacao_id,
        "total_linhas": len(linhas),
        "colunas": colunas,
        "mapeamento_sugerido": mapeamento,
        "formato": formato,
        "congregacao": {"id": cong.id, "nome": cong.nome},
    }

@router.get("/{importacao_id}/status")
def status_importacao(
    importacao_id: str,
    db: Session = Depends(get_db),
    cu: Usuario = Depends(get_current_user),
):
    log = db.query(ImportacaoLog).filter(
        ImportacaoLog.id == importacao_id,
        ImportacaoLog.tenant_id == cu.tenant_id,
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Importacao nao encontrada.")

    return {
        "id": log.id,
        "status": log.status,
        "total_linhas": log.total_linhas,
        "processados": log.processados,
        "importados": log.importados,
        "duplicados": log.duplicados,
        "com_erro": log.com_erro,
        "erros": log.erros[-20:] if log.erros else [],
        "pode_desfazer": log.pode_desfazer,
        "criado_em": log.criado_em.isoformat() if log.criado_em else None,
        "concluido_em": log.concluido_em.isoformat() if log.concluido_em else None,
    }

@router.get("/historico")
def historico(
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    logs = db.query(ImportacaoLog).filter(
        ImportacaoLog.tenant_id == cu.tenant_id
    ).order_by(ImportacaoLog.criado_em.desc()).limit(20).all()

    return [
        {
            "id": log.id,
            "nome_arquivo": log.nome_arquivo,
            "formato": log.formato,
            "status": log.status,
            "total_linhas": log.total_linhas,
            "processados": log.processados,
            "importados": log.importados,
            "duplicados": log.duplicados,
            "com_erro": log.com_erro,
            "pode_desfazer": log.pode_desfazer,
            "criado_em": log.criado_em,
            "concluido_em": log.concluido_em,
        }
        for log in logs
    ]

@router.post("/desfazer/{importacao_id}")
def desfazer(
    importacao_id: str,
    request: Request = None,
    db: Session = Depends(get_db),
    cu: Usuario = Depends(require_admin),
):
    log = db.query(ImportacaoLog).filter(
        ImportacaoLog.id == importacao_id,
        ImportacaoLog.tenant_id == cu.tenant_id,
    ).first()

    if not log:
        raise HTTPException(status_code=404, detail="Importacao nao encontrada.")
    if not log.pode_desfazer:
        raise HTTPException(status_code=400, detail="Esta importacao nao pode mais ser desfeita.")

    resultado = desfazer_por_importacao(importacao_id, db)

    log_activity(db, cu.tenant_id, cu.id, "importacao.desfazer",
                 f"Desfez importacao {importacao_id}: {resultado['removidos']} membros removidos")

    return {"ok": True, "removidos": resultado["removidos"], "mensagem": f"{resultado['removidos']} membros removidos com sucesso."}
