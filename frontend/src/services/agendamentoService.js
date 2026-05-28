import api from './api';

/**
 * Monta o payload no padrão que o backend espera.
 */
function montarPayloadAgendamento(agendamento) {
  return {
    dataAgendamento: agendamento.dataAgendamento,
    status: agendamento.status || 'Agendado',
    motivoAgendamento: agendamento.motivoAgendamento || '',
    observacoes: agendamento.observacoes || '',
    tipoAtendimento: agendamento.tipoAtendimento || 'Presencial',
    valorCobrado: Number(agendamento.valorCobrado || 0),
    medicoId: Number(agendamento.medicoId),
    pacienteId: Number(agendamento.pacienteId),
    procedimentoId: Number(agendamento.procedimentoId),
  };
}

export const getAgendamentos = async () => {
  const response = await api.get('/agendamentos');
  return response.data;
};

export const getMeusAgendamentos = async (filtros = {}) => {
  const params = {};

  if (filtros.status) params.status = filtros.status;
  if (filtros.data) params.data = filtros.data;

  const response = await api.get('/agendamentos/meus', { params });
  return response.data;
};

export const getAtendimentosMedicoLogado = async (filtros = {}) => {
  return getMeusAgendamentos(filtros);
};

export const getAgendamento = async (id) => {
  const response = await api.get(`/agendamentos/${id}`);
  return response.data;
};

export const criarAgendamento = async (agendamento) => {
  const payload = montarPayloadAgendamento(agendamento);

  const response = await api.post('/agendamentos', payload);
  return response.data;
};

export const atualizarAgendamento = async (agendamento) => {
  const payload = {
    id: agendamento.id,
    ...montarPayloadAgendamento(agendamento),
  };

  const response = await api.put(`/agendamentos/${agendamento.id}`, payload);
  return response.data;
};

export const alterarStatusAgendamento = async (id, status) => {
  const response = await api.put(`/agendamentos/${id}/alterar-status`, {
    status,
  });

  return response.data;
};

export const atenderRecepcao = async (id) => {
  const response = await api.put(`/agendamentos/${id}/atender-recepcao`);
  return response.data;
};

export const iniciarAtendimento = async (id) => {
  const response = await api.put(`/agendamentos/${id}/iniciar-atendimento`);
  return response.data;
};

export const finalizarAtendimento = async (id) => {
  const response = await api.put(`/agendamentos/${id}/finalizar-atendimento`);
  return response.data;
};

export const cancelarAgendamento = async (id) => {
  const response = await api.put(`/agendamentos/${id}/cancelar`);
  return response.data;
};

export const deletarAgendamento = async (id) => {
  const response = await api.delete(`/agendamentos/${id}`);
  return response.data;
};