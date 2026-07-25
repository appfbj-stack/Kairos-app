from __future__ import annotations
import re
from dataclasses import dataclass, field
from datetime import date, datetime, timezone
from typing import Any, Callable

from sqlalchemy.orm import Session
from app.utils import new_id, parse_date

@dataclass
class ToolContext:
    db: Session
    tenant_id: int
    usuario_id: str
    perfil: str

@dataclass
class Tool:
    name: str
    description: str
    parameters: dict
    handler: Callable[[dict, ToolContext], str]
    areas: list[str] = field(default_factory=list)

    def to_openai_def(self) -> dict:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": self.parameters,
            },
        }

_REGISTRY: dict[str, Tool] = {}

def register_tool(tool: Tool) -> None:
    _REGISTRY[tool.name] = tool

def get_tool_defs() -> list[dict]:
    return [t.to_openai_def() for t in _REGISTRY.values()]

def execute_tool(name: str, args: dict, ctx: ToolContext) -> str:
    tool = _REGISTRY.get(name)
    if not tool:
        return f"[erro: ferramenta '{name}' nao existe]"
    try:
        return tool.handler(args or {}, ctx)
    except Exception as e:
        return f"[erro ao executar '{name}': {e}]"

def _buscar_em_documentos(args: dict, ctx: ToolContext) -> str:
    from app.services.rag import search_documents_sync
    query = (args.get("consulta") or "").strip()
    if not query:
        return "[erro: informe o que deseja buscar no parametro 'consulta']"
    results = search_documents_sync(query, ctx.tenant_id, ctx.db, limit=4)
    if not results:
        return "Nenhum trecho relevante encontrado nos documentos."
    partes = []
    for r in results:
        partes.append(f"[{r['nome']} | relevancia {r['relevance']}]\n{r['excerpt']}")
    return "\n\n".join(partes)

def _consultar_metricas_uso(args: dict, ctx: ToolContext) -> str:
    from app.models import MetricaIA
    metricas = ctx.db.query(MetricaIA).filter(MetricaIA.tenant_id == ctx.tenant_id).all()
    if not metricas:
        return "Ainda nao ha metricas registradas."
    total_conv = sum(m.total_conversas for m in metricas)
    total_msg = sum(m.total_mensagens for m in metricas)
    total_tok = sum(m.total_tokens for m in metricas)
    horas = round(sum(m.total_time_saved_seconds for m in metricas) / 3600, 1)
    docs = sum(m.total_docs_processed for m in metricas)
    return (
        f"Uso acumulado: {total_conv} conversas, {total_msg} mensagens, "
        f"{total_tok} tokens, {docs} documentos, ~{horas}h economizadas."
    )

register_tool(Tool(
    name="buscar_em_documentos",
    description="Busca trechos nos documentos enviados pelo cliente (contratos, arquivos). Use quando a pergunta puder ser respondida com base em documentos.",
    parameters={
        "type": "object",
        "properties": {
            "consulta": {
                "type": "string",
                "description": "Termos ou pergunta para buscar nos documentos.",
            }
        },
        "required": ["consulta"],
    },
    handler=_buscar_em_documentos,
))

register_tool(Tool(
    name="consultar_metricas_uso",
    description="Retorna metricas de uso: conversas, mensagens, tokens, documentos e tempo economizado.",
    parameters={"type": "object", "properties": {}},
    handler=_consultar_metricas_uso,
))

def _validar_cpf(cpf: str) -> str:
    cpf = re.sub(r"\D", "", cpf)
    if len(cpf) != 11 or cpf == cpf[0] * 11:
        return "invalido"
    for i in range(9, 11):
        soma = sum(int(cpf[j]) * (i + 1 - j) for j in range(i))
        dig = (soma * 10 % 11) % 11
        if int(cpf[i]) != dig:
            return "invalido"
    return "valido"

