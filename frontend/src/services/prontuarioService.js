import axios from 'axios';

const API_URL = 'http://localhost:5179/api/prontuarios';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔹 LISTAR TODOS
export const getProntuarios = async () => {
  const response = await api.get('/');
  return response.data;
};

// 🔹 BUSCAR POR ID (opcional, mas bom ter)
export const getProntuario = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

// 🔹 CRIAR
export const criarProntuario = async (prontuario) => {
  const response = await api.post('/', prontuario);
  return response.data;
};

// 🔹 ATUALIZAR
export const atualizarProntuario = async (prontuario) => {
  await api.put(`/${prontuario.id}`, prontuario);
};

// 🔹 DELETAR
export const deletarProntuario = async (id) => {
  await api.delete(`/${id}`);
};