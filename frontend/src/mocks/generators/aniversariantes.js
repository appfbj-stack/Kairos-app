// frontend/src/mocks/generators/aniversariantes.js

export function gerarAniversariantes(membros = [], pastores = [], obreiros = []) {
  const hoje = new Date();
  const anoH = hoje.getFullYear();
  const list = [];
  const addPessoa = (p, tipo) => {
    if (!p.dataNasc) return;
    const [y, m, d] = p.dataNasc.split('-').map(Number);
    if (!m || !d) return;
    const dataEsteAno = new Date(anoH, m - 1, d);
    const diasAte = Math.ceil((dataEsteAno - hoje) / (1000 * 60 * 60 * 24));
    list.push({
      id: `${tipo[0].toUpperCase()}${p.id}`,
      nome: p.nome,
      tipo,
      dataNasc: p.dataNasc,
      idadeFutura: anoH - y,
      dataEsteAno: dataEsteAno.toISOString().slice(0, 10),
      diasAte,
    });
  };
  membros.forEach((m) => addPessoa(m, 'membro'));
  pastores.forEach((p) => addPessoa(p, 'pastor'));
  obreiros.forEach((o) => addPessoa(o, 'obreiro'));
  return list.sort((a, b) => a.diasAte - b.diasAte).slice(0, 150);
}

export default gerarAniversariantes;