def _validar_telefone(telefone: str) -> str:
    nums = re.sub(r"\D", "", telefone)
    if len(nums) < 10 or len(nums) > 13:
        return "invalido"
    if len(nums) == 11 and nums[2] not in ("9", "8"):
        return "formato_incomum"
    return "valido"

def _buscar_membro(args: dict, ctx: ToolContext) -> str:
    from app.models import Membro
    termo = (args.get("nome") or args.get("termo") or "").strip()
    cpf = (args.get("cpf") or "").strip()
    q = ctx.db.query(Membro).filter(Membro.tenant_id == ctx.tenant_id)
    if cpf:
        q = q.filter(Membro.cpf == cpf)
    elif termo:
        q = q.filter(Membro.nome.ilike(f"%{termo}%"))
    else:
        return "[erro: informe nome ou CPF para buscar]"
    membros = q.order_by(Membro.nome).limit(10).all()
    if not membros:
        return "Nenhum membro encontrado."
    linhas = []
    for m in membros:
        linhas.append(
            f"- {m.nome} | CPF: {m.cpf or '-'} | Tel: {m.telefone or '-'} | "
            f"Status: {m.status} | Nasc: {m.data_nascimento or '-'} | ID: {m.id}"
        )
    return "Membros encontrados:\n" + "\n".join(linhas)

def _criar_membro(args: dict, ctx: ToolContext) -> str:
    from app.models import Membro, Congregacao
    nome = (args.get("nome") or "").strip()
    if not nome:
        return "[erro: nome é obrigatório]"
    cong_id = args.get("congregacao_id") or ""
    if not cong_id:
        sede = ctx.db.query(Congregacao).filter(
            Congregacao.tenant_id == ctx.tenant_id,
            Congregacao.nome.ilike("%sede%"),
        ).first()
        if sede:
            cong_id = sede.id
        else:
            return "[erro: informe congregacao_id]"
    cpf = re.sub(r"\D", "", (args.get("cpf") or ""))
    if cpf:
        existente = ctx.db.query(Membro).filter(
            Membro.tenant_id == ctx.tenant_id,
            Membro.cpf == cpf,
        ).first()
        if existente:
            return f"[duplicado] Já existe membro com CPF {cpf}: {existente.nome} (ID: {existente.id})"
    membro = Membro(
        id=new_id(),
        tenant_id=ctx.tenant_id,
        congregacao_id=cong_id,
        nome=nome,
        cpf=cpf or None,
        rg=(args.get("rg") or "").strip() or None,
        data_nascimento=parse_date(args.get("data_nascimento")),
        telefone=(args.get("telefone") or "").strip() or None,
        whatsapp=(args.get("whatsapp") or "").strip() or None,
        endereco=(args.get("endereco") or "").strip() or None,
        estado_civil=(args.get("estado_civil") or "").strip() or None,
        data_conversao=parse_date(args.get("data_conversao")),
        data_batismo=parse_date(args.get("data_batismo")),
        cargo=(args.get("cargo") or "").strip() or None,
        status=(args.get("status") or "ativo").strip(),
        observacoes=(args.get("observacoes") or "").strip() or None,
    )
    ctx.db.add(membro)
    ctx.db.commit()
    return f"Membro '{nome}' cadastrado com sucesso! ID: {membro.id}"

def _atualizar_membro(args: dict, ctx: ToolContext) -> str:
    from app.models import Membro
    membro_id = (args.get("membro_id") or "").strip()
    if not membro_id:
        return "[erro: informe membro_id]"
    membro = ctx.db.query(Membro).filter(
        Membro.id == membro_id,
        Membro.tenant_id == ctx.tenant_id,
    ).first()
    if not membro:
        return "[erro: membro não encontrado]"
    updates = {
        "nome": "nome",
        "cpf": "cpf",
        "rg": "rg",
        "telefone": "telefone",
        "whatsapp": "whatsapp",
        "endereco": "endereco",
        "estado_civil": "estado_civil",
        "cargo": "cargo",
        "status": "status",
        "observacoes": "observacoes",
        "congregacao_id": "congregacao_id",
        "data_nascimento": "data_nascimento",
        "data_conversao": "data_conversao",
        "data_batismo": "data_batismo",
    }
    alterados = []
    for campo, attr in updates.items():
        val = args.get(campo)
        if val is not None:
            if campo.startswith("data_"):
                parsed = parse_date(val)
                if parsed:
                    setattr(membro, attr, parsed)
                    alterados.append(campo)
            else:
                setattr(membro, attr, str(val).strip())
                alterados.append(campo)
    if not alterados:
        return "Nenhum campo foi alterado."
    membro.atualizado_em = datetime.now(timezone.utc)
    ctx.db.commit()
    return f"Membro '{membro.nome}' atualizado: {', '.join(alterados)}"

