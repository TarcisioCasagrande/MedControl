// src/services/procedimentosService.js

// Importa a instância central da API.
// Essa instância já possui:
// - baseURL principal;
// - interceptor JWT;
// - envio automático do token;
// - configuração padrão do axios.
import api from './api';

// Endpoint base da entidade procedimentos.
const ENDPOINT = '/procedimentos';


// 📥 LISTAR TODOS OS PROCEDIMENTOS
export const getProcedimentos = async () => {

  const response = await api.get(ENDPOINT);

  return response.data;
};


// 📥 BUSCAR PROCEDIMENTO POR ID
export const getProcedimento = async (id) => {

  const response = await api.get(`${ENDPOINT}/${id}`);

  return response.data;
};


// 📤 CRIAR PROCEDIMENTO
export const criarProcedimento = async (procedimento) => {

  // Payload enviado ao backend.
  // O valor é convertido para número para evitar
  // problemas de tipagem no .NET/PostgreSQL.
  const payload = {
    nome: procedimento.nome,
    codigo: procedimento.codigo,
    valor: Number(procedimento.valor),
    ativo: procedimento.ativo,
  };

  const response = await api.post(
    ENDPOINT,
    payload
  );

  return response.data;
};


// ✏️ ATUALIZAR PROCEDIMENTO
export const atualizarProcedimento = async (procedimento) => {

  // Payload padronizado enviado ao backend.
  const payload = {
    id: procedimento.id,
    nome: procedimento.nome,
    codigo: procedimento.codigo,
    valor: Number(procedimento.valor),
    ativo: procedimento.ativo,
  };

  const response = await api.put(
    `${ENDPOINT}/${procedimento.id}`,
    payload
  );

  return response.data;
};


// ❌ DELETAR PROCEDIMENTO
export const deletarProcedimento = async (id) => {

  const response = await api.delete(
    `${ENDPOINT}/${id}`
  );

  return response.data;
};