import asyncio
import json
import re
import uuid as uuid_lib
from datetime import date, datetime, timezone
from typing import Any

import httpx
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Congregacao, Membro, Evento, Obreiro, Usuario

ACOES_POR_PERFIL = {
    "master": [
        "cadastrar_membro", "atualizar_membro", "buscar_membro",
        "transferir_membro", "cadastrar_evento", "buscar_eventos",
        "buscar_aniversariantes", "cadastrar_congregacao",
        "listar_congregacoes", "listar_obreiros", "relatorio_membros",
        "buscar_usuario", "resumo_dashboard",
    ],
    "admin": [
        "cadastrar_membro", "atualizar_membro", "buscar_membro",
        "transferir_membro", "cadastrar_evento", "buscar_eventos",
        "buscar_aniversariantes", "cadastrar_congregacao",
        "listar_congregacoes", "listar_obreiros", "relatorio_membros",
        "buscar_usuario", "resumo_dashboard",
    ],
    "cliente": [
        "buscar_membro", "buscar_eventos",
        "buscar_aniversariantes", "resumo_dashboard",
    ],
}

CAMPOS_MEMBRO = [
    ("nome", "Nome completo", "obrigatorio"),
    ("sexo", "Sexo (M/F)", "opcional"),
    ("data_nascimento", "Data de nascimento", "opcional"),
    ("cpf", "CPF", "opcional"),
    ("rg", "RG", "opcional"),
    ("estado_civil", "Estado civil (solteiro/casado/divorciado/viuvo)", "opcional"),
    ("conjuge", "Nome do cônjuge", "opcional"),
    ("filhos", "Quantidade de filhos", "opcional"),
    ("endereco", "Endereço", "opcional"),
    ("bairro", "Bairro", "opcional"),
    ("cidade", "Cidade", "opcional"),
    ("estado", "Estado (UF)", "opcional"),
    ("cep", "CEP", "opcional"),
    ("telefone", "Telefone", "opcional"),
    ("whatsapp", "WhatsApp", "opcional"),
    ("email", "E-mail", "opcional"),
    ("profissao", "Profissão", "opcional"),
    ("data_conversao", "Data da conversão", "opcional"),
    ("data_batismo", "Data do batismo", "opcional"),
    ("cargo", "Cargo", "opcional"),
    ("ministerio", "Ministério", "opcional"),
    ("congregacao_nome", "Congregação", "opcional"),
    ("unidade", "Unidade (Sede / Congregação)", "opcional"),
    ("status", "Situação do membro (ativo/inativo)", "opcional"),
    ("observacoes", "Observações", "opcional"),
]


def _validar_cpf(cpf: str) -> bool:
    nums = re.sub(r"\D", "", cpf)
    if len(nums) != 11 or nums == nums[0] * 11:
        return False
    for i in range(9, 11):
        soma = sum(int(nums[j]) * (i + 1 - j) for j in range(i))
        dig = (soma * 10 % 11) % 11
        if int(nums[i]) != dig:
            return False
    return True