def _transferir_membro(args: dict, ctx: ToolContext) -> str:
    from app.models import Membro, Congregacao
    membro_id = (args.get("membro_id") or "").strip()
    cong_destino = (args.get("congregacao_destino_id") or "").strip()
    if not membro_id or not cong_destino:
        return "[erro: informe membro_id e congregacao_destino_id]"
    membro = ctx.db.query(Membro).filter(
        Membro.id == membro_id,
        Membro.tenant_id == ctx.tenant_id,
    ).first()
    if not membro:
        return "[erro: membro não encontrado]"
    destino = ctx.db.query(Congregacao).filter(
        Congregacao.id == cong_destino,
        Congregacao.tenant_id == ctx.tenant_id,
    ).first()
    if not destino:
        return "[erro: congregação destino não encontrada]"
    origem_nome = membro.congregacao_id
    cong_origem = ctx.db.query(Congregacao).filter(
        Congregacao.id == membro.congregacao_id,
    ).first()
    origem_nome = cong_origem.nome if cong_origem else "desconhecida"
    membro.congregacao_id = cong_destino
    if membro.observacoes:
        membro.observacoes += f"\n[Transferido de {origem_nome} para {destino.nome} em {date.today().isoformat()}]"
    else:
        membro.observacoes = f"[Transferido de {origem_nome} para {destino.nome} em {date.today().isoformat()}]"
    membro.atualizado_em = datetime.now(timezone.utc)
    ctx.db.commit()
    return f"Membro '{membro.nome}' transferido de '{origem_nome}' para '{destino.nome}'."

register_tool(Tool(
    name="validar_cpf",
    description="Valida o formato e dígitos verificadores de um CPF.",
    parameters={
        "type": "object",
        "properties": {
            "cpf": {"type": "string", "description": "CPF para validar (com ou sem pontuação)"},
        },
        "required": ["cpf"],
    },
    handler=lambda a, c: _validar_cpf(a.get("cpf", "")),
))

register_tool(Tool(
    name="validar_telefone",
    description="Valida o formato de um telefone brasileiro (fixo ou celular com DDD).",
    parameters={
        "type": "object",
        "properties": {
            "telefone": {"type": "string", "description": "Telefone para validar"},
        },
        "required": ["telefone"],
    },
    handler=lambda a, c: _validar_telefone(a.get("telefone", "")),
))

register_tool(Tool(
    name="buscar_membro",
    description="Busca membros por nome, CPF ou termo parcial.",
    parameters={
        "type": "object",
        "properties": {
            "nome": {"type": "string", "description": "Nome completo ou parcial do membro"},
            "cpf": {"type": "string", "description": "CPF do membro"},
        },
    },
    handler=_buscar_membro,
))

