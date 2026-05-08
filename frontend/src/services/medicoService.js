// src/services/medicoService.js

// Importa a instância central da API.
// Essa instância já possui:
// - baseURL configurada;
// - interceptor JWT;
// - envio automático do token;
// - configuração padrão do axios.
import api from './api';

// Endpoint base da entidade médicos.
// Todas as rotas abaixo serão concatenadas automaticamente.
const ENDPOINT = '/medicos';


// 🔹 LISTAR TODOS OS MÉDICOS
export const getMedicos = async () => {
  const response = await api.get(ENDPOINT);
  return response.data;
};


// 🔹 BUSCAR MÉDICO POR ID
export const getMedico = async (id) => {
  const response = await api.get(`${ENDPOINT}/${id}`);
  return response.data;
};


// 🔹 CRIAR NOVO MÉDICO
export const criarMedico = async (medico) => {
  const response = await api.post(ENDPOINT, medico);
  return response.data;
};


// 🔹 ATUALIZAR MÉDICO
export const atualizarMedico = async (medico) => {
  const response = await api.put(
    `${ENDPOINT}/${medico.id}`,
    medico
  );

  return response.data;
};


// 🔹 DELETAR MÉDICO
export const deletarMedico = async (id) => {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
};