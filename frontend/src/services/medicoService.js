// src/services/medicoService.js

import api from './api';

const ENDPOINT = '/medicos';

export const getMedicos = async () => {
  const response = await api.get(ENDPOINT);
  return response.data;
};

export const getMedico = async (id) => {
  const response = await api.get(`${ENDPOINT}/${id}`);
  return response.data;
};

export const criarMedico = async (medico) => {
  const response = await api.post(ENDPOINT, medico);
  return response.data;
};

export const atualizarMedico = async (medico) => {
  const response = await api.put(`${ENDPOINT}/${medico.id}`, medico);
  return response.data;
};

export const deletarMedico = async (id) => {
  const response = await api.delete(`${ENDPOINT}/${id}`);
  return response.data;
};