def _extrair_campos(texto: str) -> dict:
    campos = {}
    # Nome
    m = re.search(r"(?:meu nome é|chamo[-\s]?me|nome[:\s]+)([A-ZÀ-Ú][A-ZÀ-Úa-zà-ú\s]+?)(?:\s|de\s|,|\.|$)", texto, re.I)
    if m: campos["nome"] = m.group(1).strip()
    # Data nascimento
    m = re.search(r"(\d{2})[/-](\d{2})[/-](\d{4})", texto)
    if m: campos["data_nascimento"] = f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    m = re.search(r"nasceu?[-\s]?me?\s*(?:em|no dia)?\s*(\d{2})[/-](\d{2})[/-](\d{4})", texto, re.I)
    if m: campos["data_nascimento"] = f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    # CPF
    m = re.search(r"\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b", texto)
    if m:
        cpf = re.sub(r"\D", "", m.group(1))
        if _validar_cpf(cpf):
            campos["cpf"] = cpf
    # Telefone/WhatsApp
    m = re.search(r"(?:telefone|tel|whatsapp|whats|celular|cel|fone)[:\s]*(\+?\d[\d\s()-]{7,})", texto, re.I)
    if m: campos["telefone"] = re.sub(r"\D", "", m.group(1))
    # Estado civil
    m = re.search(r"(solteir[oa]|casad[oa]|divorciad[oa]|viuv[oa]|união\s+estável|separad[oa])", texto, re.I)
    if m: campos["estado_civil"] = m.group(1).lower().strip()
    # Endereço
    m = re.search(r"(?:mora|endereço|rua|av\.?|avenida|travessa|estrada|rodovia|alameda|logradouro)[:\s]*([A-ZÀ-Úa-zà-ú0-9\s,./-]+?)(?:\s+em\s+|,?\s*(?:bairro|cidade|\.|$))", texto, re.I)
    if m: campos["endereco"] = m.group(1).strip()
    # Bairro
    m = re.search(r"bairro[:\s]+([A-ZÀ-Úa-zà-ú\s]+?)(?:\s+em\s+|,?\s*(?:cidade|\.|$))", texto, re.I)
    if m: campos["bairro"] = m.group(1).strip()
    # Cidade
    m = re.search(r"cidade[:\s]+([A-ZÀ-Úa-zà-ú\s]+?)(?:\s*[-–]\s*|\.|$)", texto, re.I)
    if m: campos["cidade"] = m.group(1).strip()
    # E-mail
    m = re.search(r"\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b", texto)
    if m: campos["email"] = m.group(1)
    # Cargo
    m = re.search(r"(?:cargo[:\s]+|é\s+)(pastor|diácono|diaconisa|presbítero|obreir[oa]|missionári[oa]|evangelista|auxiliar|líder|superintendente|secretári[oa]|tesoureir[oa]|zelador)", texto, re.I)
    if m: campos["cargo"] = m.group(1).lower().strip()
    # Congregação
    m = re.search(r"(?:congregação|cong)[:\s]*([A-ZÀ-Úa-zà-ú\s]+?)(?:\s+em\s+|,?\s*(?:sede|\.|$))", texto, re.I)
    if m: campos["congregacao_nome"] = m.group(1).strip()
    # Unidade
    if re.search(r"\bsede\b", texto, re.I):
        campos["unidade"] = "SEDE"
    # Data batismo
    m = re.search(r"batizad[oa][-\s]?(?:em|no?\s*dia)?\s*(\d{2})[/-](\d{2})[/-](\d{4})", texto, re.I)
    if m: campos["data_batismo"] = f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    # Data conversão
    m = re.search(r"convertid[oa][-\s]?(?:em|no?\s*dia)?\s*(\d{2})[/-](\d{2})[/-](\d{4})", texto, re.I)
    if m: campos["data_conversao"] = f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
    # Profissão
    m = re.search(r"(?:profissão|trabalha?)[:\s]+(?:de\s+)?([A-ZÀ-Úa-zà-ú\s]+?)(?:,|\.|$)", texto, re.I)
    if m: campos["profissao"] = m.group(1).strip().lower()
    # Observações
    m = re.search(r"(?:obs|observações)[:\s]+(.+?)(?:\.|$)", texto, re.I)
    if m: campos["observacoes"] = m.group(1).strip()
    return campos


def _buscar_congregacao_por_nome(db: Session, tenant_id: int, nome: str) -> Any | None:
    return db.query(Congregacao).filter(
        Congregacao.tenant_id == tenant_id,
        Congregacao.nome.ilike(f"%{nome}%"),
        Congregacao.status == "ativa",
    ).first()


def _formatar_resumo(dados: dict) -> str:
    linhas = []
    mapa = dict(CAMPOS_MEMBRO)
    for chave, nome, _ in CAMPOS_MEMBRO:
        val = dados.get(chave)
        if val and str(val).strip():
            linhas.append(f"   {nome}: {val}")
    return "\n".join(linhas)