register_tool(Tool(
    name="criar_membro",
    description="Cria um novo membro no banco de dados.",
    parameters={
        "type": "object",
        "properties": {
            "nome": {"type": "string", "description": "Nome completo"},
            "cpf": {"type": "string", "description": "CPF"},
            "rg": {"type": "string", "description": "RG"},
            "data_nascimento": {"type": "string", "description": "Data de nascimento (YYYY-MM-DD)"},
            "telefone": {"type": "string", "description": "Telefone"},
            "whatsapp": {"type": "string", "description": "WhatsApp"},
            "endereco": {"type": "string", "description": "Endereço completo"},
            "estado_civil": {"type": "string", "description": "Estado civil: solteiro, casado, divorciado, viuvo"},
            "data_conversao": {"type": "string", "description": "Data da conversão (YYYY-MM-DD)"},
            "data_batismo": {"type": "string", "description": "Data do batismo (YYYY-MM-DD)"},
            "cargo": {"type": "string", "description": "Cargo do membro"},
            "status": {"type": "string", "description": "Situação: ativo, inativo, transferido, excluido"},
            "observacoes": {"type": "string", "description": "Observações adicionais"},
            "congregacao_id": {"type": "string", "description": "ID da congregação"},
        },
        "required": ["nome"],
    },
    handler=_criar_membro,
))

register_tool(Tool(
    name="atualizar_membro",
    description="Atualiza dados de um membro existente. Só altera campos informados.",
    parameters={
        "type": "object",
        "properties": {
            "membro_id": {"type": "string", "description": "ID do membro"},
            "nome": {"type": "string"},
            "cpf": {"type": "string"},
            "rg": {"type": "string"},
            "data_nascimento": {"type": "string", "description": "YYYY-MM-DD"},
            "telefone": {"type": "string"},
            "whatsapp": {"type": "string"},
            "endereco": {"type": "string"},
            "estado_civil": {"type": "string"},
            "cargo": {"type": "string"},
            "status": {"type": "string"},
            "observacoes": {"type": "string"},
            "congregacao_id": {"type": "string"},
            "data_conversao": {"type": "string", "description": "YYYY-MM-DD"},
            "data_batismo": {"type": "string", "description": "YYYY-MM-DD"},
        },
        "required": ["membro_id"],
    },
    handler=_atualizar_membro,
))

register_tool(Tool(
    name="transferir_membro",
    description="Transfere um membro de uma congregação para outra. Mantém histórico.",
    parameters={
        "type": "object",
        "properties": {
            "membro_id": {"type": "string", "description": "ID do membro"},
            "congregacao_destino_id": {"type": "string", "description": "ID da congregação destino"},
        },
        "required": ["membro_id", "congregacao_destino_id"],
    },
    handler=_transferir_membro,
))

def _buscar_aniversariantes(args: dict, ctx: ToolContext) -> str:
    from app.models import Membro
    hoje = date.today()
    mes = args.get("mes") or hoje.month
    try:
        mes = int(mes)
    except ValueError:
        mes = hoje.month
    q = ctx.db.query(Membro).filter(
        Membro.tenant_id == ctx.tenant_id,
        Membro.status == "ativo",
    )
    membros = q.all()
    aniversariantes = [m for m in membros if m.data_nascimento and m.data_nascimento.month == mes]
    if not aniversariantes:
        return f"Nenhum aniversariante no mês {mes}."
    meses_pt = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                 "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
    linhas = [f"Aniversariantes de {meses_pt[mes]}:"]
    for m in sorted(aniversariantes, key=lambda x: x.data_nascimento.day if x.data_nascimento else 0):
        dia = m.data_nascimento.day if m.data_nascimento else "??"
        tel = m.whatsapp or m.telefone or "-"
        linhas.append(f"- {m.nome} — {dia:02d}/{mes:02d} | Tel: {tel}")
    return "\n".join(linhas)

