from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.deps import get_current_user
from app.models import Usuario
from app.services.tools import execute_tool, get_tool_defs, ToolContext

router = APIRouter(tags=["tools"])


@router.post("/handler/{tool_name}")
async def handle_tool(
    tool_name: str,
    args: dict,
    db: Session = Depends(get_db),
    cu: Usuario = Depends(get_current_user),
):
    ctx = ToolContext(db=db, tenant_id=cu.tenant_id, usuario_id=cu.id, perfil=cu.perfil)
    result = execute_tool(tool_name, args or {}, ctx)
    return {"status": "ok", "result": result}


@router.get("/defs")
async def list_tool_defs():
    return {"tools": get_tool_defs()}
