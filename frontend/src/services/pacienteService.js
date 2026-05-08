import api from './api';

// CRUD ADMIN
export const getPacientes = async () => {
  const response = await api.get('/pacientes');
  return response.data;
};

export const getPaciente = async (id) => {
  const response = await api.get(`/pacientes/${id}`);
  return response.data;
};

export const criarPaciente = async (paciente) => {
  const response = await api.post('/pacientes', paciente);
  return response.data;
};

export const atualizarPaciente = async (paciente) => {
  await api.put(`/pacientes/${paciente.id}`, paciente);
};

export const deletarPaciente = async (id) => {
  await api.delete(`/pacientes/${id}`);
};

// PACIENTE LOGADO
export const getPerfilPaciente = async () => {
  const response = await api.get('/paciente-logado/perfil');
  return response.data;
};

export const atualizarPerfilPaciente = async (dados) => {
  const response = await api.put('/paciente-logado/perfil', dados);
  return response.data;
};

export const getAgendamentosPaciente = async () => {
  const response = await api.get('/paciente-logado/agendamentos');
  return response.data;
};

export const getMedicosParaAgendar = async () => {
  const response = await api.get('/paciente-logado/medicos');
  return response.data;
};

export const agendarAgendamentoPaciente = async (dados) => {
  const response = await api.post('/paciente-logado/agendar', dados);
  return response.data;
};