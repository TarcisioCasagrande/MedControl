// src/services/dashboardService.js

// Importa a instância central da API.
// Essa instância já possui:
// - baseURL principal;
// - interceptor JWT;
// - envio automático do token;
// - configuração padrão do axios.
import api from './api';

// Endpoint base do dashboard.
const ENDPOINT = '/dashboard';


// 🔹 BUSCAR DADOS DO DASHBOARD
export const getDashboard = async (filtros = {}) => {

  // Objeto de parâmetros enviado na query string.
  // Exemplo:
  // /dashboard?medicoId=1&dataInicio=2026-01-01
  const params = {};

  // Adiciona médico ao filtro se existir.
  if (filtros.medicoId) {
    params.medicoId = filtros.medicoId;
  }

  // Adiciona data inicial ao filtro.
  if (filtros.dataInicio) {
    params.dataInicio = filtros.dataInicio;
  }

  // Adiciona data final ao filtro.
  if (filtros.dataFim) {
    params.dataFim = filtros.dataFim;
  }

  // Faz a requisição GET enviando os filtros.
  const response = await api.get(ENDPOINT, {
    params,
  });

  // Retorna apenas os dados da resposta.
  return response.data;
};