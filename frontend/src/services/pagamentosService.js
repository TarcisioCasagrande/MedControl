import axios from 'axios';

const API_URL = 'http://localhost:5179/api/Pagamentos';

export async function getPagamentos() {
  const response = await axios.get(API_URL);
  return response.data;
}

export async function getPagamentoPorId(id) {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
}

export async function criarPagamento(pagamento) {
  const response = await axios.post(API_URL, pagamento);
  return response.data;
}

export async function atualizarPagamento(pagamento) {
  const response = await axios.put(`${API_URL}/${pagamento.id}`, pagamento);
  return response.data;
}

export async function deletarPagamento(id) {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
}