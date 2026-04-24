import axios from 'axios';

const API_URL = 'http://localhost:5179/api/medicos';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔹 LISTAR TODOS
export const getMedicos = async () => {
  const response = await api.get('/');
  return response.data;
};

// 🔹 BUSCAR POR ID
export const getMedico = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

// 🔹 CRIAR
export const criarMedico = async (medico) => {
  const response = await api.post('/', medico);
  return response.data;
};

// 🔹 ATUALIZAR
export const atualizarMedico = async (medico) => {
  await api.put(`/${medico.id}`, medico);
};

// 🔹 DELETAR
export const deletarMedico = async (id) => {
  await api.delete(`/${id}`);
};