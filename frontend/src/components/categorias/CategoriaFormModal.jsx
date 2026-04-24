// src/components/categorias/CategoriaFormModal.jsx

// Modal com formulário para criar ou editar uma categoria.
// Reutiliza o componente Modal da pasta ui/ (criado na V2).
//
// Comportamento:
// - Se categoriaEditando for null → modo "criar" (formulário vazio)
// - Se categoriaEditando for um objeto → modo "editar" (formulário preenchido)

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

// Props recebidas:
// - isOpen: boolean que controla se o modal está visível
// - onClose: função para fechar o modal
// - categoriaEditando: null (criar) ou objeto categoria (editar)
// - onSalvar: função chamada com os dados do formulário
function CategoriaFormModal({ isOpen, onClose, categoriaEditando, onSalvar }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  // Preenche o formulário quando o modal abre.
  // Se estamos editando, preenche com os dados existentes.
  // Se estamos criando, limpa o formulário.
  useEffect(() => {
    if (isOpen) {
      if (categoriaEditando) {
        setNome(categoriaEditando.nome || '');
        setDescricao(categoriaEditando.descricao || '');
      } else {
        setNome('');
        setDescricao('');
      }
    }
  }, [isOpen, categoriaEditando]);

  const handleSubmit = (e) => {
    // preventDefault evita que o formulário recarregue a página
    // (comportamento padrão do HTML para formulários)
    e.preventDefault();

    // Monta o objeto categoria com os dados do formulário
    const categoria = { nome, descricao };

    // Se estamos editando, incluímos o ID para que a API saiba qual atualizar
    if (categoriaEditando) {
      categoria.id = categoriaEditando.id;
    }

    // Chama a função do pai para salvar (criar ou atualizar)
    onSalvar(categoria);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campo Nome — obrigatório */}
        <div>
          <label htmlFor="nomeCategoria" className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Categoria
          </label>
          <input
            id="nomeCategoria"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Eletrônicos"
            required
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          />
        </div>

        {/* Campo Descrição — opcional */}
        <div>
          <label htmlFor="descCategoria" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            id="descCategoria"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Produtos eletrônicos e tecnologia"
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow resize-none"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {categoriaEditando ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CategoriaFormModal;