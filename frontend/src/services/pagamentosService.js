import api from './api';

export async function getPagamentos() {
  const response = await api.get('/pagamentos');
  return response.data;
}

export async function getPagamentoPorId(id) {
  const response = await api.get(`/pagamentos/${id}`);
  return response.data;
}

export async function criarPagamento(pagamento) {
  const response = await api.post('/pagamentos', pagamento);
  return response.data;
}

export async function atualizarPagamento(pagamento) {
  const response = await api.put(`/pagamentos/${pagamento.id}`, pagamento);
  return response.data;
}

export async function deletarPagamento(id) {
  const response = await api.delete(`/pagamentos/${id}`);
  return response.data;
}
