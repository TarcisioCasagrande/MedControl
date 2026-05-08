import api from './api';

export const getAgendamentosPorUsuario = async (filtros = {}) => {
  const params = {};

  if (filtros.dataInicio) params.dataInicio = filtros.dataInicio;
  if (filtros.dataFim) params.dataFim = filtros.dataFim;

  const response = await api.get('/relatorios/agendamentos-por-usuario', {
    params,
  });

  return response.data;
};