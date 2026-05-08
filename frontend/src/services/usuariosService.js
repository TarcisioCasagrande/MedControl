import api from './api';

export async function listarUsuarios() {
  const resposta = await api.get('/usuarios');
  return resposta.data;
}

export async function criarUsuario(dados) {
  const resposta = await api.post('/usuarios', dados);
  return resposta.data;
}

export async function atualizarUsuario(id, dados) {
  await api.put(`/usuarios/${id}`, dados);
}

export async function alterarStatusUsuario(id) {
  const resposta = await api.patch(`/usuarios/${id}/status`);
  return resposta.data;
}

export async function excluirUsuario(id) {
  await api.delete(`/usuarios/${id}`);
}