def _buscar_eventos(args: dict, ctx: ToolContext) -> str:
    from app.models import Evento, Congregacao
    from datetime import datetime, timezone
    dias = int(args.get("dias") or 30)
    data_limite = datetime.now(timezone.utc)
    if args.get("data_inicio"):
        try:
            data_limite = datetime.fromisoformat(args["data_inicio"])
        except ValueError:
            pass
    data_fim = args.get("data_fim")
    if data_fim:
        try:
            data_fim = datetime.fromisoformat(data_fim)
        except ValueError:
            data_fim = None
    else:
        from datetime import timedelta
        data_fim = data_limite + timedelta(days=dias)
    q = ctx.db.query(Evento).filter(
        Evento.tenant_id == ctx.tenant_id,
        Evento.data_inicio >= data_limite,
        Evento.data_inicio <= data_fim,
    ).order_by(Evento.data_inicio).limit(20)
    eventos = q.all()
    if not eventos:
        return f"Nenhum evento encontrado nos próximos {dias} dias."
    linhas = []
    for e in eventos:
        cong = ctx.db.query(Congregacao).filter(Congregacao.id == e.congregacao_id).first()
        cong_nome = cong.nome if cong else "-"
        data = e.data_inicio.strftime("%d/%m/%Y %H:%M") if e.data_inicio else "-"
        linhas.append(f"- {e.titulo} ({e.tipo}) | {data} | {cong_nome}")
    return "Eventos encontrados:\n" + "\n".join(linhas)

def _listar_congregacoes(args: dict, ctx: ToolContext) -> str:
    from app.models import Congregacao, Membro
    q = ctx.db.query(Congregacao).filter(
        Congregacao.tenant_id == ctx.tenant_id,
    ).order_by(Congregacao.nome)
    congregacoes = q.all()
    if not congregacoes:
        return "Nenhuma congregação cadastrada."
    linhas = []
    for c in congregacoes:
        total = ctx.db.query(Membro).filter(
            Membro.tenant_id == ctx.tenant_id,
            Membro.congregacao_id == c.id,
        ).count()
        linhas.append(f"- {c.nome} | {c.cidade or '-'}/{c.estado or '-'} | {total} membros | ID: {c.id}")
    return "Congregações:\n" + "\n".join(linhas)

def _cadastrar_congregacao(args: dict, ctx: ToolContext) -> str:
    from app.models import Congregacao
    nome = (args.get("nome") or "").strip()
    if not nome:
        return "[erro: nome é obrigatório]"
    existente = ctx.db.query(Congregacao).filter(
        Congregacao.tenant_id == ctx.tenant_id,
        Congregacao.nome.ilike(nome),
    ).first()
    if existente:
        return f"[duplicado] Já existe congregação '{nome}' (ID: {existente.id})"
    cong = Congregacao(
        id=new_id(),
        tenant_id=ctx.tenant_id,
        nome=nome,
        endereco=(args.get("endereco") or "").strip() or None,
        cidade=(args.get("cidade") or "").strip() or None,
        estado=(args.get("estado") or "").strip() or None,
        telefone=(args.get("telefone") or "").strip() or None,
    )
    ctx.db.add(cong)
    ctx.db.commit()
    return f"Congregação '{nome}' cadastrada com sucesso! ID: {cong.id}"

def _listar_obreiros(args: dict, ctx: ToolContext) -> str:
    from app.models import Obreiro, Congregacao
    q = ctx.db.query(Obreiro).filter(
        Obreiro.tenant_id == ctx.tenant_id,
        Obreiro.ativo == True,
    ).all()
    if not q:
        return "Nenhum obreiro encontrado."
    linhas = []
    for o in q:
        membro = o.membro
        nome_membro = membro.nome if membro else "?"
        cong = ctx.db.query(Congregacao).filter(Congregacao.id == o.congregacao_id).first()
        cong_nome = cong.nome if cong else "-"
        val = o.credencial_validade.strftime("%d/%m/%Y") if o.credencial_validade else "-"
        linhas.append(f"- {nome_membro} | {o.categoria} | {cong_nome} | Validade: {val}")
    return "Obreiros:\n" + "\n".join(linhas)

