ALTER TABLE membros ADD COLUMN importacao_id VARCHAR(36) REFERENCES importacoes_log(id);
CREATE INDEX idx_membros_importacao_id ON membros(importacao_id);

ALTER TABLE importacoes_log ADD COLUMN processados INTEGER DEFAULT 0;
ALTER TABLE importacoes_log ADD COLUMN storage_path VARCHAR(500);
