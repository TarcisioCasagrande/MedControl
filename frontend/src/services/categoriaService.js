// src/services/categoriaService.js

// Este service encapsula todas as chamadas HTTP para a API de Categorias.
// Segue o mesmo padrão do produtoService.js que já temos.
//
// Cada função corresponde a um endpoint da API:
//   getCategorias()            → GET    /api/categorias
//   getCategoria(id)           → GET    /api/categorias/{id}
//   criarCategoria(categoria)  → POST   /api/categorias
//   atualizarCategoria(id, c)  → PUT    /api/categorias/{id}
//   deletarCategoria(id)       → DELETE /api/categorias/{id}

import axios from 'axios';

// IMPORTANTE: Substitua a porta pela porta da SUA API.
// Você pode verificar a porta no terminal onde o "dotnet run" está rodando.
const API_URL = 'http://localhost:5179/api/categorias';

// Cria uma instância do axios com configurações padrão.
// Isso evita repetir a URL base e headers em cada chamada.
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Busca todas as categorias.
 * Usado para popular seletores em formulários e listar na página de categorias.
 * @returns {Promise<Array>} Array de categorias: [{ id, nome, descricao }, ...]
 */
export const getCategorias = async () => {
  const response = await api.get('/');
  return response.data;
};

/**
 * Busca uma categoria pelo ID, incluindo seus produtos.
 * Usado quando queremos ver os detalhes de uma categoria específica.
 * @param {number} id - ID da categoria
 * @returns {Promise<Object>} Categoria com produtos incluídos
 */
export const getCategoria = async (id) => {
  const response = await api.get(`/${id}`);
  return response.data;
};

/**
 * Cria uma nova categoria.
 * @param {Object} categoria - { nome: "Eletrônicos", descricao: "..." }
 * @returns {Promise<Object>} Categoria criada com ID gerado pelo banco
 */
export const criarCategoria = async (categoria) => {
  const response = await api.post('/', categoria);
  return response.data;
};

/**
 * Atualiza uma categoria existente.
 * @param {number} id - ID da categoria a atualizar
 * @param {Object} categoria - { id, nome, descricao }
 */
export const atualizarCategoria = async (id, categoria) => {
  const response = await api.put(`/${id}`, categoria);
  return response.data;
};

/**
 * Deleta uma categoria.
 * ATENÇÃO: O backend retorna erro 400 se a categoria tiver produtos associados.
 * O componente que chama esta função deve tratar esse erro e exibir a mensagem.
 * @param {number} id - ID da categoria a deletar
 */
export const deletarCategoria = async (id) => {
  const response = await api.delete(`/${id}`);
  return response.data;
};