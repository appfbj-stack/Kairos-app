CREATE TABLE assistente_conhecimento (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenants(id),
    titulo VARCHAR(255) NOT NULL,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    categoria VARCHAR(100),
    tags TEXT,
    video_url VARCHAR(500),
    imagem_url VARCHAR(500),
    ativo BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_conhecimento_tenant_id ON assistente_conhecimento(tenant_id);
CREATE INDEX idx_conhecimento_categoria ON assistente_conhecimento(categoria);
