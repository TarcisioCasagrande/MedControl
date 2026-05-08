import api from './api';

// Service centralizado de prontuários.
// Usar o mesmo axios de api.js garante token JWT e mesma baseURL do restante do sistema.
export const getProntuarios = async () => {
  const response = await api.get('/prontuarios');
  return response.data;
};

export const getProntuario = async (id) => {
  const response = await api.get(`/prontuarios/${id}`);
  return response.data;
};

export const getProntuarioPorAgendamento = async (agendamentoId) => {
  const response = await api.get(`/prontuarios/por-agendamento/${agendamentoId}`);
  return response.data;
};

export const criarProntuario = async (prontuario) => {
  const response = await api.post('/prontuarios', prontuario);
  return response.data;
};

export const atualizarProntuario = async (prontuario) => {
  const response = await api.put(`/prontuarios/${prontuario.id}`, prontuario);
  return response.data;
};

export const deletarProntuario = async (id) => {
  const response = await api.delete(`/prontuarios/${id}`);
  return response.data;
};
