import axios from 'axios';

const API_URL = 'http://localhost:5179/api/consultas';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getConsultas = async () => {
  const response = await api.get('/');
  return response.data;
};

export const getConsulta = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

export const criarConsulta = async (consulta) => {
  const response = await api.post('/', consulta);
  return response.data;
};

export const atualizarConsulta = async (consulta) => {
  const response = await api.put(`/${consulta.id}`, consulta);
  return response.data;
};

export const iniciarAtendimento = async (id) => {
  const response = await api.put(`/${id}/iniciar-atendimento`);
  return response.data;
};

export const finalizarAtendimento = async (id) => {
  const response = await api.put(`/${id}/finalizar-atendimento`);
  return response.data;
};

export const deletarConsulta = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};