def montar_system_prompt(usuario, db, tela_atual=""):
    hoje = date.today().strftime("%d/%m/%Y")
    congregacoes = db.query(Congregacao).filter(
        Congregacao.tenant_id == usuario.tenant_id,
        Congregacao.status == "ativa"
    ).all()
    lista_cong = []
    for c in congregacoes:
        lista_cong.append(f"{c.nome} (ID: {c.id})")
    nomes_congregacoes = "; ".join(lista_cong) if lista_cong else "nenhuma cadastrada"
    total_membros = db.query(Membro).filter(
        Membro.tenant_id == usuario.tenant_id,
        Membro.status == "ativo"
    ).count()
    acoes_disponiveis = ACOES_POR_PERFIL.get(usuario.perfil, [])
    cong_usuario = ""
    if usuario.congregacao_id:
        cong = db.query(Congregacao).filter(Congregacao.id == usuario.congregacao_id).first()
        cong_usuario = cong.nome if cong else ""
    tela_info = f"\nTela atual: {tela_atual}" if tela_atual else ""
    return f"""Você é o Aion, a inteligência artificial oficial do sistema Kairos Igreja.

Sua função não é apenas responder perguntas. Você é um agente inteligente capaz de executar tarefas dentro da plataforma, guiando o usuário por meio de uma conversa natural.

Sempre converse de forma educada, objetiva, profissional e acolhedora. Fale em português brasileiro.

Antes de executar qualquer ação, identifique a intenção do usuário.

CONTEXTO ATUAL:
- Data: {hoje}
- Usuário: {usuario.nome} (perfil: {usuario.perfil})
- Congregação do usuário: {cong_usuario or 'todas'}
- Membros ativos: {total_membros}
- Congregações disponíveis: {nomes_congregacoes}{tela_info}

AÇÕES DISPONÍVEIS: {json.dumps(acoes_disponiveis, ensure_ascii=False)}

CAMPOS DE CADASTRO DE MEMBRO:
{json.dumps([{"campo": c[0], "descricao": c[1], "obrigatorio": c[2]} for c in CAMPOS_MEMBRO], ensure_ascii=False, indent=2)}

FORMATO DE RESPOSTA — sempre JSON valido SEMPRE:
{{
  "resposta": "texto para o usuário",
  "acao": null,
  "card_ajuda": null,
  "aguardando_confirmacao": false,
  "dados_coletados": {{}},
  "campos_faltando": [],
  "validacao": {{}}
}}

REGRAS:

1. RECONHECIMENTO DE INTENCAO
   - Se o usuario desejar cadastrar/alterar/atualizar/mover/localizar/consultar membros → Modo Agente de Cadastro
   - Se desejar eventos, congregacoes, obreiros, aniversariantes, dashboard → use o campo "acao" no JSON da resposta
   - Nao peca para o usuario procurar menus. Conduza toda a operacao.

2. MODO AGENTE DE CADASTRO
   Quando identificar intencao de cadastrar um membro, responda:
   "Perfeito! Vou realizar o cadastro do novo membro. Farei algumas perguntas e preencherei automaticamente a ficha. Voce pode responder uma pergunta por vez ou informar todos os dados de uma unica mensagem."

3. PREENCHIMENTO INTELIGENTE
   Enquanto conversa, extraia automaticamente as informacoes da fala do usuario.
   Nunca pergunte novamente por uma informacao que ja foi fornecida.

4. CADASTRO NA SEDE / CONGREGACAO
   "Cadastre na Sede" → unidade = SEDE
   "Cadastre na Congregacao Cajuru" → unidade = CONGREGACAO, congregacao_nome = Cajuru

5. ATUALIZACAO
   Localize o membro primeiro (use acao buscar_membro), depois atualize APENAS os campos informados.

6. TRANSFERENCIA
   Localize o membro, encontre a congregacao destino, use acao transferir_membro.

7. CONVERSA NATURAL
   Aceite informacoes em qualquer ordem. Extraia automaticamente cada informacao.

8. VALIDACAO
   Antes de salvar: valide CPF e telefone, verifique duplicidade.
   Se existir membro semelhante, pergunte: "Encontrei um cadastro parecido. Deseja atualizar o existente ou criar um novo?"

9. CONFIRMACAO FINAL
   Apos coletar todos os dados de um novo membro, apresente o resumo e pergunte "Deseja salvar?" com aguardando_confirmacao=true e o campo acao preenchido.

10. CARD DE AJUDA
    Se o usuario pedir ajuda/instrucoes, preencha card_ajuda.

11. Lembre-se: voce e um secretario inteligente que entende o contexto, faz perguntas quando necessario, valida as informacoes e executa operacoes dentro do sistema. O usuario nunca precisa navegar em menus ou preencher formularios manualmente."""


def _call_llm(base_url, headers, payload):
    import logging
    logger = logging.getLogger("uvicorn")
    logger.info(f"[_call_llm] POST {base_url}/chat/completions | tools={'tools' in payload}")
    try:
        with httpx.Client(timeout=300) as client:
            r = client.post(
                f"{base_url}/chat/completions",
                headers=headers, json=payload,
            )
            r.raise_for_status()
            data = r.json()
            msg = data["choices"][0]["message"]
            tc = bool(msg.get("tool_calls"))
            logger.info(f"[_call_llm] OK status={r.status_code} finish={data['choices'][0].get('finish_reason')} tool_calls={tc}")
            return data
    except Exception as e:
        logger.error(f"[_call_llm] ERROR {type(e).__name__}: {str(e)[:200]}")
        raise


