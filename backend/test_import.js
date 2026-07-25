const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const xlsx = require('xlsx');

// DB
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, 'kairos_test.db');
try { fs.unlinkSync(dbPath); } catch(e) {}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS congregacoes (
    id TEXT PRIMARY KEY, nome TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'ativa',
    criado_em TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS membros (
    id TEXT PRIMARY KEY, congregacao_id TEXT NOT NULL, foto_url TEXT,
    nome TEXT NOT NULL, cpf TEXT, rg TEXT, email TEXT, data_nascimento TEXT,
    telefone TEXT, whatsapp TEXT, endereco TEXT, estado_civil TEXT,
    data_conversao TEXT, data_batismo TEXT, cargo TEXT,
    status TEXT NOT NULL DEFAULT 'ativo', observacoes TEXT,
    criado_em TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (congregacao_id) REFERENCES congregacoes(id)
  );
  CREATE INDEX IF NOT EXISTS idx_membros_congregacao ON membros(congregacao_id);
`);

const congId = uuidv4();
db.prepare('INSERT INTO congregacoes (id, nome, status) VALUES (?, ?, ?)').run(congId, 'Test Congregação', 'ativa');
console.log('Congregação criada:', congId);

// Lê o arquivo de teste
const arquivoPath = path.join(__dirname, 'test_500_membros.xlsx');
const wb = xlsx.readFile(arquivoPath);
const ws = wb.Sheets[wb.SheetNames[0]];
const dados = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
const headers = dados[0].map(String);
const linhas = dados.slice(1).filter(r => r.some(c => c !== ''));

console.log('Headers:', headers);
console.log('Linhas:', linhas.length);

// Mapeamento
const MAPA_COLUNAS = {
  nome: ['nome', 'name', 'membro', 'pessoa', 'completo', 'nome completo'],
  cpf: ['cpf', 'documento', 'doc', 'cadastro'],
  data_nascimento: ['nascimento', 'data de nascimento', 'nasc', 'birthday', 'data_nasc'],
  telefone: ['telefone', 'tel', 'phone', 'celular', 'fone'],
  whatsapp: ['whatsapp', 'wpp', 'zap'],
  email: ['email', 'e-mail', 'correio'],
  rg: ['rg', 'identidade', 'registro geral'],
  estado_civil: ['estado civil', 'estadocivil', 'civil'],
  endereco: ['endereco', 'endereco', 'address', 'rua'],
};

function detectarColuna(headerOriginal) {
  const h = headerOriginal.toLowerCase().trim();
  for (const [campo, aliases] of Object.entries(MAPA_COLUNAS)) {
    if (aliases.some(a => h.includes(a))) return campo;
  }
  return null;
}

const mapeamento = {};
headers.forEach(h => {
  const campo = detectarColuna(h);
  if (campo) mapeamento[h] = campo;
});
console.log('Auto-mapping:', JSON.stringify(mapeamento, null, 2));

function validarCPF(cpf) {
  if (!cpf) return true;
  const nums = cpf.replace(/\D/g, '');
  if (nums.length !== 11) return false;
  if (/^(\d)\1+$/.test(nums)) return false;
  return true;
}

function detectarDuplicidade(db, membro, congregacao_id) {
  if (membro.cpf) {
    const cpfLimpo = membro.cpf.replace(/\D/g, '');
    const existe = db.prepare("SELECT id, nome FROM membros WHERE REPLACE(REPLACE(cpf, '.', ''), '-', '') = ?").get(cpfLimpo);
    if (existe) return { tipo: 'cpf', existente: existe };
  }
  return null;
}

const resultado = { importados: 0, atualizados: 0, duplicados: 0, rejeitados: 0, erros: [] };

const inserir = db.prepare(`INSERT INTO membros (id, congregacao_id, nome, cpf, data_nascimento, telefone, whatsapp, email, endereco, estado_civil, status, criado_em, atualizado_em)
  VALUES (@id, @congregacao_id, @nome, @cpf, @data_nascimento, @telefone, @whatsapp, @email, @endereco, @estado_civil, @status, @criado_em, @atualizado_em)`);

const importar = db.transaction(() => {
  for (let i = 0; i < linhas.length; i++) {
    try {
      const linha = linhas[i];
      const membro = { status: 'ativo' };
      headers.forEach((h, idx) => {
        const campo = mapeamento[h];
        if (campo) membro[campo] = String(linha[idx] || '').trim() || null;
      });

      if (!membro.nome) { resultado.rejeitados++; resultado.erros.push({ linha: i + 2, erro: 'Nome obrigatório' }); continue; }
      if (membro.cpf && !validarCPF(membro.cpf)) { resultado.rejeitados++; resultado.erros.push({ linha: i + 2, erro: 'CPF inválido: ' + membro.cpf }); continue; }

      const dup = detectarDuplicidade(db, membro, congId);
      if (dup) { resultado.duplicados++; continue; }

      const id = uuidv4();
      const agora = new Date().toISOString();
      inserir.run({ id, congregacao_id: congId, rg: null, email: null, ...membro, criado_em: agora, atualizado_em: agora });
      resultado.importados++;
    } catch (err) {
      resultado.rejeitados++;
      resultado.erros.push({ linha: i + 2, erro: err.message });
    }
  }
});

try {
  importar();
  console.log('\n=== RESULTADO ===');
  console.log(JSON.stringify(resultado, null, 2));

  // Verificar
  const count = db.prepare('SELECT COUNT(*) as c FROM membros').get();
  console.log('\nTotal membros no DB:', count.c);

  // Verificar se emails foram salvos (não deveriam - coluna não existe!)
  console.log('\nVerificando colunas da tabela membros:');
  const cols = db.prepare("PRAGMA table_info('membros')").all();
  console.log(cols.map(c => c.name).join(', '));
} catch (err) {
  console.log('FALHA CATASTRÓFICA:', err.message);
  console.log(err.stack);
}

db.close();
try { fs.unlinkSync(dbPath); } catch(e) {}
