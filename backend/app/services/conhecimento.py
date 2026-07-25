import re
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import ConhecimentoIA, Usuario
from app.utils import new_id


def buscar_resposta(mensagem: str, db: Session, cu: Usuario) -> dict | None:
    termos = _extrair_termos(mensagem)
    if not termos:
        return None

    q = db.query(ConhecimentoIA).filter(
        ConhecimentoIA.tenant_id == cu.tenant_id,
        ConhecimentoIA.ativo.is_(True),
    )

    registros = q.all()
    if not registros:
        return None

    melhor = None
    maior_pontuacao = 0

    for r in registros:
        score = _calcular_relevancia(mensagem, termos, r)
        if score > maior_pontuacao:
            maior_pontuacao = score
            melhor = r

    if maior_pontuacao >= 1:
        return {
            "encontrado": True,
            "id": melhor.id,
            "titulo": melhor.titulo,
            "resposta": melhor.resposta,
            "categoria": melhor.categoria,
            "video_url": melhor.video_url,
            "imagem_url": melhor.imagem_url,
        }

    return None


def _extrair_termos(texto: str) -> list[str]:
    texto = texto.lower().strip()
    texto = re.sub(r'[^\w\s]', '', texto)
    palavras = texto.split()
    stopwords = {
        "a", "ao", "aos", "aquela", "aquelas", "aquele", "aqueles", "aquilo",
        "as", "até", "com", "como", "da", "das", "de", "dela", "delas",
        "dele", "deles", "depois", "do", "dos", "e", "ela", "elas", "ele",
        "eles", "em", "entre", "era", "essa", "essas", "esse", "esses",
        "esta", "estas", "este", "estes", "eu", "foi", "foram", "houve",
        "isso", "isto", "já", "la", "lhe", "lhes", "lo", "mas", "me",
        "mesmo", "meu", "meus", "minha", "minhas", "muito", "na", "não",
        "nas", "nem", "no", "nos", "nossa", "nossas", "nosso", "nossos",
        "num", "numa", "o", "os", "ou", "para", "pela", "pelas", "pelo",
        "pelos", "por", "qual", "quando", "que", "quem", "se", "sem",
        "seu", "seus", "sua", "suas", "só", "também", "te", "tem",
        "ter", "teu", "teus", "ti", "to", "tu", "tua", "tuas", "um",
        "uma", "você", "vocês", "vossa", "vossas", "vosso", "vossos",
        "é", "como", "quero", "preciso", "pode", "poderia", "gostaria",
        "saber", "fazer", "ser", "está", "estão", "tinha", "tiver",
        "temos", "têm", "são", "era", "eram", "fui", "fomos",
        "fosse", "fossem", "seja", "sejam", "seu", "sua",
    }
    return [p for p in palavras if p not in stopwords and len(p) > 2]


def _calcular_relevancia(mensagem: str, termos: list[str], registro: ConhecimentoIA) -> int:
    score = 0
    alvo = (registro.pergunta + " " + registro.resposta + " " + (registro.titulo or "")).lower()

    for t in termos:
        if t in alvo:
            score += 1

    if registro.tags:
        tags = registro.tags.lower().split(",")
        for t in termos:
            if t in [tag.strip() for tag in tags]:
                score += 3

    if registro.categoria:
        cat_termos = registro.categoria.lower().split()
        for t in termos:
            if t in cat_termos:
                score += 2

    if registro.titulo:
        titulo_termos = registro.titulo.lower().split()
        for t in termos:
            if t in titulo_termos:
                score += 2

    return score


def listar_conhecimento(db: Session, cu: Usuario, categoria: str | None = None, busca: str | None = None) -> list[ConhecimentoIA]:
    q = db.query(ConhecimentoIA).filter(ConhecimentoIA.tenant_id == cu.tenant_id)
    if categoria:
        q = q.filter(ConhecimentoIA.categoria == categoria)
    if busca:
        term = f"%{busca}%"
        q = q.filter(
            ConhecimentoIA.pergunta.ilike(term) |
            ConhecimentoIA.resposta.ilike(term) |
            ConhecimentoIA.titulo.ilike(term)
        )
    return q.order_by(ConhecimentoIA.categoria, ConhecimentoIA.titulo).all()


def listar_categorias(db: Session, cu: Usuario) -> list[str]:
    resultados = db.query(ConhecimentoIA.categoria).filter(
        ConhecimentoIA.tenant_id == cu.tenant_id,
        ConhecimentoIA.categoria.isnot(None),
        ConhecimentoIA.categoria != "",
    ).distinct().all()
    return sorted([r[0] for r in resultados if r[0]])


def criar_conhecimento(dados: dict, db: Session, cu: Usuario) -> ConhecimentoIA:
    obj = ConhecimentoIA(
        id=new_id(),
        tenant_id=cu.tenant_id,
        titulo=dados["titulo"],
        pergunta=dados["pergunta"],
        resposta=dados["resposta"],
        categoria=dados.get("categoria"),
        tags=dados.get("tags"),
        video_url=dados.get("video_url"),
        imagem_url=dados.get("imagem_url"),
        ativo=dados.get("ativo", True),
    )
    db.add(obj); db.commit(); db.refresh(obj)
    return obj


def atualizar_conhecimento(id: str, dados: dict, db: Session, cu: Usuario) -> ConhecimentoIA | None:
    obj = db.query(ConhecimentoIA).filter(
        ConhecimentoIA.id == id,
        ConhecimentoIA.tenant_id == cu.tenant_id,
    ).first()
    if not obj:
        return None
    for campo in ("titulo", "pergunta", "resposta", "categoria", "tags", "video_url", "imagem_url", "ativo"):
        if campo in dados:
            setattr(obj, campo, dados[campo])
    db.commit(); db.refresh(obj)
    return obj


def deletar_conhecimento(id: str, db: Session, cu: Usuario) -> bool:
    obj = db.query(ConhecimentoIA).filter(
        ConhecimentoIA.id == id,
        ConhecimentoIA.tenant_id == cu.tenant_id,
    ).first()
    if not obj:
        return False
    db.delete(obj); db.commit()
    return True
