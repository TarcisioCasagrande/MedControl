// src/components/categorias/CategoriaTable.jsx

// Este componente exibe a tabela de categorias com:
// - Campo de busca (filtra por nome ou descrição)
// - Coluna com avatar (primeira letra do nome)
// - Coluna "Produtos" mostrando quantos produtos pertencem à categoria
// - Botões de Editar e Deletar
// - Estado vazio com ícone quando não há categorias

import { Search, Pencil, Trash2, FolderOpen } from 'lucide-react';

// Props recebidas:
// - categorias: array de categorias vindas da API
// - searchTerm: texto digitado no campo de busca (controlado pelo pai)
// - onSearchChange: função para atualizar o searchTerm
// - onEditar: função chamada quando o botão Editar é clicado
// - onDeletar: função chamada quando o botão Deletar é clicado
// - produtosPorCategoria: FUNÇÃO que recebe um categoriaId e retorna a contagem
function CategoriaTable({ categorias, searchTerm, onSearchChange, onEditar, onDeletar, produtosPorCategoria }) {

  // Filtra as categorias pelo termo de busca.
  // Busca no nome E na descrição (se existir).
  const categoriasFiltradas = categorias.filter((c) => {
    const termo = searchTerm.toLowerCase();
    return (
      c.nome.toLowerCase().includes(termo) ||
      (c.descricao && c.descricao.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Campo de busca */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
          />
        </div>
      </div>

      {/* Estado vazio — quando não há categorias ou a busca não retorna resultados */}
      {categoriasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <FolderOpen className="w-12 h-12 mb-3" />
          <p className="text-sm font-medium">
            {searchTerm ? 'Nenhuma categoria encontrada.' : 'Nenhuma categoria cadastrada.'}
          </p>
        </div>
      ) : (
        /* Tabela de categorias */
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Nome</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Descrição</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Produtos</th>
              <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categoriasFiltradas.map((categoria) => (
              <tr key={categoria.id} className="hover:bg-gray-50 transition-colors">
                {/* Coluna Nome — com avatar (primeira letra) */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar com a primeira letra do nome */}
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-700 text-xs font-bold">
                        {/* charAt(0) pega a primeira letra, toUpperCase() converte para maiúscula */}
                        {categoria.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{categoria.nome}</span>
                  </div>
                </td>

                {/* Coluna Descrição — exibe "—" se não houver */}
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-500">{categoria.descricao || '—'}</span>
                </td>

                {/* Coluna Produtos — badge com contagem */}
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {/* produtosPorCategoria é uma FUNÇÃO passada como prop.
                        Ela recebe o ID da categoria e retorna quantos produtos pertencem a ela.
                        A lógica fica no componente pai (CategoriasPage), não aqui na tabela. */}
                    {produtosPorCategoria(categoria.id)} produtos
                  </span>
                </td>

                {/* Coluna Ações — botões de Editar e Deletar */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEditar(categoria)}
                      title="Editar categoria"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletar(categoria)}
                      title="Deletar categoria"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CategoriaTable;