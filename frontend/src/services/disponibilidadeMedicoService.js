import api from './api';

export async function listarDisponibilidades() {
  const response = await api.get('/disponibilidades-medico');
  return response.data;
}

export async function listarDisponibilidadesPorMedico(medicoId) {
  const response = await api.get(`/disponibilidades-medico/medico/${medicoId}`);
  return response.data;
}

export async function criarDisponibilidade(dados) {
  const response = await api.post('/disponibilidades-medico', dados);
  return response.data;
}

export async function atualizarDisponibilidade(id, dados) {
  await api.put(`/disponibilidades-medico/${id}`, dados);
}

export async function alterarStatusDisponibilidade(id) {
  const response = await api.patch(`/disponibilidades-medico/${id}/status`);
  return response.data;
}

export async function excluirDisponibilidade(id) {
  await api.delete(`/disponibilidades-medico/${id}`);
}