async def chamar_llm(mensagens, tools=None, tool_executor=None, max_tool_rounds=3):
    if not settings.OPENROUTER_API_KEY:
        return {
            "resposta": "Assistente IA nao configurado. Configure OPENROUTER_API_KEY.",
            "acao": None, "card_ajuda": None,
            "aguardando_confirmacao": False, "dados_coletados": {},
        }
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.OPENROUTER_MODEL,
        "messages": mensagens,
        "max_tokens": settings.ASSISTENTE_MAX_TOKENS,
        "temperature": 0.1,
    }
    if tools:
        payload["tools"] = tools
    else:
        payload["response_format"] = {"type": "json_object"}

    for _ in range(max_tool_rounds):
        data = await asyncio.to_thread(
            _call_llm,
            settings.OPENROUTER_BASE_URL, headers, payload,
        )
        msg = data["choices"][0]["message"]

        if msg.get("tool_calls") and tool_executor:
            results = []
            for tc in msg["tool_calls"]:
                name = tc["function"]["name"]
                try:
                    args = json.loads(tc["function"]["arguments"])
                except json.JSONDecodeError:
                    args = {}
                result = tool_executor(name, args)
                results.append({"tool": name, "result": str(result)[:500]})
                mensagens.append({
                    "role": "tool",
                    "tool_call_id": tc["id"],
                    "content": str(result),
                })
            resumo = "\n\n".join(r['result'] for r in results)
            if len(resumo) > 800:
                resumo = resumo[:800] + "..."
            return {
                "resposta": resumo,
                "acao": None, "card_ajuda": None,
                "aguardando_confirmacao": False, "dados_coletados": {},
                "tool_used": True,
            }

        content = msg.get("content") or ""
        if content.strip():
            try:
                parsed = json.loads(content)
                if isinstance(parsed, dict) and "resposta" in parsed:
                    parsed.setdefault("tool_used", bool(tools))
                    return parsed
            except json.JSONDecodeError:
                pass
        if tools:
            return {"resposta": content, "acao": None, "card_ajuda": None,
                    "aguardando_confirmacao": False, "dados_coletados": {},
                    "tool_used": True}
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {"resposta": content, "acao": None, "card_ajuda": None,
                    "aguardando_confirmacao": False, "dados_coletados": {}}

    tool_count = sum(1 for m in mensagens if m.get("role") == "tool")
    return {"resposta": f"Ferramentas executadas ({tool_count} chamadas). Consulte os dados retornados acima.",
            "acao": None, "card_ajuda": None,
            "aguardando_confirmacao": False, "dados_coletados": {}, "tool_used": bool(tools)}


