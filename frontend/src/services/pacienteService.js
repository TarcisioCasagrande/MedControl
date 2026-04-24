import axios from 'axios';

const API_URL = 'http://localhost:5179/api/pacientes';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔹 LISTAR TODOS
export const getPacientes = async () => {
  const response = await api.get('/');
  return response.data;
};

// 🔹 BUSCAR POR ID
export const getPaciente = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

// 🔹 CRIAR
export const criarPaciente = async (paciente) => {
  const response = await api.post('/', paciente);
  return response.data;
};

// 🔹 ATUALIZAR
export const atualizarPaciente = async (paciente) => {
  await api.put(`/${paciente.id}`, paciente);
};

// 🔹 DELETAR
export const deletarPaciente = async (id) => {
  await api.delete(`/${id}`);
};