def _resumo_dashboard(args: dict, ctx: ToolContext) -> str:
    from app.models import Membro, Congregacao, Obreiro, Evento
    from datetime import datetime, timezone, timedelta
    total_membros = ctx.db.query(Membro).filter(Membro.tenant_id == ctx.tenant_id).count()
    ativos = ctx.db.query(Membro).filter(Membro.tenant_id == ctx.tenant_id, Membro.status == "ativo").count()
    congregacoes = ctx.db.query(Congregacao).filter(Congregacao.tenant_id == ctx.tenant_id).count()
    obreiros = ctx.db.query(Obreiro).filter(Obreiro.tenant_id == ctx.tenant_id, Obreiro.ativo == True).count()
    hoje = datetime.now(timezone.utc)
    eventos_proximos = ctx.db.query(Evento).filter(
        Evento.tenant_id == ctx.tenant_id,
        Evento.data_inicio >= hoje,
        Evento.data_inicio <= hoje + timedelta(days=30),
    ).count()
    return (
        f"Resumo da Igreja:\n"
        f"- Membros: {total_membros} ({ativos} ativos)\n"
        f"- Congregações: {congregacoes}\n"
        f"- Obreiros: {obreiros}\n"
        f"- Próximos eventos (30 dias): {eventos_proximos}"
    )

def _buscar_usuario(args: dict, ctx: ToolContext) -> str:
    from app.models import Usuario
    termo = (args.get("nome") or args.get("email") or "").strip()
    if not termo:
        return "[erro: informe nome ou email do usuário]"
    q = ctx.db.query(Usuario).filter(Usuario.tenant_id == ctx.tenant_id)
    if "@" in termo:
        q = q.filter(Usuario.email.ilike(f"%{termo}%"))
    else:
        q = q.filter(Usuario.nome.ilike(f"%{termo}%"))
    usuarios = q.order_by(Usuario.nome).limit(10).all()
    if not usuarios:
        return "Nenhum usuário encontrado."
    linhas = [f"- {u.nome} | {u.email} | Perfil: {u.perfil} | ID: {u.id}"]
    return "Usuários encontrados:\n" + "\n".join(linhas)

register_tool(Tool(name="buscar_aniversariantes", description="Busca aniversariantes do mês (ou de um mês específico).",
    parameters={"type": "object", "properties": {"mes": {"type": "integer", "description": "Número do mês (1=Janeiro, 2=Fevereiro...). Se omitido, usa mês atual."}}},
    handler=_buscar_aniversariantes))

register_tool(Tool(name="buscar_eventos", description="Busca eventos futuros ou por período.",
    parameters={"type": "object", "properties": {
        "dias": {"type": "integer", "description": "Quantidade de dias para buscar (padrão 30)"},
        "data_inicio": {"type": "string", "description": "Data de início no formato ISO"},
        "data_fim": {"type": "string", "description": "Data de fim no formato ISO"},
    }},
    handler=_buscar_eventos))

register_tool(Tool(name="listar_congregacoes", description="Lista todas as congregações cadastradas com total de membros.",
    parameters={"type": "object", "properties": {}},
    handler=_listar_congregacoes))

register_tool(Tool(name="cadastrar_congregacao", description="Cadastra uma nova congregação.",
    parameters={"type": "object", "properties": {
        "nome": {"type": "string", "description": "Nome da congregação"},
        "endereco": {"type": "string", "description": "Endereço"},
        "cidade": {"type": "string", "description": "Cidade"},
        "estado": {"type": "string", "description": "Estado (sigla de 2 letras)"},
        "telefone": {"type": "string", "description": "Telefone de contato"},
    }, "required": ["nome"]},
    handler=_cadastrar_congregacao))

register_tool(Tool(name="listar_obreiros", description="Lista todos os obreiros ativos com suas categorias e congregações.",
    parameters={"type": "object", "properties": {}},
    handler=_listar_obreiros))

register_tool(Tool(name="resumo_dashboard", description="Retorna resumo completo: total de membros, ativos, congregações, obreiros e próximos eventos.",
    parameters={"type": "object", "properties": {}},
    handler=_resumo_dashboard))

register_tool(Tool(name="buscar_usuario", description="Busca usuários do sistema por nome ou email.",
    parameters={"type": "object", "properties": {
        "nome": {"type": "string", "description": "Nome do usuário"},
        "email": {"type": "string", "description": "Email do usuário"},
    }},
    handler=_buscar_usuario))