def _parse_date_safe(valor: str | None) -> date | None:
    if not valor:
        return None
    try:
        return datetime.strptime(valor[:10], "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None


def _buscar_congregacao_id(db: Session, tenant_id: int, nome: str) -> str | None:
    cong = db.query(Congregacao).filter(
        Congregacao.tenant_id == tenant_id,
        Congregacao.nome.ilike(f"%{nome}%"),
        Congregacao.status == "ativa",
    ).first()
    return cong.id if cong else None


def executar_acao(acao, usuario, db):
    tipo = acao.get("tipo")
    dados = acao.get("dados", {})

    if tipo == "buscar_membro":
        busca = dados.get("nome", "")
        cpf = dados.get("cpf", "")
        q = db.query(Membro).filter(Membro.tenant_id == usuario.tenant_id)
        if cpf:
            q = q.filter(Membro.cpf == re.sub(r"\D", "", cpf))
        elif busca:
            q = q.filter(Membro.nome.ilike(f"%{busca}%"))
        else:
            return {"ok": False, "mensagem": "Informe nome ou CPF para buscar."}
        membros = q.order_by(Membro.nome).limit(5).all()
        if not membros:
            return {"ok": True, "mensagem": f"Nenhum membro encontrado."}
        lista = []
        for m in membros:
            info = f"{m.nome}"
            if m.cpf: info += f" (CPF: {m.cpf})"
            if m.data_nascimento: info += f" - Nasc: {m.data_nascimento}"
            if m.telefone: info += f" - Tel: {m.telefone}"
            info += f" - Status: {m.status}"
            info += f" [ID: {m.id}]"
            lista.append(info)
        return {"ok": True, "mensagem": "Membros encontrados:\n" + "\n".join(lista),
                "membros": [{"id": m.id, "nome": m.nome, "cpf": m.cpf, "status": m.status} for m in membros]}

    if tipo == "cadastrar_membro":
        nome = (dados.get("nome") or "").strip()
        if not nome:
            return {"ok": False, "mensagem": "Nome é obrigatório para cadastrar."}

        cpf = re.sub(r"\D", "", (dados.get("cpf") or ""))
        if cpf:
            existente = db.query(Membro).filter(
                Membro.tenant_id == usuario.tenant_id,
                Membro.cpf == cpf,
            ).first()
            if existente:
                return {"ok": False, "duplicado": True,
                        "mensagem": f"Já existe membro com CPF {cpf}: {existente.nome}. Deseja atualizar o existente ou criar outro?"}

        congregacao_id = dados.get("congregacao_id")
        if not congregacao_id:
            cong_nome = dados.get("congregacao_nome", "")
            if cong_nome:
                congregacao_id = _buscar_congregacao_id(db, usuario.tenant_id, cong_nome)
            if not congregacao_id:
                unidade = (dados.get("unidade") or "").upper()
                if unidade == "SEDE":
                    sede = db.query(Congregacao).filter(
                        Congregacao.tenant_id == usuario.tenant_id,
                        Congregacao.nome.ilike("%sede%"),
                    ).first()
                    if sede:
                        congregacao_id = sede.id
                elif unidade == "CONGREGAÇÃO":
                    for c in db.query(Congregacao).filter(
                        Congregacao.tenant_id == usuario.tenant_id,
                        Congregacao.status == "ativa",
                    ).all():
                        if c.nome.lower() in (dados.get("congregacao_nome") or "").lower():
                            congregacao_id = c.id
                            break
            if not congregacao_id:
                if usuario.congregacao_id:
                    congregacao_id = usuario.congregacao_id
                else:
                    return {"ok": False, "mensagem": "Informe a congregação do membro."}

        membro = Membro(
            id=str(uuid_lib.uuid4()),
            tenant_id=usuario.tenant_id,
            congregacao_id=congregacao_id,
            nome=nome,
            cpf=cpf or None,
            rg=(dados.get("rg") or "").strip() or None,
            data_nascimento=_parse_date_safe(dados.get("data_nascimento")),
            telefone=(dados.get("telefone") or "").strip() or None,
            whatsapp=(dados.get("whatsapp") or "").strip() or None,
            endereco=(dados.get("endereco") or "").strip() or None,
            estado_civil=(dados.get("estado_civil") or "").strip() or None,
            data_conversao=_parse_date_safe(dados.get("data_conversao")),
            data_batismo=_parse_date_safe(dados.get("data_batismo")),
            cargo=(dados.get("cargo") or "").strip() or None,
            status=(dados.get("status") or "ativo").strip(),
            observacoes=(dados.get("observacoes") or "").strip() or None,
        )
        db.add(membro)
        db.commit()
        return {"ok": True, "mensagem": f"Membro '{nome}' cadastrado com sucesso!", "membro_id": membro.id}

    if tipo == "atualizar_membro":
        membro_id = dados.get("membro_id", "")
        membro = db.query(Membro).filter(
            Membro.id == membro_id,
            Membro.tenant_id == usuario.tenant_id,
        ).first()
        if not membro:
            return {"ok": False, "mensagem": "Membro não encontrado."}
        alterados = []
        campos_atualizaveis = {
            "nome": str, "cpf": str, "rg": str, "telefone": str,
            "whatsapp": str, "endereco": str, "estado_civil": str,
            "cargo": str, "status": str, "observacoes": str,
        }
        for campo, tipo_campo in campos_atualizaveis.items():
            val = dados.get(campo)
            if val is not None:
                setattr(membro, campo, tipo_campo(val).strip())
                alterados.append(campo)
        for campo_data in ("data_nascimento", "data_conversao", "data_batismo"):
            val = dados.get(campo_data)
            if val:
                parsed = _parse_date_safe(val)
                if parsed:
                    setattr(membro, campo_data, parsed)
                    alterados.append(campo_data)
        cong_nome = dados.get("congregacao_nome")
        if cong_nome:
            cong_id = _buscar_congregacao_id(db, usuario.tenant_id, cong_nome)
            if cong_id:
                membro.congregacao_id = cong_id
                alterados.append("congregacao")
        if not alterados:
            return {"ok": True, "mensagem": "Nenhum campo foi alterado."}
        membro.atualizado_em = datetime.now(timezone.utc)
        db.commit()
        return {"ok": True, "mensagem": f"Membro '{membro.nome}' atualizado: {', '.join(alterados)}."}

    if tipo == "transferir_membro":
        membro_id = dados.get("membro_id", "")
        cong_nome = dados.get("congregacao_nome", "")
        membro = db.query(Membro).filter(
            Membro.id == membro_id,
            Membro.tenant_id == usuario.tenant_id,
        ).first()
        if not membro:
            return {"ok": False, "mensagem": "Membro não encontrado."}
        cong_destino_id = _buscar_congregacao_id(db, usuario.tenant_id, cong_nome)
        if not cong_destino_id:
            return {"ok": False, "mensagem": f"Congregação '{cong_nome}' não encontrada."}
        cong_origem = db.query(Congregacao).filter(Congregacao.id == membro.congregacao_id).first()
        origem_nome = cong_origem.nome if cong_origem else "desconhecida"
        destino = db.query(Congregacao).filter(Congregacao.id == cong_destino_id).first()
        if not destino:
            return {"ok": False, "mensagem": "Congregação destino não encontrada."}
        hist = f"[Transferido de '{origem_nome}' para '{destino.nome}' em {date.today().isoformat()}]"
        membro.observacoes = (membro.observacoes + "\n" + hist) if membro.observacoes else hist
        membro.congregacao_id = cong_destino_id
        membro.atualizado_em = datetime.now(timezone.utc)
        db.commit()
        return {"ok": True, "mensagem": f"Membro '{membro.nome}' transferido de '{origem_nome}' para '{destino.nome}'."}

    if tipo == "buscar_aniversariantes":
        from sqlalchemy import extract
        hoje = date.today()
        periodo = dados.get("periodo", "hoje")
        q = db.query(Membro).filter(
            Membro.tenant_id == usuario.tenant_id,
            Membro.status == "ativo",
            Membro.data_nascimento.isnot(None),
        )
        if usuario.congregacao_id:
            q = q.filter(Membro.congregacao_id == usuario.congregacao_id)
        if periodo == "hoje":
            q = q.filter(
                extract("month", Membro.data_nascimento) == hoje.month,
                extract("day", Membro.data_nascimento) == hoje.day,
            )
        elif periodo == "mes":
            q = q.filter(extract("month", Membro.data_nascimento) == hoje.month)
        membros = q.order_by(Membro.nome).limit(10).all()
        if not membros:
            return {"ok": True, "mensagem": f"Nenhum aniversariante {periodo}."}
        lista = ", ".join(m.nome for m in membros)
        return {"ok": True, "mensagem": f"Aniversariantes ({periodo}): {lista}"}

    if tipo == "buscar_eventos":
        from datetime import date as date_, timedelta
        hoje = date_.today()
        eventos = db.query(Evento).filter(
            Evento.tenant_id == usuario.tenant_id,
            Evento.data_inicio >= hoje,
            Evento.data_inicio <= hoje + timedelta(days=30),
        ).order_by(Evento.data_inicio).limit(5).all()
        if not eventos:
            return {"ok": True, "mensagem": "Nenhum evento nos proximos 30 dias."}
        lista = ", ".join(f"{e.titulo} ({e.data_inicio.strftime('%d/%m')})" for e in eventos)
        return {"ok": True, "mensagem": f"Proximos eventos: {lista}"}

    if tipo == "listar_congregacoes":
        congregacoes = db.query(Congregacao).filter(
            Congregacao.tenant_id == usuario.tenant_id,
            Congregacao.status == "ativa",
        ).all()
        if not congregacoes:
            return {"ok": True, "mensagem": "Nenhuma congregacao cadastrada."}
        lista = ", ".join(c.nome for c in congregacoes)
        return {"ok": True, "mensagem": f"Congregacoes ativas: {lista}"}

    if tipo == "resumo_dashboard":
        total = db.query(Membro).filter(
            Membro.tenant_id == usuario.tenant_id, Membro.status == "ativo",
        ).count()
        obreiros_count = db.query(Obreiro).filter(
            Obreiro.tenant_id == usuario.tenant_id, Obreiro.ativo.is_(True),
        ).count()
        return {"ok": True, "mensagem": f"Resumo: {total} membros ativos, {obreiros_count} obreiros."}

    return {"ok": False, "mensagem": f"Acao '{tipo}' nao reconhecida."}
